# 🚀 Render.com Deployment Guide

## 📋 Deployment Configuration

### 1. Render.com Service Settings

**Service Type**: Web Service
**Environment**: Node
**Plan**: Free (or higher)
**Build Command**: `npm install`
**Start Command**: `npm start`
**Health Check Path**: `/api/status`

### 2. Environment Variables

Set these environment variables in your Render dashboard:

```
NODE_ENV=production
PORT=10000
API_KEY=your_actual_whop_api_key
COMPANY_ID=your_actual_company_id
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Build Configuration

The project is configured with:
- **postinstall**: Automatically builds TypeScript to JavaScript
- **start**: Runs the compiled server
- **main**: Points to `dist/server.js`

## 🔧 Troubleshooting

### Issue: "Cannot find module '/opt/render/project/src/run'"

**Cause**: Render is trying to run `node run dev` instead of `npm start`

**Solution**: 
1. Make sure the Start Command is set to `npm start` (not `node run dev`)
2. Verify the package.json scripts are correct
3. Check that the main entry point is set to `dist/server.js`

### Issue: TypeScript compilation errors

**Solution**:
1. Ensure all dependencies are installed
2. Check that TypeScript files compile without errors
3. Verify the `postinstall` script runs `npm run build`

### Issue: Environment variables not loading

**Solution**:
1. Set all required environment variables in Render dashboard
2. Verify the config.ts file reads from process.env
3. Check that dotenv is properly configured

## 📁 Required Files

Make sure these files are in your repository:

```
backend/
├── package.json          # With correct scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── server.ts         # Main server file
│   ├── config.ts         # Environment configuration
│   └── ...               # Other source files
├── dist/                 # Built files (created during deployment)
└── render.yaml           # Render configuration (optional)
```

## 🔍 Health Check

The service includes a health check endpoint:
- **URL**: `https://your-service.onrender.com/api/status`
- **Response**: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

## 🌐 CORS Configuration

For production, update the CORS origin:
```typescript
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📊 Monitoring

Monitor your deployment:
1. Check Render dashboard for build logs
2. Use the health check endpoint
3. Monitor environment variables
4. Check application logs

## 🚀 Deployment Steps

1. **Push to GitHub**: Ensure all changes are committed
2. **Connect to Render**: Link your GitHub repository
3. **Configure Service**: Set build and start commands
4. **Set Environment Variables**: Add all required variables
5. **Deploy**: Render will automatically build and deploy
6. **Test**: Verify the API endpoints work

## 🔗 API Endpoints

After successful deployment, your API will be available at:
- Health Check: `GET /api/status`
- Generate Report: `POST /api/generate-report`
- Complete Workflow: `POST /api/complete-workflow`
- Track Checkout Links: `POST /api/track-checkout-links`
- Download Files: `GET /api/download/:filename`

## 📝 Notes

- The free plan has limitations (sleep after inactivity)
- Consider upgrading to a paid plan for production use
- Monitor your API usage and Whop API limits
- Keep your API keys secure and never commit them to git
