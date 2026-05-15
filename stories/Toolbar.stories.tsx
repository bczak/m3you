import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraOffIcon,
  ChevronDownIcon,
  DownloadIcon,
  FolderIcon,
  HandIcon,
  MicIcon,
  MoreVerticalIcon,
  PhoneOffIcon,
  PlusIcon,
  ShareIcon,
  StarIcon,
  Trash2Icon,
  WandSparklesIcon,
} from 'lucide-react';
import { type ComponentProps, type ReactNode, useState } from 'react';
import { Button } from '../src/components/Button/button';
import { FAB } from '../src/components/Fab/fab';
import { IconButton } from '../src/components/IconButton/icon-button';
import { MenuItem } from '../src/components/Menu/menu';
import { SplitButton, SplitButtonAction, SplitButtonMenu } from '../src/components/SplitButton/split-button';
import { Toolbar } from '../src/components/Toolbar/toolbar';

const meta = {
  title: 'Navigation/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['type', 'color', 'layout', 'align'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function useToolbarSelection(initial: Record<string, boolean>) {
  const [selected, setSelected] = useState(initial);

  const toggle = (key: string) => {
    setSelected((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const selectedProp = (key: string) => (selected[key] ? true : undefined);

  return { selected, toggle, selectedProp };
}

function DockedIconRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    download: false,
    delete: false,
    enhance: false,
    share: false,
    save: false,
  });

  return (
    <Toolbar {...args}>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Download"
        selected={selectedProp('download')}
        onClick={() => toggle('download')}
      >
        <DownloadIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Delete"
        selected={selectedProp('delete')}
        onClick={() => toggle('delete')}
      >
        <Trash2Icon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Enhance"
        selected={selectedProp('enhance')}
        onClick={() => toggle('enhance')}
      >
        <WandSparklesIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Share"
        selected={selectedProp('share')}
        onClick={() => toggle('share')}
      >
        <ShareIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Save"
        selected={selectedProp('save')}
        onClick={() => toggle('save')}
      >
        <StarIcon />
      </IconButton>
    </Toolbar>
  );
}

function FloatingFormatRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    bold: true,
    italic: false,
    underline: false,
    decorate: false,
    more: false,
  });

  return (
    <Toolbar {...args}>
      <IconButton
        variant="filled"
        size="xs"
        morph
        aria-label="Bold"
        selected={selectedProp('bold')}
        onClick={() => toggle('bold')}
      >
        <span aria-hidden="true" style={{ fontSize: 18, fontWeight: 700 }}>
          B
        </span>
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Italic"
        selected={selectedProp('italic')}
        onClick={() => toggle('italic')}
      >
        <span aria-hidden="true" style={{ fontSize: 18, fontStyle: 'italic', fontWeight: 600 }}>
          I
        </span>
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Underline"
        selected={selectedProp('underline')}
        onClick={() => toggle('underline')}
      >
        <span aria-hidden="true" style={{ fontSize: 18, fontWeight: 600, textDecoration: 'underline' }}>
          U
        </span>
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Decorate"
        selected={selectedProp('decorate')}
        onClick={() => toggle('decorate')}
      >
        <WandSparklesIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="More formatting options"
        selected={selectedProp('more')}
        onClick={() => toggle('more')}
      >
        <MoreVerticalIcon />
      </IconButton>
    </Toolbar>
  );
}

function DockedCenterFabRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    back: false,
    forward: false,
    create: false,
    files: false,
    more: false,
  });

  return (
    <Toolbar {...args}>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Back"
        selected={selectedProp('back')}
        onClick={() => toggle('back')}
      >
        <ArrowLeftIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Forward"
        selected={selectedProp('forward')}
        onClick={() => toggle('forward')}
      >
        <ArrowRightIcon />
      </IconButton>
      <FAB
        variant="tonal"
        size="sm"
        morph
        aria-label="Create"
        selected={selectedProp('create')}
        onClick={() => toggle('create')}
      >
        <PlusIcon />
      </FAB>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Files"
        selected={selectedProp('files')}
        onClick={() => toggle('files')}
      >
        <FolderIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="More options"
        selected={selectedProp('more')}
        onClick={() => toggle('more')}
      >
        <MoreVerticalIcon />
      </IconButton>
    </Toolbar>
  );
}

function DockedCenterWideIconRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    back: false,
    download: false,
    create: true,
    files: false,
    more: false,
  });

  return (
    <Toolbar {...args}>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Back"
        selected={selectedProp('back')}
        onClick={() => toggle('back')}
      >
        <ArrowLeftIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Download"
        selected={selectedProp('download')}
        onClick={() => toggle('download')}
      >
        <DownloadIcon />
      </IconButton>
      <IconButton
        variant="filled"
        size="xs"
        width="wide"
        morph
        aria-label="Create"
        selected={selectedProp('create')}
        onClick={() => toggle('create')}
      >
        <PlusIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Files"
        selected={selectedProp('files')}
        onClick={() => toggle('files')}
      >
        <FolderIcon />
      </IconButton>
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="More options"
        selected={selectedProp('more')}
        onClick={() => toggle('more')}
      >
        <MoreVerticalIcon />
      </IconButton>
    </Toolbar>
  );
}

function FloatingWithSideSquareActionRow(args: ComponentProps<typeof Toolbar>) {
  const { selected, toggle, selectedProp } = useToolbarSelection({
    camera: false,
    microphone: false,
    hand: false,
    more: false,
    endCall: true,
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Toolbar {...args}>
        <IconButton
          variant="standard"
          size="xs"
          morph
          aria-label="Turn camera off"
          selected={selectedProp('camera')}
          onClick={() => toggle('camera')}
        >
          <CameraOffIcon />
        </IconButton>
        <IconButton
          variant="standard"
          size="xs"
          morph
          aria-label="Mute microphone"
          selected={selectedProp('microphone')}
          onClick={() => toggle('microphone')}
        >
          <MicIcon />
        </IconButton>
        <IconButton
          variant="standard"
          size="xs"
          morph
          aria-label="Raise hand"
          selected={selectedProp('hand')}
          onClick={() => toggle('hand')}
        >
          <HandIcon />
        </IconButton>
        <IconButton
          variant="standard"
          size="xs"
          morph
          aria-label="More options"
          selected={selectedProp('more')}
          onClick={() => toggle('more')}
        >
          <MoreVerticalIcon />
        </IconButton>
      </Toolbar>

      <IconButton
        variant="filled"
        size="md"
        shape="square"
        morph
        aria-label="End call"
        selected={selectedProp('endCall')}
        onClick={() => toggle('endCall')}
        style={{
          backgroundColor: selected.endCall
            ? 'var(--md-sys-color-error)'
            : 'var(--md-sys-color-surface-container-high)',
          color: selected.endCall ? 'var(--md-sys-color-on-error)' : 'var(--md-sys-color-on-surface-variant)',
        }}
      >
        <PhoneOffIcon style={{ width: 20, height: 20 }} />
      </IconButton>
    </div>
  );
}

function FloatingWithIconButtonsRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    share: false,
    download: false,
    enhance: false,
  });

  return (
    <Toolbar {...args}>
      <Button
        variant="text"
        size="sm"
        shape="round"
        morph
        selected={selectedProp('share')}
        onClick={() => toggle('share')}
      >
        <ShareIcon />
        Share
      </Button>
      <Button
        variant="text"
        size="sm"
        shape="round"
        morph
        selected={selectedProp('download')}
        onClick={() => toggle('download')}
      >
        <DownloadIcon />
        Download
      </Button>
      <Button
        variant="text"
        size="sm"
        shape="round"
        morph
        selected={selectedProp('enhance')}
        onClick={() => toggle('enhance')}
      >
        <WandSparklesIcon />
        Enhance
      </Button>
    </Toolbar>
  );
}

function DockedSlotRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    download: false,
    delete: false,
    share: false,
  });

  return (
    <Toolbar
      {...args}
      leading={
        <IconButton
          variant="standard"
          size="xs"
          morph
          aria-label="Download"
          selected={selectedProp('download')}
          onClick={() => toggle('download')}
        >
          <DownloadIcon />
        </IconButton>
      }
      trailing={
        <IconButton
          variant="standard"
          size="xs"
          morph
          aria-label="Share"
          selected={selectedProp('share')}
          onClick={() => toggle('share')}
        >
          <ShareIcon />
        </IconButton>
      }
    >
      <IconButton
        variant="standard"
        size="xs"
        morph
        aria-label="Delete"
        selected={selectedProp('delete')}
        onClick={() => toggle('delete')}
      >
        <Trash2Icon />
      </IconButton>
    </Toolbar>
  );
}

function DockedActionRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    back: false,
    next: true,
  });

  return (
    <Toolbar
      {...args}
      leading={
        <Button
          variant="text"
          size="sm"
          shape="round"
          morph
          selected={selectedProp('back')}
          onClick={() => toggle('back')}
        >
          Back
        </Button>
      }
      trailing={
        <Button
          variant="filled"
          size="sm"
          shape="round"
          morph
          selected={selectedProp('next')}
          onClick={() => toggle('next')}
        >
          Next
        </Button>
      }
    />
  );
}

function DockedMixedButtonRow(args: ComponentProps<typeof Toolbar>) {
  const { toggle, selectedProp } = useToolbarSelection({
    yes: true,
    next: false,
    maybe: false,
    more: false,
  });

  return (
    <Toolbar {...args}>
      <Button
        variant="filled"
        size="sm"
        shape="round"
        morph
        selected={selectedProp('yes')}
        onClick={() => toggle('yes')}
      >
        Yes
      </Button>
      <Button
        variant="outlined"
        size="sm"
        shape="round"
        morph
        selected={selectedProp('next')}
        onClick={() => toggle('next')}
      >
        Next
      </Button>
      <SplitButton variant="outlined" size="sm" shape="round" morph selected={selectedProp('maybe')}>
        <SplitButtonAction onClick={() => toggle('maybe')}>Maybe</SplitButtonAction>
        <SplitButtonMenu>
          <MenuItem>Maybe</MenuItem>
          <MenuItem>Yes</MenuItem>
          <MenuItem>No</MenuItem>
        </SplitButtonMenu>
      </SplitButton>
      <IconButton
        variant="outlined"
        size="xs"
        morph
        aria-label="More options"
        selected={selectedProp('more')}
        onClick={() => toggle('more')}
      >
        <ChevronDownIcon />
      </IconButton>
    </Toolbar>
  );
}

function StoryStack({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 'min(100%, 920px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {children}
    </div>
  );
}

export const Playground: Story = {
  args: {
    type: 'floating',
    color: 'standard',
    layout: 'horizontal',
    align: 'center',
  },
  render: (args) => (args.type === 'docked' ? <DockedIconRow {...args} /> : <FloatingFormatRow {...args} />),
};

export const FloatingSpecs: Story = {
  render: () => (
    <div
      style={{
        width: 'min(100vw - 48px, 960px)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <StoryStack>
        <div style={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
          <FloatingFormatRow type="floating" color="standard" layout="horizontal" />
        </div>

        <div style={{ display: 'grid', placeItems: 'center', minHeight: 160 }}>
          <FloatingFormatRow type="floating" color="vibrant" layout="horizontal" gap={8} padding={12} />
        </div>
      </StoryStack>
    </div>
  ),
};

export const DockedSpecs: Story = {
  render: () => (
    <div
      style={{
        width: 'min(100vw - 48px, 960px)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <StoryStack>
        <DockedIconRow type="docked" color="standard" />

        <DockedSlotRow type="docked" color="standard" align="between" />

        <DockedActionRow type="docked" color="standard" align="between" />

        <DockedMixedButtonRow type="docked" color="standard" align="center" gap={8} />
      </StoryStack>
    </div>
  ),
};

export const DockedWithCenterFab: Story = {
  render: () => (
    <div
      style={{
        width: 'min(100vw - 48px, 960px)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 'min(100%, 720px)' }}>
        <DockedCenterFabRow type="docked" color="standard" align="center" />
      </div>
    </div>
  ),
};

export const DockedWithCenterWideIcon: Story = {
  render: () => (
    <div
      style={{
        width: 'min(100vw - 48px, 960px)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 'min(100%, 720px)' }}>
        <DockedCenterWideIconRow type="docked" color="standard" align="center" />
      </div>
    </div>
  ),
};

export const FloatingWithSideSquareAction: Story = {
  render: () => (
    <div
      style={{
        width: 'min(100vw - 48px, 960px)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 'min(100%, 720px)', display: 'grid', placeItems: 'center', minHeight: 160 }}>
        <FloatingWithSideSquareActionRow type="floating" color="standard" layout="horizontal" />
      </div>
    </div>
  ),
};

export const FloatingWithIconButtons: Story = {
  render: () => (
    <div
      style={{
        width: 'min(100vw - 48px, 960px)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: 'min(100%, 720px)', display: 'grid', placeItems: 'center', minHeight: 160 }}>
        <FloatingWithIconButtonsRow type="floating" color="standard" layout="horizontal" gap={8} />
      </div>
    </div>
  ),
};
