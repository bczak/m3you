import type { Meta, StoryObj } from '@storybook/react';
import { ArrowLeftIcon, CalendarDaysIcon, MenuIcon, MicIcon, SearchIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

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
      options: ['search', 'small', 'medium', 'large'],
    },
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
        story: 'The supported guideline variants are search, small, medium, and large.',
      },
    },
  },
  render: () => (
    <StoryStack>
      <AppBarPreview variant="search" searchLabel="Search product" />
      <AppBarPreview variant="small" headline="Headline" />
      <AppBarPreview variant="medium" headline="Headline" supportingText="Supporting text" />
      <AppBarPreview variant="large" headline="Headline" supportingText="Supporting text" />
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
      <AppBarPreview variant="search" searchLabel="Search product" centerAligned />
      <AppBarPreview variant="small" headline="Headline" centerAligned />
      <AppBarPreview variant="medium" headline="Headline" supportingText="Supporting text" centerAligned />
      <AppBarPreview variant="large" headline="Headline" supportingText="Supporting text" centerAligned />
    </StoryStack>
  ),
};
