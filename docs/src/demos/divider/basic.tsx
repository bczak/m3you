import { Divider } from 'm3you';

export default function DividerBasic() {
  return (
    <div style={{ width: '100%', maxWidth: '22rem' }}>
      <p style={{ margin: '0 0 0.75rem' }}>Full width</p>
      <Divider />
      <p style={{ margin: '0.75rem 0' }}>Inset</p>
      <Divider variant="inset" />
      <p style={{ margin: '0.75rem 0' }}>Heavy</p>
      <Divider variant="heavy" />
    </div>
  );
}
