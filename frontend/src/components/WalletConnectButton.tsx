import React from 'react';
import { Button } from "@/components/ui/button";

interface WalletConnectButtonProps {
  onConnect: () => Promise<void>;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ onConnect }) => {
  return (
    <Button 
      onClick={onConnect}
      className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2"
    >
      Fetch invoices of your Wallet
    </Button>
  );
};

export default WalletConnectButton;