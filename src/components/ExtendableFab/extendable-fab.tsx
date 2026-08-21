import './extendable-fab.css';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import type { FABColor, FABSize } from '../Fab/fab';

export type ExtendableFABVariant = 'standard' | 'filled' | 'elevated' | 'tonal' | 'outlined' | 'text';

export type ExtendableFABSize = 'sm' | 'md' | 'lg';

export type ExtendableFABProps = Omit<React.ComponentProps<'button'>, 'children'> & {
  /** Visual emphasis of the container. */
  variant?: ExtendableFABVariant;
  /** Size on the M3 scale. */
  size?: ExtendableFABSize;
  /** Use the lowered elevation. */
  lowered?: boolean;
  /** M3 FAB color role. Overrides the legacy `variant` color mapping. */
  color?: FABColor;
  /** Kit-backed 56/80/96px size. Overrides the legacy `size` scale. */
  fabSize?: FABSize;
  /** Whether the label is showing. Commonly driven by scroll direction. */
  extended?: boolean;
  /** Icon shown in both the collapsed and extended states. */
  icon: React.ReactNode;
  /** Text revealed when extended. Required so the extended width can be measured up front. */
  label: React.ReactNode;
};

type ExtendableFABWidths = {
  label: number;
};

const ExtendableFAB = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<ExtendableFABProps>>(
  (
    {
      className,
      variant = 'tonal',
      size = 'md',
      lowered = false,
      color,
      fabSize,
      extended = false,
      icon,
      label,
      style,
      onTransitionEnd,
      ...props
    },
    ref,
  ) => {
    const resolvedSize = fabSize === 'small' ? 'sm' : fabSize === 'large' ? 'lg' : fabSize === 'medium' ? 'md' : size;
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when content-affecting props change
    React.useLayoutEffect(() => {
      const measure = measureRef.current;

      /* v8 ignore next 4 -- measureRef is always set while mounted */
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
    }, [icon, label, resolvedSize, variant]);

    return (
      <button
        type="button"
        className={cx('md-extendable-fab', className)}
        data-variant={variant}
        data-size={resolvedSize}
        data-fab-size={fabSize}
        data-fab-color={color}
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
  },
);
ExtendableFAB.displayName = 'ExtendableFAB';

export { ExtendableFAB };
