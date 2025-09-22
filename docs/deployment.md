# 🚀 Deployment Guide

This guide covers various deployment options for your React 19 application.

## 📦 Build for Production

```bash
# Install dependencies
pnpm install

# Build the application
pnpm build

# Preview the production build locally
pnpm preview
```

The build output will be in the `dist/` directory.

## 🌐 Deployment Platforms

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure build settings:**
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
3. **Set environment variables** in Vercel dashboard
4. **Deploy** - Vercel will automatically deploy on every push

### Netlify

1. **Connect your repository** to Netlify
2. **Configure build settings:**
   - Build Command: `pnpm build`
   - Publish Directory: `dist`
3. **Add environment variables** in Netlify dashboard
4. **Deploy**

### GitHub Pages

```bash
# Install gh-pages
pnpm add -D gh-pages

# Add to package.json scripts
"deploy": "gh-pages -d dist"

# Build and deploy
pnpm build
pnpm deploy
```

### Docker

```dockerfile
# Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### AWS S3 + CloudFront

1. **Build your app:** `pnpm build`
2. **Upload to S3 bucket** configured for static hosting
3. **Configure CloudFront** distribution
4. **Set up Route 53** for custom domain (optional)

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# .env.production
VITE_API_URL=https://your-api.com/api
VITE_APP_NAME="Your App Name"
NODE_ENV=production
```

### CI/CD Pipeline Example (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: "10.16.1"
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm build

      # Deploy to your platform of choice
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

## 🔍 Performance Optimization

### Build Optimization

- **Code splitting** is already configured with Vite
- **Tree shaking** removes unused code automatically
- **Asset optimization** compresses images and other assets

### Runtime Optimization

- **React 19 features** like concurrent rendering are enabled
- **TanStack Query** provides efficient data caching
- **Route-based code splitting** with TanStack Router

### Monitoring

Consider adding:

- **Error tracking** (Sentry, Bugsnag)
- **Analytics** (Google Analytics, Mixpanel)
- **Performance monitoring** (Web Vitals)

## 🔒 Security Checklist

- [ ] Environment variables are properly configured
- [ ] API endpoints use HTTPS
- [ ] Content Security Policy (CSP) headers
- [ ] CORS configuration on your API
- [ ] Regular dependency updates

## 📊 Performance Monitoring

Add these to your deployment:

```typescript
// src/shared/lib/monitoring.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

## 🆘 Troubleshooting

### Common Issues

**Build fails with memory error:**

```bash
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

**Environment variables not working:**

- Ensure variables start with `VITE_`
- Check they're set in your deployment platform
- Verify `.env` files are not committed to git

**Routing issues in production:**

- Configure your server for SPA routing
- Add `_redirects` file for Netlify
- Use `vercel.json` for Vercel

Need help? Check the [troubleshooting guide](README.md#troubleshooting) or open an issue.
