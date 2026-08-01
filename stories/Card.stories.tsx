import type { Meta, StoryObj } from '@storybook/react-vite';
import { MoreHorizontalIcon } from 'lucide-react';
import { Button } from '../src/components/Button/button';
import { Card } from '../src/components/Card/card';
import { IconButton } from '../src/components/IconButton/icon-button';
import { ShowcaseGrid } from './_helpers/storybook-showcase';

const meta = {
  title: 'Containment/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    controls: {
      include: ['variant', 'disabled', 'ripple'],
      expanded: true,
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['elevated', 'filled', 'outlined'],
      description: 'Surface emphasis following the M3 card hierarchy.',
      table: { category: 'Appearance', defaultValue: { summary: 'filled' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Dims the surface and disables interaction when the card is clickable.',
      table: { category: 'State', defaultValue: { summary: 'false' } },
    },
    ripple: {
      control: 'boolean',
      description: 'Forces the surface ripple on/off. Defaults to on whenever an `onClick` handler is provided.',
      table: { category: 'Behavior' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    variant: 'filled',
    disabled: false,
    ripple: true,
  },
  render: (args) => (
    <Card {...args} style={{ width: 340, padding: 24 }}>
      <div className="sb-m3-demo-stack">
        <div className="sb-m3-demo-row" style={{ justifyContent: 'space-between' }}>
          <div className="sb-m3-demo-stack" style={{ gap: 8 }}>
            <p className="sb-m3-panel__eyebrow">Interactive surface</p>
            <h3 className="sb-m3-panel__title">Explore color sets</h3>
          </div>
          <IconButton variant="standard" size="sm" aria-label="More options">
            <MoreHorizontalIcon />
          </IconButton>
        </div>
        <p className="sb-m3-muted" style={{ margin: 0 }}>
          Cards can remain quiet containers or become touch targets when the whole surface represents an action.
        </p>
        <div className="sb-m3-demo-row">
          <Button variant="filled" size="sm" shape="round">
            Open
          </Button>
          <Button variant="text" size="sm" shape="round">
            Save for later
          </Button>
        </div>
      </div>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <ShowcaseGrid>
      <Card variant="elevated" style={{ padding: 24 }}>
        <div className="sb-m3-demo-stack">
          <p className="sb-m3-panel__eyebrow">Elevated</p>
          <h3 className="sb-m3-panel__title">Lifted above the page</h3>
          <p className="sb-m3-muted" style={{ margin: 0 }}>
            Useful when the card should stand apart from a busy surface.
          </p>
          <div className="sb-m3-demo-row">
            <Button variant="filled" size="sm" shape="round">
              Open
            </Button>
            <Button variant="text" size="sm" shape="round">
              Dismiss
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="filled" style={{ padding: 24 }}>
        <div className="sb-m3-demo-stack">
          <p className="sb-m3-panel__eyebrow">Filled</p>
          <h3 className="sb-m3-panel__title">Comfortable default surface</h3>
          <p className="sb-m3-muted" style={{ margin: 0 }}>
            Works well for everyday grouping, lists, and editorial sections.
          </p>
          <div className="sb-m3-demo-row">
            <Button variant="filled" size="sm" shape="round">
              View
            </Button>
            <Button variant="text" size="sm" shape="round">
              Save
            </Button>
          </div>
        </div>
      </Card>

      <Card variant="outlined" style={{ padding: 24 }}>
        <div className="sb-m3-demo-stack">
          <p className="sb-m3-panel__eyebrow">Outlined</p>
          <h3 className="sb-m3-panel__title">Low-emphasis separation</h3>
          <p className="sb-m3-muted" style={{ margin: 0 }}>
            Keeps the layout light while still separating blocks of content.
          </p>
          <div className="sb-m3-demo-row">
            <Button variant="outlined" size="sm" shape="round">
              Compare
            </Button>
            <Button variant="text" size="sm" shape="round">
              Later
            </Button>
          </div>
        </div>
      </Card>
    </ShowcaseGrid>
  ),
};

export const States: Story = {
  render: () => (
    <ShowcaseGrid>
      {/* Static (non-interactive) — no onClick, so no ripple */}
      <Card variant="filled" style={{ padding: 24 }}>
        <div className="sb-m3-demo-stack">
          <p className="sb-m3-panel__eyebrow">Static</p>
          <h3 className="sb-m3-panel__title">Quiet container</h3>
          <p className="sb-m3-muted" style={{ margin: 0 }}>
            Without an `onClick` the card stays a passive surface — no ripple, no button semantics.
          </p>
        </div>
      </Card>

      {/* Interactive — owns the surface ripple */}
      <Card variant="elevated" onClick={() => {}} style={{ padding: 24 }}>
        <div className="sb-m3-demo-stack">
          <p className="sb-m3-panel__eyebrow">Interactive</p>
          <h3 className="sb-m3-panel__title">Clickable surface</h3>
          <p className="sb-m3-muted" style={{ margin: 0 }}>
            With an `onClick` the whole surface becomes a touch target with a ripple.
          </p>
        </div>
      </Card>

      {/* Disabled interactive */}
      <Card variant="outlined" disabled onClick={() => {}} style={{ padding: 24 }}>
        <div className="sb-m3-demo-stack">
          <p className="sb-m3-panel__eyebrow">Disabled</p>
          <h3 className="sb-m3-panel__title">Interaction suppressed</h3>
          <p className="sb-m3-muted" style={{ margin: 0 }}>
            A disabled clickable card dims the surface and ignores pointer and keyboard activation.
          </p>
        </div>
      </Card>
    </ShowcaseGrid>
  ),
};
