import type { Meta, StoryObj } from '@storybook/react';
import { Headphones, Mic, Radio, Settings, Volume2, Wifi } from 'lucide-react';
import { Divider } from '../src/components/ui/divider';
import { IconButton } from '../src/components/ui/icon-button';

const meta = {
  title: 'Components/Divider',
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

/* ---------------------------------------------------------------------------
   Default
   --------------------------------------------------------------------------- */

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <Divider />
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   Variants
   --------------------------------------------------------------------------- */

export const Variants: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Divider Variants</h2>
      <div className="mx-auto flex max-w-md flex-col gap-8">
        {/* Full-width */}
        <div className="overflow-hidden rounded-xl bg-surface-container">
          <p className="px-4 pt-4 pb-2 text-foreground/60 text-xs">full-width (default)</p>
          <p className="px-4 text-foreground text-sm">Content above</p>
          <Divider className="my-3" />
          <p className="px-4 pb-4 text-foreground text-sm">Content below</p>
        </div>

        {/* Inset */}
        <div className="overflow-hidden rounded-xl bg-surface-container">
          <p className="px-4 pt-4 pb-2 text-foreground/60 text-xs">inset</p>
          <p className="px-4 text-foreground text-sm">Content above</p>
          <Divider variant="inset" className="my-3" />
          <p className="px-4 pb-4 text-foreground text-sm">Content below</p>
        </div>
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   Vertical
   --------------------------------------------------------------------------- */

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-3">
      <IconButton variant="text" size="sm">
        <Volume2 />
      </IconButton>
      <Divider orientation="vertical" />
      <IconButton variant="text" size="sm">
        <Mic />
      </IconButton>
      <Divider orientation="vertical" />
      <IconButton variant="text" size="sm">
        <Headphones />
      </IconButton>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   List Example — Podcast list with inset dividers
   --------------------------------------------------------------------------- */

const ListItem = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ElementType }) => (
  <div className="flex items-center gap-4 px-4 py-3">
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-container-foreground">
      <Icon className="size-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="text-foreground/60 text-xs">{subtitle}</p>
    </div>
  </div>
);

export const ListExample: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">List with Inset Dividers</h2>
      <div className="mx-auto max-w-sm overflow-hidden rounded-xl bg-surface-container">
        <ListItem icon={Radio} title="The Daily Mix" subtitle="Updated today" />
        <Divider variant="inset" />
        <ListItem icon={Headphones} title="Deep Focus" subtitle="50 songs" />
        <Divider variant="inset" />
        <ListItem icon={Mic} title="Tech Talk Weekly" subtitle="New episode" />
        <Divider variant="inset" />
        <ListItem icon={Volume2} title="Ambient Sounds" subtitle="3 hours" />
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   Grouping Example — Settings-style list with full-width dividers
   --------------------------------------------------------------------------- */

export const GroupingExample: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Grouping with Full-width Dividers</h2>
      <div className="mx-auto max-w-sm overflow-hidden rounded-xl bg-surface-container">
        {/* Section 1 */}
        <div className="px-4 pt-4 pb-1">
          <p className="font-medium text-primary text-xs">Network</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <Wifi className="size-5 text-foreground/60" />
          <p className="text-foreground text-sm">Wi-Fi</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <Radio className="size-5 text-foreground/60" />
          <p className="text-foreground text-sm">Bluetooth</p>
        </div>

        <Divider />

        {/* Section 2 */}
        <div className="px-4 pt-4 pb-1">
          <p className="font-medium text-primary text-xs">Sound</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <Volume2 className="size-5 text-foreground/60" />
          <p className="text-foreground text-sm">Volume</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-3">
          <Mic className="size-5 text-foreground/60" />
          <p className="text-foreground text-sm">Microphone</p>
        </div>

        <Divider />

        {/* Section 3 */}
        <div className="px-4 pt-4 pb-1">
          <p className="font-medium text-primary text-xs">General</p>
        </div>
        <div className="flex items-center gap-4 px-4 py-3 pb-4">
          <Settings className="size-5 text-foreground/60" />
          <p className="text-foreground text-sm">Advanced settings</p>
        </div>
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   Complete Showcase
   --------------------------------------------------------------------------- */

export const CompleteShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Complete Divider Showcase</h2>

      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        {/* Horizontal variants */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Horizontal Variants</h3>
          <div className="flex flex-col gap-6">
            {(['full-width', 'inset'] as const).map((v) => (
              <div key={v} className="overflow-hidden rounded-xl bg-surface-container">
                <p className="px-4 pt-4 pb-1 text-foreground/40 text-xs">{v}</p>
                <p className="px-4 text-foreground text-sm">Above</p>
                <Divider variant={v} className="my-3" />
                <p className="px-4 pb-4 text-foreground text-sm">Below</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">Vertical Orientation</h3>
          <div className="rounded-xl bg-surface-container p-4">
            <div className="flex h-10 items-center gap-3">
              <span className="text-foreground text-sm">Item A</span>
              <Divider orientation="vertical" />
              <span className="text-foreground text-sm">Item B</span>
              <Divider orientation="vertical" />
              <span className="text-foreground text-sm">Item C</span>
            </div>
          </div>
        </div>

        {/* On different backgrounds */}
        <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
          <h3 className="mb-4 text-foreground/60 text-xs">On Different Backgrounds</h3>
          <div className="flex flex-col gap-4">
            {(
              [
                ['bg-surface', 'Surface'],
                ['bg-surface-container-low', 'Surface Container Low'],
                ['bg-surface-container', 'Surface Container'],
                ['bg-surface-container-high', 'Surface Container High'],
              ] as const
            ).map(([bg, label]) => (
              <div key={bg} className={`rounded-xl ${bg} p-4`}>
                <p className="mb-1 text-foreground/40 text-xs">{label}</p>
                <Divider className="my-2" />
                <p className="text-foreground/40 text-xs">Content below divider</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};
