
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // VULNERABILITY: Response timing or message might leak if email exists (Enumeration)
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200 mt-12">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Reset Password</h2>
      <p className="text-center text-gray-500 text-sm mb-6">Enter your email to receive a reset link.</p>
      
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full gov-blue text-white py-2 rounded font-semibold hover:bg-blue-900 transition">
            Send Reset Link
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
            If an account exists for {email}, a reset link has been sent.
          </div>
          <p className="text-xs text-gray-400 italic">
            DEBUG: Reset Token generated: {btoa(email + Date.now()).substring(0, 12)}
            <br/>(Vulnerability: Token is predictable)
          </p>
        </div>
      )}
      <div className="mt-6 text-center text-sm">
        <Link to="/login" className="text-blue-700 font-semibold">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
