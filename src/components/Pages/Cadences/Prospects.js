import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import moment from 'moment-timezone';
import { parseUrl } from 'query-string';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
} from 'reactstrap';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { showSuccessMsg, notify, showErrorMessage } from '../../../util/index';
import { default as AlertPopupModal } from '../../Common/AlertPopupModal';
import { default as ClButton } from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import OpenCrmWindow from '../../Common/OpenCrmWindow';
import {
  FETCH_PROSPECTS_QUERY,
  FETCH_SIGNED_KEY_EXPORT_QUERY,
} from '../../queries/CadenceQuery';
import { FETCH_MAIL_MERGE_VARIABLES } from '../../queries/EmailTemplatesQuery';
import {
  ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY,
  EXIT_PAUSE_RESUME_PROSPECT_QUERY,
  FETCH_REMAINING_WAIT_TIME_QUERY,
  SKIP_TOUCH_TO_CADENCE_QUERY,
} from '../../queries/ProspectsQuery';
import UserContext from '../../UserContext';
import { default as MoveProspectToCadenceModal } from '../Prospects/AssignOrMoveProspectToCadenceModal';
import { default as PauseProspectsModal } from '../Prospects/PauseProspectsModal';
import EmailsModal from '../ToDo/EmailsModal';
import CadenceCustomFieldSortingList from './CadenceCustomFieldSortingList';
import CadenceDataGrid from './CadenceDataGrid';
import { timeLeft, getDueDate } from '../../../util/index';

toast.configure();

const Prospects = ({
  location,
  match,
  filters,
  searchInput,
  userIds,
  refetchCount,
  tabName,
  isProspectsAssigned,
}) => {
  let prospectsFilter;
  const prospectActions = {
    DIAL: 'DIAL',
    EMAIL: 'EMAIL',
    RESUME: 'RESUME',
    PAUSE: 'PAUSE',
    MOVE_TO_ANOTHER_CADENCE: 'MOVE_TO_ANOTHER_CADENCE',
    EXIT_CADENCE: 'EXIT_CADENCE',
    MOVE_TO_NEXT_TOUCH: 'MOVE_TO_NEXT_TOUCH',
  };
  const { query: queryParams } = parseUrl(window.location.search);

  const { data: configurationsData } = useConfigurations();
  const org = configurationsData?.configurations?.data[0];
  const cadenceId = match.params['id'];
  const { apiURL } = useContext(ApiUrlAndTokenContext);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const waitTimeRef = useRef();

  if (searchInput) {
    prospectsFilter = `&filter[user][id]=${userIds}&filter[q]=${encodeURIComponent(
      searchInput
    )}`;
  } else {
    prospectsFilter = `&filter[user][id]=${userIds}`;
  }

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const filterState = '&filter[outCome]=' + filters;

  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [skipTouchProspects, setSkipTouchProspects] = useState();
  const [
    showMoveProspectToCadenceModal,
    setShowMoveProspectToCadenceModal,
  ] = useState(false);
  const [
    showMoveProspectConfirmModal,
    setShowMoveProspectConfirmModal,
  ] = useState(false);
  const [currentProspect, setCurrentProspect] = useState({});
  const [
    showResumeProspectConfirmModal,
    setShowResumeProspectConfirmModal,
  ] = useState(false);
  const [
    showPauseProspectConfirmModal,
    setShowPauseProspectConfirmModal,
  ] = useState(false);
  const [
    showExitProspectConfirmModal,
    setShowExitProspectConfirmModal,
  ] = useState(false);
  const [
    showSkipTouchToCadenceModal,
    setShowSkipTouchToCadenceModal,
  ] = useState(false);
  const [selectedCadence, setSelectedCadence] = useState({});
  const [showAlertPopupModal, setShowAlertPopupModal] = useState(false);
  const [popupMessage, setPopupMessage] = useState(
    'Please select at least 1 prospect and try again.'
  );
  const [intermediateCheckedData, setIntermediateCheckedData] = useState([]);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const toggleAction = () => setActionDropdownOpen(!actionDropdownOpen);
  const [sortBy, setSortBy] = useState('lastTouchDateTime');
  const [orderBy, setOrderBy] = useState('desc');

  const [selectedRow, setSelectedRow] = useState([]);
  const [showSendOneOffEmail, setShowSendOneOffEmail] = useState(false);
  const [prospectsResponse, setProspectsResponse] = useState();

  useEffect(() => {
    setOffset(0);
    setCurrentPageIndex(0);
  }, [filters, searchInput]);

  // Fetch prospects data from api-server
  const {
    data: prospectData,
    loading,
    error,
    refetch: refreshProspectsGrid,
  } = useQuery(FETCH_PROSPECTS_QUERY, {
    variables: {
      includeAssociationsQry: 'includeAssociations[]=user',
      id: cadenceId,
      prospectFilter: prospectsFilter,
      tabFilter: filterState,
      limit,
      offset,
      sortBy,
      orderBy,
    },
    onError: (response) => {
      setProspectsResponse(response?.graphQLErrors[0]?.message);
    },
    notifyOnNetworkStatusChange: true,
  });

  //Below useLazyQuery used to show the mailmerge data in Sendoneoff email modal
  const { data: mailMergeVariablesData } = useQuery(
    FETCH_MAIL_MERGE_VARIABLES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
      skip: !showSendOneOffEmail,
    }
  );

  const [
    fetchSignedKeyExport,
    { data: fetchSignedKeyExportData },
  ] = useLazyQuery(FETCH_SIGNED_KEY_EXPORT_QUERY, {
    onCompleted: (response) => {
      if (response?.signedKeyExport?.data[0]?.key) {
        const signedKey = response?.signedKeyExport?.data[0]?.key;
        const link = `${apiURL}public/cadences/export/${signedKey}`;
        const anchor = document.createElement('a');
        document.body.appendChild(anchor);
        anchor.href = link;
        anchor.target = '_blank';
        anchor.download = 'test.csv';
        anchor.click();
        anchor.remove();
      }
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Sorry! Something went wrong. Failed to Export',
        fetchSignedKeyExportData,
        'fetch_signed_key'
      );
    },
  });

  const handleExport = () => {
    fetchSignedKeyExport({
      variables: {
        input: {
          cadence: { id: cadenceId },
          accountName: searchInput !== 'none' ? searchInput : undefined,
          user: [{ id: userIds }],
          outcome: filters.charAt(0).toUpperCase() + filters.slice(1),
          outType: 'CSV',
          touchType: 'Prospect',
          cadenceName: queryParams['cadence[name]'],
          total: totalCount,
        },
      },
    });
  };

  const mailMergeVariables = useMemo(
    () =>
      mailMergeVariablesData &&
      mailMergeVariablesData.mailmergeVariables &&
      mailMergeVariablesData.mailmergeVariables.data
        ? mailMergeVariablesData.mailmergeVariables.data.mail_merge
        : [],
    [mailMergeVariablesData]
  );

  // Get Wait time
  const [fetchWaitTime] = useLazyQuery(FETCH_REMAINING_WAIT_TIME_QUERY, {
    onCompleted: (response) => {
      if (response.prospect.data[0]) {
        waitTimeRef.current.setAttribute(
          'title',
          'Prospect is currently on wait period' +
            (response.prospect.data[0].remainingWaitPeriod
              ? '\nTime Remaining: ' +
                response.prospect.data[0].remainingWaitPeriod
              : '')
        );
      } else {
        waitTimeRef.current.setAttribute(
          'title',
          'Prospect is currently on wait period'
        );
      }
    },
  });

  const getWaitPeriod = (event, pId) => {
    waitTimeRef.current = event.currentTarget;
    fetchWaitTime({
      variables: {
        id: pId,
        userId: currentUserId,
      },
    });
  };

  // Resume prospect request
  const [
    resumeProspect,
    { data: resumeProspectData, loading: resumeProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: {
      action: 'resume',
      input: {},
    },
    onCompleted: (response) =>
      handleResumeProspectRequestCallback(response, true),
    onError: (response) =>
      handleResumeProspectRequestCallback(response, false, resumeProspectData),
  });

  // Pause prospect request
  const [
    pauseProspect,
    { data: pauseProspectData, loading: pauseProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: {
      action: 'pause',
    },
    onCompleted: (response) =>
      handlePauseProspectRequestCallback(response, true),
    onError: (response) =>
      handlePauseProspectRequestCallback(response, false, pauseProspectData),
  });

  // Move prospect to cadence request
  const [
    moveProspectToCadence,
    { data: moveProspectToCadenceData, loading: moveProspectToCadenceLoading },
  ] = useLazyQuery(ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY, {
    variables: {
      action: 'moveToCadence',
    },
    onCompleted: (response) =>
      handleMoveProspectRequestCallback(response, true),
    onError: (response) =>
      handleMoveProspectRequestCallback(
        response,
        false,
        moveProspectToCadenceData
      ),
  });

  // Exit prospect request
  const [
    exitProspect,
    { data: exitProspectData, loading: exitProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: {
      action: 'exit',
      input: {},
    },
    onCompleted: (response) =>
      handleExitProspectRequestCallback(response, true),
    onError: (response) =>
      handleExitProspectRequestCallback(response, false, exitProspectData),
  });
  const [
    skipTouch,
    { data: skipTouchData, loading: skipTouchLoading },
  ] = useLazyQuery(SKIP_TOUCH_TO_CADENCE_QUERY, {
    onCompleted: (response) => handleSkipTouchRequestCallback(response, true),
    onError: (response) =>
      handleSkipTouchRequestCallback(response, false, skipTouchData),
  });
  /* ----- To handle prospect actions -begin ----- */
  const handleRowToolbarButtonAction = (action, prospect) => {
    if (
      (action === prospectActions.PAUSE || action === prospectActions.RESUME) &&
      selectedRow.length > 0 &&
      prospect === undefined
    ) {
      const pauseIds = [];
      // eslint-disable-next-line array-callback-return
      selectedRow.map((item) => {
        if (item.original.campaignName !== null)
          pauseIds.push(item.original.id);
      });

      if (pauseIds.length === 0) {
        setShowAlertPopupModal(true);
        setPopupMessage(
          'This prospect(s) are not assigned to any Cadence. No action will be taken.'
        );
        return;
      }
    }

    if (intermediateCheckedData.length === 0 && prospect === undefined) {
      setShowAlertPopupModal(true);
    } else {
      handleRowToolbarButton(action, prospect);
    }
  };

  const handleRowToolbarButton = (action, prospect) => {
    setCurrentProspect(prospect ? prospect : {});

    switch (action) {
      case prospectActions.RESUME:
        setShowResumeProspectConfirmModal(true);
        break;
      case prospectActions.PAUSE:
        setShowPauseProspectConfirmModal(true);
        break;
      case prospectActions.MOVE_TO_ANOTHER_CADENCE:
        setShowMoveProspectToCadenceModal(true);
        break;
      case prospectActions.EXIT_CADENCE:
        setShowExitProspectConfirmModal(true);
        break;
      case prospectActions.MOVE_TO_NEXT_TOUCH:
        setShowSkipTouchToCadenceModal(true);
        break;
      default:
        setShowSendOneOffEmail(true);
        break;
    }
  };

  const handleResumeProspectRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    setShowResumeProspectConfirmModal(false);
    if (requestSuccess) {
      const resumeCount =
        response.prospect &&
        response.prospect.data &&
        response.prospect.data.filter((item) => item.isResumed === true);
      if (resumeCount?.length === response?.prospect?.data?.length) {
        notify(
          'Success! Prospects have resumed in this Cadence',
          'success',
          'resume_prospect'
        );
      } else {
        notify(
          `${resumeCount?.length} out of ${response?.prospect?.data?.length} Prospects have resumed in this Cadence`,
          'success',
          'resume_prospect'
        );
      }
      refreshProspectsCountAndGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to resume Prospect',
        errorData,
        'resume_prospect'
      );
    }
  };

  const handlePauseProspectRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    setShowPauseProspectConfirmModal(false);
    if (requestSuccess) {
      const pausedCount =
        response.prospect &&
        response.prospect.data &&
        response.prospect.data.filter((item) => item.isPaused === true);
      if (pausedCount?.length === response?.prospect?.data?.length) {
        notify(
          'Success! Prospects have been paused in this Cadence',
          'success',
          'pause_prospect'
        );
      } else {
        notify(
          `${pausedCount?.length} out of ${response?.prospect?.data?.length} Prospects have been paused in this Cadence`,
          'success',
          'pause_prospect'
        );
      }
      refreshProspectsCountAndGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to pause Prospect(s)',
        errorData,
        'pause_prospect'
      );
    }
  };

  const handleMoveProspectRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    setShowMoveProspectToCadenceModal(false);

    if (requestSuccess) {
      if (response?.assignOrMoveProspect?.data) {
        const movedCountList = response.assignOrMoveProspect.data.filter(
          (item) => item.isMoved
        );
        if (
          movedCountList?.length ===
          response?.assignOrMoveProspect?.data?.length
        ) {
          notify(
            'Success! Prospects have been moved in this Cadence',
            'success',
            'move_prospect'
          );
        } else {
          notify(
            `${movedCountList?.length} out of ${response?.assignOrMoveProspect?.data?.length} Prospects have been moved`,
            'success',
            'move_prospect'
          );
        }
      } else {
        showSuccessMsg(response?.assignOrMoveProspect?.requestId);
        refreshProspectsCountAndGrid();
      }
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to move Prospects',
        errorData,
        'move_prospect'
      );
    }
  };

  const handleExitProspectRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    setShowExitProspectConfirmModal(false);

    if (requestSuccess) {
      if (response?.prospect?.data) {
        const exitCountList = response.prospect.data.filter(
          (item) => item.isExit === true
        );
        if (exitCountList?.length === response?.prospect?.data?.length) {
          notify(
            'Success! Prospects have exited this cadence',
            'success',
            'exit_prospect'
          );
        } else {
          notify(
            `${exitCountList?.length} out of ${response?.prospect?.data?.length} Prospects have exited`,
            'success',
            'exit_prospect'
          );
        }
      } else {
        showSuccessMsg(response?.prospect?.requestId);
        refreshProspectsCountAndGrid();
      }
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to exit prospects',
        errorData,
        'exit_prospect'
      );
    }
  };

  const handleSkipTouchRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    setShowSkipTouchToCadenceModal(false);
    if (requestSuccess) {
      notify(
        'Success! Prospects have been moved to next Touch.',
        'success',
        'skip_touch'
      );
      refreshProspectsCountAndGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to push Prospects to next Touch',
        errorData,
        'skip_touch'
      );
    }
  };

  // Refresh Prospects count on Tabs and grid
  const refreshProspectsCountAndGrid = () => {
    setSelectedRow([]);
    setIntermediateCheckedData([]);

    refreshProspectsGrid();
    refetchCount();
  };

  useEffect(() => {
    if (tabName === 'prospect') {
      refreshProspectsCountAndGrid();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProspectsAssigned]);
  const getTouchIcons = (touch, extraClass, removeColor) => {
    let className;
    switch (touch) {
      case 'EMAIL':
        className = removeColor
          ? `fas fa-envelope ${extraClass}`
          : `fas fa-envelope ${extraClass} text-muted`;
        break;
      case 'SOCIAL':
        className = removeColor
          ? `fas fa-share-alt ${extraClass}`
          : `fas fa-share-alt ${extraClass} text-muted`;
        break;
      case 'CALL':
        className = removeColor
          ? `fas fa-phone-alt  ${extraClass}`
          : `fas fa-phone-alt ${extraClass} text-muted`;
        break;
      case 'LINKEDIN':
        className = removeColor
          ? `fab fa-linkedin-in ${extraClass}`
          : `fab fa-linkedin-in ${extraClass} text-muted`;
        break;
      default:
        className = removeColor
          ? `fas fa-comments ${extraClass}`
          : `fas fa-comments ${extraClass} text-muted`;
        break;
    }

    return <em className={className}></em>;
  };

  const filterParams = prospectsFilter.startsWith('&')
    ? prospectsFilter.slice(1, prospectsFilter.length)
    : prospectsFilter;
  const prospectSearchUrl = `${filterParams}&filter[outCome]=${filters}&page[limit]=${limit}&page[offset]=${offset}&sort[${sortBy}]=${orderBy}`;
  const ProspectsDatacolumns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'contactName',
        width: '17%',
        Cell: function (props) {
          const isDeletedProspect = props.row.original.isMemberDeleted;
          const currentTimeZone = moment.tz.guess();
          const pausedDatetime = moment
            .tz(props.row.original.pausedDatetime, currentTimeZone)
            .format('MM/DD/YYYY hh:mm A');
          return (
            <span>
              {isDeletedProspect ? (
                <>
                  <span title={props.value}>{props.value}</span>{' '}
                  <i
                    className="fas fa-times fa-sm text-danger ml-2"
                    hidden={!isDeletedProspect}
                    title="Deleted Prospect"
                  ></i>
                </>
              ) : (
                <>
                  {props.row.original.crmId &&
                    !props.row.original.crmId.startsWith('crmgenkey_') &&
                    org.crmType !== 'standalone' && (
                      <span
                        className="pointer"
                        onClick={() => {
                          handleOpenCrmWindow(
                            props.row.original.crmId,
                            props.row.original.recordType
                          );
                        }}
                      >
                        <i
                          className="fas fa-arrow-up mr-2 text-success"
                          style={{ transform: 'rotate(45deg)' }}
                        ></i>
                      </span>
                    )}
                  <Link
                    title={`Click to view the prospect ${props.value}`}
                    to={{
                      pathname: `/prospects/list/${props.row.original.id}?${prospectSearchUrl}`,
                      state: {
                        searchString: location.search,
                        allProspectsData: props.prospectData,
                        origin: location.pathname,
                        prospect: props.row.original,
                        cadenceName: queryParams['cadence[name]'],
                        rowIndex: props.row.index,
                        touchcount: queryParams['not'],
                        cadenceId,
                      },
                    }}
                    className="text-break"
                  >
                    {props.value && props.value.length > 30
                      ? props.value.slice(0, 29) + '..'
                      : props.value}
                  </Link>
                  <i
                    className="fas fa-ban fa-sm text-danger ml-2"
                    hidden={
                      props.row.original.optoutFlag === false ||
                      props.row.original.optoutFlag === 'f'
                    }
                    title="Opted out"
                  ></i>
                  <i
                    className="fas fa-pause fa-sm text-danger ml-2"
                    hidden={props.row.original.prospectStatus !== 'SUSPEND'}
                    title={`Prospect was paused on ${pausedDatetime}`}
                  ></i>{' '}
                </>
              )}
              <br></br>
              <Link
                to={{
                  pathname:
                    '/accounts/' +
                    props.row.original.associations.account[0].id,
                  search: location.search,
                  state: {
                    origin: location.pathname,
                    searchString: location.search,
                    cadenceName: location.state && location.state.cadenceName,
                    touchcount: location.state && location.state.touchcount,
                    outcomeBucket: filters,
                  },
                }}
              >
                <small title={props.row.original.accountName}>
                  {props.row.original.accountName &&
                  props.row.original.accountName.length > 30
                    ? props.row.original.accountName.slice(0, 29) + '..'
                    : props.row.original.accountName}
                </small>
              </Link>
            </span>
          );
        },
      },
      {
        Header: 'Email',
        accessor: 'email',
        width: '18%',
        Cell: function (props) {
          return <span className="text-break">{props.value}</span>;
        },
      },
      {
        Header: 'Owner',
        accessor: 'owner',
        width: '7%',
        textAlign: 'center',
        Cell: function (props) {
          const rowData = props.row.original;
          let owner;
          if (
            rowData?.associations?.user &&
            props?.prospectData?.prospects?.includedAssociations?.user
          ) {
            owner = props.prospectData.prospects.includedAssociations.user.find(
              (item) => item.id === rowData.associations.user[0].id
            );
          }

          const ownerName = owner?.name?.split(' ');
          return (
            <span className="fa-stack" title={owner?.name}>
              {ownerName?.length > 0 && (
                <>
                  <i className="fas fa-circle fa-stack-2x thin-circle"></i>
                  <span className="fa-stack-1x">
                    <small>
                      {ownerName[0]?.charAt(0)?.toUpperCase()}
                      {ownerName[1]?.charAt(0)?.toUpperCase()}
                    </small>
                  </span>
                </>
              )}
            </span>
          );
        },
      },
      {
        Header: ['fall Through', 'exited', 'completed'].includes(filters)
          ? 'Touch'
          : 'Current Touch',
        accessor: 'currentTouchId',
        width: '15%',
        Cell: function (props) {
          const rowData = props.row.original;
          const isDeletedProspect = props.row.original.isMemberDeleted;
          if (rowData) {
            return (
              <span>
                {isDeletedProspect ||
                props.row.original.touchType === null ||
                props.row.original.stepNo === null ? (
                  <span title={'N/A'}>N/A</span>
                ) : (
                  <>
                    <span className="mr-2">
                      {getTouchIcons(rowData.touchType, ' fa-sm')}
                    </span>
                    <span>{`Touch ${rowData.stepNo} (${rowData.touchType})`}</span>
                  </>
                )}
                {!(
                  isDeletedProspect || props.row.original.touchType === null
                ) &&
                  rowData.currentTouchStatus === 'SCHEDULED_WAIT' && (
                    <i
                      title="Prospect is currently under Wait Period."
                      className="fas fa-clock fa-sm text-muted ml-2"
                      onMouseEnter={(e) => {
                        getWaitPeriod(e, rowData.id);
                      }}
                    ></i>
                  )}
              </span>
            );
          } else {
            return <span></span>;
          }
        },
      },
      {
        Header: 'Due',
        accessor: 'dueAt',
        width: '12%',
        Cell: function (props) {
          const due = props.value
            ? getDueDate(timeLeft(moment, props.value))
            : '';
          return <span className="text-break">{due}</span>;
        },
      },
      {
        Header: 'Last Outcome',
        accessor: 'outCome',
        width: '8%',
        Cell: function (props) {
          return (
            <span className="text-break">
              {props.row.original.outcome
                ? props.row.original.outcome.replaceAll('Other', 'Social')
                : 'N/A'}
            </span>
          );
        },
      },
      {
        Header: 'Last Activity',
        accessor: ['total', 'active', 'paused'].includes(filters)
          ? 'lastTouchDateTime'
          : 'lastActivityDatetime',
        width: '23%',
        Cell: function (props) {
          const modifiedDateTime = props.value && props.value;
          const currentTimeZone = moment.tz.guess();
          const updatedDateTime = moment
            .tz(modifiedDateTime, currentTimeZone)
            .format('M/D/YYYY h:mm A');
          return <span>{modifiedDateTime ? updatedDateTime : 'N/A'}</span>;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname, location.search, prospectSearchUrl, filters, cadenceId]
  );

  const gridData = useMemo(
    () =>
      prospectData && prospectData.prospects ? prospectData.prospects.data : [],
    [prospectData]
  );

  useEffect(
    () => {
      setPageCount(
        !loading && prospectData?.prospects?.paging
          ? Math.ceil(prospectData.prospects.paging.totalCount / limit)
          : 0
      );
      setTotalCount(
        !loading && prospectData?.prospects?.paging
          ? prospectData.prospects.paging.totalCount
          : 0
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridData]
  );

  const handleIntermediateCheck = (selectedRow) => {
    // eslint-disable-next-line @typescript-eslint/no-array-constructor
    const ids = [];
    const skipTouchIds = [];
    setSelectedRow(selectedRow);

    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((rowData) => {
        const skipProspect = `${rowData.original.id}-${rowData.original.currentTouchId}`;
        ids.push(rowData.original.id);
        skipTouchIds.push(skipProspect);
      });
    }
    setIntermediateCheckedData(ids);
    setSkipTouchProspects(skipTouchIds);
  };
  const handleOpenCrmWindow = (crmId, recordType) => {
    OpenCrmWindow(org, crmId, recordType);
  };

  return (
    <div>
      <InputGroup className="justify-content-end ml-auto py-2 pr-3">
        <ClButton
          icon="fas fa-file-csv"
          className="mr-2"
          title="Export to CSV"
          onClick={() => {
            handleExport();
          }}
        >
          Export to CSV
        </ClButton>
        <ButtonDropdown
          className="mr-2"
          isOpen={actionDropdownOpen}
          toggle={toggleAction}
          hidden={
            !(
              filters.toLowerCase() === 'active' ||
              filters.toLowerCase() === 'paused' ||
              'fall Through' === filters
            )
          }
        >
          <DropdownToggle caret disabled={currentUserId !== userIds}>
            Action
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem
              onClick={() =>
                handleRowToolbarButtonAction(
                  prospectActions.MOVE_TO_ANOTHER_CADENCE
                )
              }
            >
              <i className="fas fa-arrows-alt text-info mr-2"></i>
              {`Move to ${'fall Through' !== filters ? 'another ' : ''}Cadence`}
            </DropdownItem>
            <DropdownItem
              hidden={'fall Through' === filters}
              onClick={() =>
                handleRowToolbarButtonAction(prospectActions.MOVE_TO_NEXT_TOUCH)
              }
            >
              <i className="fas fa-forward text-blue mr-2"></i>
              Move to next touch
            </DropdownItem>
            <DropdownItem
              hidden={'fall Through' === filters}
              onClick={() =>
                handleRowToolbarButtonAction(prospectActions.EXIT_CADENCE)
              }
            >
              <i className="fas fa-sign-out-alt text-danger mr-2"></i>
              Exit
            </DropdownItem>
            <DropdownItem
              hidden={filters.toLowerCase() === 'active' ? false : true}
              onClick={() =>
                handleRowToolbarButtonAction(prospectActions.PAUSE)
              }
            >
              <i className="fas fa-pause text-muted mr-2"></i>
              Pause
            </DropdownItem>
            <DropdownItem
              hidden={filters.toLowerCase() === 'paused' ? false : true}
              onClick={() =>
                handleRowToolbarButtonAction(prospectActions.RESUME)
              }
            >
              <i className="fas fa-play text-primary mr-2"></i>
              Resume
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        <CadenceCustomFieldSortingList
          sortBy={sortBy}
          orderBy={orderBy}
          setSortBy={setSortBy}
          setOrderBy={setOrderBy}
        />
      </InputGroup>
      <CadenceDataGrid
        columns={ProspectsDatacolumns}
        data={gridData}
        prospectData={prospectData}
        fetchData={({ pageIndex, pageSize }) => {
          setOffset(pageIndex);
          setCurrentPageIndex(pageIndex);
          setLimit(pageSize);
        }}
        loading={loading}
        pageSize={limit}
        sortBy={sortBy}
        orderBy={orderBy}
        pageCount={pageCount}
        totalCount={totalCount}
        error={error}
        currentPageIndex={currentPageIndex}
        prospectActions={prospectActions}
        handleRowToolbarButton={handleRowToolbarButtonAction}
        tabName={filters}
        handleRefresh={refreshProspectsGrid}
        handleIntermediateCheck={handleIntermediateCheck}
        handleSortBy={(column, order) => {
          setSortBy(column);
          setOrderBy(order);
        }}
        prospectSearchUrl={prospectSearchUrl}
        cadenceName={queryParams['cadence[name]']}
        cadenceId={cadenceId}
        touchcount={queryParams['not']}
        prospectsResponse={prospectsResponse}
      />
      {showMoveProspectToCadenceModal && (
        <MoveProspectToCadenceModal
          actionBtnIcon="fas fa-arrows-alt"
          actionBtnText="Move"
          currentUserId={currentUserId}
          handleShowHideModal={() => {
            setShowMoveProspectToCadenceModal(false);
          }}
          handleAction={(id, name) => {
            setShowMoveProspectToCadenceModal(false);
            setShowMoveProspectConfirmModal(true);
            setSelectedCadence({ id, name });
          }}
          modalHeader="Move Prospect to Cadence"
          prospect={currentProspect}
          showActionBtnSpinner={moveProspectToCadenceLoading}
          showModal={showMoveProspectToCadenceModal}
          showCurrentCadence={'fall Through' === filters}
          currentCadenceId={parseInt(cadenceId)}
        />
      )}
      {selectedCadence && (
        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          header="Move to Another Cadence"
          confirmBtnText="OK"
          handleConfirm={() => {
            setShowMoveProspectConfirmModal(false);
            setSelectedCadence({});
            const input = {};
            moveProspectToCadence({
              variables: {
                prospectId:
                  intermediateCheckedData.length > 0
                    ? intermediateCheckedData.join(',')
                    : currentProspect.id,
                cadenceId: selectedCadence.id,
                input,
              },
            });
          }}
          handleCancel={() => {
            setShowMoveProspectConfirmModal(false);
          }}
          showConfirmBtnSpinner={moveProspectToCadenceLoading}
          showConfirmModal={showMoveProspectConfirmModal}
        >
          <div>
            <span>
              Are you sure you want to move the selected prospect(s) to{' '}
              <b>{selectedCadence.name}</b>?
            </span>
          </div>
        </ConfirmModal>
      )}

      <AlertPopupModal
        alertBtnText="OK"
        alertBtnIcon="fas fa-check"
        handleClose={() => setShowAlertPopupModal(false)}
        showAlertPopupModal={showAlertPopupModal}
      >
        <span>{popupMessage}</span>
      </AlertPopupModal>
      <PauseProspectsModal
        hidePauseModal={() => {
          setShowPauseProspectConfirmModal(false);
        }}
        showPauseModal={showPauseProspectConfirmModal}
        handlePauseProspect={(resumeDate) =>
          pauseProspect({
            variables: {
              input: {
                resumeDate: resumeDate,
              },
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
            },
          })
        }
        showConfirmBtnSpinner={pauseProspectLoading}
      ></PauseProspectsModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-play"
        confirmBtnText="Resume"
        handleConfirm={() =>
          resumeProspect({
            variables: {
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
            },
          })
        }
        handleCancel={() => {
          setShowResumeProspectConfirmModal(false);
        }}
        showConfirmBtnSpinner={resumeProspectLoading}
        showConfirmModal={showResumeProspectConfirmModal}
      >
        {currentProspect &&
        currentProspect.contactName &&
        intermediateCheckedData.length > 1 ? (
          <span>
            Are you sure you want to resume the activity for{' '}
            <b>{currentProspect.contactName}</b>
          </span>
        ) : (
          <span>
            Are you sure you want to resume the activity for the selected
            prospect(s) in the cadence?
          </span>
        )}
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-sign-out-alt"
        confirmBtnText="Exit"
        header="Remove Prospects From Cadence"
        handleCancel={() => {
          setShowExitProspectConfirmModal(false);
        }}
        handleConfirm={() => {
          exitProspect({
            variables: {
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
            },
          });
        }}
        showConfirmBtnSpinner={exitProspectLoading}
        showConfirmModal={showExitProspectConfirmModal}
      >
        <span>
          Are you sure you want to remove the selected prospect(s) from the
          assigned cadence?
        </span>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-forward"
        header="Move to Next Touch"
        confirmBtnText="OK"
        handleCancel={() => {
          setShowSkipTouchToCadenceModal(false);
        }}
        handleConfirm={() => {
          skipTouch({
            variables: {
              input: {
                prospectsIds:
                  skipTouchProspects.length > 0
                    ? skipTouchProspects.join(',')
                    : currentProspect.id + '-' + currentProspect.currentTouchId,
                cadence: {
                  id: cadenceId,
                },
              },
            },
          });
        }}
        showConfirmBtnSpinner={skipTouchLoading}
        showConfirmModal={showSkipTouchToCadenceModal}
      >
        <span>
          Are you sure you want to skip the current touch and move this prospect
          to next touch?.
        </span>
      </ConfirmModal>
      <EmailsModal
        showModal={showSendOneOffEmail}
        hideModal={() => setShowSendOneOffEmail(false)}
        type="sendOneOff"
        prospectId={currentProspect.id}
        currentUserId={currentUserId} //logged in user
        userId={user.isManagerUser === 'Y' ? currentUserId : 0} // if manager pass user id as 0 otherwise pass userid
        dropdownUserId={currentUserId} // selected dropdown user in the relevent parent page
        mailMergeVariables={mailMergeVariables}
      />
    </div>
  );
};

export default Prospects;
