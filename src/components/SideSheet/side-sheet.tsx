import './side-sheet.css';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { ArrowLeft, X } from 'lucide-react';
import * as React from 'react';

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

// Base UI's Trigger.Props narrows its own ref to HTMLButtonElement, so take
// that rather than the wider HTMLElement the exotic component advertises.
const SideSheetTrigger = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<DrawerPrimitive.Trigger.Props>>(
  ({ ...props }, ref) => <DrawerPrimitive.Trigger data-slot="side-sheet-trigger" ref={ref} {...props} />,
);
SideSheetTrigger.displayName = 'SideSheetTrigger';

// =============================================================================
// SideSheetClose
// =============================================================================

const SideSheetClose = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Close>,
  React.PropsWithoutRef<DrawerPrimitive.Close.Props>
>(({ ...props }, ref) => <DrawerPrimitive.Close data-slot="side-sheet-close" ref={ref} {...props} />);
SideSheetClose.displayName = 'SideSheetClose';

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

const SideSheetContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Popup>,
  React.PropsWithoutRef<SideSheetContentProps>
>(({ className, children, portalProps, ...props }, ref) => {
  const { variant, side } = React.useContext(SideSheetContext);
  const isModal = variant === 'modal';

  return (
    <DrawerPrimitive.Portal {...portalProps}>
      {isModal && <DrawerPrimitive.Backdrop data-slot="side-sheet-backdrop" className="md-side-sheet-backdrop" />}
      <DrawerPrimitive.Viewport data-slot="side-sheet-viewport" className="md-side-sheet-viewport">
        <DrawerPrimitive.Popup
          data-slot="side-sheet-content"
          ref={ref}
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
});
SideSheetContent.displayName = 'SideSheetContent';

// =============================================================================
// SideSheetHeader
// =============================================================================

export interface SideSheetHeaderProps extends React.ComponentProps<'div'> {
  /** Show a back navigation button. */
  onBack?: () => void;
  /** Show the close (X) button. Defaults to true. */
  showClose?: boolean;
}

const SideSheetHeader = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<SideSheetHeaderProps>>(
  ({ className, children, onBack, showClose = true, ...props }, ref) => {
    const { variant } = React.useContext(SideSheetContext);
    const hasBack = !!onBack;

    return (
      <div
        data-slot="side-sheet-header"
        ref={ref}
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
  },
);
SideSheetHeader.displayName = 'SideSheetHeader';

// =============================================================================
// SideSheetBody
// =============================================================================

const SideSheetBody = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentProps<'div'>>>(
  ({ className, ...props }, ref) => (
    <div data-slot="side-sheet-body" ref={ref} className={cx('md-side-sheet-body', className)} {...props} />
  ),
);
SideSheetBody.displayName = 'SideSheetBody';

// =============================================================================
// SideSheetDivider
// =============================================================================

const SideSheetDivider = React.forwardRef<HTMLHRElement, React.PropsWithoutRef<React.ComponentProps<'hr'>>>(
  ({ className, ...props }, ref) => (
    <hr data-slot="side-sheet-divider" ref={ref} className={cx('md-side-sheet-divider', className)} {...props} />
  ),
);
SideSheetDivider.displayName = 'SideSheetDivider';

// =============================================================================
// SideSheetFooter (Actions)
// =============================================================================

const SideSheetFooter = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentProps<'div'>>>(
  ({ className, ...props }, ref) => (
    <div data-slot="side-sheet-footer" ref={ref} className={cx('md-side-sheet-footer', className)} {...props} />
  ),
);
SideSheetFooter.displayName = 'SideSheetFooter';

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
