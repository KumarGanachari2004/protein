// CJ Protein Snacks — Simple Backend (Express only, no database)
// ---------------------------------------------------------------
// SETUP
//   npm install
//   npm start
//
// This gives you:
//   GET  /api/products            -> list all snacks
//   GET  /api/products/:id        -> single snack
//   POST /api/products            -> add a new snack (in-memory)
//   POST /api/calculate           -> { weightKg, activity } -> recommended protein + snack suggestions
// ---------------------------------------------------------------

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- IN-MEMORY DATA ----------
let products = [
  {
    id: 1,
    name: 'CJ Classic Roasted',
    description: 'High-protein roasted snack mix',
    proteinGrams: 25,
    servingSizeGrams: 50,
    price: 149,
    badge: 'Bestseller',
    imageUrl: 'https://via.placeholder.com/200?text=CJ+Classic',
    inStock: true,
  },
  {
    id: 2,
    name: 'CJ Spicy Kick',
    description: 'Spiced protein blend with bold flavor',
    proteinGrams: 22,
    servingSizeGrams: 50,
    price: 159,
    badge: 'New',
    imageUrl: 'https://via.placeholder.com/200?text=CJ+Spicy',
    inStock: true,
  },
  {
    id: 3,
    name: 'CJ Power Mix',
    description: 'Premium blend with added nuts',
    proteinGrams: 28,
    servingSizeGrams: 60,
    price: 199,
    badge: 'Premium',
    imageUrl: 'https://via.placeholder.com/200?text=CJ+Power',
    inStock: true,
  },
];

let nextId = 4;

// ---------- ROUTES ----------

// Get all products
app.get('/api/products', (req, res) => {
  const sorted = [...products].sort((a, b) => b.proteinGrams - a.proteinGrams);
  res.json(sorted);
});

// Get one product
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Add a product
app.post('/api/products', (req, res) => {
  const { name, description, proteinGrams, servingSizeGrams, price, badge, imageUrl, inStock } = req.body;
  
  if (!name || proteinGrams === undefined || price === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const product = {
    id: nextId++,
    name,
    description: description || '',
    proteinGrams,
    servingSizeGrams: servingSizeGrams || 50,
    price,
    badge: badge || '',
    imageUrl: imageUrl || '',
    inStock: inStock !== false,
  };

  products.push(product);
  res.status(201).json(product);
});

// Protein calculator
app.post('/api/calculate', (req, res) => {
  const { weightKg, activity } = req.body;

  if (!weightKg || !activity) {
    return res.status(400).json({ error: 'weightKg and activity are required' });
  }

  const multipliers = {
    sedentary: 0.8,
    active: 1.2,
    training_hard: 1.6,
    building_muscle: 2.0,
  };

  const mult = multipliers[activity] || 1.2;
  const dailyTargetGrams = Math.round(weightKg * mult);

  // Recommend snacks covering ~35% of daily target, max 3 items
  const sorted = [...products].sort((a, b) => b.proteinGrams - a.proteinGrams);
  const gapTarget = Math.round(dailyTargetGrams * 0.35);
  let remaining = gapTarget;
  const recommended = [];

  for (const p of sorted) {
    if (remaining <= 0 || recommended.length >= 3) break;
    recommended.push({ name: p.name, proteinGrams: p.proteinGrams, price: p.price });
    remaining -= p.proteinGrams;
  }

  res.json({ dailyTargetGrams, recommended });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
