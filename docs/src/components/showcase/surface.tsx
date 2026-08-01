import { createContext, type ReactNode, use } from 'react';

/**
 * The element a demo app should portal its overlays into.
 *
 * An overlay opened inside the phone frame must stay inside the phone frame.
 * Both hosts establish a containing block for fixed-position descendants via a
 * transform, so a portal into either lands in the right place.
 *
 * Dialog, BottomSheet, SideSheet, Menu and Tooltip all accept `portalProps`, so
 * `usePortalProps()` below works for any of them.
 */
const SurfaceContext = createContext<HTMLElement | null>(null);

export function SurfaceProvider({ element, children }: { element: HTMLElement | null; children: ReactNode }) {
  return <SurfaceContext value={element}>{children}</SurfaceContext>;
}

/** @returns the app's own surface, or `null` to fall back to `document.body`. */
export function useSurface(): HTMLElement | null {
  return use(SurfaceContext);
}

/**
 * Props to spread onto any overlay content component — `DialogContent`,
 * `BottomSheetContent`, `SideSheetContent`, `MenuContent`, `TooltipContent` —
 * so it renders inside the app surface rather than at the page root.
 */
export function usePortalProps() {
  const surface = useSurface();
  return surface ? { portalProps: { container: surface } } : {};
}

/** @deprecated Use {@link usePortalProps}; it applies to every overlay, not just dialogs. */
export const useDialogPortalProps = usePortalProps;
