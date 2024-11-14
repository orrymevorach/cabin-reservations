import { useReducer } from 'react';

const actions = {
  LOG_IN: 'LOG_IN',
  LOG_OUT: 'LOG_OUT',
};

const { LOG_IN, LOG_OUT } = actions;

const reducer = (state, action) => {
  switch (action.type) {
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

export default function useUserReducer({ userData }) {
  const initialState = {
    user: userData,
    isLoading: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    ...state,
    dispatch,
    actions,
  };
}
