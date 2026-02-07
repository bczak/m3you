import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useAnimationFrame } from 'framer-motion';
import * as React from 'react';

import { cn } from '../../lib/utils';

const loadingIndicatorVariants = cva('inline-flex shrink-0 items-center justify-center', {
  variants: {
    size: {
      sm: 'size-8',
      md: 'size-12',
      lg: 'size-16',
    },
    contained: {
      true: 'rounded-full bg-tertiary-container',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    contained: false,
  },
});

const loadingIndicatorIconVariants = cva('text-primary', {
  variants: {
    size: {
      sm: 'size-5',
      md: 'size-8',
      lg: 'size-10',
    },
    contained: {
      true: 'text-tertiary',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    contained: false,
  },
});

// Generate a star/polygon path with rounded corners
function generateStarPath(
  points: number,
  outerRadius: number,
  innerRadius: number,
  centerX: number,
  centerY: number,
  cornerRadius: number,
): string {
  if (points < 2) points = 2;

  const vertices: { x: number; y: number }[] = [];
  const totalPoints = points * 2;

  for (let i = 0; i < totalPoints; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    vertices.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  // Build path with rounded corners using quadratic bezier curves
  let path = '';
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const curr = vertices[i];
    const next = vertices[(i + 1) % n];
    const prev = vertices[(i - 1 + n) % n];

    // Calculate vectors to prev and next
    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    const toNext = { x: next.x - curr.x, y: next.y - curr.y };

    // Normalize vectors
    const lenPrev = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
    const lenNext = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

    const normPrev = { x: toPrev.x / lenPrev, y: toPrev.y / lenPrev };
    const normNext = { x: toNext.x / lenNext, y: toNext.y / lenNext };

    // Calculate corner points (offset from vertex)
    const offset = Math.min(cornerRadius, lenPrev / 2, lenNext / 2);
    const startPt = { x: curr.x + normPrev.x * offset, y: curr.y + normPrev.y * offset };
    const endPt = { x: curr.x + normNext.x * offset, y: curr.y + normNext.y * offset };

    if (i === 0) {
      path = `M ${startPt.x} ${startPt.y}`;
    } else {
      path += ` L ${startPt.x} ${startPt.y}`;
    }

    // Quadratic bezier curve for rounded corner
    path += ` Q ${curr.x} ${curr.y} ${endPt.x} ${endPt.y}`;
  }

  // Close the path by connecting back to start
  const first = vertices[0];
  const last = vertices[n - 1];
  const second = vertices[1];

  const toLastFromFirst = { x: last.x - first.x, y: last.y - first.y };
  const lenToLast = Math.sqrt(toLastFromFirst.x * toLastFromFirst.x + toLastFromFirst.y * toLastFromFirst.y);
  const normToLast = { x: toLastFromFirst.x / lenToLast, y: toLastFromFirst.y / lenToLast };
  const toSecondFromFirst = { x: second.x - first.x, y: second.y - first.y };
  const lenToSecond = Math.sqrt(toSecondFromFirst.x * toSecondFromFirst.x + toSecondFromFirst.y * toSecondFromFirst.y);
  const offsetFirst = Math.min(cornerRadius, lenToLast / 2, lenToSecond / 2);
  const closePt = { x: first.x + normToLast.x * offsetFirst, y: first.y + normToLast.y * offsetFirst };

  path += ` L ${closePt.x} ${closePt.y} Z`;

  return path;
}

// Pre-generate paths for all point counts (8 down to 2)
const CENTER = 24;
const OUTER_RADIUS = 20;
const INNER_RADIUS = 10;
const CORNER_RADIUS = 3;

const STAR_PATHS = [
  generateStarPath(8, OUTER_RADIUS, INNER_RADIUS, CENTER, CENTER, CORNER_RADIUS), // 8 points
  generateStarPath(7, OUTER_RADIUS, INNER_RADIUS, CENTER, CENTER, CORNER_RADIUS), // 7 points
  generateStarPath(6, OUTER_RADIUS, INNER_RADIUS, CENTER, CENTER, CORNER_RADIUS), // 6 points
  generateStarPath(5, OUTER_RADIUS, INNER_RADIUS, CENTER, CENTER, CORNER_RADIUS), // 5 points
  generateStarPath(4, OUTER_RADIUS, INNER_RADIUS, CENTER, CENTER, CORNER_RADIUS), // 4 points
  generateStarPath(3, OUTER_RADIUS, INNER_RADIUS, CENTER, CENTER, CORNER_RADIUS), // 3 points
  generateStarPath(2, OUTER_RADIUS, INNER_RADIUS, CENTER, CENTER, CORNER_RADIUS), // 2 points
];

export type LoadingIndicatorProps = React.ComponentProps<'div'> & VariantProps<typeof loadingIndicatorVariants>;

const LoadingIndicator = React.forwardRef<HTMLDivElement, LoadingIndicatorProps>(
  ({ className, size = 'md', contained = false, ...props }, ref) => {
    const [pathIndex, setPathIndex] = React.useState(0);
    const [rotation, setRotation] = React.useState(0);
    const lastTimeRef = React.useRef(0);
    const rotationRef = React.useRef(0);
    const lastRotationCycleRef = React.useRef(0);

    // Animation duration per rotation cycle (ms)
    const rotationDuration = 800;

    useAnimationFrame((time) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const elapsed = time - lastTimeRef.current;

      // Calculate rotation with ease-in-out
      const progress = (elapsed % rotationDuration) / rotationDuration;
      // Ease in-out cubic
      const eased = progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2;

      // Calculate which rotation cycle we're in
      const currentCycle = Math.floor(elapsed / rotationDuration);

      // Update rotation (continuous 360° cycles)
      rotationRef.current = currentCycle * 360 + eased * 360;
      setRotation(rotationRef.current);

      // Change shape at the end of each rotation cycle
      if (currentCycle !== lastRotationCycleRef.current) {
        lastRotationCycleRef.current = currentCycle;
        setPathIndex((prev) => (prev + 1) % STAR_PATHS.length);
      }
    });

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-label="Loading"
        aria-busy="true"
        className={cn(loadingIndicatorVariants({ size, contained, className }))}
        {...props}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="currentColor"
          className={cn(loadingIndicatorIconVariants({ size, contained }))}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <motion.path
            d={STAR_PATHS[pathIndex]}
            initial={false}
            animate={{ d: STAR_PATHS[pathIndex] }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>
    );
  },
);
LoadingIndicator.displayName = 'LoadingIndicator';

export { LoadingIndicator, loadingIndicatorVariants };
