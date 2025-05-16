const contract = require('../services/contractService');

const getTokenBalance = async (req, res) => {
  const { address, tokenId } = req.params;

  try {
    const balance = await contract.balanceOf(address, tokenId);
    res.json({ balance: balance.toString() });
  } catch (error) {
    console.error('Error getting token balance:', error);
    res.status(500).json({ error: 'Failed to get balance' });
  }
};

module.exports = {
  getTokenBalance,
};
