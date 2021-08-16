import React, { useEffect, useMemo, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '@hookform/error-message';
import {
  Button,
  Card,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import moment from 'moment-timezone';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { notify } from '../../../util/index';
import ClButton from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import { FETCH_SCHEDULE_QUERY } from '../../queries/TouchQuery';
import {
  FETCH_CADENCE_QUERY,
  FETCH_ASSIGNED_TEAMS_QUERY,
} from '../../queries/CadenceQuery';
import SearchEmailTemplateModal from './SearchEmailTemplateModal';
import TemplatePreview from './TemplatePreview';
import WorkflowActions from './WorkflowActions';
toast.configure();

const EmailTouchModal = ({
  showModal,
  hideModal,
  loading,
  getTouchLoading,
  getTouchError,
  currentUserId,
  currentCadence,
  handleAction,
  editFlag,
  editData,
  editOutcome,
  editTemplate,
  cadenceId,
  editRestrict,
  userIds,
  isFirstEmailTouch,
  touchNumber,
  isEmailTouches,
  touchData,
  emailTemplates,
}) => {
  // will be uncommented in later version
  // const { user, loading: userLoading } = useContext(UserContext);
  // const userTimezone = !userLoading && user?.timeZone;

  const [scheduleLimit] = useState(500);
  const [scheduleOffset, setScheduleOffset] = useState(0);
  const [allschedule, setAllSchedule] = useState([]);
  const [Personalize, setPersonalize] = useState(false);
  const [moveProspectState, setMoveProspectState] = useState(true);
  // will be uncommented in later version
  // const [useProspectTimezone, setUseProspectTimezone] = useState(true);
  // const [includeProspectResponse, setIncludeProspectResponse] = useState(false);
  const [scheduleTypeState, setScheduleTypeState] = useState(
    'Send by execution schedule'
  );
  const [emailTouchType, setEmailTouchType] = useState('');
  const [templateSearch, setTemplateSearch] = useState();
  const [emailTouchFilter] = useState(`&filter[touchType]=EMAIL`);
  const [ShowSearchEmailTemplateModal, setSearchEmailTemplateModal] = useState(
    false
  );
  const [templateFilter, setTemplateFilter] = useState(
    `filter[sharedType]=:[allUsers]&filter[user][id]=${
      userIds ? userIds : currentUserId
    }`
  );
  const searchRef = React.useRef();
  const [userFilter, setUserFilter] = useState();
  const [selectedTemplateIds, setSelectedTemplateIds] = useState([]);
  const [workflowViewed, setWorkflowViewed] = useState(0);
  const [workFlowConfirm, setWorkFlowConfirm] = useState(false);
  const [formData, setFormData] = useState();
  const [selectedTemplate, setSelectedTemplate] = useState();
  const [workflowActionsOpen, setWorkflowActionsOpen] = useState(false);
  const [totalProspects, setTotalProspects] = useState(0);
  const [createTemplate, setCreateTemplate] = useState(false);
  const [teamUser, setTeamUser] = useState([]);
  const [assignUsers, setAssignUsers] = useState([]);
  const [isOutcomeIssue, setIsOutcomeIssue] = useState(false);
  const [parentTemplateSubject, setParentTemplateSubject] = useState();
  // will be uncommented in later version
  // const [optOutEnabled, setOptOutEnabled] = useState(false);
  // const [includeOptout, setIncludeOptout] = useState(false);

  const editState = editFlag ? true : false;
  const scheduleListData = [];
  let outcomes, emailTouchDataEdit;
  const { handleSubmit, register, errors, reset, setValue } = useForm();

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    setEmailTouchType('');
    // if editFlag is set, then populate form using editData
    if (editFlag && editData[0]) {
      const touchEditData = editData[0];
      if (editTemplate && editTemplate.length > 0) {
        setSelectedTemplateIds(editTemplate);
      }

      if (touchEditData.scheduleType) {
        setScheduleTypeState(touchEditData.scheduleType);
      }

      if (touchEditData.emailTouchType === 'Reply') {
        setEmailTouchType('Reply');
      }
      if (touchEditData.moveProspectsWhenTimeExceeds === true) {
        setMoveProspectState(true);
      } else {
        setMoveProspectState(false);
      }

      // will be uncommented in later version
      // if (touchEditData.useProspectTimezone === true) {
      //   setUseProspectTimezone(true);
      // } else {
      //   setUseProspectTimezone(false);
      // }
      setTotalProspects(touchEditData.total);

      // eslint-disable-next-line react-hooks/exhaustive-deps
      emailTouchDataEdit = {
        timeToWaitAndExecute: touchEditData.waitPeriodBeforeStart,
        timeToWaitUnit: touchEditData.waitPeriodUnit,
        templateName: touchEditData?.associations?.emailTemplate?.id,
        emailTouchType:
          touchEditData.emailTouchType === 'New' ? 'New' : 'Reply',
        previewEmailFlag:
          touchEditData.previewEmailFlag === true
            ? setPersonalize(true)
            : setPersonalize(false),
        //will be uncommented in later versions
        // includeOptout:
        //   touchEditData.includeOptout === true
        //     ? setIncludeOptout(true)
        //     : setIncludeOptout(false),
        // includeProspectResponseFlag:
        //   touchEditData.includeProspectResponseFlag === true
        //     ? setIncludeProspectResponse(true)
        //     : setIncludeProspectResponse(false),
        timeToComplete: touchEditData.timeToComplete,
        timeToCompleteUnit: touchEditData.timeToCompleteUnit,
        scheduleType: touchEditData.scheduleType,
        scheduledDate:
          getFormattedDate(
            touchEditData.scheduledDateTime,
            touchEditData.scheduledTimezone
          ) || getFormattedDate(new Date(), 'America/New_York'),
        scheduleTime:
          getFormattedTime(
            touchEditData.scheduledDateTime,
            touchEditData.scheduledTimezone
          ) || getFormattedTime(new Date(), 'America/New_York'),
        touchExecutionScheduleId:
          touchEditData &&
          touchEditData.associations &&
          touchEditData.associations.schedule[0] &&
          touchEditData.associations.schedule[0].id,
        scheduledTimezone:
          touchEditData.scheduleTimezone !== null
            ? touchEditData.scheduleTimezone
            : 'America/New_York',
      };
      reset(emailTouchDataEdit);
    }
  }, [editData]);

  const getFormattedDate = (dateTime, timeZone) => {
    const formattedDate = moment.tz(dateTime, timeZone).format('YYYY-MM-DD');

    return formattedDate;
  };
  const getFormattedTime = (dateTime, timeZone) => {
    const formattedTime = moment.tz(dateTime, timeZone).format('HH:mm');

    return formattedTime;
  };

  useEffect(() => {
    if (!editFlag) {
      reset({
        scheduledDate: getFormattedDate(new Date(), 'America/New_York'),
        scheduleTime: getFormattedTime(new Date(), 'America/New_York'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeDuplicatesArrayValues = (arr) => {
    const filteredArray = arr.filter(function (item, pos) {
      return arr.indexOf(item) === pos;
    });
    return filteredArray;
  };

  // will be uncommented in later versions
  // const americanTimezones = [
  //   'America/New_York',
  //   'America/Chicago',
  //   'America/Denver',
  //   'America/Los_Angeles',
  // ];

  // fetching 'include_opt_out' to enable or disable the opt out checkbox in email touch modal
  // const { data: fetchIncludeOptoutData } = useQuery(FETCH_INCLUDE_OPT_OUT, {
  //   variables: {
  //     lookupName: 'include_opt_out',
  //   },
  //   onCompleted: (response) => {
  //     setOptOutEnabled(
  //       response?.IncludeOptout?.data[0]?.lookupValue === 'true'
  //     );
  //   },
  //   onError: (response) => {
  //     showErrorMessage(
  //       response,
  //       'Sorry! Failed to fetch opt-out flag',
  //       fetchIncludeOptoutData,
  //       'fetch_opt_out_flag'
  //     );
  //   },
  // });

  const { data: cadenceData } = useQuery(FETCH_CADENCE_QUERY, {
    variables: { id: cadenceId },
    notifyOnNetworkStatusChange: true,
    skip: !showModal,
  });

  const cadencesharedType = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].sharedType,
    [cadenceData]
  );

  const cadencesharedUsers = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].sharedUsers,
    [cadenceData]
  );

  const cadenceSharedTeams = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].sharedGroups,
    [cadenceData]
  );

  const { data: assignedTeamsData } = useQuery(FETCH_ASSIGNED_TEAMS_QUERY, {
    variables: { limit: 200, offset: 0 },
    fetchPolicy: 'cache-first',
  });
  const teamData = useMemo(
    () =>
      assignedTeamsData && assignedTeamsData.teams
        ? assignedTeamsData.teams.data
        : [],
    [assignedTeamsData]
  );
  useEffect(() => {
    if (cadenceSharedTeams) {
      const sharedTeam =
        teamData &&
        teamData.filter((team) => cadenceSharedTeams.includes(team.groupName));
      const team =
        sharedTeam &&
        sharedTeam
          .map((team) => team.associations.user[0].id)
          .concat(currentUserId);
      setTeamUser(team);
    }

    if (cadencesharedUsers) {
      cadencesharedUsers.concat(currentUserId);
      setAssignUsers(removeDuplicatesArrayValues(cadencesharedUsers));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadenceSharedTeams, cadencesharedUsers]);

  useEffect(() => {
    if (cadencesharedType) {
      if (cadencesharedType === 'none') {
        setUserFilter(`&filter[user][id]=${userIds ? userIds : currentUserId}`);
      } else if (cadencesharedType === 'allUsers') {
        setUserFilter(
          `&filter[sharedType]=allUsers&filter[user][id]=${
            userIds ? userIds : currentUserId
          }`
        );
      } else if (cadencesharedType === 'shareWithUsers') {
        setUserFilter(
          `&filter[user][id]=:[${assignUsers}]&filter[sharedType]=:[allUsers,shareWithUsers]`
        );
      } else {
        setUserFilter(
          `&filter[user][id]=:[${teamUser}]&filter[sharedType]=:[allUsers,specificGroupOfUsers]`
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadencesharedType, cadencesharedUsers, teamUser, assignUsers]);

  // save email touch
  const onSubmitEmailTouch = (data) => {
    // templateIds will hold the template ids
    const templateIds = selectedTemplateIds.map((template) => template.id);
    // removing duplicates from templateIds array
    const templateIdsUnique = templateIds.filter(function (item, index) {
      return templateIds.indexOf(item) === index;
    });
    // if no cadence is selected in dropdown for 'Move To Another Cadence', return false
    const cadenceNotSelectedInDropdown =
      outcomes &&
      outcomes.filter(
        (item) =>
          item.action === 'Move To Another Cadence' &&
          parseInt(item.cadence.id) === 0
      );
    if (cadenceNotSelectedInDropdown?.length > 0) {
      return false;
    } else if (workflowViewed === 0 && !workflowActionsOpen) {
      setSelectedTemplate(templateIdsUnique);
      setFormData(data);
      setWorkFlowConfirm(true);
    } else {
      handleAction(data, templateIdsUnique, outcomes);
      // resetting template ids to empty array as on opening another modal, same template are selected again
      setSelectedTemplateIds([]);
      setWorkflowActionsOpen(false);
      setWorkflowViewed(0);
    }
  };

  const removeDuplicates = (array) => {
    const result = [];
    const map = new Map();
    for (const item of array) {
      if (!map.has(item.id)) {
        map.set(item.id, true);
        result.push({
          id: item.id,
          name: item.name,
        });
      }
    }
    return result;
  };

  const removeTemplate = (id) => {
    // if editFlag is true and the touch contains more than 0 prospects and there is only one template, we can't remove that template
    if (editFlag && totalProspects > 0 && selectedTemplateIds.length === 1) {
      notify(
        'Sorry! You cannot remove this template as there are prospects assigned to this touch.',
        'error',
        'remove_template'
      );
    } else {
      const filteredAry = selectedTemplateIds.filter((item) => item.id !== id);
      setSelectedTemplateIds(filteredAry);
    }
  };

  const [
    getScheduleData,
    {
      data: emailSchedulesData,
      loading: schedulesLoading,
      error: scheduleError,
    },
  ] = useLazyQuery(FETCH_SCHEDULE_QUERY, {
    onCompleted: (data) => {
      if (data && cadencesharedType) {
        setAllSchedule([...allschedule, data.schedules.data]);

        if (
          (scheduleOffset + 1) * scheduleLimit <
          data.schedules.paging.totalCount
        ) {
          setScheduleOffset(scheduleOffset + 1);
        }
      }
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: !showModal && !cadencesharedType,
  });
  useEffect(() => {
    if (userFilter) {
      getScheduleData({
        variables: {
          limit: scheduleLimit,
          offset: scheduleOffset,
          userFilter: userFilter,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleLimit, scheduleOffset, userFilter]);

  const handleEmailSearch = () => {
    if (cadencesharedType) {
      if (cadencesharedType === 'none') {
        setTemplateFilter(
          `filter[shared]=true&filter[user][id]=${
            userIds ? userIds : currentUserId
          }`
        );
      } else if (cadencesharedType === 'allUsers') {
        setTemplateFilter(
          `filter[shared]=true&filter[sharedType]=allUsers&filter[user][id]=${
            userIds ? userIds : currentUserId
          }`
        );
      } else if (cadencesharedType === 'shareWithUsers') {
        setTemplateFilter(
          `filter[user][id]=:[${removeDuplicatesArrayValues(
            cadencesharedUsers
          )}]&filter[shared]=true&filter[sharedType]=:[allUsers,shareWithUsers]`
        );
      } else {
        setTemplateFilter(
          `filter[user][id]=:[${teamUser}]&filter[shared]=true&filter[sharedType]=:[allUsers,specificGroupOfUsers]`
        );
      }
    }
    setTemplateSearch(searchRef.current.value.trim());
    setSearchEmailTemplateModal(true);
    searchRef.current.value = '';
  };

  const schedulesData = allschedule && allschedule;
  if (schedulesData) {
    for (let l = 0; l < schedulesData.length; l++) {
      for (let k = 0; k < schedulesData[l].length; k++) {
        scheduleListData.push(schedulesData[l][k]);
      }
    }
  }

  const removeByAttr = function (arr, attr, value) {
    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i] &&
        // eslint-disable-next-line no-prototype-builtins
        arr[i].hasOwnProperty(attr) &&
        arguments.length > 2 &&
        arr[i][attr] === value
      ) {
        arr.splice(i, 1);
      }
    }
    return arr;
  };

  const handleCreateTemplate = () => {
    if (emailTouchType === 'Reply' && isEmailTouches) {
      let previousEmailTouchTemplate;
      if (editFlag) {
        const touchNumbers = isEmailTouches
          ?.filter((touch) => touch.stepNo < touchNumber)
          .map((item) => item.stepNo);
        const parentTouchNumber = touchNumbers[touchNumbers.length - 1];
        previousEmailTouchTemplate = isEmailTouches
          ?.filter((touch) => touch.stepNo === parseInt(parentTouchNumber))
          .map((item) => item?.associations?.emailTemplate[0]?.id);
      } else {
        const parentEmailTouch = isEmailTouches[isEmailTouches.length - 1];

        previousEmailTouchTemplate =
          parentEmailTouch?.associations?.emailTemplate[0]?.id;
      }
      const previousEmailTouchTemplateSubject = emailTemplates
        ?.filter((temp) => temp.id === parseInt(previousEmailTouchTemplate))
        .map((temp) => temp.subject);
      setParentTemplateSubject(previousEmailTouchTemplateSubject?.toString());
    } else {
      setParentTemplateSubject('');
    }
    setCreateTemplate(true);
  };

  return (
    <Modal size="lg" isOpen={showModal} centered className="container-md">
      <Form name="addEmailTouch" onSubmit={handleSubmit(onSubmitEmailTouch)}>
        <ModalHeader
          toggle={() => {
            setWorkflowActionsOpen(false);
            hideModal();
          }}
        >
          <i
            className={`mr-2 ${
              getTouchLoading || schedulesLoading
                ? 'fas fa-spinner fa-spin ml-2'
                : Personalize
                ? 'svgicon emailEdit text-email'
                : 'fas fa-envelope text-auto-email'
            }`}
          ></i>
          {`${editState ? 'Edit' : 'Add'} Email Touch - #${touchNumber} ${
            workflowActionsOpen === true
              ? `/ ${editState ? 'Edit' : 'Define'} workflow`
              : ''
          }`}
        </ModalHeader>
        <ModalBody className="px-5">
          {(getTouchError || scheduleError) && (
            <Row className="py-2 bg-gray-lighter">
              <Col className="text-center">
                <h6 className="text-danger mb-0">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch data
                </h6>
                {(touchData?.requestId || emailSchedulesData?.requestId) && (
                  <>
                    <br />
                    <span className="text-danger text-sm">{`RequestId: ${
                      touchData?.requestId || emailSchedulesData?.requestId
                    }`}</span>
                  </>
                )}
              </Col>
            </Row>
          )}
          {!(getTouchLoading || schedulesLoading) &&
            !(getTouchError || scheduleError) &&
            scheduleListData.length > 0 && (
              <>
                <div
                  className={
                    workflowActionsOpen === false ? 'd-block px-4' : 'd-none'
                  }
                >
                  <Label
                    for="time_to_wait_and_execute"
                    className="text-bold mb-1"
                  >
                    Time to wait and Execute
                  </Label>

                  <Row>
                    <Col md={7}>
                      <FormGroup>
                        <Input
                          type="number"
                          min="0"
                          maxLength="6"
                          onInput={(e) => {
                            if (e.target.value.length > e.target.maxLength) {
                              e.target.value = e.target.value.slice(
                                0,
                                e.target.maxLength
                              );
                            }
                          }}
                          name="timeToWaitAndExecute"
                          step="1"
                          invalid={errors.timeToWaitAndExecute}
                          innerRef={register({
                            required: editFlag
                              ? 'Required Time to wait and execute'
                              : false,
                          })}
                        />
                        <ErrorMessage
                          errors={errors}
                          name="timeToWaitAndExecute"
                          className="invalid-feedback"
                          as="p"
                        ></ErrorMessage>
                      </FormGroup>
                    </Col>
                    <Col md={5}>
                      <FormGroup>
                        <Input
                          type="select"
                          name="timeToWaitUnit"
                          invalid={errors.timeToWaitUnit}
                          innerRef={register({
                            required: editFlag
                              ? 'Time unit is required'
                              : false,
                          })}
                        >
                          <option></option>
                          <option value="Mi">Minute(s)</option>
                          <option value="Ho">Hour(s)</option>
                          <option value="Da">Day(s)</option>
                        </Input>
                        <ErrorMessage
                          errors={errors}
                          name="timeToWaitUnit"
                          className="invalid-feedback"
                          as="p"
                        ></ErrorMessage>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Label for="add_prospect_title" className="text-bold mb-1">
                    Choose Templates{' '}
                  </Label>

                  <FormGroup>
                    <InputGroup>
                      <Input
                        type="text"
                        innerRef={searchRef}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleEmailSearch();
                          }
                        }}
                      />
                      <InputGroupAddon addonType="append">
                        <Button
                          onClick={() => {
                            handleEmailSearch();
                          }}
                        >
                          <i className="fa fa-search"></i>
                        </Button>
                        <Button
                          title="Create Email Template"
                          onClick={() => {
                            if (selectedTemplateIds?.length >= 5) {
                              notify(
                                'You can choose only upto 5 Templates',
                                'error',
                                'max_template_limit'
                              );
                            } else {
                              handleCreateTemplate();
                            }
                          }}
                        >
                          <i className="fas fa-plus-circle"></i>
                        </Button>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>

                  <Row hidden={selectedTemplateIds.length === 0}>
                    <Col className="d-flex flex-row">
                      <FormGroup>
                        {selectedTemplateIds &&
                          removeDuplicates(selectedTemplateIds)
                            .filter((template, i) => {
                              return selectedTemplateIds[i] !== undefined;
                            })
                            .map((template, i) => {
                              return (
                                <Label
                                  color="outline"
                                  key={i}
                                  title={template.name}
                                  className="py-0 px-2 mr-2 border btn-xs"
                                >
                                  {template.name.length > 30
                                    ? template.name.slice(0, 29) + '..'
                                    : template.name}
                                  <span className="btn-label btn-label-right bg-white pl-0 pr-1 pointer">
                                    <i
                                      className="fas fa-times text-danger"
                                      onClick={(e) =>
                                        removeTemplate(template.id, e)
                                      }
                                    ></i>
                                  </span>
                                </Label>
                              );
                            })}
                      </FormGroup>
                    </Col>
                  </Row>

                  <Label for="email_touch_type" className="text-bold mb-1">
                    Email Touch Type
                  </Label>

                  <FormGroup>
                    <Input
                      type="select"
                      name="emailTouchType"
                      id="email_touch_type"
                      innerRef={register(true)}
                      disabled={isFirstEmailTouch}
                      onChange={(e) => {
                        setEmailTouchType(e.target.value);
                      }}
                    >
                      <option value="New">New Email</option>
                      <option
                        hidden={!(isEmailTouches && isEmailTouches.length > 0)}
                        value="Reply"
                      >
                        Reply Email
                      </option>
                    </Input>
                  </FormGroup>
                  {/* hidden for now, will be available in later versions */}
                  {/* {emailTouchType === 'Reply' && (
                    <FormGroup className="ml-4">
                      <Input
                        type="checkbox"
                        name="includeProspectResponseFlag"
                        id="include_prospect_response_flag"
                        checked={includeProspectResponse}
                        onChange={() => {
                          setIncludeProspectResponse(!includeProspectResponse);
                        }}
                        innerRef={register(true)}
                      />
                      <Label
                        for="include_prospect_response_flag"
                        className="mb-1"
                      >
                        Include Prospect Response
                      </Label>
                    </FormGroup>
                  )} */}

                  <Row>
                    <FormGroup className="ml-4">
                      <Input
                        type="checkbox"
                        name="previewEmailFlag"
                        id="preview_email_flag"
                        checked={Personalize}
                        onChange={() => {
                          setPersonalize(!Personalize);
                        }}
                        innerRef={register(true)}
                      />
                      <Label for="preview_email_flag" className="mb-1">
                        Personalize Email before send
                      </Label>
                    </FormGroup>
                    {/* hidden for now, will be available in later versions */}
                    {/* show opt out checkbox only if enabled at org level */}
                    {/* {optOutEnabled && (
                      <FormGroup className="ml-5">
                        <Input
                          type="checkbox"
                          name="includeOptout"
                          id="include_opt_out"
                          checked={includeOptout}
                          onChange={() => {
                            setIncludeOptout(!includeOptout);
                          }}
                          innerRef={register(true)}
                        />
                        <Label for="include_opt_out" className="mb-1">
                          Include Opt-out link
                        </Label>
                      </FormGroup>
                    )} */}
                  </Row>

                  {Personalize && (
                    <>
                      <Label for="time_to_complete" className="text-bold mb-1">
                        Maximum Time to complete the Touch
                      </Label>
                      <Row>
                        <Col md={7}>
                          <FormGroup>
                            <Input
                              type="number"
                              min="1"
                              maxLength="6"
                              onInput={(e) => {
                                if (
                                  e.target.value.length > e.target.maxLength
                                ) {
                                  e.target.value = e.target.value.slice(
                                    0,
                                    e.target.maxLength
                                  );
                                }
                              }}
                              name="timeToComplete"
                              id="time_to_complete"
                              step="1"
                              invalid={errors.timeToComplete}
                              innerRef={register({
                                required:
                                  'Required Maximum Time to complete the Touch',
                              })}
                            />
                            <ErrorMessage
                              errors={errors}
                              name="timeToComplete"
                              className="invalid-feedback"
                              as="p"
                            ></ErrorMessage>
                          </FormGroup>
                        </Col>
                        <Col md={5}>
                          <FormGroup>
                            <Input
                              type="select"
                              name="timeToCompleteUnit"
                              invalid={errors.timeToCompleteUnit}
                              innerRef={register({
                                required: 'Time unit is required',
                              })}
                            >
                              <option></option>
                              <option value="Mi">Minute(s)</option>
                              <option value="Ho">Hour(s)</option>
                              <option value="Da">Day(s)</option>
                            </Input>
                            <ErrorMessage
                              errors={errors}
                              name="timeToCompleteUnit"
                              className="invalid-feedback"
                              as="p"
                            ></ErrorMessage>
                          </FormGroup>
                        </Col>
                      </Row>
                    </>
                  )}
                  {!Personalize && (
                    <>
                      <Label for="schedule_type" className="text-bold mb-1">
                        Select Schedule Type
                      </Label>

                      <FormGroup>
                        <Input
                          type="select"
                          name="scheduleType"
                          invalid={errors.scheduleType}
                          id="schedule_type"
                          innerRef={register({
                            required: !Personalize
                              ? 'Schedule type is required'
                              : false,
                          })}
                          onChange={(e) => setScheduleTypeState(e.target.value)}
                        >
                          <option value="Send by execution schedule">
                            Send by execution schedule
                          </option>
                          <option value="Send by exact date/time">
                            Send by exact date/time
                          </option>
                        </Input>
                        <ErrorMessage
                          errors={errors}
                          name="scheduleType"
                          className="invalid-feedback"
                          as="p"
                        ></ErrorMessage>
                      </FormGroup>

                      {scheduleTypeState === 'Send by execution schedule' && (
                        <>
                          <Label
                            for="touch_execution_schedule_Id"
                            className="text-bold mb-1"
                          >
                            Choose a Schedule
                          </Label>

                          <FormGroup>
                            <Input
                              type="select"
                              name="touchExecutionScheduleId"
                              id="touch_execution_schedule_Id"
                              invalid={errors.touchExecutionScheduleId}
                              innerRef={register({
                                required: !Personalize
                                  ? 'Schedule is required'
                                  : false,
                              })}
                            >
                              <option> </option>
                              {!schedulesLoading &&
                                !scheduleError &&
                                scheduleListData &&
                                removeDuplicates(scheduleListData).map(
                                  (schedule, i) => {
                                    return (
                                      <option value={schedule.id} key={i}>
                                        {schedule.name}
                                      </option>
                                    );
                                  }
                                )}
                            </Input>
                            <ErrorMessage
                              errors={errors}
                              name="touchExecutionScheduleId"
                              className="invalid-feedback"
                              as="p"
                            ></ErrorMessage>
                          </FormGroup>
                        </>
                      )}
                      {scheduleTypeState === 'Send by exact date/time' && (
                        <>
                          <Label
                            for="scheduled_date"
                            className="text-bold mb-1"
                          >
                            Date/Time
                          </Label>

                          <Row>
                            <Col md={8}>
                              <FormGroup>
                                <Input
                                  type="date"
                                  name="scheduledDate"
                                  id="scheduled_date"
                                  min={getFormattedDate(
                                    new Date(),
                                    'America/New_York'
                                  )}
                                  invalid={errors.scheduledDate}
                                  innerRef={register({
                                    required: 'Please select the date',
                                  })}
                                ></Input>
                                <ErrorMessage
                                  errors={errors}
                                  name="scheduledDate"
                                  className="invalid-feedback"
                                  as="p"
                                ></ErrorMessage>
                              </FormGroup>
                            </Col>
                            <Col md={4}>
                              <FormGroup>
                                <Input
                                  type="time"
                                  name="scheduleTime"
                                  invalid={errors.scheduleTime}
                                  innerRef={register({
                                    required: 'Please select the time',
                                  })}
                                  id="time"
                                ></Input>
                                <ErrorMessage
                                  errors={errors}
                                  name="scheduleTime"
                                  className="invalid-feedback"
                                  as="p"
                                ></ErrorMessage>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Label
                            for="scheduled_timezone"
                            className="text-bold mb-1"
                          >
                            Timezone
                          </Label>

                          <FormGroup>
                            <Input
                              type="select"
                              name="scheduledTimezone"
                              innerRef={register(true)}
                              id="scheduled_timezone"
                              onChange={(e) => {
                                const currentDatetime = moment
                                  .tz(new Date(), e.target.value)
                                  .add(15, 'minutes')
                                  .format('YYYY-MM-DD HH:mm');
                                const formattedDate = moment
                                  .tz(currentDatetime, e.target.value)
                                  .format('YYYY-MM-DD');
                                const formattedTime = moment
                                  .tz(currentDatetime, e.target.value)
                                  .format('HH:mm');

                                setValue('scheduledDate', formattedDate);
                                setValue('scheduleTime', formattedTime);
                              }}
                            >
                              <option value={'America/New_York'}>
                                EST – Eastern Standard Time
                              </option>
                              <option value={'America/Chicago'}>
                                CST - Central Standard Time
                              </option>
                              <option value={'America/Denver'}>
                                MST - Mountain Standard Time
                              </option>
                              <option value={'America/Los_Angeles'}>
                                PST - Pacific Standard Time
                              </option>
                              {/* will be uncommented in later version */}
                              {/* {cadencesharedType === 'none' &&
                                americanTimezones.indexOf(userTimezone) ===
                                  -1 && (
                                  <option value={userTimezone}>
                                    Local Time ({userTimezone})
                                  </option>
                                )} */}
                            </Input>
                          </FormGroup>

                          <FormGroup className="ml-4 mb-0">
                            <Input
                              type="checkbox"
                              name="moveProspectsWhenTimeExceeds"
                              id="move_prospects_when_time_exceeds"
                              checked={moveProspectState}
                              onChange={() => {
                                setMoveProspectState(!moveProspectState);
                              }}
                              innerRef={register(true)}
                            />
                            <Label for="move_prospects_when_time_exceeds">
                              Move Prospects to next touch when the time exceeds
                            </Label>
                          </FormGroup>

                          {/* will be uncommented in later version */}
                          {/* <FormGroup className="ml-4 mb-0">
                            <Input
                              type="checkbox"
                              name="useProspectTimezone"
                              id="use_prospect_timezone"
                              checked={useProspectTimezone}
                              onChange={() => {
                                setUseProspectTimezone(!useProspectTimezone);
                              }}
                              innerRef={register(true)}
                            />
                            <Label for="use_prospect_timezone">
                              Use Prospect Timezone if available
                            </Label>
                          </FormGroup> */}
                        </>
                      )}
                    </>
                  )}

                  <Row form hidden>
                    <Col md={4}>
                      <FormGroup>
                        <Label for="txt_bcc">Send Emails through BCC</Label>
                      </FormGroup>
                    </Col>
                    <Col md={8}>
                      <FormGroup>
                        <Input
                          type="text"
                          name="txtBCC"
                          id="txt_bcc"
                          disabled
                          innerRef={register(true)}
                        ></Input>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
                <Row
                  className={
                    workflowActionsOpen === true
                      ? 'd-block pre-scrollable'
                      : 'd-none pre-scrollable'
                  }
                >
                  <Col>
                    <Card>
                      <WorkflowActions
                        cadenceId={cadenceId}
                        userIds={userIds}
                        filterType="Email"
                        defaultFilter={emailTouchFilter}
                        isoutcome={true}
                        handleWorkFlow={(data) => {
                          outcomes = data;
                        }}
                        editOutcome={editOutcome}
                        editFlag={editFlag}
                        currentCadence={currentCadence}
                        setWorkflowActionsOpen={setWorkflowActionsOpen}
                        setIsOutcomeIssue={setIsOutcomeIssue}
                      ></WorkflowActions>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          <p
            className="text-danger text-sm my-2"
            hidden={workflowActionsOpen && errors.scheduleType ? false : true}
          >
            Please fill the mandatory fields !
          </p>
        </ModalBody>
        <ModalFooter className="card-footer">
          <div className="mr-auto">
            {isOutcomeIssue && (
              <span className="text-danger">
                <i className="fas fa-exclamation-circle fa-lg text-danger mr-2"></i>
                Sorry! Failed to fetch outcomes. Unable to create this Touch
              </span>
            )}
            {!isOutcomeIssue && (
              <ClButton
                className="text-email"
                hidden={getTouchError}
                icon={
                  workflowActionsOpen
                    ? 'fas fa-chevron-left text-muted'
                    : 'fas fa-pencil-alt text-muted'
                }
                color="link"
                title={
                  workflowActionsOpen
                    ? 'Back'
                    : ` ${editState ? 'Edit' : 'Define'} Workflows`
                }
                onClick={() => {
                  setWorkflowViewed(workflowViewed + 1);
                  setWorkflowActionsOpen(!workflowActionsOpen);
                }}
              >
                {workflowActionsOpen
                  ? 'Back'
                  : ` ${editState ? 'Edit' : 'Define'} Email Workflows`}
              </ClButton>
            )}
          </div>
          <ClButton
            type="submit"
            color="primary"
            title={
              editRestrict
                ? 'This touch exists in a shared cadence'
                : isOutcomeIssue || getTouchError
                ? 'Unable to save'
                : 'Save Email Touch'
            }
            disabled={editRestrict || isOutcomeIssue || getTouchError}
            icon={loading ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
          >
            {loading ? 'Wait...' : 'Save'}
          </ClButton>
        </ModalFooter>
      </Form>
      <SearchEmailTemplateModal
        showModal={ShowSearchEmailTemplateModal}
        currentUserId={currentUserId}
        currentCadence={currentCadence}
        selectedTemplateIds={selectedTemplateIds}
        handleAction={(data) => {
          const rowIds = data.map((item) => item.id);
          selectedTemplateIds.forEach((item) => {
            if (rowIds.includes(item.id)) {
              removeByAttr(selectedTemplateIds, 'id', item.id);
              notify(
                'This Template already exists!',
                'error',
                'template_already_exist'
              );
            }
          });

          setSelectedTemplateIds((prevState) => prevState.concat(data));
          setSearchEmailTemplateModal(false);
        }}
        hideModal={() => {
          setSearchEmailTemplateModal(false);
        }}
        templateSearch={templateSearch}
        templateFilter={templateFilter && templateFilter}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => {
          setWorkflowActionsOpen(true);
          setWorkFlowConfirm(false);
        }}
        handleConfirm={() => {
          handleAction(formData, selectedTemplate, outcomes);
          setSelectedTemplateIds([]);
          setWorkflowActionsOpen(false);
          setWorkFlowConfirm(false);
          setWorkflowViewed(0);
        }}
        showConfirmBtnSpinner={loading}
        showConfirmModal={workFlowConfirm}
      >
        <span>
          If you would like to make changes to email Workflows, please click 'X'
          to proceed. If you are all set, please click OK.?
        </span>
      </ConfirmModal>
      {createTemplate && (
        <TemplatePreview
          hideModal={() => setCreateTemplate(false)}
          showModal={createTemplate}
          type="add"
          handleAction={(data) => {
            setSelectedTemplateIds((prevState) => prevState.concat(data));
            setCreateTemplate(false);
          }}
          sharedType={cadencesharedType}
          sharedUsers={cadencesharedUsers}
          sharedTeams={cadenceSharedTeams}
          parentTemplateSubject={parentTemplateSubject}
        />
      )}
    </Modal>
  );
};

export default EmailTouchModal;
