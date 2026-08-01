import { CircularProgress } from 'm3you';

export default function CircularProgressWavy() {
  return (
    <>
      <CircularProgress variant="wavy" value={45} size="sm" />
      <CircularProgress variant="wavy" value={45} size="md" />
      <CircularProgress variant="wavy" value={45} size="lg" />
    </>
  );
}
