import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import { useReservation } from '@/context/reservation-context';

export default function useAllowBedSelection() {
  const { cabinData } = useReservation();
  const { units } = useCabinAndUnitData();
  const unitName = cabinData?.cabin?.unit?.length && cabinData?.cabin?.unit[0];
  const unitData = units.find(({ name }) => name === unitName);
  const allowBedSelection = !!unitData?.allowBedSelection;
  return allowBedSelection;
}
