import './app-bar.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';

export type AppBarProps = React.ComponentProps<'header'> & {
  variant?: 'search' | 'small' | 'medium' | 'large';
  headline?: string;
  subtitle?: string;
  supportingText?: string;
  searchLabel?: string;
  leadingIcon?: React.ReactNode;
  trailingIcons?: React.ReactNode;
  searchTrailing?: React.ReactNode;
  centerAligned?: boolean;
};

const AppBar = ({
  className,
  variant = 'small',
  headline,
  subtitle,
  supportingText,
  searchLabel,
  leadingIcon,
  trailingIcons,
  searchTrailing,
  centerAligned = false,
  children,
  ref,
  ...props
}: AppBarProps & { ref?: React.Ref<HTMLElement> }) => {
  const label = variant === 'search' ? (searchLabel ?? headline ?? 'Search') : headline;
  const supporting = supportingText ?? subtitle;

  if (variant === 'search') {
    return (
      <header ref={ref} className={cx('md-app-bar', className)} data-variant={variant} {...props}>
        <div className="md-app-bar__search-row">
          {leadingIcon ? (
            <div className="md-app-bar__leading" data-slot="leading">
              {leadingIcon}
            </div>
          ) : null}

          <div className="md-app-bar__search-field" data-center-aligned={centerAligned || undefined}>
            <span className="md-app-bar__search-label">{label}</span>
            {searchTrailing ? <div className="md-app-bar__search-trailing">{searchTrailing}</div> : null}
          </div>

          {trailingIcons ? (
            <div className="md-app-bar__trailing" data-slot="avatar">
              {trailingIcons}
            </div>
          ) : null}
        </div>
        {children}
      </header>
    );
  }

  const labelBlock = (
    <div className="md-app-bar__label-block" data-center-aligned={centerAligned || undefined} data-variant={variant}>
      {label ? <h1 className="md-app-bar__headline">{label}</h1> : null}
      {supporting ? <p className="md-app-bar__supporting-text">{supporting}</p> : null}
    </div>
  );

  if (variant === 'small') {
    return (
      <header ref={ref} className={cx('md-app-bar', className)} data-variant={variant} {...props}>
        <div className="md-app-bar__small-row" data-center-aligned={centerAligned || undefined}>
          <div className="md-app-bar__leading" data-slot="leading" data-empty={!leadingIcon || undefined}>
            {leadingIcon}
          </div>
          {labelBlock}
          <div className="md-app-bar__trailing" data-slot="actions" data-empty={!trailingIcons || undefined}>
            {trailingIcons}
          </div>
        </div>
        {children}
      </header>
    );
  }

  return (
    <header ref={ref} className={cx('md-app-bar', className)} data-variant={variant} {...props}>
      <div className="md-app-bar__top-row">
        <div className="md-app-bar__leading" data-slot="leading" data-empty={!leadingIcon || undefined}>
          {leadingIcon}
        </div>
        <div className="md-app-bar__spacer" />
        <div className="md-app-bar__trailing" data-slot="actions" data-empty={!trailingIcons || undefined}>
          {trailingIcons}
        </div>
      </div>
      <div className="md-app-bar__flex-content" data-variant={variant} data-center-aligned={centerAligned || undefined}>
        {labelBlock}
      </div>
      {children}
    </header>
  );
};
AppBar.displayName = 'AppBar';

export { AppBar };
