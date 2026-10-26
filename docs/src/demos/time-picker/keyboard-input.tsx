import { TimePicker } from 'm3you';

export default function TimePickerKeyboardInput() {
  return <TimePicker defaultValue={{ hours: 21, minutes: 15 }} format="24h" defaultMode="input" />;
}
