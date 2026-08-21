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

  // `children` is the documented alias for `content`, used when composing.
  rerender(<Avatar variant="monogram">CD</Avatar>);
  expect(screen.getByText('CD')).toHaveAttribute('data-variant', 'monogram');
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

test('ListItemAccordion renders every optional slot and counts its lines', () => {
  const { container, rerender } = render(
    <ul>
      <ListItemAccordion
        headline="Details"
        overline="Section"
        supportingText="More about it"
        leading={<span>L</span>}
        trailing={<span>T</span>}
      />
    </ul>,
  );

  // overline + supportingText → three lines.
  expect(container.querySelector('li')).toHaveAttribute('data-lines', '3');
  expect(container.querySelector('.md-list-item__leading')).not.toBeNull();
  expect(container.querySelector('.md-list-item__overline')).not.toBeNull();
  expect(container.querySelector('.md-list-item__supporting-text')).not.toBeNull();
  expect(container.querySelector('.md-list-item__trailing')).not.toBeNull();

  // Exactly one of the two → two lines.
  rerender(
    <ul>
      <ListItemAccordion headline="Details" overline="Section" />
    </ul>,
  );
  expect(container.querySelector('li')).toHaveAttribute('data-lines', '2');
});

test('ListItemSwipe adopts a <button> action, preserving its onClick and preventDefault', () => {
  const onChange = vi.fn();
  const actionClick = vi.fn();
  render(
    <ul>
      <ListItemSwipe
        revealedSide="start"
        onRevealedSideChange={onChange}
        startAction={
          <button type="button" className="custom" onClick={actionClick}>
            Archive
          </button>
        }
      >
        <div>Message</div>
      </ListItemSwipe>
    </ul>,
  );

  const action = screen.getByRole('button', { name: 'Archive' });
  // The element is cloned, not wrapped: its own class survives alongside the slot class.
  expect(action).toHaveClass('custom', 'md-list-item-swipe__action');

  fireEvent.click(action);
  expect(actionClick).toHaveBeenCalledOnce();
  expect(onChange).toHaveBeenLastCalledWith(null);
});

test('ListItemSwipe lets a button action cancel the auto-close with preventDefault', () => {
  const onChange = vi.fn();
  render(
    <ul>
      <ListItemSwipe
        revealedSide="start"
        onRevealedSideChange={onChange}
        startAction={
          <button type="button" onClick={(event) => event.preventDefault()}>
            Archive
          </button>
        }
      >
        <div>Message</div>
      </ListItemSwipe>
    </ul>,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
  expect(onChange).not.toHaveBeenCalled();
});

test('ListItemSwipe reveals the end side and resets when the drag is short', () => {
  const onChange = vi.fn();
  render(
    <ul>
      <ListItemSwipe startAction="Archive" endAction="Delete" onRevealedSideChange={onChange}>
        <div>Message</div>
      </ListItemSwipe>
    </ul>,
  );
  const surface = screen.getByText('Message').parentElement as HTMLElement;

  // Past the threshold in the negative direction → end side.
  fireEvent.pointerDown(surface, { button: 0, pointerId: 1, clientX: 0 });
  fireEvent.pointerMove(surface, { pointerId: 1, clientX: -60 });
  fireEvent.pointerUp(surface, { pointerId: 1, clientX: -60 });
  expect(onChange).toHaveBeenLastCalledWith('end');
  expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

  // Dragging back from the revealed end position (-72) to within the threshold
  // (-72 + 40 = -32) snaps closed rather than re-latching.
  fireEvent.pointerDown(surface, { button: 0, pointerId: 2, clientX: 0 });
  fireEvent.pointerMove(surface, { pointerId: 2, clientX: 40 });
  fireEvent.pointerUp(surface, { pointerId: 2, clientX: 40 });
  expect(onChange).toHaveBeenLastCalledWith(null);
});

test('ListItemSwipe ignores non-primary buttons, interactive targets and foreign pointers', () => {
  const onChange = vi.fn();
  render(
    <ul>
      <ListItemSwipe startAction="Archive" onRevealedSideChange={onChange}>
        <button type="button">Open</button>
      </ListItemSwipe>
    </ul>,
  );
  const surface = screen.getByRole('button', { name: 'Open' }).parentElement as HTMLElement;

  // Secondary button never starts a drag.
  fireEvent.pointerDown(surface, { button: 2, pointerId: 1, clientX: 0 });
  fireEvent.pointerMove(surface, { pointerId: 1, clientX: 60 });
  fireEvent.pointerUp(surface, { pointerId: 1, clientX: 60 });
  expect(onChange).not.toHaveBeenCalled();

  // Pressing an interactive child is a click, not a swipe.
  fireEvent.pointerDown(screen.getByRole('button', { name: 'Open' }), { button: 0, pointerId: 2, clientX: 0 });
  fireEvent.pointerMove(surface, { pointerId: 2, clientX: 60 });
  expect(onChange).not.toHaveBeenCalled();

  // Events from a pointer that did not start the drag are ignored.
  fireEvent.pointerDown(surface, { button: 0, pointerId: 3, clientX: 0 });
  fireEvent.pointerMove(surface, { pointerId: 99, clientX: 60 });
  fireEvent.pointerUp(surface, { pointerId: 99, clientX: 60 });
  expect(onChange).not.toHaveBeenCalled();

  // Releasing without any move falls back to the resting offset, so nothing opens.
  fireEvent.pointerUp(surface, { pointerId: 3, clientX: 0 });
  expect(onChange).toHaveBeenLastCalledWith(null);
});

test('ListItemSwipe leaves other keys and an already-closed row alone', () => {
  const onChange = vi.fn();
  const onKeyDown = vi.fn();
  render(
    <ul>
      <ListItemSwipe startAction="Archive" onRevealedSideChange={onChange} onKeyDown={onKeyDown}>
        <div>Message</div>
      </ListItemSwipe>
    </ul>,
  );
  const item = screen.getByText('Message').closest('li') as HTMLLIElement;

  // Escape while already closed is a no-op, and other keys always pass through.
  fireEvent.keyDown(item, { key: 'Escape' });
  fireEvent.keyDown(item, { key: 'Enter' });
  expect(onKeyDown).toHaveBeenCalledTimes(2);
  expect(onChange).not.toHaveBeenCalled();
});

test('RangeSlider drags each thumb independently and clamps them against each other', () => {
  const onValueChange = vi.fn();
  const { container } = render(<RangeSlider defaultValue={[20, 80]} min={0} max={100} onValueChange={onValueChange} />);
  const root = container.querySelector('.md-range-slider') as HTMLElement;
  const [lowerHandle, upperHandle] = Array.from(container.querySelectorAll('.md-slider__handle')) as HTMLElement[];

  // Lower thumb: press, drag, release.
  fireEvent.pointerDown(lowerHandle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(root).toHaveAttribute('data-dragging', 'lower');
  fireEvent.pointerMove(lowerHandle, { pointerId: 1, clientX: 1, clientY: 0 });
  fireEvent.pointerUp(lowerHandle, { pointerId: 1, clientX: 1, clientY: 0 });
  expect(root).not.toHaveAttribute('data-dragging');
  // A zero-width track maps any x to the maximum, so the lower thumb clamps at the upper.
  expect(onValueChange).toHaveBeenLastCalledWith([80, 80]);

  // Upper thumb.
  fireEvent.pointerDown(upperHandle, { button: 0, pointerId: 2, clientX: 0, clientY: 0 });
  expect(root).toHaveAttribute('data-dragging', 'upper');
  fireEvent.pointerUp(upperHandle, { pointerId: 2, clientX: 0, clientY: 0 });
  expect(root).not.toHaveAttribute('data-dragging');
});

test('RangeSlider ignores disabled, non-primary and foreign pointers', () => {
  const onValueChange = vi.fn();
  const { container, rerender } = render(
    <RangeSlider disabled defaultValue={[20, 80]} onValueChange={onValueChange} />,
  );
  let root = container.querySelector('.md-range-slider') as HTMLElement;
  let handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(root).not.toHaveAttribute('data-dragging');

  rerender(<RangeSlider defaultValue={[20, 80]} onValueChange={onValueChange} />);
  root = container.querySelector('.md-range-slider') as HTMLElement;
  handle = container.querySelector('.md-slider__handle') as HTMLElement;

  fireEvent.pointerDown(handle, { button: 2, pointerId: 1, clientX: 0, clientY: 0 });
  expect(root).not.toHaveAttribute('data-dragging');

  fireEvent.pointerDown(handle, { button: 0, pointerId: 3, clientX: 0, clientY: 0 });
  onValueChange.mockClear();
  // Neither a foreign pointer id nor a release from one disturbs the active drag.
  fireEvent.pointerMove(handle, { pointerId: 99, clientX: 1, clientY: 0 });
  fireEvent.pointerUp(handle, { pointerId: 99, clientX: 1, clientY: 0 });
  expect(onValueChange).not.toHaveBeenCalled();
  expect(root).toHaveAttribute('data-dragging', 'lower');
});

test('RangeSlider shows a formatted tooltip per thumb and falls back to default labels', () => {
  const { container } = render(
    <RangeSlider defaultValue={[20, 80]} showTooltip formatTooltip={(value) => `${value}%`} />,
  );
  const [lowerHandle] = Array.from(container.querySelectorAll('.md-slider__handle')) as HTMLElement[];

  expect(container.querySelector('.md-slider__tooltip')).toBeNull();
  fireEvent.pointerDown(lowerHandle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toMatch(/%$/);

  // With no aria-label supplied, both inputs get their default accessible names.
  expect(screen.getByRole('slider', { name: 'Lower value' })).toBeInTheDocument();
  expect(screen.getByRole('slider', { name: 'Upper value' })).toBeInTheDocument();
});

test('RangeSlider supports vertical orientation and aria-labelledby', () => {
  const { container } = render(
    <>
      <span id="lo">Lo</span>
      <span id="hi">Hi</span>
      <RangeSlider
        orientation="vertical"
        defaultValue={[20, 80]}
        lowerInputProps={{ 'aria-labelledby': 'lo' }}
        upperInputProps={{ 'aria-labelledby': 'hi' }}
      />
    </>,
  );

  expect(container.querySelector('.md-range-slider')).toHaveAttribute('data-orientation', 'vertical');
  // aria-labelledby suppresses the default aria-label rather than doubling up.
  for (const input of screen.getAllByRole('slider')) expect(input).not.toHaveAttribute('aria-label');
});

test('RangeSlider accepts callback refs and drives the upper input and tooltip', () => {
  const seen: (HTMLInputElement | null)[] = [];
  const upperOnChange = vi.fn();
  const onValueChange = vi.fn();
  const { container } = render(
    <RangeSlider
      defaultValue={[20, 80]}
      min={0}
      max={100}
      showTooltip
      onValueChange={onValueChange}
      // Braces matter: React 19 types a ref callback's return value as a
      // cleanup function, so `push`'s number would not type-check.
      lowerInputProps={{
        ref: (node) => {
          seen.push(node);
        },
      }}
      upperInputProps={{ onChange: upperOnChange }}
    />,
  );

  // A function ref is called with the node rather than assigned to `.current`.
  expect(seen.at(-1)).toBeInstanceOf(HTMLInputElement);

  const upperInput = screen.getByRole('slider', { name: 'Upper value' });
  fireEvent.change(upperInput, { target: { value: '95' } });
  expect(onValueChange).toHaveBeenLastCalledWith([20, 95]);
  expect(upperOnChange).toHaveBeenCalledOnce();

  // Dragging the upper thumb shows its tooltip, labelled by the default formatter.
  const [, upperHandle] = Array.from(container.querySelectorAll('.md-slider__handle')) as HTMLElement[];
  fireEvent.pointerDown(upperHandle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(container.querySelector('.md-slider__tooltip')?.textContent).toMatch(/^\d+$/);
});

test('Slider mirrors the pointer axis in a right-to-left track', () => {
  const onValueChange = vi.fn();
  const { container } = render(<Slider aria-label="Volume" min={0} max={100} onValueChange={onValueChange} />);
  const track = container.querySelector('.md-slider__track') as HTMLElement;
  const handle = container.querySelector('.md-slider__handle') as HTMLElement;

  const realGetComputedStyle = window.getComputedStyle.bind(window);
  const spy = vi
    .spyOn(window, 'getComputedStyle')
    .mockImplementation((element, pseudo) =>
      element === track
        ? ({ direction: 'rtl' } as unknown as CSSStyleDeclaration)
        : realGetComputedStyle(element as Element, pseudo),
    );

  // x=0 is ratio 0, i.e. the minimum in a left-to-right track; RTL mirrors it to the maximum.
  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 0, clientY: 0 });
  expect(onValueChange).toHaveBeenLastCalledWith(100);
  spy.mockRestore();
});
