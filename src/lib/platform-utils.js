import { getBedOccupant, getGroup, getUserByRecordId } from '@/lib/airtable';
import { BEDS } from '@/utils/constants';

export async function resolveGroupMembers({ memberIds }) {
  return Promise.all(memberIds.map(memberId => getUserByRecordId({ id: memberId })));
}

async function resolveSelectedBeds({ cabin }) {
  const selectedBeds = [];
  if (!cabin) return selectedBeds;
  const bedsArray = Object.keys(BEDS);
  for (const bed of bedsArray) {
    if (cabin[bed] && cabin[bed][0]) {
      const occupant = await getBedOccupant({ userId: cabin[bed][0] });
      cabin[bed] = occupant;
      selectedBeds.push({ bedName: bed, ...occupant });
    }
  }
  return selectedBeds;
}

async function resolveGroup({ user }) {
  let groupId = '';
  let members = [];
  if (user.group && user.group.length > 0) {
    groupId = user.group[0] || '';
    const groupResponse = await getGroup({ groupId });
    if (groupResponse?.members) {
      members = await resolveGroupMembers({ memberIds: groupResponse.members });
    }
  }
  return { id: groupId, members };
}

// resolves a user's current cabin/bed occupants and group membership, shared by
// the cabin-selection page (SSR) and the /api/platform/user-reservation-data route (mobile)
export async function getUserReservationData({ user, cabinAndUnitData }) {
  let currentCabin = null;
  if (user.cabin) {
    currentCabin =
      cabinAndUnitData.cabins.find(cabin => cabin.id === user.cabin[0]) || null;
  }

  const selectedBeds = await resolveSelectedBeds({ cabin: currentCabin });
  const group = await resolveGroup({ user });

  return {
    user: { ...user, cabin: currentCabin, group: group.members },
    group,
    selectedBeds,
  };
}
