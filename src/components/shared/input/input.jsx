import styles from './input.module.scss';
import { TextField } from '@mui/material';
import clsx from 'clsx';

export default function Input({
  label = '',
  type,
  id,
  value,
  error,
  classNames,
  handleChange,
  placeholder,
}) {
  return (
    <div className={styles.inputContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {error && <p className={styles.error}>{error}</p>}
      <TextField
        type={type}
        id={id}
        name={id}
        onChange={handleChange}
        value={value}
        className={clsx(styles.input, classNames)}
        size="small"
        placeholder={placeholder}
      />
    </div>
  );
}
