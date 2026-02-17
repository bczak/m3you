import { afterEach, expect } from '@rstest/core';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';

expect.extend(jestDomMatchers);

// Global polyfill: happy-dom does not implement Web Animations API
// m3-ripple calls element.animate() on pointer events
if (typeof Element !== 'undefined' && !Element.prototype.animate) {
  Element.prototype.animate = () =>
    ({ onfinish: null, cancel: () => {}, finished: Promise.resolve() }) as unknown as Animation;
}

// Global cleanup: prevent DOM leakage between tests
afterEach(() => {
  cleanup();
});
