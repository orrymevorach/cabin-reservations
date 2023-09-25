const { useReducer } = require('react');

const actions = {
  SET_ARRIVAL_TIME: 'SET_ARRIVAL_TIME',
  SET_ARRIVAL_DAY: 'SET_ARRIVAL_DAY',
  SET_STAGE: 'SET_STAGE',
};

const stages = {
  PAGE_LOAD: 'PAGE_LOAD',
  LOG_IN: 'LOG_IN',
  FILL_OUT_FORM: 'FILL_OUT_FORM',
  SIGN_WAIVER: 'SIGN_WAIVER',
};

const initialState = {
  arrivalTime: '',
  arrivalDay: '',
  stage: stages.PAGE_LOAD,
};

const reducer = (state, action) => {
  const { SET_ARRIVAL_TIME, SET_ARRIVAL_DAY, SET_STAGE } = actions;
  switch (action.type) {
    case SET_ARRIVAL_TIME:
      return {
        ...state,
        arrivalTime: action.arrivalTime,
      };
    case SET_ARRIVAL_DAY:
      return {
        ...state,
        arrivalDay: action.arrivalDay,
      };
    case SET_STAGE:
      return {
        ...state,
        stage: action.stage,
      };
  }
};

export default function useCheckInReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    state,
    dispatch,
    actions,
    stages,
  };
}
