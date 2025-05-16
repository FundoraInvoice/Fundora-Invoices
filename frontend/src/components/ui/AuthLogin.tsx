/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const AuthLogin = () => {
  const [userType, setUserType] = useState<'sme' | 'investor' | null>(null);
  const navigate = useNavigate();

  const handleUserTypeChange = (type: 'sme' | 'investor') => {
    setUserType(type);
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log("Google Credential:", credentialResponse);
    if (userType) {
      navigate(`/dashboard/${userType}`);
    } else {
      alert("Please select a user type.");
    }
  };

  const handleWalletLogin = async () => {
    try {
      if (!window.ethereum) return alert("MetaMask not detected.");
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (userType) {
        navigate(`/dashboard/${userType}`);
      } else {
        alert("Please select a user type.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">Login to Fundora</h2>

      <div className="mb-4 flex space-x-4">
        <button
          className={`px-4 py-2 rounded ${userType === 'sme' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => handleUserTypeChange('sme')}
        >
          SME
        </button>
        <button
          className={`px-4 py-2 rounded ${userType === 'investor' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => handleUserTypeChange('investor')}
        >
          Investor
        </button>
      </div>

      <div className="my-4">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert('Google Sign-In Failed')}
        />
      </div>

      <button
        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded"
        onClick={handleWalletLogin}
      >
        Sign in with Wallet
      </button>
    </div>
  );
};

export default AuthLogin;
