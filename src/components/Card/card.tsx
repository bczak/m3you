import './card.css';
import * as React from 'react';

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
  /** How the card separates from its background: a shadow, a container colour, or a border. */
  variant?: 'elevated' | 'filled' | 'outlined';
  /** Render the disabled state and block interaction. */
  disabled?: boolean;
  /** Show a Material ripple on press. Set this whenever the card is clickable. */
  ripple?: boolean;
  /** Controlled dragged state (level 1 elevation with a 16% state layer). */
  dragged?: boolean;
  /** Accessible name for the full-card action overlay. Falls back to `aria-label`. */
  interactiveLabel?: string;
};

const Card = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<CardProps>>(
  (
    {
      className,
      variant = 'filled',
      disabled,
      ripple,
      dragged = false,
      interactiveLabel,
      'aria-label': ariaLabel,
      onClick,
      onKeyDown,
      onPointerCancelCapture,
      onPointerDownCapture,
      onPointerOutCapture,
      onPointerOverCapture,
      onPointerUpCapture,
      children,
      ...props
    },
    ref,
  ) => {
    const isInteractive = Boolean(onClick);
    const shouldRenderRipple = ripple ?? isInteractive;

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

    const content = (
      <>
        {shouldRenderRipple && !disabled && <CardRipple pressedOpacity={0.1} />}
        {isInteractive ? (
          <button
            type="button"
            className="md-card__action"
            data-card-action=""
            aria-label={interactiveLabel ?? ariaLabel ?? 'Card action'}
            disabled={disabled}
            onClick={(event) => onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>)}
          />
        ) : null}
        <div className="md-card__content">{children}</div>
      </>
    );

    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: capture handlers coordinate nested surface feedback.
      <div
        ref={ref}
        onKeyDown={onKeyDown}
        onPointerOverCapture={handlePointerOverCapture}
        onPointerOutCapture={handlePointerOutCapture}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerUpCapture={handlePointerUpCapture}
        onPointerCancelCapture={handlePointerCancelCapture}
        className={cx('md-card', className)}
        data-variant={variant}
        data-interactive={isInteractive ? '' : undefined}
        data-ripple={shouldRenderRipple && !disabled ? '' : undefined}
        data-disabled={disabled || undefined}
        data-dragged={dragged || undefined}
        {...props}
      >
        {content}
      </div>
    );
  },
);
Card.displayName = 'Card';

export { Card };
