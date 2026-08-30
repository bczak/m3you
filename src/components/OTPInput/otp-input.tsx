import './otp-input.css';
import { OTPInput as OTPInputPrimitive, REGEXP_ONLY_DIGITS, type SlotProps } from 'input-otp';
import * as React from 'react';

import { cx } from '../../lib/cx';

export type OTPInputProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'children' | 'className' | 'defaultValue' | 'maxLength' | 'onChange' | 'pattern' | 'size' | 'type' | 'value'
> & {
  /** Number of code digits. */
  length?: number;
  /** Accessible label shown above the slots. */
  label?: string;
  /** Guidance shown under the slots. */
  supportingText?: string;
  /** Message shown in place of `supportingText` while `error` is set. */
  errorText?: string;
  /** Render the error state and mark the native input invalid. */
  error?: boolean;
  /** Controlled code value. */
  value?: string;
  /** Initial code value for an uncontrolled input. */
  defaultValue?: string;
  /** Called with the complete string value, rather than a native event. */
  onValueChange?: (value: string) => void;
  /** Called once when the value transitions to the configured length. */
  onComplete?: (value: string) => void;
  /** Class applied to the field root. */
  className?: string;
};

const OTPInput = React.forwardRef<HTMLInputElement, React.PropsWithoutRef<OTPInputProps>>(
  (
    {
      length = 6,
      label,
      supportingText,
      errorText,
      error = false,
      value,
      defaultValue,
      onValueChange,
      onComplete,
      className,
      disabled,
      id: idProp,
      'aria-describedby': describedByProp,
      'aria-label': ariaLabel,
      autoComplete = 'one-time-code',
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = idProp ?? generatedId;
    const supportingTextId = `${inputId}-supporting`;
    const slotCount = Number.isFinite(length) ? Math.max(1, Math.floor(length)) : 6;
    const controlledValue = value === undefined ? undefined : digitsOnly(value).slice(0, slotCount);
    const initialValue = defaultValue === undefined ? undefined : digitsOnly(defaultValue).slice(0, slotCount);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(initialValue ?? '');
    const displaySupportingText = error ? (errorText ?? supportingText) : supportingText;
    const describedBy =
      [describedByProp, displaySupportingText ? supportingTextId : undefined].filter(Boolean).join(' ') || undefined;
    const handleValueChange = (nextValue: string) => {
      if (controlledValue === undefined) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    };

    return (
      <div
        className={cx('md-otp-input', className)}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
      >
        <OTPInputPrimitive
          {...props}
          ref={ref}
          id={inputId}
          aria-describedby={describedBy}
          aria-invalid={error || undefined}
          aria-label={label ? undefined : ariaLabel}
          autoComplete={autoComplete}
          containerClassName="md-otp-input__control"
          className="md-otp-input__native"
          disabled={disabled}
          inputMode="numeric"
          maxLength={slotCount}
          onChange={handleValueChange}
          onComplete={onComplete}
          pasteTransformer={digitsOnly}
          pattern={REGEXP_ONLY_DIGITS}
          value={controlledValue ?? uncontrolledValue}
          render={({ slots, isFocused, isHovering }) => (
            <>
              {label && (
                <label
                  className="md-otp-input__label"
                  data-error={error || undefined}
                  data-focused={isFocused || undefined}
                  data-disabled={disabled || undefined}
                  htmlFor={inputId}
                >
                  {label}
                </label>
              )}
              <div
                aria-hidden="true"
                className="md-otp-input__slots"
                data-disabled={disabled || undefined}
                data-error={error || undefined}
                data-focused={isFocused || undefined}
                data-hovered={isHovering || undefined}
                style={{ '--_slot-count': slotCount } as React.CSSProperties}
              >
                {slots.map((slot, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: Slots are fixed positions in one native input.
                  <OTPSlot key={index} {...slot} disabled={disabled} error={error} />
                ))}
              </div>
            </>
          )}
        />

        {displaySupportingText && (
          <div
            id={supportingTextId}
            className="md-otp-input__supporting-text"
            data-disabled={disabled || undefined}
            data-error={error || undefined}
          >
            {displaySupportingText}
          </div>
        )}
      </div>
    );
  },
);
OTPInput.displayName = 'OTPInput';

function OTPSlot({
  char,
  placeholderChar,
  isActive,
  hasFakeCaret,
  disabled,
  error,
}: SlotProps & {
  disabled?: boolean;
  error?: boolean;
}) {
  return (
    <div
      className="md-otp-input__slot"
      data-active={isActive || undefined}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      data-filled={char !== null || undefined}
    >
      {char ?? placeholderChar}
      {hasFakeCaret && <span className="md-otp-input__caret" />}
    </div>
  );
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

export { OTPInput };
