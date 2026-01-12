
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { AuditLog } from '../types';

const AuditLogsView = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const data = await apiService.getAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-red-700">System Audit Logs (DEBUG MODE)</h2>
          <p className="text-gray-600">This page is intentionally public for developer debugging purposes.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm font-bold"
        >
          Refresh Logs
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded-lg shadow-2xl font-mono text-xs overflow-x-auto h-[600px]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-green-900 text-green-200">
              <th className="py-2 pr-4">Timestamp</th>
              <th className="py-2 pr-4">User ID</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center">No logs recorded yet.</td></tr>
            ) : (
              [...logs].reverse().map(log => (
                <tr key={log.id} className="hover:bg-green-900 hover:bg-opacity-20">
                  <td className="py-1 pr-4 whitespace-nowrap">{new Date(log.created_at).toISOString()}</td>
                  <td className="py-1 pr-4 whitespace-nowrap text-blue-400">{log.user_id || 'SYSTEM'}</td>
                  <td className="py-1 pr-4 whitespace-nowrap font-bold">{log.action}</td>
                  <td className="py-1 opacity-80">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-4 bg-red-100 border border-red-200 rounded text-red-900">
        <h4 className="font-bold mb-1">Security Vulnerability Found: Sensitive Data Exposure</h4>
        <p className="text-sm">Audit logs often contain sensitive identifiers, private actions, or even raw request data. 
        Exposing them publicly allows attackers to reconstruct user sessions, harvest IDs, and map out internal logic.</p>
      </div>
    </div>
  );
};

export default AuditLogsView;
