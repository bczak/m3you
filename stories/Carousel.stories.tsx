import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../src/components/Button/button';
import { Carousel, CarouselItem, type CarouselLayout } from '../src/components/Carousel/carousel';

const meta = {
  title: 'Containment/Carousel',
  component: Carousel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'An accessible, native-scroll M3 Expressive carousel. It never auto-advances and disables parallax and morphing when reduced motion is requested.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj;

const visuals = [
  { label: 'Violet mountains', from: '#6750a4', to: '#e8def8', text: 'Highlands' },
  { label: 'Blue coastline', from: '#0061a4', to: '#d1e4ff', text: 'Coastline' },
  { label: 'Green forest', from: '#356a35', to: '#b7f397', text: 'Evergreen' },
  { label: 'Orange desert', from: '#8b5000', to: '#ffddb8', text: 'Desert light' },
  { label: 'Red city', from: '#ba1a1a', to: '#ffdad6', text: 'City rhythm' },
  { label: 'Teal lake', from: '#006a60', to: '#74f8e5', text: 'Still water' },
  { label: 'Plum night sky', from: '#7d5260', to: '#ffd8e4', text: 'Night sky' },
];
const studyIds = Array.from({ length: 20 }, (_, index) => `color-study-${index + 1}`);
const layouts: CarouselLayout[] = [
  'multi-browse',
  'uncontained',
  'uncontained-multi-aspect',
  'hero',
  'centered-hero',
  'full-screen',
];

function Visual({ from, to, text }: { from: string; to: string; text: string }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        width: '100%',
        height: '100%',
        padding: 20,
        boxSizing: 'border-box',
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <span
        style={{
          padding: '8px 12px',
          borderRadius: 12,
          background: 'color-mix(in srgb, var(--md-sys-color-surface) 82%, transparent)',
          color: 'var(--md-sys-color-on-surface)',
          fontWeight: 700,
        }}
      >
        {text}
      </span>
    </span>
  );
}

function Items({ count = visuals.length, multiAspect = false }: { count?: number; multiAspect?: boolean }) {
  const ratios = ['9 / 16', '3 / 4', '1 / 1', '4 / 3', '16 / 9'];
  return visuals.slice(0, count).map((visual, index) => (
    <CarouselItem
      key={visual.label}
      label={visual.label}
      aspectRatio={multiAspect ? ratios[index % ratios.length] : undefined}
      onClick={() => {}}
    >
      <Visual from={visual.from} to={visual.to} text={visual.text} />
    </CarouselItem>
  ));
}

const showAll = (
  <Button variant="text" size="sm">
    Show all
  </Button>
);

function LayoutExample({ layout, title }: { layout: CarouselLayout; title: string }) {
  return (
    <div style={{ paddingBlock: 24 }}>
      <Carousel label={title} title={title} layout={layout} showAllAction={showAll} itemHeight={260}>
        {Items({})}
      </Carousel>
    </div>
  );
}

function ResponsiveLayoutCoverage({ sizeClass }: { sizeClass: string }) {
  return (
    <div style={{ display: 'grid', gap: 24, paddingBlock: 16 }}>
      {layouts.map((layout) => (
        <Carousel
          key={layout}
          label={`${sizeClass} ${layout} carousel`}
          title={layout}
          layout={layout}
          showAllAction={layout === 'full-screen' ? undefined : showAll}
          itemHeight={layout === 'full-screen' ? 240 : 160}
        >
          {Items({ count: 5, multiAspect: layout === 'uncontained-multi-aspect' })}
        </Carousel>
      ))}
    </div>
  );
}

export const Playground: Story = {
  render: () => <LayoutExample layout="multi-browse" title="Recommended places" />,
};

export const MultiBrowse: Story = {
  render: () => <LayoutExample layout="multi-browse" title="Multi-browse" />,
};

export const Uncontained: Story = {
  render: () => <LayoutExample layout="uncontained" title="Uncontained" />,
};

export const UncontainedMultiAspect: Story = {
  render: () => (
    <div style={{ paddingBlock: 24 }}>
      <Carousel
        label="Variable aspect photography"
        title="Uncontained multi-aspect"
        layout="uncontained-multi-aspect"
        showAllAction={showAll}
        itemHeight={300}
      >
        {Items({ multiAspect: true })}
      </Carousel>
    </div>
  ),
};

export const Hero: Story = {
  render: () => <LayoutExample layout="hero" title="Hero" />,
};

export const CenteredHero: Story = {
  render: () => <LayoutExample layout="centered-hero" title="Centered hero" />,
};

export const FullScreen: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Full-screen is the immersive exception to the alternate “Show all” path. It always uses vertical snapping.',
      },
    },
  },
  render: () => (
    <Carousel label="Immersive travel stories" layout="full-screen" itemHeight={520}>
      {Items({ count: 5 })}
    </Carousel>
  ),
};

export const CompactViewport: Story = {
  parameters: { viewport: { defaultViewport: 'm3Compact' } },
  render: () => <ResponsiveLayoutCoverage sizeClass="Compact" />,
};

export const MediumViewport: Story = {
  parameters: { viewport: { defaultViewport: 'm3Medium' } },
  render: () => <ResponsiveLayoutCoverage sizeClass="Medium" />,
};

export const ExpandedViewport: Story = {
  parameters: { viewport: { defaultViewport: 'm3Expanded' } },
  render: () => <ResponsiveLayoutCoverage sizeClass="Expanded" />,
};

export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: () => <LayoutExample layout="multi-browse" title="Dark theme recommendations" />,
};

export const SingleItem: Story = {
  render: () => (
    <div style={{ paddingBlock: 24 }}>
      <Carousel label="Single recommendation" title="One result" showAllAction={showAll} itemHeight={240}>
        <CarouselItem label="Only destination" onClick={() => {}}>
          <Visual from="#6750a4" to="#e8def8" text="Only destination" />
        </CarouselItem>
      </Carousel>
    </div>
  ),
};

export const HighItemCount: Story = {
  render: () => (
    <div style={{ paddingBlock: 24 }}>
      <Carousel label="Twenty generated color studies" title="High item count" showAllAction={showAll} itemHeight={220}>
        {studyIds.map((id, index) => {
          const visual = visuals[index % visuals.length];
          return (
            <CarouselItem key={id} label={`Color study ${index + 1}`} onClick={() => {}}>
              <Visual from={visual.from} to={visual.to} text={`Study ${index + 1}`} />
            </CarouselItem>
          );
        })}
      </Carousel>
    </div>
  ),
};

export const DisabledItem: Story = {
  render: () => (
    <div style={{ paddingBlock: 24 }}>
      <Carousel label="Availability examples" title="Disabled item" showAllAction={showAll} itemHeight={240}>
        <CarouselItem label="Available destination" onClick={() => {}}>
          <Visual from="#356a35" to="#b7f397" text="Available" />
        </CarouselItem>
        <CarouselItem label="Unavailable destination" disabled onClick={() => {}}>
          <Visual from="#605d62" to="#e6e0e9" text="Unavailable" />
        </CarouselItem>
        <CarouselItem label="Another destination" href="#another-destination">
          <Visual from="#0061a4" to="#d1e4ff" text="Open details" />
        </CarouselItem>
      </Carousel>
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <Carousel
      label="Empty recommendations"
      title="No recommendations yet"
      showAllAction={
        <Button variant="text" size="sm" disabled>
          No items
        </Button>
      }
    >
      {[]}
    </Carousel>
  ),
};
