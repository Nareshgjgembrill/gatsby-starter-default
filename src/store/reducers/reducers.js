import { combineReducers } from 'redux';

import settingsReducer from './settings.reducer.js';
import themesReducer from './themes.reducers.js';
import customerReducers from './customer.reducers.js';
import accountReducers from './accounts.reducers.js';
import tagsReducer from './tags.reducers.js';
import cadencesReducer from './cadences.reducers.js';
import * as apolloReducers from './apollo.reducers';
import authReducer from './auth.reducers';
import usersReducer from './users.reducers.js';
import pendingCallsCountReduer from './pendingcallscount.reducer';
import todoCountReducer from './todocount.reducer';

export default combineReducers({
  settings: settingsReducer,
  theme: themesReducer,
  customer: customerReducers,
  auth: authReducer,
  accounts: accountReducers,
  tags: tagsReducer,
  cadences: cadencesReducer,
  users: usersReducer,
  pendingCallsCount: pendingCallsCountReduer,
  todoCount: todoCountReducer,
  ...apolloReducers,
});
