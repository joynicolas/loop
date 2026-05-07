# Loop Setup Guide

## 1. Supabase Setup

### Create a Supabase project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project (free tier is fine)
4. Copy your **Project URL** and **Anon Key** from Settings → API
5. Paste them into `config.js`

### Create database tables

Run these SQL queries in Supabase SQL editor:

```sql
-- Create entries table
create table entries (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create responses table
create table responses (
  id bigint primary key generated always as identity,
  entry_id bigint not null references entries(id) on delete cascade,
  response text not null,
  created_at timestamp default now()
);

-- Enable RLS for security
alter table entries enable row level security;
alter table responses enable row level security;

-- RLS policies
create policy "Users can see their own entries"
  on entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entries"
  on entries for insert
  with check (auth.uid() = user_id);

create policy "Users can see responses for their entries"
  on responses for select
  using (
    entry_id in (
      select id from entries where user_id = auth.uid()
    )
  );

create policy "Users can insert responses for their entries"
  on responses for insert
  with check (
    entry_id in (
      select id from entries where user_id = auth.uid()
    )
  );
```

### Enable Google OAuth

1. In Supabase, go to **Authentication → Providers**
2. Click **Google**
3. Follow the steps to create a Google OAuth app:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Desktop app)
   - Authorized redirect URIs: `https://YOUR_SUPABASE_URL/auth/v1/callback`
4. Copy your Google Client ID and Secret into Supabase

## 2. Claude API Setup

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Get your API key from **Account → API Keys**
3. Paste it into `config.js` as `CLAUDE_API_KEY`
4. You're on Claude Pro, so you have plenty of tokens

## 3. Deploy to GitHub Pages

### Option A: Simple (no build)
1. Create a new GitHub repo called `loop`
2. Push these files to the `main` branch:
   - `index.html`
   - `config.js`
3. Go to repo **Settings → Pages**
4. Set source to `main` branch
5. Your site is live at `https://YOUR_USERNAME.github.io/loop/`

### Option B: Use your existing setup
If you already have a deploy workflow (like with GuestChat), just add Loop to that same repo or create a new one.

## 4. Local Testing

```bash
# Start a local server
python -m http.server 8000

# Visit http://localhost:8000
```

## Security Notes

- **Never commit `config.js` with real keys** — add it to `.gitignore`
- Supabase RLS policies protect user data (see SQL above)
- Claude API calls happen client-side (careful with rate limits on free tier)
- Consider moving Claude calls to a backend later if scaling

## What's Working

✅ Google OAuth login  
✅ Write entries, get AI responses (streamed line-by-line)  
✅ Save entries + responses to Supabase  
✅ View past entries  
✅ Mobile responsive  

## Next Steps (if you want)

- Add mood tracking / pattern analysis
- Save response drafts before submit
- Search past entries
- Export as PDF
- Custom tone/personality for AI

---

**Questions?** Check the browser console for errors.
