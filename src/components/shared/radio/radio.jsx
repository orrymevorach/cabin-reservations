import { useState } from 'react';

export default function Radio({ label = '', id = '', handleChange }) {
  const [isChecked, setIsChecked] = useState(false);
  const handleRadioCheck = () => {
    setIsChecked(true);
    handleChange();
  };
  return (
    <label>
      <input
        type="radio"
        name={id}
        id={id}
        onChange={handleRadioCheck}
        checked={isChecked}
      />
      {label}
    </label>
  );
}
