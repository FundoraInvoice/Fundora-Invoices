const mongoose = require("mongoose");

const invoiceSchema1 = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
    unique: true,
  },
  userAddress: {
    type: String,
    required: true,
  },
  invoiceTitle: String,
  invoiceNumber: String,
  amount: String,
  duration: String,
  description: String,
  dueDate: String,

  tokenId: {
    type: Number,
    required: true,
  },

  ipfsURI: {
    type: String,
    required: true,
  },
  ipfsGatewayUrl: {
    type: String,
    required: true,
  },
  txHash: {
    type: String,
    required: true,
  },
  explorerUrl: String,

  invoiceFile: {
    type: Buffer, // You can also use filePath if storing on disk
    required: false,
  },
  fileType: String, // e.g. image/jpeg or application/pdf

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Invoice_d", invoiceSchema1);
