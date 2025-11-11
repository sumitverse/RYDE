# Vercel Deployment Guide for RYDE (Ionic/Angular App)

This guide will walk you through deploying your Ionic/Angular application to Vercel step by step.

## Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)
3. **Node.js** - Make sure you have Node.js installed locally (for testing builds)

---

## Step-by-Step Deployment Process

### Step 1: Prepare Your Repository

1. **Commit all your changes** to Git:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   ```

2. **Push to GitHub** (if not already done):
   ```bash
   git push origin main
   ```
   (Replace `main` with your branch name if different)

### Step 2: Test Build Locally (Optional but Recommended)

Before deploying, test that your production build works:

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Check if www folder is created with built files
ls www
```

If the build succeeds and you see files in the `www` directory, you're ready to deploy!

### Step 3: Sign Up / Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended for easy integration)
4. Authorize Vercel to access your GitHub account

### Step 4: Import Your Project

1. After logging in, you'll see the Vercel dashboard
2. Click **"Add New..."** → **"Project"**
3. You'll see a list of your GitHub repositories
4. **Find and select your repository** (the one containing this CampusCycle project)
5. Click **"Import"**

### Step 5: Configure Project Settings

Vercel should auto-detect your project, but verify these settings:

**Framework Preset:** 
- Select **"Other"** or leave as auto-detected

**Root Directory:**
- If your project is in a subfolder, set it (e.g., `CampusCycle`)
- If it's in the root, leave it as `.`

**Build and Output Settings:**
- **Build Command:** `npm run build` (or `npm run vercel-build`)
- **Output Directory:** `www`
- **Install Command:** `npm install`

**Environment Variables:**
- If you have any API keys or environment variables, add them here
- For now, you can skip this if you don't have any

### Step 6: Deploy

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-5 minutes)
3. You'll see the build logs in real-time
4. Once complete, you'll get a deployment URL like: `https://your-project-name.vercel.app`

### Step 7: Verify Deployment

1. Click on your deployment URL to open your app
2. Test the following:
   - ✅ App loads correctly
   - ✅ Navigation works
   - ✅ All pages are accessible
   - ✅ No console errors (check browser DevTools)

### Step 8: Custom Domain (Optional)

If you want to use a custom domain:

1. Go to your project settings in Vercel
2. Click **"Domains"** tab
3. Add your custom domain
4. Follow the DNS configuration instructions

---

## Troubleshooting

### Build Fails

**Error: "Build command failed"**
- Check the build logs in Vercel dashboard
- Common issues:
  - Missing dependencies in `package.json`
  - TypeScript errors
  - Missing environment files

**Solution:**
```bash
# Test build locally first
npm run build
# Fix any errors locally, then push and redeploy
```

### Routing Issues (404 on refresh)

**Problem:** When you refresh a page or navigate directly to a route, you get 404.

**Solution:** The `vercel.json` file already includes rewrites to handle this. If you still have issues, verify the `vercel.json` file is in your repository root.

### Assets Not Loading

**Problem:** Images, CSS, or other assets not loading.

**Solution:** 
- Check that assets are in the `src/assets` folder
- Verify the build output includes assets in `www/assets`
- Check browser console for 404 errors

### Environment Variables

If you need to add environment variables:

1. Go to **Project Settings** → **Environment Variables**
2. Add your variables:
   - `VARIABLE_NAME` = `value`
3. Redeploy your project

---

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- ✅ Deploy when you push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Show deployment status in GitHub

### Manual Deployment

If you need to manually trigger a deployment:
1. Go to Vercel dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click **"Redeploy"**

---

## Project Structure for Vercel

```
CampusCycle/
├── vercel.json          ← Vercel configuration
├── .vercelignore        ← Files to ignore during deployment
├── package.json         ← Build scripts
├── angular.json         ← Angular build configuration
└── www/                 ← Build output (created during build)
```

---

## Important Notes

1. **Build Output:** Your app builds to the `www` directory (configured in `angular.json`)
2. **Routing:** The `vercel.json` includes SPA routing support (all routes redirect to `index.html`)
3. **Caching:** Static assets are cached for 1 year for better performance
4. **Free Tier Limits:**
   - 100GB bandwidth/month
   - Unlimited deployments
   - Perfect for personal/small projects

---

## Next Steps After Deployment

1. **Test thoroughly** on the deployed URL
2. **Share the URL** with others for testing
3. **Monitor** the Vercel dashboard for any issues
4. **Set up custom domain** if needed
5. **Configure environment variables** if your app needs them

---

## Support

If you encounter issues:
1. Check Vercel build logs
2. Test build locally first: `npm run build`
3. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
4. Check Angular deployment guide: [angular.io/guide/deployment](https://angular.io/guide/deployment)

---

**Happy Deploying! 🚀**

