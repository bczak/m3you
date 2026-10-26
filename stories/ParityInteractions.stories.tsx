import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import { Button } from '../src/components/Button/button';
import { Card } from '../src/components/Card/card';
import { ListItemSwipe } from '../src/components/List/list';
import { SideSheet, SideSheetBody, SideSheetContent, SideSheetHeader } from '../src/components/SideSheet/side-sheet';
import { RangeSlider } from '../src/components/Slider/slider';
import { applyM3Theme } from '../src/lib/color';

type ParityInteractionArgs = {
  onCardAction: () => void;
  onNestedAction: () => void;
  onUnderlyingAction: () => void;
};

const SCOPE_STYLE = {
  padding: 12,
  background: 'var(--md-sys-color-surface)',
  color: 'var(--md-sys-color-on-surface)',
} as const;

// The computed value of `token` as seen from inside `scope`.
const resolveColor = (scope: Element, token: string) => {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  scope.append(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

const themeVar = (token: string) => getComputedStyle(document.documentElement).getPropertyValue(token).trim();

function BrowserParityFixture({ onCardAction, onNestedAction, onUnderlyingAction }: ParityInteractionArgs) {
  const [range, setRange] = useState<[number, number]>([25, 75]);
  const seededScope = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (seededScope.current) applyM3Theme('#8B5000', seededScope.current);
  }, []);

  return (
    <div style={{ boxSizing: 'border-box', display: 'grid', gap: 24, width: 560, maxWidth: '100%', padding: 16 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div data-theme="light" data-testid="light-scope" style={SCOPE_STYLE}>
          <Button variant="outlined">Light scope action</Button>
        </div>
        <div data-theme="dark" data-testid="dark-scope" style={SCOPE_STYLE}>
          <Button variant="outlined">Dark scope action</Button>
        </div>
        <div ref={seededScope} data-testid="seeded-scope" style={SCOPE_STYLE}>
          <Button variant="outlined">Seeded scope action</Button>
        </div>
      </div>

      <div style={{ paddingBlock: 12 }}>
        <Button size="xs" data-testid="compact-hit-target">
          Compact action
        </Button>
      </div>

      <Card
        variant="elevated"
        interactiveLabel="Open project"
        onClick={onCardAction}
        style={{ minHeight: 96, padding: 20 }}
      >
        <strong>Project card</strong>
        <button type="button" onClick={onNestedAction} style={{ marginInlineStart: 16 }}>
          Bookmark
        </button>
      </Card>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        <ListItemSwipe startAction="Archive" endAction="Delete">
          <div
            style={{
              boxSizing: 'border-box',
              minHeight: 72,
              padding: 20,
              background: 'var(--md-sys-color-surface)',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            Swipeable message
          </div>
        </ListItemSwipe>
      </ul>

      <RangeSlider
        value={range}
        onValueChange={setRange}
        showTooltip
        lowerInputProps={{ 'aria-label': 'Range minimum' }}
        upperInputProps={{ 'aria-label': 'Range maximum' }}
      />

      <Button onClick={onUnderlyingAction}>Underlying page action</Button>
      <SideSheet defaultOpen modal={false} side="right">
        <SideSheetContent>
          <SideSheetHeader showClose={false}>Standard sheet</SideSheetHeader>
          <SideSheetBody>Only the painted sheet intercepts pointer input.</SideSheetBody>
        </SideSheetContent>
      </SideSheet>
    </div>
  );
}

const meta = {
  title: 'Examples/Web Parity Interactions',
  render: (args) => <BrowserParityFixture {...args} />,
  parameters: { layout: 'padded' },
  args: {
    onCardAction: fn(),
    onNestedAction: fn(),
    onUnderlyingAction: fn(),
  },
} satisfies Meta<ParityInteractionArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrowserContracts: Story = {
  play: async ({ args, canvas, userEvent, step }) => {
    await step('Focus rings take Secondary from their own colour scope, not the root', async () => {
      const rings: string[] = [];
      for (const scope of ['light', 'dark', 'seeded']) {
        const button = canvas.getByRole('button', { name: `${scope[0].toUpperCase()}${scope.slice(1)} scope action` });
        const secondary = resolveColor(canvas.getByTestId(`${scope}-scope`), '--md-sys-color-secondary');
        button.focus();
        await expect(button.matches(':focus-visible')).toBe(true);
        await expect(getComputedStyle(button).outlineColor).toBe(secondary);
        rings.push(secondary);
      }
      // Three palettes, three rings: one colour inherited from the root would
      // have matched at most one of them.
      await expect(new Set(rings).size).toBe(3);
    });

    await step('Compact surfaces expose real 48px hit targets, focus, and ripple feedback', async () => {
      const compact = canvas.getByTestId('compact-hit-target');
      const rect = compact.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top - 6);
      await expect(hit === compact || compact.contains(hit)).toBe(true);

      compact.focus();
      await expect(compact).toHaveFocus();
      await expect(getComputedStyle(compact).outlineWidth).toBe(themeVar('--md-sys-state-focus-indicator-thickness'));

      await userEvent.pointer({ keys: '[MouseLeft>]', target: compact });
      await waitFor(() => expect(compact.querySelector('.salty-ripple-surface')).toHaveClass('--press'));
      await userEvent.pointer({ keys: '[/MouseLeft]', target: compact });
    });

    await step('Nested Card controls stay independent of the full-card action overlay', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Bookmark' }));
      await expect(args.onNestedAction).toHaveBeenCalledOnce();
      await expect(args.onCardAction).not.toHaveBeenCalled();

      await userEvent.click(canvas.getByRole('button', { name: 'Open project' }));
      await expect(args.onCardAction).toHaveBeenCalledOnce();
    });

    await step('Swipe thresholds reveal a keyboard-focusable action and Escape closes it', async () => {
      const surface = canvas.getByText('Swipeable message').parentElement as HTMLElement;
      const rect = surface.getBoundingClientRect();
      const start = { clientX: rect.left + 24, clientY: rect.top + rect.height / 2 };
      const end = { clientX: start.clientX + 60, clientY: start.clientY };
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: surface, coords: start },
        { target: surface, coords: end },
        { keys: '[/MouseLeft]', target: surface, coords: end },
      ]);

      const swipeItem = surface.closest('.md-list-item-swipe');
      await waitFor(() => expect(swipeItem).toHaveAttribute('data-revealed-side', 'start'));
      const archive = canvas.getByRole('button', { name: 'Archive' });
      archive.focus();
      await expect(archive).toHaveFocus();
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(swipeItem).not.toHaveAttribute('data-revealed-side'));
    });

    await step('Range thumbs clamp instead of crossing', async () => {
      const lower = canvas.getByRole('slider', { name: 'Range minimum' });
      const upper = canvas.getByRole('slider', { name: 'Range maximum' });
      const rangeRoot = lower.closest('.md-range-slider') as HTMLElement;
      const track = rangeRoot.querySelector('.md-slider__track') as HTMLElement;
      const lowerHandle = rangeRoot.querySelector('.md-slider__handle') as HTMLElement;
      const trackRect = track.getBoundingClientRect();
      const start = { clientX: trackRect.left + trackRect.width * 0.25, clientY: trackRect.top + trackRect.height / 2 };
      const end = { clientX: trackRect.right, clientY: start.clientY };
      await userEvent.pointer([
        { keys: '[MouseLeft>]', target: lowerHandle, coords: start },
        { target: lowerHandle, coords: end },
        { keys: '[/MouseLeft]', target: lowerHandle, coords: end },
      ]);
      await waitFor(() =>
        expect(Number((lower as HTMLInputElement).value)).toBeLessThanOrEqual(
          Number((upper as HTMLInputElement).value),
        ),
      );
      await expect(lower).toHaveValue('75');
      await expect(upper).toHaveValue('75');
    });

    await step('A standard sheet viewport permits pointer hit-testing through its unpainted area', async () => {
      const underlying = canvas.getByRole('button', { name: 'Underlying page action' });
      const rect = underlying.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2) as HTMLElement;
      await expect(hit === underlying || underlying.contains(hit)).toBe(true);
      await userEvent.click(hit);
      await expect(args.onUnderlyingAction).toHaveBeenCalledOnce();
    });
  },
};
