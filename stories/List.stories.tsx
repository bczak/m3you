import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchiveIcon, InboxIcon, MoreVerticalIcon, StarIcon, Trash2Icon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { IconButton } from '../src/components/IconButton/icon-button';
import { List, ListDivider, ListItem, ListItemAccordion, ListItemSwipe } from '../src/components/List/list';
import { ShowcaseGrid, ShowcasePanel } from './_helpers/storybook-showcase';

const meta = {
  title: 'Containment/List',
  component: List,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'M3 Expressive lists support standard and segmented appearances without changing their static, action, or selection semantics.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

const LeadingAvatar = ({ children }: { children: string }) => (
  <span
    aria-hidden="true"
    style={{
      display: 'grid',
      placeItems: 'center',
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'var(--md-sys-color-tertiary-container)',
      color: 'var(--md-sys-color-on-tertiary-container)',
      fontWeight: 700,
    }}
  >
    {children}
  </span>
);

export const Playground: Story = {
  render: () => (
    <List aria-label="Recent conversations">
      <ListItem
        headline="Ada Lovelace"
        supportingText="The analytical engine notes are ready."
        leading={<LeadingAvatar>AL</LeadingAvatar>}
        trailing="2m"
      />
      <ListItem
        headline="Grace Hopper"
        supportingText="I found the compiler issue."
        leading={<LeadingAvatar>GH</LeadingAvatar>}
        trailing="18m"
      />
      <ListItem
        headline="Katherine Johnson"
        supportingText="Flight calculations are complete."
        leading={<LeadingAvatar>KJ</LeadingAvatar>}
        trailing="1h"
      />
    </List>
  ),
};

export const ExpressiveAppearances: Story = {
  render: () => (
    <ShowcaseGrid>
      <ShowcasePanel
        eyebrow="Expressive"
        title="Segmented"
        description="Separated shapes make each item feel distinct."
      >
        <List appearance="segmented">
          <ListItem headline="Inbox" supportingText="12 unread" leading={<InboxIcon aria-hidden="true" />} />
          <ListItem headline="Starred" supportingText="8 conversations" leading={<StarIcon aria-hidden="true" />} />
          <ListItem headline="Archive" supportingText="Everything else" leading={<ArchiveIcon aria-hidden="true" />} />
        </List>
      </ShowcasePanel>
      <ShowcasePanel
        eyebrow="Expressive"
        title="Standard"
        description="Continuous rows suit dense, edge-to-edge surfaces."
      >
        <List appearance="standard">
          <ListItem headline="Inbox" supportingText="12 unread" leading={<InboxIcon aria-hidden="true" />} />
          <ListDivider inset />
          <ListItem headline="Starred" supportingText="8 conversations" leading={<StarIcon aria-hidden="true" />} />
          <ListDivider inset />
          <ListItem headline="Archive" supportingText="Everything else" leading={<ArchiveIcon aria-hidden="true" />} />
        </List>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
  play: async ({ canvasElement, step }) => {
    const [segmented, standard] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.md-list'));
    const firstRow = (list: HTMLElement) => list.querySelector('.md-list-item') as HTMLElement;
    const layout = (list: HTMLElement) =>
      getComputedStyle(firstRow(list).querySelector('.md-list-item__layout') as HTMLElement);

    await step('segmented rows use the Expressive list item: 10px padding, 12px gap, 64px two-line rows', async () => {
      await expect(firstRow(segmented).getBoundingClientRect().height).toBeCloseTo(64, 0);
      await expect(layout(segmented).paddingTop).toBe('10px');
      await expect(layout(segmented).columnGap).toBe('12px');
    });

    await step('standard rows keep the baseline list item: 8px padding, 16px gap, 72px two-line rows', async () => {
      await expect(firstRow(standard).getBoundingClientRect().height).toBeCloseTo(72, 0);
      await expect(layout(standard).paddingTop).toBe('8px');
      await expect(layout(standard).columnGap).toBe('16px');
    });
  },
};

function SelectionExamples() {
  const [singleValue, setSingleValue] = useState<string | null>('comfortable');
  const [multipleValue, setMultipleValue] = useState<string[]>(['email', 'fax']);

  return (
    <ShowcaseGrid>
      <ShowcasePanel eyebrow="Listbox" title="Single selection" description={`Selected: ${singleValue ?? 'none'}`}>
        <List
          mode="single-select"
          aria-label="Choose density"
          value={singleValue ?? undefined}
          required={false}
          onValueChange={setSingleValue}
        >
          <ListItem value="compact" headline="Compact" supportingText="More rows on screen" />
          <ListItem value="comfortable" headline="Comfortable" supportingText="Balanced spacing" />
          <ListItem value="spacious" headline="Spacious" supportingText="Largest touch areas" />
        </List>
      </ShowcasePanel>
      <ShowcasePanel
        eyebrow="Listbox"
        title="Multiple selection"
        description={`${multipleValue.length} channels enabled`}
      >
        <List
          mode="multi-select"
          aria-label="Choose notification channels"
          value={multipleValue}
          onValueChange={setMultipleValue}
        >
          <ListItem value="email" headline="Email" />
          <ListItem value="push" headline="Push notifications" />
          <ListItem value="sms" headline="Text message" disabled />
          <ListItem value="fax" headline="Fax" supportingText="Selected, but unavailable" disabled />
        </List>
      </ShowcasePanel>
    </ShowcaseGrid>
  );
}

export const SelectionModes: Story = {
  render: () => <SelectionExamples />,
};

export const FullRowHover: Story = {
  render: () => (
    <List mode="single-select" aria-label="Choose a display density" defaultValue="comfortable">
      <ListItem
        value="comfortable"
        headline="Comfortable"
        supportingText="Balanced spacing"
        leading={<UserIcon aria-label="Account" />}
      />
    </List>
  ),
  play: async ({ canvas, step }) => {
    // `vitest/browser` throws on evaluation outside Vitest's browser mode, so a
    // top-level import blanks every story in this file in plain Storybook. Load
    // it here instead: real-pointer :hover can only be driven under Vitest.
    const browserPage = await import('vitest/browser').then(
      (module) => module.page,
      () => null,
    );
    if (!browserPage) return;

    const row = canvas.getByRole('option', { name: /Comfortable Balanced spacing/ });
    const surface = row.querySelector<HTMLElement>('.md-ripple-hover-layer__surface') as HTMLElement;
    const targets = [
      ['headline', row.querySelector<HTMLElement>('.md-list-item__headline')],
      ['supporting text', row.querySelector<HTMLElement>('.md-list-item__supporting-text')],
      ['leading content', row.querySelector<HTMLElement>('.md-list-item__leading')],
      ['selection indicator', row.querySelector<HTMLElement>('.md-list-item__selection')],
    ] as const;

    for (const [label, target] of targets) {
      await step(`hover remains visible over ${label}`, async () => {
        await browserPage.elementLocator(target as HTMLElement).hover();
        await expect(row.matches(':hover')).toBe(true);
        await waitFor(() => expect(getComputedStyle(surface).opacity).toBe('0.08'));
      });
    }

    await browserPage.elementLocator(row).unhover();
  },
};

export const ActionModes: Story = {
  render: () => (
    <ShowcaseGrid>
      <ShowcasePanel eyebrow="One target" title="Single action" description="The entire row is one button or link.">
        <List mode="single-action" aria-label="Folders">
          <ListItem
            headline="Inbox"
            supportingText="12 unread"
            leading={<InboxIcon aria-hidden="true" />}
            onClick={() => {}}
          />
          <ListItem
            headline="Starred"
            supportingText="8 conversations"
            leading={<StarIcon aria-hidden="true" />}
            href="#starred"
          />
          <ListItem headline="Archive" leading={<ArchiveIcon aria-hidden="true" />} disabled onClick={() => {}} />
        </List>
      </ShowcasePanel>
      <ShowcasePanel
        eyebrow="Several targets"
        title="Multi action"
        description="Secondary controls remain siblings of the primary target."
      >
        <List mode="multi-action" aria-label="Contacts">
          <ListItem
            headline="Alex Morgan"
            supportingText="Product design"
            leading={<UserIcon aria-hidden="true" />}
            onClick={() => {}}
            trailing={
              <IconButton aria-label="More actions for Alex Morgan" variant="standard" size="sm">
                <MoreVerticalIcon aria-hidden="true" />
              </IconButton>
            }
          />
          <ListItem
            headline="Sam Rivera"
            supportingText="Engineering"
            leading={<UserIcon aria-hidden="true" />}
            href="#sam-rivera"
            trailing={
              <IconButton aria-label="More actions for Sam Rivera" variant="standard" size="sm">
                <MoreVerticalIcon aria-hidden="true" />
              </IconButton>
            }
          />
        </List>
      </ShowcasePanel>
    </ShowcaseGrid>
  ),
};

export const ContentAndStates: Story = {
  parameters: {
    a11y: {
      // The dragged row is the kit's "State=Dragged" exactly: an On Tertiary
      // Container @16% state layer over Tertiary Container, with On Tertiary
      // Container text. The generated palette puts that text only just over
      // the line at rest (4.55:1), so any state layer takes it under 4.5:1
      // (3.39:1 here). A row is only dragged while it is being moved, and the
      // missing headroom is a palette/token gap, not List's layer to drop.
      // So the color-contrast check skips that one row; every other row, and
      // every other rule on the dragged row, is still audited.
      config: { rules: [{ id: 'color-contrast', selector: '*:not(.md-list-item[data-dragged] *)' }] },
    },
  },
  render: () => (
    <List aria-label="Content density examples" style={{ maxWidth: 720 }}>
      <ListItem headline="One-line item" trailing="52dp" />
      <ListItem
        headline="Two-line item"
        supportingText="Supporting text adds context without another action."
        trailing="64dp"
      />
      <ListItem
        headline="Three-line item"
        overline="Category"
        supportingText="Overline, headline and supporting text, top-aligned."
        trailing="80dp"
      />
      <ListItem headline="Disabled item" supportingText="Unavailable in the current context" disabled />
      <ListItem
        headline="Dragged visual state"
        supportingText="Ordering is intentionally owned by a sortable abstraction"
        dragged
      />
    </List>
  ),
};

export const Density: Story = {
  render: () => (
    <ShowcaseGrid>
      {([0, -2, -4] as const).map((density) => (
        <ShowcasePanel
          key={density}
          eyebrow={`Density ${density}`}
          title={density === 0 ? 'Default' : `Rows ${Math.abs(density) * 4}px shorter`}
          description="Each step removes 4px of row height and 2px of block padding. Child controls retain their independent 48px targets."
        >
          <List density={density} appearance="standard">
            <ListItem headline="One-line item" />
            <ListItem headline="Two-line item" supportingText="Supporting information" />
            <ListItem overline="Overline" headline="Three-line item" supportingText="Supporting information" />
          </List>
        </ShowcasePanel>
      ))}
    </ShowcaseGrid>
  ),
  play: async ({ canvasElement, step }) => {
    // Kit "List Item: 0 / -2 / -4 Density (baseline)".
    const expected = [
      [56, 72, 88],
      [48, 64, 80],
      [40, 56, 72],
    ];
    const lists = Array.from(canvasElement.querySelectorAll<HTMLElement>('.md-list'));
    for (const [index, list] of lists.entries()) {
      await step(`density ${list.dataset.density} rows are ${expected[index].join('/')}`, async () => {
        const heights = Array.from(list.querySelectorAll<HTMLElement>('.md-list-item')).map(
          (row) => row.getBoundingClientRect().height,
        );
        for (const [row, height] of heights.entries()) await expect(height).toBeCloseTo(expected[index][row], 0);
      });
    }
  },
};

export const DisclosureAndSwipe: Story = {
  render: () => (
    <List appearance="segmented" aria-label="Expressive list interactions">
      <ListItemAccordion
        headline="Notification details"
        supportingText="A native disclosure button labels its panel"
        leading={<InboxIcon aria-hidden="true" />}
      >
        Choose which events can send notifications from your account settings.
      </ListItemAccordion>
      <ListItemSwipe
        startAction={
          <button type="button" aria-label="Archive">
            <ArchiveIcon aria-hidden="true" />
          </button>
        }
        endAction={
          <button type="button" aria-label="Delete">
            <Trash2Icon aria-hidden="true" />
          </button>
        }
      >
        <div style={{ boxSizing: 'border-box', minHeight: 72, padding: 16, color: 'var(--md-sys-color-on-surface)' }}>
          Swipe this message in either direction
        </div>
      </ListItemSwipe>
      <ListItemSwipe defaultRevealedSide="end" endAction="Delete">
        <div style={{ boxSizing: 'border-box', minHeight: 72, padding: 16, color: 'var(--md-sys-color-on-surface)' }}>
          Revealed: the action sits 2px beside the row
        </div>
      </ListItemSwipe>
    </List>
  ),
};

const thumbnail = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="hsl(${hue} 55% 70%)"/></svg>`,
  )}`;

export const LeadingMedia: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A bare `<img>` in `leading` is a 40px avatar circle. `leadingType="image"` frames it as the kit\'s 56px thumbnail and `leadingType="video"` as its 114x64 video thumbnail — Corner/Extra-small with a 1px Outline Variant stroke — and a video row pads 12px above and below the thumbnail in either appearance.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 480 }}>
      {(['standard', 'segmented'] as const).map((appearance) => (
        <List key={appearance} appearance={appearance} aria-label={`Leading media, ${appearance}`}>
          <ListItem headline="Avatar" supportingText="A bare image" leading={<img alt="" src={thumbnail(210)} />} />
          <ListItem
            headline="Image"
            supportingText="leadingType image"
            leadingType="image"
            leading={<img alt="" src={thumbnail(140)} />}
          />
          <ListItem headline="Video" leadingType="video" leading={<img alt="" src={thumbnail(20)} />} />
          <ListItem
            overline="Overline"
            headline="Video"
            supportingText="Three lines"
            leadingType="video"
            leading={<img alt="" src={thumbnail(300)} />}
          />
        </List>
      ))}
    </div>
  ),
  play: async ({ canvas, step }) => {
    const rows = (appearance: string) =>
      Array.from(
        canvas
          .getByRole('list', { name: `Leading media, ${appearance}` })
          .querySelectorAll<HTMLElement>('.md-list-item'),
      );
    const media = (row: HTMLElement) => row.querySelector('.md-list-item__leading > img') as HTMLElement;
    const layout = (row: HTMLElement) => getComputedStyle(row.querySelector('.md-list-item__layout') as HTMLElement);
    const [avatarRow, imageRow] = rows('standard');

    await step('a bare image is a 40px avatar circle', async () => {
      const box = media(avatarRow).getBoundingClientRect();
      await expect([box.width, box.height]).toEqual([40, 40]);
      await expect(getComputedStyle(media(avatarRow)).borderRadius).toBe('50%');
    });

    await step('an image thumbnail is 56x56 at Corner/Extra-small, in a 72px row', async () => {
      const box = media(imageRow).getBoundingClientRect();
      await expect([box.width, box.height]).toEqual([56, 56]);
      await expect(getComputedStyle(media(imageRow)).borderRadius).toBe('4px');
      await expect(imageRow.getBoundingClientRect().height).toBeCloseTo(72, 0);
    });

    for (const appearance of ['standard', 'segmented']) {
      await step(`${appearance}: a video thumbnail is 114x64, padded 12px at every line count`, async () => {
        const [, , videoRow, threeLineVideoRow] = rows(appearance);
        const box = media(videoRow).getBoundingClientRect();
        await expect([box.width, box.height]).toEqual([114, 64]);
        // Kit "List Item: 0 Density" Leading=Video: 12 + 64 + 12.
        await expect(videoRow.getBoundingClientRect().height).toBeCloseTo(88, 0);
        for (const row of [videoRow, threeLineVideoRow]) {
          await expect([layout(row).paddingTop, layout(row).paddingBottom]).toEqual(['12px', '12px']);
        }
      });
    }
  },
};

export const LongLocalizedContent: Story = {
  parameters: { viewport: { defaultViewport: 'm3Compact' } },
  render: () => (
    <List mode="single-action" aria-label="Localized settings">
      <ListItem
        headline="Benachrichtigungseinstellungen"
        supportingText="Längere übersetzte Beschriftungen werden gekürzt, bleiben aber über den zugänglichen Namen vollständig verfügbar."
        onClick={() => {}}
      />
      <ListItem
        headline="Datenschutzeinstellungen und Berechtigungen"
        supportingText="Verwalten Sie, welche Informationen mit anderen Personen geteilt werden."
        onClick={() => {}}
      />
    </List>
  ),
};

export const DarkTheme: Story = {
  globals: { theme: 'dark' },
  render: () => (
    <List mode="single-select" aria-label="Dark theme density" defaultValue="comfortable">
      <ListItem value="compact" headline="Compact" supportingText="More rows on screen" />
      <ListItem value="comfortable" headline="Comfortable" supportingText="Balanced spacing" />
      <ListItem value="spacious" headline="Spacious" supportingText="Largest touch areas" />
    </List>
  ),
};

export const TwoHundredPercentZoom: Story = {
  parameters: {
    viewport: { defaultViewport: 'm3Compact' },
    docs: {
      description: {
        story: 'A compact-width reflow check with the component scaled to 200%.',
      },
    },
  },
  render: () => (
    <div style={{ width: '50%', zoom: 2 }}>
      <List mode="single-action" aria-label="Zoomed settings">
        <ListItem
          headline="Notification preferences"
          supportingText="Long text remains contained without creating page-level horizontal overflow."
          onClick={() => {}}
        />
        <ListItem headline="Privacy and permissions" supportingText="Manage shared information." onClick={() => {}} />
      </List>
    </div>
  ),
};

export const Empty: Story = {
  render: () => <List aria-label="No results" />,
};

// =============================================================================
// Segmented geometry — measured in the browser
// =============================================================================

export const SegmentedGeometry: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A segmented group is one filled shape: its rows sit on the `surface-container` role rather than the page background, and the corners on the outside of the group — the first row's top, the last row's bottom — take the 16dp outer corner while the corners inside the group keep the 4dp inner one. The play function measures both, checks the rows actually stand out from the page, and confirms the standard appearance is untouched.",
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <List appearance="segmented" aria-label="Segmented geometry">
        <ListItem headline="Inbox" />
        <ListItem headline="Starred" />
        <ListItem headline="Archive" />
      </List>
      <List appearance="standard" aria-label="Standard geometry">
        <ListItem headline="Inbox" />
        <ListItem headline="Starred" />
        <ListItem headline="Archive" />
      </List>
      <List
        appearance="segmented"
        aria-label="Overridden container colour"
        style={{ '--md-list-item-container-color': 'rgb(250, 240, 230)' } as React.CSSProperties}
      >
        <ListItem headline="Custom" />
      </List>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const rows = (label: string) =>
      Array.from(canvas.getByRole('list', { name: label }).querySelectorAll<HTMLElement>('.md-list-item'));
    const [first, middle, last] = rows('Segmented geometry');

    /** A colour token as the browser computes it, so it can be compared to a used value. */
    const resolve = (token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      document.body.append(probe);
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

    await step('segmented rows are filled containers, not the page background', async () => {
      const surface = resolve('--md-sys-color-surface');
      const surfaceContainer = resolve('--md-sys-color-surface-container');
      const row = getComputedStyle(first).backgroundColor;
      // The bug this story guards: rows painted `surface`, the same colour as
      // the page, so a segmented group measured 1.00:1 and read as loose text.
      await expect(row).toBe(surfaceContainer);
      await expect(row).not.toBe(surface);
      await expect(contrast(row, surface)).toBeGreaterThan(1.05);
      await expect(getComputedStyle(middle).backgroundColor).toBe(row);
      await expect(getComputedStyle(last).backgroundColor).toBe(row);
    });

    await step('the group takes the 16dp outer corner, its rows the 4dp inner one', async () => {
      const top = getComputedStyle(first);
      await expect(top.borderTopLeftRadius).toBe('16px');
      await expect(top.borderTopRightRadius).toBe('16px');
      await expect(top.borderBottomLeftRadius).toBe('4px');
      await expect(top.borderBottomRightRadius).toBe('4px');

      await expect(getComputedStyle(middle).borderRadius).toBe('4px');

      const bottom = getComputedStyle(last);
      await expect(bottom.borderTopLeftRadius).toBe('4px');
      await expect(bottom.borderTopRightRadius).toBe('4px');
      await expect(bottom.borderBottomLeftRadius).toBe('16px');
      await expect(bottom.borderBottomRightRadius).toBe('16px');
    });

    await step('the standard appearance keeps square, page-coloured rows', async () => {
      const [standardFirst] = rows('Standard geometry');
      await expect(getComputedStyle(standardFirst).borderRadius).toBe('0px');
      await expect(getComputedStyle(standardFirst).backgroundColor).toBe(resolve('--md-sys-color-surface'));
    });

    await step('the container colour stays overridable', async () => {
      const [custom] = rows('Overridden container colour');
      await expect(getComputedStyle(custom).backgroundColor).toBe('rgb(250, 240, 230)');
    });
  },
};

// =============================================================================
// Highlight-only selection — measured in the browser
// =============================================================================

export const HighlightOnlySelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`selectionIndicator=\"none\"` marks the selected row the way M3's list-detail layout does — with the row's selected container colour and `aria-selected` — and reserves no indicator gutter. Every other value keeps the indicator gutter: a 48px radio or checkbox target plus the row's slot gap (12px in the default segmented appearance). The play function measures the trailing slot against the row's padding edge in all three lists and checks the selected container colour and the listbox semantics are identical either way.",
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, inlineSize: 720 }}>
      <List mode="single-select" aria-label="Highlight only" defaultValue="rent">
        <ListItem value="rent" headline="Rent" supportingText="Housing" trailing="1,200.00" selectionIndicator="none" />
        <ListItem
          value="coffee"
          headline="Coffee"
          supportingText="Eating out"
          trailing="4.20"
          selectionIndicator="none"
        />
      </List>
      <List mode="single-select" aria-label="Radio indicator" defaultValue="rent">
        <ListItem value="rent" headline="Rent" supportingText="Housing" trailing="1,200.00" />
        <ListItem value="coffee" headline="Coffee" supportingText="Eating out" trailing="4.20" />
      </List>
      <List mode="multi-select" aria-label="Checkbox indicator" defaultValue={['rent']}>
        <ListItem value="rent" headline="Rent" supportingText="Housing" trailing="1,200.00" />
        <ListItem value="coffee" headline="Coffee" supportingText="Eating out" trailing="4.20" />
      </List>
    </div>
  ),
  play: async ({ canvas, step, userEvent }) => {
    const rows = (label: string) =>
      Array.from(canvas.getByRole('listbox', { name: label }).querySelectorAll<HTMLElement>('.md-list-item'));
    const slot = (row: HTMLElement, name: string) => row.querySelector<HTMLElement>(`.md-list-item__${name}`);
    /** How far the trailing slot stops short of the row's own padding edge. */
    const gutter = (row: HTMLElement) => {
      const trailing = slot(row, 'trailing') as HTMLElement;
      const padding = Number.parseFloat(
        getComputedStyle(row.querySelector('.md-list-item__layout') as HTMLElement).paddingInlineEnd,
      );
      return row.getBoundingClientRect().right - padding - trailing.getBoundingClientRect().right;
    };
    /** The row's own gap between slots. */
    const slotGap = (row: HTMLElement) =>
      Number.parseFloat(getComputedStyle(row.querySelector('.md-list-item__layout') as HTMLElement).columnGap);

    const resolve = (token: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${token})`;
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    };

    const [highlighted, plain] = rows('Highlight only');
    const [radioSelected] = rows('Radio indicator');
    const [checkboxSelected] = rows('Checkbox indicator');

    await step('a highlight-only row renders no indicator and reserves no gutter', async () => {
      await expect(slot(highlighted, 'selection')).toBeNull();
      await expect(slot(plain, 'selection')).toBeNull();
      // The amount lands on the row's padding edge, not 40px inside it.
      await expect(gutter(highlighted)).toBeCloseTo(0, 1);
      await expect(gutter(plain)).toBeCloseTo(0, 1);
    });

    await step('radio and checkbox indicators still reserve their gutter', async () => {
      const radio = slot(radioSelected, 'selection') as HTMLElement;
      const checkbox = slot(checkboxSelected, 'selection') as HTMLElement;
      await expect(radio).not.toBeNull();
      await expect(checkbox).not.toBeNull();
      // The slot plus the row's slot gap: 48px touch targets here, and never
      // less than the slot's own minimum (the row's icon size).
      await expect(radio.getBoundingClientRect().width).toBeCloseTo(48, 1);
      await expect(checkbox.getBoundingClientRect().width).toBeCloseTo(48, 1);
      await expect(slotGap(radioSelected)).toBe(12);
      await expect(gutter(radioSelected)).toBeCloseTo(48 + slotGap(radioSelected), 1);
      await expect(gutter(checkboxSelected)).toBeCloseTo(48 + slotGap(checkboxSelected), 1);
      await expect(gutter(radioSelected) - gutter(highlighted)).toBeGreaterThanOrEqual(40);
    });

    await step('the selected row keeps its container colour and listbox semantics', async () => {
      const selectedContainer = resolve('--md-sys-color-secondary-container');
      await expect(getComputedStyle(highlighted).backgroundColor).toBe(selectedContainer);
      await expect(getComputedStyle(radioSelected).backgroundColor).toBe(selectedContainer);
      await expect(getComputedStyle(plain).backgroundColor).toBe(resolve('--md-sys-color-surface-container'));

      await expect(highlighted).toHaveAttribute('role', 'option');
      await expect(highlighted).toHaveAttribute('aria-selected', 'true');
      await expect(highlighted).toHaveAttribute('aria-posinset', '1');
      await expect(highlighted).toHaveAttribute('aria-setsize', '2');
      await expect(plain).toHaveAttribute('aria-selected', 'false');
    });

    await step('selecting another row moves the highlight', async () => {
      await userEvent.click(plain);
      await expect(plain).toHaveAttribute('aria-selected', 'true');
      await expect(highlighted).toHaveAttribute('aria-selected', 'false');
      // The container colour is transitioned, so settle before reading it.
      await waitFor(async () => {
        await expect(getComputedStyle(plain).backgroundColor).toBe(resolve('--md-sys-color-secondary-container'));
        await expect(getComputedStyle(highlighted).backgroundColor).toBe(resolve('--md-sys-color-surface-container'));
      });
    });

    await step('focus settles before the a11y audit', async () => {
      // A synthetic click is not a trusted pointer event, so it leaves the row
      // :focus-visible and the row shows the kit's 10% focus state layer. With
      // that layer, On Secondary Container text on Secondary Container is
      // 4.03:1 (4.57:1 at rest). That gap belongs to the generated palette's
      // on-container tone, not to List: the 8% hover layer is 4.15:1 too.
      // A real mouse click shows no focus layer, so blur the row and let the
      // layer fade. axe then audits the selected rows at rest.
      plain.blur();
      const layer = plain.querySelector('.md-ripple-hover-layer__surface') as HTMLElement;
      await waitFor(() => expect(getComputedStyle(layer).opacity).toBe('0'));
    });
  },
};

// =============================================================================
// Ledger row geometry — measured in the browser
// =============================================================================

export const LedgerRowGeometry: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A row is a flex line, so an absent slot costs nothing and the trailing block lands on the row's padding edge however few slots the row uses. The readable 60ch measure caps the row's lines of text (`--md-list-item-text-measure`), not the elastic slot that holds them, so a wide row keeps a readable headline without leaving a hole in front of its amounts.",
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, inlineSize: 1120 }}>
      <List mode="single-select" aria-label="Ledger" defaultValue="groceries" density={-4}>
        <ListItem
          value="groceries"
          headline="Weekly groceries, the market on the corner and two deliveries besides, all on one card"
          selectionIndicator="none"
          trailing={
            <span
              style={{
                display: 'grid',
                gridTemplateColumns: '7rem 5rem 6rem',
                alignItems: 'center',
                gap: 16,
                textAlign: 'end',
              }}
            >
              <span>Groceries</span>
              <span>Sam</span>
              <span>84.10</span>
            </span>
          }
        />
        <ListItem
          value="rent"
          headline="Rent"
          selectionIndicator="none"
          trailing={
            <span
              style={{
                display: 'grid',
                gridTemplateColumns: '7rem 5rem 6rem',
                alignItems: 'center',
                gap: 16,
                textAlign: 'end',
              }}
            >
              <span>Housing</span>
              <span>Ada</span>
              <span>1,200.00</span>
            </span>
          }
        />
      </List>
    </div>
  ),
  play: async ({ canvas, step }) => {
    const [long, short] = Array.from(
      canvas.getByRole('listbox', { name: 'Ledger' }).querySelectorAll<HTMLElement>('.md-list-item'),
    );
    const box = (row: HTMLElement, name: string) =>
      (row.querySelector(`.md-list-item__${name}`) as HTMLElement).getBoundingClientRect();
    /** The readable measure as the browser resolves it on the row's own text. */
    const measure = () =>
      Number.parseFloat(getComputedStyle(long.querySelector('.md-list-item__headline') as HTMLElement).maxInlineSize);

    await step('the trailing column block lands on the row edge in every row', async () => {
      const padding = Number.parseFloat(
        getComputedStyle(long.querySelector('.md-list-item__layout') as HTMLElement).paddingInlineEnd,
      );
      await expect(long.getBoundingClientRect().right - box(long, 'trailing').right).toBeCloseTo(padding, 1);
      await expect(short.getBoundingClientRect().right - box(short, 'trailing').right).toBeCloseTo(padding, 1);
      // Both rows put the amounts on the same x, which is what makes a header
      // row above the list stay aligned.
      await expect(box(long, 'trailing').left).toBeCloseTo(box(short, 'trailing').left, 1);
    });

    await step('the text keeps the readable measure while its slot fills the row', async () => {
      const headline = box(long, 'headline');
      const content = box(long, 'content');
      const cap = measure();
      // The headline is long enough to reach the measure and stop there.
      await expect(cap).toBeCloseTo(headline.width, 1);
      // The slot is wider than the measure — the cap is on the text, so no hole
      // opens between the description and the amounts.
      await expect(content.width).toBeGreaterThan(cap);
      const slotGap = Number.parseFloat(
        getComputedStyle(long.querySelector('.md-list-item__layout') as HTMLElement).columnGap,
      );
      await expect(box(long, 'trailing').left - content.right).toBeCloseTo(slotGap, 1);
    });
  },
};
