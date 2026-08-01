import {
  Button,
  FullScreenDialog,
  FullScreenDialogBody,
  FullScreenDialogClose,
  FullScreenDialogContent,
  FullScreenDialogHeader,
  FullScreenDialogTrigger,
  TextField,
} from 'm3you';

export default function DialogFullScreen() {
  return (
    <FullScreenDialog>
      <FullScreenDialogTrigger render={<Button variant="tonal">Open full screen</Button>} />
      <FullScreenDialogContent>
        <FullScreenDialogHeader action={<FullScreenDialogClose render={<Button variant="text">Save</Button>} />}>
          New contact
        </FullScreenDialogHeader>
        <FullScreenDialogBody>
          <div style={{ display: 'grid', gap: '1.25rem', padding: '1.5rem' }}>
            <TextField label="Name" variant="outlined" />
            <TextField label="Phone" variant="outlined" type="tel" />
            <TextField label="Email" variant="outlined" type="email" />
          </div>
        </FullScreenDialogBody>
      </FullScreenDialogContent>
    </FullScreenDialog>
  );
}
