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
  return (
    <NavigationBarContext.Provider value={{ value, onValueChange, orientation }}>
      <nav
        ref={ref}
        aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Main navigation')}
        data-orientation={orientation}
        className={cx('md-navigation-bar', className)}
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

const NavigationBarItem = ({
  className,
  value,
  icon,
  activeIcon,
  label,
  badge,
  hideInactiveLabel = false,
  disabled,
  ref,
  ...props
}: NavigationBarItemProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { value: selectedValue, onValueChange, orientation } = useNavigationBar();
  const isActive = selectedValue === value;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onValueChange?.(value);
    }
    props.onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      onValueChange?.(value);
    }
    props.onKeyDown?.(e);
  };

  const showLabel = !hideInactiveLabel || isActive;

  // Icon with opacity transition between outline and filled
  const renderIcon = () => {
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

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
      disabled={disabled}
      data-active={isActive ? 'true' : undefined}
      data-orientation={orientation}
      className={cx('md-navigation-bar-item', className)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
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
                {renderIcon()}
                {/* Badge - positioned relative to icon */}
                {badge && <span className="md-navigation-bar-item__badge">{badge}</span>}
              </span>
            </span>
          </span>
          {/* Label */}
          <span className="md-navigation-bar-item__label" data-hidden={!showLabel ? 'true' : undefined}>
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
            {renderIcon()}
            {/* Badge - positioned on icon */}
            {badge && <span className="md-navigation-bar-item__badge--horizontal">{badge}</span>}
          </span>
          {/* Label */}
          <span className="md-navigation-bar-item__label--horizontal" data-hidden={!showLabel ? 'true' : undefined}>
            {label}
          </span>
        </>
      )}
    </button>
  );
};
NavigationBarItem.displayName = 'NavigationBarItem';

export { NavigationBar, NavigationBarItem };
