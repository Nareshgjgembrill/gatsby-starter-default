/* eslint-disable @typescript-eslint/camelcase */
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { FormValidator } from '@nextaction/components';
import classnames from 'classnames';
import moment from 'moment';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import ScrollArea from 'react-scrollbar';
import { toast } from 'react-toastify';
import {
  ButtonDropdown,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Popover,
  PopoverBody,
  PopoverHeader,
  Row,
  TabContent,
  TabPane,
  UncontrolledPopover,
} from 'reactstrap';
import ClctiClient from '../../../apollo/ClctiClient';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { showErrorMessage, useClickOutside } from '../../../util/index';
import { default as ClButton } from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import OpenCrmWindow from '../../Common/OpenCrmWindow';
import {
  CD_CALL_LOG,
  CD_SESSION_LOG,
  CLK_PAYLOAD,
} from '../../queries/ClickDialerQuery';
import { GET_LOOKUP_VALUE_QUERY } from '../../queries/PendingCallsQuery';
import { FETCH_ACTIVITY_HISTORY } from '../../queries/ProspectsQuery';
import CallMeToJoinModal from './CallMeToJoinModal';

toast.configure();

const commonMessage = {
  ERROR_CD015: 'Please dial into the Conference Bridge and try again!',
  ERROR_SUPPORT:
    '. Please continue and if the problem persists, please contact Koncert Support.',
  ERROR_SAVE_CALL: 'Please save the call details and then try again.',
};

let callInterval = '';
let timeInterval = '';
let talkerStatusIntervalId;

const ClickDialerApp = ({
  org,
  showMakeCall,
  prospectToRender,
  handleActionRefresh,
  handleDialNextContact,
  handleStopNavigation,
  callInitiatePage,
  selectUserId,
  currentUserId,
  cadences,
  pathParam,
  memberTaskId,
}) => {
  const { token } = useContext(ApiUrlAndTokenContext);
  const today = new Date().toISOString().split('T')[0];
  const [commentsError, setCommentsError] = useState('');
  const cusPhoneAlt = {
    transform: 'rotate(135deg)',
    cursor: 'pointer',
  };
  const requerstApiUrl = org?.cdApiUrl + '/ctiservice';
  const [newVmFileName, setNewVmFileName] = useState('');
  const [vmData, setVmData] = useState({});
  /** Click Dialer App start*/
  const [clickDialerData, setClickDialerData] = useState({});
  const [sessionId, setSessionId] = useState();
  const sessionIdRef = useRef(sessionId);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCallTouchConfirmModal, setShowCallTouchConfirmModal] = useState(
    false
  );
  const [isDialingProgress, setIsDialingProgress] = useState(false);
  const [metaData, setMetaData] = useState({});
  const [callOutcomeTab, setCallOutcomeTab] = useState('follow_up');
  const [showCallerIds, setShowCallerIds] = useState({ display: 'none' });

  const [loginStatus, setLoginStatus] = useState('NOT_LOGGED_IN');
  const [reportSessionId, setReportSessionId] = useState();
  const [talkerLoginStatus, setTalkerLoginStatus] = useState(false);
  const myTalkerLoginStatus = useRef(talkerLoginStatus);
  const [talkerIsOnCall, setTalkerIsOnCall] = useState(false);
  const [isUnSavedCallDetailsExist, setIsUnSavedCallDetailsExist] = useState(
    false
  );
  const myUnSavedCallDetailsExistRef = useRef(isUnSavedCallDetailsExist);

  const [dialingPhoneNumber, setDialingPhoneNumber] = useState();
  const [sourcePhoneNumber, setSourcePhoneNumber] = useState();
  const [showCallMeToJoinModal, setShowCallMeToJoinModal] = useState(false);

  const dialerSettingFormRef = useRef();
  const [dialerSettingForm, setDialerSettingForm] = useState();
  const [callStartTime, setCallStartTime] = useState();
  const [callerId, setCallerId] = useState('');
  const [wrapTime, setWrapTime] = useState();
  //Todo for unused variables
  const [callEndTime, setCallEndTime] = useState();
  const [totalDialCount, setTotalDialCount] = useState(0);
  const [totalConnectCount, setTotalConnetCount] = useState(0);
  let metrics = {};
  const [totalVmCount, setTotalVmCount] = useState(0);
  const intialMetrics = {
    totalConnect: 0,
    totalDials: 0,
    totalVmleft: 0,
  };
  const [metricsCount, setMetricsCount] = useState(intialMetrics);
  const metricsCountRef = useRef(metricsCount);
  const [dialerPhoneType] = useState();
  const dotsArr = ['..', '....', '......'];
  const [callConnectStatus, setCallConnectStatus] = useState('');
  const [voiceMailName, setVoiceMailName] = useState();
  const leaveVmRef = useRef();
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [endSessionStatus, setEndSessionStatus] = useState(false);
  const [callDuration, setCallDuration] = useState('00:00:00');
  const [defaultDuration, setDefaultDuration] = useState([0, 0, 0]);
  const [callResponse, setCallResponse] = useState();
  const [sessionStartTime, setSessionStartTime] = useState();
  const sessionStartTimeRef = useRef(sessionStartTime);
  const callResponseRef = useRef(callResponse);
  const callResultFormRef = useRef();
  const [callResultForm, setCallResultForm] = useState();
  const followUpFormRef = useRef();
  const [followUpForm, setFollowUpForm] = useState();
  const referralFormRef = useRef();
  const [referralForm, setReferralForm] = useState();
  const [historyActivity, setHistoryActivity] = useState([]);
  const [disposition, setDisposition] = useState();
  const [callComment, setCallComment] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverToggle = () => setPopoverOpen(!popoverOpen);
  const [recordVmPopoverOpen, setRecordVmPopoverOpen] = useState(false);
  const recordVmPopoverToggle = () =>
    setRecordVmPopoverOpen(!recordVmPopoverOpen);
  const [vmStep, setVmStep] = useState(1);
  const [vmRequestStatus, setVmRequestStatus] = useState(false);
  const [saveActionbtn, setSaveActionBtn] = useState();

  const [callOutcomeResult, setCallOutcomeResult] = useState(false);
  const toggleCallOutcomeResult = () =>
    setCallOutcomeResult(!callOutcomeResult);
  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);

  const notify = (message, ToasterType = 'error') => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
      autoClose: 4000,
    });
  };

  const getTimeString = (dateString, is24HourCycle) => {
    const date = new Date(dateString);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: is24HourCycle ? false : true,
    };
    return date.toLocaleString('en-US', options);
  };

  // add cadence fields
  // this will be uncommented once clcti api for add to cadence is merged
  // const [cadenceId, setCadenceId] = useState(null);
  // const [cadenceList, setCadenceList] = useState([]);
  // const handleFetchCadences = () => {
  //   dispatch(getAllCadences(currentUserId, apiURL, token));
  // };
  // useEffect(() => {
  //   if (!cadences.fetchedAll) {
  //     handleFetchCadences();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // useEffect(() => {
  //   if (cadences && !cadences.loading) {
  //     const myCadences = cadences?.data
  //       .filter(
  //         (cad) =>
  //           (cad.status === 'ACTIVE' || cad.status === 'NEW') &&
  //           cad?.associations?.touch?.length > 0 &&
  //           cad.associations.user[0].id === currentUserId
  //       )
  //       .map((item, index) => {
  //         return {
  //           text: item.name,
  //           value: item.id,
  //           active: false,
  //           header: index === 0 ? 'My Cadences' : '',
  //         };
  //       });

  //     const sharedCadences = cadences?.data
  //       .filter(
  //         (cad) =>
  //           (cad.status === 'ACTIVE' || cad.status === 'NEW') &&
  //           cad?.associations?.touch?.length > 0 &&
  //           cad.associations.user &&
  //           cad.associations.user[0].id !== currentUserId
  //       )
  //       .map((item, index) => {
  //         return {
  //           text: item.name,
  //           value: item.id,
  //           active: false,
  //           header: index === 0 ? 'Shared Cadences' : '',
  //         };
  //       });

  //     setCadenceList(myCadences.concat(sharedCadences));
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [cadences]);

  const [saveSettingStatus, setSaveSettingStatus] = useState('');
  const [isScheduleFollowUp, setIsScheduleFollowUp] = useState(false);
  const [createReferralFollowUp, setCreateReferralFollowUp] = useState(false);
  const [considerAsCallTouch, setConsiderAsCallTouch] = useState('');
  const [clSessionId, setClSessionId] = useState();

  useEffect(() => {
    const metricsCnt = {
      totalConnect: totalConnectCount,
      totalDials: totalDialCount,
      totalVmleft: totalVmCount,
    };

    setMetricsCount(metricsCnt);
    metricsCountRef.current = metricsCnt;
  }, [totalConnectCount, totalDialCount, totalVmCount]);

  const confirmExit = (event) => {
    if (myUnSavedCallDetailsExistRef.current === true) {
      myUnSavedCallDetailsExistRef.current = false;
      setIsUnSavedCallDetailsExist(myUnSavedCallDetailsExistRef.current);
      handleActionSaveCallDetails('save', true, 'close');
    }
  };

  const domNode = useClickOutside(() => {
    if (!recordVmPopoverOpen && !showConfirmModal) {
      setPopoverOpen(false);
    }
  }, popoverOpen);

  window.addEventListener('beforeunload', confirmExit);

  const { data: payload } = useQuery(CLK_PAYLOAD, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });
  const payloadData = useMemo(
    () =>
      payload && payload.clickdialer && payload.clickdialer.data
        ? payload.clickdialer.data[0]
        : {},
    [payload]
  );

  const phoneFields = useMemo(
    () =>
      prospectToRender &&
      Object.entries(prospectToRender).filter(
        ([key, val]) =>
          val && (key.startsWith('customPhone') || key.startsWith('phone'))
      ),
    [prospectToRender]
  );

  const { data: lookupData } = useQuery(GET_LOOKUP_VALUE_QUERY, {
    variables: {
      lookupsFilter: `filter[lookupName]=:[enable_crm_log_dialing_session,disable_call_logs]`,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const lookup = useMemo(() => {
    const lookupJson = {};
    if (lookupData && lookupData.lookup.data) {
      lookupData.lookup.data.forEach((item) => {
        lookupJson[item.lookupName] = item.lookupValue;
      });
    }
    return lookupJson;
  }, [lookupData]);

  const formateDateTime = (inputDateString) => {
    if (inputDateString) {
      const dateTime = moment(inputDateString).format('M/D/YYYY h:mm A');
      return dateTime;
    }
    return '';
  };

  const loadCkRegister = () => {
    const cdSessionId = sessionStorage.getItem('sessionId');
    const registerParam = new URLSearchParams();
    registerParam.append('partnerid', payloadData.partnerId);
    registerParam.append('payload', payloadData.payload);
    registerParam.append('payload_es', payloadData.payloadES);
    if (cdSessionId) {
      registerParam.append('session_id', cdSessionId);
    }
    registerParam.append('request_initiater_from', 'Cadence-Register');
    const apiUrl = requerstApiUrl + '/register';
    ClctiClient(
      registerParam,
      apiUrl,
      token,
      payloadData.connectLeaderSignature
    )
      .then((res) => {
        if (res.data.status === 1 || res.data.status === '1') {
          if (res.data.error_reason === 'Invalid Session') {
            //End the current session
            handleEndSession();
            sessionStorage.removeItem('sessionId');
          } else if (
            res.data.error_reason ===
            'License Expired. Please contact license@connectleader.com.'
          ) {
            const message = `Click Dialer ${res.data.error_reason}`;
            notify(message, 'error');
          } else {
            setClickDialerData(res.data);
          }
          return;
        }
        setClkRegister(res.data);
      })
      .catch((error) => {
        notify(error.message, 'error');
      });
  };

  useEffect(() => {
    if (org && payload && payload.clickdialer && payload.clickdialer.data) {
      loadCkRegister();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  useEffect(() => {
    return () => {
      if (myUnSavedCallDetailsExistRef.current === true) {
        handleActionSaveCallDetails('save', true, 'default');
      }
      clearInterval(talkerStatusIntervalId);
      stopMakeCallIntervals();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setClkRegister = (clkData) => {
    if (clkData !== null && Object.keys(clkData).length > 0) {
      if (clkData.session_id === undefined) {
        clearInterval(talkerStatusIntervalId);
      } else {
        sessionIdRef.current = clkData.session_id;
        setSessionId(clkData.session_id);
        sessionStorage.setItem('sessionId', clkData.session_id);
        checkTalkerStatus();
        setClickDialerData(clkData);
        setMetaData(clkData.metadata);
        if (clkData.metadata && clkData.metadata.metricsCount) {
          metrics = clkData.metadata.metricsCount;
          setTotalConnetCount(
            metrics.totalConnect ? parseInt(metrics.totalConnect) : 0
          );
          setTotalDialCount(
            metrics.totalDials ? parseInt(metrics.totalDials) : 0
          );
          setTotalVmCount(
            metrics.totalVmleft ? parseInt(metrics.totalVmleft) : 0
          );
        }
        setShowCallerIds({
          display:
            clkData.metadata.caller_id_mode === 'CUSTOM' ? 'block' : 'none',
        });
        setCallOutcomeTab(
          metaData && metaData.enable_followup_tab === 'Y'
            ? 'follow_up'
            : 'history'
        );

        talkerStatusIntervalId = setInterval(checkTalkerStatus, 5000);
      }
    }
  };

  //This use effect will trigger based on the talker status
  useEffect(() => {
    if (loginStatus === 'LOGGED_IN') {
      myTalkerLoginStatus.current = true;
      setTalkerLoginStatus(true);
      sessionStartTimeRef.current = new Date().toISOString();
      setSessionStartTime(sessionStartTimeRef.current);

      //save cl session log
      if (
        lookup &&
        lookup.enable_crm_log_dialing_session === 'Y' &&
        reportSessionId
      ) {
        saveSessionLog({
          variables: {
            input: { reportSessionId },
          },
        });
      }
    } else if (loginStatus === 'NOT_LOGGED_IN') {
      // If salesrep_status changed from 'LOGGED_IN' to 'NOT_LOGGED_IN' end the session
      // If there is any call going on, hang up the call and then end the session.
      if (myTalkerLoginStatus.current === true && talkerIsOnCall) {
        handleActionHangUp();
      } else if (myUnSavedCallDetailsExistRef.current === true) {
        handleActionSaveCallDetails('save', true);
      } else if (
        myTalkerLoginStatus.current === true &&
        talkerIsOnCall === false
      ) {
        handleEndSession();
      }
      //Talker is not loggedIn
      myTalkerLoginStatus.current = false;
      setIsDialingProgress(false);
      setTalkerLoginStatus(false);
    } else if (loginStatus === 'INVALID_SESSION') {
      handleEndSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginStatus]);

  const checkTalkerStatus = (callme, phoneToDial, isInitiateCall) => {
    if (sessionStorage.getItem('sessionId') === null) {
      return;
    }
    const talkerFormData = new URLSearchParams();
    talkerFormData.append('session_id', sessionStorage.getItem('sessionId'));
    talkerFormData.append('total_vm_left', totalVmCount);

    ClctiClient(talkerFormData, requerstApiUrl + '/gettalkerstatus')
      .then((res) => {
        const responseData = res.data;

        if (responseData.status === 0) {
          //Setting reportSession Id
          if (responseData.salesrep_status === 'LOGGED_IN') {
            setReportSessionId(responseData.reportSessionId);
          }
          setLoginStatus(responseData.salesrep_status);

          //Initiate the click dialer call once salesrep login to conference bridge.
          if (
            isInitiateCall ||
            (callme && responseData.salesrep_status === 'LOGGED_IN')
          ) {
            // alert(phoneToDial);
            //Talker login status getting delay thats what added the set timeout here.
            setTimeout(function () {
              handleActionMakeCall(phoneToDial);
            }, 300);
          } else if (
            responseData.salesrep_status === 'NOT_LOGGED_IN' &&
            callme
          ) {
            setShowCallMeToJoinModal(true);
          }
        } else if (responseData.status === 1) {
          setLoginStatus('NOT_LOGGED_IN');
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
      });
  };

  const handleEndSession = () => {
    //If user is on ongoing call the notify user
    if (talkerIsOnCall) {
      notify(
        'WARNING (CD002): You are currently on a call. Please hang up your call and then end your Session',
        'error'
      );
      return null;
    }

    // If user is made call and the performed Leave VM or Hangup but not the saved call details. In the case notify user to save the call details before ending the session
    if (myUnSavedCallDetailsExistRef.current === true) {
      notify(
        'WARNING (CD004): Please save the call details and then try again.',
        'error'
      );
      return;
    }

    setEndSessionStatus(true);
    const sessionDetails = new URLSearchParams();
    sessionDetails.append('session_id', sessionIdRef.current);
    sessionDetails.append('total_vm_left', totalVmCount);
    sessionDetails.append('session_end_time', new Date().toISOString());
    sessionDetails.append('end_session_invokedby', 'TrueCadence');
    sessionDetails.append('log_type', 'FINAL');
    sessionDetails.append('end_phone_call', 'Y');
    sessionDetails.append('session_start_time', sessionStartTime);

    ClctiClient(sessionDetails, requerstApiUrl + '/endsession')
      .then((res) => {
        setSessionStartTime('');
        setEndSessionStatus(false);
        sessionStorage.removeItem('sessionId');
        setTotalDialCount(0);
        setTotalVmCount(0);
        setTotalConnetCount(0);
        setMetricsCount(intialMetrics);
        clearInterval(talkerStatusIntervalId);
        stopMakeCallIntervals();
        loadCkRegister();
        //Saving the session end time
        if (
          lookup &&
          lookup.enable_crm_log_dialing_session === 'Y' &&
          reportSessionId
        ) {
          saveSessionLog({
            variables: {
              input: { reportSessionId, clSessionId },
            },
          });
          setReportSessionId('');
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
        setEndSessionStatus(false);
      });
  };

  const [
    fetchActivityHistory,
    { data: historyData, loading: historyLoading },
  ] = useLazyQuery(FETCH_ACTIVITY_HISTORY, {
    onCompleted: (response) =>
      handleActivityHistoryRequestCallback(response, true),
    onError: (response) => handleActivityHistoryRequestCallback(response),
  });

  const handleActivityHistoryRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      const resData =
        response.history && response.history.data
          ? response.history.data
          : response.data;
      const jsonObject = resData && resData.length > 0 ? resData[0] : {};
      const hasRecordProperty = Object.prototype.hasOwnProperty.call(
        jsonObject,
        'records'
      );
      if (hasRecordProperty) {
        const records = jsonObject?.records[0]?.ActivityHistories
          ? jsonObject.records[0].ActivityHistories.records
          : [];
        setHistoryActivity(records);
      } else {
        setHistoryActivity(resData);
      }
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to fetch history.',
        historyData,
        'activity_history'
      );
    }
  };

  const [saveSessionLog, { data: sessionLogData }] = useLazyQuery(
    CD_SESSION_LOG,
    {
      onCompleted: (response) =>
        handleSessionLogRequestCallback(response, true),
      onError: (response) => handleSessionLogRequestCallback(response),
    }
  );

  const handleSessionLogRequestCallback = (response, requestStatus) => {
    if (requestStatus) {
      setClSessionId(
        response?.sessionLog?.data[0] ? response.sessionLog.data[0].id : ''
      );
    } else {
      showErrorMessage(
        response,
        'Failed save the CD Session Logs.',
        sessionLogData,
        'session_log'
      );
    }
  };

  const [saveCallLog, { data: callLogData }] = useLazyQuery(CD_CALL_LOG, {
    context: {
      timeout: 60000,
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed save the CD Call Logs.',
        callLogData,
        'call_log'
      );
    },
  });

  const isOnCall = (warningId) => {
    let returnValue = false;
    if (isDialingProgress || talkerIsOnCall) {
      notify(
        'WARNING (' +
          warningId +
          '): Please hangup your current call and try again.',
        'error'
      );
      returnValue = true;
    }
    return returnValue;
  };
  //To handle call outcome tab
  const handleCallTabChange = (tabValue) => {
    if (tabValue !== callOutcomeTab) {
      setCallOutcomeTab(tabValue);
    }
  };

  /**
   * Function responsible for making a call
   */
  const handleActionMakeCall = (
    phoneToDial,
    sourcePhone,
    countryCodePrefixed
  ) => {
    // If user is on ongoing call the notify user
    if (isOnCall('CD002')) {
      return null;
    }
    //stopMakeCallIntervals();
    phoneToDial = phoneToDial ? phoneToDial : prospectToRender.phone;
    setDialingPhoneNumber(phoneToDial);
    setSourcePhoneNumber(sourcePhone);
    if (
      myTalkerLoginStatus.current === false &&
      countryCodePrefixed === undefined
    ) {
      checkTalkerStatus(true, phoneToDial);
      return;
    }

    // If Phone Number is not available in 'contact' data notify user saying 'Unable to make a call'
    if (typeof phoneToDial === 'undefined' || phoneToDial === '') {
      notify(
        "ERROR (CD031): Mandatory information 'Phone' is empty. Unable to make a call.",
        'error'
      );
      return;
    }
    // If user is made call and the performed Leave VM or Hangup but not the saved call details. In the case notify user to save the call details before ending the session
    if (myUnSavedCallDetailsExistRef.current === true) {
      if (talkerLoginStatus === false && talkerIsOnCall === false) {
        handleActionSaveCallDetails('save', false);
      } else {
        notify('Please save the call details and then try again.', 'error');
        return;
      }
    }

    const isFollowUpTask =
      memberTaskId && callInitiatePage.indexOf('pendingCalls') > -1
        ? true
        : false;
    if (
      prospectToRender.currentTouchType === 'CALL' &&
      (callInitiatePage.indexOf('pendingCalls') === -1 || isFollowUpTask)
    ) {
      setShowCallTouchConfirmModal(true);
    } else {
      makeCall(phoneToDial, sourcePhone, countryCodePrefixed);
    }
  };
  //Make Call
  const makeCall = (phoneToDial, sourcePhone, countryCodePrefixed) => {
    //setDisplayBoard(true);
    setDefaultDuration([0, 0, 0]);

    const callDetails = new URLSearchParams();
    callDetails.append('session_id', sessionStorage.getItem('sessionId'));
    callDetails.append('sr_phone_number', sourcePhone);
    callDetails.append('ds_phone_number', phoneToDial);
    callDetails.append('account_name', prospectToRender.accountName);
    callDetails.append('contact_name', prospectToRender.contactName);
    callDetails.append('title', prospectToRender.title);
    callDetails.append('email', prospectToRender.email);
    callDetails.append('crm_record_id', prospectToRender.crmId);
    callDetails.append('country_code_prefixed', countryCodePrefixed);

    /* ----- Start showing loading message -begin ----- */
    let connectingMsgCounter = 0;
    const msgIntervalId = setInterval(function () {
      setCallConnectStatus('Dialing' + dotsArr[connectingMsgCounter++]);
      connectingMsgCounter =
        connectingMsgCounter === 3 ? 0 : connectingMsgCounter;
    }, 250);
    /* ----- Start showing loading message -end ----- */
    setIsDialingProgress(true);
    setCallStartTime('');
    setCallerId('');
    setCallEndTime('');

    callResponseRef.current = '';
    setCallResponse(callResponseRef.current);

    ClctiClient(callDetails, requerstApiUrl + '/makecall')
      .then((response) => {
        setCallConnectStatus('Connected');
        //Removing message interval
        clearInterval(msgIntervalId);

        if (response.data.status === 1) {
          const message =
            response.data?.error_reason.indexOf(
              'org.asteriskjava.live.NoSuchChannelException'
            ) !== -1
              ? 'Sorry! We could not reach you at the moment. Please try again later.'
              : response.data.error_reason;

          notify(message, 'error');
          setIsDialingProgress(false);
          return;
        }
        callResponseRef.current = response.data;
        setTalkerIsOnCall(true);
        setCallResponse(response.data);
        myUnSavedCallDetailsExistRef.current = true;
        setIsUnSavedCallDetailsExist(myUnSavedCallDetailsExistRef.current);
        setCallStartTime(new Date().toISOString());
        setCallerId(response.data.caller_id);
        //Increasing dial count
        setTotalDialCount(
          metricsCountRef.current
            ? metricsCountRef.current.totalDials + 1
            : totalDialCount + 1
        );
        // Start 'call duration' timer
        startMakeCallIntervals();
        //If the call details are not saved then stoping prospects navigation
        handleStopNavigation(true);
        //loading prospect activity histor
        if (org && org.crmType !== 'standalone') {
          fetchActivityHistory({
            variables: {
              id: prospectToRender.id,
            },
          });
        }
        setDialingPhoneNumber('');
        if (
          metaData.cd_open_detail === 'Y' &&
          org &&
          org.crmType !== 'standalone'
        ) {
          OpenCrmWindow(
            org,
            prospectToRender.crmId,
            prospectToRender.recordType
          );
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
        setIsDialingProgress(false);
      });
  };

  useEffect(() => {
    if (clickDialerData?.status === '1') {
      notify(clickDialerData.error_reason, 'error');
      return;
    }
    //Initiate call
    if (showMakeCall && showMakeCall.isDial === true && clickDialerData) {
      setTimeout(function () {
        handleActionMakeCall(showMakeCall.phone);
      }, 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMakeCall]);

  const handleActionHangUp = () => {
    if (!callResponseRef.current) {
      notify(
        'Please wait talker connect into the Conference Bridge and try again!.',
        'error'
      );
      return;
    }

    const hangupCall = new URLSearchParams();
    hangupCall.append('session_id', sessionIdRef.current);
    hangupCall.append(
      'channel_id',
      callResponseRef.current ? callResponseRef.current.channel_id : ''
    );
    hangupCall.append('request_initiater_from', 'Cadence-hangup');

    ClctiClient(hangupCall, requerstApiUrl + '/hangup')
      .then((res) => {
        setDisposition(metaData.calldisposition_for_dial);
        setCallComment(
          metaData.enable_default_call_comments === true
            ? 'Dialed by Koncert'
            : ''
        );
        setCallConnectStatus('');
        hangupReset();
      })
      .catch((error) => {
        notify(error.message, 'error');
        hangupReset();
      });
  };

  const hangupReset = () => {
    setIsDialingProgress(false);
    setTalkerIsOnCall(false);
  };

  const checkCallStatus = () => {
    const callDetails = new URLSearchParams();
    callDetails.append('session_id', sessionStorage.getItem('sessionId'));
    callDetails.append('channel_id', callResponseRef.current.channel_id);
    callDetails.append('total_vm_left', '');
    callDetails.append('session_start_time', sessionStartTime);
    callDetails.append('request_initiater_from', 'Cadence-call status');

    ClctiClient(callDetails, requerstApiUrl + '/getcallstatus')
      .then((response) => {
        const responseData = response.data;
        if (responseData.status === 1) {
          return;
        }
        if (responseData.call_status === 'CALL COMPLETED') {
          // As the call completed hide 'call in progress phone icon', 'call recording icon'
          setIsDialingProgress(false);
          //callResponse = {};
          setTalkerIsOnCall(false);
          stopMakeCallIntervals();
          setCallEndTime(new Date().toISOString());
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
      });
  };

  const saveDialMetrics = () => {
    const metrics = new URLSearchParams();
    metrics.append('session_id', sessionStorage.getItem('sessionId'));
    metrics.append('total_connect', metricsCount.totalConnect + 1);
    metrics.append('total_dials', metricsCount.totalDials);
    metrics.append('total_vmleft', metricsCount.totalVmleft);

    ClctiClient(metrics, requerstApiUrl + '/savemetrics').catch((error) => {
      notify(error.message, 'error');
    });
  };

  const startMakeCallIntervals = () => {
    callInterval = setInterval(checkCallStatus, 2000);

    timeInterval = setInterval(function () {
      let seconds = Math.round(defaultDuration[2]);
      seconds = seconds > 9 ? seconds : '0' + seconds;
      let minutes = Math.round(defaultDuration[1]);
      minutes = minutes > 9 ? minutes : '0' + minutes;
      let hours = Math.round(defaultDuration[0]);
      hours = hours > 9 ? hours : '0' + hours;

      setCallDuration(hours + ':' + minutes + ':' + seconds);
      // increment seconds
      defaultDuration[2]++;

      if (defaultDuration[2] === 60) {
        // increment minutes
        defaultDuration[1]++;
        // reset seconds
        defaultDuration[2] = 0;

        if (defaultDuration[1] === 60) {
          // reset minutes
          defaultDuration[1] = 0;
          // reset hours
          defaultDuration[0]++;

          if (defaultDuration[0] === 60) {
            // increment hours
            defaultDuration[0]++;
          }
        }
      }
    }, 1000);
  };

  const stopMakeCallIntervals = () => {
    clearInterval(callInterval);
    clearInterval(timeInterval);
  };

  const hasError = (inputName, method, formName) => {
    return (
      formName &&
      formName.errors &&
      formName.errors[inputName] &&
      formName.errors[inputName][method]
    );
  };

  const validateDate = (value) => {
    const now = moment(new Date().toDateString()).format('YYYY-MM-DD');
    if (moment(value).isBefore(now)) {
      return true;
    }
    return false;
  };

  const validateSaveCallDetailsForms = (formRef) => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter(
      (i) => !i.disabled && ['INPUT', 'SELECT'].includes(i.nodeName)
    );
    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    let formData = {};
    let isValid = hasError;

    if (form.followUpDate && validateDate(form.followUpDate.value)) {
      errors.followUpDate.required = true;
      isValid = true;
    }

    if ('referral' === formName) {
      const errorFieldList = Object.values(errors).filter(
        (item) => item.required
      );

      if (
        errorFieldList.length === 1 &&
        (errors.phone.required === false || errors.email.required === false) &&
        errors.contactName.required === false
      ) {
        isValid = false;
      }
      setReferralForm({ ...referralForm, formName, errors });
    } else if ('followUp' === formName) {
      setFollowUpForm({ ...followUpForm, formName, errors });
    } else {
      setCallResultForm({ ...callResultForm, formName, errors });
    }

    if (!isValid) {
      formData = [...form.elements].reduce((formJson, item) => {
        if (item.type === 'checkbox') {
          formJson[item.name] =
            item.name === 'createFollowUp'
              ? item.checked
              : item.checked
              ? 'Y'
              : 'N';
        } else if (item.value.trim() !== '') {
          formJson[item.name] = item.value;
        }
        return formJson;
      }, {});
    }
    return { hasError: isValid, formData };
  };

  const handleActionSaveCallDetails = (
    dialNext,
    isSessionTimedOut,
    windowClose,
    nextDialingNumber
  ) => {
    const callResult = validateSaveCallDetailsForms(callResultFormRef);
    if (callResult.hasError && !isSessionTimedOut) {
      return;
    }

    setCommentsError('');
    if (
      !isSessionTimedOut &&
      callResultFormRef.current.callResult.value === 'Other' &&
      callResultFormRef.current.callComments.value === ''
    ) {
      setCommentsError('Please enter call comments.');
      return;
    }

    const reqData = {};
    reqData.callOutcome = callResult.formData;
    if (isSessionTimedOut) {
      reqData.callOutcome = {
        callResult:
          callResult.formData && callResult.formData.callResult
            ? callResult.formData.callResult
            : 'Other',
        callComments: callResultFormRef.current.callComments.value,
      };
    }
    //Validation for followup
    if (followUpFormRef.current.isScheduleFollowUp.checked) {
      const followUpResult = validateSaveCallDetailsForms(followUpFormRef);

      if (followUpResult.hasError) {
        return;
      }

      if (followUpResult.formData.reminder !== '') {
        const time = moment(
          followUpResult.formData.followUpDate +
            ' ' +
            followUpResult.formData.reminder
        ).format('hh:mm A');
        followUpResult.formData['reminder'] = time;
      }
      reqData.followUpInformation = followUpResult.formData;
    }

    const refForm = referralFormRef.current;
    if (
      refForm.contactName.value !== '' ||
      refForm.phone.value !== '' ||
      refForm.email.value !== ''
    ) {
      const referralResult = validateSaveCallDetailsForms(referralFormRef);

      if (referralResult.hasError) {
        return;
      }
      if (referralResult.formData.createFollowUp === true) {
        referralResult.formData.reminder = getTimeString(
          referralResult.formData.followUpDate +
            ' ' +
            referralResult.formData.reminder
        );
      } else {
        delete referralResult.formData.reminder;
      }

      delete referralResult.formData[''];
      // referralResult.formData['cadenceId'] = cadenceId;
      reqData.referralInformation = referralResult.formData;
    }
    setRequestSuccess(true);
    setSaveActionBtn(dialNext);
    reqData.vm_left =
      voiceMailName === '' || voiceMailName === null ? 'false' : 'true';
    reqData.vm_file_name = voiceMailName;
    reqData.title = prospectToRender.title;
    reqData.session_start_time = sessionStartTime;
    reqData.phone_number = dialingPhoneNumber;
    reqData.order = '';
    reqData.crm_record_id = prospectToRender.crmId;
    reqData.email = prospectToRender.email;
    reqData.contact_name = prospectToRender.contactName;
    reqData.call_start_time = callStartTime;
    reqData.call_end_time = callEndTime;
    reqData.account_name = prospectToRender.accountName;
    reqData.call_disposition = 'Dialed';
    reqData.call_comments = 'Dialed by Koncert';
    reqData.caller_id = callerId;
    reqData.is_call_recording_enabled =
      clickDialerData.enable_call_recording_url;
    reqData.member_task_id = memberTaskId;
    reqData.source_phone = clickDialerData.phone_main_number;
    reqData.dialer_phone_type = dialerPhoneType;
    reqData.wrap_time = wrapTime;
    reqData.crmType = org && org.crmType ? org.crmType : 'standalone';
    const customerInformation = prospectToRender;
    if (
      (prospectToRender.currentTouchType === 'CALL' &&
        considerAsCallTouch === '') ||
      considerAsCallTouch === 'Y'
    ) {
      customerInformation['wfrulemethod'] = '';
      customerInformation['cadenceId'] =
        prospectToRender.associations && prospectToRender.associations.cadence
          ? prospectToRender.associations.cadence[0].id
          : 0;
    } else {
      customerInformation['wfrulemethod'] = 'createMember';
      customerInformation['cadenceId'] = '0';
    }
    delete customerInformation['associations'];
    reqData.customerInformation = customerInformation;

    if (
      reqData.customerInformation === null ||
      reqData.customerInformation === ''
    ) {
      reqData.otherCustomerInformation = 'Error in getting customerInformation';
    }

    const callDetails = new URLSearchParams();
    callDetails.append('session_id', sessionIdRef.current);
    callDetails.append('parameters', JSON.stringify(reqData));
    callDetails.append('request_initiater_from', 'Cadence-Save Call');

    ClctiClient(callDetails, requerstApiUrl + '/savecalldetails', token)
      .then((response) => {
        setRequestSuccess(false);
        setSaveActionBtn('');
        setCallConnectStatus('');
        if (response.data.status === 1) {
          myUnSavedCallDetailsExistRef.current = isSessionTimedOut
            ? false
            : myUnSavedCallDetailsExistRef.current;

          const errorReason = response.data.error_reason;
          if (errorReason && errorReason.indexOf('{') !== -1) {
            const errorString = errorReason.slice(
              errorReason.indexOf('{'),
              errorReason.lastIndexOf('}') + 1
            );
            const errorArray = JSON.parse(errorString);
            const message =
              errorArray?.errors[0]?.crmErrorMessage ||
              errorArray?.errors[0]?.message;

            notify(message, 'error');
          } else {
            notify(response.data.error_reason, 'error');
          }
          return;
        }
        setConsiderAsCallTouch('');
        setIsScheduleFollowUp(false);
        notify('Call Details saved successfully.', 'success');
        //Reset Un saved call details check
        myUnSavedCallDetailsExistRef.current = false;
        setIsUnSavedCallDetailsExist(myUnSavedCallDetailsExistRef.current);
        //Reset the call details form
        resetCallDetailsForm();
        //Incrementing totall connect count
        setTotalConnetCount(metricsCount.totalConnect + 1);
        //Clearing call interval
        stopMakeCallIntervals();
        // Allowing navigation for other prospects
        handleStopNavigation(false);
        //Save dial metrices
        saveDialMetrics();
        // set cadenceId to be null
        // setCadenceId(null);
        //Saving session metrics and end the click dialer for page refresh
        if (
          isSessionTimedOut &&
          windowClose !== 'close' &&
          windowClose !== 'default'
        ) {
          handleEndSession();
        }

        setCallDuration('00:00:00');
        //Refreshing the prospect details and activity for re-fetching recent changes
        switch (dialNext) {
          case 'DialNextContact':
            handleDialNextContact();
            break;
          case 'DialNext':
            handleActionMakeCall(nextDialingNumber);
            handleActionRefresh();
            break;
          default:
            if (windowClose !== 'default') {
              handleActionRefresh();
            }
            break;
        }
        //Save CD call log details in CRM
        if (
          lookup &&
          lookup.disable_call_logs === 'N' &&
          lookup.enable_crm_log_dialing_session === 'Y' &&
          reportSessionId &&
          clSessionId
        ) {
          //Save CD call log details
          saveCallLog({
            variables: {
              prospectId: prospectToRender.id,
              input: {
                callStartTime: callStartTime,
                crmRecordId: prospectToRender.crmId,
                reportSessionId: reportSessionId,
                clSessionId: clSessionId,
              },
            },
          });
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
        setRequestSuccess(false);
        setSaveActionBtn('');
      });
  };

  const resetCallDetailsForm = () => {
    if (callResultFormRef.current) {
      callResultFormRef.current.reset();
      followUpFormRef.current.reset();
      referralFormRef.current.reset();
    }
  };
  const handleActionCallerMode = (e) => {
    if ('CUSTOM' === e.target.value) {
      setShowCallerIds({ display: 'block' });
    } else if ('ABCID' === e.target.value) {
      getMappedCallerIdGroup();
      setShowCallerIds({ display: 'none' });
    }
    metaData.caller_id_mode = e.target.value;
    setMetaData(metaData);
  };

  const getMappedCallerIdGroup = () => {
    const mappedData = new URLSearchParams();
    mappedData.append('session_id', sessionIdRef.current);

    ClctiClient(mappedData, requerstApiUrl + '/getmappedcalleridgroup')
      .then((res) => {
        if (res.status === 0 && res.mappedCallerIdGroupCount === 0) {
          notify(
            "You have selected Mapped Caller IDs option but you don't have any mapped caller IDs assigned. Please contact support@connectleader.com.",
            'error'
          );
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
      });
  };

  const handleActionDeleteVoiceMail = () => {
    const voiceId = dialerSettingFormRef.current.voiceMessage.value;
    if (voiceId === '' || voiceId === null) {
      notify('Please select a VM from the list to delete.', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleActionVoiceMail = (action) => {
    if (talkerLoginStatus === false && action !== 'setting') {
      notify(commonMessage.ERROR_CD015, 'error');
      return;
    }
    const form = dialerSettingFormRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT', 'SELECT'].includes(i.nodeName)
    );
    const { errors } = FormValidator.bulkValidate(inputs);
    setDialerSettingForm({ ...dialerSettingForm, formName, errors });
    const callerIds = [];
    const dialerSettings = [...form.elements].reduce((settings, item) => {
      if (
        item.type === 'checkbox' &&
        item.checked &&
        item.name === 'callerIds'
      ) {
        callerIds.push(item.value);
      } else if (item.type === 'checkbox') {
        settings[item.name] = item.checked ? 'Y' : 'N';
      } else if (item.value.trim() !== '') {
        settings[item.name] = item.value;
      }
      return settings;
    }, {});
    if (
      action === 'setting' &&
      callerIds.length === 0 &&
      dialerSettings.callerMode === 'CUSTOM'
    ) {
      notify('Please select atleast one caller id to save.', 'error');
      return;
    }
    const voiceMessageData = new URLSearchParams();
    voiceMessageData.append('session_id', sessionIdRef.current);
    voiceMessageData.append('vm_file', dialerSettings.voiceMessage);

    const callControlData = {
      caller_id_mode: dialerSettings.callerMode,
      selected_caller_ids: callerIds.length > 0 ? callerIds.join(',') : '',
      is_international_dial_code_prefixed: dialerSettings.isInternationDialing,
      cd_create_call_log_for_each_dial: 'N',
      cd_create_call_log_when_play_vm: 'N',
      open_detail: dialerSettings.openDetailedView,
      enable_default_call_comments: dialerSettings.defaultCallComment === 'Y',
    };

    setSaveSettingStatus(action);

    let actionUrl = 'save';
    switch (action) {
      case 'delete':
        actionUrl = 'deletevm';
        break;
      case 'listen':
        actionUrl = 'listenvm';
        break;
      default:
        actionUrl = 'savedialersettings';
        voiceMessageData.append('parameters', JSON.stringify(callControlData));
    }

    voiceMessageData.append('request_initiater_from', 'Cadence-' + actionUrl);

    const apiUrl = requerstApiUrl + '/' + actionUrl;
    ClctiClient(voiceMessageData, apiUrl)
      .then((res) => {
        setSaveSettingStatus(false);
        if (res.status === 1) {
          notify(
            `ERROR (CD013): CL Error (${actionUrl}) error_code : ${res.error_code}. error_reason: ${res.error_reason}
              ${commonMessage.ERROR_SUPPORT}`,
            'error'
          );
          return;
        }
        if (actionUrl === 'savedialersettings') {
          setPopoverOpen(false);
          notify('Dialer Settings Saved Successfully.', 'success');
        } else if (actionUrl === 'deletevm') {
          const voiceMessage = metaData.voice_messages.filter(
            (message) => message.message_name !== dialerSettings.voiceMessage
          );
          metaData.voice_messages = voiceMessage;
          setPopoverOpen(false);
          setMetaData(metaData);
        }
      })
      .catch((error) => {
        notify(
          `ERROR (CD017): CL Error (${actionUrl}) error_code: ${error.error_code}. error_reason: ${error.error_reason} ${commonMessage.ERROR_SUPPORT}`,
          'error'
        );
        setSaveSettingStatus('');
      });
  };

  const handleActionRecordVm = (event) => {
    if (talkerLoginStatus === false) {
      notify(commonMessage.ERROR_CD015, 'error');
      return;
    }

    if (talkerIsOnCall) {
      notify(
        'ERROR (CD032): You cannot record a voice message while you are on a call!',
        'error'
      );
      return;
    }

    if (newVmFileName === '') {
      notify(
        'ERROR (CD020): Please specify a name for your Voice Message.',
        'error'
      );
      return;
    }

    const vmList = metaData.voice_messages.filter(
      (item) => item.message_name === newVmFileName
    );
    if (vmList.length > 0) {
      notify(
        'ERROR (CD021): This VM Name already exists. Please try with a different name.',
        'error'
      );
      return;
    }

    setVmRequestStatus(true);
    const voiceMessageData = new URLSearchParams();

    let actionUrl = '';
    switch (event.target.id) {
      case 'stop_vm':
        actionUrl = 'endrecording';
        setVmStep(3);
        break;
      case 'listen_vm':
        actionUrl = 'listenvm';
        break;
      case 'confirm_recording':
        actionUrl = 'confirmrecording';
        voiceMessageData.append('duration', vmData.duration);
        break;
      default:
        actionUrl = 'recordvm';
        setVmStep(2);
    }

    voiceMessageData.append('session_id', sessionIdRef.current);
    voiceMessageData.append('vm_file', newVmFileName);
    const apiUrl = requerstApiUrl + '/' + actionUrl;

    ClctiClient(voiceMessageData, apiUrl)
      .then((res) => {
        setVmRequestStatus(false);
        const responseData = res.data;
        if (responseData.status === 1) {
          if (actionUrl === 'confirmrecording') {
            notify(
              'Could not end recording. Try recording a short VM',
              'error'
            );
          } else {
            const errorMsg = responseData.error_reason.startsWith('System')
              ? 'System Error'
              : responseData.error_reason;
            notify(`${errorMsg} ${commonMessage.ERROR_SUPPORT}`, 'error');
          }
          return;
        }

        if (responseData.status === 0 && actionUrl === 'endrecording') {
          const message = {
            duration: Math.ceil(parseInt(responseData.duration)),
            vmFileName: newVmFileName,
          };
          setVmData(message);
        } else if (
          responseData.status === 0 &&
          actionUrl === 'confirmrecording'
        ) {
          const voiceMessage = metaData.voice_messages;
          voiceMessage.push({
            message_name: newVmFileName,
            duration: vmData.duration,
          });
          metaData.voice_messages = voiceMessage;
          setVmData({});
          setVmStep(1);
          setRecordVmPopoverOpen(false);
          setPopoverOpen(false);
          setMetaData(metaData);
          setNewVmFileName('');
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
        setVmRequestStatus(false);
      });
  };

  //Hangup the Voice Message
  const handleActionHangUpVM = () => {
    if (talkerLoginStatus === false) {
      notify(commonMessage.ERROR_CD015, 'error');
      return;
    }

    const vmName = leaveVmRef.current.value;
    if (vmName === '' || vmName === undefined) {
      notify('Please select a VM', 'error');
      return;
    }

    setVoiceMailName(vmName);
    setWrapTime(callDuration);
    const vmDetails = new URLSearchParams();
    vmDetails.append('session_id', sessionIdRef.current);
    vmDetails.append('vm_file', vmName);
    vmDetails.append('channel_id', callResponse.channel_id);
    vmDetails.append('request_initiater_from', 'Cadence-playvm');

    ClctiClient(vmDetails, requerstApiUrl + '/playvm')
      .then((res) => {
        if (res.data.status === 1) {
          notify(
            `ERROR (CD013): CL Error (playvm) error_code: ${res.data.error_code} .error_reason: ${res.data.error_reason}. ${commonMessage.ERROR_SUPPORT}`,
            'error'
          );
          return;
        }
        setIsDialingProgress(false);
        setTalkerIsOnCall(false);
        setDisposition(metaData.calldisposition_for_leftvm);
        setCallComment('Dialed by Koncert');
        setTotalVmCount(metricsCount.totalVmleft + 1);
      })
      .catch((error) => {
        notify(
          'ERROR (CD017): CL Error (playvm) error_code : ' +
            error.error_code +
            '. error_reason : ' +
            error.error_reason +
            commonMessage.ERROR_SUPPORT,
          'error'
        );
      });
  };

  const handleCheckChange = (event) => {
    const metaInfo = JSON.parse(JSON.stringify(metaData));

    if (event.target.id === 'enable_default_call_comments') {
      metaInfo[event.target.id] = event.target.checked;
    } else {
      metaInfo[event.target.id] = event.target.checked ? 'Y' : 'N';
    }
    setMetaData(metaInfo);
  };

  const handleCallerIdCheckChange = (event) => {
    let callerIdsArr = '';
    if (
      event.target.id === 'caller_ids_select_none' ||
      metaData.caller_ids === undefined
    ) {
      callerIdsArr = [];
    } else if (event.target.id === 'caller_ids_select_all') {
      callerIdsArr = metaData.caller_ids.split(',');
    } else if (event.target.checked) {
      callerIdsArr = metaData.caller_id_list.split(',');
      callerIdsArr.push(event.target.value);
    } else {
      callerIdsArr = metaData.caller_id_list
        .split(',')
        .filter((item) => item !== event.target.value);
    }
    metaData['caller_id_list'] = callerIdsArr.join(',');
    setMetaData(JSON.parse(JSON.stringify(metaData)));
  };

  return (
    <Card className="card-default mx-0">
      <CardHeader className="bg-dark-light">
        <CardTitle>
          <Row className="align-items-center">
            <Col sm={9} className="pr-0">
              <h5
                className="my-1 text-koncert-white"
                style={{ fontSize: '1rem' }}
              >
                <i className="fas fa-phone fa-rotate-90 fa-sm mr-2"></i>
                Click Dialer
                {talkerLoginStatus ? (
                  <i className="fas fa-circle fa-xs mx-2 text-success"></i>
                ) : (
                  <i className="fas fa-circle fa-xs mx-2 text-danger"></i>
                )}
              </h5>
            </Col>
            <Col sm={3} className="pl-0 text-right">
              <div className="d-flex justify-content-end">
                <span className={talkerIsOnCall ? 'd-block' : 'd-none'}>
                  <i className="svgicon calling mr-2 text-success"></i>
                </span>
                <span
                  className="fa-stack fa-md mt-n2"
                  style={{
                    display:
                      !talkerIsOnCall && isUnSavedCallDetailsExist
                        ? 'block'
                        : 'none',
                  }}
                >
                  <i
                    className="fas fa-phone-alt fa-stack-1x text-danger"
                    style={cusPhoneAlt}
                  ></i>
                  <i className="fas fa-arrow-down fa-stack-1x text-muted mt-2"></i>
                </span>
                <i
                  title="End Session"
                  className={
                    endSessionStatus
                      ? 'fa fa-spinner fa-spin pt-1 mr-2'
                      : 'fas fa-sm fa-ban pointer pt-1 mr-2 text-muted'
                  }
                  onClick={handleEndSession}
                ></i>
                <i
                  title="Dialer Settings"
                  className="fas fa-sm fa-cog pointer pt-1 text-koncert-white"
                  id="dialer_settings"
                  onClick={() => {
                    if (!recordVmPopoverOpen) {
                      popoverToggle();
                    }
                  }}
                ></i>
              </div>
            </Col>
          </Row>
        </CardTitle>
      </CardHeader>
      <CardBody className="py-0 bt">
        <Row className=" py-1 ">
          <Col md={5} className="px-2">
            <div
              style={{
                display:
                  isDialingProgress || isUnSavedCallDetailsExist
                    ? 'block'
                    : 'none',
              }}
            >
              Talk Time:
              <span className="ml-1">{callDuration}</span>
            </div>
          </Col>
          <Col md={7} className="px-2">
            {(isDialingProgress || talkerLoginStatus) && (
              <div className="d-flex justify-content-end">
                <span title="Total number of dials made" className="mr-2">
                  <i className="fa fa-phone-alt fa-sm mr-1"></i>
                  <b className="font-weight-normal text-sm mr-1">Dials:</b>
                  {metricsCount.totalDials}
                </span>

                <span title="Total number of connects" className="mr-2">
                  <i className="fas fa-link fa-sm mr-1"></i>
                  <b className="font-weight-normal text-sm mr-1">Connects:</b>
                  {metricsCount.totalConnect}
                </span>

                <span title="Total number of VM's left">
                  <i className="fas fa-microphone-alt fa-sm mr-1"></i>
                  <b className="font-weight-normal text-sm mr-1">VMs:</b>
                  {metricsCount.totalVmleft}
                </span>
              </div>
            )}
          </Col>
        </Row>
        <Row className="d-flex flex-column">
          <Col
            className="p-2"
            style={{
              display:
                talkerLoginStatus || isDialingProgress ? 'none' : 'block',
            }}
          >
            <Row className="d-flex mt-1">
              <Col md={6}>
                <h5 className="mb-1">
                  <span>Dial</span>
                  <span title="Call me, to Join" className="mt-2 d-block fa-lg">
                    {clickDialerData.phone_main_number}
                  </span>
                </h5>
              </Col>
              <Col md={6}>
                <h5 className="mb-1 text-right">
                  <span>Access</span>
                  <span className="mt-2 d-block fa-lg">
                    {clickDialerData.phone_access_code}
                  </span>
                </h5>
              </Col>
              <Col className="mt-4 text-center">
                {selectUserId === currentUserId && (
                  <span
                    className="fa-stack fa-lg pointer"
                    onClick={() => {
                      if (clickDialerData?.status === '1') {
                        notify(clickDialerData.error_reason, 'error');
                        return;
                      }
                      setShowCallMeToJoinModal(true);
                    }}
                  >
                    <i className="fas fa-circle fa-stack-2x text-call"></i>
                    <i className="fa fa-phone-alt fa-stack-1x fa-inverse"></i>
                  </span>
                )}
                {selectUserId !== currentUserId && (
                  <span className="fa-stack fa-lg">
                    <i className="fas fa-circle fa-stack-2x text-call"></i>
                    <i className="fa fa-phone-alt fa-stack-1x fa-inverse"></i>
                  </span>
                )}
              </Col>
            </Row>
          </Col>
          <Col className="p-2">
            <Row className="d-flex flex-column text-center">
              <Col
                style={{
                  display:
                    isDialingProgress || talkerIsOnCall ? 'block' : 'none',
                }}
              >
                <h4 className="text-normal  my-2">{dialingPhoneNumber}</h4>
              </Col>

              <Col
                className="mt-2"
                style={{
                  display:
                    (isDialingProgress || talkerLoginStatus) &&
                    callConnectStatus
                      ? 'block'
                      : 'none',
                }}
              >
                <h4 className="text-normal ">{callConnectStatus}</h4>
              </Col>
              <Col
                className="my-2"
                style={{
                  display: talkerIsOnCall ? 'block' : 'none',
                }}
              >
                <span
                  className="fa-stack fa-lg"
                  style={cusPhoneAlt}
                  onClick={() => {
                    handleActionHangUp();
                  }}
                >
                  <i className="fas fa-circle fa-stack-2x text-danger"></i>
                  <i className="fas fa-phone-alt fa-stack-1x fa-inverse"></i>
                </span>
              </Col>
              <Col
                className="my-2 text-center"
                style={{
                  display: talkerIsOnCall ? 'block' : 'none',
                }}
              >
                <Row className="justify-content-center">
                  <Col sm={6} className="pr-0 pl-4 text-center">
                    <FormGroup className="mb-0">
                      <Input
                        type="select"
                        name="leaveVoiceMessage"
                        id="leave_voice_message"
                        className="mw-100"
                        innerRef={leaveVmRef}
                      >
                        <option value="">--Select VM--</option>
                        {metaData &&
                          metaData.voice_messages &&
                          metaData.voice_messages.map((vm, index) => {
                            return (
                              <option value={vm.message_name} key={index}>
                                {vm.message_name}
                              </option>
                            );
                          })}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col sm={4}>
                    <ClButton
                      color="primary"
                      className="pt-2 text-nowrap"
                      icon="fa fa-paper-plane"
                      onClick={() => handleActionHangUpVM()}
                    >
                      Leave VM
                    </ClButton>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row
          style={{
            display:
              isUnSavedCallDetailsExist && !isDialingProgress
                ? 'block'
                : 'none',
          }}
        >
          {/* Call Outcome */}
          <Col>
            <div className="p-0 pt-2">
              <Form name="callResult" innerRef={callResultFormRef}>
                <FormGroup className="mb-2">
                  <Label for="call_result" className="mb-0 text-sm">
                    Call Result
                  </Label>
                  <Input
                    type="select"
                    name="callResult"
                    id="call_result"
                    value={disposition}
                    onChange={(event) => {
                      setDisposition(event.target.value);
                    }}
                    data-validate='["required"]'
                    invalid={hasError('callResult', 'required', callResultForm)}
                  >
                    <option></option>
                    {clickDialerData &&
                      clickDialerData.metadata &&
                      clickDialerData.metadata.call_dispositions.map(
                        (disposition) => {
                          return (
                            <option value={disposition} key={disposition}>
                              {disposition}
                            </option>
                          );
                        }
                      )}
                  </Input>
                  {hasError('callResult', 'required', callResultForm) && (
                    <span className="text-danger">
                      Please select the call result.
                    </span>
                  )}
                </FormGroup>
                <FormGroup className="mb-2">
                  <Label for="call_comments" className="mb-0 text-sm">
                    Call Comments
                  </Label>
                  <Input
                    type="textarea"
                    name="callComments"
                    id="call_comments"
                    value={callComment}
                    maxLength={500}
                    onChange={(event) => {
                      setCallComment(event.target.value);
                    }}
                  ></Input>
                </FormGroup>
                <div
                  style={{
                    width: '100%',
                    marginTop: '0.25rem',
                    fontSize: '80%',
                    color: '#f05050',
                  }}
                >
                  {commentsError ? commentsError : null}
                </div>
              </Form>
            </div>
          </Col>
          <Col className="mt-3">
            <Row className="align-items-center">
              <Col sm={4}>
                <span
                  className="text-primary text-link-over-dark pointer"
                  onClick={toggleCallOutcomeResult}
                >
                  <i
                    className={`fas fa-sm mr-2 ${
                      callOutcomeResult ? 'fa-chevron-up' : 'fa-chevron-right'
                    }`}
                  ></i>
                  {callOutcomeResult ? 'Show Less' : 'Show More'}
                </span>
              </Col>
              <Col sm={8} className="text-right">
                <ClButton
                  color="primary"
                  title="Save Changes"
                  className="ml-2 btn-sm"
                  icon={
                    saveActionbtn === 'save' && requestSuccess
                      ? 'fas fa-sm fa-spinner fa-sping'
                      : 'fa fa-sm fa-check'
                  }
                  disabled={!isUnSavedCallDetailsExist || requestSuccess}
                  onClick={() => handleActionSaveCallDetails('save', false)}
                >
                  {saveActionbtn === 'save' && requestSuccess
                    ? '...Wait'
                    : 'Save'}
                </ClButton>
                {phoneFields && phoneFields.length === 1 ? (
                  <ClButton
                    hidden={pathParam === 'notification'}
                    className="ml-2 btn-sm"
                    color="secondary"
                    title="Dial Next Contact"
                    icon={
                      saveActionbtn === 'DialNextContact' && requestSuccess
                        ? 'fas fa-sm fa-spinner fa-sping'
                        : 'fa fa-sm fa-user'
                    }
                    disabled={!isUnSavedCallDetailsExist || requestSuccess}
                    onClick={() =>
                      handleActionSaveCallDetails('DialNextContact', false)
                    }
                  >
                    {saveActionbtn === 'DialNextContact' && requestSuccess
                      ? '...Wait'
                      : 'Dial Next'}
                  </ClButton>
                ) : (
                  <ButtonDropdown
                    isOpen={dropdownOpen}
                    toggle={toggle}
                    className="ml-2"
                  >
                    <DropdownToggle
                      caret
                      color="secondary"
                      className="ml-0 btn-sm"
                    >
                      <i
                        className={
                          saveActionbtn === 'DialNextContact' && requestSuccess
                            ? 'fas fa-sm mr-2 fa-spinner fa-sping'
                            : 'fa fa-sm mr-2 fa-user'
                        }
                      ></i>
                      <span className="mr-1">Dial Next</span>
                    </DropdownToggle>

                    <DropdownMenu>
                      {phoneFields &&
                        phoneFields.map((item, index) => {
                          return (
                            <DropdownItem
                              key={index}
                              onClick={() =>
                                handleActionSaveCallDetails(
                                  'DialNext',
                                  false,
                                  '',
                                  item[1]
                                )
                              }
                            >
                              {item[1]}
                            </DropdownItem>
                          );
                        })}
                      <DropdownItem
                        onClick={() => {
                          handleActionSaveCallDetails('DialNextContact', false);
                        }}
                      >
                        Dial Next Contact
                      </DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                )}
              </Col>
            </Row>
          </Col>
          <Col className="mt-3 px-0">
            <Collapse isOpen={callOutcomeResult}>
              <Row>
                <Col>
                  <Nav className="nav-tabs nav-justified">
                    <NavItem
                      className="pointer nav-tabs-bg"
                      style={{
                        display:
                          metaData && metaData.enable_followup_tab === 'N'
                            ? 'none'
                            : 'block',
                      }}
                    >
                      <NavLink
                        className={
                          classnames({
                            active: callOutcomeTab === 'follow_up',
                          }) + ' font-weight-normal color-bluewood'
                        }
                        onClick={() => {
                          handleCallTabChange('follow_up');
                        }}
                      >
                        <i className="fas fa-sm fa-user-check mr-2"></i>
                        Follow up
                      </NavLink>
                    </NavItem>
                    {org && org.crmType !== 'standalone' && (
                      <NavItem className="pointer nav-tabs-bg">
                        <NavLink
                          className={
                            classnames({
                              active: callOutcomeTab === 'history',
                            }) + ' font-weight-normal color-bluewood'
                          }
                          onClick={() => {
                            handleCallTabChange('history');
                            fetchActivityHistory({
                              variables: { id: prospectToRender.id },
                            });
                          }}
                          icon={historyLoading ? 'fas fa-spinner fa-spin' : ''}
                        >
                          <i className="fas fa-history mr-2"></i>
                          {historyLoading ? 'Wait...' : 'History'}
                        </NavLink>
                      </NavItem>
                    )}
                    <NavItem
                      hidden={
                        metaData.enable_referral_tab === 'N' ? true : false
                      }
                      className="pointer nav-tabs-bg"
                    >
                      <NavLink
                        className={
                          classnames({
                            active: callOutcomeTab === 'referral',
                          }) + ' font-weight-normal color-bluewood'
                        }
                        onClick={() => {
                          handleCallTabChange('referral');
                        }}
                      >
                        <i className="fas fa-user-friends mr-2"></i>
                        Referral
                      </NavLink>
                    </NavItem>
                  </Nav>
                  <TabContent
                    activeTab={callOutcomeTab}
                    className="p-0 border-0"
                  >
                    <TabPane
                      className="p-1 pb-0"
                      tabId="follow_up"
                      hidden={
                        metaData && metaData.enable_followup_tab !== 'Y'
                          ? true
                          : false
                      }
                    >
                      <Form
                        name="followUp"
                        innerRef={followUpFormRef}
                        className="px-2"
                      >
                        <FormGroup check className="mb-2">
                          <Label
                            for="is_schedule_follow_up"
                            check
                            className="mb-0 text-sm"
                          >
                            <Input
                              type="checkbox"
                              name="isScheduleFollowUp"
                              id="is_schedule_follow_up"
                              className="form-check-input"
                              value={isScheduleFollowUp}
                              onClick={(event) => {
                                setIsScheduleFollowUp(event.target.checked);
                                if (event.target.checked === false) {
                                  followUpFormRef.current.reset();
                                }
                              }}
                            />
                            Schedule a follow up
                          </Label>
                        </FormGroup>
                        <FormGroup className="mb-2">
                          <Label for="subject" className="mb-0 text-sm">
                            Subject
                          </Label>
                          <Input
                            type="text"
                            id="subject"
                            name="subject"
                            maxLength={255}
                            disabled={!isScheduleFollowUp}
                            data-validate='["required"]'
                            invalid={hasError(
                              'subject',
                              'required',
                              followUpForm
                            )}
                          />
                          {hasError('subject', 'required', followUpForm) && (
                            <span className="text-danger">
                              Please enter the Followup Subject.
                            </span>
                          )}
                        </FormGroup>
                        <FormGroup className="mb-2">
                          <Label
                            for="follow_up_comments"
                            className="mb-0 text-sm"
                          >
                            Description
                          </Label>
                          <Input
                            type="textarea"
                            name="nextStep"
                            id="next_step"
                            maxLength={500}
                            disabled={!isScheduleFollowUp}
                          />
                        </FormGroup>
                        <FormGroup className="mb-2">
                          <Label for="follow_up_date" className="mb-0 text-sm">
                            Date
                          </Label>
                          <Input
                            type="date"
                            name="followUpDate"
                            id="follow_up_date"
                            min={today}
                            pattern="\d{2}-d{2}-d{4}"
                            disabled={!isScheduleFollowUp}
                            data-validate='["required","date"]'
                            invalid={
                              hasError(
                                'followUpDate',
                                'required',
                                followUpForm
                              ) ||
                              hasError('followUpDate', 'date', followUpForm)
                            }
                          />
                          {(hasError(
                            'followUpDate',
                            'required',
                            followUpForm
                          ) ||
                            hasError('followUpDate', 'date', followUpForm)) && (
                            <span className="text-danger">
                              Please enter the Followup Date.
                            </span>
                          )}
                        </FormGroup>
                        <FormGroup className="mb-2">
                          <Label for="follow_up_time" className="mb-0 text-sm">
                            Time
                          </Label>
                          <Input
                            type="time"
                            name="reminder"
                            id="reminder"
                            disabled={!isScheduleFollowUp}
                            defaultValue="08:00"
                          />
                        </FormGroup>
                      </Form>
                    </TabPane>
                    {org && org.crmType !== 'standalone' && (
                      <TabPane tabId="history">
                        {historyLoading && (
                          <Row className="text-center p-4">
                            <i className="fas fa-spinner fa-spin fa-2x w-100 "></i>
                          </Row>
                        )}
                        {!historyLoading && (
                          <ScrollArea
                            speed={0.8}
                            className="area"
                            contentClassName="content"
                            horizontal={true}
                            style={{
                              maxHeight: '237px',
                            }}
                          >
                            <Card className="mb-2 border-0">
                              <CardBody className="pt-0">
                                {historyActivity &&
                                  historyActivity.length > 0 &&
                                  historyActivity.map((item, index) => {
                                    return (
                                      <Row
                                        className={`align-items-center border-bottom ${
                                          index === 0 ? 'py-2' : 'py-3'
                                        }`}
                                        key={index}
                                      >
                                        <Col md={11}>
                                          <div className="pt-1 mb-2">
                                            <i className="fas fa-calendar-alt mr-2"></i>
                                            {formateDateTime(
                                              item.LastModifiedDate
                                            )}
                                          </div>
                                          <div className="mb-2">
                                            <span className="d-block text-sm">
                                              Subject
                                            </span>
                                            {item.Subject}
                                          </div>
                                          <div className="text-break text-justify">
                                            <span className="d-block text-sm">
                                              Description
                                            </span>
                                            <span title={item.Description}>
                                              {item.Description &&
                                              item.Description.length > 250
                                                ? `${item.Description.slice(
                                                    0,
                                                    249
                                                  )}..`
                                                : item.Description}
                                            </span>
                                          </div>
                                        </Col>
                                        <Col md={1} className="pl-0">
                                          <i className="fas fa-user-check mr-2"></i>
                                        </Col>
                                      </Row>
                                    );
                                  })}
                                {historyActivity.length === 0 && (
                                  <Row className="mt-3 py-2">
                                    <Col className="text-center">
                                      <span className="text-center mb-0 w-100 text-warning">
                                        <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                        No history Available
                                      </span>
                                    </Col>
                                  </Row>
                                )}
                              </CardBody>
                            </Card>
                          </ScrollArea>
                        )}
                      </TabPane>
                    )}
                    <TabPane
                      className="py-2 px-1"
                      tabId="referral"
                      hidden={
                        metaData && metaData.enable_referral_tab === 'N'
                          ? true
                          : false
                      }
                    >
                      <ScrollArea
                        speed={0.8}
                        className="area"
                        contentClassName="content"
                        horizontal={true}
                        style={{
                          minHeight: '75px',
                          maxHeight: '250px',
                          minWidth: '235px',
                        }}
                      >
                        <Form
                          name="referral"
                          innerRef={referralFormRef}
                          className="pl-2 pr-3"
                        >
                          <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Record Type</Label>
                            <Input
                              type="select"
                              name="record_type"
                              id="record_type"
                            >
                              {clickDialerData &&
                                clickDialerData.metadata &&
                                clickDialerData.metadata.record_types
                                  .split(',')
                                  .map((item, index) => {
                                    return <option key={index}>{item}</option>;
                                  })}
                            </Input>
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Account Name</Label>
                            <Input
                              type="text"
                              name="accountName"
                              id="account_name"
                            />
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Contact Name</Label>
                            <Input
                              type="text"
                              name="contactName"
                              id="contact_name"
                              data-validate='["required"]'
                              invalid={hasError(
                                'contactName',
                                'required',
                                referralForm
                              )}
                            />
                            {hasError(
                              'contactName',
                              'required',
                              referralForm
                            ) && (
                              <span className="text-danger">
                                Please enter a valid Contact Name.
                              </span>
                            )}
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Title</Label>
                            <Input type="text" name="title" id="title" />
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Email</Label>
                            <Input
                              type="text"
                              name="email"
                              id="emailAddress"
                              data-validate='["required"]'
                              invalid={
                                hasError('email', 'required', referralForm) &&
                                hasError('phone', 'required', referralForm)
                              }
                            />
                            {hasError('email', 'required', referralForm) &&
                              hasError('phone', 'required', referralForm) && (
                                <span className="text-danger">
                                  Please enter a valid Email id.
                                </span>
                              )}
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Phone Number</Label>
                            <Input
                              type="text"
                              name="phone"
                              id="phoneNo"
                              data-validate='["required"]'
                              invalid={
                                hasError('phone', 'required', referralForm) &&
                                hasError('email', 'required', referralForm)
                              }
                            />
                            {hasError('email', 'required', referralForm) &&
                              hasError('phone', 'required', referralForm) && (
                                <span className="text-danger">
                                  Please enter a valid Phone Number.
                                </span>
                              )}
                          </FormGroup>
                          {/* this will be uncommented once the clcti api for adding cadence is merged */}
                          {/* <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Cadence</Label>
                            <DropDown
                              value={cadenceId}
                              data={cadenceList}
                              name="cadence"
                              onChange={(value) => {
                                setCadenceId(value);
                              }}
                              loading={cadences.loading}
                              handleRefresh={handleFetchCadences}
                            />
                          </FormGroup> */}
                          <FormGroup className="mb-2">
                            <Label className="mb-0 text-sm">Source</Label>
                            <Input type="select" name="source" id="source">
                              <option value="Koncert">Koncert</option>
                            </Input>
                          </FormGroup>
                          <FormGroup check className="mb-2 pt-1">
                            <Label
                              for="is_schedule_referral"
                              className="text-sm"
                              check
                            >
                              <Input
                                type="checkbox"
                                name="createFollowUp"
                                id="create_follow_up"
                                onChange={(event) => {
                                  setCreateReferralFollowUp(
                                    event.target.checked
                                  );
                                }}
                              />
                              Create Follow Up
                            </Label>
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label
                              for="referral_subject"
                              className="mb-0 text-sm"
                            >
                              Subject
                            </Label>
                            <Input
                              type="text"
                              name="subject"
                              id="referral_subject"
                              disabled={!createReferralFollowUp}
                              maxLength={255}
                              data-validate='["required"]'
                              invalid={
                                createReferralFollowUp &&
                                hasError('subject', 'required', referralForm)
                              }
                            />
                            {createReferralFollowUp &&
                              hasError('subject', 'required', referralForm) && (
                                <span className="text-danger">
                                  Please enter Referral Follow Up Subject.
                                </span>
                              )}
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label
                              for="referral_comments"
                              className="mb-0 text-sm"
                            >
                              Referral Comments
                            </Label>
                            <Input
                              type="textarea"
                              name="comments"
                              disabled={!createReferralFollowUp}
                              id="referral_comments"
                              maxLength={500}
                            />
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label
                              for="referral_follow_up_date"
                              className="mb-0 text-sm"
                            >
                              Date
                            </Label>
                            <Input
                              type="date"
                              id="referral_follow_up_date"
                              name="followUpDate"
                              disabled={!createReferralFollowUp}
                              min={today}
                              pattern="\d{2}-d{2}-d{4}"
                              data-validate='["required"]'
                              invalid={
                                createReferralFollowUp &&
                                hasError(
                                  'followUpDate',
                                  'required',
                                  referralForm
                                )
                              }
                            />
                            {createReferralFollowUp &&
                              hasError(
                                'followUpDate',
                                'required',
                                referralForm
                              ) && (
                                <span className="text-danger">
                                  Please enter a valid Referral Follow Up Date.
                                </span>
                              )}
                          </FormGroup>
                          <FormGroup className="mb-2">
                            <Label
                              for="referral_follow_up_time"
                              className="mb-0 text-sm"
                            >
                              Time
                            </Label>
                            <Input
                              type="time"
                              name="reminder"
                              id="referral_follow_up_time"
                              disabled={!createReferralFollowUp}
                              defaultValue="08:00"
                            />
                          </FormGroup>
                        </Form>
                      </ScrollArea>
                    </TabPane>
                  </TabContent>
                </Col>
              </Row>
            </Collapse>
          </Col>
        </Row>

        <Popover
          className="px-5"
          placement="bottom"
          isOpen={popoverOpen}
          target="dialer_settings"
          toggle={() => {
            if (!recordVmPopoverOpen) {
              popoverToggle();
            }
          }}
          size="lg"
        >
          <div ref={domNode}>
            <PopoverBody
              className="shadow-lg pt-1 color-regent-gray"
              style={{ minWidth: '276px' }}
            >
              <Row className="d-flex justify-content-end pr-2">
                <span onClick={popoverToggle}>
                  <i className="fas fa-times pointer"></i>
                </span>
              </Row>
              <Row>
                <Col>
                  <Form
                    name="dialerSetting"
                    innerRef={dialerSettingFormRef}
                    className="mt-2"
                  >
                    <FormGroup check className="mb-1">
                      <Label check>
                        <Input
                          type="checkbox"
                          name="isInternationDialing"
                          id="is_international_dial_code_prefixed"
                          checked={
                            metaData.is_international_dial_code_prefixed === 'Y'
                          }
                          onChange={handleCheckChange}
                        />
                        Enable International dialing
                      </Label>
                    </FormGroup>

                    {org && org.crmType !== 'standalone' && (
                      <FormGroup check className="mb-1">
                        <Label check>
                          <Input
                            type="checkbox"
                            name="openDetailedView"
                            id="cd_open_detail"
                            checked={metaData.cd_open_detail === 'Y'}
                            onChange={handleCheckChange}
                          />
                          Open Detailed View
                        </Label>
                      </FormGroup>
                    )}
                    <FormGroup check>
                      <Label check>
                        <Input
                          type="checkbox"
                          name="defaultCallComment"
                          id="enable_default_call_comments"
                          checked={metaData.enable_default_call_comments}
                          onChange={handleCheckChange}
                        />
                        Default Call Comment
                      </Label>
                    </FormGroup>
                    <FormGroup className="mt-3" row>
                      <Label for="voice_message" sm={2} className="pr-0">
                        VM{' '}
                      </Label>
                      <Col sm={7} className="pr-0 pl-1">
                        <Input
                          type="select"
                          name="voiceMessage"
                          id="voice_message"
                          className="px-2"
                        >
                          <option value="">Select VM</option>
                          {metaData &&
                            metaData.voice_messages &&
                            metaData.voice_messages.map((vm, index) => {
                              return (
                                <option value={vm.message_name} key={index}>
                                  {vm.message_name}
                                </option>
                              );
                            })}
                        </Input>
                      </Col>
                      <Col
                        sm={3}
                        className="d-flex align-items-center pr-0 pl-2"
                      >
                        <i
                          className={
                            saveSettingStatus === 'delete'
                              ? 'fas fa-spinner fa-sping mr-2 fa-lg'
                              : 'fas fa-times mr-2 color-lynch pointer'
                          }
                          title="Delete VM"
                          disabled={saveSettingStatus === 'delete'}
                          onClick={() => {
                            handleActionDeleteVoiceMail();
                          }}
                        ></i>
                        <i
                          className={
                            'fa fa-microphone mr-2 color-lynch pointer'
                          }
                          title="Record VM"
                          id="recordVoiceMessage"
                          onClick={recordVmPopoverToggle}
                        ></i>
                        <i
                          className={
                            saveSettingStatus === 'listen'
                              ? 'fas fa-spinner fa-sping fa-lg'
                              : 'fa fa-play fa-sm color-lynch pointer'
                          }
                          title="Listen VM"
                          disabled={saveSettingStatus === 'listen'}
                          onClick={() => {
                            handleActionVoiceMail('listen');
                          }}
                        ></i>
                      </Col>
                    </FormGroup>
                    <hr></hr>
                    <FormGroup className="mt-3" row>
                      <Label for="caller_mode" sm={4} className="pr-0">
                        Caller ID
                      </Label>
                      <Col sm={8} className="pl-0">
                        <Input
                          type="select"
                          className="px-1"
                          name="callerMode"
                          id="caller_mode"
                          value={metaData.caller_id_mode}
                          onChange={handleActionCallerMode}
                        >
                          <option value="ABCID">Area Based</option>
                          <option value="CUSTOM">Custom</option>
                        </Input>
                      </Col>
                    </FormGroup>
                    <Row style={showCallerIds}>
                      <Col className="d-flex flex-row mb-2">
                        <FormGroup check className="mr-2">
                          <Label check>
                            <Input
                              type="radio"
                              name="callerIdsSelectAll"
                              value="all"
                              id="caller_ids_select_all"
                              onChange={handleCallerIdCheckChange}
                            />
                            All
                          </Label>
                        </FormGroup>
                        <FormGroup check>
                          <Label check>
                            <Input
                              type="radio"
                              name="callerIdsSelectAll"
                              value="none"
                              id="caller_ids_select_none"
                              onChange={handleCallerIdCheckChange}
                            />{' '}
                            None{' '}
                          </Label>
                        </FormGroup>
                      </Col>
                      <Col>
                        <Row>
                          <Col>
                            <div
                              id="caller_ids_list"
                              className="mb-2"
                              style={{
                                maxHeight: '80px',
                                overflowY: 'auto',
                              }}
                            >
                              {clickDialerData &&
                                clickDialerData.metadata &&
                                clickDialerData.metadata.caller_ids.length ===
                                  0 && <span>No Caller ids assigned</span>}

                              {clickDialerData &&
                                clickDialerData.metadata &&
                                clickDialerData.metadata.caller_ids.length >
                                  0 &&
                                clickDialerData.metadata.caller_ids
                                  .split(',')
                                  // eslint-disable-next-line array-callback-return
                                  .map((callerId, index) => {
                                    if (callerId) {
                                      return (
                                        <FormGroup
                                          check
                                          className="mb-1"
                                          key={index}
                                        >
                                          <Label check>
                                            <Input
                                              type="checkbox"
                                              value={callerId}
                                              name="callerIds"
                                              checked={
                                                metaData &&
                                                metaData.caller_id_list
                                                  ? metaData.caller_id_list.includes(
                                                      callerId
                                                    )
                                                  : false
                                              }
                                              onChange={
                                                handleCallerIdCheckChange
                                              }
                                            />
                                            {callerId}
                                          </Label>
                                        </FormGroup>
                                      );
                                    }
                                  })}
                            </div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <div className="text-center mb-2">
                      <ClButton
                        color="primary"
                        icon={
                          saveSettingStatus === 'setting'
                            ? 'fa fa-spinner fa-spin fa-sm'
                            : 'fas fa-check fa-sm'
                        }
                        title="Save Changes"
                        disabled={saveSettingStatus === 'setting'}
                        onClick={() => {
                          handleActionVoiceMail('setting');
                        }}
                      >
                        {saveSettingStatus === 'setting' ? '...Wait' : 'Save'}
                      </ClButton>
                    </div>
                  </Form>

                  <UncontrolledPopover
                    placement="bottom"
                    target="recordVoiceMessage"
                    isOpen={recordVmPopoverOpen}
                    toggle={recordVmPopoverToggle}
                  >
                    <div className="shadow-lg">
                      <PopoverHeader className="bg-white bb color-bluewood">
                        Record VM
                      </PopoverHeader>
                      <PopoverBody className="color-regent-gray">
                        <div
                          style={{ display: vmStep === 1 ? 'block' : 'none' }}
                        >
                          <p className="mb-1">
                            <strong>Step 1:</strong> Please enter the VM Name
                            and then press Record
                          </p>
                          <Input
                            type="text"
                            maxLength="20"
                            id="record_voice_message"
                            name="vmFileName"
                            autoComplete="nope"
                            value={newVmFileName}
                            onChange={(event) => {
                              setNewVmFileName(
                                event.target.value.replace(/[^\w\d]/gi, '')
                              );
                            }}
                          />
                          <div className="pt-2 pb-1 text-center">
                            <ClButton
                              color="primary"
                              icon="fas fa-check fa-sm"
                              className="mr-2 btn-sm"
                              id="record_vm"
                              disabled={vmRequestStatus}
                              onClick={handleActionRecordVm}
                            >
                              {vmRequestStatus ? '...Wait' : 'Record'}
                            </ClButton>
                            <ClButton
                              color="secondary"
                              icon="fas fa-times fa-sm"
                              className="btn-sm"
                              onClick={recordVmPopoverToggle}
                            >
                              Cancel
                            </ClButton>
                          </div>
                        </div>
                        <div
                          style={{
                            display: vmStep === 2 ? 'block' : 'none',
                          }}
                        >
                          <p>
                            <strong className="mr-1">Step 2:</strong>Record your
                            VM at the beep and press Stop when done
                          </p>
                          <div className="pb-1 text-center">
                            <ClButton
                              color="primary"
                              icon="fas fa-check fa-sm"
                              className="mr-2"
                              id="stop_vm"
                              disabled={vmRequestStatus}
                              onClick={handleActionRecordVm}
                            >
                              {vmRequestStatus ? '...Wait' : 'Stop'}
                            </ClButton>
                          </div>
                        </div>
                        <div
                          style={{
                            display: vmStep === 3 ? 'block' : 'none',
                            minWidth: '252px',
                          }}
                        >
                          <p>
                            <strong>Step 3:</strong> Listen to the recorded VM
                          </p>
                          <p id="vm_name_display" className="mb-2">
                            <span className="d-block text-sm">VM Name</span>
                            <span className="text-primary">
                              {vmData.vmFileName}
                            </span>
                          </p>
                          <p id="vm_duration_display" className="mb-2">
                            <span className="d-block text-sm">
                              Duration(in seconds)
                            </span>
                            <span className="text-primary">
                              {vmData.duration}
                            </span>
                          </p>
                          <p>
                            Press Save to Confirm
                            <br /> Please cancel to record a new VM
                          </p>
                          <Row className="pb-1 align-items-center">
                            <Col sm={8}>
                              <ClButton
                                color="secondary"
                                icon="fas fa-sm fa-headset mr-2"
                                className="mr-2 btn-sm"
                                id="listen_vm"
                                disabled={vmRequestStatus}
                                onClick={handleActionRecordVm}
                              >
                                {vmRequestStatus ? '...Wait' : 'Listen'}
                              </ClButton>
                              <ClButton
                                color="primary"
                                icon="fas fa-sm fa-check mr-2"
                                className="btn-sm"
                                id="confirm_recording"
                                onClick={handleActionRecordVm}
                              >
                                {vmRequestStatus ? '...Wait' : 'Save'}
                              </ClButton>
                            </Col>
                            <Col sm={4} className="text-right">
                              <span
                                className="text-muted text-link-over-light pointer"
                                onClick={() => {
                                  setRecordVmPopoverOpen(false);
                                  setPopoverOpen(false);
                                  setVmStep(1);
                                }}
                              >
                                <i className="fas fa-sm fa-times mr-2"></i>
                                Cancel
                              </span>
                            </Col>
                          </Row>
                        </div>
                      </PopoverBody>
                    </div>
                  </UncontrolledPopover>
                </Col>
              </Row>
            </PopoverBody>
          </div>
        </Popover>

        <CallMeToJoinModal
          dialingPhoneNumber={dialingPhoneNumber}
          requerstApiUrl={requerstApiUrl}
          showModal={showCallMeToJoinModal}
          hideModal={() => {
            setShowCallMeToJoinModal(false);
          }}
          handleActionCallMe={() => {
            if (dialingPhoneNumber) {
              myTalkerLoginStatus.current = true;
              setTalkerLoginStatus(myTalkerLoginStatus.current);
              //Checking the talker login status
              checkTalkerStatus(false, dialingPhoneNumber, true);
            }

            setShowCallMeToJoinModal(false);
          }}
          clkSessionId={sessionIdRef.current}
          metaData={metaData}
        ></CallMeToJoinModal>

        <ConfirmModal
          confirmBtnText="Delete"
          confirmBtnIcon="fas fa-trash"
          header="Please Confirm"
          showConfirmModal={showConfirmModal}
          handleCancel={() => setShowConfirmModal(false)}
          handleConfirm={() => {
            setShowConfirmModal(false);
            handleActionVoiceMail('delete');
          }}
          zIndex={1100}
        >
          <span>Are you sure you want to delete?</span>
        </ConfirmModal>

        <ConfirmModal
          confirmBtnText="Yes"
          confirmBtnIcon="fas fa-check"
          header="Confirm!"
          showConfirmModal={showCallTouchConfirmModal}
          handleCancel={() => setShowCallTouchConfirmModal(false)}
          handleConfirm={() => {
            setShowCallTouchConfirmModal(false);
            setConsiderAsCallTouch('Y');
            makeCall(dialingPhoneNumber, sourcePhoneNumber);
          }}
          zIndex={1100}
          otherBtnRequired={true}
          otherBtnText="No"
          otherBtnIcon="fas fa-times"
          otherBtnColor="primary"
          otherBtnAlign="left"
          otherBtnHandler={() => {
            setShowCallTouchConfirmModal(false);
            setConsiderAsCallTouch('N');
            makeCall(dialingPhoneNumber, sourcePhoneNumber);
          }}
        >
          <span>
            The dialed prospect is currently in a Call touch in the Cadence:
            <b>[{prospectToRender.campaignName}]</b>. Would you like to count
            this as a Call Touch and move this prospect to the next touch in the
            Cadence?
          </span>
        </ConfirmModal>
      </CardBody>
    </Card>
  );
};

const mapStateToProps = (state) => ({
  cadences: state.cadences,
});

export default connect(mapStateToProps, null)(ClickDialerApp);
