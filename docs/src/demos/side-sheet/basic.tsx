import {
  Button,
  SideSheet,
  SideSheetBody,
  SideSheetClose,
  SideSheetContent,
  SideSheetFooter,
  SideSheetHeader,
  SideSheetTrigger,
} from 'm3you';

export default function SideSheetBasic() {
  return (
    <SideSheet>
      <SideSheetTrigger render={<Button variant="filled">Open side sheet</Button>} />
      <SideSheetContent>
        <SideSheetHeader>Filters</SideSheetHeader>
        <SideSheetBody>
          <p style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}>
            Side sheets hold supporting content beside the main view, and can stay open on wide screens.
          </p>
        </SideSheetBody>
        <SideSheetFooter>
          <SideSheetClose render={<Button variant="filled">Apply</Button>} />
          <SideSheetClose render={<Button variant="text">Cancel</Button>} />
        </SideSheetFooter>
      </SideSheetContent>
    </SideSheet>
  );
}
