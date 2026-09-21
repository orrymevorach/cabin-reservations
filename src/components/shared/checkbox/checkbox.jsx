import styles from './checkbox.module.scss';

export default function Checkbox({
  label = '',
  id = '',
  handleChange,
  required = false,
}) {
  return (
    <div>
      <input
        type='checkbox'
        name={id}
        id={id}
        onChange={handleChange}
        required={required}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
