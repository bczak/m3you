import * as React from 'react';

/**
 * Re-syncs an uncontrolled selection control after the form that owns it is
 * reset.
 *
 * A form reset (`form.reset()` or a `<button type="reset">`) puts every control
 * back to its default — `defaultChecked`, the `checked` attribute — without
 * dispatching `change`, so React state mirrored from `change` keeps drawing the
 * old selection. `reset` itself is dispatched *before* the controls are
 * restored, and when a person activates a reset button the browser runs a
 * microtask checkpoint between the two, so `onReset` waits for the next task,
 * when the restored native state can be read. A reset that another listener
 * cancels restores nothing, and re-reading the unchanged controls is harmless.
 *
 * `ref` points at the control itself or at a container of controls (a radio
 * group); the hook reacts to a reset of any form one of those inputs belongs
 * to, through `input.form`, so a `form` attribute is honoured. Pass
 * `enabled: false` for a controlled component — its parent owns the state.
 */
export function useFormReset(
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  onReset: (element: HTMLElement) => void,
) {
  const onResetRef = React.useRef(onReset);
  React.useEffect(() => {
    onResetRef.current = onReset;
  });

  React.useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    // Capture on the root, like the radio sibling sync, so a form whose reset
    // event is stopped on its way up still reaches every control in it.
    const root = element.getRootNode();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleReset = (event: Event) => {
      const inputs = element.matches('input')
        ? [element as HTMLInputElement]
        : Array.from(element.querySelectorAll('input'));
      if (!inputs.some((input) => input.form === event.target)) return;
      clearTimeout(timer);
      timer = setTimeout(() => onResetRef.current(element));
    };
    root.addEventListener('reset', handleReset, true);
    return () => {
      root.removeEventListener('reset', handleReset, true);
      clearTimeout(timer);
    };
  }, [ref, enabled]);
}
