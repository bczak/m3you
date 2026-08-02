import './snackbar.css';
import { X } from 'lucide-react';
import * as React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

import { cx } from '../../lib/cx';
import { Button } from '../Button/button';
import { IconButton } from '../IconButton/icon-button';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SnackbarProps = React.ComponentProps<'output'> & {
  /** How much room the message and action get. */
  layout?: 'singleLine' | 'twoLine' | 'longerAction';
  /** The message. Keep it to one clause — snackbars are not for explanations. */
  message: React.ReactNode;
  /** Label for the single optional action, such as “Undo”. */
  actionLabel?: string;
  /** Called when the action is pressed. */
  onAction?: () => void;
  /** Show a dismiss button. A snackbar with an action or a close button stays until dismissed. */
  closable?: boolean;
  /** Called when the snackbar is dismissed. */
  onClose?: () => void;
};

// ─── Snackbar Component ──────────────────────────────────────────────────────

const Snackbar = React.forwardRef<HTMLOutputElement, React.PropsWithoutRef<SnackbarProps>>(
  ({ className, layout = 'singleLine', message, actionLabel, onAction, closable, onClose, ...props }, ref) => {
    const hasActions = Boolean(actionLabel || closable);

    return (
      <output ref={ref} aria-live="polite" className={cx('md-snackbar', className)} data-layout={layout} {...props}>
        <span className="md-snackbar__message">{message}</span>
        {hasActions ? (
          <div className="md-snackbar__actions">
            {actionLabel ? (
              <Button variant="text" size="sm" shape="round" morph onClick={onAction} className="md-snackbar__action">
                {actionLabel}
              </Button>
            ) : null}
            {closable ? (
              <IconButton
                variant="standard"
                size="sm"
                shape="round"
                aria-label="Dismiss"
                onClick={onClose}
                className="md-snackbar__close"
              >
                <X aria-hidden="true" />
              </IconButton>
            ) : null}
          </div>
        ) : null}
      </output>
    );
  },
);
Snackbar.displayName = 'Snackbar';

// ─── Snackbar Host (Sonner Toaster) ──────────────────────────────────────────

export type SnackbarHostProps = Omit<React.ComponentProps<typeof SonnerToaster>, 'position'> & {
  /** Where queued snackbars appear on screen. */
  position?: React.ComponentProps<typeof SonnerToaster>['position'];
};

const SnackbarHost = React.forwardRef<
  React.ComponentRef<typeof SonnerToaster>,
  React.PropsWithoutRef<SnackbarHostProps>
>(({ position = 'bottom-center', ...props }, ref) => {
  return (
    <SonnerToaster
      ref={ref}
      position={position}
      offset={16}
      gap={8}
      visibleToasts={1}
      toastOptions={{
        unstyled: true,
        style: {
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transitionProperty: 'opacity',
          transitionDuration: 'var(--md-sys-motion-duration-short2)',
          transitionTimingFunction: 'var(--md-sys-motion-easing-standard-decelerate)',
        },
      }}
      {...props}
    />
  );
});
SnackbarHost.displayName = 'SnackbarHost';

export { Snackbar, SnackbarHost };
