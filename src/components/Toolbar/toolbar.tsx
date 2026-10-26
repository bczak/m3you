import './toolbar.css';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';

export type ToolbarProps = React.ComponentProps<'div'> & {
  /** `floating` hovers above content with a shadow; `docked` sits flush against an edge. */
  type?: 'docked' | 'floating';
  /** `vibrant` uses the primary container colour for more emphasis. */
  color?: 'standard' | 'vibrant';
  /** Lay the actions out in a row or a column. */
  layout?: 'horizontal' | 'vertical';
  /** How the actions are distributed along the toolbar. */
  align?: 'start' | 'center' | 'end' | 'between';
  /** Content pinned before the actions. */
  leading?: React.ReactNode;
  /** Content pinned after the actions. */
  trailing?: React.ReactNode;
  /**
   * Space between actions. Accepts any CSS length. Defaults to 32px docked and 4px floating. A floating toolbar
   * treats this as the gap between 48dp slots: its 40dp icon buttons add a 4px inset on each side, so 12px shows
   * between two icons, 8px between an icon and a text button, and 4px between two text buttons.
   */
  gap?: number | string;
  /**
   * Padding on all sides. Accepts any CSS length. Docked defaults to 16px inline and 0 block. Floating defaults to
   * 8px along the actions and 12px across them, so an icon button sits 12px from the ends and a text button 8px.
   */
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
