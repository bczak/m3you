import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchiveIcon, InboxIcon, MoreVerticalIcon, StarIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';

import { IconButton } from '../src/components/IconButton/icon-button';
import { List, ListDivider, ListItem } from '../src/components/List/list';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Containment/List',
  component: List,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'M3 Expressive lists support standard and segmented appearances without changing their static, action, or selection semantics.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

const LeadingAvatar = ({ children }: { children: string }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'var(--md-sys-color-tertiary-container)',
      color: 'var(--md-sys-color-on-tertiary-container)',
      fontWeight: 700,
    }}
  >
    {children}
  </span>
);

export const Playground: Story = {
  render: () => (
    <List aria-label="Recent conversations">
      <ListItem
        headline="Ada Lovelace"
        supportingText="The analytical engine notes are ready."
        leading={<LeadingAvatar>AL</LeadingAvatar>}
        trailing="2m"
      />
      <ListItem
        headline="Grace Hopper"
        supportingText="I found the compiler issue."
        leading={<LeadingAvatar>GH</LeadingAvatar>}
        trailing="18m"
      />
      <ListItem
        headline="Katherine Johnson"
        supportingText="Flight calculations are complete."
        leading={<LeadingAvatar>KJ</LeadingAvatar>}
        trailing="1h"
      />
    </List>
  ),
};

export const ExpressiveAppearances: Story = {
  render: () => (
    <ShowcaseGrid>
      <ShowcasePanel
        eyebrow="Expressive"
        title="Segmented"
        description="Separated shapes make each item feel distinct."
      >
        <List appearance="segmented">
          <ListItem headline="Inbox" supportingText="12 unread" leading={<InboxIcon aria-hidden="true" />} />
          <ListItem headline="Starred" supportingText="8 conversations" leading={<StarIcon aria-hidden="true" />} />
          <ListItem headline="Archive" supportingText="Everything else" leading={<ArchiveIcon aria-hidden="true" />} />
        </List>
      </ShowcasePanel>
      <ShowcasePanel
        eyebrow="Expressive"
        title="Standard"
        description="Continuous rows suit dense, edge-to-edge surfaces."
      >
        <List appearance="standard">
          <ListItem headline="Inbox" supportingText="12 unread" leading={<InboxIcon aria-hidden="true" />} />
          <ListDivider inset />
          <ListItem headline="Starred" supportingText="8 conversations" leading={<StarIcon aria-hidden="true" />} />
          <ListDivider inset />
          <ListItem headline="Archive" supportingText="Everything else" leading={<ArchiveIcon aria-hidden="true" />} />
        </List>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};

function SelectionExamples() {
  const [singleValue, setSingleValue] = useState<string | null>('comfortable');
  const [multipleValue, setMultipleValue] = useState<string[]>(['email']);

  return (
    <ShowcaseGrid>
      <ShowcasePanel eyebrow="Listbox" title="Single selection" description={`Selected: ${singleValue ?? 'none'}`}>
        <List
          mode="single-select"
          aria-label="Choose density"
          value={singleValue ?? undefined}
          required={false}
          onValueChange={setSingleValue}
        >
          <ListItem value="compact" headline="Compact" supportingText="More rows on screen" />
          <ListItem value="comfortable" headline="Comfortable" supportingText="Balanced spacing" />
          <ListItem value="spacious" headline="Spacious" supportingText="Largest touch areas" />
        </List>
      </ShowcasePanel>
      <ShowcasePanel
        eyebrow="Listbox"
        title="Multiple selection"
        description={`${multipleValue.length} channels enabled`}
      >
        <List
          mode="multi-select"
          aria-label="Choose notification channels"
          value={multipleValue}
          onValueChange={setMultipleValue}
        >
          <ListItem value="email" headline="Email" />
          <ListItem value="push" headline="Push notifications" />
          <ListItem value="sms" headline="Text message" disabled />
        </List>
      </ShowcasePanel>
    </ShowcaseGrid>
  );
}

export const SelectionModes: Story = {
  render: () => <SelectionExamples />,
};

export const ActionModes: Story = {
  render: () => (
    <ShowcaseGrid>
      <ShowcasePanel eyebrow="One target" title="Single action" description="The entire row is one button or link.">
        <List mode="single-action" aria-label="Folders">
          <ListItem
            headline="Inbox"
            supportingText="12 unread"
            leading={<InboxIcon aria-hidden="true" />}
            onClick={() => {}}
          />
          <ListItem
            headline="Starred"
            supportingText="8 conversations"
            leading={<StarIcon aria-hidden="true" />}
            href="#starred"
          />
          <ListItem headline="Archive" leading={<ArchiveIcon aria-hidden="true" />} disabled onClick={() => {}} />
        </List>
      </ShowcasePanel>
      <ShowcasePanel
        eyebrow="Several targets"
        title="Multi action"
        description="Secondary controls remain siblings of the primary target."
      >
        <List mode="multi-action" aria-label="Contacts">
          <ListItem
            headline="Alex Morgan"
            supportingText="Product design"
            leading={<UserIcon aria-hidden="true" />}
            onClick={() => {}}
            trailing={
              <IconButton aria-label="More actions for Alex Morgan" variant="standard" size="sm">
                <MoreVerticalIcon aria-hidden="true" />
              </IconButton>
            }
          />
          <ListItem
            headline="Sam Rivera"
            supportingText="Engineering"
            leading={<UserIcon aria-hidden="true" />}
            href="#sam-rivera"
            trailing={
              <IconButton aria-label="More actions for Sam Rivera" variant="standard" size="sm">
                <MoreVerticalIcon aria-hidden="true" />
              </IconButton>
            }
          />
        </List>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};

export const ContentAndStates: Story = {
  render: () => (
    <List aria-label="Content density examples" style={{ maxWidth: 720 }}>
      <ListItem headline="One-line item" trailing="56dp" />
      <ListItem
        headline="Two-line item"
        supportingText="Supporting text adds context without another action."
        trailing="72dp"
      />
      <ListItem
        headline="Three-line item"
        overline="Category"
        supportingText="Overline, headline, and supporting text align media and trailing content to the top."
        trailing="88dp"
      />
      <ListItem headline="Disabled item" supportingText="Unavailable in the current context" disabled />
      <ListItem
        headline="Dragged visual state"
        supportingText="Ordering is intentionally owned by a sortable abstraction"
        dragged
      />
    </List>
  ),
};

export const LongLocalizedContent: Story = {
  parameters: { viewport: { defaultViewport: 'm3Compact' } },
  render: () => (
    <List mode="single-action" aria-label="Localized settings">
      <ListItem
        headline="Benachrichtigungseinstellungen"
        supportingText="Längere übersetzte Beschriftungen werden gekürzt, bleiben aber über den zugänglichen Namen vollständig verfügbar."
        onClick={() => {}}
      />
      <ListItem
        headline="Datenschutzeinstellungen und Berechtigungen"
        supportingText="Verwalten Sie, welche Informationen mit anderen Personen geteilt werden."
        onClick={() => {}}
      />
    </List>
  ),
};

export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <List mode="single-select" aria-label="Dark theme density" defaultValue="comfortable">
      <ListItem value="compact" headline="Compact" supportingText="More rows on screen" />
      <ListItem value="comfortable" headline="Comfortable" supportingText="Balanced spacing" />
      <ListItem value="spacious" headline="Spacious" supportingText="Largest touch areas" />
    </List>
  ),
};

export const TwoHundredPercentZoom: Story = {
  parameters: {
    viewport: { defaultViewport: 'm3Compact' },
    docs: {
      description: {
        story: 'A compact-width reflow check with the component scaled to 200%.',
      },
    },
  },
  render: () => (
    <div style={{ width: '50%', zoom: 2 }}>
      <List mode="single-action" aria-label="Zoomed settings">
        <ListItem
          headline="Notification preferences"
          supportingText="Long text remains contained without creating page-level horizontal overflow."
          onClick={() => {}}
        />
        <ListItem headline="Privacy and permissions" supportingText="Manage shared information." onClick={() => {}} />
      </List>
    </div>
  ),
};

export const Empty: Story = {
  render: () => <List aria-label="No results" />,
};
