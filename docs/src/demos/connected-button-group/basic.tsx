import { Button, ConnectedButtonGroup } from 'm3you';

export default function ConnectedButtonGroupBasic() {
  return (
    <ConnectedButtonGroup selectionMode="single" required defaultValue={[1]} size="md">
      <Button>List</Button>
      <Button>Grid</Button>
      <Button>Columns</Button>
    </ConnectedButtonGroup>
  );
}
