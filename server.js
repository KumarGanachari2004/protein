// CJ Protein Snacks — Backend (Express + MongoDB/Mongoose)
// -----------------------------------------------------------
// SETUP
//   npm init -y
//   npm install express mongoose cors dotenv
//   Create a .env file with: MONGO_URI=your_mongodb_atlas_connection_string
//   Run: node server.js  (or: npm run dev with nodemon)
//
// This gives you:
//   GET  /api/products            -> list all snacks
//   GET  /api/products/:id        -> single snack
//   POST /api/products            -> add a new snack (admin use)
//   POST /api/calculate           -> { weightKg, activity } -> recommended protein + snack suggestions
// -----------------------------------------------------------

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ---------- 1. CONNECT TO MONGODB ----------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ---------- 2. SCHEMA ----------
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  proteinGrams: { type: Number, required: true },   // grams of protein per serving
  servingSizeGrams: { type: Number, required: true }, // total pack weight in grams
  price: { type: Number, required: true },           // in INR
  badge: { type: String, default: '' },               // e.g. "Bestseller", "Vegan"
  imageUrl: { type: String, default: '' },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// ---------- 3. ROUTES ----------

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ proteinGrams: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a product (protect this route with auth in production)
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Protein calculator: body weight (kg) + activity level -> daily target + recommended snacks
// activity multipliers (grams of protein per kg of body weight):
//   sedentary: 0.8 | active: 1.2 | training_hard: 1.6 | building_muscle: 2.0
app.post('/api/calculate', async (req, res) => {
  try {
    const { weightKg, activity } = req.body;
    const multipliers = {
      sedentary: 0.8,
      active: 1.2,
      training_hard: 1.6,
      building_muscle: 2.0,
    };
    const mult = multipliers[activity] || 1.2;
    const dailyTargetGrams = Math.round(weightKg * mult);

    // Recommend snacks covering ~35% of the daily target in one sitting,
    // picking highest-protein snacks first (greedy, max 3 items)
    const products = await Product.find().sort({ proteinGrams: -1 });
    const gapTarget = Math.round(dailyTargetGrams * 0.35);
    let remaining = gapTarget;
    const recommended = [];
    for (const p of products) {
      if (remaining <= 0 || recommended.length >= 3) break;
      recommended.push({ name: p.name, proteinGrams: p.proteinGrams, price: p.price });
      remaining -= p.proteinGrams;
    }

    res.json({ dailyTargetGrams, recommended });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
