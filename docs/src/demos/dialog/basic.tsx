import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from 'm3you';

export default function DialogBasic() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="filled">Open dialog</Button>} />
      <DialogContent>
        <DialogTitle>Reset settings?</DialogTitle>
        <DialogBody>
          <DialogDescription>
            This will restore every preference to its default value. It cannot be undone.
          </DialogDescription>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="text">Cancel</Button>} />
          <DialogClose render={<Button variant="filled">Reset</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
