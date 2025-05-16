const { ethers } = require('ethers');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Read ABI from file
const abiPath = path.join(__dirname, '../utils/Invoice1155.json');
const contractJSON = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

// Setup provider
const provider = new ethers.JsonRpcProvider(
  `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);

// Create signer
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Deployed contract address (update this if redeployed)
const contractAddress = '0xc0aF06D62b1722d3B668e0332395959978A7EA8B';
// const contractAddress = '0x701C155E1843Fd879FA1cC4F687c0238eF59e4c2';

const contract = new ethers.Contract(contractAddress, contractJSON.abi, wallet);

module.exports = contract;
