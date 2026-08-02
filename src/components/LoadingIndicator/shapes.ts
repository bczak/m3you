// M3 Expressive Loading Indicator — shape polygons (ported from @m3e/web).
// Source paths: https://github.com/matraic/m3e/blob/main/packages/web/src/loading-indicator/ShapePolygon.ts
// Normalization: https://github.com/matraic/m3e/blob/main/packages/web/src/core/shared/utils/generateClipPaths.ts
//
// Every shape is resampled to exactly POINT_COUNT equidistant points so that
// CSS can smoothly interpolate between them via clip-path: polygon(...). Point
// 0 of every shape is aligned (via best circular shift) to the first shape to
// prevent the animation from "swirling" during morphs.

type Point = { x: number; y: number };

export const SHAPE_NAMES = [
  'soft-burst',
  '7-sided-cookie',
  'pentagon',
  'pill',
  'very-sunny',
  '4-sided-cookie',
  'oval',
] as const;

export type ShapeName = (typeof SHAPE_NAMES)[number];

const POINT_COUNT = 300;

const RAW_PATHS: Record<ShapeName, string> = {
  '4-sided-cookie':
    'M230.389 50.473C293.109 23.2328 356.767 86.8908 329.527 149.611L325.023 159.981C316.707 179.13 316.707 200.87 325.023 220.019L329.527 230.389C356.767 293.109 293.109 356.767 230.389 329.527L220.019 325.023C200.87 316.707 179.13 316.707 159.981 325.023L149.611 329.527C86.8908 356.767 23.2328 293.109 50.473 230.389L54.9768 220.019C63.2934 200.87 63.2934 179.13 54.9768 159.981L50.473 149.611C23.2328 86.8908 86.8908 23.2328 149.611 50.473L159.981 54.9768C179.13 63.2934 200.87 63.2934 220.019 54.9768L230.389 50.473Z',
  '7-sided-cookie':
    'M142.67 51.7842C146.243 48.6394 148.029 47.067 149.671 45.7954C173.425 27.4015 206.575 27.4015 230.329 45.7954C231.971 47.067 233.757 48.6394 237.33 51.7842C238.526 52.8372 239.124 53.3636 239.724 53.8672C248.136 60.9247 258.171 65.7683 268.92 67.9594C269.688 68.1158 270.471 68.2562 272.038 68.537C276.719 69.3756 279.059 69.7949 281.075 70.2889C310.234 77.4346 330.902 103.411 331.364 133.493C331.396 135.573 331.283 137.953 331.057 142.713C330.982 144.307 330.944 145.104 330.925 145.888C330.665 156.88 333.143 167.763 338.136 177.553C338.493 178.252 338.872 178.953 339.63 180.356C341.894 184.547 343.026 186.642 343.897 188.53C356.503 215.834 349.127 248.226 325.949 267.344C324.347 268.666 322.42 270.061 318.566 272.852C317.276 273.787 316.63 274.254 316.007 274.729C307.27 281.377 300.326 290.105 295.803 300.122C295.48 300.837 295.169 301.571 294.547 303.04C292.69 307.427 291.761 309.62 290.832 311.48C277.393 338.382 247.526 352.798 218.162 346.556C216.132 346.124 213.842 345.484 209.262 344.204C207.728 343.776 206.962 343.562 206.203 343.369C195.569 340.668 184.431 340.668 173.797 343.369C173.038 343.562 172.272 343.776 170.738 344.204C166.158 345.484 163.868 346.124 161.838 346.556C132.474 352.798 102.607 338.382 89.168 311.48C88.2388 309.62 87.3102 307.427 85.453 303.04C84.8311 301.571 84.5202 300.837 84.1975 300.122C79.6741 290.105 72.7297 281.377 63.993 274.729C63.3696 274.254 62.7244 273.787 61.434 272.852C57.5801 270.061 55.6532 268.666 54.0507 267.344C30.873 248.226 23.4965 215.834 36.1027 188.53C36.9742 186.642 38.1062 184.547 40.3703 180.356C41.1283 178.953 41.5074 178.252 41.8636 177.553C46.8568 167.763 49.3353 156.88 49.0745 145.888C49.0559 145.104 49.0182 144.307 48.9426 142.713C48.7168 137.953 48.6039 135.573 48.6359 133.493C49.0982 103.411 69.7665 77.4346 98.9252 70.2889C100.941 69.7949 103.281 69.3756 107.962 68.537C109.529 68.2562 110.312 68.1158 111.08 67.9594C121.829 65.7683 131.864 60.9247 140.276 53.8672C140.876 53.3636 141.474 52.8372 142.67 51.7842Z',
  oval: 'M271.309 271.309C201.705 340.913 108.877 360.935 63.9707 316.029C19.0648 271.123 39.0867 178.295 108.691 108.691C178.295 39.0867 271.123 19.0648 316.029 63.9707C360.935 108.877 340.913 201.705 271.309 271.309Z',
  pentagon:
    'M155.064 49.459C176.093 34.1803 204.569 34.1803 225.598 49.459L322.926 120.171C343.955 135.45 352.754 162.532 344.722 187.253L307.546 301.668C299.514 326.39 276.476 343.127 250.483 343.127H130.18C104.186 343.127 81.1489 326.39 73.1164 301.668L35.9407 187.253C27.9082 162.532 36.7077 135.45 57.737 120.171L155.064 49.459Z',
  pill: 'M116.116 71.7851C169.162 18.7383 255.168 18.7383 308.215 71.7851C361.262 124.832 361.262 210.838 308.215 263.884L263.884 308.215C210.838 361.262 124.832 361.262 71.7851 308.215C18.7383 255.168 18.7383 169.162 71.7851 116.116L116.116 71.7851Z',
  'soft-burst':
    'M175.147 33.1508C181.983 22.2831 198.017 22.2831 204.853 33.1508L221.238 59.2009C225.731 66.3458 234.797 69.2506 242.692 66.0751L271.475 54.4972C283.482 49.6671 296.455 58.9613 295.507 71.7154L293.235 102.288C292.612 110.673 298.215 118.278 306.494 120.284L336.681 127.601C349.275 130.653 354.23 145.692 345.861 155.461L325.8 178.877C320.298 185.3 320.298 194.7 325.8 201.123L345.861 224.539C354.23 234.308 349.275 249.347 336.681 252.399L306.494 259.716C298.215 261.722 292.612 269.327 293.235 277.712L295.507 308.285C296.455 321.039 283.482 330.333 271.475 325.503L242.692 313.925C234.797 310.749 225.731 313.654 221.238 320.799L204.853 346.849C198.017 357.717 181.983 357.717 175.147 346.849L158.762 320.799C154.269 313.654 145.203 310.749 137.308 313.925L108.525 325.503C96.5177 330.333 83.5454 321.039 84.4931 308.285L86.7649 277.712C87.388 269.327 81.785 261.722 73.5056 259.716L43.3186 252.399C30.7252 249.347 25.7702 234.308 34.1391 224.539L54.1997 201.123C59.7018 194.7 59.7018 185.3 54.1997 178.877L34.1391 155.461C25.7702 145.692 30.7252 130.653 43.3186 127.601L73.5056 120.284C81.785 118.278 87.388 110.673 86.7649 102.288L84.4931 71.7154C83.5454 58.9613 96.5177 49.6671 108.525 54.4972L137.308 66.0751C145.203 69.2506 154.269 66.3458 158.762 59.201L175.147 33.1508Z',
  'very-sunny':
    'M166.725 43.1869C177.261 25.6044 202.739 25.6044 213.275 43.1868L225.124 62.9597C231.268 73.2136 243.399 78.2385 254.995 75.3327L277.355 69.7294C297.237 64.7468 315.253 82.7627 310.271 102.645L304.667 125.005C301.762 136.601 306.786 148.732 317.04 154.876L336.813 166.725C354.396 177.261 354.396 202.739 336.813 213.275L317.04 225.124C306.786 231.268 301.762 243.399 304.667 254.995L310.271 277.355C315.253 297.237 297.237 315.253 277.355 310.271L254.995 304.667C243.399 301.762 231.268 306.786 225.124 317.04L213.275 336.813C202.739 354.396 177.261 354.396 166.725 336.813L154.876 317.04C148.732 306.786 136.601 301.762 125.005 304.667L102.646 310.271C82.7627 315.253 64.7468 297.237 69.7294 277.355L75.3327 254.995C78.2385 243.399 73.2136 231.268 62.9597 225.124L43.1869 213.275C25.6044 202.739 25.6044 177.261 43.1868 166.725L62.9597 154.876C73.2136 148.732 78.2385 136.601 75.3327 125.005L69.7294 102.646C64.7468 82.7627 82.7627 64.7468 102.645 69.7294L125.005 75.3327C136.601 78.2385 148.732 73.2136 154.876 62.9597L166.725 43.1869Z',
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* v8 ignore next 3 -- quadraticBezier only runs for Q path commands, which none of the 7 built-in shapes use */
const quadraticBezier = (p0: Point, p1: Point, p2: Point, t: number): Point => {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
};

const cubicBezier = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
};

const parsePath = (d: string) => {
  /* v8 ignore next -- every built-in shape path matches the command regex, so the ?? [] fallback is unreachable */
  const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g) ?? [];
  return commands.map((cmd) => ({
    type: cmd[0],
    nums: cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .reduce<number[]>((nums, value) => {
        if (value) nums.push(Number(value));
        return nums;
      }, []),
  }));
};

const samplePath = (d: string, maxPoints: number): Point[] => {
  const commands = parsePath(d);
  let current: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  const segs: { type: string; pts: Point[]; length: number }[] = [];

  for (const seg of commands) {
    if (seg.type === 'M') {
      current = { x: seg.nums[0], y: seg.nums[1] };
      start = current;
    } else if (seg.type === 'L') {
      const next = { x: seg.nums[0], y: seg.nums[1] };
      segs.push({ type: 'L', pts: [current, next], length: Math.hypot(next.x - current.x, next.y - current.y) });
      current = next;
    } else if (seg.type === 'H') {
      const next = { x: seg.nums[0], y: current.y };
      segs.push({ type: 'L', pts: [current, next], length: Math.abs(next.x - current.x) });
      current = next;
      /* v8 ignore start -- no built-in shape path uses V or Q commands */
    } else if (seg.type === 'V') {
      const next = { x: current.x, y: seg.nums[0] };
      segs.push({ type: 'L', pts: [current, next], length: Math.abs(next.y - current.y) });
      current = next;
    } else if (seg.type === 'Q') {
      const p1 = { x: seg.nums[0], y: seg.nums[1] };
      const p2 = { x: seg.nums[2], y: seg.nums[3] };
      let length = 0;
      let prev = current;
      for (let i = 1; i <= 20; i++) {
        const pt = quadraticBezier(current, p1, p2, i / 20);
        length += Math.hypot(pt.x - prev.x, pt.y - prev.y);
        prev = pt;
      }
      segs.push({ type: 'Q', pts: [current, p1, p2], length });
      current = p2;
      /* v8 ignore stop */
    } else if (seg.type === 'C') {
      const p1 = { x: seg.nums[0], y: seg.nums[1] };
      const p2 = { x: seg.nums[2], y: seg.nums[3] };
      const p3 = { x: seg.nums[4], y: seg.nums[5] };
      let length = 0;
      let prev = current;
      for (let i = 1; i <= 20; i++) {
        const pt = cubicBezier(current, p1, p2, p3, i / 20);
        length += Math.hypot(pt.x - prev.x, pt.y - prev.y);
        prev = pt;
      }
      segs.push({ type: 'C', pts: [current, p1, p2, p3], length });
      current = p3;
      /* v8 ignore start -- every built-in path command is M/L/C/Z, so the chain's implicit else is unreachable */
    } else if (seg.type === 'Z') {
      /* v8 ignore stop */
      segs.push({ type: 'L', pts: [current, start], length: Math.hypot(start.x - current.x, start.y - current.y) });
      current = start;
    }
  }

  const totalLength = segs.reduce((s, x) => s + x.length, 0);
  const step = totalLength / (maxPoints - 1);
  const points: Point[] = [];
  let distSoFar = 0;
  let segIndex = 0;

  for (let i = 0; i < maxPoints; i++) {
    const targetDist = i * step;
    while (segIndex < segs.length - 1 && distSoFar + segs[segIndex].length < targetDist) {
      distSoFar += segs[segIndex].length;
      segIndex++;
    }
    const seg = segs[segIndex];
    /* v8 ignore next -- segIndex stays clamped to a valid segment, so seg is always defined */
    if (!seg) break;
    /* v8 ignore next -- no built-in path yields a zero-length sampled segment, so the : 0 fallback is unused */
    const localT = seg.length > 0 ? (targetDist - distSoFar) / seg.length : 0;
    if (seg.type === 'L') {
      const [p0, p1] = seg.pts;
      points.push({ x: lerp(p0.x, p1.x, localT), y: lerp(p0.y, p1.y, localT) });
      /* v8 ignore start -- no built-in shape produces Q segments; the C branch's implicit else is also unreachable */
    } else if (seg.type === 'Q') {
      const [p0, p1, p2] = seg.pts;
      points.push(quadraticBezier(p0, p1, p2, localT));
    } else if (seg.type === 'C') {
      /* v8 ignore stop */
      const [p0, p1, p2, p3] = seg.pts;
      points.push(cubicBezier(p0, p1, p2, p3, localT));
    }
  }
  return points;
};

const signedArea = (pts: Point[]) => {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
};

const rotateArray = <T>(arr: T[], offset: number): T[] => {
  const out = new Array<T>(arr.length);
  for (let i = 0; i < arr.length; i++) out[i] = arr[(i + offset) % arr.length];
  return out;
};

// Find the cyclic offset of `source` that best matches `target` (sum-of-squared
// distances). Prevents intermediate morph frames from "swirling" around.
const bestCircularShift = (target: Point[], source: Point[]): number => {
  const n = Math.min(target.length, source.length);
  let bestK = 0;
  let bestScore = Infinity;
  for (let k = 0; k < n; k++) {
    let score = 0;
    for (let i = 0; i < n; i++) {
      const s = source[(i + k) % n];
      const t = target[i];
      const dx = s.x - t.x;
      const dy = s.y - t.y;
      score += dx * dx + dy * dy;
      if (score >= bestScore) break;
    }
    if (score < bestScore) {
      bestScore = score;
      bestK = k;
    }
  }
  return bestK;
};

const normalizePointSets = (sets: Point[][]): Point[][] => {
  // Every source path shares the kit's 380×380 shape sheet. Mapping that
  // common canvas directly preserves the intentional relative scale between
  // polygons; independently fitting every bounding box makes small shapes
  // incorrectly expand to fill the frame.
  const normalized = sets.map((pts) => pts.map((point) => ({ x: point.x / 380, y: point.y / 380 })));

  const reference = normalized[0];
  const refSign = Math.sign(signedArea(reference));
  for (let i = 1; i < normalized.length; i++) {
    let set = normalized[i];
    const sign = Math.sign(signedArea(set));
    /* v8 ignore next -- all built-in shapes share the reference winding order, so none get reversed */
    if (sign !== 0 && sign !== refSign) set = set.slice().reverse();
    normalized[i] = rotateArray(set, bestCircularShift(reference, set));
  }
  return normalized;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const pointsToPolygon = (pts: Point[]): string =>
  pts.map((p) => `${clamp(p.x * 100, 0, 100).toFixed(2)}% ${clamp(p.y * 100, 0, 100).toFixed(2)}%`).join(', ');

const generate = (): Record<ShapeName, string> => {
  const sampled = SHAPE_NAMES.map((n) => samplePath(RAW_PATHS[n], POINT_COUNT));
  const normalized = normalizePointSets(sampled);
  const result = {} as Record<ShapeName, string>;
  for (let i = 0; i < SHAPE_NAMES.length; i++) {
    result[SHAPE_NAMES[i]] = `polygon(${pointsToPolygon(normalized[i])})`;
  }
  return result;
};

export const SHAPE_POLYGONS: Record<ShapeName, string> = generate();
