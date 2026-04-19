import './chip.css';
import { Check, X } from 'lucide-react';
import { Ripple } from 'm3-ripple';
import type * as React from 'react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';

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
  const [pressGroupEnabled, setPressGroupEnabled] = useState(false);

  // For filter chips: always render check icon container for animation
  const isFilterChip = type === 'filter';

  // For input chips: show close button
  const showCloseButton = type === 'input' && onClose;

  // Determine if we have leading/trailing icons for padding
  const hasLeadingIcon = Boolean(leadingIcon) || isFilterChip;
  const hasTrailingIcon = Boolean(trailingIcon) || Boolean(showCloseButton);

  // Animate chip out then call onClose
  const animateClose = useCallback(() => {
    const el = innerRef.current;
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

  useLayoutEffect(() => {
    const chip = innerRef.current;
    const parent = chip?.parentElement;

    if (!chip || !parent) {
      setPressGroupEnabled(false);
      return;
    }

    const updatePressGroupState = () => {
      const chipCount = Array.from(parent.children).filter((node) =>
        (node as HTMLElement).classList.contains('md-chip'),
      ).length;

      setPressGroupEnabled(chipCount > 3);
    };

    updatePressGroupState();

    const observer = new MutationObserver(updatePressGroupState);
    observer.observe(parent, { childList: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <button
      ref={(node) => {
        (innerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      type="button"
      disabled={disabled}
      onKeyDown={handleKeyDown}
      aria-pressed={type === 'filter' ? selected : undefined}
      className={cx('md-chip', className)}
      data-type={type}
      data-variant={variant}
      data-selected={String(selected)}
      data-has-leading-icon={hasLeadingIcon || undefined}
      data-has-trailing-icon={hasTrailingIcon || undefined}
      data-press-group={pressGroupEnabled || undefined}
      {...props}
    >
      <Ripple />
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
      {showCloseButton ? (
        <button
          type="button"
          aria-label={`Remove ${typeof children === 'string' ? children : 'chip'}`}
          onClick={handleCloseClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
            }
          }}
          className="md-chip__close"
        >
          <X aria-hidden="true" />
        </button>
      ) : (
        trailingIcon && (
          <span aria-hidden="true" className="md-chip__trailing-icon">
            {trailingIcon}
          </span>
        )
      )}
    </button>
  );
};
Chip.displayName = 'Chip';

export { Chip };
