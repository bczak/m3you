/**
 * Nested controls inside an interactive card should own their own feedback and
 * activation rather than letting the card treat them as surface presses.
 */
const INTERACTIVE_DESCENDANT_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  'summary',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="tab"]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  '[data-interactive]',
].join(', ');

/**
 * Returns `true` when an event target belongs to an interactive descendant
 * inside the card instead of the card surface itself.
 */
const isFromInteractiveDescendant = (
  target: EventTarget | null,
  currentTarget: EventTarget | null,
  selector = INTERACTIVE_DESCENDANT_SELECTOR,
) => {
  if (!(target instanceof Element) || !(currentTarget instanceof Element)) {
    return false;
  }

  const interactiveAncestor = target.closest(selector);

  if (interactiveAncestor?.hasAttribute('data-card-action')) {
    return false;
  }

  return interactiveAncestor !== null && interactiveAncestor !== currentTarget;
};

export { INTERACTIVE_DESCENDANT_SELECTOR, isFromInteractiveDescendant };
