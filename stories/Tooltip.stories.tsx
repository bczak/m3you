import type { Meta, StoryObj } from '@storybook/react';
import {
  BookmarkIcon,
  CopyIcon,
  DeleteIcon,
  EditIcon,
  HeartIcon,
  InfoIcon,
  SettingsIcon,
  ShareIcon,
  StarIcon,
} from 'lucide-react';
import { Button } from '../src/components/ui/button';
import { Chip } from '../src/components/ui/chip';
import { ExtendedFAB } from '../src/components/ui/extended-fab';
import { IconButton } from '../src/components/ui/icon-button';
import {
  RichTooltip,
  RichTooltipContent,
  RichTooltipTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/ui/tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<IconButton />}>
        <StarIcon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>Save to favorites</TooltipContent>
    </Tooltip>
  ),
};

export const Placements: Story = {
  render: () => (
    <div className="flex items-center gap-12 p-16">
      <Tooltip>
        <TooltipTrigger render={<IconButton variant="tonal" />}>
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="top">Top placement</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<IconButton variant="tonal" />}>
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="bottom">Bottom placement</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<IconButton variant="tonal" />}>
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="left">Left placement</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<IconButton variant="tonal" />}>
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="right">Right placement</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const MultiLine: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<IconButton variant="filled" />}>
        <InfoIcon aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>
        Grant access to a Google Drive account so that the application can view and manage your files
      </TooltipContent>
    </Tooltip>
  ),
};

export const RichDefault: Story = {
  render: () => (
    <RichTooltip>
      <RichTooltipTrigger render={<IconButton variant="tonal" />}>
        <SettingsIcon aria-hidden="true" />
      </RichTooltipTrigger>
      <RichTooltipContent
        headline="Permissions"
        actions={
          <Button variant="text" size="xs">
            Learn more
          </Button>
        }
      >
        Configure permissions for selected service accounts. Permissions determine what actions service accounts can
        take.
      </RichTooltipContent>
    </RichTooltip>
  ),
};

export const RichConfigurations: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-12 p-8">
      {/* Headline + text + 2 actions */}
      <RichTooltip>
        <RichTooltipTrigger render={<IconButton />}>
          <InfoIcon aria-hidden="true" />
        </RichTooltipTrigger>
        <RichTooltipContent
          headline="Auto-delete"
          actions={
            <>
              <Button variant="text" size="xs">
                Dismiss
              </Button>
              <Button variant="text" size="xs">
                Learn more
              </Button>
            </>
          }
        >
          Items in the trash will be permanently deleted after 30 days.
        </RichTooltipContent>
      </RichTooltip>

      {/* Headline + text + 1 action */}
      <RichTooltip>
        <RichTooltipTrigger render={<IconButton />}>
          <SettingsIcon aria-hidden="true" />
        </RichTooltipTrigger>
        <RichTooltipContent
          headline="Permissions"
          actions={
            <Button variant="text" size="xs">
              Learn more
            </Button>
          }
        >
          Configure permissions for selected service accounts.
        </RichTooltipContent>
      </RichTooltip>

      {/* Headline + text only */}
      <RichTooltip>
        <RichTooltipTrigger render={<IconButton />}>
          <BookmarkIcon aria-hidden="true" />
        </RichTooltipTrigger>
        <RichTooltipContent headline="Bookmarks">
          Save items to your bookmarks for quick access later.
        </RichTooltipContent>
      </RichTooltip>

      {/* Text + 1 action */}
      <RichTooltip>
        <RichTooltipTrigger render={<IconButton />}>
          <ShareIcon aria-hidden="true" />
        </RichTooltipTrigger>
        <RichTooltipContent
          actions={
            <Button variant="text" size="xs">
              Go to settings
            </Button>
          }
        >
          Share this item with others in your organization.
        </RichTooltipContent>
      </RichTooltip>

      {/* Text + 2 actions */}
      <RichTooltip>
        <RichTooltipTrigger render={<IconButton />}>
          <DeleteIcon aria-hidden="true" />
        </RichTooltipTrigger>
        <RichTooltipContent
          actions={
            <>
              <Button variant="text" size="xs">
                Cancel
              </Button>
              <Button variant="text" size="xs">
                Delete
              </Button>
            </>
          }
        >
          This action will permanently delete the selected items.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  ),
};

export const WithIconButtons: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger render={<IconButton />}>
          <EditIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<IconButton />}>
          <CopyIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<IconButton />}>
          <ShareIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<IconButton />}>
          <HeartIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Favorite</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger render={<IconButton />}>
          <DeleteIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  ),
};

export const IntegrationDemo: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-wrap items-center gap-6 p-12">
      <Tooltip>
        <TooltipTrigger render={<Button variant="filled" />}>Save</TooltipTrigger>
        <TooltipContent side="top">Save document</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<IconButton variant="outlined" />}>
          <InfoIcon aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent side="bottom">More info</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Chip />}>Filters</TooltipTrigger>
        <TooltipContent side="right">Filter results</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<ExtendedFAB icon={<EditIcon aria-hidden="true" />} label="Compose" />} />
        <TooltipContent side="top">Create new item</TooltipContent>
      </Tooltip>

      <RichTooltip>
        <RichTooltipTrigger render={<Button variant="tonal" />}>Settings</RichTooltipTrigger>
        <RichTooltipContent
          headline="App settings"
          actions={
            <Button variant="text" size="xs">
              Open settings
            </Button>
          }
        >
          Manage your application preferences, notifications, and account details.
        </RichTooltipContent>
      </RichTooltip>
    </div>
  ),
};
