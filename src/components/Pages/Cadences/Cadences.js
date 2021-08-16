import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ContentWrapper, PageLoader } from '@nextaction/components';
import { parseUrl } from 'query-string';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  CustomInput,
  FormGroup,
  InputGroup,
  Row,
  Tooltip,
} from 'reactstrap';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { changeSetting, getAllCadences } from '../../../store/actions/actions';
import { copyToClipboard, notify, showErrorMessage } from '../../../util/index';
import ConfirmModal from '../../Common/ConfirmModal';
import FilterButton from '../../Common/FilterButton';
import PageHeader from '../../Common/PageHeader';
import SearchBar from '../../Common/SearchBar';
import UserList from '../../Common/UserList';
import FETCH_CADENCES_QUERY, {
  CLONE_CADENCE_QUERY,
  DELETE_CADENCE_QUERY,
  DISABLE_CADENCE_QUERY,
  FETCH_CADENCES_COUNT_QUERY,
  SET_FAVORITE_CADENCE_QUERY,
} from '../../queries/CadenceQuery';
import { GET_LOOKUP_VALUE_QUERY } from '../../queries/PendingCallsQuery';
import UserContext from '../../UserContext';
import CadencesGrid from './CadencesGrid';
import CloneCadenceModel from './CloneCadenceModel';
import SampleCadencesModel from './SampleCadencesModel';

toast.configure();

const Cadences = ({
  location,
  pinnedFilterButton,
  changeSetting,
  getAllCadences,
}) => {
  const [handleRefetch, setHandleRefetch] = useState(
    location.state ? location.state.handleRefetch : false
  );
  const { query: searchParams } = parseUrl(window.location.search);

  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const canCreateCadence = !userLoading && user.hasCreateCadence;
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const sortingParams = {
    name: 'sort[name]',
    owner: 'sort[user][name]',
    status: 'sort[status]',
    updatedDate: 'sort[updatedDate]',
  };
  const urlReqParmater = Object.entries({
    ...searchParams,
  })
    .filter(([key]) => key.startsWith('sort'))
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  let sortByUrlParam;
  let orderByUrlParam;
  if (urlReqParmater && urlReqParmater.includes('sort[')) {
    sortByUrlParam =
      'sort' +
      urlReqParmater
        .match(/\[.*?\]/g)
        .map((x) => x)
        .join('');
    orderByUrlParam = urlReqParmater.split('=')[1] || '';
    sortByUrlParam = Object.entries({
      ...sortingParams,
    })
      .filter((data) => data[1] === sortByUrlParam)
      .map((data) => data[0])
      .join();

    if (!sortByUrlParam) {
      sortByUrlParam = 'updatedDate';
    }

    if (['asc', 'desc'].indexOf(orderByUrlParam.toLowerCase()) === -1) {
      orderByUrlParam = 'desc';
    }
  }
  const [previousSortParam, setPreviousSortParam] = useState(
    sortByUrlParam || 'updatedDate'
  );
  const [sortBy, setSortBy] = useState(sortByUrlParam || 'updatedDate');
  const [orderBy, setOrderBy] = useState(orderByUrlParam || 'desc');

  const [currentUser, setCurrentUser] = useState(
    searchParams['filter[user][id]']
      ? parseInt(searchParams['filter[user][id]'])
      : currentUserId
  );
  const [selectedUser, setSelectedUser] = useState(
    searchParams['filter[user][id]']
      ? parseInt(searchParams['filter[user][id]'])
      : currentUserId
  );
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';

  const filterButtons = ['ALL', 'ACTIVE', 'NEW', 'INACTIVE', 'PAUSED'];
  const [limit, setLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [searchInput, setSearchInput] = useState(
    searchParams['filter[name]'] ? searchParams['filter[name]'] : ''
  );
  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [activeList, setActiveList] = useState(
    searchParams['filter[status]']
      ? searchParams['filter[status]']
      : pinnedFilterButton
      ? pinnedFilterButton
      : 'ACTIVE'
  );

  const sharedTypeCheck = searchParams['filter[shared]'] && true;

  const [shared, setShared] = useState(sharedTypeCheck);
  const [cadencesResponse, setCadencesResponse] = useState();
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [toggle, settoggle] = useState(
    searchParams['filter[shared]']
      ? searchParams['filter[shared]'] === 'true'
        ? true
        : false
      : false
  );

  const cadenceFilterQuery =
    activeList !== 'ALL'
      ? `&filter[status]=${activeList}&filter[user][id]=${
          currentUser ? currentUser : currentUserId
        }&sort[${sortBy}]=${orderBy}`
      : `&filter[user][id]=${
          currentUser ? currentUser : currentUserId
        }&sort[${sortBy}]=${orderBy}`;

  const [cadenceFilter, setCadenceFilter] = useState(
    searchInput
      ? `&filter[name]=${searchInput}` + cadenceFilterQuery
      : cadenceFilterQuery
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );

  const [currentCadence, setCurrentCadence] = useState({});
  const [currentCadenceStatus, setCurrentCadenceStatus] = useState('');
  const [inactiveDeleteFirstConfirm, setInactiveDeleteFirstConfirm] = useState(
    false
  );
  const [
    inactiveDeleteSecondConfirm,
    setInactiveDeleteSecondConfirm,
  ] = useState(false);
  const [inactiveDeleteThirdConfirm, setInactiveDeleteThirdConfirm] = useState(
    false
  );
  const [
    showDeleteCadenceConfirmModal,
    setShowDeleteCadenceConfirmModal,
  ] = useState(false);
  const [
    showCloneCadenceConfirmModal,
    setShowCloneCadenceConfirmModal,
  ] = useState(false);
  const [showSampleCadenceModal, setShowSampleCloneCadenceModal] = useState(
    false
  );
  const [
    showDisableCadenceConfirmModal,
    setShowDisableCadenceConfirmModal,
  ] = useState(false);
  const [
    showActivateCadenceConfirmModal,
    setShowActivateCadenceConfirmModal,
  ] = useState(false);
  const [
    showPauseCadenceConfirmModal,
    setShowPauseCadenceConfirmModal,
  ] = useState(false);
  const [
    showResumeCadenceConfirmModal,
    setShowResumeCadenceConfirmModal,
  ] = useState(false);

  const [
    showPauseCadenceFirstConfirmModal,
    setShowPauseCadenceFirstConfirmModal,
  ] = useState(false);
  const [
    showPauseCadenceSecondConfirmModal,
    setShowPauseCadenceSecondConfirmModal,
  ] = useState(false);

  const [
    showResumeCadenceFirstConfirmModal,
    setShowResumeCadenceFirstConfirmModal,
  ] = useState(false);

  const [
    showResumeCadenceSecondConfirmModal,
    setShowResumeCadenceSecondConfirmModal,
  ] = useState(false);
  const [searchKey, setSearchKey] = useState('');

  const cadenceActions = {
    EDIT: 'EDIT',
    CLONE: 'CLONE',
    VIEW: 'VIEW',
    DISABLE: 'DISABLE',
    DELETE: 'DELETE',
    RESUME: 'RESUME',
    PAUSE: 'PAUSE',
  };

  // fetching counts
  const {
    data: fetchCadencesCountData,
    loading: fetchCadencesCountLoading,
    error: fetchCadencesCountError,
    refetch: refetchCadencesCount,
  } = useQuery(FETCH_CADENCES_COUNT_QUERY, {
    variables: {
      userFilter: `filter[user][id]=${selectedUser}${
        toggle ? '&filter[shared]=true' : ''
      }`,
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: cadenceData,
    loading,
    error,
    refetch: refetchCadencesGrid,
  } = useQuery(FETCH_CADENCES_QUERY, {
    variables: {
      includeAssociationsQry: 'includeAssociations[]=user',
      limit,
      offset,
      cadenceFilter,
    },
    onError: (response) => {
      setCadencesResponse(response?.graphQLErrors[0]?.message);
    },
    notifyOnNetworkStatusChange: true,
  });

  const { data: lookupData } = useQuery(GET_LOOKUP_VALUE_QUERY, {
    variables: {
      lookupsFilter: `filter[lookupName]=import_ajax_timeout`,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const refreshCadencesCountAndGrid = () => {
    refetchCadencesGrid();
    refetchCadencesCount();
  };

  if (handleRefetch) {
    refreshCadencesCountAndGrid();
    setHandleRefetch(false);
  }

  const handleClose = (flag) => {
    setShowSampleCloneCadenceModal(flag);
  };

  const [
    deleteCadence,
    { data: deleteCadenceData, loading: deleteCadenceLoading },
  ] = useLazyQuery(DELETE_CADENCE_QUERY, {
    onCompleted: (response) =>
      handleDeleteCadenceRequestCallback(response, true),
    onError: (response) =>
      handleDeleteCadenceRequestCallback(response, false, deleteCadenceData),
  });

  const [
    cloneCadence,
    { data: cloneCadenceData, loading: cloneCadenceLoading },
  ] = useLazyQuery(CLONE_CADENCE_QUERY, {
    onCompleted: (response) =>
      handleCloneCadenceRequestCallback(response, true),
    onError: (response) =>
      handleCloneCadenceRequestCallback(response, false, cloneCadenceData),
  });

  const [
    disableCadence,
    { data: disableCadenceData, loading: disableCadenceLoading },
  ] = useLazyQuery(DISABLE_CADENCE_QUERY, {
    onCompleted: (response) =>
      handleDisableCadenceRequestCallback(response, true),
    onError: (response) =>
      handleDisableCadenceRequestCallback(response, false, disableCadenceData),
    context: {
      timeout: lookupData?.lookup?.data[0]?.lookupValue || 300000,
    },
  });

  const [
    activateCadence,
    { data: activateCadenceData, loading: activateCadenceLoading },
  ] = useLazyQuery(DISABLE_CADENCE_QUERY, {
    onCompleted: (response) =>
      handleActivateCadenceRequestCallback(response, true),
    onError: (response) =>
      handleActivateCadenceRequestCallback(
        response,
        false,
        activateCadenceData
      ),
  });

  const [
    pauseCadence,
    { data: pauseCadenceData, loading: pauseCadenceLoading },
  ] = useLazyQuery(DISABLE_CADENCE_QUERY, {
    onCompleted: (response) =>
      handlePauseCadenceRequestCallback(response, true),
    onError: (response) =>
      handlePauseCadenceRequestCallback(response, false, pauseCadenceData),
  });

  const [
    resumeCadence,
    { data: resumeCadenceData, loading: resumeCadenceLoading },
  ] = useLazyQuery(DISABLE_CADENCE_QUERY, {
    onCompleted: (response) =>
      handleResumeCadenceRequestCallback(response, true),
    onError: (response) =>
      handleResumeCadenceRequestCallback(response, false, resumeCadenceData),
  });

  const [
    pauseOtherUserCadence,
    { data: pauseOtherUserCadenceData, loading: pauseOtherUserCadenceLoading },
  ] = useLazyQuery(DISABLE_CADENCE_QUERY, {
    onCompleted: (response) => handlePauseCadence(response, true),
    onError: (response) =>
      handlePauseCadence(response, false, pauseOtherUserCadenceData),
  });

  const [
    resumeOtherUserCadence,
    {
      data: resumeOtherUserCadenceData,
      loading: resumeOtherUserCadenceLoading,
    },
  ] = useLazyQuery(DISABLE_CADENCE_QUERY, {
    onCompleted: (response) => handleResumeCadence(response, true),
    onError: (response) =>
      handleResumeCadence(response, false, resumeOtherUserCadenceData),
  });

  const [setFavoriteCadence, { data: setFavoriteCadenceData }] = useLazyQuery(
    SET_FAVORITE_CADENCE_QUERY,
    {
      onError: (response) =>
        showErrorMessage(
          error,
          'Sorry! Failed to mark cadence as favorite',
          setFavoriteCadenceData,
          'set_favorite_cadence'
        ),
    }
  );

  const handleRowToolbarButton = (action, cadence) => {
    const ownerId = cadence?.associations?.user[0]?.id;
    setCurrentCadence(cadence);
    switch (action) {
      case cadenceActions.DELETE:
        if (cadence.status === 'ACTIVE') {
          notify(
            'Cadence cannot be deleted as the status is active. You can deactivate this Cadence.',
            'error',
            'delete_active_cadence'
          );
        } else if (cadence.status === 'INACTIVE') {
          setInactiveDeleteFirstConfirm(true);
        } else {
          setShowDeleteCadenceConfirmModal(true);
        }
        break;
      case cadenceActions.CLONE:
        setShowCloneCadenceConfirmModal(true);
        break;
      case cadenceActions.DISABLE:
        if (cadence.status === 'ACTIVE') {
          setShowDisableCadenceConfirmModal(true);
          setCurrentCadenceStatus('INACTIVE');
        } else {
          setShowActivateCadenceConfirmModal(true);
          setCurrentCadenceStatus('ACTIVE');
        }
        break;
      case cadenceActions.PAUSE:
        if (ownerId === currentUserId) {
          setShowPauseCadenceConfirmModal(true);
        } else {
          setShowPauseCadenceFirstConfirmModal(true);
        }
        break;
      default:
        if (ownerId === currentUserId) {
          setShowResumeCadenceConfirmModal(true);
        } else {
          setShowResumeCadenceFirstConfirmModal(true);
        }
        break;
    }
  };

  const handleDeleteCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Cadence has been deleted!', 'success', 'delete_cadence');
      refreshCadencesCountAndGrid();
      if (showDeleteCadenceConfirmModal) {
        setShowDeleteCadenceConfirmModal(false);
      } else {
        setInactiveDeleteThirdConfirm(false);
      }

      getAllCadences(currentUserId, apiURL, token);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete this Cadence',
        errorData,
        'delete_cadence'
      );
    }
  };

  const jobQueueSuccessMessage = (message, requestId, messageId) => {
    const successFormat = (
      <>
        <h6>{message}</h6>
        {requestId && (
          <>
            <br />
            <span>RequestId: {requestId}</span>
            <i
              className="fas fa-copy ml-2 text-light"
              title="Copy Request ID"
              onClick={() => copyToClipboard(requestId)}
            ></i>
          </>
        )}
      </>
    );
    return notify(successFormat, 'success', messageId);
  };
  const handleDisableCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      jobQueueSuccessMessage(
        'Your request has been submitted for processing.',
        response?.disablecadence?.requestId,
        'disable_cadence'
      );
      refreshCadencesCountAndGrid();
      setShowDisableCadenceConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to deactivate this Cadence',
        errorData,
        'disable_cadence'
      );
    }
  };

  const handleActivateCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify(
        'Success! Cadence has been marked as active',
        'success',
        'activate_cadence'
      );
      refreshCadencesCountAndGrid();
      setShowActivateCadenceConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to activate this Cadence',
        errorData,
        'activate_cadence'
      );
    }
  };

  const handlePauseCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Cadence has been paused', 'success', 'pause_cadence');
      refreshCadencesCountAndGrid();
      setShowPauseCadenceConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to pause this Cadence',
        errorData,
        'pause_cadence'
      );
    }
  };

  const handleResumeCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Cadence has been resumed', 'success', 'resume_cadence');
      refreshCadencesCountAndGrid();
      setShowResumeCadenceConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to resume this Cadence',
        errorData,
        'resume_cadence'
      );
    }
  };

  const handleCloneCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify(
        'Cadence has been saved successfully!',
        'success',
        'clone_cadence'
      );
      refreshCadencesCountAndGrid();
      setShowCloneCadenceConfirmModal(false);
      getAllCadences(currentUserId, apiURL, token);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to clone this Cadence',
        errorData,
        'clone_cadence'
      );
    }
  };

  const handlePauseCadence = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Cadence has been paused', 'success', 'pause_cadence');
      refreshCadencesCountAndGrid();
      setShowPauseCadenceSecondConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to pause this Cadence',
        errorData,
        'pause_cadence'
      );
    }
  };

  const handleResumeCadence = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Cadence has been resumed', 'success', 'resume_cadence');
      refreshCadencesCountAndGrid();
      setShowResumeCadenceSecondConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to resume this Cadence',
        errorData,
        'resume_cadence'
      );
    }
  };

  const handleCadenceTabChange = (e) => {
    e.preventDefault();
    const tabValue = e.currentTarget.getAttribute('data-tab-value');
    setActiveList(tabValue);
    setOffset(0);
    setCurrentPageIndex(0);
    if (!currentUrlStatePushed) {
      window.history.pushState({}, '', window.location.href);
      setCurrentUrlStatePushed(true);
    }
    const { query } = parseUrl(window.location.search);
    if (tabValue !== 'ALL') {
      query['filter[status]'] = tabValue;
    } else {
      delete query['filter[status]'];
    }

    if (shared === true || searchInput?.trim()) {
      query['filter[shared]'] = true;
    } else {
      delete query['filter[shared]'];
    }

    if (searchInput) {
      query['filter[name]'] = searchInput;
    } else {
      delete query['filter[name]'];
    }

    const filterQry = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? `${selectedUser}` : `${currentUser}`,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setCadenceFilter(filterQry === '' ? '' : '&' + filterQry);

    if (searchInput?.trim() && !shared) {
      delete query['filter[shared]'];
    } else {
      if (shared) {
        query['filter[shared]'] = shared;
      } else {
        delete query['filter[shared]'];
      }
    }

    const searchString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    window.history.replaceState({}, '', '?' + searchString);
  };

  const handleOnChange = (e) => {
    settoggle(!toggle);
    setOffset(0);
    setCurrentPageIndex(0);
    if (!currentUrlStatePushed) {
      window.history.pushState({}, '', window.location.href);
      setCurrentUrlStatePushed(true);
    }
    const { query } = parseUrl(window.location.search);

    if (e.target.checked) {
      query['filter[shared]'] = true;
      setShared(true);
    } else {
      delete query['filter[shared]'];
      setShared(false);
    }

    if (searchInput) {
      query['filter[name]'] = searchInput;
    } else {
      delete query['filter[name]'];
    }

    const filterQry = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? `${selectedUser}` : `${currentUser}`,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setCadenceFilter(filterQry === '' ? '' : '&' + filterQry);

    const searchString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', '?' + searchString);
  };

  const handleCadenceSearch = (search, triggerType) => {
    if (!triggerType) {
      setOffset(0);
      setCurrentPageIndex(0);
    }

    let name;
    const { query } = parseUrl(window.location.search);
    if (triggerType && query['filter[name]']) {
      name = decodeURIComponent(query['filter[name]'].replace('*', ''));
      setSearchKey(name);
    } else {
      name = search;
      setSearchKey(search ? search : '');
    }
    if (shared) {
      query['filter[shared]'] = shared;
    } else {
      delete query['filter[shared]'];
    }
    if (name?.trim()) {
      query['filter[name]'] = `*${encodeURIComponent(name)}`;
      query['filter[shared]'] = true;
      setSearchInput(decodeURIComponent(query['filter[name]']));
    } else {
      delete query['filter[name]'];
      if (shared) {
        query['filter[shared]'] = shared;
      } else {
        delete query['filter[shared]'];
      }
      setSearchInput('');
    }

    if (activeList !== 'ALL') {
      query['filter[status]'] = activeList;
    } else {
      delete query['filter[status]'];
    }

    if (previousSortParam && previousSortParam !== sortBy) {
      delete query[sortingParams[previousSortParam]];
      setPreviousSortParam(sortBy);
    }

    query[sortingParams[sortBy]] = orderBy;

    if (currentUser !== selectedUser) {
      setCurrentUser(selectedUser);
    }

    const filterQry = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? `${selectedUser}` : `${currentUser}`,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setCadenceFilter(filterQry === '' ? '' : '&' + filterQry);

    if (name?.trim() && !shared) {
      delete query['filter[shared]'];
    } else {
      if (shared) {
        query['filter[shared]'] = shared;
      } else {
        delete query['filter[shared]'];
      }
    }

    const searchString = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? `${selectedUser}` : `${currentUser}`,
    })
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', '?' + searchString);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Cadences',
        accessor: 'name',
        width: '28%',
        Cell: function (props) {
          const { query: searchParams } = parseUrl(window.location.search);
          const touchcount = props?.row?.original?.associations?.touch
            ? props.row.original.associations.touch.length
            : 0;
          return (
            <>
              <Link
                to={{
                  pathname:
                    '/cadences/' + props.row.original.id + '/touches/view',
                  search: `${window.location.search}&cadence[name]=${props.value}&not=${touchcount}`,
                  state: {
                    allCadencesData: props.cadenceData,
                    origin: location.pathname,
                    filterParams: location.search,
                    cadence: props.row.original,
                    cadenceName: props.value,
                    touchcount: touchcount,
                    cadenceListUserFilter:
                      searchParams['filter[user][id]'] &&
                      searchParams['filter[user][id]'],
                    isPassedEmailTouch:
                      props.row.original.isPassedEmailTouch ===
                      'passedDateTime',
                  },
                }}
                className="mr-2"
                title={props.value}
              >
                {props.value && props.value.length > 30
                  ? props.value.slice(0, 29) + '..'
                  : props.value}
              </Link>
              <i
                className="fas fa-ban fa-sm text-danger mr-2"
                hidden={props.row.original.status !== 'INACTIVE'}
                title="Inactive Cadence"
              ></i>
              <i
                className="fas fa-pause fa-sm text-danger mr-2"
                hidden={props.row.original.status !== 'PAUSED'}
                title="Paused Cadence"
              ></i>
              <i
                className="fas fa-exclamation-circle fa-sm text-danger"
                hidden={
                  !(
                    props.row.original.isPassedEmailTouch ===
                      'passedDateTime' ||
                    (props.row.original.emailTouchCount > 0 &&
                      props.row.original.emailTouchCount !==
                        props.row.original.templateActiveCount)
                  )
                }
                title={
                  props.row.original.isPassedEmailTouch === 'passedDateTime'
                    ? 'Scheduled date has passed. Please update.'
                    : 'One or more Touches in this Cadence does not have an Email Template associated.'
                }
              ></i>
            </>
          );
        },
      },
      {
        Header: 'Favorite',
        accessor: 'favorite',
        width: '2%',
        textAlign: 'center',
        Cell: function (props) {
          return (
            <div
              className={`favorite-cadence-item ${
                props.value ? '' : 'invisible '
              }`}
            >
              <i
                className={`pointer ${
                  props.value ? 'fas fa-star text-yellow' : 'far fa-star'
                }`}
                onClick={(e) => {
                  if (!e.currentTarget.classList.contains('text-yellow')) {
                    e.currentTarget.className =
                      'pointer fas fa-star text-yellow visible';
                  } else if (
                    e.currentTarget.classList.contains('text-yellow')
                  ) {
                    e.currentTarget.className = 'pointer far fa-star';
                  }
                  setFavoriteCadence({
                    variables: {
                      cadenceId: props?.row?.original?.id,
                      input: {
                        favorite: !props.value,
                      },
                    },
                  });
                }}
              ></i>
            </div>
          );
        },
      },
      {
        Header: '',
        accessor: 'shareType',
        width: '4%',
        textAlign: 'center',
        Cell: function (props) {
          return (
            <i
              className="fas fa-user-friends fa-sm text-muted"
              title="This Cadence is a Shared Cadence"
              hidden={props.row.original.sharedType === 'none' ? true : false}
            ></i>
          );
        },
      },
      {
        Header: 'Prospects Due',
        accessor: 'callTouchDueCount',
        width: '5%',
        textAlign: 'center',
        Cell: ({ row }) => {
          const [tooltipOpen, setTooltipOpen] = useState();

          const toggleTooltip = (id) => {
            tooltipOpen === id ? setTooltipOpen(-id) : setTooltipOpen(id);
          };
          return (
            <Row
              className="align-items-center mx-auto"
              style={{ width: '83px' }}
            >
              <Col className="px-0">
                <div
                  id={`tooltip_${row.original.id}_callTouchDueCount`}
                  onMouseEnter={() => {
                    toggleTooltip(`${row.original.id}_callTouchDueCount`);
                  }}
                  onMouseLeave={() =>
                    toggleTooltip(`${row.original.id}_callTouchDueCount`)
                  }
                >
                  <span
                    className={`d-block ${
                      row.original.callTouchDueCount ? '' : 'text-muted'
                    }`}
                  >
                    {row.original.callTouchDueCount}
                  </span>
                  {/* icon is hidden on mouse hover due to 'overstats' class */}
                  <i
                    className={`fas fa-phone-alt fa-xs ${
                      row.original.callTouchDueCount
                        ? 'text-call'
                        : 'text-muted'
                    }`}
                  ></i>
                  {/* initially display is 'none'. on hover, class 'overstats' is used which is display:block!important */}
                  <p
                    className={`mb-0 mt-1 fa-xs d-none ${
                      row.original.callTouchDueCount ? '' : 'text-muted'
                    }`}
                  >
                    Calls
                  </p>
                  <Tooltip
                    placement="top"
                    isOpen={
                      tooltipOpen === `${row.original.id}_callTouchDueCount`
                    }
                    target={`tooltip_${row.original.id}_callTouchDueCount`}
                    trigger="legacy"
                  >
                    {`Call Touch Due: ${row.original.callTouchDueCount}`}
                  </Tooltip>
                </div>
              </Col>

              <Col className="px-0">
                <div
                  id={`tooltip_${row.original.id}_emailTouchDueCount`}
                  onMouseEnter={() => {
                    toggleTooltip(`${row.original.id}_emailTouchDueCount`);
                  }}
                  onMouseLeave={() =>
                    toggleTooltip(`${row.original.id}_emailTouchDueCount`)
                  }
                >
                  <span
                    className={`d-block ${
                      row.original.emailTouchDueCount ? '' : 'text-muted'
                    }`}
                  >
                    {row.original.emailTouchDueCount}
                  </span>
                  <i
                    className={`fas fa-envelope fa-xs ${
                      row.original.emailTouchDueCount
                        ? 'text-email'
                        : 'text-muted'
                    }`}
                  ></i>
                  <p
                    className={`mb-0 mt-1 fa-xs d-none ${
                      row.original.emailTouchDueCount ? '' : 'text-muted'
                    }`}
                  >
                    Emails
                  </p>
                  <Tooltip
                    placement="top"
                    isOpen={
                      tooltipOpen === `${row.original.id}_emailTouchDueCount`
                    }
                    target={`tooltip_${row.original.id}_emailTouchDueCount`}
                    trigger="legacy"
                  >
                    {`Email Touch Due: ${row.original.emailTouchDueCount}`}
                  </Tooltip>
                </div>
              </Col>
            </Row>
          );
        },
      },
      {
        Header: 'Stats',
        accessor: 'completedCount',
        width: '15%',
        textAlign: 'center',
        Cell: ({ row }) => {
          const [tooltipOpen, setTooltipOpen] = useState();

          const toggleTooltip = (id) => {
            tooltipOpen === id ? setTooltipOpen(-id) : setTooltipOpen(id);
          };
          const touchcount = row?.original?.associations?.touch
            ? row.original.associations.touch.length
            : 0;
          return (
            <Row
              className="align-items-center mx-auto"
              style={{ width: '208px' }}
            >
              <Col className="px-0">
                <div
                  id={`tooltip_${row.original.id}_prospectCount`}
                  onMouseEnter={() => {
                    toggleTooltip(`${row.original.id}_prospectCount`);
                  }}
                  onMouseLeave={() =>
                    toggleTooltip(`${row.original.id}_prospectCount`)
                  }
                >
                  <span
                    className={`d-block ${
                      row.original.prospectCount ? '' : 'text-muted'
                    }`}
                  >
                    {row.original.prospectCount}
                  </span>
                  <i
                    className={`far fa-circle fa-xs ${
                      row.original.prospectCount ? '' : 'text-muted'
                    }`}
                  ></i>
                  <p
                    className={`mb-0 mt-1 fa-xs d-none ${
                      row.original.prospectCount ? '' : 'text-muted'
                    }`}
                  >
                    Total
                  </p>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen === `${row.original.id}_prospectCount`}
                    target={`tooltip_${row.original.id}_prospectCount`}
                    trigger="legacy"
                  >
                    {`Total: ${row.original.prospectCount}`}
                  </Tooltip>
                </div>
              </Col>
              <Col className="px-0">
                <div
                  id={`tooltip_${row.original.id}_completedCount`}
                  onMouseEnter={() => {
                    toggleTooltip(`${row.original.id}_completedCount`);
                  }}
                  onMouseLeave={() =>
                    toggleTooltip(`${row.original.id}_completedCount`)
                  }
                >
                  <span
                    className={`d-block ${
                      row.original.completedCount ? '' : 'text-muted'
                    }`}
                  >
                    {row.original.completedCount}
                  </span>
                  <i
                    className={`fas fa-check fa-xs ${
                      row.original.completedCount ? '' : 'text-muted'
                    }`}
                  ></i>
                  <p
                    className={`mb-0 mt-1 fa-xs d-none ${
                      row.original.completedCount ? '' : 'text-muted'
                    }`}
                  >
                    Done
                  </p>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen === `${row.original.id}_completedCount`}
                    target={`tooltip_${row.original.id}_completedCount`}
                    trigger="legacy"
                  >
                    {`Completed: ${row.original.completedCount}`}
                  </Tooltip>
                </div>
              </Col>
              <Col className="px-0">
                <div
                  id={`tooltip_${row.original.id}_activeCount`}
                  onMouseEnter={() => {
                    toggleTooltip(`${row.original.id}_activeCount`);
                  }}
                  onMouseLeave={() =>
                    toggleTooltip(`${row.original.id}_activeCount`)
                  }
                >
                  <span
                    className={`d-block ${
                      row.original.activeCount ? '' : 'text-muted'
                    }`}
                  >
                    {row.original.activeCount}
                  </span>
                  <i
                    className={`fas fa-circle fa-xs ${
                      row.original.activeCount ? 'text-success' : 'text-muted'
                    }`}
                  ></i>
                  <p
                    className={`mb-0 mt-1 fa-xs d-none ${
                      row.original.activeCount ? '' : 'text-muted'
                    }`}
                  >
                    Active
                  </p>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen === `${row.original.id}_activeCount`}
                    target={`tooltip_${row.original.id}_activeCount`}
                    trigger="legacy"
                  >
                    {`Active: ${row.original.activeCount}`}
                  </Tooltip>
                </div>
              </Col>
              <Col className="px-0">
                <div
                  id={`tooltip_${row.original.id}_pausedCount`}
                  onMouseEnter={() => {
                    toggleTooltip(`${row.original.id}_pausedCount`);
                  }}
                  onMouseLeave={() =>
                    toggleTooltip(`${row.original.id}_pausedCount`)
                  }
                >
                  <span
                    className={`d-block ${
                      row.original.pausedCount ? '' : 'text-muted'
                    }`}
                  >
                    {row.original.pausedCount}
                  </span>
                  <i
                    className={`fas fa-pause fa-xs ${
                      row.original.pausedCount ? '' : 'text-muted'
                    }`}
                  ></i>
                  <p
                    className={`mb-0 mt-1 fa-xs d-none ${
                      row.original.pausedCount ? '' : 'text-muted'
                    }`}
                  >
                    Paused
                  </p>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen === `${row.original.id}_pausedCount`}
                    target={`tooltip_${row.original.id}_pausedCount`}
                    trigger="legacy"
                  >
                    {`Paused: ${row.original.pausedCount}`}
                  </Tooltip>
                </div>
              </Col>
              <Col className="px-0">
                <div
                  id={`tooltip_${row.original.id}_touchcount`}
                  onMouseEnter={() => {
                    toggleTooltip(`${row.original.id}_touchcount`);
                  }}
                  onMouseLeave={() =>
                    toggleTooltip(`${row.original.id}_touchcount`)
                  }
                >
                  <span className={`d-block ${touchcount ? '' : 'text-muted'}`}>
                    {touchcount}
                  </span>
                  <i
                    className={`far fa-hand-pointer fa-xs ${
                      touchcount ? '' : 'text-muted'
                    }`}
                  ></i>
                  <p
                    className={`mb-0 mt-1 fa-xs d-none ${
                      touchcount ? '' : 'text-muted'
                    }`}
                  >
                    Touch
                  </p>
                  <Tooltip
                    placement="top"
                    isOpen={tooltipOpen === `${row.original.id}_touchcount`}
                    target={`tooltip_${row.original.id}_touchcount`}
                    trigger="legacy"
                  >
                    {`Touches Count: ${touchcount}`}
                  </Tooltip>
                </div>
              </Col>
            </Row>
          );
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
            rowData.associations &&
            rowData.associations.user &&
            props.cadenceData.cadences.includedAssociations &&
            props.cadenceData.cadences.includedAssociations.user
          ) {
            owner = props.cadenceData.cadences.includedAssociations.user.find(
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
        Header: 'Status',
        accessor: 'status',
        width: '6%',
        Cell: function (props) {
          const status =
            props.value &&
            props.value.charAt(0).toUpperCase() +
              props.value.slice(1).toLowerCase();
          return <span>{status}</span>;
        },
      },
      {
        Header: 'Last Modified',
        accessor: 'updatedDate',
        width: '18%',
        Cell: function (props) {
          const modifiedDateTime = props.value && props.value;
          const currentTimeZone = moment.tz.guess();
          const updatedDateTime = moment
            .tz(modifiedDateTime, currentTimeZone)
            .format('M/D/YYYY h:mm A');
          return <span>{modifiedDateTime ? updatedDateTime : ''}</span>;
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname, location.search]
  );

  const gridData = useMemo(
    () =>
      cadenceData && cadenceData.cadences ? cadenceData.cadences.data : [],
    [cadenceData]
  );

  useEffect(
    () => {
      setPageCount(
        !loading &&
          cadenceData &&
          cadenceData.cadences &&
          cadenceData.cadences.paging
          ? Math.ceil(cadenceData.cadences.paging.totalCount / limit)
          : 0
      );
      setTotalCount(
        !loading && cadenceData?.cadences?.paging
          ? cadenceData.cadences.paging.totalCount
          : 0
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridData, limit, loading]
  );

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  useEffect(() => {
    handleCadenceSearch(null, 'effect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, orderBy, selectedUser]);

  if (userLoading) return null;
  if (!user) return <PageLoader />;
  return (
    <ContentWrapper>
      <PageHeader icon="svgicon koncert-cadence-icon" pageName="Cadences">
        <div className="d-flex justify-content-end">
          <SearchBar
            clname="mr-2"
            searchInput={searchKey}
            onSearch={handleCadenceSearch}
            onChange={setSearchKey}
          />
          <InputGroup hidden={!isManagerUser && !toggle}>
            <div className="px-0 wd-md">
              <UserList
                value={selectedUser}
                placeHolder={'select User'}
                disabled={isManagerUser ? false : true}
                onChange={(value) => {
                  setSelectedUser(value);
                }}
              />
            </div>
          </InputGroup>

          <div className="d-flex">
            <Button
              title="Clone cadence from sample cadences"
              className="mx-2"
              hidden={!canCreateCadence}
              onClick={() => {
                setShowSampleCloneCadenceModal(true);
              }}
            >
              <i className="fas fa-list mr-2"></i>
              Sample Cadences
            </Button>
            <Link
              hidden={!canCreateCadence}
              className="btn btn-secondary mr-2"
              to={{
                pathname: '/cadences/new',
                state: {
                  pathName: location.pathname,
                  search: location.search,
                },
              }}
              title="Create new Cadence"
            >
              <i className="fa fa-plus mr-2"></i>
              New Cadence
            </Link>
          </div>
        </div>
      </PageHeader>
      <Row>
        <Col>
          <Card className="card-default">
            <CardBody>
              <Row className="mb-3">
                <Col lg={9} className="pr-0">
                  <ButtonGroup>
                    <FilterButton
                      active={activeList === filterButtons[0]}
                      data-tab-value={filterButtons[0]}
                      title="All Cadences"
                      handleClick={handleCadenceTabChange}
                      className={`${
                        activeList === filterButtons[0] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1`}
                      count={
                        fetchCadencesCountData?.all?.paging?.totalCount || null
                      }
                      countError={fetchCadencesCountError}
                      countLoading={fetchCadencesCountLoading}
                    >
                      <strong>All</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeList === filterButtons[1]}
                      data-tab-value={filterButtons[1]}
                      title="Active Cadences"
                      handlePin={(pin) =>
                        changeSetting(
                          'cadencesPinnedFilterButton',
                          pin ? filterButtons[1] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[1]}
                      handleClick={handleCadenceTabChange}
                      className={`${
                        activeList === filterButtons[1] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1`}
                      count={
                        fetchCadencesCountData?.active?.paging?.totalCount ||
                        null
                      }
                      countError={fetchCadencesCountError}
                      countLoading={fetchCadencesCountLoading}
                    >
                      <strong>Active</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeList === 'NEW'}
                      data-tab-value="NEW"
                      title="Unused Cadences"
                      handlePin={(pin) =>
                        changeSetting(
                          'cadencesPinnedFilterButton',
                          pin ? filterButtons[2] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[2]}
                      handleClick={handleCadenceTabChange}
                      className={`${
                        activeList === filterButtons[2] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1`}
                      count={
                        fetchCadencesCountData?.unassigned?.paging
                          ?.totalCount || null
                      }
                      countError={fetchCadencesCountError}
                      countLoading={fetchCadencesCountLoading}
                    >
                      <strong>Unused</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeList === 'INACTIVE'}
                      data-tab-value="INACTIVE"
                      title="Inactive Cadences"
                      handlePin={(pin) =>
                        changeSetting(
                          'cadencesPinnedFilterButton',
                          pin ? filterButtons[3] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[3]}
                      handleClick={handleCadenceTabChange}
                      className={`${
                        activeList === filterButtons[3] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1`}
                      count={
                        fetchCadencesCountData?.inactive?.paging?.totalCount ||
                        null
                      }
                      countError={fetchCadencesCountError}
                      countLoading={fetchCadencesCountLoading}
                    >
                      <strong>Inactive</strong>
                    </FilterButton>
                    <FilterButton
                      active={activeList === 'PAUSED'}
                      data-tab-value="PAUSED"
                      title="Paused Cadences"
                      handlePin={(pin) =>
                        changeSetting(
                          'cadencesPinnedFilterButton',
                          pin ? filterButtons[4] : filterButtons[0]
                        )
                      }
                      pinned={pinnedFilterButton === filterButtons[4]}
                      handleClick={handleCadenceTabChange}
                      className={`${
                        activeList === filterButtons[4] &&
                        'bg-color-primary-shade text-white pb-1'
                      } pb-1`}
                      count={
                        fetchCadencesCountData?.paused?.paging?.totalCount ||
                        null
                      }
                      countError={fetchCadencesCountError}
                      countLoading={fetchCadencesCountLoading}
                    >
                      <strong>Paused</strong>
                    </FilterButton>
                  </ButtonGroup>
                </Col>
                <Col lg={3} className="pl-0">
                  <div className="float-lg-right float-sm-left float-md-left pt-2">
                    <FormGroup check inline>
                      <span className="mr-2">My Cadences</span>
                      <CustomInput
                        type="switch"
                        id="example_custom_switch"
                        name="custom_switch"
                        checked={toggle}
                        onChange={handleOnChange}
                      ></CustomInput>
                      <span>All Cadences</span>
                    </FormGroup>
                  </div>
                </Col>
              </Row>
              <CadencesGrid
                columns={columns}
                data={gridData}
                cadenceData={cadenceData}
                sortBy={sortBy}
                orderBy={orderBy}
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
                  if (shared === true) {
                    query['filter[shared]'] = shared;
                  } else {
                    delete query['filter[shared]'];
                  }

                  if (query['filter[name]']) {
                    setSearchKey(
                      decodeURIComponent(query['filter[name]'].replace('*', ''))
                    );
                  }
                  const searchString = Object.entries(query)
                    .map(([key, val]) => `${key}=${val}`)
                    .join('&');
                  window.history.replaceState({}, '', '?' + searchString);
                }}
                loading={loading}
                pageSize={limit}
                pageCount={pageCount}
                totalCount={totalCount}
                error={error}
                currentPageIndex={currentPageIndex}
                cadenceActions={cadenceActions}
                handleRowToolbarButton={handleRowToolbarButton}
                pathName={location.pathname}
                canCreateCadence={canCreateCadence}
                cadencesResponse={cadencesResponse}
                handleRefresh={refetchCadencesGrid}
                handleSortBy={(column, order) => {
                  setSortBy(column);
                  setOrderBy(order);
                }}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <SampleCadencesModel
        hideModal={() => {
          setShowSampleCloneCadenceModal(false);
        }}
        showModal={showSampleCadenceModal}
        handleClose={handleClose}
        handleRefresh={refreshCadencesCountAndGrid}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="Yes"
        header="Delete Cadence"
        handleCancel={() => setInactiveDeleteFirstConfirm(false)}
        handleConfirm={() => setInactiveDeleteSecondConfirm(true)}
        showConfirmModal={inactiveDeleteFirstConfirm}
      >
        <span>
          You are about to delete an inactive cadence{' '}
          <span className="text-break font-italic">{currentCadence.name}</span>?
          Are you sure you want to proceed?
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="Yes"
        header="Delete Cadence"
        handleCancel={() => {
          setInactiveDeleteFirstConfirm(false);
          setInactiveDeleteSecondConfirm(false);
        }}
        handleConfirm={() => {
          setInactiveDeleteThirdConfirm(true);
          setInactiveDeleteFirstConfirm(false);
        }}
        showConfirmModal={inactiveDeleteSecondConfirm}
      >
        <span>
          This cadence has X prospects in total with lot of metrics and
          activities. If you proceed, all stats will be deleted. Do you want to
          proceed?
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        confirmBtnColor="danger"
        header="Delete Cadence"
        handleCancel={() => {
          setInactiveDeleteSecondConfirm(false);
          setInactiveDeleteThirdConfirm(false);
        }}
        handleConfirm={() => {
          setInactiveDeleteSecondConfirm(false);
          deleteCadence({ variables: { cadenceId: currentCadence.id } });
        }}
        showConfirmBtnSpinner={deleteCadenceLoading}
        showConfirmModal={inactiveDeleteThirdConfirm}
      >
        <span>
          Once deleted, none of the information can be retrieved. Please take
          this step only if you are absolutely sure.
        </span>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        confirmBtnColor="danger"
        header="Delete Cadence"
        handleCancel={() => setShowDeleteCadenceConfirmModal(false)}
        handleConfirm={() =>
          deleteCadence({ variables: { cadenceId: currentCadence.id } })
        }
        showConfirmBtnSpinner={deleteCadenceLoading}
        showConfirmModal={showDeleteCadenceConfirmModal}
      >
        <span>
          Are you sure you want to delete{' '}
          <span className="text-break font-italic">{currentCadence.name}</span>?
        </span>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        header="Make the Cadence Inactive"
        handleCancel={() => setShowDisableCadenceConfirmModal(false)}
        handleConfirm={() => {
          disableCadence({
            variables: {
              id: currentCadence.id,
              status: currentCadenceStatus,
            },
          });
        }}
        showConfirmBtnSpinner={disableCadenceLoading}
        showConfirmModal={showDisableCadenceConfirmModal}
      >
        <span>
          Are you sure you want to make{' '}
          <span className="text-break font-italic">{currentCadence.name}</span>{' '}
          inactive?
          <br />
          <br />
          <p>
            Note: Prospects that are currently assigned to this Cadence will
            automatically exit from this Cadence.
          </p>
        </span>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        header="Make the Cadence Active"
        handleCancel={() => setShowActivateCadenceConfirmModal(false)}
        handleConfirm={() => {
          activateCadence({
            variables: {
              id: currentCadence.id,
              status: currentCadenceStatus,
            },
          });
        }}
        showConfirmBtnSpinner={activateCadenceLoading}
        showConfirmModal={showActivateCadenceConfirmModal}
      >
        <span>
          Are you sure you want to make{' '}
          <span className="text-break font-italic">{currentCadence.name}</span>{' '}
          active ?
        </span>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-pause"
        confirmBtnText="Pause"
        header="Pause Cadence"
        handleCancel={() => setShowPauseCadenceConfirmModal(false)}
        handleConfirm={() => {
          pauseCadence({
            variables: {
              id: currentCadence.id,
              status: 'PAUSED',
            },
          });
        }}
        showConfirmBtnSpinner={pauseCadenceLoading}
        showConfirmModal={showPauseCadenceConfirmModal}
      >
        <span className="text-break">
          Are you sure you want to pause this Cadence{' '}
          <span className="text-break font-italic">{currentCadence.name}</span>{' '}
          ?
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="Yes"
        header="Pause Cadence"
        handleCancel={() => setShowPauseCadenceFirstConfirmModal(false)}
        handleConfirm={() => {
          setShowPauseCadenceSecondConfirmModal(true);
          setShowPauseCadenceFirstConfirmModal(false);
        }}
        showConfirmModal={showPauseCadenceFirstConfirmModal}
      >
        <span className="text-break">
          You are not the owner of the Cadence. Do you still want to pause this
          Cadence ?
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="Yes"
        header="Pause Cadence"
        handleCancel={() => setShowPauseCadenceSecondConfirmModal(false)}
        handleConfirm={() => {
          pauseOtherUserCadence({
            variables: {
              id: currentCadence.id,
              status: 'PAUSED',
            },
          });
        }}
        showConfirmBtnSpinner={pauseOtherUserCadenceLoading}
        showConfirmModal={showPauseCadenceSecondConfirmModal}
      >
        <span className="text-break">
          There are about X Prospects active in Cadence across all users? Do you
          still want to proceed?
        </span>
      </ConfirmModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-play"
        confirmBtnText="Resume"
        header="Resume Cadence"
        handleCancel={() => setShowResumeCadenceConfirmModal(false)}
        handleConfirm={() => {
          resumeCadence({
            variables: {
              id: currentCadence.id,
              status: 'RESUME',
            },
          });
        }}
        showConfirmBtnSpinner={resumeCadenceLoading}
        showConfirmModal={showResumeCadenceConfirmModal}
      >
        <span className="text-break">
          Are you sure you want to resume this Cadence{' '}
          <span className="text-break font-italic">{currentCadence.name}</span>{' '}
          ?
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="Yes"
        header="Resume Cadence"
        handleCancel={() => setShowResumeCadenceFirstConfirmModal(false)}
        handleConfirm={() => {
          setShowResumeCadenceSecondConfirmModal(true);
          setShowResumeCadenceFirstConfirmModal(false);
        }}
        showConfirmModal={showResumeCadenceFirstConfirmModal}
      >
        <span className="text-break">
          You are not the owner of the Cadence. Do you still want to resume this
          Cadence ?
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="Yes"
        header="Resume Cadence"
        handleCancel={() => setShowResumeCadenceSecondConfirmModal(false)}
        handleConfirm={() => {
          resumeOtherUserCadence({
            variables: {
              id: currentCadence.id,
              status: 'RESUME',
            },
          });
        }}
        showConfirmBtnSpinner={resumeOtherUserCadenceLoading}
        showConfirmModal={showResumeCadenceSecondConfirmModal}
      >
        <span className="text-break">
          There are about X Prospects paused in Cadence across all users? Do you
          still want to proceed?
        </span>
      </ConfirmModal>

      <CloneCadenceModel
        showModal={showCloneCadenceConfirmModal}
        currentUserId={currentUserId}
        currentCadence={currentCadence}
        Loading={cloneCadenceLoading}
        cadenceName={currentCadence.name}
        handleAction={(data) => {
          cloneCadence({
            variables: {
              cadenceId: currentCadence.id,
              cloneCadenceName: data.cloneCadenceName.trim(),
            },
          });
        }}
        hideModal={() => {
          setShowCloneCadenceConfirmModal(false);
        }}
      />
    </ContentWrapper>
  );
};

const mapStateToProps = (state) => ({
  pinnedFilterButton: state.settings.cadencesPinnedFilterButton,
});

export default connect(mapStateToProps, { changeSetting, getAllCadences })(
  Cadences
);
