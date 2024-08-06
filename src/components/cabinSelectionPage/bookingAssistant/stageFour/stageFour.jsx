import { useCabinCategories } from '@/context/cabin-categories';

export default function StageFour() {
  const { cabinCategories } = useCabinCategories();
  return (
    <div>
      <p>A note about your selections:</p>
      {cabinCategories.map(({ name, description }) => {
        return (
          <div key={`${name}-description`}>
            <p>{name}</p>
            <p>{description}</p>
          </div>
        );
      })}
    </div>
  );
}
