import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../src/components/Switch/switch';

const meta = {
  title: 'Selection/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'showIcons', 'disabled', 'defaultChecked'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'primary',
    showIcons: false,
    disabled: false,
    defaultChecked: false,
  },
};

const VariantStory = ({ variant }: { variant: 'primary' | 'error' }) => {
  return (
    <div style={{ display: 'flex', gap: '64px' }}>
      {/* Without icons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>No icons</span>
        <Switch variant={variant} />
        <Switch variant={variant} defaultChecked />
        <Switch variant={variant} disabled />
        <Switch variant={variant} defaultChecked disabled />
      </div>

      {/* With icons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>With icons</span>
        <Switch variant={variant} showIcons />
        <Switch variant={variant} showIcons defaultChecked />
        <Switch variant={variant} showIcons disabled />
        <Switch variant={variant} showIcons defaultChecked disabled />
      </div>
    </div>
  );
};

export const Primary: Story = {
  render: () => <VariantStory variant="primary" />,
};

const ErrorStory: Story = {
  render: () => <VariantStory variant="error" />,
};

export { ErrorStory as Error };
