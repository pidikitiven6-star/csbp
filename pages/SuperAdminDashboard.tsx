
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User, Application, UserRole, ApplicationStatus } from '../types';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = ({ user }: { user: User }) => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    const data = await apiService.getAllApplications(user.role);
    setApps(data);
    setLoading(false);
  };

  const handleBulkPayment = async () => {
    // Fix: Use enum member for status filter
    const approved = apps.filter(a => a.status === ApplicationStatus.APPROVED);
    if (confirm(`Authorize disbursement of funds for ${approved.length} approved applications?`)) {
      setLoading(true);
      // VULNERABILITY: Business Logic Replay / Non-atomic operation. 
      // If we stop halfway, some users get paid, some don't. Or we can trigger it twice.
      for (const app of approved) {
        await apiService.updateApplicationStatus(app.id, ApplicationStatus.PAID, user.id);
      }
      fetchApps();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-red-900 text-white p-8 rounded-lg shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Super Administration</h2>
          <p className="opacity-80">Full System Visibility & Treasury Operations</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/audit-logs" className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded font-bold border border-red-500">System Logs</Link>
          <button 
            onClick={handleBulkPayment}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded font-bold border border-green-500"
          >
            Process Approved Payments
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-b-4 border-blue-900">
          <h4 className="text-gray-400 font-bold text-xs uppercase mb-2">Total System Users</h4>
          <p className="text-3xl font-bold">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-b-4 border-green-600">
          <h4 className="text-gray-400 font-bold text-xs uppercase mb-2">Disbursed Funds</h4>
          <p className="text-3xl font-bold">$428,500.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-b-4 border-orange-500">
          <h4 className="text-gray-400 font-bold text-xs uppercase mb-2">Active Schemes</h4>
          <p className="text-3xl font-bold">12</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 font-bold flex justify-between items-center">
          <span>Global Application Register</span>
          <span className="text-xs text-gray-500 font-normal">Showing all records across all districts</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Ref</th>
              <th className="px-6 py-3">State/Dist</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400">{app.id}</td>
                <td className="px-6 py-4 font-mono">{app.reference_number}</td>
                <td className="px-6 py-4">State {app.state_id} / Dist {app.district_id}</td>
                {/* Fix: Updated amount_requested property name */}
                <td className="px-6 py-4 font-bold text-green-700">${app.amount_requested}</td>
                <td className="px-6 py-4">
                   {/* Fix: Use enum members for status checks */}
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    app.status === ApplicationStatus.PAID ? 'bg-green-100 text-green-800' : 
                    app.status === ApplicationStatus.APPROVED ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link to={`/application/${app.id}`} className="text-red-700 hover:underline font-bold text-xs">Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
