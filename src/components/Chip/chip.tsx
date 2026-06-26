import './chip.css';
import { Check, X } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';
import { useCallback, useRef } from 'react';

import { cx } from '../../lib/cx';

export type ChipProps = Omit<React.ComponentProps<'button'>, 'type'> & {
  type?: 'assist' | 'filter' | 'input' | 'suggestion';
  variant?: 'outlined' | 'elevated';
  selected?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  onClose?: () => void;
};

const Chip = ({
  className,
  type = 'assist',
  variant = 'outlined',
  selected = false,
  leadingIcon,
  trailingIcon,
  onClose,
  disabled,
  children,
  onKeyDown,
  ref,
  ...props
}: ChipProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const innerRef = useRef<HTMLButtonElement>(null);

  // For filter chips: always render check icon container for animation
  const isFilterChip = type === 'filter';

  // For input chips: show close button
  const showCloseButton = type === 'input' && Boolean(onClose);

  // Determine if we have leading/trailing icons for padding
  const hasLeadingIcon = Boolean(leadingIcon) || isFilterChip;
  const hasTrailingIcon = Boolean(trailingIcon) || showCloseButton;

  // Animate chip out then call onClose
  const animateClose = useCallback(() => {
    const el = innerRef.current;
    /* v8 ignore next -- innerRef is mounted and both call sites only invoke this with a truthy onClose */
    if (!el || !onClose) return;
    el.style.overflow = 'hidden';
    el.animate(
      [
        { width: `${el.offsetWidth}px`, opacity: 1, padding: getComputedStyle(el).padding, marginRight: '0px' },
        { width: '0px', opacity: 0, padding: '0px', marginRight: '-8px' },
      ],
      { duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)', fill: 'forwards' },
    ).onfinish = onClose;
  }, [onClose]);

  // Handle keyboard events for input chips
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (type === 'input' && (e.key === 'Delete' || e.key === 'Backspace') && onClose) {
      e.preventDefault();
      animateClose();
    }
    onKeyDown?.(e);
  };

  // Handle close button click
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    animateClose();
  };

  const setChipRef = (node: HTMLButtonElement | null) => {
    (innerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
  };

  const dataAttrs = {
    'data-type': type,
    'data-variant': variant,
    'data-selected': String(selected),
    'data-has-leading-icon': hasLeadingIcon || undefined,
    'data-has-trailing-icon': hasTrailingIcon || undefined,
  };

  const body = (
    <>
      {isFilterChip && (
        <span aria-hidden="true" className="md-chip__filter-icon" data-selected={String(selected)}>
          <Check />
        </span>
      )}
      {!isFilterChip && leadingIcon && (
        <span aria-hidden="true" className="md-chip__leading-icon">
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
      {!showCloseButton && trailingIcon && (
        <span aria-hidden="true" className="md-chip__trailing-icon">
          {trailingIcon}
        </span>
      )}
    </>
  );

  // Input chips with a remove affordance use a non-button container so the
  // close button is a sibling of the chip action — never nested inside it
  // (nested interactive elements are invalid HTML).
  if (showCloseButton) {
    return (
      <span
        className={cx('md-chip', 'md-chip--closable', className)}
        data-disabled={disabled || undefined}
        {...dataAttrs}
      >
        <button
          ref={setChipRef}
          type="button"
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className="md-chip__primary"
          {...props}
        >
          <Ripple />
          {body}
        </button>
        <button
          type="button"
          aria-label={`Remove ${typeof children === 'string' ? children : 'chip'}`}
          onClick={handleCloseClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
            }
          }}
          disabled={disabled}
          className="md-chip__close"
        >
          <X aria-hidden="true" />
        </button>
      </span>
    );
  }

  return (
    <button
      ref={setChipRef}
      type="button"
      disabled={disabled}
      onKeyDown={handleKeyDown}
      aria-pressed={isFilterChip ? selected : undefined}
      className={cx('md-chip', className)}
      {...dataAttrs}
      {...props}
    >
      <Ripple />
      {body}
    </button>
  );
};
Chip.displayName = 'Chip';

export { Chip };
