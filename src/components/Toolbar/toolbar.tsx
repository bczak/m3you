import './toolbar.css';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';

export type ToolbarProps = React.ComponentProps<'div'> & {
  /** `floating` hovers above content with a shadow; `docked` sits flush against an edge. */
  type?: 'docked' | 'floating';
  /** `vibrant` uses the tertiary container colour for more emphasis. */
  color?: 'standard' | 'vibrant';
  /** Lay the actions out in a row or a column. */
  layout?: 'horizontal' | 'vertical';
  /** How the actions are distributed along the toolbar. */
  align?: 'start' | 'center' | 'end' | 'between';
  /** Content pinned before the actions. */
  leading?: React.ReactNode;
  /** Content pinned after the actions. */
  trailing?: React.ReactNode;
  /** Space between actions. Accepts any CSS length. */
  gap?: number | string;
  /** Padding on all sides. Accepts any CSS length. */
  padding?: number | string;
  /** Padding on the inline (horizontal) axis. */
  paddingInline?: number | string;
  /** Padding on the block (vertical) axis. */
  paddingBlock?: number | string;
};

const resolveSpace = (value: number | string | undefined) => {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? `${value}px` : value;
};

const Toolbar = forwardRef<HTMLDivElement, React.PropsWithoutRef<ToolbarProps>>(
  (
    {
      className,
      type = 'floating',
      color = 'standard',
      layout = 'horizontal',
      align = 'center',
      leading,
      trailing,
      gap,
      padding,
      paddingInline,
      paddingBlock,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    const hasLeading = leading !== undefined && leading !== null && leading !== false;
    const hasMiddle = children !== undefined && children !== null && children !== false;
    const hasTrailing = trailing !== undefined && trailing !== null && trailing !== false;
    const hasSlots = hasLeading || hasTrailing;

    const resolvedStyle = {
      ...style,
      ...(resolveSpace(gap) !== undefined ? { '--md-toolbar-gap': resolveSpace(gap) } : null),
      ...(resolveSpace(padding) !== undefined
        ? {
            '--md-toolbar-padding-inline': resolveSpace(padding),
            '--md-toolbar-padding-block': resolveSpace(padding),
          }
        : null),
      ...(resolveSpace(paddingInline) !== undefined
        ? { '--md-toolbar-padding-inline': resolveSpace(paddingInline) }
        : null),
      ...(resolveSpace(paddingBlock) !== undefined
        ? { '--md-toolbar-padding-block': resolveSpace(paddingBlock) }
        : null),
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        role="toolbar"
        aria-orientation={layout === 'vertical' ? 'vertical' : 'horizontal'}
        className={cx('md-toolbar', className)}
        data-type={type}
        data-color={color}
        data-layout={layout}
        data-align={align}
        data-has-slots={hasSlots || undefined}
        style={resolvedStyle}
        {...props}
      >
        {hasSlots ? (
          <>
            <div className="md-toolbar__section" data-slot="leading" data-empty={!hasLeading || undefined}>
              {leading}
            </div>
            <div className="md-toolbar__section" data-slot="middle" data-empty={!hasMiddle || undefined}>
              {children}
            </div>
            <div className="md-toolbar__section" data-slot="trailing" data-empty={!hasTrailing || undefined}>
              {trailing}
            </div>
          </>
        ) : (
          children
        )}
      </div>
    );
  },
);
Toolbar.displayName = 'Toolbar';

export { Toolbar };
