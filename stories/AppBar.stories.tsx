import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeftIcon, CalendarIcon, MenuIcon, SearchIcon } from 'lucide-react';
import * as React from 'react';
import { AppBar } from '../src/components/ui/app-bar';
import { IconButton } from '../src/components/ui/icon-button';
import { SearchBar } from '../src/components/ui/search';

const meta = {
  title: 'Components/AppBar',
  component: AppBar,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'elevated', 'centerAligned'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Small App Bar ──────────────────────────────────────────────────────────

export const Small: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <AppBar
        variant="small"
        headline="Headline"
        leadingIcon={
          <IconButton variant="standard" size="sm" aria-label="Back">
            <ArrowLeftIcon />
          </IconButton>
        }
        trailingIcons={
          <>
            <IconButton variant="standard" size="sm" aria-label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton variant="standard" size="sm" aria-label="Calendar">
              <CalendarIcon />
            </IconButton>
          </>
        }
      />
    </div>
  ),
};

// ─── Small Center-Aligned ───────────────────────────────────────────────────

export const SmallCenterAligned: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <AppBar
        variant="small"
        headline="Product"
        centerAligned
        leadingIcon={
          <IconButton variant="standard" size="sm" aria-label="Menu">
            <MenuIcon />
          </IconButton>
        }
        trailingIcons={
          <div className="mr-2 flex size-8 items-center justify-center rounded-full bg-primary font-medium text-on-primary text-sm">
            A
          </div>
        }
      />
    </div>
  ),
};

// ─── Small with Subtitle ────────────────────────────────────────────────────

export const SmallWithSubtitle: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <AppBar
        variant="small"
        headline="Headline"
        subtitle="Subtitle"
        leadingIcon={
          <IconButton variant="standard" size="sm" aria-label="Back">
            <ArrowLeftIcon />
          </IconButton>
        }
        trailingIcons={
          <>
            <IconButton variant="standard" size="sm" aria-label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton variant="standard" size="sm" aria-label="Calendar">
              <CalendarIcon />
            </IconButton>
          </>
        }
      />
    </div>
  ),
};

// ─── Medium Flexible ────────────────────────────────────────────────────────

export const MediumFlexible: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <AppBar
        variant="medium"
        headline="Headline"
        leadingIcon={
          <IconButton variant="standard" size="sm" aria-label="Back">
            <ArrowLeftIcon />
          </IconButton>
        }
        trailingIcons={
          <>
            <IconButton variant="standard" size="sm" aria-label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton variant="standard" size="sm" aria-label="Calendar">
              <CalendarIcon />
            </IconButton>
          </>
        }
      />
    </div>
  ),
};

// ─── Medium Flexible with Subtitle ──────────────────────────────────────────

export const MediumFlexibleWithSubtitle: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <AppBar
        variant="medium"
        headline="Headline"
        subtitle="Subtitle"
        leadingIcon={
          <IconButton variant="standard" size="sm" aria-label="Back">
            <ArrowLeftIcon />
          </IconButton>
        }
        trailingIcons={
          <>
            <IconButton variant="standard" size="sm" aria-label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton variant="standard" size="sm" aria-label="Calendar">
              <CalendarIcon />
            </IconButton>
          </>
        }
      />
    </div>
  ),
};

// ─── Large Flexible ─────────────────────────────────────────────────────────

export const LargeFlexible: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <AppBar
        variant="large"
        headline="Headline"
        leadingIcon={
          <IconButton variant="standard" size="sm" aria-label="Back">
            <ArrowLeftIcon />
          </IconButton>
        }
        trailingIcons={
          <>
            <IconButton variant="standard" size="sm" aria-label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton variant="standard" size="sm" aria-label="Calendar">
              <CalendarIcon />
            </IconButton>
          </>
        }
      />
    </div>
  ),
};

// ─── Large Flexible with Subtitle ───────────────────────────────────────────

export const LargeFlexibleWithSubtitle: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <AppBar
        variant="large"
        headline="Headline"
        subtitle="Subtitle"
        leadingIcon={
          <IconButton variant="standard" size="sm" aria-label="Back">
            <ArrowLeftIcon />
          </IconButton>
        }
        trailingIcons={
          <>
            <IconButton variant="standard" size="sm" aria-label="Search">
              <SearchIcon />
            </IconButton>
            <IconButton variant="standard" size="sm" aria-label="Calendar">
              <CalendarIcon />
            </IconButton>
          </>
        }
      />
    </div>
  ),
};

// ─── Search App Bar ─────────────────────────────────────────────────────────

export const SearchAppBar: Story = {
  render: () => (
    <div className="w-[360px] bg-surface">
      <div className="flex items-center gap-1 px-1 py-2">
        <IconButton variant="standard" size="sm" aria-label="Menu">
          <MenuIcon />
        </IconButton>
        <SearchBar placeholder="Search product" className="flex-1" />
        <div className="mr-2 flex size-8 items-center justify-center rounded-full bg-primary font-medium text-on-primary text-sm">
          A
        </div>
      </div>
    </div>
  ),
};

// ─── Scroll Behavior ────────────────────────────────────────────────────────

export const ScrollBehavior: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => {
    const ScrollDemo = () => {
      const [elevated, setElevated] = React.useState(false);
      const scrollRef = React.useRef<HTMLDivElement>(null);

      React.useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const handler = () => setElevated(el.scrollTop > 0);
        el.addEventListener('scroll', handler, { passive: true });
        return () => el.removeEventListener('scroll', handler);
      }, []);

      return (
        <div ref={scrollRef} className="h-screen overflow-y-auto bg-surface">
          <AppBar
            variant="small"
            headline="Headline"
            elevated={elevated}
            leadingIcon={
              <IconButton variant="standard" size="sm" aria-label="Back">
                <ArrowLeftIcon />
              </IconButton>
            }
            trailingIcons={
              <IconButton variant="standard" size="sm" aria-label="Search">
                <SearchIcon />
              </IconButton>
            }
          />
          <div className="space-y-4 p-4">
            {Array.from({ length: 30 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
              <div key={i} className="h-16 rounded-xl bg-surface-container-low" />
            ))}
          </div>
        </div>
      );
    };

    return <ScrollDemo />;
  },
};

// ─── Scroll States (flat vs on-scroll) ─────────────────────────────────────

export const ScrollStates: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="space-y-2">
        <span className="text-on-background/50 text-xs">Flat</span>
        <div className="w-[360px] bg-surface">
          <AppBar
            variant="small"
            headline="Headline"
            elevated={false}
            leadingIcon={
              <IconButton variant="standard" size="sm" aria-label="Back">
                <ArrowLeftIcon />
              </IconButton>
            }
            trailingIcons={
              <IconButton variant="standard" size="sm" aria-label="Search">
                <SearchIcon />
              </IconButton>
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <span className="text-on-background/50 text-xs">On scroll</span>
        <div className="w-[360px] bg-surface">
          <AppBar
            variant="small"
            headline="Headline"
            elevated
            leadingIcon={
              <IconButton variant="standard" size="sm" aria-label="Back">
                <ArrowLeftIcon />
              </IconButton>
            }
            trailingIcons={
              <IconButton variant="standard" size="sm" aria-label="Search">
                <SearchIcon />
              </IconButton>
            }
          />
        </div>
      </div>
    </div>
  ),
};

// ─── All Types ──────────────────────────────────────────────────────────────

export const AllTypes: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">App Bar Types</h2>
      <div className="mx-auto max-w-md space-y-8">
        {/* Search */}
        <div className="space-y-2">
          <span className="text-on-background/50 text-xs">1. Search app bar</span>
          <div className="rounded-xl bg-surface p-0 shadow-sm">
            <div className="flex items-center gap-1 px-1 py-2">
              <IconButton variant="standard" size="sm" aria-label="Menu">
                <MenuIcon />
              </IconButton>
              <SearchBar placeholder="Search product" className="flex-1" />
              <div className="mr-2 flex size-8 items-center justify-center rounded-full bg-primary font-medium text-on-primary text-sm">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Small */}
        <div className="space-y-2">
          <span className="text-on-background/50 text-xs">2. Small</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="small"
              headline="Headline"
              subtitle="Subtitle"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>

        {/* Medium Flexible */}
        <div className="space-y-2">
          <span className="text-on-background/50 text-xs">3. Medium flexible</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="medium"
              headline="Headline"
              subtitle="Subtitle"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>

        {/* Large Flexible */}
        <div className="space-y-2">
          <span className="text-on-background/50 text-xs">4. Large flexible</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="large"
              headline="Headline"
              subtitle="Subtitle"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  ),
};

// ─── Subtitle Comparison ────────────────────────────────────────────────────

export const SubtitleComparison: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => (
    <div className="min-h-screen bg-surface-container-lowest p-8">
      <h2 className="mb-8 text-center text-on-background/60 text-sm">Subtitle Variants</h2>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6">
        {/* Small without subtitle */}
        <div className="space-y-1">
          <span className="text-on-background/50 text-xs">Small</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="small"
              headline="Headline"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>

        {/* Small with subtitle */}
        <div className="space-y-1">
          <span className="text-on-background/50 text-xs">Small with subtitle</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="small"
              headline="Headline"
              subtitle="Subtitle"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>

        {/* Medium without subtitle */}
        <div className="space-y-1">
          <span className="text-on-background/50 text-xs">Medium flexible</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="medium"
              headline="Headline"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>

        {/* Medium with subtitle */}
        <div className="space-y-1">
          <span className="text-on-background/50 text-xs">Medium flexible with subtitle</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="medium"
              headline="Headline"
              subtitle="Subtitle"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>

        {/* Large without subtitle */}
        <div className="space-y-1">
          <span className="text-on-background/50 text-xs">Large flexible</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="large"
              headline="Headline"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>

        {/* Large with subtitle */}
        <div className="space-y-1">
          <span className="text-on-background/50 text-xs">Large flexible with subtitle</span>
          <div className="rounded-xl bg-surface shadow-sm">
            <AppBar
              variant="large"
              headline="Headline"
              subtitle="Subtitle"
              leadingIcon={
                <IconButton variant="standard" size="sm" aria-label="Back">
                  <ArrowLeftIcon />
                </IconButton>
              }
              trailingIcons={
                <>
                  <IconButton variant="standard" size="sm" aria-label="Search">
                    <SearchIcon />
                  </IconButton>
                  <IconButton variant="standard" size="sm" aria-label="Calendar">
                    <CalendarIcon />
                  </IconButton>
                </>
              }
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
