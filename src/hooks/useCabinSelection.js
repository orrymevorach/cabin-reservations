const { useReducer } = require('react');

const actions = {
  OPEN_CABIN_SELECTION: 'OPEN_CABIN_SELECTION',
  CLOSE_CABIN_SELECTION: 'CLOSE_CABIN_SELECTION',
  CLOSE_BOOKING_ASSISTANT: 'CLOSE_BOOKING_ASSISTANT',
};

const {
  OPEN_CABIN_SELECTION,
  CLOSE_CABIN_SELECTION,
  OPEN_BOOKING_ASSISTANT,
  CLOSE_BOOKING_ASSISTANT,
} = actions;

const reducer = (state, action) => {
  switch (action.type) {
    case OPEN_CABIN_SELECTION:
      return {
        ...state,
        showTakeover: true,
        selectedCabin: action.cabin,
      };
    case CLOSE_CABIN_SELECTION:
      return {
        ...state,
        showTakeover: false,
      };
    case OPEN_BOOKING_ASSISTANT:
      return {
        ...state,
        showBookingAssistant: true,
      };
    case CLOSE_BOOKING_ASSISTANT:
      return {
        ...state,
        showBookingAssistant: false,
      };
  }
};

const initialState = {
  selectedCabin: null,
  showTakeover: false,
  showBookingAssistant: true,
};

export const useCabinSelectionReducer = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    ...state,
    dispatch,
    actions,
  };
};
