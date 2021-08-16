/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */

import {
  GET_PENDINGCALLS_COUNT,
  SET_PENDINGCALLS_COUNT,
  RESET_PENDINGCALLS_COUNT,
} from '../actions/actions';

const pendingCallsCountReduer = (state = { fetched: false }, action) => {
  switch (action.type) {
    case GET_PENDINGCALLS_COUNT:
      return {
        ...state,
        ...action.payLoad,
      };
    case SET_PENDINGCALLS_COUNT:
      return {
        ...state,
        ...action.payLoad,
      };
    case RESET_PENDINGCALLS_COUNT:
      return {
        ...state,
        ...action.payLoad,
      };
    default:
      return state;
  }
};

export default pendingCallsCountReduer;
