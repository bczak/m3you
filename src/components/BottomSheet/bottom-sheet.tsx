import './bottom-sheet.css';
import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import * as React from 'react';

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
  const contextValue = React.useMemo(() => ({ isModal }), [isModal]);
  return (
    <BottomSheetContext.Provider value={contextValue}>
      <DrawerPrimitive.Root data-slot="bottom-sheet" modal={modal} swipeDirection="down" {...props}>
        {children}
      </DrawerPrimitive.Root>
    </BottomSheetContext.Provider>
  );
}

// =============================================================================
// BottomSheetTrigger
// =============================================================================

// Base UI's Trigger.Props narrows its own ref to HTMLButtonElement, so take
// that rather than the wider HTMLElement the exotic component advertises.
const BottomSheetTrigger = React.forwardRef<HTMLButtonElement, React.PropsWithoutRef<DrawerPrimitive.Trigger.Props>>(
  ({ ...props }, ref) => <DrawerPrimitive.Trigger data-slot="bottom-sheet-trigger" ref={ref} {...props} />,
);
BottomSheetTrigger.displayName = 'BottomSheetTrigger';

// =============================================================================
// BottomSheetClose
// =============================================================================

const BottomSheetClose = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Close>,
  React.PropsWithoutRef<DrawerPrimitive.Close.Props>
>(({ ...props }, ref) => <DrawerPrimitive.Close data-slot="bottom-sheet-close" ref={ref} {...props} />);
BottomSheetClose.displayName = 'BottomSheetClose';

// =============================================================================
// BottomSheetContent (Portal + Backdrop + Viewport + Popup)
// Viewport is required — it provides all swipe/drag logic to the Popup.
// =============================================================================

export interface BottomSheetContentProps extends DrawerPrimitive.Popup.Props {
  /** Whether to show the drag handle at the top.
   * @default true
   */
  showDragHandle?: boolean;
  /**
   * Forwarded to the underlying portal. Pass `{ container }` to render the sheet
   * inside a specific element instead of `document.body` — useful when the sheet
   * belongs to a bounded surface such as a device frame or an embedded preview.
   */
  portalProps?: Omit<DrawerPrimitive.Portal.Props, 'children'>;
}

const BottomSheetContent = React.forwardRef<
  React.ComponentRef<typeof DrawerPrimitive.Popup>,
  React.PropsWithoutRef<BottomSheetContentProps>
>(({ className, children, showDragHandle = true, portalProps, ...props }, ref) => {
  const { isModal } = React.useContext(BottomSheetContext);

  return (
    <DrawerPrimitive.Portal {...portalProps}>
      {isModal && <DrawerPrimitive.Backdrop data-slot="bottom-sheet-backdrop" className="md-bottom-sheet-backdrop" />}
      <DrawerPrimitive.Viewport data-slot="bottom-sheet-viewport" className="md-bottom-sheet-viewport">
        <DrawerPrimitive.Popup
          data-slot="bottom-sheet-content"
          ref={ref}
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
});
BottomSheetContent.displayName = 'BottomSheetContent';

// =============================================================================
// BottomSheetBody
// =============================================================================

const BottomSheetBody = React.forwardRef<HTMLDivElement, React.PropsWithoutRef<React.ComponentProps<'div'>>>(
  ({ className, ...props }, ref) => (
    <div data-slot="bottom-sheet-body" ref={ref} className={cx('md-bottom-sheet-body', className)} {...props} />
  ),
);
BottomSheetBody.displayName = 'BottomSheetBody';

export { BottomSheet, BottomSheetBody, BottomSheetClose, BottomSheetContent, BottomSheetTrigger };
