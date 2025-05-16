const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(
  `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Updated ERC-1155 contract address
const contractAddress = "0x27224c64D8060E3e60355d8003D5E735CA218A32";

// Correct ABI matching your actual mint function
const abi = [
  "function mint(address to, uint256 amount, string memory tokenURI) public returns (uint256)"
];

const contract = new ethers.Contract(contractAddress, abi, signer);

/**
 * Mint a new invoice token with metadata.
 * @param {string} toAddress - Receiver wallet address
 * @param {string} amount - Number of tokens (usually 1 for invoices)
 * @param {string} tokenURI - IPFS URI to the metadata JSON file
 * @returns {object} Transaction result
 */
async function mintInvoice(toAddress, amount, tokenURI) {
  try {
    console.log("MINTING WITH:", { toAddress, amount, tokenURI, typeofTokenURI: typeof tokenURI });

    const tx = await contract.mint(toAddress, amount, tokenURI);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      explorerUrl: `https://sepolia.basescan.org/tx/${tx.hash}`
    };
  } catch (error) {
    console.error("Minting Error:", error);
    throw new Error("Minting failed. Try again later.");
  }
}

module.exports = { mintInvoice };
