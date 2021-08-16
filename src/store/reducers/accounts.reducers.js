import {
  GET_ALL_ACCOUNTS,
  SET_ALL_ACCOUNTS,
  RESET_ALL_ACCOUNTS,
} from '../actions/actions';

const accountsReducer = (state = { fetchedAll: false, data: [] }, action) => {
  switch (action.type) {
    case GET_ALL_ACCOUNTS:
      return {
        ...state,
        ...action.payLoad,
      };
    case SET_ALL_ACCOUNTS:
      return {
        ...state,
        ...action.payLoad,
      };
    case RESET_ALL_ACCOUNTS:
      return {
        ...state,
        ...action.payLoad,
      };
    default:
      return state;
  }
};

export default accountsReducer;
