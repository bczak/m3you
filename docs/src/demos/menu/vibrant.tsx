import { Copy, Pencil, Share2 } from 'lucide-react';
import { Button, Menu, MenuContent, MenuItem, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from 'm3you';

export default function MenuVibrant() {
  return (
    <Menu color="vibrant">
      <MenuTrigger render={<Button variant="tonal">Edit</Button>} />
      <MenuContent>
        <MenuItem selected>Bold</MenuItem>
        <MenuItem leadingIcon={<Pencil size={18} aria-hidden="true" />}>Rename</MenuItem>
        <MenuItem leadingIcon={<Copy size={18} aria-hidden="true" />} trailingText="⌘D">
          Duplicate
        </MenuItem>
        <MenuSub>
          <MenuSubTrigger>
            <Share2 size={18} aria-hidden="true" />
            Share
          </MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Copy link</MenuItem>
            <MenuItem>Email</MenuItem>
          </MenuSubContent>
        </MenuSub>
      </MenuContent>
    </Menu>
  );
}
