/**
 * @author ranbarasan
 * @version V11.0
 */
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ContentWrapper, FormValidator } from '@nextaction/components';
import moment from 'moment-timezone';
import { parseUrl } from 'query-string';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Collapse,
  Row,
  Tooltip,
} from 'reactstrap';
import {
  formateDateTime,
  getDueDate,
  showSuccessMsg,
  timeLeft,
  trimValue,
} from '../../../util';
import {
  formatWebLink,
  isValidURL,
  showErrorMessage,
} from '../../../util/index';
/**Common component */
import AlertModal from '../../Common/AlertModal';
import ClButton from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import OpenCrmWindow from '../../Common/OpenCrmWindow';
import PageHeader from '../../Common/PageHeader';
import ProspectActivity from '../../Common/ProspectActivity';
import ZipWhipModal from '../../Common/ZipwhipTouchModal';
import { FETCH_ACCOUNTS_PROSPECTS_QUERY } from '../../queries/AccountsQuery';
import FETCH_ACTIVITIES_QUERY from '../../queries/ActivitiesQuery';
import { FETCH_PROSPECTS_QUERY as FETCH_CADENCE_PROSPECT_QUERY } from '../../queries/CadenceQuery';
import { FETCH_MAIL_MERGE_VARIABLES } from '../../queries/EmailTemplatesQuery';
import FETCH_CL_CRM_FIELD_MAPPING_QUERY from '../../queries/FieldMappingQuery';
import { FETCH_PENDING_CALLS_QUERY } from '../../queries/PendingCallsQuery';
import {
  ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY,
  default as FETCH_PROSPECTS_QUERY,
  DELETE_PROSPECTS_QUERY,
  EXIT_PAUSE_RESUME_PROSPECT_QUERY,
  FETCH_NEXT_TOUCH,
  FETCH_PROSPECT_QUERY,
  FETCH_REMAINING_WAIT_TIME_QUERY,
  PROSPECTS_TRANSFER_OWNERSHIP,
  SKIP_TOUCH_TO_CADENCE_QUERY,
  SYNC_TO_CRM_PROSPECT_QUERY,
  UPDATE_PROSPECT_QUERY,
  CREATE_NOTES_QUERY,
  UPDATE_NOTES_QUERY,
  DELETE_NOTES_QUERY,
} from '../../queries/ProspectsQuery';
import { COMPLETE_TOUCH_QUERY } from '../../queries/ProspectsQuery';
import UserContext from '../../UserContext';
import EmailsModal from '../ToDo/EmailsModal';
import CompleteLinkedInTouchModal from '../ToDo/CompleteLinkedInTouchModal';
import CompleteOtherTouchModal from '../ToDo/CompleteOtherTouchModal';
import {
  default as AssignProspectToCadenceModal,
  default as MoveProspectToCadenceModal,
} from './AssignOrMoveProspectToCadenceModal';
import ClickDialerApp from './ClickDialerApp';
import EditProspect from './EditProspect';
import EditProspectInput from './EditProspectInput';
import LogACallAndLogATask from './LogACallAndLogATask';
import { default as PauseProspectsModal } from './PauseProspectsModal';
import PendingActivityGrid from './PendingActivityGrid';
import PendingEmailGrid from './PendingEmailGrid';
import TransferOwnershipModal from './TransferOwnershipModal';
import EngagementScoreModal from './EngagementScoreModal';
import AddNote from './AddNote';
import NotesGrid from './NotesGrid';

toast.configure();

const Phone = ({
  selectUserId,
  currentUserId,
  prospectToRender,
  field,
  setShowMakeCall,
  extField,
  phoneLabel,
}) => {
  const [showPhoneIcon, setShowPhoneIcon] = useState(false);
  return (
    <div className="mb-2">
      {selectUserId === currentUserId && prospectToRender[field.name] ? (
        <div
          title={field.label}
          className="pointer"
          onClick={() => {
            setShowMakeCall({
              phone: prospectToRender[field.name],
              isDial: true,
            });
          }}
          onMouseOver={() => {
            setShowPhoneIcon(true);
          }}
          onMouseOut={() => {
            setShowPhoneIcon(false);
          }}
        >
          <span className="d-block text-sm">{`${phoneLabel}:`}</span>
          <div className="d-flex justify-content-between align-items-center">
            <span>{prospectToRender[field.name]}</span>
            <i
              className={`fas fa-phone-alt text-call ${
                showPhoneIcon ? 'visible' : 'invisible'
              } ml-1`}
            ></i>
          </div>
        </div>
      ) : (
        <div
          onMouseOver={() => {
            setShowPhoneIcon(true);
          }}
          onMouseOut={() => {
            setShowPhoneIcon(false);
          }}
        >
          {prospectToRender[field.name] && (
            <div title={field.label}>
              <span className="d-block text-sm">{`${phoneLabel}`}</span>
              <div className="d-flex justify-content-between align-items-center">
                {prospectToRender[field.name]}
                <i
                  className={`fas fa-phone-alt text-call ${
                    showPhoneIcon ? 'visible' : 'invisible'
                  } ml-1`}
                ></i>
              </div>
            </div>
          )}
        </div>
      )}
      {prospectToRender[extField] && (
        <span className="text-sm">Ext: {prospectToRender[extField]}</span>
      )}
    </div>
  );
};

const ProspectView = ({ location, match, users }) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const { data: configurationsData } = useConfigurations();
  const org = configurationsData?.configurations?.data[0];

  const currentUserId = userLoading ? 0 : user.id;
  const { query: queryParams } = parseUrl(window.location.search);
  const limit = queryParams['page[limit]']
    ? parseInt(queryParams['page[limit]'])
    : 10;
  const [offset, setOffset] = useState(
    queryParams['page[offset]'] ? parseInt(queryParams['page[offset]']) : 0
  );
  const [selectUserId] = useState(
    queryParams['filter[user][id]']
      ? parseInt(queryParams['filter[user][id]'])
      : currentUserId
  );

  const order = [
    'account_name',
    'first_name',
    'last_name',
    'title',
    'email_id',
    'phone',
    'extension',
    'city',
    'state',
  ];

  const { cadence, prospect, memberTaskId, pathParam } = location.state
    ? location.state
    : {};
  const {
    rowIndex,
    cadenceId,
    cadenceName,
    touchcount,
    accountId,
  } = location.state ? location.state : -1;

  const [currentProspectIndex, setCurrentProspectIndex] = useState(
    rowIndex ? offset * limit + rowIndex : offset * limit + 0
  );
  const currentProspectIndexRef = useRef(currentProspectIndex);
  const [prospectId, setProspectId] = useState(
    match.params.id !== undefined ? parseInt(match.params.id) : match.params.id
  );

  const [allProspectsData, setAllProspectsData] = useState(
    location.state && location.state.allProspectsData
      ? location.state.allProspectsData.prospects
      : {}
  );
  const [totalCount, setTotalCount] = useState(
    location.state &&
      location.state.allProspectsData &&
      location.state.allProspectsData.prospects.paging
      ? location.state.allProspectsData.prospects.paging.totalCount
      : 0
  );

  const [showEngagementScoreModal, setShowEngagementScoreModal] = useState(
    false
  );

  const [renderNextProspect, setRenderNextProspect] = useState(false);
  const [renderPrevProspect, setRenderPrevProspect] = useState(false);
  const [prospectToRender, setProspectToRender] = useState(prospect);
  const [cadenceToRender, setCadenceToRender] = useState(cadence);
  const [touchToRender, setTouchToRender] = useState({});
  const [taskId, setTaskId] = useState(memberTaskId);
  const taskIdRef = useRef(taskId);

  const [unSavedCallDetailIsExists, setUnSavedCallDetailIsExists] = useState(
    false
  );
  const unSavedCallDetailIsExistsRef = useRef(unSavedCallDetailIsExists);

  const prospectFilterParams = Object.entries({
    ...queryParams,
    'filter[user][id]': queryParams['filter[user][id]'],
  })
    .filter(([key]) => key.startsWith('filter'))
    .map(([key, val]) => `${key}=${val}`)
    .join('&');
  const [showMakeCall, setShowMakeCall] = useState({});

  const [isEdit, setIsEdit] = useState(false);
  const toggleEdit = () => setIsEdit(!isEdit);
  const [isBackToList, setIsBackToList] = useState(false);
  const backLinkRef = useRef(null);

  const [showBlankFields, setShowBlankFields] = useState(false);
  const toggleBlankFields = () => {
    setShowBlankFields(!showBlankFields);
  };

  const editFormRef = useRef();
  const [allActivitiesLimit] = useState(30);
  const [allActivitiesOffset, setAllActivitiesOffset] = useState(0);

  const [toggleAccordion, setToggleAccordion] = useState(false);
  const accordionToggle = () => setToggleAccordion(!toggleAccordion);
  const [showLogTaskModal, setShowLogTaskModal] = useState(
    (location.state && location.state.showLogTaskModal) || false
  );
  const [task, setTask] = useState({});
  const [hideNewTask] = useState(location.state && location.state.hideNewTask);
  const [showZipwhipTouchWindow, setShowZipwhipTouchWindow] = useState(false);
  const [textPhoneNumber, setTextPhoneNumber] = useState(0);

  // add notes fields
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [notes, setNotes] = useState({});
  const [attachment, setAttachment] = useState({});
  const [
    showDeleteNotesConfirmModal,
    setShowDeleteNotesConfirmModal,
  ] = useState(false);

  /**Get the current prospect details */
  /* ----- Fetch prospects page by page from server -begin ----- */
  const [allActivities, setAllActivities] = useState([]);
  const [activityPaging, setActivityPaging] = useState({});
  const [tagIds, setTagIds] = useState([]);
  const tempTagRef = useRef();
  const [tagNames, setTagNames] = useState('');
  const [dialNext, setDialNext] = useState(false);
  /**Perform Action start here */
  const [
    showAssignPorspectToCadenceModal,
    setShowAssignPorspectToCadenceModal,
  ] = useState(false);
  const [
    showSkipTouchToCadenceModal,
    setShowSkipTouchToCadenceModal,
  ] = useState(false);
  const [
    showExitProspectConfirmModal,
    setShowExitProspectConfirmModal,
  ] = useState(false);
  const [
    showPauseProspectConfirmModal,
    setShowPauseProspectConfirmModal,
  ] = useState(false);
  const [
    showResumeProspectConfirmModal,
    setShowResumeProspectConfirmModal,
  ] = useState(false);
  const [
    showDeleteProspectConfirmModal,
    setShowDeleteProspectConfirmModal,
  ] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showUnSavedConfirmModal, setShowUnSavedConfirmModal] = useState(false);
  const [prospectOwner, setProspectOwner] = useState('');
  const [showProspectDue, setShowProspectDue] = useState(false);
  const [
    showMoveProspectToCadenceModal,
    setShowMoveProspectToCadenceModal,
  ] = useState(false);
  const [
    showMoveProspectConfirmModal,
    setShowMoveProspectConfirmModal,
  ] = useState(false);
  const [selectedCadence, setSelectedCadence] = useState({});
  const [nextTouch, setNextTouch] = useState({});
  const [previousPageUrl, setPreviousPageUrl] = useState();
  const [isUserChanged, setIsUserChanged] = useState(true);
  const [typeOfEmail, setTypeOfEmail] = useState('sendOneOff');
  const [overState, setOverState] = useState({
    email: false,
    phone: false,
    time: false,
    linkedIn: false,
  });
  const [taskName, setTaskName] = useState('Call');
  const [waitTime, setWaitTime] = useState();
  // transfer ownership fields
  const [showTransferOwnershipModal, setShowTransferOwnershipModal] = useState(
    false
  );
  const [
    showConfirmTransferOwnershipModal,
    setShowConfirmTransferOwnershipModal,
  ] = useState(false);
  const [responseError] = useState();
  const [transferData, setTransferData] = useState();
  const [fromUserName, setFromUserName] = useState();
  const [toUserName, setToUserName] = useState();
  // complete touch action fields
  const [touchInfoDetails, setTouchInfoDetails] = useState({});
  const [
    showEmailTouchCompleteModal,
    setShowEmailTouchCompleteModal,
  ] = useState(false);
  const [
    showLinkedInTouchCompleteModal,
    setShowLinkedInTouchCompleteModal,
  ] = useState(false);
  const [
    showSocialTouchCompleteModal,
    setShowSocialTouchCompleteModal,
  ] = useState(false);

  const [infoTooltipOpen, setInfoTooltipOpen] = useState(false);
  const infoTooltipToggle = () => setInfoTooltipOpen(!infoTooltipOpen);

  // To Complete the linked in touch and social touch
  const [
    completeTouch,
    { data: completeTouchData, loading: completeTouchLoading },
  ] = useLazyQuery(COMPLETE_TOUCH_QUERY, {
    variables: {
      prospectId: prospectId,
    },
    onCompleted: (response) => handleCompleteTouchCallBack(response, true),
    onError: (response) => handleCompleteTouchCallBack(response),
  });

  const handleCompleteTouchCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Touch completed successfully!', 'success', 'complete_touch');
      setShowSocialTouchCompleteModal(false);
      setShowLinkedInTouchCompleteModal(false);
      refreshProspectAndActivity();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to load Touch data',
        completeTouchData,
        'failed_touch'
      );
    }
  };

  const handleCompleteSocialOrLinkedInTouch = (requestData) => {
    const input = {
      touchType: requestData?.touchType,
      touchInput: requestData?.touchInput,
    };

    if (requestData?.touchType === 'linkedin') {
      input.linkedinUrl = requestData?.linkedInUrl;
    }
    completeTouch({
      variables: {
        input,
      },
    });
  };

  const handleSetTouchInfo = () => {
    const touchData = {};
    const touchType = prospectToRender.currentTouchType;
    touchData.cadenceName = cadenceToRender.name;
    touchData.contactName = prospectToRender.contactName;
    let subTouch = '';
    if (trimValue(touchToRender.subTouch)) {
      subTouch = touchToRender.subTouch.replace('Others-', '');
    }
    touchData.touchType =
      'Touch ' +
      prospectToRender.currentTouchId +
      (subTouch ? ` (${subTouch})` : ` (${touchType})`);
    touchData.currentTouchType = prospectToRender.currentTouchType;
    touchData.accountName = prospectToRender.accountName;
    touchData.accountId = prospectToRender.associations.account[0].id;
    if (prospectToRender.lastTouchDateTime) {
      touchData.lastTouchDateTime = moment(
        prospectToRender.lastTouchDateTime
      ).format('MM/DD/YYYY hh:mm A');
    }
    touchData.subTouch = subTouch;
    touchData.linkedinUrl = prospectToRender.linkedinUrl || '';
    touchData.emailId = prospectToRender.email;
    touchData.touch = touchType;
    touchData.linkedinUrl = prospectToRender.linkedinUrl;
    touchData.stepNo = prospectToRender.currentTouchId + 1;
    touchData.cadenceId =
      prospectToRender.associations.cadence.length > 0
        ? prospectToRender.associations.cadence[0].id
        : 0;
    touchData.userId = selectUserId ? selectUserId : currentUserId;
    setTouchInfoDetails(touchData);
  };

  const notify = (message, ToasterType = 'error') => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
      autoClose: 4000,
    });
  };

  const [showAlertModal, setShowAlertModal] = useState(false);

  const toggleAlertModal = () => {
    setShowAlertModal(!showAlertModal);
  };

  useEffect(() => {
    if (
      prospectToRender &&
      getDueDate(timeLeft(moment, prospectToRender.dueAt))
    ) {
      if (prospectToRender.dueAt) {
        const dueAt = getDueDate(timeLeft(moment, prospectToRender.dueAt));
        prospectToRender['dueAt'] = 'Due ' + dueAt;
      }
      setShowProspectDue(true);
    }
  }, [prospectToRender]);

  const {
    refetch: refetchProspect,
    data: fetchProspectData,
    loading: fetchProspectLoading,
  } = useQuery(FETCH_PROSPECT_QUERY, {
    variables: {
      id: prospectId,
      includeAssociationsQry: `includeAssociations[]=cadence&includeAssociations[]=prospectTask&includeAssociations[]=touch&includeAssociations[]=tag&includeAssociations[]=user`,
      currentUserId: selectUserId ? selectUserId : currentUserId,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) =>
      handleFetchProspectRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to fetche the prospect.',
        fetchProspectData,
        'prospect_details'
      );
    },
  });

  const handleFetchProspectRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      updateProspectView(response.prospect);
      const prospectData =
        response.prospect && response.prospect.data && response.prospect.data[0]
          ? response.prospect.data[0]
          : {};
      setNextTouch({});
      if (
        prospectData &&
        prospectData.associations &&
        prospectData.associations.cadence
      ) {
        fetchNextTouch({
          variables: {
            cadenceId: prospectData.associations.cadence[0].id,
            stepNo: prospectData.currentTouchId + 1,
            currentUserId: selectUserId,
          },
        });
      }
      const typeOfRecord = prospectData.recordType
        ? prospectData.recordType
        : 'Contact';
      fetchFieldsMapping({
        variables: {
          filterMapping: `&filter[fields][trucadence]=true&filter[recordType]=${typeOfRecord}`,
        },
      });
    }
  };
  /* ----- Get current prospect all activities -begin ----- */
  const {
    data: activityData,
    loading: allActivitiesLoading,
    error: allActivitiesError,
    fetchMore: fetchMoreAllActivities,
    refetch: refetchActivity,
  } = useQuery(FETCH_ACTIVITIES_QUERY, {
    variables: {
      prospectId,
      allActivitiesLimit,
      allActivitiesOffset: 0,
      filter: `&filter[user][id]=${
        queryParams['filter[user][id]']
          ? queryParams['filter[user][id]']
          : currentUserId
      }`,
      sort: '&sort[activityDatetime]=desc',
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => handleActivityRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to fetch activity.',
        activityData,
        'prospect_activity'
      );
    },
  });

  const handleActivityRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (response.activities) {
        setAllActivities(response.activities.data);
        setActivityPaging(response.activities.paging);
      } else {
        notify('No Activity available', 'error');
      }
    }
  };
  /* ----- Get current prospect all activities -end ----- */

  /* ----- Fetch prospects page by page from server -begin ----- */
  const [
    fetchProspectsNextPage,
    { data: nextPageProspectsData },
  ] = useLazyQuery(FETCH_PROSPECTS_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=cadence&includeAssociations[]=touch',
      prospectFilter: `&${prospectFilterParams}`,
      limit,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      setProspectListData(response.prospects);
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to next page prospect(s)',
        nextPageProspectsData,
        'prospect_list'
      );
    },
  });

  const [
    fetchPendingCallsProspectsList,
    { data: pendingCallsData },
  ] = useLazyQuery(FETCH_PENDING_CALLS_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=cadence&includeAssociations[]=touch',
      prospectFilter: `&${prospectFilterParams}`,
      limit,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      setProspectListData(response.prospects);
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to fetch the prospect(s) list.',
        pendingCallsData,
        'pending_call_list'
      );
    },
  });

  const [fetchCadenceProspectsList, { data: cadenceProspects }] = useLazyQuery(
    FETCH_CADENCE_PROSPECT_QUERY,
    {
      variables: {
        includeAssociationsQry: 'includeAssociations[]=cadence',
        limit,
      },
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) => {
        setProspectListData(response.prospects);
      },
      onError: (response) => {
        showErrorMessage(
          response,
          'Failed to fetch the cadence prospect(s) list.',
          cadenceProspects,
          'cadence_prospects'
        );
      },
    }
  );

  // Get Wait time
  const [fetchWaitTime] = useLazyQuery(FETCH_REMAINING_WAIT_TIME_QUERY, {
    onCompleted: (response) => {
      if (response?.prospect?.data[0]) {
        setWaitTime(
          response?.prospect?.data[0]?.remainingWaitPeriod
            ? response?.prospect?.data[0]?.remainingWaitPeriod?.trim()
            : ''
        );
      }
    },
  });

  useEffect(() => {
    if (prospectToRender?.currentTouchStatus === 'SCHEDULED_WAIT') {
      fetchWaitTime({
        variables: {
          id: prospectId,
          userId: currentUserId,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospectToRender]);

  const [fetchAccountProspects, { data: accountProspects }] = useLazyQuery(
    FETCH_ACCOUNTS_PROSPECTS_QUERY,
    {
      onCompleted: (response) => {
        setProspectListData(response.prospect);
      },
      onError: (response) => {
        showErrorMessage(
          response,
          'Failed to fetch the accounts prospect(s) list.',
          accountProspects,
          'accounts_prospects'
        );
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const setProspectListData = (prospects) => {
    setAllProspectsData(prospects);
    setTotalCount(
      prospects && prospects.paging ? prospects.paging.totalCount : 0
    );
    if (currentProspectIndex === 0) {
      const dataIndex =
        prospects &&
        prospects.data.findIndex(
          (prospect) => prospect.id === parseInt(prospectId)
        );
      setCurrentProspectIndex(offset * limit + dataIndex);
      currentProspectIndexRef.current = offset * limit + dataIndex;
    }
  };
  //Below useLazyQuery used to show the mailmerge data in Sendoneoff email modal
  const { data: mailMergeVariablesData } = useQuery(
    FETCH_MAIL_MERGE_VARIABLES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    }
  );

  const mailMergeVariables = useMemo(
    () =>
      mailMergeVariablesData &&
      mailMergeVariablesData.mailmergeVariables &&
      mailMergeVariablesData.mailmergeVariables.data
        ? mailMergeVariablesData.mailmergeVariables.data.mail_merge
        : [],
    [mailMergeVariablesData]
  );

  useEffect(() => {
    if (
      allProspectsData === null ||
      allProspectsData === undefined ||
      Object.keys(allProspectsData).length === 0
    ) {
      pullNextPageProspects(queryParams['page[offset]']);
    }

    if (users && users.data && queryParams['filter[user][id]']) {
      const owner =
        users.data &&
        users.data.filter((item) => {
          return parseInt(queryParams['filter[user][id]']) === item.id;
        });

      if (owner.length > 0) {
        setProspectOwner(owner[0].name);
      }
    }
    if (queryParams['filter[callTouch][type]']) {
      setPreviousPageUrl('/pendingCalls');
    } else if (cadenceId && cadenceId > 0) {
      setPreviousPageUrl(
        location.state && location.state.origin ? location.state.origin : ''
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pullNextPageProspects = (offset) => {
    //Fetching Prospect List based on cadence Views filters
    let tabFilter;
    let sortBy;
    let orderBy;

    if (queryParams['filter[outCome]'] && !accountId) {
      const sortParams = Object.entries(queryParams).filter(([key]) =>
        key.startsWith('sort')
      );
      tabFilter = queryParams['filter[outCome]'];
      sortBy =
        sortParams.length > 0
          ? sortParams[0][0].slice(5, sortParams[0][0].length - 1)
          : 'contactName';
      orderBy = sortParams.length > 1 ? sortParams[0][1] : 'asc';
      delete queryParams['filter[outCome]'];
      delete queryParams[`sort[${sortBy}]`];
    }
    /**End of cadence view */
    const searchParam = Object.entries({
      ...queryParams,
      'filter[user][id]': queryParams['filter[user][id]']
        ? queryParams['filter[user][id]']
        : currentUserId,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    const limit = queryParams['page[limit]']
      ? parseInt(queryParams['page[limit]'])
      : 10;
    const paramCadenceId = cadenceId ? cadenceId : queryParams['cadence[id]'];

    if (queryParams['filter[callTouch][type]']) {
      setPreviousPageUrl('/pendingCalls');

      fetchPendingCallsProspectsList({
        variables: {
          offset: offset ? parseInt(offset) : 0,
          limit,
          prospectFilter: searchParam !== '' ? '&' + searchParam : searchParam,
        },
      });
    } else if (paramCadenceId) {
      //Maintaining origin URL
      let filterTouchType;
      switch (queryParams['filter[touchType]']) {
        case 'email':
          filterTouchType = 'emails';
          break;
        case 'call':
          filterTouchType = 'calls';
          break;
        default:
          filterTouchType = 'prospect';
      }

      setPreviousPageUrl(`/cadences/${paramCadenceId}/${filterTouchType}/view`);
      fetchCadenceProspectsList({
        variables: {
          id: paramCadenceId,
          offset: offset ? parseInt(offset) : 0,
          limit,
          prospectFilter: searchParam !== '' ? '&' + searchParam : searchParam,
          tabFilter: `&filter[outCome]=${tabFilter}`,
          sortBy,
          orderBy,
        },
      });
    } else if (accountId) {
      setPreviousPageUrl(`/accounts/${accountId}`);
      fetchAccountProspects({
        variables: {
          accountId,
          offset: offset ? parseInt(offset) : 0,
          limit,
          includeAssociationsQry: 'includeAssociations[]=cadence',
          prospectFilter: searchParam !== '' ? searchParam : searchParam,
        },
      });
    } else {
      setPreviousPageUrl(
        queryParams['filter[currentTouchStatus]'] ? '/toDo' : ''
      );
      fetchProspectsNextPage({
        variables: {
          offset: offset ? parseInt(offset) : 0,
          limit,
          prospectFilter: searchParam !== '' ? '&' + searchParam : searchParam,
        },
      });
    }
  };
  /* ----- Fetch prospects page by page from server -end ----- */
  const [
    fetchFieldsMapping,
    { data: fieldMappingData, loading: fieldMappingLoading, error },
  ] = useLazyQuery(FETCH_CL_CRM_FIELD_MAPPING_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=fields&includeAssociations[]=fieldDropdownValues',
      limit: 200,
      offset: 0,
    },
    fetchPolicy: 'cache-first',
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to fetch the field mapping list.',
        fieldMappingData,
        'field_mapping'
      );
    },
  });
  /* ----- After fetching next/previous pages update prospect view -begin ----- */
  useEffect(() => {
    if (renderNextProspect) {
      handleRenderNextProspect();
    }

    if (renderPrevProspect) {
      handleRenderPrevProspect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProspectsData]);
  /* ----- After fetching next/previous pages update prospect view -end ----- */

  /* ----- When user clicks on Edit button, to render prospect data in edit from -begin ----- */
  useEffect(() => {
    if (isEdit && prospectToRender) {
      [...editFormRef.current.elements]
        .filter((ele) => ['TEXTAREA', 'INPUT', 'SELECT'].includes(ele.nodeName))
        .forEach((ele) => {
          if (ele.type === 'checkbox') {
            ele.checked =
              prospectToRender[ele.name] === 'true' ||
              prospectToRender[ele.name] === true;
          } else if (prospectToRender[ele.name] && ele.type === 'date') {
            ele.value = prospectToRender[ele.name].slice(0, 10);
          } else if (prospectToRender[ele.name] && ele.type === 'time') {
            ele.value = moment(prospectToRender[ele.name]).format('HH:mm');
          } else if (ele.name === 'emailId') {
            ele.name = 'email';
            ele.value = prospectToRender['email'] && prospectToRender['email'];
          } else if (ele.name === 'lastTouch') {
            ele.value =
              prospectToRender?.lastTouch === 'OTHERS'
                ? 'SOCIAL'
                : prospectToRender.lastTouch;
          } else if (prospectToRender[ele.name]) {
            ele.value = prospectToRender[ele.name];
          }
        });
    }
  }, [prospectToRender, isEdit]);
  /* ----- When user clicks on Edit button, to render prospect data in edit from -end ----- */
  // To calculate current prospect index
  useEffect(() => {
    if (location && location.state && location.state.dialingNumber) {
      setShowMakeCall({
        phone: location.state.dialingNumber,
        isDial: true,
      });
    }
  }, [location]);

  /* ----- When user clicks on next prospect button -begin ----- */
  const handleRenderNextProspect = () => {
    if (unSavedCallDetailIsExistsRef.current) {
      notify(
        'WARNING (CD004): Please save the call details and then try again.',
        'error'
      );
      return;
    }

    let currentIndex = currentProspectIndexRef.current % limit;
    if (
      currentIndex + 1 < allProspectsData.data.length &&
      allProspectsData.data[currentIndex + 1] &&
      allProspectsData.data[currentIndex + 1].isMemberDeleted
    ) {
      notify('Navigation stopped for deleted prospects!', 'error');
      return;
    }
    setIsEdit(false);
    setShowProspectDue(false);
    if (currentIndex === 0 || currentIndex + 1 > allProspectsData.data.length) {
      currentIndex = allProspectsData.data.findIndex(
        (prospect) => prospect.id === parseInt(prospectId)
      );
    }
    if (currentIndex === currentProspectIndex % limit) {
      setCurrentProspectIndex(currentProspectIndex + 1);
      currentProspectIndexRef.current = currentProspectIndex + 1;
    }

    if (currentIndex + 1 === allProspectsData.data.length) {
      setRenderNextProspect(true);
      updateQueryParam({
        'page[offset]': offset + 1,
      });
      setOffset(offset + 1);

      pullNextPageProspects(offset + 1);

      return;
    }

    setRenderNextProspect(false);
    const nextProspect = allProspectsData.data[currentIndex + 1];
    setProspectId(nextProspect.id);
  };
  /* ----- When user clicks on next prospect button -end ----- */

  /* ----- When user clicks on previous prospect button -begin ----- */
  const handleRenderPrevProspect = () => {
    if (unSavedCallDetailIsExistsRef.current) {
      notify(
        'WARNING (CD004): Please save the call details and then try again.',
        'error'
      );
      return;
    }
    //Navigation stoping for deleted prospects
    let currentIndex = currentProspectIndexRef.current % limit;
    if (
      currentIndex - 1 > -1 &&
      allProspectsData.data[currentIndex - 1] &&
      allProspectsData.data[currentIndex - 1].isMemberDeleted
    ) {
      notify('Navigation stopped for deleted prospects!', 'error');
      return;
    }

    setIsEdit(false);
    setShowProspectDue(false);
    if (currentIndex === 0) {
      currentIndex = allProspectsData.data.findIndex(
        (prospect) => prospect.id === parseInt(prospectId)
      );
    }
    if (currentIndex !== 0) {
      setCurrentProspectIndex(
        currentProspectIndex === -1 ? 0 : currentProspectIndex - 1
      );
      currentProspectIndexRef.current =
        currentProspectIndex === -1 ? 0 : currentProspectIndex - 1;
    }
    if (currentIndex === 0 && !renderPrevProspect) {
      setRenderPrevProspect(true);
      updateQueryParam({
        'page[offset]': offset - 1,
      });
      setOffset(offset - 1);
      pullNextPageProspects(offset - 1);

      return;
    }

    setRenderPrevProspect(false);
    const prevProspect =
      allProspectsData.data[
        (currentIndex === -1 ? allProspectsData.data.length : currentIndex) - 1
      ];
    setProspectId(prevProspect.id);
  };
  /* ----- When user clicks on previous prospect button -end ----- */
  /* ----- To find current prospect cadence, touch and to update page state and url -begin ----- */
  const updateProspectView = (prospect) => {
    let cadence = {};
    let followUpId = '';
    let touch = {};
    if (
      prospect &&
      prospect.includedAssociations &&
      prospect.includedAssociations.cadence
    ) {
      cadence = prospect.includedAssociations.cadence[0];
    }
    setCadenceToRender(cadence);

    if (prospect?.includedAssociations?.touch) {
      touch = prospect.includedAssociations.touch[0];
    }
    setTouchToRender(touch);

    if (
      prospect.data &&
      prospect.data.length > 0 &&
      prospect.data[0].associations &&
      prospect.data[0].associations.prospectTask
    ) {
      followUpId = prospect.data[0].associations.prospectTask[0].id;
    }
    setTaskId(followUpId);
    taskIdRef.current = followUpId;

    //Retaining the seleted tag values
    const tagIdsList = [];
    const tagNameList = [];
    if (
      prospect &&
      prospect.includedAssociations &&
      prospect.includedAssociations.tag
    ) {
      prospect.includedAssociations.tag.forEach((item) => {
        tagIdsList.push(item.id);
        tagNameList.push(item.name);
      });
    }
    setTagIds(tagIdsList);
    tempTagRef.current = tagIdsList;
    setTagNames(tagNameList);

    if (prospect && prospect.data.length > 0) {
      const currentProspect = prospect.data[0];

      let dialingPhone = currentProspect.phone;
      if (!currentProspect.phone) {
        const dialingKey = Object.keys(currentProspect).filter((key) => {
          return key.startsWith('customPhone') && currentProspect[key];
        });

        dialingPhone = dialingKey[0] ? currentProspect[dialingKey[0]] : '';
      }
      currentProspect['dialingPhone'] = dialingPhone;
      currentProspect['currentTouchType'] =
        currentProspect.currentTouchType === 'OTHERS'
          ? 'SOCIAL'
          : currentProspect.currentTouchType;
      setProspectToRender(currentProspect);
      let urlParams = '';
      if (cadenceId && queryParams['cadence[id]'] === undefined) {
        urlParams = `&cadence[id]=${cadenceId}&cadence[name]=${cadenceName}&not=${touchcount}`;
      } else if (accountId && queryParams['account[id]'] === undefined) {
        urlParams = `&account[id]=${accountId}`;
      }
      window.history.replaceState(
        {},
        '',
        `${currentProspect.id}` + window.location.search + urlParams
      );
      //Call for dialing next contact
      if (dialNext) {
        handleActionDialNextContact(currentProspect);
      }
    }
  };

  /* ----- To dial the next prospect contact and finding either one phone from next contact----- */
  const handleActionDialNextContact = (currentProspect) => {
    let numberToDial = currentProspect.phone;
    if (numberToDial === null || numberToDial === '') {
      const customPhone = Object.entries(currentProspect).filter(
        ([key, val]) => {
          return key.startsWith('customPhone') && val !== null && val !== '';
        }
      );

      numberToDial = customPhone.length > 0 ? customPhone[0][1] : '';
    }

    if (numberToDial !== null && numberToDial !== '') {
      setShowMakeCall({
        phone: numberToDial,
        isDial: true,
      });
    }
    setDialNext(false);
  };

  const convertDateFormat = (data) => {
    const date = data.split('-');
    return date[1] + '/' + date[2] + '/' + date[0];
  };

  const validateDate = (value) => {
    if (new Date(value) === 'Invalid Date') {
      notify('Please enter valid date');
    }
  };

  const checkUnSavedChangesDetected = () => {
    if (unSavedCallDetailIsExistsRef.current) {
      notify(
        'WARNING (CD004): Please save the call details and then try again.',
        'error'
      );
      return true;
    }
    if (isEdit) {
      const form = editFormRef.current;
      const inputs = [...form.elements].filter((i) => {
        return (
          !i.disabled &&
          i.name !== 'tagName' &&
          ['TEXTAREA', 'INPUT', 'SELECT'].includes(i.nodeName)
        );
      });

      const editedProspect = getEditedFields(inputs);
      if (Object.keys(editedProspect).length > 0) {
        setShowUnSavedConfirmModal(true);
        return true;
      }
    }
    return false;
  };

  const getEditedFields = (inputs) => {
    const prospectData = inputs.reduce((acc, item) => {
      let editedValue = '';
      if (item.type === 'checkbox') {
        editedValue = item.checked;
      } else if (item.name.startsWith('customTimestamp') && item.value) {
        if (item.type === 'date') {
          editedValue = convertDateFormat(item.value);
        } else if (item.type === 'time') {
          editedValue = new Date(
            acc[item.name] + ' ' + item.value
          ).toISOString();
        }
      } else {
        editedValue = item.value;
      }

      const originalValue =
        prospectToRender[item.name] === null ? '' : prospectToRender[item.name];

      if (originalValue !== editedValue) {
        acc[item.name] = editedValue;
      } else if (
        item.type === 'time' &&
        !editedValue.startsWith(originalValue)
      ) {
        acc[item.name] = editedValue;
      }
      return acc;
    }, {});

    Object.keys(prospectData).forEach((key) => {
      if (
        key.startsWith('customTimestamp') &&
        prospectToRender[key] &&
        prospectData[key].startsWith(prospectToRender[key].slice(0, -1))
      ) {
        delete prospectData[key];
      }
    });

    if (tagIds && tagIds.length > 0) {
      const tagArr = [];
      tagIds.forEach((item) => {
        tagArr.push({
          id: item,
        });
      });
      const tagList =
        prospectToRender.associations &&
        prospectToRender.associations.tag &&
        prospectToRender.associations.tag
          ? prospectToRender.associations.tag
          : [];
      const filteredTag = tagList.filter((item) => {
        return tagIds.includes(item.id);
      });

      if (
        filteredTag.length !== tagArr.length ||
        filteredTag.length < tagList.length
      ) {
        prospectData['tag'] = tagArr;
      }
    } else if (
      Array.isArray(tempTagRef.current) &&
      tempTagRef.current.length > 0 &&
      tagIds &&
      tagIds.length === 0
    ) {
      prospectData['tag'] = [];
    }
    return prospectData;
  };
  /* ----- To prospect edit save -begin ----- */
  const handleUpdateProspect = () => {
    const form = editFormRef.current;
    let phoneNoExists = false;
    let validPhone = false;
    const inputs = [...form.elements].filter((element) => {
      if (
        element.name &&
        (element.name === 'phone' || element.name.startsWith('customPhone')) &&
        element.value.trim() !== ''
      ) {
        if (element.value.trim().length >= 7) {
          validPhone = true;
        }
        phoneNoExists = true;
      }

      return (
        !element.disabled &&
        element.name !== 'tagName' &&
        ['TEXTAREA', 'INPUT', 'SELECT'].includes(element.nodeName)
      );
    });

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    let isValid = hasError;

    if (phoneNoExists && !validPhone) {
      notify('Phone must be minimum of 7 digits.', 'error');
      return;
    }

    if (phoneNoExists || form.email.value) {
      errors['phone'] = {
        required: false,
      };
      errors['email'] = {
        required: false,
      };
      isValid =
        Object.keys(errors).filter(
          (key) =>
            errors[key].required || errors[key].select || errors[key].email
        ).length > 0;
    }

    if (!isValid) {
      const prospectData = getEditedFields(inputs);

      if (Object.keys(prospectData).length === 0) {
        notify('No changes made!', 'error');
        return;
      }
      //Calling update prospects method
      updateProspect({
        variables: {
          prospectId: prospectId,
          input: prospectData,
        },
      });
    } else if (isValid) {
      notify('Please fill the mandatory fields and save again.', 'error');
    }
  };
  /* ----- To prospect edit save -end ----- */
  // To update browser URL query params
  const updateQueryParam = (param) => {
    const { query } = parseUrl(window.location.search);
    const searchString = Object.entries({
      ...query,
      ...param,
    })
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    window.history.replaceState({}, '', '?' + searchString);
  };

  // Add prospect to cadence request
  const [
    updateProspect,
    { data: updateProspectData, loading: updateProspectLoading },
  ] = useLazyQuery(UPDATE_PROSPECT_QUERY, {
    onCompleted: (response) =>
      handleUpdateProspectRequestCallback(response, true),
    onError: (response) => handleUpdateProspectRequestCallback(response),
  });

  const handleUpdateProspectRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      refreshProspectAndActivity();
      notify('Prospect has been saved successfully!', 'success');
      setIsEdit(false);
      setTagIds([]);
      tempTagRef.current = [];
      setShowMakeCall({});
    } else if (
      response &&
      response.graphQLErrors &&
      response.graphQLErrors.length > 0
    ) {
      notify(
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {response.graphQLErrors.map((value, i) => (
            <div key={i}>
              {value.message === 'Invalid email'
                ? 'Invalid email address!'
                : value.message}
            </div>
          ))}
        </>,
        'error'
      );
    } else {
      showErrorMessage(
        response,
        'Failed to save the prospect details.',
        updateProspectData,
        'update_prospect'
      );
    }
  };

  const handleActionShowMoreActivity = () => {
    const pageOffset = allActivitiesOffset + 1;
    setAllActivitiesOffset(pageOffset);

    fetchMoreAllActivities({
      variables: {
        prospectId,
        allActivitiesLimit,
        allActivitiesOffset: pageOffset,
        filter: '',
        sort: '&sort[activityDatetime]=desc',
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setAllActivities([
          ...allActivities,
          ...fetchMoreResult.activities.data,
        ]);
      },
    });
  };
  // Add prospect to cadence request
  const [
    prospectSyncToCrm,
    { data: syncData, loading: syncToCrmLoading },
  ] = useLazyQuery(SYNC_TO_CRM_PROSPECT_QUERY, {
    onCompleted: (response) => handleSyncToCrmRequestCallback(response, true),
    onError: (response) => handleSyncToCrmRequestCallback(response),
  });

  const handleSyncToCrmRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      refreshProspectAndActivity();
      notify('Prospect created in CRM successfully!', 'success');
    } else {
      showErrorMessage(
        response,
        'Failed to sync the prospect to CRM.',
        syncData,
        'sync_to_crm'
      );
    }
  };

  // Assign prospect to cadence request
  const [
    assignProspectToCadence,
    { data: assignProspectData, loading: assignProspectToCadenceLoading },
  ] = useLazyQuery(ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY, {
    variables: {
      action: 'assignToCadence',
    },
    onCompleted: (response) =>
      handleAssignProspectRequestCallback(response, true),
    onError: (response) => handleAssignProspectRequestCallback(response),
  });

  // Move prospect to cadence request
  const [
    moveProspectToCadence,
    { data: movePorpsectData, loading: moveProspectToCadenceLoading },
  ] = useLazyQuery(ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY, {
    variables: {
      action: 'moveToCadence',
    },
    onCompleted: (response) =>
      handleMoveProspectRequestCallback(response, true),
    onError: (response) => handleMoveProspectRequestCallback(response),
  });

  const handleMoveProspectRequestCallback = (response, requestSuccess) => {
    setShowMoveProspectToCadenceModal(false);

    if (requestSuccess) {
      if (response.assignOrMoveProspect.response === 'error') {
        notify(response.assignOrMoveProspect.errors[0].message, 'error');
      } else if (response?.assignOrMoveProspect?.data?.length > 0) {
        const movedCountList = response.assignOrMoveProspect.data.filter(
          (item) => item.isMoved
        );
        notify(
          `${movedCountList.length} out of ${response.assignOrMoveProspect.data.length} prospect(s) moved successfully.\n Note: For prospect(s) already in same cadence, no action will be taken.`,
          'success'
        );
        refreshProspectAndActivity();
      } else {
        showSuccessMsg(response?.assignOrMoveProspect?.requestId);
        refreshProspectAndActivity();
      }
    } else if (
      response.graphQLErrors &&
      response.graphQLErrors.length > 0 &&
      response.graphQLErrors[0].message ===
        'This cadence contains an Email touch with a scheduled time which has already passed. Please update the touch to proceed.'
    ) {
      notify(response?.graphQLErrors[0]?.message, 'error');
    } else {
      showErrorMessage(
        response,
        'Failed to moved the prospect(s).',
        movePorpsectData,
        'move_prospects'
      );
    }
  };

  const handleAssignProspectRequestCallback = (response, requestSuccess) => {
    setShowAssignPorspectToCadenceModal(false);
    if (requestSuccess) {
      if (response.assignOrMoveProspect.response === 'error') {
        notify(response.assignOrMoveProspect.errors[0].message, 'error');
      } else if (response.assignOrMoveProspect.data.length > 0) {
        if (response.assignOrMoveProspect.data[0].assigned) {
          notify('Prospect added to Cadence successfully!', 'success');
          refreshProspectAndActivity();
        } else {
          notify(response.assignOrMoveProspect.data[0].reason, 'error');
        }
      }
    } else if (
      response.graphQLErrors &&
      response.graphQLErrors.length > 0 &&
      response.graphQLErrors[0].message ===
        'This cadence contains an Email touch with a scheduled time which has already passed. Please update the touch to proceed.'
    ) {
      notify(response?.graphQLErrors[0]?.message, 'error');
    } else {
      showErrorMessage(
        response,
        'Failed to assign the cadence to prospect.',
        assignProspectData,
        'assign_prospects'
      );
    }
  };
  // Skiping curent touh execution and moved next touch
  const [
    skipTouch,
    { data: skipData, loading: skipTouchLoading },
  ] = useLazyQuery(SKIP_TOUCH_TO_CADENCE_QUERY, {
    onCompleted: (response) => handleSkipTouchRequestCallback(response, true),
    onError: (response) => handleSkipTouchRequestCallback(response),
  });

  const handleSkipTouchRequestCallback = (response, requestSuccess) => {
    setShowSkipTouchToCadenceModal(false);
    if (requestSuccess) {
      if (response.skipTouch.response === 'error') {
        notify(response.skipTouch.errors[0].message, 'error');
      } else {
        notify(
          `Prospect has been moved to next touch successfully!`,
          'success'
        );
        refreshProspectAndActivity();
      }
    } else {
      showErrorMessage(
        response,
        'Failed to skip the Current Touch',
        skipData,
        'skip_prospect'
      );
    }
  };

  // Exit prospect request
  const [
    exitProspect,
    { data: exitData, loading: exitProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: {
      action: 'exit',
    },
    onCompleted: (response) =>
      handleExitProspectRequestCallback(response, true),
    onError: (response) => handleExitProspectRequestCallback(response),
  });

  const handleExitProspectRequestCallback = (response, requestSuccess) => {
    setShowExitProspectConfirmModal(false);
    if (requestSuccess) {
      if (response.prospect.response === 'error') {
        notify(response.prospect.errors[0].message, 'error');
      } else if (response?.prospect?.data?.length > 0) {
        if (response.prospect.data[0].isExit) {
          notify('Prospect exited the cadence successfully!', 'success');
          refreshProspectAndActivity();
        } else {
          notify(response.prospect.data[0].reason, 'error');
        }
      } else {
        showSuccessMsg(response?.prospect?.requestId);
        refreshProspectAndActivity();
      }
    } else {
      showErrorMessage(
        response,
        'Failed to exited the Current Cadence',
        exitData,
        'exit_prospect'
      );
    }
  };
  // delete prospect request
  const [
    deleteProspect,
    { loading: deleteProspectLoading, data: deleteProspectData },
  ] = useLazyQuery(DELETE_PROSPECTS_QUERY, {
    variables: {
      prospectId,
      currentUserId: selectUserId ? selectUserId : currentUserId,
    },
    onCompleted: (response) =>
      handleDeleteProspectRequestCallback(response, true),
    onError: (response) => handleDeleteProspectRequestCallback(response),
  });

  const handleDeleteProspectRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Prospect deleted successfully!', 'success');
      setShowDeleteProspectConfirmModal(false);
      backLinkRef.current.click();
    } else {
      showErrorMessage(
        response,
        'Failed to delete this prospect',
        deleteProspectData,
        'delete_prospect'
      );
    }
  };
  //Show transfer ownership modal
  const handleSaveTransferOwnership = (trData) => {
    const trObject = {
      fromUserId: trData.fromUserId,
      toUserId: trData.toUserId,
    };
    setTransferData(trObject);
    setFromUserName(trData.fromUser);
    setToUserName(trData.toUser);
    setShowTransferOwnershipModal(false);
    setShowConfirmTransferOwnershipModal(true);
  };
  const [
    transferOwnership,
    { data: transferOwnershipData, loading: transferOwnershipLoading },
  ] = useLazyQuery(PROSPECTS_TRANSFER_OWNERSHIP, {
    onCompleted: (response) => handleTransferOwnershipCallback(response, true),
    onError: (response) => handleTransferOwnershipCallback(response),
  });

  const handleTransferOwnershipCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify(
        `${response?.transfer?.data[0]?.prospectCount} prospect is being transferred.`,
        'success',
        'transfer_ownership'
      );
      setShowTransferOwnershipModal(false);
      backLinkRef.current.click();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to transfer ownership.',
        transferOwnershipData,
        'transfer_ownership'
      );
    }
    setShowConfirmTransferOwnershipModal(false);
  };

  // Fetch Next Touch information
  const [fetchNextTouch, { data: nextTouchData }] = useLazyQuery(
    FETCH_NEXT_TOUCH,
    {
      onCompleted: (response) => handleNextTouchRequestCallback(response, true),
      onError: (response) => handleNextTouchRequestCallback(response),
    }
  );

  const handleNextTouchRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (
        response.nextTouch &&
        response.nextTouch.data &&
        response.nextTouch.data.length > 0
      ) {
        const nextTouchInfo = response.nextTouch.data[0];
        nextTouchInfo['touchType'] =
          nextTouchInfo && nextTouchInfo.touchType === 'OTHERS'
            ? 'SOCIAL'
            : nextTouchInfo.touchType;
        setNextTouch(nextTouchInfo);
      }
    } else {
      showErrorMessage(
        response,
        'Failed to fetch next touch',
        nextTouchData,
        'next_prospect'
      );
    }
  };

  // save notes request
  const [addNotes, { data: notesData, loading: notesLoading }] = useLazyQuery(
    CREATE_NOTES_QUERY,
    {
      onCompleted: (response) => addNotesRequestCallback(response, true),
      onError: (response) => {
        showErrorMessage(
          response,
          'Failed to add notes.',
          notesData,
          'add_notes'
        );
      },
    }
  );

  const addNotesRequestCallback = (response, requestSuccess) => {
    if (requestSuccess && response) {
      notify('Notes added successfully!', 'success');
      setShowAddNoteModal(false);
      refreshProspectAndActivity();
    }
  };

  // updateNotesRequest

  const [
    updateNotes,
    { data: updateNotesData, loading: updateNotesLoading },
  ] = useLazyQuery(UPDATE_NOTES_QUERY, {
    onCompleted: (response) => updateNotesRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to add notes.',
        updateNotesData,
        'add_notes'
      );
    },
  });
  const updateNotesRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Notes updated successfully', 'success');
      setShowAddNoteModal(false);
      refreshProspectAndActivity();
    }
  };

  // delete notes request

  const [
    deleteNotes,
    { data: deleteNotesData, loading: deleteNotesLoading },
  ] = useLazyQuery(DELETE_NOTES_QUERY, {
    onCompleted: (response) => handleDeleteNotesRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to delete notes.',
        deleteNotesData,
        'delete_notes'
      );
    },
  });

  const handleDeleteNotesRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Notes deleted successfully', 'success');
      setShowDeleteNotesConfirmModal(false);
      refreshProspectAndActivity();
    }
  };

  // Pause prospect request
  const [
    pauseProspect,
    { data: pauseData, loading: pauseProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: {
      action: 'pause',
    },
    onCompleted: (response) =>
      handlePauseProspectRequestCallback(response, true),
    onError: (response) => handlePauseProspectRequestCallback(response),
  });

  const handlePauseProspectRequestCallback = (response, requestSuccess) => {
    setShowPauseProspectConfirmModal(false);
    if (requestSuccess) {
      notify('Prospect is paused from cadence successfully!', 'success');
      refreshProspectAndActivity();
    } else {
      showErrorMessage(
        response,
        'Failed to pause the prospects',
        pauseData,
        'pause_prospect'
      );
    }
  };
  // Resume prospect request
  const [
    resumeProspect,
    { loading: resumeProspectLoading, data: resumeData },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: {
      action: 'resume',
      input: {},
    },
    onCompleted: (response) => {
      setShowResumeProspectConfirmModal(false);
      notify('Prospect has resumed successfully!', 'success');
      refreshProspectAndActivity();
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to resume the prospect(s)',
        resumeData,
        'resume_prospect'
      );
    },
  });

  const refreshProspectAndActivity = () => {
    refetchProspect();
    refetchActivity();
  };
  //Open Crm window
  const handleOpenCrmWindow = () => {
    OpenCrmWindow(org, prospectToRender.crmId, prospectToRender.recordType);
  };

  const changeOthersToSocial = (touchType) => {
    return touchType === 'OTHERS' ? 'SOCIAL' : touchType;
  };

  const fieldDropDown = (fieldMappingData, id) => {
    const dropdownValues = [];
    const fieldDropDown = fieldMappingData.fields.data.filter(
      (item) => item.associations.field[0].id === id
    );
    fieldDropDown &&
      fieldDropDown.length > 0 &&
      fieldDropDown[0].associations &&
      fieldDropDown[0].associations.fieldDropdownValues &&
      fieldDropDown[0].associations.fieldDropdownValues.forEach((dropdown) => {
        dropdownValues.push(dropdown.id);
      });

    const content = fieldMappingData.fields.includedAssociations.fieldDropdownValues
      .filter((item) => dropdownValues.includes(item.id))
      .map((dropdownvalue, i) => {
        return (
          <option key={i} value={dropdownvalue.id}>
            {dropdownvalue.value}
          </option>
        );
      });
    return content;
  };

  if (!prospectToRender || allProspectsData === undefined) {
    return null;
  }

  const handleCompleteTouch = () => {
    switch (prospectToRender.currentTouchType) {
      case 'CALL':
        setTaskName('Complete call');
        setShowLogTaskModal(true);
        break;
      case 'EMAIL':
        setShowEmailTouchCompleteModal(true);
        break;
      case 'LINKEDIN':
        setShowLinkedInTouchCompleteModal(true);
        break;
      case 'OTHERS':
        setShowSocialTouchCompleteModal(true);
        break;
      case 'SOCIAL':
        setShowSocialTouchCompleteModal(true);
        break;
      case 'TEXT':
        setShowZipwhipTouchWindow(true);
        setTextPhoneNumber(prospectToRender.dialingPhone);
        break;
      default:
        break;
    }
  };

  const prospectName = `${
    prospectToRender.firstName && prospectToRender.lastName
      ? prospectToRender.firstName + ' ' + prospectToRender.lastName
      : prospectToRender.firstName
      ? prospectToRender.firstName
      : prospectToRender.lastName
  }`;

  const engagementScore = [
    { name: 'Email', score: prospectToRender.emailEngagementScore },
    { name: 'Call', score: prospectToRender.callEngagementScore },
    { name: 'LinkedIn', score: prospectToRender.linkedinEngagementScore },
    { name: 'Social', score: prospectToRender.otherEngagementScore },
  ];

  const insertAt = (array, index, ...elementsArray) => {
    array.splice(index, 0, ...elementsArray);
  };

  if (org?.zipwhip && user.zipwhipSessionKey) {
    insertAt(engagementScore, 2, {
      name: 'Text',
      score: prospectToRender.textEngagementScore,
    });
  }

  let owner = {};
  if (
    fetchProspectData?.prospect?.includedAssociations?.user &&
    prospectToRender?.associations?.user
  ) {
    owner = fetchProspectData.prospect.includedAssociations.user.find(
      (user) => user.id === prospectToRender.associations.user[0].id
    );
  }

  const ownerName = owner?.name && owner.name.split(' ');

  return (
    <ContentWrapper>
      <PageHeader pageName="Prospect View">
        <div className="d-flex justify-content-end align-items-center ml-1">
          <ClButton
            className="py-2 mx-1"
            icon="fas fa-chart-bar text-purple"
            onClick={() => {
              setShowEngagementScoreModal(true);
            }}
            disabled={prospectToRender.totalEngagementScore === 0}
          >
            Engagement Score
            <sup>
              <span className="badge badge-primary ml-1">
                {prospectToRender.totalEngagementScore}
              </span>
            </sup>
          </ClButton>
          <span
            className="
                text-nowrap ml-3 btn btn-secondary
                p-0 bg-transparent border-0 
                shadow-none pointer
              "
            title="Refresh"
            style={
              fetchProspectLoading ||
              allActivitiesLoading ||
              renderNextProspect ||
              renderPrevProspect
                ? { opacity: '0.65', pointerEvents: 'none' }
                : {}
            }
            onClick={() => {
              refreshProspectAndActivity();
            }}
          >
            <i
              className={
                fetchProspectLoading ||
                allActivitiesLoading ||
                renderNextProspect ||
                renderPrevProspect
                  ? 'fa fa-spinner fa-spin'
                  : 'fas fa-sync-alt'
              }
            ></i>
          </span>

          {org &&
            org.crmType !== 'standalone' &&
            prospectToRender?.crmId &&
            prospectToRender.crmId.startsWith('crmgenkey_') &&
            selectUserId === currentUserId && (
              <span
                className="
                      text-nowrap ml-3 btn btn-secondary 
                      p-0 bg-transparent border-0 
                      shadow-none pointer
                    "
                title="Sync To CRM"
                outline
                disabled={syncToCrmLoading}
                onClick={() => {
                  prospectSyncToCrm({
                    variables: {
                      prospectId: prospectId,
                    },
                  });
                }}
              >
                <i
                  className={
                    syncToCrmLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'fas fa-exchange-alt'
                  }
                ></i>
              </span>
            )}
          <div className="d-flex align-items-center ml-3">
            <span
              hidden={
                0 === currentProspectIndexRef.current
                  ? true
                  : false || pathParam === 'notification'
              }
              className="pointer mr-2 btn btn-secondary p-0 bg-transparent border-0 shadow-none"
              title="Previous"
              onClick={() => {
                if (isEdit && checkUnSavedChangesDetected()) {
                  setRenderPrevProspect(true);
                  setShowUnSavedConfirmModal(true);
                } else {
                  handleRenderPrevProspect();
                }
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </span>
            {allProspectsData && allProspectsData.paging && (
              <span hidden={pathParam === 'notification'}>
                <small
                  className={
                    allProspectsData.paging.totalCount === 1 ? 'mr-2' : 'mr-2'
                  }
                >
                  <i>
                    {currentProspectIndexRef.current + 1} of{' '}
                    {allProspectsData.paging.totalCount} Prospect(s)
                  </i>
                </small>
              </span>
            )}
            <span
              hidden={
                (allProspectsData &&
                  allProspectsData.paging &&
                  allProspectsData.paging.totalCount ===
                    currentProspectIndexRef.current + 1) ||
                pathParam === 'notification'
              }
              className="btn btn-secondary p-0 bg-transparent border-0 shadow-none pointer"
              title="Next"
              onClick={() => {
                if (isEdit && checkUnSavedChangesDetected()) {
                  setRenderNextProspect(true);
                  setShowUnSavedConfirmModal(true);
                } else {
                  handleRenderNextProspect();
                }
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </span>
          </div>
          <div
            className="d-flex align-items-center ml-3"
            style={
              fetchProspectLoading
                ? { opacity: '0.65', pointerEvents: 'none' }
                : {}
            }
          >
            <span
              className="text-nowrap
                btn btn-secondary p-0 
                bg-transparent border-0 
                shadow-none pointer"
              onClick={() => {
                if (fetchProspectLoading) return;

                if (checkUnSavedChangesDetected()) {
                  setIsBackToList(true);
                } else {
                  setShowProspectDue(true);
                  backLinkRef.current.click();
                }
              }}
              title="Back to list page"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back
            </span>
            <Link
              style={{
                display: 'none',
              }}
              ref={backLinkRef}
              name="backtolist"
              to={{
                pathname: previousPageUrl ? previousPageUrl : '/prospects/list',
                search: window.location.search,
                isBackToList: true,
              }}
              title="Back to list page"
            >
              <i className="fas fa-times text-muted fa-xs"></i>
            </Link>
          </div>
        </div>
      </PageHeader>
      <Row className="mt-n2 color-regent-gray">
        <Col lg={3} className="pr-1">
          <div className="d-flex flex-wrap py-2">
            <h5 className="mb-0 mr-1 font-weight-bold">
              {prospectName.length > 30
                ? prospectName.slice(0, 27) + '...'
                : prospectName}
            </h5>
            {prospectToRender.accountName && (
              <span className="text-sm">({prospectToRender.accountName})</span>
            )}
          </div>
        </Col>

        <Col
          lg={9}
          className="d-flex flex-row justify-content-lg-end mt-md-2 mt-lg-0 px-1"
        >
          <ul className="nav">
            {!fetchProspectLoading && prospectToRender && (
              <li className="nav-item p-2 text-sm">
                <span className="fa-stack fa-1x">
                  <i className="fas fa-circle fa-stack-2x thin-circle"></i>
                  <span className="fa-stack-1x" title={owner?.name}>
                    <small>
                      {ownerName &&
                        ownerName[0] &&
                        ownerName[0].charAt(0).toUpperCase()}
                      {ownerName &&
                        ownerName[1] &&
                        ownerName[1].charAt(0).toUpperCase()}
                    </small>
                  </span>
                </span>
              </li>
            )}
            <li className="nav-item p-2 text-sm">
              {prospectToRender.campaignName &&
              prospectToRender.memberStatus === 'SUSPEND' ? (
                <span
                  title={
                    prospectToRender.pausedEndDatetime
                      ? `Prospect is currently paused. \nProspect will resume on ${moment
                          .tz(prospectToRender.pausedEndDatetime, 'UTC')
                          .format('M/D/YYYY')}`
                      : 'Prospect is currently paused'
                  }
                >
                  <i className="fas fa-pause text-primary mr-2"></i>
                  Paused
                </span>
              ) : prospectToRender.campaignName ? (
                <span
                  title={
                    prospectToRender?.currentTouchStatus === 'SCHEDULED_WAIT'
                      ? `Prospect is currently under Wait period. \nTime Remaining: ${waitTime}`
                      : 'Prospect is active'
                  }
                >
                  <i className="fas fa-play text-call mr-2"></i>
                  Active{' '}
                  {prospectToRender?.currentTouchStatus === 'SCHEDULED_WAIT' &&
                    '(On wait)'}
                </span>
              ) : (
                <span title="Prospect is currently not assigned to any cadence">
                  <i className="fas fa-arrows-alt text-warning mr-2"></i>
                  Unassigned
                </span>
              )}
            </li>
            <li className="nav-item p-2 text-sm" title="Current Cadence">
              <i className="svgicon koncert-cadence-icon text-icon mr-2"></i>
              {cadenceToRender && cadenceToRender.name ? (
                <span className="text-capitalize" title="Current Cadence">
                  {cadenceToRender.name.length > 25
                    ? `${cadenceToRender.name.slice(0, 25)}...`
                    : cadenceToRender.name}
                </span>
              ) : (
                'N/A'
              )}
            </li>
            <li className="nav-item p-2 text-sm" title="Current Touch Id">
              <i className="fas fa-hand-pointer color-lynch mr-2"></i>#
              {prospectToRender.currentTouchId}
              {prospectToRender.currentTouchType && (
                <span className="ml-2" title="Current Touch">
                  (
                  <span>
                    {changeOthersToSocial(prospectToRender.currentTouchType)}
                  </span>
                  )
                </span>
              )}
            </li>
            {showProspectDue && !fetchProspectLoading && (
              <li className="nav-item p-2 text-sm">
                <i className="fas fa-hourglass-half color-lynch mr-2"></i>
                {prospectToRender.dueAt}
              </li>
            )}
            <li
              className="nav-item p-2 text-sm"
              title={`Next Touch \nTime to complete next touch ${
                nextTouch &&
                nextTouch.timeToComplete &&
                nextTouch.timeToCompleteUnit
                  ? `${nextTouch.timeToComplete} ${
                      nextTouch.timeToCompleteUnit === 'Ho'
                        ? 'Hour'
                        : nextTouch.timeToCompleteUnit === 'Da'
                        ? 'Day'
                        : 'Minute'
                    }(s)`
                  : 'N/A'
              }`}
            >
              <i className="fas fa-angle-double-right color-lynch mr-2"></i>
              {nextTouch && nextTouch.touchType ? nextTouch.touchType : 'N/A'}
            </li>
            <li className="nav-item p-2 text-sm" id="infoTooltip">
              <i className="fas fa-info-circle text-primary"></i>
              <Tooltip
                placement="bottom"
                isOpen={infoTooltipOpen}
                target="infoTooltip"
                toggle={infoTooltipToggle}
              >
                <p className="text-nowrap">
                  {prospectToRender?.lastEmailedDate &&
                    `Last Email: ${formateDateTime(
                      prospectToRender.lastEmailedDate
                    )}`}
                </p>
                <p className="text-nowrap">
                  {`Last Touch: ${
                    prospectToRender.lastTouchDateTime
                      ? formateDateTime(prospectToRender.lastTouchDateTime)
                      : 'N/A'
                  }`}
                </p>
              </Tooltip>
            </li>
          </ul>
        </Col>
      </Row>
      {isEdit ? (
        <EditProspect
          handleUpdateProspect={handleUpdateProspect}
          updateProspectLoading={updateProspectLoading}
          checkUnSavedChangesDetected={checkUnSavedChangesDetected}
          cancelEdit={() => {
            toggleEdit();
            setShowMakeCall({});
          }}
          editFormRef={editFormRef}
          fieldMappingData={fieldMappingData}
          fieldMappingLoading={fieldMappingLoading}
          fieldDropDown={fieldDropDown}
          error={error}
          tagIds={tagIds}
          setTagIds={setTagIds}
          prospectToRender={prospectToRender}
          validateDate={validateDate}
        />
      ) : (
        <div className="color-regent-gray animated fadeIn animate-duration-600ms">
          <Row>
            {/* Start Info & Stats */}
            <Col xl={3} lg={6} className="pr-xl-0 pr-lg-0">
              <div className="ml-0 mt-2 mr-2 mb-2">
                <Card className="card-default mx-0">
                  <CardHeader className="bg-white">
                    <CardTitle>
                      <h5 className="color-bluewood my-1">
                        <i className="fas fa-user mr-2"></i>
                        Info
                        <div className="float-right">
                          {prospectToRender?.crmId &&
                            !prospectToRender.crmId.startsWith(
                              'crmgenkey_'
                            ) && (
                              <i
                                className="fa fa-arrow-up text-success pointer mr-2"
                                style={{
                                  transform: 'rotate(45deg)',
                                }}
                                onClick={handleOpenCrmWindow}
                                title="CRM"
                              ></i>
                            )}
                          {!isEdit && selectUserId === currentUserId && (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleEdit();
                              }}
                              className="pointer mr-2"
                              title="Edit Prospect"
                            >
                              <i className="fas fa-pencil-alt fa-sm color-lynch"></i>
                            </span>
                          )}
                        </div>
                      </h5>
                    </CardTitle>
                  </CardHeader>
                  <CardBody className="p-2 bt">
                    <Row>
                      <Col>
                        <div className="mb-2">
                          <h5 className="font-weight-bold mb-0">
                            {prospectName.length > 30
                              ? prospectName.slice(0, 27) + '...'
                              : prospectName}
                          </h5>
                          {prospectToRender.accountName && (
                            <span className="text-sm">
                              ({prospectToRender.accountName})
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <span className="d-block text-sm">Title</span>
                          <div>{prospectToRender.title}</div>
                        </div>

                        <address className="mb-2">
                          <span className="d-block text-sm">Address</span>
                          {prospectToRender.city && prospectToRender.state
                            ? prospectToRender.city +
                              ', ' +
                              prospectToRender.state
                            : prospectToRender.city
                            ? prospectToRender.city
                            : prospectToRender.state
                            ? prospectToRender.state
                            : ''}
                        </address>

                        {prospectToRender.email ? (
                          <div
                            title="Email"
                            className="pointer mb-2"
                            onClick={() => {
                              if (prospectToRender.optoutFlag === true) {
                                setShowAlertModal(true);
                              } else {
                                setTypeOfEmail('sendOneOff');
                                setShowEmailModal(true);
                              }
                            }}
                            onMouseOver={() => {
                              setOverState({
                                ...overState,
                                email: true,
                              });
                            }}
                            onMouseOut={() => {
                              setOverState({
                                ...overState,
                                email: false,
                              });
                            }}
                          >
                            <span className="d-block text-sm">Email</span>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-break">
                                {prospectToRender.email}
                              </span>
                              <i
                                className={`fas fa-envelope text-email ${
                                  overState.email ? 'visible' : 'invisible'
                                } ml-1`}
                              ></i>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-2">
                            <span className="d-block text-sm">Email</span>
                          </div>
                        )}

                        {prospectToRender.phone ? (
                          selectUserId === currentUserId ? (
                            <div
                              title="Phone"
                              className="pointer mb-2"
                              onClick={() => {
                                setShowMakeCall({
                                  phone: prospectToRender.phone,
                                  isDial: true,
                                });
                              }}
                              onMouseOver={() => {
                                setOverState({
                                  ...overState,
                                  phone: true,
                                });
                              }}
                              onMouseOut={() => {
                                setOverState({
                                  ...overState,
                                  phone: false,
                                });
                              }}
                            >
                              <span className="d-block text-sm">Phone</span>
                              <div className="d-flex justify-content-between align-items-center">
                                <span>{prospectToRender.phone}</span>
                                <i
                                  className={`fas fa-phone-alt text-call ${
                                    overState.phone ? 'visible' : 'invisible'
                                  } ml-1`}
                                ></i>
                              </div>
                              {prospectToRender?.extension && (
                                <span className="text-sm">
                                  Ext: {prospectToRender.extension}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              title="Phone"
                              className="mb-2"
                              onMouseOver={() => {
                                setOverState({
                                  ...overState,
                                  phone: true,
                                });
                              }}
                              onMouseOut={() => {
                                setOverState({
                                  ...overState,
                                  phone: false,
                                });
                              }}
                            >
                              <span className="d-block text-sm">Phone</span>
                              <div className="d-flex justify-content-between align-items-center">
                                <span>{prospectToRender.phone}</span>
                                <i
                                  className={`fas fa-phone-alt text-call ${
                                    overState.phone ? 'visible' : 'invisible'
                                  } ml-1`}
                                ></i>
                              </div>
                              {prospectToRender?.extension && (
                                <span className="text-sm">
                                  Ext: {prospectToRender.extension}
                                </span>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="mb-2">
                            <span className="d-block text-sm">Phone</span>
                          </div>
                        )}

                        {!fieldMappingLoading &&
                          !error &&
                          fieldMappingData &&
                          fieldMappingData.fields &&
                          fieldMappingData.fields.includedAssociations &&
                          fieldMappingData.fields.includedAssociations.fields &&
                          fieldMappingData.fields.includedAssociations.fields
                            .filter(
                              (item) =>
                                !item.implicit &&
                                item.name &&
                                item.name.startsWith('customPhone')
                            )
                            .sort(function (a, b) {
                              return a.implicit - b.implicit;
                            })
                            .map((field, i) => {
                              const extField =
                                'extension' +
                                field.name.charAt(0).toUpperCase() +
                                field.name.slice(1);

                              const phoneLabel = field.label.startsWith(
                                'Direct'
                              )
                                ? 'Direct'
                                : field.label.startsWith('Mobile')
                                ? 'Mobile'
                                : field.label.startsWith('Phone')
                                ? 'Phone'
                                : 'Other';
                              return (
                                <Phone
                                  key={i}
                                  selectUserId={selectUserId}
                                  currentUserId={currentUserId}
                                  prospectToRender={prospectToRender}
                                  field={field}
                                  setShowMakeCall={setShowMakeCall}
                                  extField={extField}
                                  phoneLabel={phoneLabel}
                                />
                              );
                            })}
                        {prospectToRender && prospectToRender.linkedinUrl && (
                          <div
                            className="mb-2"
                            onMouseOver={() => {
                              setOverState({
                                ...overState,
                                linkedIn: true,
                              });
                            }}
                            onMouseOut={() => {
                              setOverState({
                                ...overState,
                                linkedIn: false,
                              });
                            }}
                          >
                            <span className="d-block text-sm">LinkedIn</span>
                            <div className="d-flex justify-content-between align-items-center">
                              <span
                                title={prospectToRender.linkedinUrl}
                                className="text-truncate"
                              >
                                {isValidURL(prospectToRender.linkedinUrl) ? (
                                  <Link
                                    to={{
                                      pathname: formatWebLink(
                                        prospectToRender.linkedinUrl
                                      ),
                                    }}
                                    target="_blank"
                                  >
                                    {prospectToRender.linkedinUrl}
                                  </Link>
                                ) : (
                                  prospectToRender.linkedinUrl
                                )}
                              </span>
                              <i
                                className={`fab fa-linkedin-in text-primary ${
                                  overState.linkedIn ? 'visible' : 'invisible'
                                } ml-1`}
                              ></i>
                            </div>
                          </div>
                        )}

                        {prospectToRender &&
                        prospectToRender?.localTime?.prospectLocalTime ? (
                          <div
                            className="mb-1"
                            onMouseOver={() => {
                              setOverState({
                                ...overState,
                                time: true,
                              });
                            }}
                            onMouseOut={() => {
                              setOverState({
                                ...overState,
                                time: false,
                              });
                            }}
                          >
                            <span className="d-block text-sm">Time</span>
                            <div className="d-flex justify-content-between align-items-center">
                              <span>
                                {prospectToRender.localTime.prospectLocalTime}
                              </span>
                              <i
                                className={`fas fa-clock ${
                                  overState.time ? 'visible' : 'invisible'
                                } ml-1`}
                              ></i>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-1">
                            <span className="d-block text-sm">Time</span>
                          </div>
                        )}
                        <div className="my-3 font-italic text-muted text-sm">
                          {prospectToRender?.crmId &&
                            !prospectToRender.crmId.startsWith(
                              'crmgenkey_'
                            ) && (
                              <div>
                                Last Sync date/time:{' '}
                                {formateDateTime(
                                  prospectToRender.lastSyncDatetime
                                )}
                              </div>
                            )}
                          <div>Prospect ID: {prospectToRender.id}</div>
                          <div>
                            Last Modified:{' '}
                            {formateDateTime(prospectToRender.updatedDate)}
                          </div>
                          <div>
                            Last Touched On:{' '}
                            {formateDateTime(
                              prospectToRender.lastTouchDateTime
                            )}
                          </div>
                        </div>
                        <div
                          className="mb-2 text-right"
                          onClick={() => accordionToggle()}
                        >
                          <span className="text-primary text-link-over-dark pointer">
                            <i
                              className={`${
                                toggleAccordion
                                  ? 'fa fa-sm fa-chevron-up'
                                  : 'fa fa-sm fa-chevron-down'
                              } mr-1`}
                            ></i>
                            {`${
                              toggleAccordion ? 'Hide' : 'Show'
                            } Prospect Fields`}
                          </span>
                        </div>
                        {/* Prospect Fields */}
                        <Collapse isOpen={toggleAccordion}>
                          <div id="collapse01" className="mt-3">
                            <h5 className="font-weight-bold mb-2">
                              Prospect Fields
                            </h5>
                            {!fieldMappingLoading &&
                              !error &&
                              fieldMappingData?.fields?.includedAssociations?.fields
                                .filter(
                                  (item) =>
                                    item.implicit === true &&
                                    item.clNativeColumn === false &&
                                    (item.name === 'emailId'
                                      ? prospectToRender['email']
                                      : prospectToRender[item.name] ||
                                        item.name === 'tag') &&
                                    item.name !== 'contactName'
                                )
                                .sort((a, b) => {
                                  const index1 = order.indexOf(a.clFieldName);
                                  const index2 = order.indexOf(b.clFieldName);
                                  return (
                                    (index1 > -1 ? index1 : Infinity) -
                                    (index2 > -1 ? index2 : Infinity)
                                  );
                                })
                                .map((field, i) => (
                                  <EditProspectInput
                                    key={i}
                                    field={field}
                                    prospectToRender={prospectToRender}
                                    tagNames={tagNames}
                                    tagIds={tagIds}
                                    setTagIds={setTagIds}
                                    updateProspect={updateProspect}
                                    getEditedFields={getEditedFields}
                                    prospectId={prospectId}
                                    currentUserId={currentUserId}
                                    selectUserId={selectUserId}
                                    fieldDropDown={fieldDropDown}
                                    fieldMappingData={fieldMappingData}
                                    fieldMappingLoading={fieldMappingLoading}
                                    error={error}
                                    validateDate={validateDate}
                                  />
                                ))}
                            {!fieldMappingLoading &&
                              !error &&
                              fieldMappingData?.fields?.includedAssociations?.fields
                                .filter(
                                  (item) =>
                                    item.implicit === false &&
                                    item.clNativeColumn === false &&
                                    (item.name === 'emailId'
                                      ? prospectToRender['email']
                                      : prospectToRender[item.name] ||
                                        item.name === 'tag')
                                )
                                .sort(function (a, b) {
                                  if (a.label < b.label) {
                                    return -1;
                                  }
                                  if (a.label > b.label) {
                                    return 1;
                                  }
                                  return 0;
                                })
                                .map((field, i) => (
                                  <EditProspectInput
                                    key={i}
                                    field={field}
                                    prospectToRender={prospectToRender}
                                    tagNames={tagNames}
                                    tagIds={tagIds}
                                    setTagIds={setTagIds}
                                    updateProspect={updateProspect}
                                    prospectId={prospectId}
                                    getEditedFields={getEditedFields}
                                    currentUserId={currentUserId}
                                    selectUserId={selectUserId}
                                    fieldDropDown={fieldDropDown}
                                    fieldMappingData={fieldMappingData}
                                    fieldMappingLoading={fieldMappingLoading}
                                    error={error}
                                    validateDate={validateDate}
                                  />
                                ))}
                            {!fieldMappingLoading &&
                              !error &&
                              fieldMappingData?.fields?.includedAssociations?.fields
                                .filter(
                                  (item) =>
                                    item.implicit === false &&
                                    item.clNativeColumn === true &&
                                    (item.name === 'emailId'
                                      ? prospectToRender['email']
                                      : prospectToRender[item.name] ||
                                        item.name === 'tag')
                                )
                                .sort(function (a, b) {
                                  if (a.label < b.label) {
                                    return -1;
                                  }
                                  if (a.label > b.label) {
                                    return 1;
                                  }
                                  return 0;
                                })
                                .map((field, i) => (
                                  <EditProspectInput
                                    key={i}
                                    field={field}
                                    prospectToRender={prospectToRender}
                                    tagNames={tagNames}
                                    tagIds={tagIds}
                                    setTagIds={setTagIds}
                                    updateProspect={updateProspect}
                                    prospectId={prospectId}
                                    getEditedFields={getEditedFields}
                                    currentUserId={currentUserId}
                                    selectUserId={selectUserId}
                                    fieldDropDown={fieldDropDown}
                                    fieldMappingData={fieldMappingData}
                                    fieldMappingLoading={fieldMappingLoading}
                                    error={error}
                                    validateDate={validateDate}
                                  />
                                ))}
                            <div
                              className="mb-2 text-right"
                              onClick={() => toggleBlankFields()}
                            >
                              <span className="text-primary text-link-over-dark pointer">
                                <i
                                  className={`${
                                    showBlankFields
                                      ? 'fa fa-sm fa-chevron-up'
                                      : 'fa fa-sm fa-chevron-right'
                                  } mr-1`}
                                ></i>
                                {`Show ${
                                  showBlankFields ? 'less' : 'more'
                                } fields`}
                              </span>
                            </div>
                            {showBlankFields &&
                              !fieldMappingLoading &&
                              !error &&
                              fieldMappingData?.fields?.includedAssociations?.fields
                                .filter(
                                  (item) =>
                                    !(item.name === 'emailId'
                                      ? prospectToRender['email']
                                      : prospectToRender[item.name]) &&
                                    item.name !== 'tag' &&
                                    item.implicit === true &&
                                    item.clNativeColumn === false &&
                                    item.name !== 'contactName'
                                )
                                .sort((a, b) => {
                                  const index1 = order.indexOf(a.clFieldName);
                                  const index2 = order.indexOf(b.clFieldName);
                                  return (
                                    (index1 > -1 ? index1 : Infinity) -
                                    (index2 > -1 ? index2 : Infinity)
                                  );
                                })
                                .map((field, i) => (
                                  <EditProspectInput
                                    key={i}
                                    field={field}
                                    prospectToRender={prospectToRender}
                                    tagNames={tagNames}
                                    tagIds={tagIds}
                                    setTagIds={setTagIds}
                                    updateProspect={updateProspect}
                                    getEditedFields={getEditedFields}
                                    prospectId={prospectId}
                                    currentUserId={currentUserId}
                                    selectUserId={selectUserId}
                                    fieldDropDown={fieldDropDown}
                                    fieldMappingData={fieldMappingData}
                                    fieldMappingLoading={fieldMappingLoading}
                                    error={error}
                                    validateDate={validateDate}
                                  />
                                ))}
                            {showBlankFields &&
                              !fieldMappingLoading &&
                              !error &&
                              fieldMappingData?.fields?.includedAssociations?.fields
                                .filter(
                                  (item) =>
                                    !(item.name === 'emailId'
                                      ? prospectToRender['email']
                                      : prospectToRender[item.name]) &&
                                    item.name !== 'tag' &&
                                    item.implicit === false &&
                                    item.clNativeColumn === false
                                )
                                .sort(function (a, b) {
                                  if (a.label < b.label) {
                                    return -1;
                                  }
                                  if (a.label > b.label) {
                                    return 1;
                                  }
                                  return 0;
                                })
                                .map((field, i) => (
                                  <EditProspectInput
                                    key={i}
                                    field={field}
                                    prospectToRender={prospectToRender}
                                    tagNames={tagNames}
                                    tagIds={tagIds}
                                    setTagIds={setTagIds}
                                    updateProspect={updateProspect}
                                    prospectId={prospectId}
                                    getEditedFields={getEditedFields}
                                    currentUserId={currentUserId}
                                    selectUserId={selectUserId}
                                    fieldDropDown={fieldDropDown}
                                    fieldMappingData={fieldMappingData}
                                    fieldMappingLoading={fieldMappingLoading}
                                    error={error}
                                    validateDate={validateDate}
                                  />
                                ))}
                            {showBlankFields &&
                              !fieldMappingLoading &&
                              !error &&
                              fieldMappingData?.fields?.includedAssociations?.fields
                                .filter(
                                  (item) =>
                                    !(item.name === 'emailId'
                                      ? prospectToRender['email']
                                      : prospectToRender[item.name]) &&
                                    item.name !== 'tag' &&
                                    item.implicit === false &&
                                    item.clNativeColumn === true
                                )
                                .sort(function (a, b) {
                                  if (a.label < b.label) {
                                    return -1;
                                  }
                                  if (a.label > b.label) {
                                    return 1;
                                  }
                                  return 0;
                                })
                                .map((field, i) => (
                                  <EditProspectInput
                                    key={i}
                                    field={field}
                                    prospectToRender={prospectToRender}
                                    tagNames={tagNames}
                                    tagIds={tagIds}
                                    setTagIds={setTagIds}
                                    updateProspect={updateProspect}
                                    prospectId={prospectId}
                                    getEditedFields={getEditedFields}
                                    currentUserId={currentUserId}
                                    selectUserId={selectUserId}
                                    fieldDropDown={fieldDropDown}
                                    fieldMappingData={fieldMappingData}
                                    fieldMappingLoading={fieldMappingLoading}
                                    error={error}
                                    validateDate={validateDate}
                                  />
                                ))}

                            {!fieldMappingLoading &&
                              !error &&
                              fieldMappingData?.fields?.includedAssociations
                                ?.fields.length === 0 && (
                                <Alert color="warning" className="text-center">
                                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                  No Custom Fields Available
                                </Alert>
                              )}
                            {!fieldMappingLoading && error && (
                              <Alert color="danger" className="text-center">
                                <i
                                  className="fas fa-exclamation-circ
                                    le fa-lg mr-2"
                                ></i>
                                Failed to fetch Custom Fields
                              </Alert>
                            )}
                          </div>
                        </Collapse>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Alert modal */}
                <AlertModal
                  alertType="error"
                  showModal={showAlertModal}
                  handleClose={toggleAlertModal}
                >
                  <div>Prospect is opted out</div>
                </AlertModal>

                {/* Actions */}
                <Card className="card-default mx-0">
                  <CardHeader className="bg-white border-bottom">
                    <CardTitle>
                      <h5 className="color-bluewood my-1">
                        <i className="fas fa-bolt mr-2"></i>
                        Actions
                      </h5>
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row className="text-center">
                      <Col sm={4} className="mb-2">
                        <div
                          className="pointer mb-1"
                          title={`Dial ${
                            prospectToRender.dialingPhone &&
                            prospectToRender.dialingPhone
                          }`}
                          onClick={() => {
                            setShowMakeCall({
                              phone: prospectToRender.dialingPhone,
                              isDial: true,
                            });
                          }}
                          style={
                            prospectToRender.dialingPhone &&
                            selectUserId === currentUserId
                              ? {}
                              : { opacity: '0.65', pointerEvents: 'none' }
                          }
                        >
                          <span
                            className="
                            circle-icon 
                            d-flex 
                            mx-auto mb-1
                            border
                            border-regent-gray 
                            align-items-center 
                            justify-content-center 
                            rounded-circle
                          "
                          >
                            <i className="fa fa-phone-alt"></i>
                          </span>
                          <p>Dial</p>
                        </div>
                      </Col>
                      <Col sm={4} className="mb-2">
                        <div
                          className="pointer mb-1"
                          title="Send Email"
                          style={
                            prospectToRender && prospectToRender.email
                              ? {}
                              : { opacity: '0.65', pointerEvents: 'none' }
                          }
                          onClick={() => {
                            if (prospectToRender.optoutFlag === true) {
                              setShowAlertModal(true);
                            } else {
                              setTypeOfEmail('sendOneOff');
                              setShowEmailModal(true);
                            }
                          }}
                        >
                          <span
                            className="
                            circle-icon 
                            d-flex 
                            mx-auto mb-1
                            border
                            border-regent-gray 
                            align-items-center 
                            justify-content-center 
                            rounded-circle
                          "
                          >
                            <i className="fas fa-envelope"></i>
                          </span>
                          <p>Email</p>
                        </div>
                      </Col>

                      <Col sm={4} className="mb-2">
                        <div
                          title="Log a Task"
                          className="pointer mb-1"
                          onClick={() => {
                            setTaskName('Task');
                            setShowLogTaskModal(true);
                          }}
                          style={
                            selectUserId !== currentUserId
                              ? { opacity: '0.65', pointerEvents: 'none' }
                              : {}
                          }
                        >
                          <span
                            className="
                            circle-icon 
                            d-flex 
                            mx-auto mb-1
                            border
                            border-regent-gray 
                            align-items-center 
                            justify-content-center 
                            rounded-circle
                          "
                          >
                            <i className="fas fa-tasks"></i>
                          </span>
                          <p>Task</p>
                        </div>
                      </Col>

                      <Col sm={4} className="mb-2">
                        <div
                          title="Log a Call"
                          className="pointer mb-1"
                          onClick={() => {
                            setTaskName('Call');
                            setShowLogTaskModal(true);
                          }}
                          style={
                            selectUserId !== currentUserId
                              ? { opacity: '0.65', pointerEvents: 'none' }
                              : {}
                          }
                        >
                          <span
                            className="
                            circle-icon 
                            d-flex 
                            mx-auto mb-1
                            border
                            border-regent-gray 
                            align-items-center 
                            justify-content-center 
                            rounded-circle
                          "
                          >
                            <i className="fas fa-blender-phone"></i>
                          </span>
                          <p>Call</p>
                        </div>
                      </Col>
                      <Col sm={4} className="mb-2">
                        <div
                          title="Add a note"
                          className="pointer mb-1"
                          onClick={() => {
                            setNotes({});
                            setAttachment({});
                            setShowAddNoteModal(true);
                          }}
                          style={
                            selectUserId !== currentUserId
                              ? { opacity: '0.65', pointerEvents: 'none' }
                              : {}
                          }
                        >
                          <span
                            className="
                            circle-icon 
                            d-flex 
                            mx-auto mb-1
                            border
                            border-regent-gray 
                            align-items-center 
                            justify-content-center 
                            rounded-circle
                          "
                          >
                            <i className="fas fa-clipboard"></i>
                          </span>
                          <p>Note</p>
                        </div>
                      </Col>
                      {cadenceToRender && !cadenceToRender.name && (
                        <Col
                          sm={4}
                          className="mb-2"
                          hidden={
                            cadenceToRender && cadenceToRender.name
                              ? true
                              : false
                          }
                        >
                          <div
                            title="Assign Cadence"
                            className="pointer mb-1"
                            onClick={() => {
                              setShowAssignPorspectToCadenceModal(true);
                            }}
                          >
                            <span
                              className="
                              circle-icon 
                              d-flex 
                              mx-auto mb-1
                              border
                              border-regent-gray 
                              align-items-center 
                              justify-content-center 
                              rounded-circle
                            "
                            >
                              <i className="fas fa-plus"></i>
                            </span>
                            <p>Assign</p>
                          </div>
                        </Col>
                      )}
                      {cadenceToRender && cadenceToRender.name && (
                        <Col
                          sm={4}
                          className="mb-2"
                          hidden={cadenceToRender && !cadenceToRender.name}
                        >
                          <div
                            title="Move to Another Cadence"
                            className="pointer mb-1"
                            onClick={() =>
                              setShowMoveProspectToCadenceModal(true)
                            }
                          >
                            <span
                              className="
                              circle-icon 
                              d-flex 
                              mx-auto mb-1
                              border
                              border-regent-gray 
                              align-items-center 
                              justify-content-center 
                              rounded-circle
                            "
                            >
                              <i className="fas fa-arrows-alt"></i>
                            </span>
                            <p>Move</p>
                          </div>
                        </Col>
                      )}
                      {user.zipwhipSessionKey && (
                        <Col sm={4} className="mb-2">
                          <div
                            title="Send Text"
                            className="pointer mb-1"
                            onClick={() => {
                              setShowZipwhipTouchWindow(true);
                              setTextPhoneNumber(prospectToRender.dialingPhone);
                            }}
                          >
                            <span
                              className="
                              circle-icon 
                              d-flex 
                              mx-auto mb-1
                              border
                              border-regent-gray 
                              align-items-center 
                              justify-content-center 
                              rounded-circle
                            "
                            >
                              <i className="fas fa-comments"></i>
                            </span>
                            <p>Text</p>
                          </div>
                        </Col>
                      )}
                      {cadenceToRender && cadenceToRender.name && (
                        <>
                          <Col sm={4} className="mb-2">
                            <div
                              title="Complete Touch"
                              className="pointer mb-1"
                              onClick={() => {
                                handleSetTouchInfo();
                                handleCompleteTouch();
                              }}
                              style={
                                selectUserId !== currentUserId
                                  ? { opacity: '0.65', pointerEvents: 'none' }
                                  : {}
                              }
                            >
                              <span
                                className="
                                circle-icon 
                                d-flex 
                                mx-auto mb-1
                                border
                                border-regent-gray 
                                align-items-center 
                                justify-content-center 
                                rounded-circle
                              "
                              >
                                <i
                                  className="fas fa-check"
                                  style={{ marginLeft: '2px' }}
                                ></i>
                              </span>
                              <p>Complete</p>
                            </div>
                          </Col>
                          <Col sm={4} className="mb-2">
                            <div
                              title="Skip Touch"
                              className="pointer mb-1"
                              onClick={() =>
                                setShowSkipTouchToCadenceModal(true)
                              }
                            >
                              <span
                                className="
                                circle-icon 
                                d-flex 
                                mx-auto mb-1
                                border
                                border-regent-gray 
                                align-items-center 
                                justify-content-center 
                                rounded-circle
                              "
                              >
                                <i
                                  className="fas fa-step-forward"
                                  style={{ marginLeft: '2px' }}
                                ></i>
                              </span>
                              <p>Skip</p>
                            </div>
                          </Col>
                          {prospectToRender.memberStatus === 'SUSPEND' ? (
                            <Col sm={4} className="mb-2">
                              <div
                                title="Resume Prospect"
                                className="pointer mb-1"
                                onClick={() =>
                                  setShowResumeProspectConfirmModal(true)
                                }
                              >
                                <span
                                  className="
                                  circle-icon 
                                  d-flex 
                                  mx-auto mb-1
                                  border
                                  border-regent-gray 
                                  align-items-center 
                                  justify-content-center 
                                  rounded-circle
                                "
                                >
                                  <i
                                    className="fas fa-play"
                                    style={{ marginLeft: '4px' }}
                                  ></i>
                                </span>
                                <p>Resume</p>
                              </div>
                            </Col>
                          ) : (
                            <Col sm={4} className="mb-2">
                              <div
                                title="Pause Prospect"
                                className="pointer mb-1"
                                onClick={() =>
                                  setShowPauseProspectConfirmModal(true)
                                }
                              >
                                <span
                                  className="
                                  circle-icon 
                                  d-flex 
                                  mx-auto mb-1
                                  border
                                  border-regent-gray 
                                  align-items-center 
                                  justify-content-center 
                                  rounded-circle
                                "
                                >
                                  <i className="fas fa-pause"></i>
                                </span>
                                <p>Pause</p>
                              </div>
                            </Col>
                          )}
                          <Col sm={4} className="mb-2">
                            <div
                              title="Exit Cadence"
                              className="pointer mb-1"
                              style={
                                cadenceToRender && cadenceToRender.name
                                  ? {}
                                  : { opacity: '0.65', pointerEvents: 'none' }
                              }
                              onClick={() =>
                                setShowExitProspectConfirmModal(true)
                              }
                            >
                              <span
                                className="
                                circle-icon 
                                d-flex 
                                mx-auto mb-1
                                border
                                border-regent-gray 
                                align-items-center 
                                justify-content-center 
                                rounded-circle
                              "
                              >
                                <i
                                  className="fas fa-sign-out-alt"
                                  style={{ marginLeft: '3px' }}
                                ></i>
                              </span>
                              <p>Exit</p>
                            </div>
                          </Col>
                        </>
                      )}
                      <Col sm={4} className="mb-2">
                        <div
                          title="Transfer Ownership"
                          className="pointer mb-1"
                          onClick={() => setShowTransferOwnershipModal(true)}
                        >
                          <span
                            className="
                            circle-icon 
                            d-flex 
                            mx-auto mb-1
                            border
                            border-regent-gray 
                            align-items-center 
                            justify-content-center 
                            rounded-circle
                          "
                          >
                            <i className="fas fa-user"></i>
                          </span>
                          <p>Transfer</p>
                        </div>
                      </Col>
                      <Col sm={4} className="mb-2">
                        <div
                          title="Delete prospect"
                          className="pointer mb-1"
                          onClick={() =>
                            setShowDeleteProspectConfirmModal(true)
                          }
                        >
                          <span
                            className="
                            circle-icon 
                            d-flex 
                            mx-auto mb-1
                            border
                            border-regent-gray 
                            align-items-center 
                            justify-content-center 
                            rounded-circle
                          "
                          >
                            <i className="fas fa-trash"></i>
                          </span>
                          <p>Delete</p>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>

                {/* Stats Info */}
                <Card className="card-default mx-0">
                  <CardHeader className="bg-white border-bottom">
                    <CardTitle>
                      <h5 className="color-bluewood my-1">
                        <i className="fas fa-chart-bar mr-2"></i>
                        Stats
                      </h5>
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <Row className="flex-column">
                      <Col className="mb-2">
                        <div
                          title="Email Touch"
                          className="d-flex w-100 align-items-center"
                        >
                          <i
                            className="fas fa-envelope text-email"
                            style={{ width: '10%' }}
                          ></i>
                          <span
                            className="text-nowrap"
                            style={{ width: '80%' }}
                          >
                            <b
                              className="bg-regent-gray d-inline-block"
                              style={{
                                width: `${
                                  prospectToRender?.stats
                                    ? prospectToRender.stats.emailCount
                                    : 0
                                }%`,
                                height: '6px',
                              }}
                            ></b>
                            <small className="d-inline-block ml-1 text-muted">
                              {prospectToRender && prospectToRender.stats
                                ? prospectToRender.stats.emailCount
                                : 0}
                            </small>
                          </span>
                        </div>
                      </Col>
                      <Col className="mb-2">
                        <div
                          title="Call Touch"
                          className="d-flex w-100 align-items-center"
                        >
                          <i
                            className="fas fa-phone-alt text-call"
                            style={{ width: '10%' }}
                          ></i>
                          <span
                            className="text-nowrap"
                            style={{ width: '80%' }}
                          >
                            <b
                              className="bg-regent-gray d-inline-block"
                              style={{
                                width: `${
                                  prospectToRender?.stats
                                    ? prospectToRender.stats.callCount
                                    : 0
                                }%`,
                                height: '6px',
                              }}
                            ></b>
                            <small className="d-inline-block ml-1 text-muted">
                              {prospectToRender && prospectToRender.stats
                                ? prospectToRender.stats.callCount
                                : 0}
                            </small>
                          </span>
                        </div>
                      </Col>
                      {user.zipwhipSessionKey && (
                        <Col className="mb-2">
                          <div
                            title="Text Touch"
                            className="d-flex w-100 align-items-center"
                          >
                            <i
                              className="fas fa-comments text-danger"
                              style={{ width: '10%' }}
                            ></i>
                            <span
                              className="text-nowrap"
                              style={{ width: '80%' }}
                            >
                              <b
                                className="bg-regent-gray d-inline-block"
                                style={{
                                  width: `${
                                    prospectToRender?.stats
                                      ? prospectToRender.stats.textCount
                                      : 0
                                  }%`,
                                  height: '6px',
                                }}
                              ></b>
                              <small className="d-inline-block ml-1 text-muted">
                                {prospectToRender && prospectToRender.stats
                                  ? prospectToRender.stats.textCount
                                  : 0}
                              </small>
                            </span>
                          </div>
                        </Col>
                      )}
                      <Col className="mb-2">
                        <div
                          title="LinkedIn Touch"
                          className="d-flex w-100 align-items-center"
                        >
                          <i
                            className="fab fa-linkedin-in text-linkedin"
                            style={{ width: '10%' }}
                          ></i>
                          <span
                            className="text-nowrap"
                            style={{ width: '80%' }}
                          >
                            <b
                              className="bg-regent-gray d-inline-block"
                              style={{
                                width: `${
                                  prospectToRender?.stats
                                    ? prospectToRender.stats.linkedinCount
                                    : 0
                                }%`,
                                height: '6px',
                              }}
                            ></b>
                            <small className="d-inline-block ml-1 text-muted">
                              {prospectToRender && prospectToRender.stats
                                ? prospectToRender.stats.linkedinCount
                                : 0}
                            </small>
                          </span>
                        </div>
                      </Col>
                      <Col className="mb-2">
                        <div
                          title="Social Touch"
                          className="d-flex w-100 align-items-center"
                        >
                          <i
                            className="fas fa-share-alt text-social"
                            style={{ width: '10%' }}
                          ></i>
                          <span
                            className="text-nowrap"
                            style={{ width: '80%' }}
                          >
                            <b
                              className="bg-regent-gray d-inline-block"
                              style={{
                                width: `${
                                  prospectToRender?.stats
                                    ? prospectToRender.stats.otherCount
                                    : 0
                                }%`,
                                height: '6px',
                              }}
                            ></b>
                            <small className="d-inline-block ml-1 text-muted">
                              {prospectToRender && prospectToRender.stats
                                ? prospectToRender.stats.otherCount
                                : 0}
                            </small>
                          </span>
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex w-100 align-items-center">
                          <i className="invisible" style={{ width: '10%' }}></i>
                          <span
                            className="d-flex align-items-center"
                            style={{ width: '80%' }}
                          >
                            <span style={{ width: '0%', textAlign: 'right' }}>
                              0
                            </span>
                            <span style={{ width: '20%', textAlign: 'right' }}>
                              20
                            </span>
                            <span style={{ width: '20%', textAlign: 'right' }}>
                              40
                            </span>
                            <span style={{ width: '20%', textAlign: 'right' }}>
                              60
                            </span>
                            <span style={{ width: '20%', textAlign: 'right' }}>
                              80
                            </span>
                            <span style={{ width: '20%', textAlign: 'right' }}>
                              100
                            </span>
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </div>
            </Col>
            {/* End Info & Stats */}

            {/* Start Pending Tasks, Pending Emails & Click Dialer */}
            <Col xl lg={6} className="px-xl-0 pl-lg-0">
              <div className="m-2">
                {/* Click Dialer */}
                <ClickDialerApp
                  org={org}
                  user={user}
                  showMakeCall={showMakeCall}
                  prospectToRender={prospectToRender}
                  handleActionRefresh={() => {
                    setUnSavedCallDetailIsExists(false);
                    refreshProspectAndActivity();
                    setShowMakeCall({});
                  }}
                  handleDialNextContact={() => {
                    setUnSavedCallDetailIsExists(false);
                    if (currentProspectIndexRef.current + 1 < totalCount) {
                      setDialNext(true);
                      handleRenderNextProspect();
                    }
                  }}
                  handleStopNavigation={(unSavedCallDetailIsExists) => {
                    setUnSavedCallDetailIsExists(unSavedCallDetailIsExists);
                    unSavedCallDetailIsExistsRef.current = unSavedCallDetailIsExists;
                  }}
                  callInitiatePage={
                    location && location.state && location.state.origin
                      ? location.state.origin
                      : ''
                  }
                  selectUserId={selectUserId}
                  currentUserId={currentUserId}
                  pathParam={pathParam}
                  memberTaskId={
                    queryParams['filter[prospectTask][dueDate]']
                      ? taskIdRef.current
                      : ''
                  }
                ></ClickDialerApp>

                {/* Pending Tasks */}
                <div>
                  <PendingActivityGrid
                    data={prospectToRender.pendingActivites}
                    loading={fetchProspectLoading}
                    handleActionEditTask={(task) => {
                      setTask(task);
                      setTaskName('Task');
                      setShowLogTaskModal(true);
                    }}
                  ></PendingActivityGrid>

                  {/* Pending Emails */}
                  <PendingEmailGrid
                    data={prospectToRender}
                    loading={fetchProspectLoading}
                    handleShowEmailModal={() => {
                      setTypeOfEmail('Personalize');
                      setShowEmailModal(true);
                    }}
                    prospectId={prospectId}
                    dropdownUserId={selectUserId ? selectUserId : currentUserId}
                  ></PendingEmailGrid>
                  {/* notes grid */}
                  <NotesGrid
                    data={prospectToRender}
                    loading={fetchProspectLoading}
                    handleActionEditNotes={(notes, attachment) => {
                      setNotes(notes);
                      setAttachment(attachment);
                      setShowAddNoteModal(true);
                    }}
                    handleActionDeleteNotes={(notes) => {
                      setNotes(notes);
                      setShowDeleteNotesConfirmModal(true);
                    }}
                  ></NotesGrid>
                </div>
              </div>
            </Col>
            {/* End Pending Tasks, Pending Emails & Click Dialer */}

            {/* Start Activity All-Calls-Emails Tabs */}
            <Col xl lg={6} className="pl-xl-0">
              <ProspectActivity
                activeTab={
                  user?.defaultActivityFilter
                    ? user.defaultActivityFilter === 'others'
                      ? 'social'
                      : user.defaultActivityFilter
                    : 'all'
                }
                loading={allActivitiesLoading}
                error={allActivitiesError}
                data={allActivities}
                paging={activityPaging}
                handleShowMoreActivity={handleActionShowMoreActivity}
                zipwhipSessionKey={user.zipwhipSessionKey}
                user={user}
              ></ProspectActivity>
            </Col>
            {/* End Activity All-Calls-Emails Tabs */}
          </Row>
        </div>
      )}
      <LogACallAndLogATask
        taskName={taskName}
        showModal={showLogTaskModal}
        hideNewTask={hideNewTask}
        hideModal={() => {
          setShowLogTaskModal(false);
          setTask({});
        }}
        prospectId={prospectId}
        cadence={cadenceToRender}
        prospect={prospectToRender}
        memberTaskId={
          queryParams['filter[prospectTask][dueDate]'] ? taskIdRef.current : ''
        }
        handleRefreshActivity={() => {
          !fetchProspectLoading && refetchProspect();
          !allActivitiesLoading && refetchActivity();
        }}
        task={task}
      ></LogACallAndLogATask>
      <ZipWhipModal
        showZipwhipTouchWindow={showZipwhipTouchWindow}
        phoneNumber={textPhoneNumber}
        zipwhipSessionKey={user.zipwhipSessionKey}
        handleClose={() => setShowZipwhipTouchWindow(false)}
        prospectId={prospectToRender.id}
        cadenceToRender={cadenceToRender}
        contactName={prospectToRender.contactName}
      />

      <AssignProspectToCadenceModal
        actionBtnIcon="fas fa-plus"
        actionBtnText="Assign"
        currentUserId={
          queryParams['filter[user][id]']
            ? parseInt(queryParams['filter[user][id]'])
            : currentUserId
        }
        handleShowHideModal={() => {
          setShowAssignPorspectToCadenceModal(false);
        }}
        handleAction={(cadenceId) => {
          const input = {};
          if (
            user &&
            (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
          ) {
            input['user'] = {
              id: selectUserId ? selectUserId : currentUserId,
            };
          }

          assignProspectToCadence({
            variables: {
              prospectId,
              input,
              cadenceId,
            },
          });
        }}
        modalHeader="Assign Prospect to Cadence"
        prospect={prospectToRender}
        showActionBtnSpinner={assignProspectToCadenceLoading}
        showModal={showAssignPorspectToCadenceModal}
        selectedUserName={selectUserId !== currentUserId ? prospectOwner : ''}
        isUserChanged={isUserChanged}
        handleActionResetUserChange={() => {
          setIsUserChanged(false);
        }}
      />
      <AddNote
        showModal={showAddNoteModal}
        setShowModal={setShowAddNoteModal}
        handleSave={(data) => {
          addNotes({
            variables: {
              input: {
                note: data.notes,
                prospect: { id: prospectId },
                attachments: data.attachment,
              },
            },
          });
        }}
        handleUpdate={(data, id) => {
          updateNotes({
            variables: {
              notesId: id,
              input: {
                note: data.notes,
                prospect: { id: prospectId },
                attachments: data.attachment,
              },
            },
          });
        }}
        notesLoading={notesLoading || updateNotesLoading}
        handleCancel={() => setShowAddNoteModal(false)}
        notes={notes}
        attachment={attachment}
        setAttachment={setAttachment}
      />
      <MoveProspectToCadenceModal
        actionBtnIcon="fas fa-arrows-alt"
        actionBtnText="Move"
        currentUserId={
          queryParams['filter[user][id]']
            ? parseInt(queryParams['filter[user][id]'])
            : currentUserId
        }
        handleShowHideModal={() => {
          setShowMoveProspectToCadenceModal(false);
        }}
        handleAction={(id, name) => {
          setShowMoveProspectToCadenceModal(false);
          setShowMoveProspectConfirmModal(true);
          setSelectedCadence({ id, name });
        }}
        modalHeader="Move to Another Cadence"
        prospect={prospectToRender}
        showActionBtnSpinner={moveProspectToCadenceLoading}
        showModal={showMoveProspectToCadenceModal}
        selectedUserName={selectUserId !== currentUserId ? prospectOwner : ''}
        isUserChanged={isUserChanged}
        handleActionResetUserChange={() => {
          setIsUserChanged(false);
        }}
        currentCadenceId={cadenceToRender ? cadenceToRender.id : -1}
      />
      {/* complete touch modal for linkedin touch */}
      <CompleteLinkedInTouchModal
        showLinkedInCompleteTouch={showLinkedInTouchCompleteModal}
        touchInfoDetails={touchInfoDetails}
        handleClose={() => setShowLinkedInTouchCompleteModal(false)}
        handleCompleTouch={handleCompleteSocialOrLinkedInTouch}
        handleNextTouch={() => setTouchInfoDetails({})}
        isRequestLoading={completeTouchLoading}
      />
      {/* complete touch modal for social touch */}
      <CompleteOtherTouchModal
        showCompleteOtherTouch={showSocialTouchCompleteModal}
        touchInfoDetails={touchInfoDetails}
        handleClose={() => setShowSocialTouchCompleteModal(false)}
        handleCompleTouch={handleCompleteSocialOrLinkedInTouch}
        isRequestLoading={completeTouchLoading}
        handleNextTouch={() => setTouchInfoDetails({})}
      />
      {/* Alert modal for email complete touch */}
      <AlertModal
        alertType="error"
        showModal={showEmailTouchCompleteModal}
        handleClose={() => setShowEmailTouchCompleteModal(false)}
      >
        <div>
          Please use email button to send emails or skip touch to skip the
          current touch and move to next touch.
        </div>
      </AlertModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-forward"
        header="Skip Touch"
        confirmBtnText="OK"
        handleCancel={() => {
          setShowSkipTouchToCadenceModal(false);
        }}
        handleConfirm={() => {
          const input = {
            prospectsIds: prospectId + '-' + prospectToRender.currentTouchId,
            cadence: {
              id: cadenceToRender.id,
            },
          };
          if (
            (user && user.isManagerUser === 'Y') ||
            user.isAdminUser === 'Y'
          ) {
            input['userId'] = selectUserId ? selectUserId : currentUserId;
          }
          skipTouch({
            variables: {
              input,
            },
          });
        }}
        showConfirmBtnSpinner={skipTouchLoading}
        showConfirmModal={showSkipTouchToCadenceModal}
      >
        <div>
          <span>
            Are you sure you want to skip the current touch and move this
            prospect to next touch?.
          </span>
          {prospectOwner && selectUserId !== currentUserId && (
            <p>
              <span className="bg-color-yellow">
                Skip Prospect(s) on behalf of <b>{prospectOwner}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-sign-out-alt"
        confirmBtnText="Exit"
        handleCancel={() => {
          setShowExitProspectConfirmModal(false);
        }}
        handleConfirm={() => {
          const input = {};
          if (
            user &&
            (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
          ) {
            input['userId'] = selectUserId;
          }

          exitProspect({
            variables: {
              prospectId,
              input,
            },
          });
        }}
        showConfirmBtnSpinner={exitProspectLoading}
        showConfirmModal={showExitProspectConfirmModal}
      >
        <div>
          <span>
            Are you sure you want to remove this prospect from cadence:{' '}
            {cadenceToRender && <b>{cadenceToRender.name}</b>}?
          </span>
          {selectUserId !== currentUserId && prospectOwner && (
            <p>
              <span className="bg-color-yellow">
                Exit Prospect(s) on behalf of <b>{prospectOwner}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      {/* this confirm modal is used to delete the prospect */}
      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        confirmBtnColor="danger"
        handleCancel={() => setShowDeleteProspectConfirmModal(false)}
        handleConfirm={() => deleteProspect()}
        showConfirmBtnSpinner={deleteProspectLoading}
        showConfirmModal={showDeleteProspectConfirmModal}
      >
        <div>
          <span>Are you sure you want to delete this prospect?</span>
          {currentUserId !== selectUserId && (
            <p>
              <span className="bg-color-yellow">
                Delete Prospect on behalf of <b>{prospectOwner}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      <TransferOwnershipModal
        hideModal={() => {
          setShowTransferOwnershipModal(false);
        }}
        showModal={showTransferOwnershipModal}
        showActionBtnSpinner={transferOwnershipLoading}
        handleAction={handleSaveTransferOwnership}
        responseError={responseError}
        selectedUserId={selectUserId}
        selectedUserName={selectUserId !== currentUserId ? prospectOwner : ''}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText={transferOwnershipLoading ? 'Wait...' : 'OK'}
        handleCancel={() => setShowConfirmTransferOwnershipModal(false)}
        showConfirmModal={showConfirmTransferOwnershipModal}
        handleConfirm={() => {
          const input = transferData;
          transferOwnership({
            variables: {
              input,
              quickSearch: `filter[id]=:[${prospectId}]`,
            },
          });
        }}
        confirmBtnColor="primary"
        showConfirmBtnSpinner={transferOwnershipLoading}
      >
        <span>
          Are you sure you want to transfer <b>1</b> prospect from{' '}
          {fromUserName} to {toUserName}?
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-trash-alt"
        confirmBtnText={deleteNotesLoading ? 'Wait...' : 'Delete'}
        handleCancel={() => {
          setNotes({});
          setShowDeleteNotesConfirmModal(false);
        }}
        showConfirmModal={showDeleteNotesConfirmModal}
        handleConfirm={() => {
          deleteNotes({
            variables: {
              notesId: notes.id,
            },
          });
        }}
        confirmBtnColor="primary"
        showConfirmBtnSpinner={deleteNotesLoading}
      >
        <span>Are you sure you want to delete this notes?</span>
      </ConfirmModal>

      <EmailsModal
        showModal={showEmailModal}
        hideModal={() => setShowEmailModal(false)}
        type={typeOfEmail}
        prospectId={prospectId}
        currentUserId={currentUserId} //logged in user
        currentIndex={1}
        totalCount={prospectToRender?.pendingEmails?.length || 1}
        userId={user.isManagerUser === 'Y' ? selectUserId : 0}
        dropdownUserId={selectUserId ? selectUserId : currentUserId} // selected dropdown user in the relevent parent page
        mailMergeVariables={mailMergeVariables}
        cadenceId={cadenceToRender?.id || -1}
        refetch={() => {
          refreshProspectAndActivity();
        }}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => {
          setShowUnSavedConfirmModal(false);
        }}
        handleConfirm={() => {
          setShowMakeCall({});
          setShowUnSavedConfirmModal(false);
          if (renderNextProspect) {
            handleRenderNextProspect();
          }

          if (renderPrevProspect) {
            handleRenderPrevProspect();
          }
          if (isBackToList) {
            backLinkRef.current.click();
          } else {
            setIsEdit(false);
            editFormRef.current.reset();
          }
        }}
        showConfirmBtnSpinner={exitProspectLoading}
        showConfirmModal={showUnSavedConfirmModal}
      >
        <span>Changes you made may not be saved.</span>
      </ConfirmModal>

      {showMoveProspectConfirmModal && (
        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          header="Move to Another Cadence"
          confirmBtnText="OK"
          handleConfirm={() => {
            setShowMoveProspectConfirmModal(false);
            setSelectedCadence({});
            const input = {};
            if (
              user &&
              (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
            ) {
              input['userId'] = selectUserId;
            }
            moveProspectToCadence({
              variables: {
                prospectId: prospectId,
                cadenceId: selectedCadence.id,
                input,
              },
            });
          }}
          handleCancel={() => {
            setShowMoveProspectConfirmModal(false);
            setSelectedCadence({});
          }}
          showConfirmBtnSpinner={moveProspectToCadenceLoading}
          showConfirmModal={showMoveProspectConfirmModal}
        >
          <span>
            Are you sure you want to move the selected prospect(s) to{' '}
            <b>{selectedCadence && selectedCadence.name}</b>?
          </span>
        </ConfirmModal>
      )}
      <PauseProspectsModal
        hidePauseModal={() => {
          setShowPauseProspectConfirmModal(false);
        }}
        showPauseModal={showPauseProspectConfirmModal}
        handlePauseProspect={(resumeDate) => {
          const input = {
            resumeDate: resumeDate,
          };
          if (
            user &&
            (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
          ) {
            input['userId'] = selectUserId;
          }
          pauseProspect({
            variables: {
              input,
              prospectId,
            },
          });
        }}
        showConfirmBtnSpinner={pauseProspectLoading}
        selectedUserName={selectUserId === currentUserId ? '' : prospectOwner}
      ></PauseProspectsModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-play"
        header="Resume Prospect(s)"
        confirmBtnText="Resume"
        handleConfirm={() => {
          const input = {};
          if (
            user &&
            (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
          ) {
            input['userId'] = selectUserId;
          }
          resumeProspect({
            variables: {
              prospectId,
              input,
            },
          });
        }}
        handleCancel={() => {
          setShowResumeProspectConfirmModal(false);
        }}
        showConfirmBtnSpinner={resumeProspectLoading}
        showConfirmModal={showResumeProspectConfirmModal}
      >
        <div>
          <span>
            Are you sure you want to resume the activity for the selected
            prospect(s) in the cadence?
          </span>
          {selectUserId !== currentUserId && (
            <p>
              <span className="bg-color-yellow">
                Resume Prospect(s) on behalf of <b>{prospectOwner}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      {/* engagement score modal goes here */}
      {showEngagementScoreModal && (
        <EngagementScoreModal
          showModal={showEngagementScoreModal}
          toggleModal={() =>
            setShowEngagementScoreModal(!showEngagementScoreModal)
          }
          engagementScore={engagementScore}
          total={prospectToRender.totalEngagementScore}
        ></EngagementScoreModal>
      )}
    </ContentWrapper>
  );
};
// This is required for redux
const mapStateToProps = (state) => ({
  users: state.users,
});

export default withRouter(connect(mapStateToProps)(ProspectView));
