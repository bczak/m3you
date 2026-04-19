import './extendable-fab.css';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

export type ExtendableFABVariant = 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';

export type ExtendableFABSize = 'sm' | 'md' | 'lg';

export type ExtendableFABProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  variant?: ExtendableFABVariant;
  size?: ExtendableFABSize;
  lowered?: boolean;
  extended?: boolean;
  icon: React.ReactNode;
  label: React.ReactNode;
};

type ExtendableFABWidths = {
  label: number;
};

const ExtendableFAB = ({
  className,
  variant = 'tonal',
  size = 'md',
  lowered = false,
  extended = false,
  icon,
  label,
  ref,
  style,
  onTransitionEnd,
  ...props
}: ExtendableFABProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const measureRef = React.useRef<HTMLSpanElement | null>(null);
  const [widths, setWidths] = React.useState<ExtendableFABWidths | null>(null);
  const ariaLabel = props['aria-label'] ?? (!extended && typeof label === 'string' ? label : undefined);
  const contentStyle = widths
    ? ({
        width: `${extended ? widths.label : 0}px`,
      } as React.CSSProperties)
    : undefined;
  const resolvedStyle = {
    ...style,
    ['--_extendable-fab-visible-content-width' as string]: `${extended ? (widths?.label ?? 0) : 0}px`,
    ['--_extendable-fab-visible-extra-width' as string]: extended ? 'var(--_extendable-fab-width-adjust)' : '0px',
  } as React.CSSProperties;

  const setButtonRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }
    },
    [ref],
  );

  React.useLayoutEffect(() => {
    const measure = measureRef.current;

    if (!measure) {
      setWidths((current) => (current == null ? current : null));
      return;
    }

    const updateWidths = () => {
      const labelWidth = Math.ceil(measure.getBoundingClientRect().width);

      if (labelWidth <= 0) {
        return;
      }

      setWidths((current) => {
        if (current?.label === labelWidth) {
          return current;
        }

        return { label: labelWidth };
      });
    };

    updateWidths();

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateWidths);

    resizeObserver?.observe(measure);
    window.addEventListener('resize', updateWidths);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateWidths);
    };
  }, [icon, label, size, variant]);

  return (
    <button
      className={cx('md-extendable-fab', className)}
      data-variant={variant}
      data-size={size}
      data-extended={extended || undefined}
      data-lowered={lowered || undefined}
      ref={setButtonRef}
      aria-label={ariaLabel}
      style={resolvedStyle}
      onTransitionEnd={onTransitionEnd}
      {...props}
    >
      <Ripple />
      <span className="md-extendable-fab__icon">{icon}</span>
      <span className="md-extendable-fab__content" aria-hidden={extended ? undefined : 'true'} style={contentStyle}>
        <span className="md-extendable-fab__label">{label}</span>
      </span>
      <span ref={measureRef} className="md-extendable-fab__measure" aria-hidden="true">
        <span className="md-extendable-fab__measure-label">{label}</span>
      </span>
    </button>
  );
};
ExtendableFAB.displayName = 'ExtendableFAB';

export { ExtendableFAB };
