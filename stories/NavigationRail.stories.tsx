import type { Meta, StoryObj } from '@storybook/react-vite';
import { BellIcon, CompassIcon, EditIcon, FolderIcon, HouseIcon, MenuIcon, PanelLeftCloseIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Badge } from '../src/components/Badge/badge';
import { ExtendableFAB } from '../src/components/ExtendableFab/extendable-fab';
import {
  NavigationRail,
  NavigationRailItem,
  NavigationRailMenuButton,
  NavigationRailSection,
} from '../src/components/NavigationRail/navigation-rail';

const meta = {
  title: 'Navigation/Navigation Rail',
  component: NavigationRail,
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: ['state', 'modality', 'itemsAlignment'],
      expanded: true,
    },
  },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: ['collapsed', 'expanded'],
      description: 'Rail width state — collapsed (narrow icon rail) or expanded (wide rail with labels).',
      table: { category: 'Appearance', defaultValue: { summary: 'collapsed' } },
    },
    modality: {
      control: 'inline-radio',
      options: ['standard', 'modal'],
      description: 'How the expanded rail is presented — standard (inline) or modal (overlay with a scrim).',
      table: { category: 'Appearance', defaultValue: { summary: 'standard' } },
    },
    itemsAlignment: {
      control: 'inline-radio',
      options: ['start', 'center'],
      description: 'Vertical alignment of the navigation items within the rail.',
      table: { category: 'Appearance', defaultValue: { summary: 'start' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationRail>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledRail({
  state: initialState = 'collapsed',
  modality = 'standard',
  itemsAlignment = 'start',
  hideLabel = false,
}: {
  state?: ComponentProps<typeof NavigationRail>['state'];
  modality?: ComponentProps<typeof NavigationRail>['modality'];
  itemsAlignment?: ComponentProps<typeof NavigationRail>['itemsAlignment'];
  hideLabel?: boolean;
}) {
  const [state, setState] = useState(initialState);
  const [value, setValue] = useState('home');

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  return (
    <div className="sb-m3-app-shell">
      <NavigationRail
        state={state}
        modality={modality}
        itemsAlignment={itemsAlignment}
        position="relative"
        value={value}
        onValueChange={setValue}
        onStateChange={setState}
        menu={<NavigationRailMenuButton collapsedIcon={<MenuIcon />} expandedIcon={<PanelLeftCloseIcon />} />}
        fab={
          <ExtendableFAB
            size="sm"
            extended={state === 'expanded'}
            icon={<EditIcon />}
            label="Compose"
            aria-label="Create new"
          />
        }
      >
        <NavigationRailSection title="Workspace">
          <NavigationRailItem value="home" icon={<HouseIcon />} label="Home" hideLabel={hideLabel} />
          <NavigationRailItem value="discover" icon={<CompassIcon />} label="Discover" hideLabel={hideLabel} />
          <NavigationRailItem value="library" icon={<FolderIcon />} label="Library" hideLabel={hideLabel} />
          <NavigationRailItem
            value="alerts"
            icon={<BellIcon />}
            label="Alerts"
            hideLabel={hideLabel}
            badge={<Badge size="small" />}
          />
        </NavigationRailSection>
      </NavigationRail>

      <div className="sb-m3-app-shell__content">
        <div className="sb-m3-demo-stack">
          <span className="sb-m3-panel__eyebrow">Selected destination</span>
          <strong>{value}</strong>
          <div className="sb-m3-stat-grid">
            <div className="sb-m3-stat">
              <strong>124</strong>
              <span className="sb-m3-muted">saved assets</span>
            </div>
            <div className="sb-m3-stat">
              <strong>7</strong>
              <span className="sb-m3-muted">active briefs</span>
            </div>
            <div className="sb-m3-stat">
              <strong>19</strong>
              <span className="sb-m3-muted">draft experiments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Playground: Story = {
  args: {
    state: 'collapsed',
    modality: 'standard',
    itemsAlignment: 'start',
  },
  render: (args) => <ControlledRail state={args.state} modality={args.modality} itemsAlignment={args.itemsAlignment} />,
};

export const Expanded: Story = {
  render: () => <ControlledRail state="expanded" modality="standard" />,
};

export const Modal: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `modality="modal"`, the expanded rail floats over page content as a `surface-container` sheet with large corners (the kit\'s Floating type) and dims the background with a scrim. Click the scrim to collapse it.',
      },
    },
  },
  render: () => <ControlledRail state="expanded" modality="modal" />,
};

export const ItemsCenterAligned: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Navigation items can be vertically centered within the rail via `itemsAlignment="center"`.',
      },
    },
  },
  render: () => <ControlledRail itemsAlignment="center" />,
};

export const LabelsHidden: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `hideLabel` on each item, the collapsed rail drops the labels and uses a 56dp round indicator. The label stays the accessible name, and the expanded rail shows it again.',
      },
    },
  },
  render: () => <ControlledRail hideLabel />,
};
