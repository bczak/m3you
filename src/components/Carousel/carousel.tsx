import './carousel.css';

import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';
import {
  type CarouselLayout,
  type CarouselScrollMode,
  clampCarouselIndex,
  getCarouselLargeCount,
  getCarouselSizeRoles,
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

function animateRoleChange(item: HTMLElement, previousRect: DOMRect, animationStore: Set<Animation>) {
  const nextRect = item.getBoundingClientRect();
  if (nextRect.width === 0 || nextRect.height === 0 || previousRect.width === 0 || previousRect.height === 0) return;
  const translateX = previousRect.left - nextRect.left;
  const translateY = previousRect.top - nextRect.top;
  const scaleX = previousRect.width / nextRect.width;
  const scaleY = previousRect.height / nextRect.height;
  if (translateX === 0 && translateY === 0 && scaleX === 1 && scaleY === 1) return;
  const animation = item.animate(
    [{ transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})` }, { transform: 'none' }],
    { duration: 500, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  );
  animationStore.add(animation);
  const removeAnimation = () => animationStore.delete(animation);
  animation.finished.then(removeAnimation, removeAnimation);
}

function applyCarouselRoles(
  viewport: HTMLUListElement,
  layout: CarouselLayout,
  activeIndex: number,
  reducedMotion: boolean,
  animationStore: Set<Animation>,
) {
  const items = getCarouselItems(viewport);
  const previousRects = reducedMotion ? [] : items.map((item) => item.getBoundingClientRect());
  const width = viewport.getBoundingClientRect().width || viewport.clientWidth;
  const roles = getCarouselSizeRoles(layout, items.length, activeIndex, width, reducedMotion);
  const largeCount = getCarouselLargeCount(width);
  viewport.style.setProperty('--md-carousel-large-count', String(largeCount));
  viewport.style.setProperty('--md-carousel-reserved-gaps', `${(largeCount + 1) * 8}px`);
  for (let index = 0; index < items.length; index += 1) {
    items[index].dataset.sizeRole = roles[index];
  }
  setActiveItem(items, activeIndex);
  if (!reducedMotion) {
    for (let index = 0; index < items.length; index += 1) {
      animateRoleChange(items[index], previousRects[index], animationStore);
    }
  }
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

const Carousel = ({
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
  ref,
  children,
  ...props
}: CarouselProps & { ref?: React.Ref<HTMLElement> }) => {
  const viewportRef = React.useRef<HTMLUListElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const settleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationsRef = React.useRef<Set<Animation> | null>(null);
  if (animationsRef.current === null) animationsRef.current = new Set<Animation>();
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

  const componentStyle = {
    ...style,
    '--md-carousel-large-item-max-width': toCssLength(largeItemMaxWidth),
    ...(itemHeight === undefined ? null : { '--md-carousel-item-height': toCssLength(itemHeight) }),
  } as React.CSSProperties;

  const applyLayout = React.useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    activeIndexRef.current = clampCarouselIndex(activeIndexRef.current, childrenArray.length);
    applyCarouselRoles(viewport, layout, activeIndexRef.current, reducedMotion, animations);
    updateCarouselParallax(viewport, layout, reducedMotion);
  }, [animations, childrenArray.length, layout, reducedMotion]);

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
    applyCarouselRoles(viewport, layout, nearestIndex, reducedMotion, animations);
    if (changed) onActiveIndexChange?.(nearestIndex);
  }, [actualAlignment, animations, layout, onActiveIndexChange, reducedMotion]);

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

  React.useEffect(() => {
    const viewport = viewportRef.current;
    /* v8 ignore next -- React assigns the viewport ref before passive effects run */
    if (!viewport) return;
    viewport.addEventListener('scrollend', settle);
    return () => viewport.removeEventListener('scrollend', settle);
  }, [settle]);

  React.useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (settleTimerRef.current !== null) clearTimeout(settleTimerRef.current);
      for (const animation of animations) animation.cancel();
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
};
Carousel.displayName = 'Carousel';

const CarouselItem = (props: CarouselItemProps) => {
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
      ref,
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
          ref={ref}
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
    ref,
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
        ref={ref}
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
};
CarouselItem.displayName = 'CarouselItem';

export { Carousel, CarouselItem };
