// Run once to populate your database: node seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const productSchema = new mongoose.Schema({
  name: String, description: String, proteinGrams: Number,
  servingSizeGrams: Number, price: Number, badge: String,
  imageUrl: String, inStock: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

const snacks = [
  { name: "CJ Protein Ladoo", description: "Roasted gram, almond & jaggery, hand-rolled.", proteinGrams: 12, servingSizeGrams: 40, price: 149, badge: "Bestseller" },
  { name: "Peanut Protein Crunch Bar", description: "Crispy roasted peanut bar, no refined sugar.", proteinGrams: 10, servingSizeGrams: 35, price: 99, badge: "High Fibre" },
  { name: "Roasted Chana Masala Mix", description: "Tangy roasted chana, air-fried not deep-fried.", proteinGrams: 9, servingSizeGrams: 30, price: 79, badge: "Vegan" },
  { name: "Sprouted Moong Protein Bites", description: "Sprouted moong, oats & seeds, baked fresh.", proteinGrams: 8, servingSizeGrams: 30, price: 89, badge: "Gut Friendly" },
  { name: "Multigrain Protein Cookies", description: "2 cookies of ragi, oats & whey protein.", proteinGrams: 7, servingSizeGrams: 40, price: 69, badge: "Kids Love It" },
  { name: "Whey Protein Energy Balls", description: "Cocoa + whey isolate, post-workout ready.", proteinGrams: 14, servingSizeGrams: 45, price: 129, badge: "Max Protein" },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Product.deleteMany({});
  await Product.insertMany(snacks);
  console.log('Seeded', snacks.length, 'products');
  process.exit(0);
}).catch(err => { console.error(err); process.exit(1); });
