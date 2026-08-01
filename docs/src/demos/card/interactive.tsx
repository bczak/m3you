import { Card } from 'm3you';
import { useState } from 'react';

export default function CardInteractive() {
  const [clicks, setClicks] = useState(0);

  return (
    <Card
      variant="filled"
      ripple
      onClick={() => setClicks((value) => value + 1)}
      style={{ padding: '1.25rem', width: '16rem', cursor: 'pointer' }}
    >
      <strong>Clickable card</strong>
      <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', opacity: 0.75 }}>
        Clicked {clicks} {clicks === 1 ? 'time' : 'times'}.
      </p>
    </Card>
  );
}
