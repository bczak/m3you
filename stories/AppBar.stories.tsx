import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeftIcon, CalendarDaysIcon, MenuIcon, MicIcon, SearchIcon } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { fn } from 'storybook/test';

import { AppBar } from '../src/components/AppBar/app-bar';
import { IconButton } from '../src/components/IconButton/icon-button';

const meta = {
  title: 'Navigation/App Bar',
  component: AppBar,
  parameters: {
    layout: 'padded',
    controls: {
      include: ['variant', 'headline', 'supportingText', 'searchLabel', 'centerAligned'],
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['search', 'small', 'small-image', 'medium', 'large'],
    },
  },
  args: {
    onSearchClick: fn(),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AppBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function StoryAvatar() {
  return (
    <IconButton variant="tonal" size="sm" aria-label="Account">
      A
    </IconButton>
  );
}

function StandardAction({
  ariaLabel,
  children,
}: Pick<ComponentProps<typeof IconButton>, 'children'> & {
  ariaLabel: string;
}) {
  return (
    <IconButton variant="standard" size="sm" aria-label={ariaLabel}>
      {children}
    </IconButton>
  );
}

function AppBarPreview(args: ComponentProps<typeof AppBar>) {
  if (args.variant === 'search') {
    return (
      <AppBar
        {...args}
        headline={undefined}
        supportingText={undefined}
        leadingIcon={
          <StandardAction ariaLabel="Open navigation">
            <MenuIcon />
          </StandardAction>
        }
        searchTrailing={
          <StandardAction ariaLabel="Voice search">
            <MicIcon />
          </StandardAction>
        }
        trailingIcons={<StoryAvatar />}
      />
    );
  }

  return (
    <AppBar
      {...args}
      leadingIcon={
        <StandardAction ariaLabel="Go back">
          <ArrowLeftIcon />
        </StandardAction>
      }
      trailingIcons={
        <>
          <StandardAction ariaLabel="Search">
            <SearchIcon />
          </StandardAction>
          <StandardAction ariaLabel="Open calendar">
            <CalendarDaysIcon />
          </StandardAction>
        </>
      }
    />
  );
}

function AppBarShowcasePreview(args: ComponentProps<typeof AppBar>) {
  return <AppBarPreview {...args} role="presentation" />;
}

function StoryStack({ children }: { children: React.ReactNode }) {
  return children;
}

export const Playground: Story = {
  args: {
    variant: 'small',
    headline: 'Headline',
    supportingText: 'Supporting text',
    searchLabel: 'Search product',
    centerAligned: false,
  },
  render: (args) => (
    <StoryStack>
      <AppBarPreview {...args} />
    </StoryStack>
  ),
};

export const Variants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The supported guideline variants are search, small, medium, and large. Each matches the kit configuration: a headline only, so the medium and large bars are 112dp and 120dp tall.',
      },
    },
  },
  render: () => (
    <StoryStack>
      <AppBarShowcasePreview variant="search" searchLabel="Search product" />
      <AppBarShowcasePreview variant="small" headline="Headline" />
      <AppBarShowcasePreview
        variant="small-image"
        image={
          <svg viewBox="0 0 160 40" role="img" aria-label="M3 You">
            <rect width="160" height="40" rx="12" fill="var(--md-sys-color-primary-container)" />
            <text x="80" y="27" textAnchor="middle" fill="var(--md-sys-color-on-primary-container)" fontSize="20">
              M3 You
            </text>
          </svg>
        }
      />
      <AppBarShowcasePreview variant="medium" headline="Headline" />
      <AppBarShowcasePreview variant="large" headline="Headline" />
    </StoryStack>
  ),
};

export const SupportingText: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Supporting text grows the flexible bars instead of overlapping the icon row: the headline always starts 8dp below it, so medium becomes 136dp and large 152dp.',
      },
    },
  },
  render: () => (
    <StoryStack>
      <AppBarShowcasePreview variant="small" headline="Headline" supportingText="Supporting text" />
      <AppBarShowcasePreview variant="medium" headline="Headline" supportingText="Supporting text" />
      <AppBarShowcasePreview variant="large" headline="Headline" supportingText="Supporting text" />
    </StoryStack>
  ),
};

export const OnScrollElevation: Story = {
  render: () => (
    <StoryStack>
      <AppBarShowcasePreview variant="small" headline="Flat" elevation="flat" />
      <AppBarShowcasePreview variant="small" headline="Content scrolled beneath" elevation="on-scroll" />
    </StoryStack>
  ),
};

export const CenterAligned: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Text labels, including supporting text, can align to the leading edge or be centered.',
      },
    },
  },
  render: () => (
    <StoryStack>
      <AppBarShowcasePreview variant="search" searchLabel="Search product" centerAligned />
      <AppBarShowcasePreview variant="small" headline="Headline" centerAligned />
      <AppBarShowcasePreview
        variant="small"
        headline="A much longer headline that cannot fit between the actions"
        centerAligned
      />
      <AppBarShowcasePreview variant="medium" headline="Headline" supportingText="Supporting text" centerAligned />
      <AppBarShowcasePreview variant="large" headline="Headline" supportingText="Supporting text" centerAligned />
    </StoryStack>
  ),
};

function SearchActivationDemo() {
  const [opened, setOpened] = useState(0);

  return (
    <StoryStack>
      <AppBarPreview
        variant="search"
        searchLabel="Search messages"
        onSearchClick={() => setOpened((count) => count + 1)}
        searchProps={{ 'aria-haspopup': 'dialog' }}
      />
      <p>Search opened {opened} times</p>
    </StoryStack>
  );
}

export const SearchActivation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The search field is a button with hover, pressed and focus states. `onSearchClick` fires on pointer or keyboard activation, typically to open a search view; `searchProps` adds attributes such as `aria-haspopup`. The trailing mic button stays a separate control.',
      },
    },
  },
  render: () => <SearchActivationDemo />,
};
