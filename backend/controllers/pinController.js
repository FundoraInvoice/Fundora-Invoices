const axios = require('axios');
const FormData = require('form-data');
const Invoice = require('../models/pinModel'); // Refers to your Invoice schema

// Load environment variables
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// Save invoice + IPFS file URL to MongoDB
const savePinData = async (invoiceData, ipfsUrl) => {
  const newInvoice = new Invoice({
    invoiceTitle: invoiceData.invoiceTitle,
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceAmount: invoiceData.invoiceAmount,
    duration: invoiceData.duration,
    dueDate: invoiceData.dueDate,
    uploadedFile: ipfsUrl
  });

  const savedInvoice = await newInvoice.save();
  return savedInvoice;
};

// Upload file to Pinata and save metadata
const uploadFileToIPFS = async (req, res) => {
  try {
    const { file, body } = req;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // if (!req.body.invoiceAmount) {
    //   return res.status(400).json({ error: "Amount is required" });
    // }

    // Upload file to Pinata
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    const metadata = JSON.stringify({ name: file.originalname });
    formData.append('pinataMetadata', metadata);

    const pinataOptions = JSON.stringify({ cidVersion: 1 });
    formData.append('pinataOptions', pinataOptions);

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY
        }
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    // Save invoice + IPFS URL
    const savedInvoice = await savePinData(body, ipfsUrl);

    res.status(201).json({
      success: true,
      message: 'Invoice saved and file uploaded to IPFS',
      invoice: savedInvoice
    });
  } catch (err) {
    console.error('Pinata upload or DB save error:', err.message);
    res.status(500).json({ error: 'Failed to upload file or save invoice data' });
  }
};

module.exports = { uploadFileToIPFS, savePinData };
