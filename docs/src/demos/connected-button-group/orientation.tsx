import { Button, ConnectedButtonGroup } from 'm3you';

export default function ConnectedButtonGroupOrientation() {
  return (
    <ConnectedButtonGroup orientation="vertical" selectionMode="single" defaultValue={[0]} size="sm">
      <Button>Top</Button>
      <Button>Middle</Button>
      <Button>Bottom</Button>
    </ConnectedButtonGroup>
  );
}
