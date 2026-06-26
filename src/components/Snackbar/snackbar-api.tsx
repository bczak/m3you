import { toast as sonnerToast } from 'sonner';

import { Snackbar } from './snackbar';

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

export type { SnackbarOptions };
export { snackbar };
