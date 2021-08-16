import {
  GET_ALL_CADENCES,
  SET_ALL_CADENCES,
  GET_ALL_CADENCES_ALL_USERS,
  SET_ALL_CADENCES_ALL_USERS,
  RESET_ALL_CADENCES,
} from '../actions/actions';

const cadenceReducer = (state = { fetchedAll: false }, action) => {
  switch (action.type) {
    case GET_ALL_CADENCES:
      return {
        ...state,
        ...action.payLoad,
      };
    case SET_ALL_CADENCES:
      return {
        ...state,
        ...action.payLoad,
      };
    case GET_ALL_CADENCES_ALL_USERS:
      return {
        ...state,
        ...action.payLoad,
      };
    case SET_ALL_CADENCES_ALL_USERS:
      return {
        ...state,
        ...action.payLoad,
      };
    case RESET_ALL_CADENCES:
      return {
        ...action.payLoad,
      };
    default:
      return state;
  }
};

export default cadenceReducer;
