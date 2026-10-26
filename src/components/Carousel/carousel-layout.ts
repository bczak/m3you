export type CarouselLayout =
  | 'multi-browse'
  | 'uncontained'
  | 'uncontained-multi-aspect'
  | 'hero'
  | 'centered-hero'
  | 'full-screen';

export type CarouselScrollMode = 'auto' | 'snap' | 'free';

export type CarouselItemSizeRole = 'large' | 'medium' | 'small' | 'uniform' | 'full';

export type CarouselRect = Pick<DOMRect, 'bottom' | 'height' | 'left' | 'right' | 'top' | 'width'>;

export function clampCarouselIndex(index: number, count: number) {
  if (count <= 0) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), count - 1);
}

export function resolveCarouselScrollMode(layout: CarouselLayout, scrollMode: CarouselScrollMode) {
  if (layout === 'full-screen') return 'snap';
  if (scrollMode !== 'auto') return scrollMode;
  return layout === 'uncontained' || layout === 'uncontained-multi-aspect' ? 'free' : 'snap';
}

/** Resolved multi-browse lengths, in px, measured inside the viewport. */
export type CarouselMetrics = {
  /** Inline size of the viewport's content box — what `100cqi` resolves to for its items. */
  contentWidth: number;
  largeItemMaxWidth: number;
  mediumItemWidth: number;
  smallItemWidth: number;
  gap: number;
};

export function getCarouselLargeCount(viewportWidth: number, metrics?: CarouselMetrics) {
  const breakpointCount = viewportWidth >= 840 ? 3 : viewportWidth >= 600 ? 2 : 1;
  if (!metrics) return breakpointCount;
  // A row of n large items, one medium and one small fills the content box when
  // n·L + M + S + (n + 1)·gap = content. Large items are capped, so wide
  // viewports need more of them for L to stay within the cap:
  // n ≥ (content − M − S − gap) / (cap + gap). The breakpoint count stays the
  // floor, so the narrower layouts keep their kit proportions.
  const { contentWidth, largeItemMaxWidth, mediumItemWidth, smallItemWidth, gap } = metrics;
  const step = largeItemMaxWidth + gap;
  if (!(step > 0)) return breakpointCount;
  // The epsilon absorbs float noise when the row fills exactly at the cap.
  const cappedCount = Math.ceil((contentWidth - mediumItemWidth - smallItemWidth - gap) / step - 1e-6);
  return Math.max(breakpointCount, cappedCount);
}

export function getClampedCarouselLargeCount(viewportWidth: number, itemCount: number, metrics?: CarouselMetrics) {
  return Math.min(getCarouselLargeCount(viewportWidth, metrics), Math.max(itemCount - 2, 1));
}

export function getCarouselSizeRoles(
  layout: CarouselLayout,
  count: number,
  activeIndex: number,
  viewportWidth: number,
  reducedMotion: boolean,
  metrics?: CarouselMetrics,
): CarouselItemSizeRole[] {
  if (count <= 0) return [];
  if (layout === 'full-screen') return Array.from({ length: count }, () => 'full');
  if (layout === 'uncontained' || layout === 'uncontained-multi-aspect') {
    return Array.from({ length: count }, () => 'uniform');
  }

  const active = clampCarouselIndex(activeIndex, count);
  if (layout === 'hero' || layout === 'centered-hero') {
    return Array.from({ length: count }, (_, index) => (index === active ? 'large' : 'small'));
  }
  if (reducedMotion) return Array.from({ length: count }, () => 'uniform');

  const largeCount = getClampedCarouselLargeCount(viewportWidth, count, metrics);
  const largeStart = Math.min(active, count - largeCount);
  const largeEnd = largeStart + largeCount - 1;
  const mediumIndex = largeEnd + 1 < count ? largeEnd + 1 : largeStart - 1;
  return Array.from({ length: count }, (_, index) => {
    if (index >= largeStart && index <= largeEnd) return 'large';
    if (index === mediumIndex) return 'medium';
    return 'small';
  });
}

/** The physical coordinate a rect aligns by along the scroll axis: its start edge, or its centre. */
export function getCarouselAlignmentPoint(
  rect: CarouselRect,
  orientation: 'horizontal' | 'vertical',
  alignment: 'start' | 'center',
  rtl: boolean,
) {
  if (orientation === 'vertical') return alignment === 'center' ? rect.top + rect.height / 2 : rect.top;
  if (alignment === 'center') return rect.left + rect.width / 2;
  return rtl ? rect.right : rect.left;
}

export function getNearestCarouselItem(
  viewport: CarouselRect,
  items: CarouselRect[],
  orientation: 'horizontal' | 'vertical',
  alignment: 'start' | 'center',
  rtl: boolean,
) {
  if (items.length === 0) return 0;

  const viewportAnchor = getCarouselAlignmentPoint(viewport, orientation, alignment, rtl);

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < items.length; index += 1) {
    const itemAnchor = getCarouselAlignmentPoint(items[index], orientation, alignment, rtl);
    const distance = Math.abs(itemAnchor - viewportAnchor);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }
  return nearestIndex;
}
