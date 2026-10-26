import { BottomSheet, BottomSheetBody, BottomSheetContent, BottomSheetTrigger, Button } from 'm3you';
import { useId } from 'react';

const rows = Array.from({ length: 20 }, (_, index) => `Place ${index + 1}`);

export default function BottomSheetSnapPoints() {
  const titleId = useId();

  return (
    <BottomSheet snapPoints={[0.3, 0.6, 1]} defaultSnapPoint={0.3}>
      <BottomSheetTrigger render={<Button variant="filled">Open with snap points</Button>} />
      <BottomSheetContent aria-labelledby={titleId}>
        <BottomSheetBody>
          <h2 id={titleId} style={{ margin: '0 0 0.25rem' }}>
            Nearby
          </h2>
          <p style={{ margin: '0 0 1rem', opacity: 0.75 }}>
            Opens at 30% of the screen. Drag the handle up to 60% or full height, or down to dismiss.
          </p>
          {rows.map((row) => (
            <div
              key={row}
              style={{ padding: '0.875rem 0', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}
            >
              {row}
            </div>
          ))}
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}
