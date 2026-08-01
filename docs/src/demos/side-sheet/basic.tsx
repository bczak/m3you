import {
  Button,
  SideSheet,
  SideSheetBody,
  SideSheetClose,
  SideSheetContent,
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
          <p style={{ padding: '0 1.5rem', opacity: 0.75 }}>
            Side sheets hold supporting content beside the main view, and can stay open on wide screens.
          </p>
        </SideSheetBody>
        <SideSheetClose render={<Button variant="text">Close</Button>} />
      </SideSheetContent>
    </SideSheet>
  );
}
