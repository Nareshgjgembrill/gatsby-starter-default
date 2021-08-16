/* eslint-disable @typescript-eslint/camelcase */
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Input,
  InputGroup,
  Row,
} from 'reactstrap';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import moment from 'moment';
import UserContext from '../../UserContext';
import ClButton from '../../Common/Button';
import DropDown from '../../Common/DropDown';
import UserList from '../../Common/UserList';
import { notify, showErrorMessage } from '../../../../src/util';
import {
  FETCH_CALENDAR_SETTINGS,
  SEND_MEETING_INVITE,
  DELETE_MEETING_INVITE,
} from '../../queries/MeetingsQuery';
import { FETCH_PROSPECTS_LIST } from '../../queries/CadenceQuery';
toast.configure();

const scheduler = window.scheduler;

const PopupForm = (props) => {
  const customForm = document.getElementById('popup_form');
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [userId, setUserId] = useState(currentUserId);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [title, setTitle] = useState(null);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const titleInnerData = React.useRef();
  const locationInnerData = React.useRef();
  const descriptionInnerData = React.useRef();
  const startDateInnerData = React.useRef();
  const startTimeInnerData = React.useRef();
  const endDateInnerData = React.useRef();
  const endTimeInnerData = React.useRef();
  const [isSaveClicked, setIsSaveClicked] = useState(false);

  const prospectsListData = [];

  const [allProspectsLimit] = useState(200);
  const [allProspectsOffset, setAllProspectsOffset] = useState(0);
  const [allProspects, setAllProspects] = useState([]);
  const [userFilter] = useState('filter[user][id]=' + currentUserId);
  const [selectedProspects, setSelectedProspects] = useState('');

  const {
    loading: prospectLoading,
    error: prospectError,
    refetch: refetchProspects,
  } = useQuery(FETCH_PROSPECTS_LIST, {
    variables: {
      prospectFilter: userFilter,
      limit: allProspectsLimit,
      offset: allProspectsOffset,
    },
    onCompleted: (data) => {
      if (data) {
        setAllProspects([...allProspects, data?.prospects?.data]);
      }

      if (
        data?.prospects &&
        (allProspectsOffset + 1) * allProspectsLimit <
          data.prospects.paging.totalCount
      ) {
        setAllProspectsOffset(allProspectsOffset + 1);
      }
    },
    notifyOnNetworkStatusChange: true,
    skip: isPopupOpen === false,
  });

  const [
    sendMeetingInvite,
    { data: sendInviteData, loading: sendInviteLoading },
  ] = useLazyQuery(SEND_MEETING_INVITE, {
    onCompleted: (data) => {
      props.handleLoad();
      data?.meetingInvite
        ? notify('Email has been sent successfully!', 'success', 'mail_sent')
        : notify('Sorry! Failed to send email', 'error', 'mail_failed');
      const ev = scheduler.getEvent(scheduler.getState().lightbox_id);
      ev.userId = userId;
      ev.prospects = selectedProspects;
      ev.text = titleInnerData.current.defaultValue;
      ev.location = locationInnerData.current.defaultValue;
      ev.description = descriptionInnerData.current.defaultValue;
      ev.startDate = startDateInnerData.current.defaultValue;
      ev.startTime = startTimeInnerData.current.defaultValue;
      ev.endDate = endDateInnerData.current.defaultValue;
      ev.endTime = endTimeInnerData.current.defaultValue;
      ev.start_date = new Date(
        startDateInnerData.current.defaultValue +
          ' ' +
          startTimeInnerData.current.defaultValue
      );
      ev.end_date = new Date(
        endDateInnerData.current.defaultValue +
          ' ' +
          endTimeInnerData.current.defaultValue
      );
      setUserId(currentUserId);
      setSelectedProspects('');
      setTitle(null);
      setLocation(null);
      setDescription(null);
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
      setIsPopupOpen(false);
      setAllProspectsOffset(1);
      setAllProspects(allProspects.splice(0, 1));
      scheduler.endLightbox(true, customForm);
      setIsSaveClicked(false);
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to send the meeting invite.',
        sendInviteData,
        'meeting_failed'
      );
      setTimeout(() => props.handleForceLoad(), 1500);
      props.handleLoad();
    },
    notifyOnNetworkStatusChange: true,
  });

  const [deleteMeetingInvite, { data: deleteMeetingData }] = useLazyQuery(
    DELETE_MEETING_INVITE,
    {
      onCompleted: (data) => {
        props.handleLoad();
        data?.deleteMeeting
          ? notify(
              'Your event has been deleted successfully!',
              'success',
              'deleted_event'
            )
          : notify(
              'Sorry! Failed to delete the event.',
              'error',
              'delete_failed'
            );
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to delete the meeting invite.',
          deleteMeetingData,
          'delete_meeting_failed'
        );
        props.handleForceLoad();
        props.handleLoad();
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: settingsData } = useQuery(FETCH_CALENDAR_SETTINGS, {
    onError: (error) =>
      showErrorMessage(
        error,
        'Sorry! Failed to load the settings.',
        settingsData,
        'settings_failed'
      ),
  });

  const prospectsList = allProspects ? allProspects : [];

  if (prospectsList) {
    for (let l = 0; l < prospectsList.length; l++) {
      for (let k = 0; k < prospectsList[l].length; k++) {
        if (prospectsList[l][k]['contactName']) {
          const temp = {
            text: prospectsList[l][k]['contactName'],
            userId: prospectsList[l][k]['id'],
            active: false,
            value: prospectsList[l][k]['email'],
          };
          prospectsListData.push(temp);
        }
      }
    }
  }

  scheduler.showLightbox = (id) => {
    setIsPopupOpen(true);
    const ev = scheduler.getEvent(id);
    ev.location =
      ev.location === undefined &&
      settingsData?.calendarSetting?.data
        ? settingsData.calendarSetting.data[0].meetingLocation
        : ev.location
        ? ev.location
        : '';
    ev.description =
      ev.description === undefined &&
      settingsData?.calendarSetting?.data
        ? settingsData.calendarSetting.data[0].meetingDescription
        : ev.description
        ? ev.description
        : '';
    setUserId(ev.userId ? ev.userId : currentUserId);
    setSelectedProspects(ev.prospects ? ev.prospects : '');
    setTitle(ev.text ? ev.text : '');
    setLocation(ev.location);
    setDescription(ev.description);
    const sdate = moment(ev.start_date).format('YYYY-MM-DD');
    const edate = moment(ev.end_date).format('YYYY-MM-DD');
    const stime = moment(ev.start_date).format('HH:mm');
    const etime = moment(ev.end_date).format('HH:mm');
    setStartDate(sdate);
    setStartTime(stime);
    setEndDate(edate);
    setEndTime(etime);
    scheduler.startLightbox(id, customForm);
  };

  const saveForm = () => {
    setIsSaveClicked(true);
    const popupValidation =
      selectedProspects && userId && title && location && description
        ? startDate &&
          startTime &&
          endDate &&
          endTime &&
          (startDate < endDate ||
            (startDate === endDate && startTime <= endTime)) &&
          true
        : false;
    if (popupValidation) {
      const UTCstart = new Date(startDate + ' ' + startTime);
      const UTCend = new Date(endDate + ' ' + endTime);
      const UTCstartAPi = moment
        .utc(UTCstart)
        .format('YYYY-MM-DD[T]HH:mm:ss[.000Z]');
      const UTCendApi = moment
        .utc(UTCend)
        .format('YYYY-MM-DD[T]HH:mm:ss[.000Z]');
      sendMeetingInvite({
        variables: {
          startDate: UTCstartAPi,
          endDate: UTCendApi,
          title: title,
          location: location,
          description: description,
          chooseRecipients: selectedProspects,
          otherUser: userId,
          prospectEmail: selectedProspects,
          startDateFormat: UTCstartAPi,
          endDateFormat: UTCendApi,
        },
      });
    } else {
      notify('All fields are mandatory!', 'info', 'mandatory_fields');
    }
  };

  scheduler._click.buttons.delete = function (id) {
    deleteMeetingInvite({
      variables: {
        eventId: id,
      },
    });
    scheduler.deleteEvent(id);
  };

  const deleteForm = () => {
    const ev = scheduler.getEvent(scheduler.getState().lightbox_id);
    deleteMeetingInvite({
      variables: {
        eventId: ev.id,
      },
    });
    scheduler.deleteEvent(ev.id);
    setIsPopupOpen(false);
    scheduler.endLightbox(true, customForm);
    setIsSaveClicked(false);
  };

  const cancelForm = () => {
    scheduler._edit_stop_event(scheduler.getEvent(), false);
    scheduler.endLightbox(true, customForm);
    props.handleForceLoad();
    setIsSaveClicked(false);
    setUserId(currentUserId);
    setSelectedProspects('');
    setTitle('');
    setLocation('');
    setDescription('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setIsPopupOpen(false);
    setAllProspectsOffset(1);
    setAllProspects(allProspects.splice(0, 1));
  };

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={isPopupOpen ? 'dhx_cal_cover' : ''}></div>
      <Card
        id="popup_form"
        style={{ zIndex: '125', width: '800px' }}
        className={
          !isPopupOpen ? 'd-none ba position-absolute' : 'ba position-absolute'
        }
      >
        <CardHeader className="p-0">
          <CardTitle className="m-3">
            <h4>
              Meeting @ {startTime} - {endTime}
            </h4>
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row className="mb-2">
            <Col
              lg={2}
              sm={2}
              md={2}
              className="pr-0 align-self-center text-right text-bold"
            >
              Choose User
            </Col>
            <Col lg={9} sm={9} md={9} className="pr-0 align-self-center">
              <UserList
                value={userId}
                placeholder="Select user"
                onChange={(value) => {
                  setUserId(value);
                }}
                name="userId"
              ></UserList>
              {!userId && isSaveClicked && (
                <span className="h5 small text-nowrap text-danger">
                  Please select Users.
                </span>
              )}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col
              lg={2}
              sm={2}
              md={2}
              className="pr-0 align-self-center text-right text-bold"
            >
              Select Prospects
            </Col>
            <Col lg={9} sm={9} md={9} className="pr-0 align-self-center">
              <DropDown
                id="select_prospects"
                name="prospects"
                data={prospectsListData}
                value={selectedProspects}
                placeHolder={'Select Prospects'}
                loading={!prospectsListData.length > 0 && prospectLoading}
                error={prospectError ? true : false}
                handleRefresh={() => {
                  setAllProspects([]);
                  refetchProspects();
                  setAllProspectsOffset(0);
                }}
                onChange={(value) => {
                  setSelectedProspects(value);
                }}
              />
              {!selectedProspects && isSaveClicked && (
                <span className="h5 small text-nowrap text-danger">
                  Please select Prospect.
                </span>
              )}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col
              lg={2}
              sm={2}
              md={2}
              className="pr-0 align-self-center text-right text-bold"
            >
              Title
            </Col>
            <Col lg={9} sm={9} md={9} className="pr-0 align-self-center">
              <Input
                id="title"
                innerRef={titleInnerData}
                type="text"
                value={title || ''}
                name="title"
                onChange={(e) => setTitle(e.target.value)}
              ></Input>
              {!title && isSaveClicked && (
                <span className="h5 small text-nowrap text-danger">
                  Please enter Title.
                </span>
              )}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col
              lg={2}
              sm={2}
              md={2}
              className="pr-0 align-self-center text-right text-bold"
            >
              Location
            </Col>
            <Col lg={9} sm={9} md={9} className="pr-0 align-self-center">
              <Input
                id="location"
                innerRef={locationInnerData}
                type="text"
                value={location || ''}
                name="location"
                onChange={(e) => setLocation(e.target.value)}
              ></Input>
              {!location && isSaveClicked && (
                <span className="h5 small text-nowrap text-danger">
                  Please enter Location.
                </span>
              )}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col
              lg={2}
              sm={2}
              md={2}
              className="pr-0 align-self-center text-right text-bold"
            >
              Description
            </Col>
            <Col lg={9} sm={9} md={9} className="pr-0 align-self-center">
              <Input
                innerRef={descriptionInnerData}
                type="textarea"
                value={description || ''}
                name="description"
                onChange={(e) => setDescription(e.target.value)}
              ></Input>
              {!description && isSaveClicked && (
                <span className="h5 small text-nowrap text-danger">
                  Please enter Description.
                </span>
              )}
            </Col>
          </Row>
          <Row className="mb-2">
            <Col
              lg={2}
              sm={2}
              md={2}
              className="pr-0 align-self-center text-right text-bold"
            >
              Time Period
            </Col>
            <Col lg={9} sm={9} md={9} className="pr-0 align-self-center">
              <InputGroup>
                <Input
                  innerRef={startDateInnerData}
                  type="date"
                  value={startDate || ''}
                  name="startDate"
                  onChange={(e) => setStartDate(e.target.value)}
                ></Input>
                <Input
                  className="mr-2 "
                  innerRef={startTimeInnerData}
                  type="time"
                  value={startTime || ''}
                  name="startTime"
                  onChange={(e) => setStartTime(e.target.value)}
                  style={{ maxWidth: '120px' }}
                ></Input>
                <Input
                  innerRef={endDateInnerData}
                  type="date"
                  value={endDate || ''}
                  name="endDate"
                  onChange={(e) => setEndDate(e.target.value)}
                ></Input>
                <Input
                  innerRef={endTimeInnerData}
                  type="time"
                  value={endTime || ''}
                  name="endTime"
                  onChange={(e) => setEndTime(e.target.value)}
                  style={{ maxWidth: '120px' }}
                ></Input>
              </InputGroup>
              {(!startDate ||
                !startTime ||
                !endDate ||
                !endTime ||
                startDate > endDate ||
                (startDate === endDate && startTime > endTime)) &&
                isSaveClicked && (
                  <span className="h5 small text-nowrap text-danger">
                    Please enter valid Start date and End date.
                  </span>
                )}
            </Col>
          </Row>
          <div className="d-flex justify-content-between">
            <div className="justify-content-between">
              <ClButton
                disabled={sendInviteLoading}
                type="submit"
                color="primary"
                icon={
                  sendInviteLoading ? 'fas fa-spinner fa-spin' : 'fa fa-check'
                }
                title="Save"
                className="mr-2"
                onClick={saveForm}
              >
                {sendInviteLoading ? 'Wait...' : 'Save'}
              </ClButton>
              {scheduler.getState().new_event ? (
                ''
              ) : (
                <ClButton
                  type="submit"
                  color="danger"
                  icon="fas fa-trash"
                  title="Delete"
                  onClick={deleteForm}
                  className="mr-2 bg-danger"
                >
                  Delete
                </ClButton>
              )}
            </div>
            <ClButton
              type="submit"
              icon="fa fa-times"
              title="Cancel"
              onClick={cancelForm}
              className="mr-2"
            >
              Cancel
            </ClButton>
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default PopupForm;
