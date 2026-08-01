import * as React from 'react';

import { RadioButton, type RadioButtonProps } from './radio-button';
import { useRadioGroup } from './radio-group-context';

/**
 * RadioGroupItem — a RadioButton that automatically connects to its parent RadioGroup.
 * Use inside a <RadioGroup> to get automatic name, value tracking, and variant inheritance.
 */
export type RadioGroupItemProps = Omit<RadioButtonProps, 'checked' | 'name'> & {
  value: string;
};

const RadioGroupItem = ({
  value,
  variant,
  disabled,
  onValueChange,
  ref,
  ...props
}: RadioGroupItemProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const group = useRadioGroup();

  if (!group) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const handleValueChange = React.useCallback(
    (v: string) => {
      group.onValueChange(v);
      onValueChange?.(v);
    },
    [group.onValueChange, onValueChange],
  );

  return (
    <RadioButton
      ref={ref}
      name={group.name}
      value={value}
      checked={group.value === value}
      variant={variant ?? group.variant}
      disabled={disabled ?? group.disabled}
      aria-label={props['aria-label'] ?? value}
      onValueChange={handleValueChange}
      {...props}
    />
  );
};
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroupItem };
