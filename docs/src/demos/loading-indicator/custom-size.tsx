import { LoadingIndicator } from 'm3you';

export default function LoadingIndicatorCustomSize() {
  return (
    <>
      <LoadingIndicator style={{ width: 96 }} />
      <LoadingIndicator style={{ width: 96 }} variant="contained" />
    </>
  );
}
