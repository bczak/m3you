import { cva, type VariantProps } from 'class-variance-authority';
import { Ripple } from 'm3-ripple';
import * as React from 'react';

import { cn } from '../../lib/utils';

/* =============================================================================
   NavigationRail - Container component (sidebar)
   Material Design 3 Navigation Rail with collapsed/expanded states
   ============================================================================= */

const navigationRailVariants = cva('flex h-full flex-col bg-surface-container transition-all duration-300 ease-out', {
  variants: {
    /** Rail state - collapsed (narrow) or expanded (wide) */
    state: {
      collapsed: 'w-20',
      expanded: 'w-72',
    },
    /** Modality when expanded - standard (inline) or modal (overlay) */
    modality: {
      standard: '',
      modal: '',
    },
    /** Position style */
    position: {
      fixed: 'fixed left-0 top-0 z-50',
      relative: 'relative',
    },
  },
  compoundVariants: [
    {
      state: 'expanded',
      modality: 'modal',
      className: 'shadow-xl',
    },
  ],
  defaultVariants: {
    state: 'collapsed',
    modality: 'standard',
    position: 'fixed',
  },
});

export type NavigationRailProps = React.ComponentProps<'nav'> &
  VariantProps<typeof navigationRailVariants> & {
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
    /** Footer content (bottom of rail) */
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

  return (
    <NavigationRailContext.Provider value={{ value, onValueChange, state: resolvedState, onStateChange }}>
      {/* Modal backdrop */}
      {state === 'expanded' && modality === 'modal' && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default border-none bg-scrim/50 transition-opacity duration-300"
          onClick={() => onStateChange?.('collapsed')}
          onKeyDown={(e) => e.key === 'Escape' && onStateChange?.('collapsed')}
          tabIndex={-1}
          aria-label="Close navigation"
        />
      )}
      <nav
        ref={ref}
        aria-label={props['aria-label'] ?? (props['aria-labelledby'] ? undefined : 'Main navigation')}
        className={cn(navigationRailVariants({ state, modality, position, className }))}
        {...props}
      >
        {/* Header section: Menu button */}
        {menu && <div className="flex shrink-0 justify-start px-3 pt-4">{menu}</div>}

        {/* FAB section */}
        {fab && <div className="flex shrink-0 justify-start px-3 py-3">{fab}</div>}

        {/* Navigation items */}
        <div className={cn('flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2', 'items-stretch')}>{children}</div>

        {/* Footer section */}
        {footer && (
          <div className={cn('shrink-0 border-outline-variant border-t px-3 py-3', state === 'expanded' && 'px-4')}>
            {footer}
          </div>
        )}
      </nav>
    </NavigationRailContext.Provider>
  );
};
NavigationRail.displayName = 'NavigationRail';

/* =============================================================================
   NavigationRailItem - Individual navigation item
   Collapsed: vertical layout (icon above label)
   Expanded: horizontal layout (icon + label side by side)
   ============================================================================= */

const navigationRailItemVariants = cva(
  'relative flex cursor-pointer items-center bg-transparent outline-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0',
  {
    variants: {
      active: {
        true: '',
        false: '',
      },
      state: {
        collapsed: 'w-14 flex-col justify-center gap-1 py-1',
        expanded: 'h-14 w-full flex-row gap-3 rounded-full px-4',
      },
    },
    compoundVariants: [
      // Active states - text color changes to secondary (per M3 guidelines)
      {
        active: true,
        className: 'text-secondary',
      },
      {
        active: false,
        state: 'collapsed',
        className: 'text-surface-variant-foreground hover:text-foreground',
      },
      {
        active: false,
        state: 'expanded',
        className: 'text-surface-variant-foreground',
      },
    ],
    defaultVariants: {
      active: false,
      state: 'collapsed',
    },
  },
);

export type NavigationRailItemProps = Omit<React.ComponentProps<'button'>, 'value'> &
  Omit<VariantProps<typeof navigationRailItemVariants>, 'active' | 'state'> & {
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

const NavigationRailItem = ({
  className,
  value,
  icon,
  activeIcon,
  label,
  badge,
  disabled,
  ref,
  ...props
}: NavigationRailItemProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { value: selectedValue, onValueChange, state } = useNavigationRail();
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

  // Icon with opacity transition between outline and filled
  const renderIcon = () => {
    if (!activeIcon) {
      return icon;
    }

    return (
      <span className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        <span className={cn('transition-opacity duration-200', isActive ? 'opacity-0' : 'opacity-100')}>{icon}</span>
        <span className={cn('transition-opacity duration-200', isActive ? 'opacity-100' : 'opacity-0')}>
          {activeIcon}
        </span>
      </span>
    );
  };

  if (state === 'collapsed') {
    // Collapsed: Vertical layout - icon above label
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        aria-current={isActive ? 'page' : undefined}
        disabled={disabled}
        className={cn(navigationRailItemVariants({ active: isActive, state, className }))}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Icon container with indicator */}
        <span className="relative flex items-center justify-center">
          {/* Active indicator - pill shape behind icon */}
          <span
            className={cn(
              'absolute flex h-8 w-14 items-center justify-center rounded-full bg-secondary-container transition-all duration-200 ease-out',
              isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
            )}
          >
            <Ripple />
          </span>
          {/* Icon with badge */}
          <span className="relative z-10 flex h-8 items-center justify-center">
            <span className="relative">
              {renderIcon()}
              {badge && (
                <span className="absolute -top-2 -right-2 z-20 flex min-w-4 items-center justify-center">{badge}</span>
              )}
            </span>
          </span>
        </span>
        {/* Label */}
        <span className="z-10 font-medium text-xs leading-none">{label}</span>
      </button>
    );
  }

  // Expanded: Horizontal layout - icon + label side by side
  return (
    <button
      ref={ref}
      type="button"
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      disabled={disabled}
      className={cn(navigationRailItemVariants({ active: isActive, state, className }))}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Active indicator - full item background */}
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center rounded-full bg-secondary-container transition-all duration-200 ease-out',
          isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0',
        )}
      >
        <Ripple />
      </span>
      {/* Icon with badge */}
      <span className="relative z-10 flex items-center justify-center">
        {renderIcon()}
        {badge && (
          <span className="absolute -top-1.5 -right-1.5 z-20 flex min-w-4 items-center justify-center">{badge}</span>
        )}
      </span>
      {/* Label */}
      <span className="z-10 flex-1 text-left font-medium text-sm leading-none">{label}</span>
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
    <div ref={ref} className={cn('flex flex-col gap-1', className)} {...props}>
      {/* Section header - only visible when expanded */}
      {title && state === 'expanded' && (
        <div className="px-4 py-2">
          <span className="font-medium text-surface-variant-foreground text-xs uppercase tracking-wider">{title}</span>
        </div>
      )}
      {/* Divider for collapsed state */}
      {title && state === 'collapsed' && <div className="my-2 h-px w-8 bg-outline-variant" />}
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
  ref,
  ...props
}: NavigationRailMenuButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
  const { state, onStateChange } = useNavigationRail();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onStateChange?.(state === 'collapsed' ? 'expanded' : 'collapsed');
    props.onClick?.(e);
  };

  const icon = state === 'collapsed' ? collapsedIcon : expandedIcon;

  return (
    <button
      ref={ref}
      type="button"
      aria-label={state === 'collapsed' ? 'Expand navigation' : 'Collapse navigation'}
      aria-expanded={state === 'expanded'}
      className={cn(
        'relative flex size-12 items-center justify-center rounded-full text-surface-variant-foreground outline-none transition-colors hover:bg-surface-container-high hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:size-6',
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <Ripple />
      {icon || children}
    </button>
  );
};
NavigationRailMenuButton.displayName = 'NavigationRailMenuButton';

export {
  NavigationRail,
  navigationRailVariants,
  NavigationRailItem,
  navigationRailItemVariants,
  NavigationRailSection,
  NavigationRailMenuButton,
  useNavigationRail,
};
