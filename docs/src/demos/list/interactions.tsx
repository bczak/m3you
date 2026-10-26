import { Archive, Inbox, Trash2 } from 'lucide-react';
import { List, ListItemAccordion, ListItemSwipe } from 'm3you';

export default function ListInteractions() {
  return (
    <List appearance="segmented" aria-label="Message actions">
      <ListItemAccordion
        headline="Notification details"
        supportingText="Open the disclosure panel"
        leading={<Inbox aria-hidden="true" />}
      >
        Choose which events can send notifications from your account settings.
      </ListItemAccordion>
      <ListItemSwipe
        startAction={
          <button type="button" aria-label="Archive">
            <Archive aria-hidden="true" />
          </button>
        }
        endAction={
          <button type="button" aria-label="Delete">
            <Trash2 aria-hidden="true" />
          </button>
        }
      >
        <div style={{ boxSizing: 'border-box', minHeight: 72, padding: 16, color: 'var(--md-sys-color-on-surface)' }}>
          Swipe this message in either direction
        </div>
      </ListItemSwipe>
    </List>
  );
}
