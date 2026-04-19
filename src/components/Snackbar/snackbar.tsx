import './snackbar.css';
import { X } from 'lucide-react';
import type * as React from 'react';
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner';

import { cx } from '../../lib/cx';
import { Button } from '../Button/button';
import { IconButton } from '../IconButton/icon-button';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SnackbarProps = React.ComponentProps<'output'> & {
  layout?: 'singleLine' | 'twoLine' | 'longerAction';
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  closable?: boolean;
  onClose?: () => void;
};

// ─── Snackbar Component ──────────────────────────────────────────────────────

const Snackbar = ({
  className,
  layout = 'singleLine',
  message,
  actionLabel,
  onAction,
  closable,
  onClose,
  ref,
  ...props
}: SnackbarProps & { ref?: React.Ref<HTMLOutputElement> }) => {
  const isLongerAction = layout === 'longerAction';

  return (
    <output ref={ref} aria-live="polite" className={cx('md-snackbar', className)} data-layout={layout} {...props}>
      {isLongerAction ? (
        <>
          <span className="md-snackbar__message">{message}</span>
          <div className="md-snackbar__actions">
            {actionLabel && (
              <Button variant="text" size="xs" shape="round" morph onClick={onAction} className="md-snackbar__action">
                {actionLabel}
              </Button>
            )}
            {closable && (
              <IconButton
                variant="standard"
                size="xs"
                shape="round"
                aria-label="Dismiss"
                onClick={onClose}
                className="md-snackbar__close"
              >
                <X aria-hidden="true" />
              </IconButton>
            )}
          </div>
        </>
      ) : (
        <>
          <span className="md-snackbar__message">{message}</span>
          <div className="md-snackbar__actions">
            {actionLabel && (
              <Button variant="text" size="xs" shape="round" morph onClick={onAction} className="md-snackbar__action">
                {actionLabel}
              </Button>
            )}
            {closable && (
              <IconButton
                variant="standard"
                size="xs"
                shape="round"
                aria-label="Dismiss"
                onClick={onClose}
                className="md-snackbar__close"
              >
                <X aria-hidden="true" />
              </IconButton>
            )}
          </div>
        </>
      )}
    </output>
  );
};
Snackbar.displayName = 'Snackbar';

// ─── Snackbar Host (Sonner Toaster) ──────────────────────────────────────────

export type SnackbarHostProps = Omit<React.ComponentProps<typeof SonnerToaster>, 'position'> & {
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
        style: {
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          transitionProperty: 'opacity',
          transitionDuration: '150ms',
          transitionTimingFunction: 'ease-out',
        },
      }}
      {...props}
    />
  );
};
SnackbarHost.displayName = 'SnackbarHost';

// ─── Imperative API ──────────────────────────────────────────────────────────

type SnackbarOptions = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  closable?: boolean;
  duration?: number;
  layout?: 'singleLine' | 'twoLine' | 'longerAction';
};

function snackbar(options: SnackbarOptions | string) {
  const opts = typeof options === 'string' ? { message: options } : options;
  const { message, actionLabel, onAction, closable, duration, layout } = opts;

  sonnerToast.dismiss();

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

snackbar.dismiss = (id?: string | number) => {
  if (id !== undefined) {
    sonnerToast.dismiss(id);
  } else {
    sonnerToast.dismiss();
  }
};

export { Snackbar, SnackbarHost, snackbar };
