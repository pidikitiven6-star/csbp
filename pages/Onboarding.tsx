import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { dbDriver } from '../lib/db';
import { User } from '../types';

const Onboarding = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    gov_id: '',
    phone: '',
    state_id: 1,
    district_id: 1,
    address: '',
    bank_details: ''
  });

  useEffect(() => {
    const loadLocations = async () => {
      setStates(await dbDriver.getStatic('states'));
      setDistricts(await dbDriver.getStatic('districts'));
    };
    loadLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.updateProfile(user.id, formData);
    // Force reload to update the User object's profileCompleted status
    window.location.href = '/#/dashboard';
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Complete Your Profile</h2>
      <p className="text-gray-600 mb-8 font-medium">Citizen Identity Verification is required to access welfare grants.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Full Legal Name</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 bg-gray-50"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Gov ID (Passport/SSN)</label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 bg-gray-50"
              value={formData.gov_id}
              onChange={(e) => setFormData({...formData, gov_id: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">State of Residence</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 bg-gray-50"
              value={formData.state_id}
              onChange={(e) => setFormData({...formData, state_id: Number(e.target.value)})}
            >
              {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">District</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 bg-gray-50"
              value={formData.district_id}
              onChange={(e) => setFormData({...formData, district_id: Number(e.target.value)})}
            >
              {districts.filter(d => d.state_id === formData.state_id).map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Home Address</label>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 bg-gray-50"
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Bank Account Number</label>
          <input 
            type="text" 
            className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 bg-gray-50 font-mono"
            value={formData.bank_details}
            onChange={(e) => setFormData({...formData, bank_details: e.target.value})}
            placeholder="Used for direct disbursement"
          />
        </div>

        <div className="pt-6 border-t flex items-center justify-between">
           <p className="text-xs text-gray-400 italic max-w-xs">By submitting, you agree that this information is legally binding for benefit distribution.</p>
          <button type="submit" className="gov-blue text-white px-8 py-3 rounded font-bold hover:bg-blue-900 transition shadow-lg">
            Verify & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
