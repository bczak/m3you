import './card.css';
import type * as React from 'react';

import { cx } from '../../lib/cx';
import { CardRipple } from './card-ripple';
import { isFromInteractiveDescendant } from './interactive-descendant';

const NESTED_INTERACTIVE_ATTRIBUTE = 'data-nested-interactive';

const setNestedInteractiveState = (element: HTMLDivElement, isNestedInteractive: boolean) => {
  if (isNestedInteractive) {
    element.setAttribute(NESTED_INTERACTIVE_ATTRIBUTE, '');
    return;
  }

  element.removeAttribute(NESTED_INTERACTIVE_ATTRIBUTE);
};

const syncNestedInteractiveState = (element: HTMLDivElement, target: EventTarget | null) => {
  setNestedInteractiveState(element, isFromInteractiveDescendant(target, element));
};

/**
 * Material 3 card surface.
 *
 * When the card itself is clickable, the card owns the surface ripple. Nested
 * interactive children such as buttons still keep their own feedback and
 * should not also trigger the card surface interaction.
 */
export type CardProps = React.ComponentProps<'div'> & {
  variant?: 'elevated' | 'filled' | 'outlined';
  disabled?: boolean;
  ripple?: boolean;
};

const Card = ({
  className,
  variant = 'filled',
  disabled,
  ripple,
  onClick,
  onKeyDown,
  onPointerCancelCapture,
  onPointerDownCapture,
  onPointerOutCapture,
  onPointerOverCapture,
  onPointerUpCapture,
  children,
  ref,
  ...props
}: CardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const isInteractive = Boolean(onClick);
  const shouldRenderRipple = ripple ?? isInteractive;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFromInteractiveDescendant(e.target, e.currentTarget)) {
      return;
    }

    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isFromInteractiveDescendant(e.target, e.currentTarget)) {
      onKeyDown?.(e);
      return;
    }

    if (isInteractive && !disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  };

  // Capture-phase pointer tracking lets the card know when the pointer is over
  // a nested control so surface feedback can stay quiet for child interactions.
  const handlePointerOverCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    syncNestedInteractiveState(e.currentTarget, e.target);
    onPointerOverCapture?.(e);
  };

  const handlePointerOutCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    const nextTarget = e.relatedTarget;

    if (nextTarget instanceof Node && e.currentTarget.contains(nextTarget)) {
      syncNestedInteractiveState(e.currentTarget, nextTarget);
    } else {
      setNestedInteractiveState(e.currentTarget, false);
    }

    onPointerOutCapture?.(e);
  };

  const handlePointerDownCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    syncNestedInteractiveState(e.currentTarget, e.target);
    onPointerDownCapture?.(e);
  };

  const handlePointerUpCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') {
      setNestedInteractiveState(e.currentTarget, false);
    } else {
      syncNestedInteractiveState(e.currentTarget, e.target);
    }

    onPointerUpCapture?.(e);
  };

  const handlePointerCancelCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    setNestedInteractiveState(e.currentTarget, false);
    onPointerCancelCapture?.(e);
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role="button" is set conditionally when interactive
    <div
      ref={ref}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive && !disabled ? 0 : undefined}
      aria-disabled={isInteractive && disabled ? true : undefined}
      onClick={!disabled && onClick ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : onKeyDown}
      onPointerOverCapture={handlePointerOverCapture}
      onPointerOutCapture={handlePointerOutCapture}
      onPointerDownCapture={handlePointerDownCapture}
      onPointerUpCapture={handlePointerUpCapture}
      onPointerCancelCapture={handlePointerCancelCapture}
      className={cx('md-card', className)}
      data-variant={variant}
      data-interactive={isInteractive || undefined}
      data-ripple={shouldRenderRipple && !disabled ? '' : undefined}
      data-disabled={disabled || undefined}
      {...props}
    >
      {shouldRenderRipple && !disabled && <CardRipple hoverOpacity={0} />}
      {children}
    </div>
  );
};
Card.displayName = 'Card';

export { Card };
