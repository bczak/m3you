import type { Meta, StoryObj } from '@storybook/react-vite';
import { LockIcon, MailIcon, SearchIcon } from 'lucide-react';
import { expect, waitFor } from 'storybook/test';
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
        'rows',
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
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url', 'textarea'],
      description: '`textarea` renders a multiline native control; other values render an `<input>`.',
      table: { category: 'Behavior', defaultValue: { summary: 'text' } },
    },
    rows: {
      control: { type: 'number', min: 1 },
      description: 'Initial visible line count when `type="textarea"`.',
      table: { category: 'Behavior', defaultValue: { summary: '2' } },
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
      description:
        'Error message — replaces the supporting text while `error` is set. Does not itself set the error state.',
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
      <TextField variant="filled" label="Error" error errorText="This field is required" />
      <TextField variant="filled" label="Disabled" defaultValue="Disabled value" disabled />
    </div>
  ),
};

export const Outlined: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
      <TextField variant="outlined" label="Empty" supportingText="Supporting text" />
      <TextField variant="outlined" label="Populated" defaultValue="Hello world" supportingText="Supporting text" />
      <TextField variant="outlined" label="Error" error errorText="This field is required" />
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

export const Multiline: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 360 }}>
      <TextField
        type="textarea"
        variant="filled"
        rows={3}
        label="Description"
        supportingText="Add any useful context"
        maxCharCount={240}
      />
      <TextField
        type="textarea"
        variant="outlined"
        rows={4}
        label="Notes"
        defaultValue={'First line\nSecond line'}
        maxCharCount={240}
      />
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

// ─── Leading icon in every state, measured against the M3 spec ───────────
// Spec (m3.material.io/components/text-fields/specs): container 56dp; icon
// 24dp, 12dp from the edge, vertically centred; 16dp between icon and text;
// label aligned with the input text. In the outlined style the label floats
// into a notch directly above the text start, not to the container's edge.
const leadingIconStates = ['rest', 'populated', 'error', 'disabled'] as const;

export const LeadingIconStates: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ display: 'flex', gap: 48 }}>
      {(['outlined', 'filled'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 280 }}>
          <p style={{ font: 'var(--md-sys-typescale-title-small)', textTransform: 'capitalize' }}>{variant}</p>
          {leadingIconStates.map((state) => (
            <TextField
              key={state}
              data-testid={`${variant}-${state}`}
              variant={variant}
              label="Email"
              type="email"
              leadingIcon={<MailIcon aria-hidden="true" />}
              defaultValue={state === 'rest' || state === 'error' ? undefined : 'name@company.com'}
              error={state === 'error'}
              errorText={state === 'error' ? 'Enter your email address' : undefined}
              // Disabled supporting text is 38% opacity by spec, which axe reads as a contrast violation.
              supportingText={state === 'disabled' ? undefined : 'Supporting text'}
              disabled={state === 'disabled'}
            />
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas, userEvent, step }) => {
    const ICON_EDGE = 12;
    const ICON = 24;
    const ICON_TEXT = 16;
    const TEXT_START = ICON_EDGE + ICON + ICON_TEXT;

    const geometry = (input: HTMLElement) => {
      const container = input.closest('.md-text-field__container') as HTMLElement;
      const box = container.getBoundingClientRect();
      const rel = (el: Element | null) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        return { x: r.x - box.x, y: r.y - box.y, w: r.width, h: r.height, cy: r.y + r.height / 2 - box.y };
      };
      return {
        height: box.height,
        icon: rel(container.querySelector('.md-text-field__leading-icon svg')),
        textStart: rel(input).x + Number.parseFloat(getComputedStyle(input).paddingInlineStart),
        label: rel(container.querySelector('.md-text-field__label')),
        notch: container.querySelector('.md-text-field__outline-notch')
          ? rel(container.querySelector('.md-text-field__outline-notch'))
          : null,
      };
    };

    for (const variant of ['outlined', 'filled'] as const) {
      for (const state of leadingIconStates) {
        await step(`${variant} ${state}: icon centred, 12dp in; text 16dp after it`, async () => {
          const input = canvas.getByTestId(`${variant}-${state}`);
          const g = geometry(input);
          await expect(g.height).toBe(56);
          await expect(g.icon.w).toBe(ICON);
          await expect(g.icon.h).toBe(ICON);
          await expect(g.icon.x).toBe(ICON_EDGE);
          await expect(g.icon.cy).toBe(g.height / 2);
          await expect(g.textStart).toBe(TEXT_START);
          await expect(g.label.x).toBe(TEXT_START);
        });
      }
    }

    await step('outlined: the label floats straight up into a notch above the text', async () => {
      const input = canvas.getByTestId('outlined-rest');
      const resting = geometry(input);
      await expect(resting.label.cy).toBe(resting.height / 2);

      await userEvent.click(input);
      await waitFor(async () => {
        const g = geometry(input);
        await expect(g.label.cy).toBe(0); // centred on the top edge of the outline
      });
      const floating = geometry(input);
      await expect(floating.label.x).toBe(TEXT_START);
      await expect(floating.notch?.x).toBe(TEXT_START - 4);
      await expect(floating.notch?.w).toBeCloseTo(floating.label.w + 8, 1);

      // The notch is a real gap in the stroke: its top edge is transparent and
      // the label carries no background to paint over anything.
      const container = input.closest('.md-text-field__container') as HTMLElement;
      const notch = container.querySelector('.md-text-field__outline-notch') as HTMLElement;
      const label = container.querySelector('.md-text-field__label') as HTMLElement;
      // Transparent colors may retain different hidden RGB channels across
      // Chromium environments; only the alpha channel affects rendering.
      await expect(getComputedStyle(notch).borderTopColor).toMatch(/,\s*0\)$/);
      await expect(getComputedStyle(label).backgroundColor).toMatch(/,\s*0\)$/);
      await userEvent.tab();
    });

    await step('filled: the label floats to the top padding, still aligned with the text', async () => {
      const input = canvas.getByTestId('filled-populated');
      const g = geometry(input);
      await expect(g.label.y).toBe(8);
      await expect(g.label.x).toBe(TEXT_START);
    });
  },
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
            <TextField variant={variant} label="Error" error errorText="Error message" />
            <TextField variant={variant} label="Disabled" defaultValue="Value" disabled />
            <TextField variant={variant} label="Counter" defaultValue="Hi" maxCharCount={20} />
          </div>
        ))}
      </div>
    );
  },
};
