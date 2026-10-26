import { readFileSync } from 'node:fs';
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { Carousel, CarouselItem } from '../src/components/Carousel/carousel';
import {
  type CarouselMetrics,
  clampCarouselIndex,
  getCarouselAlignmentPoint,
  getCarouselLargeCount,
  getCarouselSizeRoles,
  getClampedCarouselLargeCount,
  getNearestCarouselItem,
  resolveCarouselScrollMode,
} from '../src/components/Carousel/carousel-layout';

const carouselCss = readFileSync('src/components/Carousel/carousel.css', 'utf8');
const originalMatchMedia = window.matchMedia;
const originalResizeObserver = globalThis.ResizeObserver;
const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;
const originalFontsDescriptor = Object.getOwnPropertyDescriptor(document, 'fonts');

let mediaMatches = false;
let mediaChangeListener: ((event: MediaQueryListEvent) => void) | undefined;
let mediaAdd: ReturnType<typeof vi.fn>;
let mediaRemove: ReturnType<typeof vi.fn>;
let resizeCallbacks: ResizeObserverCallback[];
let resizeObserve: ReturnType<typeof vi.fn>;
let resizeDisconnect: ReturnType<typeof vi.fn>;
let scrollIntoView: ReturnType<typeof vi.fn>;
let animationFrames: Map<number, FrameRequestCallback>;
let nextAnimationFrame: number;

function flushAnimationFrames() {
  const callbacks = Array.from(animationFrames.entries());
  animationFrames.clear();
  for (const [, callback] of callbacks) callback(performance.now());
}

function rect({
  left = 0,
  top = 0,
  width = 0,
  height = 0,
}: Partial<Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>> = {}): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  };
}

function carouselItems() {
  return [
    <CarouselItem key="one" label="One" onClick={() => {}}>
      <span>First visual</span>
    </CarouselItem>,
    <CarouselItem key="two" label="Two" onClick={() => {}}>
      <span>Second visual</span>
    </CarouselItem>,
    <CarouselItem key="three" label="Three" onClick={() => {}}>
      <span>Third visual</span>
    </CarouselItem>,
    <CarouselItem key="four" label="Four" onClick={() => {}}>
      <span>Fourth visual</span>
    </CarouselItem>,
    <CarouselItem key="five" label="Five" onClick={() => {}}>
      <span>Fifth visual</span>
    </CarouselItem>,
  ];
}

beforeEach(() => {
  mediaMatches = false;
  mediaChangeListener = undefined;
  mediaAdd = vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
    mediaChangeListener = listener;
  });
  mediaRemove = vi.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
    if (mediaChangeListener === listener) mediaChangeListener = undefined;
  });
  window.matchMedia = vi.fn().mockImplementation(
    (query: string) =>
      ({
        matches: mediaMatches,
        media: query,
        onchange: null,
        addEventListener: mediaAdd,
        removeEventListener: mediaRemove,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );

  resizeCallbacks = [];
  resizeObserve = vi.fn();
  resizeDisconnect = vi.fn();
  class StubResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      resizeCallbacks.push(callback);
    }
    observe = resizeObserve;
    disconnect = resizeDisconnect;
    unobserve = vi.fn();
  }
  globalThis.ResizeObserver = StubResizeObserver as unknown as typeof ResizeObserver;

  scrollIntoView = vi.fn();
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: scrollIntoView,
    writable: true,
  });

  animationFrames = new Map();
  nextAnimationFrame = 1;
  window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const id = nextAnimationFrame;
    nextAnimationFrame += 1;
    animationFrames.set(id, callback);
    return id;
  });
  window.cancelAnimationFrame = vi.fn((id: number) => {
    animationFrames.delete(id);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
  globalThis.ResizeObserver = originalResizeObserver;
  window.requestAnimationFrame = originalRequestAnimationFrame;
  window.cancelAnimationFrame = originalCancelAnimationFrame;
  if (originalScrollIntoView) {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: originalScrollIntoView,
      writable: true,
    });
  } else {
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  }
  if (originalFontsDescriptor) Object.defineProperty(document, 'fonts', originalFontsDescriptor);
  else Reflect.deleteProperty(document, 'fonts');
});

test('carousel layout utilities resolve indexes, modes, responsive counts, and every role family', () => {
  expect(clampCarouselIndex(2.9, 5)).toBe(2);
  expect(clampCarouselIndex(-4, 5)).toBe(0);
  expect(clampCarouselIndex(9, 5)).toBe(4);
  expect(clampCarouselIndex(3, 0)).toBe(0);

  expect(resolveCarouselScrollMode('full-screen', 'free')).toBe('snap');
  expect(resolveCarouselScrollMode('multi-browse', 'free')).toBe('free');
  expect(resolveCarouselScrollMode('hero', 'snap')).toBe('snap');
  expect(resolveCarouselScrollMode('uncontained', 'auto')).toBe('free');
  expect(resolveCarouselScrollMode('uncontained-multi-aspect', 'auto')).toBe('free');
  expect(resolveCarouselScrollMode('multi-browse', 'auto')).toBe('snap');

  expect(getCarouselLargeCount(599)).toBe(1);
  expect(getCarouselLargeCount(600)).toBe(2);
  expect(getCarouselLargeCount(839)).toBe(2);
  expect(getCarouselLargeCount(840)).toBe(3);

  expect(getCarouselSizeRoles('multi-browse', 0, 0, 400, false)).toEqual([]);
  expect(getCarouselSizeRoles('full-screen', 3, 0, 400, false)).toEqual(['full', 'full', 'full']);
  expect(getCarouselSizeRoles('uncontained', 2, 0, 400, false)).toEqual(['uniform', 'uniform']);
  expect(getCarouselSizeRoles('uncontained-multi-aspect', 2, 0, 400, false)).toEqual(['uniform', 'uniform']);
  expect(getCarouselSizeRoles('hero', 3, 99, 400, false)).toEqual(['small', 'small', 'large']);
  expect(getCarouselSizeRoles('centered-hero', 3, -2, 400, false)).toEqual(['large', 'small', 'small']);
  expect(getCarouselSizeRoles('multi-browse', 3, 0, 400, true)).toEqual(['uniform', 'uniform', 'uniform']);
  expect(getCarouselSizeRoles('multi-browse', 5, 1, 900, false)).toEqual([
    'small',
    'large',
    'large',
    'large',
    'medium',
  ]);
  expect(getCarouselSizeRoles('multi-browse', 5, 4, 900, false)).toEqual([
    'small',
    'medium',
    'large',
    'large',
    'large',
  ]);
  expect(getCarouselSizeRoles('multi-browse', 1, 0, 900, false)).toEqual(['large']);
});

function kitMetrics(contentWidth: number, overrides: Partial<CarouselMetrics> = {}): CarouselMetrics {
  return { contentWidth, largeItemMaxWidth: 360, mediumItemWidth: 120, smallItemWidth: 56, gap: 8, ...overrides };
}

test('the large count grows past the breakpoints only when capped large items would leave the row unfilled', () => {
  // Kit frames and the breakpoints keep their counts: 188 / 184×2 / 200×3.
  expect(getCarouselLargeCount(412, kitMetrics(380))).toBe(1);
  expect(getCarouselLargeCount(600, kitMetrics(568))).toBe(2);
  expect(getCarouselLargeCount(840, kitMetrics(808))).toBe(3);
  // At 1320 three 360px items fill the row exactly, so no fourth is added.
  expect(getCarouselLargeCount(1320, kitMetrics(1288))).toBe(3);
  // Wider rows add large items: 4 × 298 at 1440, 5 × 332.8 at 1920.
  expect(getCarouselLargeCount(1440, kitMetrics(1408))).toBe(4);
  expect(getCarouselLargeCount(1920, kitMetrics(1888))).toBe(5);
  // One gap is subtracted, not two: at 553px of content one 360px item leaves 1px empty.
  expect(getCarouselLargeCount(585, kitMetrics(553))).toBe(2);
  // A smaller cap needs more items.
  expect(getCarouselLargeCount(600, kitMetrics(568, { largeItemMaxWidth: 120 }))).toBe(3);
  // Unresolved lengths fall back to the breakpoints.
  expect(getCarouselLargeCount(1920, kitMetrics(0, { largeItemMaxWidth: 0, gap: 0 }))).toBe(3);
  expect(getCarouselLargeCount(1920)).toBe(3);

  expect(getClampedCarouselLargeCount(1920, 20, kitMetrics(1888))).toBe(5);
  expect(getClampedCarouselLargeCount(1920, 5, kitMetrics(1888))).toBe(3);
  expect(getCarouselSizeRoles('multi-browse', 7, 0, 1920, false, kitMetrics(1888))).toEqual([
    'large',
    'large',
    'large',
    'large',
    'large',
    'medium',
    'small',
  ]);
});

test('nearest-item utility supports empty, start, center, vertical, and RTL anchors', () => {
  const viewport = rect({ left: 100, top: 100, width: 300, height: 300 });
  const items = [
    rect({ left: 90, top: 90, width: 100, height: 100 }),
    rect({ left: 230, top: 230, width: 100, height: 100 }),
    rect({ left: 390, top: 390, width: 100, height: 100 }),
  ];
  expect(getNearestCarouselItem(viewport, [], 'horizontal', 'start', false)).toBe(0);
  expect(getNearestCarouselItem(viewport, items, 'horizontal', 'start', false)).toBe(0);
  expect(getNearestCarouselItem(viewport, items, 'horizontal', 'center', false)).toBe(1);
  expect(getNearestCarouselItem(viewport, items, 'horizontal', 'start', true)).toBe(1);
  expect(getNearestCarouselItem(viewport, items, 'vertical', 'start', false)).toBe(0);
  expect(getNearestCarouselItem(viewport, items, 'vertical', 'center', false)).toBe(1);
});

test('alignment points are the start edge in either direction, or the centre, on the scroll axis', () => {
  const box = rect({ left: 10, top: 20, width: 100, height: 60 });
  expect(getCarouselAlignmentPoint(box, 'horizontal', 'start', false)).toBe(10);
  expect(getCarouselAlignmentPoint(box, 'horizontal', 'start', true)).toBe(110);
  expect(getCarouselAlignmentPoint(box, 'horizontal', 'center', true)).toBe(60);
  expect(getCarouselAlignmentPoint(box, 'vertical', 'start', false)).toBe(20);
  expect(getCarouselAlignmentPoint(box, 'vertical', 'center', false)).toBe(50);
});

test('renders a labelled region, list semantics, positional descriptions, actions, header, styles, and refs', () => {
  const regionRef = React.createRef<HTMLElement>();
  const buttonRef = React.createRef<HTMLButtonElement>();
  const linkRef = React.createRef<HTMLAnchorElement>();
  const buttonClick = vi.fn();
  const linkClick = vi.fn((event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault());
  render(
    <Carousel
      ref={regionRef}
      label="Featured destinations"
      title="Destinations"
      showAllAction={<a href="#all">Show all</a>}
      largeItemMaxWidth={420}
      itemHeight="18rem"
      className="custom-carousel"
      data-testid="carousel"
    >
      <CarouselItem
        ref={buttonRef}
        label="Alps"
        onClick={buttonClick}
        className="custom-action"
        itemClassName="custom-item"
        aspectRatio="16 / 9"
        aria-describedby="extra-description"
      >
        <span>Alpine view</span>
      </CarouselItem>
      <CarouselItem ref={linkRef} label="Coast" href="#coast" onClick={linkClick} target="_blank" rel="noreferrer">
        <span>Coastal view</span>
      </CarouselItem>
      <CarouselItem label="Forest" href="#forest" disabled>
        <span>Forest view</span>
      </CarouselItem>
      <CarouselItem label="Desert" disabled onClick={() => {}}>
        <span>Desert view</span>
      </CarouselItem>
    </Carousel>,
  );

  const region = screen.getByRole('region', { name: 'Featured destinations' });
  const list = screen.getByRole('list');
  const alps = screen.getByRole('button', { name: 'Alps' });
  const coast = screen.getByRole('link', { name: 'Coast' });
  const forest = screen.getByText('Forest view').closest('a') as HTMLAnchorElement;
  expect(regionRef.current).toBe(region);
  expect(buttonRef.current).toBe(alps);
  expect(linkRef.current).toBe(coast);
  expect(region).toHaveClass('md-carousel', 'custom-carousel');
  expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  expect(region.style.getPropertyValue('--md-carousel-large-item-max-width')).toBe('420px');
  expect(region.style.getPropertyValue('--md-carousel-item-height')).toBe('18rem');
  expect(screen.getByText('Destinations')).toHaveClass('md-carousel__title');
  expect(screen.getByRole('link', { name: 'Show all' })).toBeInTheDocument();
  expect(list).toHaveAttribute('data-layout', 'multi-browse');
  expect(list).toHaveAttribute('data-alignment', 'start');
  expect(list).toHaveAttribute('data-scroll-mode', 'snap');
  expect(screen.getAllByRole('listitem')).toHaveLength(4);
  expect(alps).toHaveClass('custom-action');
  expect(alps.closest('li')).toHaveClass('custom-item');
  expect(alps.closest('li')).toHaveStyle({ aspectRatio: '16 / 9' });
  expect(alps).toHaveAttribute('aria-describedby', expect.stringContaining('extra-description'));
  expect(screen.getByText('Item 1 of 4')).toHaveClass('md-sr-only');
  expect(screen.getByText('Item 4 of 4')).toBeInTheDocument();
  expect(alps.querySelector('.salty-ripple')).toBeInTheDocument();
  fireEvent.click(alps);
  fireEvent.click(coast);
  expect(buttonClick).toHaveBeenCalledOnce();
  expect(linkClick).toHaveBeenCalledOnce();
  expect(forest).not.toHaveAttribute('href');
  expect(forest).toHaveAttribute('aria-disabled', 'true');
  expect(forest).toHaveAttribute('tabindex', '-1');
  expect(screen.getByRole('button', { name: 'Desert' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Desert' })).not.toBe(screen.getByRole('button', { name: 'Alps' }));
});

test('disabled and handler-free links compose click behavior without navigating', () => {
  const onClick = vi.fn();
  render(
    <Carousel label="Links">
      <CarouselItem
        label="Active"
        href="#active"
        onClick={(event) => {
          event.preventDefault();
          onClick();
        }}
      >
        Active
      </CarouselItem>
      <CarouselItem label="Simple" href="#simple">
        Simple
      </CarouselItem>
      <CarouselItem label="Disabled" href="#disabled" disabled onClick={onClick}>
        Disabled
      </CarouselItem>
    </Carousel>,
  );
  expect(fireEvent.click(screen.getByRole('link', { name: 'Active' }))).toBe(false);
  expect(fireEvent.click(screen.getByRole('link', { name: 'Simple' }))).toBe(true);
  const disabled = screen.getByText('Disabled').closest('a') as HTMLAnchorElement;
  expect(fireEvent.click(disabled)).toBe(false);
  expect(onClick).toHaveBeenCalledOnce();
});

test('all layouts and explicit scroll modes resolve to their required DOM state', () => {
  const { rerender } = render(
    <Carousel label="Layouts" layout="uncontained">
      {carouselItems()}
    </Carousel>,
  );
  const viewport = () => screen.getByRole('list');
  expect(viewport()).toHaveAttribute('data-scroll-mode', 'free');
  expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-size-role', 'uniform');

  rerender(
    <Carousel label="Layouts" layout="uncontained-multi-aspect" scrollMode="snap">
      {carouselItems()}
    </Carousel>,
  );
  expect(viewport()).toHaveAttribute('data-scroll-mode', 'snap');
  expect(viewport()).toHaveAttribute('data-layout', 'uncontained-multi-aspect');

  rerender(
    <Carousel label="Layouts" layout="hero" scrollMode="free">
      {carouselItems()}
    </Carousel>,
  );
  expect(viewport()).toHaveAttribute('data-scroll-mode', 'free');
  expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-size-role', 'large');

  rerender(
    <Carousel label="Layouts" layout="centered-hero">
      {carouselItems()}
    </Carousel>,
  );
  expect(viewport()).toHaveAttribute('data-alignment', 'center');

  rerender(
    <Carousel label="Layouts" layout="full-screen" scrollMode="free" alignment="center">
      {carouselItems()}
    </Carousel>,
  );
  expect(viewport()).toHaveAttribute('data-scroll-mode', 'snap');
  expect(viewport()).toHaveAttribute('data-layout', 'full-screen');
  expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-size-role', 'full');

  rerender(
    <Carousel label="Layouts" scrollMode="free">
      {carouselItems()}
    </Carousel>,
  );
  expect(viewport()).toHaveAttribute('data-scroll-mode', 'free');
});

test('header supports title-only and show-all-only compositions', () => {
  const { rerender } = render(
    <Carousel label="Title only" title="A title">
      {carouselItems().slice(0, 1)}
    </Carousel>,
  );
  expect(screen.getByText('A title')).toBeInTheDocument();
  expect(screen.queryByText('Show all')).not.toBeInTheDocument();
  rerender(
    <Carousel label="Show all only" showAllAction={<button type="button">Show all</button>}>
      {carouselItems().slice(0, 1)}
    </Carousel>,
  );
  expect(screen.getByRole('button', { name: 'Show all' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Show all' }).parentElement?.previousElementSibling).toHaveTextContent('');
});

test('initialIndex clamps to the available items and scrolls without motion', () => {
  const first = render(
    <Carousel label="Initial" initialIndex={99} largeItemMaxWidth="24rem">
      {carouselItems().slice(0, 3)}
    </Carousel>,
  );
  act(flushAnimationFrames);
  const listItems = screen.getAllByRole('listitem');
  expect(listItems[2]).toHaveAttribute('data-active');
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'nearest', inline: 'start' });
  expect(screen.getByRole('region').style.getPropertyValue('--md-carousel-large-item-max-width')).toBe('24rem');
  expect(screen.getByRole('region').style.getPropertyValue('--md-carousel-item-height')).toBe('');

  first.unmount();
  scrollIntoView.mockClear();
  render(
    <Carousel label="Initial" initialIndex={-5}>
      {carouselItems().slice(0, 3)}
    </Carousel>,
  );
  act(flushAnimationFrames);
  expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-active');
});

function mockAnimations() {
  const created: Array<{ animation: Animation; cancel: ReturnType<typeof vi.fn>; finish: () => void }> = [];
  const animate = vi.spyOn(Element.prototype, 'animate').mockImplementation(() => {
    let finish = () => {};
    let fail = (_reason: unknown) => {};
    const finished = new Promise<Animation>((resolve, reject) => {
      finish = () => resolve(animation);
      fail = reject;
    });
    finished.catch(() => {});
    const cancel = vi.fn(() => fail(new Error('cancelled')));
    const animation = { cancel, finished } as unknown as Animation;
    created.push({ animation, cancel, finish });
    return animation;
  });
  return { animate, created };
}

function mockProbe(lengths: { content: number; large: number; medium: number; small: number; gap: number }) {
  const original = globalThis.getComputedStyle;
  return vi
    .spyOn(globalThis, 'getComputedStyle')
    .mockImplementation((element: Element, pseudoElement?: string | null) => {
      if (element.classList.contains('md-carousel__probe')) {
        return { width: `${lengths.content}px` } as CSSStyleDeclaration;
      }
      const length = (element as HTMLElement).dataset?.length as keyof typeof lengths | undefined;
      if (length && element.parentElement?.classList.contains('md-carousel__probe')) {
        return { width: `${lengths[length]}px` } as CSSStyleDeclaration;
      }
      return original.call(window, element, pseudoElement);
    });
}

test('multi-browse resolves its lengths through a transient probe and fills wide rows with more large items', () => {
  const computedStyle = mockProbe({ content: 1888, large: 360, medium: 120, small: 56, gap: 8 });
  const probes = () =>
    computedStyle.mock.calls.map(([element]) => element).filter((element) => element.matches('.md-carousel__probe'));
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => (
    <CarouselItem key={id} label={`Wide ${id}`} onClick={() => {}}>
      Wide
    </CarouselItem>
  ));
  const { rerender } = render(<Carousel label="Wide">{items}</Carousel>);
  const viewport = screen.getByRole('list');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 1920, height: 220 }));
  act(() => resizeCallbacks.at(-1)?.([], {} as ResizeObserver));
  expect(viewport.style.getPropertyValue('--md-carousel-large-count')).toBe('5');
  expect(screen.getAllByRole('listitem').map((item) => item.dataset.sizeRole)).toEqual([
    'large',
    'large',
    'large',
    'large',
    'large',
    'medium',
    'small',
    'small',
  ]);

  const probe = probes().at(-1) as HTMLElement;
  expect(probe).toHaveAttribute('aria-hidden', 'true');
  expect(Array.from(probe.children, (child) => (child as HTMLElement).dataset.length)).toEqual([
    'large',
    'medium',
    'small',
    'gap',
  ]);
  expect(probe.isConnected).toBe(false);
  expect(viewport.querySelector('.md-carousel__probe')).toBeNull();

  // Layouts without a large-item count never probe.
  const probeCount = probes().length;
  rerender(
    <Carousel label="Wide" layout="hero">
      {items}
    </Carousel>,
  );
  expect(probes()).toHaveLength(probeCount);
});

test('role changes morph item widths from their on-screen size with the spatial spring', async () => {
  const { animate, created } = mockAnimations();
  const { unmount } = render(<Carousel label="Morph">{carouselItems()}</Carousel>);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  const roles = () => items.map((item) => item.dataset.sizeRole);
  const roleWidths: Record<string, string> = { large: '188px', medium: '120px', small: '56px' };
  const paintWidths = () => {
    for (const item of items) item.style.width = roleWidths[item.dataset.sizeRole as string];
  };
  const settleOn = (activeIndex: number) => {
    for (const [index, item] of items.entries()) {
      vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(
        rect({ left: (index - activeIndex) * 200, width: 100, height: 200 }),
      );
    }
    fireEvent(viewport, new Event('scrollend'));
  };

  // Mounting sizes the items without morphing them.
  expect(roles()).toEqual(['large', 'medium', 'small', 'small', 'small']);
  expect(animate).not.toHaveBeenCalled();

  paintWidths();
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 412, height: 220 }));
  settleOn(1);
  expect(roles()).toEqual(['small', 'large', 'medium', 'small', 'small']);
  // Only the items whose role changed morph, each from the width it had on screen,
  // towards its new flex-basis (no end keyframe), on the spring-default-spatial token values.
  expect(animate.mock.contexts).toEqual([items[0], items[1], items[2]]);
  expect(animate.mock.calls).toEqual([
    [[{ flexBasis: '188px', offset: 0 }], { duration: 500, easing: 'cubic-bezier(0.38, 1.21, 0.22, 1)' }],
    [[{ flexBasis: '120px', offset: 0 }], { duration: 500, easing: 'cubic-bezier(0.38, 1.21, 0.22, 1)' }],
    [[{ flexBasis: '56px', offset: 0 }], { duration: 500, easing: 'cubic-bezier(0.38, 1.21, 0.22, 1)' }],
  ]);

  // An interrupted morph restarts from where the item is and replaces the running one.
  paintWidths();
  items[1].style.width = '150px';
  viewport.style.setProperty('--md-sys-motion-duration-spring-default-spatial', '0.4s');
  viewport.style.setProperty('--md-sys-motion-easing-spring-default-spatial', 'linear');
  settleOn(2);
  expect(roles()).toEqual(['small', 'small', 'large', 'medium', 'small']);
  expect(created[1].cancel).toHaveBeenCalled();
  expect(animate.mock.contexts.slice(3)).toEqual([items[1], items[2], items[3]]);
  expect(animate.mock.calls[3]).toEqual([[{ flexBasis: '150px', offset: 0 }], { duration: 400, easing: 'linear' }]);

  // A plain resize keeps roles and count, so nothing morphs.
  paintWidths();
  act(() => resizeCallbacks.at(-1)?.([], {} as ResizeObserver));
  expect(animate).toHaveBeenCalledTimes(6);

  // Crossing a breakpoint changes the large share, so even items that stay large morph.
  viewport.style.setProperty('--md-sys-motion-duration-spring-default-spatial', '350ms');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 600, height: 220 }));
  act(() => resizeCallbacks.at(-1)?.([], {} as ResizeObserver));
  expect(roles()).toEqual(['small', 'small', 'large', 'large', 'medium']);
  expect(viewport.style.getPropertyValue('--md-carousel-large-count')).toBe('2');
  expect(animate.mock.contexts.slice(6)).toEqual([items[2], items[3], items[4]]);
  expect(animate.mock.calls[6][1]).toEqual({ duration: 350, easing: 'linear' });

  // A finished morph is released; the ones still running are cancelled on unmount.
  const finishedMorph = created[6];
  finishedMorph.finish();
  await finishedMorph.animation.finished;
  unmount();
  expect(finishedMorph.cancel).not.toHaveBeenCalled();
  expect(created[3].cancel).toHaveBeenCalled();
  expect(created[8].cancel).toHaveBeenCalled();
});

/**
 * Lays the items out in a row the way a browser would — 16px of padding, 8px
 * gaps, shifted by the viewport's scroll position — from the widths `widthOf`
 * reports at the moment of reading.
 */
function layOutStrip(viewport: HTMLElement, items: HTMLElement[], widthOf: (index: number) => number) {
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 412, height: 220 }));
  for (const [index, item] of items.entries()) {
    item.style.width = `${widthOf(index)}px`;
    vi.spyOn(item, 'getBoundingClientRect').mockImplementation(() => {
      let left = 16 - viewport.scrollLeft;
      for (let before = 0; before < index; before += 1) left += widthOf(before) + 8;
      return rect({ left, width: widthOf(index), height: 200 });
    });
  }
  return (index: number) => items[index].getBoundingClientRect().left;
}

test('a free-scrolling carousel holds the active item where the user left it while the items before it shrink', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const { created } = mockAnimations();
  const onActiveIndexChange = vi.fn();
  render(
    <Carousel label="Free" scrollMode="free" onActiveIndexChange={onActiveIndexChange}>
      {carouselItems()}
    </Carousel>,
  );
  act(flushAnimationFrames);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  const widths = [188, 120, 56, 56, 56];
  const offsetOf = layOutStrip(viewport, items, (index) => widths[index]);

  // The user leaves the second item 60px past the start; the large first item is far off it.
  viewport.scrollLeft = 152;
  expect([offsetOf(0), offsetOf(1)]).toEqual([-136, 60]);
  fireEvent(viewport, new Event('scrollend'));
  expect(onActiveIndexChange).toHaveBeenCalledWith(1);
  expect(items.map((item) => item.dataset.sizeRole)).toEqual(['small', 'large', 'medium', 'small', 'small']);
  expect(created).toHaveLength(3);
  // Every morph starts from where its item is, so nothing has moved yet.
  expect(viewport.scrollLeft).toBe(152);

  // Each frame of the morph scrolls back by however far the items before it shrank,
  // through the spring's overshoot too — instantly, even where the page sets
  // `scroll-behavior: smooth`, so the correction lands in the frame it is made.
  const scrollBy = vi.spyOn(viewport, 'scrollBy');
  widths.splice(0, 3, 122, 154, 88);
  act(flushAnimationFrames);
  expect([viewport.scrollLeft, offsetOf(1)]).toEqual([86, 60]);
  expect(scrollBy).toHaveBeenLastCalledWith({ left: -66, behavior: 'instant' });
  widths.splice(0, 3, 40, 200, 128);
  act(flushAnimationFrames);
  expect([viewport.scrollLeft, offsetOf(1)]).toEqual([4, 60]);

  // The last frame lands it, and the hold stops asking for frames.
  for (const morph of created) morph.finish();
  await Promise.all(created.map((morph) => morph.animation.finished));
  widths.splice(0, 3, 56, 188, 120);
  act(flushAnimationFrames);
  expect([viewport.scrollLeft, offsetOf(1)]).toEqual([20, 60]);
  expect(animationFrames.size).toBe(0);

  // The shrunk first item is now nearer the start, but the hold's own scrolling
  // is not the user's: neither its scroll events nor its scrollend settle again.
  expect(offsetOf(0)).toBe(-4);
  fireEvent.scroll(viewport);
  act(() => vi.advanceTimersByTime(120));
  fireEvent(viewport, new Event('scrollend'));
  expect(onActiveIndexChange).toHaveBeenCalledTimes(1);
  expect(items[1]).toHaveAttribute('data-active');

  // The user scrolling ends the hold, and the carousel settles as usual.
  viewport.scrollLeft = 30;
  fireEvent.scroll(viewport);
  act(() => vi.advanceTimersByTime(120));
  expect(onActiveIndexChange).toHaveBeenLastCalledWith(0);
});

test('the hold lets go when the user scrolls between frames or its item leaves, and on unmount', () => {
  const { created } = mockAnimations();
  const { unmount } = render(
    <Carousel label="Free" scrollMode="free">
      {carouselItems()}
    </Carousel>,
  );
  act(flushAnimationFrames);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  const widths = [188, 120, 56, 56, 56];
  layOutStrip(viewport, items, (index) => widths[index]);

  viewport.scrollLeft = 152;
  fireEvent(viewport, new Event('scrollend'));
  expect(created).toHaveLength(3);
  // A scroll the hold did not make, even before its scroll event arrives.
  viewport.scrollLeft = 100;
  widths.splice(0, 3, 122, 154, 88);
  act(flushAnimationFrames);
  expect(viewport.scrollLeft).toBe(100);
  expect(animationFrames.size).toBe(0);

  // The next settle holds the third item — until it leaves the document.
  viewport.scrollLeft = 300;
  fireEvent.scroll(viewport);
  fireEvent(viewport, new Event('scrollend'));
  expect(items[2]).toHaveAttribute('data-active');
  Object.defineProperty(items[2], 'isConnected', { configurable: true, value: false });
  widths.splice(0, 3, 56, 56, 188);
  act(flushAnimationFrames);
  expect(viewport.scrollLeft).toBe(300);
  expect(animationFrames.size).toBe(0);
  Reflect.deleteProperty(items[2], 'isConnected');

  // A hold still running when the carousel unmounts cancels its frame.
  widths.splice(0, 3, 56, 188, 120);
  viewport.scrollLeft = 70;
  fireEvent.scroll(viewport);
  fireEvent(viewport, new Event('scrollend'));
  expect(items[1]).toHaveAttribute('data-active');
  act(flushAnimationFrames);
  const pendingFrames = Array.from(animationFrames.keys());
  expect(pendingFrames).toHaveLength(1);
  unmount();
  expect(window.cancelAnimationFrame).toHaveBeenCalledWith(pendingFrames[0]);
});

test('a size change that does not morph is held at once, and a snapping carousel is left to the browser', () => {
  mediaMatches = true;
  const roleWidths: Record<string, number> = { large: 340, small: 56 };
  const { rerender } = render(
    <Carousel label="Hero" layout="hero" scrollMode="free">
      {carouselItems()}
    </Carousel>,
  );
  act(flushAnimationFrames);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  const offsetOf = layOutStrip(viewport, items, (index) => roleWidths[items[index].dataset.sizeRole as string]);

  // Reduced motion resizes the items instantly, so the one correction happens with it.
  viewport.scrollLeft = 360;
  expect(offsetOf(1)).toBe(4);
  fireEvent(viewport, new Event('scrollend'));
  expect(items.map((item) => item.dataset.sizeRole)).toEqual(['small', 'large', 'small', 'small', 'small']);
  expect([viewport.scrollLeft, offsetOf(1)]).toEqual([76, 4]);
  expect(animationFrames.size).toBe(0);

  // Snapping viewports re-snap to the active item themselves.
  rerender(
    <Carousel label="Hero" layout="hero" scrollMode="snap">
      {carouselItems()}
    </Carousel>,
  );
  viewport.scrollLeft = 420;
  expect(offsetOf(2)).toBe(8);
  fireEvent.scroll(viewport);
  fireEvent(viewport, new Event('scrollend'));
  expect(items[2]).toHaveAttribute('data-active');
  expect(viewport.scrollLeft).toBe(420);
});

test('a carousel that stops scrolling freely mid-morph drops its hold and leaves the snap to the browser', () => {
  const { created } = mockAnimations();
  const { rerender } = render(
    <Carousel label="Free" scrollMode="free">
      {carouselItems()}
    </Carousel>,
  );
  act(flushAnimationFrames);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  const widths = [188, 120, 56, 56, 56];
  layOutStrip(viewport, items, (index) => widths[index]);
  viewport.scrollLeft = 152;
  fireEvent(viewport, new Event('scrollend'));
  expect(created).toHaveLength(3);
  expect(animationFrames.size).toBe(1);

  rerender(
    <Carousel label="Free" scrollMode="snap">
      {carouselItems()}
    </Carousel>,
  );
  expect(animationFrames.size).toBe(0);
  const scrollBy = vi.spyOn(viewport, 'scrollBy');
  widths.splice(0, 3, 122, 154, 88);
  act(flushAnimationFrames);
  expect(scrollBy).not.toHaveBeenCalled();
  expect(viewport.scrollLeft).toBe(152);
});

test('switching a free carousel to full-screen drops its hold, so vertical scrolls move the active item', () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const onActiveIndexChange = vi.fn();
  const { rerender } = render(
    <Carousel label="Free" scrollMode="free" onActiveIndexChange={onActiveIndexChange}>
      {carouselItems()}
    </Carousel>,
  );
  act(flushAnimationFrames);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  const layOutColumn = (activeIndex: number) => {
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 412, height: 800 }));
    for (const [index, item] of items.entries()) {
      vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(
        rect({ top: (index - activeIndex) * 808, width: 412, height: 800 }),
      );
    }
  };

  // Crossing a breakpoint on the first item resizes the row, and the hold keeps it at scrollLeft 0.
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 600, height: 220 }));
  act(() => resizeCallbacks.at(-1)?.([], {} as ResizeObserver));
  expect(viewport.style.getPropertyValue('--md-carousel-large-count')).toBe('2');
  expect(viewport.scrollLeft).toBe(0);

  // Full-screen snaps vertically, so neither its scroll events nor its scrollend
  // are the hold's own, although they leave scrollLeft at 0.
  rerender(
    <Carousel label="Free" layout="full-screen" scrollMode="free" onActiveIndexChange={onActiveIndexChange}>
      {carouselItems()}
    </Carousel>,
  );
  layOutColumn(2);
  viewport.scrollTop = 1616;
  fireEvent.scroll(viewport);
  act(() => vi.advanceTimersByTime(120));
  expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
  expect(items[2]).toHaveAttribute('data-active');
  layOutColumn(3);
  viewport.scrollTop = 2424;
  fireEvent(viewport, new Event('scrollend'));
  expect(onActiveIndexChange).toHaveBeenLastCalledWith(3);
  expect(items[3]).toHaveAttribute('data-active');

  // Going back to free scrolling holds afresh on the inline axis, and the user scrolling lets go of it.
  rerender(
    <Carousel label="Free" scrollMode="free" onActiveIndexChange={onActiveIndexChange}>
      {carouselItems()}
    </Carousel>,
  );
  const offsetOf = layOutStrip(viewport, items, (index) => [56, 56, 56, 188, 120][index]);
  viewport.scrollLeft = 80;
  expect(offsetOf(1)).toBe(0);
  fireEvent.scroll(viewport);
  act(() => vi.advanceTimersByTime(120));
  expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
});

test('every morph starts, and the timing tokens are read, before any item changes size', () => {
  render(<Carousel label="Order">{carouselItems()}</Carousel>);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 412, height: 220 }));
  for (const [index, item] of items.entries()) {
    item.style.width = '100px';
    vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(rect({ left: (index - 2) * 200, width: 100, height: 200 }));
  }
  const sizes = () => items.map((item) => item.dataset.sizeRole).join(' ');
  const before = sizes();
  // A layout forced while some items had shrunk and others had not yet grown
  // would narrow the strip and clamp its scroll position.
  const seen: string[] = [];
  const getStyle = globalThis.getComputedStyle;
  vi.spyOn(globalThis, 'getComputedStyle').mockImplementation((element: Element, pseudoElement?: string | null) => {
    if (element === viewport) seen.push(sizes());
    return getStyle.call(window, element, pseudoElement);
  });
  vi.spyOn(Element.prototype, 'animate').mockImplementation(() => {
    seen.push(sizes());
    return { cancel: () => {}, finished: new Promise(() => {}) } as unknown as Animation;
  });
  fireEvent(viewport, new Event('scrollend'));
  expect(sizes()).toBe('small small large medium small');
  expect(seen.length).toBeGreaterThan(3);
  expect(new Set(seen)).toEqual(new Set([before]));
});

test('morphs skip items that were never laid out and switches to or from uniform sizing', () => {
  const animate = vi.spyOn(Element.prototype, 'animate');
  const { rerender } = render(<Carousel label="Skips">{carouselItems()}</Carousel>);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 412, height: 220 }));
  for (const [index, item] of items.entries()) {
    vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(rect({ left: (index - 1) * 200, width: 100, height: 200 }));
  }
  // happy-dom lays nothing out, like a carousel inside a display: none panel.
  fireEvent(viewport, new Event('scrollend'));
  expect(items[1]).toHaveAttribute('data-size-role', 'large');
  expect(animate).not.toHaveBeenCalled();

  for (const item of items) item.style.width = '100px';
  rerender(
    <Carousel label="Skips" layout="uncontained">
      {carouselItems()}
    </Carousel>,
  );
  expect(items[1]).toHaveAttribute('data-size-role', 'uniform');
  rerender(<Carousel label="Skips">{carouselItems()}</Carousel>);
  expect(items[1]).toHaveAttribute('data-size-role', 'large');
  expect(animate).not.toHaveBeenCalled();
});

test('a running morph keeps going through a resize but stops when the item switches to a size that does not morph', () => {
  const { created } = mockAnimations();
  const { rerender } = render(<Carousel label="Interrupted">{carouselItems()}</Carousel>);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 412, height: 220 }));
  for (const [index, item] of items.entries()) {
    item.style.width = '100px';
    vi.spyOn(item, 'getBoundingClientRect').mockReturnValue(rect({ left: (index - 1) * 200, width: 100, height: 200 }));
  }
  fireEvent(viewport, new Event('scrollend'));
  expect(created).toHaveLength(3);

  act(() => resizeCallbacks.at(-1)?.([], {} as ResizeObserver));
  expect(created.map(({ cancel }) => cancel.mock.calls.length)).toEqual([0, 0, 0]);

  // Uniform sizing applies at once instead of finishing the morph towards it.
  rerender(
    <Carousel label="Interrupted" layout="uncontained">
      {carouselItems()}
    </Carousel>,
  );
  expect(items[1]).toHaveAttribute('data-size-role', 'uniform');
  expect(created).toHaveLength(3);
  expect(created.map(({ cancel }) => cancel.mock.calls.length)).toEqual([1, 1, 1]);
});

test('changing the large-item cap re-counts the large items without waiting for a resize', () => {
  const lengths = { content: 1408, large: 360, medium: 120, small: 56, gap: 8 };
  mockProbe(lengths);
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => (
    <CarouselItem key={id} label={`Capped ${id}`} onClick={() => {}}>
      Capped
    </CarouselItem>
  ));
  const { rerender } = render(<Carousel label="Cap">{items}</Carousel>);
  const viewport = screen.getByRole('list');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 1440, height: 220 }));
  act(() => resizeCallbacks.at(-1)?.([], {} as ResizeObserver));
  expect(viewport.style.getPropertyValue('--md-carousel-large-count')).toBe('4');

  // Re-rendering with the same cap leaves the layout alone.
  lengths.large = 200;
  rerender(<Carousel label="Cap">{items}</Carousel>);
  expect(viewport.style.getPropertyValue('--md-carousel-large-count')).toBe('4');

  rerender(
    <Carousel label="Cap" largeItemMaxWidth={200}>
      {items}
    </Carousel>,
  );
  expect(screen.getByRole('region').style.getPropertyValue('--md-carousel-large-item-max-width')).toBe('200px');
  // (1408 − 120 − 56 − 8) / (200 + 8) → 6 large items.
  expect(viewport.style.getPropertyValue('--md-carousel-large-count')).toBe('6');
  expect(resizeCallbacks).toHaveLength(1);
});

test('reduced motion disables morphing and responds to media-query changes', () => {
  mediaMatches = true;
  const { unmount } = render(<Carousel label="Reduced">{carouselItems().slice(0, 3)}</Carousel>);
  expect(screen.getByRole('region')).toHaveAttribute('data-reduced-motion');
  expect(screen.getAllByRole('listitem').map((item) => item.dataset.sizeRole)).toEqual([
    'uniform',
    'uniform',
    'uniform',
  ]);
  expect(mediaAdd).toHaveBeenCalledWith('change', expect.any(Function));

  act(() => mediaChangeListener?.({ matches: false } as MediaQueryListEvent));
  expect(screen.getByRole('region')).not.toHaveAttribute('data-reduced-motion');
  expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-size-role', 'large');
  act(() => mediaChangeListener?.({ matches: true } as MediaQueryListEvent));
  expect(screen.getByRole('region')).toHaveAttribute('data-reduced-motion');
  unmount();
  expect(mediaRemove).toHaveBeenCalledWith('change', expect.any(Function));
});

test('motion preference changes preserve the active item', () => {
  render(<Carousel label="Preserved active item">{carouselItems().slice(0, 3)}</Carousel>);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 300, height: 200 }));
  vi.spyOn(items[0], 'getBoundingClientRect').mockReturnValue(rect({ left: -400, width: 100, height: 200 }));
  vi.spyOn(items[1], 'getBoundingClientRect').mockReturnValue(rect({ left: 0, width: 100, height: 200 }));
  vi.spyOn(items[2], 'getBoundingClientRect').mockReturnValue(rect({ left: 400, width: 100, height: 200 }));
  fireEvent(viewport, new Event('scrollend'));
  expect(items[1]).toHaveAttribute('data-active');

  act(() => mediaChangeListener?.({ matches: true } as MediaQueryListEvent));
  expect(items[1]).toHaveAttribute('data-active');
  expect(items.map((item) => item.dataset.sizeRole)).toEqual(['uniform', 'uniform', 'uniform']);
});

test('works without matchMedia, ResizeObserver, or scrollIntoView and uses the resize fallback', () => {
  Reflect.deleteProperty(window, 'matchMedia');
  Reflect.deleteProperty(globalThis, 'ResizeObserver');
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  const removeListener = vi.spyOn(window, 'removeEventListener');
  const { unmount } = render(<Carousel label="Fallback">{carouselItems().slice(0, 2)}</Carousel>);
  act(flushAnimationFrames);
  expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow();
  const first = screen.getByRole('button', { name: 'One' });
  first.focus();
  expect(() => fireEvent.keyDown(first, { key: 'ArrowRight' })).not.toThrow();
  unmount();
  expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
});

test('scroll work is frame-batched, updates parallax, settles with a fallback timer, and reports active changes', () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  const onActiveIndexChange = vi.fn();
  const { unmount } = render(
    <Carousel label="Scrolling" onActiveIndexChange={onActiveIndexChange}>
      {carouselItems().slice(0, 3)}
    </Carousel>,
  );
  act(flushAnimationFrames);
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ left: 0, width: 300, height: 200 }));
  vi.spyOn(items[0], 'getBoundingClientRect').mockReturnValue(rect({ left: -400, width: 100, height: 200 }));
  vi.spyOn(items[1], 'getBoundingClientRect').mockReturnValue(rect({ left: 0, width: 200, height: 200 }));
  vi.spyOn(items[2], 'getBoundingClientRect').mockReturnValue(rect({ left: 500, width: 100, height: 200 }));

  fireEvent.scroll(viewport);
  fireEvent.scroll(viewport);
  expect(window.cancelAnimationFrame).toHaveBeenCalled();
  act(flushAnimationFrames);
  expect(
    items[0]
      .querySelector<HTMLElement>('.md-carousel-item__content')
      ?.style.getPropertyValue('--md-carousel-parallax-offset'),
  ).toBe('12%');
  expect(
    items[2]
      .querySelector<HTMLElement>('.md-carousel-item__content')
      ?.style.getPropertyValue('--md-carousel-parallax-offset'),
  ).toBe('-12%');
  act(() => vi.advanceTimersByTime(120));
  expect(onActiveIndexChange).toHaveBeenCalledWith(1);
  expect(items[1]).toHaveAttribute('data-active');

  fireEvent(viewport, new Event('scrollend'));
  expect(onActiveIndexChange).toHaveBeenCalledTimes(1);
  const rogue = document.createElement('li');
  rogue.dataset.mdCarouselItem = '';
  viewport.append(rogue);
  fireEvent.scroll(viewport);
  act(flushAnimationFrames);
  unmount();
  expect(window.cancelAnimationFrame).toHaveBeenCalled();
});

test('native scrollend listener is removed and no longer reports after unmount', () => {
  const onActiveIndexChange = vi.fn();
  const { unmount } = render(
    <Carousel label="Native settle" onActiveIndexChange={onActiveIndexChange}>
      {carouselItems().slice(0, 2)}
    </Carousel>,
  );
  const viewport = screen.getByRole('list');
  const items = screen.getAllByRole('listitem');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 200, height: 100 }));
  vi.spyOn(items[0], 'getBoundingClientRect').mockReturnValue(rect({ left: -300, width: 100, height: 100 }));
  vi.spyOn(items[1], 'getBoundingClientRect').mockReturnValue(rect({ left: 0, width: 100, height: 100 }));
  fireEvent(viewport, new Event('scrollend'));
  expect(onActiveIndexChange).toHaveBeenCalledWith(1);
  unmount();
  fireEvent(viewport, new Event('scrollend'));
  expect(onActiveIndexChange).toHaveBeenCalledTimes(1);
});

test('horizontal keyboard navigation skips disabled actions, preserves orthogonal keys, and supports Home and End', () => {
  const onKeyDown = vi.fn();
  render(
    <Carousel label="Keyboard" onKeyDown={onKeyDown}>
      <CarouselItem label="One" onClick={() => {}}>
        <span data-testid="one-content">One</span>
      </CarouselItem>
      <CarouselItem label="Disabled" disabled onClick={() => {}}>
        Disabled
      </CarouselItem>
      <CarouselItem label="Three" href="#three">
        Three
      </CarouselItem>
    </Carousel>,
  );
  const one = screen.getByRole('button', { name: 'One' });
  const three = screen.getByRole('link', { name: 'Three' });
  one.focus();
  fireEvent.keyDown(screen.getByTestId('one-content'), { key: 'ArrowRight' });
  expect(document.activeElement).toBe(three);
  expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  fireEvent.keyDown(three, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(one);
  fireEvent.keyDown(one, { key: 'End' });
  expect(document.activeElement).toBe(three);
  fireEvent.keyDown(three, { key: 'Home' });
  expect(document.activeElement).toBe(one);
  fireEvent.keyDown(one, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(one);
  fireEvent.keyDown(screen.getByRole('region'), { key: 'ArrowRight' });
  const rogueAction = document.createElement('button');
  rogueAction.dataset.mdCarouselAction = '';
  screen.getByRole('region').append(rogueAction);
  rogueAction.focus();
  fireEvent.keyDown(rogueAction, { key: 'End' });
  expect(document.activeElement).toBe(rogueAction);
  expect(onKeyDown).toHaveBeenCalled();
});

test('RTL and full-screen keyboard navigation use the correct physical axis', () => {
  const { rerender } = render(
    <Carousel label="RTL" style={{ direction: 'rtl' }}>
      {carouselItems().slice(0, 3)}
    </Carousel>,
  );
  const one = screen.getByRole('button', { name: 'One' });
  const two = screen.getByRole('button', { name: 'Two' });
  one.focus();
  fireEvent.keyDown(one, { key: 'ArrowLeft' });
  expect(document.activeElement).toBe(two);
  fireEvent.keyDown(two, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(one);

  rerender(
    <Carousel label="Vertical" layout="full-screen">
      {carouselItems().slice(0, 3)}
    </Carousel>,
  );
  const verticalOne = screen.getByRole('button', { name: 'One' });
  verticalOne.focus();
  fireEvent.keyDown(verticalOne, { key: 'ArrowDown' });
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Two' }));
  fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowUp' });
  expect(document.activeElement).toBe(verticalOne);
  fireEvent.keyDown(verticalOne, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(verticalOne);

  act(flushAnimationFrames);
  const viewport = screen.getByRole('list');
  const verticalItems = screen.getAllByRole('listitem');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ top: 0, width: 300, height: 300 }));
  vi.spyOn(verticalItems[0], 'getBoundingClientRect').mockReturnValue(rect({ top: -400, width: 300, height: 300 }));
  vi.spyOn(verticalItems[1], 'getBoundingClientRect').mockReturnValue(rect({ top: 0, width: 300, height: 300 }));
  vi.spyOn(verticalItems[2], 'getBoundingClientRect').mockReturnValue(rect({ top: 400, width: 300, height: 300 }));
  fireEvent.scroll(viewport);
  act(flushAnimationFrames);
  expect(
    verticalItems[0]
      .querySelector<HTMLElement>('.md-carousel-item__content')
      ?.style.getPropertyValue('--md-carousel-parallax-offset'),
  ).toBe('12%');
  fireEvent(viewport, new Event('scrollend'));
});

test('a consumer can prevent carousel keyboard movement', () => {
  render(
    <Carousel label="Prevented" onKeyDown={(event) => event.preventDefault()}>
      {carouselItems().slice(0, 2)}
    </Carousel>,
  );
  const one = screen.getByRole('button', { name: 'One' });
  one.focus();
  fireEvent.keyDown(one, { key: 'ArrowRight' });
  expect(document.activeElement).toBe(one);
});

test('font loading events recompute layout and remove their listener on cleanup', () => {
  let loadingDoneListener: EventListener | undefined;
  const addEventListener = vi.fn((_type: string, listener: EventListener) => {
    loadingDoneListener = listener;
  });
  const removeEventListener = vi.fn();
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve(), addEventListener, removeEventListener },
  });
  const { unmount } = render(<Carousel label="Font loading event">{carouselItems().slice(0, 3)}</Carousel>);
  expect(addEventListener).toHaveBeenCalledWith('loadingdone', expect.any(Function));
  act(() => loadingDoneListener?.(new Event('loadingdone')));
  expect(screen.getAllByRole('listitem')[0]).toHaveAttribute('data-size-role', 'large');
  unmount();
  expect(removeEventListener).toHaveBeenCalledWith('loadingdone', loadingDoneListener);
});

test('font readiness recomputes while mounted and is ignored after cleanup', async () => {
  let resolveFirst = () => {};
  const firstReady = new Promise<void>((resolve) => {
    resolveFirst = resolve;
  });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: firstReady } });
  const first = render(<Carousel label="Fonts mounted">{carouselItems().slice(0, 2)}</Carousel>);
  const initialResizeCount = resizeCallbacks.length;
  await act(async () => {
    resolveFirst();
    await firstReady;
  });
  expect(resizeCallbacks).toHaveLength(initialResizeCount);
  first.unmount();

  let resolveSecond = () => {};
  const secondReady = new Promise<void>((resolve) => {
    resolveSecond = resolve;
  });
  Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: secondReady } });
  const second = render(<Carousel label="Fonts unmounted">{carouselItems().slice(0, 2)}</Carousel>);
  second.unmount();
  await act(async () => {
    resolveSecond();
    await secondReady;
  });
  expect(resizeDisconnect).toHaveBeenCalled();
});

test('empty carousels, invalid direct children, and standalone items use safe fallbacks', () => {
  const { rerender } = render(<Carousel label="Empty">{[]}</Carousel>);
  expect(screen.getByRole('list')).toBeEmptyDOMElement();
  act(flushAnimationFrames);
  rerender(
    <Carousel label="Filtered">
      {
        [
          'not an item',
          <div key="invalid-element">Not a CarouselItem</div>,
          ...carouselItems().slice(0, 1),
        ] as unknown as React.ComponentProps<typeof Carousel>['children']
      }
    </Carousel>,
  );
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(screen.queryByText('Not a CarouselItem')).not.toBeInTheDocument();
  rerender(
    <ul>
      <CarouselItem label="Standalone" onClick={() => {}}>
        Standalone content
      </CarouselItem>
    </ul>,
  );
  expect(screen.getByText('Item 1 of 1')).toBeInTheDocument();
  expect(screen.getByRole('listitem')).toHaveAttribute('data-layout', 'multi-browse');
});

test('captured observer callbacks and pending work are harmless after unmount', () => {
  vi.useFakeTimers();
  const { unmount } = render(<Carousel label="Cleanup">{carouselItems().slice(0, 2)}</Carousel>);
  const callback = resizeCallbacks[0];
  fireEvent.scroll(screen.getByRole('list'));
  unmount();
  expect(() => callback([], {} as ResizeObserver)).not.toThrow();
  expect(() => vi.runAllTimers()).not.toThrow();
});

test('a queued settle callback is harmless after its carousel unmounts', () => {
  const timerCallbacks: Array<() => void> = [];
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(((callback: TimerHandler) => {
    if (typeof callback === 'function') timerCallbacks.push(callback as () => void);
    return timerCallbacks.length as unknown as ReturnType<typeof setTimeout>;
  }) as unknown as typeof setTimeout);
  const { unmount } = render(<Carousel label="Late settle">{carouselItems().slice(0, 2)}</Carousel>);
  fireEvent.scroll(screen.getByRole('list'));
  const settleCallback = timerCallbacks.at(-1);
  unmount();
  expect(() => settleCallback?.()).not.toThrow();
});

test('carousel CSS encodes M3 spacing, shapes, responsive sizing, snapping, touch axes, and reduced motion', () => {
  expect(carouselCss).toContain('--md-carousel-gap: 8px');
  expect(carouselCss).toContain('--md-carousel-inline-padding: 16px');
  expect(carouselCss).toContain('--md-carousel-item-shape: var(--md-sys-shape-corner-extra-large)');
  expect(carouselCss).toContain('scroll-snap-type: inline mandatory');
  expect(carouselCss).toContain('scroll-snap-type: block mandatory');
  expect(carouselCss).toContain('scroll-snap-stop: always');
  expect(carouselCss).toContain('@media (prefers-reduced-motion: reduce)');
  expect(carouselCss).not.toContain('!important');
});

function cssRule(selector: string) {
  const start = carouselCss.indexOf(`\n${selector} {`);
  expect(start).toBeGreaterThanOrEqual(0);
  return carouselCss.slice(start, carouselCss.indexOf('\n}', start));
}

test('carousel viewports leave both pan axes to the browser so every layout can be swiped', () => {
  // The browser has to own the strip's own scroll axis, or touch swipes cannot scroll it.
  expect(cssRule('.md-carousel__viewport')).toContain('touch-action: pan-x pan-y pinch-zoom;');
  expect(carouselCss.match(/touch-action:/g)).toHaveLength(1);
});

test('full-screen items keep the 8dp carousel gap', () => {
  const fullScreen = cssRule('.md-carousel__viewport[data-layout="full-screen"]');
  expect(fullScreen).toContain('flex-direction: column;');
  expect(fullScreen).not.toMatch(/\n {2}gap:/);
  expect(cssRule('.md-carousel__viewport')).toContain('gap: var(--md-carousel-gap);');
});

test('large items reserve their gaps from the gap token, and items are never scaled', () => {
  const item = cssRule('.md-carousel-item');
  expect(item).toMatch(/\(var\(--md-carousel-large-count\) \+ 1\) \*\s+var\(--md-carousel-gap\)/);
  expect(carouselCss).not.toContain('reserved-gaps');
  expect(item).not.toContain('transform');
});

test('the length probe is out of flow, unpainted, and sized from the multi-browse tokens', () => {
  const probe = cssRule('.md-carousel__probe');
  expect(probe).toContain('position: absolute;');
  expect(probe).toContain('visibility: hidden;');
  expect(probe).toContain('inline-size: 100cqi;');
  expect(probe).toContain('inline-size: var(--md-carousel-large-item-max-width);');
  expect(probe).toContain('inline-size: var(--md-carousel-medium-item-width);');
  expect(probe).toContain('inline-size: var(--md-carousel-small-item-width);');
  expect(probe).toContain('inline-size: var(--md-carousel-gap);');
});
