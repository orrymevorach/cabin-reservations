import { useState } from 'react';
import { hasProvidedDietaryInformation } from '@/components/GuestProfilePanel/utils';
import DietaryIntakeForm from '@/components/GuestProfilePanel/DietaryIntakeForm/DietaryIntakeForm';
import styles from './DietaryIntakeCard.module.scss';

export default function DietaryIntakeCard({ guestInformation }) {
  const [isEditingDietary, setIsEditingDietary] = useState(false);
  const {
    information: { guest },
    isSaving,
    shouldSignIn,
    errorMessage,
    saveMessage,
    saveNoDietaryRestrictions,
  } = guestInformation;
  const hasDietaryResponse = hasProvidedDietaryInformation(
    guest.dietaryRequirements,
    guest.dietaryNotes,
  );

  return (
    <section className={styles.card} aria-labelledby='dietary-title'>
      <h2 id='dietary-title' className={styles.heading}>
        Dietary requirements
      </h2>
      {!hasDietaryResponse && (
        <p className={styles.description}>
          Please fill out your dietary information so the Highlands kitchen can
          prepare for your arrival, or let us know you don't have dietary
          restrictions.
        </p>
      )}
      {isEditingDietary ? (
        <DietaryIntakeForm guestInformation={guestInformation} />
      ) : (
        <>
          {hasDietaryResponse && (
            <>
              {guest.dietaryRequirements.length > 0 && (
                <p className={styles.description}>
                  {guest.dietaryRequirements.join(', ')}
                </p>
              )}
              {guest.dietaryNotes && (
                <p className={styles.notesSummary}>
                  {guest.dietaryNotes === 'None' &&
                  guest.dietaryRequirements.length === 0
                    ? 'You have no dietary restrictions.'
                    : guest.dietaryNotes}
                </p>
              )}
            </>
          )}
          <div className={styles.actions}>
            <button
              className={styles.button}
              type='button'
              disabled={isSaving || shouldSignIn}
              onClick={() => setIsEditingDietary(true)}
            >
              {hasDietaryResponse
                ? 'Update dietary information'
                : 'Fill out dietary form'}
            </button>
            {!hasDietaryResponse && (
              <button
                className={styles.secondaryButton}
                type='button'
                disabled={isSaving || shouldSignIn}
                onClick={saveNoDietaryRestrictions}
              >
                {isSaving ? 'Saving...' : "I don't have dietary restrictions"}
              </button>
            )}
          </div>
        </>
      )}
      {errorMessage && (
        <p className={styles.error} role='alert'>
          {errorMessage}
        </p>
      )}
      {saveMessage && (
        <p className={styles.saved} role='status'>
          {saveMessage}
        </p>
      )}
    </section>
  );
}
