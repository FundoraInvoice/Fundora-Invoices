const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  title: {
    type: String,
    // required: true,
  },

  realName:{
    type: String,
  },

  toAddress: {
    type: String,
    required: true,
  },

  yieldInterest: {
    type: String,
    required: true,
  },

  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  invoiceAmount: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  uploadedFile: {
    type: String, // This will store the IPFS URL from Pinata
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Invoice', invoiceSchema);
