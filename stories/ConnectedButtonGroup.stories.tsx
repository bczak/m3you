import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CircleStarIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { Button } from '../src/components/Button/button';
import { ConnectedButtonGroup } from '../src/components/ButtonGroup/connected-button-group';
import { IconButton } from '../src/components/IconButton/icon-button';

const meta = {
  title: 'Actions/Connected Button Group',
  component: ConnectedButtonGroup,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['orientation', 'size', 'shape', 'color', 'selectionMode', 'required'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectedButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'sm',
    shape: 'round',
    selectionMode: 'multiple',
    required: false,
    orientation: 'horizontal',
  },
  render: (args) => (
    <ConnectedButtonGroup {...args}>
      <Button variant="outlined">
        <BoldIcon />
        Bold
      </Button>
      <Button variant="outlined">
        <ItalicIcon />
        Italic
      </Button>
      <Button variant="outlined">
        <UnderlineIcon />
        Underline
      </Button>
    </ConnectedButtonGroup>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      {/* Row 1: 5 icon-only buttons, second selected */}
      <ConnectedButtonGroup selectionMode="single" defaultValue={[1]} shape="round">
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
      </ConnectedButtonGroup>

      {/* Row 2: squared, icon + label, middle selected */}
      <ConnectedButtonGroup selectionMode="single" defaultValue={[1]} shape="square">
        <Button variant="tonal">
          <CircleStarIcon />
          Label
        </Button>
        <Button variant="tonal">
          <CircleStarIcon />
          Label
        </Button>
        <Button variant="tonal">
          <CircleStarIcon />
          Label
        </Button>
      </ConnectedButtonGroup>

      {/* Row 3: squared, 3 icon-only buttons, middle selected */}
      <ConnectedButtonGroup selectionMode="single" defaultValue={[1]} shape="square">
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
        <IconButton aria-label="Example action" variant="tonal">
          <CircleStarIcon />
        </IconButton>
      </ConnectedButtonGroup>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {sizes.map((size) => (
          <ConnectedButtonGroup key={size} size={size} shape="round" selectionMode="multiple">
            <Button variant="tonal">
              <BoldIcon />
              Bold
            </Button>
            <Button variant="tonal">
              <ItalicIcon />
              Italic
            </Button>
            <Button variant="tonal">
              <UnderlineIcon />
              Underline
            </Button>
          </ConnectedButtonGroup>
        ))}
      </div>
    );
  },
};

export const FourButtons: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {sizes.map((size) => (
          <ConnectedButtonGroup key={size} size={size} shape="round" selectionMode="multiple">
            <Button variant="tonal">
              <BoldIcon />
              Bold
            </Button>
            <Button variant="tonal">
              <ItalicIcon />
              Italic
            </Button>
            <Button variant="tonal">
              <UnderlineIcon />
              Underline
            </Button>
            <Button variant="tonal">
              <StrikethroughIcon />
              Strike
            </Button>
          </ConnectedButtonGroup>
        ))}
      </div>
    );
  },
};

export const SingleSelect: Story = {
  render: () => (
    <ConnectedButtonGroup selectionMode="single" shape="round">
      <Button variant="outlined">
        <AlignLeftIcon />
        Left
      </Button>
      <Button variant="outlined">
        <AlignCenterIcon />
        Center
      </Button>
      <Button variant="outlined">
        <AlignRightIcon />
        Right
      </Button>
      <Button variant="outlined">
        <AlignJustifyIcon />
        Justify
      </Button>
    </ConnectedButtonGroup>
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <ConnectedButtonGroup selectionMode="multiple" shape="round">
      <Button variant="tonal">
        <BoldIcon />
        Bold
      </Button>
      <Button variant="tonal">
        <ItalicIcon />
        Italic
      </Button>
      <Button variant="tonal">
        <UnderlineIcon />
        Underline
      </Button>
      <Button variant="tonal">
        <StrikethroughIcon />
        Strike
      </Button>
    </ConnectedButtonGroup>
  ),
};

export const SelectionRequired: Story = {
  render: () => (
    <ConnectedButtonGroup selectionMode="single" required defaultValue={[1]} shape="round">
      <Button variant="filled">
        <AlignLeftIcon />
        Left
      </Button>
      <Button variant="filled">
        <AlignCenterIcon />
        Center
      </Button>
      <Button variant="filled">
        <AlignRightIcon />
        Right
      </Button>
    </ConnectedButtonGroup>
  ),
};

export const ColorRoles: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['primary', 'secondary', 'tertiary', 'error'] as const).map((color) => (
        <ConnectedButtonGroup
          key={color}
          color={color}
          selectionMode="single"
          required
          defaultValue={[0]}
          aria-label={`${color} colour family`}
        >
          <Button variant="tonal">Selected</Button>
          <Button variant="tonal">Unselected</Button>
        </ConnectedButtonGroup>
      ))}
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ConnectedButtonGroup orientation="vertical" selectionMode="multiple" shape="round">
      <Button variant="outlined">
        <BoldIcon />
        Bold
      </Button>
      <Button variant="outlined">
        <ItalicIcon />
        Italic
      </Button>
      <Button variant="outlined">
        <UnderlineIcon />
        Underline
      </Button>
    </ConnectedButtonGroup>
  ),
};

export const SquareShape: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {sizes.map((size) => (
          <ConnectedButtonGroup key={size} size={size} shape="square" selectionMode="single">
            <Button variant="filled">
              <AlignLeftIcon />
              Left
            </Button>
            <Button variant="filled">
              <AlignCenterIcon />
              Center
            </Button>
            <Button variant="filled">
              <AlignRightIcon />
              Right
            </Button>
          </ConnectedButtonGroup>
        ))}
      </div>
    );
  },
};

export const IconOnly: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {sizes.map((size) => (
          <ConnectedButtonGroup key={size} size={size} shape="round" selectionMode="multiple">
            <IconButton aria-label="Example action" variant="tonal">
              <BoldIcon />
            </IconButton>
            <IconButton aria-label="Example action" variant="tonal">
              <ItalicIcon />
            </IconButton>
            <IconButton aria-label="Example action" variant="tonal">
              <UnderlineIcon />
            </IconButton>
            <IconButton aria-label="Example action" variant="tonal">
              <StrikethroughIcon />
            </IconButton>
          </ConnectedButtonGroup>
        ))}
      </div>
    );
  },
};

export const IconOnlySquare: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {sizes.map((size) => (
          <ConnectedButtonGroup key={size} size={size} shape="square" selectionMode="single">
            <IconButton aria-label="Example action" variant="outlined">
              <AlignLeftIcon />
            </IconButton>
            <IconButton aria-label="Example action" variant="outlined">
              <AlignCenterIcon />
            </IconButton>
            <IconButton aria-label="Example action" variant="outlined">
              <AlignRightIcon />
            </IconButton>
            <IconButton aria-label="Example action" variant="outlined">
              <AlignJustifyIcon />
            </IconButton>
          </ConnectedButtonGroup>
        ))}
      </div>
    );
  },
};
