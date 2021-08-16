/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, { useContext, useState } from 'react';
import { Alert } from 'reactstrap';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import UserContext from '../UserContext';
import {
  FETCH_BANNER_NOTIFICATIONS,
  CANCEL_BANNER_NOTIFICATION,
} from '../queries/NotificationsQuery';
import { showErrorMessage } from '../../util/index';

const BannerNotification = () => {
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading || !user ? 0 : user.id;
  const [bannerList, setBannerList] = useState([]);
  const [bannerUniqueIds, setBannerUniqueIds] = useState({});
  // type of modules for banner notifications
  const modules = {
    email_account: [],
    email_signature: [],
    sync_service: [],
  };

  const {
    data: fetchBannerNotificationsData,
    loading: fetchBannerNotificationsLoading,
    error: fetchBannerNotificationsError,
    refetch: refetchBannerNotifications,
  } = useQuery(FETCH_BANNER_NOTIFICATIONS, {
    pollInterval: 120000,
    notifyOnNetworkStatusChange: true,
    variables: {
      userId: currentUserId,
      modules: `filter[module]=:[${[...Object.keys(modules)]}]`,
    },
    onCompleted: (response) => {
      setBannerList([]);
      createBannerNotificationsList(response);
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch banner notifications',
        fetchBannerNotificationsData,
        'fetch_banner_notifications'
      );
    },
  });

  const [cancelBannerNotification] = useLazyQuery(CANCEL_BANNER_NOTIFICATION, {
    onCompleted: (response) => {
      refetchBannerNotifications();
    },
  });

  const onDismiss = (bannerId) => {
    cancelBannerNotification({
      variables: { bannerId: bannerId, input: { isActive: false } },
    });
  };

  const createBannerNotificationsList = (response) => {
    // creating data for each module
    response.notifications.data.forEach((item) => {
      modules[item.module].push(item);
    });

    // creating list
    Object.keys(modules).forEach((item) => {
      if (item === 'sync_service' && modules[item].length > 0) {
        modules[item].forEach((subItem, index) => {
          // saving the first id as duplicated banner should not be shown. also the user can click close icon and banner should disappear in frontend.
          if (
            (index === 0 && !bannerUniqueIds[item]) ||
            (index === 0 && subItem['id'] === bannerUniqueIds[item])
          ) {
            setBannerUniqueIds((prevState) => {
              return {
                ...prevState,
                [item]: subItem['id'],
              };
            });

            const bannerItem = (
              <Alert
                isOpen={true}
                color="warning"
                className="rounded-0"
                key={subItem['id'] + '_' + index}
              >
                <div className="float-right">
                  <i
                    className="fas fa-times-circle pointer text-right text-dark"
                    onClick={(e) => {
                      onDismiss(subItem['id']);
                    }}
                  ></i>
                </div>
                <div className="d-flex justify-content-center text-dark">
                  {subItem['issueNotificationInformation']}
                </div>
              </Alert>
            );
            // only showing one instance of the notification, as there can be multiple instances of the notification
            setBannerList((prevState) => {
              return [...prevState, bannerItem];
            });
          }
        });
      }
    });
  };

  return (
    !fetchBannerNotificationsLoading &&
    !fetchBannerNotificationsError &&
    bannerList
  );
};

export default BannerNotification;
