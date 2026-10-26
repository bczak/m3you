import { CircularProgress } from 'm3you';

export default function CircularProgressThickness() {
  return (
    <>
      <CircularProgress value={64} thickness={4} />
      <CircularProgress value={64} thickness={8} />
      <CircularProgress value={64} variant="wavy" thickness={4} />
      <CircularProgress value={64} variant="wavy" thickness={8} />
    </>
  );
}
