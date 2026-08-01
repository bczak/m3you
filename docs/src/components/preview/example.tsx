import { Code2 } from 'lucide-react';
import { type ComponentType, useState } from 'react';
import { CodeBlock } from './code-block';

/**
 * Every curated example is a real `.tsx` file under `src/demos/`, imported two
 * ways: once as a module to render, once as text to display.
 *
 * Keeping demos as compiled files rather than code strings means they are
 * type-checked and fail the build when a component's API changes — the docs
 * cannot quietly go stale.
 */
const modules = import.meta.glob<{ default: ComponentType }>('../../demos/**/*.tsx', { eager: true });
const sources = import.meta.glob<string>('../../demos/**/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function keyFor(name: string) {
  return `../../demos/${name}.tsx`;
}

export function demoExists(name: string) {
  return keyFor(name) in modules;
}

export type ExampleProps = {
  /** Path under `src/demos`, without extension — e.g. `button/variants`. */
  name: string;
  title?: string;
  description?: string;
  /** Lay the stage out as a column instead of centring a single element. */
  layout?: 'center' | 'stretch';
  /** Start with the source visible. */
  expanded?: boolean;
};

export function Example({ name, title, description, layout = 'center', expanded = false }: ExampleProps) {
  const [showCode, setShowCode] = useState(expanded);
  const key = keyFor(name);
  const Demo = modules[key]?.default;
  const source = sources[key];

  if (!Demo) {
    return (
      <div className="m3-example m3-example--missing">
        Missing demo <code>{name}</code> — expected <code>src/demos/{name}.tsx</code>.
      </div>
    );
  }

  return (
    <figure className="m3-example">
      {title || description ? (
        <figcaption className="m3-example__caption">
          {title ? <span className="m3-example__title">{title}</span> : null}
          {description ? <span className="m3-example__description">{description}</span> : null}
        </figcaption>
      ) : null}

      <div className="m3-example__stage" data-layout={layout}>
        <Demo />
      </div>

      <div className="m3-example__footer">
        <button type="button" className="m3-example__toggle" onClick={() => setShowCode((value) => !value)}>
          <Code2 size={15} aria-hidden="true" />
          {showCode ? 'Hide code' : 'Show code'}
        </button>
      </div>

      {showCode && source ? <CodeBlock code={source.trim()} /> : null}
    </figure>
  );
}
