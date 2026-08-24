import './list.css';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';
import { Checkbox } from '../Checkbox/checkbox';
import { RadioButton } from '../RadioButton/radio-button';

export type ListAppearance = 'standard' | 'segmented';

export type ListMode = 'static' | 'single-action' | 'multi-action' | 'single-select' | 'multi-select';

export type ListMeasure = 'container' | 'text';

type ListBaseProps = Omit<React.ComponentProps<'ul'>, 'defaultValue' | 'onChange'> & {
  /** Expressive segmented containers are the recommended M3 appearance. */
  appearance?: ListAppearance;
  /** Density offset applied to row heights. */
  density?: 0 | -2 | -4;
  /**
   * How wide the list may run.
   *
   * `container` — fill the parent. The layout owns width, which is what a
   * container component should do.
   *
   * `text` — cap the list at `--md-list-max-width` (60ch), M3's readable
   * measure. Right for rows that read as prose; wrong for rows whose trailing
   * content should sit at the container's edge, such as a ledger's amounts.
   *
   * A row's own text block is capped at 60ch either way, so a headline never
   * runs past a readable line even when the list fills a monitor.
   */
  measure?: ListMeasure;
};

export type ListNonSelectionProps = ListBaseProps & {
  mode?: 'static' | 'single-action' | 'multi-action';
  value?: never;
  defaultValue?: never;
  onValueChange?: never;
  required?: never;
};

export type ListSingleSelectionProps = ListBaseProps & {
  mode: 'single-select';
  /** Selection lists must have an accessible name. */
  'aria-label': string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;
  /** Defaults to true for single-selection lists. */
  required?: boolean;
};

export type ListMultiSelectionProps = ListBaseProps & {
  mode: 'multi-select';
  /** Selection lists must have an accessible name. */
  'aria-label': string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Defaults to false for multiple-selection lists. */
  required?: boolean;
};

export type ListProps = ListNonSelectionProps | ListSingleSelectionProps | ListMultiSelectionProps;

export type ListSelectionIndicator = 'check' | 'radio' | 'checkbox' | React.ReactNode;

export type ListItemProps = Omit<React.ComponentProps<'li'>, 'children' | 'onClick' | 'value'> & {
  /** Stable selection value. Required when the parent list is selectable. */
  value?: string;
  /** Primary line. The only required content. */
  headline: React.ReactNode;
  /** Small line above the headline, for a category or timestamp. */
  overline?: React.ReactNode;
  /** Secondary line under the headline. */
  supportingText?: React.ReactNode;
  /** Content at the start of the row — an icon, avatar or thumbnail. */
  leading?: React.ReactNode;
  /** Content at the end of the row — an icon, a switch, or metadata. */
  trailing?: React.ReactNode;
  /** How many lines of vertical space to reserve, so rows in a list stay aligned. */
  lineCount?: 1 | 2 | 3;
  /** Render the row as a link to this URL. */
  href?: string;
  /** Link target, when `href` is set. */
  target?: React.HTMLAttributeAnchorTarget;
  /** Link relationship, when `href` is set. */
  rel?: string;
  /** Download behaviour, when `href` is set. */
  download?: React.AnchorHTMLAttributes<HTMLAnchorElement>['download'];
  /** Button type, when the row is a button rather than a link. */
  type?: 'button' | 'submit' | 'reset';
  /** Called when the row is activated. Renders the row as a button unless `href` is set. */
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /** Disable the row and skip it in keyboard navigation. */
  disabled?: boolean;
  /** Render the dragged state, for a row being reordered. */
  dragged?: boolean;
  /** Which indicator marks selection — a check, a radio, a checkbox, or your own node. */
  selectionIndicator?: ListSelectionIndicator;
  /** Which end of the row the selection indicator sits on. */
  selectionIndicatorPosition?: 'leading' | 'trailing';
};

export type ListDividerProps = Omit<React.ComponentProps<'li'>, 'children'> & {
  /** Indent the line to align with the row's text rather than its leading content. */
  inset?: boolean;
};

export type ListItemAccordionProps = Omit<React.ComponentProps<'li'>, 'children' | 'onChange'> & {
  /** Primary line for the disclosure button. */
  headline: React.ReactNode;
  /** Optional line above the headline. */
  overline?: React.ReactNode;
  /** Optional supporting line below the headline. */
  supportingText?: React.ReactNode;
  /** Optional leading content. */
  leading?: React.ReactNode;
  /** Optional trailing content rendered before the disclosure icon. */
  trailing?: React.ReactNode;
  /** Disclosure panel content. */
  children?: React.ReactNode;
  /** Controlled expanded state. */
  expanded?: boolean;
  /** Initial expanded state for uncontrolled use. */
  defaultExpanded?: boolean;
  /** Called whenever the disclosure state is requested to change. */
  onExpandedChange?: (expanded: boolean) => void;
  /** Disable the disclosure button. */
  disabled?: boolean;
};

export type ListItemSwipeSide = 'start' | 'end' | null;

export type ListItemSwipeProps = Omit<React.ComponentProps<'li'>, 'onChange'> & {
  /** Controlled side revealed behind the item, or null when closed. */
  revealedSide?: ListItemSwipeSide;
  /** Initial revealed side for uncontrolled use. */
  defaultRevealedSide?: ListItemSwipeSide;
  /** Called whenever a swipe, Escape, or action requests a new revealed side. */
  onRevealedSideChange?: (side: ListItemSwipeSide) => void;
  /** Action exposed by dragging toward the inline end. */
  startAction?: React.ReactNode;
  /** Action exposed by dragging toward the inline start. */
  endAction?: React.ReactNode;
};

type ListContextValue = {
  mode: ListMode;
  selectedValues: ReadonlySet<string>;
  selectValue: (value: string) => void;
};

type ListItemPosition = {
  index: number;
  count: number;
  itemKey: string;
};

type ItemMetadata = {
  disabled: boolean;
  key: string;
  value: string | undefined;
};

const ListContext = React.createContext<ListContextValue | null>(null);
const ListItemPositionContext = React.createContext<ListItemPosition | null>(null);

const INTERACTIVE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]';

function isSelectionMode(mode: ListMode): mode is 'single-select' | 'multi-select' {
  return mode === 'single-select' || mode === 'multi-select';
}

function isActionMode(mode: ListMode): mode is 'single-action' | 'multi-action' {
  return mode === 'single-action' || mode === 'multi-action';
}

function isListItemElement(child: React.ReactNode): child is React.ReactElement<ListItemProps> {
  return React.isValidElement<ListItemProps>(child) && child.type === ListItem;
}

function getItemMetadata(children: React.ReactNode): ItemMetadata[] {
  const metadata: ItemMetadata[] = [];
  for (const child of React.Children.toArray(children)) {
    if (!isListItemElement(child)) continue;
    metadata.push({
      disabled: child.props.disabled === true,
      key: child.props.value ?? String(child.key),
      value: child.props.value,
    });
  }
  return metadata;
}

function isDisabledTarget(element: HTMLElement) {
  return element.getAttribute('aria-disabled') === 'true' || (element instanceof HTMLButtonElement && element.disabled);
}

function getListTargets(root: HTMLUListElement, mode: ListMode) {
  const selector = isSelectionMode(mode)
    ? '[data-md-list-item][role="option"]'
    : '[data-md-list-action], .md-list-item__trailing a[href], .md-list-item__trailing button, .md-list-item__trailing input, .md-list-item__trailing select, .md-list-item__trailing textarea, .md-list-item__trailing [tabindex]';

  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (element, index, elements) =>
      element.closest('.md-list') === root && !isDisabledTarget(element) && elements.indexOf(element) === index,
  );
}

function setRovingTarget(targets: HTMLElement[], target: HTMLElement) {
  for (const element of targets) {
    element.tabIndex = element === target ? 0 : -1;
  }
}

function containsInteractiveNode(node: React.ReactNode): boolean {
  return React.Children.toArray(node).some((child) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return false;
    if (typeof child.type === 'string' && ['a', 'button', 'input', 'select', 'textarea'].includes(child.type)) {
      return true;
    }
    return containsInteractiveNode(child.props.children);
  });
}

function renderSelectionIndicator(indicator: ListSelectionIndicator, selected: boolean) {
  if (!React.isValidElement(indicator) && typeof indicator !== 'string') {
    return indicator;
  }

  if (indicator !== 'check' && indicator !== 'radio' && indicator !== 'checkbox') {
    return indicator;
  }

  // Decorative: the row is the interactive control and already carries the
  // selected state, so the indicator borrows the control's visuals without
  // nesting a real input inside it (axe `nested-interactive`).
  if (indicator === 'radio') {
    return <RadioButton checked={selected} decorative />;
  }

  if (indicator === 'checkbox') {
    return <Checkbox checked={selected} decorative />;
  }

  return (
    <span className="md-list-item__selection-mark" data-kind={indicator} data-selected={selected || undefined}>
      {selected ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9.55 17.6-5.15-5.15 1.4-1.4 3.75 3.75 8.65-8.65 1.4 1.4Z" />
        </svg>
      ) : null}
    </span>
  );
}

const EMPTY_SELECTION = new Set<string>();
const EMPTY_MULTI_VALUE: string[] = [];

const List = React.forwardRef<HTMLUListElement, React.PropsWithoutRef<ListProps>>(
  (
    {
      appearance = 'segmented',
      density = 0,
      measure = 'container',
      mode = 'static',
      value: selectionValue,
      defaultValue: defaultSelectionValue,
      onValueChange,
      required: requiredProp,
      children,
      className,
      onKeyDown,
      onFocusCapture,
      ...rest
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLUListElement | null>(null);
    const items = React.useMemo(() => getItemMetadata(children), [children]);
    const firstEnabledValue = items.find((item) => !item.disabled && item.value !== undefined)?.value;
    const isSingle = mode === 'single-select';
    const isMulti = mode === 'multi-select';
    const selectionMode = isSingle || isMulti;
    const required = selectionMode ? (requiredProp ?? isSingle) : false;
    const controlled = selectionMode && selectionValue !== undefined;
    const singleValueChange = isSingle ? (onValueChange as ListSingleSelectionProps['onValueChange']) : undefined;
    const multiValueChange = isMulti ? (onValueChange as ListMultiSelectionProps['onValueChange']) : undefined;

    const [internalSingleValue, setInternalSingleValue] = React.useState<string | null>(() => {
      if (typeof defaultSelectionValue === 'string') return defaultSelectionValue;
      return required ? (firstEnabledValue ?? null) : null;
    });
    const [internalMultiValue, setInternalMultiValue] = React.useState<string[]>(() => {
      const initialValues = Array.isArray(defaultSelectionValue) ? defaultSelectionValue : EMPTY_MULTI_VALUE;
      if (initialValues.length > 0) return initialValues;
      return required && firstEnabledValue !== undefined ? [firstEnabledValue] : [];
    });

    const actualSingleValue = controlled
      ? typeof selectionValue === 'string'
        ? selectionValue
        : null
      : internalSingleValue;
    const actualMultiValue = controlled
      ? Array.isArray(selectionValue)
        ? selectionValue
        : EMPTY_MULTI_VALUE
      : internalMultiValue;
    const selectedValues = React.useMemo(() => {
      if (isSingle) return actualSingleValue === null ? EMPTY_SELECTION : new Set([actualSingleValue]);
      if (isMulti) return new Set(actualMultiValue);
      return EMPTY_SELECTION;
    }, [actualMultiValue, actualSingleValue, isMulti, isSingle]);

    const selectValue = React.useCallback(
      (itemValue: string) => {
        if (isSingle) {
          if (actualSingleValue === itemValue && required) return;
          const nextValue = actualSingleValue === itemValue ? null : itemValue;
          if (!controlled) setInternalSingleValue(nextValue);
          singleValueChange?.(nextValue);
          return;
        }

        const nextValues = new Set(actualMultiValue);
        if (nextValues.has(itemValue)) {
          if (required && nextValues.size === 1) return;
          nextValues.delete(itemValue);
        } else {
          nextValues.add(itemValue);
        }
        const nextValue = Array.from(nextValues);
        if (!controlled) setInternalMultiValue(nextValue);
        multiValueChange?.(nextValue);
      },
      [actualMultiValue, actualSingleValue, controlled, isSingle, multiValueChange, required, singleValueChange],
    );

    const setRootRef = React.useCallback(
      (node: HTMLUListElement | null) => {
        rootRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    React.useLayoutEffect(() => {
      const root = rootRef.current;
      if (!root || mode === 'static') return;
      const targets = getListTargets(root, mode);
      if (targets.length === 0) return;
      const activeElement = root.ownerDocument.activeElement;
      const focused = activeElement instanceof HTMLElement && root.contains(activeElement) ? activeElement : null;
      const selected = targets.find(
        (target) => target.dataset.listValue && selectedValues.has(target.dataset.listValue),
      );
      const target = focused && targets.includes(focused) ? focused : (selected ?? targets[0]);
      setRovingTarget(targets, target);
    });

    const handleFocusCapture = (event: React.FocusEvent<HTMLUListElement>) => {
      onFocusCapture?.(event);
      const targets = getListTargets(event.currentTarget, mode);
      const focusedTarget = targets.find((target) => target === event.target || target.contains(event.target as Node));
      if (focusedTarget) setRovingTarget(targets, focusedTarget);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLUListElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || mode === 'static') return;

      const targets = getListTargets(event.currentTarget, mode);
      const currentIndex = targets.findIndex(
        (target) => target === event.target || target.contains(event.target as Node),
      );
      if (currentIndex < 0) return;

      if (isSelectionMode(mode) && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        targets[currentIndex].click();
        return;
      }

      const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
      let nextIndex: number | undefined;
      if (event.key === 'ArrowDown') nextIndex = currentIndex + 1;
      else if (event.key === 'ArrowUp') nextIndex = currentIndex - 1;
      else if (event.key === 'ArrowRight') nextIndex = currentIndex + (rtl ? -1 : 1);
      else if (event.key === 'ArrowLeft') nextIndex = currentIndex + (rtl ? 1 : -1);
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = targets.length - 1;
      else return;

      event.preventDefault();
      const wrappedIndex = ((nextIndex % targets.length) + targets.length) % targets.length;
      const nextTarget = targets[wrappedIndex];
      setRovingTarget(targets, nextTarget);
      nextTarget.focus();
    };

    const itemContext = React.useMemo<ListContextValue>(
      () => ({ mode, selectedValues, selectValue }),
      [mode, selectValue, selectedValues],
    );
    const itemPositions = React.useMemo<ListItemPosition[]>(
      () =>
        items.map((item, index) => ({
          index,
          count: items.length,
          itemKey: item.key,
        })),
      [items],
    );

    const listProps = rest as Omit<React.ComponentProps<'ul'>, 'defaultValue' | 'onChange'>;
    let itemIndex = 0;

    return (
      <ListContext.Provider value={itemContext}>
        {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: selection mode dynamically supplies the valid listbox role. */}
        <ul
          {...listProps}
          ref={setRootRef}
          className={cx('md-list', className)}
          data-appearance={appearance}
          data-density={density}
          data-measure={measure}
          data-mode={mode}
          role={selectionMode ? 'listbox' : listProps.role}
          aria-multiselectable={isMulti || undefined}
          aria-required={selectionMode ? required : undefined}
          onFocusCapture={handleFocusCapture}
          onKeyDown={handleKeyDown}
        >
          {React.Children.toArray(children).map((child) => {
            if (!isListItemElement(child)) return child;
            const position = itemIndex;
            itemIndex += 1;
            return (
              <ListItemPositionContext.Provider key={child.key} value={itemPositions[position]}>
                {child}
              </ListItemPositionContext.Provider>
            );
          })}
        </ul>
      </ListContext.Provider>
    );
  },
);
List.displayName = 'List';

const ListItem = React.forwardRef<HTMLLIElement, React.PropsWithoutRef<ListItemProps>>(
  (
    {
      value,
      headline,
      overline,
      supportingText,
      leading,
      trailing,
      lineCount: lineCountProp,
      href,
      target,
      rel,
      download,
      type = 'button',
      onClick,
      disabled = false,
      dragged = false,
      selectionIndicator,
      selectionIndicatorPosition = 'trailing',
      className,
      ...props
    },
    ref,
  ) => {
    const context = React.useContext(ListContext);
    const position = React.useContext(ListItemPositionContext);
    const headlineId = React.useId();
    const supportingId = React.useId();
    const mode = context?.mode ?? 'static';
    const selectionMode = isSelectionMode(mode);
    const actionMode = isActionMode(mode);
    const selected = value !== undefined && context?.selectedValues.has(value) === true;
    const lineCount = lineCountProp ?? (overline && supportingText ? 3 : overline || supportingText ? 2 : 1);
    const indicator = selectionIndicator ?? (mode === 'single-select' ? 'radio' : 'checkbox');
    const labelledBy = supportingText ? `${headlineId} ${supportingId}` : headlineId;
    const itemKey = position?.itemKey ?? value ?? headlineId;

    React.useEffect(() => {
      /* v8 ignore else -- production-only warning guard */
      if (import.meta.env.DEV) {
        if (selectionMode && value === undefined) {
          console.warn('[m3you] ListItem requires a stable `value` inside a selection List.');
        }
        if (selectionMode && (href !== undefined || onClick !== undefined)) {
          console.warn('[m3you] Selection ListItem actions are ignored; selection is the item interaction.');
        }
        if (mode === 'static' && (href !== undefined || onClick !== undefined)) {
          console.warn('[m3you] Static ListItem actions are ignored. Use an action List mode.');
        }
        if (actionMode && href === undefined && onClick === undefined) {
          console.warn('[m3you] Action ListItem requires either `href` or `onClick`.');
        }
        if ((mode === 'single-action' || mode === 'single-select') && containsInteractiveNode(trailing)) {
          console.warn('[m3you] Nested trailing controls require `mode="multi-action"`.');
        }
      }
    }, [actionMode, href, mode, onClick, selectionMode, trailing, value]);

    const selectionMark = selectionMode ? (
      <span className="md-list-item__selection" aria-hidden="true">
        {renderSelectionIndicator(indicator, selected)}
      </span>
    ) : null;

    const content = (includeTrailing: boolean) => (
      <>
        {selectionIndicatorPosition === 'leading' ? selectionMark : null}
        {leading ? <span className="md-list-item__leading">{leading}</span> : null}
        <span className="md-list-item__content">
          {overline ? <span className="md-list-item__overline">{overline}</span> : null}
          <span id={headlineId} className="md-list-item__headline">
            {headline}
          </span>
          {supportingText ? (
            <span id={supportingId} className="md-list-item__supporting-text">
              {supportingText}
            </span>
          ) : null}
        </span>
        {includeTrailing && trailing ? <span className="md-list-item__trailing">{trailing}</span> : null}
        {selectionIndicatorPosition === 'trailing' ? selectionMark : null}
      </>
    );

    const handleSelectionClick = (event: React.MouseEvent<HTMLLIElement>) => {
      if (disabled || value === undefined) return;
      const interactiveTarget = (event.target as Element).closest(INTERACTIVE_SELECTOR);
      if (interactiveTarget && interactiveTarget !== event.currentTarget) return;
      event.currentTarget.focus();
      context?.selectValue(value);
    };

    const renderPrimaryAction = (includeTrailing: boolean) => {
      if (href !== undefined) {
        const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        };
        return (
          <a
            className="md-list-item__action"
            data-md-list-action=""
            href={disabled ? undefined : href}
            target={target}
            rel={rel}
            download={download}
            aria-labelledby={labelledBy}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : 0}
            onClick={handleLinkClick}
          >
            <Ripple />
            {content(includeTrailing)}
          </a>
        );
      }

      if (onClick) {
        return (
          <button
            className="md-list-item__action"
            data-md-list-action=""
            type={type}
            disabled={disabled}
            aria-labelledby={labelledBy}
            onClick={onClick}
          >
            <Ripple />
            {content(includeTrailing)}
          </button>
        );
      }

      return <div className="md-list-item__layout">{content(includeTrailing)}</div>;
    };

    if (selectionMode) {
      return (
        // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation is delegated to the parent listbox.
        <li
          {...props}
          ref={ref}
          className={cx('md-list-item', className)}
          data-md-list-item=""
          data-item-key={itemKey}
          data-list-value={value}
          data-lines={lineCount}
          data-selected={selected || undefined}
          data-disabled={disabled || undefined}
          data-dragged={dragged || undefined}
          // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: ARIA listboxes require option children, and li preserves list semantics.
          role="option"
          aria-selected={selected}
          aria-disabled={disabled || undefined}
          aria-labelledby={labelledBy}
          aria-posinset={(position?.index ?? 0) + 1}
          aria-setsize={position?.count ?? 1}
          tabIndex={disabled ? undefined : 0}
          onClick={handleSelectionClick}
        >
          <Ripple />
          <div className="md-list-item__layout">{content(true)}</div>
        </li>
      );
    }

    return (
      <li
        {...props}
        ref={ref}
        className={cx('md-list-item', className)}
        data-md-list-item=""
        data-item-key={itemKey}
        data-list-value={value}
        data-lines={lineCount}
        data-disabled={disabled || undefined}
        data-dragged={dragged || undefined}
        aria-disabled={disabled || undefined}
      >
        {actionMode ? (
          mode === 'multi-action' ? (
            <div className="md-list-item__multi-layout">
              {renderPrimaryAction(false)}
              {trailing ? <span className="md-list-item__trailing">{trailing}</span> : null}
            </div>
          ) : (
            renderPrimaryAction(true)
          )
        ) : (
          <div className="md-list-item__layout">{content(true)}</div>
        )}
      </li>
    );
  },
);
ListItem.displayName = 'ListItem';

const ListDivider = React.forwardRef<HTMLLIElement, React.PropsWithoutRef<ListDividerProps>>(
  ({ inset = false, className, ...props }, ref) => (
    <li
      {...props}
      ref={ref}
      className={cx('md-list-divider', className)}
      data-inset={inset || undefined}
      role="presentation"
      aria-hidden="true"
    >
      <span className="md-list-divider__line" />
    </li>
  ),
);
ListDivider.displayName = 'ListDivider';

const ListItemAccordion = React.forwardRef<HTMLLIElement, React.PropsWithoutRef<ListItemAccordionProps>>(
  (
    {
      headline,
      overline,
      supportingText,
      leading,
      trailing,
      children,
      expanded: expandedProp,
      defaultExpanded = false,
      onExpandedChange,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
    const controlled = expandedProp !== undefined;
    const expanded = controlled ? expandedProp : internalExpanded;
    const buttonId = React.useId();
    const panelId = React.useId();
    const lineCount = overline && supportingText ? 3 : overline || supportingText ? 2 : 1;

    const updateExpanded = () => {
      /* v8 ignore next -- React never fires onClick on a disabled button */
      if (disabled) return;
      const next = !expanded;
      if (!controlled) setInternalExpanded(next);
      onExpandedChange?.(next);
    };

    return (
      <li
        {...props}
        ref={ref}
        className={cx('md-list-item md-list-item-accordion', className)}
        data-lines={lineCount}
        data-expanded={expanded || undefined}
        data-disabled={disabled || undefined}
      >
        <button
          id={buttonId}
          type="button"
          className="md-list-item__action md-list-item-accordion__trigger"
          aria-expanded={expanded}
          aria-controls={panelId}
          disabled={disabled}
          onClick={updateExpanded}
        >
          <Ripple disabled={disabled} />
          {leading ? <span className="md-list-item__leading">{leading}</span> : null}
          <span className="md-list-item__content">
            {overline ? <span className="md-list-item__overline">{overline}</span> : null}
            <span className="md-list-item__headline">{headline}</span>
            {supportingText ? <span className="md-list-item__supporting-text">{supportingText}</span> : null}
          </span>
          {trailing ? <span className="md-list-item__trailing">{trailing}</span> : null}
          <ChevronDown className="md-list-item-accordion__icon" aria-hidden="true" />
        </button>
        <section id={panelId} aria-labelledby={buttonId} className="md-list-item-accordion__panel" hidden={!expanded}>
          {children}
        </section>
      </li>
    );
  },
);
ListItemAccordion.displayName = 'ListItemAccordion';

const SWIPE_REVEAL_PX = 72;
const SWIPE_THRESHOLD_PX = 48;

function renderSwipeAction(action: React.ReactNode, side: Exclude<ListItemSwipeSide, null>, close: () => void) {
  if (!action) return null;
  if (React.isValidElement<React.ComponentProps<'button'>>(action) && action.type === 'button') {
    const actionProps = action.props;
    return React.cloneElement(action, {
      className: cx('md-list-item-swipe__action', `md-list-item-swipe__action--${side}`, actionProps.className),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        actionProps.onClick?.(event);
        if (!event.defaultPrevented) close();
      },
    });
  }
  return (
    <button
      type="button"
      className={cx('md-list-item-swipe__action', `md-list-item-swipe__action--${side}`)}
      onClick={close}
    >
      {action}
    </button>
  );
}

const ListItemSwipe = React.forwardRef<HTMLLIElement, React.PropsWithoutRef<ListItemSwipeProps>>(
  (
    {
      revealedSide: revealedSideProp,
      defaultRevealedSide = null,
      onRevealedSideChange,
      startAction,
      endAction,
      children,
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const controlled = revealedSideProp !== undefined;
    const [internalSide, setInternalSide] = React.useState<ListItemSwipeSide>(defaultRevealedSide);
    const [dragOffset, setDragOffset] = React.useState<number | null>(null);
    const dragRef = React.useRef<{ pointerId: number; startX: number; initialOffset: number } | null>(null);
    const revealedSide = controlled ? revealedSideProp : internalSide;
    const restingOffset = revealedSide === 'start' ? SWIPE_REVEAL_PX : revealedSide === 'end' ? -SWIPE_REVEAL_PX : 0;
    const currentOffset = dragOffset ?? restingOffset;

    const updateSide = React.useCallback(
      (next: ListItemSwipeSide) => {
        if (!controlled) setInternalSide(next);
        onRevealedSideChange?.(next);
      },
      [controlled, onRevealedSideChange],
    );

    const close = React.useCallback(() => updateSide(null), [updateSide]);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || (event.target as Element).closest(INTERACTIVE_SELECTOR)) return;
      dragRef.current = { pointerId: event.pointerId, startX: event.clientX, initialOffset: restingOffset };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const next = Math.max(
        -SWIPE_REVEAL_PX,
        Math.min(SWIPE_REVEAL_PX, drag.initialOffset + event.clientX - drag.startX),
      );
      setDragOffset(next);
    };

    const finishPointer = (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      const finalOffset = dragOffset ?? drag.initialOffset;
      dragRef.current = null;
      setDragOffset(null);
      event.currentTarget.releasePointerCapture?.(event.pointerId);
      if (finalOffset >= SWIPE_THRESHOLD_PX && startAction) updateSide('start');
      else if (finalOffset <= -SWIPE_THRESHOLD_PX && endAction) updateSide('end');
      else updateSide(null);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented && event.key === 'Escape' && revealedSide !== null) {
        event.preventDefault();
        close();
      }
    };

    return (
      <li
        {...props}
        ref={ref}
        className={cx('md-list-item-swipe', className)}
        data-revealed-side={revealedSide ?? undefined}
        data-dragging={dragOffset !== null || undefined}
        onKeyDown={handleKeyDown}
        style={{ ...props.style, '--md-list-swipe-offset': `${currentOffset}px` } as React.CSSProperties}
      >
        <div className="md-list-item-swipe__actions md-list-item-swipe__actions--start">
          {renderSwipeAction(startAction, 'start', close)}
        </div>
        <div className="md-list-item-swipe__actions md-list-item-swipe__actions--end">
          {renderSwipeAction(endAction, 'end', close)}
        </div>
        <div
          className="md-list-item-swipe__surface"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
        >
          {children}
        </div>
      </li>
    );
  },
);
ListItemSwipe.displayName = 'ListItemSwipe';

export { List, ListDivider, ListItem, ListItemAccordion, ListItemSwipe };
