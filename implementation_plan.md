# Supabase Auth + Developer Profile — CF Analyzer

## Overview

Add formal authentication and a developer profile system to CF Analyzer using **Supabase** as the backend-as-a-service. Users will Sign Up / Log In via Supabase Auth (email + password), and their personal profile (name, age, education, etc.) will be stored in a Supabase Postgres table. The entire UI will follow the existing **terminal/cyberpunk** design system (`#00ff41` neon green on dark).

---

## User Review Required

> [!IMPORTANT]
> You **must** complete two manual steps before this plan can be executed:
> 1. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
> 2. **Run the SQL below** in your Supabase project's SQL Editor to create the `developer_profiles` table.
> 3. Copy your **Project URL** and **anon/public API key** from `Settings → API` — you'll paste them as environment variables.

### SQL to run in Supabase SQL Editor

```sql
-- Enable Row Level Security on auth.users (already on by default)

-- Create developer profiles table
CREATE TABLE public.developer_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  age          INT  CHECK (age >= 13 AND age <= 120),
  education    TEXT,
  institution  TEXT,
  bio          TEXT,
  cf_handle    TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: each user can only see and edit their own profile
ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.developer_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.developer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.developer_profiles FOR UPDATE
  USING (auth.uid() = id);
```

> [!WARNING]
> Do **NOT** use your Supabase **service_role** key in the frontend. Only use the **anon/public** key. Row Level Security (RLS) enforces data isolation.

---

## Proposed Changes

### Install Supabase JS Client

```
npm install @supabase/supabase-js
```
to be run inside `/client`.

---

### Auth & Profile Infrastructure

#### [NEW] `client/src/lib/supabaseClient.js`
Singleton Supabase client initialized with project URL + anon key from environment variables.

#### [NEW] `client/.env`
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
(Added to `.gitignore` — will remind you.)

#### [NEW] `client/src/context/AuthContext.jsx`
React context that:
- Wraps the whole app
- Exposes `user`, `session`, `loading`, `signIn()`, `signUp()`, `signOut()` helpers
- Listens to `supabase.auth.onAuthStateChange`

---

### Pages

#### [NEW] `client/src/pages/Login.jsx`
Terminal-styled login page with:
- Email + Password fields using existing `.input-field` class
- Tabs to switch between **Login** and **Sign Up**
- On Sign Up: extra fields for `full_name`, `age`, `education`, `institution`
- After sign up, auto-inserts a row into `developer_profiles`
- Error display inline in terminal style

#### [NEW] `client/src/pages/Profile.jsx`
Protected profile page at `/profile`:
- Displays logged-in user's info from `developer_profiles`
- Inline edit mode to update fields
- Shows linked CF handle (pre-fills the sidebar search)
- Sign Out button

---

### Updated Files

#### [MODIFY] `client/src/App.jsx`
- Wrap routes in `AuthProvider`
- Add `/login` route → `<Login />`
- Add `/profile` route → `<Profile />` (protected, redirects to `/login` if not authenticated)
- All other routes remain accessible without login (app still works for anonymous CF analysis)

#### [MODIFY] `client/src/components/Navbar.jsx`
- Add a **Profile** nav item at the bottom (`◉ Profile` → `/profile`) when logged in
- When logged out, show **Login** button at bottom instead
- Shows user's `full_name` or email in the sidebar footer when logged in

#### [MODIFY] `client/.gitignore` (or create if missing)
- Add `.env` to prevent accidental commit of Supabase keys

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Should all app routes be **protected** (require login to view any page), or should login be **optional** (users can still use CF analysis without an account)?
> 
> *Current plan: optional — auth is additive, app works without it.*

> [!IMPORTANT]
> **Q2:** Do you need **Google / GitHub OAuth** login in addition to email+password, or email+password only for now?
>
> *Current plan: email+password only.*

---

## Verification Plan

### Automated
- Install `@supabase/supabase-js` with no errors
- `npm run dev` starts without errors

### Manual
1. Navigate to `/login` → Sign Up with a new account → confirm profile row appears in Supabase dashboard
2. Log out → log back in → profile data loads correctly
3. Navbar shows user info when logged in, Login button when logged out
4. Attempt to access Supabase DB as another user → RLS blocks it
