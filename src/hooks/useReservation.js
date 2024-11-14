import { useRouter } from 'next/router';
import { useReducer } from 'react';

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

const reducer = (state, action) => {
  switch (action.type) {
    case UPDATE_GROUP:
      return {
        ...state,
        groupData: action.groupData,
        numberOfMembersNotConfirmedInCurrentCabin:
          action.numberOfMembersNotConfirmedInCurrentCabin,
        cabin: action.cabin,
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

const getCabinData = ({ user, cabins, cabinQuery }) => {
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

export const useReservationReducer = ({
  user,
  cabinAndUnitData,
  group,
  selectedBeds = [],
}) => {
  const initialState = {
    currentStage: '',
    selectedBeds,
    groupData: group,
    numberOfMembersNotConfirmedInCurrentCabin: 0,
    cabin: user.cabin,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const router = useRouter();
  const cabinQuery = router.query.cabin;

  const { cabins } = cabinAndUnitData;
  const cabinData = getCabinData({ user, cabins, cabinQuery });

  return {
    ...state,
    cabinData,
    dispatch,
    actions,
  };
};
