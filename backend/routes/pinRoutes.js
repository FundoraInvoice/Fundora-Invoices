const express = require('express');
const multer = require('multer');
const { uploadFileToIPFS } = require('../controllers/pinController');
// const uploadHandler = require('../controllers/uploadController');

const router = express.Router();

// Use memory storage instead of saving to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route: POST /api/pins/upload
router.post('/upload', upload.single('file'), uploadFileToIPFS);
// router.post('pages/api/upload-to-pinata', uploadHandler);

module.exports = router;
