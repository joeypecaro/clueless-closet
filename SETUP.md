# Clueless Closet — Phase 0 Setup Checklist

## Prerequisites

1. **Install Node.js** (v20+ recommended)
   - Download from https://nodejs.org → LTS version → Windows Installer
   - After install, open a new terminal and verify: `node --version` and `npm --version`

2. **Install dependencies**
   ```
   cd CluelessCloset
   npm install
   ```

3. **Test dev server**
   ```
   npm run dev
   ```
   Open http://localhost:5173 — you should see the three-tab shell.

---

## Supabase Setup

1. Go to https://supabase.com → New project
2. Choose a region close to you, set a database password
3. Once the project is ready:
   - Go to **Project Settings → API**
   - Copy **Project URL** and **anon/public key**
4. Copy `.env.example` to `.env` and paste those values
5. Go to **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and run it
6. Go to **Storage → New bucket**:
   - Create `item-photos` (private)
   - Create `avatars` (private)
   - The storage RLS policies are already in the schema SQL (they run on the `storage.objects` table)

---

## GitHub Setup

```
git init
git add .
git commit -m "Phase 0: project scaffold"
git remote add origin https://github.com/your-username/clueless-closet.git
git push -u origin main
```

---

## Cloudflare Pages Deployment

1. Go to https://dash.cloudflare.com → Pages → Create a project → Connect to Git
2. Select your GitHub repo
3. Settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Add environment variables (Settings → Environment variables):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. Deploy — you'll get a `*.pages.dev` URL

---

## Phase 0 Acceptance Criteria

- [ ] `npm run dev` shows the three-tab shell at localhost:5173
- [ ] All three tabs are tappable and show placeholder screens
- [ ] Supabase tables exist (`profiles`, `items`, `outfits`, `outfit_calendar`) with RLS enabled
- [ ] Deployed to a live Cloudflare Pages URL
- [ ] `.env` is in `.gitignore` (never committed)
