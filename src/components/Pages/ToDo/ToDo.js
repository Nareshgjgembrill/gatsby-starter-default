/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ContentWrapper } from '@nextaction/components';
import {
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Row,
} from 'reactstrap';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { parseUrl } from 'query-string';
import { getToDoCount, changeSetting } from '../../../store/actions/actions';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import UserContext from '../../UserContext';
import ToDoGrid from './ToDoGrid';
import EmailsModal from './EmailsModal';
import TouchInfoModal from '../../Common/TouchInfoModal';
import ZipWhipModal from '../../Common/ZipwhipTouchModal';
import FilterButton from '../../Common/FilterButton';
import PageHeader from '../../Common/PageHeader';
import UserList from '../../Common/UserList';
import ProspectsSortByFieldsDropdown from '../../Common/ProspectsSortByFieldsDropdown';
import OpenCrmWindow from '../../Common/OpenCrmWindow';
import ClButton from '../../Common/Button';
import SearchBar from '../../Common/SearchBar';
import { notify, showErrorMessage } from '../../../util/index';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import COMPLETE_TOUCH_QUERY, {
  FETCH_TODO_LIST_QUERY,
  FETCH_TODO_COUNTS_QUERY,
} from '../../queries/ToDoQuery';
import { FETCH_MAIL_MERGE_VARIABLES } from '../../queries/EmailTemplatesQuery';
import { FETCH_TOUCH_QUERY } from '../../queries/TouchQuery';
import CompleteOtherTouchModal from '../ToDo/CompleteOtherTouchModal';
import CompleteLinkedInTouchModal from '../ToDo/CompleteLinkedInTouchModal';
import { trimValue, timeLeft, getDueDate } from '../../../util/index';
toast.configure();

const ToDo = ({ location, pinnedFilterButton, changeSetting, history }) => {
  const dispatch = useDispatch();
  const { parentUserId } = location.state ? location.state : {};
  const [showPersonalizeEmailModal, setShowPersonalizeEmailModal] = useState(
    false
  );
  const { query: searchParams } = parseUrl(window.location.search);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const filterButtons = ['ALL', 'EMAIL', 'OTHERS', 'LINKEDIN', 'TEXT'];
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const { apiURL: RESOURCE_SERVER_URL, token } = useContext(
    ApiUrlAndTokenContext
  );
  const [fetchByTouchId, setFetchByTouchId] = useState(
    searchParams['filter[touch][id]'] ? true : false
  );
  const { data: configurationsData } = useConfigurations();
  const org = configurationsData?.configurations?.data[0];
  const sortingParams = {
    contactName: 'sort[contactName]',
    campaignName: 'sort[cadence][name]',
    currentTouchId: 'sort[currentTouchId]',
    dueAt: 'sort[dueAt]',
    product: 'sort[product]',
    updatedDate: 'sort[updatedDate]',
  };
  const [searchKey, setSearchKey] = useState('');
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
      sortByUrlParam = 'contactName';
    }

    if (['asc', 'desc'].indexOf(orderByUrlParam.toLowerCase()) === -1) {
      orderByUrlParam = 'asc';
    }
  }

  const [sortBy, setSortBy] = useState(sortByUrlParam || 'contactName');
  const [orderBy, setOrderBy] = useState(orderByUrlParam || 'asc');
  const tableSortingValues = [
    'contactName',
    'campaignName',
    'currentTouchId',
    'dueAt',
    'updatedDate',
  ];
  const [userId, setUserId] = useState(
    parentUserId || parseInt(searchParams['filter[user][id]']) || currentUserId
  );
  const [dropdownUserId, setDropdownUserId] = useState(
    parentUserId || parseInt(searchParams['filter[user][id]']) || currentUserId
  );
  const [pageCount, setPageCount] = useState(0);
  const [limit, setLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [activeTab, setActiveTab] = useState(
    filterButtons.indexOf(searchParams['filter[touch][type]']) > -1 &&
      pinnedFilterButton !== searchParams['filter[touch][type]']
      ? searchParams['filter[touch][type]']
      : filterButtons.indexOf(pinnedFilterButton) > -1
      ? pinnedFilterButton
      : filterButtons[0]
  );

  const getCurrentTouchType = (activeTab) => {
    return activeTab === 'ALL'
      ? encodeURIComponent(':[EMAIL,OTHERS,LINKEDIN,TEXT]')
      : activeTab;
  };

  useEffect(() => {
    if (searchParams['fetchByTouchId'] === true) {
      setFetchByTouchId(true);
      setTodoFilter(getToDoPageQry(searchParams['filter[touch][type]']));
    } else {
      setTodoFilter(getToDoPageQry(activeTab));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPersonalizeEmailModal, fetchByTouchId]);

  useEffect(() => {
    setCurrentPageIndex(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const getToDoPageQry = (activeTab, isSearchEvt = false, searchValue) => {
    if (fetchByTouchId) {
      let filterQry = ``;
      if (userId) {
        filterQry += `&filter[user][id]=${
          userId !== dropdownUserId ? dropdownUserId : userId
        }`;
      }
      let contactName = '';
      if (searchValue) {
        contactName = searchValue.trim();
      }

      if (contactName) {
        filterQry += `&filter[q]=${encodeURIComponent(contactName)}`;
      } else if (!isSearchEvt && searchParams['filter[q]']) {
        filterQry += `&filter[q]=${encodeURIComponent(
          searchParams['filter[q]']
        )}`;
      }
      filterQry += `&${
        sortingParams[sortBy] ? sortingParams[sortBy] : 'sort[' + sortBy + ']'
      }=${orderBy}`;

      filterQry += `&filter[touch][type]=${getCurrentTouchType(
        activeTab
      )}&filter[currentTouchStatus]=:[SCHEDULED,SCHEDULED_WAIT_INETRACTIVE_EMAIL]${
        ['ALL', 'EMAIL'].includes(activeTab) ? '&filter[optoutFlag]=false' : ''
      }`;

      if (searchParams['filter[touch][id]']) {
        filterQry += `&filter[touch][id]=${searchParams['filter[touch][id]']}`;
      }
      return filterQry.startsWith('&') ? filterQry : `&${filterQry}`;
    } else {
      let filterQry = ``;
      if (userId) {
        filterQry += `&filter[user][id]=${
          userId !== dropdownUserId ? dropdownUserId : userId
        }`;
      }
      let contactName = '';
      if (searchValue) {
        contactName = searchValue.trim();
      }

      if (contactName) {
        filterQry += `&filter[q]=${encodeURIComponent(contactName)}`;
      } else if (!isSearchEvt && searchParams['filter[q]']) {
        filterQry += `&filter[q]=${encodeURIComponent(
          searchParams['filter[q]']
        )}`;
      }
      filterQry += `&${
        sortingParams[sortBy] ? sortingParams[sortBy] : 'sort[' + sortBy + ']'
      }=${orderBy}`;

      filterQry += `&filter[touch][type]=${getCurrentTouchType(
        activeTab
      )}&filter[currentTouchStatus]=:[SCHEDULED,SCHEDULED_WAIT_INETRACTIVE_EMAIL]${
        ['ALL', 'EMAIL'].includes(activeTab) ? '&filter[optoutFlag]=false' : ''
      }`;

      return filterQry.startsWith('&') ? filterQry : `&${filterQry}`;
    }
  };

  const [todoFilter, setTodoFilter] = useState(getToDoPageQry(activeTab));
  const [showTouchInfo, setShowTouchInfo] = useState(false);
  const [touchInfoHeading, setTouchInfoHeading] = useState('');
  const [touchInfoHeadingIcon, setTouchInfoHeadingIcon] = useState('');
  const [touchInfoFooterButton, setTouchInfoFooterButton] = useState('');
  const [touchInfoConfirmBtnIcon, setTouchInfoConfirmBtnIcon] = useState('');
  const [touchInfoConfirmBtnText, setTouchInfoConfirmBtnText] = useState('');
  const [touchInfoDetails, setTouchInfoDetails] = useState({});
  const [showZipwhipTouchWindow, setShowZipwhipTouchWindow] = useState(false);
  const [textPhoneNumber, setTextPhoneNumber] = useState(0);
  const [lastActivityData, setLastActivityData] = useState({});
  const [showCompleteOtherTouch, setShowCompleteOtherTouch] = useState(false);
  const [showLinkedInCompleteTouch, setShowLinkedInCompleteTouch] = useState(
    false
  );
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [prospectId, setProspectId] = useState();
  const [currentIndex, setCurrentIndex] = useState();
  const touches = ['OTHERS', 'LINKEDIN', 'TEXT', 'EMAIL'];
  const [totalCount, setTotalCount] = useState(0);
  const [cadenceId, setCadenceId] = useState(0);
  const [totalPersonalizeEmailCount, setTotalPersonalizeEmailCount] = useState(
    0
  );
  const [currentTouchIndex, setCurrentTouchIndex] = useState(null);

  // todo metric count fields
  const [allTabCount, setAllTabCount] = useState(null);
  const [emailTabCount, setEmailTabCount] = useState(null);
  const [socialTabCount, setSocialTabCount] = useState(null);
  const [linkedInTabCount, setLinkedInTabCount] = useState(null);
  const [textTabCount, setTextTabCount] = useState(null);

  const dismissAllToasts = () => {
    toast.dismiss(error);
  };

  history.listen(dismissAllToasts);

  const {
    data: todoData,
    loading,
    error,
    refetch: refetchToDoData,
    called,
  } = useQuery(FETCH_TODO_LIST_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=cadence&includeAssociations[]=touch',
      prospectFilter: todoFilter,
      limit: limit,
      offset: offset,
    },
    notifyOnNetworkStatusChange: true,
  });

  const [
    fetchNextTouch,
    { data: nextTouchData, loading: nextTouchLoading },
  ] = useLazyQuery(FETCH_TODO_LIST_QUERY, {
    onCompleted: (response) => {
      if (
        response?.prospects?.data?.length > 0 &&
        response?.prospects?.paging?.totalCount > 0
      ) {
        const rowData = response?.prospects?.data?.[0];
        let touch = {};
        if (
          rowData?.associations?.touch &&
          response?.prospects?.includedAssociations?.touch
        ) {
          touch = response.prospects.includedAssociations.touch.find(
            (touch) => touch.id === rowData.associations.touch[0].id
          );
        }
        handleShowTouchInfo(rowData, touch, currentTouchIndex);
      } else {
        setShowCompleteOtherTouch(false);
        setShowLinkedInCompleteTouch(false);
        notify(
          'Sorry! There are no more touches available.',
          'error',
          'no_touch'
        );
      }
    },
    onError: (error) => {
      setShowCompleteOtherTouch(false);
      setShowLinkedInCompleteTouch(false);
      showErrorMessage(
        error,
        'Failed to load next touch',
        nextTouchData,
        'failed_touch_data'
      );
    },
  });

  const [
    fetchTodoCount,
    { data: todoCountData, loading: todoCountLoading, error: todoCountError },
  ] = useLazyQuery(FETCH_TODO_COUNTS_QUERY, {
    variables: {
      userId: userId,
    },
    onCompleted: (response) => todoCountsRequestCallback(response, true),
    onError: (response) => todoCountsRequestCallback(response),
  });

  const todoCountsRequestCallback = (response, requestSuccess) => {
    if (requestSuccess && response) {
      setAllTabCount(response?.prospects?.data[0]?.all || 0);
      setEmailTabCount(response?.prospects?.data[0]?.email || 0);
      setSocialTabCount(response?.prospects?.data[0]?.others || 0);
      setLinkedInTabCount(response?.prospects?.data[0]?.linkedin || 0);
      setTextTabCount(response?.prospects?.data[0]?.text || 0);
    } else {
      showErrorMessage(
        response,
        'Failed to fetch todo counts',
        todoCountData,
        'failed_todo_counts'
      );
    }
  };

  const { data: todoEmailCount, refetch: emailCountRefetch } = useQuery(
    FETCH_TODO_LIST_QUERY,
    {
      variables: {
        includeAssociationsQry:
          'includeAssociations[]=cadence&includeAssociations[]=touch',
        prospectFilter: getToDoPageQry('EMAIL'),
        limit: limit,
        offset: offset,
      },
      skip: ['OTHERS', 'LINKEDIN', 'TEXT'].includes(activeTab),
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to load Email data',
          todoEmailCount,
          'failed_email_data'
        );
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const totalEmailCount = todoEmailCount?.prospects?.paging?.totalCount;
  const currentCountAllTab = currentPageIndex * limit + currentIndex + 1;
  const totalTouchCount = todoData?.prospects?.paging?.totalCount;

  const personalizeProspectData =
    todoData?.prospects?.data?.length > 0 && todoData.prospects.data[0];
  const personalizeTouchData =
    todoData?.prospects?.data?.length > 0 &&
    todoData?.prospects?.includedAssociations &&
    todoData?.prospects?.includedAssociations.touch?.filter(
      (item) => item.id === todoData.prospects.data[0].touchid
    );

  useEffect(() => {
    if (!loading && called && todoData) {
      // for timebeing i have commented this code (Rajesh) Reason git id - #548
      // fetchTodoCount();
    }
    // eslint-disable-next-line
  }, [todoData]);

  // To Completed the linked in touch and linked in touch
  const [
    completeTouch,
    { data: completeTouchData, loading: completeTouchLoading },
  ] = useLazyQuery(COMPLETE_TOUCH_QUERY, {
    onCompleted: (response) => handleCompleTouchCallBack(response, true),
    onError: (response) => handleCompleTouchCallBack(response),
  });

  //Below useLazyQuery used to fetch template name for show emailtouch info
  const [fetchTemplate, { data: fetchTemplateData }] = useLazyQuery(
    FETCH_TOUCH_QUERY,
    {
      onCompleted: () => {
        let templateName = '-';
        if (fetchTemplateData?.touch?.includedAssociations?.emailtemplate) {
          templateName =
            fetchTemplateData.touch.includedAssociations.emailtemplate
              .map((template) => template.name)
              .join() || '-';
        }
        setTouchInfoDetails((prevState) => ({
          ...prevState,
          templateName: templateName,
        }));
        setShowPersonalizeEmailModal(true);
      },
      onError: (response) => {
        setShowTouchInfo(false);
        showErrorMessage(
          response,
          'Sorry! Failed to load Template name to show Email Touch info',
          fetchTemplateData,
          'template_name_failed'
        );
      },
    }
  );

  //Below useLazyQuery used to show the mailmerge data in Personalize email modal
  const { data: mailMergeVariablesData } = useQuery(
    FETCH_MAIL_MERGE_VARIABLES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    }
  );

  const [
    fetchPersonalizeProspectData,
    { data: todoListData, loading: todoListLoading },
  ] = useLazyQuery(FETCH_TODO_LIST_QUERY, {
    onCompleted: (response) => {
      emailCountRefetch();
      if (response?.prospects?.data?.length > 0 && totalEmailCount > 0) {
        if (response.prospects.data[0].currentTouchType === 'EMAIL') {
          setTotalPersonalizeEmailCount(
            response?.prospects?.paging
              ? response.prospects.paging.totalCount
              : 0
          );
          const data = response.prospects.data[0];
          setProspectId(data.id);
          setCadenceId(data?.associations?.cadence?.[0]?.id || null);
          setShowPersonalizeEmailModal(true);
        } else {
          if (
            totalPersonalizeEmailCount > currentCountAllTab &&
            showPersonalizeEmailModal
          ) {
            setCurrentIndex(currentIndex + 1);
            fetchPersonalizeProspectData({
              variables: {
                includeAssociationsQry:
                  'includeAssociations[]=cadence&includeAssociations[]=touch',
                prospectFilter: todoFilter,
                limit: 1,
                offset:
                  totalPersonalizeEmailCount > currentCountAllTab
                    ? currentCountAllTab - 1
                    : 0,
              },
            });
          } else if (showPersonalizeEmailModal) {
            setCurrentIndex(0);
            setCurrentPageIndex(0);
            fetchPersonalizeProspectData({
              variables: {
                includeAssociationsQry:
                  'includeAssociations[]=cadence&includeAssociations[]=touch',
                prospectFilter: todoFilter,
                limit: 1,
                offset: 0,
              },
            });
          } else {
            setShowPersonalizeEmailModal(false);
          }
        }
      } else {
        notify(
          'Sorry! There are no more Emails to Personalize!',
          'error',
          'no_personalize_email'
        );
        refetchToDoData();
        dispatch(getToDoCount(currentUserId, RESOURCE_SERVER_URL, token));
        setTotalPersonalizeEmailCount(0);
      }
    },
    onError: (response) => {
      emailCountRefetch();
      setShowPersonalizeEmailModal(false);
      setProspectId(null);
      setCadenceId(null);
      showErrorMessage(
        response,
        'Sorry! Failed to load Personalize Email data.',
        todoListData,
        'personalize_data'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  // Use Memo Blocks Start

  const mailMergeVariables = useMemo(
    () =>
      mailMergeVariablesData?.mailmergeVariables?.data
        ? mailMergeVariablesData.mailmergeVariables.data.mail_merge
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mailMergeVariablesData]
  );

  const todoGridData = useMemo(
    () => (todoData && todoData.prospects ? todoData.prospects.data : []),
    [todoData]
  );

  // eslint-disable-next-line
  const columns = useMemo(() => [
    {
      Header: 'Name',
      accessor: 'contactName',
      width: '20%',
      Cell: function (props) {
        const rowData = props.row.original;
        let cadence;
        let touch;
        let account;

        if (
          rowData?.associations?.cadence &&
          props?.todoData?.prospects?.includedAssociations?.cadence
        ) {
          cadence = props.todoData.prospects.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
        }

        if (
          rowData?.associations?.touch &&
          props?.todoData?.prospects?.includedAssociations?.touch
        ) {
          touch = props.todoData.prospects.includedAssociations.touch.find(
            (touch) => touch.id === rowData.associations.touch[0].id
          );
        }

        if (rowData?.associations?.account && rowData.associations.account[0]) {
          account = rowData.associations.account[0].id;
        }
        return (
          <span>
            {rowData.crmId &&
              !rowData.crmId.startsWith('crmgenkey_') &&
              configurationsData?.configurations?.data[0]?.crmType !==
                'standalone' && (
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

            <Link
              to={{
                pathname: 'prospects/list/' + props.row.original.id,
                search: window.location.search,
                state: {
                  allProspectsData: props.todoData,
                  cadence,
                  cadenceId: cadence.id,
                  origin: location.pathname,
                  prospect: props.row.original,
                  touch,
                  rowIndex: props.row.index,
                },
              }}
            >
              {props.value}
            </Link>
            <br></br>
            {account && (
              <Link
                to={{
                  pathname: '/accounts/' + account,
                  search: window.location.search,
                  state: {
                    origin: location.pathname,
                  },
                }}
              >
                <small>{rowData.accountName}</small>
              </Link>
            )}
          </span>
        );
      },
    },
    {
      Header: 'Title',
      accessor: 'title',
      width: '15%',
    },
    {
      Header: 'Action',
      accessor: 'actionEnvelope',
      disableSortBy: true,
      width: '2%',
      Cell: function (props) {
        const rowData = props.row.original;
        let button;
        let touch = {};
        if (
          rowData?.associations?.touch &&
          props?.todoData?.prospects?.includedAssociations?.touch
        ) {
          touch = props.todoData.prospects.includedAssociations.touch.find(
            (touch) => touch.id === rowData.associations.touch[0].id
          );
        }
        const touchType = rowData.currentTouchType;
        const touchStatus = rowData.currentTouchStatus;

        const getTouchTitle = (touch) => {
          let title;
          if (touch?.subTouch && trimValue(touch.subTouch)) {
            title = trimValue(touch.subTouch).replace('Others-', '');
          } else {
            switch (touch.touchType) {
              case 'TEXT':
                title = 'Text';
                break;
              case 'EMAIL':
                title = 'Personalized Email';
                break;
              case 'LINKEDIN':
                title = 'LinkedIn';
                break;
              case 'OTHERS':
                title = 'Social';
                break;
              default:
                break;
            }
          }
          return title;
        };

        if (touches.indexOf(touchType) !== -1) {
          // const isLinkedInOrIsEmail =
          //   ['EMAIL', 'OTHERS'].indexOf(touchType) !== -1;

          button = (
            <span
              className={
                ['OTHERS', 'LINKEDIN'].indexOf(touchType) !== -1 &&
                currentUserId !== dropdownUserId
                  ? 'pointer-none'
                  : 'pointer'
              }
              onClick={() => {
                if (
                  ['OTHERS', 'LINKEDIN'].indexOf(touchType) !== -1 &&
                  currentUserId !== dropdownUserId
                ) {
                  notify(
                    'Sorry! You have selected an invalid touch type to send Email.',
                    'error',
                    'invalid_touch'
                  );
                } else if (
                  touchType === 'EMAIL' &&
                  touchStatus === 'SCHEDULED_WAIT_INETRACTIVE_EMAIL'
                ) {
                  notify(
                    'Sorry! You have exceeded your suggested limit to send Emails to this Email id.',
                    'error',
                    'email_limit_exceeded'
                  );
                } else {
                  setCurrentTouchIndex(offset * limit + props.row.index);
                  handleShowTouchInfo(rowData, touch, props.row.index);
                }
              }}
            >
              <span className="fa-stack" title={getTouchTitle(touch)}>
                <i className="fas fa-circle fa-stack-2x thin-circle"></i>
                {getTouchIcons(touchType, ' fa-stack-1x')}
              </span>
            </span>
          );
        }
        return <span>{button}</span>;
      },
    },
    {
      Header: 'Cadence',
      accessor: 'campaignName',
      width: '20%',
      Cell: function (props) {
        const rowData = props.row.original;
        let cadence;

        if (
          rowData?.associations?.cadence &&
          props?.todoData?.prospects?.includedAssociations?.cadence
        ) {
          cadence = props.todoData.prospects.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
        }
        if (cadence) {
          return (
            <>
              <Link
                to={{
                  pathname: '/cadences/' + cadence.id + '/touches/view',
                  search: `${location.search}&cadence[name]=${cadence.name}&not=1`,
                  state: {
                    allCadencesData:
                      props.todoData.prospects.includedAssociations.cadence,
                    origin: window.location.pathname,
                    cadence: cadence,
                    cadenceName: cadence.name,
                    parentUserId: dropdownUserId,
                  },
                }}
              >
                {cadence.name}
              </Link>
              {cadence.sharedType !== 'none' && (
                <i
                  className="fas fa-user-friends fa-sm text-muted ml-2"
                  title="This cadence is a shared cadence"
                ></i>
              )}
            </>
          );
        } else {
          return null;
        }
      },
    },
    {
      Header: 'Current Touch',
      accessor: 'currentTouchId',
      width: '15%',
      Cell: function (props) {
        const rowData = props.row.original;
        if (rowData) {
          return (
            <>
              {getTouchIcons(rowData.currentTouchType, '', true).props
                .className && (
                <span className="mr-2">
                  {getTouchIcons(rowData.currentTouchType, 'text-muted', true)}
                </span>
              )}
              <span>
                Touch {rowData.currentTouchId} (
                {getTouchType(rowData.currentTouchType)})
              </span>
            </>
          );
        } else {
          return null;
        }
      },
    },
    {
      Header: 'Due',
      accessor: 'dueAt',
      width: '10%',
      Cell: function (props) {
        return getDueDate(timeLeft(moment, props.row.original.dueAt));
      },
    },
    {
      Header: 'Last Modified',
      accessor: 'updatedDate',
      width: '18%',
      Cell: function (props) {
        return moment(props.value).format('M/D/YYYY h:mm A');
      },
    },
  ]);

  // Use Memo Blocks End

  // Use Effects Blocks Start

  useEffect(() => {
    setPageCount(
      !loading && todoData?.prospects?.paging
        ? Math.ceil(todoData.prospects.paging.totalCount / limit)
        : 0
    );
    setTotalCount(
      !loading && todoData?.prospects?.paging
        ? todoData.prospects.paging.totalCount
        : 0
    );
    setTotalPersonalizeEmailCount(
      !loading && todoData?.prospects?.paging
        ? todoData.prospects.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [todoGridData]);

  useEffect(() => setIsRequestLoading(completeTouchLoading), [
    completeTouchLoading,
  ]);

  // Use Effects Blocks End

  /* Handle Events Start*/

  // To render the grid when All, Email, Others, LinkedIn,Text tabe changed
  const handleToDoTabChange = (e) => {
    setFetchByTouchId(false);
    e.preventDefault();
    const tabValue = e.currentTarget.getAttribute('data-tab-value');
    setActiveTab(tabValue);
    setOffset(0);
    setCurrentPageIndex(0);

    const filter = getToDoPageQry(tabValue);
    setTodoFilter(filter);
    window.history.replaceState(
      {},
      '',
      `?${filter.slice(1)}&page[limit]=${limit}&page[offset]=${offset}`
    );
  };

  const handleToDoSearch = (searchValue, isSearchEvt) => {
    if (isSearchEvt) {
      setOffset(0);
      setCurrentPageIndex(0);
    }

    if (userId !== dropdownUserId) {
      setUserId(dropdownUserId);
    }

    const filter = getToDoPageQry(activeTab, isSearchEvt, searchValue);
    setTodoFilter(filter);
    window.history.replaceState(
      {},
      '',
      `?${filter.slice(1)}&page[limit]=${limit}&page[offset]=${offset}`
    );
  };

  const handleShowTouchInfo = (rowData, touch, index) => {
    let cadence = {};
    if (
      rowData?.associations?.cadence &&
      todoData?.prospects?.includedAssociations?.cadence
    ) {
      cadence = todoData.prospects.includedAssociations.cadence.find(
        (cadence) => cadence.id === rowData.associations.cadence[0].id
      );
    }
    const touchData = {};
    const touchType = rowData.currentTouchType;
    touchData.cadenceName = cadence.name;
    touchData.contactName = rowData.contactName;
    let subTouch = '';
    if (trimValue(touch.subTouch)) {
      subTouch = touch.subTouch.replace('Others-', '');
    }
    touchData.touchType =
      'Touch ' +
      rowData.currentTouchId +
      (subTouch ? ` (${subTouch})` : ` (${touchType})`);
    touchData.timeToComplete = getDueDate(timeLeft(moment, rowData.dueAt));
    touchData.lastTouch = rowData.lastTouch;
    touchData.currentTouchType = rowData.currentTouchType;
    touchData.accountName = rowData.accountName;
    touchData.accountId = rowData.associations.account[0].id
    touchData.description = touch.instructions;
    touchData.prospectId = rowData.id;
    if (rowData.lastTouchDateTime) {
      touchData.lastTouchDateTime = moment(rowData.lastTouchDateTime).format(
        'MM/DD/YYYY hh:mm A'
      );
    }
    touchData.subTouch = subTouch;
    touchData.linkedinUrl = rowData.linkedinUrl || '';
    touchData.emailId = rowData.email;
    touchData.touch = touchType;
    touchData.currentIndex = index;
    touchData.stepNo = rowData.currentTouchId + 1;
    touchData.cadenceId =
      rowData.associations.cadence.length > 0
        ? rowData.associations.cadence[0].id
        : 0;
    touchData.userId = dropdownUserId;
    touchData.contactName = rowData?.contactName;
    let dialingPhone = rowData.phone;
    if (!rowData.phone) {
      const dialingKey = Object.keys(rowData).filter((key) => {
        return key.startsWith('customPhone') && rowData[key];
      });

      dialingPhone = dialingKey[0] ? rowData[dialingKey[0]] : '';
    }
    if (touchType === 'OTHERS') {
      setTouchInfoHeading('Social Touch Info');
      setTouchInfoConfirmBtnText('Complete Touch');
    } else if (touchType === 'LINKEDIN') {
      setTouchInfoHeading('Linkedin Touch Info');
      setTouchInfoConfirmBtnText('Complete Touch');
    } else if (touchType === 'TEXT') {
      setTouchInfoHeading('ZipWhip Touch Info');
      setTouchInfoConfirmBtnText('Send a Text');
      setTextPhoneNumber(dialingPhone);
      setLastActivityData(touchData);
    } else if (touchType === 'EMAIL') {
      setTouchInfoHeading('Email Touch Info');
      setTouchInfoConfirmBtnText('Personalize Email');
      setProspectId(rowData.id);
      setCurrentIndex(index);
      touchData.templateName = '-';
      setCadenceId(rowData?.associations?.cadence?.[0].id || 0);
    }

    setTouchInfoHeadingIcon(getTouchIcons(touchType, '').props.className);
    setTouchInfoFooterButton(getFooterButtonColor(touchType));
    setTouchInfoDetails(touchData);
    if (touches.indexOf(touchType) > -1) {
      if (touchType === 'EMAIL') {
        setTouchInfoConfirmBtnIcon('fas fa-pencil-alt');
        fetchTemplate({
          variables: {
            touchID: touch.id,
            includeAssociationsQry: 'includeAssociations[]=emailTemplate',
          },
        });
      } else {
        setTouchInfoConfirmBtnIcon(
          getTouchIcons(touchType, '', true).props.className
        );
      }
      switch (touchType) {
        case 'OTHERS':
          setShowCompleteOtherTouch(true);
          break;
        case 'TEXT':
          setShowZipwhipTouchWindow(true);
          break;
        case 'LINKEDIN':
          setShowLinkedInCompleteTouch(true);
          break;
        default:
      }
    }
  };

  const handleShowCompleTouchWindow = () => {
    setShowTouchInfo(false);
    switch (touchInfoDetails.currentTouchType) {
      case 'OTHERS':
        setShowCompleteOtherTouch(true);
        break;
      case 'TEXT':
        setShowZipwhipTouchWindow(true);
        break;
      case 'LINKEDIN':
        setShowLinkedInCompleteTouch(true);
        break;
      case 'EMAIL':
        setShowPersonalizeEmailModal(true);
        break;
      default:
    }
  };

  const [isTouchNext, setIsTouchNext] = useState(false);

  const handleCompleTouch = (requestData, completeAndNext) => {
    if (completeAndNext) {
      setIsTouchNext(true);
    } else {
      setIsTouchNext(false);
    }
    const input = {
      touchType: requestData?.touchType,
      touchInput: requestData?.touchInput,
    };

    if (requestData?.touchType === 'linkedin') {
      input.linkedInUrl = requestData?.linkedInUrl;
    }
    completeTouch({
      variables: {
        input,
        prospectId: requestData.prospectId,
      },
    });
  };

  const handleCompleTouchCallBack = (response, status) => {
    if (status) {
      notify('Completed Successfully!', 'success', 'handle_touch');
      refetchToDoData();
      dispatch(getToDoCount(currentUserId, RESOURCE_SERVER_URL, token));
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to load Touch data',
        completeTouchData,
        'failed_touch'
      );
    }
    if (isTouchNext) {
      fetchNextTouch({
        variables: {
          includeAssociationsQry:
            'includeAssociations[]=cadence&includeAssociations[]=touch',
          prospectFilter: todoFilter,
          limit: 1,
          offset:
            currentTouchIndex + 1 < totalTouchCount ? currentTouchIndex : 0,
        },
        notifyOnNetworkStatusChange: true,
      });
    } else {
      setShowCompleteOtherTouch(false);
      setShowLinkedInCompleteTouch(false);
    }
    if (isTouchNext && currentTouchIndex + 1 >= totalTouchCount) {
      setOffset(0);
    }
  };

  const handleUserChange = (value) => {
    setFetchByTouchId(false);
    setDropdownUserId(value);
    setOffset(0);
    setCurrentPageIndex(0);
  };

  /* Handle Events End */

  const getTouchIcons = (touch, extraClass, removeColor) => {
    let className;
    if (touch === 'EMAIL')
      className = removeColor
        ? `svgicon emailEdit ${extraClass} mt-2 personalize-email-todo`
        : `svgicon emailEdit ${extraClass} text-email mt-2 personalize-email-todo`;
    else if (touch === 'OTHERS')
      className = removeColor
        ? `fas fa-share-alt ${extraClass} social-icon-todo`
        : `fas fa-share-alt ${extraClass} mr-n2 pr-1 text-social social-icon-todo`;
    else if (touch === 'LINKEDIN')
      className = removeColor
        ? `fab fa-linkedin-in ${extraClass} linkedin-icon-todo`
        : `fab fa-linkedin-in ${extraClass} text-linkedin linkedin-icon-todo`;
    else if (touch === 'TEXT')
      className = removeColor
        ? `fas fa-comments ${extraClass}`
        : `fas fa-comments ${extraClass} text-danger`;
    else className = ``;

    return <i className={className}></i>;
  };

  const getFooterButtonColor = (touch) => {
    let color;
    if (touch === 'EMAIL') color = 'info';
    else if (touch === 'OTHERS') color = 'warning';
    else if (touch === 'LINKEDIN') color = 'primary';
    else if (touch === 'TEXT') color = 'danger';
    else color = 'primary';

    return color;
  };

  useEffect(() => {
    handleToDoSearch();
    // eslint-disable-next-line
  }, [sortBy, orderBy, dropdownUserId]);

  useEffect(() => {
    fetchTodoCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todoGridData]);

  const getTouchType = (touchType) => {
    let touch;
    switch (touchType) {
      case 'EMAIL':
        touch = 'Email';
        break;
      case 'OTHERS':
        touch = 'Social';
        break;
      case 'LINKEDIN':
        touch = 'Linkedin';
        break;
      case 'TEXT':
        touch = 'Text';
        break;
      default:
        touch = '';
        break;
    }
    return touch;
  };

  const handleOpenCrmWindow = (crmId, recordType) => {
    OpenCrmWindow(org, crmId, recordType);
  };

  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';

  return (
    <ContentWrapper>
      <PageHeader icon="fas fa-tasks" pageName="To Do">
        <div className="d-flex float-right">
          <Col sm={isManagerUser ? 6 : 12} className="px-0">
            <SearchBar
              clname="mr-2"
              searchInput={searchKey}
              onSearch={(searchValue) => {
                setSearchKey(searchValue ? searchValue : '');
                handleToDoSearch(searchValue, true);
              }}
              onChange={setSearchKey}
            />
          </Col>
          {isManagerUser && (
            <Col sm={6} className="px-0 ml-2">
              <UserList
                value={dropdownUserId}
                onChange={handleUserChange}
                placeHolder={'Select Users'}
              />
            </Col>
          )}
          {/* #552 - Pending Calls and To do screen- Remove search & clear icons
              <InputGroupAddon addonType="append">
                <Button outline onClick={handleToDoSearch}>
                  <i className="fa fa-search"></i>
                </Button>
                <Button
                  outline
                  onClick={() => {
                    searchInputRef.current.focus();
                    searchInputRef.current.value = '';
                    handleToDoSearch();
                  }}
                >
                  <i className="fa fa-times"></i>
                </Button>
             </InputGroupAddon>
            </InputGroup> */}
        </div>
      </PageHeader>
      <Row>
        <Col>
          <Card className="card-default">
            <CardBody className="bb">
              <Row className="mb-3">
                <Col className="d-flex justify-content-between">
                  <ButtonToolbar>
                    <ButtonGroup>
                      <FilterButton
                        active={activeTab === filterButtons[0]}
                        count={allTabCount}
                        countError={todoCountError}
                        countLoading={allTabCount === null && todoCountLoading}
                        data-tab-value={filterButtons[0]}
                        handleClick={handleToDoTabChange}
                        className={`${
                          activeTab === filterButtons[0] &&
                          'bg-color-primary-shade text-white'
                        }`}
                      >
                        <strong>All</strong>
                      </FilterButton>
                      <FilterButton
                        active={activeTab === filterButtons[1]}
                        count={emailTabCount}
                        countError={todoCountError}
                        countLoading={
                          emailTabCount === null && todoCountLoading
                        }
                        data-tab-value={filterButtons[1]}
                        handleClick={handleToDoTabChange}
                        handlePin={(pin) =>
                          changeSetting(
                            'toDoPinnedFilterButton',
                            pin ? filterButtons[1] : filterButtons[0]
                          )
                        }
                        pinned={pinnedFilterButton === filterButtons[1]}
                        className={`${
                          activeTab === filterButtons[1] &&
                          'bg-color-primary-shade text-white'
                        }`}
                      >
                        <strong>Email</strong>
                      </FilterButton>
                      <FilterButton
                        active={activeTab === filterButtons[2]}
                        count={socialTabCount}
                        countError={todoCountError}
                        countLoading={
                          socialTabCount === null && todoCountLoading
                        }
                        data-tab-value={filterButtons[2]}
                        handleClick={handleToDoTabChange}
                        handlePin={(pin) =>
                          changeSetting(
                            'toDoPinnedFilterButton',
                            pin ? filterButtons[2] : filterButtons[0]
                          )
                        }
                        pinned={pinnedFilterButton === filterButtons[2]}
                        className={`${
                          activeTab === filterButtons[2] &&
                          'bg-color-primary-shade text-white'
                        }`}
                      >
                        <strong>Social</strong>
                      </FilterButton>

                      <FilterButton
                        active={activeTab === filterButtons[3]}
                        count={linkedInTabCount}
                        countError={todoCountError}
                        countLoading={
                          linkedInTabCount === null && todoCountLoading
                        }
                        data-tab-value={filterButtons[3]}
                        handleClick={handleToDoTabChange}
                        handlePin={(pin) =>
                          changeSetting(
                            'toDoPinnedFilterButton',
                            pin ? filterButtons[3] : filterButtons[0]
                          )
                        }
                        pinned={pinnedFilterButton === filterButtons[3]}
                        className={`${
                          activeTab === filterButtons[3] &&
                          'bg-color-primary-shade text-white'
                        }`}
                      >
                        <strong>LinkedIn</strong>
                      </FilterButton>
                      {user?.zipwhipSessionKey && (
                        <FilterButton
                          active={activeTab === filterButtons[4]}
                          count={textTabCount}
                          countError={todoCountError}
                          countLoading={
                            textTabCount === null && todoCountLoading
                          }
                          data-tab-value={filterButtons[4]}
                          handleClick={handleToDoTabChange}
                          handlePin={(pin) =>
                            changeSetting(
                              'toDoPinnedFilterButton',
                              pin ? filterButtons[4] : filterButtons[0]
                            )
                          }
                          pinned={pinnedFilterButton === filterButtons[4]}
                          className={`${
                            activeTab === filterButtons[4] &&
                            'bg-color-primary-shade text-white'
                          }`}
                        >
                          <strong>Text</strong>
                        </FilterButton>
                      )}
                    </ButtonGroup>
                  </ButtonToolbar>
                  {activeTab === 'EMAIL' && (
                    <ClButton
                      color="primary"
                      onClick={() => {
                        if (
                          !personalizeProspectData ||
                          personalizeTouchData.length === 0
                        ) {
                          notify(
                            'No prospect/touch info available to personalize Email.',
                            'error',
                            'no_prospect_available'
                          );
                        } else if (
                          personalizeProspectData &&
                          personalizeTouchData.length > 0
                        ) {
                          handleShowTouchInfo(
                            personalizeProspectData,
                            personalizeTouchData[0],
                            0
                          );
                        }
                      }}
                    >
                      <i className="fas fa-pencil-alt pointer mr-2"></i>
                      <strong>Personalize Email</strong>
                    </ClButton>
                  )}
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
                </Col>
              </Row>
              <ToDoGrid
                columns={columns}
                data={todoGridData}
                todoData={todoData}
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
                  if (query['filter[q]']) {
                    setSearchKey(query['filter[q]']);
                  }

                  query['page[limit]'] = pageSize;
                  query['page[offset]'] = pageIndex;

                  const searchString = Object.entries(query)
                    .map(([key, val]) => `${key}=${val}`)
                    .join('&');

                  window.history.replaceState({}, '', '?' + searchString);
                }}
                loading={loading}
                pageSize={limit}
                pageCount={pageCount}
                error={error}
                currentPageIndex={currentPageIndex}
                handleRefresh={() => {
                  refetchToDoData();
                  dispatch(
                    getToDoCount(currentUserId, RESOURCE_SERVER_URL, token)
                  );
                }}
                handleSort={(gridSortBy, gridOrderBy) => {
                  if (sortBy !== gridSortBy) {
                    setSortBy(gridSortBy);
                  }
                  if (orderBy !== gridOrderBy) {
                    setOrderBy(gridOrderBy ? 'desc' : 'asc');
                  }
                }}
                totalCount={totalCount}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <EmailsModal
        hideModal={() => {
          setShowPersonalizeEmailModal(false);
        }}
        showModal={showPersonalizeEmailModal}
        userId={user.isManagerUser === 'Y' ? dropdownUserId : 0}
        prospectId={prospectId}
        currentIndex={currentPageIndex * limit + currentIndex + 1}
        totalCount={totalPersonalizeEmailCount}
        totalEmailCount={totalEmailCount}
        refetch={() => {
          refetchToDoData();
          dispatch(getToDoCount(currentUserId, RESOURCE_SERVER_URL, token));
        }}
        dropdownUserId={dropdownUserId}
        currentUserId={currentUserId}
        type="Personalize"
        mailMergeVariables={mailMergeVariables}
        tabName={activeTab}
        loadingData={todoListLoading}
        cadenceId={cadenceId}
        handleSendAndNext={(currentIndexEmail) => {
          fetchPersonalizeProspectData({
            variables: {
              includeAssociationsQry:
                'includeAssociations[]=cadence&includeAssociations[]=touch',
              prospectFilter: todoFilter,
              limit: 1,
              offset:
                totalPersonalizeEmailCount > currentIndexEmail
                  ? currentIndexEmail - 1
                  : 0,
            },
          });
        }}
      />
      <TouchInfoModal
        touchInfoHeading={touchInfoHeading}
        touchInfoHeadingIcon={touchInfoHeadingIcon}
        touchInfoFooterButton={touchInfoFooterButton}
        showTouchInfo={showTouchInfo}
        touchInfoDetails={touchInfoDetails}
        handleClose={() => setShowTouchInfo(false)}
        confirBtnIcon={touchInfoConfirmBtnIcon}
        confirmBtnText={touchInfoConfirmBtnText}
        handleShowCompleTouchWindow={handleShowCompleTouchWindow}
      />
      <ZipWhipModal
        showZipwhipTouchWindow={showZipwhipTouchWindow}
        phoneNumber={textPhoneNumber}
        zipwhipSessionKey={user.zipwhipSessionKey}
        handleClose={() => setShowZipwhipTouchWindow(false)}
        prospectId={lastActivityData.prospectId}
        contactName={lastActivityData.contactName}
      />
      <CompleteOtherTouchModal
        showCompleteOtherTouch={showCompleteOtherTouch}
        touchInfoDetails={touchInfoDetails}
        handleClose={() => setShowCompleteOtherTouch(false)}
        handleCompleTouch={handleCompleTouch}
        isRequestLoading={isRequestLoading}
        nextTouchLoading={nextTouchLoading}
        activeTab={activeTab}
        handleNextTouch={() => setIsTouchNext(false)}
        totalCount={totalTouchCount}
        currentCount={
          currentTouchIndex + 1 <= totalTouchCount ? currentTouchIndex + 1 : 1
        }
      />
      {showLinkedInCompleteTouch && (
        <CompleteLinkedInTouchModal
          showLinkedInCompleteTouch={showLinkedInCompleteTouch}
          touchInfoDetails={touchInfoDetails}
          handleClose={() => setShowLinkedInCompleteTouch(false)}
          handleCompleTouch={handleCompleTouch}
          isRequestLoading={isRequestLoading}
          nextTouchLoading={nextTouchLoading}
          activeTab={activeTab}
          handleNextTouch={() => setIsTouchNext(false)}
          totalCount={totalTouchCount}
          currentCount={
            currentTouchIndex + 1 <= totalTouchCount ? currentTouchIndex + 1 : 1
          }
        />
      )}
    </ContentWrapper>
  );
};

// This is required for redux
const mapStateToProps = (state) => ({
  pinnedFilterButton: state.settings.toDoPinnedFilterButton,
});

export default connect(mapStateToProps, { changeSetting })(ToDo);
