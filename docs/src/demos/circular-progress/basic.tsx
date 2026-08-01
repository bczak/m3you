import { CircularProgress } from 'm3you';

export default function CircularProgressBasic() {
  return (
    <>
      <CircularProgress value={25} />
      <CircularProgress value={70} />
      <CircularProgress type="indeterminate" />
    </>
  );
}
