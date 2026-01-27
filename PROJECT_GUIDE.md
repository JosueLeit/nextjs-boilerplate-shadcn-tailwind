# FavoritePerson.app - Project Management Guide

> **Purpose**: Master reference document for development context. Access after `/compact`.

---

## 1. PRODUCT VISION

### Core Concept
A private digital photo memory wall for couples to store relationship memories. Unlike Instagram (public), this is a personal live memory accessible only via QR code sharing.

### Key Features
1. **PhotoWall UI** - Visual polaroid-style photo gallery organized by date
2. **Relationship Timer** - Shows time elapsed since relationship started
3. **QR Code Sharing** - Generate shareable link for others to view memories
4. **Private by Default** - Only accessible to owner and QR code holders
5. **User Settings** - Edit profile information and change password

### Target User Flow
```
Landing Page → Register → Login → PhotoWall → Add Memories → Share via QR
                                     ↓
                              Settings (edit profile/password)
```

---

## 2. CURRENT STATE ANALYSIS

### Working Features
| Feature | Status | Location |
|---------|--------|----------|
| Landing Page | ✅ Working | `/app/page.tsx` (unauthenticated) |
| User Registration | ✅ Working | `/app/register/page.tsx` |
| User Login | ✅ Working | `/app/login/page.tsx` |
| Password Reset Request | ✅ Working | `/app/reset-password/page.tsx` |
| Password Update | ✅ Working | `/app/update-password/page.tsx` |
| Photo Upload | ✅ Working | `/components/PhotoUploader.tsx` |
| Image Preview on Upload | ✅ Working | `/components/PhotoUploader.tsx` |
| Photo Grid Display | ✅ Working | `/components/PhotoGrid.tsx` |
| Photo Deletion | ✅ Working | `/components/Polaroid.tsx` |
| Relationship Timer | ✅ Working | `/components/RelationshipTimer.tsx` |
| Profile Database | ✅ Working | `lib/supabaseClient.ts` |
| QR Code Generation | ✅ Working | `/components/QRCodeGenerator.tsx` |
| Public Share Page | ✅ Working | `/app/share/[token]/page.tsx` |
| User Settings | ✅ Working | `/app/settings/page.tsx` |
| Auth Error State | ✅ Fixed | `/contexts/AuthContext.tsx` |
| Logout Flow | ✅ Fixed | Clears cookies properly |
| Login Redirect | ✅ Fixed | Uses window.location.href |

### Pending Features
| Feature | Status | Priority |
|---------|--------|----------|
| Photo Edit (caption/date) | ⏳ Pending | MEDIUM |
| Onboarding Flow | ⏳ Pending | MEDIUM |
| Dark Mode | ⏳ Pending | LOW |
| Account Deletion | ⏳ Pending | LOW |

### Resolved Issues
1. ~~**AuthContext Type Mismatch**~~ - Fixed: Added error/setError to context
2. ~~**No Landing Page**~~ - Fixed: Added landing page for unauthenticated users
3. ~~**No QR Sharing**~~ - Fixed: QR code generation and share page implemented
4. ~~**Duplicate Components**~~ - Fixed: Removed RelationshipCounter.tsx
5. ~~**Logout not working**~~ - Fixed: Clears manual cookies and uses window.location
6. ~~**Login not redirecting**~~ - Fixed: Uses window.location.href
7. ~~**Multiple API calls**~~ - Fixed: Added refs to prevent duplicate fetches
8. ~~**Image preview not showing**~~ - Fixed: Added URL.createObjectURL()
9. ~~**Reset password redirect**~~ - Fixed: Created /update-password page

---

## 3. ARCHITECTURE

### File Structure
```
app/
├── page.tsx              # Home (Landing or PhotoWall based on auth)
├── login/page.tsx        # Login
├── register/page.tsx     # Registration
├── reset-password/page.tsx # Request password reset
├── update-password/page.tsx # Set new password (from email link)
├── settings/page.tsx     # User settings
├── onboarding/page.tsx   # Onboarding flow
├── share/[token]/page.tsx # Public share page
└── layout.tsx            # Root layout

components/
├── PhotoGrid.tsx         # Photo organization
├── PhotoUploader.tsx     # Upload modal with image preview
├── Polaroid.tsx          # Photo card
├── RelationshipTimer.tsx # Time counter
├── QRCodeGenerator.tsx   # QR code modal
├── LoadingScreen.tsx     # Loading state
└── ui/                   # shadcn components

lib/
├── supabaseClient.ts     # API functions
└── store/auth.ts         # Zustand store (legacy)

contexts/
└── AuthContext.tsx       # Auth provider (simplified, no external store)
```

### Database Schema
```sql
profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  relationship_start_date DATE,
  onboarding_completed BOOLEAN DEFAULT false,
  share_token UUID DEFAULT gen_random_uuid(),
  share_token_created_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Storage bucket: vcinesquecivel
-- Structure: /{userId}/{YYYY-MM-DD-caption}.{ext}
```

---

## 4. IMPLEMENTATION ROADMAP

### PHASE 1: Fix Critical Issues ✅ COMPLETED
- [x] Fix AuthContext Error State
- [x] Remove Duplicate Components
- [x] Clean Unused Imports
- [x] Fix Logout (clear cookies)
- [x] Fix Login Redirect (use window.location)
- [x] Add Landing Page
- [x] Fix duplicate API calls

### PHASE 2: Onboarding Flow (⏳ OPTIONAL)
- [ ] Create Onboarding Page
- [ ] Update Middleware for onboarding redirect
- [ ] Update Profile Functions

### PHASE 3: QR Code Sharing ✅ COMPLETED
- [x] Add Share Token to Database
- [x] Add Regenerate Token Function
- [x] Create QR Code Component
- [x] Create Public Share Page
- [x] Add Share Button to Home

### PHASE 4: UI/UX Improvements ✅ PARTIALLY COMPLETED
- [x] Image Preview on Upload
- [x] User Settings Page
- [x] Password Update Flow
- [ ] Photo Edit Functionality
- [ ] Loading States (Skeleton loaders)
- [ ] Error Handling (Error boundary)
- [ ] Mobile Optimization

### PHASE 5: Security Hardening ✅ PARTIALLY COMPLETED
- [x] Simplify Token Management (removed manual cookies)
- [x] Trust Supabase session only
- [ ] Add Rate Limiting
- [ ] Input Validation improvements

---

## 5. TEST ROUTINES

### Authentication Tests
```
[x] Register new user → Profile created in database
[x] Login with valid credentials → Redirected to home
[x] Login with invalid credentials → Error message displayed
[x] Password reset → Email sent successfully
[x] Password update → New password works
[x] Logout → Session cleared, redirected to login
[x] Access protected route without auth → Redirected to login
```

### Photo Management Tests
```
[x] Upload photo → File appears in storage bucket
[x] Upload photo → Image preview shows before upload
[x] Upload photo → Photo displays in grid
[x] Delete photo → File removed from storage
[x] Delete photo → Photo removed from grid
[x] Photo grid → Organized by year/month
[ ] Edit photo → Caption/date updated (not implemented)
```

### QR Sharing Tests
```
[x] Generate QR → Contains correct share URL
[x] Share page → Shows photos (no auth)
[x] Share page → No edit/delete buttons
[x] Share page → Timer displays correctly
[x] Invalid token → Shows error page
[x] Regenerate token → Old links stop working
```

### Settings Tests
```
[x] View settings → Shows current profile data
[x] Update relationship date → Saved to database
[x] Change password → Password updated
[ ] Delete account → Account removed (not implemented)
```

---

## 6. FILES MODIFIED/CREATED

### Session Changes (Latest)
| File | Action | Description |
|------|--------|-------------|
| `contexts/AuthContext.tsx` | Modified | Simplified auth, fixed logout/login redirects |
| `app/page.tsx` | Modified | Added landing page, settings button, fixed duplicate fetches |
| `components/PhotoUploader.tsx` | Modified | Added image preview |
| `app/update-password/page.tsx` | Created | Handle password reset callback |
| `app/settings/page.tsx` | Created | User settings page |
| `lib/supabaseClient.ts` | Modified | Added redirect URL to resetPassword |
| `middleware.ts` | Modified | Added update-password to public routes |
| `app/layout.tsx` | Modified | Removed debug script causing errors |

---

## 7. DEPENDENCIES

### Installed
```bash
qrcode.react        # QR Code generation
framer-motion       # Animations
@supabase/supabase-js
@supabase/auth-helpers-nextjs
```

### Optional (Future)
```bash
react-error-boundary  # Error handling
@tanstack/react-query # Data fetching optimization
```

---

## 8. QUICK REFERENCE

### Supabase Project
- **URL**: `https://lfuzflllwigalmuxagkr.supabase.co`
- **Bucket**: `vcinesquecivel`
- **Table**: `profiles`

### Dev Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run linter
rm -rf .next      # Clear cache (if webpack errors)
```

### Key Patterns
- **Auth**: `useAuth()` hook from AuthContext
- **Photos**: `getPhotos(userId)`, `uploadPhoto(file, caption, date, userId)`
- **Profile**: `getProfile(userId)`, `updateProfile(userId, data)`
- **Share**: `getProfileByShareToken(token)`, `regenerateShareToken(userId)`

### Common Issues & Solutions
| Issue | Solution |
|-------|----------|
| Webpack chunk errors | `rm -rf .next && pnpm build` |
| Logout not working | Clear cookies + use `window.location.href` |
| Login not redirecting | Use `window.location.href` instead of `router.push` |
| Duplicate API calls | Use refs to track fetch state |
| Image preview not showing | Use `URL.createObjectURL()` |

---

## 9. NEXT STEPS (Prioritized)

1. **Photo Edit Feature** - Allow editing caption/date of existing photos
2. **Mobile Optimization** - Test and improve touch interactions
3. **Account Deletion** - Implement delete account functionality
4. **Onboarding Flow** - Optional guided setup for new users
5. **Dark Mode** - Add theme toggle

---

*Last Updated: Session after fixing auth issues, image preview, and adding settings page*
