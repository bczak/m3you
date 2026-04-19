import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { LoadingIndicator } from '../src/components/LoadingIndicator/loading-indicator';
import { SHAPE_SEQUENCE } from '../src/components/LoadingIndicator/shapes';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test('renders the layered loading indicator structure', async () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <LoadingIndicator ref={ref} size="lg" container className="custom-class" data-testid="loader" />,
  );

  const loader = screen.getByTestId('loader');
  const rotator = container.querySelector('.md-loading-indicator__rotator');
  const shape = container.querySelector('.md-loading-indicator__shape');
  const circle = container.querySelector('.md-loading-indicator__container');

  expect(loader).toHaveClass('md-loading-indicator');
  expect(loader).toHaveClass('custom-class');
  expect(loader).toHaveAttribute('data-size', 'lg');
  expect(loader).toHaveAttribute('data-container');
  expect(loader).toHaveAttribute('aria-label', 'Loading');
  expect(rotator).toBeInTheDocument();
  expect(shape).toHaveAttribute('d', SHAPE_SEQUENCE[0]);
  expect(circle).toBeInTheDocument();
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
});

test('animates shape morphs and keeps rotation moving through the full cycle', async () => {
  vi.useFakeTimers();

  const animateSpy = vi.spyOn(Element.prototype, 'animate').mockImplementation(
    () =>
      ({
        onfinish: null,
        cancel: () => {},
        finished: Promise.resolve(),
      }) as unknown as Animation,
  );

  render(<LoadingIndicator />);

  act(() => {
    vi.advanceTimersByTime(500);
  });

  expect(animateSpy).toHaveBeenCalledTimes(2);

  const [shapeFrames, shapeOptions] = animateSpy.mock.calls[0] as [
    Array<Record<string, string>>,
    KeyframeAnimationOptions,
  ];
  const [rotationFrames, rotationOptions] = animateSpy.mock.calls[1] as [
    Array<Record<string, string>>,
    KeyframeAnimationOptions,
  ];

  expect(shapeFrames[0]).toMatchObject({ d: `path("${SHAPE_SEQUENCE[0]}")` });
  expect(shapeFrames[1]).toMatchObject({ d: `path("${SHAPE_SEQUENCE[1]}")` });
  expect(shapeOptions).toMatchObject({
    duration: 585,
    easing: 'cubic-bezier(0.39, 1.29, 0.35, 0.98)',
    fill: 'forwards',
  });

  expect(rotationFrames[0]).toMatchObject({ transform: 'rotate(0deg)' });
  expect(rotationFrames[1]).toMatchObject({ transform: 'rotate(90deg)' });
  expect(rotationOptions).toMatchObject({
    duration: 650,
    easing: 'linear',
    fill: 'forwards',
  });
});
