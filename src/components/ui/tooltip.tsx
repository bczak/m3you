import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import type * as React from 'react';

import { cn } from '../../lib/utils';

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

const TooltipTrigger = ({
  ref,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Trigger> & { ref?: React.Ref<HTMLButtonElement> }) => {
  return <BaseTooltip.Trigger ref={ref} {...props} />;
};
TooltipTrigger.displayName = 'TooltipTrigger';

// =============================================================================
// TooltipContent
// =============================================================================

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> {
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

const TooltipContent = ({
  side = 'top',
  sideOffset = 4,
  className,
  ref,
  ...props
}: TooltipContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
        <BaseTooltip.Popup
          ref={ref}
          className={cn(
            'max-w-[200px] rounded bg-inverse-surface px-2 py-1 text-inverse-on-surface text-xs',
            className,
          )}
          {...props}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
};
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

const RichTooltipTrigger = ({
  ref,
  ...props
}: React.ComponentProps<typeof BaseTooltip.Trigger> & { ref?: React.Ref<HTMLButtonElement> }) => {
  return <BaseTooltip.Trigger ref={ref} {...props} />;
};
RichTooltipTrigger.displayName = 'RichTooltipTrigger';

// =============================================================================
// RichTooltipContent
// =============================================================================

export interface RichTooltipContentProps extends React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup> {
  headline?: string;
  actions?: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
}

const RichTooltipContent = ({
  headline,
  actions,
  side = 'bottom',
  sideOffset = 4,
  className,
  children,
  ref,
  ...props
}: RichTooltipContentProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} sideOffset={sideOffset}>
        <BaseTooltip.Popup
          ref={ref}
          className={cn('max-w-xs rounded-xl bg-surface-container pt-3 pr-4 pb-2 pl-4 shadow-md', className)}
          {...props}
        >
          {headline && <div className="font-medium text-on-surface-variant text-sm">{headline}</div>}
          <div className={cn('text-on-surface-variant text-sm', headline && 'mt-1')}>{children}</div>
          {actions && <div className="mt-3 flex justify-end gap-2">{actions}</div>}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
};
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
