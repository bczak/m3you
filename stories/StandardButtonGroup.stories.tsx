import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from 'lucide-react';
import { Button } from '../src/components/Button/button';
import { StandardButtonGroup } from '../src/components/ButtonGroup/standard-button-group';
import { IconButton } from '../src/components/IconButton/icon-button';

const meta = {
  title: 'Actions/Standard Button Group',
  component: StandardButtonGroup,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['orientation', 'size', 'shape', 'morph', 'selectionMode', 'required'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StandardButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'sm',
    shape: 'round',
    morph: true,
    selectionMode: 'multiple',
    required: false,
    orientation: 'horizontal',
  },
  render: (args) => (
    <StandardButtonGroup {...args}>
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
    </StandardButtonGroup>
  ),
};

export const AllSizes: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {sizes.map((size) => (
          <StandardButtonGroup key={size} size={size} shape="round" selectionMode="multiple" defaultValue={[0]}>
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
          </StandardButtonGroup>
        ))}
      </div>
    );
  },
};

export const MorphComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <StandardButtonGroup shape="round" morph selectionMode="multiple" defaultValue={[0]}>
        <Button variant="tonal">
          <BoldIcon />
          Morph on
        </Button>
        <Button variant="tonal">
          <ItalicIcon />
          Press
        </Button>
        <Button variant="tonal">
          <UnderlineIcon />
          Me
        </Button>
      </StandardButtonGroup>
      <StandardButtonGroup shape="round" morph={false} selectionMode="multiple" defaultValue={[0]}>
        <Button variant="tonal">
          <BoldIcon />
          Morph off
        </Button>
        <Button variant="tonal">
          <ItalicIcon />
          Press
        </Button>
        <Button variant="tonal">
          <UnderlineIcon />
          Me
        </Button>
      </StandardButtonGroup>
    </div>
  ),
};

export const SingleSelect: Story = {
  render: () => (
    <StandardButtonGroup selectionMode="single" defaultValue={[0]} shape="round">
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
    </StandardButtonGroup>
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <StandardButtonGroup selectionMode="multiple" defaultValue={[0, 2]} shape="round">
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
    </StandardButtonGroup>
  ),
};

export const SelectionRequired: Story = {
  render: () => (
    <StandardButtonGroup selectionMode="single" required defaultValue={[1]} shape="round">
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
    </StandardButtonGroup>
  ),
};

export const Vertical: Story = {
  render: () => (
    <StandardButtonGroup orientation="vertical" selectionMode="multiple" defaultValue={[0]} shape="round">
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
    </StandardButtonGroup>
  ),
};

export const SquareShape: Story = {
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        {sizes.map((size) => (
          <StandardButtonGroup key={size} size={size} shape="square" selectionMode="single" defaultValue={[0]}>
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
          </StandardButtonGroup>
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
          <StandardButtonGroup key={size} size={size} shape="round" selectionMode="multiple" defaultValue={[0]}>
            <IconButton variant="tonal">
              <BoldIcon />
            </IconButton>
            <IconButton variant="tonal">
              <ItalicIcon />
            </IconButton>
            <IconButton variant="tonal">
              <UnderlineIcon />
            </IconButton>
            <IconButton variant="tonal">
              <StrikethroughIcon />
            </IconButton>
          </StandardButtonGroup>
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
          <StandardButtonGroup key={size} size={size} shape="square" selectionMode="single" defaultValue={[0]}>
            <IconButton variant="outlined">
              <AlignLeftIcon />
            </IconButton>
            <IconButton variant="outlined">
              <AlignCenterIcon />
            </IconButton>
            <IconButton variant="outlined">
              <AlignRightIcon />
            </IconButton>
            <IconButton variant="outlined">
              <AlignJustifyIcon />
            </IconButton>
          </StandardButtonGroup>
        ))}
      </div>
    );
  },
};
