import './tooltip.css';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';

// =============================================================================
// TooltipProvider
// =============================================================================

function TooltipProvider({ children, ...props }: React.ComponentProps<typeof BaseTooltip.Provider>) {
  return (
    <BaseTooltip.Provider delay={500} closeDelay={0} {...props}>
      {children}
    </BaseTooltip.Provider>
  );
}

// =============================================================================
// Tooltip (Root)
// =============================================================================

function Tooltip(props: React.ComponentProps<typeof BaseTooltip.Root>) {
  return <BaseTooltip.Root {...props} />;
}

// =============================================================================
// TooltipTrigger
// =============================================================================

const TooltipTrigger = forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<React.ComponentProps<typeof BaseTooltip.Trigger>>
>(({ ...props }, ref) => {
  return <BaseTooltip.Trigger ref={ref} {...props} />;
});
TooltipTrigger.displayName = 'TooltipTrigger';

// =============================================================================
// TooltipContent
// =============================================================================

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> {
  /** Which side of the trigger the tooltip prefers. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Distance in pixels between the trigger and the tooltip. */
  sideOffset?: number;
  /**
   * Forwarded to the underlying portal. Pass `{ container }` to render into a
   * specific element instead of `document.body` — useful inside a bounded
   * surface such as a device frame or an embedded preview.
   */
  portalProps?: Omit<BaseTooltip.Portal.Props, 'children'>;
}

const TooltipContent = forwardRef<HTMLDivElement, React.PropsWithoutRef<TooltipContentProps>>(
  ({ side = 'top', sideOffset = 4, className, portalProps, ...props }, ref) => {
    return (
      <BaseTooltip.Portal {...portalProps}>
        <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
          <BaseTooltip.Popup ref={ref} className={cx('md-tooltip', className)} {...props} />
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    );
  },
);
TooltipContent.displayName = 'TooltipContent';

// =============================================================================
// Rich Tooltip
// =============================================================================

function RichTooltip(props: React.ComponentProps<typeof BaseTooltip.Root>) {
  return <BaseTooltip.Root {...props} />;
}

// =============================================================================
// RichTooltipTrigger
// =============================================================================

const RichTooltipTrigger = forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<React.ComponentProps<typeof BaseTooltip.Trigger>>
>(({ ...props }, ref) => {
  return <BaseTooltip.Trigger ref={ref} {...props} />;
});
RichTooltipTrigger.displayName = 'RichTooltipTrigger';

// =============================================================================
// RichTooltipContent
// =============================================================================

export interface RichTooltipContentProps extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> {
  /** Bold first line. */
  headline?: string;
  /** Up to one action, rendered under the body. */
  actions?: React.ReactNode;
  /** Which side of the trigger the tooltip prefers. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Distance in pixels between the trigger and the tooltip. */
  sideOffset?: number;
  /**
   * Forwarded to the underlying portal. Pass `{ container }` to render into a
   * specific element instead of `document.body` — useful inside a bounded
   * surface such as a device frame or an embedded preview.
   */
  portalProps?: Omit<BaseTooltip.Portal.Props, 'children'>;
}

const RichTooltipContent = forwardRef<HTMLDivElement, React.PropsWithoutRef<RichTooltipContentProps>>(
  ({ headline, actions, side = 'bottom', sideOffset = 4, className, children, portalProps, ...props }, ref) => {
    return (
      <BaseTooltip.Portal {...portalProps}>
        <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
          <BaseTooltip.Popup ref={ref} className={cx('md-rich-tooltip', className)} {...props}>
            {headline && <div className="md-rich-tooltip__headline">{headline}</div>}
            <div className="md-rich-tooltip__body" data-has-headline={headline ? '' : undefined}>
              {children}
            </div>
            {actions && <div className="md-rich-tooltip__actions">{actions}</div>}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    );
  },
);
RichTooltipContent.displayName = 'RichTooltipContent';

export {
  RichTooltip,
  RichTooltipContent,
  RichTooltipTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
};
