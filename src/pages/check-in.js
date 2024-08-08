import CheckIn from '@/components/checkIn/checkIn';
import { CheckInProvider } from '@/context/check-in-context';

export default function CheckInPage() {
  return (
    <CheckInProvider>
      <CheckIn />
    </CheckInProvider>
  );
}
