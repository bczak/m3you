import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, expect, test } from 'vitest';

import { TextField } from '../src/components/TextField/text-field';

afterEach(() => {
  cleanup();
});

test('renders filled variant by default', async () => {
  const { container } = render(<TextField label="Name" />);

  const field = container.querySelector('.md-text-field__container');
  expect(field).toHaveAttribute('data-variant', 'filled');
});

test('renders outlined variant with a notch legend', async () => {
  const { container } = render(<TextField variant="outlined" label="Name" />);

  const outline = container.querySelector('.md-text-field__outline');
  const legend = container.querySelector('.md-text-field__outline-legend');
  expect(outline).not.toBeNull();
  expect(legend).not.toBeNull();
  expect(legend).toHaveTextContent('Name');
});

test('label is resting when empty and floats when focused', async () => {
  render(<TextField label="Email" />);

  const input = screen.getByRole('textbox');
  const label = screen.getByText('Email');
  expect(label).toHaveAttribute('data-floating', 'false');

  fireEvent.focus(input);

  expect(label).toHaveAttribute('data-floating', 'true');
});

test('label floats when the field is populated', async () => {
  render(<TextField label="Email" defaultValue="name@company.com" />);

  expect(screen.getByText('Email')).toHaveAttribute('data-floating', 'true');
});

test('shows error text in place of supporting text', async () => {
  render(
    <TextField
      label="Workspace slug"
      supportingText="Public URL path"
      errorText="Use lowercase letters, numbers, and hyphens only."
    />,
  );

  const input = screen.getByRole('textbox');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByText('Use lowercase letters, numbers, and hyphens only.')).toBeInTheDocument();
  expect(screen.queryByText('Public URL path')).toBeNull();
});

test('links supporting text and character counter through aria-describedby', async () => {
  render(<TextField label="Bio" supportingText="Short description" maxCharCount={50} defaultValue="Hello" />);

  const input = screen.getByRole('textbox');
  const describedBy = input.getAttribute('aria-describedby');
  expect(describedBy).toBeTruthy();
  expect(document.getElementById(describedBy ?? '')).toHaveTextContent('Short description');
  expect(screen.getByText('5 / 50')).toBeInTheDocument();
});

test('renders leading icon, trailing icon, prefix, and suffix', async () => {
  render(
    <TextField
      label="Budget"
      leadingIcon={<span data-testid="leading">L</span>}
      trailingIcon={<span data-testid="trailing">T</span>}
      prefixText="$"
      suffixText=".com"
      defaultValue="4200"
    />,
  );

  expect(screen.getByTestId('leading')).toBeInTheDocument();
  expect(screen.getByTestId('trailing')).toBeInTheDocument();
  expect(screen.getByText('$')).toBeInTheDocument();
  expect(screen.getByText('.com')).toBeInTheDocument();
});

test('calls onValueChange with the latest input value', async () => {
  let capturedValue = '';

  render(
    <TextField
      label="Name"
      onValueChange={(value) => {
        capturedValue = value;
      }}
    />,
  );

  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
  expect(capturedValue).toBe('hello');
});

test('forwards ref to the input element', async () => {
  const ref = createRef<HTMLInputElement>();

  render(<TextField ref={ref} label="Name" />);

  expect(ref.current).toBeInstanceOf(HTMLInputElement);
});
