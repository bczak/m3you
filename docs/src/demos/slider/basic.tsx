import { Volume2 } from 'lucide-react';
import { Slider } from 'm3you';
import { useState } from 'react';

export default function SliderBasic() {
  const [value, setValue] = useState(40);

  return (
    <div style={{ display: 'grid', gap: '2rem', width: '100%', maxWidth: '24rem' }}>
      <Slider value={value} onValueChange={setValue} showTooltip />
      <Slider defaultValue={60} step={10} showTooltip formatTooltip={(v) => `${v}%`} />
      <Slider defaultValue={30} icon={<Volume2 size={16} aria-hidden="true" />} />
    </div>
  );
}
