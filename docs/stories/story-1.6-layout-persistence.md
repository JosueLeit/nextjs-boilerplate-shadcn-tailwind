# Story 1.6: Implement Layout Persistence & Switching

**Epic:** 1 - Performance Foundation
**Status:** Approved
**Priority:** Low
**Estimate:** 3 days
**Assigned:** @dev

---

## User Story

**As a** user who prefers a specific layout
**I want** my layout preference to be remembered
**So that** I don't have to switch layouts every time I visit

## Background

Users will have preferred layouts based on their use case (couples prefer Polaroid, photographers prefer Masonry, etc.). Layout preference should persist per-album and have a global default.

## Acceptance Criteria

- [ ] Global default layout preference saved
- [ ] Per-album layout override supported
- [ ] Preference synced to database for logged-in users
- [ ] Fallback to localStorage for guests
- [ ] Layout loads without flash of wrong layout
- [ ] Smooth animated transition when switching
- [ ] Reduced motion respected

## Technical Requirements

### Files to Create/Modify

| File | Changes |
|------|---------|
| `lib/store/layoutStore.ts` | MODIFY - Add persistence |
| `hooks/useLayoutPreference.ts` | NEW - Preference hook |
| `components/LayoutSwitcher.tsx` | MODIFY - Save on change |
| `app/album/[id]/page.tsx` | MODIFY - Load preference |

### Implementation Notes

1. **Zustand Store with Persistence:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  defaultLayout: LayoutType
  albumLayouts: Record<string, LayoutType>
  setDefaultLayout: (layout: LayoutType) => void
  setAlbumLayout: (albumId: string, layout: LayoutType) => void
  getLayout: (albumId?: string) => LayoutType
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      defaultLayout: 'polaroid',
      albumLayouts: {},

      setDefaultLayout: (layout) => set({ defaultLayout: layout }),

      setAlbumLayout: (albumId, layout) => set((state) => ({
        albumLayouts: { ...state.albumLayouts, [albumId]: layout }
      })),

      getLayout: (albumId) => {
        const state = get()
        if (albumId && state.albumLayouts[albumId]) {
          return state.albumLayouts[albumId]
        }
        return state.defaultLayout
      },
    }),
    {
      name: 'layout-preference',
      partialize: (state) => ({
        defaultLayout: state.defaultLayout,
        albumLayouts: state.albumLayouts,
      }),
    }
  )
)
```

2. **Database Sync for Logged-In Users:**
```typescript
// Sync to Supabase profiles table
const useSyncLayoutPreference = () => {
  const { user } = useAuth()
  const { defaultLayout, albumLayouts } = useLayoutStore()

  // Sync on change (debounced)
  useEffect(() => {
    if (!user) return

    const sync = debounce(async () => {
      await supabase
        .from('profiles')
        .update({
          layout_preferences: {
            default: defaultLayout,
            albums: albumLayouts
          }
        })
        .eq('id', user.id)
    }, 1000)

    sync()
    return () => sync.cancel()
  }, [user, defaultLayout, albumLayouts])
}

// Load on login
const useLoadLayoutPreference = () => {
  const { user } = useAuth()
  const { setDefaultLayout } = useLayoutStore()

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('layout_preferences')
        .eq('id', user.id)
        .single()

      if (data?.layout_preferences) {
        setDefaultLayout(data.layout_preferences.default)
        // ... set album layouts
      }
    }

    load()
  }, [user])
}
```

3. **Prevent Flash of Wrong Layout:**
```typescript
// In album page
export default function AlbumPage({ params }) {
  const [ready, setReady] = useState(false)
  const layout = useLayoutStore((s) => s.getLayout(params.id))

  // Wait for hydration
  useEffect(() => {
    setReady(true)
  }, [])

  if (!ready) {
    return <GallerySkeleton /> // Show skeleton, not wrong layout
  }

  return <Gallery layout={layout} />
}
```

4. **Animated Layout Transition:**
```typescript
import { AnimatePresence, motion } from 'framer-motion'

const Gallery = ({ layout, photos }) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={layout}
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <LayoutComponent layout={layout} photos={photos} />
      </motion.div>
    </AnimatePresence>
  )
}
```

5. **Settings UI for Default Layout:**
```typescript
const LayoutSettings = () => {
  const { defaultLayout, setDefaultLayout } = useLayoutStore()

  return (
    <section>
      <h3>Layout padrão</h3>
      <p className="text-sm text-gray-500">
        Escolha como suas fotos são exibidas por padrão
      </p>
      <RadioGroup value={defaultLayout} onValueChange={setDefaultLayout}>
        {layouts.map(l => (
          <RadioGroupItem key={l.id} value={l.id}>
            <l.icon className="w-5 h-5" />
            {l.label}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </section>
  )
}
```

## Database Schema Update

```sql
-- Add to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS layout_preferences JSONB DEFAULT '{"default": "polaroid", "albums": {}}';
```

## Testing Checklist

- [ ] Default layout persists across sessions
- [ ] Per-album layout overrides default
- [ ] Logged-in user syncs to database
- [ ] Guest user uses localStorage
- [ ] No flash of wrong layout on load
- [ ] Transition animation smooth
- [ ] Reduced motion respected
- [ ] Settings UI saves preference

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Database migration applied
- [ ] Sync works for logged-in users
- [ ] LocalStorage fallback works
- [ ] Settings UI implemented
- [ ] Code review approved

---

## Notes

- Consider adding "Reset to default" option
- Per-album layout useful for photographers with different client preferences
- Future: Allow album owners to set forced layout for viewers
