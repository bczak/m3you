import { Bell, Check, Heart, Home, Inbox, Plus, Search, Settings, Share2, Star, User } from 'lucide-react';
import {
  AppBar,
  Avatar,
  Badge,
  BadgeAnchor,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  ConnectedButtonGroup,
  Divider,
  ExtendableFAB,
  ExtendedFAB,
  FAB,
  FABMenu,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  LoadingIndicator,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  NavigationRailItem,
  OTPInput,
  RadioButton,
  SearchBar,
  Slider,
  Snackbar,
  SplitButton,
  SplitButtonAction,
  StandardButtonGroup,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleIconButton,
  Toolbar,
} from 'm3you';
import type { ReactNode } from 'react';

const icon = (Icon: typeof Home, size = 18) => <Icon size={size} aria-hidden="true" />;

/**
 * A small taste of each component for the gallery cards.
 *
 * Every entry is the real component with real props — a card that lied about
 * what the library renders would be worse than no card. Anything genuinely
 * overlay-shaped (dialogs, sheets, pickers) is represented by the surface it
 * produces rather than being opened on a 120px card.
 */
export const GALLERY_PREVIEWS: Record<string, ReactNode> = {
  // ── Actions ──
  button: (
    <div className="m3-gp-row">
      <Button variant="filled" size="xs">
        Filled
      </Button>
      <Button variant="outlined" size="xs">
        Outlined
      </Button>
    </div>
  ),
  'icon-button': (
    <div className="m3-gp-row">
      <IconButton variant="filled">{icon(Heart)}</IconButton>
      <IconButton variant="tonal">{icon(Share2)}</IconButton>
      <IconButton variant="outlined">{icon(Star)}</IconButton>
    </div>
  ),
  'toggle-button': (
    <div className="m3-gp-row">
      <ToggleButton size="xs">Off</ToggleButton>
      <ToggleButton size="xs" defaultSelected>
        On
      </ToggleButton>
    </div>
  ),
  'toggle-icon-button': (
    <div className="m3-gp-row">
      <ToggleIconButton variant="tonal">{icon(Star)}</ToggleIconButton>
      <ToggleIconButton variant="filled" defaultSelected>
        {icon(Star)}
      </ToggleIconButton>
    </div>
  ),
  'standard-button-group': (
    <StandardButtonGroup size="xs" defaultValue={[1]}>
      <Button>One</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </StandardButtonGroup>
  ),
  'connected-button-group': (
    <ConnectedButtonGroup size="xs" selectionMode="single" defaultValue={[1]}>
      <Button>Day</Button>
      <Button>Week</Button>
      <Button>Month</Button>
    </ConnectedButtonGroup>
  ),
  'split-button': (
    <SplitButton size="xs">
      <SplitButtonAction>Save</SplitButtonAction>
    </SplitButton>
  ),
  fab: (
    <div className="m3-gp-row">
      <FAB size="sm">{icon(Plus)}</FAB>
      <FAB variant="filled">{icon(Plus, 22)}</FAB>
    </div>
  ),
  'extended-fab': <ExtendedFAB icon={icon(Plus, 20)} label="Compose" />,
  'extendable-fab': <ExtendableFAB icon={icon(Plus, 20)} label="Extendable" extended />,
  'fab-menu': (
    <FABMenu
      items={[
        { icon: icon(Inbox), label: 'Inbox' },
        { icon: icon(Star), label: 'Starred' },
      ]}
    >
      <FAB variant="filled" aria-label="Open menu">
        {icon(Plus, 22)}
      </FAB>
    </FABMenu>
  ),

  // ── Communication ──
  badge: (
    <div className="m3-gp-row">
      <BadgeAnchor badge={<Badge count={3} />}>
        <IconButton variant="tonal">{icon(Bell)}</IconButton>
      </BadgeAnchor>
      <BadgeAnchor badge={<Badge />}>
        <IconButton variant="tonal">{icon(Home)}</IconButton>
      </BadgeAnchor>
    </div>
  ),
  'circular-progress': (
    <div className="m3-gp-row">
      <CircularProgress value={65} />
      <CircularProgress type="indeterminate" />
    </div>
  ),
  'linear-progress': (
    <div className="m3-gp-stack m3-gp-wide">
      <LinearProgress value={60} />
      <LinearProgress variant="wavy" value={35} />
    </div>
  ),
  'loading-indicator': <LoadingIndicator />,
  snackbar: <Snackbar message="Message sent" actionLabel="Undo" />,

  // ── Containment ──
  avatar: (
    <div className="m3-gp-row">
      <Avatar variant="monogram">M3</Avatar>
      <Avatar variant="icon">{icon(User, 22)}</Avatar>
    </div>
  ),
  card: (
    <Card variant="elevated" className="m3-gp-card">
      <strong>Elevated</strong>
      <p>Supporting text</p>
    </Card>
  ),
  dialog: (
    <Card variant="filled" className="m3-gp-card">
      <strong>Delete file?</strong>
      <p>This cannot be undone.</p>
      <div className="m3-gp-row m3-gp-row--end">
        <Button variant="text" size="xs">
          Cancel
        </Button>
        <Button variant="text" size="xs">
          Delete
        </Button>
      </div>
    </Card>
  ),
  list: (
    <div className="m3-gp-wide">
      <List appearance="segmented">
        <ListItem headline="Documents" supportingText="24 files" leading={icon(Inbox)} />
        <ListItem headline="Photos" supportingText="1,204 items" leading={icon(Star)} />
      </List>
    </div>
  ),
  carousel: <div className="m3-gp-carousel" aria-hidden="true" />,
  'bottom-sheet': <div className="m3-gp-sheet" data-edge="bottom" />,
  'side-sheet': <div className="m3-gp-sheet" data-edge="side" />,
  divider: (
    <div className="m3-gp-stack m3-gp-wide">
      <span className="m3-gp-caption">Above</span>
      <Divider />
      <span className="m3-gp-caption">Below</span>
    </div>
  ),
  tooltip: <div className="m3-gp-tooltip">Tooltip</div>,
  toolbar: (
    <Toolbar>
      <IconButton variant="standard">{icon(Home)}</IconButton>
      <IconButton variant="standard">{icon(Search)}</IconButton>
      <IconButton variant="standard">{icon(Settings)}</IconButton>
    </Toolbar>
  ),

  // ── Navigation ──
  'app-bar': (
    <div className="m3-gp-wide">
      <AppBar headline="Inbox" trailingIcons={<IconButton variant="standard">{icon(Search)}</IconButton>} />
    </div>
  ),
  // NavigationBar is `position: fixed` and has no `position` prop, so it needs a
  // host that establishes a containing block (see .m3-gp-fixedhost).
  'navigation-bar': (
    <div className="m3-gp-wide m3-gp-fixedhost">
      <NavigationBar value="home">
        <NavigationBarItem value="home" icon={icon(Home, 20)} label="Home" />
        <NavigationBarItem value="search" icon={icon(Search, 20)} label="Search" />
        <NavigationBarItem value="settings" icon={icon(Settings, 20)} label="Settings" />
      </NavigationBar>
    </div>
  ),
  'navigation-rail': (
    <div className="m3-gp-railwrap">
      <NavigationRail position="relative" value="home">
        <NavigationRailItem value="home" icon={icon(Home, 20)} label="Home" />
        <NavigationRailItem value="inbox" icon={icon(Inbox, 20)} label="Inbox" />
      </NavigationRail>
    </div>
  ),
  tabs: (
    <div className="m3-gp-wide">
      <Tabs value="one">
        <Tab value="one">Overview</Tab>
        <Tab value="two">Details</Tab>
      </Tabs>
    </div>
  ),
  // MenuItem requires a Menu root context, so the closed-state surface is drawn
  // with tokens here; the component page opens a real menu.
  menu: (
    <Card variant="filled" className="m3-gp-menu">
      <div className="m3-gp-menuitem">Rename</div>
      <div className="m3-gp-menuitem" data-selected>
        Duplicate
      </div>
      <div className="m3-gp-menuitem">Delete</div>
    </Card>
  ),
  search: (
    <div className="m3-gp-wide">
      <SearchBar placeholder="Search" />
    </div>
  ),

  // ── Selection ──
  checkbox: (
    <div className="m3-gp-row">
      <Checkbox checked />
      <Checkbox />
      <Checkbox indeterminate />
    </div>
  ),
  chip: (
    <div className="m3-gp-row">
      <Chip type="filter" selected leadingIcon={icon(Check, 16)}>
        Filter
      </Chip>
      <Chip type="assist">Assist</Chip>
    </div>
  ),
  'radio-button': (
    <div className="m3-gp-row">
      <RadioButton name="gallery-radio" defaultChecked />
      <RadioButton name="gallery-radio" />
    </div>
  ),
  slider: (
    <div className="m3-gp-wide m3-gp-inset">
      <Slider defaultValue={40} />
    </div>
  ),
  switch: (
    <div className="m3-gp-row">
      <Switch defaultChecked />
      <Switch />
    </div>
  ),
  'date-picker': <div className="m3-gp-calendar" aria-hidden="true" />,
  'time-picker': (
    <div className="m3-gp-row">
      <span className="m3-gp-timefield">09</span>
      <span className="m3-gp-timecolon">:</span>
      <span className="m3-gp-timefield">30</span>
    </div>
  ),

  // ── Text inputs ──
  'otp-input': (
    <div className="m3-gp-wide m3-gp-inset">
      <OTPInput aria-label="Verification code" defaultValue="123456" />
    </div>
  ),
  'text-field': (
    <div className="m3-gp-wide m3-gp-inset">
      <TextField label="Label" variant="outlined" />
    </div>
  ),
};
