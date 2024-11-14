import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import { getBedOccupant, getGroup, getUserByRecordId } from '@/lib/airtable';
import { BEDS, COOKIES } from '@/utils/constants';
import Cookies from 'js-cookie';
import { useEffect, useReducer } from 'react';

const actions = {
  INIT_LOGIN: 'INIT_LOGIN',
  LOG_IN: 'LOG_IN',
  LOG_OUT: 'LOG_OUT',
};

const { INIT_LOG_IN, LOG_IN, LOG_OUT } = actions;

const reducer = (state, action) => {
  switch (action.type) {
    case INIT_LOG_IN:
      return {
        ...state,
        isLoading: true,
      };
    case LOG_IN:
      return {
        ...state,
        user: action.userData,
        isLoading: false,
      };
    case LOG_OUT:
      return {
        ...state,
        user: null,
      };
  }
};

const initialState = {
  user: null,
  isLoading: false,
};

export default function useUserReducer({ userData }) {
  const userRecordCookie = Cookies.get(COOKIES.USER_RECORD);
  const [state, dispatch] = useReducer(reducer, initialState);
  const cabinAndUnitData = useCabinAndUnitData();

  useEffect(() => {
    const loadUser = async () => {
      dispatch({ type: actions.INIT_LOGIN });

      // Get cabin data from reference record
      const cabinId = (userData.cabin && userData.cabin[0]) || '';
      if (cabinId) {
        const cabinData = cabins.find(({ id }) => id === cabinId);
        // Get reference record for occupant of each bed
        const bedsArray = Object.keys(BEDS);
        for (let bed of bedsArray) {
          if (cabinData[bed] && cabinData[bed][0]) {
            const currentBedOccupant = await getBedOccupant({
              userId: cabinData[bed][0],
            });
            cabinData[bed] = currentBedOccupant;
          }
        }
        userData.cabin = cabinData;
      }
      // Get group data from reference record
      const groupId = (userData.group && userData.group[0]) || '';
      if (groupId) {
        const groupData = await getGroup({
          groupId,
        });

        const members = await Promise.all(
          groupData.members.map(async memberId => {
            const memberData = await getUserByRecordId({ id: memberId });
            return memberData;
          })
        );
        groupData.members = members;
        userData.group = groupData;
      }
      dispatch({ type: actions.LOG_IN, userData });
    };
    const cabins = cabinAndUnitData?.cabins?.length
      ? cabinAndUnitData?.cabins
      : [];

    if (userRecordCookie && !state?.user && cabins.length) {
      loadUser();
    }
  }, [userRecordCookie, dispatch, cabinAndUnitData, state?.user]);

  return {
    ...state,
    dispatch,
    actions,
  };
}
