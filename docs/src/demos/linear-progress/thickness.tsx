import { LinearProgress } from 'm3you';

export default function LinearProgressThickness() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '24rem' }}>
      <LinearProgress value={54} thickness={4} />
      <LinearProgress value={54} thickness={8} />
      <LinearProgress value={54} variant="wavy" thickness={4} />
      <LinearProgress value={54} variant="wavy" thickness={8} />
    </div>
  );
}
