import './text-field.css';
import * as React from 'react';

import { cx } from '../../lib/cx';

export type TextFieldElement = HTMLInputElement | HTMLTextAreaElement;

export type TextFieldProps = Omit<React.ComponentProps<'input'>, 'type' | 'onChange' | 'onFocus' | 'onBlur'> & {
  /** `filled` uses a tinted container; `outlined` uses a border. */
  variant?: 'filled' | 'outlined';
  /** Native input type. `textarea` renders a multiline `<textarea>`. */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'textarea';
  /** Initial visible line count for `type="textarea"`. */
  rows?: number;
  /** Floating label. Animates into the outline on focus. */
  label?: string;
  /** Guidance shown under the field. */
  supportingText?: string;
  /**
   * Message shown in place of `supportingText` while `error` is set.
   * Supplying it does not by itself put the field into the error state — pass
   * `error` for that, so a form can declare its message up front without
   * rendering red or claiming `aria-invalid`.
   */
  errorText?: string;
  /** Render the error state. Replaces `supportingText` with `errorText`. */
  error?: boolean;
  /** Icon inside the field, before the text. */
  leadingIcon?: React.ReactNode;
  /** Icon inside the field, after the text. */
  trailingIcon?: React.ReactNode;
  /** Static text before the input value, such as a currency symbol. */
  prefixText?: string;
  /** Static text after the input value, such as a unit. */
  suffixText?: string;
  /** Show a character counter and cap input at this length. */
  maxCharCount?: number;
  /** Called with the input's string value — saves reaching into the event. */
  onValueChange?: (value: string) => void;
  /** Native change event from the rendered input or textarea. */
  onChange?: React.ChangeEventHandler<TextFieldElement>;
  /** Native focus event from the rendered input or textarea. */
  onFocus?: React.FocusEventHandler<TextFieldElement>;
  /** Native blur event from the rendered input or textarea. */
  onBlur?: React.FocusEventHandler<TextFieldElement>;
};

const TextField = React.forwardRef<TextFieldElement, React.PropsWithoutRef<TextFieldProps>>(
  (
    {
      className,
      variant = 'filled',
      type = 'text',
      rows = 2,
      label,
      supportingText,
      errorText,
      error = false,
      leadingIcon,
      trailingIcon,
      prefixText,
      suffixText,
      maxCharCount,
      maxLength,
      disabled,
      onValueChange,
      onChange,
      onFocus,
      onBlur,
      value,
      defaultValue,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = idProp ?? generatedId;
    const supportingTextId = `${inputId}-supporting`;
    const [focused, setFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const populated = String(currentValue).length > 0;
    const multiline = type === 'textarea';
    const floating = multiline || focused || populated;
    // The error state comes from `error` alone. `errorText` only supplies the
    // message shown while `error` is set — a form that pre-declares its
    // message must not render red, and must not claim `aria-invalid`, before
    // the value is actually invalid.
    const hasError = error;
    const displaySupportingText = hasError ? (errorText ?? supportingText) : supportingText;
    const charCount = String(currentValue).length;

    const updateTextValue = (e: React.ChangeEvent<TextFieldElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    const showFloatingLabel = (e: React.FocusEvent<TextFieldElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const hideFloatingLabel = (e: React.FocusEvent<TextFieldElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    // Determine input padding data attributes
    const padLeft = prefixText ? 'prefix' : leadingIcon ? 'icon' : 'default';
    const padRight = suffixText ? 'suffix' : trailingIcon ? 'icon' : 'default';

    return (
      <div
        className={cx('md-text-field', className)}
        data-disabled={disabled || undefined}
        data-multiline={multiline || undefined}
      >
        {/* Main container */}
        <div
          data-variant={variant}
          data-focused={focused || undefined}
          data-error={hasError || undefined}
          data-disabled={disabled || undefined}
          data-populated={populated || undefined}
          data-has-label={String(!!label)}
          data-has-leading={String(!!leadingIcon)}
          data-has-trailing={String(!!trailingIcon)}
          data-multiline={multiline || undefined}
          className="md-text-field__container"
        >
          {/* Floating label */}
          {label && (
            <label
              htmlFor={inputId}
              className="md-text-field__label"
              data-floating={String(floating)}
              data-variant={variant}
              data-focused={String(focused)}
              data-error={String(hasError)}
              data-disabled={disabled || undefined}
            >
              {label}
            </label>
          )}

          {/* Leading icon */}
          {leadingIcon && (
            <span
              className="md-text-field__leading-icon"
              data-error={hasError || undefined}
              data-has-label={String(!!label)}
              data-disabled={disabled || undefined}
            >
              {leadingIcon}
            </span>
          )}

          {/* Input area */}
          <div
            className="md-text-field__input-area"
            data-has-label={String(!!label)}
            data-multiline={multiline || undefined}
          >
            {/* Prefix */}
            {prefixText && (
              <span
                className="md-text-field__prefix"
                data-hidden={String(!!label && !floating)}
                data-variant={variant}
                data-floating={String(floating)}
                data-disabled={disabled || undefined}
              >
                {prefixText}
              </span>
            )}

            {/* Input element */}
            {multiline ? (
              <textarea
                ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
                id={inputId}
                rows={rows}
                disabled={disabled}
                value={currentValue}
                maxLength={maxLength ?? maxCharCount}
                onChange={updateTextValue}
                onFocus={showFloatingLabel}
                onBlur={hideFloatingLabel}
                aria-invalid={hasError || undefined}
                aria-describedby={displaySupportingText || maxCharCount ? supportingTextId : undefined}
                className="md-text-field__input"
                data-pad-left={padLeft}
                data-pad-right={padRight}
                data-variant={variant}
                data-has-label={String(!!label)}
                data-floating={String(floating)}
                data-error={hasError || undefined}
                data-disabled={disabled || undefined}
                {...(props as React.ComponentPropsWithoutRef<'textarea'>)}
              />
            ) : (
              <input
                ref={ref as React.ForwardedRef<HTMLInputElement>}
                id={inputId}
                type={type}
                disabled={disabled}
                value={currentValue}
                maxLength={maxLength ?? maxCharCount}
                onChange={updateTextValue}
                onFocus={showFloatingLabel}
                onBlur={hideFloatingLabel}
                aria-invalid={hasError || undefined}
                aria-describedby={displaySupportingText || maxCharCount ? supportingTextId : undefined}
                className="md-text-field__input"
                data-pad-left={padLeft}
                data-pad-right={padRight}
                data-variant={variant}
                data-has-label={String(!!label)}
                data-floating={String(floating)}
                data-error={hasError || undefined}
                data-disabled={disabled || undefined}
                {...props}
              />
            )}

            {/* Suffix */}
            {suffixText && (
              <span
                className="md-text-field__suffix"
                data-hidden={String(!!label && !floating)}
                data-variant={variant}
                data-floating={String(floating)}
                data-disabled={disabled || undefined}
              >
                {suffixText}
              </span>
            )}
          </div>

          {/* Trailing icon */}
          {trailingIcon && (
            <span
              className="md-text-field__trailing-icon"
              data-error={hasError || undefined}
              data-has-label={String(!!label)}
              data-disabled={disabled || undefined}
            >
              {trailingIcon}
            </span>
          )}

          {/* Filled variant: active indicator (bottom border) */}
          {variant === 'filled' && (
            <div
              className="md-text-field__active-indicator"
              data-focused={String(focused)}
              data-error={String(hasError)}
              data-disabled={disabled || undefined}
            />
          )}

          {/* Outlined variant: border, drawn as start | notch | end so the notch
              opens directly above the input text, after any leading icon. */}
          {variant === 'outlined' && (
            <div
              aria-hidden="true"
              className="md-text-field__outline"
              data-focused={String(focused)}
              data-error={String(hasError)}
              data-disabled={disabled || undefined}
            >
              <div className="md-text-field__outline-start" />
              {label && (
                <div className="md-text-field__outline-notch" data-floating={String(floating)}>
                  <span className="md-text-field__outline-legend">{label}</span>
                </div>
              )}
              <div className="md-text-field__outline-end" />
            </div>
          )}
        </div>

        {/* Supporting text row */}
        {(displaySupportingText || maxCharCount) && (
          <div id={supportingTextId} className="md-text-field__supporting" data-disabled={disabled || undefined}>
            <span className="md-text-field__supporting-text" data-error={hasError || undefined}>
              {displaySupportingText}
            </span>
            {maxCharCount !== undefined && (
              <span className="md-text-field__char-count" data-error={hasError || undefined}>
                {charCount} / {maxCharCount}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);
TextField.displayName = 'TextField';

export { TextField };
