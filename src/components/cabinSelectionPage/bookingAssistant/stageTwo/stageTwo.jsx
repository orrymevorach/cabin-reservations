import Checkbox from '@/components/shared/checkbox/checkbox';

export default function StageTwo({ setStage }) {
  return (
    <div>
      <p>Is this your first year at Highlands?</p>
      <form action="#">
        <Checkbox id="yes" label="Yes" handleChange={() => setStage(3)} />
        <Checkbox id="no" label="No" handleChange={() => setStage(3)} />
      </form>
    </div>
  );
}
