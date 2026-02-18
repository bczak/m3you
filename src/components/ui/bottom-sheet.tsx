import { DrawerPreview as DrawerPrimitive } from '@base-ui/react/drawer';
import * as React from 'react';

import { cn } from '../../lib/utils';

// =============================================================================
// BottomSheet (Root)
// =============================================================================

export interface BottomSheetProps extends Omit<DrawerPrimitive.Root.Props, 'swipeDirection'> {
  /** Whether the bottom sheet is modal (with scrim) or standard (no scrim).
   * @default true
   */
  modal?: boolean | 'trap-focus';
}

const BottomSheetContext = React.createContext<{ isModal: boolean }>({ isModal: true });

function BottomSheet({ modal = true, children, ...props }: BottomSheetProps) {
  const isModal = modal !== false;
  return (
    <BottomSheetContext.Provider value={{ isModal }}>
      <DrawerPrimitive.Root data-slot="bottom-sheet" modal={modal} swipeDirection="down" {...props}>
        {children}
      </DrawerPrimitive.Root>
    </BottomSheetContext.Provider>
  );
}

// =============================================================================
// BottomSheetTrigger
// =============================================================================

function BottomSheetTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="bottom-sheet-trigger" {...props} />;
}

// =============================================================================
// BottomSheetClose
// =============================================================================

function BottomSheetClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="bottom-sheet-close" {...props} />;
}

// =============================================================================
// BottomSheetContent (Portal + Backdrop + Viewport + Popup)
// Viewport is required — it provides all swipe/drag logic to the Popup.
// =============================================================================

export interface BottomSheetContentProps extends DrawerPrimitive.Popup.Props {
  /** Whether to show the drag handle at the top.
   * @default true
   */
  showDragHandle?: boolean;
}

function BottomSheetContent({ className, children, showDragHandle = true, ...props }: BottomSheetContentProps) {
  const { isModal } = React.useContext(BottomSheetContext);

  return (
    <DrawerPrimitive.Portal>
      {isModal && (
        <DrawerPrimitive.Backdrop
          data-slot="bottom-sheet-backdrop"
          className={cn(
            'fixed inset-0 z-50 bg-scrim/32 transition-opacity duration-200',
            'data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
          )}
        />
      )}
      <DrawerPrimitive.Viewport data-slot="bottom-sheet-viewport" className="fixed inset-0 z-50">
        <DrawerPrimitive.Popup
          data-slot="bottom-sheet-content"
          className={cn(
            'absolute right-0 bottom-0 left-0 mx-auto flex max-w-[640px] flex-col rounded-t-[28px] bg-surface-container-low outline-none',
            'mt-[72px] sm:mx-14 sm:mt-14',
            className,
          )}
          {...props}
        >
          {showDragHandle && (
            <div data-slot="bottom-sheet-drag-handle" className="flex justify-center pt-[22px] pb-[22px]">
              <div className="h-1 w-8 rounded-full bg-surface-variant-foreground/40" />
            </div>
          )}
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

// =============================================================================
// BottomSheetBody
// =============================================================================

function BottomSheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="bottom-sheet-body" className={cn('flex-1 overflow-y-auto px-6 pb-6', className)} {...props} />;
}

export { BottomSheet, BottomSheetBody, BottomSheetClose, BottomSheetContent, BottomSheetTrigger };
