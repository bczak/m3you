import { Button, StandardButtonGroup } from 'm3you';

export default function StandardButtonGroupBasic() {
  return (
    <StandardButtonGroup size="sm" selectionMode="single" defaultValue={[0]}>
      <Button>Day</Button>
      <Button>Week</Button>
      <Button>Month</Button>
    </StandardButtonGroup>
  );
}
