import './avatar.css';

import * as React from 'react';

import { generateCustomColor } from '../../lib/color';
import { cx } from '../../lib/cx';

type AvatarRootProps = Omit<React.ComponentProps<'span'>, 'children' | 'color'>;

type AvatarColorProps = {
  /**
   * A colour of the thing the avatar stands for — a category, a calendar, a
   * label — as a hex string. The circle takes M3's custom-colour container for
   * it and the content takes the matching on-container, so the avatar carries
   * that identity while staying legible in both light and dark mode. Omit it to
   * keep the primary-container default. Anything that is not a hex is ignored.
   */
  sourceColor?: string;
};

export type AvatarImageProps = AvatarRootProps &
  AvatarColorProps & {
    variant: 'image';
    /** Image URL. */
    src: string;
    /** Required accessible alternative text. Use an empty string for a decorative image. */
    alt: string;
    content?: never;
    children?: never;
  };

export type AvatarContentProps = AvatarRootProps &
  AvatarColorProps & {
    variant: 'monogram' | 'icon';
    /** Monogram text or icon content. */
    content?: React.ReactNode;
    /** Alias for content, convenient for composition. */
    children?: React.ReactNode;
    src?: never;
    alt?: never;
  };

export type AvatarProps = AvatarImageProps | AvatarContentProps;

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * The custom-colour pair as component tokens. `light-dark()` rather than a
 * media query because the pair is an inline style: the library's own themes are
 * already switchable both ways and `globals.css` sets `color-scheme` for each.
 */
function customColorStyle(sourceColor: string | undefined): React.CSSProperties | undefined {
  if (sourceColor === undefined || !HEX.test(sourceColor)) return undefined;
  const { light, dark } = generateCustomColor(sourceColor);

  return {
    '--md-avatar-container-color': `light-dark(${light.container}, ${dark.container})`,
    '--md-avatar-label-color': `light-dark(${light.onContainer}, ${dark.onContainer})`,
  } as React.CSSProperties;
}

const Avatar = React.forwardRef<HTMLSpanElement, React.PropsWithoutRef<AvatarProps>>(
  ({ className, variant, sourceColor, style, ...props }, ref) => {
    const colorStyle = customColorStyle(sourceColor);
    const rootStyle = colorStyle ? { ...style, ...colorStyle } : style;

    if (variant === 'image') {
      const { src, alt, ...rootProps } = props as Omit<AvatarImageProps, 'variant' | 'sourceColor' | 'style'>;
      return (
        <span ref={ref} className={cx('md-avatar', className)} data-variant="image" style={rootStyle} {...rootProps}>
          <img className="md-avatar__image" src={src} alt={alt} />
        </span>
      );
    }

    const { content, children, ...rootProps } = props as Omit<AvatarContentProps, 'variant' | 'sourceColor' | 'style'>;
    return (
      <span ref={ref} className={cx('md-avatar', className)} data-variant={variant} style={rootStyle} {...rootProps}>
        {content ?? children}
      </span>
    );
  },
);
Avatar.displayName = 'Avatar';

export { Avatar };
