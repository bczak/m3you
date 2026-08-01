import { Palette } from 'lucide-react';
import { useId } from 'react';
import { SEED_PRESETS, useSeed } from '@/lib/theme';

/**
 * Header control that re-tints the entire site — chrome included — from a seed
 * colour, exactly as `applyM3Theme()` does in a consuming app.
 */
export function SeedPicker() {
  const { seed, setSeed } = useSeed();
  const inputId = useId();

  return (
    <div className="m3-seed">
      <Palette size={16} aria-hidden="true" className="m3-seed__icon" />
      {/* A fieldset rather than role="group" — the native element carries the
          grouping semantics without an ARIA override. */}
      <fieldset className="m3-seed__swatches">
        <legend className="sr-only">Seed colour</legend>
        {SEED_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            className="m3-seed__swatch"
            style={{ backgroundColor: preset.value }}
            aria-label={preset.name}
            aria-pressed={seed.toLowerCase() === preset.value.toLowerCase()}
            data-selected={seed.toLowerCase() === preset.value.toLowerCase() || undefined}
            onClick={() => setSeed(preset.value)}
          />
        ))}
      </fieldset>
      <label className="m3-seed__custom" htmlFor={inputId}>
        <span className="sr-only">Custom seed colour</span>
        <input
          id={inputId}
          type="color"
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
          aria-label="Custom seed colour"
        />
      </label>
    </div>
  );
}
