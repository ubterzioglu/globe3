# CorteQS Diaspora Globe – Sıfırdan Üretim Hazır Implementasyon Dokümanı

> Bu doküman, mevcut araştırma raporunu uygulamaya çevirmek için hazırlanmıştır. Amaç, agent veya geliştiricinin projeyi baştan sona küçük, kontrollü, doğrulanabilir adımlarla implemente edebilmesidir.

---

## 0. Dokümanın Kullanım Şekli

Bu dosya iki parçadan oluşur:

1. **Ürün ve teknik spesifikasyon**  
   Hangi sistemin kurulacağı, hangi mimari kararların değişmeyeceği, veri modeli, API sözleşmeleri, güvenlik kuralları ve kabul kriterleri.

2. **Agent dostu küçük implementasyon todo paketleri**  
   Her todo tek bir küçük işi hedefler. Agent aynı anda büyük resmi çözmeye çalışmamalı; sırayla bir todo almalı, sadece belirtilen dosyaları değiştirmeli, sonra test/acceptance kontrolünü yapmalıdır.

Bu doküman bir düzeltme dokümanı değildir. Hedef, mevcut prototipi patchlemek değil; **aynı ürün fikrini üretim hazır şekilde sıfırdan yeniden kurmaktır**.

---

## 1. Hedef Sistem Özeti

CorteQS Diaspora Globe, global Türk diasporası için şehir bazlı pinlerin gösterildiği interaktif bir dünya/globe uygulamasıdır.

Kullanıcı akışı:

1. Kullanıcı uygulamaya girer.
2. Public globe üzerinde yalnızca onaylanmış ve aktif pinleri görür.
3. Kullanıcı giriş yaparsa kendi pinini ekleyebilir.
4. Pin eklerken şehir arar ve Google Places API New üzerinden şehir seçer.
5. Kullanıcının seçtiği şehir bilgisi backend tarafından yeniden doğrulanır.
6. Pin `pending` olarak kaydedilir.
7. Admin panelde pin incelenir.
8. Admin onaylarsa pin public globe üzerinde görünür.
9. Admin reddederse pin public görünmez ve kullanıcı kendi pin listesinde durumu görebilir.

Sistemin temel kuralı:

> Pin konumu şehir düzeyinde tutulur. Sokak, açık adres, bina veya hassas konum tutulmaz.

---

## 2. Kesin Mimari Kararlar

Aşağıdaki kararlar implementasyon boyunca değiştirilmeyecek ana kurallardır.

| Alan | Karar |
|---|---|
| Frontend | React + Vite + TypeScript |
| Globe | Three.js tabanlı globe + HTML/CSS overlay pin yaklaşımı |
| Auth | Supabase Auth |
| DB | Supabase Postgres |
| RLS | Tüm kritik tablolarda aktif |
| Yer arama | Google Places API New Autocomplete |
| Yer doğrulama | Google Places API New Place Details |
| Google API Key | Sadece backend/Edge Function tarafında |
| Pin seviyesi | City-level |
| Submit | Doğrudan DB insert yok; `pins-submit` Edge Function üzerinden |
| Moderasyon | `pending`, `approved`, `rejected` status modeli |
| Public feed | Sadece `approved` + `is_active = true` kayıtları |
| Admin rolü | Supabase Auth `app_metadata.role = admin` üzerinden |
| Realtime | İlk sürümde Postgres Changes; ileride Broadcast opsiyonel |
| Medya | İlk sürümde opsiyonel; Storage için mimari hazır bırakılır |

---

## 3. Uygulamanın İlk Sürüm Kapsamı

### 3.1 Mutlaka yapılacaklar

- Vite + React + TypeScript proje iskeleti
- Supabase client kurulumu
- Auth gate
- Login/logout akışı
- Public globe sayfası
- Approved pinleri Supabase’den çekme
- Google Places proxy Edge Function
- Place Details proxy Edge Function
- Pin submit Edge Function
- `pins` tablosu
- `pin_moderation_events` tablosu
- RLS policy’leri
- Kullanıcının kendi pinlerini görebildiği sayfa
- Admin pending pin listesi
- Admin approve/reject işlemi
- Basic realtime refresh veya kontrollü refetch
- Unit/integration/E2E test altyapısı
- Güvenlik checklist’i

### 3.2 İlk sürümde opsiyonel bırakılabilecekler

- Pin medya upload
- Logo/fotoğraf moderasyonu
- Gelişmiş filtreleme
- Gelişmiş analytics dashboard
- Sentry entegrasyonu
- Google budget alert kurulumu
- Broadcast tabanlı realtime mimari
- `place_id` refresh cron job

Bu opsiyonel işler için kod yapısı hazır bırakılabilir ama MVP tesliminin önünü kesmemelidir.

---

## 4. Non-Negotiable Güvenlik Kuralları

Bu kurallar ihlal edilirse implementasyon yanlış kabul edilir.

1. Google Places API key hiçbir zaman frontend bundle içinde bulunmayacak.
2. Google Places API key hiçbir zaman `VITE_` prefix’i ile tanımlanmayacak.
3. Supabase service role veya secret key frontend’de kullanılmayacak.
4. Kullanıcıdan gelen `lat`, `lng`, `city`, `country`, `countryCode` değerleri güvenilir kabul edilmeyecek.
5. Submit sırasında place verisi server-side Place Details ile yeniden doğrulanacak.
6. Public globe pending veya rejected pin göstermeyecek.
7. Normal kullanıcı başka kullanıcının pending pinini göremeyecek.
8. Admin endpoint’leri normal authenticated user’a kapalı olacak.
9. RLS kapatılarak çözüm üretilmeyecek.
10. Field mask `*` olarak kullanılmayacak.
11. Autocomplete minimum 3 karakterden önce çalışmayacak.
12. Autocomplete debounce uygulanmadan her keypress’te request atmayacak.
13. Admin approve/reject işlemi audit log oluşturacak.

---

## 5. Hedef Dosya Yapısı

```txt
corteqs-diaspora-globe/
  package.json
  vite.config.ts
  tsconfig.json
  .env.example
  .gitignore

  public/
    textures/
      earth/
        earth-day.jpg
        earth-clouds.png
        earth-night.jpg optional
        starfield.jpg optional

  src/
    main.tsx
    app/
      App.tsx
      router.tsx
      routes.ts

    lib/
      env.ts
      supabase.ts
      database.types.ts
      errors.ts
      validators.ts
      format.ts

    features/
      auth/
        AuthGate.tsx
        LoginPage.tsx
        useSession.ts
        authApi.ts

      places/
        types.ts
        api.ts
        usePlaceAutocomplete.ts
        usePlaceDetails.ts
        PlaceAutocomplete.tsx
        PlaceSuggestionList.tsx
        placeUiState.ts

      pins/
        types.ts
        api.ts
        PinForm.tsx
        AddPinModal.tsx
        MyPinsPage.tsx
        MyPinsList.tsx
        PinStatusBadge.tsx

      admin/
        adminApi.ts
        AdminRouteGuard.tsx
        AdminPinsPage.tsx
        AdminPinsTable.tsx
        ReviewDrawer.tsx

      globe/
        GlobePage.tsx
        GlobeScene.tsx
        GlobeOverlayLayer.tsx
        GlobePin.tsx
        useApprovedPins.ts
        useGlobeController.ts
        geometry.ts
        flyTo.ts
        globeTypes.ts

    components/
      ui/
        Button.tsx
        Input.tsx
        Select.tsx
        Modal.tsx
        Badge.tsx
        Spinner.tsx
        EmptyState.tsx
        ErrorBox.tsx

    styles/
      globals.css

  supabase/
    config.toml
    migrations/
      001_base.sql
      002_storage_optional.sql
      003_idempotency_optional.sql

    functions/
      _shared/
        cors.ts
        json.ts
        auth.ts
        errors.ts
        rateLimit.ts
        googlePlaces.ts
        normalizePlace.ts
        validators.ts

      places-autocomplete/
        index.ts

      place-details/
        index.ts

      pins-submit/
        index.ts

      admin-pins/
        index.ts

      admin-pins-review/
        index.ts

  tests/
    unit/
      normalizePlace.test.ts
      geometry.test.ts
      validators.test.ts

    e2e/
      auth.spec.ts
      pin-submit.spec.ts
      admin-review.spec.ts
      public-globe.spec.ts
```

---

## 6. Environment Değişkenleri

### 6.1 Browser tarafı

Sadece public değerler `VITE_` prefix’i ile kullanılabilir.

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_ENV=local
```

### 6.2 Supabase Edge Functions tarafı

```env
GOOGLE_MAPS_PLACES_API_KEY=
ALLOWED_ORIGIN=http://localhost:5173
```

Supabase managed ortamda şu değerler platform tarafından sağlanır veya secret olarak tanımlanır:

```env
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEYS=
SUPABASE_SECRET_KEYS=
SUPABASE_JWKS=
```

### 6.3 `.env.example`

Projeye şu örnek dosya eklenecek:

```env
# Browser / Vite
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
VITE_APP_ENV=local

# Do not put secrets here with VITE_ prefix.
# GOOGLE_MAPS_PLACES_API_KEY must be configured only for Supabase Edge Functions.
```

---

## 7. Veritabanı Modeli

### 7.1 `pins` tablosu

Amaç: Kullanıcıların şehir bazlı pinlerini tutmak.

Alanlar:

- Kim oluşturdu?
- Pin tipi nedir?
- Kullanıcı görünen adı/başlığı nedir?
- Hangi Google place ID’ye bağlı?
- Normalize şehir/ülke bilgisi nedir?
- Koordinatlar nedir?
- Moderasyon durumu nedir?
- Ne zaman onaylandı/reddedildi?

### 7.2 `pin_moderation_events` tablosu

Amaç: Moderasyon geçmişini audit edilebilir şekilde tutmak.

Event örnekleri:

- `submitted`
- `approved`
- `rejected`
- `reopened`
- `place_refreshed`

### 7.3 Ana migration

```sql
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

create table if not exists public.pins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  pin_type text not null check (pin_type in ('person', 'business', 'ngo', 'creator', 'event')),
  display_name text not null check (char_length(trim(display_name)) between 2 and 120),
  description text null check (description is null or char_length(description) <= 2000),

  place_id text not null,
  place_resource_name text not null,
  formatted_address text null,
  short_formatted_address text null,

  city text not null,
  region text null,
  country text not null,
  country_code text null check (country_code is null or char_length(country_code) = 2),

  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),

  google_types text[] not null default '{}',

  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  is_active boolean not null default true,

  reviewed_by uuid null references auth.users(id) on delete set null,
  reviewed_at timestamptz null,
  rejection_reason text null check (rejection_reason is null or char_length(rejection_reason) <= 1000),

  place_refreshed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pin_moderation_events (
  id uuid primary key default gen_random_uuid(),
  pin_id uuid not null references public.pins(id) on delete cascade,
  actor_user_id uuid null references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('submitted', 'approved', 'rejected', 'reopened', 'place_refreshed')),
  reason text null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_pins_public_feed
  on public.pins (created_at desc)
  where status = 'approved' and is_active = true;

create index if not exists idx_pins_status_created
  on public.pins (status, created_at desc);

create index if not exists idx_pins_user_id
  on public.pins (user_id, created_at desc);

create index if not exists idx_pins_place_id
  on public.pins (place_id);

create index if not exists idx_pins_country_city
  on public.pins (country_code, city);

create index if not exists idx_pin_moderation_events_pin_id
  on public.pin_moderation_events (pin_id, created_at desc);

drop trigger if exists trg_pins_set_updated_at on public.pins;
create trigger trg_pins_set_updated_at
before update on public.pins
for each row
execute function public.set_updated_at();

alter table public.pins enable row level security;
alter table public.pin_moderation_events enable row level security;

create policy "public_read_approved_pins"
on public.pins
for select
to anon, authenticated
using (status = 'approved' and is_active = true);

create policy "user_read_own_pins"
on public.pins
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_insert_own_pending_pins"
on public.pins
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
);

create policy "user_update_own_pending_pins"
on public.pins
for update
to authenticated
using (auth.uid() = user_id and status = 'pending')
with check (auth.uid() = user_id and status = 'pending');

create policy "admin_full_access_pins"
on public.pins
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "user_read_related_moderation_events"
on public.pin_moderation_events
for select
to authenticated
using (
  exists (
    select 1
    from public.pins p
    where p.id = pin_id
      and (p.user_id = auth.uid() or public.is_admin())
  )
);

create policy "admin_insert_moderation_events"
on public.pin_moderation_events
for insert
to authenticated
with check (public.is_admin());

create policy "admin_read_all_moderation_events"
on public.pin_moderation_events
for select
to authenticated
using (public.is_admin());

alter publication supabase_realtime add table public.pins;
```

### 7.4 Optional idempotency migration

Bu migration ikinci fazda eklenebilir.

```sql
create table if not exists public.request_idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  endpoint text not null,
  response_body jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint, idempotency_key)
);

alter table public.request_idempotency_keys enable row level security;

create policy "admin_full_access_idempotency"
on public.request_idempotency_keys
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());
```

---

## 8. Normalized Place Modeli

Frontend ve backend arasında taşınacak normalize model:

```ts
export type NormalizedPlace = {
  provider: 'google_places_new'
  placeId: string
  resourceName: string
  label: string
  city: string
  region: string | null
  country: string
  countryCode: string | null
  formattedAddress: string | null
  shortFormattedAddress: string | null
  lat: number
  lng: number
  viewport: {
    north: number
    south: number
    east: number
    west: number
  } | null
  types: string[]
  refreshedAt: string
}
```

Normalizer kuralları:

```txt
city:
  1. locality
  2. postal_town
  3. administrative_area_level_3

region:
  1. administrative_area_level_1

country:
  1. country.longText

countryCode:
  1. country.shortText

label:
  city + ', ' + country
```

Önemli not: Address component sırası sabit kabul edilmeyecek. Her zaman `types[]` üzerinden aranacak.

---

## 9. Google Places API Kullanımı

### 9.1 Autocomplete endpoint

Backend function adı:

```txt
places-autocomplete
```

Google çağrısı:

```txt
POST https://places.googleapis.com/v1/places:autocomplete
```

Kurallar:

- `input.length < 3` ise 400 döndür.
- `includedPrimaryTypes: ['(cities)']` kullan.
- `includeQueryPredictions: false` kullan.
- `sessionToken` zorunlu olmasa da frontend her arama oturumu için göndermeli.
- Response normalize edilerek frontend’e sade model dönmeli.
- Google key sadece function içinde kullanılmalı.

Request:

```json
{
  "input": "ber",
  "sessionToken": "uuid-v4-token",
  "languageCode": "tr",
  "regionCode": "DE",
  "includedRegionCodes": ["DE", "TR", "NL"]
}
```

Response:

```json
{
  "suggestions": [
    {
      "placeId": "ChIJAVkDPzdOqEcRcDteW0YgIQQ",
      "label": "Berlin, Germany",
      "primaryText": "Berlin",
      "secondaryText": "Germany",
      "types": ["locality", "political"],
      "sessionToken": "uuid-v4-token"
    }
  ]
}
```

### 9.2 Place Details endpoint

Backend function adı:

```txt
place-details
```

Google çağrısı:

```txt
GET https://places.googleapis.com/v1/places/{placeId}
```

Field mask:

```txt
id,name,formattedAddress,shortFormattedAddress,addressComponents,location,viewport,types
```

Kurallar:

- `X-Goog-FieldMask` olmadan çağrı yapılmayacak.
- `displayName` ilk sürümde istenmeyecek.
- `*` mask kullanılmayacak.
- Details response normalize edilecek.
- Şehir düzeyi normalize edilemiyorsa 422 dönecek.

Request body veya query:

```json
{
  "placeId": "ChIJAVkDPzdOqEcRcDteW0YgIQQ",
  "sessionToken": "uuid-v4-token",
  "languageCode": "tr",
  "regionCode": "DE"
}
```

Response:

```json
{
  "place": {
    "provider": "google_places_new",
    "placeId": "ChIJAVkDPzdOqEcRcDteW0YgIQQ",
    "resourceName": "places/ChIJAVkDPzdOqEcRcDteW0YgIQQ",
    "label": "Berlin, Germany",
    "city": "Berlin",
    "region": "Berlin",
    "country": "Germany",
    "countryCode": "DE",
    "formattedAddress": "Berlin, Germany",
    "shortFormattedAddress": "Berlin",
    "lat": 52.52,
    "lng": 13.405,
    "viewport": null,
    "types": ["locality", "political"],
    "refreshedAt": "2026-05-13T00:00:00.000Z"
  }
}
```

---

## 10. Edge Function API Sözleşmeleri

### 10.1 Ortak response formatı

Başarı:

```json
{
  "data": {},
  "error": null
}
```

Hata:

```json
{
  "data": null,
  "error": {
    "code": "validation_error",
    "message": "Readable short message"
  }
}
```

### 10.2 Ortak hata kodları

| HTTP | Code | Anlam |
|---:|---|---|
| 400 | `invalid_body` | JSON veya şema hatalı |
| 400 | `validation_error` | Alan validasyonu geçmedi |
| 401 | `unauthenticated` | Login yok veya token geçersiz |
| 403 | `forbidden` | Yetki yok |
| 404 | `not_found` | Kayıt yok |
| 409 | `conflict` | Çakışma |
| 422 | `place_not_city_level` | Place şehir olarak normalize edilemedi |
| 429 | `rate_limited` | Limit aşıldı |
| 502 | `google_upstream_error` | Google kaynaklı hata |
| 500 | `internal_error` | Beklenmeyen hata |

### 10.3 `pins-submit`

Endpoint:

```txt
POST /functions/v1/pins-submit
```

Auth:

```txt
Authorization: Bearer <access_token>
```

Request:

```json
{
  "pinType": "person",
  "displayName": "Umut",
  "description": "Berlin diaspora network",
  "placeId": "ChIJAVkDPzdOqEcRcDteW0YgIQQ",
  "sessionToken": "uuid-v4-token",
  "languageCode": "tr",
  "regionCode": "DE"
}
```

Backend davranışı:

1. JWT kontrol edilir.
2. `auth.getUser()` ile user alınır.
3. Body validate edilir.
4. Place Details çağrılır.
5. Place normalize edilir.
6. `pins` tablosuna `pending` kayıt insert edilir.
7. `pin_moderation_events` tablosuna `submitted` event insert edilir.
8. Yeni pin döndürülür.

Response:

```json
{
  "data": {
    "pin": {
      "id": "uuid",
      "pinType": "person",
      "displayName": "Umut",
      "city": "Berlin",
      "country": "Germany",
      "countryCode": "DE",
      "lat": 52.52,
      "lng": 13.405,
      "status": "pending",
      "isActive": true,
      "createdAt": "2026-05-13T00:00:00.000Z"
    }
  },
  "error": null
}
```

### 10.4 `admin-pins`

Endpoint:

```txt
GET /functions/v1/admin-pins?status=pending&limit=50&cursor=...
```

Auth:

- Authenticated user gerekli.
- `app_metadata.role = admin` gerekli.

Response:

```json
{
  "data": {
    "items": [],
    "nextCursor": null
  },
  "error": null
}
```

### 10.5 `admin-pins-review`

Endpoint:

```txt
POST /functions/v1/admin-pins-review
```

Request:

```json
{
  "pinId": "uuid",
  "action": "approve",
  "reason": null
}
```

Approve davranışı:

- `pins.status = approved`
- `reviewed_by = admin user id`
- `reviewed_at = now()`
- `rejection_reason = null`
- moderation event: `approved`

Reject davranışı:

- `pins.status = rejected`
- `reviewed_by = admin user id`
- `reviewed_at = now()`
- `rejection_reason = reason`
- moderation event: `rejected`

---

## 11. Frontend Kullanıcı Deneyimi

### 11.1 Public Globe

Public kullanıcı şunları görebilir:

- Globe
- Approved public pinler
- Pin tooltip/card
- Login/register CTA
- Şehir arama sadece görsel navigation için gerekiyorsa public olabilir; pin submit için login şarttır.

Public globe query:

```ts
const { data, error } = await supabase
  .from('pins')
  .select('id, pin_type, display_name, city, country, country_code, lat, lng, created_at')
  .eq('status', 'approved')
  .eq('is_active', true)
  .order('created_at', { ascending: false })
```

### 11.2 Login sonrası kullanıcı

Authenticated kullanıcı şunları yapabilir:

- Pin ekleme modalını açar.
- Şehir arar.
- Şehir seçer.
- Pin tipini seçer.
- Display name girer.
- Opsiyonel description girer.
- Submit eder.
- Kendi pinlerini `pending`, `approved`, `rejected` statüleriyle görür.

### 11.3 Admin

Admin şunları yapabilir:

- Pending pinleri listeler.
- Pin detayını açar.
- Şehir/ülke/koordinat bilgisini görür.
- User/display bilgilerini görür.
- Approve eder.
- Reject eder ve reason girer.
- Geçmiş moderation event’lerini görür.

---

## 12. Globe Entegrasyonu

### 12.1 Değişmeyecek yaklaşım

- Three.js globe korunabilir.
- Pinler HTML overlay olarak render edilebilir.
- CSS animasyonları ve tooltip yapısı korunabilir.
- `latLngTo3D` matematiği korunabilir.

### 12.2 Değişecek yaklaşım

Eski prototipteki static yapı kaldırılacak:

```ts
PINS
CITIES
flyTo(query)
```

Yerine dynamic yapı gelecek:

```ts
approvedPinsFromSupabase
flyToCoords({ lat, lng })
```

### 12.3 Geometry helper

```ts
import * as THREE from 'three'

export function latLngTo3D(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = lng * (Math.PI / 180)

  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.cos(theta)
  )
}

export function targetRotationFromLatLng(lat: number, lng: number) {
  return {
    targetY: -lng * (Math.PI / 180),
    targetX: -lat * (Math.PI / 180) * 0.4,
  }
}
```

### 12.4 Fly-to API

```ts
export type FlyToCoordsInput = {
  lat: number
  lng: number
  zoom?: number
  durationMs?: number
}

export function flyToCoords(input: FlyToCoordsInput): void {
  // Implement in globe controller.
}
```


### 12.5 Globe görsel tasarım hedefi

Globe yalnızca teknik bir harita bileşeni gibi görünmemelidir. Hedef görünüm, referans görseldeki gibi **uzaktan bakılan gerçekçi Dünya** hissidir: siyah/koyu uzay arka planı, gerçekçi kıta ve okyanus dokusu, bulut katmanı, yumuşak ışık ve hafif atmosfer parlaması.

Görsel hedef:

- Dünya, ekranın merkezinde büyük ama taşmayan bir 3D küre olarak görünür.
- Arka plan siyah veya çok koyu lacivert/siyah olur.
- Dünya yüzeyinde gerçekçi okyanus, kıta ve bulut dokusu bulunur.
- Görünüm flat map, çizgi harita veya çocuk çizimi gibi olmamalıdır.
- İlk açılışta kullanıcı uzaydan Dünya’ya bakıyormuş gibi hissetmelidir.
- Kamera çok yakında olmamalı; Dünya’nın tamamı veya büyük kısmı görünmelidir.
- Atmosfer glow efekti abartısız olmalıdır.
- Pinler Dünya’yı boğmayacak kadar küçük, parlak ve modern olmalıdır.
- Pinler şehir seviyesinde konumlanır; sokak/bina seviyesi hassasiyet hissi verilmez.
- Hover/focus sırasında küçük bilgi kartı açılır.
- Arama sonucunda şehir seçilince globe yumuşak animasyonla ilgili koordinata döner.
- Mobilde globe, arama alanı ve CTA alanları birbirini kapatmamalıdır.

### 12.6 Globe materyal ve ışık standardı

İlk sürümde önerilen Three.js kompozisyonu:

```txt
Scene
- WebGLRenderer alpha=false, antialias=true
- PerspectiveCamera, Dünya tamamı görünecek uzaklıkta
- SphereGeometry for earth
- MeshPhongMaterial veya MeshStandardMaterial
- Earth day texture
- Opsiyonel cloud layer: biraz daha büyük yarıçaplı transparent sphere
- AmbientLight düşük yoğunluk
- DirectionalLight güneş etkisi için tek yönden
- Atmosphere glow: back-side transparent sphere veya shader-lite yaklaşımı
- Dark background: solid black veya düşük yoğunluklu starfield
```

Texture kuralı:

- Texture dosyaları hotlink edilmemelidir.
- Kullanılacak görseller `public/textures/earth/` altında tutulmalıdır.
- Lisansı açık veya proje için kullanılabilir görseller tercih edilmelidir.
- Texture yoksa fallback olarak koyu mavi/yeşil basit material kullanılabilir ama TODO acceptance için gerçekçi texture hedeflenmelidir.

Önerilen dosyalar:

```txt
public/textures/earth/earth-day.jpg
public/textures/earth/earth-clouds.png
public/textures/earth/earth-night.jpg optional
public/textures/earth/starfield.jpg optional
```

### 12.7 Pin görsel standardı

Pinler modern network ürünü hissi vermelidir.

Pin davranışı:

- Normal durumda küçük glowing dot veya minimal marker.
- Hover durumunda biraz büyür ve soft shadow/glow artar.
- Tıklanınca veya hover edilince bilgi kartı açılır.
- Bilgi kartında minimum bilgiler görünür: display name, pin type, city, country.
- Çok fazla pin varsa overlap azaltmak için küçük boyut korunur.
- Arkada kalan pinler görünmez.

Pinlerde kaçınılacaklar:

- Aşırı büyük emoji marker.
- Google Maps klasik kırmızı pin görünümü.
- Globe’u kapatan büyük kartlar.
- Sürekli zıplayan rahatsız edici animasyon.
- Çok parlak neon kalabalığı.

### 12.8 İlk ekran kompozisyonu

İlk açılışta hedef kompozisyon:

```txt
- Sol/üst veya üst merkez: CorteQS başlık/CTA alanı.
- Merkez: gerçekçi 3D Dünya.
- Sağ/alt veya alt bölüm: pin ekleme/login CTA alanı.
- Arama alanı globe’u kapatmayacak şekilde konumlanır.
- Globe ana kahraman görseldir; UI globe’un önüne geçmez.
```

Referans görseldeki ana his korunmalıdır: kullanıcı ekranda karanlık fon üzerinde gerçekçi, uzaktan görünen, parlak ve bulutlu bir Dünya görmelidir.

---

## 13. Realtime Stratejisi

İlk sürümde basit tutulacak.

Public globe:

- `pins` tablosundaki değişiklikleri dinler.
- Approved + active pin değişikliği geldiğinde feed refetch eder.
- Incremental update ilk sürümde zorunlu değildir.

Pseudo:

```ts
useEffect(() => {
  const channel = supabase
    .channel('public-approved-pins')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pins' },
      () => refetch()
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [refetch])
```

Not: Büyüme sonrası Broadcast tabanlı özel public event modeli tercih edilebilir.

---

## 14. Rate Limiting ve Maliyet Kontrolü

İlk sürümde basit ve güvenli limitler:

| Endpoint | Limit |
|---|---:|
| `places-autocomplete` | 30 request / dakika / IP veya user |
| `place-details` | 15 request / dakika / IP veya user |
| `pins-submit` | 10 request / saat / user |
| `admin-pins-review` | 120 request / saat / admin |

Frontend maliyet kuralları:

- Minimum 3 karakter.
- 300 ms debounce.
- Her arama oturumu için yeni UUID session token.
- Şehir seçildikten sonra details çağrısı yapılır.
- Yeni arama başlarsa yeni token üretilir.

Backend maliyet kuralları:

- `includedPrimaryTypes = ['(cities)']`
- `includeQueryPredictions = false`
- Place Details field mask minimum tutulur.
- `displayName` istenmez.
- Autocomplete response kalıcı cache edilmez.
- Details response kalıcı cache edilmez.
- `place_id` saklanabilir.

---

## 15. Test Stratejisi

### 15.1 Unit testler

- `normalizeGooglePlace`
- Address component fallback
- Geçersiz city normalization
- `latLngTo3D`
- `targetRotationFromLatLng`
- Form validation
- Error mapper

### 15.2 Integration testler

- Supabase local migration çalışıyor mu?
- RLS normal user için doğru mu?
- RLS admin için doğru mu?
- `pins-submit` mocked Google response ile insert yapıyor mu?
- Submit sonrası moderation event oluşuyor mu?
- Admin approve/reject DB’yi doğru güncelliyor mu?

### 15.3 E2E testler

- Kullanıcı login olur.
- Şehir arar.
- Şehir seçer.
- Pin submit eder.
- Pin `pending` olarak kendi listesinde görünür.
- Public globe’da görünmez.
- Admin login olur.
- Pending pin’i onaylar.
- Public globe’da görünür.
- Admin reddederse public globe’da görünmez.

---

## 16. Windows PowerShell Komutları

### 16.1 Kurulum

```powershell
npm install
```

### 16.2 Supabase local başlatma

```powershell
npx supabase start
```

### 16.3 DB reset

```powershell
npx supabase db reset
```

### 16.4 Type generation

```powershell
npx supabase gen types typescript --local > src/lib/database.types.ts
```

### 16.5 Frontend dev server

```powershell
npm run dev
```

### 16.6 Unit test

```powershell
npm run test
```

### 16.7 E2E test

```powershell
npx playwright test
```

### 16.8 Build

```powershell
npm run build
```

### 16.9 Edge Function deploy

```powershell
npx supabase functions deploy places-autocomplete
npx supabase functions deploy place-details
npx supabase functions deploy pins-submit
npx supabase functions deploy admin-pins
npx supabase functions deploy admin-pins-review
```

---

# 17. Agent Dostu Küçük Implementasyon Todo Paketleri

Bu bölüm implementasyon için kullanılacak ana bölümdür.

Kurallar:

- Her todo tek başına yapılabilir olmalı.
- Aynı anda birden fazla todo yapılmamalı.
- Todo’da yazmayan dosyalar değiştirilmemeli.
- Her todo sonunda acceptance maddeleri kontrol edilmeli.
- Büyük refactor yapılmamalı.
- Test kırılırsa aynı todo içinde düzeltmeden sonraki todo’ya geçilmemeli.

---

## Faz 1 — Proje İskeleti

### TODO 001 — Vite React TypeScript projesini doğrula

**Amaç:** Proje temel olarak çalışıyor mu kontrol et.

**Dosyalar:**

- `package.json`
- `vite.config.ts`
- `tsconfig.json`

**Adımlar:**

1. Projede Vite + React + TypeScript kurulu mu kontrol et.
2. Yoksa Vite React TS template ile başlat.
3. `npm install` çalıştır.
4. `npm run dev` komutunun ayağa kalktığını doğrula.

**Acceptance:**

- Dev server açılıyor.
- TypeScript compile hatası yok.
- Boş app render oluyor.

---

### TODO 002 — Temel klasör yapısını oluştur

**Amaç:** Hedef klasör yapısını oluşturmak.

**Dosyalar/Klasörler:**

- `src/app/`
- `src/lib/`
- `src/features/`
- `src/components/ui/`
- `src/styles/`

**Adımlar:**

1. Boş klasörleri oluştur.
2. Her ana feature için placeholder dosya ekleme; sadece klasör oluştur.
3. Var olan app yapısını bozma.

**Acceptance:**

- Klasörler oluştu.
- Uygulama hala build oluyor.

---

### TODO 003 — Global CSS dosyasını bağla

**Amaç:** Uygulama genel stil dosyasını hazırla.

**Dosyalar:**

- `src/styles/globals.css`
- `src/main.tsx`

**Adımlar:**

1. `globals.css` dosyası oluştur.
2. Basit CSS reset ekle.
3. `main.tsx` içinde import et.

**Acceptance:**

- CSS import hatası yok.
- App render oluyor.

---

### TODO 004 — App shell oluştur

**Amaç:** Uygulamanın temel layout’unu hazırlamak.

**Dosyalar:**

- `src/app/App.tsx`
- `src/main.tsx`

**Adımlar:**

1. `App.tsx` oluştur.
2. Basit header + main layout render et.
3. `main.tsx` içinde `App` import et.

**Acceptance:**

- Header görünüyor.
- Sayfa hata vermiyor.

---

### TODO 005 — Routing altyapısını ekle

**Amaç:** Sayfalar arası geçiş için router eklemek.

**Dosyalar:**

- `src/app/router.tsx`
- `src/app/routes.ts`
- `src/app/App.tsx`

**Adımlar:**

1. `react-router-dom` kurulu değilse kur.
2. Route sabitlerini `routes.ts` içine koy.
3. `/`, `/login`, `/my-pins`, `/admin/pins` route’larını tanımla.
4. Şimdilik placeholder component kullan.

**Acceptance:**

- URL değişince placeholder sayfa değişiyor.
- Build hatası yok.

---

## Faz 2 — Environment ve Supabase Client

### TODO 006 — Env parser oluştur

**Amaç:** Frontend env değerlerini tek yerden okumak.

**Dosyalar:**

- `src/lib/env.ts`
- `.env.example`

**Adımlar:**

1. `VITE_SUPABASE_URL` oku.
2. `VITE_SUPABASE_PUBLISHABLE_KEY` oku.
3. Eksikse readable error throw et.
4. `.env.example` ekle.

**Acceptance:**

- Env eksikse net hata veriyor.
- Env varsa app açılıyor.

---

### TODO 007 — Supabase client oluştur

**Amaç:** Browser tarafı Supabase client’ı merkezi hale getirmek.

**Dosyalar:**

- `src/lib/supabase.ts`
- `src/lib/env.ts`

**Adımlar:**

1. `@supabase/supabase-js` kurulu değilse kur.
2. `createClient` ile client oluştur.
3. Sadece publishable key kullan.
4. Default export yerine named export kullan.

**Acceptance:**

- `supabase` import edilebiliyor.
- Secret key kullanılmıyor.

---

### TODO 008 — Database types placeholder ekle

**Amaç:** Type generation öncesi import hatalarını önlemek.

**Dosyalar:**

- `src/lib/database.types.ts`

**Adımlar:**

1. Placeholder `Database` type oluştur.
2. Sonra Supabase CLI ile overwrite edileceğini yorumda belirt.

**Acceptance:**

- Type import hatası yok.
- Build geçiyor.

---

## Faz 3 — Supabase Migration

### TODO 009 — Supabase klasörünü başlat

**Amaç:** Supabase local yapısını oluşturmak.

**Dosyalar:**

- `supabase/config.toml`

**Adımlar:**

1. `npx supabase init` çalıştır.
2. Oluşan config’i kontrol et.
3. Gereksiz değişiklik yapma.

**Acceptance:**

- `supabase` klasörü oluştu.
- `npx supabase start` çalışıyor.

---

### TODO 010 — Base migration dosyasını ekle

**Amaç:** DB tablolarını oluşturmak.

**Dosyalar:**

- `supabase/migrations/001_base.sql`

**Adımlar:**

1. Bu dokümandaki ana migration’ı dosyaya koy.
2. SQL syntax kontrolü yap.
3. Migration içinde destructive işlem kullanma.

**Acceptance:**

- `npx supabase db reset` başarılı.
- `pins` tablosu oluşuyor.
- `pin_moderation_events` tablosu oluşuyor.

---

### TODO 011 — RLS policy smoke test yap

**Amaç:** RLS policy’lerinin temel davranışını kontrol etmek.

**Dosyalar:**

- Sadece test script veya manuel SQL notu.

**Adımlar:**

1. Local Supabase Studio’da tablo policy’lerini kontrol et.
2. Public select policy’nin sadece approved + active okuttuğunu doğrula.
3. User own pins policy’nin user_id şartı içerdiğini doğrula.
4. Admin policy’nin `public.is_admin()` kullandığını doğrula.

**Acceptance:**

- RLS açık.
- Policy adları doğru.
- Public pending pin okuyamıyor.

---

### TODO 012 — Type generation yap

**Amaç:** DB type’larını frontend’e aktarmak.

**Dosyalar:**

- `src/lib/database.types.ts`

**Adımlar:**

1. Supabase local çalışır durumda olsun.
2. PowerShell komutunu çalıştır:

```powershell
npx supabase gen types typescript --local > src/lib/database.types.ts
```

3. Build al.

**Acceptance:**

- `database.types.ts` gerçek tiplerle dolu.
- Build geçiyor.

---

## Faz 4 — Ortak UI Componentleri

### TODO 013 — Button component ekle

**Amaç:** Basit reusable button.

**Dosyalar:**

- `src/components/ui/Button.tsx`

**Adımlar:**

1. `type`, `disabled`, `onClick`, `children` destekle.
2. `variant` olarak `primary`, `secondary`, `danger` destekle.
3. Basit className merge desteği ekle.

**Acceptance:**

- Button render oluyor.
- Disabled state çalışıyor.

---

### TODO 014 — Input component ekle

**Amaç:** Reusable input.

**Dosyalar:**

- `src/components/ui/Input.tsx`

**Adımlar:**

1. Native input props extend et.
2. `label` ve `error` prop’u ekle.
3. Accessible `id`/`htmlFor` ilişkisi kur.

**Acceptance:**

- Label input’a bağlı.
- Error metni görünüyor.

---

### TODO 015 — Select component ekle

**Amaç:** Pin type seçimi için reusable select.

**Dosyalar:**

- `src/components/ui/Select.tsx`

**Adımlar:**

1. `options` prop’u al.
2. `label`, `error` destekle.
3. Native select kullan.

**Acceptance:**

- Option seçilebiliyor.
- Error state gösteriliyor.

---

### TODO 016 — Modal component ekle

**Amaç:** Add pin modal altyapısı.

**Dosyalar:**

- `src/components/ui/Modal.tsx`

**Adımlar:**

1. `open`, `title`, `onClose`, `children` destekle.
2. ESC ile kapanma ekle.
3. Backdrop click ile kapanma ekle.
4. Basit accessibility role ekle.

**Acceptance:**

- Modal açılıp kapanıyor.
- ESC çalışıyor.

---

### TODO 017 — Badge, Spinner, EmptyState, ErrorBox ekle

**Amaç:** Liste ve durum ekranlarını sade tutmak.

**Dosyalar:**

- `src/components/ui/Badge.tsx`
- `src/components/ui/Spinner.tsx`
- `src/components/ui/EmptyState.tsx`
- `src/components/ui/ErrorBox.tsx`

**Adımlar:**

1. Her component’i basit ve bağımsız yaz.
2. Props minimal olsun.
3. Başka feature bağımlılığı ekleme.

**Acceptance:**

- Componentler import edilebiliyor.
- Build geçiyor.

---

## Faz 5 — Auth

### TODO 018 — Session hook oluştur

**Amaç:** Supabase auth session durumunu merkezi yönetmek.

**Dosyalar:**

- `src/features/auth/useSession.ts`

**Adımlar:**

1. Current session’ı yükle.
2. `onAuthStateChange` ile değişiklikleri dinle.
3. `session`, `user`, `loading` döndür.
4. Cleanup yap.

**Acceptance:**

- İlk yüklemede loading var.
- Login/logout sonrası state değişiyor.

---

### TODO 019 — LoginPage oluştur

**Amaç:** Basit Supabase magic link veya email/password login ekranı.

**Dosyalar:**

- `src/features/auth/LoginPage.tsx`
- `src/features/auth/authApi.ts`

**Adımlar:**

1. Email input ekle.
2. İlk sürüm için magic link yeterli.
3. Submit loading/error state ekle.
4. Başarı mesajı göster.

**Acceptance:**

- Email gönderme çağrısı yapılıyor.
- Hata gösteriliyor.

---

### TODO 020 — AuthGate oluştur

**Amaç:** Private route koruması.

**Dosyalar:**

- `src/features/auth/AuthGate.tsx`

**Adımlar:**

1. `useSession` kullan.
2. Loading ekranı göster.
3. User yoksa `/login` yönlendir.
4. User varsa children render et.

**Acceptance:**

- Login olmayan `/my-pins` göremiyor.
- Login olan sayfayı görüyor.

---

### TODO 021 — Header login/logout durumu ekle

**Amaç:** Kullanıcı durumunu UI’da göstermek.

**Dosyalar:**

- `src/app/App.tsx`
- `src/features/auth/useSession.ts`

**Adımlar:**

1. Header’da login/my pins linkleri göster.
2. User varsa logout button göster.
3. Logout Supabase üzerinden çalışsın.

**Acceptance:**

- Login durumuna göre header değişiyor.
- Logout çalışıyor.

---

## Faz 6 — Places Types ve Frontend API

### TODO 022 — Places type dosyasını oluştur

**Amaç:** Places response tiplerini tanımlamak.

**Dosyalar:**

- `src/features/places/types.ts`

**Adımlar:**

1. `PlaceSuggestion` type ekle.
2. `NormalizedPlace` type ekle.
3. API error type ekle.

**Acceptance:**

- Type dosyası başka dosyalardan import edilebiliyor.

---

### TODO 023 — Places frontend API wrapper oluştur

**Amaç:** Supabase functions çağrılarını tek yerde toplamak.

**Dosyalar:**

- `src/features/places/api.ts`

**Adımlar:**

1. `fetchPlaceSuggestions(input, sessionToken)` fonksiyonu yaz.
2. `fetchPlaceDetails(placeId, sessionToken)` fonksiyonu yaz.
3. Supabase `functions.invoke` kullan.
4. Hata formatını normalize et.

**Acceptance:**

- API fonksiyonları typed response döndürüyor.
- UI doğrudan `supabase.functions.invoke` çağırmıyor.

---

### TODO 024 — Debounced autocomplete hook oluştur

**Amaç:** Autocomplete state yönetimi.

**Dosyalar:**

- `src/features/places/usePlaceAutocomplete.ts`

**Adımlar:**

1. `query` state al veya hook içinde yönet.
2. Minimum 3 karakter kuralı uygula.
3. 300ms debounce ekle.
4. Loading/error/items state döndür.
5. Query değişince mevcut request sonucu geç gelirse eski sonucu ezmemeli.

**Acceptance:**

- 2 karakterde request atmıyor.
- 3 karakterde debounce sonrası request atıyor.
- Loading state çalışıyor.

---

### TODO 025 — Place details hook oluştur

**Amaç:** Seçilen suggestion için details çekmek.

**Dosyalar:**

- `src/features/places/usePlaceDetails.ts`

**Adımlar:**

1. `loadDetails(placeId, sessionToken)` fonksiyonu döndür.
2. Loading/error state tut.
3. Başarılı response `NormalizedPlace` döndürsün.

**Acceptance:**

- Details manuel tetikleniyor.
- Hata state’i gösterilebilir.

---

### TODO 026 — PlaceSuggestionList component ekle

**Amaç:** Suggestion dropdown listesini ayırmak.

**Dosyalar:**

- `src/features/places/PlaceSuggestionList.tsx`

**Adımlar:**

1. Items prop’u al.
2. Active index prop’u al.
3. `onSelect` callback al.
4. Empty state component içinde değil parent’ta kalsın.

**Acceptance:**

- Liste render oluyor.
- Tıklayınca `onSelect` çağrılıyor.

---

### TODO 027 — PlaceAutocomplete component ekle

**Amaç:** Şehir arama UI’ını tamamlamak.

**Dosyalar:**

- `src/features/places/PlaceAutocomplete.tsx`

**Adımlar:**

1. Input render et.
2. `usePlaceAutocomplete` kullan.
3. `sessionToken` state’i oluştur.
4. Selection sonrası `usePlaceDetails` ile place çek.
5. Başarılı selection sonrası `onSelect(place)` çağır.
6. Selection sonrası yeni session token üret.
7. Keyboard navigation ekle: ArrowDown, ArrowUp, Enter, Escape.

**Acceptance:**

- Şehir yazınca suggestions geliyor.
- Klavye ile seçilebiliyor.
- Seçim sonrası normalized place parent’a dönüyor.

---

## Faz 7 — Edge Function Ortak Altyapı

### TODO 028 — CORS helper oluştur

**Amaç:** Edge Function CORS tekrarını azaltmak.

**Dosyalar:**

- `supabase/functions/_shared/cors.ts`

**Adımlar:**

1. `corsHeaders` export et.
2. `OPTIONS` response helper ekle.
3. `ALLOWED_ORIGIN` env desteği ekle.

**Acceptance:**

- Function dosyaları helper’ı import edebiliyor.

---

### TODO 029 — JSON response helper oluştur

**Amaç:** Response formatını standartlaştırmak.

**Dosyalar:**

- `supabase/functions/_shared/json.ts`

**Adımlar:**

1. `jsonOk(status, data)` ekle.
2. `jsonError(status, code, message)` ekle.
3. Header’lara CORS + JSON ekle.

**Acceptance:**

- Her response aynı formatta üretilebiliyor.

---

### TODO 030 — Auth helper oluştur

**Amaç:** Edge Function user/admin kontrolünü standartlaştırmak.

**Dosyalar:**

- `supabase/functions/_shared/auth.ts`

**Adımlar:**

1. Request’ten Authorization header oku.
2. Supabase client oluştur.
3. `auth.getUser()` ile user döndür.
4. `requireUser()` helper yaz.
5. `requireAdmin()` helper yaz.

**Acceptance:**

- User yoksa 401 üretilebiliyor.
- Admin olmayan user için 403 üretilebiliyor.

---

### TODO 031 — Edge validator helper oluştur

**Amaç:** Body validasyonunu merkezi hale getirmek.

**Dosyalar:**

- `supabase/functions/_shared/validators.ts`

**Adımlar:**

1. `validatePinType` yaz.
2. `validateDisplayName` yaz.
3. `validateDescription` yaz.
4. `validatePlaceId` yaz.
5. `safeJson(req)` yaz.

**Acceptance:**

- Geçersiz input için net hata üretilebiliyor.

---

### TODO 032 — Google Places client helper oluştur

**Amaç:** Google API çağrılarını merkezi yapmak.

**Dosyalar:**

- `supabase/functions/_shared/googlePlaces.ts`

**Adımlar:**

1. API key’i `Deno.env.get` ile oku.
2. `autocompletePlaces(input, options)` yaz.
3. `getPlaceDetails(placeId, options)` yaz.
4. Field mask’i constant olarak tut.
5. Upstream hata mapping’i yap.

**Acceptance:**

- Google key eksikse readable error.
- Field mask sabit ve minimum.

---

### TODO 033 — Place normalizer helper oluştur

**Amaç:** Google response’u normalize etmek.

**Dosyalar:**

- `supabase/functions/_shared/normalizePlace.ts`

**Adımlar:**

1. `pickComponent` helper yaz.
2. `normalizeGooglePlace` yaz.
3. `locality`, `postal_town`, `administrative_area_level_3` fallback uygula.
4. Country yoksa error throw et.
5. Location yoksa error throw et.

**Acceptance:**

- Berlin benzeri şehir normalize oluyor.
- City olmayan response 422’ye map edilebilir hata veriyor.

---

## Faz 8 — Places Edge Functions

### TODO 034 — `places-autocomplete` function oluştur

**Amaç:** Frontend autocomplete çağrısını Google’a proxy etmek.

**Dosyalar:**

- `supabase/functions/places-autocomplete/index.ts`

**Adımlar:**

1. Sadece POST kabul et.
2. OPTIONS CORS döndür.
3. Body parse et.
4. `input.length < 3` ise 400 dön.
5. Google helper ile autocomplete çağır.
6. Suggestions normalize et.
7. Response döndür.

**Acceptance:**

- 2 karakterde 400 dönüyor.
- 3 karakterde Google helper çağrılıyor.
- Google key response’a sızmıyor.

---

### TODO 035 — `place-details` function oluştur

**Amaç:** Place ID’den normalized place üretmek.

**Dosyalar:**

- `supabase/functions/place-details/index.ts`

**Adımlar:**

1. POST kabul et.
2. Body’den `placeId`, `sessionToken`, `languageCode`, `regionCode` oku.
3. Place ID validate et.
4. Google details çağır.
5. Normalize et.
6. Response döndür.

**Acceptance:**

- Geçersiz placeId 400.
- Normalize edilemeyen place 422.
- Başarılı response `place` döndürüyor.

---

### TODO 036 — Function local smoke test yap

**Amaç:** Edge functions lokal çalışıyor mu kontrol etmek.

**Dosyalar:**

- Değişiklik yok veya küçük not dosyası.

**Adımlar:**

1. Supabase local functions serve çalıştır.
2. `places-autocomplete` için 2 karakter test et.
3. Valid input test et.
4. `place-details` için fake/invalid ID test et.

**Acceptance:**

- CORS response var.
- Error format standart.
- Secret loglanmıyor.

---

## Faz 9 — Pin Submit Backend

### TODO 037 — `pins-submit` function oluştur

**Amaç:** Authenticated pin submit endpoint’i.

**Dosyalar:**

- `supabase/functions/pins-submit/index.ts`

**Adımlar:**

1. POST kabul et.
2. Auth required yap.
3. Body validate et.
4. Place Details çağır.
5. Normalize place.
6. `pins` tablosuna insert et.
7. `pin_moderation_events` içine submitted event insert et.
8. Response döndür.

**Acceptance:**

- Auth yoksa 401.
- Geçersiz body 400.
- Başarılı submit `pending` pin oluşturuyor.
- Moderation event oluşuyor.

---

### TODO 038 — Pin submit error mapping’i düzelt

**Amaç:** Backend hatalarını frontend’in anlayacağı hale getirmek.

**Dosyalar:**

- `supabase/functions/pins-submit/index.ts`
- `supabase/functions/_shared/errors.ts`

**Adımlar:**

1. Google 404 → `place_not_found`.
2. Normalize error → `place_not_city_level`.
3. DB insert error → `db_insert_failed`.
4. Unknown error → `internal_error`.

**Acceptance:**

- Her hata `{ data: null, error: { code, message } }` formatında.

---

### TODO 039 — Pins submit manuel test

**Amaç:** Gerçek veya mocked place ile submit davranışını doğrulamak.

**Dosyalar:**

- Kod değişikliği gerekmez.

**Adımlar:**

1. Login olmuş user token al.
2. `pins-submit` çağır.
3. DB’de pin var mı kontrol et.
4. Moderation event var mı kontrol et.

**Acceptance:**

- Pin status `pending`.
- `user_id` doğru.
- Event type `submitted`.

---

## Faz 10 — Pins Frontend

### TODO 040 — Pin type dosyasını oluştur

**Amaç:** Frontend pin tiplerini tanımlamak.

**Dosyalar:**

- `src/features/pins/types.ts`

**Adımlar:**

1. `PinType` union ekle.
2. `PinStatus` union ekle.
3. `PinFormValues` type ekle.
4. `PinListItem` type ekle.

**Acceptance:**

- Types compile oluyor.

---

### TODO 041 — Pins API wrapper oluştur

**Amaç:** Pin submit ve list query’lerini merkezi yapmak.

**Dosyalar:**

- `src/features/pins/api.ts`

**Adımlar:**

1. `submitPin(values)` yaz.
2. `fetchMyPins()` yaz.
3. `fetchApprovedPins()` şimdilik burada veya globe feature’da yazılabilir.
4. Error normalize et.

**Acceptance:**

- UI doğrudan raw Supabase çağrısı yapmıyor.
- Submit function typed response döndürüyor.

---

### TODO 042 — PinStatusBadge oluştur

**Amaç:** Pin durumlarını kullanıcı dostu göstermek.

**Dosyalar:**

- `src/features/pins/PinStatusBadge.tsx`

**Adımlar:**

1. `pending`, `approved`, `rejected` destekle.
2. Türkçe label kullan.
3. UI Badge component’i kullan.

**Acceptance:**

- Her status farklı label ile görünüyor.

---

### TODO 043 — PinForm oluştur

**Amaç:** Pin ekleme formunu yapmak.

**Dosyalar:**

- `src/features/pins/PinForm.tsx`

**Adımlar:**

1. `pinType` select ekle.
2. `displayName` input ekle.
3. `description` textarea ekle.
4. `PlaceAutocomplete` ekle.
5. Seçilen place özetini göster.
6. Submit button ekle.
7. Basic validation yap.

**Acceptance:**

- Place seçilmeden submit olmuyor.
- Display name 2 karakter altı kabul edilmiyor.

---

### TODO 044 — AddPinModal oluştur

**Amaç:** PinForm’u modal içinde kullanmak.

**Dosyalar:**

- `src/features/pins/AddPinModal.tsx`

**Adımlar:**

1. Modal component kullan.
2. PinForm’u render et.
3. Submit başarılı olursa modal kapat.
4. Parent’a `onCreated` callback çağır.

**Acceptance:**

- Modal açılıp kapanıyor.
- Submit sonrası başarı state’i var.

---

### TODO 045 — MyPinsList oluştur

**Amaç:** Kullanıcının pinlerini listelemek.

**Dosyalar:**

- `src/features/pins/MyPinsList.tsx`

**Adımlar:**

1. Pin listesi prop al.
2. Display name, city, country göster.
3. Status badge göster.
4. Rejected ise rejection reason göster.

**Acceptance:**

- Empty state var.
- Pending/approved/rejected görünüyor.

---

### TODO 046 — MyPinsPage oluştur

**Amaç:** Kullanıcının pin yönetim sayfası.

**Dosyalar:**

- `src/features/pins/MyPinsPage.tsx`
- `src/app/router.tsx`

**Adımlar:**

1. AuthGate ile koru.
2. `fetchMyPins` çağır.
3. Loading/error/empty state ekle.
4. AddPinModal açma button’u ekle.
5. Pin create sonrası listeyi refetch et.

**Acceptance:**

- Login olmayan erişemiyor.
- Login olan kendi pinlerini görüyor.
- Yeni submit sonrası pending pin listede görünüyor.

---

## Faz 11 — Globe Frontend

### TODO 047 — Globe type dosyasını oluştur

**Amaç:** Globe pin tiplerini tanımlamak.

**Dosyalar:**

- `src/features/globe/globeTypes.ts`

**Adımlar:**

1. `GlobePinItem` type ekle.
2. `FlyToCoordsInput` type ekle.
3. `GlobeController` type ekle.

**Acceptance:**

- Types compile oluyor.

---

### TODO 048 — Geometry helper ekle

**Amaç:** Lat/lng to 3D hesaplarını izole etmek.

**Dosyalar:**

- `src/features/globe/geometry.ts`

**Adımlar:**

1. `latLngTo3D` ekle.
2. `targetRotationFromLatLng` ekle.
3. Basit input guard ekle.

**Acceptance:**

- Unit test yazılabilir hale geldi.
- Three.js import hatası yok.

---

### TODO 049 — Approved pins hook oluştur

**Amaç:** Public globe pinlerini çekmek.

**Dosyalar:**

- `src/features/globe/useApprovedPins.ts`

**Adımlar:**

1. Supabase’den approved + active pinleri çek.
2. Loading/error/data state döndür.
3. `refetch` fonksiyonu döndür.

**Acceptance:**

- Pending pinler dönmüyor.
- Approved active pinler dönüyor.

---

### TODO 050 — GlobeScene placeholder oluştur

**Amaç:** Three.js scene için kontrollü başlangıç.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`

**Adımlar:**

1. Container div render et.
2. Props olarak `pins` al.
3. Şimdilik pin sayısını debug text olarak göster.
4. Three.js setup sonraki todo’ya bırak.

**Acceptance:**

- Component render oluyor.
- Props compile oluyor.

---

### TODO 051 — Three.js globe temelini kur

**Amaç:** Globe canvas/render temelini oluşturmak.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`

**Adımlar:**

1. Scene/camera/renderer kur.
2. Sphere mesh ekle.
3. Animation loop ekle.
4. Cleanup ekle.
5. Resize handler ekle.

**Acceptance:**

- Globe görünüyor.
- Component unmount olunca cleanup yapıyor.


---

### TODO 051A — Globe texture klasörünü hazırla

**Amaç:** Gerçekçi Dünya görünümü için texture asset yerini netleştirmek.

**Dosyalar:**

- `public/textures/earth/.gitkeep`
- `public/textures/earth/README.md`

**Adımlar:**

1. `public/textures/earth/` klasörünü oluştur.
2. README içine beklenen texture dosya adlarını yaz.
3. Hotlink kullanılmayacağını belirt.
4. Lisansı açık texture kullanılması gerektiğini belirt.

**Acceptance:**

- Texture klasörü repo içinde mevcut.
- README hangi dosyaların beklendiğini açıklıyor.

---

### TODO 051B — Globe görsel sabitlerini oluştur

**Amaç:** Kamera, radius, texture path ve visual değerlerini tek yerde toplamak.

**Dosyalar:**

- `src/features/globe/globeVisualConfig.ts`

**Adımlar:**

1. `EARTH_RADIUS` sabiti ekle.
2. `CLOUD_RADIUS` sabiti ekle.
3. `CAMERA_DISTANCE` sabiti ekle.
4. Texture path sabitlerini ekle.
5. Pin boyut/glow sabitlerini ekle.

**Acceptance:**

- GlobeScene magic number kullanmak zorunda kalmıyor.
- Config dosyası TypeScript compile oluyor.

---

### TODO 051C — Gerçekçi Earth material ekle

**Amaç:** Globe’un düz renk küre değil, referans görseldeki gibi Dünya görünmesini sağlamak.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`
- `src/features/globe/globeVisualConfig.ts`

**Adımlar:**

1. `THREE.TextureLoader` ile `earth-day.jpg` yükle.
2. Texture varsa sphere material’da kullan.
3. Texture yüklenemezse fallback material kullan.
4. Fallback görünümü koyu mavi/yeşil ve sade tut.

**Acceptance:**

- Texture varsa Dünya yüzeyi gerçekçi görünür.
- Texture yoksa component crash olmaz.

---

### TODO 051D — Cloud layer ekle

**Amaç:** Referans görseldeki bulutlu Dünya hissini oluşturmak.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`

**Adımlar:**

1. Dünya sphere’inden biraz büyük ikinci sphere ekle.
2. `earth-clouds.png` texture kullan.
3. Material transparent olsun.
4. Cloud layer çok yavaş dönebilsin.
5. Texture yoksa cloud layer render edilmesin.

**Acceptance:**

- Bulut texture varsa Dünya üzerinde bulut katmanı görünür.
- Texture yoksa hata oluşmaz.

---

### TODO 051E — Atmosphere glow ekle

**Amaç:** Dünya’nın kenarında premium ve gerçekçi atmosfer parlaması oluşturmak.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`
- `src/styles/globals.css` gerekirse

**Adımlar:**

1. Dünya’dan biraz büyük back-side sphere veya shader-lite glow ekle.
2. Glow çok abartılı olmasın.
3. Opacity düşük tutulsun.
4. Performans için kompleks shader’dan kaçın.

**Acceptance:**

- Dünya kenarında hafif atmosfer parlaması görünüyor.
- Glow pinleri ve UI’ı boğmuyor.

---

### TODO 051F — Koyu uzay arka planı ekle

**Amaç:** Globe’un referans görseldeki gibi siyah/koyu uzay fonunda görünmesini sağlamak.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`
- `src/styles/globals.css`

**Adımlar:**

1. Renderer clear color değerini siyah/koyu lacivert yap.
2. Globe container arka planını koyu yap.
3. Opsiyonel starfield texture varsa arka plana düşük yoğunlukla ekle.
4. Starfield yoksa solid dark background kullan.

**Acceptance:**

- Globe açık renk sayfa üstünde değil, koyu uzay fonunda görünür.
- Starfield yoksa görsel kalite bozulmadan solid background çalışır.

---

### TODO 051G — Kamera ilk görünümünü ayarla

**Amaç:** İlk açılışta Dünya’nın tamamı veya büyük kısmı uzaktan görünsün.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`
- `src/features/globe/globeVisualConfig.ts`

**Adımlar:**

1. Camera FOV değerini dengeli ayarla.
2. Camera distance değerini Dünya taşmayacak şekilde ayarla.
3. Globe container yüksekliğini desktop ve mobile için ayarla.
4. İlk frame’de dünya merkezde görünsün.

**Acceptance:**

- Desktop ilk açılışta Dünya kesilmeden görünür.
- Mobil ilk açılışta Dünya UI altında kaybolmaz.

---

### TODO 051H — Işıklandırmayı gerçekçi yap

**Amaç:** Dünya’nın plastik top gibi değil, uzaydan bakılan gök cismi gibi görünmesini sağlamak.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`

**Adımlar:**

1. Düşük yoğunluklu AmbientLight ekle.
2. Ana DirectionalLight ekle.
3. Işık yönünü kıta/okyanus dokusu okunacak şekilde ayarla.
4. Aşırı parlaklık veya tamamen karanlık yüzey oluşmasını engelle.

**Acceptance:**

- Dünya üzerinde hacim ve ışık hissi var.
- Texture detayları okunabilir.

---

### TODO 051I — Globe rotation ve interaction sınırlarını ayarla

**Amaç:** Kullanıcı globe’u rahatça inceleyebilsin ama deneyim kontrolsüz olmasın.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`
- `src/features/globe/useGlobeController.ts`

**Adımlar:**

1. Hafif auto-rotation ekle.
2. Kullanıcı drag ederse auto-rotation geçici yavaşlasın veya dursun.
3. Zoom varsa minimum/maximum limit koy.
4. Fly-to animasyonu kullanıcı etkileşimiyle çakışmasın.

**Acceptance:**

- Globe yumuşak hareket ediyor.
- Kullanıcı etkileşimi sırasında kontrol hissi kaybolmuyor.

---

### TODO 051J — Premium pin görsel stilini ekle

**Amaç:** Pinlerin modern, küçük ve parlak network marker gibi görünmesini sağlamak.

**Dosyalar:**

- `src/features/globe/GlobePin.tsx`
- `src/styles/globals.css`

**Adımlar:**

1. Pin normal state için küçük dot/marker tasarla.
2. Soft glow ekle.
3. Hover state’te scale ve glow artır.
4. Tooltip kartını minimal yap.
5. Pin boyutunu globe’u kapatmayacak seviyede tut.

**Acceptance:**

- Pinler klasik Google Maps kırmızı pini gibi görünmüyor.
- Pinler çok büyük veya dikkat dağıtıcı değil.

---

### TODO 051K — Globe loading ve empty state ekle

**Amaç:** Veri veya texture yüklenirken kullanıcıya temiz durum göstermek.

**Dosyalar:**

- `src/features/globe/GlobePage.tsx`
- `src/features/globe/GlobeScene.tsx`
- `src/components/ui/EmptyState.tsx`

**Adımlar:**

1. Approved pins yüklenirken loading state göster.
2. Texture yüklenirken globe container boş kalmasın.
3. Hiç pin yoksa “Henüz bu bölgede pin yok” tarzı empty state göster.
4. Error state için tekrar dene butonu ekle.

**Acceptance:**

- Loading sırasında kırık/boş ekran yok.
- Pin yoksa kullanıcı anlaşılır mesaj görür.

---

### TODO 051L — Globe visual smoke test ekle

**Amaç:** Globe’un temel görsel bileşenlerinin render olduğunu kontrol etmek.

**Dosyalar:**

- `tests/e2e/globe-visual.spec.ts`

**Adımlar:**

1. Ana sayfayı aç.
2. Globe canvas/container görünür mü kontrol et.
3. Koyu background class veya style var mı kontrol et.
4. En az bir test pin’i varsa pin elementleri görünür mü kontrol et.
5. Screenshot assertion zorunlu olmasın; ilk sürümde smoke test yeterlidir.

**Acceptance:**

- E2E smoke test globe container’ın render olduğunu doğrular.
- Test görsel snapshot kırılganlığı oluşturmaz.

---

### TODO 052 — GlobeOverlayLayer oluştur

**Amaç:** HTML overlay pinleri globe üzerine yerleştirmek.

**Dosyalar:**

- `src/features/globe/GlobeOverlayLayer.tsx`
- `src/features/globe/GlobePin.tsx`

**Adımlar:**

1. Pin item listesi al.
2. Her pin için overlay element render et.
3. Globe projection’dan gelen screen position prop’unu destekle.
4. Tooltip basit olsun.

**Acceptance:**

- Pin HTML elementleri render oluyor.
- Tooltip hover ile açılıyor.

---

### TODO 053 — Overlay projection bağla

**Amaç:** Lat/lng pinleri ekrana doğru konumlandırmak.

**Dosyalar:**

- `src/features/globe/GlobeScene.tsx`
- `src/features/globe/GlobeOverlayLayer.tsx`

**Adımlar:**

1. Her frame pinlerin 3D pozisyonunu hesapla.
2. Kamera projection ile 2D screen position üret.
3. Arka taraftaki pinleri gizle.
4. Overlay layer’a pozisyonları ver.

**Acceptance:**

- Pinler globe döndükçe hareket ediyor.
- Arka yüz pinleri görünmüyor.

---

### TODO 054 — Globe controller hook oluştur

**Amaç:** `flyToCoords` için controller state’i ayırmak.

**Dosyalar:**

- `src/features/globe/useGlobeController.ts`
- `src/features/globe/flyTo.ts`

**Adımlar:**

1. Target rotation state’i oluştur.
2. `flyToCoords` fonksiyonu ekle.
3. Duration parametresi destekle.
4. GlobeScene bu controller’ı kullanabilsin.

**Acceptance:**

- Dışarıdan lat/lng verilince globe hedefe dönüyor.

---

### TODO 055 — GlobePage oluştur

**Amaç:** Public globe sayfasını tamamlamak.

**Dosyalar:**

- `src/features/globe/GlobePage.tsx`
- `src/app/router.tsx`

**Adımlar:**

1. `useApprovedPins` kullan.
2. Loading/error state ekle.
3. GlobeScene’e pins ver.
4. Header CTA ekle.

**Acceptance:**

- `/` route globe page gösteriyor.
- Supabase’den veri çekiliyor.

---

### TODO 056 — Public realtime refetch ekle

**Amaç:** Admin onayından sonra globe’u güncel tutmak.

**Dosyalar:**

- `src/features/globe/useApprovedPins.ts`

**Adımlar:**

1. Supabase realtime channel aç.
2. `public.pins` değişikliklerini dinle.
3. Değişiklik gelince `refetch` çağır.
4. Cleanup yap.

**Acceptance:**

- Pin approve sonrası sayfa yenilenmeden liste güncelleniyor veya refetch tetikleniyor.
- Cleanup memory leak yapmıyor.

---

## Faz 12 — Admin Backend

### TODO 057 — Admin pins list function oluştur

**Amaç:** Admin pending pinleri güvenli şekilde listeleyebilsin.

**Dosyalar:**

- `supabase/functions/admin-pins/index.ts`

**Adımlar:**

1. GET kabul et.
2. Admin auth required yap.
3. `status`, `limit`, `cursor` parametrelerini oku.
4. Default status `pending` olsun.
5. DB query yap.
6. Items + nextCursor döndür.

**Acceptance:**

- Normal user 403 alır.
- Admin pending pinleri görür.

---

### TODO 058 — Admin review function oluştur

**Amaç:** Admin approve/reject işlemi yapabilsin.

**Dosyalar:**

- `supabase/functions/admin-pins-review/index.ts`

**Adımlar:**

1. POST kabul et.
2. Admin auth required yap.
3. `pinId`, `action`, `reason` validate et.
4. Approve için status update et.
5. Reject için reason zorunlu yap.
6. Moderation event insert et.
7. Updated pin döndür.

**Acceptance:**

- Normal user 403.
- Approve status’u güncelliyor.
- Reject reason kaydediyor.
- Event oluşuyor.

---

### TODO 059 — Admin review transaction güvenliğini iyileştir

**Amaç:** Update + event insert ayrılmaz olsun.

**Dosyalar:**

- `supabase/migrations/004_admin_review_rpc.sql` veya mevcut migration’a ek not
- `supabase/functions/admin-pins-review/index.ts`

**Adımlar:**

1. Tercihen SQL RPC function yaz.
2. RPC içinde pin update + event insert tek transaction içinde olsun.
3. Edge Function RPC çağırabilir.

**Acceptance:**

- Pin update başarılı event başarısız gibi yarım durum kalmıyor.

---

## Faz 13 — Admin Frontend

### TODO 060 — Admin API wrapper oluştur

**Amaç:** Admin function çağrılarını merkezi yapmak.

**Dosyalar:**

- `src/features/admin/adminApi.ts`

**Adımlar:**

1. `fetchAdminPins(status)` yaz.
2. `reviewPin(pinId, action, reason)` yaz.
3. Error normalize et.

**Acceptance:**

- Admin UI raw invoke yapmıyor.

---

### TODO 061 — AdminRouteGuard oluştur

**Amaç:** Frontend tarafında admin sayfasını korumak.

**Dosyalar:**

- `src/features/admin/AdminRouteGuard.tsx`

**Adımlar:**

1. User session kontrol et.
2. User metadata role admin mi kontrol et.
3. Değilse forbidden ekranı göster.
4. Not: Asıl güvenlik backend’dedir.

**Acceptance:**

- Normal user admin UI görmüyor.
- Admin user görüyor.

---

### TODO 062 — AdminPinsTable oluştur

**Amaç:** Pending pin tablosu.

**Dosyalar:**

- `src/features/admin/AdminPinsTable.tsx`

**Adımlar:**

1. Items prop’u al.
2. Display name, type, city, country, status, created_at göster.
3. Row click veya review button ekle.

**Acceptance:**

- Liste tablo olarak görünüyor.
- Review seçimi çalışıyor.

---

### TODO 063 — ReviewDrawer oluştur

**Amaç:** Admin pin detayını inceleyebilsin.

**Dosyalar:**

- `src/features/admin/ReviewDrawer.tsx`

**Adımlar:**

1. Seçili pin detayını göster.
2. Approve button ekle.
3. Reject için reason textarea ekle.
4. Loading/error state ekle.
5. Success sonrası parent refetch callback çağır.

**Acceptance:**

- Approve çalışıyor.
- Reason olmadan reject yapılmıyor.

---

### TODO 064 — AdminPinsPage oluştur

**Amaç:** Admin moderasyon sayfası.

**Dosyalar:**

- `src/features/admin/AdminPinsPage.tsx`
- `src/app/router.tsx`

**Adımlar:**

1. AdminRouteGuard ile koru.
2. Status filter ekle.
3. AdminPinsTable render et.
4. ReviewDrawer bağla.
5. Review sonrası liste refetch et.

**Acceptance:**

- `/admin/pins` çalışıyor.
- Pending pin approve/reject edilebiliyor.

---

## Faz 14 — Validation ve Error UX

### TODO 065 — Frontend validator dosyası oluştur

**Amaç:** Form validasyonlarını merkezi yapmak.

**Dosyalar:**

- `src/lib/validators.ts`

**Adımlar:**

1. `validateDisplayName` yaz.
2. `validateDescription` yaz.
3. `validatePinType` yaz.
4. `validateSelectedPlace` yaz.

**Acceptance:**

- PinForm validator kullanıyor.
- Duplicate validation azaltıldı.

---

### TODO 066 — Error mapper oluştur

**Amaç:** Backend hata kodlarını kullanıcı dostu metne çevirmek.

**Dosyalar:**

- `src/lib/errors.ts`

**Adımlar:**

1. `mapApiErrorToMessage` yaz.
2. Known codes için Türkçe mesajlar ekle.
3. Unknown error için generic mesaj kullan.

**Acceptance:**

- Form ve pages aynı mapper’ı kullanıyor.

---

### TODO 067 — Loading/empty/error standardize et

**Amaç:** Tüm sayfalarda tutarlı durum ekranları.

**Dosyalar:**

- `src/features/pins/MyPinsPage.tsx`
- `src/features/admin/AdminPinsPage.tsx`
- `src/features/globe/GlobePage.tsx`

**Adımlar:**

1. Spinner kullan.
2. EmptyState kullan.
3. ErrorBox kullan.

**Acceptance:**

- Boş listeler patlamıyor.
- Hata mesajları okunur.

---

## Faz 15 — Testler

### TODO 068 — Test runner kur

**Amaç:** Unit test altyapısı.

**Dosyalar:**

- `package.json`
- `vitest.config.ts` veya `vite.config.ts`

**Adımlar:**

1. Vitest kurulu değilse kur.
2. `npm run test` script’i ekle.
3. Basit smoke test ekle.

**Acceptance:**

- `npm run test` çalışıyor.

---

### TODO 069 — Normalize place unit testleri

**Amaç:** City fallback doğru çalışsın.

**Dosyalar:**

- `tests/unit/normalizePlace.test.ts`
- Gerekirse shared normalizer frontend test için kopyalanmaz; logic testlenebilir modüle taşınır.

**Adımlar:**

1. `locality` case test et.
2. `postal_town` fallback test et.
3. `administrative_area_level_3` fallback test et.
4. Country missing error test et.
5. Location missing error test et.

**Acceptance:**

- Tüm normalizer testleri geçiyor.

---

### TODO 070 — Geometry unit testleri

**Amaç:** Globe hesapları regressionsız kalsın.

**Dosyalar:**

- `tests/unit/geometry.test.ts`

**Adımlar:**

1. Lat/lng valid output Vector3 dönüyor mu test et.
2. Radius etkisini test et.
3. Invalid lat/lng guard test et.

**Acceptance:**

- Geometry testleri geçiyor.

---

### TODO 071 — Validator unit testleri

**Amaç:** Form validation deterministic olsun.

**Dosyalar:**

- `tests/unit/validators.test.ts`

**Adımlar:**

1. Display name min/max test et.
2. Description max test et.
3. Pin type valid/invalid test et.

**Acceptance:**

- Validator testleri geçiyor.

---

### TODO 072 — Playwright kur

**Amaç:** E2E test altyapısı.

**Dosyalar:**

- `package.json`
- `playwright.config.ts`
- `tests/e2e/`

**Adımlar:**

1. Playwright kur.
2. Browser install komutunu çalıştır.
3. Base URL ayarla.
4. Smoke test ekle.

**Acceptance:**

- `npx playwright test` çalışıyor.

---

### TODO 073 — Public globe E2E smoke test

**Amaç:** Public sayfa açılıyor mu kontrol etmek.

**Dosyalar:**

- `tests/e2e/public-globe.spec.ts`

**Adımlar:**

1. `/` sayfasına git.
2. Header görünür mü kontrol et.
3. Globe container görünür mü kontrol et.

**Acceptance:**

- Public smoke test geçiyor.

---

### TODO 074 — Auth E2E placeholder test

**Amaç:** Login sayfası temel davranışını kontrol etmek.

**Dosyalar:**

- `tests/e2e/auth.spec.ts`

**Adımlar:**

1. `/login` aç.
2. Email input var mı kontrol et.
3. Submit button var mı kontrol et.

**Acceptance:**

- Auth smoke test geçiyor.

---

### TODO 075 — Admin forbidden E2E test

**Amaç:** Normal user/admin ayrımı UI’da çalışıyor mu kontrol etmek.

**Dosyalar:**

- `tests/e2e/admin-review.spec.ts`

**Adımlar:**

1. Login olmadan `/admin/pins` aç.
2. Login veya forbidden yönlendirmesini kontrol et.

**Acceptance:**

- Admin sayfası public erişime açık değil.

---

## Faz 16 — Deployment Hazırlığı

### TODO 076 — Build scriptlerini netleştir

**Amaç:** CI/CD için komutlar hazır olsun.

**Dosyalar:**

- `package.json`

**Adımlar:**

1. `dev`, `build`, `preview`, `test`, `test:e2e` scriptlerini ekle.
2. Scriptler Windows PowerShell’de çalışır olsun.

**Acceptance:**

- Tüm npm scriptleri çalışıyor.

---

### TODO 077 — Git ignore kontrolü

**Amaç:** Secret ve local dosyalar repo’ya girmesin.

**Dosyalar:**

- `.gitignore`

**Adımlar:**

1. `.env` dosyalarını ignore et.
2. `.env.example` ignore edilmesin.
3. Supabase local temp dosyaları ignore edilsin.
4. Playwright artifacts ignore edilsin.

**Acceptance:**

- Secret dosyalar git’e düşmüyor.

---

### TODO 078 — Security checklist dosyası ekle

**Amaç:** Deploy öncesi kontrol listesi.

**Dosyalar:**

- `SECURITY_CHECKLIST.md`

**Adımlar:**

1. Non-negotiable güvenlik kurallarını listele.
2. Google key browser bundle kontrolünü ekle.
3. RLS kontrolünü ekle.
4. Admin role kontrolünü ekle.

**Acceptance:**

- Checklist okunur ve uygulanabilir.

---

### TODO 079 — README implementasyon notu ekle

**Amaç:** Projenin nasıl çalıştırılacağını açıklamak.

**Dosyalar:**

- `README.md`

**Adımlar:**

1. Local setup yaz.
2. Env açıklaması yaz.
3. Supabase local komutlarını yaz.
4. Test komutlarını yaz.
5. Deploy kısa notu yaz.

**Acceptance:**

- Yeni geliştirici projeyi çalıştırabilir.

---

## Faz 17 — Son Sertleştirme

### TODO 080 — Secret leakage kontrolü

**Amaç:** Build çıktısında secret olmadığını doğrulamak.

**Dosyalar:**

- Kod değişikliği gerekmez.

**Adımlar:**

1. `npm run build` çalıştır.
2. `dist` içinde `GOOGLE_MAPS_PLACES_API_KEY` veya key value araması yap.
3. `VITE_` dışında secret olmadığını doğrula.

**PowerShell:**

```powershell
npm run build
Select-String -Path "dist\**\*" -Pattern "GOOGLE_MAPS_PLACES_API_KEY" -ErrorAction SilentlyContinue
```

**Acceptance:**

- Build çıktısında Google key yok.

---

### TODO 081 — Public feed security kontrolü

**Amaç:** Pending pin public query ile dönmüyor mu kontrol etmek.

**Dosyalar:**

- Kod değişikliği gerekmez.

**Adımlar:**

1. DB’ye pending pin ekle.
2. Public approved query çalıştır.
3. Pending pinin dönmediğini doğrula.
4. Pin’i approved yap.
5. Query’de döndüğünü doğrula.

**Acceptance:**

- Public feed sadece approved + active.

---

### TODO 082 — Admin action audit kontrolü

**Amaç:** Approve/reject sonrası audit log garanti olsun.

**Dosyalar:**

- Kod değişikliği gerekirse admin review function.

**Adımlar:**

1. Pending pin oluştur.
2. Admin approve yap.
3. `pin_moderation_events` içinde approved event kontrol et.
4. Başka pending pin oluştur.
5. Admin reject yap.
6. Rejected event + reason kontrol et.

**Acceptance:**

- Her moderation action event oluşturuyor.

---

### TODO 083 — Google request maliyet kontrolü

**Amaç:** Gereksiz Google çağrısı olmadığını doğrulamak.

**Dosyalar:**

- `src/features/places/usePlaceAutocomplete.ts`
- `supabase/functions/_shared/googlePlaces.ts`

**Adımlar:**

1. 1-2 karakterde request atılmadığını doğrula.
2. Debounce çalışıyor mu kontrol et.
3. Autocomplete request body’de `(cities)` var mı kontrol et.
4. Details field mask `*` içermiyor mu kontrol et.
5. `displayName` field mask içinde yok mu kontrol et.

**Acceptance:**

- Maliyet koruma kuralları uygulanmış.

---

### TODO 084 — Full happy path manuel test

**Amaç:** MVP baştan sona çalışıyor mu görmek.

**Dosyalar:**

- Kod değişikliği gerekmez.

**Adımlar:**

1. User login ol.
2. My Pins sayfasına git.
3. Add Pin aç.
4. Berlin gibi şehir ara.
5. Şehri seç.
6. Formu doldur.
7. Submit et.
8. Pin pending görünüyor mu kontrol et.
9. Admin olarak login ol.
10. Pending pin’i approve et.
11. Public globe’da pin görünüyor mu kontrol et.

**Acceptance:**

- Uçtan uca akış çalışıyor.

---

### TODO 085 — Full rejection path manuel test

**Amaç:** Reject akışı doğru mu görmek.

**Dosyalar:**

- Kod değişikliği gerekmez.

**Adımlar:**

1. User pin submit et.
2. Admin pending pin’i aç.
3. Reason girerek reject et.
4. User My Pins sayfasında rejected status ve reason görsün.
5. Public globe’da görünmediğini doğrula.

**Acceptance:**

- Rejected pin public görünmez.
- User reason görebilir.

---

## 18. İlk Teslim Definition of Done

Proje ilk üretim hazır MVP olarak ancak şu maddeler tamamlanınca kabul edilir:

- [ ] Frontend build başarılı.
- [ ] Supabase migration local reset ile başarılı.
- [ ] Google API key frontend bundle’da yok.
- [ ] Auth çalışıyor.
- [ ] Place autocomplete city-only çalışıyor.
- [ ] Place details server-side doğrulama yapıyor.
- [ ] Pin submit sadece authenticated user ile çalışıyor.
- [ ] Submit edilen pin pending oluşuyor.
- [ ] Public globe pending pin göstermiyor.
- [ ] Globe referans görseldeki gibi koyu arka plan üzerinde gerçekçi uzaktan bakılan Dünya hissi veriyor.
- [ ] Earth texture, cloud layer veya güvenli fallback ile globe boş/düz top gibi görünmüyor.
- [ ] Pinler küçük, modern, parlak ve globe’u boğmayacak şekilde render ediliyor.
- [ ] My Pins kullanıcı kendi pinlerini gösteriyor.
- [ ] Admin pending pinleri görebiliyor.
- [ ] Normal user admin endpoint’e erişemiyor.
- [ ] Admin approve sonrası pin public globe’da görünüyor.
- [ ] Admin reject sonrası pin public globe’da görünmüyor.
- [ ] Moderation event her submit/approve/reject için oluşuyor.
- [ ] RLS açık.
- [ ] Minimum field mask kullanılıyor.
- [ ] Autocomplete min char + debounce çalışıyor.
- [ ] Temel unit testler geçiyor.
- [ ] Temel E2E smoke testler geçiyor.
- [ ] README ve SECURITY_CHECKLIST mevcut.

---

## 19. Agent İçin Çalışma Talimatı

Agent’a verilecek kısa talimat:

```txt
Bu projeyi bu dokümana göre sıfırdan üretim hazır şekilde implemente et.

Çalışma kuralı:
- Aynı anda sadece bir TODO yap.
- TODO numarasıyla ilerle.
- TODO’da belirtilmeyen dosyaları değiştirme.
- Her TODO sonunda acceptance kriterlerini kontrol et.
- Büyük refactor yapma.
- Takıldığında varsayım yapmadan mevcut dokümandaki kurallara dön.
- Google API key veya Supabase secret değerlerini frontend’e koyma.
- Globe görsel işlerinde de küçük TODO adımlarını takip et; tek seferde büyük Three.js refactor yapma.
- Komutları Windows PowerShell uyumlu yaz.
```

---

## 20. Son Not

Bu implementasyon planının ana fikri şudur:

- Prototipteki görsel globe deneyimi korunur.
- Static `PINS` / `CITIES` yaklaşımı kaldırılır.
- Şehir arama Google Places API New ile yapılır.
- Google key backend’de kalır.
- Pin submit server-side doğrulanır.
- Moderasyon zorunlu olur.
- Public globe yalnız güvenli ve onaylanmış veriyi gösterir.
- Agent implementasyonu küçük todo paketleriyle adım adım ilerletir.
