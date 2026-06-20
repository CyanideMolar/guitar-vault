# Guitar Vault

A personal guitar collection tracker with maintenance history, drag-and-drop ordering, and AI-ready export.

**Stack:** Next.js 16 · Prisma 7 (SQLite) · NextAuth v5 · Tailwind CSS v4

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/CyanideMolar/guitar-vault.git
cd guitar-vault
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

- **AUTH_SECRET** — generate with `npx auth secret`
- **GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET** — create OAuth credentials at [Google Cloud Console](https://console.developers.google.com). Set the authorized redirect URI to `http://localhost:3000/api/auth/callback/google`
- **DATABASE_URL** — default `file:./prisma/dev.db` works as-is

### 3. Initialize the database

```bash
npx prisma migrate deploy
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Promote yourself to admin

Sign in with Google, then run:

```bash
npm run seed
```

This promotes the first user account to ADMIN, which unlocks the custom fields manager.

## Features

- Google OAuth sign-in
- Per-user guitar collection with photos and custom fields
- Drag-and-drop reordering
- Maintenance record tracking
- Markdown export for use with AI tools
