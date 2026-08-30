import type { Meta, StoryObj } from '@storybook/react-vite';
import { BusIcon, HouseIcon, ShoppingCartIcon, UserIcon, UtensilsIcon } from 'lucide-react';

import { Avatar } from '../src/components/Avatar/avatar';

const meta = {
  title: 'Containment/Avatar',
  component: Avatar,
  args: { variant: 'monogram' },
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const portrait = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="#c2e7ff"/><circle cx="20" cy="15" r="8" fill="#334155"/><path d="M7 40c1-10 6-15 13-15s12 5 13 15" fill="#334155"/></svg>',
)}`;

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar variant="image" src={portrait} alt="Profile portrait" />
      <Avatar variant="monogram">AJ</Avatar>
      <Avatar variant="icon" role="img" aria-label="Generic profile">
        <UserIcon aria-hidden="true" />
      </Avatar>
    </div>
  ),
};

export const DecorativeImage: Story = {
  render: () => <Avatar variant="image" src={portrait} alt="" />,
};

/** One colour per thing named, the way a calendar or a category list colours its rows. */
export const SourceColor: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Avatar variant="icon" sourceColor="#4caf50" role="img" aria-label="Groceries">
        <ShoppingCartIcon aria-hidden="true" />
      </Avatar>
      <Avatar variant="icon" sourceColor="#ff9800" role="img" aria-label="Eating out">
        <UtensilsIcon aria-hidden="true" />
      </Avatar>
      <Avatar variant="icon" sourceColor="#2196f3" role="img" aria-label="Transport">
        <BusIcon aria-hidden="true" />
      </Avatar>
      <Avatar variant="icon" sourceColor="#795548" role="img" aria-label="Housing">
        <HouseIcon aria-hidden="true" />
      </Avatar>
      <Avatar variant="monogram" sourceColor="#9c27b0">
        AJ
      </Avatar>
    </div>
  ),
};
