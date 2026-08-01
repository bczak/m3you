import { type ReactNode, useState } from 'react';
import { SurfaceProvider } from './surface';

/**
 * A phone-sized viewport for the demo apps.
 *
 * The screen is a container query context at a real M3 Compact size
 * (412 × 917dp), so an app inside it reflows against the *frame* width rather
 * than the browser width. That is what lets the responsive Settings app switch
 * between a navigation bar and a navigation rail while sitting on a docs page.
 *
 * Scaling uses a transform on a wrapper whose box is reserved at the scaled
 * size, so the surrounding layout never sees the unscaled dimensions. The
 * transform also makes the screen a containing block for fixed-position
 * descendants, which is what keeps portalled dialogs inside the bezel.
 */
export function PhoneFrame({
  children,
  label,
  scale = 1,
  theme,
  width = 412,
  height = 890,
}: {
  children: ReactNode;
  label?: string;
  scale?: number;
  theme?: 'light' | 'dark';
  width?: number;
  height?: number;
}) {
  const [screen, setScreen] = useState<HTMLDivElement | null>(null);

  return (
    <figure className="m3-phone" style={{ width: width * scale, height: height * scale + (label ? 34 : 0) }}>
      <div
        className="m3-phone__scaler"
        style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <div className="m3-phone__bezel">
          <div
            ref={setScreen}
            className="m3-phone__screen"
            data-theme={theme}
            style={theme ? { colorScheme: theme } : undefined}
          >
            <SurfaceProvider element={screen}>{children}</SurfaceProvider>
          </div>
        </div>
      </div>
      {label ? <figcaption className="m3-phone__label">{label}</figcaption> : null}
    </figure>
  );
}
