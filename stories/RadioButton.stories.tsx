import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { RadioButton, RadioGroup, RadioGroupItem } from '../src/components/ui/radio-button';

const meta = {
  title: 'Components/RadioButton',
  component: RadioButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'variant', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return <RadioButton checked={checked} onChange={() => setChecked(!checked)} />;
  },
};

export const AllStatesShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Radio Button States</h2>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Primary Variant */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Primary Variant</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Unselected</span>
              <RadioButton />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Selected</span>
              <RadioButton checked />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Unselected</span>
              <RadioButton disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Selected</span>
              <RadioButton checked disabled />
            </div>
          </div>
        </div>

        {/* Error Variant */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Error Variant</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Unselected</span>
              <RadioButton variant="error" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Selected</span>
              <RadioButton variant="error" checked />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Unselected</span>
              <RadioButton variant="error" disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Selected</span>
              <RadioButton variant="error" checked disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const RadioGroupBasic: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const BasicGroup = () => {
      const [value, setValue] = React.useState('option1');
      return (
        <div className="space-y-4">
          <RadioGroup value={value} onValueChange={setValue} className="space-y-1">
            {['option1', 'option2', 'option3'].map((opt) => {
              const id = `basic-${opt}`;
              return (
                <div key={opt} className="flex items-center">
                  <RadioGroupItem value={opt} id={id} />
                  <label htmlFor={id} className="-ml-2 cursor-pointer py-3 pr-3 text-foreground text-sm capitalize">
                    {opt.replace('option', 'Option ')}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
          <p className="text-foreground/60 text-xs">Selected: {value}</p>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Radio Group — Basic</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <BasicGroup />
          </div>
        </div>
      </div>
    );
  },
};

export const WithLabels: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ShippingMethod = () => {
      const [value, setValue] = React.useState('standard');
      return (
        <RadioGroup value={value} onValueChange={setValue} className="space-y-1">
          {[
            { value: 'standard', label: 'Standard shipping', description: 'Arrives in 5-7 business days' },
            { value: 'express', label: 'Express shipping', description: 'Arrives in 2-3 business days' },
            { value: 'overnight', label: 'Overnight shipping', description: 'Arrives next business day' },
          ].map((option) => {
            const id = `shipping-${option.value}`;
            return (
              <div key={option.value} className="flex items-start">
                <RadioGroupItem value={option.value} id={id} className="mt-0.5" />
                <label htmlFor={id} className="-ml-2 cursor-pointer py-2 pr-3">
                  <span className="block text-foreground text-sm">{option.label}</span>
                  <span className="block text-foreground/50 text-xs">{option.description}</span>
                </label>
              </div>
            );
          })}
        </RadioGroup>
      );
    };

    const PaymentMethod = () => {
      const [value, setValue] = React.useState('card');
      return (
        <RadioGroup value={value} onValueChange={setValue} className="space-y-1">
          {[
            { value: 'card', label: 'Credit / Debit Card' },
            { value: 'paypal', label: 'PayPal' },
            { value: 'bank', label: 'Bank Transfer' },
            { value: 'crypto', label: 'Cryptocurrency' },
          ].map((option) => {
            const id = `payment-${option.value}`;
            return (
              <div key={option.value} className="flex items-center">
                <RadioGroupItem value={option.value} id={id} />
                <label htmlFor={id} className="-ml-2 cursor-pointer py-3 pr-3 text-foreground text-sm">
                  {option.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Radio Buttons with Labels</h2>
        <div className="mx-auto max-w-md space-y-8">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-foreground/60 text-xs">Shipping Method</h3>
            <ShippingMethod />
          </div>
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-foreground/60 text-xs">Payment Method</h3>
            <PaymentMethod />
          </div>
        </div>
      </div>
    );
  },
};

export const ErrorVariant: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ValidationExample = () => {
      const [value, setValue] = React.useState('');
      const [submitted, setSubmitted] = React.useState(false);
      const showError = submitted && !value;

      return (
        <div className="space-y-4">
          <RadioGroup
            value={value}
            onValueChange={(v) => {
              setValue(v);
              if (submitted) setSubmitted(false);
            }}
            variant={showError ? 'error' : 'primary'}
            className="space-y-1"
          >
            {[
              { value: 'agree', label: 'I agree' },
              { value: 'disagree', label: 'I disagree' },
            ].map((option) => {
              const id = `validate-${option.value}`;
              return (
                <div key={option.value} className="flex items-center">
                  <RadioGroupItem value={option.value} id={id} />
                  <label
                    htmlFor={id}
                    className={`-ml-2 cursor-pointer py-3 pr-3 text-sm ${showError ? 'text-error' : 'text-foreground'}`}
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
          {showError && <p className="ml-12 text-error text-xs">Please select an option</p>}
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="mt-4 rounded-full bg-primary px-6 py-2 text-primary-foreground text-sm hover:bg-primary/90"
          >
            Submit
          </button>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Error Variant (Form Validation)</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-foreground/60 text-xs">Required Selection</h3>
            <ValidationExample />
          </div>
        </div>
      </div>
    );
  },
};

export const SettingsExample: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ThemeSettings = () => {
      const [theme, setTheme] = React.useState('system');
      const [density, setDensity] = React.useState('comfortable');

      return (
        <div className="space-y-8">
          <div>
            <h4 className="mb-3 font-medium text-foreground text-sm">Appearance</h4>
            <RadioGroup value={theme} onValueChange={setTheme} className="space-y-1">
              {[
                { value: 'light', label: 'Light', description: 'Always use light theme' },
                { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
                { value: 'system', label: 'System', description: 'Match system preference' },
              ].map((option) => {
                const id = `theme-${option.value}`;
                return (
                  <div key={option.value} className="flex items-start">
                    <RadioGroupItem value={option.value} id={id} className="mt-0.5" />
                    <label htmlFor={id} className="-ml-2 cursor-pointer py-2 pr-3">
                      <span className="block text-foreground text-sm">{option.label}</span>
                      <span className="block text-foreground/50 text-xs">{option.description}</span>
                    </label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-foreground text-sm">Display Density</h4>
            <RadioGroup value={density} onValueChange={setDensity} className="space-y-1">
              {[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'compact', label: 'Compact' },
              ].map((option) => {
                const id = `density-${option.value}`;
                return (
                  <div key={option.value} className="flex items-center">
                    <RadioGroupItem value={option.value} id={id} />
                    <label htmlFor={id} className="-ml-2 cursor-pointer py-3 pr-3 text-foreground text-sm">
                      {option.label}
                    </label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Settings Page Example</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <ThemeSettings />
          </div>
        </div>
      </div>
    );
  },
};

export const DisabledGroup: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Disabled Radio Group</h2>
      <div className="mx-auto max-w-md space-y-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Entire group disabled</h3>
          <RadioGroup value="option2" disabled className="space-y-1">
            {['option1', 'option2', 'option3'].map((opt) => {
              const id = `disabled-${opt}`;
              return (
                <div key={opt} className="flex items-center">
                  <RadioGroupItem value={opt} id={id} />
                  <label htmlFor={id} className="-ml-2 py-3 pr-3 text-foreground/38 text-sm capitalize">
                    {opt.replace('option', 'Option ')}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Individual item disabled</h3>
          <RadioGroup defaultValue="free" className="space-y-1">
            {[
              { value: 'free', label: 'Free tier', disabled: false },
              { value: 'pro', label: 'Pro tier', disabled: false },
              { value: 'enterprise', label: 'Enterprise (coming soon)', disabled: true },
            ].map((option) => {
              const id = `individual-${option.value}`;
              return (
                <div key={option.value} className="flex items-center">
                  <RadioGroupItem value={option.value} id={id} disabled={option.disabled} />
                  <label
                    htmlFor={id}
                    className={`-ml-2 py-3 pr-3 text-sm ${option.disabled ? 'text-foreground/38' : 'cursor-pointer text-foreground'}`}
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>
    </div>
  ),
};

export const HorizontalLayout: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const SizeSelector = () => {
      const [size, setSize] = React.useState('md');
      return (
        <RadioGroup value={size} onValueChange={setSize} className="flex flex-wrap gap-4">
          {[
            { value: 'xs', label: 'XS' },
            { value: 'sm', label: 'S' },
            { value: 'md', label: 'M' },
            { value: 'lg', label: 'L' },
            { value: 'xl', label: 'XL' },
          ].map((option) => {
            const id = `size-${option.value}`;
            return (
              <div key={option.value} className="flex items-center">
                <RadioGroupItem value={option.value} id={id} />
                <label htmlFor={id} className="-ml-2 cursor-pointer py-3 pr-1 font-medium text-foreground text-sm">
                  {option.label}
                </label>
              </div>
            );
          })}
        </RadioGroup>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Horizontal Layout</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-foreground/60 text-xs">Select Size</h3>
            <SizeSelector />
          </div>
        </div>
      </div>
    );
  },
};
