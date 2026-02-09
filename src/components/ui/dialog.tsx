import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import * as React from 'react';

import { cn } from '../../lib/utils';

// =============================================================================
// Dialog (Root)
// =============================================================================

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />;
}

// =============================================================================
// DialogTrigger
// =============================================================================

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogPrimitive.Trigger.Props>((props, ref) => {
  return <DialogPrimitive.Trigger ref={ref} {...props} />;
});
DialogTrigger.displayName = 'DialogTrigger';

// =============================================================================
// DialogPortal
// =============================================================================

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal {...props} />;
}

// =============================================================================
// DialogClose
// =============================================================================

const DialogClose = React.forwardRef<HTMLButtonElement, DialogPrimitive.Close.Props>((props, ref) => {
  return <DialogPrimitive.Close ref={ref} {...props} />;
});
DialogClose.displayName = 'DialogClose';

// =============================================================================
// DialogOverlay (Backdrop / Scrim)
// =============================================================================

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogPrimitive.Backdrop.Props>(
  ({ className, ...props }, ref) => {
    return (
      <DialogPrimitive.Backdrop
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 bg-scrim/32 transition-opacity duration-200',
          'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
          className,
        )}
        {...props}
      />
    );
  },
);
DialogOverlay.displayName = 'DialogOverlay';

// =============================================================================
// DialogContent (Popup)
// =============================================================================

export interface DialogContentProps extends DialogPrimitive.Popup.Props {
  showCloseButton?: boolean;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(({ className, children, ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        ref={ref}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-full min-w-[280px] max-w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-surface-container-high p-6 shadow-xl outline-none transition-all duration-200',
          'data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

// =============================================================================
// DialogHeader
// =============================================================================

export interface DialogHeaderProps extends React.ComponentProps<'div'> {
  /** Center-aligns the header content (use when an icon is present) */
  centered?: boolean;
}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, centered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-4', centered && 'items-center text-center', className)}
        {...props}
      />
    );
  },
);
DialogHeader.displayName = 'DialogHeader';

// =============================================================================
// DialogIcon
// =============================================================================

const DialogIcon = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('text-secondary [&_svg]:size-6', className)} {...props} />;
});
DialogIcon.displayName = 'DialogIcon';

// =============================================================================
// DialogTitle
// =============================================================================

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogPrimitive.Title.Props>(
  ({ className, ...props }, ref) => {
    return <DialogPrimitive.Title ref={ref} className={cn('text-2xl text-surface-foreground', className)} {...props} />;
  },
);
DialogTitle.displayName = 'DialogTitle';

// =============================================================================
// DialogDescription
// =============================================================================

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogPrimitive.Description.Props>(
  ({ className, ...props }, ref) => {
    return (
      <DialogPrimitive.Description
        ref={ref}
        className={cn('mt-4 text-sm text-surface-variant-foreground', className)}
        {...props}
      />
    );
  },
);
DialogDescription.displayName = 'DialogDescription';

// =============================================================================
// DialogBody
// =============================================================================

const DialogBody = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('mt-4 text-sm text-surface-variant-foreground', className)} {...props} />;
});
DialogBody.displayName = 'DialogBody';

// =============================================================================
// DialogDivider
// =============================================================================

const DialogDivider = React.forwardRef<HTMLHRElement, React.ComponentProps<'hr'>>(({ className, ...props }, ref) => {
  return <hr ref={ref} className={cn('border-outline-variant', className)} {...props} />;
});
DialogDivider.displayName = 'DialogDivider';

// =============================================================================
// DialogFooter (Actions)
// =============================================================================

const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn('mt-6 flex justify-end gap-2', className)} {...props} />;
});
DialogFooter.displayName = 'DialogFooter';

// =============================================================================
// FullScreenDialog (Root)
// =============================================================================

function FullScreenDialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root {...props} />;
}

// =============================================================================
// FullScreenDialogTrigger
// =============================================================================

const FullScreenDialogTrigger = React.forwardRef<HTMLButtonElement, DialogPrimitive.Trigger.Props>((props, ref) => {
  return <DialogPrimitive.Trigger ref={ref} {...props} />;
});
FullScreenDialogTrigger.displayName = 'FullScreenDialogTrigger';

// =============================================================================
// FullScreenDialogClose
// =============================================================================

const FullScreenDialogClose = React.forwardRef<HTMLButtonElement, DialogPrimitive.Close.Props>((props, ref) => {
  return <DialogPrimitive.Close ref={ref} {...props} />;
});
FullScreenDialogClose.displayName = 'FullScreenDialogClose';

// =============================================================================
// FullScreenDialogContent
// =============================================================================

const FullScreenDialogContent = React.forwardRef<HTMLDivElement, DialogPrimitive.Popup.Props>(
  ({ className, children, ...props }, ref) => {
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup
          ref={ref}
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
  },
);
FullScreenDialogContent.displayName = 'FullScreenDialogContent';

// =============================================================================
// FullScreenDialogHeader
// =============================================================================

export interface FullScreenDialogHeaderProps extends React.ComponentProps<'div'> {
  /** Icon element rendered at the start of the header (typically a close/back button) */
  icon?: React.ReactNode;
  /** Action element rendered at the end of the header (typically a save/done button) */
  action?: React.ReactNode;
}

const FullScreenDialogHeader = React.forwardRef<HTMLDivElement, FullScreenDialogHeaderProps>(
  ({ className, icon, action, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex h-14 shrink-0 items-center gap-2 px-4', className)} {...props}>
        {icon && <div className="flex items-center [&_svg]:size-6">{icon}</div>}
        <DialogPrimitive.Title className="flex-1 text-lg text-surface-foreground">{children}</DialogPrimitive.Title>
        {action && <div className="flex items-center">{action}</div>}
      </div>
    );
  },
);
FullScreenDialogHeader.displayName = 'FullScreenDialogHeader';

// =============================================================================
// FullScreenDialogBody
// =============================================================================

const FullScreenDialogBody = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('flex-1 overflow-y-auto px-6 py-6', className)} {...props} />;
  },
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
