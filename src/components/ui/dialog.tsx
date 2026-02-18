import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type * as React from 'react';

import { cn } from '../../lib/utils';

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
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-scrim/32 transition-opacity duration-200',
        'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

// =============================================================================
// DialogContent (Popup)
// =============================================================================

function DialogContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 grid w-full min-w-[280px] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-surface-container-high p-6 shadow-xl outline-none transition-all duration-200',
          'data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

// =============================================================================
// DialogHeader
// =============================================================================

export interface DialogHeaderProps extends React.ComponentProps<'div'> {
  /** Center-aligns the header content (use when an icon is present) */
  centered?: boolean;
}

function DialogHeader({ className, centered = false, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-4', centered && 'items-center text-center', className)}
      {...props}
    />
  );
}

// =============================================================================
// DialogIcon
// =============================================================================

function DialogIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-icon" className={cn('text-secondary [&_svg]:size-6', className)} {...props} />;
}

// =============================================================================
// DialogTitle
// =============================================================================

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title data-slot="dialog-title" className={cn('text-2xl text-on-surface', className)} {...props} />
  );
}

// =============================================================================
// DialogDescription
// =============================================================================

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('mt-4 text-on-surface-variant text-sm', className)}
      {...props}
    />
  );
}

// =============================================================================
// DialogBody
// =============================================================================

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-body" className={cn('mt-4 text-on-surface-variant text-sm', className)} {...props} />;
}

// =============================================================================
// DialogDivider
// =============================================================================

function DialogDivider({ className, ...props }: React.ComponentProps<'hr'>) {
  return <hr data-slot="dialog-divider" className={cn('border-outline-variant', className)} {...props} />;
}

// =============================================================================
// DialogFooter (Actions)
// =============================================================================

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
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
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-surface outline-none transition-all duration-300',
          'data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
          className,
        )}
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
  /** Icon element rendered at the start of the header (typically a close/back button) */
  icon?: React.ReactNode;
  /** Action element rendered at the end of the header (typically a save/done button) */
  action?: React.ReactNode;
}

function FullScreenDialogHeader({ className, icon, action, children, ...props }: FullScreenDialogHeaderProps) {
  return (
    <div
      data-slot="fullscreen-dialog-header"
      className={cn('flex h-14 shrink-0 items-center gap-2 px-4', className)}
      {...props}
    >
      {icon && <div className="flex items-center [&_svg]:size-6">{icon}</div>}
      <DialogPrimitive.Title className="flex-1 text-lg text-on-surface">{children}</DialogPrimitive.Title>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}

// =============================================================================
// FullScreenDialogBody
// =============================================================================

function FullScreenDialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="fullscreen-dialog-body" className={cn('flex-1 overflow-y-auto px-6 py-6', className)} {...props} />
  );
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
