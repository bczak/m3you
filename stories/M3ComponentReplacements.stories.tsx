import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, HouseIcon, SearchIcon, SettingsIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../src/components/Button/button';
import { ConnectedButtonGroup } from '../src/components/ButtonGroup/connected-button-group';
import {
  NavigationRail,
  NavigationRailItem,
  NavigationRailSection,
} from '../src/components/NavigationRail/navigation-rail';
import { Toolbar } from '../src/components/Toolbar/toolbar';

const meta = {
  title: 'Guidance/M3 Component Replacements',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Material 3 retired Navigation Drawer, Segmented Buttons, and the deprecated Bottom App Bar kit set. Use expanded Navigation Rail, Connected Button Group, and Toolbar respectively; no legacy BottomAppBar component is introduced.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function RailReplacement() {
  const [value, setValue] = useState('home');
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        minHeight: 440,
      }}
    >
      <NavigationRail
        aria-label="Workspace navigation"
        state="expanded"
        modality="standard"
        position="relative"
        value={value}
        onValueChange={setValue}
      >
        <NavigationRailSection title="Workspace">
          <NavigationRailItem value="home" icon={<HouseIcon aria-hidden="true" />} label="Home" />
          <NavigationRailItem value="search" icon={<SearchIcon aria-hidden="true" />} label="Search" />
          <NavigationRailItem value="settings" icon={<SettingsIcon aria-hidden="true" />} label="Settings" />
        </NavigationRailSection>
      </NavigationRail>
      <main style={{ padding: 32, background: 'var(--md-sys-color-surface-container-low)' }}>
        <h2 style={{ marginTop: 0 }}>Expanded rail replaces navigation drawer</h2>
        <p>
          Use <code>modality=&quot;standard&quot;</code> for persistent navigation and{' '}
          <code>modality=&quot;modal&quot;</code> for an overlay with a scrim. The active destination is{' '}
          <strong>{value}</strong>.
        </p>
        <a href="https://m3.material.io/components/navigation-drawer/overview" target="_blank" rel="noreferrer">
          Read the official M3 status
        </a>
      </main>
    </div>
  );
}

export const NavigationDrawerToExpandedRail: Story = {
  render: () => <RailReplacement />,
};

export const SegmentedButtonsToConnectedGroup: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 32, maxWidth: 720 }}>
      <section>
        <h2>Single-select replacement</h2>
        <p>Use stable selection requirements and visible text labels when space permits.</p>
        <ConnectedButtonGroup selectionMode="single" required defaultValue={[0]} aria-label="Text alignment">
          <Button variant="tonal">
            <AlignLeftIcon aria-hidden="true" />
            Left
          </Button>
          <Button variant="tonal">
            <AlignCenterIcon aria-hidden="true" />
            Center
          </Button>
          <Button variant="tonal">
            <AlignRightIcon aria-hidden="true" />
            Right
          </Button>
        </ConnectedButtonGroup>
      </section>
      <section>
        <h2>Multiple-select replacement</h2>
        <ConnectedButtonGroup selectionMode="multiple" defaultValue={[0, 2]} aria-label="Visible layers">
          <Button variant="outlined">Labels</Button>
          <Button variant="outlined">Guides</Button>
          <Button variant="outlined">Grid</Button>
        </ConnectedButtonGroup>
      </section>
      <a href="https://m3.material.io/components/segmented-buttons/overview" target="_blank" rel="noreferrer">
        Read the official M3 status
      </a>
    </div>
  ),
};

export const BottomAppBarToToolbar: Story = {
  render: () => (
    <section style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <h2 style={{ margin: 0 }}>Bottom app bar maps to Toolbar</h2>
      <p style={{ margin: 0 }}>
        Use a horizontal <code>Toolbar</code> at the bottom edge for the deprecated kit configuration.
      </p>
      <Toolbar layout="horizontal" color="standard" aria-label="Document actions">
        <Button variant="text">Archive</Button>
        <Button variant="text">Move</Button>
        <Button variant="text">Share</Button>
      </Toolbar>
    </section>
  ),
};
