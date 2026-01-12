
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { User } from '../types';

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await apiService.login(email, password);
    if (user) {
      onLogin(user);
      navigate('/dashboard');
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200 mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Account Sign In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            {/* Fix: Changed 'class' to 'className' */}
            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full gov-blue text-white py-2 rounded font-semibold hover:bg-blue-900 transition">
          Login
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">Don't have an account? <Link to="/signup" className="text-blue-700 font-semibold">Sign up as a Beneficiary</Link></p>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-500">
        <p className="font-bold mb-1 text-gray-700 uppercase">Test Credentials:</p>
        {/* Fix: Changed 'class' to 'className' */}
        <div className="grid grid-cols-2 gap-1">
          <span>Citizen:</span> <span>citizen@example.com</span>
          <span>Officer:</span> <span>officer@example.com</span>
          <span>Admin:</span> <span>admin@example.com</span>
          <span>Super:</span> <span>super@example.com</span>
        </div>
        {/* Fix: Changed 'class' to 'className' */}
        <p className="mt-2 italic">All passwords are: <strong>password</strong></p>
      </div>
    </div>
  );
};

export default Login;
