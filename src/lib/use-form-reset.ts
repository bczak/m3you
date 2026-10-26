import * as React from 'react';

/**
 * Returns an uncontrolled selection control to its default after the form that
 * owns it is reset.
 *
 * A form reset (`form.reset()` or a `<button type="reset">`) puts every control
 * back to its `checked` attribute without dispatching `change`, so React state
 * mirrored from `change` keeps drawing the old selection. `onReset` puts the
 * component's own default (`defaultChecked`, `defaultValue`) back into its
 * state and onto its inputs. It must not re-read the inputs instead: an update
 * made in the same handler as `form.reset()` re-renders the control first, and
 * React writes the old state straight back onto a controlled input.
 *
 * `reset` is dispatched *before* the controls are restored, and a listener
 * after this one can still cancel it; when a person activates a reset button
 * the browser even runs a microtask checkpoint in between. So `onReset` waits
 * for the next task, when every reset dispatched in this one has settled, and
 * runs only if one of them went through. A canceled reset restores nothing.
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
    let resets: Event[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handleReset = (event: Event) => {
      const inputs = element.matches('input')
        ? [element as HTMLInputElement]
        : Array.from(element.querySelectorAll('input'));
      if (!inputs.some((input) => input.form === event.target)) return;
      resets.push(event);
      clearTimeout(timer);
      timer = setTimeout(() => {
        const restored = resets.some((reset) => !reset.defaultPrevented);
        resets = [];
        if (restored) onResetRef.current(element);
      });
    };
    root.addEventListener('reset', handleReset, true);
    return () => {
      root.removeEventListener('reset', handleReset, true);
      clearTimeout(timer);
    };
  }, [ref, enabled]);
}
