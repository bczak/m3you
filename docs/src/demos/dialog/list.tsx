import { PlusIcon, UserIcon } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  List,
  ListItem,
} from 'm3you';
import type { CSSProperties } from 'react';

// A list paints its rows `surface` by default; let them take the dialog's surface.
const listStyle = { '--md-list-item-container-color': 'transparent' } as CSSProperties;

export default function DialogList() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="tonal">Set backup account</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set backup account</DialogTitle>
        </DialogHeader>
        <DialogDescription>Choose the account your photos and settings are backed up to.</DialogDescription>
        <DialogBody bleed>
          <List appearance="standard" style={listStyle}>
            <ListItem headline="leevillanuevanotes@google.com" leading={<UserIcon aria-hidden="true" />} />
            <ListItem headline="alloalejandro@google.com" leading={<UserIcon aria-hidden="true" />} />
            <ListItem headline="Add account" leading={<PlusIcon aria-hidden="true" />} />
          </List>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="text">OK</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
