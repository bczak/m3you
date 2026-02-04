import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

/* =============================================================================
   NavigationBar - Container component
   ============================================================================= */

const navigationBarVariants = cva(
  'fixed bottom-0 left-0 right-0 z-50 flex w-full items-end justify-around bg-surface-container px-2',
  {
    variants: {
      elevation: {
        flat: '',
        elevated: 'shadow-md',
      },
      /** Item orientation within the navigation bar */
      orientation: {
        /** Icon above label (default) */
        vertical: 'h-20 pb-4 pt-3',
        /** Icon and label side by side */
        horizontal: 'h-16 py-3',
      },
    },
    defaultVariants: {
      elevation: 'flat',
      orientation: 'vertical',
    },
  },
);

export type NavigationBarProps = React.ComponentProps<'nav'> &
  VariantProps<typeof navigationBarVariants> & {
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

const NavigationBar = React.forwardRef<HTMLElement, NavigationBarProps>(
  ({ className, elevation, orientation = 'vertical', value, onValueChange, children, ...props }, ref) => {
    const resolvedOrientation = orientation ?? 'vertical';
    return (
      <NavigationBarContext.Provider value={{ value, onValueChange, orientation: resolvedOrientation }}>
        <nav
          ref={ref}
          aria-label={props['aria-label'] || 'Main navigation'}
          className={cn(navigationBarVariants({ elevation, orientation, className }))}
          {...props}
        >
          {children}
        </nav>
      </NavigationBarContext.Provider>
    );
  },
);
NavigationBar.displayName = 'NavigationBar';

/* =============================================================================
   NavigationBarItem - Individual navigation item
   ============================================================================= */

const navigationBarItemVariants = cva(
  'relative flex min-w-16 cursor-pointer items-center justify-center gap-1 bg-transparent text-surface-variant-foreground outline-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      active: {
        true: 'text-primary',
        false: 'hover:text-foreground',
      },
      orientation: {
        vertical: 'max-w-24 flex-1 flex-col',
        horizontal: 'flex-row gap-2 px-4 py-2',
      },
    },
    defaultVariants: {
      active: false,
      orientation: 'vertical',
    },
  },
);

export type NavigationBarItemProps = Omit<React.ComponentProps<'button'>, 'value'> &
  Omit<VariantProps<typeof navigationBarItemVariants>, 'active' | 'orientation'> & {
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

const NavigationBarItem = React.forwardRef<HTMLButtonElement, NavigationBarItemProps>(
  ({ className, value, icon, activeIcon, label, badge, hideInactiveLabel = false, disabled, ...props }, ref) => {
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
        e.preventDefault();
        onValueChange?.(value);
      }
      props.onKeyDown?.(e);
    };

    const showLabel = !hideInactiveLabel || isActive;

    // Icon with opacity transition between outline and filled
    const renderIcon = () => {
      if (!activeIcon) {
        // No activeIcon provided, just show the icon
        return icon;
      }

      // Stack both icons and transition opacity
      return (
        <span className="relative">
          {/* Outline icon - visible when inactive */}
          <span className={cn('transition-opacity duration-200', isActive ? 'opacity-0' : 'opacity-100')}>{icon}</span>
          {/* Filled icon - visible when active */}
          <span
            className={cn('absolute inset-0 transition-opacity duration-200', isActive ? 'opacity-100' : 'opacity-0')}
          >
            {activeIcon}
          </span>
        </span>
      );
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
        disabled={disabled}
        className={cn(navigationBarItemVariants({ active: isActive, orientation, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {orientation === 'vertical' ? (
          <>
            {/* Vertical: Icon with indicator behind it only */}
            <span className="relative flex items-center justify-center">
              {/* Active indicator - expands from center */}
              <span
                className={cn(
                  'absolute flex h-8 w-16 items-center justify-center rounded-full transition-transform duration-200 ease-out',
                  isActive ? 'scale-x-100 bg-secondary-container' : 'scale-x-0 bg-secondary-container',
                )}
              >
                <Ripple />
              </span>
              {/* Icon container with badge */}
              <span className="relative z-10 flex h-8 items-center justify-center px-5">
                <span className="relative">
                  {renderIcon()}
                  {/* Badge - positioned relative to icon */}
                  {badge && (
                    <span className="absolute -top-2 -right-2 z-20 flex min-w-4 items-center justify-center">
                      {badge}
                    </span>
                  )}
                </span>
              </span>
            </span>
            {/* Label */}
            <span
              className={cn(
                'z-10 mt-1 font-medium text-xs leading-none transition-opacity duration-200',
                showLabel ? 'opacity-100' : 'h-0 opacity-0',
              )}
            >
              {label}
            </span>
          </>
        ) : (
          <>
            {/* Horizontal: Indicator behind both icon and label - expands from center */}
            <span
              className={cn(
                'absolute inset-0 flex items-center justify-center rounded-full transition-transform duration-200 ease-out',
                isActive ? 'scale-x-100 bg-secondary-container' : 'scale-x-0 bg-secondary-container',
              )}
            >
              <Ripple />
            </span>
            {/* Icon with badge */}
            <span className="relative z-10 flex items-center justify-center">
              {renderIcon()}
              {/* Badge - positioned on icon */}
              {badge && (
                <span className="absolute -top-1.5 -right-1.5 z-20 flex min-w-4 items-center justify-center">
                  {badge}
                </span>
              )}
            </span>
            {/* Label */}
            <span
              className={cn(
                'z-10 font-medium text-sm leading-none transition-opacity duration-200',
                showLabel ? 'opacity-100' : 'w-0 opacity-0',
              )}
            >
              {label}
            </span>
          </>
        )}
      </button>
    );
  },
);
NavigationBarItem.displayName = 'NavigationBarItem';

export { NavigationBar, navigationBarVariants, NavigationBarItem, navigationBarItemVariants };
