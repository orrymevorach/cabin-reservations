import styles from './checkbox.module.scss';

export default function Checkbox({ label = '', id = '', handleChange }) {
  return (
    <div>
      <input type="checkbox" name={id} id={id} onChange={handleChange} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
