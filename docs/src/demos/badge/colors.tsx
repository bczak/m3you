import { Badge } from 'm3you';

export default function BadgeColors() {
  return (
    <>
      <Badge count={3} color="error" />
      <Badge count={3} color="primary" />
      <Badge count={3} color="secondary" />
      <Badge count={3} color="tertiary" />
    </>
  );
}
