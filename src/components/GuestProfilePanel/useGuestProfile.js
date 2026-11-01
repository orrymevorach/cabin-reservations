import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/components/loginPage/login/firebase-auth';
import { logSentryError } from '@/utils/sentry-utils';

const firebaseSessionErrorCodes = [
  'auth/user-token-expired',
  'auth/invalid-user-token',
  'auth/user-disabled',
];

export default function useGuestProfile() {
  const [information, setInformation] = useState(null);
  const [dietaryRequirements, setDietaryRequirements] = useState([]);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [shouldSignIn, setShouldSignIn] = useState(false);

  // Wait for Firebase to restore the account before loading the attendee's saved details.
  useEffect(() => {
    let shouldIgnoreResults = false;
    let requestNumber = 0;
    const unsubscribe = onAuthStateChanged(auth, async account => {
      const currentRequestNumber = ++requestNumber;
      setInformation(null);
      setErrorMessage('');
      setSaveMessage('');
      setShouldSignIn(!account);
      if (!account) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const idToken = await account.getIdToken();
        const response = await fetch('/api/platform/guest-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        });
        const result = await response.json();
        if (shouldIgnoreResults || currentRequestNumber !== requestNumber)
          return;
        if (!response.ok) {
          setErrorMessage(
            result.message || 'Unable to load your guest information.',
          );
          setShouldSignIn(response.status === 401);
          return;
        }
        setInformation(result);
        setDietaryRequirements(result.guest.dietaryRequirements);
        setDietaryNotes(result.guest.dietaryNotes);
      } catch (error) {
        if (shouldIgnoreResults || currentRequestNumber !== requestNumber)
          return;
        if (firebaseSessionErrorCodes.includes(error.code)) {
          setShouldSignIn(true);
          setErrorMessage(
            'Please sign in again to view your guest information.',
          );
          return;
        }
        logSentryError(error, { action: 'request-guest-information' });
        setErrorMessage(
          'Unable to load your guest information. Reload this page to try again.',
        );
      } finally {
        if (!shouldIgnoreResults && currentRequestNumber === requestNumber) {
          setIsLoading(false);
        }
      }
    });
    return () => {
      shouldIgnoreResults = true;
      unsubscribe();
    };
  }, []);

  function changeRequirement(option, isSelected) {
    setSaveMessage('');
    if (isSelected && dietaryNotes.trim() === 'None') {
      setDietaryNotes('');
    }
    setDietaryRequirements(currentRequirements =>
      isSelected
        ? [...currentRequirements, option]
        : currentRequirements.filter(requirement => requirement !== option),
    );
  }

  function changeNotes(notes) {
    setSaveMessage('');
    setDietaryNotes(notes);
  }

  async function saveDietary(event) {
    event.preventDefault();
    return saveDietaryInformation(dietaryRequirements, dietaryNotes);
  }

  async function saveNoDietaryRestrictions() {
    return saveDietaryInformation([], 'None');
  }

  async function saveDietaryInformation(requirements, notes) {
    if (isSaving) return;
    const account = auth.currentUser;
    setErrorMessage('');
    setSaveMessage('');
    if (!account) {
      setShouldSignIn(true);
      setErrorMessage(
        'Please sign in again before saving your dietary information.',
      );
      return;
    }
    setIsSaving(true);
    try {
      const idToken = await account.getIdToken();
      const response = await fetch('/api/platform/dietary-intake', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          dietaryRequirements: requirements,
          dietaryNotes: notes,
        }),
      });
      const result = await response.json();
      if (auth.currentUser?.uid !== account.uid) return;
      if (!response.ok) {
        setErrorMessage(
          result.message || 'Unable to save your dietary information.',
        );
        setShouldSignIn(response.status === 401);
        return;
      }
      setDietaryRequirements(result.dietaryRequirements);
      setDietaryNotes(result.dietaryNotes);
      setInformation(currentInformation =>
        currentInformation
          ? {
              ...currentInformation,
              guest: {
                ...currentInformation.guest,
                dietaryRequirements: result.dietaryRequirements,
                dietaryNotes: result.dietaryNotes,
              },
            }
          : currentInformation,
      );
      setSaveMessage('Your dietary information has been saved.');
    } catch (error) {
      if (firebaseSessionErrorCodes.includes(error.code)) {
        setShouldSignIn(true);
        setErrorMessage(
          'Please sign in again before saving your dietary information.',
        );
        return;
      }
      logSentryError(error, {
        action: 'request-save-guest-dietary-information',
      });
      setErrorMessage(
        'Unable to save your dietary information. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return {
    information,
    dietaryRequirements,
    dietaryNotes,
    isLoading,
    isSaving,
    errorMessage,
    saveMessage,
    shouldSignIn,
    changeRequirement,
    changeNotes,
    saveDietary,
    saveNoDietaryRestrictions,
  };
}
