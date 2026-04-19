import './dialog.css';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type * as React from 'react';

import { cx } from '../../lib/cx';

// =============================================================================
// Dialog (Root)
// =============================================================================

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

// =============================================================================
// DialogTrigger
// =============================================================================

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

// =============================================================================
// DialogPortal
// =============================================================================

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

// =============================================================================
// DialogClose
// =============================================================================

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// =============================================================================
// DialogOverlay (Backdrop / Scrim)
// =============================================================================

function DialogOverlay({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop data-slot="dialog-overlay" className={cx('md-dialog-overlay', className)} {...props} />
  );
}

// =============================================================================
// DialogContent (Popup)
// =============================================================================

export interface DialogContentProps extends DialogPrimitive.Popup.Props {
  overlayClassName?: string;
  overlayStyle?: React.CSSProperties;
  portalProps?: Omit<DialogPrimitive.Portal.Props, 'children'>;
}

function DialogContent({
  className,
  overlayClassName,
  overlayStyle,
  portalProps,
  children,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal {...portalProps}>
      <DialogOverlay className={overlayClassName} style={overlayStyle} />
      <DialogPrimitive.Popup data-slot="dialog-content" className={cx('md-dialog-content', className)} {...props}>
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

// =============================================================================
// DialogHeader
// =============================================================================

export interface DialogHeaderProps extends React.ComponentProps<'div'> {
  centered?: boolean;
}

function DialogHeader({ className, centered = false, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      data-centered={centered || undefined}
      className={cx('md-dialog-header', className)}
      {...props}
    />
  );
}

// =============================================================================
// DialogIcon
// =============================================================================

function DialogIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-icon" className={cx('md-dialog-icon', className)} {...props} />;
}

// =============================================================================
// DialogTitle
// =============================================================================

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cx('md-dialog-title', className)} {...props} />;
}

// =============================================================================
// DialogDescription
// =============================================================================

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cx('md-dialog-description', className)}
      {...props}
    />
  );
}

// =============================================================================
// DialogBody
// =============================================================================

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-body" className={cx('md-dialog-body', className)} {...props} />;
}

// =============================================================================
// DialogDivider
// =============================================================================

function DialogDivider({ className, ...props }: React.ComponentProps<'hr'>) {
  return <hr data-slot="dialog-divider" className={cx('md-dialog-divider', className)} {...props} />;
}

// =============================================================================
// DialogFooter (Actions)
// =============================================================================

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={cx('md-dialog-footer', className)} {...props} />;
}

// =============================================================================
// FullScreenDialog (Root)
// =============================================================================

function FullScreenDialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="fullscreen-dialog" {...props} />;
}

// =============================================================================
// FullScreenDialogTrigger
// =============================================================================

function FullScreenDialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="fullscreen-dialog-trigger" {...props} />;
}

// =============================================================================
// FullScreenDialogClose
// =============================================================================

function FullScreenDialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="fullscreen-dialog-close" {...props} />;
}

// =============================================================================
// FullScreenDialogContent
// =============================================================================

function FullScreenDialogContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Popup
        data-slot="fullscreen-dialog-content"
        className={cx('md-fullscreen-dialog-content', className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

// =============================================================================
// FullScreenDialogHeader
// =============================================================================

export interface FullScreenDialogHeaderProps extends React.ComponentProps<'div'> {
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

function FullScreenDialogHeader({ className, icon, action, children, ...props }: FullScreenDialogHeaderProps) {
  return (
    <div data-slot="fullscreen-dialog-header" className={cx('md-fullscreen-dialog-header', className)} {...props}>
      {icon && <div className="md-fullscreen-dialog-header__icon">{icon}</div>}
      <DialogPrimitive.Title className="md-fullscreen-dialog-header__title">{children}</DialogPrimitive.Title>
      {action && <div className="md-fullscreen-dialog-header__action">{action}</div>}
    </div>
  );
}

// =============================================================================
// FullScreenDialogBody
// =============================================================================

function FullScreenDialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="fullscreen-dialog-body" className={cx('md-fullscreen-dialog-body', className)} {...props} />;
}

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
