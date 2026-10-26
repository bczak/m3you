import * as React from 'react';

import { RadioButton, type RadioButtonProps } from './radio-button';
import { useRadioGroup } from './radio-group-context';

/**
 * RadioGroupItem — a RadioButton that automatically connects to its parent RadioGroup.
 * Use inside a <RadioGroup> to get automatic name, value tracking, and variant inheritance.
 *
 * Its input needs an accessible name. A bare `<RadioGroupItem value="dark" />`
 * is named by its `value`; an `aria-label`, an `aria-labelledby`, a
 * `<label htmlFor>` pointing at its `id`, or a wrapping `<label>` with text
 * names it instead, and then no `value` fallback is set over it.
 */
export type RadioGroupItemProps = Omit<RadioButtonProps, 'checked' | 'name'> & {
  /** This item's value within the group. */
  value: string;
};

/**
 * Whether a `<label>` other than the radio's own (empty, visual-only) wrapper
 * names `input`: one pointing at its `id`, or one wrapping the whole radio.
 * The ancestor walk is explicit because `input.labels` stops at the nearest
 * enclosing label in some DOMs, and that is always the radio's own wrapper.
 */
function hasLabelElement(input: HTMLInputElement) {
  const own = input.parentElement as HTMLElement;
  const wrapping = own.parentElement?.closest('label');
  return [...Array.from(input.labels as NodeListOf<HTMLLabelElement>), wrapping].some(
    (label) => label && label !== own && label.textContent?.trim(),
  );
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, React.PropsWithoutRef<RadioGroupItemProps>>(
  (
    { value, variant, disabled, onValueChange, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy, ...props },
    ref,
  ) => {
    const group = useRadioGroup();

    if (!group) {
      throw new Error('RadioGroupItem must be used within a RadioGroup');
    }

    const inputRef = React.useRef<HTMLInputElement>(null);
    const [labelled, setLabelled] = React.useState(false);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // A label can be added, removed or re-pointed by a render elsewhere, so
    // check again after every render of the item. The first render (and the
    // server render) keeps the `value` fallback: unnamed is the worse failure.
    // A decorative item has no input to name.
    React.useEffect(() => {
      const input = inputRef.current;
      setLabelled(input ? hasLabelElement(input) : false);
    });

    const handleValueChange = React.useCallback(
      (v: string) => {
        group.onValueChange(v);
        onValueChange?.(v);
      },
      [group.onValueChange, onValueChange],
    );

    return (
      <RadioButton
        ref={inputRef}
        name={group.name}
        value={value}
        checked={group.value === value}
        variant={variant ?? group.variant}
        disabled={disabled ?? group.disabled}
        aria-label={ariaLabel ?? (ariaLabelledBy || labelled ? undefined : value)}
        aria-labelledby={ariaLabelledBy}
        onValueChange={handleValueChange}
        {...props}
      />
    );
  },
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroupItem };
