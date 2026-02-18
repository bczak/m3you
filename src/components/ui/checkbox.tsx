import { cva } from 'class-variance-authority';
import { Check, Minus } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

const checkboxVariants = cva(
  'relative flex size-[18px] shrink-0 items-center justify-center rounded-[2px] transition-colors duration-200 ease-out [&_svg]:size-[18px]',
  {
    variants: {
      variant: {
        primary: '',
        error: '',
      },
      checked: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Unchecked: border only
      { checked: false, variant: 'primary', class: 'border-2 border-outline' },
      { checked: false, variant: 'error', class: 'border-2 border-error' },
      // Checked: filled background
      { checked: true, variant: 'primary', class: 'bg-primary text-primary-foreground' },
      { checked: true, variant: 'error', class: 'bg-error text-error-foreground' },
    ],
    defaultVariants: {
      variant: 'primary',
      checked: false,
    },
  },
);

export type CheckboxProps = Omit<React.ComponentProps<'input'>, 'type'> & {
  checked?: boolean;
  indeterminate?: boolean;
  variant?: 'primary' | 'error';
  onCheckedChange?: (checked: boolean) => void;
};

const Checkbox = ({
  className,
  checked = false,
  indeterminate = false,
  variant = 'primary',
  disabled,
  onCheckedChange,
  ref,
  ...props
}: CheckboxProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Merge refs
  React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  // Set indeterminate state via ref (not an HTML attribute)
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
    props.onChange?.(e);
  };

  // Determine visual state: indeterminate takes precedence over checked
  const isVisuallyChecked = indeterminate || checked;

  return (
    <label
      className={cn(
        'group relative inline-flex size-12 cursor-pointer items-center justify-center',
        disabled && 'pointer-events-none opacity-38',
        className,
      )}
    >
      {/* State layer (40px circular) */}
      <span
        className={cn(
          'pointer-events-none absolute flex size-10 items-center justify-center rounded-full transition-colors duration-200',
          variant === 'primary' && 'group-hover:bg-primary/8',
          variant === 'error' && 'group-hover:bg-error/8',
        )}
      >
        <Ripple />
      </span>

      {/* Visual checkbox (18px) */}
      <span
        aria-hidden="true"
        className={cn('pointer-events-none', checkboxVariants({ variant, checked: isVisuallyChecked }))}
      >
        {indeterminate ? (
          <Minus className="scale-100 transition-transform duration-200 ease-out" />
        ) : checked ? (
          <Check className="scale-100 transition-transform duration-200 ease-out" />
        ) : null}
      </span>

      {/* Hidden native input for accessibility */}
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        className="sr-only"
        {...props}
      />
    </label>
  );
};
Checkbox.displayName = 'Checkbox';

export { Checkbox, checkboxVariants };
