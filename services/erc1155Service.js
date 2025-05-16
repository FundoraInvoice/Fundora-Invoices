const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(`https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = "0xc0aF06D62b1722d3B668e0332395959978A7EA8B";
const abi = [
  "function mint(address to, uint256 amount, bytes data) public",
];

const contract = new ethers.Contract(contractAddress, abi, signer);

async function mintInvoice(toAddress, amount) {
  const tx = await contract.mint(toAddress, amount, "0x");
  await tx.wait();
  return tx.hash;
}

module.exports = { mintInvoice };
