import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from 'm3you';

export default function DialogBasic() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="filled">Open dialog</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset settings?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This will restore every preference to its default value. It cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="filled">Reset</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
