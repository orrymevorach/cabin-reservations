import { useState } from 'react';
import styles from './radio.module.scss';
import clsx from 'clsx';

export default function Radio({
  label = '',
  id = '',
  handleChange,
  classNames,
  name = '',
}) {
  const [isChecked, setIsChecked] = useState(false);
  const handleRadioCheck = () => {
    setIsChecked(true);
    handleChange();
  };
  return (
    <label className={clsx(styles.radio, classNames)}>
      <input
        type="radio"
        name={name}
        id={id}
        onChange={handleRadioCheck}
        checked={isChecked}
      />
      {label}
    </label>
  );
}
