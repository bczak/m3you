import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { CircularProgress } from '../src/components/CircularProgress/circular-progress';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Communication/Circular Progress',
  component: CircularProgress,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'value', 'type', 'thickness', 'strokeWidth', 'variant'],
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['flat', 'wavy'],
      description: 'Appearance: the classic `flat` ring or the M3 Expressive `wavy` indicator.',
      table: { category: 'Appearance', defaultValue: { summary: 'flat' } },
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Diameter step of the indicator.',
      table: { category: 'Appearance', defaultValue: { summary: 'md' } },
    },
    type: {
      control: 'inline-radio',
      options: ['determinate', 'indeterminate'],
      description: 'Determinate tracks a known `value`; indeterminate loops for unknown durations.',
      table: { category: 'Behavior', defaultValue: { summary: 'determinate' } },
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completion percentage (0–100). Ignored when `type="indeterminate"`.',
      table: { category: 'Behavior', defaultValue: { summary: '0' } },
    },
    strokeWidth: {
      control: { type: 'range', min: 1, max: 12, step: 1 },
      description: 'Thickness of the arc stroke in px. The ring keeps its radius and the box grows with the stroke.',
      table: { category: 'Appearance', defaultValue: { summary: '4' } },
    },
    thickness: {
      control: 'inline-radio',
      options: [4, 8],
      description:
        'Kit-backed physical stroke thickness (the box grows to 44px flat / 52px wavy at 8dp). This overrides the legacy free-form strokeWidth extension.',
      table: { category: 'Appearance', defaultValue: { summary: '4' } },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CircularProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    size: 'md',
    value: 64,
    type: 'determinate',
    strokeWidth: 4,
    variant: 'wavy',
  },
};

export const Sizes: Story = {
  render: () => (
    <ShowcaseGrid dense>
      <ShowcasePanel
        eyebrow="Determinate"
        title="Scale across surfaces"
        description="Size changes let the component fit compact actions or full-page loading states."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress size="sm" value={28} />
          <CircularProgress size="md" value={64} />
          <CircularProgress size="lg" value={88} />
        </div>
      </ShowcasePanel>

      <ShowcasePanel
        eyebrow="Indeterminate"
        title="Loading states"
        description="Use indeterminate progress when there is no meaningful completion value yet."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress size="sm" type="indeterminate" />
          <CircularProgress size="md" type="indeterminate" />
          <CircularProgress size="lg" type="indeterminate" />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};

export const Wavy: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ShowcaseGrid dense>
      <ShowcasePanel
        eyebrow="Expressive · Determinate"
        title="Wavy ring"
        description="The Material 3 Expressive circular indicator uses a sine-wave active arc with a flat track on the wave's crest and a 4dp gap. The completed ring stays wavy."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress variant="wavy" size="sm" value={28} />
          <CircularProgress variant="wavy" size="md" value={64} />
          <CircularProgress variant="wavy" size="lg" value={88} />
          <CircularProgress variant="wavy" size="md" value={100} />
        </div>
      </ShowcasePanel>

      <ShowcasePanel
        eyebrow="Expressive · Indeterminate"
        title="Wavy spinner"
        description="The active arc grows, holds, and shrinks while the whole spinner rotates — the M3 Expressive pattern."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress variant="wavy" size="sm" type="indeterminate" />
          <CircularProgress variant="wavy" size="md" type="indeterminate" />
          <CircularProgress variant="wavy" size="lg" type="indeterminate" />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};

export const Thickness: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ShowcaseGrid dense>
      <ShowcasePanel
        eyebrow="Determinate"
        title="4dp and 8dp"
        description="The ring keeps its radius and the box grows with the stroke: 40 → 44px flat, 48 → 52px wavy. The wave's amplitude does not change."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress value={64} thickness={4} />
          <CircularProgress value={64} thickness={8} />
          <CircularProgress value={64} variant="wavy" thickness={4} />
          <CircularProgress value={64} variant="wavy" thickness={8} />
        </div>
      </ShowcasePanel>

      <ShowcasePanel
        eyebrow="Indeterminate"
        title="4dp and 8dp"
        description="The track follows the moving arc and keeps a 4dp gap at both ends."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress type="indeterminate" thickness={4} />
          <CircularProgress type="indeterminate" thickness={8} />
          <CircularProgress type="indeterminate" variant="wavy" thickness={4} />
          <CircularProgress type="indeterminate" variant="wavy" thickness={8} />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};

/** A rule an app writes against its own class name, loaded after the library's stylesheet. */
const CONSUMER_RULE = '.sb-circular-progress-20 { width: 20px; height: 20px; }';

export const Sizing: Story = {
  parameters: {
    controls: {
      disable: true,
    },
  },
  render: () => (
    <ShowcaseGrid dense>
      <style>{CONSUMER_RULE}</style>
      <ShowcasePanel
        eyebrow="Sizing"
        title="Computed box or your own"
        description="The box comes from size and the stroke. A stylesheet rule on your own class, or a width and height in style, overrides it, and the whole ring scales to fit."
      >
        <div className="sb-m3-demo-row">
          <CircularProgress data-testid="flat" value={64} />
          <CircularProgress data-testid="flat-8" value={64} thickness={8} />
          <CircularProgress data-testid="wavy" value={64} variant="wavy" />
          <CircularProgress data-testid="flat-20" value={64} className="sb-circular-progress-20" />
          <CircularProgress data-testid="wavy-20" value={64} variant="wavy" className="sb-circular-progress-20" />
          <CircularProgress data-testid="flat-80" value={64} style={{ width: 80, height: 80 }} />
        </div>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
  play: async ({ canvas }) => {
    /** Rendered edge of the root, its svg, and how far the svg's viewBox is scaled to fill it. */
    const measure = (id: string) => {
      const root = canvas.getByTestId(id);
      const svg = root.querySelector('svg') as SVGSVGElement;
      return {
        root: root.getBoundingClientRect(),
        svg: svg.getBoundingClientRect(),
        scale: svg.getScreenCTM()?.a ?? Number.NaN,
      };
    };

    // [test id, rendered edge, the box the component computes (its viewBox)]
    const cases = [
      ['flat', 40, 40],
      ['flat-8', 44, 44],
      ['wavy', 48, 48],
      // A consumer's class rule wins over the box the component computes — on both variants.
      ['flat-20', 20, 40],
      ['wavy-20', 20, 48],
      ['flat-80', 80, 40],
    ] as const;
    for (const [id, edge, viewBox] of cases) {
      const { root, svg, scale } = measure(id);
      await expect(root.width).toBeCloseTo(edge);
      await expect(root.height).toBeCloseTo(edge);
      // The svg fills the box and the ring the component drew in viewBox units scales with it.
      await expect(svg.width).toBeCloseTo(edge);
      await expect(svg.height).toBeCloseTo(edge);
      await expect(scale).toBeCloseTo(edge / viewBox);
    }
  },
};
