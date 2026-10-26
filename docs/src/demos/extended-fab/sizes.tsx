import { Plus } from 'lucide-react';
import { ExtendedFAB } from 'm3you';

export default function ExtendedFabSizes() {
  return (
    <>
      <ExtendedFAB fabSize="small" color="primary" icon={<Plus aria-hidden="true" />} label="Small" />
      <ExtendedFAB fabSize="medium" color="primary" icon={<Plus aria-hidden="true" />} label="Medium" />
      <ExtendedFAB fabSize="large" color="primary" icon={<Plus aria-hidden="true" />} label="Large" />
    </>
  );
}
