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
  /**
   * Show a Material ripple on press. Defaults to on for a clickable card (one
   * with `onClick`) and off otherwise; pass `false` to turn it off.
   */
  ripple?: boolean;
  /**
   * Controlled dragged state: a 16% state layer, plus level 1 elevation on
   * elevated and filled cards. Outlined cards keep their border and no shadow.
   */
  dragged?: boolean;
  /**
   * Accessible name for the full-card action of a clickable card. Without it the
   * action takes the card's `aria-labelledby` and `aria-label` (labelledby wins,
   * as on any element), and with neither it is named by the card's content.
   * Naming from the content reads all of it, nested controls included, so pass a
   * short label (or `aria-labelledby` pointing at the title) when the card holds
   * more than a title.
   */
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
      'aria-labelledby': ariaLabelledBy,
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
    const contentId = React.useId();
    // A clickable card's name lives on its action button. `interactiveLabel`
    // replaces any ARIA naming; otherwise `aria-label` and `aria-labelledby`
    // move to the button as-is, so `aria-labelledby` keeps its usual precedence.
    // With none of them the button is named by the card's content.
    const actionLabel = interactiveLabel ?? ariaLabel;
    const forwardedLabelledBy = interactiveLabel === undefined ? ariaLabelledBy : undefined;
    const namedByContent = actionLabel === undefined && forwardedLabelledBy === undefined;
    const actionLabelledBy = namedByContent ? contentId : forwardedLabelledBy;
    const contentLabelId = isInteractive && namedByContent ? contentId : undefined;
    // A static card is a plain div, so its labelling passes straight through
    // (pair it with a `role`, e.g. `region`, for the name to be exposed).
    const rootLabelling = isInteractive ? undefined : { 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy };

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
            aria-label={actionLabel}
            aria-labelledby={actionLabelledBy}
            disabled={disabled}
            onClick={(event) => onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>)}
          />
        ) : null}
        <div className="md-card__content" id={contentLabelId}>
          {children}
        </div>
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
        {...rootLabelling}
        {...props}
      >
        {content}
      </div>
    );
  },
);
Card.displayName = 'Card';

export { Card };
