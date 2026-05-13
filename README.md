# CorteQS Diaspora Globe

Interactive 3D globe showing diaspora community pins worldwide. Built with React, Three.js, and Supabase.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Three.js
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: Supabase PostgreSQL with RLS
- **Maps**: Google Places API (New)
- **Testing**: Vitest (unit), Playwright (E2E)

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Supabase CLI (`npx supabase`)

### 1. Clone and install

```bash
git clone <repo-url>
cd corteqs-globe-3
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key (public) |
| `VITE_SENTRY_DSN` | Optional Sentry DSN |

### 3. Supabase

```bash
# Initialize (if not already)
npx supabase init

# Link to remote project
npx supabase link --project-ref <project-ref>

# Run migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

### 4. Edge Functions secrets

Set these in Supabase Dashboard or via CLI:

```bash
npx supabase secrets set GOOGLE_MAPS_PLACES_API_KEY=<key>
npx supabase secrets set SUPABASE_URL=<url>
npx supabase secrets set SUPABASE_ANON_KEY=<key>
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>
npx supabase secrets set ALLOWED_ORIGIN=<origin>
```

### 5. Textures

Place earth texture files in `public/textures/earth/`:
- `earth-day.jpg` — Earth daytime texture
- `earth-clouds.png` — Cloud layer (optional, transparent)

## Development

```bash
npm run dev          # Start dev server
npm run build        # TypeScript check + production build
npm run preview      # Preview production build
```

## Testing

```bash
npm test             # Run unit tests (Vitest)
npm run test:watch   # Watch mode
npm run test:e2e     # Run E2E tests (Playwright)
```

## Project Structure

```
src/
├── app/              # App shell, routing
├── components/ui/    # Shared UI components
├── features/
│   ├── admin/        # Admin pin review
│   ├── auth/         # Login, session management
│   ├── globe/        # 3D globe, pin overlay
│   ├── pins/         # Pin submission, my pins
│   └── places/       # Autocomplete, place search
├── lib/              # Env, Supabase client, validators, errors
└── styles/           # Global CSS

supabase/
├── functions/        # Edge Functions (Deno)
│   ├── _shared/      # CORS, auth, validators, rate limiting
│   ├── admin-pins/
│   ├── admin-pins-review/
│   ├── pins-submit/
│   ├── place-details/
│   └── places-autocomplete/
└── migrations/       # SQL migrations

tests/
├── unit/             # Vitest unit tests
└── e2e/              # Playwright E2E tests
```

## Deploy

1. Push code to repository
2. Deploy Edge Functions: `npx supabase functions deploy <name>`
3. Deploy frontend to Vercel/Netlify/Cloudflare Pages
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in hosting provider
5. Verify `SECURITY_CHECKLIST.md` items

### Vercel

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SENTRY_DSN` (optional)

This repo includes a `vercel.json` rewrite so client-side routes like `/login` and `/admin/pins` resolve to `index.html`.

## Admin Setup

To make a user an admin, set their JWT `app_metadata.role` to `"admin"` via Supabase SQL:

```sql
update auth.users
set raw_app_meta_data = jsonb_set(coalesce(raw_app_meta_data, '{}'), '{role}', '"admin"')
where email = 'admin@example.com';
```
