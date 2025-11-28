# Deployment Guide - Production Ready

## Quick Deploy Checklist

- [ ] Get all API keys (Neon, OpenAI, Unsplash)
- [ ] Run `npm install`
- [ ] Set up `.env` with all keys
- [ ] Run `npm run db:push` to create database tables
- [ ] Test locally with `npm run dev`
- [ ] Push to GitHub
- [ ] Deploy on Vercel
- [ ] Add environment variables in Vercel
- [ ] Test production deployment

## 1. Get API Keys

### Neon Database (Free)
1. Go to [neon.tech](https://neon.tech)
2. Sign up / Log in
3. Create new project: "identity-collage"
4. Copy connection string
5. Add to `.env` as `DATABASE_URL`

### OpenAI API
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys
4. Create new key
5. **Important**: Add $5-10 credit to account
6. Add key to `.env` as `OPENAI_API_KEY`

**Cost estimate**: ~$0.01-0.05 per collage (very affordable)

### Unsplash API (Free)
1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Register as developer
3. Create new application
4. Name: "Identity Collage Builder"
5. Copy Access Key
6. Add to `.env` as `UNSPLASH_ACCESS_KEY`

**Rate limits**: 50 requests/hour (free tier) - plenty for testing

## 2. Local Setup

```bash
# Clone and install
git clone YOUR_REPO_URL
cd activity-discovery
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your API keys

# Create database tables
npm run db:push

# Run development server
npm run dev
```

Visit http://localhost:3000

## 3. Test Locally

### Test Flow:
1. Home page loads ✓
2. Click "Let's Get Started"
3. Fill Session 1 input
4. Select template
5. Canvas builder loads
6. Add elements using tools
7. Complete challenges
8. Write About Me
9. View review page
10. Download works ✓

### Test API Endpoints:
```bash
# Test image search
curl "http://localhost:3000/api/images/search?q=heart"

# Test collage creation
curl -X POST http://localhost:3000/api/collages \
  -H "Content-Type: application/json" \
  -d '{"studentId":"test","session1Input":{...},"templateType":"grid"}'
```

## 4. Deploy to Vercel

### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add UNSPLASH_ACCESS_KEY

# Deploy to production
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. **Push to GitHub**:
```bash
git add .
git commit -m "Complete Identity Collage Builder"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables**:
   In Vercel dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL = your-neon-connection-string
   OPENAI_API_KEY = sk-your-openai-key
   UNSPLASH_ACCESS_KEY = your-unsplash-key
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait ~2-3 minutes
   - Visit your live site!

## 5. Post-Deployment

### 1. Test Production
- Visit your Vercel URL
- Complete full user flow
- Test all tools and features
- Verify API endpoints work

### 2. Set Up Custom Domain (Optional)
In Vercel Dashboard:
- Settings → Domains
- Add custom domain
- Follow DNS instructions

### 3. Monitor Usage
- **OpenAI**: Check [platform.openai.com/usage](https://platform.openai.com/usage)
- **Vercel**: Check analytics in dashboard
- **Neon**: Monitor database usage

### 4. Optimize (if needed)
- Enable Vercel Analytics
- Set up error tracking (Sentry)
- Add caching for images
- Optimize image sizes

## 6. Environment Variables Reference

```env
# Required
DATABASE_URL="postgresql://..."          # From Neon
OPENAI_API_KEY="sk-..."                  # From OpenAI
UNSPLASH_ACCESS_KEY="..."                # From Unsplash

# Optional
NEXT_PUBLIC_APP_URL="https://..."        # Your deployment URL
UPLOAD_MAX_SIZE=5242880                  # 5MB (default)
AI_CREDITS_PER_ACTIVITY=10               # Credits per session
```

## 7. Troubleshooting

### Build Errors

**Error**: "DATABASE_URL is not defined"
**Fix**: Add DATABASE_URL to Vercel environment variables

**Error**: "Module not found: Can't resolve 'fabric'"
**Fix**: Run `npm install fabric` and commit package.json

**Error**: "OpenAI API key invalid"
**Fix**: Check key is correct and has credits

### Runtime Errors

**Error**: "Failed to fetch images"
**Fix**: Check Unsplash API key and rate limits

**Error**: "Canvas not rendering"
**Fix**: Ensure `'use client'` directive in canvas component

**Error**: "Database connection failed"
**Fix**: Check Neon database is running and connection string is correct

### Performance Issues

**Slow image loading**:
- Use smaller image sizes
- Implement lazy loading
- Add caching headers

**Slow canvas rendering**:
- Limit max objects on canvas
- Optimize fabric.js settings
- Use object caching

## 8. Production Checklist

- [ ] All environment variables set
- [ ] Database tables created
- [ ] API keys have sufficient credits/quota
- [ ] Test complete user flow
- [ ] Error tracking set up
- [ ] Analytics enabled
- [ ] Custom domain configured (optional)
- [ ] README updated with live URL
- [ ] Documentation complete

## 9. Scaling Considerations

### If you get high traffic:

1. **Upgrade Neon**:
   - Free tier: 0.5 GB storage, 1 shared CPU
   - Scale plan: $19/month for more resources

2. **Upgrade OpenAI**:
   - Pay per use (very affordable)
   - Monitor usage to estimate costs

3. **Add CDN**:
   - Use Cloudinary for image hosting
   - Cache static assets

4. **Optimize Database**:
   - Add indexes to frequently queried fields
   - Implement connection pooling
   - Use read replicas

## 10. Maintenance

### Weekly:
- Check error logs in Vercel
- Monitor API usage and costs
- Review user feedback

### Monthly:
- Update dependencies: `npm update`
- Check security: `npm audit`
- Review analytics

### As Needed:
- Add new features
- Fix reported bugs
- Optimize performance

## 11. Costs Breakdown

### Free Tier (Good for testing and small use):
- Vercel: Free (Hobby plan)
- Neon: Free (0.5GB storage)
- Unsplash: Free (50 req/hour)
- OpenAI: Pay per use (~$0.01-0.05 per collage)

### Estimated Monthly Costs (100 active users):
- Vercel: $0 (Hobby) or $20 (Pro)
- Neon: $0 (Free tier sufficient)
- Unsplash: $0 (within free limits)
- OpenAI: ~$5-10 (depending on usage)

**Total**: $5-30/month for 100 users

## 12. Going Live

When ready to launch:

1. Test everything one more time
2. Set up monitoring and analytics
3. Prepare support documentation
4. Launch to small group first
5. Gather feedback
6. Iterate and improve
7. Scale to full audience

## Success! 🎉

Your Identity Collage Builder is now live and ready for students to use!

Visit your deployment at: https://your-app.vercel.app

For issues or questions, check:
- README.md for architecture
- SETUP.md for detailed setup
- API.md for API documentation
- CANVAS_GUIDE.md for canvas implementation

---

**Built with ❤️ for Ascend Now Career Exploration Platform**
