/**
 * @author @rkrishna-gembrill
 * @version V11.0
 */
import axios from 'axios';
export const CREATE_PROSPECT = 'CREATE_PROSPECT';
export const GET_ALL_PROSPECTS = 'GET_ALL_PROSPECTS';
export const SET_ALL_PROSPECTS = 'SET_ALL_PROSPECTS';

export const getProspects = (
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
  };

  return axios({
    url: 'prospects',
    params: requestData,
  });
};

export const getAllProspects = (userId, apiURL, token) => (dispatch) => {
  const limit = 20;
  let offset = 0;
  let prospectsData = {};

  getProspects(limit, offset, userId, apiURL, token).then((response) => {
    prospectsData = { data: [...response.data.data] };

    const getProspectsAboveLimit = async () => {
      while (response.data.paging.totalCount > limit * (offset + 1)) {
        ++offset;

        await getProspects(limit, offset, userId, apiURL, token)
          // eslint-disable-next-line no-loop-func
          .then((response) => {
            prospectsData = {
              data: [...prospectsData.data, ...response.data.data],
            };
          })
          .catch((error) => {
            console.log(error);
          });
      }
    };

    getProspectsAboveLimit().then(() => {
      dispatch({
        type: SET_ALL_PROSPECTS,
        payLoad: {
          ...prospectsData,
          fetchedAll: true,
        },
      });
    });
  });
};
