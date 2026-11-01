import {
  dietaryOptions,
  dietaryNotesMaxLength,
} from '@/components/GuestProfilePanel/utils';
import styles from './DietaryIntakeForm.module.scss';

export default function DietaryIntakeForm({ guestInformation }) {
  const {
    dietaryRequirements,
    dietaryNotes,
    isSaving,
    shouldSignIn,
    changeRequirement,
    changeNotes,
    saveDietary,
    saveNoDietaryRestrictions,
  } = guestInformation;

  return (
    <form onSubmit={saveDietary}>
      <fieldset className={styles.fieldset} disabled={isSaving || shouldSignIn}>
        <legend className={styles.legend}>Select all that apply</legend>
        <div className={styles.options}>
          {dietaryOptions.map(option => (
            <label key={option} className={styles.option}>
              <input
                type='checkbox'
                className={styles.checkbox}
                checked={dietaryRequirements.includes(option)}
                onChange={event =>
                  changeRequirement(option, event.target.checked)
                }
              />
              {option}
            </label>
          ))}
        </div>
        <label htmlFor='dietary-notes' className={styles.notesLabel}>
          Other dietary needs or additional comments
        </label>
        <textarea
          id='dietary-notes'
          className={styles.notes}
          value={dietaryNotes}
          maxLength={dietaryNotesMaxLength}
          rows={5}
          onChange={event => changeNotes(event.target.value)}
        />
        <p className={styles.description}>
          You can update your dietary information anytime.
        </p>
        <div className={styles.actions}>
          <button className={styles.button} type='submit'>
            {isSaving ? 'Saving...' : 'Save dietary information'}
          </button>
          <button
            className={styles.secondaryButton}
            type='button'
            onClick={saveNoDietaryRestrictions}
          >
            I don't have dietary restrictions
          </button>
        </div>
      </fieldset>
    </form>
  );
}
