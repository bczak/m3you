import { BottomSheet, BottomSheetBody, BottomSheetClose, BottomSheetContent, BottomSheetTrigger, Button } from 'm3you';

export default function BottomSheetBasic() {
  return (
    <BottomSheet>
      <BottomSheetTrigger render={<Button variant="filled">Open bottom sheet</Button>} />
      <BottomSheetContent>
        <BottomSheetBody>
          <div style={{ display: 'grid', gap: '0.75rem', padding: '0 1.5rem 2rem' }}>
            <h2 style={{ margin: 0 }}>Share</h2>
            <p style={{ margin: 0, opacity: 0.75 }}>
              Bottom sheets hold supplementary content anchored to the bottom edge. Drag the handle to dismiss.
            </p>
            <BottomSheetClose render={<Button variant="tonal">Close</Button>} />
          </div>
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  );
}
