import './avatar.css';

import type * as React from 'react';

import { cx } from '../../lib/cx';

type AvatarRootProps = Omit<React.ComponentProps<'span'>, 'children'>;

export type AvatarImageProps = AvatarRootProps & {
  variant: 'image';
  /** Image URL. */
  src: string;
  /** Required accessible alternative text. Use an empty string for a decorative image. */
  alt: string;
  content?: never;
  children?: never;
};

export type AvatarContentProps = AvatarRootProps & {
  variant: 'monogram' | 'icon';
  /** Monogram text or icon content. */
  content?: React.ReactNode;
  /** Alias for content, convenient for composition. */
  children?: React.ReactNode;
  src?: never;
  alt?: never;
};

export type AvatarProps = AvatarImageProps | AvatarContentProps;

const Avatar = ({ className, variant, ref, ...props }: AvatarProps & { ref?: React.Ref<HTMLSpanElement> }) => {
  if (variant === 'image') {
    const { src, alt, ...rootProps } = props as Omit<AvatarImageProps, 'variant'>;
    return (
      <span ref={ref} className={cx('md-avatar', className)} data-variant="image" {...rootProps}>
        <img className="md-avatar__image" src={src} alt={alt} />
      </span>
    );
  }

  const { content, children, ...rootProps } = props as Omit<AvatarContentProps, 'variant'>;
  return (
    <span ref={ref} className={cx('md-avatar', className)} data-variant={variant} {...rootProps}>
      {content ?? children}
    </span>
  );
};
Avatar.displayName = 'Avatar';

export { Avatar };
