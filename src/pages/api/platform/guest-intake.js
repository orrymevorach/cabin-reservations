import { logSentryError } from '@/utils/sentry-utils';

const GUEST_INTAKE_ENDPOINT = 'https://guest-intake.siimplsoftware.com';
const GUEST_INTAKE_EVENT_ID = '36cfe48b-0e8c-4d9f-9ae8-cdedaf10640a';
const GUEST_INTAKE_ORGANIZATION_ID = '4959292d-c43a-4ddd-a585-d6bc8a84f1e8';

const getNameParts = name => {
  const [firstName = '', ...lastNameParts] = (name || '').trim().split(' ');
  return {
    firstName,
    lastName: lastNameParts.join(' '),
  };
};

const normalizeNullableValue = value => {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
    return;
  }

  const { user, arrivalTime, requiresWaiver } = req.body;
  const { firstName, lastName } = getNameParts(user?.name);

  const payload = {
    living: normalizeNullableValue(user?.cabin),
    rv: null,
    arriving_late: null,
    leaving_early: null,
    electric_car: Boolean(user?.electricCar),
    event_id: GUEST_INTAKE_EVENT_ID,
    check_in_note: '',
    first_name: user?.firstName || firstName,
    last_name: user?.lastName || lastName,
    organization_id: GUEST_INTAKE_ORGANIZATION_ID,
    requires_waiver: Boolean(requiresWaiver),
    external_id: user?.id,
    custom1: arrivalTime,
    dietary: null,
  };

  try {
    const response = await fetch(GUEST_INTAKE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      logSentryError(new Error('Guest intake sync failed.'), {
        status: response.status,
        externalId: payload.external_id,
        custom1: payload.custom1,
        requiresWaiver: payload.requires_waiver,
        responseData: data,
      });
      res.status(response.status).json({
        message: 'Unable to sync guest intake.',
        data,
      });
      return;
    }

    res.status(200).json({ data });
  } catch (error) {
    logSentryError(error, {
      externalId: payload.external_id,
      custom1: payload.custom1,
      requiresWaiver: payload.requires_waiver,
    });
    res.status(500).json({
      message: error.message || 'Unable to sync guest intake.',
    });
  }
}