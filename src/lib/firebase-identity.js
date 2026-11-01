export async function getFirebaseIdentity(idToken) {
  if (typeof idToken !== 'string' || !idToken) {
    return { status: 401, message: 'Please sign in again.' };
  }
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('Firebase account verification configuration is missing.');
  }
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: AbortSignal.timeout(15000),
    },
  );
  const result = await response.json();
  if (!response.ok) {
    const expectedErrors = [
      'INVALID_ID_TOKEN',
      'TOKEN_EXPIRED',
      'USER_DISABLED',
      'USER_NOT_FOUND',
    ];
    if (expectedErrors.includes(result.error?.message)) {
      return { status: 401, message: 'Please sign in again.' };
    }
    throw new Error(
      `Firebase account verification failed (${response.status}).`,
    );
  }
  const identity = result.users?.[0];
  if (!identity?.localId || !identity.email || identity.disabled) {
    return {
      status: 401,
      message: 'A Firebase account with an email address is required.',
    };
  }
  return { identity };
}
