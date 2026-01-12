
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Application, User, UserRole, ApplicationStatus, UserProfile } from '../types';
import { db } from '../lib/mockDb';

const ApplicationDetail = ({ user }: { user: User | null }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  // Fix: Added profile state to handle async profile fetching
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApp();
  }, [id]);

  const fetchApp = async () => {
    // VULNERABILITY: IDOR. The backend API (simulated) doesn't check if app belongs to user.
    // The frontend only checks if 'id' is a number.
    const data = await apiService.getApplication(Number(id));
    if (data) {
      setApp(data);
      // Fix: Fetch and set profile data asynchronously
      const applicantProfile = await apiService.getProfile(data.user_id);
      setProfile(applicantProfile);
    }
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!user) return;
    await apiService.updateApplicationStatus(Number(id), newStatus, user.id);
    fetchApp();
  };

  if (loading) return <div className="text-center py-12">Loading application details...</div>;
  if (!app) return <div className="text-center py-12">Application not found.</div>;

  const scheme = db.schemes.find(s => s.id === app.scheme_id);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard" className="text-blue-700 hover:underline flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="gov-blue text-white px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Application Details</h2>
            <p className="opacity-80">Reference: {app.reference_number}</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase font-bold block mb-1">Status</span>
            <span className="bg-white text-blue-900 px-4 py-1 rounded-full font-bold text-sm">
              {app.status}
            </span>
          </div>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Applicant Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Full Name:</span>
                <span className="font-semibold">{profile?.full_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gov ID:</span>
                <span className="font-semibold">{profile?.gov_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="font-semibold">{profile?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bank Details:</span>
                <span className="font-mono">{profile?.bank_details || 'Not Provided'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Benefit Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Scheme Name:</span>
                {/* Fix: Updated property name to match Scheme interface */}
                <span className="font-semibold">{scheme?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Requested Amount:</span>
                {/* Fix: Updated property name to match Application interface */}
                <span className="font-bold text-lg text-green-700">${app.amount_requested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date Submitted:</span>
                <span className="font-semibold">{new Date(app.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin/Officer Controls (VULNERABILITY: If I'm a normal user but I see these buttons, can I click them? 
            In this mock, we only hide them in UI, but backend validation might be weak.) */}
        {user && user.role !== UserRole.BENEFICIARY && (
          <div className="bg-gray-50 p-8 border-t flex flex-wrap gap-4">
            <h4 className="w-full font-bold mb-2">Internal Administration</h4>
            {/* Fix: Correctly compare status using enum member */}
            {user.role === UserRole.LOCAL_OFFICER && app.status === ApplicationStatus.SUBMITTED && (
              <button 
                onClick={() => handleStatusChange(ApplicationStatus.UNDER_REVIEW)}
                className="bg-orange-500 text-white px-6 py-2 rounded font-bold hover:bg-orange-600"
              >
                Mark Under Review
              </button>
            )}
            {(user.role === UserRole.DISTRICT_ADMIN || user.role === UserRole.SUPER_ADMIN) && (
              <>
                <button 
                  onClick={() => handleStatusChange(ApplicationStatus.APPROVED)}
                  className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700"
                >
                  Approve Application
                </button>
                <button 
                  onClick={() => handleStatusChange(ApplicationStatus.REJECTED)}
                  className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700"
                >
                  Reject Application
                </button>
              </>
            )}
            {/* Fix: Correctly compare status using enum member */}
            {user.role === UserRole.SUPER_ADMIN && app.status === ApplicationStatus.APPROVED && (
              <button 
                onClick={() => handleStatusChange(ApplicationStatus.PAID)}
                className="bg-blue-800 text-white px-6 py-2 rounded font-bold hover:bg-blue-900 animate-pulse"
              >
                Trigger Payment Disbursement
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        <p><strong>Security Note:</strong> Try changing the ID in the URL to a different number (e.g., 2, 3, 5). 
        You might be able to view applications belonging to other citizens due to IDOR.</p>
      </div>
    </div>
  );
};

export default ApplicationDetail;
