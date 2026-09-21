import styles from './input.module.scss';
import { TextField } from '@mui/material';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { IMaskInput } from 'react-imask';

const MaskedInput = forwardRef(function MaskedInput(props, ref) {
  const { onChange, name, ...inputProps } = props;

  return (
    <IMaskInput
      {...inputProps}
      inputRef={ref}
      name={name}
      onAccept={value => onChange({ target: { name, value } })}
      overwrite
    />
  );
});

export default function Input({
  label = '',
  type,
  id,
  value,
  error,
  errorClassNames = '',
  classNames,
  handleChange,
  placeholder,
  asterisk = '',
  required = false,
  inputRef,
  inputProps,
  mask,
}) {
  return (
    <div className={styles.inputContainer}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {asterisk && <span className={styles.asterisk}>{asterisk}</span>}
      </label>
      {error && (
        <p className={clsx(styles.error, errorClassNames)}>{error}</p>
      )}
      <TextField
        type={type}
        id={id}
        name={id}
        onChange={handleChange}
        value={value}
        className={clsx(styles.input, classNames)}
        size="small"
        placeholder={placeholder}
        required={required}
        inputRef={inputRef}
        InputProps={mask ? { inputComponent: MaskedInput } : undefined}
        inputProps={{ ...inputProps, ...(mask ? { mask } : {}) }}
      />
    </div>
  );
}
