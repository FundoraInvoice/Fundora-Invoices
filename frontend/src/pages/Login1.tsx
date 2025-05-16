
// ✅ Fix TypeScript Ethereum typing


import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase-config';
import { useNavigate } from 'react-router-dom';

const Login1: React.FC = () => {
  const [userType, setUserType] = useState<'sme' | 'investor'>('sme');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        email: user.email,
        name: user.displayName,
        uid: user.uid,
        role: userType,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      console.log('User Info saved:', userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  };

  const handleWalletLogin = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to continue.');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];

      const userData = {
        walletAddress,
        role: userType,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Wallet User Info saved:', userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Wallet Sign-In Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
      <div className="bg-[#1a1a1a] rounded-xl p-8 shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-cyan-400 mb-2">Login to Fundora</h2>
        <p className="text-sm text-gray-400 mb-6">Enter your credentials to access your account</p>

        <div className="mb-4">
          <label className="block mb-2 font-semibold">I am a:</label>
          <div className="flex">
            <button
              onClick={() => setUserType('sme')}
              className={`flex-1 py-2 rounded-l-lg ${
                userType === 'sme' ? 'bg-white text-black font-bold' : 'bg-[#2b2b2b] text-gray-300'
              }`}
            >
              SME
            </button>
            <button
              onClick={() => setUserType('investor')}
              className={`flex-1 py-2 rounded-r-lg ${
                userType === 'investor' ? 'bg-white text-black font-bold' : 'bg-[#2b2b2b] text-gray-300'
              }`}
            >
              Investor
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={handleGoogleLogin}
            className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-black font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2"
          >
            <span>🔵</span> Sign in with Google
          </button>
          <button
            onClick={handleWalletLogin}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2"
          >
            <span>👛</span> Sign in with Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login1;
