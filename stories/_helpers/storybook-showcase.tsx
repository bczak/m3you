import './storybook-showcase.css';

import type * as React from 'react';
import { cx } from '../../src/lib/cx';

type ShowcaseGridProps = React.ComponentProps<'div'> & {
  dense?: boolean;
};

export function ShowcaseGrid({ children, className, dense = false, ...props }: ShowcaseGridProps) {
  return (
    <div className={cx('sb-m3-grid', className)} data-dense={dense || undefined} {...props}>
      {children}
    </div>
  );
}

type ShowcasePanelProps = React.ComponentProps<'section'> & {
  eyebrow?: string;
  title?: string;
  description?: string;
  href?: string;
  tone?: 'surface' | 'tint' | 'inverse';
};

export function ShowcasePanel({
  eyebrow,
  title,
  description,
  href,
  tone = 'surface',
  children,
  className,
  ...props
}: ShowcasePanelProps) {
  const body = (
    <>
      {eyebrow ? <p className="sb-m3-panel__eyebrow">{eyebrow}</p> : null}
      {title ? <h2 className="sb-m3-panel__title">{title}</h2> : null}
      {description ? <p className="sb-m3-panel__description">{description}</p> : null}
      {children ? <div className="sb-m3-panel__body">{children}</div> : null}
    </>
  );

  if (href) {
    return (
      <a
        {...(props as React.ComponentProps<'a'>)}
        className={cx('sb-m3-panel', 'sb-m3-panel--link', className)}
        data-tone={tone}
        href={href}
      >
        {body}
      </a>
    );
  }

  return (
    <section className={cx('sb-m3-panel', className)} data-tone={tone} {...props}>
      {body}
    </section>
  );
}
