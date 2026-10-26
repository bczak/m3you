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
      <Snackbar
        layout="longerAction"
        message="This item will be deleted in 5 days. Restore it from the bin before then."
        actionLabel="Learn more"
      />
    </div>
  );
}
