import { User } from 'lucide-react';
import { Avatar } from 'm3you';

export default function AvatarBasic() {
  return (
    <>
      <Avatar variant="image" src="/favicon.svg" alt="m3you" />
      <Avatar variant="monogram">BZ</Avatar>
      <Avatar variant="icon">
        <User aria-hidden="true" />
      </Avatar>
    </>
  );
}
