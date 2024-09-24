const { useReducer } = require('react');

const actions = {
  SET_NAME: 'SET_NAME',
  SET_ARRIVAL_TIME: 'SET_ARRIVAL_TIME',
  SET_ARRIVAL_DAY: 'SET_ARRIVAL_DAY',
  SET_STAGE: 'SET_STAGE',
  SET_QUESTIONS: 'SET_QUESTIONS',
  SET_CITY: 'SET_CITY',
  SET_BIRTHDAY: 'SET_BIRTHDAY',
  HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS: 'HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS',
  SET_ELECTRIC_VEHICLE: 'SET_ELECTRIC_VEHICLE',
  SET_DEPARTURE_TIME: 'SET_DEPARTURE_TIME',
};

const stages = {
  // PAGE_LOAD: 'PAGE_LOAD',
  // LOG_IN: 'LOG_IN',
  FILL_OUT_FORM: 'FILL_OUT_FORM',
  SIGN_WAIVER: 'SIGN_WAIVER',
  CONFIRMATION: 'CONFIRMATION',
};

const initialState = {
  name: '',
  arrivalTime: '',
  arrivalDay: '',
  stage: stages.FILL_OUT_FORM,
  questions: '',
  city: '',
  birthday: '',
  howDidYouHearAboutHighlands: '',
  departureTime: '',
  electricVehicle: '',
};

const reducer = (state, action) => {
  const {
    SET_NAME,
    SET_ARRIVAL_TIME,
    SET_ARRIVAL_DAY,
    SET_STAGE,
    SET_QUESTIONS,
    SET_BIRTHDAY,
    SET_CITY,
    HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS,
    SET_ELECTRIC_VEHICLE,
    SET_DEPARTURE_TIME,
  } = actions;
  switch (action.type) {
    case SET_NAME:
      return {
        ...state,
        name: action.name,
      };
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
    case SET_QUESTIONS:
      return {
        ...state,
        questions: action.questions,
      };
    case SET_STAGE:
      return {
        ...state,
        stage: action.stage,
      };
    case SET_CITY:
      return {
        ...state,
        city: action.city,
      };
    case SET_BIRTHDAY:
      return {
        ...state,
        birthday: action.birthday,
      };
    case HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS:
      return {
        ...state,
        howDidYouHearAboutHighlands: action.howDidYouHearAboutHighlands,
      };
    case SET_ELECTRIC_VEHICLE:
      return {
        ...state,
        electricVehicle: action.electricVehicle,
      };
    case SET_DEPARTURE_TIME:
      return {
        ...state,
        departureTime: action.departureTime,
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
