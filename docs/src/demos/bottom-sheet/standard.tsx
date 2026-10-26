import { BottomSheet, BottomSheetBody, BottomSheetClose, BottomSheetContent, BottomSheetTrigger, Button } from 'm3you';
import { useId, useState } from 'react';

export default function BottomSheetStandard() {
  const [count, setCount] = useState(0);
  const titleId = useId();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
      {/* `disablePointerDismissal` keeps the sheet open while the page behind is used. */}
      <BottomSheet modal={false} disablePointerDismissal>
        <BottomSheetTrigger render={<Button variant="outlined">Open standard sheet</Button>} />
        <BottomSheetContent aria-labelledby={titleId}>
          <BottomSheetBody>
            <div style={{ display: 'grid', gap: '0.75rem', paddingBottom: '1rem' }}>
              <h2 id={titleId} style={{ margin: 0 }}>
                Now playing
              </h2>
              <p style={{ margin: 0, opacity: 0.75 }}>
                No scrim: the page behind stays usable while the sheet is open.
              </p>
              <BottomSheetClose render={<Button variant="tonal">Close</Button>} />
            </div>
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheet>
      <Button variant="text" onClick={() => setCount((value) => value + 1)}>
        Page button ({count})
      </Button>
    </div>
  );
}
