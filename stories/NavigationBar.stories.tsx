import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompassIcon, HouseIcon, LibraryIcon, RadioIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { NavigationBar, NavigationBarItem } from '../src/components/NavigationBar/navigation-bar';

const meta = {
  title: 'Navigation/Navigation Bar',
  component: NavigationBar,
  parameters: {
    layout: 'fullscreen',
    controls: {
      include: ['orientation', 'value'],
    },
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Item orientation within the navigation bar',
    },
    value: {
      control: 'inline-radio',
      options: ['home', 'browse', 'radio', 'library'],
      description: 'Currently active item value',
    },
    onValueChange: {
      action: 'value changed',
      description: 'Callback when active item changes',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationBar>;

export default meta;
type Story = StoryObj<typeof meta>;

const destinations = [
  { value: 'home', label: 'Home', icon: HouseIcon },
  { value: 'browse', label: 'Browse', icon: CompassIcon },
  { value: 'radio', label: 'Radio', icon: RadioIcon },
  { value: 'library', label: 'Library', icon: LibraryIcon },
] as const;

type DestinationValue = (typeof destinations)[number]['value'];

function NavigationItems() {
  return destinations.map(({ value, label, icon: Icon }) => (
    <NavigationBarItem key={value} value={value} icon={<Icon />} label={label} />
  ));
}

function ControlledNavigationBar({
  orientation = 'vertical',
  value = 'home',
  onValueChange,
}: {
  orientation?: ComponentProps<typeof NavigationBar>['orientation'];
  value?: DestinationValue;
  onValueChange?: (value: string) => void;
}) {
  const [selectedValue, setSelectedValue] = useState<DestinationValue>(value);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleValueChange = (nextValue: string) => {
    setSelectedValue(nextValue as DestinationValue);
    onValueChange?.(nextValue);
  };

  return (
    <div
      style={{
        minHeight: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#dfe0ff',
        padding: '40px 24px 56px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: orientation === 'horizontal' ? 1188 : 660 }}>
        <NavigationBar
          aria-label="Navigation bar playground"
          orientation={orientation}
          value={selectedValue}
          onValueChange={handleValueChange}
          style={{ position: 'static' }}
        >
          <NavigationItems />
        </NavigationBar>
      </div>
    </div>
  );
}

function NavigationBarShowcase() {
  const [compactValue, setCompactValue] = useState('home');
  const [expandedValue, setExpandedValue] = useState('home');

  return (
    <div
      style={{
        minHeight: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 68,
        backgroundColor: '#dfe0ff',
        padding: '44px 24px 68px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: '100%', maxWidth: 660 }}>
        <NavigationBar
          aria-label="Compact navigation"
          value={compactValue}
          onValueChange={setCompactValue}
          style={{ position: 'static' }}
        >
          <NavigationItems />
        </NavigationBar>
      </div>

      <div style={{ width: '100%', maxWidth: 1188 }}>
        <NavigationBar
          aria-label="Expanded navigation"
          orientation="horizontal"
          value={expandedValue}
          onValueChange={setExpandedValue}
          style={{ position: 'static' }}
        >
          <NavigationItems />
        </NavigationBar>
      </div>
    </div>
  );
}

export const Playground: Story = {
  args: {
    orientation: 'vertical',
    value: 'home',
  },
  render: (args) => (
    <ControlledNavigationBar
      orientation={args.orientation}
      value={args.value as 'home' | 'browse' | 'radio' | 'library' | undefined}
      onValueChange={args.onValueChange}
    />
  ),
};

export const Default: Story = {
  render: () => <NavigationBarShowcase />,
  parameters: {
    controls: {
      disable: true,
    },
  },
};
