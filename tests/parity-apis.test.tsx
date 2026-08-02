import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { AppBar } from '../src/components/AppBar/app-bar';
import { Avatar } from '../src/components/Avatar/avatar';
import { Card } from '../src/components/Card/card';
import { ChipGroup } from '../src/components/ChipGroup/chip-group';
import { CircularProgress } from '../src/components/CircularProgress/circular-progress';
import { FAB } from '../src/components/Fab/fab';
import { LinearProgress } from '../src/components/LinearProgress/linear-progress';
import { List, ListItemAccordion, ListItemSwipe } from '../src/components/List/list';
import { SearchBar } from '../src/components/Search/search-bar';
import { RangeSlider, Slider } from '../src/components/Slider/slider';
import { SplitButton } from '../src/components/SplitButton/split-button';
import { SplitButtonAction } from '../src/components/SplitButton/split-button-action';
import { SplitButtonMenu } from '../src/components/SplitButton/split-button-menu';

afterEach(cleanup);

test('Avatar supports required image semantics and content variants with refs', () => {
  const ref = createRef<HTMLSpanElement>();
  const { rerender } = render(<Avatar ref={ref} variant="image" src="/person.png" alt="A person" />);
  expect(ref.current).toHaveAttribute('data-variant', 'image');
  expect(screen.getByRole('img', { name: 'A person' })).toHaveAttribute('src', '/person.png');

  rerender(<Avatar variant="monogram" content="AB" />);
  expect(screen.getByText('AB')).toHaveAttribute('data-variant', 'monogram');
});

test('ChipGroup defaults to scroll and supports wrap without owning selection', () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(
    <ChipGroup ref={ref}>
      <button type="button" aria-pressed="true">
        One
      </button>
    </ChipGroup>,
  );
  expect(ref.current).toHaveAttribute('data-layout', 'scroll');
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  rerender(<ChipGroup layout="wrap" data-testid="group" />);
  expect(screen.getByTestId('group')).toHaveAttribute('data-layout', 'wrap');
});

test('Slider exposes centered mode and clamps its origin and controlled value', () => {
  const { container } = render(<Slider mode="centered" origin={500} min={0} max={100} value={120} />);
  const root = container.querySelector('.md-slider');
  expect(root).toHaveAttribute('data-mode', 'centered');
  expect(screen.getByRole('slider')).toHaveValue('100');
  expect(container.querySelector('.md-slider__handle')).toHaveStyle({ left: '100%' });
});

test('RangeSlider normalizes defaults, updates uncontrolled tuples, and forwards both input refs', () => {
  const lowerRef = createRef<HTMLInputElement>();
  const upperRef = createRef<HTMLInputElement>();
  const onValueChange = vi.fn();
  render(
    <RangeSlider
      defaultValue={[90, -10]}
      min={0}
      max={80}
      onValueChange={onValueChange}
      lowerInputProps={{ ref: lowerRef, 'aria-label': 'Minimum' }}
      upperInputProps={{ ref: upperRef, 'aria-label': 'Maximum' }}
    />,
  );

  expect(lowerRef.current).toHaveValue('0');
  expect(upperRef.current).toHaveValue('80');
  fireEvent.change(lowerRef.current as HTMLInputElement, { target: { value: '30' } });
  expect(onValueChange).toHaveBeenLastCalledWith([30, 80]);
  expect(lowerRef.current).toHaveValue('30');
});

test('RangeSlider controlled thumbs clamp at each other and retain native keyboard behavior', () => {
  const onValueChange = vi.fn();
  render(<RangeSlider value={[25, 75]} onValueChange={onValueChange} />);
  const [lower, upper] = screen.getAllByRole('slider') as HTMLInputElement[];

  fireEvent.change(lower, { target: { value: '90' } });
  expect(onValueChange).toHaveBeenLastCalledWith([75, 75]);
  expect(lower).toHaveValue('25');

  fireEvent.keyDown(upper, { key: 'ArrowRight' });
  expect(upper).toHaveAttribute('type', 'range');
});

test('RangeSlider disabled state propagates to both accessible native inputs', () => {
  const ref = createRef<HTMLDivElement>();
  render(<RangeSlider ref={ref} disabled defaultValue={[20, 80]} />);
  expect(ref.current).toHaveAttribute('data-disabled');
  for (const input of screen.getAllByRole('slider')) expect(input).toBeDisabled();
});

test('List density is explicit and accordion supports uncontrolled disclosure semantics', () => {
  const onExpandedChange = vi.fn();
  const ref = createRef<HTMLLIElement>();
  render(
    <List density={-4} data-testid="list">
      <ListItemAccordion ref={ref} headline="Details" onExpandedChange={onExpandedChange}>
        Panel content
      </ListItemAccordion>
    </List>,
  );
  expect(screen.getByTestId('list')).toHaveAttribute('data-density', '-4');
  const trigger = screen.getByRole('button', { name: 'Details' });
  const panel = screen.getByRole('region', { hidden: true });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(panel).not.toBeVisible();
  fireEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(panel).toBeVisible();
  expect(onExpandedChange).toHaveBeenCalledWith(true);
  expect(ref.current).toBeInstanceOf(HTMLLIElement);
});

test('ListItemAccordion controlled and disabled modes do not mutate themselves', () => {
  const onExpandedChange = vi.fn();
  const { rerender } = render(
    <ul>
      <ListItemAccordion headline="Controlled" expanded={false} onExpandedChange={onExpandedChange} />
    </ul>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Controlled' }));
  expect(onExpandedChange).toHaveBeenCalledWith(true);
  expect(screen.getByRole('button', { name: 'Controlled' })).toHaveAttribute('aria-expanded', 'false');

  rerender(
    <ul>
      <ListItemAccordion headline="Controlled" disabled onExpandedChange={onExpandedChange} />
    </ul>,
  );
  expect(screen.getByRole('button', { name: 'Controlled' })).toBeDisabled();
});

test('ListItemSwipe uses thresholds, Escape, and focusable action buttons', () => {
  const onChange = vi.fn();
  render(
    <ul>
      <ListItemSwipe startAction="Archive" endAction="Delete" onRevealedSideChange={onChange}>
        <div>Message</div>
      </ListItemSwipe>
    </ul>,
  );
  const surface = screen.getByText('Message').parentElement as HTMLElement;
  fireEvent.pointerDown(surface, { button: 0, pointerId: 1, clientX: 0 });
  fireEvent.pointerMove(surface, { pointerId: 1, clientX: 60 });
  fireEvent.pointerUp(surface, { pointerId: 1, clientX: 60 });
  expect(onChange).toHaveBeenLastCalledWith('start');
  expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();

  fireEvent.keyDown(surface.closest('li') as HTMLLIElement, { key: 'Escape' });
  expect(onChange).toHaveBeenLastCalledWith(null);
});

test('SearchBar forwards view mode and expressive appearance to its expanded SearchView', () => {
  const { container } = render(
    <SearchBar defaultOpen viewMode="fullScreen" viewAppearance="expressive">
      Results
    </SearchBar>,
  );
  const view = container.querySelector('.md-search-view');
  expect(view).toHaveAttribute('data-mode', 'fullScreen');
  expect(view).toHaveAttribute('data-appearance', 'expressive');
  expect(container.querySelector('search')).toHaveClass('md-search');
});

test('SplitButton propagates disabled and localizes/forwards its trigger', () => {
  const triggerRef = createRef<HTMLButtonElement>();
  render(
    <SplitButton disabled>
      <SplitButtonAction>Save</SplitButtonAction>
      <SplitButtonMenu triggerRef={triggerRef} triggerLabel="More actions" triggerIcon={<span>+</span>} />
    </SplitButton>,
  );
  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'More actions' })).toBeDisabled();
  expect(triggerRef.current).toBe(screen.getByRole('button', { name: 'More actions' }));
});

test('Card uses a labelled semantic overlay while nested controls remain independent', () => {
  const cardClick = vi.fn();
  const nestedClick = vi.fn();
  render(
    <Card onClick={cardClick} interactiveLabel="Open article" dragged>
      <button type="button" onClick={nestedClick}>
        Bookmark
      </button>
    </Card>,
  );
  expect(screen.getByRole('button', { name: 'Open article' })).toHaveAttribute('data-card-action');
  expect(screen.getByRole('button', { name: 'Open article' }).closest('.md-card')).toHaveAttribute('data-dragged');
  fireEvent.click(screen.getByRole('button', { name: 'Bookmark' }));
  expect(nestedClick).toHaveBeenCalledOnce();
  expect(cardClick).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Open article' }));
  expect(cardClick).toHaveBeenCalledOnce();
});

test('AppBar, FAB, and progress components expose additive audited configurations', () => {
  const { rerender } = render(<AppBar variant="small-image" elevation="on-scroll" image={<img alt="Cover" />} />);
  expect(screen.getByRole('banner')).toHaveAttribute('data-elevation', 'on-scroll');
  expect(screen.getByRole('img', { name: 'Cover' })).toBeInTheDocument();

  rerender(<FAB aria-label="Create" color="tertiary-container" fabSize="medium" />);
  expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('data-fab-color', 'tertiary-container');
  expect(screen.getByRole('button', { name: 'Create' })).toHaveAttribute('data-fab-size', 'medium');

  rerender(<CircularProgress thickness={8} value={40} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('data-thickness', '8');
  rerender(<LinearProgress thickness={8} value={40} />);
  expect(screen.getByRole('progressbar')).toHaveAttribute('data-thickness', '8');
});

test('the package root exports every additive runtime surface', () => {
  const publicIndex = readFileSync(resolve(process.cwd(), 'src/index.tsx'), 'utf8');
  for (const name of ['Avatar', 'ChipGroup', 'RangeSlider', 'ListItemAccordion', 'ListItemSwipe', 'MenuLabel']) {
    expect(publicIndex).toMatch(new RegExp(`export \\{[^}]*\\b${name}\\b[^}]*\\} from`));
  }
  expect(publicIndex).toContain('export type { SnackbarOptions }');
});
