import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RadioButton } from '../src/components/RadioButton/radio-button';
import { RadioGroup } from '../src/components/RadioButton/radio-group';
import { RadioGroupItem } from '../src/components/RadioButton/radio-group-item';

const meta = {
  title: 'Selection/Radio Button',
  component: RadioButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'checked', 'disabled'],
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'error'],
      description: 'Color role — `primary` for normal selection, `error` for validation failures.',
      table: { category: 'Appearance', defaultValue: { summary: 'primary' } },
    },
    checked: {
      control: 'boolean',
      description: 'Whether this radio is selected. Inside a `RadioGroup` this is derived from the group value.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled state layer.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Interactive Wrappers ────────────────────────────────────────

const InteractiveRadio = (props: React.ComponentProps<typeof RadioButton>) => {
  const [checked, setChecked] = useState(props.checked ?? false);
  return (
    <RadioButton
      aria-label="Example option"
      {...props}
      checked={checked}
      onChange={(e) => {
        setChecked(e.target.checked);
        props.onChange?.(e);
      }}
    />
  );
};

const InteractiveRadioGroup = ({
  variant,
  disabled,
  options = ['Option A', 'Option B', 'Option C'],
}: {
  variant?: 'primary' | 'error';
  disabled?: boolean;
  options?: string[];
}) => {
  const [value, setValue] = useState(options[0]);
  return (
    <RadioGroup value={value} onValueChange={setValue} variant={variant} disabled={disabled}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((option) => (
          <div key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RadioGroupItem value={option} />
            <span style={{ fontSize: '14px' }}>{option}</span>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
};

// ─── Default ─────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    variant: 'primary',
    checked: false,
    disabled: false,
  },
  render: (args) => <InteractiveRadio {...args} />,
};

// ─── Variant Stories ─────────────────────────────────────────────

const VariantStory = ({ variant }: { variant: 'primary' | 'error' }) => {
  return (
    <div style={{ display: 'flex', gap: '64px' }}>
      {/* Unselected */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Unselected</span>
        <RadioButton aria-label="Example option" variant={variant} checked={false} readOnly />
        <RadioButton aria-label="Example option" variant={variant} checked={false} disabled readOnly />
      </div>

      {/* Selected */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Selected</span>
        <RadioButton aria-label="Example option" variant={variant} checked readOnly />
        <RadioButton aria-label="Example option" variant={variant} checked disabled readOnly />
      </div>
    </div>
  );
};

export const Primary: Story = {
  render: () => <VariantStory variant="primary" />,
};

export const ErrorVariant: Story = {
  name: 'Error',
  render: () => <VariantStory variant="error" />,
};

// ─── Grouped ─────────────────────────────────────────────────────

const groupedOptions = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

function GroupedStory() {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '240px' }}>
      <RadioGroup value={value} onValueChange={setValue}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {groupedOptions.map((option) => (
            <div key={option} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RadioGroupItem value={option} />
              <span style={{ fontSize: '14px' }}>{option}</span>
            </div>
          ))}
        </div>
      </RadioGroup>
      <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
        Selected: <strong>{value || 'none'}</strong>
      </span>
    </div>
  );
}

export const Grouped: Story = {
  render: () => <GroupedStory />,
};

// ─── RadioGroup Stories ──────────────────────────────────────────

export const Group: Story = {
  render: () => <InteractiveRadioGroup />,
};

export const GroupError: Story = {
  render: () => <InteractiveRadioGroup variant="error" />,
};

export const GroupDisabled: Story = {
  render: () => <InteractiveRadioGroup disabled />,
};

// ─── With Labels ─────────────────────────────────────────────────

function WithLabelsStory() {
  const [value, setValue] = useState('comfortable');
  return (
    <RadioGroup value={value} onValueChange={setValue}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { value: 'compact', label: 'Compact', description: 'Smaller spacing between items' },
          { value: 'comfortable', label: 'Comfortable', description: 'Default spacing' },
          { value: 'spacious', label: 'Spacious', description: 'More room between items' },
        ].map((item) => (
          <div key={item.value} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <RadioGroupItem value={item.value} style={{ marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </RadioGroup>
  );
}

export const WithLabels: Story = {
  render: () => <WithLabelsStory />,
};

// ─── All Combinations ────────────────────────────────────────────

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

      <div>
        <h3 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600 }}>RadioGroup</h3>
        <div style={{ display: 'flex', gap: '64px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Primary</span>
            <InteractiveRadioGroup variant="primary" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Error</span>
            <InteractiveRadioGroup variant="error" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>Disabled</span>
            <InteractiveRadioGroup disabled />
          </div>
        </div>
      </div>
    </div>
  );
};

export const All: Story = {
  render: () => <AllCombinations />,
};
