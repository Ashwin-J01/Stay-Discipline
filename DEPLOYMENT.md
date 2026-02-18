# Stay-Discipline - Deployment Guide

This guide provides step-by-step instructions for deploying the Stay-Discipline application with:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

---

## Prerequisites

Before starting, ensure you have:
- GitHub account with the project repository
- Vercel account (https://vercel.com)
- Render account (https://render.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)

---

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier is fine)
3. Create a database user:
   - Click "Database Access" → "Add New Database User"
   - Save the username and password
4. Create a database:
   - Click "Database" → Select your cluster
   - Create a database named `stay-discipline`
5. Get the connection string:
   - Click "Connect" → "Drivers"
   - Copy the MongoDB URI
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/stay-discipline?retryWrites=true&w=majority`

---

## Step 2: Deploy Backend on Render

### 2.1 Prepare the Repository
1. Ensure `render.yaml` exists in the `backend/` folder
2. Push all changes to GitHub

### 2.2 Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Fill in the configuration:
   - **Name**: `stay-discipline-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### 2.3 Add Environment Variables
In Render dashboard, go to "Environment" and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stay-discipline?retryWrites=true&w=majority
JWT_SECRET=your_secure_random_jwt_secret_key_here
NODE_ENV=production
PORT=5000
```

**⚠️ IMPORTANT**: Generate a strong JWT_SECRET. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

4. Click "Deploy"
5. Wait for deployment to complete
6. Copy the backend URL (e.g., `https://stay-discipline-backend.onrender.com`)

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Update Environment Variables
Before deploying, update the frontend `.env.local` with your backend URL:

```
REACT_APP_API_URL=https://stay-discipline-backend.onrender.com
```

### 3.2 Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

### 3.3 Add Environment Variables
In Vercel deployment settings, add:

```
REACT_APP_API_URL=https://stay-discipline-backend.onrender.com
```

5. Click "Deploy"
6. Wait for deployment to complete
7. Your frontend URL will be provided (e.g., `https://stay-discipline.vercel.app`)

---

## Step 4: Verify the Deployment

1. Visit your Vercel frontend URL
2. Test the signup functionality:
   - Create a new account
   - Verify the data is saved in MongoDB
3. Test the login functionality
4. Check backend logs on Render if issues occur

---

## Troubleshooting

### Backend not connecting to MongoDB
- Verify the `MONGODB_URI` in Render environment variables
- Check MongoDB Atlas firewall settings (allow all IPs: `0.0.0.0/0`)
- Check network access in MongoDB Atlas

### CORS errors
- The backend has CORS enabled for all origins
- If still having issues, update [backend/server.js](backend/server.js):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://your-vercel-url.vercel.app'
}));
```

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` in Vercel environment variables
- Check that backend is running on Render
- Verify network connectivity with your backend URL

### Vercel build fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in [frontend/package.json](frontend/package.json)
- Check no errors in [frontend/src/](frontend/src/)

---

## Security Notes

⚠️ **NEVER** commit sensitive data:
- `.env` files are listed in [.gitignore](.gitignore)
- All credentials should be in deployment platform environment variables
- Rotate `JWT_SECRET` periodically
- Keep MongoDB credentials secure

---

## Post-Deployment

After successful deployment:

1. **Monitor Logs**:
   - Render: Logs tab in dashboard
   - Vercel: Analytics and Deployments tabs

2. **Set Up Custom Domain** (Optional):
   - Both Vercel and Render support custom domains
   - Update DNS records as instructed

3. **Enable Auto-Deploy**:
   - Both platforms auto-deploy on GitHub push by default

---

## Local Development

For local development, use:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

Create `.env` files locally with development values matching the examples provided.

---

## Support

For issues:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
