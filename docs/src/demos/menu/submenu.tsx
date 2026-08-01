import { Button, Menu, MenuContent, MenuItem, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from 'm3you';

export default function MenuSubmenu() {
  return (
    <Menu>
      <MenuTrigger render={<Button variant="tonal">Share</Button>} />
      <MenuContent>
        <MenuItem>Copy link</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Send to</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Dilnoza</MenuItem>
            <MenuItem>Bekzod</MenuItem>
            <MenuItem>Design team</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuItem>Export as PDF</MenuItem>
      </MenuContent>
    </Menu>
  );
}
