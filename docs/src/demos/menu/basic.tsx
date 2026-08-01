import { Copy, Pencil, Trash2 } from 'lucide-react';
import { Button, Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger } from 'm3you';

export default function MenuBasic() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="outlined">Open menu</Button>} />
      <MenuContent>
        <MenuItem leadingIcon={<Pencil size={18} aria-hidden="true" />}>Rename</MenuItem>
        <MenuItem leadingIcon={<Copy size={18} aria-hidden="true" />} trailingText="⌘D">
          Duplicate
        </MenuItem>
        <MenuDivider />
        <MenuItem leadingIcon={<Trash2 size={18} aria-hidden="true" />}>Delete</MenuItem>
      </MenuContent>
    </Menu>
  );
}
