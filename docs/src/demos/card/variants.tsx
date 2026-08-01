import { Card } from 'm3you';

export default function CardVariants() {
  return (
    <>
      {(['elevated', 'filled', 'outlined'] as const).map((variant) => (
        <Card key={variant} variant={variant} style={{ padding: '1.25rem', width: '13rem' }}>
          <strong style={{ textTransform: 'capitalize' }}>{variant}</strong>
          <p style={{ margin: '0.375rem 0 0', fontSize: '0.875rem', opacity: 0.75 }}>
            Cards group related content and actions.
          </p>
        </Card>
      ))}
    </>
  );
}
