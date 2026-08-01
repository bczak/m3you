import { SHAPE_POLYGONS } from 'm3you';

/**
 * The brand mark is one of the library's own Expressive shapes, clipped from a
 * gradient of the current seed's primary and tertiary roles — so the logo
 * re-tints along with everything else.
 */
export function Logo({ size = 24, shape = 'soft-burst' }: { size?: number; shape?: keyof typeof SHAPE_POLYGONS }) {
  return (
    <span
      className="m3-logo"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        clipPath: SHAPE_POLYGONS[shape],
      }}
    />
  );
}
