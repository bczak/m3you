import './carousel.css';

import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import {
  type CarouselLayout,
  type CarouselMetrics,
  type CarouselScrollMode,
  clampCarouselIndex,
  getCarouselAlignmentPoint,
  getCarouselSizeRoles,
  getClampedCarouselLargeCount,
  getNearestCarouselItem,
  resolveCarouselScrollMode,
} from './carousel-layout';

export type { CarouselLayout, CarouselScrollMode } from './carousel-layout';

export type CarouselAlignment = 'start' | 'center';

type CarouselBaseItemProps = {
  /** Accessible item name. Position information is appended automatically. */
  label: string;
  children: React.ReactNode;
  /** Aspect ratio of the item's content box. Accepts any CSS aspect-ratio value. */
  aspectRatio?: React.CSSProperties['aspectRatio'];
  /** Disable the item and skip it in keyboard navigation. */
  disabled?: boolean;
  /** Additional class names for the inner item element. */
  itemClassName?: string;
};

export type CarouselLinkItemProps = CarouselBaseItemProps &
  Omit<React.ComponentProps<'a'>, keyof CarouselBaseItemProps | 'aria-label' | 'children' | 'href'> & {
    href: string;
  };

export type CarouselButtonItemProps = CarouselBaseItemProps &
  Omit<React.ComponentProps<'button'>, keyof CarouselBaseItemProps | 'aria-label' | 'children' | 'onClick'> & {
    href?: never;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
  };

export type CarouselItemProps = CarouselLinkItemProps | CarouselButtonItemProps;

export type CarouselProps = Omit<React.ComponentProps<'section'>, 'children' | 'onScroll'> & {
  /** Accessible name for the carousel. Required — item positions are announced relative to it. */
  label: string;
  /** One of the six M3 layouts. `multi-browse` shrinks items towards the edges; the hero layouts give one item prominence. */
  layout?: CarouselLayout;
  /** Whether items settle to the start of the viewport or its centre. */
  alignment?: CarouselAlignment;
  /** `snap` locks to item boundaries, `free` scrolls continuously, `auto` picks whichever suits the layout. */
  scrollMode?: CarouselScrollMode;
  /** Cap on the width of the largest item. Accepts any CSS length. */
  largeItemMaxWidth?: React.CSSProperties['width'];
  /** Height applied to every item. Accepts any CSS length. */
  itemHeight?: React.CSSProperties['height'];
  /** Heading rendered above the carousel. */
  title?: React.ReactNode;
  /** An action that reaches the same content without horizontal scrolling. Expected on every carousel that is not full-screen. */
  showAllAction?: React.ReactNode;
  /** Item to scroll to on mount. */
  initialIndex?: number;
  /** Called with the index of the item that becomes active as the carousel scrolls. */
  onActiveIndexChange?: (index: number) => void;
  children: React.ReactElement<CarouselItemProps> | React.ReactElement<CarouselItemProps>[];
};

type CarouselItemContextValue = {
  count: number;
  index: number;
  layout: CarouselLayout;
};

type CarouselAnimations = Map<HTMLElement, Animation>;

const CarouselItemContext = React.createContext<CarouselItemContextValue | null>(null);
const SETTLE_DELAY = 120;

function isCarouselItemElement(child: React.ReactNode): child is React.ReactElement<CarouselItemProps> {
  return React.isValidElement<CarouselItemProps>(child) && child.type === CarouselItem;
}

function toCssLength(value: React.CSSProperties['height'] | React.CSSProperties['width']) {
  return typeof value === 'number' ? `${value}px` : value;
}

function getCarouselItems(viewport: HTMLUListElement) {
  return Array.from(viewport.querySelectorAll<HTMLElement>(':scope > [data-md-carousel-item]'));
}

function getCarouselActions(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-md-carousel-action]')).filter(
    (element) =>
      element.getAttribute('aria-disabled') !== 'true' && !(element instanceof HTMLButtonElement && element.disabled),
  );
}

function setActiveItem(items: HTMLElement[], activeIndex: number) {
  for (let index = 0; index < items.length; index += 1) {
    if (index === activeIndex) items[index].setAttribute('data-active', '');
    else items[index].removeAttribute('data-active');
  }
}

function readPixels(element: Element) {
  return Number.parseFloat(getComputedStyle(element).width) || 0;
}

const PROBE_LENGTHS = ['large', 'medium', 'small', 'gap'] as const;

/**
 * Resolves the multi-browse lengths to px. They are public tokens that accept
 * any CSS length (`24rem`, `min(40vw, 400px)`…), so they are measured from a
 * probe inside the viewport — where `cqi` resolves as it does for the items —
 * which is inserted and removed before the browser paints.
 */
function measureCarouselMetrics(viewport: HTMLUListElement): CarouselMetrics {
  const probe = viewport.ownerDocument.createElement('li');
  probe.className = 'md-carousel__probe';
  probe.setAttribute('aria-hidden', 'true');
  for (const length of PROBE_LENGTHS) {
    const span = viewport.ownerDocument.createElement('span');
    span.dataset.length = length;
    probe.append(span);
  }
  viewport.append(probe);
  const [largeItemMaxWidth, mediumItemWidth, smallItemWidth, gap] = Array.from(probe.children, readPixels);
  const contentWidth = readPixels(probe);
  probe.remove();
  return { contentWidth, largeItemMaxWidth, mediumItemWidth, smallItemWidth, gap };
}

/** Fallbacks for --md-sys-motion-duration/easing-spring-default-spatial. */
const MORPH_DURATION = 500;
const MORPH_EASING = 'cubic-bezier(0.38, 1.21, 0.22, 1)';

function readMorphTiming(viewport: HTMLElement): KeyframeAnimationOptions {
  const style = getComputedStyle(viewport);
  const durationToken = style.getPropertyValue('--md-sys-motion-duration-spring-default-spatial').trim();
  const easing = style.getPropertyValue('--md-sys-motion-easing-spring-default-spatial').trim();
  const duration = Number.parseFloat(durationToken);
  return {
    duration: Number.isFinite(duration) ? (durationToken.endsWith('ms') ? duration : duration * 1000) : MORPH_DURATION,
    easing: easing || MORPH_EASING,
  };
}

const MORPHING_ROLES: ReadonlySet<string | undefined> = new Set(['large', 'medium', 'small']);
/** The layout and role (and, for multi-browse large items, the large count) each item was last sized for. */
const appliedItemSizes = new WeakMap<HTMLElement, string>();

/**
 * Morphs an item's real width rather than scaling it, so its 28dp corners and
 * its content keep their shape while it grows or shrinks. Neighbours reflow
 * with it; a snapping viewport stays snapped to the active item, and a
 * free-scrolling one is held on it by `holdCarouselItem`.
 */
function morphItemWidth(
  item: HTMLElement,
  fromWidth: number,
  timing: KeyframeAnimationOptions,
  animations: CarouselAnimations,
) {
  animations.get(item)?.cancel();
  // Only the start keyframe is given (offset 0 — a lone keyframe would default to
  // the end), so the morph animates towards the item's underlying flex-basis and
  // lands on whatever its new size role resolves to, even mid-resize.
  const animation = item.animate([{ flexBasis: `${fromWidth}px`, offset: 0 }], timing);
  animations.set(item, animation);
  const release = () => {
    if (animations.get(item) === animation) animations.delete(item);
  };
  animation.finished.then(release, release);
}

/**
 * Sizes every item for the active one and morphs the items whose size changed.
 * Returns whether any item that was already sized changed size.
 */
function applyCarouselRoles(
  viewport: HTMLUListElement,
  layout: CarouselLayout,
  activeIndex: number,
  reducedMotion: boolean,
  animations: CarouselAnimations,
) {
  const items = getCarouselItems(viewport);
  // Read every on-screen width before any role changes, so a morph starts where
  // the item is — including mid-way through an earlier morph.
  const previousWidths = reducedMotion ? [] : items.map(readPixels);
  const width = viewport.getBoundingClientRect().width || viewport.clientWidth;
  const metrics = layout === 'multi-browse' && !reducedMotion ? measureCarouselMetrics(viewport) : undefined;
  const roles = getCarouselSizeRoles(layout, items.length, activeIndex, width, reducedMotion, metrics);
  const largeCount = getClampedCarouselLargeCount(width, items.length, metrics);
  const changes = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const role = roles[index];
    const previousSize = appliedItemSizes.get(item);
    // The large count only sizes multi-browse's large items.
    const size =
      layout === 'multi-browse' && role === 'large' ? `${layout} ${role} ${largeCount}` : `${layout} ${role}`;
    // A plain resize keeps the size, and any morph still running towards it.
    if (previousSize === size) continue;
    const fromWidth = previousWidths[index];
    // Mount, reduced motion, an unpainted item and the switch to or from uniform
    // or full sizing don't morph: the new size applies at once, even mid-morph.
    const morphs =
      !reducedMotion &&
      previousSize !== undefined &&
      MORPHING_ROLES.has(role) &&
      MORPHING_ROLES.has(item.dataset.sizeRole) &&
      fromWidth > 0;
    changes.push({ item, role, size, fromWidth, morphs, resized: previousSize !== undefined });
  }
  // Every morph starts — pinning its item at its current width — before any
  // size changes. Reading the timing tokens forces a layout, and a layout that
  // saw some items already shrunk and others not yet grown would narrow the
  // strip and clamp its scroll position.
  const timing = changes.some((change) => change.morphs) ? readMorphTiming(viewport) : undefined;
  for (const { item, fromWidth, morphs } of changes) {
    if (timing && morphs) morphItemWidth(item, fromWidth, timing, animations);
    else animations.get(item)?.cancel();
  }
  viewport.style.setProperty('--md-carousel-large-count', String(largeCount));
  for (const { item, role, size } of changes) {
    item.dataset.sizeRole = role;
    appliedItemSizes.set(item, size);
  }
  setActiveItem(items, activeIndex);
  return changes.some((change) => change.resized);
}

/** Where an item's alignment point sits relative to the viewport's, along the inline axis. */
function getItemAlignmentOffset(viewport: HTMLElement, item: HTMLElement, alignment: CarouselAlignment, rtl: boolean) {
  return (
    getCarouselAlignmentPoint(item.getBoundingClientRect(), 'horizontal', alignment, rtl) -
    getCarouselAlignmentPoint(viewport.getBoundingClientRect(), 'horizontal', alignment, rtl)
  );
}

type CarouselScrollHold = {
  frame: number | null;
  /** The scroll offset the carousel last wrote, so its own corrections are not taken for the user scrolling. */
  scrollLeft: number;
};

/**
 * Keeps a free-scrolling viewport on the active item while the items around it
 * change size. Nothing snaps it back, so without this the items shrinking
 * before it would carry it off the start. The scroll position is corrected on
 * every frame of the morph, and the hold lets go as soon as the user scrolls.
 */
function holdCarouselItem(
  viewport: HTMLElement,
  item: HTMLElement,
  offset: number,
  alignment: CarouselAlignment,
  rtl: boolean,
  animations: CarouselAnimations,
): CarouselScrollHold {
  const hold: CarouselScrollHold = { frame: null, scrollLeft: viewport.scrollLeft };
  const correct = () => {
    const drift = getItemAlignmentOffset(viewport, item, alignment, rtl) - offset;
    // Instant even under an inherited `scroll-behavior: smooth`: a smooth
    // correction would land frames late and read as the user scrolling.
    if (Math.abs(drift) >= 0.5) viewport.scrollBy({ left: drift, behavior: 'instant' });
    hold.scrollLeft = viewport.scrollLeft;
  };
  const step = () => {
    hold.frame = null;
    if (!item.isConnected || Math.abs(viewport.scrollLeft - hold.scrollLeft) > 1) return;
    correct();
    if (animations.size > 0) hold.frame = requestAnimationFrame(step);
  };
  correct();
  if (animations.size > 0) hold.frame = requestAnimationFrame(step);
  return hold;
}

function releaseCarouselHold(holdRef: React.MutableRefObject<CarouselScrollHold | null>) {
  const frame = holdRef.current?.frame;
  if (frame != null) cancelAnimationFrame(frame);
  holdRef.current = null;
}

/** Whether the viewport is still where the hold last put it — so a scroll event is the hold's own. */
function isHeldScroll(viewport: HTMLElement, hold: CarouselScrollHold | null) {
  return hold !== null && Math.abs(viewport.scrollLeft - hold.scrollLeft) <= 1;
}

function updateCarouselParallax(viewport: HTMLUListElement, layout: CarouselLayout, reducedMotion: boolean) {
  const viewportRect = viewport.getBoundingClientRect();
  const vertical = layout === 'full-screen';
  const viewportCenter = vertical
    ? viewportRect.top + viewportRect.height / 2
    : viewportRect.left + viewportRect.width / 2;
  const viewportExtent = vertical ? viewportRect.height : viewportRect.width;

  for (const item of getCarouselItems(viewport)) {
    const content = item.querySelector<HTMLElement>('.md-carousel-item__content');
    if (!content) continue;
    if (reducedMotion || viewportExtent === 0) {
      content.style.removeProperty('--md-carousel-parallax-offset');
      continue;
    }
    const itemRect = item.getBoundingClientRect();
    const itemCenter = vertical ? itemRect.top + itemRect.height / 2 : itemRect.left + itemRect.width / 2;
    const normalizedDistance = Math.max(-1, Math.min(1, (itemCenter - viewportCenter) / viewportExtent));
    content.style.setProperty('--md-carousel-parallax-offset', `${normalizedDistance * -12}%`);
  }
}

function scrollCarouselItem(
  item: HTMLElement,
  layout: CarouselLayout,
  alignment: CarouselAlignment,
  reducedMotion: boolean,
) {
  if (typeof item.scrollIntoView !== 'function') return;
  item.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: layout === 'full-screen' ? alignment : 'nearest',
    inline: layout === 'full-screen' ? 'nearest' : alignment,
  });
}

function prefersReducedMotion() {
  /* v8 ignore next -- server rendering has no Window object */
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const Carousel = React.forwardRef<HTMLElement, React.PropsWithoutRef<CarouselProps>>(
  (
    {
      label,
      layout = 'multi-browse',
      alignment = 'start',
      scrollMode = 'auto',
      largeItemMaxWidth = 360,
      itemHeight,
      title,
      showAllAction,
      initialIndex = 0,
      onActiveIndexChange,
      className,
      style,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const viewportRef = React.useRef<HTMLUListElement | null>(null);
    const frameRef = React.useRef<number | null>(null);
    const settleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollHoldRef = React.useRef<CarouselScrollHold | null>(null);
    const animationsRef = React.useRef<CarouselAnimations | null>(null);
    if (animationsRef.current === null) animationsRef.current = new Map();
    const animations = animationsRef.current;
    const childrenArray = React.Children.toArray(children).filter(isCarouselItemElement);
    const itemCount = childrenArray.length;
    const actualAlignment = layout === 'centered-hero' ? 'center' : alignment;
    const [initialConfiguration] = React.useState(() => ({
      alignment: actualAlignment,
      index: clampCarouselIndex(initialIndex, itemCount),
      layout,
    }));
    const activeIndexRef = React.useRef(initialConfiguration.index);
    const [reducedMotion, setReducedMotion] = React.useState(prefersReducedMotion);
    const actualScrollMode = resolveCarouselScrollMode(layout, scrollMode);

    const largeItemMaxWidthLength = toCssLength(largeItemMaxWidth);
    const appliedLargeItemMaxWidthRef = React.useRef(largeItemMaxWidthLength);

    const componentStyle = {
      ...style,
      '--md-carousel-large-item-max-width': largeItemMaxWidthLength,
      ...(itemHeight === undefined ? null : { '--md-carousel-item-height': toCssLength(itemHeight) }),
    } as React.CSSProperties;

    const applyRoles = React.useCallback(
      (viewport: HTMLUListElement, activeIndex: number) => {
        // Nothing re-snaps a free-scrolling viewport, so it is held on the active
        // item while the items before it change size.
        const item = actualScrollMode === 'free' ? getCarouselItems(viewport)[activeIndex] : undefined;
        const rtl = item ? getComputedStyle(viewport).direction === 'rtl' : false;
        const offset = item ? getItemAlignmentOffset(viewport, item, actualAlignment, rtl) : 0;
        const resized = applyCarouselRoles(viewport, layout, activeIndex, reducedMotion, animations);
        // A hold only has meaning for a free, horizontal scroll. A layout or scroll
        // mode change re-applies the roles, so once the carousel snaps — full-screen
        // always does, vertically — a hold left over from free scrolling is dropped:
        // it would keep correcting against the snap and take every scroll that
        // leaves scrollLeft alone for its own.
        if (!item) {
          releaseCarouselHold(scrollHoldRef);
          return;
        }
        if (!resized) return;
        releaseCarouselHold(scrollHoldRef);
        scrollHoldRef.current = holdCarouselItem(viewport, item, offset, actualAlignment, rtl, animations);
      },
      [actualAlignment, actualScrollMode, animations, layout, reducedMotion],
    );

    const applyLayout = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      activeIndexRef.current = clampCarouselIndex(activeIndexRef.current, childrenArray.length);
      applyRoles(viewport, activeIndexRef.current);
      updateCarouselParallax(viewport, layout, reducedMotion);
    }, [applyRoles, childrenArray.length, layout, reducedMotion]);

    const settle = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      if (settleTimerRef.current !== null) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
      const items = getCarouselItems(viewport);
      const vertical = layout === 'full-screen';
      const rtl = getComputedStyle(viewport).direction === 'rtl';
      const nearestIndex = getNearestCarouselItem(
        viewport.getBoundingClientRect(),
        items.map((item) => item.getBoundingClientRect()),
        vertical ? 'vertical' : 'horizontal',
        actualAlignment,
        rtl,
      );
      const changed = nearestIndex !== activeIndexRef.current;
      activeIndexRef.current = nearestIndex;
      applyRoles(viewport, nearestIndex);
      if (changed) onActiveIndexChange?.(nearestIndex);
    }, [actualAlignment, applyRoles, layout, onActiveIndexChange]);

    React.useEffect(() => {
      if (typeof window.matchMedia !== 'function') return;
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }, []);

    React.useLayoutEffect(() => {
      const viewport = viewportRef.current;
      /* v8 ignore next -- React assigns the viewport ref before layout effects run */
      if (!viewport) return;
      const initialItem = getCarouselItems(viewport)[initialConfiguration.index];
      const initialFrame = requestAnimationFrame(() => {
        if (initialItem) {
          scrollCarouselItem(initialItem, initialConfiguration.layout, initialConfiguration.alignment, true);
        }
      });

      return () => cancelAnimationFrame(initialFrame);
    }, [initialConfiguration]);

    React.useLayoutEffect(() => {
      const viewport = viewportRef.current;
      /* v8 ignore next -- React assigns the viewport ref before layout effects run */
      if (!viewport) return;
      applyLayout();

      let cancelled = false;
      const fonts = document.fonts;
      const handleFontsLoaded = () => applyLayout();
      fonts?.ready.then(() => {
        if (!cancelled) applyLayout();
      });
      fonts?.addEventListener?.('loadingdone', handleFontsLoaded);

      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver === 'function') {
        observer = new ResizeObserver(applyLayout);
        observer.observe(viewport);
      } else {
        window.addEventListener('resize', applyLayout);
      }

      return () => {
        cancelled = true;
        fonts?.removeEventListener?.('loadingdone', handleFontsLoaded);
        if (observer) observer.disconnect();
        else window.removeEventListener('resize', applyLayout);
      };
    }, [applyLayout]);

    React.useLayoutEffect(() => {
      // The cap decides how many large items a multi-browse row needs, and
      // changing it resizes nothing the ResizeObserver can see.
      if (appliedLargeItemMaxWidthRef.current === largeItemMaxWidthLength) return;
      appliedLargeItemMaxWidthRef.current = largeItemMaxWidthLength;
      applyLayout();
    }, [applyLayout, largeItemMaxWidthLength]);

    React.useEffect(() => {
      const viewport = viewportRef.current;
      /* v8 ignore next -- React assigns the viewport ref before passive effects run */
      if (!viewport) return;
      const handleScrollEnd = () => {
        if (!isHeldScroll(viewport, scrollHoldRef.current)) settle();
      };
      viewport.addEventListener('scrollend', handleScrollEnd);
      return () => viewport.removeEventListener('scrollend', handleScrollEnd);
    }, [settle]);

    React.useEffect(
      () => () => {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        if (settleTimerRef.current !== null) clearTimeout(settleTimerRef.current);
        releaseCarouselHold(scrollHoldRef);
        for (const animation of animations.values()) animation.cancel();
        animations.clear();
      },
      [animations],
    );

    const handleScroll = () => {
      const viewport = viewportRef.current;
      /* v8 ignore next -- this handler is installed directly on the viewport */
      if (!viewport) return;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        updateCarouselParallax(viewport, layout, reducedMotion);
      });
      // The hold's own corrections keep the active item where the user left it,
      // so they don't settle again; the user scrolling ends the hold.
      if (isHeldScroll(viewport, scrollHoldRef.current)) return;
      releaseCarouselHold(scrollHoldRef);
      if (settleTimerRef.current !== null) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(settle, SETTLE_DELAY);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const actions = getCarouselActions(event.currentTarget);
      const currentIndex = actions.findIndex(
        (action) => action === event.target || action.contains(event.target as Node),
      );
      if (currentIndex < 0) return;

      const vertical = layout === 'full-screen';
      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      let nextIndex: number | undefined;
      if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = actions.length - 1;
      else if (vertical && event.key === 'ArrowDown') nextIndex = currentIndex + 1;
      else if (vertical && event.key === 'ArrowUp') nextIndex = currentIndex - 1;
      else if (!vertical && event.key === 'ArrowRight') nextIndex = currentIndex + (rtl ? -1 : 1);
      else if (!vertical && event.key === 'ArrowLeft') nextIndex = currentIndex + (rtl ? 1 : -1);
      else return;

      event.preventDefault();
      const target = actions[clampCarouselIndex(nextIndex, actions.length)];
      target.focus();
      const item = target.closest<HTMLElement>('[data-md-carousel-item]');
      if (item) scrollCarouselItem(item, layout, actualAlignment, reducedMotion);
    };

    const itemContexts = React.useMemo<CarouselItemContextValue[]>(
      () =>
        Array.from({ length: itemCount }, (_, index) => ({
          count: itemCount,
          index,
          layout,
        })),
      [itemCount, layout],
    );

    return (
      <section
        {...props}
        ref={ref}
        className={cx('md-carousel', className)}
        style={componentStyle}
        aria-label={label}
        aria-roledescription="carousel"
        data-layout={layout}
        data-reduced-motion={reducedMotion || undefined}
        onKeyDown={handleKeyDown}
      >
        {title || showAllAction ? (
          <div className="md-carousel__header">
            {title ? <div className="md-carousel__title">{title}</div> : <span />}
            {showAllAction ? <div className="md-carousel__show-all">{showAllAction}</div> : null}
          </div>
        ) : null}
        <ul
          ref={viewportRef}
          className="md-carousel__viewport"
          data-layout={layout}
          data-alignment={actualAlignment}
          data-scroll-mode={actualScrollMode}
          onScroll={handleScroll}
        >
          {childrenArray.map((child, index) => (
            <CarouselItemContext.Provider key={String(child.key)} value={itemContexts[index]}>
              {child}
            </CarouselItemContext.Provider>
          ))}
        </ul>
      </section>
    );
  },
);
Carousel.displayName = 'Carousel';

// The props are a discriminated union whose two branches render different
// elements, so the ref is typed as the union of both and narrowed per branch.
const CarouselItem = React.forwardRef<HTMLAnchorElement | HTMLButtonElement, React.PropsWithoutRef<CarouselItemProps>>(
  (props, ref) => {
    const context = React.useContext(CarouselItemContext);
    const fallbackId = React.useId();
    const index = context?.index ?? 0;
    const count = context?.count ?? 1;
    const layout = context?.layout ?? 'multi-browse';
    const positionId = `${fallbackId}-position`;
    const positionText = `Item ${index + 1} of ${count}`;
    const itemStyle = { aspectRatio: props.aspectRatio } as React.CSSProperties;

    const content = (
      <>
        <Ripple />
        <span className="md-carousel-item__content">{props.children}</span>
        <span id={positionId} className="md-sr-only">
          {positionText}
        </span>
      </>
    );

    if ('href' in props && props.href !== undefined) {
      const {
        label: itemLabel,
        children: _children,
        aspectRatio: _aspectRatio,
        disabled = false,
        itemClassName,
        href,
        className,
        onClick,
        ...actionProps
      } = props;
      const describedBy = [actionProps['aria-describedby'], positionId].filter(Boolean).join(' ');
      const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      };
      return (
        <li
          className={cx('md-carousel-item', itemClassName)}
          data-md-carousel-item=""
          data-layout={layout}
          style={itemStyle}
        >
          <a
            {...actionProps}
            ref={ref as React.Ref<HTMLAnchorElement>}
            className={cx('md-carousel-item__action', className)}
            data-md-carousel-action=""
            href={disabled ? undefined : href}
            aria-label={itemLabel}
            aria-describedby={describedBy}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : actionProps.tabIndex}
            onClick={handleClick}
          >
            {content}
          </a>
        </li>
      );
    }

    const {
      label: itemLabel,
      children: _children,
      aspectRatio: _aspectRatio,
      disabled = false,
      itemClassName,
      className,
      onClick,
      type = 'button',
      ...actionProps
    } = props;
    const describedBy = [actionProps['aria-describedby'], positionId].filter(Boolean).join(' ');
    return (
      <li
        className={cx('md-carousel-item', itemClassName)}
        data-md-carousel-item=""
        data-layout={layout}
        style={itemStyle}
      >
        <button
          {...actionProps}
          ref={ref as React.Ref<HTMLButtonElement>}
          className={cx('md-carousel-item__action', className)}
          data-md-carousel-action=""
          type={type}
          disabled={disabled}
          aria-label={itemLabel}
          aria-describedby={describedBy}
          onClick={onClick}
        >
          {content}
        </button>
      </li>
    );
  },
);
CarouselItem.displayName = 'CarouselItem';

export { Carousel, CarouselItem };
