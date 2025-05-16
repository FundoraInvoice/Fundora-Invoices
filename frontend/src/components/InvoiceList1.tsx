/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';
import AddressInput from './AddressInput';
import InvoiceCard from './InvoiceCard';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface Invoice {
  _id: string;
  invoiceId: string;
  amount: number;
  duration: number;
  dueDate: string;
  explorerUrl?: string;
}

const InvoiceList = () => {
  const navigate = useNavigate();
  const [userAddress, setUserAddress] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const { toast } = useToast();
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        console.log("Connecting wallet...");
        // Use the raw ethereum request without any ethers.js formatting
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Accounts returned:", accounts);
        
        // Check if accounts array is empty or undefined
        // if (!accounts || accounts.length === 0) {
        //   throw new Error("No accounts returned from wallet");
        // }
        
        // Get the address directly from accounts array - preserve original case
        const address = accounts[0];
        console.log("Setting address:", address);
        
        setUserAddress(address);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      } catch (err: any) {
        console.error('Wallet connection error:', err);
        setError(`Wallet connection error: ${err.message}`);
        toast({
          title: "Connection Failed",
          description: `Failed to connect to wallet: ${err.message}`,
          variant: "destructive"
        });
      }
    } else {
      console.error("No ethereum object found - MetaMask not installed");
      setError("MetaMask not detected");
      toast({
        title: "MetaMask Not Detected",
        description: "Please install MetaMask to connect your wallet",
        variant: "destructive"
      });
    }
  };

  const goBack = () => {
    // Pass the data back to the dashboard using state in navigation
    navigate('/dashboard', { 
      state: { 
        invoiceCount: invoiceCount,
        totalAmount: totalAmount 
      } 
    });
  };

  useEffect(() => {
    if (!userAddress) return;

    const fetchInvoices = async () => {
      setLoading(true);
      setError('');
      try {
        console.log("Fetching invoices for address:", userAddress);
        const response = await fetch(`http://localhost:5000/api/invoice/invoices/${userAddress}`);
        
        if (!response.ok) {
          console.error("API response not OK:", response.status, response.statusText);
          throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Invoice data received:", data);
        
        // Make sure data and data.data exist and data.data is an array
        if (!data || !data.data || !Array.isArray(data.data)) {
          console.error("Invalid data format received:", data);
          throw new Error("Invalid data format received from API");
        }
        
        setInvoices(data.data);
        
        // Calculate invoice count - safely access length property
        const count = data.data.length || 0;
        setInvoiceCount(count);
        
        // Fix: Ensure we're dealing with numeric values when calculating total
        const total = data.data.reduce((sum: number, invoice: Invoice) => {
          // Parse amount as a number if it's not already one
          const invoiceAmount = typeof invoice.amount === 'number' ? invoice.amount : parseFloat(invoice.amount);
          // Only add valid numbers
          return isNaN(invoiceAmount) ? sum : sum + invoiceAmount;
        }, 0);
        
        console.log("Calculated total amount:", total, typeof total);
        setTotalAmount(total);
        
      } catch (err: any) {
        console.error("Error fetching invoices:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: `Failed to fetch invoices: ${err.message}`,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [toast, userAddress]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goBack}
            className="flex items-center gap-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
            My Invoices
          </h1>
          
          <div></div> {/* Empty div to maintain layout with justify-between */}
        </div>
        
        <div className="w-full max-w-xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center p-6 bg-gray-900/50 rounded-lg border border-gray-800">
            <WalletConnectButton onConnect={connectWallet} />
            <span className="text-gray-400">or</span>
            <AddressInput value={userAddress} onChange={setUserAddress} />
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-900/40 border border-red-800 rounded-md">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>

        {userAddress && !loading && !error && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-lg text-gray-300 mb-2">Total Invoices</h2>
              <p className="text-3xl font-bold text-white">{invoiceCount}</p>
            </div>
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h2 className="text-lg text-gray-300 mb-2">Total Value</h2>
              <p className="text-3xl font-bold text-green-400">
                ${typeof totalAmount === 'number' ? totalAmount.toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-6">
                <Skeleton className="h-6 w-3/4 bg-gray-800 mb-4" />
                <Skeleton className="h-4 w-1/2 bg-gray-800 mb-3" />
                <Skeleton className="h-4 w-2/3 bg-gray-800 mb-3" />
                <Skeleton className="h-4 w-1/3 bg-gray-800" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-900/40 border border-red-800 p-4 rounded-md text-center">
            <p className="text-red-300">Error: {error}</p>
          </div>
        ) : invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.map((invoice) => (
              <InvoiceCard
                key={invoice._id}
                invoiceId={invoice.invoiceId}
                amount={invoice.amount}
                duration={invoice.duration}
                dueDate={invoice.dueDate}
                explorerUrl={invoice.explorerUrl}
              />
            ))}
          </div>
        ) : userAddress ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-400">No invoices found for this address.</p>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900/50 rounded-lg border border-gray-800">
            <p className="text-gray-400">Connect your wallet or enter an address to view invoices.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
