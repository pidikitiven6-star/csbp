
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { dbDriver } from '../lib/db';
import { User, Application, ApplicationStatus } from '../types';

const CitizenDashboard = ({ user }: { user: User }) => {
  const [apps, setApps] = useState<Application[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [showApply, setShowApply] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [schemeId, setSchemeId] = useState(1);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [data, schemeData] = await Promise.all([
      apiService.getUserApplications(user.id),
      dbDriver.getStatic('schemes')
    ]);
    setApps(data);
    setSchemes(schemeData);
    setLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.submitApplication(user.id, { scheme_id: schemeId, amount_requested: amount });
    setShowApply(false);
    fetchData();
  };

  if (loading) return <div className="text-center py-12">Loading Citizen Dashboard...</div>;

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Citizen Services</h2>
          <p className="text-gray-500 font-medium">Logged in as: <span className="text-blue-700">{user.email}</span></p>
        </div>
        <button 
          onClick={() => setShowApply(true)}
          className="bg-green-600 text-white px-4 py-2 rounded font-bold hover:bg-green-700 transition">
          Apply for New Scheme
        </button>
      </div>

      {showApply && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-green-200">
          <h3 className="text-xl font-bold mb-4 text-gray-800">New Benefit Application</h3>
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Welfare Scheme</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
                value={schemeId}
                onChange={(e) => setSchemeId(Number(e.target.value))}
              >
                {schemes.map(s => <option key={s.id} value={s.id}>{s.name} (Max: ${s.max_amount})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requested Amount ($)</label>
              <input 
                type="number" 
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Submit Application</button>
              <button type="button" onClick={() => setShowApply(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-bold hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 font-bold">My Applications History</div>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Scheme</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {apps.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No applications found. Apply above to start.</td></tr>
            ) : (
              apps.map(app => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono">{app.reference_number}</td>
                  <td className="px-6 py-4">Scheme #{app.scheme_id}</td>
                  <td className="px-6 py-4 font-bold text-green-700">${app.amount_requested}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      app.status === ApplicationStatus.PAID ? 'bg-green-100 text-green-800' : 
                      app.status === ApplicationStatus.APPROVED ? 'bg-blue-100 text-blue-800' : 
                      app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/application/${app.id}`} className="text-blue-600 hover:underline font-bold">Details</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CitizenDashboard;
