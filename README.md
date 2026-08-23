# CJ Protein Snacks — Deploy & Connect Guide

## 1. Send Mam a link RIGHT NOW (frontend only, 2 minutes)
`index.html` is a single self-contained file — no build step needed.

1. Go to https://vercel.com → New Project → **"Deploy without Git"** is not available, so fastest path:
   - Create a new GitHub repo, push just this folder, then "Import Project" on Vercel and deploy (auto-detects static HTML).
   - OR even faster: drag-and-drop the `cj-protein-snacks` folder onto https://app.netlify.com/drop — gives you a live link in ~20 seconds. You can move it to Vercel later.
2. You'll get a link like `cj-protein-snacks.vercel.app` — send that.

Right now the site works with hardcoded snack data (no backend needed). Everything animates and the protein calculator works standalone.

## 2. When you're ready to connect the real backend (MERN)

**Backend setup:**
```bash
cd backend
npm install
# create a .env file:
echo "MONGO_URI=your_mongodb_atlas_uri" > .env
echo "PORT=5000" >> .env
npm run seed     # populates DB with the 6 starter snacks
npm start
```
Deploy the backend on **Render** or **Railway** (Vercel isn't ideal for a long-running Express server unless you rewrite routes as serverless functions).

**Free MongoDB:** create a free cluster at mongodb.com/cloud/atlas, grab the connection string, and drop it into `MONGO_URI`.

**Connect frontend to backend:**
Replace the hardcoded `PRODUCTS` array in `index.html` with a fetch call:
```js
fetch('https://your-backend-url.onrender.com/api/products')
  .then(res => res.json())
  .then(products => {
    // build product cards from real data, same as current code
  });
```
And point the calculator at `/api/calculate` (POST `{ weightKg, activity }`) instead of the local JS logic — the endpoint is already built and returns the same shape.

## 3. Protein reference (what's already in the site)

| Snack | Protein | Pack size | Price |
|---|---|---|---|
| Whey Protein Energy Balls | 14g | 45g | ₹129 |
| CJ Protein Ladoo | 12g | 40g | ₹149 |
| Peanut Protein Crunch Bar | 10g | 35g | ₹99 |
| Roasted Chana Masala Mix | 9g | 30g | ₹79 |
| Sprouted Moong Protein Bites | 8g | 30g | ₹89 |
| Multigrain Protein Cookies (2pc) | 7g | 40g | ₹69 |

**Swap in your actual product data** — these are placeholders so the site works out of the box. Just edit the `PRODUCTS` array in `index.html` or the `seed.js` file.

**Daily protein target logic used in the calculator:**
- Sedentary: 0.8 g protein per kg body weight
- Active: 1.2 g/kg
- Training hard: 1.6 g/kg
- Building muscle: 2.0 g/kg
(Standard sports-nutrition ranges — adjust multipliers in `server.js`/`index.html` if your brand wants different numbers.)
