import { Code2, Moon, RotateCcw, Sun } from 'lucide-react';
import { Chip, Slider, Switch, TextField } from 'm3you';
import { type ReactNode, useId, useMemo, useState } from 'react';
import { CodeBlock } from './code-block';
import { type Control, type ControlShorthand, type ControlValue, initialValues, normaliseControls } from './controls';
import { type JsxValue, jsx } from './jsx';

export type PlaygroundProps = {
  /** Component name as it appears in the generated snippet. */
  name: string;
  /** Controls in shorthand form — see `controls.ts`. */
  controls: Record<string, ControlShorthand>;
  /** Renders the live component from the current control values. */
  render: (props: Record<string, ControlValue>) => ReactNode;
  /**
   * Children to include in the generated snippet. Pass the same text the
   * `render` function uses so the code matches what is on screen.
   */
  snippetChildren?: string;
  /** Overrides the generated snippet entirely, for compound components. */
  code?: (props: Record<string, ControlValue>) => string;
  /** Vertical space reserved for the stage, so switching controls cannot jump the page. */
  minHeight?: number;
};

/**
 * The interactive header of every component page: the component on an M3
 * surface, a panel of controls, and the code for the current configuration.
 *
 * The controls are themselves built from m3you — chips, switches and sliders —
 * so the page is always demonstrating the library twice over.
 */
export function Playground({
  name,
  controls: shorthand,
  render,
  snippetChildren,
  code,
  minHeight = 200,
}: PlaygroundProps) {
  const controls = useMemo(() => normaliseControls(shorthand), [shorthand]);
  const defaults = useMemo(() => initialValues(controls), [controls]);
  const [values, setValues] = useState(defaults);
  const [showCode, setShowCode] = useState(false);
  const [dark, setDark] = useState(false);

  const isModified = controls.some((control) => values[control.name] !== control.initial);

  const snippet = code
    ? code(values)
    : jsx(name, values as Record<string, JsxValue>, {
        defaults: defaults as Record<string, JsxValue>,
        children: snippetChildren,
      });

  const set = (control: string, value: ControlValue) => setValues((current) => ({ ...current, [control]: value }));

  return (
    <div className="m3-playground" data-modified={isModified || undefined}>
      <div className="m3-playground__main">
        <div
          className="m3-playground__stage"
          data-theme={dark ? 'dark' : 'light'}
          style={{ minHeight, colorScheme: dark ? 'dark' : 'light' }}
        >
          <div className="m3-playground__stage-inner">{render(values)}</div>
        </div>

        <div className="m3-playground__panel">
          <div className="m3-playground__panel-head">
            <span className="m3-playground__panel-title">Props</span>
            <div className="m3-playground__panel-actions">
              <button
                type="button"
                className="m3-playground__ghost"
                onClick={() => setDark((value) => !value)}
                aria-pressed={dark}
                title={dark ? 'Preview in light mode' : 'Preview in dark mode'}
              >
                {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
              </button>
              <button
                type="button"
                className="m3-playground__ghost"
                onClick={() => setValues(defaults)}
                disabled={!isModified}
                title="Reset props"
              >
                <RotateCcw size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="m3-playground__controls">
            {controls.map((control) => (
              <ControlRow key={control.name} control={control} value={values[control.name]} onChange={set} />
            ))}
          </div>
        </div>
      </div>

      <div className="m3-playground__code">
        <button type="button" className="m3-playground__code-toggle" onClick={() => setShowCode((value) => !value)}>
          <Code2 size={16} aria-hidden="true" />
          {showCode ? 'Hide code' : 'Show code'}
        </button>
        {showCode ? <CodeBlock code={snippet} /> : null}
      </div>
    </div>
  );
}

function ControlRow({
  control,
  value,
  onChange,
}: {
  control: Control;
  value: ControlValue;
  onChange: (name: string, value: ControlValue) => void;
}) {
  const id = useId();

  if (control.kind === 'boolean') {
    return (
      <div className="m3-control m3-control--inline">
        <label className="m3-control__label" htmlFor={id}>
          {control.name}
        </label>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(checked) => onChange(control.name, checked)} />
      </div>
    );
  }

  if (control.kind === 'enum') {
    return (
      <div className="m3-control">
        <span className="m3-control__label">{control.name}</span>
        <div className="m3-control__chips">
          {control.options.map((option) => (
            <Chip key={option} type="filter" selected={value === option} onClick={() => onChange(control.name, option)}>
              {option}
            </Chip>
          ))}
        </div>
      </div>
    );
  }

  if (control.kind === 'number') {
    return (
      <div className="m3-control">
        <span className="m3-control__label">
          {control.name}
          <span className="m3-control__value">{value}</span>
        </span>
        <Slider
          min={control.min}
          max={control.max}
          step={control.step}
          value={Number(value)}
          onValueChange={(next) => onChange(control.name, Array.isArray(next) ? next[0] : next)}
        />
      </div>
    );
  }

  return (
    <div className="m3-control">
      <TextField
        label={control.name}
        variant="outlined"
        value={String(value)}
        onValueChange={(next) => onChange(control.name, next)}
      />
    </div>
  );
}
