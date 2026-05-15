import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookmarkIcon, CircleStarIcon, CopyIcon, DownloadIcon, PrinterIcon, ShareIcon } from 'lucide-react';
import { MenuItem } from '../src/components/Menu/menu';
import { SplitButton, SplitButtonAction, SplitButtonMenu } from '../src/components/SplitButton/split-button';

const meta = {
  title: 'Actions/Split Button',
  component: SplitButton,
  parameters: {
    layout: 'centered',
    controls: {
      include: ['variant', 'size', 'shape'],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SplitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'filled',
    size: 'sm',
    shape: 'round',
  },
  render: (args) => (
    <SplitButton {...args}>
      <SplitButtonAction>
        <CircleStarIcon aria-hidden="true" />
        Label
      </SplitButtonAction>
      <SplitButtonMenu>
        <MenuItem>Option 1</MenuItem>
        <MenuItem>Option 2</MenuItem>
        <MenuItem>Option 3</MenuItem>
      </SplitButtonMenu>
    </SplitButton>
  ),
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
      {(['filled', 'tonal', 'elevated', 'outlined'] as const).map((variant) => (
        <SplitButton key={variant} variant={variant} size="sm" shape="round">
          <SplitButtonAction>
            <CircleStarIcon aria-hidden="true" />
            Label
          </SplitButtonAction>
          <SplitButtonMenu>
            <MenuItem>
              <CopyIcon aria-hidden="true" />
              Copy
            </MenuItem>
            <MenuItem>
              <ShareIcon aria-hidden="true" />
              Share
            </MenuItem>
            <MenuItem>
              <BookmarkIcon aria-hidden="true" />
              Bookmark
            </MenuItem>
          </SplitButtonMenu>
        </SplitButton>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <SplitButton key={size} variant="filled" size={size} shape="round">
          <SplitButtonAction>
            <CircleStarIcon aria-hidden="true" />
            Label
          </SplitButtonAction>
          <SplitButtonMenu>
            <MenuItem>Option 1</MenuItem>
            <MenuItem>Option 2</MenuItem>
            <MenuItem>Option 3</MenuItem>
          </SplitButtonMenu>
        </SplitButton>
      ))}
    </div>
  ),
};

export const WithMenuActions: Story = {
  render: () => (
    <SplitButton variant="tonal" size="sm" shape="round">
      <SplitButtonAction onClick={() => console.log('Download default')}>
        <DownloadIcon aria-hidden="true" />
        Download
      </SplitButtonAction>
      <SplitButtonMenu>
        <MenuItem onClick={() => console.log('PDF')}>
          <DownloadIcon aria-hidden="true" />
          Download as PDF
        </MenuItem>
        <MenuItem onClick={() => console.log('CSV')}>
          <DownloadIcon aria-hidden="true" />
          Download as CSV
        </MenuItem>
        <MenuItem onClick={() => console.log('Print')}>
          <PrinterIcon aria-hidden="true" />
          Print
        </MenuItem>
      </SplitButtonMenu>
    </SplitButton>
  ),
};

export const SquareShape: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
      {(['filled', 'tonal', 'elevated', 'outlined'] as const).map((variant) => (
        <SplitButton key={variant} variant={variant} size="sm" shape="square">
          <SplitButtonAction>
            <CircleStarIcon aria-hidden="true" />
            Label
          </SplitButtonAction>
          <SplitButtonMenu>
            <MenuItem>Option 1</MenuItem>
            <MenuItem>Option 2</MenuItem>
          </SplitButtonMenu>
        </SplitButton>
      ))}
    </div>
  ),
};

export const AllVariantsAllSizes: Story = {
  render: () => {
    const variants = ['filled', 'tonal', 'elevated', 'outlined'] as const;
    const sizes = ['xs', 'sm', 'md'] as const;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48 }}>
        {variants.map((variant) => (
          <div key={variant} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            {sizes.map((size) => (
              <SplitButton key={size} variant={variant} size={size} shape="round">
                <SplitButtonAction>
                  <CircleStarIcon aria-hidden="true" />
                  Label
                </SplitButtonAction>
                <SplitButtonMenu>
                  <MenuItem>
                    <CopyIcon aria-hidden="true" />
                    Copy
                  </MenuItem>
                  <MenuItem>
                    <ShareIcon aria-hidden="true" />
                    Share
                  </MenuItem>
                </SplitButtonMenu>
              </SplitButton>
            ))}
          </div>
        ))}
      </div>
    );
  },
};
