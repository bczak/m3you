import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { IconButton } from '../src/components/ui/icon-button';
import { TextField } from '../src/components/ui/text-field';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'label', 'supportingText', 'errorText', 'error', 'disabled', 'prefixText', 'suffixText'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Default (Filled) ──────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="w-80">
        <TextField label="Label" value={value} onValueChange={setValue} />
      </div>
    );
  },
};

// ── Outlined ──────────────────────────────────────────────────────────────────

export const Outlined: Story = {
  render: () => {
    const [value, setValue] = React.useState('');
    return (
      <div className="w-80">
        <TextField variant="outlined" label="Label" value={value} onValueChange={setValue} />
      </div>
    );
  },
};

// ── All Variants Showcase ─────────────────────────────────────────────────────

export const AllVariantsShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">TextField States</h2>
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Filled */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Filled Variant</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Enabled (empty)</span>
              <TextField label="Label" />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">With value</span>
              <TextField label="Label" defaultValue="Input text" />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Error</span>
              <TextField label="Label" defaultValue="Input text" error errorText="Error message" />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Disabled (empty)</span>
              <TextField label="Label" disabled />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Disabled (with value)</span>
              <TextField label="Label" defaultValue="Input text" disabled />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">With supporting text</span>
              <TextField label="Label" supportingText="Supporting text" />
            </div>
          </div>
        </div>

        {/* Outlined */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground/80 text-sm">Outlined Variant</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Enabled (empty)</span>
              <TextField variant="outlined" label="Label" />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">With value</span>
              <TextField variant="outlined" label="Label" defaultValue="Input text" />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Error</span>
              <TextField variant="outlined" label="Label" defaultValue="Input text" error errorText="Error message" />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Disabled (empty)</span>
              <TextField variant="outlined" label="Label" disabled />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">Disabled (with value)</span>
              <TextField variant="outlined" label="Label" defaultValue="Input text" disabled />
            </div>
            <div className="space-y-2">
              <span className="text-foreground/40 text-xs">With supporting text</span>
              <TextField variant="outlined" label="Label" supportingText="Supporting text" />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ── With Icons ────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx={11} cy={11} r={8} />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const VisibilityIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx={12} cy={12} r={3} />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </svg>
);

const ClearIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx={12} cy={12} r={10} />
    <path d="m15 9-6 6M9 9l6 6" />
  </svg>
);

const ErrorIcon = () => (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={8} x2={12} y2={12} />
    <line x1={12} y1={16} x2={12.01} y2={16} />
  </svg>
);

export const WithIcons: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const PasswordField = () => {
      const [visible, setVisible] = React.useState(false);
      const [value, setValue] = React.useState('');
      return (
        <TextField
          label="Password"
          type={visible ? 'text' : 'password'}
          value={value}
          onValueChange={setValue}
          trailingIcon={
            <IconButton variant="text" size="sm" onClick={() => setVisible(!visible)}>
              {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          }
        />
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">TextField with Icons</h2>
        <div className="mx-auto max-w-md space-y-8">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Leading icon</span>
                <TextField label="Search" leadingIcon={<SearchIcon />} />
              </div>
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Trailing icon</span>
                <TextField label="Email" error errorText="Invalid email" trailingIcon={<ErrorIcon />} />
              </div>
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Both icons</span>
                <TextField label="Search" leadingIcon={<SearchIcon />} trailingIcon={<ClearIcon />} />
              </div>
              <div className="space-y-2">
                <span className="text-foreground/40 text-xs">Password toggle</span>
                <PasswordField />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// ── With Supporting Text ──────────────────────────────────────────────────────

export const WithSupportingText: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Supporting Text & Error Messages</h2>
      <div className="mx-auto max-w-md space-y-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <TextField label="Username" supportingText="Choose a unique username" />
            <TextField variant="outlined" label="Email" supportingText="We'll never share your email" />
            <TextField label="Password" type="password" error errorText="Password must be at least 8 characters" />
            <TextField
              variant="outlined"
              label="Username"
              defaultValue="ab"
              error
              errorText="Username must be at least 3 characters"
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

// ── Character Counter ─────────────────────────────────────────────────────────

export const CharacterCounter: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const CounterExample = () => {
      const [value, setValue] = React.useState('');
      const maxLen = 50;
      return (
        <TextField
          label="Bio"
          value={value}
          onValueChange={setValue}
          maxCharCount={maxLen}
          supportingText="Tell us about yourself"
          error={value.length > maxLen}
          errorText={value.length > maxLen ? 'Character limit exceeded' : undefined}
        />
      );
    };

    const OutlinedCounterExample = () => {
      const [value, setValue] = React.useState('');
      return (
        <TextField
          variant="outlined"
          label="Title"
          value={value}
          onValueChange={setValue}
          maxCharCount={100}
          supportingText="Enter a descriptive title"
        />
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Character Counter</h2>
        <div className="mx-auto max-w-md space-y-8">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <div className="space-y-6">
              <CounterExample />
              <OutlinedCounterExample />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// ── Prefix and Suffix ─────────────────────────────────────────────────────────

export const PrefixAndSuffix: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Prefix & Suffix Text</h2>
      <div className="mx-auto max-w-md space-y-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <TextField label="Amount" prefixText="$" type="number" supportingText="Enter amount in USD" />
            <TextField label="Weight" suffixText="kg" type="number" />
            <TextField variant="outlined" label="Website" prefixText="https://" />
            <TextField variant="outlined" label="Email" suffixText="@gmail.com" />
          </div>
        </div>
      </div>
    </div>
  ),
};

// ── Input Types ───────────────────────────────────────────────────────────────

export const InputTypes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Input Types</h2>
      <div className="mx-auto max-w-md space-y-8">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <div className="space-y-6">
            <TextField label="Text" type="text" />
            <TextField label="Email" type="email" />
            <TextField label="Password" type="password" />
            <TextField label="Number" type="number" />
            <TextField label="Phone" type="tel" />
            <TextField label="Search" type="search" />
            <TextField label="URL" type="url" />
          </div>
        </div>
      </div>
    </div>
  ),
};

// ── Form Example (Login) ──────────────────────────────────────────────────────

export const FormExample: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const LoginForm = () => {
      const [email, setEmail] = React.useState('');
      const [password, setPassword] = React.useState('');
      const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
      const [submitted, setSubmitted] = React.useState(false);

      const validate = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!email.includes('@')) newErrors.email = 'Enter a valid email';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };

      const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (validate()) {
          alert('Form submitted!');
        }
      };

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            variant="outlined"
            label="Email"
            type="email"
            value={email}
            onValueChange={setEmail}
            error={submitted && !!errors.email}
            errorText={submitted ? errors.email : undefined}
            leadingIcon={
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect width={20} height={16} x={2} y={4} rx={2} />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
          />
          <TextField
            variant="outlined"
            label="Password"
            type="password"
            value={password}
            onValueChange={setPassword}
            error={submitted && !!errors.password}
            errorText={submitted ? errors.password : undefined}
            leadingIcon={
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect width={18} height={11} x={3} y={11} rx={2} ry={2} />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Login Form Example</h2>
        <div className="mx-auto max-w-sm">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <h3 className="mb-6 text-center font-medium text-foreground text-lg">Welcome back</h3>
            <LoginForm />
          </div>
        </div>
      </div>
    );
  },
};

// ── Contact Form ──────────────────────────────────────────────────────────────

export const ContactForm: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Contact Form (Mixed Variants)</h2>
      <div className="mx-auto max-w-lg">
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-6 text-center font-medium text-foreground text-lg">Contact Us</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <TextField label="First Name" />
              <TextField label="Last Name" />
            </div>
            <TextField variant="outlined" label="Email" type="email" supportingText="We'll respond to this address" />
            <TextField variant="outlined" label="Phone" type="tel" supportingText="Optional" />
            <TextField label="Subject" maxCharCount={80} />
            <Button type="button" className="w-full">
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  ),
};

// ── Search Bar ────────────────────────────────────────────────────────────────

export const SearchBar: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const SearchInput = () => {
      const [value, setValue] = React.useState('');
      return (
        <TextField
          variant="outlined"
          label="Search"
          type="search"
          value={value}
          onValueChange={setValue}
          leadingIcon={<SearchIcon />}
          trailingIcon={
            value ? (
              <IconButton variant="text" size="sm" onClick={() => setValue('')}>
                <ClearIcon />
              </IconButton>
            ) : undefined
          }
        />
      );
    };

    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <h2 className="mb-8 text-center text-foreground/60 text-sm">Search Bar</h2>
        <div className="mx-auto max-w-md">
          <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
            <SearchInput />
          </div>
        </div>
      </div>
    );
  },
};
