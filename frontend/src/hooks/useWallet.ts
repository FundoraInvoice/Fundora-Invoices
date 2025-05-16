import { useState, useEffect } from "react";
import { ethers } from "ethers";
import type { StreamProvider } from '@metamask/providers';

// 👇 Extend Window type globally
declare global {
    interface Window {
      ethereum?: StreamProvider;
    }
}

export const useWallet = () => {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("walletAddress");
    if (stored) setAddress(stored);
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const userAddress = accounts[0];
      setAddress(userAddress);
      localStorage.setItem("walletAddress", userAddress);
    } catch (err) {
      console.error("Connection error:", err);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("walletAddress");
    setAddress(null);
  };

  return { address, connectWallet, disconnectWallet };
};
