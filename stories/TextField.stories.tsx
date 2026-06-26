import type { Meta, StoryObj } from '@storybook/react-vite';
import { LockIcon, MailIcon, SearchIcon } from 'lucide-react';
import { TextField } from '../src/components/TextField/text-field';

const meta = {
  title: 'Inputs/Text Field',
  component: TextField,
  parameters: {
    layout: 'centered',
    controls: {
      // TextField spreads native <input> props, so without an allow-list the table
      // floods with every HTML attribute. Keep it to the M3-specific props.
      include: [
        'variant',
        'type',
        'label',
        'placeholder',
        'supportingText',
        'errorText',
        'error',
        'disabled',
        'prefixText',
        'suffixText',
        'maxCharCount',
      ],
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['filled', 'outlined'],
      description: 'Visual style — filled has a bottom active indicator, outlined has a notched border.',
      table: { category: 'Appearance', defaultValue: { summary: 'filled' } },
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Native input type forwarded to the underlying `<input>`.',
      table: { category: 'Behavior', defaultValue: { summary: 'text' } },
    },
    label: {
      control: 'text',
      description: 'Floating label rendered above the input when focused or populated.',
      table: { category: 'Content' },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder shown while the field is empty and focused.',
      table: { category: 'Content' },
    },
    supportingText: {
      control: 'text',
      description: 'Helper text shown beneath the field.',
      table: { category: 'Content' },
    },
    errorText: {
      control: 'text',
      description: 'Error message — replaces supporting text and forces the error state when set.',
      table: { category: 'Content' },
    },
    prefixText: {
      control: 'text',
      description: 'Static text shown before the input value (e.g. a currency symbol).',
      table: { category: 'Content' },
    },
    suffixText: {
      control: 'text',
      description: 'Static text shown after the input value (e.g. a unit).',
      table: { category: 'Content' },
    },
    maxCharCount: {
      control: 'number',
      description: 'Enables the character counter shown in the supporting row.',
      table: { category: 'Behavior' },
    },
    error: {
      control: 'boolean',
      description: 'Forces the error state styling.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disables interaction and applies the disabled state layer.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'filled',
    type: 'text',
    label: 'Label',
    placeholder: '',
    supportingText: 'Supporting text',
    error: false,
    disabled: false,
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <TextField {...args} />
    </div>
  ),
};

// ─── variant: 'filled' | 'outlined' ───────────────────────────────────────
export const Filled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="filled" label="Empty" supportingText="Supporting text" />
      <TextField variant="filled" label="Populated" defaultValue="Hello world" supportingText="Supporting text" />
      <TextField variant="filled" label="Error" errorText="This field is required" />
      <TextField variant="filled" label="Disabled" defaultValue="Disabled value" disabled />
    </div>
  ),
};

export const Outlined: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="outlined" label="Empty" supportingText="Supporting text" />
      <TextField variant="outlined" label="Populated" defaultValue="Hello world" supportingText="Supporting text" />
      <TextField variant="outlined" label="Error" errorText="This field is required" />
      <TextField variant="outlined" label="Disabled" defaultValue="Disabled value" disabled />
    </div>
  ),
};

// ─── Both variants side-by-side ───────────────────────────────────────────
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 240 }}>
        <p style={{ font: 'var(--md-sys-typescale-title-small)' }}>Filled</p>
        <TextField variant="filled" label="Username" supportingText="Supporting text" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 240 }}>
        <p style={{ font: 'var(--md-sys-typescale-title-small)' }}>Outlined</p>
        <TextField variant="outlined" label="Username" supportingText="Supporting text" />
      </div>
    </div>
  ),
};

// ─── type: text | email | password | number | search | tel | url ──────────
const types = ['text', 'email', 'password', 'number', 'search', 'tel', 'url'] as const;

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      {types.map((type) => (
        <TextField key={type} variant="outlined" type={type} label={type} placeholder={`Enter ${type}`} />
      ))}
    </div>
  ),
};

// ─── Leading & trailing icons ─────────────────────────────────────────────
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="filled" label="Search" leadingIcon={<SearchIcon aria-hidden="true" />} />
      <TextField variant="outlined" label="Email" type="email" leadingIcon={<MailIcon aria-hidden="true" />} />
      <TextField
        variant="outlined"
        label="Password"
        type="password"
        leadingIcon={<LockIcon aria-hidden="true" />}
        trailingIcon={<SearchIcon aria-hidden="true" />}
      />
    </div>
  ),
};

// ─── Prefix & suffix text ─────────────────────────────────────────────────
export const WithPrefixSuffix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="outlined" label="Amount" type="number" prefixText="$" defaultValue="42.00" />
      <TextField variant="outlined" label="Weight" type="number" suffixText="kg" defaultValue="75" />
      <TextField variant="filled" label="Website" type="url" prefixText="https://" suffixText=".com" />
    </div>
  ),
};

// ─── Supporting text ──────────────────────────────────────────────────────
export const WithSupportingText: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="filled" label="Filled" supportingText="Supporting text" />
      <TextField variant="outlined" label="Outlined" supportingText="Supporting text" />
    </div>
  ),
};

// ─── error: true ──────────────────────────────────────────────────────────
export const ErrorState: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="filled" label="Email" type="email" defaultValue="invalid" error errorText="Invalid email" />
      <TextField variant="outlined" label="Email" type="email" defaultValue="invalid" error errorText="Invalid email" />
    </div>
  ),
};

// ─── disabled: true ───────────────────────────────────────────────────────
export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="filled" label="Filled" defaultValue="Disabled" disabled />
      <TextField variant="outlined" label="Outlined" defaultValue="Disabled" disabled />
    </div>
  ),
};

// ─── maxCharCount: character counter ──────────────────────────────────────
export const CharacterCounter: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField
        variant="filled"
        label="Bio"
        defaultValue="Hello"
        supportingText="Tell us about yourself"
        maxCharCount={50}
      />
      <TextField variant="outlined" label="Tweet" defaultValue="Short post" maxCharCount={280} />
    </div>
  ),
};

// ─── Full matrix: every variant × every state ─────────────────────────────
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const variants = ['filled', 'outlined'] as const;
    return (
      <div style={{ display: 'flex', gap: 48 }}>
        {variants.map((variant) => (
          <div key={variant} style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 260 }}>
            <p style={{ font: 'var(--md-sys-typescale-title-small)', textTransform: 'capitalize' }}>{variant}</p>
            <TextField variant={variant} label="Default" />
            <TextField variant={variant} label="Populated" defaultValue="Value" />
            <TextField variant={variant} label="With icon" leadingIcon={<SearchIcon aria-hidden="true" />} />
            <TextField variant={variant} label="Supporting" supportingText="Supporting text" />
            <TextField variant={variant} label="Error" errorText="Error message" />
            <TextField variant={variant} label="Disabled" defaultValue="Value" disabled />
            <TextField variant={variant} label="Counter" defaultValue="Hi" maxCharCount={20} />
          </div>
        ))}
      </div>
    );
  },
};
