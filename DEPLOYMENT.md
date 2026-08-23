# 🚀 Deployment Guide - CJ Protein Snacks

## Quick Deploy (5 minutes total)

### Step 1: Deploy Backend to Railway ⚡ (2 minutes)
1. Go to **[Railway.app](https://railway.app)**
2. Click **"New Project"** → **"Deploy from GitHub"**
3. Select your repo (`protein`)
4. Railway auto-detects `package.json` and deploys
5. Copy your backend URL: `https://your-project.railway.app`
6. Note down this URL

### Step 2: Update Frontend API URL
After you get the Railway backend URL, I'll update the frontend config and redeploy.

### Step 3: Deploy Frontend to Vercel ⚡ (2 minutes)
1. Go to **[Vercel.com](https://vercel.com)**
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo (`protein`)
4. Vercel auto-detects the project
5. **Environment Variables**: Add
   ```
   REACT_APP_API_URL = https://your-railway-url.railway.app
   ```
6. Click **"Deploy"** ✅

---

## API Endpoints (Backend)

```
POST /api/calculate
Body: { weightKg: 65, activity: "active" }
Response: { success: true, data: { dailyTargetGrams: 78, recommended: [...] } }

GET /api/products
Response: { success: true, count: 6, data: [...] }

GET /api/health
Response: { status: "Server is running ✅" }
```

---

## Environment Variables

**Frontend** (`index.html`):
```javascript
const API_URL = 'https://your-railway-url.railway.app';
```

**Backend** (`.env`):
```
PORT=5000
```

---

## Free Services Used
- **Railway**: Backend hosting (free tier)
- **Vercel**: Frontend hosting (unlimited free)

**Total Cost**: $0 🎉

---

## Need Help?

**Backend not connecting?**
- Check CORS is enabled in `server.js` ✅
- Verify API URL in frontend code

**Vercel showing "Route not found"?**
- Make sure you're not deploying backend to Vercel
- Backend MUST go to Railway/Render

**Quick Test Backend:**
```bash
curl https://your-railway-url.railway.app/api/health
```
