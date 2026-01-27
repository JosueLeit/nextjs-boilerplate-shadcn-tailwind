# FavoritePerson.app - Technical Architecture

**Version:** 2.0
**Date:** January 2026
**Status:** Approved
**Owner:** @architect

---

## Table of Contents

1. [Overview](#1-overview)
2. [Current Architecture](#2-current-architecture)
3. [Target Architecture](#3-target-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Data Architecture](#5-data-architecture)
6. [Image Pipeline](#6-image-pipeline)
7. [API Architecture](#7-api-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Scalability Strategy](#9-scalability-strategy)
10. [Implementation Roadmap](#10-implementation-roadmap)

---

## 1. Overview

### Vision

Transform FavoritePerson.app from a couples photo sharing app into a comprehensive digital album platform supporting:
- **Couples** - Personal memory sharing
- **Families** - Multi-generational albums
- **Professional Photographers** - Client galleries
- **Event Organizers** - Wedding/party photo collection

### Key Architectural Goals

1. **Performance** - Sub-second gallery loads with 1000+ photos
2. **Scalability** - Support 100K+ users, 50TB+ storage
3. **Flexibility** - Multiple layouts, themes, sharing options
4. **Security** - Privacy-first, end-to-end protection
5. **Cost Efficiency** - Optimized storage and bandwidth costs

---

## 2. Current Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Next.js    │     │   Vercel     │     │   Supabase   │    │
│  │   Frontend   │────▶│   Hosting    │────▶│   Backend    │    │
│  │              │     │              │     │              │    │
│  │  - React 18  │     │  - Edge CDN  │     │  - Auth      │    │
│  │  - Tailwind  │     │  - SSR       │     │  - Storage   │    │
│  │  - Zustand   │     │  - API       │     │  - Database  │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Current Limitations

| Limitation | Impact | Solution |
|------------|--------|----------|
| No chunked uploads | Large files fail | tus-js-client |
| No image optimization | Slow loads | Sharp + CDN |
| Single layout | Limited UX | 5 layout system |
| No virtual scrolling | Performance issues | @tanstack/react-virtual |
| Simple auth | No multi-tenant | Organization model |

---

## 3. Target Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TARGET ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           CLIENT LAYER                                   │   │
│  │                                                                          │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │   │  Web App    │  │  Mobile Web │  │  PWA        │  │  Future:    │   │   │
│  │   │  (Next.js)  │  │  (Responsive)│  │  (Offline) │  │  Native App │   │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         EDGE/CDN LAYER                                   │   │
│  │                                                                          │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                    │   │
│  │   │  Vercel     │  │  Cloudflare │  │  Image      │                    │   │
│  │   │  Edge       │  │  CDN        │  │  Transform  │                    │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘                    │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         API/SERVICE LAYER                                │   │
│  │                                                                          │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │   │  Next.js    │  │  Supabase   │  │  Edge       │  │  Webhooks   │   │   │
│  │   │  API Routes │  │  Functions  │  │  Functions  │  │  (Stripe)   │   │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                          │                                       │
│                                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA LAYER                                       │   │
│  │                                                                          │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │   │
│  │   │  Supabase   │  │  Supabase   │  │  Future:    │  │  Redis      │   │
│  │   │  PostgreSQL │  │  Storage    │  │  R2/S3      │  │  (Cache)    │   │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Interactions

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW: PHOTO UPLOAD                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  User                                                                         │
│    │                                                                          │
│    ▼                                                                          │
│  ┌─────────────────┐                                                         │
│  │ 1. Select Photo │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐     ┌─────────────────┐                                │
│  │ 2. Compress     │────▶│ browser-image-  │  (if >10MB)                    │
│  │    Client-side  │     │ compression     │                                │
│  └────────┬────────┘     └─────────────────┘                                │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐     ┌─────────────────┐                                │
│  │ 3. Chunked      │────▶│ tus-js-client   │  (5MB chunks)                  │
│  │    Upload       │     │ + tus-server    │                                │
│  └────────┬────────┘     └─────────────────┘                                │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐                                                         │
│  │ 4. Supabase     │                                                         │
│  │    Storage      │                                                         │
│  └────────┬────────┘                                                         │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐     ┌─────────────────────────────────────────────┐   │
│  │ 5. Edge Function│────▶│ Generate: thumb (200), medium (800),        │   │
│  │    (process)    │     │           large (1600), blurhash            │   │
│  └────────┬────────┘     └─────────────────────────────────────────────┘   │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────┐                                                         │
│  │ 6. Update DB    │  (variants, blurhash, metadata)                        │
│  │    + Notify UI  │                                                         │
│  └─────────────────┘                                                         │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack

### Current Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14.2.16 |
| UI Library | React | 18.x |
| Styling | Tailwind CSS | 3.4.1 |
| Animation | Framer Motion | 11.17.0 |
| State | Zustand | 5.0.3 |
| Backend | Supabase | Latest |
| Hosting | Vercel | - |

### New Dependencies (Phase 1)

| Package | Purpose | Size |
|---------|---------|------|
| `tus-js-client` | Resumable uploads | ~15KB |
| `browser-image-compression` | Client compression | ~50KB |
| `react-masonry-css` | Masonry layout | ~3KB |
| `@tanstack/react-virtual` | Virtual scrolling | ~15KB |
| `blurhash` | Image placeholders | ~5KB |
| `sharp` | Server image processing | Edge Function |

### Future Considerations

| Phase | Technology | Purpose |
|-------|------------|---------|
| Phase 3 | Stripe | Payments |
| Phase 4 | Cloudflare R2 | Storage at scale |
| Phase 4 | Cloudflare Images | Image CDN |
| Phase 5 | React Native | Mobile app |

---

## 5. Data Architecture

### Database Schema (PostgreSQL)

```sql
-- =============================================
-- CORE TABLES
-- =============================================

-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    relationship_start_date DATE,
    onboarding_completed BOOLEAN DEFAULT false,
    share_token UUID DEFAULT gen_random_uuid(),
    share_token_created_at TIMESTAMP WITH TIME ZONE,
    layout_preferences JSONB DEFAULT '{"default": "polaroid", "albums": {}}',
    plan TEXT DEFAULT 'free', -- free, essential, premium, pro
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MULTI-TENANT TABLES (Phase 3)
-- =============================================

-- Organizations (Photographers/Studios)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id),
    logo_url TEXT,
    plan TEXT DEFAULT 'pro_starter',
    storage_used_bytes BIGINT DEFAULT 0,
    storage_limit_bytes BIGINT DEFAULT 5368709120, -- 5GB
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- owner, admin, member
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- =============================================
-- ALBUM/EVENT TABLES
-- =============================================

-- Albums/Events
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id), -- NULL for personal
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    cover_photo_id UUID,
    event_date DATE,
    event_type TEXT, -- couple, family, wedding, birthday, corporate, other
    layout TEXT DEFAULT 'polaroid',
    theme TEXT DEFAULT 'romance',
    is_public BOOLEAN DEFAULT false,
    password_hash TEXT, -- optional password protection
    allow_guest_uploads BOOLEAN DEFAULT false,
    require_moderation BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(owner_id, slug)
);

-- =============================================
-- PHOTO TABLES
-- =============================================

-- Photos
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES auth.users(id),
    storage_path TEXT NOT NULL,
    original_filename TEXT,
    caption TEXT,
    taken_at TIMESTAMP WITH TIME ZONE,
    file_size_bytes INTEGER,
    width INTEGER,
    height INTEGER,
    blurhash TEXT,
    variants JSONB DEFAULT '{}', -- {thumb: url, medium: url, large: url}
    exif_data JSONB DEFAULT '{}',
    is_approved BOOLEAN DEFAULT true, -- for moderated albums
    sort_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo Tags
CREATE TABLE photo_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SHARING TABLES
-- =============================================

-- Share Links
CREATE TABLE share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    password_hash TEXT,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    permissions JSONB DEFAULT '{"view": true, "download": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guest Uploads
CREATE TABLE guest_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    guest_name TEXT,
    guest_email TEXT,
    upload_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS TABLES
-- =============================================

-- Album/Photo Analytics
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    photo_id UUID REFERENCES photos(id),
    event_type TEXT NOT NULL, -- view, download, share
    user_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
CREATE INDEX idx_albums_owner_id ON albums(owner_id);
CREATE INDEX idx_albums_organization_id ON albums(organization_id);
CREATE INDEX idx_analytics_album_id ON analytics_events(album_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Albums: Complex access control
CREATE POLICY "Users can view own albums"
    ON albums FOR SELECT
    USING (owner_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can insert own albums"
    ON albums FOR INSERT
    WITH CHECK (owner_id = auth.uid());

-- Photos: Access through album
CREATE POLICY "Users can view photos in accessible albums"
    ON photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM albums
            WHERE albums.id = photos.album_id
            AND (albums.owner_id = auth.uid() OR albums.is_public = true)
        )
    );
```

### Storage Structure

```
supabase-storage/
├── photos/
│   ├── {user_id}/
│   │   ├── {photo_id}/
│   │   │   ├── original.jpg
│   │   │   ├── thumb.webp      (200x200)
│   │   │   ├── medium.webp     (800px)
│   │   │   └── large.webp      (1600px)
│   │   └── ...
│   └── ...
├── avatars/
│   └── {user_id}.webp
└── organizations/
    └── {org_id}/
        └── logo.webp
```

---

## 6. Image Pipeline

### Upload Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                     IMAGE UPLOAD PIPELINE                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │ Browser │───▶│ Compress    │───▶│ Chunk       │              │
│  │ Select  │    │ (if >10MB)  │    │ (5MB each)  │              │
│  └─────────┘    └─────────────┘    └──────┬──────┘              │
│                                           │                      │
│                    ┌──────────────────────┘                      │
│                    ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    TUS UPLOAD SERVER                     │    │
│  │                                                          │    │
│  │   • Resumable uploads                                    │    │
│  │   • Progress tracking                                    │    │
│  │   • Automatic retry                                      │    │
│  │   • Chunk reassembly                                     │    │
│  └────────────────────────────┬────────────────────────────┘    │
│                               │                                  │
│                               ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  SUPABASE STORAGE                        │    │
│  │                                                          │    │
│  │   Bucket: photos/{user_id}/{photo_id}/original.{ext}    │    │
│  └────────────────────────────┬────────────────────────────┘    │
│                               │                                  │
│                               ▼ (webhook trigger)                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 EDGE FUNCTION: process-image             │    │
│  │                                                          │    │
│  │   1. Download original                                   │    │
│  │   2. Extract EXIF metadata                               │    │
│  │   3. Generate blurhash                                   │    │
│  │   4. Create variants:                                    │    │
│  │      • thumb:  200x200,  WebP, 70% quality              │    │
│  │      • medium: 800px,    WebP, 80% quality              │    │
│  │      • large:  1600px,   WebP, 85% quality              │    │
│  │   5. Upload variants to storage                          │    │
│  │   6. Update database record                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Delivery Pipeline

```
┌──────────────────────────────────────────────────────────────────┐
│                    IMAGE DELIVERY PIPELINE                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Browser Request                                                  │
│       │                                                           │
│       ▼                                                           │
│  ┌─────────────────┐                                             │
│  │ 1. Show Blurhash│  ← Instant (from DB, ~30 bytes)            │
│  │    Placeholder  │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────┐    ┌──────────────────────────────────┐    │
│  │ 2. Request      │───▶│ CDN Cache Check                   │    │
│  │    Thumbnail    │    │ Hit? → Return cached              │    │
│  └─────────────────┘    │ Miss? → Fetch from storage        │    │
│                         └──────────────────────────────────┘    │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────┐                                             │
│  │ 3. Progressive  │  ← As user scrolls/interacts               │
│  │    Load Medium  │                                             │
│  └────────┬────────┘                                             │
│           │                                                       │
│           ▼                                                       │
│  ┌─────────────────┐                                             │
│  │ 4. Lightbox:    │  ← On click/tap                            │
│  │    Load Large   │                                             │
│  └─────────────────┘                                             │
│                                                                   │
│  Cache Headers: Cache-Control: public, max-age=31536000, immutable│
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. API Architecture

### API Routes Structure

```
/api/
├── auth/
│   ├── login
│   ├── register
│   ├── logout
│   └── reset-password
├── users/
│   └── [id]/
│       ├── profile
│       └── settings
├── albums/
│   ├── index (list/create)
│   └── [id]/
│       ├── index (get/update/delete)
│       ├── photos (list/upload)
│       ├── share (create share link)
│       └── settings
├── photos/
│   └── [id]/
│       ├── index (get/update/delete)
│       └── download
├── upload/
│   └── tus (chunked upload endpoint)
└── organizations/ (Phase 3)
    ├── index
    └── [id]/
        ├── members
        ├── albums
        └── analytics
```

### API Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ALBUM_NOT_FOUND",
    "message": "Album não encontrado",
    "details": { ... }
  }
}
```

---

## 8. Security Architecture

### Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐        │
│  │   Login     │────▶│  Supabase   │────▶│   JWT       │        │
│  │   Form      │     │   Auth      │     │   Token     │        │
│  └─────────────┘     └─────────────┘     └──────┬──────┘        │
│                                                  │                │
│                    ┌─────────────────────────────┘                │
│                    ▼                                              │
│  ┌────────────────────────────────────────────────────────┐      │
│  │                    MIDDLEWARE                           │      │
│  │                                                         │      │
│  │   1. Extract JWT from cookie/header                    │      │
│  │   2. Verify signature with Supabase                    │      │
│  │   3. Check token expiration                            │      │
│  │   4. Attach user to request                            │      │
│  │   5. Check route permissions                           │      │
│  │                                                         │      │
│  └────────────────────────────────────────────────────────┘      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| Transport | HTTPS | Vercel automatic |
| Auth | JWT + Refresh | Supabase Auth |
| Database | RLS | PostgreSQL policies |
| Storage | Signed URLs | Supabase Storage |
| API | Rate Limiting | Vercel/Middleware |
| Input | Validation | Zod schemas |
| XSS | Sanitization | React escaping |
| CSRF | Token | Supabase built-in |

### Privacy Controls

```typescript
interface AlbumPrivacy {
  visibility: 'private' | 'link' | 'public'
  password?: string           // Optional password
  allowDownload: boolean      // Can viewers download?
  allowGuestUpload: boolean   // Can guests add photos?
  requireModeration: boolean  // Review before publish?
  expiresAt?: Date           // Auto-expire link
  maxViews?: number          // View limit
}
```

---

## 9. Scalability Strategy

### Phase-Based Scaling

| Phase | Users | Storage | Strategy |
|-------|-------|---------|----------|
| 1 | 1-1K | <100GB | Supabase Free/Pro |
| 2 | 1K-10K | 100GB-1TB | Supabase Pro + CDN |
| 3 | 10K-50K | 1-10TB | R2 + Cloudflare Images |
| 4 | 50K-100K | 10-50TB | Multi-region + Sharding |

### Cost Projections

| Scale | Supabase | Storage | CDN | Total/Month |
|-------|----------|---------|-----|-------------|
| 1K users | $25 | $5 | $0 | ~$30 |
| 10K users | $25 | $50 | $20 | ~$95 |
| 50K users | $599 | $250 | $100 | ~$950 |
| 100K users | Custom | $500 | $200 | ~$2,000 |

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| TTFB | <200ms | Lighthouse |
| FCP | <1.5s | Lighthouse |
| LCP | <2.5s | Lighthouse |
| CLS | <0.1 | Lighthouse |
| Gallery load (100 photos) | <1s | Custom metric |
| Upload speed | >2MB/s | Custom metric |

---

## 10. Implementation Roadmap

### Phase 1: Performance Foundation (Weeks 1-6)

| Story | Description | Status |
|-------|-------------|--------|
| 1.1 | Chunked File Uploads | ✅ Approved |
| 1.2 | Client-Side Compression | ✅ Approved |
| 1.3 | Image Optimization Pipeline | ✅ Approved |
| 1.4 | Multiple Gallery Layouts | ✅ Approved |
| 1.5 | Virtual Scrolling | ✅ Approved |
| 1.6 | Layout Persistence | ✅ Approved |

### Phase 2: Social & Sharing (Weeks 7-9)

| Story | Description | Status |
|-------|-------------|--------|
| 2.1 | Web Share API Integration | Planned |
| 2.2 | Instagram Story Export | Planned |
| 2.3 | Collage Builder | Planned |
| 2.4 | Caption Templates | Planned |

### Phase 3: Pro Features (Weeks 10-18)

| Story | Description | Status |
|-------|-------------|--------|
| 3.1 | Multi-tenant Database Schema | Planned |
| 3.2 | Organization Management | Planned |
| 3.3 | Client/Album Management | Planned |
| 3.4 | Stripe Billing Integration | Planned |
| 3.5 | Pro Dashboard | Planned |

### Phase 4: Scale (Ongoing)

| Story | Description | Status |
|-------|-------------|--------|
| 4.1 | Cloudflare R2 Migration | Future |
| 4.2 | Cloudflare Images CDN | Future |
| 4.3 | Analytics Dashboard | Future |
| 4.4 | Performance Monitoring | Future |

---

## Appendix A: Technology Decision Records

### ADR-001: Stay with Supabase for Phase 1-2

**Decision:** Continue using Supabase Storage instead of migrating to R2/S3.

**Rationale:**
- Supabase already configured for 50MB uploads
- Integrated auth + storage + database simplifies development
- Migration cost not justified until >1TB storage

**Consequences:**
- Higher egress costs at scale
- Plan migration in Phase 4

### ADR-002: tus-js-client for Uploads

**Decision:** Use tus protocol for chunked uploads.

**Rationale:**
- Industry standard for resumable uploads
- Small bundle size (~15KB)
- Well-maintained, production-ready

**Alternatives Considered:**
- Direct XHR with manual chunking (more complex)
- Uppy (larger bundle, more features than needed)

### ADR-003: CSS-based Layouts

**Decision:** Use CSS Grid/Columns for layouts, minimal JS libraries.

**Rationale:**
- Better performance than JS-based solutions
- Smaller bundle size
- Native browser support

**Libraries Selected:**
- react-masonry-css (~3KB) for Masonry only
- Native CSS for Grid, Tumblr, Timeline, Polaroid

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Album** | Collection of photos, can be personal or event-based |
| **Blurhash** | Compact representation of image placeholder |
| **CDN** | Content Delivery Network for fast image serving |
| **Edge Function** | Serverless function running at edge locations |
| **Organization** | Multi-user account for photographers/studios |
| **RLS** | Row Level Security in PostgreSQL |
| **tus** | Protocol for resumable file uploads |
| **Variant** | Resized version of an image (thumb, medium, large) |

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Original | Initial couples app architecture |
| 2.0 | Jan 2026 | @architect | Digital album platform expansion |
