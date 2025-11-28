# Quick Start - Get Running in 5 Minutes

## Prerequisites
- Node.js 18+ installed
- A Neon account (free tier works)
- An OpenAI API key (with credit)
- An Unsplash API key (free tier works)

## 1. Install Dependencies (1 min)

```bash
npm install
```

## 2. Set Up Environment (2 min)

```bash
# Copy example file
cp .env.example .env
```

Edit `.env` and add:

```env
DATABASE_URL="your-neon-connection-string"
OPENAI_API_KEY="sk-your-key"
UNSPLASH_ACCESS_KEY="your-unsplash-key"
```

**Get these keys:**
- **Neon**: [neon.tech](https://neon.tech) → New Project → Copy connection string
- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys) → Create new key
- **Unsplash**: [unsplash.com/oauth/applications](https://unsplash.com/oauth/applications) → New App

## 3. Set Up Database (1 min)

```bash
npm run db:push
```

This creates all tables in your Neon database.

## 4. Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✅ You're Running!

### Try It Out:
1. Click "Let's Get Started!"
2. Fill in Session 1 input (themes, interests, career clusters)
3. Click "Continue"
4. Select a template
5. Click "Let's Create!" (this will show an error as builder page isn't created yet)

### What Works:
- ✅ Home page
- ✅ Session 1 input collection
- ✅ Template selection
- ❌ Canvas builder (TODO - see SETUP.md)

### Next Steps:
See `SETUP.md` for detailed build instructions.
See `README.md` for complete architecture.

## Quick Deploy to Vercel (Optional)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main

# Then go to vercel.com and import your repo
```

## Troubleshooting

**"DATABASE_URL is not defined"**
→ Check `.env` file exists and has the DATABASE_URL

**"Failed to fetch"**
→ Check API keys are valid and have credit/quota

**Styles not showing**
→ Restart dev server with `npm run dev`

## Support

Questions? Check:
1. `SETUP.md` - Detailed setup guide
2. `README.md` - Full architecture
3. Code comments in the files

Happy building! 🎨
