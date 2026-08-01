import { LoadingIndicator } from 'm3you';

export default function LoadingIndicatorContained() {
  return (
    <>
      <LoadingIndicator variant="uncontained" />
      <LoadingIndicator variant="contained" />
    </>
  );
}
