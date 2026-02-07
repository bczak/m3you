import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

/* =============================================================================
   Tabs - Container component (role="tablist")
   ============================================================================= */

const tabsVariants = cva('relative flex w-full border-b border-outline-variant', {
  variants: {
    variant: {
      primary: '',
      secondary: '',
    },
    /** Whether tabs stretch to fill available width or size to content */
    fullWidth: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    fullWidth: true,
  },
});

export type TabsProps = React.ComponentProps<'div'> &
  VariantProps<typeof tabsVariants> & {
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

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, variant = 'primary', fullWidth = true, value, onValueChange, children, ...props }, ref) => {
    const resolvedVariant = variant ?? 'primary';
    const resolvedFullWidth = fullWidth ?? true;

    return (
      <TabsContext.Provider value={{ value, onValueChange, variant: resolvedVariant, fullWidth: resolvedFullWidth }}>
        <div
          ref={ref}
          role="tablist"
          aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Tabs')}
          className={cn(tabsVariants({ variant, fullWidth, className }))}
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

const tabVariants = cva(
  'group relative inline-flex cursor-pointer items-center justify-center bg-transparent text-surface-variant-foreground outline-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[0.38] [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'flex-col gap-0.5 px-4',
        secondary: 'px-6',
      },
      active: {
        true: '',
        false: '',
      },
      hasIcon: {
        true: '',
        false: '',
      },
      fullWidth: {
        true: 'flex-1',
        false: '',
      },
    },
    compoundVariants: [
      // Primary tab heights: 48dp text-only, 64dp with icon
      { variant: 'primary', hasIcon: false, class: 'h-12' },
      { variant: 'primary', hasIcon: true, class: 'h-16' },
      // Secondary tabs are always 48dp
      { variant: 'secondary', class: 'h-12' },
      // Active primary tab: primary color for icon and label
      { variant: 'primary', active: true, class: 'text-primary' },
      // Inactive primary tab: on-surface-variant color
      { variant: 'primary', active: false, class: 'text-surface-variant-foreground hover:text-foreground' },
      // Active secondary tab: on-surface color
      { variant: 'secondary', active: true, class: 'text-foreground' },
      // Inactive secondary tab: on-surface-variant
      { variant: 'secondary', active: false, class: 'text-surface-variant-foreground hover:text-foreground' },
    ],
    defaultVariants: {
      variant: 'primary',
      active: false,
      hasIcon: false,
      fullWidth: true,
    },
  },
);

export type TabProps = Omit<React.ComponentProps<'button'>, 'value'> &
  Omit<VariantProps<typeof tabVariants>, 'active' | 'variant' | 'hasIcon' | 'fullWidth'> & {
    /** Unique value for this tab */
    value: string;
    /** Icon to display (primary tabs only - shown above label) */
    icon?: React.ReactNode;
    /** Optional badge content (positioned on the icon) */
    badge?: React.ReactNode;
  };

const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, value, icon, badge, disabled, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange, variant, fullWidth } = useTabs();
    const isActive = selectedValue === value;
    const hasIcon = !!icon;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onValueChange?.(value);
      }
      props.onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      const tablist = e.currentTarget.closest('[role="tablist"]');
      if (!tablist) return;

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

      props.onKeyDown?.(e);
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
        className={cn(tabVariants({ variant, active: isActive, hasIcon, fullWidth, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <Ripple />

        {/* Primary tab with icon */}
        {variant === 'primary' && icon && (
          <span className="relative flex items-center justify-center">
            {icon}
            {badge && (
              <span className="absolute -top-1 -right-1.5 z-10 flex min-w-4 items-center justify-center">{badge}</span>
            )}
          </span>
        )}

        {/* Label */}
        <span className="relative font-medium text-sm leading-tight tracking-wider">
          {children}
          {/* Badge on label when no icon (primary) or secondary */}
          {!icon && badge && (
            <span className="absolute -top-2 -right-4 z-10 flex min-w-4 items-center justify-center">{badge}</span>
          )}
        </span>

        {/* Active indicator */}
        <span
          className={cn(
            'absolute bottom-0 h-[3px] rounded-t-sm transition-all duration-200',
            variant === 'primary'
              ? isActive
                ? 'left-1/2 w-1/2 -translate-x-1/2 bg-primary'
                : 'left-1/2 w-0 -translate-x-1/2 bg-transparent'
              : isActive
                ? 'inset-x-0 bg-primary'
                : 'inset-x-0 bg-transparent',
          )}
        />
      </button>
    );
  },
);
Tab.displayName = 'Tab';

export { Tabs, tabsVariants, Tab, tabVariants };
