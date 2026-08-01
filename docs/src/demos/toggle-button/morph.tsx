import { ToggleButton } from 'm3you';

export default function ToggleButtonMorph() {
  return (
    <>
      <ToggleButton morph size="md">
        Press and hold
      </ToggleButton>
      <ToggleButton morph size="md" defaultSelected>
        Selected
      </ToggleButton>
    </>
  );
}
