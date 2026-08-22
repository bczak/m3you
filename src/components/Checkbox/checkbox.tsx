import './checkbox.css';
import { Check, Minus } from 'lucide-react';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';

export type CheckboxProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  /** Checked state (controlled). Pair with `onCheckedChange`. */
  checked?: boolean;
  /** Render the mixed state, for a parent whose children are partly selected. Visual only — you still control `checked`. */
  indeterminate?: boolean;
  /** Colour role. `error` marks a checkbox that has failed validation. */
  variant?: 'primary' | 'error';
  /** Called with the new checked state. */
  onCheckedChange?: (checked: boolean) => void;
  /**
   * Render the checkbox's visuals without the native `<input>` — a plain
   * `<span>` shell carrying the same `md-checkbox*` classes and the same
   * `data-checked` / `data-indeterminate` / `data-disabled` state, with no
   * role, no name and nothing focusable.
   *
   * Use it where the checked state is already owned and announced by an
   * enclosing control — a selectable `List` row, for instance, where a real
   * input would nest one interactive control inside another (axe
   * `nested-interactive`). A decorative checkbox takes only `checked`,
   * `indeterminate`, `variant`, `disabled`, `className`, `id` and `style`;
   * the input-only props are ignored and the forwarded ref stays `null`.
   *
   * @default false
   */
  decorative?: boolean;
};

const Checkbox = React.forwardRef<HTMLInputElement, React.PropsWithoutRef<CheckboxProps>>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      indeterminate = false,
      variant = 'primary',
      disabled,
      decorative = false,
      onCheckedChange,
      onChange,
      ...props
    },
    ref,
  ) => {
    const isControlled = checkedProp !== undefined;
    const [internalChecked, setInternalChecked] = React.useState(defaultChecked);
    const checked = isControlled ? checkedProp : internalChecked;
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Set indeterminate state via ref (not an HTML attribute)
    React.useEffect(() => {
      /* v8 ignore next -- inputRef is always mounted when this effect runs */
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const reportCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    // Determine visual state: indeterminate takes precedence over checked
    const isVisuallyChecked = indeterminate || checked;
    const mark = indeterminate ? (
      <Minus className="md-checkbox__icon" />
    ) : checked ? (
      <Check className="md-checkbox__icon" />
    ) : null;

    if (decorative) {
      const { id, style } = props;
      return (
        <span
          id={id}
          style={style}
          className={cx('md-checkbox', className)}
          data-decorative=""
          data-variant={variant}
          data-checked={String(isVisuallyChecked)}
          data-indeterminate={indeterminate ? '' : undefined}
          data-disabled={disabled || undefined}
        >
          {/* State layer (40px circular) — painted by the enclosing control */}
          <span className="md-checkbox__state-layer" />

          {/* Visual checkbox (18px) */}
          <span
            aria-hidden="true"
            className="md-checkbox__box"
            data-checked={String(isVisuallyChecked)}
            data-variant={variant}
          >
            {mark}
          </span>
        </span>
      );
    }

    return (
      <label
        className={cx('md-checkbox', className)}
        data-variant={variant}
        data-checked={String(isVisuallyChecked)}
        data-disabled={disabled || undefined}
      >
        {/* State layer (40px circular) */}
        <span className="md-checkbox__state-layer">
          <Ripple disabled={disabled} pressedOpacity={0.12} />
        </span>

        {/* Visual checkbox (18px) */}
        <span
          aria-hidden="true"
          className="md-checkbox__box"
          data-checked={String(isVisuallyChecked)}
          data-variant={variant}
        >
          {mark}
        </span>

        {/* Hidden native input for accessibility */}
        <input
          ref={inputRef}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={reportCheckedChange}
          className="md-checkbox__input"
          {...props}
        />
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
