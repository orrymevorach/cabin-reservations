import { logSentryApiError } from '@/utils/sentry-utils';
import getCabinAndUnitData from '@/lib/platform-api';
import { getUserReservationData } from '@/lib/platform-utils';
import { isObjectEmpty } from '@/utils/string-utils';
import { requireSignedInUser } from '@/lib/user-session-server';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Reservation details belong to the signed-in user; a userId naming anyone else is refused.
    const signedInUser = await requireSignedInUser(req, res);
    if (!signedInUser) return;
    const { userId: queryUserId = null } = req.query;
    if (queryUserId && queryUserId !== signedInUser.id) {
      return res
        .status(403)
        .json({ message: 'You can only view your own reservation.' });
    }
    const user = isObjectEmpty(signedInUser) ? null : signedInUser;

    if (!user) return res.status(200).json({ user: null });

    const cabinAndUnitData = await getCabinAndUnitData();
    const {
      user: resolvedUser,
      group,
      selectedBeds,
    } = await getUserReservationData({ user, cabinAndUnitData });

    res
      .status(200)
      .json({ cabinAndUnitData, user: resolvedUser, group, selectedBeds });
  } catch (err) {
    await logSentryApiError({
      error: err,
      req,
      action: 'load-user-reservation-data',
      extra: { userId: req.query?.userId },
    });
    res.status(err.statusCode || 500).json({ message: err.message });
  }
}
