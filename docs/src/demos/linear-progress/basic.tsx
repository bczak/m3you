import { LinearProgress } from 'm3you';

export default function LinearProgressBasic() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem', width: '100%', maxWidth: '24rem' }}>
      <LinearProgress value={35} />
      <LinearProgress value={35} variant="wavy" />
      <LinearProgress type="indeterminate" />
    </div>
  );
}
