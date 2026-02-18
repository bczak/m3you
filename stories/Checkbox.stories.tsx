import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Checkbox } from '../src/components/ui/checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'indeterminate', 'variant', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return <Checkbox checked={checked} onCheckedChange={setChecked} />;
  },
};

// All states showcase
export const AllStatesShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Checkbox States</h2>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Primary Variant */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">Primary Variant</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Unchecked</span>
              <Checkbox />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Checked</span>
              <Checkbox checked />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Indeterminate</span>
              <Checkbox indeterminate />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Checkbox disabled />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled Unchecked</span>
              <Checkbox disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled Checked</span>
              <Checkbox checked disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled Indeterminate</span>
              <Checkbox indeterminate disabled />
            </div>
            <div />
          </div>
        </div>

        {/* Error Variant */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-on-background/80 text-sm">Error Variant</h3>
          <div className="grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Unchecked</span>
              <Checkbox variant="error" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Checked</span>
              <Checkbox variant="error" checked />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Indeterminate</span>
              <Checkbox variant="error" indeterminate />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled</span>
              <Checkbox variant="error" disabled />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-4 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled Unchecked</span>
              <Checkbox variant="error" disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled Checked</span>
              <Checkbox variant="error" checked disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-on-background/40 text-xs">Disabled Indeterminate</span>
              <Checkbox variant="error" indeterminate disabled />
            </div>
            <div />
          </div>
        </div>
      </div>
    </div>
  ),
};

// Interactive toggle
export const InteractiveToggle: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InteractiveCheckbox = () => {
      const [checked, setChecked] = React.useState(false);
      return (
        <div className="flex flex-col items-center gap-4">
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <span className="text-on-background/60 text-sm">State: {checked ? 'Checked' : 'Unchecked'}</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-on-background/60 text-sm">Interactive Checkbox (Click to toggle)</h2>
        <div className="mx-auto max-w-md">
          <div className="flex justify-center rounded-lg border-2 border-outline-variant border-dashed p-8">
            <InteractiveCheckbox />
          </div>
        </div>
      </div>
    );
  },
};

// With labels - using a wrapper label approach
export const WithLabels: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const LabeledCheckbox = ({
      label,
      defaultChecked = false,
      variant = 'primary',
    }: {
      label: string;
      defaultChecked?: boolean;
      variant?: 'primary' | 'error';
    }) => {
      const [checked, setChecked] = React.useState(defaultChecked);
      const id = React.useId();
      return (
        <div className="flex items-center">
          <Checkbox id={id} checked={checked} onCheckedChange={setChecked} variant={variant} />
          <label htmlFor={id} className="-ml-2 cursor-pointer py-3 pr-3 text-on-background text-sm">
            {label}
          </label>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-on-background/60 text-sm">Checkboxes with Labels</h2>
        <div className="mx-auto max-w-md space-y-8">
          {/* Terms example */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-on-background/60 text-xs">Terms & Conditions</h3>
            <div className="space-y-2">
              <LabeledCheckbox label="I agree to the Terms of Service" />
              <LabeledCheckbox label="I agree to the Privacy Policy" />
              <LabeledCheckbox label="Subscribe to newsletter" defaultChecked />
            </div>
          </div>

          {/* Preferences example */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-on-background/60 text-xs">Notification Preferences</h3>
            <div className="space-y-2">
              <LabeledCheckbox label="Email notifications" defaultChecked />
              <LabeledCheckbox label="Push notifications" defaultChecked />
              <LabeledCheckbox label="SMS notifications" />
            </div>
          </div>

          {/* Error example */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-on-background/60 text-xs">Required Field (Error Variant)</h3>
            <div className="space-y-2">
              <LabeledCheckbox label="Accept terms to continue" variant="error" />
              <span className="ml-12 block text-error text-xs">This field is required</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Parent-child group with indeterminate state
export const ParentChildGroup: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ParentChildCheckboxes = () => {
      const [children, setChildren] = React.useState([
        { id: 1, label: 'Option 1', checked: true },
        { id: 2, label: 'Option 2', checked: false },
        { id: 3, label: 'Option 3', checked: true },
      ]);

      const parentId = React.useId();
      const allChecked = children.every((c) => c.checked);
      const someChecked = children.some((c) => c.checked);
      const isIndeterminate = someChecked && !allChecked;

      const handleParentChange = (checked: boolean) => {
        setChildren((prev) => prev.map((c) => ({ ...c, checked })));
      };

      const handleChildChange = (id: number, checked: boolean) => {
        setChildren((prev) => prev.map((c) => (c.id === id ? { ...c, checked } : c)));
      };

      return (
        <div className="space-y-2">
          {/* Parent checkbox */}
          <div className="flex items-center">
            <Checkbox
              id={parentId}
              checked={allChecked}
              indeterminate={isIndeterminate}
              onCheckedChange={handleParentChange}
            />
            <label htmlFor={parentId} className="-ml-2 cursor-pointer py-3 pr-3 font-medium text-on-background text-sm">
              Select All
            </label>
          </div>

          {/* Child checkboxes */}
          <div className="ml-8 space-y-1">
            {children.map((child) => {
              const childId = `child-${child.id}`;
              return (
                <div key={child.id} className="flex items-center">
                  <Checkbox
                    id={childId}
                    checked={child.checked}
                    onCheckedChange={(checked) => handleChildChange(child.id, checked)}
                  />
                  <label htmlFor={childId} className="-ml-2 cursor-pointer py-3 pr-3 text-on-background text-sm">
                    {child.label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-on-background/60 text-sm">
          Parent-Child Checkbox Group (Indeterminate State)
        </h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-on-background/60 text-xs">Select Options</h3>
            <ParentChildCheckboxes />
          </div>
        </div>
      </div>
    );
  },
};

// Error variant for form validation
export const ErrorVariant: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ValidationExample = () => {
      const [accepted, setAccepted] = React.useState(false);
      const [submitted, setSubmitted] = React.useState(false);
      const showError = submitted && !accepted;
      const id = React.useId();

      return (
        <div className="space-y-4">
          <div className="flex items-center">
            <Checkbox
              id={id}
              checked={accepted}
              onCheckedChange={(checked) => {
                setAccepted(checked);
                if (checked) setSubmitted(false);
              }}
              variant={showError ? 'error' : 'primary'}
            />
            <label
              htmlFor={id}
              className={`-ml-2 cursor-pointer py-3 pr-3 text-sm ${showError ? 'text-error' : 'text-on-background'}`}
            >
              I accept the terms and conditions
            </label>
          </div>
          {showError && <p className="ml-12 text-error text-xs">You must accept the terms to continue</p>}
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            className="mt-4 rounded-full bg-primary px-6 py-2 text-on-primary text-sm hover:bg-primary/90"
          >
            Submit
          </button>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-on-background/60 text-sm">Error Variant (Form Validation)</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-on-background/60 text-xs">Form with Required Checkbox</h3>
            <ValidationExample />
          </div>
        </div>
      </div>
    );
  },
};
