import { InputLabel, MenuItem, Select } from '@mui/material';
import Input from '@/components/shared/input/input';
import clsx from 'clsx';

export default function FormElement({
  type,
  label,
  id,
  value,
  handleChange,
  options = [],
  placeholder = '',
  required = false,
  error = '',
  formatValue,
  inputProps,
  mask,
  inputClassNames = '',
  labelClassNames = '',
  inputContainerClassNames = '',
  errorClassNames = '',
}) {
  const labelId = `${id}-label`;

  switch (type) {
    case 'dropdown':
      return (
        <div className={inputContainerClassNames}>
          <InputLabel className={labelClassNames} id={labelId}>
            {label}
          </InputLabel>
          <Select
            required={required}
            size='small'
            labelId={labelId}
            id={id}
            value={value}
            className={inputClassNames}
            onChange={event => handleChange(event.target.value)}
          >
            {placeholder && (
              <MenuItem value='' disabled>
                {placeholder}
              </MenuItem>
            )}
            {options.map(option => {
              const optionValue = option.value ?? option;
              const optionLabel = option.label ?? option;

              return (
                <MenuItem key={optionValue} value={optionValue}>
                  {optionLabel}
                </MenuItem>
              );
            })}
          </Select>
          {error && <p className={errorClassNames}>{error}</p>}
        </div>
      );
    case 'text':
    case 'date':
      return (
        <div className={inputContainerClassNames}>
          <InputLabel className={labelClassNames} id={labelId}>
            {label}
          </InputLabel>
          <Input
            id={id}
            type={type === 'date' ? 'date' : undefined}
            value={value}
            handleChange={event =>
              handleChange(
                formatValue
                  ? formatValue(event.target.value)
                  : event.target.value,
              )
            }
            placeholder={placeholder}
            classNames={inputClassNames}
            error={error}
            errorClassNames={errorClassNames}
            required={required}
            inputProps={inputProps}
            mask={mask}
          />
        </div>
      );
    case 'row':
      return (
        <div className={clsx(inputContainerClassNames)}>
          {options.map(elementConfig => (
            <FormElement key={elementConfig.id} {...elementConfig} />
          ))}
        </div>
      );
    default:
      return null;
  }
}
