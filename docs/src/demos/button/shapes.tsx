import { Button } from 'm3you';

export default function ButtonShapes() {
  return (
    <>
      <Button shape="round">Round</Button>
      <Button shape="square">Square</Button>
      <Button shape="round" morph={false}>
        No morph
      </Button>
    </>
  );
}
