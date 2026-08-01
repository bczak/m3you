import { Button, SnackbarHost, snackbar } from 'm3you';

export default function SnackbarApi() {
  return (
    <>
      <Button variant="filled" onClick={() => snackbar('Message sent')}>
        Show snackbar
      </Button>
      <Button
        variant="tonal"
        onClick={() =>
          snackbar({ message: 'Conversation archived', actionLabel: 'Undo', onAction: () => snackbar('Restored') })
        }
      >
        With an action
      </Button>
      <SnackbarHost />
    </>
  );
}
