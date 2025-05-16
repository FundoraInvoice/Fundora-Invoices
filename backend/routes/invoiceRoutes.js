const express = require("express");
const router = express.Router();
const { mintInvoiceHandler, getInvoicesByUser } = require("../controllers/invoiceController");
// const invoiceController = require('./controllers/invoiceController');

router.post("/mint", mintInvoiceHandler);
router.get('/invoices/:userAddress', getInvoicesByUser);


module.exports = router;
