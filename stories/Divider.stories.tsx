import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from '../src/components/Divider/divider';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Containment/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'orientation'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    variant: 'full-width',
    orientation: 'horizontal',
  },
  render: (args) =>
    args.orientation === 'vertical' ? (
      <div className="sb-m3-demo-row" style={{ height: 72 }}>
        <span>Left</span>
        <Divider {...args} style={{ height: '100%' }} />
        <span>Right</span>
      </div>
    ) : (
      <div style={{ width: 320 }}>
        <Divider {...args} />
      </div>
    ),
};

export const InContent: Story = {
  render: () => (
    <div style={{ maxWidth: 820 }}>
      <ShowcaseGrid>
        <ShowcasePanel
          eyebrow="Sections"
          title="Horizontal separators"
          description="Use full-width and inset dividers to create a clear content rhythm."
        >
          <div className="sb-m3-demo-stack">
            <div className="sb-m3-demo-stack" style={{ gap: 8 }}>
              <strong>Account</strong>
              <span className="sb-m3-muted">Personal details and preferences</span>
            </div>
            <Divider />
            <div className="sb-m3-demo-stack" style={{ gap: 8 }}>
              <strong>Notifications</strong>
              <span className="sb-m3-muted">Alerts, email cadence, and digest frequency</span>
            </div>
            <Divider variant="inset" />
            <div className="sb-m3-demo-stack" style={{ gap: 8 }}>
              <strong>Security</strong>
              <span className="sb-m3-muted">Passkeys, sessions, and device history</span>
            </div>
          </div>
        </ShowcasePanel>

        <ShowcasePanel
          eyebrow="Toolbar"
          title="Vertical separators"
          description="A vertical divider quietly separates controls in dense command rows."
        >
          <div className="sb-m3-demo-row" style={{ height: 48 }}>
            <span>Undo</span>
            <Divider orientation="vertical" style={{ height: '100%' }} />
            <span>Redo</span>
            <Divider orientation="vertical" variant="heavy" style={{ height: '100%' }} />
            <span>Share</span>
          </div>
        </ShowcasePanel>
      </ShowcaseGrid>
    </div>
  ),
};
