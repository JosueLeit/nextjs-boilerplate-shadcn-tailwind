# Story 1.4: Implement Multiple Gallery Layouts

**Epic:** 1 - Performance Foundation
**Status:** Approved
**Priority:** Medium
**Estimate:** 1 week
**Assigned:** @dev

---

## User Story

**As a** user viewing my photo albums
**I want to** choose different layout styles for my gallery
**So that** I can personalize how my memories are displayed

## Background

Currently, FavoritePerson.app only supports the Polaroid layout. The UX team has designed 5 layout options to appeal to different use cases: personal (Polaroid), professional (Masonry), discovery (Mosaic), storytelling (Timeline), and blog-style (Tumblr).

## Acceptance Criteria

- [ ] 5 layout options available: Mosaic, Tumblr, Polaroid, Timeline, Masonry
- [ ] Layout switcher visible in gallery toolbar
- [ ] Smooth transition animation between layouts
- [ ] Layouts are responsive (mobile/tablet/desktop)
- [ ] Polaroid layout enhanced with date stamps and tape decorations
- [ ] Timeline layout groups photos by date with sticky headers

## Technical Requirements

### Dependencies to Install
```bash
pnpm add react-masonry-css
```

### Files to Create/Modify

| File | Changes |
|------|---------|
| `components/layouts/MosaicLayout.tsx` | NEW - Pinterest-style variable grid |
| `components/layouts/TumblrLayout.tsx` | NEW - Single column blog style |
| `components/layouts/PolaroidLayout.tsx` | REFACTOR - Enhanced from current |
| `components/layouts/TimelineLayout.tsx` | NEW - Date-grouped chronological |
| `components/layouts/MasonryLayout.tsx` | NEW - Classic masonry grid |
| `components/LayoutSwitcher.tsx` | NEW - Layout selection toolbar |
| `components/GalleryGrid.tsx` | NEW - Layout wrapper component |
| `lib/store/layoutStore.ts` | NEW - Layout preference state |

### Layout Specifications

**1. Mosaic (Pinterest-style):**
```typescript
// Variable height, fills gaps
const MosaicLayout = ({ photos }) => (
  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
    {photos.map(photo => (
      <div key={photo.id} className="mb-2 break-inside-avoid">
        <OptimizedImage {...photo} />
      </div>
    ))}
  </div>
)
```

**2. Tumblr (Blog feed):**
```typescript
// Single column, centered, with captions
const TumblrLayout = ({ photos }) => (
  <div className="max-w-[600px] mx-auto space-y-12">
    {photos.map(photo => (
      <article key={photo.id}>
        <OptimizedImage {...photo} className="w-full" />
        <p className="mt-4 text-gray-700">{photo.caption}</p>
        <div className="flex gap-4 mt-2 text-sm text-gray-500">
          <button>♥ {photo.likes}</button>
          <button>↗ Compartilhar</button>
        </div>
      </article>
    ))}
  </div>
)
```

**3. Polaroid (Enhanced current):**
```typescript
// Random rotation, frame, handwritten caption
const PolaroidLayout = ({ photos }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
    {photos.map(photo => (
      <div
        key={photo.id}
        className="bg-white p-3 pb-12 shadow-lg"
        style={{ transform: `rotate(${getRotation(photo.id)}deg)` }}
      >
        <OptimizedImage {...photo} />
        <p className="font-handwriting mt-2">{photo.caption}</p>
        {photo.showDate && (
          <span className="text-xs text-gray-400">{photo.date}</span>
        )}
      </div>
    ))}
  </div>
)
```

**4. Timeline:**
```typescript
// Grouped by date with sticky headers
const TimelineLayout = ({ photos }) => {
  const grouped = groupByDate(photos)

  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-pink-300" />
      {Object.entries(grouped).map(([date, datePhotos]) => (
        <section key={date}>
          <h3 className="sticky top-0 bg-white py-2 font-semibold">
            {formatDate(date)}
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-4">
            {datePhotos.map(photo => (
              <OptimizedImage key={photo.id} {...photo} className="w-32 h-32" />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
```

**5. Masonry:**
```typescript
import Masonry from 'react-masonry-css'

const MasonryLayout = ({ photos }) => (
  <Masonry
    breakpointCols={{ default: 4, 1024: 3, 768: 2 }}
    className="flex gap-2"
    columnClassName="flex flex-col gap-2"
  >
    {photos.map(photo => (
      <OptimizedImage key={photo.id} {...photo} />
    ))}
  </Masonry>
)
```

### Layout Switcher Component

```typescript
const layouts = [
  { id: 'mosaic', icon: GridIcon, label: 'Mosaico' },
  { id: 'tumblr', icon: ListIcon, label: 'Blog' },
  { id: 'polaroid', icon: SquareIcon, label: 'Polaroid' },
  { id: 'timeline', icon: ClockIcon, label: 'Linha do tempo' },
  { id: 'masonry', icon: LayoutIcon, label: 'Grade' },
]

const LayoutSwitcher = () => {
  const { layout, setLayout } = useLayoutStore()

  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
      {layouts.map(l => (
        <button
          key={l.id}
          onClick={() => setLayout(l.id)}
          className={cn(
            "p-2 rounded",
            layout === l.id && "bg-white shadow"
          )}
          title={l.label}
        >
          <l.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  )
}
```

## UI Mockup

```
┌──────────────────────────────────────────────────┐
│  Minhas Fotos                    [Layout: ▣≡⊞║▤]│
├──────────────────────────────────────────────────┤
│                                                  │
│  [Current layout renders here based on selection]│
│                                                  │
└──────────────────────────────────────────────────┘
```

## Animation Requirements

- Layout transitions use FLIP technique
- Duration: 300-400ms
- Easing: ease-out
- Respect `prefers-reduced-motion`

## Testing Checklist

- [ ] All 5 layouts render correctly
- [ ] Layouts responsive on mobile/tablet/desktop
- [ ] Layout switch animates smoothly
- [ ] Empty state handled for each layout
- [ ] 100+ photos perform well in each layout
- [ ] Touch interactions work on mobile

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All 5 layouts implemented
- [ ] Responsive breakpoints tested
- [ ] Animation performance verified (60fps)
- [ ] Accessibility: keyboard navigation works
- [ ] Code review approved

---

## Notes

- Coordinate with Story 1.5 for virtual scrolling
- Coordinate with Story 1.6 for layout persistence
- Consider adding layout preview tooltip
