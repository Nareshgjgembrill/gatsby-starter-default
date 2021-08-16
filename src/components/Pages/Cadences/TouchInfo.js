import React, { useContext, useMemo, useState } from 'react';
import { Button, Col, Progress, Row } from 'reactstrap';
import { withRouter } from 'react-router-dom';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { notify, showErrorMessage } from '../../../util/index';
import { FETCH_CADENCE_QUERY } from '../../queries/CadenceQuery';
import {
  CLONE_TOUCH,
  DELETE_TOUCH_QUERY,
  EDIT_OTHER_TOUCH,
  EDIT_TOUCH,
  FETCH_TOUCH_QUERY,
  TOUCH_REORDER,
} from '../../queries/TouchQuery';
import UserContext from '../../UserContext';
import ConfirmModal from '../../Common/ConfirmModal';
import ClButton from '../../Common/Button';

import EmailTouchModal from './EmailTouchModal';
import CallTouchModal from './CallTouchModal';
import LinkedInTouchModel from './LinkedInTouchModal';
import OtherTouchModal from './OtherTouchModal';
import TemplatePreview from './TemplatePreview';
import TextTouchModel from './TextTouchModal';
toast.configure();

const TouchInfo = ({
  match,
  location,
  refetchCount,
  touchesData,
  refetchTouchesData,
  touchesLoading,
  touchesError,
  userIds,
  isEmailTouches,
  emailTemplates,
}) => {
  const cadenceId = match.params['id'];
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const { cadence } = location.state ? location.state : {};
  const [EditID, setEditID] = useState(0);
  const [touchNumber, setTouchNumber] = useState(0);
  const [isReplyEmailTouch, setIsReplyEmailTouch] = useState(false);
  const [isFirstEmailTouch, setIsFirstEmailTouch] = useState(false);
  const [isDragEndEmailTouch, setIsDragEndEmailTouch] = useState(false);
  const [deleteTouch, setDeleteTouch] = useState(0);
  const [deleteTouchType, setDeleteTouchType] = useState('');
  const [cloneTouchType, setCloneTouchType] = useState('');
  const [touchSelect, setTouchSelect] = useState('white');
  const [templatePreviewModal, setTemplatePreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState();

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [cloneId, setCloneId] = useState(0);
  const [showCloneTouchConfirmModal, setShowCloneTouchConfirmModal] = useState(
    false
  );

  const handleTouchSelection = (id) => {
    touchSelect === id ? setTouchSelect(-id) : setTouchSelect(id);
  };

  const [ShowEmailTouchModal, setShowEmailTouchModal] = useState(false);
  const [ShowCallTouchModal, setShowCallTouchModal] = useState(false);
  const [ShowLinkedInTouchModal, setShowLinkedInTouchModal] = useState(false);
  const [ShowOtherTouchModal, setShowOtherTouchModal] = useState(false);
  const [ShowTextTouchModal, setShowTextTouchModal] = useState(false);
  const [
    showDeleteTouchConfirmModal,
    setShowDeleteTouchConfirmModal,
  ] = useState(false);

  const [
    showDeleteEmailTouchConfirmModal,
    setShowDeleteEmailTouchConfirmModal,
  ] = useState(false);

  const [
    emailTouchReorderConfirmModal,
    setEmailTouchReorderConfirmModal,
  ] = useState(false);

  const { data: cadenceData } = useQuery(FETCH_CADENCE_QUERY, {
    variables: { id: cadenceId },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });
  const cadencesharedType = useMemo(
    () => cadenceData && cadenceData?.cadence?.data[0]?.sharedType,
    [cadenceData]
  );

  const cadencesharedUsers = useMemo(
    () => cadenceData && cadenceData?.cadence?.data[0]?.sharedUsers,
    [cadenceData]
  );

  const cadenceSharedTeams = useMemo(
    () => cadenceData && cadenceData?.cadence?.data[0]?.sharedGroups,
    [cadenceData]
  );

  const cadencestatus = useMemo(
    () => cadenceData && cadenceData?.cadence?.data[0]?.status,

    [cadenceData]
  );

  const cadenceOwnerId = useMemo(
    () =>
      cadenceData && cadenceData?.cadence?.data[0]?.associations?.user[0]?.id,
    [cadenceData]
  );

  const touchData = useMemo(
    () => (touchesData && touchesData.Touches ? touchesData.Touches.data : []),
    [touchesData]
  );
  const touchIncludeAssociations = useMemo(
    () =>
      touchesData &&
      touchesData.Touches &&
      touchesData.Touches.includedAssociations
        ? touchesData.Touches.includedAssociations.emailtemplate &&
          touchesData.Touches.includedAssociations.emailtemplate
        : [],
    [touchesData]
  );

  const getTemplateDetails = (touchID) => {
    const templates = [];
    let touchIds;
    if (touchData && touchIncludeAssociations) {
      touchData.length > 0 &&
        touchData.forEach((touch) => {
          if (touch.id === touchID) {
            touchIds = touch.associations.emailTemplate.map((item) => item.id);
            touchIncludeAssociations.length > 0 &&
              touchIncludeAssociations.forEach((item) => {
                if (touchIds && touchIds.includes(item.id)) {
                  templates.push(item);
                }
              });
          }
        });
    }
    return templates;
  };

  const handleScheduleDatePassedOut = (
    scheduledType,
    scheduledDateTime,
    scheduleTimezone
  ) => {
    let isScheduledPassedOut;
    const currentDatetime = moment
      .tz(new Date(), scheduleTimezone)
      .format('MM/DD/YYYY HH:mm');
    const scheduledDate = moment
      .tz(scheduledDateTime?.replace('Z', ''), scheduleTimezone)
      .format('MM/DD/YYYY HH:mm');

    if (
      scheduledType === 'Send by exact date/time' &&
      currentDatetime > scheduledDate
    ) {
      isScheduledPassedOut = true;
    } else {
      isScheduledPassedOut = false;
    }
    return isScheduledPassedOut;
  };

  // singleTouchData will be passed to the respective touch modal
  const [
    getTouch,
    { data: singleTouchData, loading: getTouchLoading, error: getTouchError },
  ] = useLazyQuery(FETCH_TOUCH_QUERY);

  const [reOrderTouch, { data: reOrderTouchData }] = useLazyQuery(
    TOUCH_REORDER,
    {
      onCompleted: (response) => handleReOrderTouch(response, true),
      onError: (response) =>
        handleReOrderTouch(response, false, reOrderTouchData),
    }
  );

  const [
    cloneTouch,
    { data: cloneTouchData, loading: cloneTouchLoading },
  ] = useLazyQuery(CLONE_TOUCH, {
    onCompleted: (response) => handleCloneTouch(response, true),
    onError: (response) => handleCloneTouch(response, false, cloneTouchData),
  });

  const [
    deleteTouches,
    { data: deleteTouchesData, loading: deleteTouchLoading },
  ] = useLazyQuery(DELETE_TOUCH_QUERY, {
    onCompleted: (response) => handleDeleteTouch(response, true),
    onError: (response) =>
      handleDeleteTouch(response, false, deleteTouchesData),
  });

  const [
    editEmailTouchType,
    { data: editEmailTouchTypeData, loading: editEmailTouchTypeLoading },
  ] = useLazyQuery(EDIT_TOUCH, {
    onCompleted: (response) => handleEditEmailTouchTypeCallback(response, true),
    onError: (response) =>
      handleEditEmailTouchTypeCallback(response, false, editEmailTouchTypeData),
  });

  const [
    editEmailTouchTypeOnDelete,
    {
      data: editEmailTouchTypeOnDeleteData,
      loading: editEmailTouchTypeOnDeleteLoading,
    },
  ] = useLazyQuery(EDIT_TOUCH, {
    onCompleted: (response) =>
      handleEditEmailTouchTypeOnDeleteCallback(response, true),
    onError: (response) =>
      handleEditEmailTouchTypeOnDeleteCallback(
        response,
        false,
        editEmailTouchTypeOnDeleteData
      ),
  });

  const [
    editEmailTouch,
    { data: editEmailTouchData, loading: editEmailTouchLoading },
  ] = useLazyQuery(EDIT_TOUCH, {
    onCompleted: (response) => handleEditEmailTouchCallback(response, true),
    onError: (response) =>
      handleEditEmailTouchCallback(response, false, editEmailTouchData),
  });

  const [
    editCallTouch,
    { data: editCallTouchData, loading: editCallTouchLoading },
  ] = useLazyQuery(EDIT_OTHER_TOUCH, {
    onCompleted: (response) => handleEditCallTouchCallback(response, true),
    onError: (response) =>
      handleEditCallTouchCallback(response, false, editCallTouchData),
  });

  const [
    editOtherTouch,
    { data: editOtherTouchData, loading: editOtherTouchLoading },
  ] = useLazyQuery(EDIT_OTHER_TOUCH, {
    onCompleted: (response) =>
      handleEditOtherTouchRequestCallback(response, true),
    onError: (response) =>
      handleEditOtherTouchRequestCallback(response, false, editOtherTouchData),
  });
  const [
    editLinkedInTouch,
    { data: editLinkedInTouchData, loading: editLinkedInTouchLoading },
  ] = useLazyQuery(EDIT_OTHER_TOUCH, {
    onCompleted: (response) =>
      handleEditLinkedInTouchRequestCallback(response, true),
    onError: (response) =>
      handleEditLinkedInTouchRequestCallback(
        response,
        false,
        editLinkedInTouchData
      ),
  });

  const [
    editTextTouch,
    { data: editTextTouchData, loading: editTextTouchLoading },
  ] = useLazyQuery(EDIT_OTHER_TOUCH, {
    onCompleted: (response) =>
      handleEditTextTouchRequestCallback(response, true),
    onError: (response) =>
      handleEditTextTouchRequestCallback(response, false, editTextTouchData),
  });

  const handleReOrderTouch = () => {
    refetchTouchesData();
  };

  const handleEditOtherTouchRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      setShowOtherTouchModal(false);
      refetchTouchesData();
      notify('Social Touch has been updated!', 'success', 'edit_social_touch');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update social Touch',
        errorData,
        'edit_social_touch'
      );
    }
  };
  const handleEditLinkedInTouchRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      setShowLinkedInTouchModal(false);
      refetchTouchesData();
      notify(
        'Linkedin Touch has been updated!',
        'success',
        'edit_linkedin_touch'
      );
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this linkedin Touch',
        errorData,
        'edit_linkedin_touch'
      );
    }
  };
  const handleEditTextTouchRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      setShowTextTouchModal(false);
      refetchTouchesData();
      notify('Text Touch has been updated!', 'success', 'edit_text_touch');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this text touch',
        errorData,
        'edit_text_touch'
      );
    }
  };

  const handleEditEmailTouchCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      setShowEmailTouchModal(false);
      refetchTouchesData();
      notify('Email Touch has been updated!', 'success', 'edit_email_touch');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this Email Touch',
        errorData,
        'edit_email_touch'
      );
    }
  };
  const handleEditCallTouchCallback = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      setShowCallTouchModal(false);
      refetchTouchesData();
      notify('Call Touch has been updated!', 'success', 'edit_call_touch');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this call Touch',
        errorData,
        'edit_call_touch'
      );
    }
  };

  const handleEditEmailTouchTypeCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      setEmailTouchReorderConfirmModal(false);
      refetchTouchesData();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this Touch',
        errorData,
        'edit_email_touch_type'
      );
    }
  };

  const handleEditEmailTouchTypeOnDeleteCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      setShowDeleteEmailTouchConfirmModal(false);
      refetchTouchesData();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this Touch',
        errorData,
        'edit_email_touch_type_on_delete'
      );
    }
  };

  const handleDeleteTouch = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Touch has been deleted', 'success', 'delete_touch');
      refetchTouchesData();
      refetchCount();
      setShowDeleteTouchConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete this Touch',
        errorData,
        'delete_touch'
      );
    }
  };

  const handleCloneTouch = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Touch has been cloned', 'success', 'clone_touch');
      refetchTouchesData();
      refetchCount();
      setShowCloneTouchConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to clone this Touch',
        errorData,
        'clone_touch'
      );
    }
  };

  const getTouchIcons = (touch) => {
    let className;
    switch (touch) {
      case 'EMAIL':
        className = 'fas fa-envelope fa-inverse mr-2 text-auto-email';
        break;
      case 'OTHERS':
        className = 'fas fa-share-alt fa-inverse mr-2';
        break;
      case 'CALL':
        className = 'fas fa-phone-alt fa-inverse mr-2';
        break;
      case 'LINKEDIN':
        className = 'fab fa-linkedin-in fa-inverse mr-2';
        break;
      default:
        className = 'far fa-comments fa-inverse text-bold mr-2';
        break;
    }
    return className;
  };

  const getButtonClass = (touch, type) => {
    let buttonClassName;
    switch (touch) {
      case 'EMAIL':
        if (type) {
          buttonClassName =
            'mx-auto py-1 wd-xs bg-info-dark rounded-0 px-0 shadow-none mb-negative3';
        } else {
          buttonClassName =
            'mx-auto py-1 wd-xs bg-info-dark rounded-0 px-0 shadow-none mb-negative3';
        }

        break;
      case 'OTHERS':
        buttonClassName =
          'mx-auto py-1 wd-xs bg-warning rounded-0 px-0 shadow-none mb-negative3';
        break;
      case 'CALL':
        buttonClassName =
          'mx-auto py-1 wd-xs bg-success rounded-0 px-0 shadow-none mb-negative3';
        break;
      case 'LINKEDIN':
        buttonClassName =
          'mx-auto py-1 wd-xs bg-linkedin rounded-0 px-0 shadow-none mb-negative3';
        break;
      default:
        buttonClassName =
          'mx-auto py-1 wd-xs bg-danger rounded-0 px-0 shadow-none mb-negative3';
        break;
    }

    return buttonClassName;
  };

  const removeDuplicateStringValues = (x) => {
    const filteredString = Array.from(new Set(x.split(','))).toString();
    return filteredString;
  };

  const getProductType = (product) => {
    const productTypes = {
      CD: ' Click Dialer',
      PD: ' Flow Dialer',
      TD: ' Agent Assisted Dialer',
    };
    const productType = removeDuplicateStringValues(product).replace(
      /CD|PD|TD/gi,
      function (item) {
        return productTypes[item];
      }
    );
    return productType;
  };

  const touchState =
    !getTouchLoading && singleTouchData && singleTouchData.touch
      ? singleTouchData.touch.data
      : [];

  const templateState =
    !getTouchLoading && singleTouchData && singleTouchData.touch
      ? singleTouchData.touch.includedAssociations.emailtemplate &&
        singleTouchData.touch.includedAssociations.emailtemplate
      : [];

  const workflowState =
    !getTouchLoading && singleTouchData && singleTouchData.touch
      ? singleTouchData.touch.data[0].workflow
      : [];

  const handleEditTouches = (touchType, stepNo) => {
    let firstEmailTouchStepNo;
    if (touchType === 'EMAIL') {
      if (touchData.length > 0) {
        for (let i = 0; i < touchData.length; i++) {
          if (touchData[i]['touchType'] === 'EMAIL') {
            firstEmailTouchStepNo = touchData[i]['stepNo'];
            break;
          }
        }
      }
      if (stepNo === firstEmailTouchStepNo) {
        setIsFirstEmailTouch(true);
      } else {
        setIsFirstEmailTouch(false);
      }
      setShowEmailTouchModal(true);
    } else if (touchType === 'CALL') setShowCallTouchModal(true);
    else if (touchType === 'OTHERS') {
      setShowOtherTouchModal(true);
    } else if (touchType === 'LINKEDIN') setShowLinkedInTouchModal(true);
    else if (touchType === 'TEXT') setShowTextTouchModal(true);
  };

  const handleOnDragOver = (e, stepNo, emailTouchType) => {
    setEnd(stepNo);
    if (emailTouchType === 'New') {
      setIsDragEndEmailTouch(true);
    } else {
      setIsDragEndEmailTouch(false);
    }
  };
  const handleOnDragStart = (e, stepNo, id, emailTouchType) => {
    setStart(stepNo);
    setEditID(id);
    if (emailTouchType === 'Reply') {
      setIsReplyEmailTouch(true);
    } else {
      setIsReplyEmailTouch(false);
    }
    e.dataTransfer.setData('stepNo', stepNo);
  };

  const handleReOrder = () => {
    if (
      start !== end &&
      cadencesharedType === 'none' &&
      cadencestatus === 'NEW'
    ) {
      if (isReplyEmailTouch && isDragEndEmailTouch) {
        setEmailTouchReorderConfirmModal(true);
      } else {
        reOrderTouch({
          variables: { touchID: EditID, fromStepNo: start, toStepNo: end },
        });
      }
    }
  };

  const getUnit = (value, unit) => {
    let displayUnit;
    if (unit === 'Mi') {
      if (value > 1) {
        displayUnit = 'mins';
      } else {
        displayUnit = 'min';
      }
    } else if (unit === 'Ho') {
      if (value > 1) {
        displayUnit = 'Hrs';
      } else {
        displayUnit = 'Hr';
      }
    } else if (unit === 'Da') {
      if (value > 1) {
        displayUnit = 'days';
      } else {
        displayUnit = 'day';
      }
    } else {
      displayUnit = 'day';
    }
    return displayUnit;
  };

  const getTimezone = (scheduledTimezone) => {
    let timezone;
    switch (scheduledTimezone) {
      case 'America/New_York':
        timezone = 'EST';
        break;
      case 'America/Chicago':
        timezone = 'CST';
        break;
      case 'America/Denver':
        timezone = 'MST';
        break;
      case 'America/Los_Angeles':
        timezone = 'PST';
        break;
      default:
        break;
    }

    return timezone;
  };

  const getScheduledTime = (scheduledDateTime, scheduledTimezone) => {
    let sHour, modifiedScheduledTime;
    let formattedDatetime;
    if (scheduledDateTime) {
      const timezone = getTimezone(scheduledTimezone);
      const datetime = scheduledDateTime && scheduledDateTime.split('T');
      const formattedDate = datetime[0] && datetime[0].split('-');
      if (datetime[1]) {
        const sTime = datetime[1].split(':');

        if (parseInt(sTime[0]) > 12) {
          sHour =
            parseInt(sTime[0]) - 12 > 9
              ? (parseInt(sTime[0]) - 12).toString()
              : '0' + (parseInt(sTime[0]) - 12).toString();
          modifiedScheduledTime = sHour + ':' + sTime[1] + ' PM';
        } else modifiedScheduledTime = sTime[0] + ':' + sTime[1] + ' AM';
      }
      // eslint-disable-next-line prefer-const
      formattedDatetime = `${formattedDate[2]}/${formattedDate[1]}/${formattedDate[0]} ${modifiedScheduledTime} ${timezone} `;
    }
    return formattedDatetime;
  };

  const handlePreview = (id) => {
    setPreviewTemplate(id);
    setTemplatePreviewModal(true);
  };

  const handleTouchDelete = (touchId, touchType, stepNo) => {
    let newTouch = 0;
    let replyTouch;
    let replyTouchId;
    if (touchData.length > 0) {
      for (let i = 0; i < touchData.length; i++) {
        if (touchData[i]['touchType'] === 'EMAIL') {
          if (touchData[i]['emailTouchType'] === 'Reply') {
            replyTouch = touchData[i]['stepNo'];
            replyTouchId = touchData[i]['id'];
            break;
          } else {
            newTouch = newTouch + 1;
          }
        }
      }
    }
    if (replyTouch > stepNo && newTouch === 1) {
      setDeleteTouch(touchId);
      setShowDeleteEmailTouchConfirmModal(true);
      setEditID(replyTouchId);
    } else {
      setShowDeleteTouchConfirmModal(true);
      setDeleteTouch(touchId);
      setDeleteTouchType(touchType === 'OTHERS' ? 'SOCIAL' : touchType);
    }
  };

  return (
    <Row className="pt-3 mx-2">
      <Col className="px-2">
        {touchesLoading && (
          <Row className="mb-2">
            <Col className="px-0">
              <Progress animated striped value="100">
                Loading Touches
              </Progress>
            </Col>
          </Row>
        )}
        {!touchesLoading && !touchesError && touchData.length === 0 && (
          <Row className="py-2 bg-gray-lighter">
            <Col className="text-center">
              <span className="text-warning">
                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                No touches are available
              </span>
            </Col>
          </Row>
        )}
        {touchesError && (
          <Row className="py-2 bg-gray-lighter">
            <Col className="text-center">
              <h6 className="text-danger mb-0">
                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                Failed to fetch data
              </h6>
              {touchesData?.requestId && (
                <>
                  <br />
                  <span className="text-danger text-sm">{`RequestId: ${touchesData?.requestId}`}</span>{' '}
                </>
              )}
            </Col>
          </Row>
        )}
        {!touchesLoading &&
          !touchesError &&
          touchData.map((touch, i) => {
            return (
              <Row
                key={`touch_${touch.id}_${i}`}
                id={`${touch.id}_${i}`}
                className="border p-0 mb-2"
                draggable={
                  cadencesharedType === 'none' && cadencestatus === 'NEW'
                    ? true
                    : false
                }
                onMouseEnter={() => {
                  handleTouchSelection(touch.stepNo);
                }}
                onDragStart={(e) =>
                  handleOnDragStart(
                    e,
                    touch.stepNo,
                    touch.id,
                    touch.emailTouchType
                  )
                }
                onDragEnd={handleReOrder}
                onDragOver={(e) =>
                  handleOnDragOver(e, touch.stepNo, touch.emailTouchType)
                }
              >
                <Col>
                  <Row className="align-items-center">
                    <Col className="text-center" sm={1}>
                      <h3 className="text-muted mb-0" title="Step No">
                        {touch.stepNo}
                      </h3>
                    </Col>
                    <Col sm={3} className="border-left">
                      <Row className="d-flex flex-row align-items-center">
                        <Col sm={3} className="pr-0">
                          <span title="Day" className="align-items-center">
                            Day {touch.day}
                          </span>
                        </Col>
                        <Col>
                          <div className="text-center" title="Active Prospects">
                            <span className="text-bold text-center text-email text-break">
                              {touch.active}
                            </span>
                            <br></br>
                            <i className="fas fa-user-friends text-muted"></i>
                          </div>
                        </Col>
                        <Col>
                          <Row>
                            <Col
                              sm={1}
                              className="d-flex justify-content-center px-0"
                            >
                              <span title="Wait time">
                                <i className="fas fa-clock text-muted"></i>
                              </span>
                            </Col>
                            <Col sm={11}>
                              <span>
                                {touch.waitPeriodBeforeStart}{' '}
                                {getUnit(
                                  touch.waitPeriodBeforeStart,
                                  touch.waitPeriodUnit
                                )}
                              </span>
                            </Col>
                          </Row>
                          <Row>
                            <Col
                              sm={1}
                              className="d-flex justify-content-center px-0"
                            >
                              <span title="Time to complete">
                                <i className="fas fa-hourglass-end text-muted"></i>
                              </span>
                            </Col>
                            <Col sm={11}>
                              <span>
                                {touch.timeToComplete
                                  ? touch.timeToComplete
                                  : 0}{' '}
                                {getUnit(
                                  touch.timeToComplete,
                                  touch.timeToCompleteUnit
                                )}
                              </span>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                    <Col
                      className="d-flex flex-column text-center text-nowrap px-0"
                      title={
                        touch.touchType === 'EMAIL'
                          ? touch.timeToComplete
                            ? 'Personalized Email Touch'
                            : 'Auto Email Touch'
                          : touch.touchType === 'OTHERS'
                          ? 'Social Touch'
                          : touch.touchType.charAt(0).toUpperCase() +
                            touch.touchType.slice(1).toLowerCase() +
                            ' Touch'
                      }
                    >
                      <span className="text-center mb-n1 mt-negative1">
                        <i className="fas fa-long-arrow-alt-down fa-2x text-muted"></i>
                      </span>
                      <Button
                        className={getButtonClass(
                          touch.touchType,
                          touch.timeToComplete
                        )}
                        onClick={() => {
                          getTouch({
                            variables: {
                              touchID: touch.id,
                              includeAssociationsQry:
                                'includeAssociations[]=emailTemplate',
                            },
                          });
                          handleEditTouches(touch.touchType, touch.stepNo);
                          setEditID(touch.id);
                          setTouchNumber(touch.stepNo);
                        }}
                      >
                        {touch.touchType === 'EMAIL' && touch.timeToComplete ? (
                          // icon for personalized email
                          <span className="fa-1x svgicon emailEdit mr-1"></span>
                        ) : (
                          <i className={getTouchIcons(touch.touchType)}></i>
                        )}
                        <span className="text-bold">
                          {touch.touchType === 'OTHERS'
                            ? 'Social'
                            : touch.touchType.charAt(0).toUpperCase() +
                              touch.touchType.slice(1).toLowerCase()}
                        </span>
                      </Button>
                      <span className="text-center mb-n1">
                        <i className="fas fa-minus fa-2x fa-rotate-90 text-muted"></i>
                      </span>
                    </Col>
                    <Col sm={5} className="d-flex flex-column px-0">
                      <Row>
                        <Col
                          sm={2}
                          className="d-flex flex-row align-items-center"
                        >
                          <div>
                            {touch.touchType === 'EMAIL' &&
                              touch.scheduleType ===
                                'Send by exact date/time' && (
                                <i
                                  className="fas fa-clock fa-lg text-inverse-light mr-2"
                                  title={`Email is scheduled for ${getScheduledTime(
                                    touch.scheduledDateTime,
                                    touch.scheduleTimezone
                                  )}`}
                                ></i>
                              )}
                          </div>
                          <div>
                            {touch.touchType === 'EMAIL' &&
                              getTemplateDetails(touch.id).length === 0 && (
                                <i
                                  className="fas fa-exclamation-circle fa-lg text-danger mr-2"
                                  title="This email touch has no email templates"
                                ></i>
                              )}
                            {touch.touchType === 'EMAIL' &&
                              getTemplateDetails(touch.id).length > 0 &&
                              handleScheduleDatePassedOut(
                                touch.scheduleType,
                                touch.scheduledDateTime,
                                touch.scheduleTimezone
                              ) && (
                                <i
                                  className="fas fa-exclamation-circle fa-lg text-danger mr-2"
                                  title="Scheduled date has passed"
                                ></i>
                              )}
                          </div>
                        </Col>
                        <Col className="pl-0">
                          {touch.touchType === 'EMAIL' && (
                            <div className="text-break">
                              <b className="mr-2">Email Template:</b>
                              {getTemplateDetails(touch.id).map(
                                (temp, index) => {
                                  return (
                                    // eslint-disable-next-line react/jsx-no-useless-fragment
                                    <React.Fragment
                                      key={`temp_${index}_${touch.id}`}
                                    >
                                      {index > 0 ? (
                                        <React.Fragment
                                          key={`temp_${index}_${touch.id}`}
                                        >
                                          <span className="mx-2">-</span>
                                          <span
                                            key={`temp_${index}_${touch.id}_${temp.id}`}
                                            title={`Template Name: ${temp.name}`}
                                            className="text-email pointer"
                                            onClick={() => {
                                              handlePreview(temp.id);
                                            }}
                                          >
                                            {temp.name}
                                          </span>
                                        </React.Fragment>
                                      ) : (
                                        <span
                                          key={index}
                                          title={`Template Name: ${temp.name}`}
                                          className="text-email pointer"
                                          onClick={() => {
                                            handlePreview(temp.id);
                                          }}
                                        >
                                          {temp.name}
                                        </span>
                                      )}
                                    </React.Fragment>
                                  );
                                }
                              )}
                            </div>
                          )}
                          <div className="d-flex flex-column">
                            {touch.touchType === 'CALL' && (
                              <span className="text-break">
                                <b className="mr-2">Dialing mode:</b>
                                {getProductType(touch.product)}
                              </span>
                            )}
                            {touch?.touchType === 'OTHERS' &&
                              touch?.subTouch !== null && (
                                <span className="text-break">
                                  <b className="mr-2">Social Type:</b>
                                  {touch?.subTouch?.replace('Others-', '')}
                                </span>
                              )}
                            {touch.touchType === 'LINKEDIN' &&
                              touch?.subTouch !== null && (
                                <span className="text-break">
                                  <b className="mr-2">LinkedIn Type:</b>
                                  {touch?.subTouch?.replace('LinkedIn-', '')}
                                </span>
                              )}
                            {touch.touchType === 'TEXT' && (
                              <span className="text-break d-flex align-items-center">
                                <b className="mr-2">Text touch:</b>
                                <span className="mb-n4">
                                  <p className="mb-n4 pt-1 pl-2 text-sm">
                                    Powered by
                                  </p>
                                  <span className="fa-7x svgicon zipwhip">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    <span className="path3"></span>
                                  </span>
                                </span>
                              </span>
                            )}
                            {touch.touchType === 'EMAIL' && (
                              <span className="text-break">
                                <b className="mr-2">Email Type:</b>
                                {touch.emailTouchType}
                              </span>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </Col>
                    <Col className="px-0">
                      <ClButton
                        color="outline"
                        className="btn-sm"
                        onClick={() => {
                          getTouch({
                            variables: {
                              touchID: touch.id,
                              includeAssociationsQry:
                                'includeAssociations[]=emailTemplate',
                            },
                          });
                          handleEditTouches(touch.touchType, touch.stepNo);
                          setEditID(touch.id);
                          setTouchNumber(touch.stepNo);
                        }}
                      >
                        <i
                          className="fas fa-pencil-alt pointer"
                          title="Edit touch"
                        ></i>
                      </ClButton>
                      <ClButton
                        color="outline"
                        className="btn-sm"
                        onClick={() => {
                          setCloneId(touch.id);
                          setCloneTouchType(
                            touch.touchType === 'OTHERS'
                              ? 'SOCIAL'
                              : touch.touchType
                          );
                          setShowCloneTouchConfirmModal(true);
                        }}
                      >
                        <i
                          className="fas fa-clone pointer"
                          title="Clone Touch"
                        ></i>
                      </ClButton>
                      <ClButton
                        title={
                          cadencesharedType !== 'none'
                            ? 'This cadence is a Shared Cadence'
                            : cadenceOwnerId && cadenceOwnerId !== currentUserId
                            ? 'You are not owner of this cadence'
                            : touch.total > 0
                            ? 'Prospects are already assigned to this touch'
                            : 'Delete Touch'
                        }
                        disabled={
                          cadencesharedType !== 'none' ||
                          (cadenceOwnerId &&
                            cadenceOwnerId !== currentUserId) ||
                          touch.total > 0
                        }
                        color="outline"
                        className="btn-sm"
                        onClick={() => {
                          handleTouchDelete(
                            touch.id,
                            touch.touchType,
                            touch.stepNo
                          );
                        }}
                      >
                        <i className="fas fa-trash pointer"></i>
                      </ClButton>
                    </Col>
                  </Row>
                </Col>
              </Row>
            );
          })}
        <ConfirmModal
          confirmBtnIcon="fas fa-trash"
          confirmBtnText="Delete"
          header="Delete Touch"
          handleCancel={() => setShowDeleteTouchConfirmModal(false)}
          handleConfirm={() => {
            deleteTouches({ variables: { touchID: deleteTouch } });
          }}
          showConfirmBtnSpinner={deleteTouchLoading}
          showConfirmModal={showDeleteTouchConfirmModal}
        >
          <span>
            Are you sure you want to delete this <b>{deleteTouchType}</b> touch
            ?
          </span>
        </ConfirmModal>

        <ConfirmModal
          confirmBtnIcon="fas fa-clone"
          confirmBtnText="Clone"
          header="Clone Touch"
          handleCancel={() => setShowCloneTouchConfirmModal(false)}
          handleConfirm={() => {
            cloneTouch({ variables: { touchID: cloneId } });
          }}
          showConfirmBtnSpinner={cloneTouchLoading}
          showConfirmModal={showCloneTouchConfirmModal}
        >
          <span>
            Are you sure you want to clone this <b>{cloneTouchType}</b> Touch ?
          </span>
        </ConfirmModal>

        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          confirmBtnText="OK"
          handleCancel={() => setEmailTouchReorderConfirmModal(false)}
          handleConfirm={() => {
            reOrderTouch({
              variables: { touchID: EditID, fromStepNo: start, toStepNo: end },
            });
            const input = { emailTouchType: 'New' };
            editEmailTouchType({ variables: { touchID: EditID, input } });
          }}
          showConfirmBtnSpinner={editEmailTouchTypeLoading}
          showConfirmModal={emailTouchReorderConfirmModal}
        >
          <span>
            The touch you are moving is a Reply Email. If you would like this
            moved, it will be changed to a New Email. Would you like to proceed
            ?{' '}
          </span>
        </ConfirmModal>

        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          confirmBtnText="OK"
          header="Delete Touch"
          handleCancel={() => setShowDeleteEmailTouchConfirmModal(false)}
          handleConfirm={() => {
            deleteTouches({ variables: { touchID: deleteTouch } });
            const input = { emailTouchType: 'New' };
            editEmailTouchTypeOnDelete({
              variables: { touchID: EditID, input },
            });
          }}
          showConfirmBtnSpinner={editEmailTouchTypeOnDeleteLoading}
          showConfirmModal={showDeleteEmailTouchConfirmModal}
        >
          <span>
            The touch you are deleting is a New Email. Upon deleting, the next
            immediate reply email will become the New email. Do you want to
            proceed ?
          </span>
        </ConfirmModal>

        <EmailTouchModal
          showModal={ShowEmailTouchModal}
          currentUserId={currentUserId}
          touchNumber={touchNumber}
          userIds={userIds}
          cadenceId={cadenceId}
          currentCadence={cadence}
          touchData={singleTouchData}
          getTouchLoading={getTouchLoading}
          getTouchError={getTouchError}
          loading={editEmailTouchLoading}
          editFlag={true}
          editData={touchState}
          isFirstEmailTouch={isFirstEmailTouch}
          isEmailTouches={isEmailTouches}
          emailTemplates={emailTemplates}
          editRestrict={
            cadencesharedType !== 'none' ||
            (cadenceOwnerId && cadenceOwnerId !== currentUserId)
              ? true
              : false
          }
          editOutcome={workflowState}
          editTemplate={templateState}
          handleAction={(data, ids, outcomes) => {
            const {
              timeToWaitAndExecute,
              timeToWaitUnit,
              emailTouchType,
              timeToComplete,
              timeToCompleteUnit,
              previewEmailFlag,
              includeOptout,
              includeProspectResponseFlag,
              scheduleType,
              scheduledDate,
              scheduleTime,
              moveProspectsWhenTimeExceeds,
              useProspectTimezone,
              touchExecutionScheduleId,
              scheduledTimezone,
            } = data;
            let sHour, modifiedScheduledTime;
            if (scheduleTime) {
              const sTime = scheduleTime.split(':');

              if (parseInt(sTime[0]) > 12) {
                sHour =
                  parseInt(sTime[0]) - 12 > 9
                    ? (parseInt(sTime[0]) - 12).toString()
                    : '0' + (parseInt(sTime[0]) - 12).toString();
                modifiedScheduledTime = sHour + ':' + sTime[1] + ' PM';
              } else modifiedScheduledTime = sTime[0] + ':' + sTime[1] + ' AM';
            }
            const templateIds = [];
            ids &&
              // eslint-disable-next-line array-callback-return
              ids.map((id) => {
                let temp = {};
                temp = { id: id };
                templateIds.push(temp);
              });

            const input = {
              cadence: { id: cadenceId },
              timeToWaitAndExecute: timeToWaitAndExecute
                ? timeToWaitAndExecute
                : 0,
              timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
              emailTemplate: templateIds,
              emailTouchType: emailTouchType,
              includeOptout: includeOptout,
              previewEmailFlag: previewEmailFlag,
              includeProspectResponseFlag: includeProspectResponseFlag
                ? includeProspectResponseFlag
                : false,
              touchType: 'Email',
              scheduleType: scheduleType,
              schedule: { id: touchExecutionScheduleId },
              scheduledDateTime: scheduledDate + ' ' + modifiedScheduledTime,
              moveProspectsWhenTimeExceeds: moveProspectsWhenTimeExceeds
                ? moveProspectsWhenTimeExceeds
                : false,
              useProspectTimezone: useProspectTimezone
                ? useProspectTimezone
                : false,
              timeToComplete:
                previewEmailFlag === true ? timeToComplete : undefined,
              timeToCompleteUnit:
                previewEmailFlag === true ? timeToCompleteUnit : undefined,
              scheduledTimezone,
              workflow: outcomes,
            };
            editEmailTouch({
              variables: {
                touchID: EditID,
                input,
              },
            });
          }}
          hideModal={() => {
            setShowEmailTouchModal(false);
          }}
        />
        {ShowCallTouchModal && (
          <CallTouchModal
            showModal={ShowCallTouchModal}
            currentUserId={currentUserId}
            touchNumber={touchNumber}
            userIds={userIds}
            currentCadence={cadence}
            cadenceId={cadenceId}
            editFlag={true}
            touchData={singleTouchData}
            editData={touchState}
            editOutcome={workflowState}
            editRestrict={
              cadencesharedType !== 'none' ||
              (cadenceOwnerId && cadenceOwnerId !== currentUserId)
                ? true
                : false
            }
            loading={editCallTouchLoading}
            getTouchLoading={getTouchLoading}
            getTouchError={getTouchError}
            handleAction={(data, dialerValues, outcomes) => {
              const {
                timeToWaitAndExecute,
                timeToWaitUnit,
                timeToComplete,
                timeToCompleteUnit,
              } = data;

              const input = {
                cadence: { id: cadenceId },
                productType: dialerValues.toString(),
                timeToWaitAndExecute: timeToWaitAndExecute
                  ? timeToWaitAndExecute
                  : 0,
                timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
                timeToComplete: timeToComplete,
                timeToCompleteUnit: timeToCompleteUnit,
                workflow: outcomes,
              };
              editCallTouch({
                variables: {
                  touchID: EditID,
                  input,
                },
              });
            }}
            hideModal={() => {
              setShowCallTouchModal(false);
            }}
          />
        )}

        {ShowOtherTouchModal && (
          <OtherTouchModal
            showModal={ShowOtherTouchModal}
            currentUserId={currentUserId}
            touchNumber={touchNumber}
            currentCadence={cadence}
            editFlag={true}
            touchData={singleTouchData}
            editData={touchState}
            editRestrict={
              cadencesharedType !== 'none' ||
              (cadenceOwnerId && cadenceOwnerId !== currentUserId)
                ? true
                : false
            }
            loading={editOtherTouchLoading}
            getTouchLoading={getTouchLoading}
            getTouchError={getTouchError}
            handleAction={(data) => {
              const {
                timeToWaitAndExecute,
                timeToWaitUnit,
                timeToComplete,
                timeToCompleteUnit,
                socialMediaType,
                description,
              } = data;

              const input = {
                cadence: { id: cadenceId },
                timeToWaitAndExecute: timeToWaitAndExecute
                  ? timeToWaitAndExecute
                  : 0,
                timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
                timeToComplete: timeToComplete,
                timeToCompleteUnit: timeToCompleteUnit,
                socialMediaType: socialMediaType,
                instructions: description,
              };
              editOtherTouch({
                variables: {
                  touchID: EditID,
                  input,
                },
              });
            }}
            hideModal={() => {
              setShowOtherTouchModal(false);
            }}
          />
        )}
        {ShowLinkedInTouchModal && (
          <LinkedInTouchModel
            showModal={ShowLinkedInTouchModal}
            currentUserId={currentUserId}
            touchNumber={touchNumber}
            currentCadence={cadence}
            editFlag={true}
            touchData={singleTouchData}
            editData={touchState}
            editRestrict={
              cadencesharedType !== 'none' ||
              (cadenceOwnerId && cadenceOwnerId !== currentUserId)
                ? true
                : false
            }
            loading={editLinkedInTouchLoading}
            getTouchLoading={getTouchLoading}
            getTouchError={getTouchError}
            handleAction={(data) => {
              const {
                timeToWaitAndExecute,
                timeToWaitUnit,
                timeToComplete,
                timeToCompleteUnit,
                description,
                linkedInType,
              } = data;
              const input = {
                cadence: { id: cadenceId },
                timeToWaitAndExecute: timeToWaitAndExecute
                  ? timeToWaitAndExecute
                  : 0,
                timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
                timeToComplete: timeToComplete,
                timeToCompleteUnit: timeToCompleteUnit,
                instructions: description,
                linkedInType: linkedInType,
              };
              editLinkedInTouch({
                variables: {
                  touchID: EditID,
                  input,
                },
              });
            }}
            hideModal={() => {
              setShowLinkedInTouchModal(false);
            }}
          />
        )}
        {ShowTextTouchModal && (
          <TextTouchModel
            showModal={ShowTextTouchModal}
            currentUserId={currentUserId}
            touchNumber={touchNumber}
            currentCadence={cadence}
            cadenceId={cadenceId}
            userIds={userIds}
            editFlag={true}
            touchData={singleTouchData}
            editData={touchState}
            editRestrict={
              cadencesharedType !== 'none' ||
              (cadenceOwnerId && cadenceOwnerId !== currentUserId)
                ? true
                : false
            }
            editOutcome={workflowState}
            loading={editTextTouchLoading}
            getTouchLoading={getTouchLoading}
            getTouchError={getTouchError}
            handleAction={(data, outcomes) => {
              const {
                timeToWaitAndExecute,
                timeToWaitUnit,
                timeToComplete,
                timeToCompleteUnit,
              } = data;

              const input = {
                cadence: { id: cadenceId },
                timeToWaitAndExecute: timeToWaitAndExecute
                  ? timeToWaitAndExecute
                  : 0,
                timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
                timeToComplete: timeToComplete,
                timeToCompleteUnit: timeToCompleteUnit,
                workflow: outcomes,
              };
              editTextTouch({
                variables: {
                  touchID: EditID,
                  input,
                },
              });
            }}
            hideModal={() => {
              setShowTextTouchModal(false);
            }}
          />
        )}
        {templatePreviewModal && (
          <TemplatePreview
            hideModal={() => setTemplatePreviewModal(false)}
            showModal={templatePreviewModal}
            templateId={previewTemplate}
            type="edit"
            sharedType={cadencesharedType}
            sharedUsers={cadencesharedUsers}
            sharedTeams={cadenceSharedTeams}
          />
        )}
      </Col>
    </Row>
  );
};

export default withRouter(TouchInfo);
