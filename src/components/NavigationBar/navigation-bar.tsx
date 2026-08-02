import './navigation-bar.css';
import * as React from 'react';

import { cx } from '../../lib/cx';

/* =============================================================================
   NavigationBar - Container component
   ============================================================================= */

export type NavigationBarProps = React.ComponentProps<'nav'> & {
  /** Item orientation within the navigation bar */
  orientation?: 'vertical' | 'horizontal';
  /** Currently active item value */
  value?: string;
  /** Callback when active item changes */
  onValueChange?: (value: string) => void;
};

interface NavigationBarContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  orientation: 'vertical' | 'horizontal';
}

const NavigationBarContext = React.createContext<NavigationBarContextValue | null>(null);

const useNavigationBar = () => {
  const context = React.useContext(NavigationBarContext);
  if (!context) {
    throw new Error('NavigationBarItem must be used within a NavigationBar');
  }
  return context;
};

const NavigationBar = ({
  className,
  orientation = 'vertical',
  value,
  onValueChange,
  children,
  ref,
  ...props
}: NavigationBarProps & { ref?: React.Ref<HTMLElement> }) => {
  const contextValue = React.useMemo(
    () => ({ value, onValueChange, orientation }),
    [value, onValueChange, orientation],
  );
  return (
    <NavigationBarContext.Provider value={contextValue}>
      <nav
        ref={ref}
        aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Main navigation')}
        data-orientation={orientation}
        className={cx('md-navigation-bar fixed bottom-0 flex h-20', className)}
        {...props}
      >
        {children}
      </nav>
    </NavigationBarContext.Provider>
  );
};
NavigationBar.displayName = 'NavigationBar';

/* =============================================================================
   NavigationBarItem - Individual navigation item
   ============================================================================= */

export type NavigationBarItemProps = Omit<React.ComponentProps<'button'>, 'value'> & {
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
  /** Whether to show label only when active (M3 expressive) */
  hideInactiveLabel?: boolean;
};

type NavigationBarItemIconProps = {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  isActive: boolean;
};

const NavigationBarItemIcon = ({ icon, activeIcon, isActive }: NavigationBarItemIconProps) => {
  if (!activeIcon) {
    return <span className="md-navigation-bar-item__icon-glyph">{icon}</span>;
  }

  return (
    <span className="md-navigation-bar-item__icon-glyph">
      <span className="md-navigation-bar-item__icon-toggle">
        <span className="md-navigation-bar-item__icon-fade" style={{ opacity: isActive ? 0 : 1 }}>
          {icon}
        </span>
        <span className="md-navigation-bar-item__icon-fade" style={{ opacity: isActive ? 1 : 0 }}>
          {activeIcon}
        </span>
      </span>
    </span>
  );
};

const NavigationBarItem = ({
  className,
  value,
  icon,
  activeIcon,
  label,
  badge,
  hideInactiveLabel = false,
  disabled,
  onClick,
  onKeyDown,
  ref,
  ...props
}: NavigationBarItemProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { value: selectedValue, onValueChange, orientation } = useNavigationBar();
  const isActive = selectedValue === value;

  const selectNavigationItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    /* v8 ignore next -- React never fires onClick on a disabled button */
    if (!disabled) {
      onValueChange?.(value);
    }
    onClick?.(e);
  };

  const showLabel = !hideInactiveLabel || isActive;

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      disabled={disabled}
      data-active={isActive ? 'true' : undefined}
      data-orientation={orientation}
      className={cx(
        'md-navigation-bar-item flex items-center focus-visible:ring-2 focus-visible:ring-ring',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
        isActive && 'text-primary',
        className,
      )}
      onClick={selectNavigationItem}
      onKeyDown={onKeyDown}
      {...props}
    >
      {orientation === 'vertical' ? (
        <>
          {/* Vertical: Icon with indicator behind it only */}
          <span className="md-navigation-bar-item__icon-container">
            {/* Active indicator - expands from center */}
            <span className="md-navigation-bar-item__indicator" data-active={isActive ? 'true' : undefined} />
            <span className="md-navigation-bar-item__state-layer" />
            {/* Icon container with badge */}
            <span className="md-navigation-bar-item__icon-inner">
              <span className="md-navigation-bar-item__icon-relative">
                <NavigationBarItemIcon icon={icon} activeIcon={activeIcon} isActive={isActive} />
                {/* Badge - positioned relative to icon */}
                {badge && <span className="md-navigation-bar-item__badge">{badge}</span>}
              </span>
            </span>
          </span>
          {/* Label */}
          <span
            className={cx('md-navigation-bar-item__label', showLabel ? 'opacity-100' : 'opacity-0')}
            data-hidden={!showLabel ? 'true' : undefined}
          >
            {label}
          </span>
        </>
      ) : (
        <>
          {/* Horizontal: Indicator behind both icon and label - expands from center */}
          <span className="md-navigation-bar-item__indicator--horizontal" data-active={isActive ? 'true' : undefined} />
          <span className="md-navigation-bar-item__state-layer--horizontal" />
          {/* Icon with badge */}
          <span className="md-navigation-bar-item__icon--horizontal">
            <NavigationBarItemIcon icon={icon} activeIcon={activeIcon} isActive={isActive} />
            {/* Badge - positioned on icon */}
            {badge && <span className="md-navigation-bar-item__badge--horizontal">{badge}</span>}
          </span>
          {/* Label */}
          <span
            className={cx('md-navigation-bar-item__label--horizontal', showLabel ? 'opacity-100' : 'opacity-0')}
            data-hidden={!showLabel ? 'true' : undefined}
          >
            {label}
          </span>
        </>
      )}
    </button>
  );
};
NavigationBarItem.displayName = 'NavigationBarItem';

export { NavigationBar, NavigationBarItem };
