import { AUTH_SIGNIN, AUTH_SIGNOUT } from '../actions/actions';

const initialState = {
  authenticated: false,
  user: '',
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_SIGNIN:
      return { user: action.payload, authenticated: true };
    case AUTH_SIGNOUT:
      return { ...state, authenticated: false };
    default:
      return state;
  }
};

export default authReducer;
