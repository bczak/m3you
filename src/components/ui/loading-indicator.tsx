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

// M3 Loading Indicator shapes - from 8-pointed star to ellipse
// These shapes follow the Material 3 design specification

// Helper to generate a scalloped/wavy circle (for 8-pointed and 6-pointed stars)
function generateScallopedPath(
  lobes: number,
  outerRadius: number,
  innerRadius: number,
  cx: number,
  cy: number,
): string {
  const points: string[] = [];
  const totalPoints = lobes * 2;

  for (let i = 0; i <= totalPoints; i++) {
    const angle = (i * Math.PI * 2) / totalPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      // Control point for smooth curve
      const midAngle = ((i - 0.5) * Math.PI * 2) / totalPoints - Math.PI / 2;
      const controlRadius = (outerRadius + innerRadius) / 2;
      const cpX = cx + controlRadius * Math.cos(midAngle);
      const cpY = cy + controlRadius * Math.sin(midAngle);

      points.push(`Q ${cpX} ${cpY} ${x} ${y}`);
    }
  }

  return `${points.join(' ')} Z`;
}

// Generate rounded polygon (pentagon, etc.)
function generateRoundedPolygon(sides: number, radius: number, cx: number, cy: number, cornerRadius: number): string {
  const vertices: { x: number; y: number }[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
    vertices.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }

  let path = '';
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const curr = vertices[i];
    const next = vertices[(i + 1) % n];
    const prev = vertices[(i - 1 + n) % n];

    const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
    const toNext = { x: next.x - curr.x, y: next.y - curr.y };

    const lenPrev = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
    const lenNext = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

    const normPrev = { x: toPrev.x / lenPrev, y: toPrev.y / lenPrev };
    const normNext = { x: toNext.x / lenNext, y: toNext.y / lenNext };

    const offset = Math.min(cornerRadius, lenPrev / 2, lenNext / 2);
    const startPt = { x: curr.x + normPrev.x * offset, y: curr.y + normPrev.y * offset };
    const endPt = { x: curr.x + normNext.x * offset, y: curr.y + normNext.y * offset };

    if (i === 0) {
      path = `M ${startPt.x} ${startPt.y}`;
    } else {
      path += ` L ${startPt.x} ${startPt.y}`;
    }

    path += ` Q ${curr.x} ${curr.y} ${endPt.x} ${endPt.y}`;
  }

  // Close path
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

// Generate ellipse path
function generateEllipse(cx: number, cy: number, rx: number, ry: number, rotation = 0): string {
  // Create ellipse using bezier curves (approximation)
  const kappa = 0.5522847498; // 4 * (sqrt(2) - 1) / 3

  const cos = Math.cos((rotation * Math.PI) / 180);
  const sin = Math.sin((rotation * Math.PI) / 180);

  const transform = (x: number, y: number) => ({
    x: cx + (x - cx) * cos - (y - cy) * sin,
    y: cy + (x - cx) * sin + (y - cy) * cos,
  });

  const ox = rx * kappa;
  const oy = ry * kappa;

  const p0 = transform(cx, cy - ry);
  const p1 = transform(cx + rx, cy);
  const p2 = transform(cx, cy + ry);
  const p3 = transform(cx - rx, cy);

  const c01a = transform(cx + ox, cy - ry);
  const c01b = transform(cx + rx, cy - oy);
  const c12a = transform(cx + rx, cy + oy);
  const c12b = transform(cx + ox, cy + ry);
  const c23a = transform(cx - ox, cy + ry);
  const c23b = transform(cx - rx, cy + oy);
  const c30a = transform(cx - rx, cy - oy);
  const c30b = transform(cx - ox, cy - ry);

  return `M ${p0.x} ${p0.y} C ${c01a.x} ${c01a.y} ${c01b.x} ${c01b.y} ${p1.x} ${p1.y} C ${c12a.x} ${c12a.y} ${c12b.x} ${c12b.y} ${p2.x} ${p2.y} C ${c23a.x} ${c23a.y} ${c23b.x} ${c23b.y} ${p3.x} ${p3.y} C ${c30a.x} ${c30a.y} ${c30b.x} ${c30b.y} ${p0.x} ${p0.y} Z`;
}

// Generate quatrefoil (4-lobed shape with concave sides)
function generateQuatrefoil(cx: number, cy: number, outerRadius: number, innerRadius: number): string {
  const points: string[] = [];
  const lobes = 4;
  const totalPoints = lobes * 2;

  for (let i = 0; i <= totalPoints; i++) {
    const angle = (i * Math.PI * 2) / totalPoints - Math.PI / 4; // Rotated 45 degrees
    const isOuter = i % 2 === 0;
    const radius = isOuter ? outerRadius : innerRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      const midAngle = ((i - 0.5) * Math.PI * 2) / totalPoints - Math.PI / 4;
      const controlRadius = isOuter ? innerRadius * 1.3 : outerRadius * 0.85;
      const cpX = cx + controlRadius * Math.cos(midAngle);
      const cpY = cy + controlRadius * Math.sin(midAngle);

      points.push(`Q ${cpX} ${cpY} ${x} ${y}`);
    }
  }

  return `${points.join(' ')} Z`;
}

// Generate 8-lobed flower/blob shape
function generateFlowerBlob(cx: number, cy: number, outerRadius: number, innerRadius: number): string {
  const lobes = 8;
  const points: string[] = [];

  for (let i = 0; i <= lobes * 2; i++) {
    const angle = (i * Math.PI) / lobes - Math.PI / 2;
    const isOuter = i % 2 === 0;
    const radius = isOuter ? outerRadius : innerRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    if (i === 0) {
      points.push(`M ${x} ${y}`);
    } else {
      const midAngle = ((i - 0.5) * Math.PI) / lobes - Math.PI / 2;
      const controlRadius = (outerRadius + innerRadius) / 2;
      const cpX = cx + controlRadius * Math.cos(midAngle);
      const cpY = cy + controlRadius * Math.sin(midAngle);
      points.push(`Q ${cpX} ${cpY} ${x} ${y}`);
    }
  }

  return `${points.join(' ')} Z`;
}

const CENTER = 24;
const OUTER_RADIUS = 18;

// M3 Loading Indicator shape sequence
const LOADING_SHAPES = [
  // Shape 1: 8-pointed star with scalloped edges
  generateScallopedPath(8, OUTER_RADIUS, OUTER_RADIUS * 0.7, CENTER, CENTER),
  // Shape 2: 8-lobed flower/blob (more rounded)
  generateFlowerBlob(CENTER, CENTER, OUTER_RADIUS * 0.9, OUTER_RADIUS * 0.75),
  // Shape 3: Pentagon with very rounded corners
  generateRoundedPolygon(5, OUTER_RADIUS * 0.95, CENTER, CENTER, 8),
  // Shape 4: Horizontal ellipse
  generateEllipse(CENTER, CENTER, OUTER_RADIUS, OUTER_RADIUS * 0.65, 0),
  // Shape 5: 6-pointed star with rounded edges
  generateScallopedPath(6, OUTER_RADIUS * 0.95, OUTER_RADIUS * 0.7, CENTER, CENTER),
  // Shape 6: 4-pointed quatrefoil (concave sides)
  generateQuatrefoil(CENTER, CENTER, OUTER_RADIUS * 0.9, OUTER_RADIUS * 0.55),
  // Shape 7: Tilted ellipse (diagonal)
  generateEllipse(CENTER, CENTER, OUTER_RADIUS, OUTER_RADIUS * 0.6, 45),
];

export type LoadingIndicatorProps = React.ComponentProps<'div'> & VariantProps<typeof loadingIndicatorVariants>;

const LoadingIndicator = React.forwardRef<HTMLDivElement, LoadingIndicatorProps>(
  ({ className, size = 'md', contained = false, ...props }, ref) => {
    const [shapeIndex, setShapeIndex] = React.useState(0);
    const [rotation, setRotation] = React.useState(0);
    const startTimeRef = React.useRef(0);
    const lastCycleRef = React.useRef(0);

    // Duration for each rotation cycle (ms)
    const cycleDuration = 800;

    useAnimationFrame((time) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;

      // Calculate progress within current cycle (0 to 1)
      const cycleProgress = (elapsed % cycleDuration) / cycleDuration;

      // Ease in-out cubic for smooth rotation
      const eased =
        cycleProgress < 0.5 ? 4 * cycleProgress * cycleProgress * cycleProgress : 1 - (-2 * cycleProgress + 2) ** 3 / 2;

      // Current cycle number
      const currentCycle = Math.floor(elapsed / cycleDuration);

      // Update rotation (360° per cycle with easing)
      setRotation(currentCycle * 360 + eased * 360);

      // Change shape at start of each new cycle
      if (currentCycle !== lastCycleRef.current) {
        lastCycleRef.current = currentCycle;
        setShapeIndex((prev) => (prev + 1) % LOADING_SHAPES.length);
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
            d={LOADING_SHAPES[shapeIndex]}
            initial={false}
            animate={{ d: LOADING_SHAPES[shapeIndex] }}
            transition={{
              duration: 0.35,
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
