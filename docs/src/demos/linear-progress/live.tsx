import { Button, LinearProgress } from 'm3you';
import { useEffect, useRef, useState } from 'react';

export default function LinearProgressLive() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);
  const valueRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const nextValue = Math.min(valueRef.current + 2, 100);
      valueRef.current = nextValue;
      setValue(nextValue);
      if (nextValue === 100) setRunning(false);
    }, 60);
    return () => clearInterval(id);
  }, [running]);

  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '24rem', justifyItems: 'center' }}>
      <LinearProgress value={value} variant="wavy" />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="filled" onClick={() => setRunning(true)} disabled={running}>
          Start
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setRunning(false);
            valueRef.current = 0;
            setValue(0);
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
