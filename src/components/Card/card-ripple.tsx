import type { RippleProps } from 'm3-ripple';
import * as React from 'react';

import { isFromInteractiveDescendant } from './interactive-descendant';

const RIPPLE_INITIAL_ORIGIN_SCALE = 0.2;
const RIPPLE_PADDING = 12;
const RIPPLE_MINIMUM_RADIUS = 75;
const RIPPLE_SOFT_EDGE_CONTAINER_RATIO = 0.35;
const CAPTURED_LISTENER_OPTIONS = true;

type RipplePoint = {
  x: number;
  y: number;
};

type RippleGeometry = {
  initialSize: number;
  size: string;
  scale: string;
};

type RipplePhase = 'inactive' | 'touch-delay' | 'holding' | 'waiting-for-click';
type RippleHostElement = HTMLElement & { disabled?: boolean };

const getRippleGeometry = (height: number, width: number): RippleGeometry => {
  const maxDimension = Math.max(height, width);
  const softEdgeSize = Math.max(RIPPLE_SOFT_EDGE_CONTAINER_RATIO * maxDimension, RIPPLE_MINIMUM_RADIUS);
  const initialSize = Math.max(1, Math.floor(maxDimension * RIPPLE_INITIAL_ORIGIN_SCALE));
  const rippleSize = Math.sqrt(width ** 2 + height ** 2) + RIPPLE_PADDING;

  return {
    initialSize,
    size: `${initialSize}px`,
    scale: `${(rippleSize + softEdgeSize) / initialSize}`,
  };
};

const setOptionalStyleVariable = (element: HTMLElement, name: string, value?: number, defaultValue?: number) => {
  if (value === undefined || value === defaultValue) {
    element.style.removeProperty(name);
    return;
  }

  element.style.setProperty(name, name === '--ripple-duration' ? `${value}ms` : `${value}`);
};

/**
 * Card needs a guarded ripple instead of the shared `m3-ripple` component.
 * Nested interactive descendants such as buttons should own their own ripple,
 * while the card only reacts when the card surface itself is pressed.
 */
const CardRipple = ({
  hoverOpacity,
  pressedOpacity,
  disabled = false,
  className = '',
  style,
  easing,
  duration = 150,
  minimumPressDuration = 225,
  touchDelay = 150,
}: RippleProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);
  const hostRef = React.useRef<HTMLDivElement>(null);
  const surfaceRef = React.useRef<HTMLDivElement>(null);
  const animationRef = React.useRef<Animation | null>(null);
  const activePointerRef = React.useRef<PointerEvent | undefined>(undefined);
  const geometryRef = React.useRef<RippleGeometry>({ initialSize: 0, size: '', scale: '' });
  const phaseRef = React.useRef<RipplePhase>('inactive');
  const suppressNextTouchRef = React.useRef(false);
  const releaseTimeoutRef = React.useRef<number | undefined>(undefined);
  const touchDelayTimeoutRef = React.useRef<number | undefined>(undefined);

  const getParentHost = React.useCallback(() => {
    return hostRef.current?.parentElement as RippleHostElement | null;
  }, []);

  const clearReleaseTimeout = React.useCallback(() => {
    if (releaseTimeoutRef.current !== undefined) {
      window.clearTimeout(releaseTimeoutRef.current);
      releaseTimeoutRef.current = undefined;
    }
  }, []);

  const clearTouchDelayTimeout = React.useCallback(() => {
    if (touchDelayTimeoutRef.current !== undefined) {
      window.clearTimeout(touchDelayTimeoutRef.current);
      touchDelayTimeoutRef.current = undefined;
    }
  }, []);

  React.useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    setOptionalStyleVariable(surface, '--ripple-hover-opacity', hoverOpacity);
    setOptionalStyleVariable(surface, '--ripple-pressed-opacity', pressedOpacity);
    setOptionalStyleVariable(surface, '--ripple-duration', duration, 150);
  }, [duration, hoverOpacity, pressedOpacity]);

  const isNestedInteractiveTarget = React.useCallback(
    (target: EventTarget | null) => {
      const parent = getParentHost();
      return isFromInteractiveDescendant(target, parent ?? null);
    },
    [getParentHost],
  );

  const isTouchPointer = React.useCallback((event: PointerEvent) => event.pointerType === 'touch', []);

  const isEligiblePointerEvent = React.useCallback(
    (event: PointerEvent) => {
      const parent = getParentHost();

      if (disabled || parent?.disabled || isNestedInteractiveTarget(event.target) || !event.isPrimary) {
        return false;
      }

      if (activePointerRef.current && activePointerRef.current.pointerId !== event.pointerId) {
        return false;
      }

      if (event.type === 'pointerenter' || event.type === 'pointerleave') {
        return !isTouchPointer(event);
      }

      return isTouchPointer(event) || event.buttons === 1;
    },
    [disabled, getParentHost, isNestedInteractiveTarget, isTouchPointer],
  );

  const isPointerInsideHost = React.useCallback((event: PointerEvent) => {
    const host = hostRef.current;

    if (!host) {
      return false;
    }

    const bounds = host.getBoundingClientRect();

    return (
      event.clientX >= bounds.left &&
      event.clientX <= bounds.right &&
      event.clientY >= bounds.top &&
      event.clientY <= bounds.bottom
    );
  }, []);

  const refreshGeometry = React.useCallback(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    const { height, width } = host.getBoundingClientRect();
    geometryRef.current = getRippleGeometry(height, width);
  }, []);

  const getLocalPressPoint = React.useCallback((event: MouseEvent | PointerEvent): RipplePoint => {
    const host = hostRef.current;

    if (!host) {
      return { x: 0, y: 0 };
    }

    const bounds = host.getBoundingClientRect();
    const left = window.scrollX + bounds.left;
    const top = window.scrollY + bounds.top;

    return {
      x: event.pageX - left,
      y: event.pageY - top,
    };
  }, []);

  const getTranslationPoints = React.useCallback(
    (event?: MouseEvent | PointerEvent) => {
      const parent = getParentHost();

      if (!parent) {
        return {
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 0, y: 0 },
        };
      }

      const bounds = parent.getBoundingClientRect();
      const centeredPoint = {
        x: (bounds.width - geometryRef.current.initialSize) / 2,
        y: (bounds.height - geometryRef.current.initialSize) / 2,
      };

      return {
        startPoint: event ? getLocalPressPoint(event) : centeredPoint,
        endPoint: centeredPoint,
      };
    },
    [getLocalPressPoint, getParentHost],
  );

  const startPress = React.useCallback(
    (event?: MouseEvent | PointerEvent) => {
      const surface = surfaceRef.current;

      if (!surface) {
        return;
      }

      clearReleaseTimeout();
      setIsPressed(true);
      animationRef.current?.cancel();
      refreshGeometry();

      const { startPoint, endPoint } = getTranslationPoints(event);
      const start = `${startPoint.x}px,${startPoint.y}px`;
      const end = `${endPoint.x}px,${endPoint.y}px`;

      animationRef.current = surface.animate(
        {
          height: [geometryRef.current.size, geometryRef.current.size],
          width: [geometryRef.current.size, geometryRef.current.size],
          transform: [`translate(${start}) scale(1)`, `translate(${end}) scale(${geometryRef.current.scale})`],
        },
        {
          pseudoElement: '::after',
          duration,
          easing,
          fill: 'forwards',
        },
      );
    },
    [clearReleaseTimeout, duration, easing, getTranslationPoints, refreshGeometry],
  );

  const endPress = React.useCallback(() => {
    clearTouchDelayTimeout();
    activePointerRef.current = undefined;
    phaseRef.current = 'inactive';

    const animation = animationRef.current;
    const elapsedTime = typeof animation?.currentTime === 'number' ? animation.currentTime : Number.POSITIVE_INFINITY;

    if (elapsedTime >= minimumPressDuration) {
      clearReleaseTimeout();
      setIsPressed(false);
      return;
    }

    clearReleaseTimeout();
    releaseTimeoutRef.current = window.setTimeout(() => {
      if (animationRef.current === animation) {
        setIsPressed(false);
      }
    }, minimumPressDuration - elapsedTime);
  }, [clearReleaseTimeout, clearTouchDelayTimeout, minimumPressDuration]);

  const handlePointerEnter = React.useCallback(
    (event: PointerEvent) => {
      if (isEligiblePointerEvent(event)) {
        setIsHovered(true);
      }
    },
    [isEligiblePointerEvent],
  );

  const handlePointerLeave = React.useCallback(
    (event: PointerEvent) => {
      if (!isEligiblePointerEvent(event)) {
        return;
      }

      setIsHovered(false);

      if (phaseRef.current !== 'inactive') {
        endPress();
      }
    },
    [endPress, isEligiblePointerEvent],
  );

  const handlePointerUp = React.useCallback(
    (event: PointerEvent) => {
      if (!isEligiblePointerEvent(event)) {
        return;
      }

      if (phaseRef.current === 'holding') {
        phaseRef.current = 'waiting-for-click';
        return;
      }

      if (phaseRef.current === 'touch-delay') {
        phaseRef.current = 'waiting-for-click';
        startPress(activePointerRef.current);
      }
    },
    [isEligiblePointerEvent, startPress],
  );

  const handlePointerDown = React.useCallback(
    (event: PointerEvent) => {
      if (!isEligiblePointerEvent(event)) {
        return;
      }

      clearTouchDelayTimeout();
      activePointerRef.current = event;

      if (!isTouchPointer(event)) {
        phaseRef.current = 'waiting-for-click';
        startPress(event);
        return;
      }

      if (suppressNextTouchRef.current && !isPointerInsideHost(event)) {
        return;
      }

      suppressNextTouchRef.current = false;
      phaseRef.current = 'touch-delay';
      touchDelayTimeoutRef.current = window.setTimeout(() => {
        if (phaseRef.current === 'touch-delay') {
          phaseRef.current = 'holding';
          startPress(event);
        }
      }, touchDelay);
    },
    [clearTouchDelayTimeout, isEligiblePointerEvent, isPointerInsideHost, isTouchPointer, startPress, touchDelay],
  );

  const handleClick = React.useCallback(
    (event: MouseEvent) => {
      if (disabled || isNestedInteractiveTarget(event.target)) {
        return;
      }

      if (phaseRef.current === 'waiting-for-click') {
        endPress();
        return;
      }

      if (phaseRef.current === 'inactive') {
        startPress(event);
        endPress();
      }
    },
    [disabled, endPress, isNestedInteractiveTarget, startPress],
  );

  const handlePointerCancel = React.useCallback(
    (event: PointerEvent) => {
      if (isEligiblePointerEvent(event)) {
        endPress();
      }
    },
    [endPress, isEligiblePointerEvent],
  );

  const handleContextMenu = React.useCallback(() => {
    if (!disabled) {
      suppressNextTouchRef.current = true;
      endPress();
    }
  }, [disabled, endPress]);

  React.useEffect(() => {
    const parent = getParentHost();

    if (!parent) {
      return;
    }

    // Mirror the upstream ripple's capture listeners so the card surface can
    // observe pointer transitions before React click handlers run.
    const listeners: Array<readonly [string, EventListener]> = [
      ['click', handleClick as EventListener],
      ['contextmenu', handleContextMenu as EventListener],
      ['pointercancel', handlePointerCancel as EventListener],
      ['pointerdown', handlePointerDown as EventListener],
      ['pointerenter', handlePointerEnter as EventListener],
      ['pointerleave', handlePointerLeave as EventListener],
      ['pointerup', handlePointerUp as EventListener],
    ];

    for (const [eventName, listener] of listeners) {
      parent.addEventListener(eventName, listener, CAPTURED_LISTENER_OPTIONS);
    }

    return () => {
      clearReleaseTimeout();
      clearTouchDelayTimeout();
      animationRef.current?.cancel();

      for (const [eventName, listener] of listeners) {
        parent.removeEventListener(eventName, listener, CAPTURED_LISTENER_OPTIONS);
      }
    };
  }, [
    clearReleaseTimeout,
    clearTouchDelayTimeout,
    getParentHost,
    handleClick,
    handleContextMenu,
    handlePointerCancel,
    handlePointerDown,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerUp,
  ]);

  return (
    <div ref={hostRef} className={`salty-ripple${className ? ` ${className}` : ''}`} style={style} aria-hidden="true">
      <div
        ref={surfaceRef}
        className={`salty-ripple-surface${isHovered ? ' --hover' : ''}${isPressed ? ' --press' : ''}`}
      />
    </div>
  );
};

export { CardRipple };
