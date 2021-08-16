import React, { useEffect, useState } from 'react';
import { Alert } from 'reactstrap';
import moment from 'moment';
import useConfigurations from '../Common/hooks/UseConfigurations';

const SystemSettingsBanner = () => {
  const [alertStatus, setAlertStatus] = useState(false);
  const onDismiss = () => setAlertStatus(false);

  const {
    data: configurationsData,
    error: configurationsError,
  } = useConfigurations();

  const { message, start_date: startDate, end_date: endDate } =
    (!configurationsError &&
      configurationsData?.configurations?.data[0]?.bannerMessage) ||
    {};

  const startDateLocal = moment(startDate).format('YYYY-MM-DD');
  const endDateLocal = moment(endDate).format('YYYY-MM-DD');

  const currentDate = moment().format('YYYY-MM-DD');

  useEffect(() => {
    if (
      startDate &&
      startDateLocal &&
      endDate &&
      endDateLocal &&
      message &&
      (moment(currentDate).isBetween(startDateLocal, endDateLocal) ||
        moment(currentDate).isSame(startDateLocal) ||
        moment(currentDate).isSame(endDateLocal))
    ) {
      setAlertStatus(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDateLocal, endDateLocal, currentDate, message]);

  return (
    <Alert
      color="info"
      isOpen={alertStatus}
      toggle={onDismiss}
      className="text-center"
    >
      <i className="fas fa-exclamation-circle mr-2"></i>
      {message}
    </Alert>
  );
};

export default SystemSettingsBanner;
