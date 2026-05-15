import type { Meta, StoryObj } from '@storybook/react-vite';
import { InfoIcon, SaveIcon } from 'lucide-react';
import { Button } from '../src/components/Button/button';
import {
  RichTooltip,
  RichTooltipContent,
  RichTooltipTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/Tooltip/tooltip';

const meta = {
  title: 'Containment/Tooltip',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// Plain Tooltip
// =============================================================================

const PlainStory = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', gap: '32px', alignItems: 'center', padding: '64px', justifyContent: 'center' }}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="tonal" />}>
          <SaveIcon />
          Save to favorites
        </TooltipTrigger>
        <TooltipContent>Plain tooltip</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button variant="tonal" />}>
          <InfoIcon />
          Grant value
        </TooltipTrigger>
        <TooltipContent>
          Grant value is calculated using the closing stock price from the day before the grant date. Amounts do not
          reflect tax withholdings.
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);

export const Plain: Story = {
  render: () => <PlainStory />,
};

// =============================================================================
// Plain Tooltip — Placements
// =============================================================================

const PlainPlacementsStory = () => (
  <TooltipProvider>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '48px',
        padding: '80px',
        justifyItems: 'center',
      }}
    >
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger render={<Button variant="outlined" />}>
            <InfoIcon />
            {side.charAt(0).toUpperCase() + side.slice(1)}
          </TooltipTrigger>
          <TooltipContent side={side}>Plain tooltip ({side})</TooltipContent>
        </Tooltip>
      ))}
    </div>
  </TooltipProvider>
);

export const PlainPlacements: Story = {
  render: () => <PlainPlacementsStory />,
};

// =============================================================================
// Rich Tooltip — Subhead + Body + Two Actions
// =============================================================================

const RichSubheadTwoButtonsStory = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="tonal" />}>
          <InfoIcon />
          Rich tooltip
        </RichTooltipTrigger>
        <RichTooltipContent
          headline="Rich tooltip"
          actions={
            <>
              <Button variant="text" size="xs">
                Action
              </Button>
              <Button variant="text" size="xs">
                Action
              </Button>
            </>
          }
        >
          Rich tooltips bring attention to a particular element of feature that warrants the user's focus.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  </TooltipProvider>
);

export const RichSubheadTwoButtons: Story = {
  render: () => <RichSubheadTwoButtonsStory />,
};

// =============================================================================
// Rich Tooltip — Subhead + Body + One Action
// =============================================================================

const RichSubheadOneButtonStory = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="tonal" />}>
          <InfoIcon />
          Rich tooltip
        </RichTooltipTrigger>
        <RichTooltipContent
          headline="Rich tooltip"
          actions={
            <Button variant="text" size="xs">
              Action
            </Button>
          }
        >
          Rich tooltips bring attention to a particular element of feature that warrants the user's focus.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  </TooltipProvider>
);

export const RichSubheadOneButton: Story = {
  render: () => <RichSubheadOneButtonStory />,
};

// =============================================================================
// Rich Tooltip — Subhead + Body (no actions)
// =============================================================================

const RichSubheadNoButtonsStory = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="tonal" />}>
          <InfoIcon />
          Rich tooltip
        </RichTooltipTrigger>
        <RichTooltipContent headline="Rich tooltip">
          Rich tooltips bring attention to a particular element of feature that warrants the user's focus.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  </TooltipProvider>
);

export const RichSubheadNoButtons: Story = {
  render: () => <RichSubheadNoButtonsStory />,
};

// =============================================================================
// Rich Tooltip — Body + One Action (no subhead)
// =============================================================================

const RichBodyOneButtonStory = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="tonal" />}>
          <InfoIcon />
          Rich tooltip
        </RichTooltipTrigger>
        <RichTooltipContent
          actions={
            <Button variant="text" size="xs">
              Action
            </Button>
          }
        >
          Rich tooltips bring attention to a particular element of feature that warrants the user's focus.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  </TooltipProvider>
);

export const RichBodyOneButton: Story = {
  render: () => <RichBodyOneButtonStory />,
};

// =============================================================================
// Rich Tooltip — Body + Two Actions (no subhead)
// =============================================================================

const RichBodyTwoButtonsStory = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="tonal" />}>
          <InfoIcon />
          Rich tooltip
        </RichTooltipTrigger>
        <RichTooltipContent
          actions={
            <>
              <Button variant="text" size="xs">
                Action
              </Button>
              <Button variant="text" size="xs">
                Action
              </Button>
            </>
          }
        >
          Rich tooltips bring attention to a particular element of feature that warrants the user's focus.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  </TooltipProvider>
);

export const RichBodyTwoButtons: Story = {
  render: () => <RichBodyTwoButtonsStory />,
};

// =============================================================================
// Showcase — All Variants × All Positions, forced open
// =============================================================================

const BODY = "Rich tooltips bring attention to a particular element of feature that warrants the user's focus.";
const TwoActions = () => (
  <>
    <Button variant="text" size="xs">
      Action
    </Button>
    <Button variant="text" size="xs">
      Action
    </Button>
  </>
);
const OneAction = () => (
  <Button variant="text" size="xs">
    Action
  </Button>
);

type Side = 'top' | 'bottom' | 'left' | 'right';

const sectionPadding: Record<Side, string> = {
  top: '160px 32px 32px',
  bottom: '32px 32px 160px',
  left: '32px 32px 32px 380px',
  right: '32px 380px 32px 32px',
};

const ShowcaseSection = ({ side }: { side: Side }) => (
  <div>
    <p
      style={{
        margin: '0 0 4px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#888',
      }}
    >
      Position: {side}
    </p>
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '200px',
        padding: sectionPadding[side],
        border: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
        borderRadius: '12px',
      }}
    >
      {/* Plain */}
      <Tooltip open>
        <TooltipTrigger render={<Button variant="tonal" size="xs" />}>Plain</TooltipTrigger>
        <TooltipContent side={side}>Plain tooltip</TooltipContent>
      </Tooltip>

      {/* Rich: Subhead + Body + 2 actions */}
      <RichTooltip open>
        <RichTooltipTrigger render={<Button variant="tonal" size="xs" />}>Subhead + 2 actions</RichTooltipTrigger>
        <RichTooltipContent side={side} headline="Rich tooltip" actions={<TwoActions />}>
          {BODY}
        </RichTooltipContent>
      </RichTooltip>

      {/* Rich: Subhead + Body + 1 action */}
      <RichTooltip open>
        <RichTooltipTrigger render={<Button variant="tonal" size="xs" />}>Subhead + 1 action</RichTooltipTrigger>
        <RichTooltipContent side={side} headline="Rich tooltip" actions={<OneAction />}>
          {BODY}
        </RichTooltipContent>
      </RichTooltip>

      {/* Rich: Subhead + Body (no actions) */}
      <RichTooltip open>
        <RichTooltipTrigger render={<Button variant="tonal" size="xs" />}>Subhead only</RichTooltipTrigger>
        <RichTooltipContent side={side} headline="Rich tooltip">
          {BODY}
        </RichTooltipContent>
      </RichTooltip>

      {/* Rich: Body + 1 action (no subhead) */}
      <RichTooltip open>
        <RichTooltipTrigger render={<Button variant="tonal" size="xs" />}>Body + 1 action</RichTooltipTrigger>
        <RichTooltipContent side={side} actions={<OneAction />}>
          {BODY}
        </RichTooltipContent>
      </RichTooltip>

      {/* Rich: Body + 2 actions (no subhead) */}
      <RichTooltip open>
        <RichTooltipTrigger render={<Button variant="tonal" size="xs" />}>Body + 2 actions</RichTooltipTrigger>
        <RichTooltipContent side={side} actions={<TwoActions />}>
          {BODY}
        </RichTooltipContent>
      </RichTooltip>
    </div>
  </div>
);

const ShowcaseStory = () => (
  <TooltipProvider>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', padding: '24px' }}>
      <ShowcaseSection side="top" />
      <ShowcaseSection side="bottom" />
      <ShowcaseSection side="left" />
      <ShowcaseSection side="right" />
    </div>
  </TooltipProvider>
);

export const Showcase: Story = {
  render: () => <ShowcaseStory />,
};
