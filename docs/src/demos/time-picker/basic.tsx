import { TimePicker } from 'm3you';

export default function TimePickerBasic() {
  return <TimePicker defaultValue={{ hours: 9, minutes: 30 }} format="12h" />;
}
