import {
  GET_CABINS,
  GET_USER_BY_EMAIL,
  RESERVE_SPOT_IN_CABIN,
  GET_USER_BY_ID,
  GET_CABIN,
  RESERVE_BED,
  CLEAR_CURRENT_BED_SELECTION,
  CREATE_GROUP,
  UPDATE_GROUP,
  CHECK_IN,
} from '@/graphql/queries';
import { client } from '@/graphql/apollo-config';

export const getCabins = async () => {
  try {
    const { data } = await client.query({
      query: GET_CABINS,
    });
    return data.cabins;
  } catch (error) {
    console.log(error);
  }
};

export const getCabin = async ({ cabinName }) => {
  try {
    const { data } = await client.query({
      query: GET_CABIN,
      variables: {
        cabinName,
      },
    });
    return data.cabins[0];
  } catch (error) {
    console.log(error);
  }
};

export const reserveSpotInCabin = async ({ cabinId = '', attendeeId }) => {
  try {
    const { data } = await client.mutate({
      mutation: RESERVE_SPOT_IN_CABIN,
      variables: {
        cabinId,
        attendeeId,
      },
    });
    return data.update_ticketPurchases;
  } catch (error) {
    console.log(error);
  }
};

export const getUserByEmail = async ({ email }) => {
  try {
    const { data } = await client.query({
      query: GET_USER_BY_EMAIL,
      variables: { email },
      fetchPolicy: 'no-cache',
    });
    return data.ticketPurchases[0];
  } catch (error) {
    console.log(error);
  }
};

export const getUserByRecordId = async ({ id }) => {
  try {
    const { data } = await client.query({
      query: GET_USER_BY_ID,
      variables: { id },
      fetchPolicy: 'no-cache',
    });
    return data.ticketPurchases[0];
  } catch (error) {
    console.log(error);
  }
};

export const reserveBed = async ({
  userId,
  frontBunkLeft,
  frontCotLeft,
  backCotLeft,
  frontLoftLeft,
  backLoftLeft,
  backBunkLeft,
  frontBunkRight,
  frontCotRight,
  backCotRight,
  frontLoftRight,
  backLoftRight,
  backBunkRight,
}) => {
  try {
    const { data } = await client.mutate({
      mutation: RESERVE_BED,
      variables: {
        userId,
        frontBunkLeft,
        frontCotLeft,
        backCotLeft,
        frontLoftLeft,
        backLoftLeft,
        backBunkLeft,
        frontBunkRight,
        frontCotRight,
        backCotRight,
        frontLoftRight,
        backLoftRight,
        backBunkRight,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const clearCurrentBedSelection = async ({ userId }) => {
  try {
    const { data } = await client.mutate({
      mutation: CLEAR_CURRENT_BED_SELECTION,
      variables: {
        userId,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createGroup = async ({ groupName, members }) => {
  try {
    const { data } = await client.mutate({
      mutation: CREATE_GROUP,
      variables: {
        groupName,
        members,
      },
    });
    return data.insert_groups[0];
  } catch (error) {
    console.log(error);
  }
};

export const updateGroup = async ({ groupId, members }) => {
  try {
    const { data } = await client.mutate({
      mutation: UPDATE_GROUP,
      variables: {
        id: groupId,
        members,
      },
    });
    return data.update_groups[0];
  } catch (error) {
    console.log(error);
  }
};

export const checkIn = async ({
  id,
  arrivalDay,
  arrivalTime,
  name,
  questions,
  city,
  birthday,
  howDidYouHearAboutHighlands,
}) => {
  try {
    const { data } = await client.mutate({
      mutation: CHECK_IN,
      variables: {
        id,
        name,
        arrivalDay,
        arrivalTime,
        questions,
        city,
        birthday,
        howDidYouHearAboutHighlands,
      },
    });
    return data;
  } catch (error) {
    console.log(error);
  }
};
