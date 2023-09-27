const { useReducer } = require('react');

const actions = {
  SET_ARRIVAL_TIME: 'SET_ARRIVAL_TIME',
  SET_ARRIVAL_DAY: 'SET_ARRIVAL_DAY',
  SET_STAGE: 'SET_STAGE',
  SET_QUESTIONS: 'SET_QUESTIONS',
  SET_CITY: 'SET_CITY',
  SET_BIRTHDAY: 'SET_BIRTHDAY',
  HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS: 'HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS',
};

const stages = {
  PAGE_LOAD: 'PAGE_LOAD',
  LOG_IN: 'LOG_IN',
  FILL_OUT_FORM: 'FILL_OUT_FORM',
  SIGN_WAIVER: 'SIGN_WAIVER',
  CONFIRMATION: 'CONFIRMATION',
};

const initialState = {
  arrivalTime: '',
  arrivalDay: '',
  stage: stages.PAGE_LOAD,
  questions: '',
  city: '',
  birthday: '',
  howDidYouHearAboutHighlands: '',
};

const reducer = (state, action) => {
  const {
    SET_ARRIVAL_TIME,
    SET_ARRIVAL_DAY,
    SET_STAGE,
    SET_QUESTIONS,
    SET_BIRTHDAY,
    SET_CITY,
    HOW_DID_YOU_HEAR_ABOUT_HIGHLANDS,
  } = actions;
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
