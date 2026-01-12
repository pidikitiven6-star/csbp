
import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Application } from '../types';
import { Link } from 'react-router-dom';

const PublicPortal = () => {
  const [ref, setRef] = useState('');
  const [app, setApp] = useState<Application | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiService.trackApplication(ref);
      if (result) {
        setApp(result);
        setError('');
      } else {
        setError('Application not found. Please check the reference number.');
        setApp(null);
      }
    } catch (err) {
      setError('System error. Please try again later.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8 border border-gray-200">
        <div className="p-8 md:p-12 text-center bg-gradient-to-r from-blue-900 to-blue-800 text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to the Citizen Portal</h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Apply for welfare schemes, track your status, and receive digital benefits. 
            Access government services securely and efficiently.
          </p>
        </div>
        
        <div className="p-8">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Track Application</h3>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                <input 
                  type="text" 
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="e.g. CSDP-123456"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-md font-semibold hover:bg-blue-800 transition">
                Check Status
              </button>
            </form>

            {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}

            {app && (
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-2">Application Found</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-mono">{app.reference_number}</span>
                  <span className="text-gray-600">Current Status:</span>
                  <span className={`font-bold ${app.status === 'approved' ? 'text-green-600' : 'text-blue-600'}`}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <h4 className="font-bold mb-2">Apply Online</h4>
          <p className="text-sm text-gray-600">Register and submit your details to access benefits instantly.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h4 className="font-bold mb-2">Direct Payment</h4>
          <p className="text-sm text-gray-600">Funds are transferred directly to your verified bank account.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
          <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h4 className="font-bold mb-2">Need Help?</h4>
          <p className="text-sm text-gray-600">Visit your local officer for assistance with application forms.</p>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Link to="/audit-logs" className="text-xs text-gray-400 hover:underline">System Logs (Public Debug)</Link>
      </div>
    </div>
  );
};

export default PublicPortal;
