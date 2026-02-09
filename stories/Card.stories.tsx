import type { Meta, StoryObj } from '@storybook/react';
import { Heart, MoreVertical, Share2, Star, Triangle } from 'lucide-react';
import * as React from 'react';
import { Button } from '../src/components/ui/button';
import { Card } from '../src/components/ui/card';
import { IconButton } from '../src/components/ui/icon-button';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'disabled'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---------------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------------- */

const Avatar = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary-container-foreground text-sm">
    {children}
  </div>
);

const MediaPlaceholder = ({ className = 'h-48' }: { className?: string }) => (
  <div className={`flex items-center justify-center bg-surface-container ${className}`}>
    <span className="text-foreground/40 text-sm">Media</span>
  </div>
);

/* ---------------------------------------------------------------------------
   Default
   --------------------------------------------------------------------------- */

export const Default: Story = {
  render: () => (
    <Card className="w-72 p-4">
      <p>Card content</p>
    </Card>
  ),
};

/* ---------------------------------------------------------------------------
   Stacked Card — M3 canonical card layout
   Header (avatar + title + subhead + icon) → Media → Title/Subtitle →
   Supporting text → Action buttons
   --------------------------------------------------------------------------- */

export const StackedCard: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Stacked Card</h2>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6">
        {(['elevated', 'filled', 'outlined'] as const).map((v) => (
          <Card key={v} variant={v} className="w-80">
            {/* Header */}
            <div className="flex items-center gap-4 p-4">
              <Avatar>A</Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Header</p>
                <p className="text-foreground/60 text-sm">Subhead</p>
              </div>
              <IconButton variant="text" size="sm">
                <MoreVertical />
              </IconButton>
            </div>

            {/* Media */}
            <MediaPlaceholder />

            {/* Title & Subtitle */}
            <div className="px-4 pt-4">
              <h3 className="font-medium text-foreground text-lg">Title</h3>
              <p className="mt-1 text-foreground/60 text-sm">Subtitle</p>
            </div>

            {/* Supporting text */}
            <div className="px-4 pt-2 pb-4">
              <p className="text-foreground/80 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-4 pb-4">
              <Button variant="outlined" size="xs">
                Secondary
              </Button>
              <Button variant="filled" size="xs">
                Primary
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   Horizontal Card — Compact layout with avatar, text, and trailing icons
   --------------------------------------------------------------------------- */

export const HorizontalCard: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Horizontal Card</h2>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6">
        {(['elevated', 'filled', 'outlined'] as const).map((v) => (
          <Card key={v} variant={v} className="w-96">
            <div className="flex items-center gap-4 p-4">
              <Avatar>A</Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">Header</p>
                <p className="text-foreground/60 text-sm">Subhead</p>
              </div>
              <div className="flex items-center gap-1">
                <IconButton variant="text" size="xs">
                  <Triangle />
                </IconButton>
                <IconButton variant="text" size="xs">
                  <Star />
                </IconButton>
                <IconButton variant="text" size="xs">
                  <MoreVertical />
                </IconButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   With Media — Cards showcasing different media placements
   --------------------------------------------------------------------------- */

export const WithMedia: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Cards with Media</h2>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6">
        {/* Media on top */}
        <Card variant="elevated" className="w-80">
          <MediaPlaceholder />
          <div className="p-4">
            <h3 className="font-medium text-foreground text-lg">Media on top</h3>
            <p className="mt-1 text-foreground/60 text-sm">Subhead</p>
            <p className="mt-3 text-foreground/80 text-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
            </p>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <Button variant="outlined" size="xs">
              Secondary
            </Button>
            <Button variant="filled" size="xs">
              Primary
            </Button>
          </div>
        </Card>

        {/* Header + Media */}
        <Card variant="filled" className="w-80">
          <div className="flex items-center gap-4 p-4">
            <Avatar>A</Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Header</p>
              <p className="text-foreground/60 text-sm">Subhead</p>
            </div>
            <IconButton variant="text" size="sm">
              <MoreVertical />
            </IconButton>
          </div>
          <MediaPlaceholder />
          <div className="px-4 pt-4 pb-4">
            <p className="text-foreground/80 text-sm">Supporting text for the content of this card.</p>
          </div>
        </Card>

        {/* Thumbnail card */}
        <Card variant="outlined" className="w-80">
          <div className="flex gap-4 p-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground">Headline</h3>
              <p className="mt-1 text-foreground/60 text-sm">Subhead</p>
              <p className="mt-2 text-foreground/80 text-sm">Supporting text for the thumbnail layout.</p>
            </div>
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-surface-container">
              <span className="text-foreground/40 text-xs">Thumb</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   With Dividers — Cards with full-width and inset dividers
   --------------------------------------------------------------------------- */

export const WithDividers: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Cards with Dividers</h2>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6">
        {/* Full-width divider */}
        <Card variant="elevated" className="w-80">
          <div className="p-4">
            <h3 className="font-medium text-foreground text-lg">Section One</h3>
            <p className="mt-1 text-foreground/80 text-sm">Content for the first section of the card.</p>
          </div>
          <div className="border-outline-variant border-t" />
          <div className="p-4">
            <h3 className="font-medium text-foreground text-lg">Section Two</h3>
            <p className="mt-1 text-foreground/80 text-sm">Content for the second section of the card.</p>
          </div>
        </Card>

        {/* Inset divider */}
        <Card variant="filled" className="w-80">
          <div className="flex items-center gap-4 p-4">
            <Avatar>A</Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Item one</p>
              <p className="text-foreground/60 text-sm">Supporting text</p>
            </div>
          </div>
          <div className="ml-[72px] border-outline-variant border-t" />
          <div className="flex items-center gap-4 p-4">
            <Avatar>B</Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Item two</p>
              <p className="text-foreground/60 text-sm">Supporting text</p>
            </div>
          </div>
          <div className="ml-[72px] border-outline-variant border-t" />
          <div className="flex items-center gap-4 p-4">
            <Avatar>C</Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Item three</p>
              <p className="text-foreground/60 text-sm">Supporting text</p>
            </div>
          </div>
        </Card>

        {/* Divider between media and actions */}
        <Card variant="outlined" className="w-80">
          <MediaPlaceholder className="h-40" />
          <div className="p-4">
            <h3 className="font-medium text-foreground text-lg">Headline</h3>
            <p className="mt-1 text-foreground/80 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="border-outline-variant border-t" />
          <div className="flex gap-2 p-4">
            <Button variant="outlined" size="xs">
              Secondary
            </Button>
            <Button variant="filled" size="xs">
              Primary
            </Button>
          </div>
        </Card>
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   With Actions — Buttons, icon buttons, and mixed action patterns
   --------------------------------------------------------------------------- */

export const WithActions: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Cards with Actions</h2>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6">
        {/* Buttons only */}
        <Card variant="elevated" className="w-80">
          <div className="flex items-center gap-4 p-4">
            <Avatar>A</Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Header</p>
              <p className="text-foreground/60 text-sm">Subhead</p>
            </div>
            <IconButton variant="text" size="sm">
              <MoreVertical />
            </IconButton>
          </div>
          <MediaPlaceholder />
          <div className="px-4 pt-4 pb-2">
            <p className="text-foreground/80 text-sm">Supporting text for this card content.</p>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <Button variant="outlined" size="xs">
              Secondary
            </Button>
            <Button variant="filled" size="xs">
              Primary
            </Button>
          </div>
        </Card>

        {/* Icon buttons only */}
        <Card variant="filled" className="w-80">
          <MediaPlaceholder />
          <div className="p-4">
            <h3 className="font-medium text-foreground text-lg">Headline</h3>
            <p className="mt-1 text-foreground/60 text-sm">Subhead</p>
            <p className="mt-3 text-foreground/80 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          <div className="flex gap-1 px-4 pb-4">
            <IconButton variant="text" size="sm">
              <Heart />
            </IconButton>
            <IconButton variant="text" size="sm">
              <Share2 />
            </IconButton>
            <IconButton variant="text" size="sm">
              <MoreVertical />
            </IconButton>
          </div>
        </Card>

        {/* Buttons + icon buttons */}
        <Card variant="outlined" className="w-80">
          <div className="flex items-center gap-4 p-4">
            <Avatar>A</Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">Header</p>
              <p className="text-foreground/60 text-sm">Subhead</p>
            </div>
            <IconButton variant="text" size="sm">
              <MoreVertical />
            </IconButton>
          </div>
          <MediaPlaceholder />
          <div className="px-4 pt-4 pb-2">
            <p className="text-foreground/80 text-sm">
              Supporting text that provides more details about the card content.
            </p>
          </div>
          <div className="flex items-center justify-between px-4 pb-4">
            <div className="flex gap-2">
              <Button variant="outlined" size="xs">
                Secondary
              </Button>
              <Button variant="filled" size="xs">
                Primary
              </Button>
            </div>
            <div className="flex gap-1">
              <IconButton variant="text" size="sm">
                <Heart />
              </IconButton>
              <IconButton variant="text" size="sm">
                <Share2 />
              </IconButton>
            </div>
          </div>
        </Card>
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   Interactive — Cards as primary action area (clickable)
   --------------------------------------------------------------------------- */

export const Interactive: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const InteractiveCards = () => {
      const [clicked, setClicked] = React.useState('');
      return (
        <div className="min-h-screen bg-surface-container-lowest p-8">
          <h2 className="mb-2 text-center text-foreground/60 text-sm">Interactive Cards (clickable)</h2>
          {clicked && <p className="mb-6 text-center text-primary text-sm">Clicked: {clicked}</p>}
          <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6">
            {(['elevated', 'filled', 'outlined'] as const).map((v) => (
              <Card key={v} variant={v} className="w-72" onClick={() => setClicked(v)}>
                <div className="flex items-center gap-4 p-4">
                  <Avatar>A</Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground capitalize">{v}</p>
                    <p className="text-foreground/60 text-sm">Click the entire card</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
    };
    return <InteractiveCards />;
  },
};

/* ---------------------------------------------------------------------------
   Disabled
   --------------------------------------------------------------------------- */

export const Disabled: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-foreground/60 text-sm">Disabled Cards</h2>
      <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-6">
        {(['elevated', 'filled', 'outlined'] as const).map((v) => (
          <Card key={v} variant={v} className="w-72" onClick={() => {}} disabled>
            <div className="flex items-center gap-4 p-4">
              <Avatar>A</Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground capitalize">{v}</p>
                <p className="text-foreground/60 text-sm">Disabled</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  ),
};

/* ---------------------------------------------------------------------------
   Complete Showcase — All card patterns in one view
   --------------------------------------------------------------------------- */

export const CompleteShowcase: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ShowcaseCards = () => {
      const [count, setCount] = React.useState(0);
      const variants = ['elevated', 'filled', 'outlined'] as const;

      return (
        <div className="min-h-screen bg-surface-container-lowest p-8">
          <h2 className="mb-8 text-center text-foreground/60 text-sm">Complete Card Showcase</h2>

          <div className="mx-auto flex max-w-5xl flex-col gap-12">
            {/* Stacked */}
            <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
              <h3 className="mb-4 text-foreground/60 text-xs">Stacked</h3>
              <div className="flex flex-wrap gap-4">
                {variants.map((v) => (
                  <Card key={v} variant={v} className="w-80">
                    <div className="flex items-center gap-4 p-4">
                      <Avatar>A</Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">Header</p>
                        <p className="text-foreground/60 text-sm">Subhead</p>
                      </div>
                      <IconButton variant="text" size="sm">
                        <MoreVertical />
                      </IconButton>
                    </div>
                    <MediaPlaceholder className="h-40" />
                    <div className="px-4 pt-4">
                      <h4 className="font-medium text-foreground">Title</h4>
                      <p className="mt-1 text-foreground/60 text-sm">Subtitle</p>
                    </div>
                    <div className="px-4 pt-2 pb-4">
                      <p className="text-foreground/80 text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                      </p>
                    </div>
                    <div className="flex gap-2 px-4 pb-4">
                      <Button variant="outlined" size="xs">
                        Secondary
                      </Button>
                      <Button variant="filled" size="xs">
                        Primary
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Horizontal */}
            <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
              <h3 className="mb-4 text-foreground/60 text-xs">Horizontal</h3>
              <div className="flex flex-wrap gap-4">
                {variants.map((v) => (
                  <Card key={v} variant={v} className="w-96">
                    <div className="flex items-center gap-4 p-4">
                      <Avatar>A</Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">Header</p>
                        <p className="text-foreground/60 text-sm">Subhead</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconButton variant="text" size="xs">
                          <Triangle />
                        </IconButton>
                        <IconButton variant="text" size="xs">
                          <Star />
                        </IconButton>
                        <IconButton variant="text" size="xs">
                          <MoreVertical />
                        </IconButton>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Interactive */}
            <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
              <h3 className="mb-1 text-foreground/60 text-xs">Interactive (click to increment: {count})</h3>
              <div className="mt-3 flex flex-wrap gap-4">
                {variants.map((v) => (
                  <Card key={v} variant={v} className="w-72" onClick={() => setCount((c) => c + 1)}>
                    <div className="flex items-center gap-4 p-4">
                      <Avatar>A</Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground capitalize">{v}</p>
                        <p className="text-foreground/60 text-sm">Click me</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Disabled */}
            <div className="rounded-lg border-2 border-outline-variant border-dashed p-6">
              <h3 className="mb-4 text-foreground/60 text-xs">Disabled</h3>
              <div className="flex flex-wrap gap-4">
                {variants.map((v) => (
                  <Card key={v} variant={v} className="w-72" onClick={() => {}} disabled>
                    <div className="flex items-center gap-4 p-4">
                      <Avatar>A</Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground capitalize">{v}</p>
                        <p className="text-foreground/60 text-sm">Disabled</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    };
    return <ShowcaseCards />;
  },
};
