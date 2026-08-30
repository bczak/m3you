import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { OTPInput } from '../src/components/OTPInput/otp-input';

const meta = {
  title: 'Inputs/OTP Input',
  component: OTPInput,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['length', 'label', 'supportingText', 'errorText', 'error', 'disabled'],
      expanded: true,
    },
  },
  args: {
    length: 6,
    label: 'Verification code',
    error: false,
    disabled: false,
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OTPInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 336 }}>
      <OTPInput {...args} />
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div style={{ display: 'flex', width: 336, flexDirection: 'column', gap: 16 }}>
        <OTPInput label="Verification code" value={value} onValueChange={setValue} />
        <span style={{ font: 'var(--md-sys-typescale-body-medium)' }}>Value: {value || 'empty'}</span>
      </div>
    );
  },
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', width: 336, flexDirection: 'column', gap: 24 }}>
      <OTPInput label="Verification code" defaultValue="123" supportingText="Enter the code from your email" />
      <OTPInput label="Verification code" defaultValue="000000" error errorText="That code is not valid" />
      <OTPInput label="Verification code" defaultValue="123456" disabled />
    </div>
  ),
};
