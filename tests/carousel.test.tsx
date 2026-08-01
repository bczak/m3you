import { readFileSync } from 'node:fs';
import { act, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { Carousel, CarouselItem } from '../src/components/Carousel/carousel';
import {
  clampCarouselIndex,
  getCarouselLargeCount,
  getCarouselSizeRoles,
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

test('ResizeObserver applies expanded roles, FLIP transforms, and disconnects on cleanup', async () => {
  let resolveAnimation = () => {};
  const finished = new Promise<void>((resolve) => {
    resolveAnimation = resolve;
  });
  const cancelAnimation = vi.fn();
  const animation = { cancel: cancelAnimation, finished } as unknown as Animation;
  const { unmount } = render(<Carousel label="Responsive">{carouselItems()}</Carousel>);
  const viewport = screen.getByRole('list');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 1000, height: 240 }));
  const items = screen.getAllByRole('listitem');
  for (const [index, item] of items.entries()) {
    const first = rect({ left: index * 100, width: 100, height: 200 });
    const second = rect({ left: index * 120, width: index === 0 ? 200 : 100, height: 200 });
    vi.spyOn(item, 'getBoundingClientRect').mockReturnValueOnce(first).mockReturnValue(second);
    vi.spyOn(item, 'animate').mockReturnValue(animation);
  }
  act(() => resizeCallbacks[0]([], {} as ResizeObserver));
  expect(items.map((item) => item.dataset.sizeRole)).toEqual(['large', 'large', 'large', 'medium', 'small']);
  expect(viewport.style.getPropertyValue('--md-carousel-large-count')).toBe('3');
  expect(viewport.style.getPropertyValue('--md-carousel-reserved-gaps')).toBe('32px');
  expect(items[0].animate).toHaveBeenCalledWith(
    expect.arrayContaining([expect.objectContaining({ transform: expect.stringContaining('scale(') })]),
    expect.objectContaining({ duration: 500 }),
  );
  unmount();
  expect(resizeDisconnect).toHaveBeenCalled();
  expect(cancelAnimation).toHaveBeenCalled();
  resolveAnimation();
  await finished;
});

test('FLIP skips zero and unchanged geometry and removes rejected animations', async () => {
  const rejection = Promise.reject(new Error('cancelled'));
  rejection.catch(() => {});
  const rejectedAnimation = { cancel: vi.fn(), finished: rejection } as unknown as Animation;
  render(<Carousel label="Geometry">{carouselItems().slice(0, 3)}</Carousel>);
  const viewport = screen.getByRole('list');
  vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ width: 700, height: 220 }));
  const [zero, unchanged, changed] = screen.getAllByRole('listitem');
  vi.spyOn(zero, 'getBoundingClientRect').mockReturnValue(rect());
  vi.spyOn(unchanged, 'getBoundingClientRect').mockReturnValue(rect({ left: 10, width: 100, height: 100 }));
  vi.spyOn(changed, 'getBoundingClientRect')
    .mockReturnValueOnce(rect({ left: 200, width: 100, height: 100 }))
    .mockReturnValue(rect({ left: 240, width: 120, height: 100 }));
  const zeroAnimate = vi.spyOn(zero, 'animate');
  const unchangedAnimate = vi.spyOn(unchanged, 'animate');
  const changedAnimate = vi.spyOn(changed, 'animate').mockReturnValue(rejectedAnimation);
  act(() => resizeCallbacks[0]([], {} as ResizeObserver));
  expect(zeroAnimate).not.toHaveBeenCalled();
  expect(unchangedAnimate).not.toHaveBeenCalled();
  expect(changedAnimate).toHaveBeenCalled();
  await rejection.catch(() => {});
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
  expect(carouselCss).toContain('touch-action: pan-y pinch-zoom');
  expect(carouselCss).toContain('touch-action: pan-x pinch-zoom');
  expect(carouselCss).toContain('@media (prefers-reduced-motion: reduce)');
  expect(carouselCss).not.toContain('!important');
});
