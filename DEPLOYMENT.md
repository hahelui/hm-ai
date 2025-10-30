# HM-AI Deployment Guide

## Deploy to GitHub Pages

### Prerequisites
- GitHub account
- Git installed locally

### Steps

1. **Create a GitHub repository**
   - Go to https://github.com/new
   - Name it `hm-ai` (or any name you prefer)
   - Don't initialize with README (we already have one)
   - Create the repository

2. **Push your code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/hm-ai.git
   git commit -m "Initial commit - PWA ready"
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click on **Settings**
   - In the left sidebar, click **Pages**
   - Under "Build and deployment":
     - Source: Select **GitHub Actions**
   - Save the settings

4. **Wait for deployment**
   - Go to the **Actions** tab in your repository
   - You should see the "Deploy to GitHub Pages" workflow running
   - Wait for it to complete (usually takes 1-2 minutes)

5. **Access your app**
   - Once deployed, your app will be available at:
     `https://YOUR_USERNAME.github.io/hm-ai/`

### Important Notes

- If your repository name is different from `hm-ai`, update the `base` in `vite.config.ts`:
  ```typescript
  export default defineConfig({
    base: '/YOUR_REPO_NAME/',
    // ... rest of config
  })
  ```

- After updating the base path, rebuild and push:
  ```bash
  npm run build
  git add .
  git commit -m "Update base path"
  git push
  ```

### Testing on Mobile

1. Open the deployed URL on your mobile browser
2. You should see an "Install App" button or browser prompt
3. Click install to add HM-AI to your home screen
4. The app will work offline after installation!

### Troubleshooting

- **404 errors**: Make sure the `base` path in `vite.config.ts` matches your repo name
- **Actions not running**: Check that GitHub Actions is enabled in repository settings
- **PWA not installing**: Make sure you're accessing via HTTPS (GitHub Pages provides this automatically)
