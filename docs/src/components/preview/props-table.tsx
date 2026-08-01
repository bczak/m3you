import docgen from '@/lib/docgen.json';

type PropDoc = {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
};

type ComponentDoc = {
  displayName: string;
  description: string;
  filePath: string;
  props: PropDoc[];
};

const DOCS = docgen as Record<string, ComponentDoc>;

/**
 * Renders a component's props straight from its TypeScript signature.
 *
 * `of` names an entry in the generated `docgen.json`. Only props the library
 * declares are listed — see `extends` for the inherited element.
 */
export function PropsTable({ of: name, extends: extendsElement }: { of: string; extends?: string }) {
  const doc = DOCS[name];

  if (!doc) {
    return (
      <p className="m3-props__missing">
        No generated types found for <code>{name}</code>. Run <code>bun run docgen</code>.
      </p>
    );
  }

  return (
    <div className="m3-props">
      <div className="m3-props__head">
        <h3 className="m3-props__title">{name}</h3>
        {extendsElement ? (
          <p className="m3-props__extends">
            Also accepts every prop of <code>{extendsElement}</code>, plus <code>ref</code>.
          </p>
        ) : null}
      </div>

      {doc.props.length === 0 ? (
        <p className="m3-props__missing">
          This component adds no props of its own — it accepts <code>{extendsElement ?? 'its element'}</code> props
          only.
        </p>
      ) : (
        <table className="m3-props__table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {doc.props.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code className="m3-props__name">{prop.name}</code>
                  {prop.required ? <span className="m3-props__required">required</span> : null}
                </td>
                <td>
                  <code className="m3-props__type">{prop.type}</code>
                </td>
                <td>{prop.defaultValue ? <code>{prop.defaultValue}</code> : <span aria-hidden="true">—</span>}</td>
                <td>{prop.description || <span className="m3-props__todo">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
