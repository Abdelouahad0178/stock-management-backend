const express = require('express');
const router = express.Router();
const StockItem = require('../models/StockItem');

// GET all stock items
router.get('/', async (req, res) => {
  try {
    const stockItems = await StockItem.find();
    res.json(stockItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new stock item
router.post('/', async (req, res) => {
  const stockItem = new StockItem({
    productName: req.body.productName,
    quantity: req.body.quantity,
    price: req.body.price
  });

  try {
    const newStockItem = await stockItem.save();
    res.status(201).json(newStockItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update a stock item
router.put('/:id', getStockItem, async (req, res) => {
  if (req.body.productName != null) {
    res.stockItem.productName = req.body.productName;
  }
  if (req.body.quantity != null) {
    res.stockItem.quantity = req.body.quantity;
  }
  if (req.body.price != null) {
    res.stockItem.price = req.body.price;
  }

  try {
    const updatedStockItem = await res.stockItem.save();
    res.json(updatedStockItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a stock item
router.delete('/:id', async (req, res) => {
  try {
    const stockItem = await StockItem.findByIdAndDelete(req.params.id);
    if (!stockItem) {
      return res.status(404).json({ message: 'Cannot find stock item' });
    }
    res.json({ message: 'Deleted Stock Item' });
  } catch (err) {
    console.log(`Error deleting stock item: ${err}`);
    res.status(500).json({ message: err.message });
  }
});

// Middleware to get stock item by ID
async function getStockItem(req, res, next) {
  let stockItem;
  try {
    stockItem = await StockItem.findById(req.params.id);
    if (stockItem == null) {
      console.log(`Stock item with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Cannot find stock item' });
    }
  } catch (err) {
    console.log(`Error finding stock item: ${err}`);
    return res.status(500).json({ message: err.message });
  }
  res.stockItem = stockItem;
  next();
}

module.exports = router;
