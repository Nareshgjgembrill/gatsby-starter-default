/*
 * @author @rManimegalai
 * @version V11.0
 */
import React, { useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from 'reactstrap';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';
import UserContext from '../UserContext';
import { FETCH_EMAIL_ACCOUNT_QUERY } from '../queries/SettingsQuery';

const EmailVerificationAlert = () => {
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading || !user ? 0 : user.id;
  const userFilter = `filter[user][id]=${currentUserId}`;
  const [verified, setVerified] = useState(false);
  const [perDayLimitCrossed, setPerDayLimitCrossed] = useState(false);
  const [isDisable, setIsDisable] = useState(false);
  const [disabledEndDate, setDisabledEndDate] = useState(null);
  const hoursRef = useRef(0);
  const minuteRef = useRef(0);
  const onDismiss = () => {
    setVerified(false);
    setPerDayLimitCrossed(false);
    setIsDisable(false);
  };
  const { loading: emailLoading } = useQuery(FETCH_EMAIL_ACCOUNT_QUERY, {
    variables: { emailFilter: userFilter },
    onCompleted: (response) => getEmailVerifiedAndGovernData(response),
    onError: () => {
      setVerified(false);
      setPerDayLimitCrossed(false);
    },
  });
  const getEmailVerifiedAndGovernData = (response) => {
    let formattedEndDate;
    if (response?.Email?.data?.length > 0) {
      setVerified(!response?.Email?.data[0]?.verified);
      if (response?.Email?.data[0]?.outOfOfficeEndDate !== null) {
        const startDate = response?.Email?.data[0]?.outOfOfficeStartDate;
        const endDate = response?.Email?.data[0]?.outOfOfficeEndDate;
        formattedEndDate = moment(
          response?.Email?.data[0]?.outOfOfficeEndDate,
          'YYYY-MM-DD HH:mm Z'
        ).format('M/D/YYYY');

        const currentDateTime = new Date();
        const isToday = moment(startDate).isSame(currentDateTime);
        const range = moment(currentDateTime).isBetween(startDate, endDate);
        if (isToday || range) {
          setIsDisable(true);
        }
      } else {
        setIsDisable(false);
      }

      setDisabledEndDate(formattedEndDate);
      setPerDayLimitCrossed(
        response.Email.data[0].emailPerdayLimitCrossedDatetime && true
      );
      if (response?.Email?.data[0]?.emailPerdayLimitCrossedDatetime !== null) {
        const dateTime = response.Email.data[0].emailPerdayLimitCrossedDatetime.split(
          'T'
        )[1];
        hoursRef.current = dateTime.split(':')[0];
        minuteRef.current = dateTime.split(':')[1];
      }
    } else {
      setVerified(true);
    }
  };

  return (
    <Alert
      isOpen={verified || perDayLimitCrossed || isDisable}
      color="warning"
      className="rounded-0"
    >
      {!emailLoading && (
        <>
          <div className="float-right">
            <i
              className="fas fa-times-circle pointer text-right text-dark"
              onClick={onDismiss}
            ></i>
          </div>
          {perDayLimitCrossed && (
            <div className="d-flex justify-content-center text-dark">
              {'You have exceeded the last 24-hour email sending limit. You will be eligible to send the next email in ' +
                (hoursRef.current > 0 && hoursRef.current) +
                ' hours and ' +
                (minuteRef.current > 0 && minuteRef.current) +
                ' minutes'}
            </div>
          )}
          {verified && (
            <Link
              className="d-flex justify-content-center text-dark"
              to={{
                pathname: '/settings/emailSettings',
              }}
            >
              Your email account is invalid. Please click here to update your
              information.
            </Link>
          )}
          {!verified && isDisable && disabledEndDate !== null && (
            <Link
              className="d-flex justify-content-center text-dark"
              to={{
                pathname: '/settings/emailSettings',
              }}
            >
              {`Your email account has been disabled and emails will resume after
                ${disabledEndDate}`}
            </Link>
          )}
        </>
      )}
    </Alert>
  );
};

export default EmailVerificationAlert;
