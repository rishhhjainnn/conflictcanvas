# Deployment Guide - ConflictCanvas

This guide will help you deploy the ConflictCanvas frontend to production.

## Deployment Platforms

ConflictCanvas frontend can be deployed to:
- **Vercel** (Recommended)
- **Netlify**
- GitHub Pages
- Any static hosting service

## Deploying to Vercel

### Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Git installed on your machine
3. A GitHub account (recommended)

### Deployment Steps

#### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   cd /Users/rishijain/Downloads/algo
   vercel
   ```

4. **Follow the prompts**
   - Set up and deploy? → Yes
   - Which scope? → Your username
   - Link to existing project? → No
   - Project name → conflictcanvas (or your preferred name)
   - In which directory is your code located? → ./
   - Override settings? → No

5. **Production deployment**
   ```bash
   vercel --prod
   ```

#### Option 2: Deploy via GitHub Integration

1. **Initialize Git repository**
   ```bash
   cd /Users/rishijain/Downloads/algo
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository**
   - Go to https://github.com/new
   - Create a new repository named "conflictcanvas"
   - Don't initialize with README (we already have one)

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/conflictcanvas.git
   git branch -M main
   git push -u origin main
   ```

4. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will automatically detect the `vercel.json` configuration
   - Click "Deploy"

### Configuration Details

The project is configured as a static site deployment:

- **Output Directory**: `frontend/`
- **Build Command**: None (static HTML/CSS/JS)
- **Framework**: None (vanilla JavaScript)
- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Asset Caching**: Static assets (JS, CSS, images) cached for 1 year
- **Security Headers**: X-Content-Type-Options nosniff enabled

## Deploying to Netlify

### Prerequisites

1. A Netlify account (sign up at https://netlify.com)
2. Git installed on your machine
3. A GitHub account (recommended)

### Deployment Steps

#### Option 1: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify**
   ```bash
   cd /Users/rishijain/Downloads/algo
   netlify init
   ```

4. **Follow the prompts**
   - Create & configure a new site? → Yes
   - Team: → Your team
   - Site name: → conflictcanvas (or your preferred name)
   - Build command: → (leave blank)
   - Directory to deploy: → frontend

5. **Deploy to production**
   ```bash
   netlify deploy --prod
   ```

#### Option 2: Deploy via GitHub Integration

1. **Initialize Git repository** (if not already done)
   ```bash
   cd /Users/rishijain/Downloads/algo
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub** (if not already done)
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/conflictcanvas.git
   git branch -M main
   git push -u origin main
   ```

3. **Connect to Netlify**
   - Go to https://app.netlify.com/start
   - Import your GitHub repository
   - Netlify will automatically detect the `netlify.toml` configuration
   - Click "Deploy site"

### Netlify Configuration

The `netlify.toml` file includes:
- **Build Settings**: Publish directory set to `frontend/`
- **Redirects**: All routes redirect to `index.html` for SPA routing
- **Headers**: Cache control and security headers configured
- **Asset Optimization**: Static assets cached for 1 year

### What Gets Deployed

Only the frontend is deployed:
- `frontend/` directory with all HTML, CSS, and JavaScript files
- Static assets (images, fonts, etc.)

What is NOT deployed:
- `backend/` directory (Python/FastAPI backend)
- `database/` directory
- Environment files (.env)

### Backend Deployment

The backend (FastAPI + PostgreSQL) requires a different deployment platform:
- **Recommended**: Render, Railway, or DigitalOcean
- **Database**: Supabase, Neon, or Railway Postgres
- **API Configuration**: Update `frontend/js/config.js` with production API URL

### Post-Deployment Steps

1. **Update API Configuration**
   - Edit `frontend/js/config.js`
   - Set `CONFIG.API_BASE_URL` to your production backend URL
   - Set `CONFIG.DEMO_MODE = false` when backend is deployed

2. **Test the deployment**
   - Visit your Vercel URL
   - Test all features in demo mode
   - Verify responsive design on mobile

3. **Set up custom domain** (optional)
   - Go to Vercel project settings
   - Add your custom domain
   - Update DNS records

### Troubleshooting

**Issue: 404 errors on page refresh**
- Solution: The `vercel.json` rewrites configuration should handle this. Ensure the file is present.

**Issue: Static assets not loading**
- Solution: Check that all paths in `frontend/index.html` are relative paths.

**Issue: API calls failing**
- Solution: In demo mode, the app uses localStorage. Set `CONFIG.DEMO_MODE = true` in config.js.

### Environment Variables

For production deployment with backend:

1. Go to Vercel project settings
2. Add environment variables:
   - `VITE_API_BASE_URL`: Your production backend URL
   - `VITE_DEMO_MODE`: Set to `false` when backend is live

### Monitoring

- Vercel provides built-in analytics
- Check Vercel dashboard for deployment logs
- Monitor performance and uptime

### Support

For issues:
- Check Vercel deployment logs
- Review browser console for errors
- Ensure all files are committed to git
