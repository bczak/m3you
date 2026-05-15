import type * as React from 'react';
import { cx } from '../../src/lib/cx';

export function ShowcasePage({ children, className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section className={cx('sb-m3-page', className)} {...props}>
      {children}
    </section>
  );
}

type ShowcaseHeroProps = React.ComponentProps<'header'> & {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function ShowcaseHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  ...props
}: ShowcaseHeroProps) {
  return (
    <header className={cx('sb-m3-hero', className)} {...props}>
      <div className="sb-m3-demo-stack">
        {eyebrow && <p className="sb-m3-hero__eyebrow">{eyebrow}</p>}
        <h1 className="sb-m3-hero__title">{title}</h1>
        <p className="sb-m3-hero__description">{description}</p>
        {actions ? <div className="sb-m3-hero__actions">{actions}</div> : null}
      </div>
      {children}
    </header>
  );
}

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

export function ShowcasePhoneFrame({ children, className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cx('sb-m3-phone', className)} {...props}>
      <div className="sb-m3-phone__body">{children}</div>
    </div>
  );
}

type ToneSwatchProps = {
  label: string;
  token: string;
  background: string;
  foreground?: string;
};

export function ToneSwatch({
  label,
  token,
  background,
  foreground = 'var(--md-sys-color-on-surface)',
}: ToneSwatchProps) {
  return (
    <div className="sb-m3-swatch">
      <div className="sb-m3-swatch__tone" style={{ background, color: foreground }}>
        <p className="sb-m3-swatch__label">{label}</p>
      </div>
      <p className="sb-m3-swatch__token">{token}</p>
    </div>
  );
}
