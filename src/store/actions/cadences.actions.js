import axios from 'axios';
export const GET_ALL_CADENCES = 'GET_ALL_CADENCES';
export const SET_ALL_CADENCES = 'SET_ALL_CADENCES';
export const GET_ALL_CADENCES_ALL_USERS = 'GET_ALL_CADENCES_ALL_USERS';
export const SET_ALL_CADENCES_ALL_USERS = 'SET_ALL_CADENCES_ALL_USERS';
export const RESET_ALL_CADENCES = 'RESET_ALL_CADENCES';

export const getCadences = (
  limit = 25,
  offset = 0,
  userId,
  RESOURCE_SERVER_URL,
  token
) => {
  const requestData = {
    'page[limit]': limit,
    'page[offset]': offset,
    'filter[user][id]': userId,
    'sort[name]': 'asc',
    'filter[shared]': true,
  };

  return axios({
    url: 'cadences',
    params: requestData,
  });
};

export const resetCadences = () => {
  return {
    type: RESET_ALL_CADENCES,
    payLoad: {
      fetchedAll: false,
      loading: false,
      error: false,
      data: [],
    },
  };
};

export const getAllCadences = (userId, apiURL, token) => (dispatch) => {
  const limit = 200;
  let offset = 0;
  let cadencesData = {};

  dispatch({
    type: GET_ALL_CADENCES,
    payLoad: {
      loading: true,
    },
  });

  getCadences(limit, offset, userId, apiURL, token).then((response) => {
    cadencesData = { data: [...response.data.data] };

    const getCadencesAboveLimit = async () => {
      while (response.data.paging.totalCount > limit * (offset + 1)) {
        ++offset;
        let error = false;
        await getCadences(limit, offset, userId, apiURL, token)
          // eslint-disable-next-line no-loop-func
          .then((response) => {
            cadencesData = {
              data: [...cadencesData.data, ...response.data.data],
            };
          })
          .catch((err) => {
            dispatch({
              type: GET_ALL_CADENCES,
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

    getCadencesAboveLimit().then(() => {
      dispatch({
        type: SET_ALL_CADENCES,
        payLoad: {
          ...cadencesData,
          fetchedAll: true,
          loading: false,
        },
      });
    });
  });
};

export const getAllCadencesAllUsers = (userId, apiURL, token) => (dispatch) => {
  const limit = 200;
  let offset = 0;
  let cadencesData = {};

  dispatch({
    type: GET_ALL_CADENCES_ALL_USERS,
    payLoad: {
      loadingUsers: true,
    },
  });

  getCadences(limit, offset, userId, apiURL, token).then((response) => {
    cadencesData = { dataAllUsers: [...response.data.data] };

    const getCadencesAboveLimit = async () => {
      while (response.data.paging.totalCount > limit * (offset + 1)) {
        ++offset;
        let error = false;
        await getCadences(limit, offset, userId, apiURL, token)
          // eslint-disable-next-line no-loop-func
          .then((response) => {
            cadencesData = {
              dataAllUsers: [
                ...cadencesData.dataAllUsers,
                ...response.data.data,
              ],
            };
          })
          .catch((err) => {
            dispatch({
              type: GET_ALL_CADENCES_ALL_USERS,
              payLoad: {
                loadingUsers: false,
                errorUsers: true,
              },
            });
            error = true;
          });

        if (error) break;
      }
    };

    getCadencesAboveLimit().then(() => {
      dispatch({
        type: SET_ALL_CADENCES_ALL_USERS,
        payLoad: {
          ...cadencesData,
          fetchedAllUsers: true,
          loadingUsers: false,
        },
      });
    });
  });
};
