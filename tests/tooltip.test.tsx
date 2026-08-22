import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { Button } from '../src/components/Button/button';
import {
  RichTooltip,
  RichTooltipContent,
  RichTooltipTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/Tooltip/tooltip';

afterEach(() => {
  cleanup();
});

// =============================================================================
// Plain Tooltip
// =============================================================================

test('renders tooltip trigger', () => {
  render(
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent>Save file</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );

  expect(screen.getByText('Save')).toBeInTheDocument();
});

test('renders tooltip content when open', () => {
  render(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent>Save file</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );

  expect(screen.getByText('Save file')).toBeInTheDocument();
});

test('tooltip content has correct M3 styling classes', () => {
  render(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Btn</TooltipTrigger>
        <TooltipContent>Styled</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );

  const popup = screen.getByText('Styled');
  expect(popup).toHaveClass('md-tooltip');
});

test('tooltip content supports custom className', () => {
  render(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Btn</TooltipTrigger>
        <TooltipContent className="my-custom-class">Custom</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );

  const popup = screen.getByText('Custom');
  expect(popup).toHaveClass('my-custom-class');
});

test('tooltip content is not rendered when closed', () => {
  render(
    <TooltipProvider>
      <Tooltip open={false}>
        <TooltipTrigger>Btn</TooltipTrigger>
        <TooltipContent>Hidden</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );

  expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
});

// =============================================================================
// Rich Tooltip
// =============================================================================

test('rich tooltip renders headline, supporting text, and actions when open', () => {
  render(
    <TooltipProvider>
      <RichTooltip open>
        <RichTooltipTrigger>Trigger</RichTooltipTrigger>
        <RichTooltipContent
          headline="My Headline"
          actions={
            <Button variant="text" size="xs">
              Learn more
            </Button>
          }
        >
          Supporting text here
        </RichTooltipContent>
      </RichTooltip>
    </TooltipProvider>,
  );

  expect(screen.getByText('My Headline')).toBeInTheDocument();
  expect(screen.getByText('Supporting text here')).toBeInTheDocument();
  expect(screen.getByText('Learn more')).toBeInTheDocument();
});

test('rich tooltip content has correct M3 styling', () => {
  render(
    <TooltipProvider>
      <RichTooltip open>
        <RichTooltipTrigger>Trigger</RichTooltipTrigger>
        <RichTooltipContent headline="Styled">Content</RichTooltipContent>
      </RichTooltip>
    </TooltipProvider>,
  );

  const headline = screen.getByText('Styled');
  expect(headline).toHaveClass('md-rich-tooltip__headline');
});

test('rich tooltip content supports custom className', () => {
  render(
    <TooltipProvider>
      <RichTooltip open>
        <RichTooltipTrigger>Trigger</RichTooltipTrigger>
        <RichTooltipContent className="rich-custom">Content</RichTooltipContent>
      </RichTooltip>
    </TooltipProvider>,
  );

  expect(screen.getByText('Content').closest('[class*="rich-custom"]')).toBeInTheDocument();
});

test('rich tooltip renders without headline', () => {
  render(
    <TooltipProvider>
      <RichTooltip open>
        <RichTooltipTrigger>Trigger</RichTooltipTrigger>
        <RichTooltipContent>Just text, no headline</RichTooltipContent>
      </RichTooltip>
    </TooltipProvider>,
  );

  expect(screen.getByText('Just text, no headline')).toBeInTheDocument();
});

test('rich tooltip renders without actions', () => {
  render(
    <TooltipProvider>
      <RichTooltip open>
        <RichTooltipTrigger>Trigger</RichTooltipTrigger>
        <RichTooltipContent headline="Title">No actions here</RichTooltipContent>
      </RichTooltip>
    </TooltipProvider>,
  );

  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('No actions here')).toBeInTheDocument();
});

// Popups have to clear dialogs: the positioner carries the popup rung of the
// stacking scale, so a tooltip opened inside a dialog is visible and hittable.
test('the plain tooltip positioner carries the popup layer class', () => {
  render(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Save</TooltipTrigger>
        <TooltipContent>Save file</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
  expect(screen.getByText('Save file').parentElement).toHaveClass('md-popup-positioner');
});

test('the rich tooltip positioner carries the popup layer class', () => {
  render(
    <RichTooltip open>
      <RichTooltipTrigger render={<Button>Details</Button>} />
      <RichTooltipContent headline="Heads up">Body copy</RichTooltipContent>
    </RichTooltip>,
  );
  const popup = document.querySelector('.md-rich-tooltip');
  expect(popup?.parentElement).toHaveClass('md-popup-positioner');
});
