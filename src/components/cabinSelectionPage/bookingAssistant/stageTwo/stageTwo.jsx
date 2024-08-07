import Button from '@/components/shared/button/button';

export default function StageTwo({ setStage }) {
  return (
    <div>
      <p>Is this your first year at Highlands?</p>
      <form action="#">
        <Button handleClick={() => setStage(3)}>Yes</Button>
        <Button handleClick={() => setStage(3)}>No</Button>
      </form>
    </div>
  );
}
