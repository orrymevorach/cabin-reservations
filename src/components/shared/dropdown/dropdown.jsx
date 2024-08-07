import { useState } from 'react';
import styles from './dropdown.module.scss';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

export default function Dropdown({
  options,
  label,
  handleChange,
  defaultValue,
  variant = 'outlined',
  classNames = '',
  size = 'small',
}) {
  const [value, setValue] = useState(defaultValue);

  const handleChangeValue = e => {
    setValue(e.target.value);
    handleChange(e.target.value);
  };
  return (
    <FormControl fullWidth variant={variant} className={classNames} size={size}>
      <InputLabel id={`${label}-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-label`}
        id={label}
        value={value}
        label={label}
        onChange={e => handleChangeValue(e)}
        placeholder=""
      >
        {options.map(option => {
          if (option === 'All') {
            return (
              <MenuItem key={option} value={''}>
                {'All'}
              </MenuItem>
            );
          }
          return (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
