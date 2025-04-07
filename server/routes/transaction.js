const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const router = express.Router();

const auth = async (req, res, next) => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
};

router.post('/', auth, async (req, res) => {
  const { amount } = req.body;
  if (req.user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });
  req.user.balance -= amount;
  await req.user.save();
  await Transaction.create({ userId: req.user._id, type: 'debit', amount });
  res.json({ message: 'Transaction successful' });
});

router.get('/history', auth, async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id });
  res.json(transactions);
});

module.exports = router;
