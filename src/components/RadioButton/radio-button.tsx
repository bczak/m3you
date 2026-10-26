import './radio-button.css';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { useFormReset } from '../../lib/use-form-reset';

/**
 * Material Design 3 Radio Button Component
 *
 * M3 Specs:
 * - Outer circle: 20dp with 2px border
 * - Inner dot: 10dp when selected
 * - State layer: 40dp circular for hover/ripple
 * - Target size: 48dp touch target
 * - Selected: primary color, Unselected: on-surface-variant (outline)
 *
 * `className` and `style` land on the visible 48dp root (`.md-radio`); every
 * other prop (including `id`, `name`, `value` and the ARIA attributes) goes to
 * the visually hidden native input.
 */

export type RadioButtonProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  /** Colour role. */
  variant?: 'primary' | 'error';
  /** Called with this button's value when it is selected. */
  onValueChange?: (value: string) => void;
  /**
   * Render the radio button's visuals without the native `<input>` — a plain
   * `<span>` shell carrying the same `md-radio*` classes and the same
   * `data-selected` / `data-disabled` state, with no role, no name and
   * nothing focusable.
   *
   * Use it where the selected state is already owned and announced by an
   * enclosing control — a single-select `List` row, for instance, where a real
   * input would nest one interactive control inside another (axe
   * `nested-interactive`). A decorative radio button takes only `checked`,
   * `variant`, `disabled`, `className`, `id` and `style`; the input-only props
   * are ignored and the forwarded ref stays `null`.
   *
   * @default false
   */
  decorative?: boolean;
};

const RadioButton = React.forwardRef<HTMLInputElement, React.PropsWithoutRef<RadioButtonProps>>(
  (
    {
      className,
      style,
      variant = 'primary',
      disabled,
      decorative = false,
      checked: checkedProp,
      defaultChecked = false,
      onValueChange,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isControlled = checkedProp !== undefined;
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const checked = isControlled ? checkedProp : internalChecked;

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // React fires onChange only on the radio that becomes checked, never on the
    // same-name sibling it unchecks, so an uncontrolled radio would keep drawing
    // itself selected after a click or arrow key moved the selection away. Re-read
    // the native state whenever a radio of the same name changes in this tree.
    // Capture phase, so an ancestor that stops the change event's propagation (or
    // a change dispatched without `bubbles`) cannot leave this radio stale; the
    // native checkedness is already settled by the time `change` is dispatched.
    React.useEffect(() => {
      // A decorative radio has no input to keep in step; `decorative` can
      // swap the input in or out, so the listener follows it.
      const input = decorative ? null : inputRef.current;
      if (isControlled || !input) return;
      const root = input.getRootNode();
      const sync = (event: Event) => {
        if ((event.target as HTMLInputElement).name === input.name) {
          setInternalChecked(input.checked);
        }
      };
      root.addEventListener('change', sync, true);
      return () => root.removeEventListener('change', sync, true);
    }, [isControlled, decorative]);

    // A form reset restores `defaultChecked` without a `change` event; redraw from it.
    // The reset also bypasses the `checked` setter React tracks the input through,
    // so React would still hold the pre-reset value and swallow the next change
    // back to it; writing the restored value back through the setter re-arms it.
    useFormReset(inputRef, !isControlled && !decorative, (element) => {
      const input = element as HTMLInputElement;
      const { checked: restored } = input;
      input.checked = restored;
      setInternalChecked(restored);
    });

    const updateRadioChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      /* v8 ignore next -- React only fires radio onChange when checked becomes true */
      if (e.target.checked) {
        onValueChange?.(e.target.value);
      }
      onChange?.(e);
    };

    if (decorative) {
      const { id } = props;
      return (
        <span
          id={id}
          style={style}
          className={cx('md-radio', className)}
          data-decorative=""
          data-variant={variant}
          data-selected={String(checked)}
          data-disabled={disabled || undefined}
        >
          {/* State layer (40dp circular) — painted by the enclosing control */}
          <span className="md-radio__state-layer" />

          {/* Visual radio button (20dp outer circle) */}
          <span
            aria-hidden="true"
            className="md-radio__outer"
            data-outer=""
            data-variant={variant}
            data-selected={String(checked)}
          >
            {/* Inner dot (10dp when selected) */}
            <span className="md-radio__inner" data-inner="" data-variant={variant} data-selected={String(checked)} />
          </span>
        </span>
      );
    }

    return (
      <label
        className={cx('md-radio', className)}
        style={style}
        data-variant={variant}
        data-selected={String(checked)}
        data-disabled={disabled || undefined}
      >
        {/* State layer (40dp circular — hover/focus bg) */}
        <span className="md-radio__state-layer">
          <Ripple disabled={disabled} />
        </span>

        {/* Visual radio button (20dp outer circle) */}
        <span
          aria-hidden="true"
          className="md-radio__outer"
          data-outer=""
          data-variant={variant}
          data-selected={String(checked)}
        >
          {/* Inner dot (10dp when selected) */}
          <span className="md-radio__inner" data-inner="" data-variant={variant} data-selected={String(checked)} />
        </span>

        {/* Hidden native input for accessibility */}
        <input
          ref={inputRef}
          type="radio"
          {...(isControlled ? { checked } : { defaultChecked })}
          disabled={disabled}
          onChange={updateRadioChecked}
          className="md-radio__input"
          {...props}
        />
      </label>
    );
  },
);
RadioButton.displayName = 'RadioButton';

export { RadioButton };
