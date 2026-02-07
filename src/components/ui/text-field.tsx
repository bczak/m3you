import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/utils';

const textFieldVariants = cva('group/tf relative flex h-14 items-center text-base/6', {
  variants: {
    variant: {
      filled: 'rounded-t-[4px] bg-surface-container-highest',
      outlined: 'rounded-[4px]',
    },
  },
  defaultVariants: {
    variant: 'filled',
  },
});

export type TextFieldProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  variant?: 'filled' | 'outlined';
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
  label?: string;
  supportingText?: string;
  errorText?: string;
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  prefixText?: string;
  suffixText?: string;
  maxCharCount?: number;
  onValueChange?: (value: string) => void;
};

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      variant = 'filled',
      type = 'text',
      label,
      supportingText,
      errorText,
      error = false,
      leadingIcon,
      trailingIcon,
      prefixText,
      suffixText,
      maxCharCount,
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
    const floating = focused || populated;
    const hasError = error || !!errorText;
    const displaySupportingText = hasError ? errorText : supportingText;
    const charCount = String(currentValue).length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <div className={cn('inline-flex w-full flex-col', disabled && 'pointer-events-none', className)}>
        {/* Main container */}
        <div
          data-focused={focused || undefined}
          data-error={hasError || undefined}
          data-disabled={disabled || undefined}
          data-populated={populated || undefined}
          className={textFieldVariants({ variant })}
        >
          {/* Floating label — positioned relative to the container */}
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'pointer-events-none absolute z-10 origin-top-left transition-all duration-150 [transition-timing-function:cubic-bezier(0.2,0,0,1)]',
                // Resting state: centered vertically, after icon if present
                !floating && 'top-1/2 -translate-y-1/2 text-base/6 text-surface-variant-foreground',
                !floating && !leadingIcon && 'left-4',
                !floating && leadingIcon && 'left-12',
                // Floating state: always top-left
                floating && 'left-4 text-xs/4',
                floating && variant === 'filled' && 'top-2',
                floating && variant === 'outlined' && '-top-2 px-1',
                // Focus color
                floating && focused && !hasError && 'text-primary',
                floating && !focused && 'text-surface-variant-foreground',
                // Error color
                hasError && floating && 'text-error',
                hasError && !floating && 'text-surface-variant-foreground',
                // Disabled
                disabled && 'opacity-38',
              )}
            >
              {label}
            </label>
          )}

          {/* Leading icon */}
          {leadingIcon && (
            <span
              className={cn(
                'flex shrink-0 items-center pl-3 text-surface-variant-foreground [&_svg]:size-5',
                hasError && 'text-error',
                disabled && 'opacity-38',
              )}
            >
              {leadingIcon}
            </span>
          )}

          {/* Input area */}
          <div className="relative flex min-w-0 flex-1 self-stretch">
            {/* Prefix */}
            {prefixText && (
              <span
                className={cn(
                  'flex items-center pl-4 text-base/6 text-surface-variant-foreground transition-opacity duration-150',
                  leadingIcon && 'pl-3',
                  label && !floating && 'opacity-0',
                  label && floating && variant === 'filled' && 'pt-2',
                  disabled && 'opacity-38',
                )}
              >
                {prefixText}
              </span>
            )}

            {/* Input element */}
            <input
              ref={ref}
              id={inputId}
              type={type}
              disabled={disabled}
              value={currentValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              aria-invalid={hasError || undefined}
              aria-describedby={displaySupportingText || maxCharCount ? supportingTextId : undefined}
              className={cn(
                'min-w-0 flex-1 bg-transparent text-base/6 text-foreground caret-primary outline-none placeholder:text-surface-variant-foreground',
                // Padding
                !prefixText && 'pl-4',
                !prefixText && leadingIcon && 'pl-3',
                !suffixText && 'pr-4',
                !suffixText && trailingIcon && 'pr-3',
                prefixText && 'pl-1',
                suffixText && 'pr-1',
                // Shift down when label is floating (filled)
                label && variant === 'filled' && 'pt-2',
                // Error caret
                hasError && 'caret-error',
                // Disabled
                disabled && 'text-foreground/38',
              )}
              {...props}
            />

            {/* Suffix */}
            {suffixText && (
              <span
                className={cn(
                  'flex items-center pr-4 text-base/6 text-surface-variant-foreground transition-opacity duration-150',
                  trailingIcon && 'pr-3',
                  label && !floating && 'opacity-0',
                  label && floating && variant === 'filled' && 'pt-2',
                  disabled && 'opacity-38',
                )}
              >
                {suffixText}
              </span>
            )}
          </div>

          {/* Trailing icon */}
          {trailingIcon && (
            <span
              className={cn(
                'flex shrink-0 items-center pr-3 text-surface-variant-foreground [&_svg]:size-5',
                hasError && 'text-error',
                disabled && 'opacity-38',
              )}
            >
              {trailingIcon}
            </span>
          )}

          {/* Filled variant: active indicator (bottom border) */}
          {variant === 'filled' && (
            <div
              className={cn(
                'pointer-events-none absolute right-0 bottom-0 left-0 border-surface-variant border-b transition-all duration-150',
                focused && !hasError && 'border-primary border-b-2',
                hasError && 'border-error border-b-2',
                disabled && 'border-foreground/38',
              )}
            />
          )}

          {/* Outlined variant: border */}
          {variant === 'outlined' && (
            <fieldset
              className={cn(
                'pointer-events-none absolute inset-0 m-0 rounded-[inherit] border border-outline p-0 px-3 transition-all duration-150',
                focused && !hasError && 'border-2 border-primary',
                hasError && 'border-2 border-error',
                disabled && 'border-outline/38',
              )}
            >
              {label && (
                <legend
                  className={cn(
                    'invisible h-0 overflow-hidden whitespace-nowrap text-xs/4 transition-all duration-150',
                    !floating && 'max-w-[0.01px] px-0',
                    floating && 'max-w-full px-1',
                  )}
                >
                  {label}
                </legend>
              )}
            </fieldset>
          )}
        </div>

        {/* Supporting text row */}
        {(displaySupportingText || maxCharCount) && (
          <div id={supportingTextId} className={cn('flex gap-4 px-4 pt-1 text-xs/4', disabled && 'opacity-38')}>
            <span className={cn('flex-1 text-surface-variant-foreground', hasError && 'text-error')}>
              {displaySupportingText}
            </span>
            {maxCharCount !== undefined && (
              <span className={cn('text-surface-variant-foreground', hasError && 'text-error')}>
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

export { TextField, textFieldVariants };
