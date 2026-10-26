import './checkbox.css';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { useFormReset } from '../../lib/use-form-reset';

/* The kit's marks are the 24dp Material Symbols `check_small` (≈12x9.4dp,
   2dp strokes) and `check_indeterminate_small` (a 10x2dp bar), centred on the
   18dp container. Filled glyphs keep that weight exactly at 24px. The
   width/height attributes give the glyph its 24px size before the stylesheet
   applies, as lucide's icons did. */
const CheckMark = () => (
  <svg
    aria-hidden="true"
    className="md-checkbox__icon"
    data-mark="check"
    width="24"
    height="24"
    viewBox="0 -960 960 960"
    fill="currentColor"
  >
    <path d="M400-304 240-464l56-56 104 104 264-264 56 56-320 320Z" />
  </svg>
);

const IndeterminateMark = () => (
  <svg
    aria-hidden="true"
    className="md-checkbox__icon"
    data-mark="indeterminate"
    width="24"
    height="24"
    viewBox="0 -960 960 960"
    fill="currentColor"
  >
    <path d="M280-440v-80h400v80H280Z" />
  </svg>
);

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

    // A form reset restores the input without a `change` event, so the internal
    // state (and the input React keeps in step with it) would hold on to the
    // old value; return both to `defaultChecked`. The input needs it too: the
    // reset restored its `checked` attribute, which React set from the state at
    // mount. A decorative checkbox has no input to reset, and the listener has
    // to come back if it stops being one.
    useFormReset(inputRef, !isControlled && !decorative, (input) => {
      (input as HTMLInputElement).checked = defaultChecked;
      setInternalChecked(defaultChecked);
    });

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
    const mark = indeterminate ? <IndeterminateMark /> : checked ? <CheckMark /> : null;

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
