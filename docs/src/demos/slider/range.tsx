import { RangeSlider } from 'm3you';
import { useState } from 'react';

export default function SliderRange() {
  const [value, setValue] = useState<[number, number]>([25, 75]);

  return (
    <div style={{ display: 'grid', gap: '1rem', width: '100%', maxWidth: '24rem' }}>
      <RangeSlider
        value={value}
        onValueChange={setValue}
        step={5}
        showTooltip
        lowerInputProps={{ 'aria-label': 'Minimum price' }}
        upperInputProps={{ 'aria-label': 'Maximum price' }}
      />
      <output aria-live="polite">
        {value[0]}–{value[1]}
      </output>
    </div>
  );
}
