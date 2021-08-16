import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  CustomInput,
  Form,
  FormGroup,
  Label,
  Input,
  InputGroup,
  Row,
} from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import { FormValidator } from '@nextaction/components';
import Button from '../../Common/Button';
import DropDown from '../../Common/DropDown';
import UserContext from '../../UserContext';
import {
  SAVE_CALENDAR_SETTINGS,
  FETCH_CALENDAR_SETTINGS,
} from '../../queries/MeetingsQuery';
import { FETCH_EMAIL_ACCOUNT_QUERY } from '../../queries/SettingsQuery';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const TimeSlotsDropDown = () => {
  return (
    <>
      <option></option>
      <option value="00:00">12:00 AM</option>
      <option value="01:00">1:00 AM</option>
      <option value="02:00">2:00 AM</option>
      <option value="03:00">3:00 AM</option>
      <option value="04:00">4:00 AM</option>
      <option value="05:00">5:00 AM</option>
      <option value="06:00">6:00 AM</option>
      <option value="07:00">7:00 AM</option>
      <option value="08:00">8:00 AM</option>
      <option value="09:00">9:00 AM</option>
      <option value="10:00">10:00 AM</option>
      <option value="11:00">11:00 AM</option>
      <option value="12:00">12:00 PM</option>
      <option value="13:00">1:00 PM</option>
      <option value="14:00">2:00 PM</option>
      <option value="15:00">3:00 PM</option>
      <option value="16:00">4:00 PM</option>
      <option value="17:00">5:00 PM</option>
      <option value="18:00">6:00 PM</option>
      <option value="19:00">7:00 PM</option>
      <option value="20:00">8:00 PM</option>
      <option value="21:00">9:00 PM</option>
      <option value="22:00">10:00 PM</option>
      <option value="23:00">11:00 PM</option>
    </>
  );
};

const CalendarSetting = () => {
  const upAngle = 'fas fa-angle-double-up fa-lg text-primary mx-2';
  const downAngle = 'fas fa-angle-double-down fa-lg text-primary mx-2';

  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const userFilter = `filter[user][id]=${currentUserId}`;

  const [showGeneral, setShowGeneral] = useState(true);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [formCalendar, setFormCalendar] = useState();
  const [calendarType, setCalendarType] = useState('Default Type');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingLinkDuration, setMeetingLinkDuration] = useState();
  const [meetingSlotDuration, setMeetingSlotDuration] = useState();
  const [meetingLocation, setMeetingLocation] = useState();
  const [meetingDescription, setMeetingDescription] = useState();
  const [includeWeekEnd, setIncludeWeekEnd] = useState(false);
  const [mondayData, setMondayData] = useState([]);
  const [tuesdayData, setTuesdayData] = useState([]);
  const [wednesdayData, setWednesdayData] = useState([]);
  const [thursdayData, setThursdayData] = useState([]);
  const [fridayData, setFridayData] = useState([]);
  const [saturdayData, setSaturdayData] = useState([]);
  const [sundayData, setSundayData] = useState([]);
  const [selectMonday, setSelectMonday] = useState(false);
  const [selectTuesday, setSelectTuesday] = useState(false);
  const [selectWednesday, setSelectWednesday] = useState(false);
  const [selectThursday, setSelectThursday] = useState(false);
  const [selectFriday, setSelectFriday] = useState(false);
  const [selectSaturday, setSelectSaturday] = useState(false);
  const [selectSunday, setSelectSunday] = useState(false);
  const [includeMeetingInvite, setIncludeMeetingInvite] = useState(false);
  const [allowOthersInclude, setAllowOthersInclude] = useState(false);
  const [isPriorNotice, setIsPriorNotice] = useState(false);
  const [priorNoticeTime, setPriorNoticeTime] = useState(0);
  const [priorNoticeTimeUnit, setPriorNoticeTimeUnit] = useState('Ho');
  const [isAdvanceBooking, setIsAdvanceBooking] = useState(false);
  const [advanceBookingTime, setAdvanceBookingTime] = useState(0);
  const [advanceBookingTimeUnit, setAdvanceBookingTimeUnit] = useState('Ho');
  const [isBufferMeeting, setIsBufferMeeting] = useState(false);
  const [bufferTime, setBufferTime] = useState(0);
  const [bufferTimeUnit, setBufferTimeUnit] = useState('Mi');
  const [userBookWithProspects, setUserBookWithProspects] = useState(false);
  const [prospectsBookWithUser, setProspectsBookWithUser] = useState(false);
  const [noActionReq, setNoActionReq] = useState(false);
  const [saveButtonClicked, setSaveButtonClicked] = useState(false);
  const [enableCalendar, setEnableCalendar] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const monDay = [];
  const tuesDay = [];
  const wednesDay = [];
  const thursDay = [];
  const friDay = [];
  const saturDay = [];
  const sunDay = [];

  const formRef = useRef();
  const calendarRef = useRef();

  const { data: emailAccountData, error: accountError } = useQuery(
    FETCH_EMAIL_ACCOUNT_QUERY,
    {
      variables: { emailFilter: userFilter },
      onCompleted: (data) => {
        data &&
          data.Email &&
          data.Email.data &&
          data.Email.data[0] &&
          data.Email.data[0].email &&
          data.Email.data[0].verified &&
          setIsAccountVerified(true);
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to fetch email accounts',
          emailAccountData,
          'fetch_email_accounts'
        );
      },
    }
  );

  const {
    data: settingsData,
    error: settingsError,
    refetch: refreshSettingsData,
  } = useQuery(FETCH_CALENDAR_SETTINGS, {
    errorPolicy: 'all',
    onCompleted: (data) =>
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      handleInitialValues(data),
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch calender settings',
        settingsData,
        'fetch_calender_settings'
      );
    },
    skip: isAccountVerified === false,
  });

  const handleInitialValues = (data) => {
    setEnableCalendar(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].isEmailIdVerified !== null
        ? data.calendarSetting.data[0].isEmailIdVerified
        : false
    );
    setCalendarType(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0] &&
        data.calendarSetting.data[0].calendarType
        ? data.calendarSetting.data[0].calendarType
        : 'Default Type'
    );
    setMeetingLink(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].meetingLink
        ? data.calendarSetting.data[0].meetingLink
        : ''
    );
    setMeetingLinkDuration(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].meetingLinkDuration
        ? data.calendarSetting.data[0].meetingLinkDuration
        : ''
    );
    setMeetingSlotDuration(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].meetingSlotDuration
        ? data.calendarSetting.data[0].meetingSlotDuration
        : ''
    );
    setMeetingLocation(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].meetingLocation
        ? data.calendarSetting.data[0].meetingLocation
        : ''
    );
    setMeetingDescription(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].meetingDescription
        ? data.calendarSetting.data[0].meetingDescription
        : ''
    );
    setIncludeWeekEnd(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].includeWeekend
        ? data.calendarSetting.data[0].includeWeekend
        : false
    );
    setMondayData(
      data && data.calendarSetting && data.calendarSetting.data
        ? data.calendarSetting.data[0].meetingAvailablity.filter(
            (item) => item.weekDay === 1
          )
        : []
    );
    setTuesdayData(
      data && data.calendarSetting && data.calendarSetting.data
        ? data.calendarSetting.data[0].meetingAvailablity.filter(
            (item) => item.weekDay === 2
          )
        : []
    );
    setWednesdayData(
      data && data.calendarSetting && data.calendarSetting.data
        ? data.calendarSetting.data[0].meetingAvailablity.filter(
            (item) => item.weekDay === 3
          )
        : []
    );
    setThursdayData(
      data && data.calendarSetting && data.calendarSetting.data
        ? data.calendarSetting.data[0].meetingAvailablity.filter(
            (item) => item.weekDay === 4
          )
        : []
    );
    setFridayData(
      data && data.calendarSetting && data.calendarSetting.data
        ? data.calendarSetting.data[0].meetingAvailablity.filter(
            (item) => item.weekDay === 5
          )
        : []
    );
    setSaturdayData(
      data && data.calendarSetting && data.calendarSetting.data
        ? data.calendarSetting.data[0].meetingAvailablity.filter(
            (item) => item.weekDay === 6
          )
        : []
    );
    setSundayData(
      data && data.calendarSetting && data.calendarSetting.data
        ? data.calendarSetting.data[0].meetingAvailablity.filter(
            (item) => item.weekDay === 0
          )
        : []
    );
    if (
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      data.calendarSetting.data[0].meetingAvailablity.find(
        (item) => item.weekDay === 1
      )
    ) {
      setSelectMonday(true);
    }
    if (
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      data.calendarSetting.data[0].meetingAvailablity.find(
        (item) => item.weekDay === 2
      )
    ) {
      setSelectTuesday(true);
    }
    if (
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      data.calendarSetting.data[0].meetingAvailablity.find(
        (item) => item.weekDay === 3
      )
    ) {
      setSelectWednesday(true);
    }
    if (
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      data.calendarSetting.data[0].meetingAvailablity.find(
        (item) => item.weekDay === 4
      )
    ) {
      setSelectThursday(true);
    }
    if (
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      data.calendarSetting.data[0].meetingAvailablity.find(
        (item) => item.weekDay === 5
      )
    ) {
      setSelectFriday(true);
    }
    if (
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      data.calendarSetting.data[0].meetingAvailablity.find(
        (item) => item.weekDay === 6
      )
    ) {
      setSelectSaturday(true);
    }
    if (
      data &&
      data.calendarSetting &&
      data.calendarSetting.data &&
      data.calendarSetting.data[0].meetingAvailablity.find(
        (item) => item.weekDay === 0
      )
    ) {
      setSelectSunday(true);
    }
    setIncludeMeetingInvite(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].includeRescheduleInMeetingInvite !==
          null &&
        data.calendarSetting.data[0].includeRescheduleInMeetingInvite !==
          undefined
        ? data.calendarSetting.data[0].includeRescheduleInMeetingInvite
        : false
    );
    setAllowOthersInclude(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].allowOthersToIincludeYou !== null &&
        data.calendarSetting.data[0].allowOthersToIincludeYou !== undefined
        ? data.calendarSetting.data[0].allowOthersToIincludeYou
        : false
    );
    setIsPriorNotice(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].isPriorNoticeNeeded !== null &&
        data.calendarSetting.data[0].isPriorNoticeNeeded !== undefined
        ? data.calendarSetting.data[0].isPriorNoticeNeeded
        : false
    );
    setPriorNoticeTime(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].priorNoticeTimeInterval !== null &&
        data.calendarSetting.data[0].priorNoticeTimeInterval !== undefined
        ? data.calendarSetting.data[0].priorNoticeTimeInterval
        : 0
    );
    setPriorNoticeTimeUnit(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].priorNoticeTimeIntervalUnit !== null &&
        data.calendarSetting.data[0].priorNoticeTimeIntervalUnit !== undefined
        ? data.calendarSetting.data[0].priorNoticeTimeIntervalUnit
        : 'Ho'
    );
    setIsAdvanceBooking(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].isAdvanceBookingAllowedToProspect !==
          null &&
        data.calendarSetting.data[0].isAdvanceBookingAllowedToProspect !==
          undefined
        ? data.calendarSetting.data[0].isAdvanceBookingAllowedToProspect
        : false
    );
    setAdvanceBookingTime(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].advanceBookingTimeInterval !== null &&
        data.calendarSetting.data[0].advanceBookingTimeInterval !== undefined
        ? data.calendarSetting.data[0].advanceBookingTimeInterval
        : 0
    );
    setAdvanceBookingTimeUnit(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].advanceBookingTimeIntervalUnit !== null &&
        data.calendarSetting.data[0].advanceBookingTimeIntervalUnit !==
          undefined
        ? data.calendarSetting.data[0].advanceBookingTimeIntervalUnit
        : 'Ho'
    );
    setIsBufferMeeting(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].isBufferBetweenMeetings !== null &&
        data.calendarSetting.data[0].isBufferBetweenMeetings !== undefined
        ? data.calendarSetting.data[0].isBufferBetweenMeetings
        : false
    );
    setBufferTime(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].bufferTimeInterval !== null &&
        data.calendarSetting.data[0].bufferTimeInterval !== undefined
        ? data.calendarSetting.data[0].bufferTimeInterval
        : 0
    );
    setBufferTimeUnit(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].bufferTimeIntervalUnit !== null &&
        data.calendarSetting.data[0].bufferTimeIntervalUnit !== undefined
        ? data.calendarSetting.data[0].bufferTimeIntervalUnit
        : 'Mi'
    );
    setUserBookWithProspects(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].actionUserBookMeetingWithProspect !==
          null &&
        data.calendarSetting.data[0].actionUserBookMeetingWithProspect !==
          undefined
        ? data.calendarSetting.data[0].actionUserBookMeetingWithProspect
        : false
    );
    setProspectsBookWithUser(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0]
          .actionProspectScheduleMeetingWithUserBasedonAvialability !== null &&
        data.calendarSetting.data[0]
          .actionProspectScheduleMeetingWithUserBasedonAvialability !==
          undefined
        ? data.calendarSetting.data[0]
            .actionProspectScheduleMeetingWithUserBasedonAvialability
        : false
    );
    setNoActionReq(
      data &&
        data.calendarSetting &&
        data.calendarSetting.data &&
        data.calendarSetting.data[0].noActionRequired !== null &&
        data.calendarSetting.data[0].noActionRequired !== undefined
        ? data.calendarSetting.data[0].noActionRequired
        : false
    );
  };

  const calendarTypeList =
    settingsData &&
    settingsData.calendarSetting &&
    settingsData.calendarSetting.calendarList &&
    settingsData.calendarSetting.calendarList.items
      ? settingsData.calendarSetting.calendarList.items.map((item) => {
          return {
            value: item.id,
            text: item.summary,
          };
        })
      : [];

  const mondayApiData = (selectMonday && [...mondayData]) || [];
  const tuesdayApiData = (selectTuesday && [...tuesdayData]) || [];
  const wednesdayApiData = (selectWednesday && [...wednesdayData]) || [];
  const thursdayApiData = (selectThursday && [...thursdayData]) || [];
  const fridayApiData = (selectFriday && [...fridayData]) || [];
  const saturdayApiData = (selectSaturday && [...saturdayData]) || [];
  const sundayApiData = (selectSunday && [...sundayData]) || [];

  const meetingAvailablityApiData = [
    ...mondayApiData,
    ...tuesdayApiData,
    ...wednesdayApiData,
    ...thursdayApiData,
    ...fridayApiData,
    ...saturdayApiData,
    ...sundayApiData,
  ];

  const { data: saveCalendarSettingsData } = useQuery(SAVE_CALENDAR_SETTINGS, {
    skip: saveButtonClicked !== true,
    variables: {
      calendarType: calendarType,
      meetingLink: meetingLink,
      meetingLinkDuration: meetingLinkDuration,
      meetingLocation: meetingLocation,
      meetingDescription: meetingDescription,
      includeWeekend: includeWeekEnd,
      meetingAvailablity: meetingAvailablityApiData,
      includeRescheduleInMeetingInvite: includeMeetingInvite,
      allowOthersToIincludeYou: allowOthersInclude,
      isPriorNoticeNeeded: isPriorNotice,
      priorNoticeTimeInterval: priorNoticeTime,
      priorNoticeTimeIntervalUnit: priorNoticeTimeUnit,
      isAdvanceBookingAllowedToProspect: isAdvanceBooking,
      advanceBookingTimeInterval: advanceBookingTime,
      advanceBookingTimeIntervalUnit: advanceBookingTimeUnit,
      isBufferBetweenMeetings: isBufferMeeting,
      bufferTimeInterval: bufferTime,
      bufferTimeIntervalUnit: bufferTimeUnit,
      actionUserBookMeetingWithProspect: userBookWithProspects,
      actionProspectScheduleMeetingWithUserBasedonAvialability: prospectsBookWithUser,
      noActionRequired: noActionReq,
      meetingSlotDuration: meetingSlotDuration,
      isEmailIdVerified: enableCalendar,
    },
    onCompleted: (data) => {
      saveButtonClicked &&
        notify(
          'Calendar settings have been saved successfully!',
          'success',
          'save_calendar_settings'
        );
      setSaveButtonClicked(false);
      refreshSettingsData();
    },
    onError: (error) => {
      saveButtonClicked &&
        showErrorMessage(
          error,
          'Sorry! Failed to save calendar settings.',
          saveCalendarSettingsData,
          'save_calendar_settings'
        );
      setSaveButtonClicked(false);
    },
  });

  useEffect(() => {
    mondayData.length > 0
      ? setMondayData(mondayData)
      : setMondayData([{ weekDay: 1, fromSlotTime: '', toSlotTime: '' }]);
    tuesdayData.length > 0
      ? setTuesdayData(tuesdayData)
      : setTuesdayData([{ weekDay: 2, fromSlotTime: '', toSlotTime: '' }]);
    wednesdayData.length > 0
      ? setWednesdayData(wednesdayData)
      : setWednesdayData([{ weekDay: 3, fromSlotTime: '', toSlotTime: '' }]);
    thursdayData.length > 0
      ? setThursdayData(thursdayData)
      : setThursdayData([{ weekDay: 4, fromSlotTime: '', toSlotTime: '' }]);
    fridayData.length > 0
      ? setFridayData(fridayData)
      : setFridayData([{ weekDay: 5, fromSlotTime: '', toSlotTime: '' }]);
    saturdayData.length > 0
      ? setSaturdayData(saturdayData)
      : setSaturdayData([{ weekDay: 6, fromSlotTime: '', toSlotTime: '' }]);
    sundayData.length > 0
      ? setSundayData(sundayData)
      : setSundayData([{ weekDay: 0, fromSlotTime: '', toSlotTime: '' }]);
  }, [
    mondayData,
    tuesdayData,
    wednesdayData,
    thursdayData,
    fridayData,
    saturdayData,
    sundayData,
  ]);

  const hasError = (inputName, method) => {
    return (
      formCalendar &&
      formCalendar.errors &&
      formCalendar.errors[inputName] &&
      formCalendar.errors[inputName][method]
    );
  };

  const addOrRemoveSlots = (type, day, propIndex) => {
    switch (day) {
      case 'Monday':
        type === 'minus'
          ? setMondayData(
              mondayData.filter((item, index) => index !== propIndex)
            )
          : setMondayData((prevValue) => {
              const prevData = [...prevValue];
              prevData.splice(propIndex + 1, 0, {
                weekDay: 1,
                fromSlotTime: '',
                toSlotTime: '',
              });
              return prevData;
            });
        break;
      case 'Tuesday':
        type === 'minus'
          ? setTuesdayData(
              tuesdayData.filter((item, index) => index !== propIndex)
            )
          : setTuesdayData((prevValue) => {
              const prevData = [...prevValue];
              prevData.splice(propIndex + 1, 0, {
                weekDay: 2,
                fromSlotTime: '',
                toSlotTime: '',
              });
              return prevData;
            });
        break;
      case 'Wednesday':
        type === 'minus'
          ? setWednesdayData(
              wednesdayData.filter((item, index) => index !== propIndex)
            )
          : setWednesdayData((prevValue) => {
              const prevData = [...prevValue];
              prevData.splice(propIndex + 1, 0, {
                weekDay: 3,
                fromSlotTime: '',
                toSlotTime: '',
              });
              return prevData;
            });
        break;
      case 'Thursday':
        type === 'minus'
          ? setThursdayData(
              thursdayData.filter((item, index) => index !== propIndex)
            )
          : setThursdayData((prevValue) => {
              const prevData = [...prevValue];
              prevData.splice(propIndex + 1, 0, {
                weekDay: 4,
                fromSlotTime: '',
                toSlotTime: '',
              });
              return prevData;
            });
        break;
      case 'Friday':
        type === 'minus'
          ? setFridayData(
              fridayData.filter((item, index) => index !== propIndex)
            )
          : setFridayData((prevValue) => {
              const prevData = [...prevValue];
              prevData.splice(propIndex + 1, 0, {
                weekDay: 5,
                fromSlotTime: '',
                toSlotTime: '',
              });
              return prevData;
            });
        break;
      case 'Saturday':
        type === 'minus'
          ? setSaturdayData(
              saturdayData.filter((item, index) => index !== propIndex)
            )
          : setSaturdayData((prevValue) => {
              const prevData = [...prevValue];
              prevData.splice(propIndex + 1, 0, {
                weekDay: 6,
                fromSlotTime: '',
                toSlotTime: '',
              });
              return prevData;
            });
        break;
      case 'Sunday':
        type === 'minus'
          ? setSundayData(
              sundayData.filter((item, index) => index !== propIndex)
            )
          : setSundayData((prevValue) => {
              const prevData = [...prevValue];
              prevData.splice(propIndex + 1, 0, {
                weekDay: 0,
                fromSlotTime: '',
                toSlotTime: '',
              });
              return prevData;
            });
        break;
      default:
    }
  };

  const TimeSlots = (props) => {
    return (
      <div className="d-flex align-items-center mb-2">
        <Input
          type="select"
          className={
            props &&
            props.data &&
            (props.data.fromSlotTime > props.data.toSlotTime ||
              (!props.data.fromSlotTime && props.data.toSlotTime))
              ? 'border-danger'
              : ''
          }
          value={
            props &&
            props.data &&
            props.data.fromSlotTime &&
            props.data.fromSlotTime !== null &&
            props.data.fromSlotTime.substring(0, 5)
          }
          onChange={(e) => props.handleFromTime(e)}
        >
          <TimeSlotsDropDown />
        </Input>
        <span className="mx-2">to</span>
        <Input
          type="select"
          className={
            props &&
            props.data &&
            (props.data.fromSlotTime > props.data.toSlotTime ||
              (!props.data.fromSlotTime && props.data.toSlotTime))
              ? 'border-danger'
              : ''
          }
          value={
            props &&
            props.data &&
            props.data.toSlotTime &&
            props.data.toSlotTime !== null &&
            props.data.toSlotTime.substring(0, 5)
          }
          onChange={(e) => props.handleToTime(e)}
        >
          <TimeSlotsDropDown />
        </Input>
        <i
          className="fas fa-plus-circle mx-2 fa-lg"
          title="Add slot"
          onClick={() => {
            addOrRemoveSlots('plus', props.day, props.id);
          }}
        ></i>
        <i
          className="fas fa-minus-circle fa-lg"
          title="Remove slot"
          onClick={() => {
            addOrRemoveSlots('minus', props.day, props.id);
          }}
        ></i>
      </div>
    );
  };

  mondayData.forEach((item, index) => {
    monDay.push(
      <TimeSlots
        day="Monday"
        key={index}
        id={index}
        data={item}
        handleFromTime={(e) => {
          const targetValue = e.target.value;
          setMondayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].fromSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
        handleToTime={(e) => {
          const targetValue = e.target.value;
          setMondayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].toSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
      />
    );
  });
  tuesdayData.forEach((item, index) => {
    tuesDay.push(
      <TimeSlots
        day="Tuesday"
        key={index}
        id={index}
        data={item}
        handleFromTime={(e) => {
          const targetValue = e.target.value;
          setTuesdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].fromSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
        handleToTime={(e) => {
          const targetValue = e.target.value;
          setTuesdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].toSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
      />
    );
  });
  wednesdayData.forEach((item, index) => {
    wednesDay.push(
      <TimeSlots
        day="Wednesday"
        key={index}
        id={index}
        data={item}
        handleFromTime={(e) => {
          const targetValue = e.target.value;
          setWednesdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].fromSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
        handleToTime={(e) => {
          const targetValue = e.target.value;
          setWednesdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].toSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
      />
    );
  });
  thursdayData.forEach((item, index) => {
    thursDay.push(
      <TimeSlots
        day="Thursday"
        key={index}
        id={index}
        data={item}
        handleFromTime={(e) => {
          const targetValue = e.target.value;
          setThursdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].fromSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
        handleToTime={(e) => {
          const targetValue = e.target.value;
          setThursdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].toSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
      />
    );
  });
  fridayData.forEach((item, index) => {
    friDay.push(
      <TimeSlots
        day="Friday"
        key={index}
        id={index}
        data={item}
        handleFromTime={(e) => {
          const targetValue = e.target.value;
          setFridayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].fromSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
        handleToTime={(e) => {
          const targetValue = e.target.value;
          setFridayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].toSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
      />
    );
  });
  saturdayData.forEach((item, index) => {
    saturDay.push(
      <TimeSlots
        day="Saturday"
        key={index}
        id={index}
        data={item}
        handleFromTime={(e) => {
          const targetValue = e.target.value;
          setSaturdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].fromSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
        handleToTime={(e) => {
          const targetValue = e.target.value;
          setSaturdayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].toSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
      />
    );
  });
  sundayData.forEach((item, index) => {
    sunDay.push(
      <TimeSlots
        day="Sunday"
        key={index}
        id={index}
        data={item}
        handleFromTime={(e) => {
          const targetValue = e.target.value;
          setSundayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].fromSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
        handleToTime={(e) => {
          const targetValue = e.target.value;
          setSundayData((prevValue) => {
            const prevData = [...prevValue];
            prevData[index].toSlotTime = targetValue + ':00';
            return prevData;
          });
        }}
      />
    );
  });

  const mondayDateValidation =
    monDay.length > 0 &&
    monDay.filter(
      (item) =>
        item.props.data.fromSlotTime > item.props.data.toSlotTime ||
        (!item.props.data.fromSlotTime && item.props.data.toSlotTime)
    ).length > 0
      ? false
      : true;
  const tuesdayDateValidation =
    tuesDay.length > 0 &&
    tuesDay.filter(
      (item) =>
        item.props.data.fromSlotTime > item.props.data.toSlotTime ||
        (!item.props.data.fromSlotTime && item.props.data.toSlotTime)
    ).length > 0
      ? false
      : true;
  const wednesdayDateValidation =
    wednesDay.length > 0 &&
    wednesDay.filter(
      (item) =>
        item.props.data.fromSlotTime > item.props.data.toSlotTime ||
        (!item.props.data.fromSlotTime && item.props.data.toSlotTime)
    ).length > 0
      ? false
      : true;
  const thursdayDateValidation =
    thursDay.length > 0 &&
    thursDay.filter(
      (item) =>
        item.props.data.fromSlotTime > item.props.data.toSlotTime ||
        (!item.props.data.fromSlotTime && item.props.data.toSlotTime)
    ).length > 0
      ? false
      : true;
  const fridayDateValidation =
    friDay.length > 0 &&
    friDay.filter(
      (item) =>
        item.props.data.fromSlotTime > item.props.data.toSlotTime ||
        (!item.props.data.fromSlotTime && item.props.data.toSlotTime)
    ).length > 0
      ? false
      : true;
  const saturdayDateValidation =
    saturDay.length > 0 &&
    saturDay.filter(
      (item) =>
        item.props.data.fromSlotTime > item.props.data.toSlotTime ||
        (!item.props.data.fromSlotTime && item.props.data.toSlotTime)
    ).length > 0
      ? false
      : true;
  const sundayDateValidation =
    sunDay.length > 0 &&
    sunDay.filter(
      (item) =>
        item.props.data.fromSlotTime > item.props.data.toSlotTime ||
        (!item.props.data.fromSlotTime && item.props.data.toSlotTime)
    ).length > 0
      ? false
      : true;

  const saveCalenderSettings = () => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT', 'SELECT', 'TEXTAREA'].includes(i.nodeName)
    );

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormCalendar({ ...formCalendar, formName, errors });
    if (
      !hasError &&
      mondayDateValidation &&
      tuesdayDateValidation &&
      wednesdayDateValidation &&
      thursdayDateValidation &&
      fridayDateValidation &&
      saturdayDateValidation &&
      sundayDateValidation
    ) {
      setSaveButtonClicked(true);
    }
  };

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {(accountError && (
        <Alert color="danger" className="text-center">
          <i className="fa mr-2 fa fa-exclamation-circle text-danger"></i>
          Sorry! Failed to load User Accounts details.
        </Alert>
      )) ||
        (emailAccountData &&
          !accountError &&
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
                <i className="fa mr-2 fa fa-exclamation-circle text-danger"></i>
                Sorry! Please verify your email settings and then update the
                calendar settings.
              </Link>
            </Alert>
          )) ||
        (settingsError && (
          <Alert color="danger" className="text-center">
            <i className="fa mr-2 fa fa-exclamation-circle text-danger"></i>
            Sorry! Failed to load User Settings details.
          </Alert>
        ))}
      {emailAccountData &&
        !accountError &&
        !settingsError &&
        emailAccountData.Email &&
        emailAccountData.Email.data &&
        emailAccountData.Email.data[0] &&
        emailAccountData.Email.data[0].email &&
        emailAccountData.Email.data[0].verified && (
          <Card className="b">
            {settingsData &&
              settingsData.calendarSetting &&
              settingsData.calendarSetting.data &&
              settingsData.calendarSetting.data[0] &&
              !settingsData.calendarSetting.data[0].isEmailIdVerified && (
                <Alert color="danger" className="text-center">
                  <i className="fa mr-2 fa fa-exclamation-circle text-danger"></i>
                  Sorry! Please verify your email before updating calendar
                  settings.
                </Alert>
              )}
            <CardHeader className="bg-gray-lighter text-bold d-flex justify-content-between">
              Calender Settings{' '}
              <FormGroup check inline>
                <span className="mr-2">Disable</span>
                <CustomInput
                  type="switch"
                  id="example_custom_switch"
                  name="enable_switch"
                  checked={enableCalendar}
                  onChange={() => setEnableCalendar(!enableCalendar)}
                ></CustomInput>
                <span>Enable</span>
              </FormGroup>
            </CardHeader>
            <div
              title={setShowGeneral ? 'Collapse' : 'Expand'}
              className="p-2 bb bt bg-gray-lighter text-bold pointer"
              onClick={() => {
                setShowGeneral(!showGeneral);
              }}
            >
              <i
                className={showGeneral ? upAngle : downAngle}
                title={showGeneral ? 'Collapse' : 'Expand'}
              ></i>
              General Information
            </div>
            <Collapse isOpen={showGeneral}>
              <CardBody>
                <Form name="calendarSettingsForm" innerRef={formRef}>
                  <FormGroup>
                    <Label for="calender_type">Choose Calendar</Label>
                    <DropDown
                      type="select"
                      id="calender_type"
                      name="prospects"
                      data={calendarTypeList && calendarTypeList}
                      value={calendarType ? calendarType : ''}
                      onChange={(value) => setCalendarType(value)}
                      innerRef={calendarRef}
                    />
                    <div className="invalid-feedback">
                      Please select calendar type
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Set Meeting Link</Label>
                    <InputGroup>
                      <Input
                        type="text"
                        name="meetingLink"
                        id="meeting_link"
                        innerRef={calendarRef}
                        data-validate='["required"]'
                        invalid={hasError('meetingLink', 'required')}
                        value={meetingLink && meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                      />
                      <div className="invalid-feedback">
                        Please enter meeting link
                      </div>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <Label>Meeting Link Duration</Label>
                    <Input
                      type="select"
                      name="linkDuration"
                      id="link_duration"
                      innerRef={calendarRef}
                      data-validate='["select"]'
                      invalid={hasError('linkDuration', 'select')}
                      value={meetingLinkDuration}
                      onChange={(e) => {
                        setMeetingLinkDuration(parseInt(e.target.value));
                      }}
                    >
                      <option></option>
                      <option value="7">7 Day(s)</option>
                      <option value="15">15 Day(s)</option>
                      <option value="30">30 Day(s)</option>
                    </Input>
                    <div className="invalid-feedback">
                      Please select link duration
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Meeting Duration</Label>
                    <Input
                      type="select"
                      name="meetingDuration"
                      id="meeting_duration"
                      innerRef={calendarRef}
                      data-validate='["select"]'
                      invalid={hasError('meetingDuration', 'select')}
                      value={meetingSlotDuration}
                      onChange={(e) =>
                        setMeetingSlotDuration(parseInt(e.target.value))
                      }
                    >
                      <option></option>
                      <option value="30">30m</option>
                      <option value="60">60m</option>
                      <option value="90">90m</option>
                    </Input>
                    <div className="invalid-feedback">
                      Please select meeting duration
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Meeting Location</Label>
                    <Input
                      type="text"
                      name="meetingLocation"
                      id="meeting_location"
                      innerRef={calendarRef}
                      data-validate='["required"]'
                      invalid={hasError('meetingLocation', 'required')}
                      value={meetingLocation ? meetingLocation : ''}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter meeting location
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <Label>Meeting Description</Label>
                    <Input
                      type="textarea"
                      rows="4"
                      name="meetingDescription"
                      id="meeting_description"
                      innerRef={calendarRef}
                      data-validate='["required"]'
                      invalid={hasError('meetingDescription', 'required')}
                      value={meetingDescription}
                      onChange={(e) => setMeetingDescription(e.target.value)}
                    />
                    <div className="invalid-feedback">
                      Please enter meeting description
                    </div>
                  </FormGroup>
                </Form>
              </CardBody>
            </Collapse>
            <div
              title={showAvailability ? 'Collapse' : 'Expand'}
              className="p-2 bb bt bg-gray-lighter text-bold pointer"
              onClick={() => {
                setShowAvailability(!showAvailability);
              }}
            >
              <i
                className={showAvailability ? upAngle : downAngle}
                title={showAvailability ? 'Collapse' : 'Expand'}
              ></i>
              Availability
            </div>
            <Collapse isOpen={showAvailability}>
              <CardBody className="pb-0">
                <Row>
                  <Col sm={4}>Add Time Slots</Col>
                  <Col sm={8}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={includeWeekEnd}
                          onChange={() => setIncludeWeekEnd(!includeWeekEnd)}
                        />
                        Include Weekends
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={selectMonday}
                          onChange={() => setSelectMonday(!selectMonday)}
                        />
                        Monday
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col sm={8}>{monDay}</Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={selectTuesday}
                          onChange={() => setSelectTuesday(!selectTuesday)}
                        />
                        Tuesday
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col sm={8}>{tuesDay}</Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={selectWednesday}
                          onChange={() => setSelectWednesday(!selectWednesday)}
                        />
                        Wednesday
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col sm={8}>{wednesDay}</Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={selectThursday}
                          onChange={(e) => setSelectThursday(!selectThursday)}
                        />
                        Thursday
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col sm={8}>{thursDay}</Col>
                </Row>
                <Row>
                  <Col sm={4}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={selectFriday}
                          onChange={() => setSelectFriday(!selectFriday)}
                        />
                        Friday
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col sm={8}>{friDay}</Col>
                </Row>
                <Row style={{ display: includeWeekEnd ? '' : 'none' }}>
                  <Col sm={4}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={selectSaturday}
                          onChange={() => setSelectSaturday(!selectSaturday)}
                        />
                        Saturday
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col sm={8}>{saturDay}</Col>
                </Row>
                <Row style={{ display: includeWeekEnd ? '' : 'none' }}>
                  <Col sm={4}>
                    <FormGroup check>
                      <Label>
                        <Input
                          type="checkbox"
                          checked={selectSunday}
                          onChange={() => setSelectSunday(!selectSunday)}
                        />
                        Sunday
                      </Label>
                    </FormGroup>
                  </Col>
                  <Col sm={8}>{sunDay}</Col>
                </Row>
                {(!mondayDateValidation ||
                  !tuesdayDateValidation ||
                  !wednesdayDateValidation ||
                  !thursdayDateValidation ||
                  !fridayDateValidation ||
                  !saturdayDateValidation ||
                  !sundayDateValidation) && (
                  <span className="h5 small text-nowrap text-danger pb-2">
                    Please select a valid start hour and end hour.
                  </span>
                )}
              </CardBody>
            </Collapse>
            <div
              title={showMeeting ? 'Collapse' : 'Expand'}
              className="p-2 bb bt bg-gray-lighter text-bold pointer mt-2"
              onClick={() => {
                setShowMeeting(!showMeeting);
              }}
            >
              <i
                className={showMeeting ? upAngle : downAngle}
                title={showMeeting ? 'Collapse' : 'Expand'}
              ></i>
              Meeting Settings
            </div>
            <Collapse isOpen={showMeeting}>
              <CardBody>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={includeMeetingInvite}
                      onChange={() =>
                        setIncludeMeetingInvite(!includeMeetingInvite)
                      }
                    />
                    Include reschedule in meeting invite
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={allowOthersInclude}
                      onChange={() =>
                        setAllowOthersInclude(!allowOthersInclude)
                      }
                    />
                    Allow others to include you as one of the guest in their
                    meeting
                  </Label>
                </FormGroup>
                <FormGroup check className="mb-2">
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={isPriorNotice}
                      onChange={() => setIsPriorNotice(!isPriorNotice)}
                    />
                    Allow prospects to schedule meeting with at least prior
                    notice of
                  </Label>
                  <Input
                    type="select"
                    className="d-inline-block w-auto ml-2"
                    value={priorNoticeTime}
                    onChange={(e) =>
                      setPriorNoticeTime(parseInt(e.target.value))
                    }
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </Input>
                  <Input
                    type="select"
                    className="d-inline-block w-auto ml-2"
                    value={priorNoticeTimeUnit}
                    onChange={(e) => setPriorNoticeTimeUnit(e.target.value)}
                  >
                    <option value="Ho">Hour(s)</option>
                    <option value="Da">Day(s)</option>
                  </Input>
                </FormGroup>
                <FormGroup check className="mb-2">
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={isAdvanceBooking}
                      onChange={() => setIsAdvanceBooking(!isAdvanceBooking)}
                    />
                    Allow prospects to advance book the meeting within
                  </Label>
                  <Input
                    type="select"
                    className="d-inline-block w-auto ml-2"
                    value={advanceBookingTime}
                    onChange={(e) =>
                      setAdvanceBookingTime(parseInt(e.target.value))
                    }
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                  </Input>
                  <Input
                    type="select"
                    className="d-inline-block w-auto ml-2"
                    value={advanceBookingTimeUnit}
                    onChange={(e) => setAdvanceBookingTimeUnit(e.target.value)}
                  >
                    <option value="Ho">Hour(s)</option>
                    <option value="Da">Day(s)</option>
                  </Input>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={isBufferMeeting}
                      onChange={() => setIsBufferMeeting(!isBufferMeeting)}
                    />
                    Add buffer between meeting
                  </Label>
                  <Input
                    type="select"
                    className="d-inline-block w-auto ml-2"
                    value={bufferTime}
                    onChange={(e) => setBufferTime(parseInt(e.target.value))}
                  >
                    <option value="0">0</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
                    <option value="30">30</option>
                  </Input>
                  <Input
                    type="select"
                    className="d-inline-block w-auto ml-2"
                    value={bufferTimeUnit}
                    onChange={(e) => setBufferTimeUnit(e.target.value)}
                  >
                    <option value="Mi">Minute(s)</option>
                  </Input>
                </FormGroup>
                <Label className="text-bold">
                  Action for meeting schedule:
                </Label>
                <FormGroup className="p-0 m-0">
                  <Label>Exit the prospect from cadence, when</Label>
                </FormGroup>
                <FormGroup check className="pl-5">
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={userBookWithProspects}
                      onChange={() =>
                        setUserBookWithProspects(!userBookWithProspects)
                      }
                    />
                    User book meeting with prospect
                  </Label>
                </FormGroup>
                <FormGroup check className="pl-5">
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={prospectsBookWithUser}
                      onChange={() =>
                        setProspectsBookWithUser(!prospectsBookWithUser)
                      }
                    />
                    Prospect schedule meeting with user based on their
                    availability
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="checkbox"
                      checked={noActionReq}
                      onChange={() => setNoActionReq(!noActionReq)}
                    />
                    No action required, continue cadence
                  </Label>
                </FormGroup>
              </CardBody>
            </Collapse>
            <CardBody className="bt">
              <Button
                color="primary"
                className="mt-2"
                icon="fas fa-check"
                onClick={saveCalenderSettings}
              >
                Save
              </Button>
            </CardBody>
          </Card>
        )}
    </>
  );
};
export default CalendarSetting;
