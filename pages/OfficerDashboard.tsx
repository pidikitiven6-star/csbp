
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { User, Application, UserRole, ApplicationStatus } from '../types';
import { Link } from 'react-router-dom';

const OfficerDashboard = ({ user }: { user: User }) => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    // VULNERABILITY: In a real system, the district would come from the officer's profile.
    // Here we just fetch all to demonstrate the admin power.
    const data = await apiService.getAllApplications(user.role);
    setApps(data);
    setLoading(false);
  };

  const updateStatus = async (appId: number, status: ApplicationStatus) => {
    await apiService.updateApplicationStatus(appId, status, user.id);
    fetchApps();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Local Officer Panel</h2>
        <p className="text-gray-600">Reviewing applications for District: Capital City (Assigned)</p>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold">Pending Review Queue</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">
            {/* Fix: Compare against ApplicationStatus enum member instead of string literal */}
            {apps.filter(a => a.status === ApplicationStatus.SUBMITTED).length} New
          </span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-3">Ref</th>
              <th className="px-6 py-3">Applicant ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">{app.reference_number}</td>
                <td className="px-6 py-4 text-sm">{app.user_id}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold uppercase text-gray-600">{app.status}</span>
                </td>
                <td className="px-6 py-4 space-x-3">
                  <Link to={`/application/${app.id}`} className="text-blue-600 text-xs font-bold hover:underline">Review</Link>
                  {/* Fix: Compare against ApplicationStatus enum member instead of string literal */}
                  {app.status === ApplicationStatus.SUBMITTED && (
                    <button 
                      onClick={() => updateStatus(app.id, ApplicationStatus.UNDER_REVIEW)}
                      className="text-orange-600 text-xs font-bold hover:underline"
                    >
                      Mark as Reviewing
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OfficerDashboard;
