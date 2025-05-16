const multer = require("multer");
const { mintInvoice } = require("../services/erc1155Service");
const { pinJSONToIPFS } = require("../services/pinataService");
const Invoice = require("../models/invoiceModel");

// Set up multer
const upload = multer({ storage: multer.memoryStorage() });

// Mint Invoice Handler
const mintInvoiceHandler = async (req, res) => {
  console.log("Received body:", req.body);
  console.log("Received file:", req.file);

  const {
    toAddress = req.body.WalletAddress.toLowerCase(),
    yieldInterest = "8",
    invoiceAmount,
    title,
    invoiceNumber,
    dueDate,
    description,
    duration,
  } = req.body;

  if (!toAddress || !title || !invoiceNumber || !dueDate || !duration || !invoiceAmount || !yieldInterest) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  try {
    const tokenId = Date.now();

    const metadata = {
      name: title,
      description: description || "Tokenized Invoice",
      invoiceNumber,
      date: dueDate,
      amount: invoiceAmount,
      yieldInterest: yieldInterest,
      duration,
      tokenId,
    };

    const { ipfsHash, ipfsUrl } = await pinJSONToIPFS(metadata);
    const tokenURI = `ipfs://${ipfsHash}`;

    const txResult = await mintInvoice(toAddress, invoiceAmount, tokenURI, tokenURI);

    const newInvoice = new Invoice({
      invoiceId: invoiceNumber,
      userAddress: toAddress,
      yieldInterest,
      title,
      invoiceNumber,
      amount: invoiceAmount,
      duration,
      description,
      dueDate,
      tokenId,
      ipfsURI: tokenURI,
      ipfsGatewayUrl: ipfsUrl,
      txHash: txResult.txHash,
      explorerUrl: txResult.explorerUrl,
      invoiceFile: req.file?.buffer,
      fileType: req.file?.mimetype,
    });

    await newInvoice.save();

    return res.status(200).json({
      success: true,
      message: "Invoice token minted successfully",
      tokenId,
      tokenURI,
      ipfsGatewayUrl: ipfsUrl,
      txHash: txResult.txHash,
      blockNumber: txResult.blockNumber,
      gasUsed: txResult.gasUsed,
      explorerUrl: txResult.explorerUrl,
    });

  } catch (error) {
    console.error("Minting error:", error);
    return res.status(500).json({ success: false, error: "Minting failed. Try again later." });
  }
};

// Get Invoices Handler
const getInvoicesByUser = async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    const invoices = await Invoice.find({ userAddress }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ success: false, message: "Failed to fetch invoices" });
  }
};

// Properly export both
module.exports = {
  mintInvoiceHandler: [upload.single("file"), mintInvoiceHandler],
  getInvoicesByUser,
};
