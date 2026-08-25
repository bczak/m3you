import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  EditIcon,
  FileIcon,
  ImageIcon,
  PlusIcon,
  RepeatIcon,
  ShareIcon,
  StarIcon,
  VideoIcon,
} from 'lucide-react';
import type * as React from 'react';
import { useState } from 'react';
import { expect } from 'storybook/test';
import { ExtendedFAB } from '../src/components/ExtendedFab/extended-fab';
import { FAB } from '../src/components/Fab/fab';
import { FABMenu, type FABMenuItemOption } from '../src/components/FabMenu/fab-menu';
import { generateM3Theme } from '../src/lib/color';

const meta = {
  title: 'Actions/FAB Menu',
  component: FABMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FABMenu>;

export default meta;
type Story = StoryObj;

const defaultItems = [
  { icon: <StarIcon />, label: 'Favorite', onClick: () => console.log('Favorite') },
  { icon: <ShareIcon />, label: 'Share', onClick: () => console.log('Share') },
  { icon: <EditIcon />, label: 'Edit', onClick: () => console.log('Edit') },
];

export const Default: Story = {
  args: {
    items: defaultItems,
    children: (
      <FAB aria-label="Create">
        <PlusIcon />
      </FAB>
    ),
  },
};

// Renders in the open state via `defaultOpen` so the expanded menu items show.
export const Open: Story = {
  args: {
    defaultOpen: true,
    items: defaultItems,
    children: (
      <FAB aria-label="Create">
        <PlusIcon />
      </FAB>
    ),
  },
};

export const WithExtendedFAB: Story = {
  args: {
    items: [
      { icon: <ImageIcon />, label: 'Photo', onClick: () => console.log('Photo') },
      { icon: <VideoIcon />, label: 'Video', onClick: () => console.log('Video') },
      { icon: <FileIcon />, label: 'Document', onClick: () => console.log('Document') },
    ],
    children: <ExtendedFAB icon={<PlusIcon />} label="Create" />,
  },
};

export const WithScrim: Story = {
  args: {
    items: defaultItems,
    scrim: true,
    children: (
      <FAB aria-label="Create">
        <PlusIcon />
      </FAB>
    ),
  },
};

export const FilledVariant: Story = {
  args: {
    items: defaultItems,
    children: (
      <FAB aria-label="Create" variant="filled">
        <PlusIcon />
      </FAB>
    ),
  },
};

export const TertiaryColor: Story = {
  args: {
    defaultOpen: true,
    color: 'tertiary-container',
    items: defaultItems,
    children: (
      <FAB aria-label="Create">
        <PlusIcon />
      </FAB>
    ),
  },
};

function ControlledStory() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <button type="button" onClick={() => setOpen(!open)}>
        Toggle: {open ? 'Open' : 'Closed'}
      </button>
      <FABMenu items={defaultItems} open={open} onOpenChange={setOpen}>
        <FAB aria-label="Create">
          <PlusIcon />
        </FAB>
      </FABMenu>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledStory />,
};

// =============================================================================
// Per-item colour — measured in the browser
// =============================================================================

const LEDGER_SEED = '#416699';

/** The M3 palette for one theme, as inline custom properties on a wrapper. */
function themeTokens(isDark: boolean): React.CSSProperties {
  const { light, dark } = generateM3Theme(LEDGER_SEED);
  return {
    colorScheme: isDark ? 'dark' : 'light',
    ...(isDark ? dark : light),
  } as React.CSSProperties;
}

const ledgerItems: FABMenuItemOption[] = [
  // The negative action. The container pair, never the `error` fill.
  { icon: <ArrowDownIcon />, label: 'Expense', color: 'error-container' },
  // The positive action.
  { icon: <ArrowUpIcon />, label: 'Income', color: 'tertiary-container' },
  // No colour of its own: inherits whatever the menu is set to.
  { icon: <RepeatIcon />, label: 'Transfer' },
];

export const PerItemColor: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          "An item's `color` overrides the menu's for that item alone; an item without one inherits the menu's. The play function reads the resolved container and label colours back out of the browser in both themes and checks each against the M3 token it should be, then measures the contrast of every pair.",
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', gap: 64 }}>
      {[false, true].map((isDark) => (
        <div
          key={String(isDark)}
          data-panel={isDark ? 'dark' : 'light'}
          data-theme={isDark ? 'dark' : 'light'}
          style={{
            ...themeTokens(isDark),
            display: 'flex',
            justifyContent: 'flex-end',
            padding: 24,
            paddingBlockStart: 240,
            borderRadius: 16,
            backgroundColor: 'var(--md-sys-color-surface)',
          }}
        >
          <FABMenu items={ledgerItems} defaultOpen color="secondary-container">
            <FAB aria-label={isDark ? 'Add, dark' : 'Add, light'}>
              <PlusIcon />
            </FAB>
          </FABMenu>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    /** A token as the browser computes it *inside this panel*, so it can be compared to a used value. */
    const resolve = (scope: HTMLElement, token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      scope.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };

    const contrast = (a: string, b: string) => {
      const luminance = (color: string) => {
        const [r, g, b2] = (color.match(/\d+/g) ?? []).slice(0, 3).map((channel) => {
          const value = Number(channel) / 255;
          return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b2;
      };
      const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (high + 0.05) / (low + 0.05);
    };

    // Container role → the "on" role M3 pairs it with. Applying a colour
    // outside these pairs is what breaks contrast, so the test asserts the
    // pairing rather than a hard-coded hex.
    const expected: [string, string, string][] = [
      ['Expense', '--md-sys-color-error-container', '--md-sys-color-on-error-container'],
      ['Income', '--md-sys-color-tertiary-container', '--md-sys-color-on-tertiary-container'],
      ['Transfer', '--md-sys-color-secondary-container', '--md-sys-color-on-secondary-container'],
    ];

    for (const theme of ['light', 'dark'] as const) {
      const panel = canvasElement.querySelector<HTMLElement>(`[data-panel="${theme}"]`) as HTMLElement;
      const items = Array.from(panel.querySelectorAll<HTMLElement>('[role="menuitem"]'));

      await step(`${theme}: each item paints its own role, and the unset one inherits the menu's`, async () => {
        await expect(items.map((item) => item.textContent)).toEqual(['Expense', 'Income', 'Transfer']);
        await expect(items.map((item) => item.getAttribute('data-fab-color'))).toEqual([
          'error-container',
          'tertiary-container',
          'secondary-container',
        ]);

        for (const [index, [label, containerToken, onToken]] of expected.entries()) {
          const style = getComputedStyle(items[index]);
          await expect(style.backgroundColor, `${label} container`).toBe(resolve(panel, containerToken));
          await expect(style.color, `${label} label`).toBe(resolve(panel, onToken));
          // The icon is a child with no colour of its own, so it inherits the
          // label colour — which is also what the state layers mix from.
          const icon = items[index].querySelector('svg') as SVGElement;
          await expect(getComputedStyle(icon).color, `${label} icon`).toBe(style.color);
        }
      });

      await step(`${theme}: every pair clears the WCAG AA text minimum`, async () => {
        // M3: "Any color roles starting with 'on-' are guaranteed to have
        // sufficient contrast with the corresponding color role." This is the
        // check that the extension did not step outside an intended pair —
        // 4.5:1 is the small-text figure M3 quotes from WCAG.
        for (const [index, [label]] of expected.entries()) {
          const style = getComputedStyle(items[index]);
          await expect(contrast(style.backgroundColor, style.color), `${label} contrast`).toBeGreaterThanOrEqual(4.5);
        }
      });

      await step(`${theme}: the negative role separates from the page as well as the menu default does`, async () => {
        // FAB menu items are clustered, so M3 asks for 3:1 between container
        // and background. No *-container role in the M3 palette reaches that
        // against `surface` — the menu's own default, secondary-container, does
        // not either. The bar this guards is therefore relative: adding
        // error-container must not make an item harder to pick out of the page
        // than the default it replaces.
        const surface = resolve(panel, '--md-sys-color-surface');
        const vsSurface = (index: number) => contrast(getComputedStyle(items[index]).backgroundColor, surface);
        await expect(vsSurface(0), 'Expense vs surface').toBeGreaterThan(1.05);
        await expect(vsSurface(0), 'Expense vs surface').toBeGreaterThanOrEqual(vsSurface(2));
      });

      await step(`${theme}: the trigger keeps the menu's colour, not an item's`, async () => {
        const trigger = panel.querySelector('.md-fab-menu-trigger') as HTMLElement;
        await expect(trigger).toHaveAttribute('data-fab-color', 'secondary-container');
        await expect(getComputedStyle(trigger).backgroundColor).toBe(
          resolve(panel, '--md-sys-color-secondary-container'),
        );
      });
    }
  },
};
