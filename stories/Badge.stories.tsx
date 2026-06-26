import type { Meta, StoryObj } from '@storybook/react-vite';
import { BellIcon, MailIcon, UserIcon } from 'lucide-react';
import { Badge, BadgeAnchor } from '../src/components/Badge/badge';
import { IconButton } from '../src/components/IconButton/icon-button';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Communication/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['size', 'count', 'max', 'visible', 'color'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    count: 7,
    max: 99,
    visible: true,
    color: 'error',
  },
  render: (args) => (
    <BadgeAnchor badge={<Badge {...args} />} overlap="circular">
      <IconButton variant="filled" size="xs" aria-label="Notifications">
        <BellIcon />
      </IconButton>
    </BadgeAnchor>
  ),
};

export const AnchoredStates: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ShowcaseGrid dense>
        <ShowcasePanel
          eyebrow="Counts"
          title="Notification density"
          description="Large badges communicate volume while small badges are simple attention markers."
        >
          <div className="sb-m3-demo-row">
            <BadgeAnchor badge={<Badge count={3} />} overlap="circular">
              <IconButton variant="tonal" size="xs" aria-label="Messages">
                <MailIcon />
              </IconButton>
            </BadgeAnchor>
            <BadgeAnchor badge={<Badge count={27} />} overlap="circular">
              <IconButton variant="tonal" size="xs" aria-label="Messages">
                <MailIcon />
              </IconButton>
            </BadgeAnchor>
            <BadgeAnchor badge={<Badge count={120} max={99} />} overlap="circular">
              <IconButton variant="tonal" size="xs" aria-label="Messages">
                <MailIcon />
              </IconButton>
            </BadgeAnchor>
          </div>
        </ShowcasePanel>

        <ShowcasePanel
          eyebrow="Semantics"
          title="Accent variations"
          description="Named colors let badges stand out without inventing custom tokens in every usage."
        >
          <div className="sb-m3-demo-row">
            <BadgeAnchor badge={<Badge size="small" color="error" />} overlap="circular">
              <IconButton variant="outlined" size="xs" aria-label="Account">
                <UserIcon />
              </IconButton>
            </BadgeAnchor>
            <BadgeAnchor badge={<Badge count={4} color="primary" />} overlap="circular">
              <IconButton variant="outlined" size="xs" aria-label="Account">
                <UserIcon />
              </IconButton>
            </BadgeAnchor>
            <BadgeAnchor badge={<Badge count={8} color="secondary" />} overlap="circular">
              <IconButton variant="outlined" size="xs" aria-label="Account">
                <UserIcon />
              </IconButton>
            </BadgeAnchor>
            <BadgeAnchor badge={<Badge count={1} color="tertiary" />} overlap="circular">
              <IconButton variant="outlined" size="xs" aria-label="Account">
                <UserIcon />
              </IconButton>
            </BadgeAnchor>
          </div>
        </ShowcasePanel>
      </ShowcaseGrid>
    </div>
  ),
};

export const AnchorPositions: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'BadgeAnchor can place its badge at any corner via `position`, and inset it for square (`rectangular`) or round (`circular`) anchors via `overlap`.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center' }}>
      {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map((position) => (
        <div key={position} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <BadgeAnchor badge={<Badge count={5} />} position={position} overlap="rectangular">
            <IconButton variant="tonal" size="xs" aria-label="Messages">
              <MailIcon />
            </IconButton>
          </BadgeAnchor>
          <span style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)' }}>{position}</span>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <BadgeAnchor badge={<Badge count={5} />} overlap="circular">
          <IconButton variant="tonal" size="xs" aria-label="Messages">
            <MailIcon />
          </IconButton>
        </BadgeAnchor>
        <span style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-variant)' }}>circular</span>
      </div>
    </div>
  ),
};
