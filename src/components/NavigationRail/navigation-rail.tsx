import './navigation-rail.css';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

/* =============================================================================
   NavigationRail - Container component (sidebar)
   Material Design 3 Navigation Rail with collapsed/expanded states
   ============================================================================= */

export type NavigationRailProps = React.ComponentProps<'nav'> & {
  /** Rail state - collapsed (narrow) or expanded (wide) */
  state?: 'collapsed' | 'expanded';
  /** Modality when expanded - standard (inline) or modal (overlay) */
  modality?: 'standard' | 'modal';
  /** Position style */
  position?: 'fixed' | 'relative';
  /** Vertical alignment for the navigation items area */
  itemsAlignment?: 'start' | 'center';
  /** Currently active item value */
  value?: string;
  /** Callback when active item changes */
  onValueChange?: (value: string) => void;
  /** Callback when rail state changes */
  onStateChange?: (state: 'collapsed' | 'expanded') => void;
  /** Menu button content (top of rail) */
  menu?: React.ReactNode;
  /** FAB content (below menu) */
  fab?: React.ReactNode;
  /** Footer content rendered after navigation items. */
  footer?: React.ReactNode;
};

interface NavigationRailContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  state: 'collapsed' | 'expanded';
  onStateChange?: (state: 'collapsed' | 'expanded') => void;
}

const NavigationRailContext = React.createContext<NavigationRailContextValue | null>(null);

const useNavigationRail = () => {
  const context = React.useContext(NavigationRailContext);
  if (!context) {
    throw new Error('NavigationRailItem must be used within a NavigationRail');
  }
  return context;
};

const NavigationRail = ({
  className,
  state = 'collapsed',
  modality = 'standard',
  position = 'fixed',
  itemsAlignment = 'start',
  value,
  onValueChange,
  onStateChange,
  menu,
  fab,
  footer,
  children,
  ref,
  ...props
}: NavigationRailProps & { ref?: React.Ref<HTMLElement> }) => {
  const resolvedState = state ?? 'collapsed';
  const contextValue = React.useMemo(
    () => ({ value, onValueChange, state: resolvedState, onStateChange }),
    [value, onValueChange, resolvedState, onStateChange],
  );

  return (
    <NavigationRailContext.Provider value={contextValue}>
      {/* Modal backdrop */}
      {state === 'expanded' && modality === 'modal' && (
        <button
          type="button"
          className="md-navigation-rail-backdrop"
          onClick={() => onStateChange?.('collapsed')}
          onKeyDown={(e) => e.key === 'Escape' && onStateChange?.('collapsed')}
          tabIndex={-1}
          aria-label="Close navigation"
        />
      )}
      <nav
        ref={ref}
        aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Main navigation')}
        data-state={state}
        data-modality={modality}
        data-position={position}
        className={cx('md-navigation-rail', state === 'expanded' ? 'w-72' : 'w-20', position, className)}
        {...props}
      >
        {/* Header section: Menu button */}
        {menu && <div className="md-navigation-rail__menu">{menu}</div>}

        {/* FAB section */}
        {fab && <div className="md-navigation-rail__fab">{fab}</div>}

        {/* Navigation items */}
        <div className="md-navigation-rail__items" data-items-alignment={itemsAlignment}>
          {children}
        </div>

        {footer && <div className="md-navigation-rail__footer">{footer}</div>}
      </nav>
    </NavigationRailContext.Provider>
  );
};
NavigationRail.displayName = 'NavigationRail';

/* =============================================================================
   NavigationRailItem - Individual navigation item
   Uses a single animated surface in both rail states
   Collapsed: active surface hugs the icon, label is hidden
   Expanded: same surface grows to fit icon + label
   ============================================================================= */

export type NavigationRailItemProps = Omit<React.ComponentProps<'button'>, 'value'> & {
  /** Unique value for this item */
  value: string;
  /** Icon to display (outline style for inactive state) */
  icon: React.ReactNode;
  /** Active icon variant (filled style for active state) */
  activeIcon?: React.ReactNode;
  /** Label text */
  label: string;
  /** Optional badge content */
  badge?: React.ReactNode;
};

type NavigationRailItemIconProps = {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  isActive: boolean;
};

const NavigationRailItemIcon = ({ icon, activeIcon, isActive }: NavigationRailItemIconProps) => {
  if (!activeIcon) {
    return <span className="md-navigation-rail-item__icon-glyph">{icon}</span>;
  }

  return (
    <span className="md-navigation-rail-item__icon-glyph">
      <span className="md-navigation-rail-item__icon-toggle">
        <span className="md-navigation-rail-item__icon-fade" style={{ opacity: isActive ? 0 : 1 }}>
          {icon}
        </span>
        <span className="md-navigation-rail-item__icon-fade" style={{ opacity: isActive ? 1 : 0 }}>
          {activeIcon}
        </span>
      </span>
    </span>
  );
};

const NavigationRailItem = ({
  className,
  value,
  icon,
  activeIcon,
  label,
  badge,
  disabled,
  onClick,
  onKeyDown,
  ref,
  ...props
}: NavigationRailItemProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { value: selectedValue, onValueChange, state } = useNavigationRail();
  const isActive = selectedValue === value;

  const selectRailItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    /* v8 ignore next -- React never fires onClick on a disabled button */
    if (!disabled) {
      onValueChange?.(value);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      disabled={disabled}
      data-active={isActive ? 'true' : undefined}
      data-state={state}
      className={cx(
        'md-navigation-rail-item focus-visible:ring-2 focus-visible:ring-ring',
        isActive ? 'text-secondary' : 'text-on-surface-variant',
        state === 'expanded' ? 'flex-row' : 'flex-col',
        className,
      )}
      onClick={selectRailItem}
      onKeyDown={onKeyDown}
      {...props}
    >
      <span className="md-navigation-rail-item__surface">
        <span className="md-navigation-rail-item__indicator" data-active={isActive ? 'true' : undefined} />
        <span className="md-navigation-rail-item__state-layer" />
        <Ripple />
        <span className="md-navigation-rail-item__content">
          <span className="md-navigation-rail-item__icon">
            <NavigationRailItemIcon icon={icon} activeIcon={activeIcon} isActive={isActive} />
            {badge && <span className="md-navigation-rail-item__badge">{badge}</span>}
          </span>
          <span className="md-navigation-rail-item__label">{label}</span>
        </span>
      </span>
    </button>
  );
};
NavigationRailItem.displayName = 'NavigationRailItem';

/* =============================================================================
   NavigationRailSection - Section header for grouping items
   ============================================================================= */

export type NavigationRailSectionProps = React.ComponentProps<'div'> & {
  /** Section title (only visible in expanded state) */
  title?: string;
};

const NavigationRailSection = ({
  className,
  title,
  children,
  ref,
  ...props
}: NavigationRailSectionProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { state } = useNavigationRail();
  return (
    <div ref={ref} className={cx('md-navigation-rail-section', className)} {...props}>
      {title && state === 'expanded' ? <span className="md-navigation-rail-section__title">{title}</span> : null}
      {children}
    </div>
  );
};
NavigationRailSection.displayName = 'NavigationRailSection';

/* =============================================================================
   NavigationRailMenuButton - Toggle button for rail state
   ============================================================================= */

export type NavigationRailMenuButtonProps = React.ComponentProps<'button'> & {
  /** Icon when rail is collapsed (menu icon) */
  collapsedIcon?: React.ReactNode;
  /** Icon when rail is expanded (close/back icon) */
  expandedIcon?: React.ReactNode;
};

const NavigationRailMenuButton = ({
  className,
  collapsedIcon,
  expandedIcon,
  children,
  onClick,
  ref,
  ...props
}: NavigationRailMenuButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { state, onStateChange } = useNavigationRail();

  const toggleRailState = (e: React.MouseEvent<HTMLButtonElement>) => {
    onStateChange?.(state === 'collapsed' ? 'expanded' : 'collapsed');
    onClick?.(e);
  };

  const hasAnimatedIcons = collapsedIcon != null && expandedIcon != null;
  const icon = state === 'collapsed' ? collapsedIcon : expandedIcon;

  return (
    <button
      ref={ref}
      type="button"
      aria-label={state === 'collapsed' ? 'Expand navigation' : 'Collapse navigation'}
      aria-expanded={state === 'expanded'}
      data-state={state}
      className={cx('md-navigation-rail-menu-button', className)}
      onClick={toggleRailState}
      {...props}
    >
      <Ripple />
      {hasAnimatedIcons ? (
        <span className="md-navigation-rail-menu-button__icon-toggle" aria-hidden="true">
          <span className="md-navigation-rail-menu-button__icon-slot" data-icon-state="collapsed">
            {collapsedIcon}
          </span>
          <span className="md-navigation-rail-menu-button__icon-slot" data-icon-state="expanded">
            {expandedIcon}
          </span>
        </span>
      ) : (
        icon || children
      )}
    </button>
  );
};
NavigationRailMenuButton.displayName = 'NavigationRailMenuButton';

export { NavigationRail, NavigationRailItem, NavigationRailMenuButton, NavigationRailSection, useNavigationRail };
