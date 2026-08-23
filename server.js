// CJ Protein Snacks — Professional Backend
// ============================================
// Express server with API endpoints for products and protein calculator
// Run: npm start (on port 5000)

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ========== IN-MEMORY DATA ==========
let products = [
  {
    id: 1,
    name: 'CJ Protein Ladoo',
    description: 'Roasted gram, almond & jaggery, hand-rolled.',
    proteinGrams: 12,
    servingSizeGrams: 40,
    price: 149,
    badge: 'Bestseller',
    imageUrl: 'https://via.placeholder.com/200?text=CJ+Ladoo',
    inStock: true,
  },
  {
    id: 2,
    name: 'Peanut Protein Crunch Bar',
    description: 'Crispy roasted peanut bar, no refined sugar.',
    proteinGrams: 10,
    servingSizeGrams: 35,
    price: 99,
    badge: 'High Fibre',
    imageUrl: 'https://via.placeholder.com/200?text=Crunch+Bar',
    inStock: true,
  },
  {
    id: 3,
    name: 'Roasted Chana Masala Mix',
    description: 'Tangy roasted chana, air-fried not deep-fried.',
    proteinGrams: 9,
    servingSizeGrams: 30,
    price: 79,
    badge: 'Vegan',
    imageUrl: 'https://via.placeholder.com/200?text=Chana+Mix',
    inStock: true,
  },
  {
    id: 4,
    name: 'Sprouted Moong Protein Bites',
    description: 'Sprouted moong, oats & seeds, baked fresh.',
    proteinGrams: 8,
    servingSizeGrams: 30,
    price: 89,
    badge: 'Gut Friendly',
    imageUrl: 'https://via.placeholder.com/200?text=Moong+Bites',
    inStock: true,
  },
  {
    id: 5,
    name: 'Multigrain Protein Cookies',
    description: '2 cookies of ragi, oats & whey protein.',
    proteinGrams: 7,
    servingSizeGrams: 40,
    price: 69,
    badge: 'Kids Love It',
    imageUrl: 'https://via.placeholder.com/200?text=Cookies',
    inStock: true,
  },
  {
    id: 6,
    name: 'Whey Protein Energy Balls',
    description: 'Cocoa + whey isolate, post-workout ready.',
    proteinGrams: 14,
    servingSizeGrams: 45,
    price: 129,
    badge: 'Max Protein',
    imageUrl: 'https://via.placeholder.com/200?text=Energy+Balls',
    inStock: true,
  },
];

let nextId = 7;

// ========== ROUTES ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅', timestamp: new Date().toISOString() });
});

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const sorted = [...products].sort((a, b) => b.proteinGrams - a.proteinGrams);
    res.json({
      success: true,
      count: sorted.length,
      data: sorted,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new product
app.post('/api/products', (req, res) => {
  try {
    const { name, description, proteinGrams, servingSizeGrams, price, badge, imageUrl, inStock } = req.body;

    if (!name || proteinGrams === undefined || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, proteinGrams, price',
      });
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
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Protein calculator endpoint
// Body: { weightKg: number, activity: 'sedentary' | 'active' | 'training_hard' | 'building_muscle' }
app.post('/api/calculate', (req, res) => {
  try {
    const { weightKg, activity } = req.body;

    if (!weightKg || !activity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: weightKg, activity',
      });
    }

    const multipliers = {
      sedentary: 0.8,
      active: 1.2,
      training_hard: 1.6,
      building_muscle: 2.0,
    };

    const mult = multipliers[activity];
    if (!mult) {
      return res.status(400).json({
        success: false,
        error: 'Invalid activity. Must be one of: sedentary, active, training_hard, building_muscle',
      });
    }

    const dailyTargetGrams = Math.round(weightKg * mult);

    // Recommend snacks covering ~35% of daily target, max 3 items
    const sorted = [...products].sort((a, b) => b.proteinGrams - a.proteinGrams);
    const gapTarget = Math.round(dailyTargetGrams * 0.35);
    let remaining = gapTarget;
    const recommended = [];

    for (const p of sorted) {
      if (remaining <= 0 || recommended.length >= 3) break;
      recommended.push({
        id: p.id,
        name: p.name,
        proteinGrams: p.proteinGrams,
        price: p.price,
        badge: p.badge,
      });
      remaining -= p.proteinGrams;
    }

    res.json({
      success: true,
      data: {
        weightKg,
        activity,
        dailyTargetGrams,
        recommended,
        message: `Based on ${weightKg}kg bodyweight and ${activity} lifestyle, you need ${dailyTargetGrams}g protein daily.`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ERROR HANDLING ==========
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ CJ Protein Snacks Backend Running`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🔗 API Endpoints:`);
  console.log(`   GET  /api/health          - Health check`);
  console.log(`   GET  /api/products        - Get all products`);
  console.log(`   GET  /api/products/:id    - Get single product`);
  console.log(`   POST /api/products        - Add new product`);
  console.log(`   POST /api/calculate       - Calculate protein needs\n`);
});
