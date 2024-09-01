import { useCabinAndUnitData } from '@/context/cabin-and-unit-data-context';
import { useUser } from '@/context/user-context';
import { getBedOccupant } from '@/lib/airtable';
import { BEDS } from '@/utils/constants';
import { useRouter } from 'next/router';
import { useReducer, useEffect, useState } from 'react';

const actions = {
  UPDATE_GROUP: 'UPDATE_GROUP',
  SET_SELECTION_STAGE: 'SET_SELECTION_STAGE',
  SELECT_BEDS: 'SELECT_BEDS',
};

const { UPDATE_GROUP, SET_SELECTION_STAGE, SELECT_BEDS } = actions;

export const CABIN_SELECTION_STAGES = {
  ADD_GUESTS: 'ADD_GUESTS',
  CONFIRMATION: 'CONFIRMATION',
  BED_SELECTION: 'BED_SELECTION',
};

const initialState = {
  currentStage: '',
  selectedBeds: [],
  groupData: {
    id: '',
    members: [],
  },
  numberOfMembersNotConfirmedInCurrentCabin: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case UPDATE_GROUP:
      return {
        ...state,
        groupData: action.groupData,
        numberOfMembersNotConfirmedInCurrentCabin:
          action.numberOfMembersNotConfirmedInCurrentCabin,
      };
    case SET_SELECTION_STAGE:
      return {
        ...state,
        currentStage: action.currentStage,
      };
    case SELECT_BEDS:
      return {
        ...state,
        selectedBeds: action.selectedBeds,
      };
  }
};

const useGetCabinData = () => {
  const router = useRouter();
  const { user } = useUser();
  const { cabins } = useCabinAndUnitData();

  const cabinQuery = router.query.cabin;
  const cabinName = cabinQuery || user?.cabin?.name;

  if (!cabinName)
    return {
      cabin: null,
    };

  const cabin = cabins.find(({ name }) => cabinName === name);

  return {
    cabin,
  };
};

const useGetBeds = ({ cabinData, dispatch, actions }) => {
  const [isGetting, setIsGetting] = useState(true);

  useEffect(() => {
    const getBeds = async () => {
      const selectedBeds = [];
      const bedsArray = Object.keys(BEDS);
      for (let bed of bedsArray) {
        const current = cabinData.cabin[bed];
        console.log('current', current);
        if (cabinData.cabin[bed]) {
          console.log('level 1');
          const currentBedOccupant = await getBedOccupant({
            userId: cabinData.cabin[bed][0],
          });
          selectedBeds.push({
            bedName: bed,
            ...currentBedOccupant,
          });
        }
      }
      dispatch({ type: actions.SELECT_BEDS, selectedBeds });
      setIsGetting(false);
    };
    if (cabinData?.cabin && isGetting) {
      getBeds();
    }
  }, [cabinData, isGetting, actions, dispatch]);
};

export const useReservationReducer = () => {
  const { user } = useUser();
  const [state, dispatch] = useReducer(reducer, initialState);

  const cabinData = useGetCabinData();
  useEffect(() => {
    if (user && !state.groupData.members.length && cabinData.cabin) {
      // Add group data on page load
      const hasGroup = !!user?.group;
      const groupData = hasGroup ? user.group : { members: [user] };

      // numberOfMembersNotConfirmedInCurrentCabin helps with add guest logic.
      // Specfically in the scenario where members of the group are confirmed in a cabin, and others are added later to the same cabin as the rest of the group.
      const numberOfMembersNotConfirmedInCurrentCabin =
        groupData?.members?.filter(({ cabin }) => {
          const hasCabin = cabin?.length;
          const hasDifferentCabin = hasCabin
            ? cabin.name !== cabinData.cabin.name
            : false;
          if (!hasCabin || hasDifferentCabin) return true;
          return false;
        }).length;

      dispatch({
        type: UPDATE_GROUP,
        groupData,
        numberOfMembersNotConfirmedInCurrentCabin,
      });
    }
  }, [user, state, cabinData]);

  useGetBeds({ cabinData, dispatch, actions });

  return {
    ...state,
    cabinData,
    dispatch,
    actions,
  };
};
