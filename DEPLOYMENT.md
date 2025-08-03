# Deployment Guide for Vercel

## Prerequisites

1. **Supabase Project**: Already set up with your credentials
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub

## Environment Variables

The following environment variables are already configured in `vercel.json`:

```
VITE_SUPABASE_URL=https://ueoyqnnlpdjdmhkxyuik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlb3lxbm5scGRqZG1oa3h5dWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTA3ODAsImV4cCI6MjA2OTgyNjc4MH0.sc5U33ZUGbnfN99fWM1UgsXxFoJnHOQlfC0lZu-BiCM
```

## Database Setup

1. **Run the database setup script**:
   ```bash
   npm run setup:db
   ```

2. **Or manually create tables** in your Supabase SQL Editor:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `supabase-config.md`

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

### Option 2: Deploy via GitHub Integration

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration

3. **Configure Build Settings**:
   - Build Command: `npm run build:frontend`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your app

## Project Structure for Deployment

```
fangJiFang/
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── supabase.ts    # Supabase configuration
│   │   │   └── api.ts         # API functions
│   │   └── ...
│   └── index.html
├── package.json
├── vite.config.ts
├── vercel.json
└── setup-database.js
```

## Post-Deployment

1. **Test your application** at the provided Vercel URL
2. **Set up custom domain** (optional) in Vercel dashboard
3. **Monitor performance** using Vercel Analytics

## Troubleshooting

- **Build errors**: Check the build logs in Vercel dashboard
- **Environment variables**: Ensure they're set in Vercel project settings
- **Database connection**: Verify Supabase credentials and table setup
- **CORS issues**: Supabase handles CORS automatically

## Local Development

```bash
npm run dev:frontend
```

The app will be available at `http://localhost:5173` 