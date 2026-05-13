# CorteQS Diaspora Globe - Security Checklist

## Non-Negotiable Rules

### 1. Secrets & Environment Variables
- [ ] No secrets, API keys, or tokens in source code or git history
- [ ] `.env.local` is in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used in Edge Functions (never client-side)
- [ ] `GOOGLE_MAPS_PLACES_API_KEY` is server-side only (Edge Functions)
- [ ] Google API key has HTTP referrer restrictions in Google Cloud Console
- [ ] `.env.example` documents required variables without actual values

### 2. Supabase Row Level Security (RLS)
- [ ] Every table has RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- [ ] `pins` table: public reads only approved+active pins
- [ ] `pins` table: users can only insert/update own pending pins
- [ ] `pins` table: admin full access via `is_admin()` helper
- [ ] `pin_moderation_events`: users read own pin events; admins read all
- [ ] `pin_moderation_events`: only admins can insert
- [ ] No policy grants `TO public` with write access

### 3. Admin Role Verification
- [ ] Admin detection uses JWT `app_metadata.role = 'admin'`
- [ ] `is_admin()` SQL function is `STABLE` (not volatile)
- [ ] Edge Functions verify admin via `requireAdmin()` helper
- [ ] `AdminRouteGuard` on client prevents admin UI rendering for non-admins
- [ ] Admin RPC `admin_review_pin` uses `SECURITY DEFINER`

### 4. Input Validation
- [ ] Edge Functions validate all inputs before processing
- [ ] `pinType` validated against allowlist: person, business, ngo, creator, event
- [ ] `displayName`: 2-120 chars, trimmed
- [ ] `description`: max 2000 chars
- [ ] `placeId`: non-empty string
- [ ] Autocomplete input: minimum 3 characters
- [ ] Admin review `action`: must be 'approve' or 'reject'
- [ ] Rejection requires non-empty `reason`

### 5. Rate Limiting
- [ ] Places autocomplete: 30 req/min/IP
- [ ] Place details: 15 req/min/IP
- [ ] Pin submit: 10 req/hour/user
- [ ] Admin review: 120 req/hour/admin
- [ ] Rate limit returns 429 with `rate_limited` error code

### 6. Google API Cost Control
- [ ] Autocomplete uses `(cities)` type filter
- [ ] Field masks are set (not fetching all fields)
- [ ] Minimum 3 characters before API call
- [ ] Debounced on client side (300ms)
- [ ] Session tokens used for autocomplete + details billing

### 7. Transaction Safety
- [ ] Admin review uses RPC `admin_review_pin()` for atomic pin update + event insert
- [ ] No partial state possible on review action

### 8. CORS & Headers
- [ ] CORS headers set on all Edge Function responses
- [ ] `ALLOWED_ORIGIN` env var controls allowed origins
- [ ] OPTIONS preflight handled

### 9. Client-Side Security
- [ ] No service role key in client bundle
- [ ] Auth token stored in Supabase-managed storage
- [ ] `AuthGate` protects authenticated routes
- [ ] No sensitive data logged to console in production

### 10. Build & Deployment
- [ ] `npm run build` succeeds without errors
- [ ] Build output scanned for secrets (manual TODO 080)
- [ ] Public feed query cannot return pending/rejected pins (TODO 081)
- [ ] All admin actions create audit log entries (TODO 082)
