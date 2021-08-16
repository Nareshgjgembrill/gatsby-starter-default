import axios from 'axios';
export const GET_ALL_ACCOUNTS = 'GET_ALL_ACCOUNTS';
export const SET_ALL_ACCOUNTS = 'SET_ALL_ACCOUNTS';
export const RESET_ALL_ACCOUNTS = 'RESET_ALL_ACCOUNTS';

export const getAccounts = (
  limit = 500,
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
  };

  return axios({
    url: 'accounts',
    params: requestData,
  });
};

export const resetAccounts = () => {
  return {
    type: RESET_ALL_ACCOUNTS,
    payLoad: {
      fetchedAll: false,
      data: [],
    },
  };
};

const setAccounts = (dispatch, data) => {
  dispatch({
    type: SET_ALL_ACCOUNTS,
    payLoad: {
      ...data,
      fetchedAll: true,
      loading: false,
    },
  });
};

export const getAllAccounts = (userId, apiURL, token) => (dispatch) => {
  const limit = 500;
  let offset = 0;
  let accountsData = {};

  dispatch({
    type: GET_ALL_ACCOUNTS,
    payLoad: {
      loading: true,
    },
  });

  getAccounts(limit, offset, userId, apiURL, token).then((response) => {
    accountsData = { data: [...response.data.data] };

    setAccounts(dispatch, accountsData);
    const getAccountsAboveLimit = async () => {
      while (response.data.paging.totalCount > limit * (offset + 1)) {
        ++offset;

        await getAccounts(limit, offset, userId, apiURL, token)
          // eslint-disable-next-line no-loop-func
          .then((response) => {
            accountsData = {
              data: [...accountsData.data, ...response.data.data],
            };
            setAccounts(dispatch, accountsData);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };

    getAccountsAboveLimit();
  });
};
