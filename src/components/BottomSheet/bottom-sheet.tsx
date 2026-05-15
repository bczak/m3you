import './bottom-sheet.css';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import * as React from 'react';
import { use } from 'react';

import { cx } from '../../lib/cx';

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
  const { isModal } = use(BottomSheetContext);

  return (
    <DrawerPrimitive.Portal>
      {isModal && <DrawerPrimitive.Backdrop data-slot="bottom-sheet-backdrop" className="md-bottom-sheet-backdrop" />}
      <DrawerPrimitive.Viewport data-slot="bottom-sheet-viewport" className="md-bottom-sheet-viewport">
        <DrawerPrimitive.Popup
          data-slot="bottom-sheet-content"
          className={cx('md-bottom-sheet-content', className)}
          {...props}
        >
          {showDragHandle && (
            <div data-slot="bottom-sheet-drag-handle" className="md-bottom-sheet-drag-handle">
              <div className="md-bottom-sheet-drag-handle__indicator" />
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
  return <div data-slot="bottom-sheet-body" className={cx('md-bottom-sheet-body', className)} {...props} />;
}

export { BottomSheet, BottomSheetBody, BottomSheetClose, BottomSheetContent, BottomSheetTrigger };
