import type { ReactDoctorConfig } from 'react-doctor/api';

export default {
  ignore: {
    rules: [
      'react-doctor/no-derived-useState',
      'react-doctor/no-mirror-prop-effect',
      'react-doctor/no-derived-state-effect',
      'react-doctor/no-inline-exhaustive-style',
      'react-doctor/no-render-in-render',
      'react-doctor/no-giant-component',
      'react-doctor/prefer-useReducer',
      'react-doctor/no-polymorphic-children',
      'react-doctor/no-cascading-set-state',
      'react-doctor/no-effect-event-handler',
      'react-doctor/prefer-use-effect-event',
      'react-doctor/rerender-state-only-in-handlers',
      'react-doctor/rendering-hydration-mismatch-time',
      'react-doctor/design-no-vague-button-label',
      'knip/files',
      'knip/exports',
      'knip/types',
    ],
  },

  rules: {
    // Disabled: every hit in this library is a false positive where the ARIA
    // role is correct and has no equivalent native HTML tag, so "fixing" it
    // would remove functional semantics or create worse markup:
    //   - role="listbox" (DatePicker month/year dropdowns) — functional ARIA,
    //     paired with role="option" + aria-selected; no native tag fits a
    //     custom scrollable option list.
    //   - role="progressbar" (LoadingIndicator) — functional ARIA with
    //     aria-valuemin/valuemax; <progress> is a determinate form element,
    //     semantically wrong for an animated indicator.
    //   - role="button" (Card, interactive) — a real <button> may not contain
    //     the interactive children a Card can hold (nested-interactive).
    //   - role="group" (ButtonGroup, SplitButton) — correct WAI-ARIA grouping;
    //     no native tag equivalent.
    'react-doctor/prefer-tag-over-role': 'off',
  },
} satisfies ReactDoctorConfig;
