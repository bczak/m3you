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

export function getCarouselLargeCount(viewportWidth: number) {
  if (viewportWidth >= 840) return 3;
  if (viewportWidth >= 600) return 2;
  return 1;
}

export function getCarouselSizeRoles(
  layout: CarouselLayout,
  count: number,
  activeIndex: number,
  viewportWidth: number,
  reducedMotion: boolean,
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

  const largeCount = Math.min(getCarouselLargeCount(viewportWidth), Math.max(count - 2, 1));
  const largeStart = Math.min(active, count - largeCount);
  const largeEnd = largeStart + largeCount - 1;
  const mediumIndex = largeEnd + 1 < count ? largeEnd + 1 : largeStart - 1;
  return Array.from({ length: count }, (_, index) => {
    if (index >= largeStart && index <= largeEnd) return 'large';
    if (index === mediumIndex) return 'medium';
    return 'small';
  });
}

export function getNearestCarouselItem(
  viewport: CarouselRect,
  items: CarouselRect[],
  orientation: 'horizontal' | 'vertical',
  alignment: 'start' | 'center',
  rtl: boolean,
) {
  if (items.length === 0) return 0;

  const viewportAnchor =
    orientation === 'vertical'
      ? alignment === 'center'
        ? viewport.top + viewport.height / 2
        : viewport.top
      : alignment === 'center'
        ? viewport.left + viewport.width / 2
        : rtl
          ? viewport.right
          : viewport.left;

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const itemAnchor =
      orientation === 'vertical'
        ? alignment === 'center'
          ? item.top + item.height / 2
          : item.top
        : alignment === 'center'
          ? item.left + item.width / 2
          : rtl
            ? item.right
            : item.left;
    const distance = Math.abs(itemAnchor - viewportAnchor);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }
  return nearestIndex;
}
