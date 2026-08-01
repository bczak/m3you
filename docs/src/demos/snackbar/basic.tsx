import { Snackbar } from 'm3you';

export default function SnackbarBasic() {
  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '26rem' }}>
      <Snackbar message="Single-line message" />
      <Snackbar message="Message archived" actionLabel="Undo" />
      <Snackbar
        layout="twoLine"
        message="Your changes were saved, but two attachments could not be uploaded."
        actionLabel="Retry"
        closable
      />
    </div>
  );
}
