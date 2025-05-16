// services/pinataService.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// For direct stream file uploads (used in legacy or isolated cases)
const pinFileToIPFS = async (filePath) => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const data = new FormData();
  data.append('file', fs.createReadStream(filePath));

  const res = await axios.post(url, data, {
    maxContentLength: 'Infinity',
    headers: {
      ...data.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return res.data;
};

// For pinning JSON data with error validation
const pinJSONToIPFS = async (jsonData) => {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

  try {
    const res = await axios.post(url, jsonData, {
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    });

    if (!res.data || !res.data.IpfsHash) {
      console.error("Invalid Pinata response:", res.data);
      throw new Error("Pinning JSON to IPFS failed: Missing IpfsHash.");
    }

    return {
      ipfsHash: res.data.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
      pinSize: res.data.PinSize,
      timestamp: res.data.Timestamp,
    };

  } catch (error) {
    console.error("Pinning JSON to IPFS failed:", error.message);
    throw new Error("Pinning JSON to IPFS failed.");
  }
};

// For uploading files via Next.js (or similar) API route with FormData
const uploadToPinata = async (file) => {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const data = new FormData();
  data.append('file', fs.createReadStream(file.filepath), file.originalFilename);

  const res = await axios.post(url, data, {
    maxContentLength: 'Infinity',
    headers: {
      ...data.getHeaders(),
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
  });

  return {
    ipfsHash: res.data.IpfsHash,
    ipfsUrl: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
    pinSize: res.data.PinSize,
    timestamp: res.data.Timestamp,
  };
};

module.exports = {
  pinFileToIPFS,
  pinJSONToIPFS,
  uploadToPinata,
};
