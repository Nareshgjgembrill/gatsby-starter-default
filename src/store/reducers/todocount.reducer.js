/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */

import {
  GET_TODO_COUNT,
  SET_TODO_COUNT,
  RESET_TODO_COUNT,
} from '../actions/actions';

const todoCountReducer = (state = { fetched: false }, action) => {
  switch (action.type) {
    case GET_TODO_COUNT:
      return {
        ...state,
        ...action.payLoad,
      };
    case SET_TODO_COUNT:
      return {
        ...state,
        ...action.payLoad,
      };
    case RESET_TODO_COUNT:
      return {
        ...state,
        ...action.payLoad,
      };
    default:
      return state;
  }
};

export default todoCountReducer;
