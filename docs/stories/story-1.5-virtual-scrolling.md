# Story 1.5: Add Virtual Scrolling for Large Galleries

**Epic:** 1 - Performance Foundation
**Status:** Approved
**Priority:** Medium
**Estimate:** 1 week
**Assigned:** @dev

---

## User Story

**As a** user with hundreds of photos
**I want** my gallery to scroll smoothly
**So that** I can browse all my memories without lag

## Background

When galleries contain 500+ photos, rendering all DOM elements causes performance issues: slow initial render, janky scrolling, and high memory usage. Virtual scrolling renders only visible items plus a small buffer, maintaining smooth 60fps performance regardless of collection size.

## Acceptance Criteria

- [ ] Gallery with 1000+ photos maintains 60fps scroll
- [ ] Initial render time <500ms for large galleries
- [ ] Memory usage stays constant regardless of photo count
- [ ] Scroll position preserved on layout switch
- [ ] Works with all 5 gallery layouts
- [ ] Infinite scroll loads more photos at threshold
- [ ] Skeleton placeholders during scroll

## Technical Requirements

### Dependencies to Install
```bash
pnpm add @tanstack/react-virtual
```

### Files to Create/Modify

| File | Changes |
|------|---------|
| `components/VirtualGallery.tsx` | NEW - Virtual scroll wrapper |
| `components/layouts/*.tsx` | MODIFY - Integrate with virtualizer |
| `hooks/useInfinitePhotos.ts` | NEW - Infinite loading hook |
| `lib/store/scrollStore.ts` | NEW - Scroll position persistence |

### Implementation Notes

1. **Virtual Grid Setup:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

function VirtualGallery({ photos, layout, columns }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(photos.length / columns),
    getScrollElement: () => parentRef.current,
    estimateSize: () => getRowHeight(layout),
    overscan: 3, // Render 3 rows above/below viewport
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const startIndex = virtualRow.index * columns
          const rowPhotos = photos.slice(startIndex, startIndex + columns)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <GalleryRow photos={rowPhotos} layout={layout} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

2. **Masonry Virtualization:**
```typescript
// Masonry needs column-based virtualization
import { useWindowVirtualizer } from '@tanstack/react-virtual'

function VirtualMasonry({ photos }) {
  const columns = useResponsiveColumns() // 2-5 based on viewport
  const columnPhotos = distributeToColumns(photos, columns)

  // Virtualize each column independently
  const virtualizers = columnPhotos.map((colPhotos, colIndex) =>
    useVirtualizer({
      count: colPhotos.length,
      getScrollElement: () => window,
      estimateSize: (index) => colPhotos[index].height + 8,
    })
  )

  // ... render virtual columns
}
```

3. **Infinite Loading:**
```typescript
function useInfinitePhotos(albumId: string) {
  return useInfiniteQuery({
    queryKey: ['photos', albumId],
    queryFn: ({ pageParam = 0 }) =>
      fetchPhotos(albumId, { offset: pageParam, limit: 50 }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore ? pages.length * 50 : undefined,
  })
}

// In component
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePhotos(albumId)

// Trigger fetch when near bottom
const lastRowRef = useRef(null)
useIntersectionObserver({
  target: lastRowRef,
  onIntersect: fetchNextPage,
  enabled: hasNextPage && !isFetchingNextPage,
})
```

4. **Scroll Position Persistence:**
```typescript
const scrollStore = create((set) => ({
  positions: {},
  setPosition: (key, position) =>
    set((state) => ({
      positions: { ...state.positions, [key]: position }
    })),
  getPosition: (key) => get().positions[key] || 0,
}))

// On scroll
onScroll={(e) => scrollStore.setPosition(albumId, e.target.scrollTop)}

// On mount
useEffect(() => {
  const saved = scrollStore.getPosition(albumId)
  if (saved) parentRef.current?.scrollTo(0, saved)
}, [albumId])
```

5. **Skeleton Placeholders:**
```typescript
const PhotoSkeleton = () => (
  <div className="animate-pulse bg-gray-200 rounded aspect-square" />
)

// During fast scroll, show skeletons
{isScrolling ? <PhotoSkeleton /> : <OptimizedImage {...photo} />}
```

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial render | <500ms | Performance.measure |
| Scroll FPS | 60fps | Chrome DevTools |
| Memory (1000 photos) | <100MB | Chrome Task Manager |
| DOM nodes | <200 | React DevTools |

## Testing Checklist

- [ ] 100 photos: smooth scroll
- [ ] 500 photos: smooth scroll
- [ ] 1000 photos: smooth scroll
- [ ] 5000 photos: smooth scroll
- [ ] Scroll position preserved on navigation
- [ ] Infinite scroll loads more at threshold
- [ ] Works with all layouts
- [ ] Mobile scroll performance

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Performance targets met
- [ ] Works with all 5 layouts
- [ ] Infinite scroll implemented
- [ ] Scroll position persistence works
- [ ] Code review approved

---

## Notes

- Consider using window virtualizer for better mobile scroll
- May need layout-specific virtualization strategies
- Test on low-end devices
