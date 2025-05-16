import React from "react";
import { useWallet } from "../hooks/useWallet";

const WalletTest = () => {
  const { address, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      <h2>Wallet Connection Test</h2>
      <p>Address: {address || "Not Connected"}</p>
      <button onClick={connectWallet}>
        {address ? "Reconnect Wallet" : "Connect Wallet"}
      </button>
      <button onClick={disconnectWallet} disabled={!address}>
        Disconnect Wallet
      </button>
    </div>
  );
};

export default WalletTest;