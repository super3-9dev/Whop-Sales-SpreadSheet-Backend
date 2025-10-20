# 🚀 Render.com Deployment Checklist

## ❌ Current Issue
**Error**: `Cannot find module '/opt/render/project/src/run'`
**Cause**: Render is trying to run `node run dev` instead of `npm start`

## ✅ Solution Steps

### 1. Render Service Configuration

**In your Render dashboard, set these values:**

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/api/status` |
| **Environment** | `Node` |
| **Plan** | `Free` (or higher) |

### 2. Environment Variables

**Add these environment variables in Render:**

```
NODE_ENV=production
PORT=10000
API_KEY=your_actual_whop_api_key_here
COMPANY_ID=your_actual_company_id_here
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. GitHub Repository

**Ensure these files are in your repository:**

✅ `package.json` - With correct scripts
✅ `tsconfig.json` - TypeScript configuration  
✅ `src/server.ts` - Main server file
✅ `src/config.ts` - Environment configuration
✅ `dist/` folder - Will be created during build
✅ `render.yaml` - Optional Render configuration

### 4. Build Process

**The deployment will:**
1. Run `npm install` (build command)
2. Run `npm run postinstall` (builds TypeScript)
3. Run `npm start` (starts the server)

## 🔧 Troubleshooting Commands

### If deployment still fails, try these Start Commands:

1. **Primary**: `npm start`
2. **Fallback**: `npm run start:fallback`
3. **Alternative**: `node dist/server.js`

### Verify Build Locally:

```bash
cd backend
npm install
npm run build
npm start
```

## 📊 Health Check

**Test your deployment:**
- URL: `https://your-service.onrender.com/api/status`
- Expected response: `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}`

## 🌐 CORS Configuration

**For production frontend integration:**
- Update `CORS_ORIGIN` environment variable
- Set to your frontend domain (e.g., `https://your-frontend.vercel.app`)

## 🔍 Common Issues & Solutions

### Issue 1: "Cannot find module"
**Solution**: Ensure Start Command is `npm start`, not `node run dev`

### Issue 2: TypeScript compilation errors
**Solution**: Check that all dependencies are installed and TypeScript compiles

### Issue 3: Environment variables not loading
**Solution**: Verify all required variables are set in Render dashboard

### Issue 4: Port binding issues
**Solution**: Ensure PORT environment variable is set to `10000`

## 📝 Deployment Steps

1. **Commit all changes** to your GitHub repository
2. **Update Render service** with correct Start Command
3. **Set environment variables** in Render dashboard
4. **Trigger deployment** (manual or automatic)
5. **Monitor build logs** for any errors
6. **Test health check** endpoint
7. **Verify API endpoints** work correctly

## 🎯 Expected Result

After successful deployment:
- ✅ Service starts without errors
- ✅ Health check returns 200 OK
- ✅ API endpoints respond correctly
- ✅ Frontend can connect to backend
- ✅ Environment variables load properly

## 📞 Support

If issues persist:
1. Check Render build logs
2. Verify GitHub repository contents
3. Test locally first
4. Contact Render support if needed

---

**Remember**: The key fix is changing the Start Command from `node run dev` to `npm start` in your Render service configuration!
