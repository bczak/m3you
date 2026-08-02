import './tabs.css';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cx } from '../../lib/cx';

/* =============================================================================
   Tabs - Container component (role="tablist")
   ============================================================================= */

export type TabsProps = React.ComponentProps<'div'> & {
  /** `primary` sits directly under an app bar; `secondary` sits inside a section that already has primary tabs. */
  variant?: 'primary' | 'secondary';
  /** Whether tabs stretch to fill available width or size to content */
  fullWidth?: boolean;
  /** Currently active tab value */
  value?: string;
  /** Callback when active tab changes */
  onValueChange?: (value: string) => void;
};

interface TabsContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  variant: 'primary' | 'secondary';
  fullWidth: boolean;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tab must be used within a Tabs component');
  }
  return context;
};

const Tabs = ({
  className,
  variant = 'primary',
  fullWidth = true,
  value,
  onValueChange,
  children,
  ref,
  ...props
}: TabsProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const contextValue = React.useMemo(
    () => ({ value, onValueChange, variant, fullWidth }),
    [value, onValueChange, variant, fullWidth],
  );
  return (
    <TabsContext.Provider value={contextValue}>
      <div
        ref={ref}
        role="tablist"
        aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Tabs')}
        className={cx('md-tabs', className)}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};
Tabs.displayName = 'Tabs';

/* =============================================================================
   Tab - Individual tab button (role="tab")
   ============================================================================= */

export type TabProps = Omit<React.ComponentProps<'button'>, 'value'> & {
  /** Unique value for this tab */
  value: string;
  /** Icon to display. Primary tabs show it above the label; secondary tabs support icon-only usage. */
  icon?: React.ReactNode;
  /** Optional badge content (positioned on the icon) */
  badge?: React.ReactNode;
};

const Tab = ({
  className,
  value,
  icon,
  badge,
  disabled,
  children,
  onClick,
  onKeyDown,
  ref,
  ...props
}: TabProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { value: selectedValue, onValueChange, variant, fullWidth } = useTabs();
  const isActive = selectedValue === value;
  const hasLabel = React.Children.count(children) > 0;
  const hasIcon = !!icon && (variant === 'primary' || !hasLabel);

  const selectTab = (e: React.MouseEvent<HTMLButtonElement>) => {
    /* v8 ignore next -- React never fires onClick on a disabled button */
    if (!disabled) {
      onValueChange?.(value);
    }
    onClick?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const tablist = e.currentTarget.closest('[role="tablist"]');
    if (!tablist) {
      onKeyDown?.(e);
      return;
    }

    const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'));
    const currentIndex = tabs.indexOf(e.currentTarget);

    let newIndex = -1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      newIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = tabs.length - 1;
    }

    if (newIndex >= 0) {
      tabs[newIndex].focus();
      const newValue = tabs[newIndex].getAttribute('data-value');
      if (newValue) {
        onValueChange?.(newValue);
      }
    }

    onKeyDown?.(e);
  };

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-variant={variant}
      data-active={String(isActive)}
      data-has-badge={String(!!badge)}
      data-has-icon={String(hasIcon)}
      data-full-width={String(fullWidth)}
      className={cx('md-tab', className)}
      onClick={selectTab}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <Ripple />

      {/* Icon is always shown for primary tabs and for secondary icon-only tabs. */}
      {hasIcon && (
        <span className="md-tab__icon">
          {icon}
          {badge && <span className="md-tab__badge">{badge}</span>}
        </span>
      )}

      {/* Label */}
      {(hasLabel || (!hasIcon && badge)) && (
        <span className="md-tab__label">
          {children}
          {!hasIcon && badge && <span className="md-tab__badge--label">{badge}</span>}
        </span>
      )}

      {/* Active indicator */}
      <span className="md-tab__indicator" data-variant={variant} data-active={String(isActive)} />
    </button>
  );
};
Tab.displayName = 'Tab';

export { Tab, Tabs };
