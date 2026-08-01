import { Bell, Mail } from 'lucide-react';
import { Badge, BadgeAnchor, IconButton } from 'm3you';

export default function BadgeBasic() {
  return (
    <>
      <BadgeAnchor badge={<Badge />}>
        <IconButton variant="tonal" aria-label="Notifications">
          <Bell size={20} aria-hidden="true" />
        </IconButton>
      </BadgeAnchor>
      <BadgeAnchor badge={<Badge count={8} />}>
        <IconButton variant="tonal" aria-label="Mail">
          <Mail size={20} aria-hidden="true" />
        </IconButton>
      </BadgeAnchor>
      <BadgeAnchor badge={<Badge count={1234} max={99} />}>
        <IconButton variant="tonal" aria-label="Mail">
          <Mail size={20} aria-hidden="true" />
        </IconButton>
      </BadgeAnchor>
    </>
  );
}
