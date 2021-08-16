/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 * @description Custom hook created by rajesh to get the total pending calls count of the logined user
 */

import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { FETCH_PENDING_CALL_TOTAL_COUNT_QUERY } from '../components/queries/PendingCallsQuery';

function usePendingCallsCount(userId) {
  const [pendingCallsCount, setPendingCallsCount] = useState(0);
  const responseHandler = (response, success) => {
    setPendingCallsCount(success ? response.total.paging.totalCount : 0);
    setTimeout(() => {
      fetchPendingCallsData({
        variables: {
          userFilter: `&filter[user][id]=${userId}`,
        },
      });
    }, [20000]);
  };

  const [fetchPendingCallsData] = useLazyQuery(
    FETCH_PENDING_CALL_TOTAL_COUNT_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) => {
        responseHandler(response, true);
      },
      onError: () => {
        responseHandler(null, false);
      },
    }
  );

  useEffect(() => {
    fetchPendingCallsData({
      variables: {
        userFilter: `&filter[user][id]=${userId}`,
      },
    });
    // eslint-disable-next-line
  }, []);

  return { pendingCallsCount };
}
export default usePendingCallsCount;
