/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */

import axios from 'axios';
export const GET_TODO_COUNT = 'GET_TODO_COUNT';
export const SET_TODO_COUNT = 'SET_TODO_COUNT';
export const RESET_TODO_COUNT = 'RESET_TODO_COUNT';

export const resetToDoCount = () => {
  return {
    type: RESET_TODO_COUNT,
    payLoad: {
      fetched: false,
      data: 0,
    },
  };
};

export const getToDoCount = (userId, RESOURCE_SERVER_URL, token) => (
  dispatch
) => {
  dispatch({
    type: GET_TODO_COUNT,
    payLoad: {
      loading: true,
    },
  });

  axios({
    url: `prospects/list?page[limit]=1&filter[user][id]=${userId}&filter[currentTouchStatus]=SCHEDULED&filter[optoutFlag]=false&filter[touch][type]=${encodeURIComponent(
      ':[EMAIL,OTHERS,LINKEDIN,TEXT]'
    )}`,
  })
    .then((response) => {
      dispatch({
        type: SET_TODO_COUNT,
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
      dispatch({
        type: SET_TODO_COUNT,
        payLoad: {
          loading: false,
          fetched: false,
          error: true,
          data: 0,
        },
      });
    });
};
