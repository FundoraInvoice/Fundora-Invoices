const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true },
  amount: { type: String, required: true },
  createdAt: { type: Date, required: true },
  description: { type: String, required: true },
  dueDate: { type: String, required: true },
  duration: { type: String, required: true },
  explorerUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  invoiceFile: { type: Buffer, required: true },
  invoiceNumber: { type: String, required: true },
  ipfsGatewayUrl: { type: String, required: true },
  ipfsURI: { type: String, required: true },
  tokenId: { type: Number, required: true },
  txHash: { type: String, required: true },
  userAddress: { type: String, required: true },
  status: {
    type: String,
    default: "Available",
    enum: ["Available", "Funded", "Completed"]
  },
  investor_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Invoicing", invoiceSchema,"invoice_ds");
