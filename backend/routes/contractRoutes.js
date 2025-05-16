const express = require('express');
const { getTokenBalance } = require('../controllers/contractController');

const router = express.Router();

router.get('/balance/:address/:tokenId', getTokenBalance);

module.exports = router;
