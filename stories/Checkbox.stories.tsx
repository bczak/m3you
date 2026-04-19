import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox } from '../src/components/Checkbox/checkbox';

const meta = {
  title: 'Selection/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'checked', 'indeterminate', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveCheckbox = (props: React.ComponentProps<typeof Checkbox>) => {
  const [checked, setChecked] = useState(props.checked ?? false);
  return <Checkbox {...props} checked={checked} onCheckedChange={setChecked} />;
};

export const Default: Story = {
  args: {
    variant: 'primary',
    checked: false,
    indeterminate: false,
    disabled: false,
  },
  render: (args) => <InteractiveCheckbox {...args} />,
};

const VariantStory = ({ variant }: { variant: 'primary' | 'error' }) => {
  return (
    <div style={{ display: 'flex', gap: '64px' }}>
      {/* Unchecked */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Unchecked</span>
        <InteractiveCheckbox variant={variant} />
        <InteractiveCheckbox variant={variant} disabled />
      </div>

      {/* Checked */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Checked</span>
        <InteractiveCheckbox variant={variant} checked />
        <InteractiveCheckbox variant={variant} checked disabled />
      </div>

      {/* Indeterminate */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Indeterminate</span>
        <Checkbox variant={variant} indeterminate />
        <Checkbox variant={variant} indeterminate disabled />
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
