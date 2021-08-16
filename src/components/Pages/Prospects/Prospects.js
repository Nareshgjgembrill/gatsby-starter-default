/**
 * @author Anbarasanr
 * @version V11.0
 */

import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ContentWrapper } from '@nextaction/components';
import moment from 'moment-timezone';
import { parseUrl } from 'query-string';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Badge,
  Button,
  ButtonDropdown,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
  InputGroupAddon,
  Row,
} from 'reactstrap';
import validator from 'validator';
import { changeSetting } from '../../../store/actions/actions';
import {
  formateDateTime,
  showErrorMessage,
  showSuccessMsg,
} from '../../../util/index';
import { default as AlertPopupModal } from '../../Common/AlertPopupModal';
import { default as ClButton } from '../../Common/Button';
import ConfirmExportModal from '../../Common/ConfirmExportModal';
import ConfirmModal from '../../Common/ConfirmModal';
//Todo - Search filter dropdown
import DropDown from '../../Common/DropDown';
import FilterButton from '../../Common/FilterButton';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import useFieldsData from '../../Common/hooks/useFieldsData';
import OpenCrmWindow from '../../Common/OpenCrmWindow';
import PageHeader from '../../Common/PageHeader';
import ProspectsSortByFieldsDropdown from '../../Common/ProspectsSortByFieldsDropdown';
import SearchBar from '../../Common/SearchBar';
import { FETCH_MAIL_MERGE_VARIABLES } from '../../queries/EmailTemplatesQuery';
import { GET_LOOKUP_VALUE_QUERY } from '../../queries/PendingCallsQuery';
import FETCH_PROSPECTS_QUERY, {
  ASSIGN_ALL_PROSPECTS_QUERY,
  ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY,
  CREATE_PROSPECT_QUERY,
  DELETE_ALL_PROSPECTS_QUERY,
  DELETE_FILTTERS,
  DELETE_PROSPECTS_QUERY,
  EXIT_PAUSE_RESUME_PROSPECT_QUERY,
  FETCH_PROSPECTS_COUNT_QUERY,
  FETCH_REMAINING_WAIT_TIME_QUERY,
  FETCH_SIGNED_KEY_EXPORT_QUERY,
  GET_ALL_FILTER_CRITERIAS,
  GET_FILTER_CRITERIAS,
  PROSPECTS_TRANSFER_OWNERSHIP,
  SKIP_TOUCH_TO_CADENCE_QUERY,
  TAG_PROSPECT_QUERY,
  UPLOAD_PROSPECT_QUERY,
} from '../../queries/ProspectsQuery';
import { FETCH_ASSIGNED_USERS_QUERY } from '../../queries/TeamsQuery';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import UserContext from '../../UserContext';
import TransferOwnershipModal from './TransferOwnershipModal';
import EmailsModal from '../ToDo/EmailsModal';
import AddProspectModal from './AddProspectModal';
import {
  default as AssignProspectToCadenceModal,
  default as MoveProspectToCadenceModal,
} from './AssignOrMoveProspectToCadenceModal';
import CreateFilterModal from './CreateFilterModal';
import ImportCrmModal from './ImportCrmModal';
import ImportCsvModal from './ImportCsvModal';
import { default as PauseProspectsModal } from './PauseProspectsModal';
import ProspectsGrid from './ProspectsGrid';
import TagProspectModal from './TagProspectModal';

toast.configure();

const Prospects = ({ location, pinnedFilterButton, changeSetting }) => {
  const { query: searchParams } = parseUrl(window.location.search);
  const { apiURL } = useContext(ApiUrlAndTokenContext);
  const {
    data: configurationsData,
    error: configurationsError,
  } = useConfigurations();
  const { data: fieldsData } = useFieldsData();
  const org = configurationsData?.configurations?.data[0];
  const prospectActions = {
    DIAL: 'DIAL',
    EMAIL: 'EMAIL',
    ASSIGN_TO_CADENCE: 'ASSIGN_TO_CADENCE',
    ASSIGN_ALL_TO_CADENCE: 'ASSIGN_ALL_TO_CADENCE',
    TAG: 'TAG',
    RESUME: 'RESUME',
    PAUSE: 'PAUSE',
    MOVE_TO_ANOTHER_CADENCE: 'MOVE_TO_ANOTHER_CADENCE',
    EXIT_CADENCE: 'EXIT_CADENCE',
    DELETE: 'DELETE',
    SKIP_TOUCH: 'SKIP_TOUCH',
    EXPORT: 'EXPORT',
    TRANSFER_PROSPECTS: 'TRANSFER_PROSPECTS',
    UPLOAD: 'UPLOAD',
  };
  const filterButtons = [
    'all',
    'active',
    'paused',
    'unassigned',
    'neverAssigned',
  ];
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [searchInput, setSearchInput] = useState(
    searchParams['filter[q]'] ? searchParams['filter[q]'] : ''
  );
  const [selectedUserId, setSelectedUserId] = useState(
    searchParams['filter[user][id]']
      ? parseInt(searchParams['filter[user][id]'])
      : currentUserId
  );
  const selectedUserIdRef = React.useRef(selectedUserId);
  const [isUserChanged, setIsUserChanged] = useState(false);
  const [isRefreshTagList, setIsRefreshTagList] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState();
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [filterId, setFilterId] = useState(
    searchParams['filter[filterCriteriaId]'] &&
      parseInt(searchParams['filter[filterCriteriaId]'])
  );
  const filterRef = React.useRef(filterId);
  const [filterUserId, setFilterUserId] = useState();
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [pageCount, setPageCount] = useState(0);
  const [totalProspectCount, setTotalProspectCount] = useState(0);
  const [limit, setLimit] = useState(
    searchParams['page[limit]']
      ? parseInt(searchParams['page[limit]']) === 1
        ? 10
        : searchParams['page[limit]']
      : 10
  );

  const [importDropdownOpen, setImportDropdownOpen] = useState(false);

  const importDropdownToggle = () => setImportDropdownOpen(!importDropdownOpen);
  // export CSV fields
  const [selectedProspectsData, setSelectedProspectsData] = useState();

  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [activeTab, setActiveTab] = useState(
    filterButtons.indexOf(searchParams['filter[status]']) > -1
      ? searchParams['filter[status]']
      : filterButtons.indexOf(pinnedFilterButton) > -1
      ? pinnedFilterButton
      : filterButtons[0]
  );
  const [showAddPorspectModal, setShowAddPorspectModal] = useState(false);
  const [
    showAssignPorspectToCadenceModal,
    setShowAssignPorspectToCadenceModal,
  ] = useState(false);
  const [showTagProspectModal, setShowTagProspectModal] = useState(false);
  const [
    showMoveProspectToCadenceModal,
    setShowMoveProspectToCadenceModal,
  ] = useState(false);
  const [
    showMoveProspectConfirmModal,
    setShowMoveProspectConfirmModal,
  ] = useState(false);
  const [
    showSkipTouchToCadenceModal,
    setShowSkipTouchToCadenceModal,
  ] = useState(false);
  const [selectedCadence, setSelectedCadence] = useState({});
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
    showDeleteProspectConfirmModal,
    setShowDeleteProspectConfirmModal,
  ] = useState(false);
  const [
    showExportProspectConfirmModal,
    setShowExportProspectConfirmModal,
  ] = useState(false);
  const [showConfirmExportModal, setShowConfirmExportModal] = useState(false);
  const [showTagConfirmModal, setShowTagConfirmModal] = useState(false);
  const [showAlertPopupModal, setShowAlertPopupModal] = useState(false);
  const [action, setAction] = useState();
  const [
    showPauseProspectPopupModal,
    setShowPauseProspectPopupModal,
  ] = useState(false);
  const [pausePopupMessage, setPausePopupMessage] = useState();
  const popupMessage = 'Please select at least 1 prospect and try again.';
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({});
  const [filterList, setFilterList] = useState([]);
  const [intermediateCheckedData, setIntermediateCheckedData] = useState([]);

  const urlReqParmater = Object.entries({
    ...searchParams,
  }).filter(([key]) => key.startsWith('sort'));

  let sortByUrlParam;
  let orderByUrlParam;
  if (urlReqParmater && urlReqParmater.length > 0) {
    sortByUrlParam = urlReqParmater[0][0].slice(
      5,
      urlReqParmater[0][0].length - 1
    );
    sortByUrlParam = sortByUrlParam.startsWith('cadence')
      ? 'cadence'
      : sortByUrlParam.startsWith('email')
      ? 'email'
      : sortByUrlParam;
    orderByUrlParam = urlReqParmater[0][1] || '';
  }

  const [sortBy, setSortBy] = useState(sortByUrlParam || 'contactName');
  const [orderBy, setOrderBy] = useState(orderByUrlParam || 'asc');
  const tableSortingValues = [
    'contactName',
    'campaignName',
    'emailId',
    'lastEmailOutcome',
    'lastTouchDateTime',
    'lastTalkerCallOutcome',
  ];

  const waitTimeRef = useRef();
  let searchString;
  if (location.isBackToList === true || sortBy === 'cadence') {
    searchString = Object.entries({ ...searchParams })
      .filter(
        ([key]) => !key.startsWith('page') && !key.startsWith('filter[outCome]')
      )
      .map(([key, val]) =>
        key.startsWith('filter[q]')
          ? `${key}=${encodeURIComponent(val)}`
          : `${key}=${val}`
      )
      .join('&');
  }
  const [prospectsFilter, setProspectsFilter] = useState(
    searchString
      ? '&' + searchString
      : `&sort[${sortBy}]=${orderBy}&filter[user][id]=${
          selectedUserIdRef.current
        }&filter[status]=${activeTab}${
          searchInput ? '&filter[q]=' + encodeURIComponent(searchInput) : ''
        }${
          filterId && filterId !== ''
            ? `&filter[filterCriteriaId]=${filterId}`
            : ''
        }`
  );
  const [sharedWithUsers, setSharedWithUsers] = useState([]);
  const [userList, setUserList] = useState([]);

  const [gridData, setGridData] = useState([]);
  const [selectedRow, setSelectedRow] = useState([]);
  const [showSendOneOffEmail, setShowSendOneOffEmail] = useState(false);
  const [showScheduleConfirmModal, setShowScheduleConfirmModal] = useState(
    false
  );
  const [scheduledCadence, setScheduledCadence] = useState(0);
  const [scheduledCadenceName, setScheduledCadenceName] = useState();
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [showAssignAll, setShowAssignAll] = useState(false);
  const [assignAllCadence, setAssignAllCadence] = useState(false);
  const [showDeleteAllConfirmModal, setShowDeleteAllConfirmModal] = useState(
    false
  );
  const [showDeleteLimitConfirm, setShowDeleteLimitConfirm] = useState(false);
  const history = useHistory();

  const criteria = [
    {
      id: '',
      field: { id: '', controlType: 'text' },
      operator: '',
      criteriaValue: '',
    },
    {
      id: '',
      field: { id: '', controlType: 'text' },
      operator: '',
      criteriaValue: '',
    },
    {
      id: '',
      field: { id: '', controlType: 'text' },
      operator: '',
      criteriaValue: '',
    },
  ];
  const newCriteria = {
    id: '',
    field: { id: '', controlType: 'text' },
    operator: '',
    criteriaValue: '',
  };
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const toggleAction = () => setActionDropdownOpen(!actionDropdownOpen);
  const [showImportCrmModal, setShowImportCrmModal] = useState(false);
  const [tagIds, setTagIds] = useState();
  const [tagLabel, setTagLabel] = useState();
  const [showTransferOwnershipModal, setShowTransferOwnershipModal] = useState(
    false
  );
  const [
    showConfirmTransferOwnershipModal,
    setShowConfirmTransferOwnershipModal,
  ] = useState(false);
  const [showConfirmUploadModal, setShowConfirmUploadModal] = useState(false);
  const [responseError] = useState();
  const [transferData, setTransferData] = useState();
  const [fromUserName, setFromUserName] = useState();
  const [toUserName, setToUserName] = useState();
  // Fetch prospects data from api-server
  const {
    data: prospectData,
    loading,
    error,
    refetch: refreshProspectsGrid,
  } = useQuery(FETCH_PROSPECTS_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=cadence&includeAssociations[]=touch&includeAssociations[]=tag&includeAssociations[]=user',
      prospectFilter: prospectsFilter,
      limit,
      offset,
      fetchPolicy: 'cache-first',
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => handleProspectsRequestCallback(response, true),
    onError: (response) => handleProspectsRequestCallback(response),
  });

  const handleProspectsRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      setGridData(response.prospects.data);
    }
  };

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
    });
  };

  // prospect metric count fields
  const [allTabCount, setAllTabCount] = useState(null);
  const [activeTabCount, setActiveTabCount] = useState(null);
  const [pausedTabCount, setPausedTabCount] = useState(null);
  const [unAssignedTabCount, setUnAssignedTabCount] = useState(null);
  const [neverAssignedTabCount, setNeverAssignedTabCount] = useState(null);
  const [
    fetchProspectsCount,
    {
      data: prospectsCountData,
      loading: prospectsCountLoading,
      error: prospectsCountError,
    },
  ] = useLazyQuery(FETCH_PROSPECTS_COUNT_QUERY, {
    variables: {
      userId: selectedUserId,
    },
    onCompleted: (response) =>
      handleProspectsCountRequestCallback(response, true),
    onError: (response) => handleProspectsCountRequestCallback(response),
  });

  const handleProspectsCountRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (response) {
        setAllTabCount(response?.prospects?.data[0]?.all || 0);
        setActiveTabCount(response?.prospects?.data[0]?.active || 0);
        setPausedTabCount(response?.prospects?.data[0]?.paused || 0);
        setUnAssignedTabCount(response?.prospects?.data[0]?.unassigned || 0);
        setNeverAssignedTabCount(
          response?.prospects?.data[0]?.neverAssigned || 0
        );
      }
    } else {
      showErrorMessage(
        response,
        'Failed to fetch count for prospect(s)',
        prospectsCountData,
        'count_for_prospects'
      );
    }
  };

  // Add prospect to cadence request
  const [
    addProspect,
    { data: addProspectData, loading: addProspectLoading },
  ] = useLazyQuery(CREATE_PROSPECT_QUERY, {
    onCompleted: (response) => handleAddProspectRequestCallback(response, true),
    onError: (response) => handleAddProspectRequestCallback(response),
  });

  // Assign prospect to cadence request
  const [
    assignProspectToCadence,
    { data: assignedData, loading: assignProspectToCadenceLoading },
  ] = useLazyQuery(ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY, {
    variables: { action: 'assignToCadence' },
    onCompleted: (response) =>
      handleAssignProspectRequestCallback(response, true),
    onError: (response) => handleAssignProspectRequestCallback(response),
  });

  // Tag prospect request
  const [
    tagProspect,
    { data: tagData, loading: tagProspectLoading },
  ] = useLazyQuery(TAG_PROSPECT_QUERY, {
    onCompleted: (response) => handleTagProspectRequestCallback(response, true),
    onError: (response) => handleTagProspectRequestCallback(response),
  });

  // Resume prospect request
  const [
    resumeProspect,
    { data: resumeProspectData, loading: resumeProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: { action: 'resume', input: {} },
    onCompleted: (response) =>
      handleResumeProspectRequestCallback(response, true),
    onError: (response) => handleResumeProspectRequestCallback(response),
  });

  // Pause prospect request
  const [
    pauseProspect,
    { data: pauseProspectData, loading: pauseProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: { action: 'pause' },
    onCompleted: (response) =>
      handlePauseProspectRequestCallback(response, true),
    onError: (response) => handlePauseProspectRequestCallback(response),
  });

  // Move prospect to cadence request
  const [
    moveProspectToCadence,
    { data: moveProspectsData, loading: moveProspectToCadenceLoading },
  ] = useLazyQuery(ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY, {
    variables: { action: 'moveToCadence' },
    onCompleted: (response) =>
      handleMoveProspectRequestCallback(response, true),
    onError: (response) => handleMoveProspectRequestCallback(response),
  });

  // Exit prospect request
  const [
    exitProspect,
    { data: exitProspectData, loading: exitProspectLoading },
  ] = useLazyQuery(EXIT_PAUSE_RESUME_PROSPECT_QUERY, {
    variables: {
      action: 'exit',
      input: { userId: selectedUserIdRef.current },
    },
    onCompleted: (response) =>
      handleExitProspectRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Exit prospct(s) from the cadence failed.',
        exitProspectData,
        'exit_cadence'
      );
    },
  });

  // upload prospect to my session request
  const [
    uploadProspect,
    { data: uploadProspectsData, loading: uploadProspectsLoading },
  ] = useLazyQuery(UPLOAD_PROSPECT_QUERY, {
    variables: {
      action: 'upload',
    },
    onCompleted: (response) =>
      handleUploadProspectRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Upload prospct(s) from the cadence to my session failed.',
        uploadProspectsData,
        'upload_to_my_session'
      );
    },
  });

  // Delete prospect request
  const [
    deleteProspect,
    { data: deleteProspectData, loading: deleteProspectLoading },
  ] = useLazyQuery(DELETE_PROSPECTS_QUERY, {
    onCompleted: (response) =>
      handleDeleteProspectRequestCallback(response, true),
    onError: (response) => handleDeleteProspectRequestCallback(response),
  });

  // Get Wait time
  const [fetchWaitTime] = useLazyQuery(FETCH_REMAINING_WAIT_TIME_QUERY, {
    variables: {
      userId: selectedUserId,
    },
    onCompleted: (response) => {
      if (response.prospect.data[0]) {
        waitTimeRef.current.setAttribute(
          'title',
          'Prospect is currently under Wait period.' +
            (response.prospect.data[0].remainingWaitPeriod
              ? '\nTime Remaining: ' +
                response.prospect.data[0].remainingWaitPeriod.trim()
              : '')
        );
      } else {
        waitTimeRef.current.setAttribute(
          'title',
          'Prospect is currently under Wait period.'
        );
      }
    },
  });

  // fetch signed key for export csv
  const [
    fetchSignedKeyExport,
    { data: fetchSignedKeyExportData, loading: exportSignedKeyLoading },
  ] = useLazyQuery(FETCH_SIGNED_KEY_EXPORT_QUERY, {
    onCompleted: (response) => {
      setShowConfirmExportModal(false);
      if (response?.signedKeyExport?.data[0]?.key) {
        const signedKey = response?.signedKeyExport?.data[0]?.key;
        const link = `${apiURL}public/prospects/export/${signedKey}`;
        const anchor = document.createElement('a');
        document.body.appendChild(anchor);
        anchor.href = link;
        anchor.download = '';
        anchor.click();
        anchor.remove();
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! failed to export.',
        fetchSignedKeyExportData,
        'fetch_signed_key'
      );
    },
  });

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
  const getWaitPeriod = (event, pId) => {
    waitTimeRef.current = event.currentTarget;
    fetchWaitTime({
      variables: {
        id: pId,
      },
    });
  };

  /* ---- Grid Columns configuration -begin ----- */
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'contactName',
        width: '22%',
        Cell: function (props) {
          const rowData = props.row.original;
          const currentTimeZone = moment.tz.guess();
          const pausedDatetime = moment
            .tz(rowData.pausedDatetime, currentTimeZone)
            .format('M/D/YYYY h:mm A');
          let cadence;
          let touch;
          if (
            rowData.associations &&
            rowData.associations.cadence &&
            props.prospectData.prospects.includedAssociations &&
            props.prospectData.prospects.includedAssociations.cadence
          ) {
            cadence = props.prospectData.prospects.includedAssociations.cadence.find(
              (cadence) => cadence.id === rowData.associations.cadence[0].id
            );
          }

          if (
            rowData.associations.touch &&
            props.prospectData.prospects.includedAssociations &&
            props.prospectData.prospects.includedAssociations.touch
          ) {
            touch = props.prospectData.prospects.includedAssociations.touch.find(
              (touch) => touch.id === rowData.associations.touch[0].id
            );
          }

          return (
            <>
              {rowData.crmId && !rowData.crmId.startsWith('crmgenkey_') && (
                <span
                  className="pointer"
                  onClick={() => {
                    handleOpenCrmWindow(rowData.crmId, rowData.recordType);
                  }}
                >
                  <i
                    className="fas fa-arrow-up mr-2 text-success"
                    style={{ transform: 'rotate(45deg)' }}
                  ></i>
                </span>
              )}
              <span className="text-break">
                <Link
                  title={props.value}
                  to={{
                    pathname: '/prospects/list/' + props.row.original.id,
                    search: window.location.search,
                    state: {
                      allProspectsData: props.prospectData,
                      cadence,
                      origin: location.pathname,
                      prospect: props.row.original,
                      touch,
                      rowIndex: props.row.index,
                    },
                  }}
                >
                  {props.value && props.value.length > 30
                    ? props.value.slice(0, 29) + '..'
                    : props.value}
                </Link>
                {(rowData.optoutFlag === true ||
                  rowData.optoutFlag === 't') && (
                  <i
                    title="Opted out"
                    className="fas fa-ban fa-1x ml-2 text-danger"
                  ></i>
                )}
                {rowData.memberStatus === 'SUSPEND' && (
                  <i
                    title={`Prospect was paused on ${pausedDatetime}`}
                    className="fas fa-pause text-danger ml-2"
                  ></i>
                )}
                <br />
                <Link
                  title={rowData.accountName}
                  to={{
                    pathname:
                      '/accounts/' +
                      props.row.original.associations.account[0].id,
                    state: { origin: location.pathname },
                  }}
                >
                  <small>
                    {rowData.accountName && rowData.accountName.length > 30
                      ? rowData.accountName.slice(0, 29) + '..'
                      : rowData.accountName}
                  </small>
                </Link>
              </span>
            </>
          );
        },
      },
      {
        Header: 'Email',
        accessor: 'email',
        width: '9%',
      },
      {
        Header: 'Cadence',
        accessor: 'cadence',
        width: '19%',
        Cell: function (props) {
          const rowData = props.row.original;

          let cadence;
          let touch;
          if (
            rowData.associations &&
            rowData.associations.cadence &&
            props.prospectData.prospects.includedAssociations &&
            props.prospectData.prospects.includedAssociations.cadence
          ) {
            cadence = props.prospectData.prospects.includedAssociations.cadence.find(
              (cadence) => cadence.id === rowData.associations.cadence[0].id
            );
          }

          if (
            rowData.associations.touch &&
            props.prospectData.prospects.includedAssociations &&
            props.prospectData.prospects.includedAssociations.touch
          ) {
            touch = props.prospectData.prospects.includedAssociations.touch.find(
              (touch) => touch.id === rowData.associations.touch[0].id
            );
          }

          let touchIcon = '';
          if (touch && touch.touchType) {
            switch (touch.touchType) {
              case 'EMAIL':
                touchIcon = 'fas fa-envelope mr-2';
                break;
              case 'LINKEDIN':
                touchIcon = 'fab fa-linkedin-in mr-2';
                break;
              case 'TEXT':
                touchIcon = 'fas fa-sms mr-2';
                break;
              case 'SOCIAL':
              case 'OTHERS':
              case 'OTHER':
                touchIcon = 'fas fa-share-alt mr-2';
                break;
              case 'CALL':
                touchIcon = 'fas fa-phone-alt mr-2';
                break;
              default:
                break;
            }
          }
          if (cadence) {
            return (
              <span className="text-break" title={cadence.name}>
                <Link
                  to={{
                    pathname: '/cadences/' + cadence.id + '/touches/view',
                    search: `${window.location.search}&cadence[name]=${cadence.name}&not=1`,
                    state: {
                      allCadencesData:
                        props.prospectData.prospects.includedAssociations
                          .cadence,
                      origin: window.location.pathname,
                      cadence,
                      cadenceName: cadence.name,
                    },
                  }}
                >
                  {cadence?.name.length > 25
                    ? `${cadence.name.slice(0, 24)}...`
                    : cadence.name}
                </Link>
                {cadence?.sharedType !== 'none' && (
                  <span title="This cadence is a shared cadence">
                    <i className="fas fa-user-friends fa-sm text-muted ml-2"></i>
                  </span>
                )}
                {cadence && cadence.status === 'PAUSED' && (
                  <span>
                    <i
                      title="Paused Cadence"
                      className="fas fa-pause text-danger ml-2"
                    ></i>
                  </span>
                )}
                {touch && (
                  <small>
                    <br></br>
                    {touch.touchType === 'EMAIL' && touch.timeToComplete ? (
                      <span className="fa-1x svgicon emailEdit mr-1"></span>
                    ) : (
                      <i className={touchIcon}></i>
                    )}
                    Touch {touch.stepNo}
                    {rowData.currentTouchStatus === 'SCHEDULED_WAIT' && (
                      <i
                        title="Prospect is currently under Wait Period."
                        className="fas fa-clock text-muted ml-2"
                        onMouseEnter={(e) => {
                          getWaitPeriod(e, rowData.id);
                        }}
                      ></i>
                    )}
                  </small>
                )}
              </span>
            );
          } else {
            return <span></span>;
          }
        },
      },
      {
        Header: 'Tags',
        accessor: 'tag',
        width: '12%',
        disableSortBy: true,
        Cell: function (props) {
          const rowData = props.row.original;

          const tagIds =
            rowData.associations.tag &&
            rowData.associations.tag.length > 0 &&
            rowData.associations.tag.map((tag) => tag.id);
          const tagNames = [];

          tagIds &&
            tagIds.length > 0 &&
            props.prospectData.prospects.includedAssociations &&
            props.prospectData.prospects.includedAssociations.tag &&
            props.prospectData.prospects.includedAssociations.tag.forEach(
              (tag) => {
                if (tagIds.includes(tag.id)) {
                  tagNames.push(tag.name);
                }
              }
            );
          rowData['tagNames'] = tagNames;

          return (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {tagNames &&
                tagNames.length > 0 &&
                tagNames
                  .slice(0, tagNames.length > 2 ? 2 : tagNames.length)
                  .map((tag, index) => {
                    return (
                      <div key={index}>
                        <Badge
                          color="light"
                          onClick={() =>
                            handleRowToolbarButton(prospectActions.TAG, rowData)
                          }
                          title={
                            index === 1 && tagNames.length > 2
                              ? tagNames.slice(1, tagNames.length).join(',')
                              : tag
                          }
                          className="border border-dark mr-2 mb-2 text-normal text-break pointer"
                          pill
                        >
                          {tag && index === 1 && tagNames.length > 2 ? (
                            <span>
                              {tag.length > 22 ? tag.slice(0, 21) : tag}
                            </span>
                          ) : (
                            <span title={tag}>
                              {tag.length > 22 ? tag.slice(0, 21) + '..' : tag}
                            </span>
                          )}
                        </Badge>
                        {tag && index === 1 && tagNames.length > 2 && (
                          <span>+{tagNames.length - 2}</span>
                        )}
                      </div>
                    );
                  })}
            </>
          );
        },
      },
      {
        Header: 'Owner',
        accessor: 'owner',
        width: '7%',
        disableSortBy: true,
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

          const ownerName = owner && owner.name.split(' ');
          return (
            <span className="fa-stack" title={owner && owner.name}>
              <i className="fas fa-circle fa-stack-2x thin-circle"></i>
              <span className="fa-stack-1x">
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
          );
        },
      },
      {
        Header: 'Call Outcome',
        accessor: 'lastTalkerCallOutcome',
        width: '10%',
        Cell: function (props) {
          if (props.value === null) {
            const prospectData = props.data[props.row.id];
            return prospectData.lastDaCallOutcome;
          }
          return props.value;
        },
      },
      {
        Header: 'Email Outcome',
        accessor: 'lastEmailOutcome',
        width: '10%',
      },
      {
        Header: 'Last Touched On',
        accessor: 'lastTouchDateTime',
        width: '11%',
        Cell: function (props) {
          return formateDateTime(props.value);
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  /* ---- Grid Columns configuration -end ----- */

  // To render the grid when All, Active, Paused, Unassigned tabe changed
  const handleProspectTabChange = (e) => {
    e.preventDefault();

    const tabValue = e.currentTarget.getAttribute('data-tab-value');
    setActiveTab(tabValue);
    setOffset(0);
    setCurrentPageIndex(0);

    if (!currentUrlStatePushed) {
      window.history.pushState({}, '', window.location.href);
      setCurrentUrlStatePushed(true);
    }
    const { query } = parseUrl(window.location.search);
    query['filter[status]'] = tabValue;
    const filterQry = Object.entries({
      ...query,
      'filter[user][id]': selectedUserIdRef.current,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    setProspectsFilter(filterQry === '' ? '' : '&' + filterQry);
    const searchString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    window.history.replaceState({}, '', '?' + searchString);
  };

  /* ----- To handle prospect actions -begin ----- */
  const handleRowToolbarButtonAction = (action, prospect) => {
    setCurrentProspect(prospect ? prospect : {});
    setAction(action);
    setShowAssignAll(false);
    setShowDeleteAll(false);
    setAssignAllCadence(false);

    if (action === prospectActions.PAUSE || action === prospectActions.RESUME) {
      if (selectedRow.length > 0 && prospect === undefined) {
        const pauseIds = [];
        const alreadyPausedIds = [];
        selectedRow.forEach((item) => {
          if (item.original.associations.cadence !== undefined) {
            pauseIds.push(item.original.id);
          }
          if (item.original.memberStatus === 'SUSPEND') {
            alreadyPausedIds.push(item.original.id);
          }
        });
        if (pauseIds.length === 0) {
          notify(
            '(' +
              selectedRow.length +
              '/' +
              selectedRow.length +
              ') prospect(s) are not assigned to any cadence.',
            'error'
          );
        } else if (
          action === prospectActions.PAUSE &&
          selectedRow.length === alreadyPausedIds.length
        ) {
          notify(
            '(' +
              selectedRow.length +
              '/' +
              selectedRow.length +
              ') prospect(s) are paused already.',
            'error'
          );
        } else if (
          action === prospectActions.RESUME &&
          alreadyPausedIds.length === 0
        ) {
          notify(
            '(' +
              selectedRow.length +
              '/' +
              selectedRow.length +
              ') prospect(s) are not paused already. Please select paused prospect(s) to resume.',
            'error'
          );
        } else if (selectedRow.length !== pauseIds.length) {
          setShowPauseProspectPopupModal(true);
          setPausePopupMessage(
            '(' +
              (selectedRow.length - pauseIds.length) +
              '/' +
              selectedRow.length +
              ') prospect(s) are not assigned to any cadence.',
            'error'
          );
        } else {
          handleRowToolbarButton(action, prospect);
        }
      } else if (
        prospect !== undefined &&
        prospect.associations.cadence === undefined
      ) {
        notify('This prospect is not assigned to any cadence ', 'error');
      } else if (selectedRow.length === 0 && prospect === undefined) {
        setShowAlertPopupModal(true);
      } else {
        handleRowToolbarButton(action, prospect);
      }
    } else {
      if (
        action === prospectActions.TRANSFER_PROSPECTS &&
        (searchParams['filter[q]'] || searchParams['filter[filterCriteriaId]'])
      ) {
        handleRowToolbarButton(action, prospect);
      } else if (
        action === prospectActions.UPLOAD &&
        (searchParams['filter[q]'] || searchParams['filter[filterCriteriaId]'])
      ) {
        handleRowToolbarButton(action, prospect);
      } else if (
        action === prospectActions.EXPORT &&
        (searchParams['filter[q]'] || searchParams['filter[filterCriteriaId]'])
      ) {
        handleRowToolbarButton(action, prospect);
      } else if (
        intermediateCheckedData.length === 0 &&
        prospect === undefined
      ) {
        setShowAlertPopupModal(true);
      } else {
        handleRowToolbarButton(action, prospect);
      }
    }
  };
  // To handle clicking toolbar buttons on grid row mouseover
  const handleRowToolbarButton = (action, prospect) => {
    setCurrentProspect(prospect ? prospect : {});
    setShowPauseProspectPopupModal(false);
    handleActionSetOwner(selectedUserIdRef.current);

    if (
      action === prospectActions.EXPORT &&
      intermediateCheckedData.length > 0
    ) {
      const selectedProspectIds =
        intermediateCheckedData &&
        intermediateCheckedData.length > 0 &&
        intermediateCheckedData;
      const prospectsData = prospectData?.prospects?.data;
      const tags = prospectData?.prospects?.includedAssociations?.tag;
      const selectedProspectData = [];
      selectedProspectIds.map((prospectId) => {
        const singleData = prospectsData.find(
          (prospect) => prospectId === prospect.id
        );
        selectedProspectData.push(singleData);
        return singleData;
      });
      setSelectedProspectsData({
        data: selectedProspectData,
        tags,
      });
      setShowExportProspectConfirmModal(true);
      return;
    }

    switch (action) {
      case prospectActions.ASSIGN_TO_CADENCE:
        setShowAssignPorspectToCadenceModal(true);
        break;
      case prospectActions.RESUME:
        setShowResumeProspectConfirmModal(true);
        break;
      case prospectActions.PAUSE:
        setShowPauseProspectConfirmModal(true);
        break;
      case prospectActions.TAG:
        if (selectedUserIdRef.current === currentUserId) {
          setShowTagProspectModal(true);
        }
        break;
      case prospectActions.MOVE_TO_ANOTHER_CADENCE:
        setShowMoveProspectToCadenceModal(true);
        break;
      case prospectActions.EXIT_CADENCE:
        setShowExitProspectConfirmModal(true);
        break;
      case prospectActions.DELETE:
        setShowDeleteProspectConfirmModal(true);
        break;
      case prospectActions.EMAIL:
        setShowSendOneOffEmail(true);
        break;
      case prospectActions.SKIP_TOUCH:
        setShowSkipTouchToCadenceModal(true);
        break;
      case prospectActions.EXPORT:
        setShowConfirmExportModal(true);
        break;
      case prospectActions.TRANSFER_PROSPECTS:
        setShowTransferOwnershipModal(true);
        break;
      case prospectActions.UPLOAD:
        setShowConfirmUploadModal(true);
        break;
      default:
        break;
    }
  };

  const [
    deleteAll,
    { data: deleteAllData, loading: deleteAllLoading },
  ] = useLazyQuery(DELETE_ALL_PROSPECTS_QUERY, {
    onCompleted: (response) =>
      handleDeleteAllProspectRequestCallback(response, true),
    onError: (response) => handleDeleteAllProspectRequestCallback(response),
  });

  const [
    assignAll,
    { data: assignAllData, loading: showAssignAllActionBtnSpinner },
  ] = useLazyQuery(ASSIGN_ALL_PROSPECTS_QUERY, {
    onCompleted: (response) =>
      handleAssignAllProspectRequestCallback(response, true),
    onError: (response) => handleAssignAllProspectRequestCallback(response),
  });

  const handleAssignAllProspectRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (response.assignAll.response === 'error') {
        notify(response.assignAll.errors[0].message, 'error');
      } else {
        const assignedCountList = response.assignAll.data.filter(
          (item) => item.assigned === true
        );
        notify(
          `${assignedCountList.length} out of ${response.assignAll.data.length} prospect(s) assigned successfully!`,
          'success'
        );
      }
      setAssignAllCadence(false);
      setShowAssignPorspectToCadenceModal(false);
      refreshProspectsGrid();
    } else {
      showErrorMessage(
        response,
        'Failed to assign. Please contact Koncert support.',
        assignAllData,
        'assign_all_prospects'
      );
    }
  };

  const handleDeleteAllProspectRequestCallback = (response, requestSuccess) => {
    setShowDeleteAllConfirmModal(false);
    if (requestSuccess) {
      notify('Prospect(s) deleted successfully', 'success');
      refreshProspectsGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete.',
        deleteAllData,
        'delete_all_prospects'
      );
    }
  };

  const handleAddProspectRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (response.prospect.errors !== undefined) {
        notify(response.prospect.errors[0].message, 'error');
      } else {
        setShowAddPorspectModal(false);
        notify('Prospect added successfully!', 'success');
        refreshProspectsCountAndGrid();
      }
    } else {
      showErrorMessage(
        response,
        'Failed to add prospect(s)',
        addProspectData,
        'add_prospects'
      );
    }
  };

  const handleAssignProspectRequestCallback = (response, requestSuccess) => {
    setShowAssignPorspectToCadenceModal(false);
    if (requestSuccess) {
      if (response.assignOrMoveProspect.response === 'error') {
        notify(response.assignOrMoveProspect.errors[0].message, 'error');
      } else {
        const assignedCountList = response.assignOrMoveProspect.data.filter(
          (item) => item.assigned === true
        );
        notify(
          `${assignedCountList.length} out of ${response.assignOrMoveProspect.data.length} prospect(s) assigned successfully!`,
          'success'
        );

        refreshProspectsCountAndGrid();
      }
    } else if (response.graphQLErrors.length > 0) {
      if (
        response.graphQLErrors[0].message ===
        'This cadence contains an Email touch with a scheduled time which has already passed. Please update the touch to proceed.'
      ) {
        setShowScheduleConfirmModal(true);
      } else {
        showErrorMessage(
          response,
          'Failed to assign prospect(s)',
          assignedData,
          'assign_prospects'
        );
      }
    } else {
      showErrorMessage(
        response,
        'Failed to assign prospect(s)',
        assignedData,
        'assign_prospects'
      );
    }
  };

  const handleTagProspectRequestCallback = (response, requestSuccess) => {
    setShowTagProspectModal(false);
    if (requestSuccess) {
      if (response.tagProspect.response === 'error') {
        notify(response.tagProspect.errors[0].message, 'error');
      } else {
        notify('Tags added successfully!', 'success');
        refreshProspectsGrid();
        setSelectedRow([]);
        setIntermediateCheckedData([]);
      }
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to add a tag.',
        tagData,
        'import_crm_tag'
      );
    }
  };

  const handleResumeProspectRequestCallback = (response, requestSuccess) => {
    setShowResumeProspectConfirmModal(false);
    if (requestSuccess) {
      const resumeCountList = response.prospect.data.filter(
        (item) => item.isResumed
      );
      notify(
        `${resumeCountList.length} out of ${response.prospect.data.length} prospect(s) resumed successfully!.`,
        'success'
      );

      refreshProspectsCountAndGrid();
    } else {
      showErrorMessage(
        response,
        'Failed to resume the paused prospects',
        resumeProspectData,
        'resume_prospects'
      );
    }
  };

  const handlePauseProspectRequestCallback = (response, requestSuccess) => {
    setShowPauseProspectConfirmModal(false);
    if (requestSuccess) {
      const pauseCountList = response.prospect.data.filter(
        (item) => item.isPaused
      );
      notify(
        `${pauseCountList.length} out of ${response.prospect.data.length} prospect(s) paused successfully!.`,
        'success'
      );
      refreshProspectsCountAndGrid();
    } else {
      showErrorMessage(
        response,
        'Failed to paused the prospect(s).',
        pauseProspectData,
        'pause_prospects'
      );
    }
  };

  const handleMoveProspectRequestCallback = (response, requestSuccess) => {
    setShowMoveProspectToCadenceModal(false);
    if (requestSuccess) {
      setSelectedCadence({});
      setShowMoveProspectConfirmModal(false);
      if (response.assignOrMoveProspect.response === 'error') {
        notify(response.assignOrMoveProspect.errors[0].message, 'error');
      } else if (
        response.assignOrMoveProspect.response === 'success' &&
        response.assignOrMoveProspect.data
      ) {
        const movedCountList = response.assignOrMoveProspect.data.filter(
          (item) => item.isMoved
        );
        notify(
          `${movedCountList.length} out of ${response.assignOrMoveProspect.data.length} prospect(s) moved successfully.\n Note: For prospect(s) already in same cadence, no action will be taken.`,
          'success'
        );
        refreshProspectsCountAndGrid();
      } else if (
        response.assignOrMoveProspect.response === 'success' &&
        response.assignOrMoveProspect.data === null
      ) {
        showSuccessMsg(response?.assignOrMoveProspect?.requestId);
        refreshProspectsCountAndGrid();
      }
    } else if (
      response?.graphQLErrors &&
      response.graphQLErrors.length > 0 &&
      response.graphQLErrors[0].message ===
        'This cadence contains an Email touch with a scheduled time which has already passed. Please update the touch to proceed.'
    ) {
      setShowMoveProspectConfirmModal(false);
      setShowScheduleConfirmModal(true);
    } else {
      showErrorMessage(
        response,
        'Failed to Move the prospect(s)',
        moveProspectsData,
        'move_prospects'
      );
    }
  };

  const handleExitProspectRequestCallback = (response, requestSuccess) => {
    setShowExitProspectConfirmModal(false);

    if (requestSuccess) {
      if (response.prospect.response === 'error') {
        notify(response.prospect.errors[0].message, 'error');
      } else if (
        response.prospect.response === 'success' &&
        response.prospect.data
      ) {
        const exitCountList = response.prospect.data.filter(
          (item) => item.isExit === true
        );
        notify(
          `${exitCountList.length} out of ${response.prospect.data.length} prospect(s) exited successfully!`,
          'success'
        );
        refreshProspectsCountAndGrid();
      } else if (
        response.prospect.response === 'success' &&
        response.prospect.data === null
      ) {
        showSuccessMsg(response?.prospect?.requestId);
        refreshProspectsCountAndGrid();
      }
    }
  };

  const handleUploadProspectRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (response.prospect.response === 'error') {
        notify('Sorry! Failed to upload prospects to my session!', 'error');
        setShowConfirmUploadModal(false);
      } else {
        notify(`Prospect(s) uploaded successfully to My Session!`, 'success');
        refreshProspectsCountAndGrid();
        setShowConfirmUploadModal(false);
        const newWin = window.open(
          !configurationsError &&
            configurationsData?.configurations?.data[0]?.powerDialerUrl,
          'dialers'
        );

        if (!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
          //POPUP BLOCKED NOTIFICATION
          notify(
            'Pop-ups and redirects are blocked by browser for this site. Please enable Pop-ups and redirects in settings',
            'error'
          );
        } else {
          newWin.focus();
        }
      }
    }
  };

  const handleDeleteProspectRequestCallback = (response, requestSuccess) => {
    setShowDeleteProspectConfirmModal(false);
    if (requestSuccess) {
      if (response.deleteProspect.response === 'error') {
        notify('Sorry! Failed to delete.', 'error');
      } else {
        const deletedCount =
          intermediateCheckedData.length === 0
            ? 1
            : intermediateCheckedData.length;
        notify(
          `${deletedCount} out of ${deletedCount} prospect(s) deleted successfully!`,
          'success'
        );
        refreshProspectsCountAndGrid();
      }
    } else {
      showErrorMessage(
        response,
        'Failed to delete the prospct(s).',
        deleteProspectData,
        'delete_prospect'
      );
    }
  };

  // Skiping curent touh execution and moved next touch
  const [
    skipTouch,
    { data: skipTouchData, loading: skipTouchLoading },
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
        refreshProspectsCountAndGrid();
      }
    } else {
      showErrorMessage(
        response,
        'Failed to skip the current touch of the prospct(s).',
        skipTouchData,
        'skip_touch'
      );
    }
  };

  // Refresh Prospects count on Tabs and grid
  const refreshProspectsCountAndGrid = () => {
    setSelectedRow([]);
    setIntermediateCheckedData([]);

    refreshProspectsGrid();
  };
  /* ----- To handle prospect actions -end ----- */
  //Sorting Prospects on Grid Headers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => handleProspectsSearch(), [sortBy, orderBy]);

  const prospectsSearch = (flag) => {
    const { query } = parseUrl(window.location.search);
    if (flag === '' && !query['filter[q]']) {
      setSearchInput('');
    } else if (flag === '' && query['filter[q]']) {
      handleProspectsSearch('');
    } else {
      handleProspectsSearch('search');
    }
  };

  const handleProspectsSearch = (flag) => {
    const { query } = parseUrl(window.location.search);
    const isBackToList = location.isBackToList;

    if (isBackToList) {
      location.isBackToList = false;
      const urlFilterId =
        query['filter[filterCriteriaId]'] === undefined
          ? ''
          : parseInt(query['filter[filterCriteriaId]']);
      setFilterId(urlFilterId);
      filterRef.current = urlFilterId;

      return;
    }

    const sortkey = Object.entries(query).filter(([key]) =>
      key.startsWith('sort')
    );
    if (sortkey.length > 0) {
      delete query[sortkey[0].length > 0 ? sortkey[0][0] : ''];
    }

    if (sortBy === 'cadence') {
      query[`sort[${sortBy}][name]`] = orderBy;
    } else {
      query[`sort[${sortBy}]`] = orderBy;
    }

    if (!validator.isEmpty(searchInput)) {
      query['filter[q]'] = encodeURIComponent(searchInput.trim());
    } else if (query['filter[q]']) {
      delete query['filter[q]'];
    }

    if (filterRef.current !== undefined && filterRef.current !== '') {
      query['filter[filterCriteriaId]'] = filterRef.current;
    } else if (
      query['filter[filterCriteriaId]'] !== undefined &&
      flag !== '' &&
      flag !== 'filter'
    ) {
      setFilterId(parseInt(query['filter[filterCriteriaId]']));
      filterRef.current = parseInt(query['filter[filterCriteriaId]']);
    }

    if (flag === '') {
      setSearchInput('');
      delete query['filter[q]'];
    } else if (flag === 'filter') {
      delete query['filter[filterCriteriaId]'];
    }
    if (flag === '' || flag === 'filter' || flag === 'search') {
      query['page[offset]'] = 0;
      setOffset(0);
      setCurrentPageIndex(0);
    }

    const filterQry = Object.entries({
      ...query,
      'filter[user][id]': selectedUserIdRef.current,
    })
      .filter(
        ([key]) =>
          key.startsWith('filter') ||
          key.startsWith('sort') ||
          key.startsWith('page[offset]')
      )
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    if (!loading) {
      setProspectsFilter(filterQry === '' ? '' : '&' + filterQry);
    }
    const paramToPush = Object.entries({
      ...query,
      'filter[user][id]': selectedUserIdRef.current,
    })
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    window.history.replaceState({}, '', '?' + paramToPush);
  };

  const handleActionSearchFilter = (filterId) => {
    setFilterId(filterId);
    filterRef.current = filterId;
    filterList.forEach((filter) => {
      if (filter.value === filterId) {
        setFilterUserId(filter.userId);
      }
    });
    handleProspectsSearch('search');
  };

  const handleActionUserFilter = (selectedId) => {
    if (selectedUserIdRef.current !== selectedId) {
      setIsUserChanged(true);
      setIsRefreshTagList(true);
    }
    setSelectedUserId(selectedId);
    selectedUserIdRef.current = selectedId
      ? parseInt(selectedId)
      : selectedUserIdRef.current;
    handleProspectsSearch('search');
  };

  const handleActionSetOwner = (id) => {
    if (userList && userList.length > 0 && id) {
      userList.forEach((item) => {
        if (parseInt(id) === item.value) {
          setSelectedUserName(item.text);
        }
      });
    }
  };

  useEffect(() => {
    setPageCount(
      !loading && prospectData.prospects.paging
        ? Math.ceil(prospectData.prospects.paging.totalCount / limit)
        : 0
    );
    setTotalProspectCount(
      !loading && prospectData.prospects.paging
        ? Math.ceil(prospectData.prospects.paging.totalCount)
        : 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridData]);

  const handleIntermediateCheck = (selectedRow) => {
    // eslint-disable-next-line @typescript-eslint/no-array-constructor
    const ids = [];
    setSelectedRow(selectedRow);

    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((rowData) => {
        ids.push(rowData.original.id);
      });
    }
    setIntermediateCheckedData(ids);
  };

  const fieldsList = useMemo(
    () => (fieldsData && fieldsData.fields ? fieldsData.fields.data : []),
    [fieldsData]
  );

  //Fetch teams assigned to manager
  const { data: assignedUsersData, loading: loadingAssignedUsers } = useQuery(
    FETCH_ASSIGNED_USERS_QUERY,
    {
      variables: { limit: 200, offset: 0, currentUserId },
      onCompleted: (response) =>
        handleAssignedUserRequestCallBack(response, true),
      onError: (response) => handleAssignedUserRequestCallBack(response),
    }
  );

  const handleAssignedUserRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      setSharedWithUsers(
        response.teams.data
          .filter((user) => user.id !== currentUserId)
          .map((item) => {
            return { text: item.displayName, value: item.id, active: false };
          })
      );

      const userList = response.teams.data.map((item) => {
        return { text: item.displayName, value: item.id, active: false };
      });

      setUserList(userList);
    }
  };
  //Filter criteria starts here
  const { refetch: refetchFilters, data: filtersData } = useQuery(
    GET_ALL_FILTER_CRITERIAS,
    {
      variables: { limit: 200, offset: 0, currentUserId: currentUserId },
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) =>
        handleReFetchFilterRequestCallBack(response, true),
      onError: (response) => {
        showErrorMessage(
          response,
          'Failed to fetch the filter list(s).',
          filtersData,
          'filter_list'
        );
      },
    }
  );

  const handleReFetchFilterRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      setFilterList(
        response.filters.data.map((item) => {
          return {
            text: item.name,
            value: item.id,
            active: false,
            userId: item.associations.user[0].id,
          };
        })
      );
    }
  };

  useEffect(() => {
    const filterID =
      searchParams['filter[filterCriteriaId]'] &&
      parseInt(searchParams['filter[filterCriteriaId]']);
    setFilterId(filterID);
    filterRef.current = filterID;
    const filter = filterList.find((filter) => {
      return filter.value === filterID;
    });
    setFilterUserId(filter?.userId);
  }, [filterList, searchParams]);

  useEffect(() => {
    fetchProspectsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridData]);

  // Edit Filter
  const [
    editFilter,
    { data: editFilterData, loading: loadingEditFitler },
  ] = useLazyQuery(GET_FILTER_CRITERIAS, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => handleEditFilterRequestCallBack(response, true),
    onError: (response) => handleEditFilterRequestCallBack(response),
  });

  const handleEditFilterRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      setShowFilterModal(true);

      if (response.filters !== null) {
        const filterData = response.filters.data[0];
        delete filterData.associations;
        filterData.filterCriteria = [];
        filterData.filterCriteria =
          response.filters.includedAssociations.filterCriteria;
        setCurrentFilter(filterData);
      }
    } else {
      showErrorMessage(
        response,
        'Failed to edit the filter details.',
        editFilterData,
        'edit_filter'
      );
    }
  };

  //Delete Filter request
  const [
    deleteFilter,
    { data: deleteFilterData, loading: loadingDeleteFitler },
  ] = useLazyQuery(DELETE_FILTTERS, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) =>
      handleDeleteFilterRequestCallBack(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to delete the filter.',
        deleteFilterData,
        'delete_filter'
      );
    },
  });

  const handleDeleteFilterRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      setFilterId('');
      filterRef.current = '';
      notify('Filter has been deleted successfully!', 'success');
      handleProspectsSearch('filter');
      refetchFilters();
    }
  };

  const handleActionEditFilter = () => {
    if (filterId !== '') {
      editFilter({ variables: { filterId, currentUserId } });
    }
  };

  const handleActionDeleteFilter = () => {
    if (filterId !== '') {
      deleteFilter({ variables: { filterId } });
    }
  };

  const handleActionCreateFilter = () => {
    const criteriaData = {
      sharedType: 'none',
      logicalOperator: 'AND',
    };
    criteriaData.filterCriteria = criteria;
    setCurrentFilter(criteriaData);
    setShowFilterModal(true);
  };

  const handleActionAddCriteria = () => {
    const criteriaData = JSON.parse(JSON.stringify(currentFilter));
    criteriaData.filterCriteria.push(newCriteria);
    setCurrentFilter(criteriaData);
  };

  const handleCriteriaFieldsChange = (name, value, rowNo) => {
    const criteriaData = JSON.parse(JSON.stringify(currentFilter));
    if (name === 'id' && value !== '') {
      const fieldJson = fieldsList.filter(
        (field) => field.id === parseInt(value)
      );
      const controlType =
        fieldJson[0].name === 'tag' ? 'text' : fieldJson[0].controlType;
      criteriaData.filterCriteria[rowNo]['field'] = {
        id: value,
        controlType: controlType,
      };
      criteriaData.filterCriteria[rowNo]['criteriaValue'] =
        controlType === 'boolean' ? [false] : '';
      criteriaData.filterCriteria[rowNo]['operator'] = '';
    } else {
      criteriaData.filterCriteria[rowNo][name] = value;
    }
    setCurrentFilter(criteriaData);
  };

  const handleActionDeleteRow = (rowNo) => {
    const criteriaData = JSON.parse(JSON.stringify(currentFilter));
    const filterRows = JSON.parse(JSON.stringify(criteriaData.filterCriteria));
    criteriaData.filterCriteria = [];
    filterRows.forEach((item, index) => {
      if (index !== rowNo) {
        criteriaData.filterCriteria.push(item);
      } else if (filterRows.length === 1) {
        criteriaData.filterCriteria = [criteria[0]];
      }
    });
    if (
      criteriaData.filterCriteria.length > 0 &&
      criteriaData.filterCriteria[0] === undefined
    ) {
      criteriaData.filterCriteria = criteria;
    }
    setCurrentFilter(criteriaData);
  };

  /**END OF FILTER CREITERIA */
  const handleOpenCrmWindow = (crmId, recordType) => {
    OpenCrmWindow(org, crmId, recordType);
  };

  const { data: lookupData } = useQuery(GET_LOOKUP_VALUE_QUERY, {
    variables: {
      lookupsFilter: `filter[lookupName]=:[import_ajax_timeout,trucadence_hide_import_from_crm,trucadence_hide_import_from_file,bulk_prospects_delete_limit]`,
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

  const handleTagAction = (tagIds, tagLabel) => {
    setTagIds(tagIds);
    setTagLabel(tagLabel);
    setShowTagConfirmModal(true);
  };
  const showAssignAllAndDeleteAllModal = (action) => {
    handleActionSetOwner(selectedUserIdRef.current);
    if (totalProspectCount === 0) {
      notify('No prospect(s) found to ' + action, 'error');
    } else if (action === 'assign') {
      setShowAssignAll(true);
    } else {
      const deleteLimit = lookup.bulk_prospects_delete_limit
        ? parseInt(lookup.bulk_prospects_delete_limit)
        : totalProspectCount;
      if (totalProspectCount > deleteLimit) {
        setShowDeleteLimitConfirm(true);
      } else {
        setShowDeleteAll(true);
      }
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
        `${response?.transfer?.data[0]?.prospectCount} prospects are being transferred.`,
        'success',
        'transfer_ownership'
      );
      setShowTransferOwnershipModal(false);
      refreshProspectsCountAndGrid();
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

  //Page Header section is start here
  return (
    <ContentWrapper>
      <PageHeader
        icon="fa fa-user"
        pageName="Prospects"
        pageStyle={'text-nowrap'}
      >
        <div className="d-flex justify-content-end ml-1">
          <SearchBar
            searchInput={searchInput}
            onSearch={prospectsSearch}
            onChange={setSearchInput}
            clname="mr-2 w-25"
          />

          {user && user.isManagerUser === 'Y' && (
            <InputGroup className="mr-2 w-auto">
              <InputGroupAddon addonType="append" className="wd-md">
                <DropDown
                  value={
                    selectedUserIdRef.current
                      ? parseInt(selectedUserIdRef.current)
                      : currentUserId
                  }
                  data={userList ? userList : []}
                  name="userFilters"
                  placeHolder="User(s)"
                  onChange={handleActionUserFilter}
                />
              </InputGroupAddon>
            </InputGroup>
          )}

          <InputGroup className="w-auto">
            <InputGroupAddon addonType="append" className="mr-1">
              <DropDown
                value={filterRef.current}
                data={filterList}
                placeHolder="Filter(s)"
                name="filterName"
                onChange={handleActionSearchFilter}
              />
              <Button
                style={{
                  display:
                    filterId === '' || filterId === undefined
                      ? 'none'
                      : 'block',
                }}
                onClick={(e) => {
                  setFilterId('');
                  filterRef.current = '';
                  handleProspectsSearch('filter');
                }}
              >
                <i className="fa fa-times"></i>
              </Button>
              <Button
                title="Edit Filter"
                onClick={handleActionEditFilter}
                disabled={loadingEditFitler}
                style={{
                  display:
                    filterId === '' ||
                    filterId === undefined ||
                    filterUserId !== currentUserId
                      ? 'none'
                      : 'block',
                }}
              >
                <i
                  className={
                    loadingEditFitler
                      ? 'fas fa-spinner fa-spin'
                      : 'fa fa-pencil-alt'
                  }
                ></i>
              </Button>
              <Button
                title="Delete Filter"
                onClick={handleActionDeleteFilter}
                disabled={loadingDeleteFitler}
                style={{
                  display:
                    filterId === '' ||
                    filterId === undefined ||
                    filterUserId !== currentUserId
                      ? 'none'
                      : 'block',
                }}
              >
                <i
                  className={
                    loadingDeleteFitler
                      ? 'fas fa-spinner fa-spin'
                      : 'fas fa-trash text-danger'
                  }
                ></i>
              </Button>
              <Button
                title="Create Filter"
                className="pb-1 pr-2 pl-2"
                onClick={handleActionCreateFilter}
                disabled={loadingAssignedUsers}
              >
                <i className="fas fa-filter fa-sm px-1"></i>
              </Button>
            </InputGroupAddon>
          </InputGroup>

          <div className="d-flex">
            {org &&
            org.crmType !== 'standalone' &&
            lookup &&
            lookup['trucadence_hide_import_from_crm'] === 'false' ? (
              <ButtonDropdown
                isOpen={importDropdownOpen}
                toggle={importDropdownToggle}
              >
                <Button
                  className="text-nowrap px-2"
                  title="Import from CRM"
                  onClick={() => {
                    setImportDropdownOpen(false);
                    setShowImportCrmModal(true);
                  }}
                >
                  <span className="fa-stack fa-xs mr-2">
                    <i className="far fa-circle fa-stack-2x"></i>
                    <i className="fas fa-user-alt fa-stack-1x"></i>
                  </span>
                  Import from CRM
                </Button>

                {lookup['trucadence_hide_import_from_file'] === 'false' && (
                  <>
                    <DropdownToggle>
                      <i className="fas fa-sort-down"></i>
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem
                        className="text-nowrap px-2"
                        title="Import from CSV"
                        onClick={() => setShowImportModal(true)}
                      >
                        <i className="fas fa-file-csv mr-2"></i>
                        Import from CSV
                      </DropdownItem>
                    </DropdownMenu>
                  </>
                )}
              </ButtonDropdown>
            ) : (
              lookup &&
              lookup['trucadence_hide_import_from_file'] === 'false' && (
                <ClButton
                  icon="fas fa-file-csv"
                  className="text-nowrap mr-1"
                  title="Import from CSV"
                  onClick={() => setShowImportModal(true)}
                >
                  Import from CSV
                </ClButton>
              )
            )}
          </div>
        </div>
      </PageHeader>
      <Row>
        <Col>
          <Card className="card-default">
            <CardBody>
              <Row className="mb-3">
                <Col lg={8} className="pr-1 text-nowrap">
                  <ButtonGroup>
                    <FilterButton
                      active={activeTab === filterButtons[0]}
                      data-tab-value={filterButtons[0]}
                      handleClick={handleProspectTabChange}
                      className={`${
                        activeTab === filterButtons[0] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1 px-2`}
                      count={allTabCount}
                      countError={prospectsCountError}
                      countLoading={
                        allTabCount === null && prospectsCountLoading
                      }
                    >
                      <strong>All</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeTab === filterButtons[1]}
                      data-tab-value={filterButtons[1]}
                      handleClick={handleProspectTabChange}
                      handlePin={(pin) =>
                        changeSetting(
                          'prospectsPinnedFilterButton',
                          pin ? filterButtons[1] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[1]}
                      className={`${
                        activeTab === filterButtons[1] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1 px-2`}
                      count={activeTabCount}
                      countError={prospectsCountError}
                      countLoading={
                        activeTabCount === null && prospectsCountLoading
                      }
                    >
                      <strong>Active</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeTab === filterButtons[2]}
                      data-tab-value={filterButtons[2]}
                      handleClick={handleProspectTabChange}
                      handlePin={(pin) =>
                        changeSetting(
                          'prospectsPinnedFilterButton',
                          pin ? filterButtons[2] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[2]}
                      className={`${
                        activeTab === filterButtons[2] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1 px-2`}
                      count={pausedTabCount}
                      countError={prospectsCountError}
                      countLoading={
                        pausedTabCount === null && prospectsCountLoading
                      }
                    >
                      <strong> Paused</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeTab === filterButtons[3]}
                      data-tab-value={filterButtons[3]}
                      handleClick={handleProspectTabChange}
                      handlePin={(pin) =>
                        changeSetting(
                          'prospectsPinnedFilterButton',
                          pin ? filterButtons[3] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[3]}
                      className={`${
                        activeTab === filterButtons[3] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1 px-2`}
                      count={unAssignedTabCount}
                      countError={prospectsCountError}
                      countLoading={
                        unAssignedTabCount === null && prospectsCountLoading
                      }
                    >
                      <strong> Unassigned</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeTab === filterButtons[4]}
                      data-tab-value={filterButtons[4]}
                      handleClick={handleProspectTabChange}
                      handlePin={(pin) =>
                        changeSetting(
                          'prospectsPinnedFilterButton',
                          pin ? filterButtons[4] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[4]}
                      className={`${
                        activeTab === filterButtons[4] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1 px-2`}
                      count={neverAssignedTabCount}
                      countError={prospectsCountError}
                      countLoading={
                        neverAssignedTabCount === null && prospectsCountLoading
                      }
                    >
                      <strong> Never Assigned</strong>
                    </FilterButton>
                  </ButtonGroup>
                </Col>
                <Col lg={4} className="pl-1">
                  <InputGroup className="justify-content-end">
                    <ProspectsSortByFieldsDropdown
                      sortBy={
                        tableSortingValues.includes(sortBy) ||
                        sortBy === 'email' ||
                        sortBy === 'cadence'
                          ? null
                          : sortBy
                      }
                      orderBy={
                        tableSortingValues.includes(sortBy) ? null : orderBy
                      }
                      onSort={(field) => {
                        setSortBy(field.sortBy);
                        setOrderBy(field.orderBy);
                      }}
                      filterData={(field) => {
                        return !tableSortingValues.includes(field.name);
                      }}
                    ></ProspectsSortByFieldsDropdown>
                    <ButtonDropdown
                      className="ml-1"
                      isOpen={actionDropdownOpen}
                      toggle={toggleAction}
                    >
                      <DropdownToggle caret>Action</DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem
                          onClick={() =>
                            handleRowToolbarButtonAction(
                              prospectActions.ASSIGN_TO_CADENCE
                            )
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-plus text-warning"></i>
                            </Col>
                            <Col>Assign</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          hidden={
                            searchParams['filter[q]'] ||
                            searchParams['filter[filterCriteriaId]']
                              ? false
                              : true
                          }
                          disabled={totalProspectCount === 0 ? true : false}
                          onClick={() => {
                            showAssignAllAndDeleteAllModal('assign');
                          }}
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-user-plus text-warning "></i>
                            </Col>
                            <Col>Assign All</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          hidden={selectedUserIdRef.current !== currentUserId}
                          onClick={() =>
                            handleRowToolbarButtonAction(prospectActions.TAG)
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-tag text-primary mr-2"></i>
                            </Col>
                            <Col>Tag</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleRowToolbarButtonAction(
                              prospectActions.MOVE_TO_ANOTHER_CADENCE
                            )
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-arrows-alt text-info"></i>
                            </Col>
                            <Col>Move</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleRowToolbarButtonAction(
                              prospectActions.EXIT_CADENCE
                            )
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-sign-out-alt text-danger"></i>
                            </Col>
                            <Col>Exit</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleRowToolbarButtonAction(prospectActions.DELETE)
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-trash text-danger"></i>
                            </Col>
                            <Col>Delete</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          hidden={
                            searchParams['filter[q]'] ||
                            searchParams['filter[filterCriteriaId]']
                              ? false
                              : true
                          }
                          disabled={totalProspectCount === 0 ? true : false}
                          onClick={() => {
                            showAssignAllAndDeleteAllModal('delete');
                          }}
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-trash-alt text-danger"></i>
                            </Col>
                            <Col>Delete All</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleRowToolbarButtonAction(prospectActions.PAUSE)
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-pause text-primary"></i>
                            </Col>
                            <Col>Pause</Col>
                          </Row>
                        </DropdownItem>

                        <DropdownItem
                          onClick={() =>
                            handleRowToolbarButtonAction(prospectActions.RESUME)
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-play text-muted"></i>
                            </Col>
                            <Col>Resume</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          disabled={totalProspectCount === 0 ? true : false}
                          onClick={() =>
                            handleRowToolbarButtonAction(prospectActions.EXPORT)
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-paper-plane text-success ml-n1 mr-1"></i>
                            </Col>
                            <Col>Export</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          disabled={totalProspectCount === 0 ? true : false}
                          onClick={() =>
                            handleRowToolbarButtonAction(
                              prospectActions.TRANSFER_PROSPECTS
                            )
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-user text-primary"></i>
                            </Col>
                            <Col>Transfer</Col>
                          </Row>
                        </DropdownItem>
                        <DropdownItem
                          hidden={
                            selectedUserIdRef.current !== currentUserId ||
                            (!user?.userLicense.includes('PD') &&
                              !user?.userLicense.includes('TD'))
                          }
                          disabled={totalProspectCount === 0 ? true : false}
                          onClick={() =>
                            handleRowToolbarButtonAction(prospectActions.UPLOAD)
                          }
                        >
                          <Row>
                            <Col className="col-sm-2 pr-0">
                              <i className="fas fa-upload text-warning"></i>{' '}
                            </Col>
                            <Col>Upload</Col>
                          </Row>
                        </DropdownItem>
                      </DropdownMenu>
                    </ButtonDropdown>
                    {user && user.isCreateAddProspect && (
                      <ClButton
                        disabled={selectedUserIdRef.current !== currentUserId}
                        icon="fa fa-user-plus"
                        className="text-nowrap ml-1 px-2"
                        title="Add a Prospect"
                        onClick={() => setShowAddPorspectModal(true)}
                      >
                        Add a Prospect
                      </ClButton>
                    )}
                  </InputGroup>
                </Col>
              </Row>

              <ProspectsGrid
                columns={columns}
                data={gridData}
                prospectData={prospectData}
                currentUserId={currentUserId}
                selectedUserId={
                  selectedUserIdRef.current
                    ? parseInt(selectedUserIdRef.current)
                    : currentUserId
                }
                fetchData={({ pageIndex, pageSize }) => {
                  setOffset(pageIndex);
                  setCurrentPageIndex(pageIndex);
                  setLimit(pageSize);
                  if (!currentUrlStatePushed) {
                    window.history.replaceState({}, '', window.location.href);
                    setCurrentUrlStatePushed(true);
                  }

                  const { query } = parseUrl(window.location.search);
                  query['page[limit]'] = pageSize;
                  query['page[offset]'] = pageIndex;

                  const searchString = Object.entries(query)
                    .map(([key, val]) =>
                      key.startsWith('filter[q]')
                        ? `${key}=${encodeURIComponent(val)}`
                        : `${key}=${val}`
                    )
                    .join('&');

                  window.history.replaceState({}, '', '?' + searchString);
                }}
                loading={loading}
                pageSize={limit}
                pageCount={pageCount}
                error={error}
                currentPageIndex={currentPageIndex}
                prospectActions={prospectActions}
                handleRowToolbarButton={handleRowToolbarButtonAction}
                handleRefresh={refreshProspectsGrid}
                handleSort={(sortBy, orderBy) => {
                  setSortBy(sortBy);
                  setOrderBy(orderBy ? 'desc' : 'asc');
                }}
                sortBy={sortBy}
                orderBy={orderBy}
                handleIntermediateCheck={handleIntermediateCheck}
                totalCount={totalProspectCount}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <AddProspectModal
        currentUserId={currentUserId}
        handleAction={(input) => {
          addProspect({
            variables: {
              input: [input],
            },
          });
        }}
        hideModal={() => {
          setShowAddPorspectModal(false);
        }}
        showModal={showAddPorspectModal}
        showActionBtnSpinner={addProspectLoading}
      />

      {showAssignPorspectToCadenceModal && (
        <AssignProspectToCadenceModal
          actionBtnIcon="fas fa-plus"
          actionBtnText="Start Cadence"
          currentUserId={
            selectedUserIdRef.current
              ? parseInt(selectedUserIdRef.current)
              : currentUserId
          }
          handleShowHideModal={() => {
            setShowAssignPorspectToCadenceModal(false);
          }}
          handleAction={(cadenceId, cadenceName) => {
            setScheduledCadence(cadenceId);
            setScheduledCadenceName(cadenceName);
            const input = {};
            if (
              user &&
              (user.isManagerUser === 'Y' || user.isAdminUser === 'Y') &&
              selectedUserId !== currentUserId
            ) {
              input['user'] = { id: selectedUserIdRef.current };
            }
            if (assignAllCadence) {
              input['user'] = { id: selectedUserIdRef.current };
              const { query } = parseUrl(window.location.search);
              const quickSearch =
                query['filter[q]'] === undefined
                  ? ''
                  : '?filter[q]=' + searchInput;
              const filterCriteria =
                query['filter[filterCriteriaId]'] === undefined
                  ? ''
                  : (quickSearch === '' ? '?' : '&') +
                    'filter[filterCriteriaId]=' +
                    parseInt(query['filter[filterCriteriaId]']);
              assignAll({
                variables: {
                  cadenceId: cadenceId,
                  prospectFilter: `${quickSearch}${filterCriteria}`,
                  input,
                },
                context: {
                  timeout:
                    lookupData && lookupData['import_ajax_timeout']
                      ? parseInt(lookupData['import_ajax_timeout'])
                      : 300000,
                },
              });
            } else {
              assignProspectToCadence({
                variables: {
                  prospectId:
                    intermediateCheckedData.length > 0
                      ? intermediateCheckedData.join(',')
                      : currentProspect.id,
                  cadenceId,
                  input,
                },
              });
            }
          }}
          modalHeader="Assign Prospect to Cadence"
          prospect={currentProspect}
          showActionBtnSpinner={
            assignProspectToCadenceLoading || showAssignAllActionBtnSpinner
          }
          showModal={showAssignPorspectToCadenceModal}
          selectedRowCount={
            assignAllCadence
              ? totalProspectCount
              : intermediateCheckedData.length
          }
          selectedUserName={
            selectedUserIdRef.current !== currentUserId ? selectedUserName : ''
          }
          isUserChanged={isUserChanged}
          handleActionResetUserChange={() => {
            setIsUserChanged(false);
          }}
        />
      )}
      {showMoveProspectToCadenceModal && (
        <MoveProspectToCadenceModal
          actionBtnIcon="fas fa-arrows-alt"
          actionBtnText="Move"
          currentUserId={selectedUserIdRef.current}
          handleShowHideModal={() => {
            setShowMoveProspectToCadenceModal(false);
          }}
          handleAction={(id, name) => {
            setScheduledCadence(id);
            setScheduledCadenceName(name);
            setShowMoveProspectToCadenceModal(false);
            setShowMoveProspectConfirmModal(true);
            setSelectedCadence({ id, name });
          }}
          modalHeader="Move to Another Cadence"
          prospect={currentProspect}
          showActionBtnSpinner={moveProspectToCadenceLoading}
          showModal={showMoveProspectToCadenceModal}
          selectedRowCount={intermediateCheckedData.length}
          selectedUserName={
            selectedUserIdRef.current !== currentUserId ? selectedUserName : ''
          }
          isUserChanged={isUserChanged}
          handleActionResetUserChange={() => {
            setIsUserChanged(false);
          }}
        />
      )}

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        header="Move to Another Cadence"
        confirmBtnText="OK"
        handleConfirm={() => {
          const input = {};
          if (
            user &&
            (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
          ) {
            input['userId'] = selectedUserIdRef.current;
          }
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
        <span>
          Are you sure you want to move the selected prospect(s) to{' '}
          <b>{selectedCadence && selectedCadence.name}</b>?
        </span>
      </ConfirmModal>
      {showTagProspectModal && (
        <TagProspectModal
          selectedUserId={selectedUserIdRef.current}
          handleAction={handleTagAction}
          hideModal={() => {
            setShowTagProspectModal(false);
            setIsRefreshTagList(false);
          }}
          prospect={currentProspect}
          showActionBtnSpinner={tagProspectLoading}
          showModal={showTagProspectModal}
          isRefreshTagList={isRefreshTagList}
        />
      )}

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => setShowTagConfirmModal(false)}
        handleConfirm={() => {
          setShowTagConfirmModal(false);
          tagProspect({
            variables: {
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
              input: { tags: tagIds },
            },
          });
        }}
        showConfirmModal={showTagConfirmModal}
        showConfirmBtnSpinner={tagProspectLoading}
        header="Tag Prospect(s)"
      >
        <p>
          Are you sure you want to assign this tag{' '}
          <b>
            {tagLabel
              ? tagLabel
              : currentProspect.tagNames
              ? currentProspect.tagNames.join(',')
              : ''}
          </b>{' '}
          to{' '}
          <b>
            {intermediateCheckedData.length === 0
              ? 1
              : intermediateCheckedData.length}
          </b>{' '}
          prospect(s)?
        </p>
      </ConfirmModal>
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
            input['userId'] = selectedUserIdRef.current;
          }

          resumeProspect({
            variables: {
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
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
          {selectedUserIdRef.current !== currentUserId && (
            <p>
              <span className="bg-color-yellow">
                Resume Prospect(s) on behalf of <b>{selectedUserName}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-sign-out-alt"
        confirmBtnText="Exit"
        confirmBtnColor="danger"
        header="Remove Prospect(s) From Cadence"
        handleCancel={() => {
          setShowExitProspectConfirmModal(false);
        }}
        handleConfirm={() => {
          const input = {};
          if (
            user &&
            (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
          ) {
            input['userId'] = selectedUserIdRef.current;
          }

          exitProspect({
            variables: {
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
              input,
            },
          });
        }}
        showConfirmBtnSpinner={exitProspectLoading}
        showConfirmModal={showExitProspectConfirmModal}
      >
        <div>
          <span>
            Are you sure you want to remove the selected prospect(s) from the
            assigned cadence?
          </span>
          {selectedUserIdRef.current !== currentUserId && (
            <p>
              <span className="bg-color-yellow">
                Exit Prospect(s) on behalf of <b>{selectedUserName}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        confirmBtnColor="danger"
        handleCancel={() => setShowDeleteProspectConfirmModal(false)}
        handleConfirm={() =>
          deleteProspect({
            variables: {
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
              currentUserId: selectedUserId,
            },
          })
        }
        showConfirmBtnSpinner={deleteProspectLoading}
        showConfirmModal={showDeleteProspectConfirmModal}
        header="Delete Prospect(s)"
      >
        <div className="text-center">
          <p>
            Are you sure you want to delete{' '}
            <b>
              {intermediateCheckedData.length === 0
                ? 1
                : intermediateCheckedData.length}
            </b>{' '}
            prospect(s)?
          </p>
          <p>
            Once prospect(s) are deleted, all the associated activities will be
            deleted. Please confirm.
          </p>
          {selectedUserIdRef.current !== currentUserId && (
            <span className="bg-color-yellow">
              Delete Prospect(s) on behalf of <b>{selectedUserName}</b>
            </span>
          )}
        </div>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-upload"
        confirmBtnText="Upload"
        confirmBtnColor="primary"
        handleCancel={() => setShowConfirmUploadModal(false)}
        handleConfirm={() => {
          const { query } = parseUrl(window.location.search);
          const searchText =
            query['filter[q]'] === undefined
              ? ''
              : `filter[q]=${query['filter[q]']}`;
          const filterCriteria =
            query['filter[filterCriteriaId]'] === undefined
              ? ''
              : `${searchText ? '&' : ''}filter[filterCriteriaId]=${parseInt(
                  query['filter[filterCriteriaId]']
                )}`;
          const input = {};

          input['userId'] = selectedUserIdRef.current;
          let prospectIds = '';

          if (intermediateCheckedData.length > 0) {
            const selectedProspectIds = intermediateCheckedData.join(',');
            prospectIds =
              intermediateCheckedData.length > 1
                ? `filter[id]=:[${selectedProspectIds}]`
                : `filter[id]=${selectedProspectIds}`;
            if (lookupData?.lookup?.data) {
              uploadProspect({
                variables: {
                  input,
                  quickSearch: prospectIds,
                },
                context: {
                  timeout: parseInt(lookup.import_ajax_timeout),
                },
              });
            }
          } else if (searchText || filterCriteria) {
            if (lookupData?.lookup?.data) {
              uploadProspect({
                variables: {
                  input,
                  quickSearch: `${searchText}${filterCriteria}`,
                },
                context: {
                  timeout: parseInt(lookup.import_ajax_timeout),
                },
              });
            }
          }
        }}
        showConfirmBtnSpinner={uploadProspectsLoading}
        showConfirmModal={showConfirmUploadModal}
        header="Upload Prospect(s)"
      >
        <div className="text-center">
          <p>
            Are you sure you want to upload{' '}
            <b>
              {intermediateCheckedData.length === 0
                ? totalProspectCount
                  ? totalProspectCount
                  : 'selected'
                : intermediateCheckedData.length}
            </b>{' '}
            prospect(s) to My Session?
          </p>
        </div>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-file-export"
        confirmBtnText="Export"
        confirmBtnColor="primary"
        handleCancel={() => setShowConfirmExportModal(false)}
        handleConfirm={() => {
          const filterCriteriaId = searchParams['filter[filterCriteriaId]']
            ? parseInt(searchParams['filter[filterCriteriaId]'])
            : '';
          const searchQuery = searchParams['filter[q]']
            ? searchParams['filter[q]']
            : '';

          fetchSignedKeyExport({
            variables: {
              input: {
                filterCriteria: {
                  id: filterCriteriaId,
                },
                searchValue: searchQuery,
                user: {
                  id: selectedUserId,
                },
              },
            },
          });
        }}
        showConfirmBtnSpinner={exportSignedKeyLoading}
        showConfirmModal={showConfirmExportModal}
        header="Upload Prospect(s)"
      >
        <div className="text-center">
          <p>
            Are you sure you want to export{' '}
            <b>{totalProspectCount ? totalProspectCount : 'selected'}</b>{' '}
            prospect(s) as CSV?
          </p>
          {selectedUserIdRef.current !== currentUserId && (
            <span className="bg-color-yellow">
              Export Prospect(s) on behalf of <b>{selectedUserName}</b>
            </span>
          )}
        </div>
      </ConfirmModal>

      <ConfirmExportModal
        handleCancel={() => {
          setShowExportProspectConfirmModal(false);
        }}
        handleConfirm={() => {
          refreshProspectsCountAndGrid();
          setShowExportProspectConfirmModal(false);
        }}
        fieldMappingData={fieldsData}
        data={selectedProspectsData}
        showConfirmModal={showExportProspectConfirmModal}
        header="Export Prospect(s) as CSV"
      >
        <div className="text-center">
          <p>
            Are you sure you want to export{' '}
            <b>
              {intermediateCheckedData.length === 0
                ? 1
                : intermediateCheckedData.length}
            </b>{' '}
            prospect(s) as CSV?
          </p>
        </div>
      </ConfirmExportModal>

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
            input['userId'] = selectedUserIdRef.current;
          }
          pauseProspect({
            variables: {
              input,
              prospectId:
                intermediateCheckedData.length > 0
                  ? intermediateCheckedData.join(',')
                  : currentProspect.id,
            },
          });
        }}
        showConfirmBtnSpinner={pauseProspectLoading}
        selectedUserName={
          selectedUserIdRef.current !== currentUserId ? selectedUserName : ''
        }
      ></PauseProspectsModal>
      <AlertPopupModal
        showAlertPopupModal={showAlertPopupModal}
        alertBtnText="OK"
        alertBtnIcon="fas fa-check"
        handleClose={() => setShowAlertPopupModal(false)}
      >
        <span>
          <i className="fas fa-exclamation-circle text-warning fa-lg mr-2"></i>{' '}
          {popupMessage}
        </span>
      </AlertPopupModal>
      <CreateFilterModal
        hideModal={() => {
          setShowFilterModal(false);
        }}
        showModal={showFilterModal}
        assignedUsersData={sharedWithUsers}
        fieldsList={fieldsData}
        currentFilter={currentFilter}
        handleActionAddCriteria={handleActionAddCriteria}
        handleCriteriaFieldsChange={handleCriteriaFieldsChange}
        handleActionDeleteRow={handleActionDeleteRow}
        handleActionRefetchFilter={() => {
          refetchFilters();
          refreshProspectsGrid();
        }}
        user={user}
      ></CreateFilterModal>
      <ImportCsvModal
        hideModal={() => {
          setShowImportModal(false);
        }}
        showModal={showImportModal}
        currentUserId={currentUserId}
        selectedUserId={selectedUserIdRef.current}
        fieldsList={fieldsList}
        handleAction={() => {
          if (sortBy === 'updatedDate') {
            refreshProspectsCountAndGrid();
          } else {
            setSortBy('updatedDate');
            setOrderBy('desc');
          }
        }}
        assignedUsersData={assignedUsersData}
        lookupData={lookup}
        isRefreshTagList={isRefreshTagList}
        handleRefreshTag={() => {
          setIsRefreshTagList(true);
        }}
      ></ImportCsvModal>
      <ImportCrmModal
        hideCrmModal={(refreshFlg) => {
          setShowImportCrmModal(false);
          if (refreshFlg && sortBy === 'updatedDate') {
            refreshProspectsCountAndGrid();
          } else if (refreshFlg) {
            setSortBy('updatedDate');
            setOrderBy('desc');
          }
        }}
        showImportCrmModal={showImportCrmModal}
        currentUserId={currentUserId}
        selectedUserId={selectedUserIdRef.current}
        isRefreshTagList={isRefreshTagList}
        lookupData={lookup}
        handleRefreshTag={() => {
          setIsRefreshTagList(true);
        }}
      ></ImportCrmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        header="Alert!"
        handleCancel={() => {
          setShowPauseProspectPopupModal(false);
        }}
        handleConfirm={() => {
          handleRowToolbarButton(action, currentProspect);
        }}
        showConfirmModal={showPauseProspectPopupModal}
      >
        <span>{pausePopupMessage}</span>
      </ConfirmModal>
      <EmailsModal
        showModal={showSendOneOffEmail}
        hideModal={() => setShowSendOneOffEmail(false)}
        type="sendOneOff"
        prospectId={currentProspect.id}
        currentUserId={currentUserId} //logged in user
        userId={user.isManagerUser === 'Y' ? currentUserId : 0} // if manager pass user id as 0 otherwise pass userid
        dropdownUserId={selectedUserIdRef.current} // selected dropdown user in the relevent parent page
        mailMergeVariables={mailMergeVariables}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-forward"
        header="Skip Touch"
        confirmBtnText="OK"
        handleCancel={() => {
          setShowSkipTouchToCadenceModal(false);
        }}
        handleConfirm={() => {
          setShowSkipTouchToCadenceModal(false);
          const cadenceId =
            currentProspect &&
            currentProspect.associations &&
            currentProspect.associations.cadence &&
            currentProspect.associations.cadence.length > 0
              ? currentProspect.associations.cadence[0].id
              : '';
          if (cadenceId) {
            const input = {
              prospectsIds:
                currentProspect.id + '-' + currentProspect.currentTouchId,
              cadence: { id: cadenceId },
            };

            if (
              user &&
              (user.isManagerUser === 'Y' || user.isAdminUser === 'Y')
            ) {
              input['userId'] = selectedUserIdRef.current;
            }

            skipTouch({
              variables: {
                input,
              },
            });
          }
        }}
        showConfirmBtnSpinner={skipTouchLoading}
        showConfirmModal={showSkipTouchToCadenceModal}
      >
        <div>
          <span>
            Are you sure you want to skip the current touch and move this
            prospect to next touch?.
          </span>
          {selectedUserName && selectedUserIdRef.current !== currentUserId && (
            <p>
              <span className="bg-color-yellow">
                Skip Prospect(s) on behalf of <b>{selectedUserName}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-edit"
        header="Alert"
        confirmBtnText="Edit this Cadence"
        showConfirmModal={showScheduleConfirmModal}
        handleCancel={() => {
          setShowScheduleConfirmModal(false);
        }}
        handleConfirm={() => {
          history.push({
            pathname: '/cadences/' + scheduledCadence + '/touches/view',
            search: `${window.location.search}&cadence[name]=${scheduledCadenceName}&not=1`,
            state: {
              origin: window.location.pathname,
            },
          });
        }}
      >
        <span>
          This cadence contains an Email Touch with a scheduled time which has
          already passed. Please update the touch to proceed.
        </span>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        header="Delete Prospect(s)"
        handleCancel={() => {
          setShowDeleteLimitConfirm(false);
        }}
        handleConfirm={() => {
          setShowDeleteAllConfirmModal(true);
          setShowDeleteLimitConfirm(false);
        }}
        showConfirmModal={showDeleteLimitConfirm}
      >
        <div>
          <span>
            Only
            <b className="mr-1">
              <strong className="mr-1 ml-1">
                {lookup.bulk_prospects_delete_limit
                  ? parseInt(lookup.bulk_prospects_delete_limit) <
                    totalProspectCount
                    ? lookup.bulk_prospects_delete_limit
                    : totalProspectCount
                  : totalProspectCount}
              </strong>
            </b>
            prospects can be deleted at a time. Click OK to continue?
          </span>
        </div>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        header="Alert!"
        handleCancel={() => {
          setShowDeleteAll(false);
        }}
        handleConfirm={() => {
          setShowDeleteAllConfirmModal(true);
          setShowDeleteAll(false);
        }}
        showConfirmModal={showDeleteAll}
      >
        <div>
          <span>
            Are you sure you want to delete the selected prospect(s)? Once
            deleted, all activities for the prospect(s) will be removed.
          </span>
          {selectedUserIdRef.current !== currentUserId && (
            <p className="mb-2">
              <span className="bg-color-yellow">
                Delete Prospect(s) on behalf of <b>{selectedUserName}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        header="Confirmation!"
        handleCancel={() => {
          setShowAssignAll(false);
        }}
        handleConfirm={() => {
          setAssignAllCadence(true);
          setShowAssignPorspectToCadenceModal(true);
          setShowAssignAll(false);
        }}
        showConfirmModal={showAssignAll}
      >
        <div>
          <span>
            You are trying to assign <b>{totalProspectCount}</b> Prospects to a
            Cadence. Are you sure you want to continue?
          </span>
          {selectedUserIdRef.current !== currentUserId && (
            <p className="mb-2">
              <span className="bg-color-yellow">
                Assign Prospect(s) on behalf of <b>{selectedUserName}</b>
              </span>
            </p>
          )}
        </div>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon={
          deleteAllLoading ? 'fas fa-spinner fa-spin' : 'fas fa-check'
        }
        confirmBtnText={deleteAllLoading ? 'Wait...' : 'OK'}
        header="Delete Prospects(s)"
        handleCancel={() => {
          setShowDeleteAllConfirmModal(false);
        }}
        handleConfirm={() => {
          const { query } = parseUrl(window.location.search);
          const quickSearch =
            query['filter[q]'] === undefined ? '' : '&filter[q]=' + searchInput;
          const filterCriteria =
            query['filter[filterCriteriaId]'] === undefined
              ? ''
              : '&filter[filterCriteriaId]=' +
                parseInt(query['filter[filterCriteriaId]']);
          const limit = lookup.bulk_prospects_delete_limit
            ? parseInt(lookup.bulk_prospects_delete_limit)
            : totalProspectCount;
          deleteAll({
            variables: {
              prospectFilter: `filter[user][id]=${selectedUserId}${quickSearch}${filterCriteria}&page[limit]=${limit}`,
            },
            context: {
              timeout:
                lookupData && lookupData['import_ajax_timeout']
                  ? parseInt(lookupData['import_ajax_timeout'])
                  : 300000,
            },
          });
        }}
        showConfirmModal={showDeleteAllConfirmModal}
      >
        <span>
          You are about to delete
          <b className="mr-1 ml-1">
            {lookup.bulk_prospects_delete_limit
              ? parseInt(lookup.bulk_prospects_delete_limit) <
                totalProspectCount
                ? lookup.bulk_prospects_delete_limit
                : totalProspectCount
              : totalProspectCount}
          </b>
          prospect(s). All history activities will get deleted from Cadence. Do
          you wish to continue?
        </span>
      </ConfirmModal>

      <TransferOwnershipModal
        hideModal={() => {
          setShowTransferOwnershipModal(false);
        }}
        showModal={showTransferOwnershipModal}
        showActionBtnSpinner={transferOwnershipLoading}
        handleAction={handleSaveTransferOwnership}
        responseError={responseError}
        selectedUserId={
          selectedUserIdRef.current
            ? parseInt(selectedUserIdRef.current)
            : currentUserId
        }
        selectedUserName={
          selectedUserIdRef.current !== currentUserId ? selectedUserName : ''
        }
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText={transferOwnershipLoading ? 'Wait...' : 'OK'}
        handleCancel={() => setShowConfirmTransferOwnershipModal(false)}
        showConfirmModal={showConfirmTransferOwnershipModal}
        handleConfirm={() => {
          const input = transferData;
          const searchText = searchParams['filter[q]']
            ? `filter[q]=${searchParams['filter[q]']}`
            : '';
          let criteriaFilter = searchParams['filter[filterCriteriaId]']
            ? `filter[filterCriteriaId]=${parseInt(
                searchParams['filter[filterCriteriaId]']
              )}`
            : '';
          criteriaFilter =
            searchText && criteriaFilter
              ? `&${criteriaFilter}`
              : criteriaFilter;
          if (intermediateCheckedData.length > 0) {
            transferOwnership({
              variables: {
                input,
                quickSearch: `filter[id]=:[${intermediateCheckedData.join(
                  ','
                )}]`,
              },
            });
          } else if (searchText || criteriaFilter) {
            transferOwnership({
              variables: { input, quickSearch: searchText + criteriaFilter },
            });
          }
        }}
        confirmBtnColor="primary"
        showConfirmBtnSpinner={transferOwnershipLoading}
      >
        <span>
          Are you sure you want to transfer{' '}
          <b>{intermediateCheckedData.length || totalProspectCount}</b>{' '}
          prospect(s) from {fromUserName} to {toUserName}?
        </span>
      </ConfirmModal>
    </ContentWrapper>
  );
};
// This is required for redux
const mapStateToProps = (state) => ({
  pinnedFilterButton: state.settings.prospectsPinnedFilterButton,
});

// This is required for redux
export default connect(mapStateToProps, { changeSetting })(Prospects);
