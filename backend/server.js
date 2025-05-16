const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// DB Connection
const connectDB = require('./config/db');
connectDB();

// Routes
const pinRoutes = require('./routes/pinRoutes');
const contractRoutes = require('./routes/contractRoutes'); // ✅ New contract route

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register Routes
// app.use('/api', uploadRoute); // ✅ Route will be /api/upload-to-pinata
app.use('/api/pins', pinRoutes);               // Existing: Upload invoice to IPFS + MongoDB
app.use('/api/contract', contractRoutes);       // ✅ New: Smart contract interaction
app.use("/api/invoice", require("./routes/invoiceRoutes"));     //New: Invoice Minting Routes

// Import routes
const invoiceRoutes = require('./routes/invoice.route');
app.use('/api/invoices', invoiceRoutes); // 👈 Invoice API route

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
