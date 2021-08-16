import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { FormValidator } from '@nextaction/components';
import {
  Breadcrumb,
  BreadcrumbItem,
  Card,
  CardBody,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
} from 'reactstrap';
import Button from '../../Common/Button';
import CloseButton from '../../Common/CloseButton';
import DropDown from '../../Common/DropDown';
import ConfirmModal from '../../Common/ConfirmModal';
import {
  CREATE_SCHEDULE_QUERY,
  CREATE_TIMESLOT_QUERY,
  FETCH_SCHEDULE_QUERY,
  FETCH_MANAGER_USER_QUERY,
  UPDATE_SCHEDULE_QUERY,
} from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
import HolidayModal from './HolidayModal';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const AddEmailExecutionSchedule = ({ match, location }) => {
  const pathName = location.state && location.state.pathName;
  const filters = location.state && location.state.search;
  const action =
    match.params.action === 'add'
      ? 'Add'
      : match.params.action === 'clone'
      ? 'Clone'
      : 'Edit';
  const daysArray = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const hoursArray = [
    '12:00 am',
    '12:30 am',
    '1:00 am',
    '1:30 am',
    '2:00 am',
    '2:30 am',
    '3:00 am',
    '3:30 am',
    '4:00 am',
    '4:30 am',
    '5:00 am',
    '5:30 am',
    '6:00 am',
    '6:30 am',
    '7:00 am',
    '7:30 am',
    '8:00 am',
    '8:30 am',
    '9:00 am',
    '9:30 am',
    '10:00 am',
    '10:30 am',
    '11:00 am',
    '11:30 am',
    '12:00 pm',
    '12:30 pm',
    '1:00 pm',
    '1:30 pm',
    '2:00 pm',
    '2:30 pm',
    '3:00 pm',
    '3:30 pm',
    '4:00 pm',
    '4:30 pm',
    '5:00 pm',
    '5:30 pm',
    '6:00 pm',
    '6:30 pm',
    '7:00 pm',
    '7:30 pm',
    '8:00 pm',
    '8:30 pm',
    '9:00 pm',
    '9:30 pm',
    '10:00 pm',
    '10:30 pm',
    '11:00 pm',
    '11:30 pm',
  ];
  const history = useHistory();
  const [show, setShow] = useState(false);
  const [activeBlocksState, setActiveBlocksState] = useState({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
    Sunday: {},
  });
  const [currentScheduleId, setCurrentScheduleId] = useState(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formSchedule, setFormSchedule] = useState();
  const [managerValues, setManagerValues] = useState([]);
  const isManagerUser = `filter[isManagerUser]=Y`;
  const [defaultSchedule, setDefaultSchedule] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState();
  const [scheduleFormTimezone, setScheduleFormTimezone] = useState();
  const [scheduleName, setScheduleName] = useState();
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [disableSharedType, setDisableSharedType] = useState(false);
  const [disableEditSharedType, setDisableEditSharedType] = useState(false);
  const [existingSharedType, setExistingSharedType] = useState();
  const [disableLocalTime, setDisableLocalTime] = useState(false);

  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserManager = userLoading ? 'N' : user.isManagerUser;
  const currentUserId = userLoading ? 0 : user.id;

  const dropDownRef = useRef();

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const hasError = (inputName, method) => {
    return (
      formSchedule &&
      formSchedule.errors &&
      formSchedule.errors[inputName] &&
      formSchedule.errors[inputName][method]
    );
  };

  const successMsg = () => {
    return (
      <>
        <strong>{scheduleName}</strong> Saved Successfully!
      </>
    );
  };
  const failedMsg = 'Sorry! Something went wrong. Failed to save.';

  const touchExecutionTimeSlots = [];
  const [finalTimeSlotsToSave, setFinalTimeSlotsToSave] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });
  const allSharedUserIds = [];
  const formRef = useRef();

  const americanTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
  ];

  // fetching all managers
  const {
    data: fetchManagerData,
    loading: fetchManagerLoading,
    error: fetchManagerError,
  } = useQuery(FETCH_MANAGER_USER_QUERY, {
    variables: { isManagerUser: isManagerUser },
  });

  // saving all shared userids and dropdown options
  let multiselectUsers = '';
  if (fetchManagerData !== undefined) {
    multiselectUsers = fetchManagerData?.manager?.data?.map((item) => {
      allSharedUserIds.push(item.id);
      return { text: item.displayName, value: item.id, active: false };
    });
  }

  // fetching schedule if id is passed in query
  const {
    data: fetchScheduleData,
    loading: fetchScheduleLoading,
    error: fetchScheduleError,
  } = useQuery(FETCH_SCHEDULE_QUERY, {
    variables: {
      includeAssociationsQry: 'includeAssociations[]=touchExecutionTimeSlots',
      id: match.params.id,
    },
    skip: match.params.id === undefined,
    onCompleted: (response) => {
      setActiveBlocks(response);
    },
  });

  // setting form inputs
  useEffect(() => {
    const apiData = fetchScheduleData?.schedule?.data[0];
    if (apiData) {
      if (action === 'Clone') {
        setValue('sharedType', 'none');
        setManagerValues([]);
      } else {
        setValue('sharedType', apiData.sharedType);
        setManagerValues(
          apiData.sharedGroups === null
            ? apiData.sharedType === 'allUsers'
              ? allSharedUserIds
              : []
            : apiData.sharedGroups
        );
      }

      // disable shared dropdown when action is edit and EES is already shared
      // or when local timezone is selected
      setDisableEditSharedType(
        (action !== 'Clone' && apiData.sharedType !== 'none') ||
          americanTimezones.indexOf(apiData.timezone) === -1
      );
      setValue('name', apiData.name);
      setValue('timezone', apiData.timezone);
      setValue('useProspectTimezone', apiData.useProspectTimezone);
      setValue('includeWeekends', apiData.includeWeekends);
      setValue('excludeHolidays', apiData.excludeHolidays);
      setDisableLocalTime(apiData.sharedType !== 'none');
      setCurrentScheduleId(apiData.id);
      setShow(apiData.includeWeekends);
      setScheduleName(apiData.name);
      setExistingSharedType(apiData.sharedType);
      setDefaultSchedule(
        apiData.name === 'EST Business Hours' ||
          apiData.name === 'PST Business Hours' ||
          apiData.createdUser !== currentUserId
      );
    }
    // eslint-disable-next-line
  }, [fetchScheduleData, fetchManagerData]);

  const setActiveBlocks = (response) => {
    if (response?.schedule?.includedAssociations?.touchExecutionTimeSlots) {
      response.schedule.includedAssociations.touchExecutionTimeSlots.forEach(
        (ts) => {
          // setting active blocks based on weekday from api data
          switch (ts.weekday) {
            case 0:
              setActiveBlocksState((prevState) => {
                return {
                  ...prevState,
                  Sunday: {
                    ...prevState.Sunday,
                    [ts.timeslot - 1]: true,
                  },
                };
              });
              break;
            case 1:
              setActiveBlocksState((prevState) => {
                return {
                  ...prevState,
                  Monday: {
                    ...prevState.Monday,
                    [ts.timeslot - 1]: true,
                  },
                };
              });
              break;
            case 2:
              setActiveBlocksState((prevState) => {
                return {
                  ...prevState,
                  Tuesday: {
                    ...prevState.Tuesday,
                    [ts.timeslot - 1]: true,
                  },
                };
              });
              break;
            case 3:
              setActiveBlocksState((prevState) => {
                return {
                  ...prevState,
                  Wednesday: {
                    ...prevState.Wednesday,
                    [ts.timeslot - 1]: true,
                  },
                };
              });
              break;
            case 4:
              setActiveBlocksState((prevState) => {
                return {
                  ...prevState,
                  Thursday: {
                    ...prevState.Thursday,
                    [ts.timeslot - 1]: true,
                  },
                };
              });
              break;
            case 5:
              setActiveBlocksState((prevState) => {
                return {
                  ...prevState,
                  Friday: {
                    ...prevState.Friday,
                    [ts.timeslot - 1]: true,
                  },
                };
              });
              break;
            case 6:
              setActiveBlocksState((prevState) => {
                return {
                  ...prevState,
                  Saturday: {
                    ...prevState.Saturday,
                    [ts.timeslot - 1]: true,
                  },
                };
              });
              break;
            default:
              break;
          }
        }
      );
    }
  };

  const { register, setValue, getValues } = useForm({
    defaultValues: {
      name: '',
      timezone: '',
      sharedGroups: '',
      useProspectTimezone: false,
      includeWeekends: false,
      excludeHolidays: true,
    },
  });

  const [
    addEmailSchedule,
    { data: addScheduleData, loading: scheduleLoading },
  ] = useLazyQuery(CREATE_SCHEDULE_QUERY, {
    onCompleted: (response) =>
      addScheduleCallBack(response, true, addScheduleData),
    onError: (response) =>
      addScheduleCallBack(response, false, addScheduleData),
  });
  const [
    addEmailScheduleTimeSlot,
    { data: createTimeslotData, loading: createTimeslotLoading },
  ] = useLazyQuery(CREATE_TIMESLOT_QUERY, {
    onCompleted: (response) => addTimeSlotCallBack(response, true),
    onError: (response) => addTimeSlotCallBack(response),
  });
  const [
    editEmailSchedule,
    { data: editScheduleData, loading: editScheduleLoading },
  ] = useLazyQuery(UPDATE_SCHEDULE_QUERY, {
    variables: { id: currentScheduleId },
    onCompleted: (response) =>
      addScheduleCallBack(response, true, editScheduleData),
    onError: (response) =>
      addScheduleCallBack(response, false, editScheduleData),
  });

  const emailScheduleSubmit = () => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT', 'SELECT'].includes(i.nodeName)
    );

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormSchedule({ ...formSchedule, formName, errors });

    const formData = getValues();
    const timeSlots = !hasError ? getTimeSlotsValues() : false;
    if (hasError || timeSlots === false) {
      return false;
    }

    // show confirm modal if use prospect timezone is checked otherwise not
    if (!formData.useProspectTimezone) {
      saveEmailExecutionSchedule(formData);
    } else {
      switch (formData.timezone) {
        case 'America/New_York':
          setScheduleFormTimezone('EST - Eastern Standard Time');
          break;
        case 'America/Chicago':
          setScheduleFormTimezone('CST - Central Standard Time');
          break;
        case 'America/Denver':
          setScheduleFormTimezone('MST - Mountain Standard Time');
          break;
        case 'America/Los_Angeles':
          setScheduleFormTimezone('PST - Pacific Standard Time');
          break;
        default:
          setScheduleFormTimezone('EST - Eastern Standard Time');
      }
      setScheduleFormData(formData);
      setShowConfirmModal(true);
    }
  };

  const saveEmailExecutionSchedule = (formData) => {
    setShowConfirmModal(false);
    setScheduleName(formData.name);
    let sharedType = '';
    let sharedGroups = [0];

    // specific group
    if (
      managerValues !== null &&
      managerValues.length !== 0 &&
      multiselectUsers.length !== managerValues.length
    ) {
      sharedGroups = managerValues;
      sharedType = 'specificGroupOfUsers';
    }
    // all users
    else if (
      managerValues !== null &&
      multiselectUsers.length === managerValues.length
    ) {
      sharedGroups = managerValues;
      sharedType = 'allUsers';
    }
    // none
    else {
      sharedType = 'none';
    }

    if (currentScheduleId === undefined || match.params.action === 'clone') {
      const input = {
        name: formData.name.trim(),
        timezone: formData.timezone,
        excludeHolidays: formData.excludeHolidays,
        useProspectTimezone: formData.useProspectTimezone,
        includeWeekends: formData.includeWeekends,
        sharedType: currentUserManager === 'Y' ? sharedType : 'none',
        sharedGroups: currentUserManager === 'Y' ? sharedGroups : undefined,
      };
      addEmailSchedule({
        variables: {
          input,
        },
      });
    } else {
      const input = {
        name: formData.name,
        timezone: formData.timezone,
        excludeHolidays: formData.excludeHolidays,
        useProspectTimezone: formData.useProspectTimezone,
        includeWeekends: formData.includeWeekends,
        sharedType:
          currentUserManager === 'Y' && existingSharedType === 'none'
            ? sharedType
            : undefined,
        sharedGroups:
          currentUserManager === 'Y' && existingSharedType === 'none'
            ? sharedGroups
            : undefined,
      };
      editEmailSchedule({
        variables: {
          input,
        },
      });
    }
  };

  const getTimeSlotsValues = () => {
    let allTimeSlotsEmpty = true;
    // saving timeslots in final arrays to send to api
    Object.keys(activeBlocksState).forEach((item) => {
      const timeSlotsToSave = Object.keys(activeBlocksState[item])
        .filter((subItem) => {
          return activeBlocksState[item][subItem] === true;
        })
        .map((subItem) => {
          return parseInt(subItem) + 1;
        });

      setFinalTimeSlotsToSave((prevState) => {
        return {
          ...prevState,
          [item]: timeSlotsToSave,
        };
      });

      if (timeSlotsToSave.length > 0) {
        allTimeSlotsEmpty = false;
      }
    });

    if (allTimeSlotsEmpty) {
      notify('Schedule time is mandatory', 'error', 'time_slot_error');
      return false;
    }
  };

  const addScheduleCallBack = (response, status, responseData) => {
    if (finalTimeSlotsToSave['Monday'].length > 0) {
      touchExecutionTimeSlots.push({
        weekday: 1,
        timeslot: finalTimeSlotsToSave['Monday'],
      });
    }
    if (finalTimeSlotsToSave['Tuesday'].length > 0) {
      touchExecutionTimeSlots.push({
        weekday: 2,
        timeslot: finalTimeSlotsToSave['Tuesday'],
      });
    }
    if (finalTimeSlotsToSave['Wednesday'].length > 0) {
      touchExecutionTimeSlots.push({
        weekday: 3,
        timeslot: finalTimeSlotsToSave['Wednesday'],
      });
    }
    if (finalTimeSlotsToSave['Thursday'].length > 0) {
      touchExecutionTimeSlots.push({
        weekday: 4,
        timeslot: finalTimeSlotsToSave['Thursday'],
      });
    }
    if (finalTimeSlotsToSave['Friday'].length > 0) {
      touchExecutionTimeSlots.push({
        weekday: 5,
        timeslot: finalTimeSlotsToSave['Friday'],
      });
    }
    if (show) {
      if (finalTimeSlotsToSave['Saturday'].length > 0) {
        touchExecutionTimeSlots.push({
          weekday: 6,
          timeslot: finalTimeSlotsToSave['Saturday'],
        });
      }
      if (finalTimeSlotsToSave['Sunday'].length > 0) {
        touchExecutionTimeSlots.push({
          weekday: 0,
          timeslot: finalTimeSlotsToSave['Sunday'],
        });
      }
    }

    if (status) {
      if (currentScheduleId === undefined || match.params.action === 'clone') {
        const input = {
          scheduleId: response.schedule.data[0].id,
          touchExecutionTimeSlots: touchExecutionTimeSlots,
        };
        addEmailScheduleTimeSlot({
          variables: {
            input,
          },
        });
      } else {
        const input = {
          scheduleId: currentScheduleId,
          touchExecutionTimeSlots: touchExecutionTimeSlots,
        };
        addEmailScheduleTimeSlot({
          variables: {
            input,
          },
        });
      }
    } else {
      showErrorMessage(response, failedMsg, responseData, 'add_schedule_error');
    }
  };

  const addTimeSlotCallBack = (response, status) => {
    if (status) {
      notify(successMsg, 'success', 'add_time_slot');
      pathName && filters
        ? history.push({
            pathname: pathName,
            search: filters,
          })
        : history.push('/settings/emailExecutionSchedule');
    } else {
      showErrorMessage(
        response,
        failedMsg,
        createTimeslotData,
        'add_time_slot'
      );
    }
  };

  const toggleActiveBlock = (day, index) => {
    setActiveBlocksState((prevState) => {
      return {
        ...prevState,
        [day]: {
          ...prevState[day],
          [index]: prevState[day][index] ? !prevState[day][index] : true,
        },
      };
    });
  };

  const copyFromAbove = (day) => {
    switch (day) {
      case 'Tuesday':
        setActiveBlocksState((prevState) => {
          return {
            ...prevState,
            [day]: prevState['Monday'],
          };
        });
        break;
      case 'Wednesday':
        setActiveBlocksState((prevState) => {
          return {
            ...prevState,
            [day]: prevState['Tuesday'],
          };
        });
        break;
      case 'Thursday':
        setActiveBlocksState((prevState) => {
          return {
            ...prevState,
            [day]: prevState['Wednesday'],
          };
        });
        break;
      case 'Friday':
        setActiveBlocksState((prevState) => {
          return {
            ...prevState,
            [day]: prevState['Thursday'],
          };
        });
        break;
      case 'Saturday':
        setActiveBlocksState((prevState) => {
          return {
            ...prevState,
            [day]: prevState['Friday'],
          };
        });
        break;
      case 'Sunday':
        setActiveBlocksState((prevState) => {
          return {
            ...prevState,
            [day]: prevState['Saturday'],
          };
        });
        break;
      default:
        break;
    }
  };

  return (
    <Card className="b">
      <Breadcrumb className="mb-0">
        <Link
          to={`/settings/emailExecutionSchedule${filters}`}
          className="breadcrumb-item"
        >
          Email Execution Schedule
        </Link>
        <BreadcrumbItem active>{action}</BreadcrumbItem>
        <i
          className={
            'ml-2 ' +
            (fetchScheduleLoading
              ? 'fas fa-spinner fa-spin'
              : fetchScheduleError && action !== 'Add'
              ? 'fas fa-exclamation-circle text-danger'
              : '')
          }
          title={fetchScheduleError ? 'Sorry! Failed to fetch data' : 'Loading'}
        ></i>
      </Breadcrumb>
      <CardBody className="bt">
        <Form innerRef={formRef} autoComplete="off">
          <FormGroup row>
            <Label xl={3} lg={3} md={4} sm={4} className="pr-0">
              Schedule Name
            </Label>
            <Col
              xl={3}
              lg={3}
              md={3}
              sm={3}
              className="ml-xl-n5 ml-lg-n3 ml-md-n2 px-0"
            >
              <Input
                type="text"
                name="name"
                maxLength={100}
                data-validate='["required"]'
                invalid={hasError('name', 'required')}
                innerRef={register({})}
              ></Input>
              <div className="invalid-feedback">Please enter schedule name</div>
            </Col>
          </FormGroup>
          <FormGroup row className="mb-0">
            <Label xl={3} lg={3} md={4} sm={4} className="pr-0">
              Default Timezone
            </Label>
            <Col
              xl={3}
              lg={3}
              md={3}
              sm={3}
              className="ml-xl-n5 ml-lg-n3 ml-md-n2 px-0"
            >
              <Input
                type="select"
                name="timezone"
                data-validate='["required"]'
                invalid={hasError('timezone', 'required')}
                innerRef={register({})}
                onChange={(e) => {
                  if (americanTimezones.indexOf(e.currentTarget.value) === -1) {
                    setDisableSharedType(true);
                  } else {
                    setDisableSharedType(false);
                  }
                }}
              >
                <option></option>
                <option value="America/New_York">
                  EST - Eastern Standard Time
                </option>
                <option value="America/Chicago">
                  CST - Central Standard Time
                </option>
                <option value="America/Denver">
                  MST - Mountain Standard Time
                </option>
                <option value="America/Los_Angeles">
                  PST - Pacific Standard Time
                </option>
                {!disableLocalTime &&
                  americanTimezones.indexOf(user.timeZone) === -1 && (
                    <option value={user.timeZone}>
                      Local Time ({user.timeZone})
                    </option>
                  )}
              </Input>
              <div className="invalid-feedback">Please select time zone</div>
            </Col>
          </FormGroup>
          <Row className="my-3">
            <Col xl={3} lg={3} md={4} sm={4} className="pr-0"></Col>
            <Col
              xl={9}
              lg={9}
              md={8}
              sm={8}
              className="ml-xl-n5 ml-lg-n3 ml-md-n2 px-0"
            >
              <FormGroup check>
                <Input
                  type="checkbox"
                  id="use_prospect_timezone"
                  name="useProspectTimezone"
                  innerRef={register({})}
                  className="mt-1"
                />
                <Label for="use_prospect_timezone" className="mb-0">
                  Send Emails using Prospects Time Zone if available
                </Label>
              </FormGroup>
            </Col>
          </Row>
          {currentUserManager === 'Y' && (
            <FormGroup row>
              <Label xl={3} lg={3} md={4} sm={4} className="pr-0">
                Share this schedule with
              </Label>
              <Col
                xl={3}
                lg={3}
                md={3}
                sm={3}
                className="ml-xl-n5 ml-lg-n3 ml-md-n2 px-0"
              >
                <DropDown
                  name="sharedType"
                  data={multiselectUsers}
                  ref={dropDownRef}
                  value={managerValues}
                  onChange={(value) => {
                    if (value.length > 0) {
                      setDisableLocalTime(true);
                    } else {
                      setDisableLocalTime(false);
                    }
                    setManagerValues(value);
                  }}
                  placeHolder="Select Users"
                  multiselect={true}
                  loading={fetchManagerLoading}
                  error={fetchManagerError}
                  disableOptions={
                    disableSharedType || disableEditSharedType ? true : false
                  }
                />
                <div className="invalid-feedback">
                  Please select shared users
                </div>
              </Col>
            </FormGroup>
          )}
          <FormGroup row className="mb-0">
            <Col xl={3} lg={3} md={12} sm={12} className="pr-0"></Col>
            <Col
              xl={2}
              lg={2}
              md={4}
              sm={3}
              className="ml-xl-n5 ml-lg-n3 px-lg-0 pr-md-0 mr-xl-n2"
            >
              <FormGroup check>
                <Input
                  type="checkbox"
                  id="include_week_ends"
                  name="includeWeekends"
                  onClick={() => {
                    setShow(!show);
                  }}
                  innerRef={register({})}
                  className="mt-1"
                />
                <Label for="include_week_ends" className="text-nowrap">
                  Include Weekends
                </Label>
              </FormGroup>
            </Col>
            <Col
              xl={6}
              lg={6}
              md={7}
              sm={7}
              className="ml-xl-n4 px-xl-0 pr-lg-0 ml-md-n4 ml-sm-3"
            >
              <FormGroup check className="text-nowrap">
                <Input
                  type="checkbox"
                  id="exclude_week_ends"
                  name="excludeHolidays"
                  innerRef={register({})}
                  className="mt-1"
                />
                <Label for="exclude_week_ends">
                  Exclude Holidays (This will exclude all Federal Holidays)
                </Label>
                <i
                  className="fas fa-info-circle text-warning ml-2"
                  onClick={() => {
                    setShowHolidayModal(true);
                  }}
                ></i>
              </FormGroup>
            </Col>
          </FormGroup>
          <Row>
            <Col xl={3} lg={3} md={12} sm={12} className="pr-0">
              <p>
                <strong>Choose Time Blocks</strong>
              </p>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col sm={12}>
              <FormGroup row>
                <Col sm={12}>
                  <div className="timeshedule">
                    <div className="schedule pb-2 pl-1">
                      <Row>
                        <Col xl={2} lg={2} md={3} sm={3}>
                          <div className="header">
                            {daysArray.map((day, index) => {
                              if (
                                ['Saturday', 'Sunday'].indexOf(day) === -1 ||
                                show
                              ) {
                                return (
                                  <div
                                    className={`header-item ${day}-header`}
                                    key={day + '_' + index}
                                  >
                                    <h3 className="text-nowrap">
                                      <i
                                        className="fas fa-copy mr-2 pointer"
                                        title={
                                          day !== 'Monday'
                                            ? 'Copy from above'
                                            : ''
                                        }
                                        onClick={() => {
                                          if (day !== 'Monday') {
                                            copyFromAbove(day);
                                          }
                                        }}
                                      ></i>
                                      {day}
                                    </h3>
                                  </div>
                                );
                              } else {
                                return false;
                              }
                            })}
                          </div>
                        </Col>
                        <Col
                          xl={10}
                          lg={10}
                          md={9}
                          sm={9}
                          className="ml-xl-n5 ml-lg-n3 ml-md-n4 ml-sm-n4 px-sm-0"
                        >
                          <div className="tbgwidth mb-4">
                            <div className="hour-header">
                              {hoursArray.map((hour, index) => {
                                return (
                                  <div
                                    className="hour-header-item"
                                    key={hour + '_' + index}
                                  >
                                    <h5>{hour}</h5>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="days-wrapper">
                              {daysArray.map((day, index) => {
                                return (
                                  <div
                                    className={`day ${day}`}
                                    key={day + '_' + index}
                                  >
                                    {hoursArray.map((hour, hourIndex) => {
                                      if (
                                        ['Saturday', 'Sunday'].indexOf(day) ===
                                          -1 ||
                                        show
                                      ) {
                                        return (
                                          <div
                                            key={hour + '_' + hourIndex}
                                            title={`${day} ${hour}`}
                                            className={
                                              activeBlocksState[day][hourIndex]
                                                ? 'active-block'
                                                : 'hour'
                                            }
                                            onClick={(e) => {
                                              toggleActiveBlock(day, hourIndex);
                                            }}
                                          ></div>
                                        );
                                      } else {
                                        return false;
                                      }
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <Row>
                            <Col>
                              <CloseButton
                                btnTxt="Cancel"
                                color="light"
                                onClick={() => {
                                  history.push({
                                    pathname: `/settings/emailExecutionSchedule`,
                                    search: filters,
                                  });
                                }}
                              ></CloseButton>
                              <Button
                                color="primary"
                                className="float-right"
                                disabled={
                                  scheduleLoading ||
                                  createTimeslotLoading ||
                                  editScheduleLoading ||
                                  (defaultSchedule &&
                                    match.params.action === 'edit')
                                }
                                icon={
                                  scheduleLoading ||
                                  createTimeslotLoading ||
                                  editScheduleLoading
                                    ? 'fas fa-spinner fa-spin'
                                    : 'fas fa-check'
                                }
                                onClick={() => {
                                  emailScheduleSubmit();
                                }}
                              >
                                {scheduleLoading ||
                                createTimeslotLoading ||
                                editScheduleLoading
                                  ? 'Wait...'
                                  : 'Save & Close'}
                              </Button>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </Col>
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </CardBody>

      <HolidayModal
        hideModal={() => {
          setShowHolidayModal(false);
        }}
        showModal={showHolidayModal}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => setShowConfirmModal(false)}
        showConfirmModal={showConfirmModal}
        handleConfirm={() => saveEmailExecutionSchedule(scheduleFormData)}
        confirmBtnColor="primary"
      >
        <div>
          <span>You have chosen to send emails in prospects timezone.</span>
          <br></br>
          <span>
            {`Please be advised this could mean emails will be sending as early as 12:00 am ${scheduleFormTimezone}. Would you like to proceed?`}
          </span>
        </div>
      </ConfirmModal>
    </Card>
  );
};

export default AddEmailExecutionSchedule;
