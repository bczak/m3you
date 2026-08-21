import './dialog.css';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type * as React from 'react';
import { forwardRef } from 'react';

import { cx } from '../../lib/cx';

// The Root components render no DOM node of their own, so they take no ref.

// =============================================================================
// Dialog (Root)
// =============================================================================

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

// =============================================================================
// DialogTrigger
// =============================================================================

// Base UI's Trigger.Props narrows its own ref to HTMLButtonElement, so take
// that rather than the wider HTMLElement the exotic component advertises.
const DialogTrigger = forwardRef<HTMLButtonElement, React.PropsWithoutRef<DialogPrimitive.Trigger.Props>>(
  ({ ...props }, ref) => <DialogPrimitive.Trigger data-slot="dialog-trigger" ref={ref} {...props} />,
);
DialogTrigger.displayName = 'DialogTrigger';

// =============================================================================
// DialogPortal
// =============================================================================

const DialogPortal = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Portal>,
  React.PropsWithoutRef<DialogPrimitive.Portal.Props>
>(({ ...props }, ref) => <DialogPrimitive.Portal data-slot="dialog-portal" ref={ref} {...props} />);
DialogPortal.displayName = 'DialogPortal';

// =============================================================================
// DialogClose
// =============================================================================

const DialogClose = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Close>,
  React.PropsWithoutRef<DialogPrimitive.Close.Props>
>(({ ...props }, ref) => <DialogPrimitive.Close data-slot="dialog-close" ref={ref} {...props} />);
DialogClose.displayName = 'DialogClose';

// =============================================================================
// DialogOverlay (Backdrop / Scrim)
// =============================================================================

const DialogOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Backdrop>,
  React.PropsWithoutRef<DialogPrimitive.Backdrop.Props>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Backdrop
    data-slot="dialog-overlay"
    ref={ref}
    className={cx('md-dialog-overlay', className)}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

// =============================================================================
// DialogContent (Popup)
// =============================================================================

export interface DialogContentProps extends DialogPrimitive.Popup.Props {
  /** Additional class names for the scrim. */
  overlayClassName?: string;
  /** Inline styles for the scrim. */
  overlayStyle?: React.CSSProperties;
  portalProps?: Omit<DialogPrimitive.Portal.Props, 'children'>;
}

const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Popup>,
  React.PropsWithoutRef<DialogContentProps>
>(({ className, overlayClassName, overlayStyle, portalProps, children, ...props }, ref) => (
  <DialogPortal {...portalProps}>
    <DialogOverlay className={overlayClassName} style={overlayStyle} />
    <DialogPrimitive.Popup
      data-slot="dialog-content"
      ref={ref}
      className={cx('md-dialog-content', className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Popup>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

// =============================================================================
// DialogHeader
// =============================================================================

export interface DialogHeaderProps extends React.ComponentProps<'div'> {
  /** Centre the icon and title, the M3 layout for a dialog with a hero icon. */
  centered?: boolean;
}

const DialogHeader = forwardRef<HTMLDivElement, React.PropsWithoutRef<DialogHeaderProps>>(
  ({ className, centered = false, ...props }, ref) => (
    <div
      data-slot="dialog-header"
      ref={ref}
      data-centered={centered || undefined}
      className={cx('md-dialog-header', className)}
      {...props}
    />
  ),
);
DialogHeader.displayName = 'DialogHeader';

// =============================================================================
// DialogIcon
// =============================================================================

const DialogIcon = forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentProps<'div'>>>(
  ({ className, ...props }, ref) => (
    <div data-slot="dialog-icon" ref={ref} className={cx('md-dialog-icon', className)} {...props} />
  ),
);
DialogIcon.displayName = 'DialogIcon';

// =============================================================================
// DialogTitle
// =============================================================================

const DialogTitle = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.PropsWithoutRef<DialogPrimitive.Title.Props>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title data-slot="dialog-title" ref={ref} className={cx('md-dialog-title', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

// =============================================================================
// DialogDescription
// =============================================================================

const DialogDescription = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.PropsWithoutRef<DialogPrimitive.Description.Props>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    ref={ref}
    className={cx('md-dialog-description', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

// =============================================================================
// DialogBody
// =============================================================================

const DialogBody = forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentProps<'div'>>>(
  ({ className, ...props }, ref) => (
    <div data-slot="dialog-body" ref={ref} className={cx('md-dialog-body', className)} {...props} />
  ),
);
DialogBody.displayName = 'DialogBody';

// =============================================================================
// DialogDivider
// =============================================================================

const DialogDivider = forwardRef<HTMLHRElement, React.PropsWithoutRef<React.ComponentProps<'hr'>>>(
  ({ className, ...props }, ref) => (
    <hr data-slot="dialog-divider" ref={ref} className={cx('md-dialog-divider', className)} {...props} />
  ),
);
DialogDivider.displayName = 'DialogDivider';

// =============================================================================
// DialogFooter (Actions)
// =============================================================================

const DialogFooter = forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentProps<'div'>>>(
  ({ className, ...props }, ref) => (
    <div data-slot="dialog-footer" ref={ref} className={cx('md-dialog-footer', className)} {...props} />
  ),
);
DialogFooter.displayName = 'DialogFooter';

// =============================================================================
// FullScreenDialog (Root)
// =============================================================================

function FullScreenDialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="fullscreen-dialog" {...props} />;
}

// =============================================================================
// FullScreenDialogTrigger
// =============================================================================

const FullScreenDialogTrigger = forwardRef<HTMLButtonElement, React.PropsWithoutRef<DialogPrimitive.Trigger.Props>>(
  ({ ...props }, ref) => <DialogPrimitive.Trigger data-slot="fullscreen-dialog-trigger" ref={ref} {...props} />,
);
FullScreenDialogTrigger.displayName = 'FullScreenDialogTrigger';

// =============================================================================
// FullScreenDialogClose
// =============================================================================

const FullScreenDialogClose = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Close>,
  React.PropsWithoutRef<DialogPrimitive.Close.Props>
>(({ ...props }, ref) => <DialogPrimitive.Close data-slot="fullscreen-dialog-close" ref={ref} {...props} />);
FullScreenDialogClose.displayName = 'FullScreenDialogClose';

// =============================================================================
// FullScreenDialogContent
// =============================================================================

const FullScreenDialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Popup>,
  React.PropsWithoutRef<DialogPrimitive.Popup.Props>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Popup
      data-slot="fullscreen-dialog-content"
      ref={ref}
      className={cx('md-fullscreen-dialog-content', className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Popup>
  </DialogPrimitive.Portal>
));
FullScreenDialogContent.displayName = 'FullScreenDialogContent';

// =============================================================================
// FullScreenDialogHeader
// =============================================================================

export interface FullScreenDialogHeaderProps extends React.ComponentProps<'div'> {
  /** Leading icon, typically a close affordance. */
  icon?: React.ReactNode;
  /** Trailing confirming action. */
  action?: React.ReactNode;
}

const FullScreenDialogHeader = forwardRef<HTMLDivElement, React.PropsWithoutRef<FullScreenDialogHeaderProps>>(
  ({ className, icon, action, children, ...props }, ref) => (
    <div
      data-slot="fullscreen-dialog-header"
      ref={ref}
      className={cx('md-fullscreen-dialog-header', className)}
      {...props}
    >
      {icon && <div className="md-fullscreen-dialog-header__icon">{icon}</div>}
      <DialogPrimitive.Title className="md-fullscreen-dialog-header__title">{children}</DialogPrimitive.Title>
      {action && <div className="md-fullscreen-dialog-header__action">{action}</div>}
    </div>
  ),
);
FullScreenDialogHeader.displayName = 'FullScreenDialogHeader';

// =============================================================================
// FullScreenDialogBody
// =============================================================================

const FullScreenDialogBody = forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentProps<'div'>>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="fullscreen-dialog-body"
      ref={ref}
      className={cx('md-fullscreen-dialog-body', className)}
      {...props}
    />
  ),
);
FullScreenDialogBody.displayName = 'FullScreenDialogBody';

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  FullScreenDialog,
  FullScreenDialogBody,
  FullScreenDialogClose,
  FullScreenDialogContent,
  FullScreenDialogHeader,
  FullScreenDialogTrigger,
};
