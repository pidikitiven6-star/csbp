
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { db } from '../lib/mockDb';

const Payments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    // In a real app, this would be an API call /api/payments
    const mockPayments = [
      { id: 101, app_id: 1, amount: 5000, status: 'Failed', ref: 'PAY-8821', date: '2024-05-01' },
      { id: 102, app_id: 2, amount: 200000, status: 'Success', ref: 'PAY-9912', date: '2024-05-02' },
    ];
    setPayments(mockPayments);
  }, []);

  const handleRetry = async (id: number) => {
    setProcessing(id);
    // VULNERABILITY: No check if payment is already 'In Progress' or 'Success'
    // Business logic allows double-spending if user clicks multiple times.
    await new Promise(r => setTimeout(r, 2000)); 
    setPayments(payments.map(p => p.id === id ? { ...p, status: 'Success' } : p));
    setProcessing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Treasury & Payments</h2>
        <div className="text-sm font-mono bg-gray-100 p-2 rounded">
          Status: <span className="text-green-600 font-bold">Gateway Online</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 uppercase text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-3">Payment Ref</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 font-mono">{p.ref}</td>
                <td className="px-6 py-4 font-bold text-gray-900">${p.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    p.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{p.date}</td>
                <td className="px-6 py-4">
                  {p.status === 'Failed' && (
                    <button 
                      onClick={() => handleRetry(p.id)}
                      disabled={processing === p.id}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processing === p.id ? 'Retrying...' : 'Retry Payment'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-orange-50 border border-orange-200 rounded text-orange-800 text-sm">
        <p><strong>Security Lab:</strong> The "Retry" button lacks server-side state locking. 
        Observe the network tab and try to trigger duplicate payment requests simultaneously.</p>
      </div>
    </div>
  );
};

export default Payments;
