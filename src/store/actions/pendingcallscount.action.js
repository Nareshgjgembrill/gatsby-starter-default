/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */

import axios from 'axios';

export const GET_PENDINGCALLS_COUNT = 'GET_PENDINGCALLS_COUNT';
export const SET_PENDINGCALLS_COUNT = 'SET_PENDINGCALLS_COUNT';
export const RESET_PENDINGCALLS_COUNT = 'RESET_PENDINGCALLS_COUNT';

export const resetPendingCallsCount = () => {
  return {
    type: RESET_PENDINGCALLS_COUNT,
    payLoad: {
      fetched: false,
      data: 0,
    },
  };
};

export const getPendingCallsCount = (userId, RESOURCE_SERVER_URL, token) => (
  dispatch
) => {
  dispatch({
    type: GET_PENDINGCALLS_COUNT,
    payLoad: {
      loading: true,
      error: false,
    },
  });

  axios({
    url: `calls/prospects?page[limit]=1&filter[user][id]=${userId}&filter[currentTouchStatus]=SCHEDULED&filter[callTouch][type]=CALL&filter[prospectTask][dueDate]=CURRENTDUE`,
  })
    .then((response) => {
      dispatch({
        type: SET_PENDINGCALLS_COUNT,
        payLoad: {
          loading: false,
          fetched: true,
          data:
            (response.data &&
              response.data.paging &&
              response.data.paging.totalCount &&
              response.data.paging.totalCount) ||
            0,
        },
      });
    })
    .catch(() => {
      getPendingCallsCount(userId);
      dispatch({
        type: SET_PENDINGCALLS_COUNT,
        payLoad: {
          loading: false,
          fetched: false,
          error: true,
          data: 0,
        },
      });
    });
};
