import axios from 'axios';
export const GET_ALL_USERS = 'GET_ALL_USERS';
export const SET_ALL_USERS = 'SET_ALL_USERS';
export const RESET_ALL_USERS = 'RESET_ALL_USERS';

export const getUsers = (
  limit,
  offset = 0,
  userId,
  RESOURCE_SERVER_URL,
  token
) => {
  const requestData = {
    'page[limit]': limit,
    'page[offset]': offset,
    'filter[id]': userId,
    'sort[displayName]': 'asc',
  };

  return axios({
    url: 'users/assignedUsers',
    params: requestData,
  });
};

export const resetUsers = () => {
  return {
    type: RESET_ALL_USERS,
    payLoad: {
      fetchedAll: false,
      data: [],
    },
  };
};

export const getAllUsers = (userId, apiURL, token) => (dispatch) => {
  const limit = 20;
  let offset = 0;
  let usersData = {};

  dispatch({
    type: GET_ALL_USERS,
    payLoad: {
      loading: true,
    },
  });

  getUsers(limit, offset, userId, apiURL, token).then((response) => {
    usersData = { data: [...response.data.data] };

    const getUsersAboveLimit = async () => {
      while (response.data.paging.totalCount > limit * (offset + 1)) {
        ++offset;
        let error = false;
        await getUsers(limit, offset, userId, apiURL, token)
          // eslint-disable-next-line no-loop-func
          .then((response) => {
            usersData = { data: [...usersData.data, ...response.data.data] };
          })
          .catch((err) => {
            dispatch({
              type: GET_ALL_USERS,
              payLoad: {
                loading: false,
                error: true,
              },
            });
            error = true;
          });

        if (error) break;
      }
    };

    getUsersAboveLimit().then(() => {
      dispatch({
        type: SET_ALL_USERS,
        payLoad: {
          ...usersData,
          fetchedAll: true,
          loading: false,
        },
      });
    });
  });
};
