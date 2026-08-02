import './side-sheet.css';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { ArrowLeft, X } from 'lucide-react';
import * as React from 'react';
import { use } from 'react';

import { cx } from '../../lib/cx';
import { IconButton } from '../IconButton/icon-button';

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
  const variant: 'standard' | 'modal' = modal === false ? 'standard' : 'modal';
  const swipeDirection = side === 'right' ? 'right' : 'left';
  const contextValue = React.useMemo(() => ({ variant, side }), [variant, side]);

  return (
    <SideSheetContext.Provider value={contextValue}>
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

export interface SideSheetContentProps extends DrawerPrimitive.Popup.Props {
  /**
   * Forwarded to the underlying portal. Pass `{ container }` to render the sheet
   * inside a specific element instead of `document.body` — useful when the sheet
   * belongs to a bounded surface such as a device frame or an embedded preview.
   */
  portalProps?: Omit<DrawerPrimitive.Portal.Props, 'children'>;
}

function SideSheetContent({ className, children, portalProps, ...props }: SideSheetContentProps) {
  const { variant, side } = use(SideSheetContext);
  const isModal = variant === 'modal';

  return (
    <DrawerPrimitive.Portal {...portalProps}>
      {isModal && <DrawerPrimitive.Backdrop data-slot="side-sheet-backdrop" className="md-side-sheet-backdrop" />}
      <DrawerPrimitive.Viewport
        data-slot="side-sheet-viewport"
        data-variant={variant}
        className="md-side-sheet-viewport"
      >
        <DrawerPrimitive.Popup
          data-slot="side-sheet-content"
          data-variant={variant}
          data-side={side}
          className={cx('md-side-sheet-content', className)}
          {...props}
        >
          {variant === 'standard' && side === 'left' && <div className="md-side-sheet-border" data-side="left" />}
          {variant === 'standard' && side === 'right' && <div className="md-side-sheet-border" data-side="right" />}
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
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
  const { variant } = use(SideSheetContext);
  const hasBack = !!onBack;

  return (
    <div
      data-slot="side-sheet-header"
      data-has-back={hasBack || undefined}
      data-variant={variant}
      className={cx('md-side-sheet-header', className)}
      {...props}
    >
      {onBack && (
        <IconButton variant="standard" size="sm" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </IconButton>
      )}
      <DrawerPrimitive.Title data-slot="side-sheet-title" className="md-side-sheet-title">
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
  return <div data-slot="side-sheet-body" className={cx('md-side-sheet-body', className)} {...props} />;
}

// =============================================================================
// SideSheetDivider
// =============================================================================

function SideSheetDivider({ className, ...props }: React.ComponentProps<'hr'>) {
  return <hr data-slot="side-sheet-divider" className={cx('md-side-sheet-divider', className)} {...props} />;
}

// =============================================================================
// SideSheetFooter (Actions)
// =============================================================================

function SideSheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="side-sheet-footer" className={cx('md-side-sheet-footer', className)} {...props} />;
}

export {
  SideSheet,
  SideSheetBody,
  SideSheetClose,
  SideSheetContent,
  SideSheetDivider,
  SideSheetFooter,
  SideSheetHeader,
  SideSheetTrigger,
};
