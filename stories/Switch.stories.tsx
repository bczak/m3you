import type { Meta, StoryObj } from '@storybook/react';
import { Bell, BellOff, Moon, Sun, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import * as React from 'react';
import { Switch } from '../src/components/ui/switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['checked', 'variant', 'showIcons', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default interactive story
export const Default: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} />;
  },
};

// With icons showing
export const WithIcons: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} showIcons />;
  },
};

// All states showcase
export const AllStatesShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Switch States</h2>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Primary Variant */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Primary Variant</h3>
          <div className="grid grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Off</span>
              <Switch />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">On</span>
              <Switch checked />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Off (with icon)</span>
              <Switch showIcons />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">On (with icon)</span>
              <Switch checked showIcons />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Off</span>
              <Switch disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled On</span>
              <Switch checked disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Off (icon)</span>
              <Switch showIcons disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled On (icon)</span>
              <Switch checked showIcons disabled />
            </div>
          </div>
        </div>

        {/* Error Variant */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Error Variant</h3>
          <div className="grid grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Off</span>
              <Switch variant="error" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">On</span>
              <Switch variant="error" checked />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Off (with icon)</span>
              <Switch variant="error" showIcons />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">On (with icon)</span>
              <Switch variant="error" checked showIcons />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-4 gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Off</span>
              <Switch variant="error" disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled On</span>
              <Switch variant="error" checked disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled Off (icon)</span>
              <Switch variant="error" showIcons disabled />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-foreground/40 text-xs">Disabled On (icon)</span>
              <Switch variant="error" checked showIcons disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Interactive toggle demo
export const InteractiveToggle: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InteractiveSwitch = () => {
      const [checked, setChecked] = React.useState(false);
      return (
        <div className="flex flex-col items-center gap-4">
          <Switch checked={checked} onCheckedChange={setChecked} showIcons />
          <span className="text-foreground/60 text-sm">State: {checked ? 'On' : 'Off'}</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Interactive Switch (Click to toggle)</h2>
        <div className="mx-auto max-w-md">
          <div className="flex justify-center rounded-lg border-2 border-outline-variant border-dashed p-8">
            <InteractiveSwitch />
          </div>
        </div>
      </div>
    );
  },
};

// With labels - settings panel style
export const WithLabels: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const LabeledSwitch = ({
      label,
      description,
      defaultChecked = false,
      variant = 'primary',
      showIcons = false,
    }: {
      label: string;
      description?: string;
      defaultChecked?: boolean;
      variant?: 'primary' | 'error';
      showIcons?: boolean;
    }) => {
      const [checked, setChecked] = React.useState(defaultChecked);
      const id = React.useId();
      return (
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col">
            <label htmlFor={id} className="cursor-pointer text-foreground text-sm">
              {label}
            </label>
            {description && <span className="text-foreground/50 text-xs">{description}</span>}
          </div>
          <Switch id={id} checked={checked} onCheckedChange={setChecked} variant={variant} showIcons={showIcons} />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Switches with Labels</h2>
        <div className="mx-auto max-w-md space-y-8">
          {/* Display settings */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-foreground/60 text-xs">Display Settings</h3>
            <div className="divide-y divide-outline-variant/30">
              <LabeledSwitch label="Dark mode" description="Switch to dark theme" defaultChecked />
              <LabeledSwitch label="Reduce motion" description="Minimize animations" />
              <LabeledSwitch label="High contrast" description="Increase text visibility" />
            </div>
          </div>

          {/* Notification settings */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-foreground/60 text-xs">Notifications</h3>
            <div className="divide-y divide-outline-variant/30">
              <LabeledSwitch label="Push notifications" defaultChecked showIcons />
              <LabeledSwitch label="Email notifications" defaultChecked showIcons />
              <LabeledSwitch label="SMS notifications" showIcons />
            </div>
          </div>

          {/* Privacy settings with error variant */}
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 text-foreground/60 text-xs">Privacy (Error Variant)</h3>
            <div className="divide-y divide-outline-variant/30">
              <LabeledSwitch
                label="Share usage data"
                description="Help improve our services"
                variant="error"
                showIcons
              />
              <LabeledSwitch
                label="Allow third-party cookies"
                description="Enable personalized ads"
                variant="error"
                showIcons
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Settings page example
export const SettingsPage: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const SettingRow = ({
      icon,
      label,
      description,
      defaultChecked = false,
    }: {
      icon: React.ReactNode;
      label: string;
      description: string;
      defaultChecked?: boolean;
    }) => {
      const [checked, setChecked] = React.useState(defaultChecked);
      const id = React.useId();
      return (
        <div className="flex items-center gap-4 py-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-surface-container text-foreground/60">
            {icon}
          </div>
          <div className="flex-1">
            <label htmlFor={id} className="cursor-pointer font-medium text-foreground text-sm">
              {label}
            </label>
            <p className="text-foreground/50 text-xs">{description}</p>
          </div>
          <Switch id={id} checked={checked} onCheckedChange={setChecked} showIcons />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Settings Page Example</h2>
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl bg-surface-container-low p-6 shadow-md">
            <h3 className="mb-2 font-semibold text-foreground text-lg">Quick Settings</h3>
            <p className="mb-6 text-foreground/50 text-sm">Manage your preferences</p>
            <div className="divide-y divide-outline-variant/30">
              <SettingRow
                icon={<Wifi className="size-5" />}
                label="Wi-Fi"
                description="Connected to Home Network"
                defaultChecked
              />
              <SettingRow
                icon={<Bell className="size-5" />}
                label="Notifications"
                description="Allow push notifications"
                defaultChecked
              />
              <SettingRow
                icon={<Moon className="size-5" />}
                label="Dark Mode"
                description="Switch to dark theme"
                defaultChecked
              />
              <SettingRow
                icon={<Volume2 className="size-5" />}
                label="Sound"
                description="Enable sound effects"
                defaultChecked
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Feature flags example
export const FeatureFlags: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const FeatureToggle = ({
      name,
      description,
      defaultEnabled = false,
      isNew = false,
      isBeta = false,
    }: {
      name: string;
      description: string;
      defaultEnabled?: boolean;
      isNew?: boolean;
      isBeta?: boolean;
    }) => {
      const [enabled, setEnabled] = React.useState(defaultEnabled);
      const id = React.useId();
      return (
        <div className="flex items-start gap-4 rounded-lg bg-surface-container-low p-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <label htmlFor={id} className="cursor-pointer font-medium text-foreground text-sm">
                {name}
              </label>
              {isNew && (
                <span className="rounded-full bg-tertiary px-2 py-0.5 font-medium text-tertiary-foreground text-xs">
                  NEW
                </span>
              )}
              {isBeta && (
                <span className="rounded-full bg-secondary-container px-2 py-0.5 font-medium text-secondary-container-foreground text-xs">
                  BETA
                </span>
              )}
            </div>
            <p className="mt-1 text-foreground/50 text-xs">{description}</p>
          </div>
          <Switch id={id} checked={enabled} onCheckedChange={setEnabled} showIcons />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Feature Flags</h2>
        <div className="mx-auto max-w-lg space-y-3">
          <FeatureToggle name="AI Suggestions" description="Get smart suggestions while typing" defaultEnabled isNew />
          <FeatureToggle name="Advanced Analytics" description="Access detailed performance metrics" isBeta />
          <FeatureToggle name="Keyboard Shortcuts" description="Enable keyboard navigation" defaultEnabled />
          <FeatureToggle name="Auto-save Drafts" description="Automatically save your work" defaultEnabled />
          <FeatureToggle name="Experimental Features" description="Try features before they're released" />
        </div>
      </div>
    );
  },
};

// Form validation example
export const FormValidation: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const FormExample = () => {
      const [termsAccepted, setTermsAccepted] = React.useState(false);
      const [marketingOptIn, setMarketingOptIn] = React.useState(false);
      const [submitted, setSubmitted] = React.useState(false);

      const hasError = submitted && !termsAccepted;

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (termsAccepted) {
          alert('Form submitted successfully!');
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label
                  htmlFor="terms"
                  className={`cursor-pointer text-sm ${hasError ? 'text-error' : 'text-foreground'}`}
                >
                  Accept Terms & Conditions
                </label>
                {hasError && <p className="text-error text-xs">Required to continue</p>}
              </div>
              <Switch
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(checked);
                  if (checked) setSubmitted(false);
                }}
                variant={hasError ? 'error' : 'primary'}
                showIcons
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <label htmlFor="marketing" className="cursor-pointer text-foreground text-sm">
                  Receive marketing emails
                </label>
                <p className="text-foreground/50 text-xs">Optional</p>
              </div>
              <Switch id="marketing" checked={marketingOptIn} onCheckedChange={setMarketingOptIn} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
          >
            Submit
          </button>
        </form>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Form Validation Example</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-4 font-medium text-foreground">Create Account</h3>
            <FormExample />
          </div>
        </div>
      </div>
    );
  },
};

// Visual state indicators
export const WithStateIndicators: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const StatefulSwitch = ({
      onLabel,
      offLabel,
      onIcon,
      offIcon,
      defaultChecked = false,
    }: {
      onLabel: string;
      offLabel: string;
      onIcon: React.ReactNode;
      offIcon: React.ReactNode;
      defaultChecked?: boolean;
    }) => {
      const [checked, setChecked] = React.useState(defaultChecked);
      return (
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 transition-opacity ${!checked ? 'opacity-100' : 'opacity-30'}`}>
            {offIcon}
            <span className="text-foreground/60 text-sm">{offLabel}</span>
          </div>
          <Switch checked={checked} onCheckedChange={setChecked} showIcons />
          <div className={`flex items-center gap-2 transition-opacity ${checked ? 'opacity-100' : 'opacity-30'}`}>
            {onIcon}
            <span className="text-foreground/60 text-sm">{onLabel}</span>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Switches with State Indicators</h2>
        <div className="mx-auto max-w-md space-y-8">
          <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-outline-variant border-dashed p-6">
            <StatefulSwitch
              offLabel="Light"
              onLabel="Dark"
              offIcon={<Sun className="size-5 text-yellow-500" />}
              onIcon={<Moon className="size-5 text-blue-400" />}
              defaultChecked
            />
            <StatefulSwitch
              offLabel="Muted"
              onLabel="Sound On"
              offIcon={<VolumeX className="size-5 text-foreground/40" />}
              onIcon={<Volume2 className="size-5 text-primary" />}
              defaultChecked
            />
            <StatefulSwitch
              offLabel="Offline"
              onLabel="Online"
              offIcon={<WifiOff className="size-5 text-foreground/40" />}
              onIcon={<Wifi className="size-5 text-primary" />}
              defaultChecked
            />
            <StatefulSwitch
              offLabel="Silent"
              onLabel="Alerts On"
              offIcon={<BellOff className="size-5 text-foreground/40" />}
              onIcon={<Bell className="size-5 text-primary" />}
            />
          </div>
        </div>
      </div>
    );
  },
};

// Comparison: with and without icons
export const IconComparison: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ComparisonRow = ({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) => {
      const [withoutIcon, setWithoutIcon] = React.useState(defaultChecked);
      const [withIcon, setWithIcon] = React.useState(defaultChecked);
      return (
        <div className="grid grid-cols-3 items-center gap-4 py-2">
          <span className="text-foreground/60 text-sm">{label}</span>
          <div className="flex justify-center">
            <Switch checked={withoutIcon} onCheckedChange={setWithoutIcon} />
          </div>
          <div className="flex justify-center">
            <Switch checked={withIcon} onCheckedChange={setWithIcon} showIcons />
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Icon Comparison</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <div className="mb-4 grid grid-cols-3 gap-4 border-outline-variant/30 border-b pb-2">
              <span className="text-foreground/40 text-xs">Setting</span>
              <span className="text-center text-foreground/40 text-xs">Without Icons</span>
              <span className="text-center text-foreground/40 text-xs">With Icons</span>
            </div>
            <ComparisonRow label="Wi-Fi" defaultChecked />
            <ComparisonRow label="Bluetooth" />
            <ComparisonRow label="Airplane Mode" />
            <ComparisonRow label="Do Not Disturb" defaultChecked />
          </div>
        </div>
      </div>
    );
  },
};

// Accessibility demo
export const AccessibilityDemo: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const AccessibleSwitch = ({
      label,
      description,
      defaultChecked = false,
    }: {
      label: string;
      description: string;
      defaultChecked?: boolean;
    }) => {
      const [checked, setChecked] = React.useState(defaultChecked);
      const id = React.useId();
      const descriptionId = React.useId();
      return (
        <div className="flex items-start justify-between gap-4 py-3">
          <div>
            <label htmlFor={id} className="cursor-pointer font-medium text-foreground text-sm">
              {label}
            </label>
            <p id={descriptionId} className="text-foreground/50 text-xs">
              {description}
            </p>
          </div>
          <Switch id={id} checked={checked} onCheckedChange={setChecked} aria-describedby={descriptionId} showIcons />
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Accessibility Demo</h2>
        <div className="mx-auto max-w-md space-y-6">
          <div className="rounded-lg bg-surface-container-low p-4">
            <p className="mb-4 text-foreground/60 text-sm">These switches demonstrate accessibility best practices:</p>
            <ul className="mb-4 list-inside list-disc space-y-1 text-foreground/50 text-xs">
              <li>
                Role: <code className="rounded bg-surface-container-highest px-1">switch</code>
              </li>
              <li>
                Proper <code className="rounded bg-surface-container-highest px-1">aria-checked</code> state
              </li>
              <li>Associated labels with htmlFor/id</li>
              <li>Descriptions via aria-describedby</li>
              <li>Keyboard accessible (Tab + Space/Enter)</li>
              <li>Icons provide visual redundancy</li>
            </ul>
          </div>
          <div className="divide-y divide-outline-variant/30 rounded-lg border-2 border-outline-variant border-dashed p-6">
            <AccessibleSwitch
              label="Screen Reader Mode"
              description="Enable enhanced screen reader support"
              defaultChecked
            />
            <AccessibleSwitch label="Reduce Motion" description="Minimize animations throughout the interface" />
            <AccessibleSwitch label="High Contrast" description="Increase contrast for better visibility" />
          </div>
          <p className="text-center text-foreground/40 text-xs">
            Try navigating with Tab and toggling with Space or Enter
          </p>
        </div>
      </div>
    );
  },
};
