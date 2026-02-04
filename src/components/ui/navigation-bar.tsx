import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

/* =============================================================================
   NavigationBar - Container component
   ============================================================================= */

const navigationBarVariants = cva(
  'fixed bottom-0 left-0 right-0 z-50 flex h-20 w-full items-end justify-around bg-surface-container px-2 pb-4 pt-3',
  {
    variants: {
      elevation: {
        flat: '',
        elevated: 'shadow-md',
      },
    },
    defaultVariants: {
      elevation: 'flat',
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
  ({ className, elevation, value, onValueChange, children, ...props }, ref) => {
    return (
      <NavigationBarContext.Provider value={{ value, onValueChange }}>
        <nav
          ref={ref}
          aria-label={props['aria-label'] || 'Main navigation'}
          className={cn(navigationBarVariants({ elevation, className }))}
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
  'relative flex min-w-16 max-w-24 flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg bg-transparent text-surface-variant-foreground outline-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      active: {
        true: 'text-primary',
        false: 'hover:text-foreground',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

const navigationBarIndicatorVariants = cva(
  'absolute top-0 left-1/2 flex h-8 w-16 -translate-x-1/2 items-center justify-center rounded-full transition-all duration-200 ease-out',
  {
    variants: {
      active: {
        true: 'scale-100 bg-secondary-container opacity-100',
        false: 'scale-75 bg-transparent opacity-0',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export type NavigationBarItemProps = Omit<React.ComponentProps<'button'>, 'value'> &
  Omit<VariantProps<typeof navigationBarItemVariants>, 'active'> & {
    /** Unique value for this item */
    value: string;
    /** Icon to display */
    icon: React.ReactNode;
    /** Active icon variant (optional, uses icon if not provided) */
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
    const { value: selectedValue, onValueChange } = useNavigationBar();
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

    const displayedIcon = isActive && activeIcon ? activeIcon : icon;
    const showLabel = !hideInactiveLabel || isActive;

    return (
      <button
        ref={ref}
        type="button"
        aria-current={isActive ? 'page' : undefined}
        aria-label={label}
        disabled={disabled}
        className={cn(navigationBarItemVariants({ active: isActive, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Active indicator with ripple */}
        <span className={cn(navigationBarIndicatorVariants({ active: isActive }))}>
          <Ripple />
        </span>

        {/* Icon container */}
        <span className="relative z-10 flex items-center justify-center">
          {displayedIcon}
          {/* Badge */}
          {badge && (
            <span className="absolute -top-1 left-3 z-20 flex min-w-4 items-center justify-center">{badge}</span>
          )}
        </span>

        {/* Label */}
        <span
          className={cn(
            'z-10 font-medium text-xs leading-none transition-opacity duration-200',
            showLabel ? 'opacity-100' : 'h-0 opacity-0',
          )}
        >
          {label}
        </span>
      </button>
    );
  },
);
NavigationBarItem.displayName = 'NavigationBarItem';

export {
  NavigationBar,
  navigationBarVariants,
  NavigationBarItem,
  navigationBarItemVariants,
  navigationBarIndicatorVariants,
};
