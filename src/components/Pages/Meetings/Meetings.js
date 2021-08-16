/* eslint-disable @typescript-eslint/camelcase */
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';
import { Alert, Card, CardBody, CardHeader } from 'reactstrap';
import { ContentWrapper } from '@nextaction/components';
import Calendar from '../../Common/Calendar';
import PageHeader from '../../Common/PageHeader';
import PopupForm from '../../Common/Calendar/PopupForm';
import {
  showErrorMessage,
  PLEASE_CONTACT_CONNECTLEADER_SUPPORT,
} from '../../../../src/util';
import UserContext from '../../UserContext';
import 'dhtmlx-scheduler/codebase/ext/dhtmlxscheduler_limit.js';
import {
  FETCH_BLOCKED_EVENTS,
  FETCH_BOOKED_EVENTS,
  FETCH_CALENDAR_SETTINGS,
} from '../../queries/MeetingsQuery';
import { FETCH_EMAIL_ACCOUNT_QUERY } from '../../queries/SettingsQuery';

toast.configure();

const scheduler = window.scheduler;

const Meetings = () => {
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const userFilter = `filter[user][id]=${currentUserId}`;

  const initialStart = scheduler.getState().min_date;
  const initialEnd = scheduler.getState().max_date;
  const [startCalendar, setStartCalendar] = useState('');
  const [endCalendar, setEndCalendar] = useState('');
  const [value, setValue] = useState(0);
  const [emailAccount, setEmailAccount] = useState(false);
  const [isNewEmail, setIsNewEmail] = useState(false);
  const handleForceLoad = () => {
    setValue(value + 1);
  };

  const { data: emailAccountData, error: accountError } = useQuery(
    FETCH_EMAIL_ACCOUNT_QUERY,
    {
      onCompleted: (data) => {
        emailAccountData &&
          data &&
          data.Email &&
          data.Email.data &&
          data.Email.data[0] &&
          data.Email.data[0].email &&
          data.Email.data[0].verified &&
          setEmailAccount(true);
      },
      variables: { emailFilter: userFilter },
    }
  );

  const { data: blockedData } = useQuery(FETCH_BLOCKED_EVENTS, {
    variables: {
      startDate: startCalendar
        ? moment(startCalendar).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
        : moment(initialStart).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
      endDate: endCalendar
        ? moment(endCalendar).format('YYYY-MM-DD[T]HH:mm:ss[Z]')
        : moment(initialEnd).format('YYYY-MM-DD[T]HH:mm:ss[Z]'),
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load the blocked events',
        blockedData,
        'blocked_failed'
      );
    },
    skip: emailAccount === false || isNewEmail === false,
  });

  const { data: bookedData, refetch: refreshCalendar } = useQuery(
    FETCH_BOOKED_EVENTS,
    {
      onCompleted: (data) => {
        data && scheduler.updateView();
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to load the booked events.',
          bookedData,
          'blocked_failed'
        );
      },
      skip: emailAccount === false || isNewEmail === false,
    }
  );

  const { data: settingsData, error: settingsError } = useQuery(
    FETCH_CALENDAR_SETTINGS,
    {
      onCompleted: (data) => {
        data &&
          data.calendarSetting &&
          data.calendarSetting.data &&
          data.calendarSetting.data[0] &&
          data.calendarSetting.data[0].isEmailIdVerified &&
          setIsNewEmail(true);
      },
      skip: emailAccount === false,
    }
  );

  const bookedEventsData =
    bookedData && bookedData.booked && bookedData.booked.data
      ? bookedData.booked.data
      : [];
  const bookedEventsFiltered =
    bookedData &&
    bookedEventsData &&
    bookedEventsData.map((item) => {
      const sDateFormat = moment
        .utc(item.startDate)
        .local()
        .format('YYYY-MM-DD[ ]HH:mm:ss');
      const eDateFormat = moment
        .utc(item.endDate)
        .local()
        .format('YYYY-MM-DD[ ]HH:mm:ss');

      return {
        start_date: sDateFormat,
        end_date: eDateFormat,
        id: item.id,
        location: item.location,
        description: item.description,
        text: item.title,
        prospects: item.chooseRecipients,
      };
    });

  const bookedCompare =
    bookedData &&
    bookedData.booked &&
    bookedData.booked.data &&
    bookedData.booked.data.map((item) => {
      return {
        startDate: moment(item.startDate).format('YYYY-MM-DD[ ]HH:mm:ss'),
        endDate: moment(item.endDate).format('YYYY-MM-DD[ ]HH:mm:ss'),
      };
    });

  const blockedDates =
    bookedData &&
    bookedData.booked &&
    bookedData.booked.data &&
    bookedEventsFiltered &&
    bookedCompare &&
    blockedData &&
    blockedData.blockedEvents &&
    blockedData.blockedEvents.data;

  const blockedDatesFiltered = [];

  if (
    bookedData &&
    bookedData.booked &&
    bookedData.booked.data &&
    bookedEventsFiltered &&
    bookedCompare &&
    blockedData &&
    blockedData.blockedEvents &&
    blockedData.blockedEvents.data &&
    bookedData &&
    bookedData.booked &&
    bookedData.booked.data &&
    bookedEventsFiltered &&
    blockedDates &&
    bookedCompare
  ) {
    for (let i = 0, len = blockedDates.length; i < len; i++) {
      let conflictCheck = false;
      for (let j = 0, len = bookedCompare.length; j < len; j++) {
        if (
          moment(blockedDates[i].startDate) <
            moment(bookedCompare[j].endDate) &&
          moment(blockedDates[i].endDate) > moment(bookedCompare[j].startDate)
        ) {
          conflictCheck = true;
        }
      }
      if (!conflictCheck) {
        blockedDatesFiltered.push(blockedDates[i]);
      }
    }
  }

  const blockedDataFilteredLocal =
    blockedData &&
    blockedData.blockedEvents &&
    blockedData.blockedEvents.data &&
    bookedData &&
    bookedData.booked &&
    bookedData.booked.data &&
    bookedEventsFiltered &&
    blockedDatesFiltered &&
    blockedDatesFiltered.map((item) => {
      return {
        startDate: moment
          .utc(item.startDate)
          .local()
          .format('YYYY-MM-DD[ ]HH:mm:ss'),
        endDate: moment
          .utc(item.endDate)
          .local()
          .format('YYYY-MM-DD[ ]HH:mm:ss'),
      };
    });

  blockedData &&
    blockedData.blockedEvents &&
    blockedData.blockedEvents.data &&
    blockedDatesFiltered &&
    blockedDataFilteredLocal &&
    blockedDataFilteredLocal.forEach((item) => {
      const blockYear = new Date(item.startDate).getFullYear();
      const blockMonth = new Date(item.startDate).getMonth();
      const blockDate = new Date(item.startDate).getDate();
      const blockHourStart = new Date(item.startDate).getHours();
      const blockHourEnd = new Date(item.endDate).getHours();
      const blockMinStart = new Date(item.startDate).getMinutes();
      const blockMinEnd = new Date(item.endDate).getMinutes();
      scheduler.addMarkedTimespan({
        start_date: new Date(
          blockYear,
          blockMonth,
          blockDate,
          blockHourStart,
          blockMinStart
        ),
        end_date: new Date(
          blockYear,
          blockMonth,
          blockDate,
          blockHourEnd,
          blockMinEnd
        ),
        type: 'dhx_time_block',
        css: 'red_section', // the name of applied CSS class
      });
      scheduler.updateView();
    });

  useEffect(() => {
    scheduler.attachEvent('onViewChange', () => {
      setStartCalendar(scheduler.getState().min_date);
      setEndCalendar(scheduler.getState().max_date);
    });
  }, []);

  //Static dates will be removed once runtime caendar date access has been implemented.

  scheduler.clearAll();
  scheduler.parse(bookedEventsFiltered);

  return (
    <ContentWrapper>
      <PageHeader icon="far fa-calendar-alt" pageName="Meetings"></PageHeader>
      <PopupForm
        handleLoad={() => refreshCalendar()}
        handleForceLoad={handleForceLoad}
      />
      <Card className="ba">
        <CardHeader>Booked Schedules</CardHeader>
        <CardBody className="bt">
          <div>
            <div className="scheduler-container" style={{ height: '1150px' }}>
              {(accountError && (
                <Alert color="danger" className="text-center">
                  <i class="fa mr-2 fa fa-exclamation-circle text-danger"></i>
                  Failed to load User Accounts details.{' '}
                  {PLEASE_CONTACT_CONNECTLEADER_SUPPORT}
                </Alert>
              )) ||
                (emailAccountData &&
                  emailAccountData.Email &&
                  emailAccountData.Email.data &&
                  emailAccountData.Email.data[0] &&
                  (!emailAccountData.Email.data[0].verified ||
                    !emailAccountData.Email.data[0].email) && (
                    <Alert color="danger" className="text-center">
                      <Link
                        className="text-danger"
                        to={{
                          pathname: '/settings/emailSettings',
                        }}
                      >
                        <i class="fa mr-2 fa fa-exclamation-circle text-danger"></i>
                        Please verify your email settings and then update your
                        calendar settings and then try again.
                      </Link>
                    </Alert>
                  )) ||
                (settingsData &&
                  settingsData.calendarSetting &&
                  settingsData.calendarSetting.data &&
                  settingsData.calendarSetting.data[0] &&
                  !settingsData.calendarSetting.data[0].isEmailIdVerified && (
                    <Alert color="danger" className="text-center">
                      <Link
                        className="text-danger"
                        to={{
                          pathname: '/settings/calendar',
                        }}
                      >
                        <i class="fa mr-2 fa fa-exclamation-circle text-danger"></i>
                        Please update your calendar settings and try again
                      </Link>
                    </Alert>
                  ))}
              {emailAccount &&
                !accountError &&
                !settingsError &&
                settingsData &&
                settingsData.calendarSetting &&
                settingsData.calendarSetting.data &&
                settingsData.calendarSetting.data[0] &&
                settingsData.calendarSetting.data[0].isEmailIdVerified && (
                  <Calendar
                    className="zindex-tooltip"
                    events={bookedEventsFiltered}
                    timeFormatState={true}
                    handleLoad={() => refreshCalendar()}
                  />
                )}
            </div>
          </div>
        </CardBody>
      </Card>
    </ContentWrapper>
  );
};
export default Meetings;
