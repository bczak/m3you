import { DrawerPreview as DrawerPrimitive } from '@base-ui/react/drawer';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowLeft, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/utils';
import { IconButton } from './icon-button';

// =============================================================================
// Side Sheet Variants
// =============================================================================

const sideSheetContentVariants = cva('fixed top-0 z-50 flex h-full max-w-[400px] flex-col outline-none', {
  variants: {
    variant: {
      standard: 'bg-surface',
      modal: 'bg-surface-container-low',
    },
    side: {
      right: 'right-0',
      left: 'left-0',
    },
  },
  defaultVariants: {
    variant: 'modal',
    side: 'right',
  },
});

// =============================================================================
// SideSheet (Root)
// =============================================================================

export interface SideSheetProps extends Omit<DrawerPrimitive.Root.Props, 'swipeDirection'> {
  /** Whether the side sheet is modal (with scrim) or standard (no scrim).
   * @default true
   */
  modal?: boolean | 'trap-focus';
  /** Which side the sheet appears from.
   * @default 'right'
   */
  side?: 'left' | 'right';
}

const SideSheetContext = React.createContext<{ variant: 'standard' | 'modal'; side: 'left' | 'right' }>({
  variant: 'modal',
  side: 'right',
});

function SideSheet({ modal = true, side = 'right', children, ...props }: SideSheetProps) {
  const variant = modal === false ? 'standard' : 'modal';
  const swipeDirection = side === 'right' ? 'right' : 'left';

  return (
    <SideSheetContext.Provider value={{ variant, side }}>
      <DrawerPrimitive.Root data-slot="side-sheet" modal={modal} swipeDirection={swipeDirection} {...props}>
        {children}
      </DrawerPrimitive.Root>
    </SideSheetContext.Provider>
  );
}

// =============================================================================
// SideSheetTrigger
// =============================================================================

function SideSheetTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="side-sheet-trigger" {...props} />;
}

// =============================================================================
// SideSheetClose
// =============================================================================

function SideSheetClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="side-sheet-close" {...props} />;
}

// =============================================================================
// SideSheetContent (Portal + optional Backdrop + Popup)
// =============================================================================

export interface SideSheetContentProps
  extends DrawerPrimitive.Popup.Props,
    Omit<VariantProps<typeof sideSheetContentVariants>, 'variant' | 'side'> {}

function SideSheetContent({ className, children, ...props }: SideSheetContentProps) {
  const { variant, side } = React.useContext(SideSheetContext);
  const isModal = variant === 'modal';

  return (
    <DrawerPrimitive.Portal>
      {isModal && (
        <DrawerPrimitive.Backdrop
          data-slot="side-sheet-backdrop"
          className={cn(
            'fixed inset-0 z-50 bg-scrim/32 transition-opacity duration-200',
            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
          )}
        />
      )}
      <DrawerPrimitive.Popup
        data-slot="side-sheet-content"
        className={cn(sideSheetContentVariants({ variant, side }), className)}
        {...props}
      >
        {variant === 'standard' && side === 'left' && (
          <div className="absolute top-0 right-0 bottom-0 border-outline-variant border-r" />
        )}
        {variant === 'standard' && side === 'right' && (
          <div className="absolute top-0 bottom-0 left-0 border-outline-variant border-l" />
        )}
        {children}
      </DrawerPrimitive.Popup>
    </DrawerPrimitive.Portal>
  );
}

// =============================================================================
// SideSheetHeader
// =============================================================================

export interface SideSheetHeaderProps extends React.ComponentProps<'div'> {
  /** Show a back navigation button. */
  onBack?: () => void;
  /** Show the close (X) button. Defaults to true. */
  showClose?: boolean;
}

function SideSheetHeader({ className, children, onBack, showClose = true, ...props }: SideSheetHeaderProps) {
  const { variant } = React.useContext(SideSheetContext);
  const hasBack = !!onBack;

  return (
    <div
      data-slot="side-sheet-header"
      className={cn('flex items-center gap-3 px-6 pt-6 pb-3', hasBack && variant === 'modal' && 'pl-4', className)}
      {...props}
    >
      {onBack && (
        <IconButton variant="standard" size="sm" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </IconButton>
      )}
      <DrawerPrimitive.Title data-slot="side-sheet-title" className="flex-1 text-2xl text-surface-foreground">
        {children}
      </DrawerPrimitive.Title>
      {showClose && (
        <DrawerPrimitive.Close
          data-slot="side-sheet-close"
          render={<IconButton variant="standard" size="sm" aria-label="Close" />}
        >
          <X />
        </DrawerPrimitive.Close>
      )}
    </div>
  );
}

// =============================================================================
// SideSheetBody
// =============================================================================

function SideSheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="side-sheet-body" className={cn('flex-1 overflow-y-auto px-6 py-3', className)} {...props} />;
}

// =============================================================================
// SideSheetDivider
// =============================================================================

function SideSheetDivider({ className, ...props }: React.ComponentProps<'hr'>) {
  return <hr data-slot="side-sheet-divider" className={cn('border-outline-variant', className)} {...props} />;
}

// =============================================================================
// SideSheetFooter (Actions)
// =============================================================================

function SideSheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="side-sheet-footer" className={cn('flex items-center gap-2 px-6 pt-4 pb-6', className)} {...props} />
  );
}

export {
  SideSheet,
  SideSheetBody,
  SideSheetClose,
  SideSheetContent,
  sideSheetContentVariants,
  SideSheetDivider,
  SideSheetFooter,
  SideSheetHeader,
  SideSheetTrigger,
};
