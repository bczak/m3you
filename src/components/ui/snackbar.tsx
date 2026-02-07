import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

import { cn } from '../../lib/utils';

// ─── Snackbar Variants ───────────────────────────────────────────────────────

const snackbarVariants = cva(
  // M3: inverse-surface bg, extra-small shape (4px rounded), elevation level 3
  'flex w-full min-w-[288px] max-w-[568px] animate-snackbar-slide-up rounded bg-inverse-surface text-inverse-surface-foreground shadow-lg',
  {
    variants: {
      layout: {
        singleLine: 'min-h-12 items-center',
        twoLine: 'min-h-[68px] items-center',
        longerAction: 'flex-col items-stretch',
      },
    },
    defaultVariants: {
      layout: 'singleLine',
    },
  },
);

// ─── Types ───────────────────────────────────────────────────────────────────

export type SnackbarProps = React.ComponentProps<'output'> &
  VariantProps<typeof snackbarVariants> & {
    /** The supporting text message */
    message: React.ReactNode;
    /** Optional action button label */
    actionLabel?: string;
    /** Callback when action button is clicked */
    onAction?: () => void;
    /** Whether to show the close (dismiss) button */
    closable?: boolean;
    /** Callback when close button is clicked */
    onClose?: () => void;
  };

// ─── Snackbar Component ──────────────────────────────────────────────────────

const Snackbar = React.forwardRef<HTMLOutputElement, SnackbarProps>(
  ({ className, layout = 'singleLine', message, actionLabel, onAction, closable, onClose, ...props }, ref) => {
    const isLongerAction = layout === 'longerAction';

    return (
      <output ref={ref} aria-live="polite" className={cn(snackbarVariants({ layout, className }))} {...props}>
        {isLongerAction ? (
          <>
            {/* M3: supporting text with 16px left padding, 8px right padding */}
            <span className="px-4 pt-[14px] pb-1 text-sm leading-5">{message}</span>
            <div className="flex items-center justify-end px-2 pb-[2px]">
              {actionLabel && (
                <button
                  type="button"
                  onClick={onAction}
                  className="cursor-pointer rounded px-3 py-[10px] font-medium text-inverse-primary text-sm hover:opacity-80"
                >
                  {actionLabel}
                </button>
              )}
              {closable && (
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={onClose}
                  className="cursor-pointer rounded-full p-3 text-inverse-surface-foreground hover:bg-inverse-surface-foreground/12"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* M3: 16px left padding for supporting text */}
            <span className="flex-1 py-[14px] pl-4 text-sm leading-5">{message}</span>
            <div className="flex shrink-0 items-center pr-2">
              {/* M3: action uses inverse-primary color, label-large typography */}
              {actionLabel && (
                <button
                  type="button"
                  onClick={onAction}
                  className="cursor-pointer rounded px-3 py-[10px] font-medium text-inverse-primary text-sm hover:opacity-80"
                >
                  {actionLabel}
                </button>
              )}
              {/* M3: close icon uses inverse-on-surface color, 48px touch target */}
              {closable && (
                <button
                  type="button"
                  aria-label="Dismiss"
                  onClick={onClose}
                  className="cursor-pointer rounded-full p-3 text-inverse-surface-foreground hover:bg-inverse-surface-foreground/12"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          </>
        )}
      </output>
    );
  },
);
Snackbar.displayName = 'Snackbar';

// ─── Snackbar Host (Sonner Toaster) ──────────────────────────────────────────

export type SnackbarHostProps = Omit<React.ComponentProps<typeof SonnerToaster>, 'position'> & {
  /** Position of the snackbar on screen. Defaults to bottom-center per M3 guidelines. */
  position?: React.ComponentProps<typeof SonnerToaster>['position'];
};

const SnackbarHost = ({ position = 'bottom-center', ...props }: SnackbarHostProps) => {
  return (
    <SonnerToaster
      position={position}
      offset={16}
      gap={8}
      visibleToasts={1}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'w-full flex justify-center !transition-opacity !duration-150 !ease-out',
        },
      }}
      {...props}
    />
  );
};
SnackbarHost.displayName = 'SnackbarHost';

// ─── Imperative API ──────────────────────────────────────────────────────────

type SnackbarOptions = {
  /** The supporting text message */
  message: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Callback when action button is clicked */
  onAction?: () => void;
  /** Whether to show the close (dismiss) button */
  closable?: boolean;
  /** Auto-dismiss duration in ms. Defaults to 4000ms. Snackbars with actions don't auto-dismiss per M3 guidelines. */
  duration?: number;
  /** Layout variant */
  layout?: 'singleLine' | 'twoLine' | 'longerAction';
};

/**
 * Show an M3-styled snackbar notification.
 * Requires `<SnackbarHost />` to be mounted in the component tree.
 *
 * @example
 * ```tsx
 * // Simple message
 * snackbar('File saved')
 *
 * // With action
 * snackbar({ message: 'Item deleted', actionLabel: 'Undo', onAction: () => restore() })
 *
 * // With close button
 * snackbar({ message: 'Message sent', closable: true })
 * ```
 */
function snackbar(options: SnackbarOptions | string) {
  const opts = typeof options === 'string' ? { message: options } : options;
  const { message, actionLabel, onAction, closable, duration, layout } = opts;

  // M3: only one snackbar at a time — dismiss any existing ones
  sonnerToast.dismiss();

  // M3: snackbars with actions should not auto-dismiss
  const effectiveDuration = actionLabel || closable ? Number.POSITIVE_INFINITY : (duration ?? 4000);

  return sonnerToast.custom(
    (id) => (
      <Snackbar
        message={message}
        actionLabel={actionLabel}
        onAction={() => {
          onAction?.();
          sonnerToast.dismiss(id);
        }}
        closable={closable}
        onClose={() => sonnerToast.dismiss(id)}
        layout={layout}
      />
    ),
    {
      duration: effectiveDuration,
      unstyled: true,
    },
  );
}

/** Dismiss a snackbar by its ID, or dismiss all if no ID is provided. */
snackbar.dismiss = (id?: string | number) => {
  if (id !== undefined) {
    sonnerToast.dismiss(id);
  } else {
    sonnerToast.dismiss();
  }
};

export { Snackbar, SnackbarHost, snackbar, snackbarVariants };
