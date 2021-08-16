/**
 * @author @rkrishna-gembrill
 * @version V11.0
 */
import axios from 'axios';
export const GET_ALL_TAGS = 'GET_ALL_TAGS';
export const SET_ALL_TAGS = 'SET_ALL_TAGS';
export const RESET_ALL_TAGS = 'RESET_ALL_TAGS';

export const getTags = (
  limit = 200,
  offset = 0,
  userId,
  RESOURCE_SERVER_URL,
  token
) => {
  const requestData = {
    'page[limit]': limit,
    'page[offset]': offset,
    'filter[user][id]': userId,
    'sort[name]': 'ASC',
  };

  return axios({
    url: 'tags',
    params: requestData,
  });
};

export const resetTags = () => {
  return {
    type: RESET_ALL_TAGS,
    payLoad: {
      fetchedAll: false,
      data: [],
    },
  };
};

export const getAllTags = (userId, apiURL, token) => (dispatch) => {
  const limit = 25;
  let offset = 0;
  let tagsData = {};

  dispatch({
    type: GET_ALL_TAGS,
    payLoad: {
      loading: true,
    },
  });

  getTags(limit, offset, userId, apiURL, token).then((response) => {
    tagsData = { data: [...response.data.data] };

    const getTagsAboveLimit = async () => {
      while (response.data.paging.totalCount > limit * (offset + 1)) {
        ++offset;
        let error = false;
        await getTags(limit, offset, userId, apiURL, token)
          // eslint-disable-next-line no-loop-func
          .then((response) => {
            tagsData = { data: [...tagsData.data, ...response.data.data] };
          })
          .catch((err) => {
            dispatch({
              type: GET_ALL_TAGS,
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

    getTagsAboveLimit().then(() => {
      dispatch({
        type: SET_ALL_TAGS,
        payLoad: {
          ...tagsData,
          fetchedAll: true,
          loading: false,
          error: false,
        },
      });
    });
  });
};
