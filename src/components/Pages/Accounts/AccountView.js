import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Badge,
  ButtonDropdown,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Nav,
  NavItem,
  Popover,
  PopoverHeader,
  PopoverBody,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import ScrollArea from 'react-scrollbar';
import { toast } from 'react-toastify';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { parseUrl } from 'query-string';
import { ContentWrapper } from '@nextaction/components';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import PageHeader from '../../Common/PageHeader';
import ProspectActivity from '../../Common/ProspectActivity';
import UserList from '../../Common/UserList';
import ZipWhipModal from '../../Common/ZipwhipTouchModal';
import ProspectsSortByFieldsDropdown from '../../Common/ProspectsSortByFieldsDropdown';
import { notify, showErrorMessage } from '../../../../src/util/index';
import Button from '../../Common/Button';
import FilterButton from '../../Common/FilterButton';
import ConfirmModal from '../../Common/ConfirmModal';
import SearchBar from '../../Common/SearchBar';
import FETCH_ACCOUNTS_QUERY, {
  FETCH_ACCOUNT_CADENCES_QUERY,
  FETCH_ACCOUNT_TASKS_QUERY,
  FETCH_ACCOUNT_ACTIVITIES_QUERY,
  FETCH_ACCOUNTS_TEMPLATES_QUERY,
  FETCH_ACCOUNTS_PROSPECTS_QUERY,
  FETCH_ACCOUNTS_PROSPECTS_COUNT_QUERY,
  FETCH_ACCOUNTS_CADENCES_COUNT_QUERY,
  FETCH_ACCOUNTS_TASKS_COUNT_QUERY,
  FETCH_ACCOUNT_QUERY,
  FETCH_OUTCOMES_COUNT_QUERY,
  FETCH_OUTCOME_PROSPECTS_QUERY,
  FETCH_ACCOUNT_OVERVIEW_PROSPECTS_QUERY,
  FETCH_ACCOUNT_OVERVIEW_CADENCES_QUERY,
  FETCH_ACCOUNT_TEXT_ACTIVITIES_QUERY,
  FETCH_ACCOUNT_CALL_ACTIVITIES_QUERY,
} from '../../queries/AccountsQuery';
import {
  START_POWER_DIALING_QUERY,
  GET_LOOKUP_VALUE_QUERY,
} from '../../queries/PendingCallsQuery';
import { FETCH_MAIL_MERGE_VARIABLES } from '../../queries/EmailTemplatesQuery';
import UserContext from '../../UserContext';
import EmailsModal from '../ToDo/EmailsModal';
import AccountProspectsGrid from './AccountProspectsGrid';
import AccountCadencesGrid from './AccountCadencesGrid';
import AccountTasksGrid from './AccountTasksGrid';
import AccountStatsGrid from './AccountStatsGrid';

toast.configure();

const AccountView = ({ location, match, history }) => {
  const { query: searchParams } = parseUrl(window.location.search);
  const [allActivitiesOffset, setAllActivitiesOffset] = useState(0);
  const [allActivitiesLimit] = useState(25);
  const [offset, setOffset] = useState(
    searchParams['accountOffset'] ? parseInt(searchParams['accountOffset']) : 0
  );
  const [limit, setLimit] = useState(
    searchParams['accountLimit'] ? parseInt(searchParams['accountLimit']) : 10
  );
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const { account } = location.state ? location.state : {};
  const [accountId, setAccountId] = useState(match.params.id);
  const [allAccountsData, setAllAccountsData] = useState(
    location.state ? location.state.allAccountsData : undefined
  );
  const [renderNextAccount, setRenderNextAccount] = useState(false);
  const [renderPrevAccount, setRenderPrevAccount] = useState(false);
  const [accountToRender, setAccountToRender] = useState(account);
  const userToRender = user;
  // set main tab selected
  const [activeTab, setActiveTab] = useState(
    searchParams['activeTab'] ? searchParams['activeTab'] : 'overview'
  );
  const [activeFilter, setActiveFilter] = useState('Total');
  const [currentTabFilter, setCurrentTabFilter] = useState('total');
  const [allActivities, setAllActivities] = useState([]);
  const [overviewProspects, setOverviewProspects] = useState([]);
  const [activityPaging, setActivityPaging] = useState({});
  const [callActivities, setCallActivities] = useState([]);
  const [textActivities, setTextActivities] = useState([]);
  const [selectedUser, setSelectedUser] = useState(currentUserId);
  const [selectedUserName, setSelectedUserName] = useState(
    user?.displayName ? user.displayName : ''
  );
  const [allTemplates, setAllTemplates] = useState([]);
  const [activeActivityTab, setActiveActivityTab] = useState(
    user?.defaultActivityFilter
      ? user.defaultActivityFilter === 'others'
        ? 'social'
        : user.defaultActivityFilter
      : 'all'
  );
  const [pageCount, setPageCount] = useState(0);
  const [cadenceFilter, setCadenceFilter] = useState(
    `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']')
  );
  const [prospectFilter, setProspectFilter] = useState(
    `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']')
  );
  const [taskFilter, setTaskFilter] = useState(
    `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']')
  );
  const [searchValue, setSearchValue] = useState(null);
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';
  const [showSendOneOffEmail, setShowSendOneOffEmail] = useState(false);
  const [oneOffProspectId, setOneOffProspectId] = useState();
  const [searchKey, setSearchKey] = useState('');
  const {
    data: configurationsData,
    error: configurationsError,
  } = useConfigurations();
  const zipwhipEnable =
    (!configurationsError &&
      configurationsData?.configurations?.data[0]?.zipwhip) ||
    false;
  const userLicence =
    user && user.userLicense ? user.userLicense.split(',') : [];

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  let prospectIds = [];
  let accountName = '';
  let accountDomainName = '';
  let zipwhipKey = '';
  if (accountToRender) {
    prospectIds = accountToRender.associations.prospect.map(
      (prospect) => prospect.id
    );
    accountName = accountToRender.name;
    accountDomainName = accountToRender.domainName;
  }
  if (allAccountsData?.accounts?.includedAssociations) {
    allAccountsData.accounts.includedAssociations.user.forEach((us) => {
      if (us.id === currentUserId) {
        zipwhipKey = us.zipwhipSessionKey;
      }
    });
  }
  const [userFilter, setUserFilter] = useState(
    `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']')
  );

  //show filterscount
  const [prospectCountDetails, setProspectCountDetails] = useState({});
  const [cadenceCountDetails, setCadenceCountDetails] = useState({});
  const [taskCountDetails, setTaskCountDetails] = useState({});
  const [pendingCalls, setPendingCalls] = useState(0);
  const [callCountDetails, setCallCountDetails] = useState({});
  const [emailCountdetails, setEmailCountDetails] = useState({});
  const [textCountdetails, setTextCountDetails] = useState({});

  //sorting params
  const accountSortParams = 'sort[name]=asc';
  const prospectSortParms = {
    contactName: 'sort[contactName]',
    accountName: 'sort[accountName]',
    cadence: 'sort[cadence][name]',
    touch: 'sort[touch][stepNo]',
    phone: 'sort[phone]',
    emailId: 'sort[email]',
    createdDate: 'sort[createdDate]',
    title: 'sort[title]',
  };
  const cadenceSortParams = {
    name: 'sort[name]',
    status: 'sort[status]',
    user: 'sort[user][name]',
    createdDate: 'sort[createdDate]',
    owner: 'sort[ownerId]',
  };
  const taskSortParams = {
    contactName: 'sort[contactName]',
    accountName: 'sort[accountName]',
    title: 'sort[title]',
    currentTouchType: 'sort[currentTouchType]',
    emailId: 'sort[email]',
    campaignName: 'sort[cadence][name]',
  };

  //Pagination related variable declaration
  const [prospectLimit, setProspectLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [totalCount, setTotalCount] = useState(0);
  const [cadenceTotalCount, setCadenceTotalCount] = useState(0);
  const [taskTotalCount, setTaskTotalCount] = useState(0);
  const [prospectOffset, setProspectOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [cadenceOffset, setCadenceOffset] = useState(0);
  const [cadenceLimit, setCadenceLimit] = useState(10);
  const [cadencePageCount, setCadencePageCount] = useState(0);
  const [taskOffset, setTaskOffset] = useState(0);
  const [taskLimit, setTaskLimit] = useState(10);
  const [taskPageCount, setTaskPageCount] = useState(0);

  //Sorting related variables declaration
  const [sortBy, setSortBy] = useState('contactName');
  const [orderBy, setOrderBy] = useState('asc');
  const [cadenceSortBy, setCadenceSortBy] = useState('name');
  const [cadenceOrderBy, setCadenceOrderBy] = useState('asc');
  const [taskSortBy, setTaskSortBy] = useState('contactName');
  const [taskOrderBy, setTaskOrderBy] = useState('asc');
  const [sortByOutcome, setSortByOutcome] = useState('contactName');
  const [orderByOutcome, setOrderByOutcome] = useState('asc');
  const [sortByStatsProspect] = useState('contactName');
  const [orderByStatsProspect] = useState('asc');
  const [statProspectOutcomeType, setStatProspectOutcomeType] = useState('');
  const [statCadenceOutcomeType, setStatCadenceOutcomeType] = useState('Total');
  const [accountOwnerName, setAccountOwnerName] = useState('');

  const [outcomeQuerySortCall, setOutcomeQuerySortCall] = useState(
    `sort[${sortByOutcome}]=${orderByOutcome}`
  );
  const [outcomeQuerySortText, setOutcomeQuerySortText] = useState(
    `sort[${sortByOutcome}]=${orderByOutcome}`
  );
  const [outcomeQuerySortEmail, setOutcomeQuerySortEmail] = useState(
    `sort[${sortByOutcome}]=${orderByOutcome}`
  );

  //start power dialing
  const [
    showStartPowerDialingConfirmModal,
    setShowStartPowerDialingConfirmModal,
  ] = useState(false);
  //personalize email
  const [showPersonalizeEmailModal, setShowPersonalizeEmailModal] = useState(
    false
  );
  const [isSendAndNext] = useState(false);
  const [
    personalizeEmailProspectIndex,
    setPersonalizeEmailProspectIndex,
  ] = useState(0);
  const [personalizeEmailProspectId, setPersonalizeEmailProspectId] = useState(
    0
  );
  const [personalizeEmailCadenceId, setPersonalizeEmailCadenceId] = useState(0);
  //stat tab related declarations
  const [cadenceOpen, setCadenceOpen] = useState(false);
  const [prospectOpen, setProspectOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [accountOutcomeFilter, setAccountOutcomeFilter] = useState(
    `filter[user][id]=` +
      encodeURIComponent(':[' + selectedUser + ']') +
      `&filter[touchType]=call`
  );
  const [accountEmailOutcomeFilter, setAccountEmailOutcomeFilter] = useState(
    `filter[user][id]=` +
      encodeURIComponent(':[' + selectedUser + ']') +
      `&filter[touchType]=email`
  );
  const [accountTextOutcomeFilter, setAccountTextOutcomeFilter] = useState(
    `filter[user][id]=` +
      encodeURIComponent(':[' + selectedUser + ']') +
      `&filter[touchType]=text`
  );
  const [outcomeType, setOutcomeType] = useState('total');
  const [emailOutcomeType, setEmailOutcomeType] = useState('total');
  const [textOutcomeType, setTextOutcomeType] = useState('total');
  const [callOffset, setCallOffset] = useState(0);
  const [callLimit, setCallLimit] = useState(10);
  const [emailOffset, setEmailOffset] = useState(0);
  const [emailLimit, setEmailLimit] = useState(10);
  const [textOffset, setTextOffset] = useState(0);
  const [textLimit, setTextLimit] = useState(10);
  const [callOutcomePageCount, setCallOutcomePageCount] = useState(0);
  const [emailOutcomePageCount, setEmailOutcomePageCount] = useState(0);
  const [textOutcomePageCount, setTextOutcomePageCount] = useState(0);
  const [totalCountOfCall, setTotalCountOfCall] = useState(0);
  const [totalCountOfEmail, setTotalCountOfEmail] = useState(0);
  const [totalCountOfText, setTotalCountOfText] = useState(0);
  const [view, setView] = useState(false);

  const nbspRegEx = /&nbsp/gi;

  // Accounts Pagination and Navigation to prev page has been disabled. Code will uncomment if the functionality required in future
  // const getAccountIndex = () => {
  //   if (allAccountsData?.accounts?.data)
  //     return (
  //       offset * limit +
  //       allAccountsData.accounts.data.findIndex(
  //         (account) => account.id === parseInt(accountId)
  //       )
  //     );
  //   else {
  //     return offset * limit;
  //   }
  // };

  const columnsTask = [
    {
      Header: 'Name',
      accessor: 'contactName',
      width: '10%',
      Cell: function (props) {
        return (
          <span>
            <Link
              to={{
                pathname: '/prospects/list/' + props.row.original.id,
                search: window.location.search,
                state: {
                  accountId:
                    props?.row?.original?.associations?.account?.[0].id,
                  rowIndex: props?.row?.index,
                  touchType: props?.activeFilter && props.activeFilter,
                  contactName: props?.searchValue && props.searchValue,
                  prospect: props?.row.original,
                },
              }}
            >
              {props.value}
            </Link>
            <br></br>
            {props?.row?.original?.title && (
              <>
                <small>{props.row.original.title}</small>
                <br></br>
              </>
            )}
            <span className="font-italic">
              {props?.row?.original?.accountName}
            </span>
          </span>
        );
      },
    },
    {
      Header: 'Action',
      accessor: 'actionEnvelope',
      disableSortBy: true,
      width: '7%',
      Cell: function (props) {
        return (
          <span
            className="fa-stack pointer"
            onClick={() => handleShowTouchInfo(props?.row?.original)}
          >
            <i className="fas fa-circle fa-stack-2x thin-circle"></i>
            <i className="fas fa-comments fa-stack-1x fa-sm text-danger"></i>
          </span>
        );
      },
    },
    {
      Header: 'Touch',
      accessor: 'currentTouchType',
      width: '10%',
      Cell: function (props) {
        return (
          <span>{props?.value === 'OTHERS' ? 'SOCIAL' : props?.value}</span>
        );
      },
    },
    {
      Header: 'Cadence Name',
      accessor: 'campaignName',
      width: '10%',
      Cell: function (props) {
        const rowData = props?.row?.original;
        let cadence;
        if (
          rowData?.associations?.cadence?.[0].id &&
          props?.taskData?.accounts?.includedAssociations?.cadence
        ) {
          cadence = props.taskData.accounts.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
          return (
            <span title="Click to view cadence">
              <Link
                to={{
                  pathname: '/cadences/' + cadence?.id + '/touches/view',
                  search: `${window.location.search}&cadence[name]=${cadence?.name}&not=1`,
                  state: {
                    allCadencesData:
                      props?.prospectsData?.prospect?.includedAssociations
                        ?.cadence,
                    origin: window.location.pathname,
                    cadence: cadence ? cadence : {},
                    cadenceName: cadence?.name,
                  },
                }}
              >
                {cadence?.name}
              </Link>
            </span>
          );
        } else {
          return null;
        }
      },
    },
    {
      Header: 'Touch #',
      accessor: 'currentTouchId',
      width: '10%',
      Cell: function (props) {
        return <span>{'Touch ' + props.value}</span>;
      },
    },
  ];

  const [textPhoneNumber, setTextPhoneNumber] = useState(0);
  const [lastActivityData, setLastActivityData] = useState({});
  const [showZipwhipTouchWindow, setShowZipwhipTouchWindow] = useState(false);

  const handleShowTouchInfo = (rowData) => {
    const touchData = {
      contactName: rowData?.contactName,
      prospectId: rowData?.id,
    };
    setTextPhoneNumber(rowData?.phone);
    setLastActivityData(touchData);
    setShowZipwhipTouchWindow(true);
  };

  const columns = [];
  columnsTask.forEach((item) => {
    // show action column only if filter is 'text'
    if (currentTabFilter === 'pending texts' || item.Header !== 'Action') {
      columns.push(item);
    }
  });

  const {
    data: accountData,
    loading: fetchAccountLoading,
    error: accountError,
  } = useQuery(FETCH_ACCOUNT_QUERY, {
    variables: {
      id: accountId,
      includeAssociationsQry:
        'includeAssociations[]=user&includeAssociations[]=tag',
      currentUserId: currentUserId,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      if (response !== undefined) {
        if (response?.account?.includedAssociations?.user?.[0]?.displayName) {
          setAccountOwnerName(
            response.account.includedAssociations.user[0].displayName
          );
        }
        handleFetchAccountRequestCallback(response, true);
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Accounts data',
        accountData,
        'failed_account_data'
      );
    },
  });
  const handleFetchAccountRequestCallback = (response, requestSuccess) => {
    if (requestSuccess && response?.account !== null) {
      updateAccountView(response.account.data[0]);
    }
  };

  const tagListData =
    !accountError &&
    accountData &&
    accountData.account &&
    accountData.account.includedAssociations &&
    accountData.account.includedAssociations.tag &&
    accountData.account.includedAssociations.tag.length > 0
      ? accountData.account.includedAssociations.tag
      : [];

  const tagList = [];
  tagListData.forEach((item) => tagList.push(item.tagValue && item.tagValue));

  const [fetchAccountsNextPage, { data: accountsPageData }] = useLazyQuery(
    FETCH_ACCOUNTS_QUERY,
    {
      variables: {
        includeAssociationsQry: 'includeAssociations[]=user',
        accountFilter: `&${accountSortParams}`,
        limit,
      },
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        setAllAccountsData(data);
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to load accounts.',
          accountsPageData,
          'failed_page_load'
        );
      },
    }
  );

  const [
    fetchOverViewProspects,
    { loading: overviewProspectLoading },
  ] = useLazyQuery(FETCH_ACCOUNT_OVERVIEW_PROSPECTS_QUERY, {
    variables: {
      accountId,
      filter: userFilter,
      sort: 'sort[activityDatetime]=desc',
    },
    notifyOnNetworkStatusChange: true,
    skip: activeTab !== 'overview',
    fetchPolicy: 'cache-first',
    onCompleted: (response) => {
      handleProspectRequestCallback(response, true);
    },
    onError: (response) => handleProspectRequestCallback(response),
  });

  const handleProspectRequestCallback = (response, requestSuccess) => {
    if (requestSuccess && response?.prospects !== null) {
      setOverviewProspects(
        response.prospects.data.filter((ap) => {
          return ap.outcome !== '';
        })
      );
    }
  };
  const [
    fetchProspects,
    { data: prospectsData, loading, refetch: refetchAccountProspects },
  ] = useLazyQuery(FETCH_ACCOUNTS_PROSPECTS_QUERY, {
    variables: {
      accountId,
      limit: prospectLimit,
      offset: prospectOffset,
      includeAssociationsQry:
        'includeAssociations[]=cadence&includeAssociations[]=touch',
      prospectFilter: prospectFilter,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Prospect data',
        prospectsData,
        'failed_prospect_data'
      );
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache',
    skip:
      activeTab !== 'overview' &&
      activeTab !== 'prospects' &&
      activeTab !== 'stats',
  });

  useEffect(() => {
    setPageCount(
      !loading && prospectsData?.prospect?.paging
        ? Math.ceil(
            prospectsData.prospect.paging.totalCount /
              prospectsData.prospect.paging.limit
          )
        : 0
    );
    setTotalCount(
      !loading && prospectsData?.prospect?.paging
        ? prospectsData.prospect.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [prospectsData]);
  const accountsProspectGridData = useMemo(
    () =>
      prospectsData && prospectsData?.prospect
        ? prospectsData.prospect.data.filter(
            (prospect) => prospect.accountName !== null
          )
        : [],
    [prospectsData]
  );

  const [
    fetchProspectsCount,
    { data: prospectCounts, loading: prospectCountLoading },
  ] = useLazyQuery(FETCH_ACCOUNTS_PROSPECTS_COUNT_QUERY, {
    variables: {
      accountId: accountId,
      userFilter: userFilter,
    },
    notifyOnNetworkStatusChange: true,
    skip:
      activeTab !== 'overview' &&
      activeTab !== 'prospects' &&
      activeTab !== 'stats',
    onCompleted: () => {
      if (activeTab === 'overview') {
        fetchOverViewProspects();
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Prospect count',
        prospectCounts,
        'failed_prospect_count'
      );
    },
  });

  useEffect(
    () =>
      setProspectCountDetails(
        !prospectCountLoading && prospectCounts?.total?.paging
          ? {
              Total: prospectCounts.total.paging.totalCount,
              Assigned: prospectCounts.assigned.paging.totalCount,
              Unassigned: prospectCounts.unassigned.paging.totalCount,
              Completed: prospectCounts.completed.paging.totalCount,
              Paused: prospectCounts.paused.paging.totalCount,
              Pending: prospectCounts.pending.paging.totalCount,
            }
          : {
              Total: 0,
              Assigned: 0,
              Unassigned: 0,
              Completed: 0,
              Paused: 0,
              Pending: 0,
            }
        // eslint-disable-next-line
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prospectCounts]
  );

  const [
    fetchOverViewCadences,
    { data: overViewCadences, loading: overViewCadenceLoading },
  ] = useLazyQuery(FETCH_ACCOUNT_OVERVIEW_CADENCES_QUERY, {
    variables: {
      id: accountId,
      accountCadencesFilter: `&${userFilter}`,
      includeAssociationsQry:
        'includeAssociations[]=touch&includeAssociations[]=user',
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Cadence data',
        overViewCadences,
        'failed_cadence_data'
      );
    },
    notifyOnNetworkStatusChange: true,
    skip: activeTab !== 'overview',
  });

  const [
    fetchCadences,
    {
      data: cadencesData,
      loading: cadenceLoading,
      refetch: refetchAccountCadences,
    },
  ] = useLazyQuery(FETCH_ACCOUNT_CADENCES_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=touch&includeAssociations[]=user',
      id: accountId,
      limit: cadenceLimit,
      offset: cadenceOffset,
      accountCadencesFilter: `&${cadenceFilter}`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Cadence data',
        cadencesData,
        'failed_cadence_data'
      );
    },
    notifyOnNetworkStatusChange: true,
    skip: activeTab !== 'cadences' && activeTab !== 'stats',
  });

  const accountsCadenceGridData = useMemo(
    () =>
      cadencesData && cadencesData.accounts ? cadencesData.accounts.data : [],
    [cadencesData]
  );

  useEffect(() => {
    setCadencePageCount(
      !cadenceLoading &&
        cadencesData &&
        cadencesData.accounts &&
        cadencesData.accounts.paging
        ? Math.ceil(cadencesData.accounts.paging.totalCount / cadenceLimit)
        : 0
    );
    setCadenceTotalCount(
      !cadenceLoading &&
        cadencesData &&
        cadencesData.accounts &&
        cadencesData.accounts.paging
        ? cadencesData.accounts.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [cadencesData]);

  const [
    fetchCadencesCount,
    {
      data: cadenceCount,
      loading: cadenceCountLoading,
      error: cadenceCountError,
    },
  ] = useLazyQuery(FETCH_ACCOUNTS_CADENCES_COUNT_QUERY, {
    variables: {
      accountId: accountId,
      userFilter: userFilter,
    },
    notifyOnNetworkStatusChange: true,
    skip:
      activeTab !== 'overview' &&
      activeTab !== 'cadences' &&
      activeTab !== 'stats',
    onCompleted: () => {
      fetchOverViewCadences();
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Cadence count',
        cadenceCount,
        'failed_cadence_count'
      );
    },
  });
  useEffect(() => {
    setCadenceCountDetails(
      !cadenceCountLoading && !cadenceCountError && cadenceCount
        ? {
            Total: cadenceCount?.total?.paging?.totalCount,
            Active: cadenceCount?.active?.paging?.totalCount,
            Inactive: cadenceCount?.inactive?.paging?.totalCount,
            Paused: cadenceCount?.paused?.paging?.totalCount,
          }
        : {
            Total: 0,
            Active: 0,
            Inactive: 0,
            Paused: 0,
          }
    );
    // eslint-disable-next-line
  }, [cadenceCount]);

  // fetching tasks data
  const {
    data: taskData,
    loading: taskLoading,
    refetch: refetchAccountTasks,
  } = useQuery(FETCH_ACCOUNT_TASKS_QUERY, {
    variables: {
      includeAssociationsQry: 'includeAssociations[]=cadence',
      id: accountId,
      userFilter: taskFilter,
      limit: taskLimit,
      offset: taskOffset,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Task data',
        taskData,
        'failed_task_data'
      );
    },
    notifyOnNetworkStatusChange: true,
    skip: activeTab !== 'tasks',
  });

  const [
    refetchEmailAccountTasks,
    { data: taskEmailData, loading: taskEmailLoading },
  ] = useLazyQuery(FETCH_ACCOUNT_TASKS_QUERY, {
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Task data',
        taskEmailData,
        'failed_task_data'
      );
    },
    onCompleted: () => {
      fetchPendingCount();
      setPersonalizeEmailProspectId(
        taskEmailData?.accounts?.data?.[0]?.id || 0
      );
      setPersonalizeEmailCadenceId(
        taskEmailData?.accounts?.data?.[0]?.associations?.cadence?.[0]?.id || 0
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  const accountsTaskGridData = useMemo(
    () => (taskData && taskData.accounts ? taskData.accounts.data : []),
    [taskData]
  );

  useEffect(() => {
    setPersonalizeEmailProspectId(
      !taskLoading && taskData && taskData.accounts && taskData.accounts.data[0]
        ? taskData.accounts.data[0].id
        : 0
    );
    setPersonalizeEmailCadenceId(
      !taskLoading &&
        taskData &&
        taskData.accounts &&
        taskData.accounts.data[0] &&
        taskData.accounts.data[0].associations.cadence
        ? taskData.accounts.data[0].associations.cadence[0].id
        : 0
    );
    if (isSendAndNext) {
      const nextProspectData = accountsTaskGridData.filter((data, i) => {
        return i === personalizeEmailProspectIndex;
      });

      if (nextProspectData && nextProspectData.length > 0) {
        setPersonalizeEmailProspectId(nextProspectData[0].id);
        setPersonalizeEmailCadenceId(
          nextProspectData[0].associations.cadence &&
            nextProspectData[0].associations.cadence[0].id
        );
        setShowPersonalizeEmailModal(true);
      }
    }
    setTaskPageCount(
      !taskLoading && taskData && taskData.accounts && taskData.accounts.paging
        ? Math.ceil(taskData.accounts.paging.totalCount / taskLimit)
        : 0
    );
    setTaskTotalCount(
      !taskLoading && taskData?.accounts?.paging
        ? taskData.accounts.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [taskData]);

  const [
    fetchPendingCount,
    { data: taskCount, loading: taskCountLoading, error: taskCountError },
  ] = useLazyQuery(FETCH_ACCOUNTS_TASKS_COUNT_QUERY, {
    variables: {
      accountId: accountId,
      userFilter: userFilter,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      fetchOutcomeCount();
      if (activeTab === 'overview') {
        fetchCallActivities();
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Task count',
        taskCount,
        'failed_task_count'
      );
    },
  });

  const totalEmailCount =
    !taskCountLoading && taskCount?.pendingEmail?.paging
      ? taskCount.pendingEmail.paging.totalCount
      : 0;

  useEffect(() => {
    setTaskCountDetails(
      !taskCountLoading && !taskCountError && taskCount?.total?.paging
        ? {
            Total: taskCount?.total?.paging?.totalCount,
            'Pending Calls': taskCount?.pendingCall?.paging?.totalCount,
            'Pending Emails': taskCount?.pendingEmail?.paging?.totalCount,
            'Pending Texts': taskCount?.pendingText?.paging?.totalCount,
            Waiting: taskCount?.wait?.paging?.totalCount,
          }
        : {
            Total: 0,
            'Pending Calls': 0,
            'Pending Emails': 0,
            'Pending Texts': 0,
            Waiting: 0,
          }
    );
    setPendingCalls(
      !taskCountLoading && taskCount?.pendingCall?.paging
        ? taskCount.pendingCall.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [taskCount]);
  const [fetchTemplates, { loading: templateLoading }] = useLazyQuery(
    FETCH_ACCOUNTS_TEMPLATES_QUERY,
    {
      variables: {
        accountId: accountId,
        userFilter: userFilter,
      },
      notifyOnNetworkStatusChange: true,
      skip: activeTab !== 'overview',
      onCompleted: (response) => handleTemplatesRequestCallback(response, true),
      onError: (response) => handleTemplatesRequestCallback(response),
    }
  );
  const handleTemplatesRequestCallback = (response, requestSuccess) => {
    if (requestSuccess && response?.templates !== null) {
      setAllTemplates(response.templates.data);
    }
  };

  const [
    fetchCallActivities,
    { data: callActivitiesData, loading: callActivitiesLoading },
  ] = useLazyQuery(FETCH_ACCOUNT_CALL_ACTIVITIES_QUERY, {
    variables: {
      accountId,
      filter: userFilter,
      sort: '&sort[activityDatetime]=desc',
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      if (response?.activities !== null && response !== undefined) {
        setCallActivities(response.activities.data);
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Call Activities',
        callActivitiesData,
        'failed_call_activities'
      );
    },
  });
  const [
    fetchTextActivities,
    { data: textActivitiesData, loading: textActivitiesLoading },
  ] = useLazyQuery(FETCH_ACCOUNT_TEXT_ACTIVITIES_QUERY, {
    variables: {
      accountId,
      filter: userFilter,
      sort: '&sort[activityDatetime]=desc',
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      if (response?.activities !== null && response !== undefined) {
        setTextActivities(response.activities.data);
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Text Activities',
        textActivitiesData,
        'failed_text_activity'
      );
    },
  });
  const [
    fetchActivities,
    {
      loading: allActivitiesLoading,
      error: allActivitiesError,
      fetchMore: fetchMoreAllActivities,
    },
  ] = useLazyQuery(FETCH_ACCOUNT_ACTIVITIES_QUERY, {
    variables: {
      accountId,
      allActivitiesLimit,
      allActivitiesOffset: allActivitiesOffset,
      filter: userFilter,
      sort: '&sort[activityDatetime]=desc',
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => handleActivityRequestCallback(response, true),
    onError: (response) => handleActivityRequestCallback(response),
  });

  const handleActivityRequestCallback = (response, requestSuccess) => {
    if (requestSuccess && response?.activities !== null) {
      setAllActivities(response?.activities?.data);
      setActivityPaging(response?.activities?.paging);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const handleActionShowMoreActivity = () => {
    const pageOffset = allActivitiesOffset + 1;
    setAllActivitiesOffset(pageOffset);
    fetchMoreAllActivities({
      variables: {
        accountId,
        allActivitiesLimit,
        allActivitiesOffset: pageOffset,
        filter: userFilter,
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

  const emailtouch = [];
  const calltouch = [];
  const texttouch = [];
  let touchid = [];
  let touchIndex;
  if (cadencesData && cadencesData.accounts && cadencesData.accounts.data) {
    touchid = cadencesData.accounts.data
      .map((data) => data.associations.touch.map((data) => data.id))
      .join()
      .split(',');
    if (
      cadencesData &&
      cadencesData.accounts &&
      cadencesData.accounts.includedAssociations &&
      cadencesData.accounts.includedAssociations.touch
    ) {
      touchIndex = cadencesData.accounts.includedAssociations.touch.filter(
        (data) => touchid.indexOf(data.id + '') !== -1
      );
      touchIndex.forEach(function (touchData) {
        if (touchData.touchType === 'EMAIL') {
          emailtouch.push(touchData);
        } else if (touchData.touchType === 'CALL') {
          calltouch.push(touchData);
        } else if (touchData.touchType === 'TEXT') {
          texttouch.push(touchData);
        }
      });
    }
  }
  // Accounts Pagination and Navigation to prev page has been disabled. Code will uncomment if the functionality required in future
  // let currentAccountIndex;
  // if (
  //   allAccountsData &&
  //   allAccountsData.accounts &&
  //   allAccountsData.accounts.data
  // ) {
  //   currentAccountIndex =
  //     allAccountsData.accounts.data.findIndex(
  //       (account) => account.id === accountId
  //     ) +
  //     allAccountsData.accounts.paging.limit *
  //       allAccountsData.accounts.paging.offset;
  // }

  const [
    fetchOutcomeCount,
    {
      data: outcomesCount,
      loading: outcomesCountLoading,
      error: outcomesCountError,
    },
  ] = useLazyQuery(FETCH_OUTCOMES_COUNT_QUERY, {
    variables: {
      id: accountId,
      userFilter: userFilter,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      if (activeTab === 'overview') fetchTextActivities();
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load outcome count',
        outcomesCount,
        'failed_outcome_count'
      );
    },
  });

  useEffect(() => {
    setEmailCountDetails(
      !outcomesCountLoading &&
        !outcomesCountError &&
        outcomesCount?.outcomes?.data?.[0]?.emailTouches
        ? {
            Bounced: outcomesCount.outcomes.data[0].emailTouches.bounced,
            Clicked: outcomesCount.outcomes.data[0].emailTouches.clicked,
            Failed: outcomesCount.outcomes.data[0].emailTouches.failed,
            Opened: outcomesCount.outcomes.data[0].emailTouches.opened,
            Optout: outcomesCount.outcomes.data[0].emailTouches.optout,
            Pending: outcomesCount.outcomes.data[0].emailTouches.pending,
            Replied: outcomesCount.outcomes.data[0].emailTouches.replied,
            Sent: outcomesCount.outcomes.data[0].emailTouches.sent,
            Total: outcomesCount.outcomes.data[0].emailTouches.total,
          }
        : {
            Bounced: 0,
            Clicked: 0,
            Failed: 0,
            Opened: 0,
            Optout: 0,
            Pending: 0,
            Replied: 0,
            Sent: 0,
            Total: 0,
          }
    );
    setCallCountDetails(
      !outcomesCountLoading && outcomesCount?.outcomes?.data?.[0]?.callTouches
        ? {
            'Positive OutComes':
              outcomesCount.outcomes.data[0].callTouches.positiveOutComes,
            'Bad Data': outcomesCount.outcomes.data[0].callTouches.badData,
            Others: outcomesCount.outcomes.data[0].callTouches.others,
            Pending: outcomesCount.outcomes.data[0].callTouches.pending,
            Total: outcomesCount.outcomes.data[0].callTouches.total,
          }
        : {
            'Bad Data': 0,
            Others: 0,
            Pending: 0,
            'Positive OutComes': 0,
            Total: 0,
          }
    );
    setTextCountDetails(
      !outcomesCountLoading && outcomesCount?.outcomes?.data?.[0]?.textTouches
        ? {
            Sent: outcomesCount.outcomes.data[0].textTouches.sent,
            Received: outcomesCount.outcomes.data[0].textTouches.received,
            Pending: outcomesCount.outcomes.data[0].textTouches.pending,
            Total: outcomesCount.outcomes.data[0].textTouches.total,
          }
        : {
            Sent: 0,
            Received: 0,
            Pending: 0,
            Total: 0,
          }
    );
    // eslint-disable-next-line
  }, [outcomesCount]);

  const {
    data: callOutcomeProspectData,
    loading: outcomeCallLoading,
  } = useQuery(FETCH_OUTCOME_PROSPECTS_QUERY, {
    variables: {
      id: accountId,
      outcome: outcomeType,
      offset: callOffset,
      limit: callLimit,
      accountOutcomeFilter: accountOutcomeFilter,
      outcomeQuerySort: outcomeQuerySortCall,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Call outcome data',
        callOutcomeProspectData,
        'failed_call_outcome'
      );
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: activeTab !== 'stats',
  });

  const {
    data: emailOutcomeProspectData,
    loading: outcomeEmailLoading,
  } = useQuery(FETCH_OUTCOME_PROSPECTS_QUERY, {
    variables: {
      id: accountId,
      outcome:
        emailOutcomeType === 'clicked'
          ? 'Links Clicked'
          : emailOutcomeType === 'optout'
          ? 'Opt-out'
          : emailOutcomeType,
      limit: emailLimit,
      offset: emailOffset,
      accountOutcomeFilter: accountEmailOutcomeFilter,
      outcomeQuerySort: outcomeQuerySortEmail,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'SOrry! Failed to load Email outcome data',
        emailOutcomeProspectData,
        'failed_email_outcome'
      );
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: activeTab !== 'stats',
  });

  const {
    data: textOutcomeProspectData,
    loading: outcomeTextLoading,
  } = useQuery(FETCH_OUTCOME_PROSPECTS_QUERY, {
    variables: {
      id: accountId,
      outcome: textOutcomeType,
      limit: textLimit,
      offset: textOffset,
      accountOutcomeFilter: accountTextOutcomeFilter,
      outcomeQuerySort: outcomeQuerySortText,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Text outcome',
        textOutcomeProspectData,
        'failed_text_outcome'
      );
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: activeTab !== 'stats',
  });

  useEffect(() => {
    setCallOutcomePageCount(
      !outcomeCallLoading &&
        callOutcomeProspectData &&
        callOutcomeProspectData.prospects &&
        callOutcomeProspectData.prospects.paging
        ? Math.ceil(
            callOutcomeProspectData.prospects.paging.totalCount / callLimit
          )
        : 0
    );
    setEmailOutcomePageCount(
      !outcomeEmailLoading &&
        emailOutcomeProspectData &&
        emailOutcomeProspectData.prospects &&
        emailOutcomeProspectData.prospects.paging
        ? Math.ceil(
            emailOutcomeProspectData.prospects.paging.totalCount / emailLimit
          )
        : 0
    );
    setTextOutcomePageCount(
      !outcomeTextLoading &&
        textOutcomeProspectData &&
        textOutcomeProspectData.prospects &&
        textOutcomeProspectData.prospects.paging
        ? Math.ceil(
            textOutcomeProspectData.prospects.paging.totalCount / textLimit
          )
        : 0
    );
    setTotalCountOfCall(
      !outcomeCallLoading &&
        callOutcomeProspectData &&
        callOutcomeProspectData.prospects &&
        callOutcomeProspectData.prospects.paging
        ? callOutcomeProspectData.prospects.paging.totalCount
        : 0
    );
    setTotalCountOfEmail(
      !outcomeEmailLoading &&
        emailOutcomeProspectData &&
        emailOutcomeProspectData.prospects &&
        emailOutcomeProspectData.prospects.paging
        ? emailOutcomeProspectData.prospects.paging.totalCount
        : 0
    );
    setTotalCountOfText(
      !outcomeTextLoading &&
        textOutcomeProspectData &&
        textOutcomeProspectData.prospects &&
        textOutcomeProspectData.prospects.paging
        ? textOutcomeProspectData.prospects.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [
    callOutcomeProspectData,
    emailOutcomeProspectData,
    textOutcomeProspectData,
  ]);

  const outcomeProspectGridData = useMemo(
    () =>
      callOutcomeProspectData && callOutcomeProspectData.prospects
        ? callOutcomeProspectData.prospects.data
        : [],
    [callOutcomeProspectData]
  );

  const emailOutcomeGridData = useMemo(
    () =>
      emailOutcomeProspectData && emailOutcomeProspectData.prospects
        ? emailOutcomeProspectData.prospects.data
        : [],
    [emailOutcomeProspectData]
  );

  const textOutcomeGridData = useMemo(
    () =>
      textOutcomeProspectData && textOutcomeProspectData.prospects
        ? textOutcomeProspectData.prospects.data
        : [],
    [textOutcomeProspectData]
  );

  const handleRenderPrevAccount = () => {
    if (
      allAccountsData &&
      allAccountsData.accounts &&
      allAccountsData.accounts.data
    ) {
      const currentIndex = allAccountsData.accounts.data.findIndex(
        (account) => account.id === accountId
      );
      if (currentIndex === 0 && !renderPrevAccount) {
        setRenderPrevAccount(true);
        updateQueryParam({ 'page[offset]': offset - 1 });
        setOffset(offset - 1);
        fetchAccountsNextPage({
          variables: { offset: offset - 1 },
        });
        return;
      }
      setRenderPrevAccount(false);
      const prevAccount =
        allAccountsData.accounts.data[
          (currentIndex === -1
            ? allAccountsData.accounts.data.length
            : currentIndex) - 1
        ];
      updateAccountView(prevAccount);
    }
  };

  const handleRenderNextAccount = () => {
    if (
      allAccountsData &&
      allAccountsData.accounts &&
      allAccountsData.accounts.data
    ) {
      const currentIndex = allAccountsData.accounts.data.findIndex(
        (account) => account.id === accountId
      );
      if (currentIndex + 1 === allAccountsData.accounts.data.length) {
        setRenderNextAccount(true);
        updateQueryParam({ 'page[offset]': offset + 1 });
        setOffset(offset + 1);
        fetchAccountsNextPage({
          variables: { offset: offset + 1 },
        });
        return;
      }
      setRenderNextAccount(false);
      const nextAccount = allAccountsData.accounts.data[currentIndex + 1];
      updateAccountView(nextAccount);
    }
  };

  useEffect(() => {
    if (accountToRender === undefined) {
      fetchAccountsNextPage({ variables: { offset } });
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (renderNextAccount) {
      handleRenderNextAccount();
    }
    if (renderPrevAccount) {
      handleRenderPrevAccount();
    }
    if (!accountToRender && allAccountsData) {
      updateAccountView(
        allAccountsData.accounts.data.find(
          (account) => account.id === accountId
        )
      );
    }
    // eslint-disable-next-line
  }, [allAccountsData]);

  const updateQueryParam = (param) => {
    const { query } = parseUrl(window.location.search);
    const searchString = Object.entries({ ...query, ...param })
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    window.history.replaceState({}, '', '?' + searchString);
  };

  const updateAccountView = (account) => {
    if (account && account.associations && account.associations.prospect) {
      setAccountId(account.id);
      setAccountToRender(account);
      window.history.replaceState(
        {},
        '',
        `${account.id}` + window.location.search
      );
    }
    fetchCadencesCount();
    fetchProspectsCount();
    fetchPendingCount();
    fetchTemplates();
  };

  const tasksTouchOutcome = {
    'pending calls': 'calls',
    'pending emails': 'email',
    'pending texts': 'text',
    waiting: 'wait',
  };

  const getProspFilterQry = () => {
    const filterQry = [];

    if (selectedUser) {
      filterQry.push(
        `filter[user][id]=${selectedUser}&accountLimit=${limit}&accountOffset=${offset}&activeTab=${activeTab}`
      );
    }
    switch (activeTab) {
      case 'overview':
        filterQry.push('filter[touchType]=completed');
        break;
      case 'prospects':
        filterQry.push(
          `${
            prospectSortParms[sortBy]
              ? prospectSortParms[sortBy]
              : `sort[${sortBy}]`
          }=${orderBy}`
        );
        filterQry.push(`page[limit]=${prospectLimit}`);
        filterQry.push(`page[offset]=${prospectOffset}`);
        filterQry.push(`filter[touchType]=${activeFilter.toLowerCase()}`);
        if (searchValue) {
          filterQry.push(`filter[contactName]=*${searchValue}`);
        }
        break;
      case 'cadences':
        filterQry.push(`${cadenceSortParams[cadenceSortBy]}=${cadenceOrderBy}`);
        filterQry.push(`page[limit]=${cadenceLimit}`);
        filterQry.push(`page[offset]=${cadenceOffset}`);
        filterQry.push(`filter[touchType]=${activeFilter.toLowerCase()}`);
        if (searchValue) {
          filterQry.push(`filter[contactName]=*${searchValue}`);
        }
        break;
      case 'tasks':
        filterQry.push(`sort[${taskSortBy}]=${taskOrderBy}`);
        filterQry.push(`page[limit]=${taskLimit}`);
        filterQry.push(`page[offset]=${taskOffset}`);
        filterQry.push(`filter[touchType]=pending`);
        if (activeFilter.toLowerCase() !== 'total') {
          filterQry.push(
            `filter[outCome]=${tasksTouchOutcome[activeFilter.toLowerCase()]}`
          );
        }
        if (searchValue) {
          filterQry.push(`filter[contactName]=*${searchValue}`);
        }
        break;
      default:
    }

    return filterQry.join('&');
  };

  useEffect(() => {
    window.history.replaceState({}, '', '?' + getProspFilterQry());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    activeFilter,
    prospectLimit,
    prospectOffset,
    sortBy,
    orderBy,
    cadenceSortBy,
    cadenceOrderBy,
    cadenceLimit,
    cadenceOffset,
    taskSortBy,
    taskOrderBy,
    taskLimit,
    taskOffset,
    selectedUser,
    searchValue,
  ]);

  // handle main tabs change
  const handleTabChange = (tabVal, tabFilter, outCome) => {
    setSearchValue(null);
    const userOfFilter =
      `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']');
    if (tabVal !== activeTab) {
      setActiveTab(tabVal);
      switch (tabVal) {
        case 'overview':
          setUserFilter(userOfFilter);
          break;
        case 'prospects':
          setActiveFilter(tabFilter ? tabFilter : 'Total');
          setCurrentTabFilter(tabFilter ? tabFilter.toLowerCase() : 'total');
          setProspectOffset(0);
          setProspectLimit(10);
          setProspectFilter(
            tabFilter !== undefined
              ? `filter[touchType]=${tabFilter.toLowerCase()}&${userOfFilter}&sort[contactName]=asc`
              : userOfFilter
          );
          fetchProspects({
            variables: {
              prospectFilter:
                tabFilter !== undefined
                  ? `filter[touchType]=${tabFilter.toLowerCase()}&${userOfFilter}&sort[contactName]=asc`
                  : userOfFilter + '&sort[contactName]=asc',
            },
          });
          fetchProspectsCount({
            variables: {
              userFilter: userOfFilter,
            },
          });
          break;
        case 'cadences':
          setActiveFilter(tabFilter ? tabFilter : 'Total');
          setCurrentTabFilter(tabFilter ? tabFilter.toLowerCase() : 'total');
          setCadenceOffset(0);
          setCadenceLimit(10);
          setCadenceFilter(
            tabFilter !== undefined
              ? `&filter[status]=${tabFilter.toUpperCase()}&${userOfFilter}`
              : `&${userOfFilter}`
          );
          fetchCadences({
            variables: {
              accountCadencesFilter:
                tabFilter !== undefined
                  ? `&filter[status]=${tabFilter.toUpperCase()}&${userOfFilter}`
                  : `&${userOfFilter}`,
            },
          });
          fetchCadencesCount({
            variables: {
              userFilter: userOfFilter,
            },
          });
          break;
        case 'tasks':
          // eslint-disable-next-line no-case-declarations
          let filterType;
          if (tabFilter === 'calls') {
            filterType = 'Pending Calls';
          } else if (tabFilter === 'email') {
            filterType = 'Pending Emails';
          } else if (tabFilter === 'text') {
            filterType = 'Pending Texts';
          } else {
            filterType = 'Total';
          }
          setActiveFilter(filterType);
          setCurrentTabFilter(tabFilter ? tabFilter.toLowerCase() : 'total');
          setTaskOffset(0);
          setTaskLimit(10);
          setTaskFilter(
            tabFilter !== undefined
              ? `filter[outCome]=${tabFilter}&${userOfFilter}&sort[contactName]=asc`
              : userOfFilter + '&sort[contactName]=asc'
          );
          fetchPendingCount({
            variables: {
              userFilter: userOfFilter,
            },
          });
          break;
        case 'stats':
          setCadenceOffset(0);
          fetchProspectsCount({
            variables: {
              userFilter: userOfFilter,
            },
          });
          fetchCadencesCount({
            variables: {
              userFilter: userOfFilter,
            },
          });

          fetchOutcomeCount({
            variables: {
              userFilter: userOfFilter,
            },
          });
          if (tabFilter === 'email') {
            setEmailOutcomeType(outCome);
          }
          break;
        case 'activity':
          setActiveActivityTab(
            tabFilter !== undefined
              ? tabFilter
              : user?.defaultActivityFilter
              ? user.defaultActivityFilter === 'others'
                ? 'social'
                : user.defaultActivityFilter
              : 'all'
          );
          setAllActivitiesOffset(0);
          fetchActivities({
            variables: {
              filter: userOfFilter,
            },
          });
          break;
        default:
          break;
      }
    }
  };

  const prospectsFilterButtons = [
    'Total',
    'Assigned',
    'Unassigned',
    'Paused',
    'Completed',
    'Pending',
  ];
  const cadenceFilterButtons = ['Total', 'Active', 'Inactive', 'Paused'];

  const taskFilterButtons = [
    'Total',
    'Pending Calls',
    'Pending Emails',
    'Pending Texts',
    'Waiting',
  ];
  const handleUserSearch = (value) => {
    setSelectedUser(value > 0 ? value : currentUserId);
    const userOfFilter =
      `filter[user][id]=` + encodeURIComponent(':[' + value + ']');
    switch (activeTab) {
      case 'overview':
        setUserFilter(userOfFilter);
        setProspectFilter(userOfFilter);
        break;
      case 'prospects':
        fetchProspectsCount({
          variables: {
            userFilter: userOfFilter,
          },
        });
        fetchProspects({
          variables: {
            prospectFilter: userOfFilter + `&sort[contactName]=asc`,
          },
        });
        setProspectFilter(userOfFilter);
        break;
      case 'cadences':
        fetchCadencesCount({
          variables: {
            userFilter: userOfFilter,
          },
        });
        setCadenceFilter(userOfFilter);
        fetchCadences({
          variables: userOfFilter,
        });
        break;
      case 'tasks':
        fetchPendingCount({
          variables: {
            userFilter: userOfFilter,
          },
        });
        setTaskFilter(userOfFilter);
        break;
      case 'stats':
        fetchProspectsCount({
          variables: {
            userFilter: userOfFilter,
          },
        });
        fetchCadencesCount({
          variables: {
            userFilter: userOfFilter,
          },
        });

        fetchOutcomeCount({
          variables: {
            userFilter: userOfFilter,
          },
        });
        break;
      case 'activity':
        setUserFilter(userOfFilter);
        break;
      default:
        break;
    }
  };

  const handleProspectOrCadenceSearch = (search) => {
    setSearchValue(search);
    const userOfFilter =
      `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']');
    if (activeTab === 'prospects') {
      setProspectFilter(
        search !== ''
          ? userOfFilter +
              `&filter[contactName]=*${search}&filter[touchType]=${currentTabFilter}`
          : userOfFilter + `&filter[touchType]=${currentTabFilter}`
      );
      fetchProspects({
        variables: {
          prospectFilter:
            search !== ''
              ? userOfFilter +
                `&filter[contactName]=*${search}&filter[touchType]=${currentTabFilter}`
              : userOfFilter + `&filter[touchType]=${currentTabFilter}`,
        },
      });
      fetchProspectsCount({
        variables: {
          userFilter:
            search !== ''
              ? userOfFilter + `&filter[contactName]=*${search}`
              : userOfFilter,
        },
      });
    } else if (activeTab === 'tasks') {
      setTaskFilter(
        search !== ''
          ? currentTabFilter !== 'total'
            ? userOfFilter +
              `&filter[contactName]=*${search}&filter[touchType]=pending&filter[outCome]=${tasksTouchOutcome[
                currentTabFilter
              ].toLowerCase()}`
            : userOfFilter +
              `&filter[contactName]=*${search}&filter[touchType]=pending`
          : currentTabFilter !== 'total'
          ? userOfFilter +
            `&filter[outCome]=${tasksTouchOutcome[
              currentTabFilter
            ].toLowerCase()}&filter[touchType]=pending`
          : userOfFilter + `&filter[touchType]=pending`
      );
      fetchPendingCount({
        variables: {
          userFilter:
            search !== ''
              ? userOfFilter + `&filter[contactName]=*${search}`
              : userOfFilter,
        },
      });
    } else if (activeTab === 'cadences') {
      setCadenceFilter(
        search !== ''
          ? currentTabFilter !== 'total'
            ? userOfFilter +
              `&filter[name]=*${search}&filter[status]=${currentTabFilter.toUpperCase()}`
            : userOfFilter + `&filter[name]=*${search}`
          : currentTabFilter !== 'total'
          ? userOfFilter + `&filter[status]=${currentTabFilter.toUpperCase()}`
          : userOfFilter
      );
      fetchCadences({
        accountCadencesFilter:
          search !== ''
            ? currentTabFilter !== 'total'
              ? userOfFilter +
                `&filter[name]=*${search}&filter[status]=${currentTabFilter.toUpperCase()}`
              : userOfFilter + `&filter[name]=*${search}`
            : currentTabFilter !== 'total'
            ? userOfFilter + `&filter[status]=${currentTabFilter.toUpperCase()}`
            : userOfFilter,
      });
      fetchCadencesCount({
        variables: {
          userFilter:
            search !== ''
              ? userOfFilter + `&filter[name]=*${search}`
              : userOfFilter,
        },
      });
    }
  };

  const handleRefreshMetricsCount = (touchType) => {
    const userOfFilter =
      `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']');
    switch (touchType) {
      case 'cadence':
        fetchCadencesCount({
          variables: userOfFilter,
        });
        break;
      case 'prospect':
        fetchProspectsCount({
          variables: userOfFilter,
        });
        break;
      default:
        fetchOutcomeCount({
          variables: userOfFilter,
        });
    }
  };

  const handleProspectSort = () => {
    const { query } = parseUrl(window.location.search);
    query['page[offset]'] = 0;
    query[prospectSortParms[sortBy]] = orderBy;
    const filterQry = Object.entries({ ...query })
      .filter(
        ([key]) => key.startsWith('sort') && !key.startsWith('sort[name]')
      )
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    setProspectFilter(userFilter + '&' + filterQry);
    fetchProspects({
      variables: {
        prospectFilter:
          `filter[touchType]=${activeFilter.toLowerCase()}&` +
          userFilter +
          '&' +
          filterQry,
      },
    });
  };
  // eslint-disable-next-line
  useEffect(() => handleProspectSort(), [sortBy, orderBy]);

  const handleCadenceSort = () => {
    const { query } = parseUrl(window.location.search);
    query[cadenceSortParams[cadenceSortBy]] = cadenceOrderBy;
    const filterQry = Object.entries({ ...query })
      .filter(
        ([key]) =>
          key.startsWith('sort') && !key.startsWith('sort[contactName]')
      )
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setCadenceFilter(
      (statCadenceOutcomeType === 'Total'
        ? userFilter
        : userFilter +
          `&filter[status]=${statCadenceOutcomeType.toUpperCase()}`) +
        '&' +
        filterQry
    );
    fetchCadences({
      accountCadencesFilter:
        (statCadenceOutcomeType === 'Total'
          ? userFilter
          : userFilter +
            `&filter[status]=${statCadenceOutcomeType.toUpperCase()}`) +
        '&' +
        filterQry,
    });
  };
  // eslint-disable-next-line
  useEffect(() => handleCadenceSort(), [cadenceSortBy, cadenceOrderBy]);

  // [tasks sort]
  const handleTaskSort = () => {
    const activeFilterQuery =
      activeFilter === 'Total'
        ? ''
        : '&filter[outCome]=' +
          (activeFilter === 'Pending Emails'
            ? 'email'
            : activeFilter === 'Pending Texts'
            ? 'texts'
            : activeFilter === 'Pending Calls'
            ? 'calls'
            : 'wait');
    const { query } = parseUrl(window.location.search);
    query['page[offset]'] = 0;
    query[taskSortParams[taskSortBy]] = taskOrderBy;
    const filterQry = Object.entries({ ...query })
      .filter(([key]) => key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    // setting 'taskFilter' which will cause refeching of 'tasksData'
    setTaskFilter(userFilter + '&' + filterQry + activeFilterQuery);
  };
  // eslint-disable-next-line
  useEffect(() => handleTaskSort(), [taskSortBy, taskOrderBy]);

  // fetch data when filter button is clicked
  const fetchTabBasedFilterData = (e, filterTab) => {
    setSearchValue(null);
    const filterUserString =
      `filter[user][id]=` + encodeURIComponent(':[' + selectedUser + ']');
    if (activeTab === 'prospects') {
      setProspectFilter(
        filterTab === 'Total'
          ? filterUserString
          : filterUserString + `&filter[touchType]=${filterTab.toLowerCase()}`
      );
      fetchProspects({
        variables: {
          prospectFilter:
            filterTab !== undefined
              ? `filter[touchType]=${filterTab.toLowerCase()}&${filterUserString}`
              : filterUserString,
        },
      });
      fetchProspectsCount({
        variables: {
          userFilter: filterUserString,
        },
      });
    } else if (activeTab === 'tasks') {
      let filterType;
      if (filterTab === 'Pending Calls') {
        filterType = 'calls';
      } else if (filterTab === 'Pending Emails') {
        filterType = 'email';
      } else if (filterTab === 'Pending Texts') {
        filterType = 'text';
      } else {
        filterType = 'wait';
      }
      setTaskFilter(
        filterTab === 'Total'
          ? filterUserString
          : filterUserString + `&filter[outCome]=${filterType}`
      );
      fetchPendingCount({
        variables: {
          userFilter: filterUserString,
        },
      });
    } else if (activeTab === 'cadences') {
      setCadenceFilter(
        filterTab === 'Total'
          ? filterUserString
          : filterUserString + `&filter[status]=${filterTab.toUpperCase()}`
      );
      fetchCadences({
        accountCadencesFilter:
          filterTab === 'Total'
            ? filterUserString
            : filterUserString + `&filter[status]=${filterTab.toUpperCase()}`,
      });
      fetchCadencesCount({
        variables: {
          userFilter: filterUserString,
        },
      });
    }
  };

  // filter buttons
  const TabBasedFilters = (props) => {
    const count = props.count;
    const showFilter = props.data.slice(0, 4);
    const dropdownFilter = props.data.slice(4);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggle = () => setDropdownOpen(!dropdownOpen);
    return (
      <ButtonGroup>
        {showFilter.map((item, index) => {
          const countValue = count[item];
          return (
            <FilterButton
              className={`px-2 ${
                activeFilter === item
                  ? 'bg-color-primary-shade text-white text-bold'
                  : 'text-dark text-bold'
              }`}
              key={index}
              count={countValue}
              active={activeFilter === item}
              tab-content={item}
              countLoading={
                activeTab === 'prospects'
                  ? prospectCountLoading
                  : activeTab === 'cadences'
                  ? cadenceCountLoading
                  : taskCountLoading
              }
              handleClick={(e) => {
                setCurrentTabFilter(item.toLowerCase());
                setActiveFilter(item);
                fetchTabBasedFilterData(e, item);
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </FilterButton>
          );
        })}
        {props.data.length > 4 && (
          <ButtonDropdown
            isOpen={dropdownOpen}
            toggle={toggle}
            title="More filters"
          >
            <DropdownToggle>
              <i className="fas fa-angle-double-right"></i>
            </DropdownToggle>
            <DropdownMenu>
              {dropdownFilter.map((item, index) => {
                const countValue = count[item];
                return (
                  <DropdownItem tag="span" className="p-0" key={index}>
                    <FilterButton
                      className={`${
                        activeFilter === item
                          ? 'bg-color-primary-shade text-white text-bold'
                          : 'text-dark text-bold'
                      }`}
                      style={{ border: 'none' }}
                      key={index}
                      count={countValue}
                      active={activeFilter === item}
                      tab-content={item}
                      countLoading={
                        activeTab === 'prospects'
                          ? prospectCountLoading
                          : activeTab === 'cadences'
                          ? cadenceCountLoading
                          : taskCountLoading
                      }
                      handleClick={(e) => {
                        setCurrentTabFilter(item.toLowerCase());
                        setActiveFilter(item);
                        fetchTabBasedFilterData(e, item);
                      }}
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </FilterButton>
                  </DropdownItem>
                );
              })}
            </DropdownMenu>
          </ButtonDropdown>
        )}
      </ButtonGroup>
    );
  };
  //start power dialing start
  const [
    startPowerDialing,
    { data: powerDialerData, loading: startPowerDialingReqLoading },
  ] = useLazyQuery(START_POWER_DIALING_QUERY, {
    onCompleted: () => {
      setShowStartPowerDialingConfirmModal(false);
      window
        .open(
          !configurationsError &&
            configurationsData?.configurations?.data[0]?.powerDialerUrl,
          'dialers'
        )
        .focus();
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Sorry! Failed to start Power Dialing',
        powerDialerData,
        'failed_power_dialer'
      );
    },
  });

  const { data: lookupdata } = useQuery(GET_LOOKUP_VALUE_QUERY, {
    variables: {
      lookupsFilter: `filter[lookupName]=import_ajax_timeout`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load lookup data',
        lookupdata,
        'failed_lookup'
      );
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: activeTab !== 'tasks',
  });

  const handleStartPowerDialing = () => {
    if (pendingCalls === 0) {
      notify(
        'Sorry! There are no Prospect(s) available to dial!',
        'error',
        'no_calls_available'
      );
    } else {
      setShowStartPowerDialingConfirmModal(true);
    }
  };

  const handleConfirmStartPowerDialing = () => {
    if (!currentUserId) {
      notify(
        'Invalid User. The User do not have permission to start Power Dialing.',
        'error',
        'invalid_user'
      );
    } else {
      const query = parseUrl(window.location.search);
      const filterQry = Object.entries({
        ...query,
        'filter[account][id]': accountId,
        'filter[user][id]': selectedUser,
        'filter[callTouch][type]': 'CALL',
        'filter[currentTouchStatus]': 'SCHEDULED',
      })
        .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
        .map(([key, val]) => `${key}=${val}`)
        .join('&');
      if (lookupdata && lookupdata.lookup && lookupdata.lookup.data) {
        startPowerDialing({
          variables: {
            includeAssociationsQry:
              'includeAssociations[]=cadence&includeAssociations[]=touch&includeAssociations[]=prospectTask',
            prospectFilter: `&${filterQry}`,
            limit,
            offset,
          },
          context: { timeout: parseInt(lookupdata.lookup.data[0].lookupValue) },
        });
      }
    }
  };
  //start power dialing end

  const handleStatProspectsOrCadence = (touchType, outcome) => {
    switch (touchType) {
      case 'cadences':
        setStatCadenceOutcomeType(outcome);
        setCadenceOpen(true);
        setCadenceFilter(
          outcome === 'Total'
            ? userFilter
            : userFilter + `&filter[status]=${outcome}`
        );
        break;
      case 'prospects':
        setStatProspectOutcomeType(outcome);
        setProspectOpen(true);
        setProspectFilter(
          outcome === 'Total'
            ? userFilter
            : userFilter + `&filter[touchType]=${outcome.toLowerCase()}`
        );
        fetchProspects({
          prospectFilter:
            outcome === 'Total'
              ? userFilter
              : userFilter + `&filter[touchType]=${outcome.toLowerCase()}`,
        });

        break;
      case 'email':
        setEmailOpen(true);
        setEmailOutcomeType(outcome);
        setAccountEmailOutcomeFilter(userFilter + `&filter[touchType]=email`);
        break;
      case 'call':
        setCallOpen(true);
        setOutcomeType(outcome);
        setAccountOutcomeFilter(userFilter + `&filter[touchType]=call`);
        break;
      case 'text':
        setTextOpen(true);
        setTextOutcomeType(outcome);
        setAccountTextOutcomeFilter(userFilter + `&filter[touchType]=text`);
        break;
      default:
        break;
    }
  };

  const hideProspectOrCadenceDetails = (touchType) => {
    switch (touchType) {
      case 'cadences':
        setCadenceOpen(false);
        break;
      case 'prospects':
        setProspectOpen(false);
        break;
      case 'email':
        setEmailOpen(false);
        break;
      case 'call':
        setCallOpen(false);
        break;
      case 'text':
        setTextOpen(false);
        break;
      default:
        break;
    }
  };
  //personalize Email
  const { data: mailMergeVariablesData } = useQuery(
    FETCH_MAIL_MERGE_VARIABLES,
    {
      notifyOnNetworkStatusChange: true,
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to load Mail merge variables',
          mailMergeVariablesData,
          'failed_mail_merge'
        );
      },
      fetchPolicy: 'cache-first',
      skip: activeTab !== 'tasks' && activeTab !== 'prospects',
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

  //Row toobar actions
  const handleRowToolbarButtonAction = (action, prospect, rowIndex) => {
    if (action === 'Dial') {
      let phoneNumber = null;
      if (prospect?.phone) {
        phoneNumber = prospect.phone;
      } else if (prospect) {
        const phoneNumberList = Object.keys(prospect).filter(
          (key) => key.startsWith('customPhone') && prospect[key]
        );
        phoneNumber =
          phoneNumberList &&
          phoneNumberList.length > 0 &&
          prospect[phoneNumberList[0]];
      }

      history.push({
        pathname: '/prospects/list/' + prospect.id,
        search: window.location.search,
        state: {
          dialingNumber: phoneNumber && phoneNumber,
          accountId: prospect?.associations?.account?.[0].id,
          rowIndex: rowIndex && rowIndex,
          touchType: activeFilter.toLocaleLowerCase(),
          contactName: searchValue && searchValue,
          prospect,
        },
      });
    } else if (action === 'Email') {
      setOneOffProspectId(prospect.id);
      setShowSendOneOffEmail(true);
    }
  };
  let ownerName = selectedUserName?.split(' ');
  ownerName =
    ownerName?.[0]?.charAt(0) + (ownerName[1] ? ownerName[1].charAt(0) : '');
  const pageName = `Accounts / ${
    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
  }${
    activeTab === 'prospects' || activeTab === 'tasks'
      ? ' / ' + activeFilter
      : ''
  }`;

  const outcomeSortingParams = {
    contactName: '[contactName]',
    cadence: '[campaignName]',
    cadenceStatus: '[touch][stepNo]',
    email: '[email]',
    activityDate: '[updatedDate]',
  };
  const tableSortingValues = [
    'contactName',
    'cadence',
    'touch',
    'createdDate',
    'duedate',
  ];

  const [popoverOpen, setPopoverOpen] = useState(false);
  const toggle = () => setPopoverOpen(!popoverOpen);
  const [clickedTemplate, setClickedTemplate] = useState(null);

  const PopoverItem = (props) => {
    const { id, popoverOpen, toggle, data, description } = props;
    return (
      <span>
        <Popover
          placement="right-start"
          isOpen={popoverOpen}
          target={'Popover-' + id}
          toggle={toggle}
          trigger="legacy"
          style={{
            width: '350px',
            overflowX: 'hidden',
          }}
          innerClassName="shadow-sm rounded border"
        >
          <PopoverHeader className="bg-view-info-header text-white">
            {data.name}
            <span
              className="float-right"
              onClick={() => {
                toggle();
              }}
            >
              <i className="fas fa-times pointer" />
            </span>
          </PopoverHeader>
          <PopoverBody className="bg-secondary pr-1 pl-2">
            <ScrollArea
              speed={0.8}
              className="area"
              contentClassName="content"
              horizontal={true}
              style={{
                minHeight: '50px',
                maxHeight: '150px',
                minWidth: '340px',
              }}
            >
              <Row>
                <Col className="mr-2">
                  <span className="text-bold">Subject:</span>{' '}
                  {data.subject.replace(nbspRegEx, ' ')}
                </Col>
              </Row>
              <Row>
                <Col className="mr-2">
                  <span className="text-bold">Description:</span>{' '}
                  {description.replace(nbspRegEx, ' ')}
                </Col>
              </Row>
            </ScrollArea>
          </PopoverBody>
        </Popover>
      </span>
    );
  };

  return (
    <ContentWrapper>
      <PageHeader
        icon={
          overviewProspectLoading || overViewCadenceLoading || templateLoading
            ? 'fa fa-spinner fa-spin'
            : 'far fa-building'
        }
        title={
          (overviewProspectLoading ||
            overViewCadenceLoading ||
            templateLoading) &&
          'Loading'
        }
        pageName={pageName}
      >
        <div className="d-flex justify-content-end align-items-center">
          <Row>
            <Col>
              <InputGroup>
                {isManagerUser && (
                  <UserList
                    value={selectedUser}
                    placeHolder={'select User'}
                    disabled={isManagerUser ? false : true}
                    onChange={(value, name) => {
                      handleUserSearch(value);
                      setSelectedUserName(name ? name : '');
                    }}
                  />
                )}
              </InputGroup>
            </Col>
            {(activeTab === 'prospects' ||
              activeTab === 'cadences' ||
              activeTab === 'tasks') && (
              <Col>
                <SearchBar
                  searchInput={searchKey}
                  onSearch={(searchValue) => {
                    setSearchKey(searchValue ? searchValue : '');
                    handleProspectOrCadenceSearch(searchValue);
                  }}
                  onChange={setSearchKey}
                />
              </Col>
            )}
            {activeTab === 'tasks' && (
              <>
                {/* personalize email */}
                <Button
                  className="mr-2 text-white"
                  style={{
                    display: activeFilter === 'Pending Emails' ? '' : 'none',
                  }}
                  color="info"
                  onClick={() => {
                    if (accountsTaskGridData.length > 0) {
                      setShowPersonalizeEmailModal(true);
                    } else {
                      notify(
                        'No prospect/touch info available to personalize Email.',
                        'error',
                        'no_prospect_available'
                      );
                    }
                  }}
                >
                  <i className="fas fa-pencil-alt pointer mr-2"></i>
                  <strong>Personalize Email</strong>
                </Button>
                <Button
                  disabled={
                    currentUserId !== selectedUser ||
                    (userLicence.indexOf('TD') === -1 &&
                      userLicence.indexOf('PD') === -1)
                  }
                  style={{
                    display: activeFilter === 'Pending Calls' ? '' : 'none',
                  }}
                  size="lg"
                  className="btn-labeled bg-color-grass btn-secondary mr-2 bg-color-grass"
                  onClick={handleStartPowerDialing}
                >
                  <span className="mr-2">
                    <span className="svgicon calling"></span>
                  </span>
                  <span className="text-bold h5 text-nowrap">
                    Start Power Dialing
                  </span>
                </Button>
              </>
            )}
          </Row>
          {/* Accounts Pagination and Navigation to prev page has been disabled. Code will uncomment if the functionality required in future
          <Nav>
            {allAccountsData &&
              allAccountsData?.accounts?.paging &&
              !renderNextAccount && (
                <NavItem
                  hidden={
                    (location.state && location.state.origin) ||
                    getAccountIndex() + 1 === 0
                  }
                >
                  <small className="pt-2 ml-2">
                    {getAccountIndex() + 1} of{' '}
                    {allAccountsData.accounts.paging.totalCount} Accounts
                  </small>
                </NavItem>
              )}
            <NavItem
              hidden={
                (location.state && location.state.origin) ||
                getAccountIndex() + 1 === 0
              }
            >
              <Button
                color="link"
                className="btn-sm"
                onClick={handleRenderPrevAccount}
                disabled={currentAccountIndex <= 0}
              >
                <i className="fas fa-chevron-left" title="Previous Account"></i>
              </Button>
              <Button
                color="link"
                className="btn-sm"
                onClick={handleRenderNextAccount}
                disabled={
                  allAccountsData &&
                  allAccountsData?.accounts?.paging &&
                  allAccountsData.accounts.paging.totalCount ===
                    currentAccountIndex + 1
                }
              >
                <i className="fas fa-chevron-right" title="Next Account"></i>
              </Button>
            </NavItem>
            <NavItem>
              {activeFilter !== 'Pending Calls' && (
                <Button
                  color="link"
                  className="btn-sm"
                  onClick={() =>
                    history.push({
                      pathname: location?.state?.origin
                        ? location.state.origin
                        : '/accounts',
                      search: location.state && location.search,
                      state: {
                        originalOrigin: location?.state?.originalOrigin,
                        cadenceName: location?.state?.cadenceName,
                        touchcount: location?.state?.touchcount,
                        outcomeBucket: location?.state?.outcomeBucket,
                      },
                    })
                  }
                >
                  <i className="fas fa-times text-muted"></i>
                </Button>
              )}
            </NavItem>
          </Nav> */}
        </div>
      </PageHeader>

      <Card className="card-default">
        <div>
          <CardBody>
            <Row>
              {/* main tabs start*/}
              <Col className="pl-1 mb-2">
                <ButtonGroup>
                  <Button
                    className={`px-2 ${
                      activeTab === 'overview'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    active={activeTab === 'overview'}
                    onClick={() => {
                      handleTabChange('overview');
                    }}
                  >
                    Overview
                  </Button>
                  <Button
                    className={`px-2 ${
                      activeTab === 'prospects'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    active={activeTab === 'prospects'}
                    onClick={() => {
                      handleTabChange('prospects');
                    }}
                  >
                    Prospects
                  </Button>
                  <Button
                    className={`px-2 ${
                      activeTab === 'cadences'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    active={activeTab === 'cadences'}
                    onClick={() => {
                      handleTabChange('cadences');
                    }}
                  >
                    Cadences
                  </Button>
                  <Button
                    className={`px-2 ${
                      activeTab === 'tasks'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    active={activeTab === 'tasks'}
                    onClick={() => {
                      handleTabChange('tasks');
                    }}
                  >
                    Tasks
                  </Button>
                  <Button
                    className={`px-2 ${
                      activeTab === 'activity'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    active={activeTab === 'activity'}
                    onClick={() => {
                      handleTabChange('activity');
                    }}
                  >
                    Activity
                  </Button>
                  <Button
                    className={`px-2 ${
                      activeTab === 'stats'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    active={activeTab === 'stats'}
                    onClick={() => {
                      handleTabChange('stats');
                    }}
                  >
                    Stats
                  </Button>
                  <Button
                    className={`px-2 ${
                      activeTab === 'details'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    active={activeTab === 'details'}
                    onClick={() => {
                      handleTabChange('details');
                    }}
                  >
                    Details
                  </Button>
                </ButtonGroup>
              </Col>
              {/* main tabs end */}

              {/* filter buttons start */}
              <Col className="d-flex justify-content-end text-nowrap pl-0 pr-1 mb-2">
                {activeTab === 'prospects' && (
                  <TabBasedFilters
                    data={prospectsFilterButtons}
                    count={prospectCountDetails}
                  />
                )}
                {activeTab === 'cadences' && (
                  <TabBasedFilters
                    data={cadenceFilterButtons}
                    count={cadenceCountDetails}
                  />
                )}
                {activeTab === 'tasks' && (
                  <TabBasedFilters
                    data={taskFilterButtons}
                    count={taskCountDetails}
                  />
                )}
                {activeTab === 'stats' && (
                  <>
                    <Button
                      className="border rounded-0 px-4 mr-2"
                      title="Detailed View"
                      active={!view}
                      onClick={() => setView(false)}
                    >
                      <i className="fas fa-list text-primary"></i>
                    </Button>
                    <Button
                      className="border rounded-0 px-4"
                      title="Graphical view"
                      active={view}
                      onClick={() => setView(true)}
                    >
                      <i className="fas fa-chart-bar text-primary"></i>
                    </Button>
                  </>
                )}
              </Col>
              {/* filter buttons end */}
            </Row>

            <Row className="float-right py-2">
              {/* prospects sort by */}
              <Col className="pr-1">
                {activeTab === 'prospects' && (
                  <ProspectsSortByFieldsDropdown
                    sortBy={tableSortingValues.includes(sortBy) ? null : sortBy}
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
                )}
              </Col>
            </Row>
          </CardBody>
        </div>

        <TabContent
          className={`border-0 ${activeTab === 'activity' ? '' : 'p-0'}`}
          activeTab={activeTab}
        >
          {/* overview tab start */}
          <TabPane tabId="overview">
            <CardBody className="pt-0">
              <Row className="mb-2">
                <Col lg={4} sm={3}>
                  <h4 className="text-nowrap">{accountName}</h4>
                </Col>
                <Col lg={4} sm={4} className="text-nowrap text-sm-center">
                  <span className="fa-stack fa-1x">
                    <i className="fas fa-circle fa-stack-2x thin-circle"></i>
                    <span className="fa-stack-1x" title={selectedUserName}>
                      <small>{ownerName.toUpperCase()}</small>
                    </span>
                  </span>
                </Col>
                <Col lg={4} sm={5}>
                  <Nav className="float-right">
                    <NavItem className="pr-2">
                      <i
                        className="svgicon koncert-cadence-icon text-muted text-bold mr-2"
                        title="Cadence"
                      ></i>
                      <span className="text-bold">
                        {cadenceCountDetails.Total}
                      </span>
                    </NavItem>
                    <NavItem className="pr-2">
                      <i
                        className="fas fa-envelope text-muted mr-2"
                        title="Email Touches"
                      ></i>
                      <span className="text-bold">{emailtouch.length}</span>
                    </NavItem>
                    <NavItem className="pr-2">
                      <i
                        className="fas fa-user-friends text-muted mr-2"
                        title="Prospects"
                      ></i>
                      <span className="text-bold">{prospectIds.length}</span>
                    </NavItem>
                    <NavItem className="pr-2">
                      <i
                        className="fas fa-phone-alt text-muted mr-2"
                        title="Call Touches"
                      ></i>
                      <span className="text-bold">{calltouch.length}</span>
                    </NavItem>
                  </Nav>
                </Col>
              </Row>
              <Row>
                {/* cadences section */}
                <Col lg={6}>
                  <Card className="card-default border-top">
                    <CardHeader className="py-1">
                      <Row className="align-items-center">
                        <Col sm={4}>
                          <span className="text-nowrap">
                            <i
                              className={
                                'mr-2 ' +
                                (cadenceCountLoading
                                  ? 'fa fa-spinner fa-spin text-danger'
                                  : 'svgicon koncert-cadence-icon text-bold text-danger')
                              }
                            ></i>
                            <span className="text-bold">Cadences (Top 5)</span>
                            <span
                              className="ml-2"
                              onClick={() => {
                                handleTabChange('cadences');
                              }}
                            >
                              <i
                                className="fas fa-eye pointer"
                                title="View Cadences"
                              ></i>
                            </span>
                          </span>
                        </Col>
                        <Col sm={8}>
                          <div className="card-tool float-right">
                            <Row>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('cadences', 'Active');
                                  }}
                                >
                                  {cadenceCountDetails.Active}
                                  <br />
                                  <i
                                    className="fas fa-circle text-success pointer"
                                    title="Active cadences"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('cadences', 'Inactive');
                                  }}
                                >
                                  {cadenceCountDetails.Inactive}
                                  <br />
                                  <i
                                    className="fas fa-ban fa-sm text-danger "
                                    title="Inactive cadences"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('cadences', 'Paused');
                                  }}
                                >
                                  {cadenceCountDetails.Paused}
                                  <br />
                                  <i
                                    className="fas fa-pause pointer text-danger"
                                    title="Paused cadences"
                                  ></i>
                                </span>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    </CardHeader>
                    <ScrollArea
                      speed={0.8}
                      className="area"
                      contentClassName="content"
                      horizontal={true}
                      style={{
                        height: '160px',
                      }}
                    >
                      <div>
                        {overViewCadences &&
                        overViewCadences.accounts &&
                        overViewCadences.accounts.data &&
                        overViewCadences.accounts.data.length > 0 ? (
                          overViewCadences.accounts.data.map((cadence, ck) => {
                            const associationTouch = cadence.associations.touch.map(
                              (touch) => touch.id
                            );
                            const includetouch = overViewCadences.accounts.includedAssociations.touch.filter(
                              (touch) =>
                                associationTouch.indexOf(touch.id) !== -1
                            );

                            return (
                              <Row key={ck} className="p-2 border-bottom">
                                <Col md={6} className="text-truncate">
                                  <Link
                                    className="text-dark"
                                    to={{
                                      pathname:
                                        '/cadences/' +
                                        cadence.id +
                                        '/touches/view',
                                      search: `${window.location.search}&cadence[name]=${cadence.name}&not=1`,
                                      state: {
                                        origin: window.location.pathname,
                                        cadence,
                                        cadenceName: cadence.name,
                                      },
                                    }}
                                    title={cadence.name}
                                  >
                                    {cadence.name}
                                    {cadence.shareThisMultiTouchWith !==
                                      'none' && (
                                      <i
                                        className="fas fa-user-friends fa-sm text-muted ml-2"
                                        title="This cadence is a shared cadence"
                                      ></i>
                                    )}
                                  </Link>
                                </Col>
                                {includetouch.map((touch, i) => {
                                  if (touch.touchType === 'EMAIL') {
                                    return (
                                      <Col
                                        md={3}
                                        className="text-nowrap"
                                        key={i}
                                      >
                                        <i
                                          className="fas fa-envelope text-muted mr-2"
                                          title="Email"
                                        ></i>
                                        Touch #{touch.stepNo}
                                      </Col>
                                    );
                                  } else if (touch.touchType === 'CALL') {
                                    return (
                                      <Col
                                        md={3}
                                        className="text-nowrap"
                                        key={i}
                                      >
                                        <i
                                          className="fas fa-phone-alt text-muted mr-2"
                                          title="Call"
                                        ></i>
                                        Touch #{touch.stepNo}
                                      </Col>
                                    );
                                  } else if (touch.touchType === 'OTHERS') {
                                    return (
                                      <Col
                                        md={3}
                                        className="text-nowrap"
                                        key={i}
                                      >
                                        <i
                                          className="fas fa-share-alt text-muted mr-2"
                                          title="Social"
                                        ></i>
                                        Touch #{touch.stepNo}
                                      </Col>
                                    );
                                  } else if (touch.touchType === 'LINKEDIN') {
                                    return (
                                      <Col
                                        md={3}
                                        className="text-nowrap"
                                        key={i}
                                      >
                                        <i
                                          className="fab fa-linkedin-in text-muted mr-2"
                                          title="Linkedin"
                                        ></i>
                                        Touch #{touch.stepNo}
                                      </Col>
                                    );
                                  } else if (touch.touchType === 'TEXT') {
                                    return (
                                      <Col
                                        md={3}
                                        className="text-nowrap"
                                        key={i}
                                      >
                                        <i
                                          className="fas fa-comments fa-inverse text-muted mr-2"
                                          title="Text"
                                        ></i>
                                        Touch #{touch.stepNo}
                                      </Col>
                                    );
                                  } else if (
                                    touch.touchType === 'CALL_AND_VM'
                                  ) {
                                    return (
                                      <Col
                                        md={3}
                                        className="text-nowrap"
                                        key={i}
                                      >
                                        <i
                                          className="fas fa-comments fa-inverse text-muted mr-2"
                                          title="Call_and_vm"
                                        ></i>
                                        Touch #{touch.stepNo}
                                      </Col>
                                    );
                                  } else return <span key={-1}></span>;
                                })}
                                <Col md={3}>Active</Col>
                              </Row>
                            );
                          })
                        ) : overViewCadenceLoading ||
                          fetchAccountLoading ||
                          cadenceCountLoading ? (
                          <div className="d-flex justify-content-center mt-5">
                            <div className="text-center align-self-center">
                              <i className="fa fa-spinner fa-spin fa-2x text-muted"></i>
                            </div>
                          </div>
                        ) : (
                          <Alert
                            color="light"
                            className="mb-0 mt-4 text-center text-warning bg-secondary border-0"
                          >
                            <span>
                              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                              No active cadences available
                            </span>
                          </Alert>
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                </Col>
                {/* emails section */}
                <Col lg={6}>
                  <Card className="card-default border-top">
                    <CardHeader className="py-1">
                      <Row className="align-items-center">
                        <Col sm={4}>
                          <span className="text-nowrap">
                            <i
                              className={
                                'mr-2 ' +
                                (outcomesCountLoading
                                  ? 'fa fa-spinner fa-spin text-email'
                                  : 'fas fa-envelope text-email')
                              }
                            ></i>
                            <span className="text-bold">Emails</span>
                            <span
                              className="ml-2"
                              onClick={() => {
                                handleTabChange('activity', 'email');
                              }}
                            >
                              <i
                                className="fas fa-eye pointer"
                                title="View Email activity"
                              ></i>
                            </span>
                          </span>
                        </Col>
                        <Col sm={8}>
                          <div className="card-tool float-right">
                            <Row>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('stats', 'email', 'Sent');
                                  }}
                                >
                                  {emailCountdetails.Sent}
                                  <br />
                                  <i
                                    className="fas fa-envelope fa-sm text-email pointer"
                                    title="Sent"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('stats', 'email', 'Opened');
                                  }}
                                >
                                  {emailCountdetails.Opened}
                                  <br />
                                  <i
                                    className="far fa-envelope-open fa-sm text-success pointer"
                                    title="Open"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange(
                                      'stats',
                                      'email',
                                      'Clicked'
                                    );
                                  }}
                                >
                                  {emailCountdetails.Clicked}
                                  <br />
                                  <i
                                    className="fas fa-link fa-sm pointer text-info"
                                    title="Clicks"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange(
                                      'stats',
                                      'email',
                                      'Replied'
                                    );
                                  }}
                                >
                                  {emailCountdetails.Replied}
                                  <br />
                                  <i
                                    className="fas fa-reply pointer text-green"
                                    title="Replied"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('tasks', 'email');
                                  }}
                                >
                                  <span className="mr-1">
                                    {emailCountdetails.Pending}
                                  </span>
                                  <br />
                                  <i
                                    className="svgicon emailEdit fa-sm pointer text-danger"
                                    title="Pending Emails"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange(
                                      'stats',
                                      'email',
                                      'bounced'
                                    );
                                  }}
                                >
                                  {emailCountdetails.Bounced}
                                  <br />
                                  <i
                                    className="fas fa-ban pointer text-warning"
                                    title="Bounced"
                                  ></i>
                                </span>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    </CardHeader>
                    <ScrollArea
                      speed={0.8}
                      className="area"
                      contentClassName="content"
                      horizontal={true}
                      style={{
                        height: '160px',
                      }}
                    >
                      <ListGroup>
                        {allTemplates.length > 0 ? (
                          allTemplates.map((template) => {
                            const description =
                              template.description &&
                              template.description.replace(/(<([^>]+)>)/gi, '');
                            return (
                              <ListGroupItem key={template.id}>
                                <ListGroupItemHeading className="mb-1">
                                  <strong>{template.name}</strong>
                                  <i
                                    className="fas fa-info-circle ml-2 pointer text-info"
                                    title="View template"
                                    id={'Popover-' + template.id}
                                    onClick={() => {
                                      setClickedTemplate(template.id);
                                      setPopoverOpen(true);
                                    }}
                                  ></i>
                                  {clickedTemplate === template.id && (
                                    <PopoverItem
                                      popoverOpen={popoverOpen}
                                      toggle={toggle}
                                      id={template.id}
                                      data={template}
                                      description={description}
                                    />
                                  )}
                                </ListGroupItemHeading>
                                <ListGroupItemText className="mb-0">
                                  Subject:{' '}
                                  {template.subject.replace(nbspRegEx, ' ')}
                                </ListGroupItemText>
                              </ListGroupItem>
                            );
                          })
                        ) : templateLoading || fetchAccountLoading ? (
                          <div className="d-flex justify-content-center mt-5">
                            <div className="text-center align-self-center">
                              <i className="fa fa-spinner fa-spin fa-2x text-muted"></i>
                            </div>
                          </div>
                        ) : (
                          <Alert
                            color="light"
                            className="mb-0 mt-4 text-center text-warning bg-secondary border-0"
                          >
                            <span>
                              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                              No Email Templates Available
                            </span>
                          </Alert>
                        )}
                      </ListGroup>
                    </ScrollArea>
                  </Card>
                </Col>
              </Row>

              <Row>
                {/* prospects section */}
                <Col lg={6}>
                  <Card className="card-default border-top">
                    <CardHeader className="py-1">
                      <Row className="align-items-center">
                        <Col sm={4}>
                          <span className="text-nowrap">
                            <i
                              className={
                                'mr-2 ' +
                                (prospectCountLoading
                                  ? 'fa fa-spinner fa-spin text-info'
                                  : 'fas fa-user-friends text-info')
                              }
                            ></i>
                            <span className="text-bold">Prospects</span>
                            <span
                              className="ml-2"
                              onClick={() => {
                                handleTabChange('prospects');
                              }}
                            >
                              <i
                                className="fas fa-eye pointer"
                                title="View Prospects"
                              ></i>
                            </span>
                          </span>
                        </Col>
                        <Col sm={8}>
                          <div className="card-tool float-right">
                            <Row>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('prospects');
                                  }}
                                >
                                  {prospectCountDetails.Total}
                                  <br />
                                  <i
                                    className="fas fa-user-friends pointer text-info"
                                    title="Prospects"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('prospects', 'Unassigned');
                                  }}
                                >
                                  {prospectCountDetails.Unassigned}
                                  <br />
                                  <i
                                    className="fas fa-user-plus pointer text-warning"
                                    title="Unassigned"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('prospects', 'Paused');
                                  }}
                                >
                                  {prospectCountDetails.Paused}
                                  <br />
                                  <i
                                    className="fas fa-pause pointer text-danger"
                                    title="Paused"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('prospects', 'Completed');
                                  }}
                                >
                                  {prospectCountDetails.Completed}
                                  <br />
                                  <i
                                    className="fas fa-check-double pointer text-success"
                                    title="Completed"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('prospects', 'Assigned');
                                  }}
                                >
                                  {prospectCountDetails.Assigned}
                                  <br />
                                  <i
                                    className="fas fa-check pointer text-info"
                                    title="Assigned"
                                  ></i>
                                </span>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    </CardHeader>
                    <ScrollArea
                      speed={0.8}
                      className="area"
                      contentClassName="content"
                      horizontal={true}
                      style={{
                        height: '160px',
                      }}
                    >
                      <ListGroup>
                        {(prospectCounts || overviewProspects) &&
                        prospectCounts?.total?.data?.length > 0 ? (
                          prospectCounts?.total?.data.map((prospect, i) => {
                            return (
                              <ListGroupItem key={i}>
                                <ListGroupItemText className="mb-1 d-flex justify-content-between">
                                  <div style={{ minWidth: '125px' }}>
                                    <Link
                                      className="link-text"
                                      title={prospect?.contactName || ''}
                                      to={{
                                        pathname:
                                          '/prospects/list/' + prospect.id,
                                        search: window.location.search,
                                        state: {
                                          accountId:
                                            prospect?.associations?.account?.[0]
                                              ?.id,
                                          rowIndex: i,
                                          touchType: 'completed',
                                          prospect: prospect,
                                        },
                                      }}
                                    >
                                      {prospect?.contactName?.length > 30
                                        ? prospect.contactName.slice(0, 29) +
                                          '..'
                                        : prospect?.contactName}
                                    </Link>
                                    <div className="mb-0 text-sm">Title</div>
                                    <div key={i + i} className="mb-0 text-sm">
                                      {prospect.title}
                                    </div>
                                  </div>
                                  <span className="mr-5 text-nowrap">
                                    {prospect?.touchType &&
                                      prospect?.touchType
                                        .charAt(0)
                                        .toUpperCase() +
                                        prospect?.touchType?.slice(1)}
                                  </span>
                                </ListGroupItemText>
                              </ListGroupItem>
                            );
                          })
                        ) : overviewProspectLoading ||
                          prospectCountLoading ||
                          fetchAccountLoading ? (
                          <div className="d-flex justify-content-center mt-5">
                            <div className="text-center align-self-center">
                              <i className="fa fa-spinner fa-spin fa-2x text-muted"></i>
                            </div>
                          </div>
                        ) : (
                          <Alert
                            color="light"
                            className="mb-0 mt-4 text-center text-warning bg-secondary border-0"
                          >
                            <span className="mb-0">
                              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                              No prospects available
                            </span>
                          </Alert>
                        )}
                      </ListGroup>
                    </ScrollArea>
                  </Card>
                </Col>
                {/* calls section */}
                <Col lg={6}>
                  <Card className="card-default border-top">
                    <CardHeader className="py-1">
                      <Row className="align-items-center">
                        <Col sm={4}>
                          <span className="text-nowrap">
                            <i
                              className={
                                'mr-2 ' +
                                (outcomesCountLoading
                                  ? 'fa fa-spinner fa-spin text-success'
                                  : 'fas fa-phone-alt text-success')
                              }
                            ></i>
                            <span className="text-bold">Calls</span>
                            <span
                              className="ml-2"
                              onClick={() => {
                                handleTabChange('activity', 'call');
                              }}
                            >
                              <i
                                className="fas fa-eye pointer"
                                title="View Call activity"
                              ></i>
                            </span>
                          </span>
                        </Col>
                        <Col sm={8}>
                          <div className="card-tool float-right">
                            <Row>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange(
                                      'stats',
                                      'call',
                                      'Positive OutComes'
                                    );
                                  }}
                                >
                                  {callCountDetails['Positive OutComes']}
                                  <br />
                                  <i
                                    className="fas fa-check-circle text-success pointer"
                                    title="Positive Outcomes"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange(
                                      'stats',
                                      'call',
                                      'Bad Data'
                                    );
                                  }}
                                >
                                  {callCountDetails['Bad Data']}
                                  <br />
                                  <i
                                    className="fas fa-circle text-danger pointer"
                                    title="Bad Data"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('stats', 'call', 'Others');
                                  }}
                                >
                                  {callCountDetails.Others}
                                  <br />
                                  <i
                                    className="far fa-circle pointer text-warning"
                                    title="Others"
                                  ></i>
                                </span>
                              </Col>
                              <Col className="text-center">
                                <span
                                  className="text-bold text-dark"
                                  onClick={() => {
                                    handleTabChange('tasks', 'calls');
                                  }}
                                >
                                  {callCountDetails.Pending}
                                  <br />
                                  <i
                                    className="fas fa-phone-alt pointer text-danger"
                                    title="Pending Calls"
                                  ></i>
                                </span>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    </CardHeader>
                    <ScrollArea
                      speed={0.8}
                      className="area"
                      contentClassName="content"
                      horizontal={true}
                      style={{
                        height: '160px',
                      }}
                    >
                      <div className="member-list ml-activity">
                        <ul className="my-2">
                          {callActivities.length > 0 ? (
                            callActivities.map((activity, i) => {
                              return (
                                <div key={i} className="common-wrap pl-5 pr-3">
                                  <div
                                    className="number-section text-sm text-muted text-nowrap"
                                    title={activity?.duration}
                                  >
                                    {activity?.duration &&
                                      activity.duration.replace('days', 'd')}
                                  </div>
                                  <span className="icon mr-2">
                                    <i className="fas fa-phone-alt fa-sm"></i>
                                  </span>
                                  <div className="content-section w-90 text-wrap ml-3 p-2 mb-2">
                                    <p className="mb-0">
                                      <small>{activity.activityDatetime}</small>
                                    </p>
                                    <div className="mb-0">
                                      <div className="change-size">
                                        <p className="mb-0">
                                          <strong>Phone Call to </strong>
                                          {activity.personName}
                                        </p>
                                        <strong className="text-warning">
                                          {activity.outcome}
                                        </strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : callActivitiesLoading || fetchAccountLoading ? (
                            <div className="d-flex justify-content-center mt-5">
                              <div className="text-center align-self-center">
                                <i className="fa fa-spinner fa-spin fa-2x text-muted"></i>
                              </div>
                            </div>
                          ) : (
                            <Alert
                              color="light"
                              className="mb-0 mt-4 text-center text-warning bg-secondary border-0"
                            >
                              <span>
                                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                No Outcomes available
                              </span>
                            </Alert>
                          )}
                        </ul>
                      </div>
                    </ScrollArea>
                  </Card>
                </Col>
              </Row>

              {zipwhipEnable && zipwhipKey !== null && (
                <Row>
                  <Col lg={6}></Col>
                  {/* texts section */}
                  <Col lg={6}>
                    <Card className="card-default border-top mb-2">
                      <CardHeader className="py-1">
                        <Row className="align-items-center">
                          <Col sm={4}>
                            <span className="text-nowrap">
                              <i
                                className={
                                  'mr-2 ' +
                                  (outcomesCountLoading
                                    ? 'fa fa-spinner fa-spin text-danger'
                                    : 'fas fa-comments text-danger')
                                }
                              ></i>
                              <span className="text-bold">Texts</span>
                              <span
                                className="ml-2"
                                onClick={() => {
                                  handleTabChange('activity', 'text');
                                }}
                              >
                                <i
                                  className="fas fa-eye pointer"
                                  title="View Text activity"
                                ></i>
                              </span>
                            </span>
                          </Col>
                          <Col sm={8}>
                            <div className="card-tool float-right">
                              <Row>
                                <Col className="text-center">
                                  <span
                                    className="text-bold text-dark"
                                    onClick={() => {
                                      handleTabChange('stats', 'text', 'Sent');
                                    }}
                                  >
                                    {textCountdetails.Sent}
                                    <br />
                                    <i
                                      className="fas fa-user-check pointer text-success"
                                      title="Sent"
                                    ></i>
                                  </span>
                                </Col>
                                <Col className="text-center">
                                  <span
                                    className="text-bold text-dark"
                                    onClick={() => {
                                      handleTabChange(
                                        'stats',
                                        'text',
                                        'Received'
                                      );
                                    }}
                                  >
                                    {textCountdetails.Received}
                                    <br />
                                    <i
                                      className="fas fa-reply pointer text-info"
                                      title="Received"
                                    ></i>
                                  </span>
                                </Col>
                                <Col className="text-center">
                                  <span
                                    className="text-bold text-dark"
                                    onClick={() => {
                                      handleTabChange('tasks', 'text');
                                    }}
                                  >
                                    {textCountdetails.Pending}
                                    <br />
                                    <i
                                      className="fas fa-edit pointer text-danger"
                                      title="Pending Texts"
                                    ></i>
                                  </span>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      </CardHeader>
                      <ScrollArea
                        speed={0.8}
                        className="area"
                        contentClassName="content"
                        horizontal={true}
                        style={{
                          height: '160px',
                        }}
                      >
                        <ListGroup>
                          {textActivities.length > 0 ? (
                            textActivities.map((activity, i) => {
                              return (
                                <ListGroupItem
                                  className="justify-content-between"
                                  key={i}
                                >
                                  <small className="text-muted pt-2 float-left">
                                    {activity.duration}
                                  </small>
                                  <Badge
                                    pill
                                    className="float-left bg-white rounded-circle border border-dark p-2 mr-2 ml-2"
                                  >
                                    <i className="fa-1x fas fa-phone-alt text-info"></i>
                                  </Badge>
                                  <div className="float-left ml-2">
                                    <ListGroupItemText>
                                      <strong>
                                        {activity.outcome.toUpperCase() ===
                                        'SENT'
                                          ? 'Message sent to'
                                          : 'Received from'}{' '}
                                      </strong>
                                      {activity.personName}
                                    </ListGroupItemText>
                                    <ListGroupItemText>
                                      <strong className="text-warning">
                                        {activity.outcome}
                                      </strong>
                                    </ListGroupItemText>
                                    <ListGroupItemText className="mb-0">
                                      <small>{activity.activityDatetime}</small>
                                    </ListGroupItemText>
                                  </div>
                                </ListGroupItem>
                              );
                            })
                          ) : textActivitiesLoading || fetchAccountLoading ? (
                            <div className="d-flex justify-content-center mt-5">
                              <div className="text-center align-self-center">
                                <i className="fa fa-spinner fa-spin fa-2x text-muted"></i>
                              </div>
                            </div>
                          ) : (
                            <Alert
                              color="light"
                              className="mb-0 mt-4 text-center text-warning bg-secondary border-0"
                            >
                              <span>
                                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                No Outcomes available
                              </span>
                            </Alert>
                          )}
                        </ListGroup>
                      </ScrollArea>
                    </Card>
                  </Col>
                </Row>
              )}
            </CardBody>
          </TabPane>
          {/* overview tab end */}

          {/* prospects tab start */}
          <TabPane tabId="prospects">
            {activeTab === 'prospects' && (
              <AccountProspectsGrid
                loading={loading}
                data={accountsProspectGridData}
                prospectsData={prospectsData}
                pageSize={prospectLimit}
                pageCount={pageCount}
                currentPageIndex={prospectOffset}
                fetchData={({ pageIndex, pageSize }) => {
                  setProspectOffset(pageIndex);
                  setProspectLimit(pageSize);
                }}
                handleRefresh={refetchAccountProspects}
                sortBy={sortBy}
                orderBy={orderBy}
                currentUserId={currentUserId}
                selectedUser={selectedUser}
                handleSort={(sortBy, orderBy) => {
                  if (activeTab === 'prospects') {
                    setSortBy(sortBy);
                    setOrderBy(orderBy ? 'desc' : 'asc');
                  }
                }}
                totalCount={totalCount}
                handleRowToolbarButton={handleRowToolbarButtonAction}
                activeFilter={activeFilter.toLowerCase()}
                searchValue={searchValue && searchValue}
                accountOwnerName={accountOwnerName}
              />
            )}
          </TabPane>
          {/* prospects tab end */}

          {/* cadences tab start */}
          <TabPane tabId="cadences">
            {activeTab === 'cadences' && (
              <AccountCadencesGrid
                data={accountsCadenceGridData}
                cadencesData={cadencesData}
                loading={cadenceLoading}
                pageSize={cadenceLimit}
                pageCount={cadencePageCount}
                currentPageIndex={cadenceOffset}
                handleRefresh={refetchAccountCadences}
                fetchData={({ pageIndex, pageSize }) => {
                  setCadenceOffset(pageIndex);
                  setCadenceLimit(pageSize);
                }}
                sortBy={cadenceSortBy}
                orderBy={cadenceOrderBy}
                handleSort={(sortBy, orderBy) => {
                  setCadenceSortBy(sortBy);
                  setCadenceOrderBy(orderBy ? 'desc' : 'asc');
                }}
                totalCount={cadenceTotalCount}
              />
            )}
          </TabPane>
          {/* cadences tab end */}

          {/* tasks tab start */}
          <TabPane tabId="tasks">
            {activeTab === 'tasks' && (
              <AccountTasksGrid
                columns={columns}
                data={accountsTaskGridData}
                loading={taskLoading}
                prospectsData={prospectsData}
                taskData={taskData}
                pageSize={taskLimit}
                pageCount={taskPageCount}
                currentPageIndex={taskOffset}
                fetchData={({ pageIndex, pageSize }) => {
                  setTaskOffset(pageIndex);
                  setTaskLimit(pageSize);
                }}
                handleRefresh={refetchAccountTasks}
                sortBy={taskSortBy}
                orderBy={taskOrderBy}
                handleSort={(sortBy, orderBy) => {
                  // [tasks sort]
                  if (activeTab === 'tasks') {
                    // when taskSortBy or taskOrderBy is changed, handleTaskSort is called by useEffect
                    setTaskSortBy(sortBy);
                    setTaskOrderBy(orderBy ? 'desc' : 'asc');
                  }
                }}
                totalCount={taskTotalCount}
                activeFilter={activeFilter.toLowerCase()}
                searchValue={searchValue && searchValue}
              />
            )}
          </TabPane>
          {/* tasks tab end */}

          {/* stats tab start */}
          <TabPane tabId="stats">
            {activeTab === 'stats' && (
              <CardBody className="pb-0">
                <AccountStatsGrid
                  handleRefreshMetricsCount={handleRefreshMetricsCount}
                  cadenceCountLoading={cadenceCountLoading}
                  prospectCountLoading={prospectCountLoading}
                  outcomesCountLoading={outcomesCountLoading}
                  accountLoading={fetchAccountLoading}
                  cadenceGridData={accountsCadenceGridData}
                  cadenceLoading={cadenceLoading}
                  cadencesData={cadencesData}
                  cadenceSortBy={cadenceSortBy}
                  cadenceOrderBy={cadenceOrderBy}
                  handleSortCadence={(sortBy, orderBy) => {
                    // handleCadenceSort is called when cadenceSortBy, cadenceOrderBy are changed
                    setCadenceSortBy(sortBy);
                    setCadenceOrderBy(orderBy ? 'desc' : 'asc');
                  }}
                  prospectGridData={accountsProspectGridData}
                  prospectsData={prospectsData}
                  prospectLoading={loading}
                  sortByStatsProspect={sortByStatsProspect}
                  orderByStatsProspect={orderByStatsProspect}
                  handleSortProspect={(sortBy, orderBy) => {
                    setProspectFilter(
                      `filter[touchType]=${statProspectOutcomeType.toLowerCase()}&filter[user][id]=${selectedUser}&${
                        prospectSortParms[sortBy]
                      }=${orderBy ? 'desc' : 'asc'}`
                    );
                  }}
                  prospectCount={prospectCountDetails}
                  cadenceCount={cadenceCountDetails}
                  callCount={callCountDetails}
                  emailCount={emailCountdetails}
                  textCount={textCountdetails}
                  cadenceOpen={cadenceOpen}
                  handleStatProspectsOrCadence={handleStatProspectsOrCadence}
                  hideProspectOrCadenceDetails={hideProspectOrCadenceDetails}
                  cadenceLimit={cadenceLimit}
                  cadenceOffset={cadenceOffset}
                  cadencePageCount={cadencePageCount}
                  prospectLimit={prospectLimit}
                  prospectOffset={prospectOffset}
                  ProspectPageCount={pageCount}
                  prospectOpen={prospectOpen}
                  outcomeEmailLoading={outcomeEmailLoading}
                  outcomeCallLoading={outcomeCallLoading}
                  outcomeTextLoading={outcomeTextLoading}
                  callOpen={callOpen}
                  textOpen={textOpen}
                  emailOpen={emailOpen}
                  callOutcomeData={callOutcomeProspectData}
                  callOutcomeGridData={outcomeProspectGridData}
                  emailOutcomeGridData={emailOutcomeGridData}
                  emailOutcomeData={emailOutcomeProspectData}
                  textOutcomeGridData={textOutcomeGridData}
                  textOutcomeData={textOutcomeProspectData}
                  callLimit={callLimit}
                  callOffset={callOffset}
                  callOutcomePageCount={callOutcomePageCount}
                  emailLimit={emailLimit}
                  emailOffset={emailOffset}
                  emailOutcomePageCount={emailOutcomePageCount}
                  textLimit={textLimit}
                  textOffset={textOffset}
                  textOutcomePageCount={textOutcomePageCount}
                  prospectTotalCount={totalCount}
                  cadenceTotalCount={cadenceTotalCount}
                  callTotalCount={totalCountOfCall}
                  emailTotalCount={totalCountOfEmail}
                  textTotalCount={totalCountOfText}
                  sortByOutcome={sortByOutcome}
                  orderByOutcome={orderByOutcome}
                  accountOwnerName={accountOwnerName}
                  handleSortOutcome={(sortBy, orderBy, type) => {
                    setSortByOutcome(sortBy);
                    setOrderByOutcome(orderBy ? 'desc' : 'asc');
                    if (type === 'call') {
                      setOutcomeQuerySortCall(
                        `sort${outcomeSortingParams[sortBy]}=${
                          orderBy ? 'desc' : 'asc'
                        }`
                      );
                    } else if (type === 'text') {
                      setOutcomeQuerySortText(
                        `sort${outcomeSortingParams[sortBy]}=${
                          orderBy ? 'desc' : 'asc'
                        }`
                      );
                    } else {
                      setOutcomeQuerySortEmail(
                        `sort${outcomeSortingParams[sortBy]}=${
                          orderBy ? 'desc' : 'asc'
                        }`
                      );
                    }
                  }}
                  view={view}
                  fetchData={(pageIndex, pageSize, touchType) => {
                    switch (touchType) {
                      case 'cadence':
                        setCadenceOffset(pageIndex);
                        setCadenceLimit(pageSize);
                        break;
                      case 'prospect':
                        setProspectOffset(pageIndex);
                        setLimit(pageSize);
                        break;
                      case 'call':
                        setCallLimit(pageSize);
                        setCallOffset(pageIndex);
                        break;
                      case 'email':
                        setEmailLimit(pageSize);
                        setEmailOffset(pageIndex);
                        break;
                      case 'text':
                        setTextLimit(pageSize);
                        setTextOffset(pageIndex);
                        break;
                      default:
                        break;
                    }
                  }}
                />
              </CardBody>
            )}
          </TabPane>
          {/* stats tab end */}

          {/* activity tab start */}
          <TabPane tabId="activity">
            <Col sm={6}>
              <ProspectActivity
                activeTab={activeActivityTab}
                loading={allActivitiesLoading}
                error={allActivitiesError}
                data={allActivities}
                paging={activityPaging}
                handleShowMoreActivity={handleActionShowMoreActivity}
                zipwhipSessionKey={user.zipwhipSessionKey}
              ></ProspectActivity>
            </Col>
          </TabPane>
          {/* activity tab end */}

          {/* details tab start */}
          <TabPane
            tabId="details"
            className="border-0"
            style={{ width: '550px' }}
          >
            <CardBody className="ml-3">
              <Row className="border">
                <Col lg={4} sm={4} md={4} className="align-self-center py-4">
                  Account Name
                </Col>
                <Col lg={8} sm={8} md={8} className="align-self-center">
                  {accountName}
                </Col>
              </Row>
              <Row className="border bt0">
                <Col lg={4} sm={4} md={4} className="align-self-center py-4">
                  Owner
                </Col>
                <Col lg={8} sm={8} md={8} className="align-self-center">
                  {userToRender.displayName}
                </Col>
              </Row>
              <Row className="border bt0">
                <Col lg={4} sm={4} md={4} className="align-self-center py-4">
                  Domain Name
                </Col>
                <Col lg={8} sm={8} md={8} className="align-self-center">
                  {accountDomainName}
                </Col>
              </Row>
              <Row className="border bt0">
                <Col lg={4} sm={4} md={4} className="align-self-center py-4">
                  Tag
                </Col>
                <Col lg={8} sm={8} md={8} className="align-self-center py-2">
                  {tagList.join(', ')}
                </Col>
              </Row>
            </CardBody>
          </TabPane>
          {/* details tab end */}
        </TabContent>
      </Card>

      {/* modals */}
      <ConfirmModal
        showConfirmBtnSpinner={startPowerDialingReqLoading}
        confirmBtnIcon={'fas fa-check'}
        confirmBtnText="Proceed"
        handleCancel={() => {
          setShowStartPowerDialingConfirmModal(false);
        }}
        handleConfirm={handleConfirmStartPowerDialing}
        header="Start Power Dialing"
        showConfirmModal={showStartPowerDialingConfirmModal}
      >
        <span className="text-center">
          You have selected <strong>{pendingCalls}</strong> Prospect(s) to dial.
          <br />
          Any exisiting records in the Dialing Session will be replaced.
          <br />
          Would you like to proceed?
        </span>
      </ConfirmModal>

      {/* personalize email */}
      <EmailsModal
        hideModal={() => {
          setShowPersonalizeEmailModal(false);
          refetchAccountTasks();
          fetchPendingCount();
        }}
        showModal={showPersonalizeEmailModal}
        userId={user.isManagerUser ? selectedUser : 0}
        prospectId={personalizeEmailProspectId}
        cadenceId={personalizeEmailCadenceId}
        loadingData={taskEmailLoading}
        currentIndex={totalEmailCount + 1}
        totalCount={totalEmailCount}
        totalEmailCount={totalEmailCount}
        handleSendAndNext={(value) => {
          refetchEmailAccountTasks({
            variables: {
              includeAssociationsQry: 'includeAssociations[]=cadence',
              id: accountId,
              userFilter: taskFilter,
              limit: 1,
              offset: 0,
            },
          });
        }}
        handleProspectIndex={(value) => setPersonalizeEmailProspectIndex(value)}
        currentPageIndex={taskOffset}
        limit={taskLimit}
        dropdownUserId={selectedUser}
        currentUserId={currentUserId}
        type="Personalize"
        mailMergeVariables={mailMergeVariables}
        tabName="EMAIL"
      />

      <EmailsModal
        showModal={showSendOneOffEmail}
        hideModal={() => setShowSendOneOffEmail(false)}
        type="sendOneOff"
        prospectId={oneOffProspectId}
        currentUserId={currentUserId}
        userId={user.isManagerUser === 'Y' ? currentUserId : 0}
        dropdownUserId={selectedUser}
        mailMergeVariables={mailMergeVariables}
      />

      <ZipWhipModal
        showZipwhipTouchWindow={showZipwhipTouchWindow}
        phoneNumber={textPhoneNumber}
        zipwhipSessionKey={user.zipwhipSessionKey}
        handleClose={() => setShowZipwhipTouchWindow(false)}
        prospectId={lastActivityData.prospectId}
        contactName={lastActivityData.contactName}
      />
    </ContentWrapper>
  );
};

export default AccountView;
