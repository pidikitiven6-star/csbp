
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User, Application, UserRole, ApplicationStatus } from '../types';
import { Link } from 'react-router-dom';

const DistrictAdminDashboard = ({ user }: { user: User }) => {
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

  const handleExport = () => {
    // VULNERABILITY: Potential CSV Injection in real export.
    // Here we just simulate the logic.
    // Fix: Updated amount_requested property name
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Reference,Applicant,Amount,Status\n"
      + apps.map(e => `${e.reference_number},${e.user_id},${e.amount_requested},${e.status}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "district_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">District Administrator</h2>
          <p className="text-gray-600">Authority Level: Regional Oversight</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-gray-800 text-white px-6 py-2 rounded font-bold hover:bg-black transition"
        >
          Export Data (CSV)
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border text-center">
          <p className="text-xs font-bold text-gray-400">TOTAL APPS</p>
          <p className="text-2xl font-bold">{apps.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border text-center">
          <p className="text-xs font-bold text-gray-400">PENDING APPROVAL</p>
          {/* Fix: Use enum member for status comparison */}
          <p className="text-2xl font-bold">{apps.filter(a => a.status === ApplicationStatus.UNDER_REVIEW).length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border text-center">
          <p className="text-xs font-bold text-gray-400">APPROVED</p>
          {/* Fix: Use enum member for status comparison */}
          <p className="text-2xl font-bold text-green-600">{apps.filter(a => a.status === ApplicationStatus.APPROVED).length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow border text-center">
          <p className="text-xs font-bold text-gray-400">REJECTED</p>
          {/* Fix: Use enum member for status comparison */}
          <p className="text-2xl font-bold text-red-600">{apps.filter(a => a.status === ApplicationStatus.REJECTED).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 font-bold">Manage District Applications</div>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono">{app.reference_number}</td>
                <td className="px-6 py-4 text-xs">{app.user_id}</td>
                <td className="px-6 py-4">
                  {/* Fix: Use enum member for status check */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    app.status === ApplicationStatus.APPROVED ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link to={`/application/${app.id}`} className="text-blue-600 font-bold hover:underline text-xs">Review & Finalize</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DistrictAdminDashboard;
