# FlavorForge — Humor Flavor Prompt Chain Tool

A Next.js 14 + Supabase admin tool to create, edit, and test **humor flavors** — ordered prompt chains that transform images into captions via the `api.almostcrackd.ai` REST API.

---

## Features

- 🔐 Auth-gated: only `is_superadmin` or `is_matrix_admin` users can access
- 🍦 Create / edit / delete humor flavors
- 🪜 Create / edit / delete / **drag-to-reorder** steps per flavor
- 🧪 Test a flavor by generating captions from a test image set
- 🌗 Dark / Light / System theme toggle

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USER/humor-flavor-tool.git
cd humor-flavor-tool
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_API_BASE_URL=https://api.almostcrackd.ai
```

### 3. Run the Supabase migration

In your Supabase dashboard → SQL Editor, paste and run **`supabase_migration.sql`**.

This creates:
- `humor_flavors` table
- `humor_flavor_steps` table
- RLS policies (admin-only access)
- Auto `updated_at` triggers

### 4. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Push to GitHub first, then:
vercel --prod
```

Add the same three env vars in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

**Important:** Disable "Deployment Protection" in Vercel → Settings → Deployment Protection → Off.

---

## API Auth Note

The tool sends the user's Supabase JWT as a `Bearer` token to `api.almostcrackd.ai`.  
If the API uses a different auth scheme (e.g. `x-api-key`), update `src/lib/api.ts`.

### Request shape sent to the API

```json
POST /captions/generate
Authorization: Bearer <supabase_jwt>
{
  "image_url": "https://...",
  "flavor_id": "uuid",
  "steps": ["prompt 1", "prompt 2", "prompt 3"]
}
```

---

## Project structure

```
src/
  app/
    page.tsx              ← Flavor list (home)
    login/page.tsx        ← Login page
    flavors/[id]/page.tsx ← Steps management + test runner
    globals.css
    layout.tsx
  components/
    ConfirmDialog.tsx
    Modal.tsx
    Navbar.tsx
    ThemeToggle.tsx
  lib/
    api.ts                ← almostcrackd API helper
    auth-context.tsx      ← Auth + profile state
    database.types.ts     ← TypeScript DB types
    supabase.ts           ← Supabase browser client
    theme-context.tsx     ← Dark/light/system theme
```
