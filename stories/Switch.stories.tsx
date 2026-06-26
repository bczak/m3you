import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from '../src/components/Switch/switch';

const meta = {
  title: 'Selection/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'showIcons', 'disabled', 'defaultChecked'],
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'error'],
      description: 'Color role — `primary` for normal toggles, `error` for destructive/invalid states.',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    showIcons: {
      control: 'boolean',
      description: 'Renders the check/cross icons inside the handle and enlarges the unchecked thumb.',
      table: { category: 'Appearance', defaultValue: { summary: 'false' } },
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Initial checked state for uncontrolled usage.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled state layer.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
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

const AllCombinations = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
      {(['primary', 'error'] as const).map((variant) => (
        <div key={variant}>
          <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>
            {variant}
          </h3>
          <VariantStory variant={variant} />
        </div>
      ))}
    </div>
  );
};

export const All: Story = {
  render: () => <AllCombinations />,
};
