const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// POST /api/invoices - Create a new invoice
router.post('/', async (req, res) => {
  try {
    // ... existing code ...
  } catch (err) {
    console.error('❌ Error saving invoice:', err);
    res.status(500).json({ error: 'Failed to save invoice' });
  }
});

// GET /api/invoices/all - Fetch all invoices
router.get('/all', async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    res.json(invoices);
  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/invoices - Fetch invoices by SME ID
router.get('/', async (req, res) => {
  try {
    const { smeId } = req.query;
    if (!smeId) {
      return res.status(400).json({ error: "Missing smeId parameter" });
    }

    const invoices = await Invoice.find({ userAddress: smeId });
    res.json(invoices);
  } catch (error) {
    console.error('❌ Error fetching SME invoices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/invoices/:id - Update invoice status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, investor_id } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Missing status parameter" });
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { status, investor_id },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json(updatedInvoice);
  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;