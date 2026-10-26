import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
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
    'aria-label': 'Example switch',
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
        <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>No icons</span>
        <Switch aria-label="Example switch" variant={variant} />
        <Switch aria-label="Example switch" variant={variant} defaultChecked />
        <Switch aria-label="Example switch" variant={variant} disabled />
        <Switch aria-label="Example switch" variant={variant} defaultChecked disabled />
      </div>

      {/* With icons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        <span style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>With icons</span>
        <Switch aria-label="Example switch" variant={variant} showIcons />
        <Switch aria-label="Example switch" variant={variant} showIcons defaultChecked />
        <Switch aria-label="Example switch" variant={variant} showIcons disabled />
        <Switch aria-label="Example switch" variant={variant} showIcons defaultChecked disabled />
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

/** A token as the browser computes it *inside `scope`* (the preview may theme a wrapper), so it can be compared to a used value. */
const resolveColor = (scope: Element, token: string) => {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  scope.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

const parts = (input: HTMLElement) => {
  const label = input.closest('label') as HTMLLabelElement;
  return {
    label,
    track: label.querySelector('.md-switch__track') as HTMLElement,
    thumb: label.querySelector('.md-switch__thumb') as HTMLElement,
    stateLayer: label.querySelector('.md-switch__state-layer') as HTMLElement,
  };
};

export const KitGeometry: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Checks the switch against the M3 Expressive kit in a real browser. The component frame is the 52×32 track and the 48dp touch target overflows it (68×48). The handle sits at 8..24 (unselected), 4..28 (with icons) and 24..48 (selected) from the track’s outer edge, with the 40dp state layer centred on it and painted underneath. Keyboard focus draws a pill ring 2dp outside the track and gives the handle its focused role. Disabled icons, and the disabled unselected handle, are drawn at 38% opacity.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 48, padding: 48 }}>
      <Switch aria-label="Unselected" />
      <Switch aria-label="Unselected with icons" showIcons />
      <Switch aria-label="Selected" defaultChecked />
      <Switch aria-label="Disabled unselected" showIcons disabled />
      <Switch aria-label="Disabled selected" showIcons defaultChecked disabled />
    </div>
  ),
  play: async ({ canvas, step }) => {
    const cases = [
      { name: 'Unselected', left: 8, size: 16 },
      { name: 'Unselected with icons', left: 4, size: 24 },
      { name: 'Selected', left: 24, size: 24 },
    ] as const;

    for (const { name, left, size } of cases) {
      await step(`${name}: 52×32 frame, handle at ${left}..${left + size}, state layer centred on it`, async () => {
        const { label, track, thumb, stateLayer } = parts(canvas.getByRole('switch', { name }));
        const frame = label.getBoundingClientRect();
        const trackBox = track.getBoundingClientRect();
        const handle = thumb.getBoundingClientRect();
        const layer = stateLayer.getBoundingClientRect();

        await expect(frame.width).toBeCloseTo(52, 0);
        await expect(frame.height).toBeCloseTo(32, 0);
        await expect(trackBox.left).toBeCloseTo(frame.left, 0);
        await expect(trackBox.top).toBeCloseTo(frame.top, 0);
        await expect(handle.left - trackBox.left).toBeCloseTo(left, 0);
        await expect(handle.width).toBeCloseTo(size, 0);
        await expect(handle.top - trackBox.top).toBeCloseTo((32 - size) / 2, 0);
        await expect(layer.left + layer.width / 2).toBeCloseTo(handle.left + handle.width / 2, 0);
        await expect(layer.top + layer.height / 2).toBeCloseTo(handle.top + handle.height / 2, 0);
        // The handle paints over its state layer.
        await expect(Number(getComputedStyle(thumb).zIndex)).toBeGreaterThan(
          Number(getComputedStyle(stateLayer).zIndex),
        );
      });
    }

    await step(
      'the 68×48 touch target overflows the frame, and a press anywhere in it reaches the ripple',
      async () => {
        const { label, stateLayer } = parts(canvas.getByRole('switch', { name: 'Unselected' }));
        const rect = label.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        // Half of 68 and 48, minus a pixel so rounding cannot decide the test. Every point of the
        // target, the far end of the track included, lands on the state layer that hosts the Ripple,
        // so a press there draws the press ripple; the click still bubbles to the label and toggles.
        for (const [px, py] of [
          [x - 33, y],
          [x + 33, y],
          [x, y - 23],
          [x, y + 23],
        ]) {
          await expect(document.elementFromPoint(Math.round(px), Math.round(py))).toBe(stateLayer);
        }
        // A pixel past the target is outside the switch.
        for (const [px, py] of [
          [x - 35, y],
          [x + 35, y],
          [x, y - 25],
          [x, y + 25],
        ]) {
          await expect(label.contains(document.elementFromPoint(Math.round(px), Math.round(py)))).toBe(false);
        }
      },
    );

    await step('keyboard focus: pill ring 2dp outside the track, focused handle role', async () => {
      const input = canvas.getByRole('switch', { name: 'Selected' });
      const { label, track, thumb } = parts(input);
      input.focus();
      await expect(input.matches(':focus-visible')).toBe(true);

      const ring = getComputedStyle(track);
      await expect(ring.outlineStyle).toBe('solid');
      await expect(ring.outlineWidth).toBe('3px');
      await expect(ring.outlineOffset).toBe('2px');
      await expect(ring.outlineColor).toBe(resolveColor(label, '--md-sys-color-secondary'));
      await expect(ring.borderTopLeftRadius).toBe('16px');
      await expect(getComputedStyle(label).outlineStyle).toBe('none');
      // Resolve the colour outside waitFor: resolveColor appends and removes a
      // probe element, and waitFor re-runs its callback on every DOM mutation,
      // so probing inside it would retrigger itself forever and lock the page.
      const focusedHandle = resolveColor(label, '--md-sys-color-primary-container');
      await waitFor(() => expect(getComputedStyle(thumb).backgroundColor).toBe(focusedHandle));
      input.blur();
    });

    await step('disabled: icons and the unselected handle at 38% opacity, selected icon on-surface', async () => {
      const unselected = parts(canvas.getByRole('switch', { name: 'Disabled unselected' }));
      const selected = parts(canvas.getByRole('switch', { name: 'Disabled selected' }));
      await expect(getComputedStyle(unselected.thumb).opacity).toBe('0.38');
      await expect(getComputedStyle(unselected.thumb).backgroundColor).toBe(
        resolveColor(unselected.label, '--md-sys-color-on-surface'),
      );
      await expect(getComputedStyle(selected.thumb).opacity).toBe('1');
      for (const svg of [...unselected.thumb.querySelectorAll('svg'), ...selected.thumb.querySelectorAll('svg')]) {
        await expect(getComputedStyle(svg).opacity).toBe('0.38');
      }
      for (const svg of selected.thumb.querySelectorAll('svg')) {
        await expect(getComputedStyle(svg).color).toBe(resolveColor(selected.label, '--md-sys-color-on-surface'));
      }
    });
  },
};

export const RightToLeft: Story = {
  name: 'Right-to-left',
  parameters: {
    docs: {
      description: {
        story:
          'In right-to-left text the switch mirrors: the handle starts at the right edge of the track (8..24 from it, 4..28 with icons) and travels left to 24..48 when selected, with its state layer centred on it.',
      },
    },
  },
  render: () => (
    <div dir="rtl" style={{ display: 'flex', alignItems: 'center', gap: 48, padding: 48 }}>
      <Switch aria-label="Unselected" />
      <Switch aria-label="Unselected with icons" showIcons />
      <Switch aria-label="Selected" defaultChecked />
    </div>
  ),
  play: async ({ canvas, step }) => {
    const cases = [
      { name: 'Unselected', fromRight: 8, size: 16 },
      { name: 'Unselected with icons', fromRight: 4, size: 24 },
      { name: 'Selected', fromRight: 24, size: 24 },
    ] as const;

    for (const { name, fromRight, size } of cases) {
      await step(`${name}: handle at ${fromRight}..${fromRight + size} from the right edge`, async () => {
        const { track, thumb, stateLayer } = parts(canvas.getByRole('switch', { name }));
        const trackBox = track.getBoundingClientRect();
        const handle = thumb.getBoundingClientRect();
        const layer = stateLayer.getBoundingClientRect();
        await expect(trackBox.right - handle.right).toBeCloseTo(fromRight, 0);
        await expect(handle.width).toBeCloseTo(size, 0);
        await expect(layer.left + layer.width / 2).toBeCloseTo(handle.left + handle.width / 2, 0);
      });
    }
  },
};
