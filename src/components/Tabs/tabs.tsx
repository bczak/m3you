import './tabs.css';
import * as React from 'react';
import { useContext } from 'react';
import { cx } from '../../lib/cx';
import { M3Ripple as Ripple } from '../../lib/m3-ripple';

/* =============================================================================
   Tabs - Container component (role="tablist")
   ============================================================================= */

export type TabsProps = React.ComponentProps<'div'> & {
  /** `primary` sits directly under an app bar; `secondary` sits inside a section that already has primary tabs. */
  variant?: 'primary' | 'secondary';
  /**
   * Whether tabs stretch to fill available width (fixed) or size to content and scroll. Scrollable tabs are at
   * least 90px wide and the row starts 52px in from the leading edge.
   */
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
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab must be used within a Tabs component');
  }
  return context;
};

const Tabs = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<TabsProps>>(
  ({ className, variant = 'primary', fullWidth = true, value, onValueChange, children, ...props }, ref) => {
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
          data-full-width={String(fullWidth)}
          className={cx('md-tabs', className)}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
);
Tabs.displayName = 'Tabs';

/* =============================================================================
   Tab - Individual tab button (role="tab")
   ============================================================================= */

export type TabProps = Omit<React.ComponentProps<'button'>, 'value'> & {
  /** Unique value for this tab */
  value: string;
  /** Icon to display. Primary tabs show it above the label; secondary tabs show it before the label, or alone. */
  icon?: React.ReactNode;
  /**
   * Optional badge content. Overlays the icon's top-right corner on primary tabs and icon-only tabs; otherwise it
   * follows the label.
   */
  badge?: React.ReactNode;
};

const Tab = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<TabProps>>(
  ({ className, value, icon, badge, disabled, children, onClick, onKeyDown, ...props }, ref) => {
    const { value: selectedValue, onValueChange, variant, fullWidth } = useTabs();
    const isActive = selectedValue === value;
    // `Children.count` counts `false`/`null` from a conditional label (`{showLabel && 'Home'}`); `toArray` drops
    // them, and an empty string is no label either.
    const hasLabel = React.Children.toArray(children).some((child) => child !== '');
    const hasIcon = !!icon;
    const hasBadge = !!badge;
    // Primary tabs stack the icon over the label, so the badge sits on the icon. Secondary tabs lay the icon and
    // label out in a row, so the badge follows the label unless there is no label.
    const badgeOnIcon = hasIcon && (variant === 'primary' || !hasLabel);
    const indicator = <span className="md-tab__indicator" data-variant={variant} data-active={String(isActive)} />;

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
        data-has-badge={String(hasBadge)}
        data-has-icon={String(hasIcon)}
        data-has-label={String(hasLabel)}
        data-full-width={String(fullWidth)}
        className={cx('md-tab', className)}
        onClick={selectTab}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <Ripple />

        {/* Content hugs its width and fills the tab's height, so the primary indicator matches the content width
            and sits on the tab's bottom edge. */}
        <span className="md-tab__content">
          {hasIcon && (
            <span className="md-tab__icon">
              {icon}
              {badgeOnIcon && hasBadge && <span className="md-tab__badge">{badge}</span>}
            </span>
          )}

          {(hasLabel || (!hasIcon && hasBadge)) && (
            <span className="md-tab__label">
              {children}
              {!badgeOnIcon && hasBadge && <span className="md-tab__badge--label">{badge}</span>}
            </span>
          )}

          {variant === 'primary' && indicator}
        </span>

        {/* The secondary indicator spans the whole tab. */}
        {variant === 'secondary' && indicator}
      </button>
    );
  },
);
Tab.displayName = 'Tab';

export { Tab, Tabs };
