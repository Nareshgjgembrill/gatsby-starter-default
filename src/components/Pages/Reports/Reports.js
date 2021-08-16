/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { ContentWrapper } from '@nextaction/components';
import { ErrorMessage } from '@hookform/error-message';
import { default as ClButton } from '../../Common/Button';
import PageHeader from '../../Common/PageHeader';
import SaveReportModal from './SaveReportModal';
import ConfirmModal from '../../Common/ConfirmModal';
import ReportSection from './ReportSection';
import ReportSectionTopTemplates from './ReportSectionTopTemplates';
import CadenceList from '../../Common/CadenceList';
import UserList from '../../Common/UserList';
import UserContext from '../../UserContext';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import {
  FETCH_SAVED_REPORTS_QUERY,
  EDIT_SAVED_REPORTS_QUERY,
  DELETE_SAVED_REPORTS_QUERY,
  SAVE_REPORT_QUERY,
  FETCH_REPORT_QUERY,
  FETCH_CADENCE_PARAMS_QUERY,
  FETCH_PROSPECTS_ALL_USERS_QUERY,
  FETCH_PROSPECTS_USER_QUERY,
  FETCH_SIGNED_KEY_EXPORT_QUERY,
  FETCH_TOP_TEMPLATES_QUERY,
} from '../../queries/ReportsQuery';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const Reports = () => {
  const formRef = useRef();
  const { user, loading: userLoading } = useContext(UserContext);
  const isManager = userLoading ? '' : user.isManagerUser;
  const isAdmin = userLoading ? '' : user.isAdminUser;

  const [expandAllChecked, setExpandAllChecked] = useState(false);
  const [daterange, setDaterange] = useState('');
  const [start, setStart] = useState(moment().format('YYYY-MM-DD'));
  const [end, setEnd] = useState(moment().format('YYYY-MM-DD'));
  const [cadenceValue, setCadenceValue] = useState([]);
  const [usersValue, setUsersValue] = useState([]);
  const [userDisplay, setUserDisplay] = useState(false);
  const [isOpenUser, setIsOpenUser] = useState(false);
  const [isOpenProspects, setIsOpenProspects] = useState(false);
  const [isOpenTouch, setIsOpenTouch] = useState(false);
  const [isOpenEmail, setIsOpenEmail] = useState(false);
  const [isOpenCall, setIsOpenCall] = useState(false);
  const [isOpenText, setIsOpenText] = useState(false);
  const [isOpenCadence, setIsOpenCadence] = useState(false);
  const [isOpenTopTemplates, setIsOpenTopTemplates] = useState(false);
  const [users, setUsers] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [touches, setTouches] = useState([]);
  const [calls, setCalls] = useState([]);
  const [emails, setEmails] = useState([]);
  const [texts, setTexts] = useState([]);
  const [cadences, setCadences] = useState([]);
  const [sectionBucketState, setSectionBucketState] = useState({});
  const [bucketClicked, setBucketClicked] = useState({});
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [chartUser, setChartUser] = useState(false);
  const [chartProspect, setChartProspect] = useState(false);
  const [chartEmail, setChartEmail] = useState(false);
  const [chartCall, setChartCall] = useState(false);
  const [chartText, setChartText] = useState(false);
  const [chartCadence, setChartCadence] = useState(false);
  const [chartListUser, setChartListUser] = useState({});
  const [chartListProspect, setChartListProspect] = useState({});
  const [chartListEmail, setChartListEmail] = useState({});
  const [chartListCall, setChartListCall] = useState({});
  const [chartListText, setChartListText] = useState({});
  const [chartListCadence, setChartListCadence] = useState({});
  const [visible, setVisible] = useState(false);
  const [userValidationError, setUserValidationError] = useState(false);
  const [saveReportModalTitle, setSaveReportModalTitle] = useState();
  const [showSaveReportModal, setShowSaveReportModal] = useState(false);
  const [showSaveReportDeleteModal, setShowSaveReportDeleteModal] = useState(
    false
  );
  const [showSaveReportSpinner, setShowSaveReportSpinner] = useState(false);
  const [savedReportSelectedId, setSavedReportSelectedId] = useState('');
  const [savedReportSelectedName, setSavedReportSelectedName] = useState('');
  const [saveReportAction, setSaveReportAction] = useState(null); // create,edit, or delete

  const bucketClickedRef = useRef();
  bucketClickedRef.current = bucketClicked;
  const sectionBucketStateRef = useRef();
  sectionBucketStateRef.current = sectionBucketState;

  const assignedUsers = useSelector((state) => state.users.data);
  const { apiURL } = useContext(ApiUrlAndTokenContext);

  const { data: configurationsData } = useConfigurations();
  const hasZipWhip =
    configurationsData?.configurations?.data[0]?.zipwhip || false;

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const { data: fetchCadenceParamsData } = useQuery(
    FETCH_CADENCE_PARAMS_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      onCompleted: (data) => {
        const param = data.cadenceParams.data[0];
        if (param) {
          if (param.dateRangeLogicalVariable) {
            setDaterange(param.dateRangeLogicalVariable);
          }
          if (param.startDate) {
            setStart(moment(param.startDate).format('YYYY-MM-DD'));
          }
          if (param.endDate) {
            setEnd(moment(param.endDate).format('YYYY-MM-DD'));
          }
          if (param.selectedCadenceIds) {
            setCadenceValue(
              param.selectedCadenceIds.split(',').map((item) => parseInt(item))
            );
          }
          if (param.selectedUserIds) {
            setUsersValue(
              param.selectedUserIds.split(',').map((item) => parseInt(item))
            );
          }
          setUserDisplay(param.eachUser);
          let cadenceIds = null;
          if (param.selectedCadenceIds) {
            cadenceIds = param.selectedCadenceIds;
          }

          if (
            param.dateRangeLogicalVariable &&
            param.startDate &&
            param.endDate &&
            param.selectedUserIds
          ) {
            fetchUserReport(
              param.dateRangeLogicalVariable,
              param.startDate,
              param.endDate,
              param.selectedUserIds,
              cadenceIds,
              param.eachUser
            );
          }
        }
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to fetch cadence preferences.',
          fetchCadenceParamsData,
          'fetch_cadence_params'
        );
      },
    }
  );

  const {
    data: savedReportsData,
    loading: savedReportsLoading,
    refetch: refetchSavedReports,
  } = useQuery(FETCH_SAVED_REPORTS_QUERY, {
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch saved reports',
        savedReportsData,
        'fetch_saved_reports'
      );
    },
  });

  const [saveReport, { data: saveReportData }] = useLazyQuery(
    SAVE_REPORT_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) => {
        notify(
          'Your report has been saved successfully',
          'success',
          'save_report'
        );
        refetchSavedReports();
        setShowSaveReportSpinner(false);
        setShowSaveReportModal(false);
      },
      onError: (error) => {
        setShowSaveReportSpinner(false);
        setShowSaveReportModal(false);
        showErrorMessage(
          error,
          'Sorry! Failed to save this report',
          saveReportData,
          'save_report'
        );
      },
    }
  );

  const [editReport, { data: editSavedReportData }] = useLazyQuery(
    EDIT_SAVED_REPORTS_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) => {
        notify(
          'Report name has been saved successfully',
          'success',
          'edit_saved_report'
        );
        refetchSavedReports();
        setShowSaveReportSpinner(false);
        setShowSaveReportModal(false);
        setSavedReportSelectedName(
          response.editSavedReports.data[0].reportName
        );
      },
      onError: (error) => {
        setShowSaveReportSpinner(false);
        setShowSaveReportModal(false);
        showErrorMessage(
          error,
          'Sorry! Failed to save report name',
          editSavedReportData,
          'edit_saved_report'
        );
      },
    }
  );

  const [
    deleteReport,
    { data: deleteSavedReportData, loading: deleteSavedReportLoading },
  ] = useLazyQuery(DELETE_SAVED_REPORTS_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      notify(
        'Saved report has been deleted successfully',
        'success',
        'delete_saved_report'
      );
      refetchSavedReports();
      setShowSaveReportDeleteModal(false);

      // resetting saved reports dropdown
      setValue('savedReport', '');
      setSavedReportSelectedId('');
      setSavedReportSelectedName('');
    },
    onError: (error) => {
      setShowSaveReportDeleteModal(false);
      showErrorMessage(
        error,
        'Sorry! Failed to delete saved report',
        deleteSavedReportData,
        'delete_saved_report'
      );
    },
  });

  const [
    fetchTopTemplates,
    {
      data: fetchTopTemplatesData,
      loading: fetchTopTemplatesLoading,
      error: fetchTopTemplatesError,
    },
  ] = useLazyQuery(FETCH_TOP_TEMPLATES_QUERY, {
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch top templates',
        fetchReportData,
        'fetch_top_templates'
      );
    },
  });

  const [
    fetchReport,
    { data: fetchReportData, loading: fetchReportLoading },
  ] = useLazyQuery(FETCH_REPORT_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      setUsers([]);
      setProspects([]);
      setTouches([]);
      setCalls([]);
      setEmails([]);
      setTexts([]);
      setCadences([]);

      setChartUser(false);
      setChartProspect(false);
      setChartCall(false);
      setChartEmail(false);
      setChartText(false);
      setChartCadence(false);

      setChartListUser({});
      setChartListProspect({});
      setChartListCall({});
      setChartListEmail({});
      setChartListText({});
      setChartListCadence({});

      setSectionBucketState({});
      setBucketClicked((prev) => {
        return {
          ...prev,
          allUsers: userDisplay,
          startDate: start,
          endDate: end,
          dateRange: daterange,
          userIds: usersValue,
          cadenceIds: cadenceValue,
        };
      });
      createGrid(response);
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch the report details',
        fetchReportData,
        'fetch_report'
      );
    },
  });

  const truncateString = function (str, length = 18, ending = '...') {
    return str.length > length
      ? str.substring(0, length - ending.length) + ending
      : str;
  };

  // setting grid list state for each view
  const createGrid = (response) => {
    // user view
    if (response?.fetchReport?.data[0]?.userView) {
      const list = createGridList(
        response.fetchReport.data[0].userView,
        'user'
      );
      setUsers(list);
      const chartList = createChartList(
        response.fetchReport.data[0].userView,
        'user'
      );
      setChartListUser(chartList);
    } else {
      setUsers([
        {
          columns: [],
          data: [],
          key: 0,
        },
      ]);
    }

    // prospect view
    if (response?.fetchReport?.data[0]?.prospectView) {
      const list = createGridList(
        response.fetchReport.data[0].prospectView,
        'prospect',
        response.fetchReport.data
      );
      setProspects(list);
      const chartList = createChartList(
        response.fetchReport.data[0].prospectView,
        'prospect'
      );
      setChartListProspect(chartList);
    } else {
      setProspects([
        {
          columns: [],
          data: [],
          key: 0,
        },
      ]);
    }

    // call view
    if (response?.fetchReport?.data[0]?.callView) {
      const list = createGridList(
        response.fetchReport.data[0].callView,
        'call',
        response.fetchReport.data
      );
      setCalls(list);
      const chartList = createChartList(
        response.fetchReport.data[0].callView,
        'call'
      );
      setChartListCall(chartList);
    } else {
      setCalls([
        {
          columns: [],
          data: [],
          key: 0,
        },
      ]);
    }

    // text view
    if (response?.fetchReport?.data[0]?.textView) {
      const list = createGridList(
        response.fetchReport.data[0].textView,
        'text'
      );
      setTexts(list);
      const chartList = createChartList(
        response.fetchReport.data[0].textView,
        'text'
      );
      setChartListText(chartList);
    } else {
      setTexts([
        {
          columns: [],
          data: [],
          key: 0,
        },
      ]);
    }

    // email view
    if (response?.fetchReport?.data[0]?.emailView) {
      const list = createGridList(
        response.fetchReport.data[0].emailView,
        'email'
      );
      setEmails(list);
      const chartList = createChartList(
        response.fetchReport.data[0].emailView,
        'email'
      );
      setChartListEmail(chartList);
    } else {
      setEmails([
        {
          columns: [],
          data: [],
          key: 0,
        },
      ]);
    }

    // cadence view
    if (response?.fetchReport?.data[0]?.cadenceView) {
      const list = createGridList(
        response.fetchReport.data[0].cadenceView,
        'cadence'
      );
      setCadences(list);
      const chartList = createChartList(
        response.fetchReport.data[0].cadenceView,
        'cadence'
      );
      setChartListCadence(chartList);
    } else {
      setCadences([
        {
          columns: [],
          data: [],
          key: 0,
        },
      ]);
    }

    // touch view
    if (response?.fetchReport?.data[0]?.touchView) {
      const list = createGridList(
        response.fetchReport.data[0].touchView,
        'touch'
      );
      setTouches(list);
    } else {
      setTouches([
        {
          columns: [],
          data: [],
          key: 0,
        },
      ]);
    }
  };

  // creating grid list array for each view
  const createGridList = (apiView, viewName, apiCompleteData) => {
    const list = apiView.map((item, index) => {
      // calculating total for pecentage
      let bucketSum = 0;
      if (viewName === 'call') {
        bucketSum = Object.keys(item)
          .filter((subItem) => {
            return ![
              'user_id',
              'userId',
              'userid',
              'user_name',
              'userName',
              'touch_type',
              'touchType',
            ].includes(subItem);
          })
          .reduce((sum, subItem) => {
            return sum + parseInt(item[subItem]);
          }, 0);
      } else if (viewName === 'email') {
        bucketSum = item['Sent'];
      } else if (
        viewName === 'touch' &&
        item['touchType'].slice(-7).toLowerCase() === '(email)'
      ) {
        bucketSum = item['Sent'];
      }

      // variables
      const data = [{}];
      const additionalData = {};
      let key =
        viewName +
        '_' +
        index +
        '_' +
        (item['user_id'] || item['userId'] || item['userid'] || '');
      if (viewName === 'cadence') {
        key += '_' + item['Cadence Id'];
      }

      // creating columns
      const columns = Object.keys(item)
        .filter((subItem) => {
          return (
            subItem !== 'user_id' &&
            subItem.toLowerCase() !== 'userid' &&
            subItem !== 'Cadence Id'
          );
        })
        .map((subItem) => {
          if (
            subItem === 'user_name' ||
            subItem === 'userName' ||
            subItem === 'touch_type' ||
            subItem === 'touchType' ||
            subItem === 'Cadence Name'
          ) {
            return {
              Header: 'leftbucket',
              accessor: subItem,
              width: '20%',
              Cell: function (props) {
                return (
                  <div className="align-middle float-left">
                    <div className="mx-auto">
                      <h5 className="mb-0 text-nowrap" title={props.value}>
                        {truncateString(props.value)}
                      </h5>
                    </div>
                  </div>
                );
              },
            };
          }

          return {
            Header: subItem,
            accessor: subItem,
            width: '20%',
            Cell: function (props) {
              // display percentage if view is call or email or touch(email)
              let percentage;
              if (
                (viewName === 'call' ||
                  viewName === 'email' ||
                  (viewName === 'touch' &&
                    item['touchType'].slice(-7).toLowerCase() === '(email)')) &&
                (parseInt(props.value) / bucketSum) * 100 > 0 &&
                parseInt(parseInt(props.value) / bucketSum) !== 1
              ) {
                percentage = (
                  <span className="h6">
                    <small className="text-warning ml-1 align-top position-absolute">
                      {parseFloat(
                        ((parseInt(props.value) / bucketSum) * 100).toFixed(1)
                      )}
                      %
                    </small>
                  </span>
                );
              }

              // display info icon in bucket if view is prospect
              let icon, dispositions;
              if (viewName === 'prospect' && apiCompleteData[1]) {
                dispositions = apiCompleteData[1].additionalData.dispositions.prospectView[
                  subItem
                ]?.join(', ');
                icon = (
                  <i
                    className="fas fa-info-circle text-muted fa-xs ml-1 align-top position-absolute"
                    style={{ zIndex: '9', fontSize: '0.67rem' }}
                    title={'Dispositions: ' + (dispositions || 'No outcomes')}
                  ></i>
                );
              }

              return (
                <div
                  className={`${props.value && 'pointer'} px-2 py-0 ${
                    !props.value && 'text-muted'
                  }`}
                  onClick={(e) => {
                    if (props.value) {
                      handleBucketClick(
                        key,
                        subItem,
                        '0',
                        '10',
                        'contact_name',
                        'asc',
                        'click'
                      );
                    }
                  }}
                >
                  <div className="mx-auto">
                    <h5 className="position-relative mb-1">
                      {props.value}
                      {percentage && percentage}
                    </h5>
                    <p className="my-0 text-sm" title={subItem}>
                      {truncateString(
                        subItem
                          .toLowerCase()
                          .split(' ')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.substring(1)
                          )
                          .join(' ')
                      )}
                      {icon && icon}
                    </p>
                  </div>
                </div>
              );
            },
          };
        });

      // creating data
      Object.keys(item)
        .filter((subItem) => {
          return subItem !== 'user_id' && subItem.toLowerCase() !== 'userid';
        })
        .forEach((subItem) => {
          data[0][subItem] = item[subItem];
          // storing additional data
          if (subItem.toLowerCase() === 'calls made') {
            additionalData.callsMade = item[subItem];
          }
        });

      // insert column and data if display by each user is false
      if (
        userDisplay === false &&
        viewName !== 'touch' &&
        viewName !== 'cadence'
      ) {
        let selectedUserName;
        if (usersValue.length > 1) {
          selectedUserName = 'Users (Custom)';
        } else if (usersValue.length === 1) {
          const selectedUserId = usersValue[0];
          assignedUsers.forEach((item) => {
            if (item.id === selectedUserId) {
              selectedUserName = item.displayName;
            }
          });
        }

        const userColumn = {
          Header: 'leftbucket',
          accessor: 'userNameColumn',
          width: '20%',
          Cell: function (props) {
            return (
              <div className="align-middle float-left">
                <div className="mx-auto">
                  <h5 className="mb-0 text-nowrap">{props.value}</h5>
                </div>
              </div>
            );
          },
        };
        columns.unshift(userColumn);

        data[0]['userNameColumn'] = selectedUserName;
      }

      // insert 'conversations' column in call view
      if (viewName === 'call') {
        let usersViewCallsMade;
        if (userDisplay === true) {
          const userId = item['user_id'] || item['userId'];
          usersViewCallsMade = apiCompleteData[0]?.userView.filter(
            (subItem) => {
              return parseInt(subItem['user_id']) === parseInt(userId);
            }
          )[0]['Calls Made'];
        } else {
          usersViewCallsMade =
            apiCompleteData[0]?.userView &&
            apiCompleteData[0]?.userView[0]['Calls Made'];
        }

        const callColumn = {
          Header: 'Conversations',
          accessor: '',
          width: '20%',
          Cell: function (props) {
            return (
              <div className="align-middle">
                <div
                  className="mx-auto"
                  title="This field is only for information and is not clickable."
                >
                  <h5 className=" position-relative mb-1">
                    {usersViewCallsMade}
                  </h5>
                  <p className="my-0 text-sm">Conversations</p>
                </div>
              </div>
            );
          },
        };
        if (usersViewCallsMade) {
          columns.splice(1, 0, callColumn);
        }
      }

      return {
        columns: columns,
        data: data,
        key: key,
        additionalData,
      };
    });
    return list;
  };

  // creating list for graphical view
  function createChartList(apiView, viewName) {
    const chartList = {
      data: [],
      keys: [],
      colors: [],
    };
    if (viewName !== 'touch' && viewName !== 'cadence') {
      if (apiView[0] != null) {
        Object.keys(apiView[0])
          .filter((subItem, subIndex) => {
            return !['user_id', 'userId', 'user_name', 'userName'].includes(
              subItem
            );
          })
          .forEach((item, index) => {
            chartList.data[index] = {};
            chartList.data[index] = { bucket: item };
            apiView.forEach((subItem, subIndex) => {
              let userName = subItem['user_name'];
              if (userName === undefined) {
                if (usersValue.length > 1) {
                  userName = 'Users (Custom)';
                } else if (usersValue.length === 1) {
                  const selectedUserId = usersValue[0];
                  assignedUsers.forEach((item) => {
                    if (item.id === selectedUserId) {
                      userName = item.displayName;
                    }
                  });
                } else {
                  userName = 'Users (Custom)';
                }
              }
              if (chartList.keys.indexOf(userName) === -1) {
                chartList.keys.push(userName);
              }
              chartList.data[index][userName] = subItem[item];
              chartList.colors.push(getRandomColor());
            });
          });
      }

      if (chartList.keys.length === 1 && chartList.keys[0] === undefined) {
        if (usersValue.length > 1) {
          chartList.keys[0] = 'Users (Custom)';
        } else if (usersValue.length === 1) {
          const selectedUserId = usersValue[0];
          assignedUsers.forEach((item) => {
            if (item.id === selectedUserId) {
              chartList.keys[0] = item.displayName;
            }
          });
        } else {
          chartList.keys[0] = 'Users (Custom)';
        }
      }
    }

    if (viewName === 'cadence' && apiView[0] != null) {
      Object.keys(apiView[0])
        .filter((subItem, subIndex) => {
          return ![
            'Cadence Id',
            'Cadence Name',
            'user_id',
            'userId',
            'user_name',
            'userName',
          ].includes(subItem);
        })
        .forEach((item, index) => {
          chartList.data[index] = {};
          chartList.data[index] = { bucket: item };
          apiView.forEach((subItem, subIndex) => {
            const cadenceName = subItem['Cadence Name'];
            if (chartList.keys.indexOf(cadenceName) === -1) {
              chartList.keys.push(cadenceName);
            }
            chartList.data[index][cadenceName] = subItem[item];
            chartList.colors.push(getRandomColor());
          });
        });
    }

    return chartList;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function getRandomColor() {
    // setting s and l to high value to get bright colors for dark text
    const h = rand(1, 360);
    const s = '100';
    const l = '75';
    return 'hsl(' + h + ',' + s + '%,' + l + '%)';
  }

  const [
    fetchProspectsAllUsers,
    { data: fetchProspectsAllUsersData },
  ] = useLazyQuery(FETCH_PROSPECTS_ALL_USERS_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      createProspectsList(response);
    },
    onError: (error) => {
      createProspectsError(
        error,
        fetchProspectsAllUsersData,
        'fetch_prospects_all_users'
      );
    },
  });

  const [fetchProspectsUser, { data: fetchProspectsUserData }] = useLazyQuery(
    FETCH_PROSPECTS_USER_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) => {
        createProspectsList(response);
      },
      onError: (error) => {
        createProspectsError(
          error,
          fetchProspectsUserData,
          'fetch_prospects_user'
        );
      },
    }
  );

  function createProspectsList(response) {
    setSectionBucketState((prev) => {
      return {
        ...prev,
        [bucketClickedRef.current.key]: {
          ...prev[bucketClickedRef.current.key],
          data: response.fetchProspects.data,
          totalCount: response.fetchProspects.total,
          display: true,
          loading: false,
          error: false,
        },
      };
    });
  }

  function createProspectsError(error, responseData, errorId) {
    setSectionBucketState((prev) => {
      return {
        ...prev,
        [bucketClickedRef.current.key]: {
          ...prev[bucketClickedRef.current.key],
          data: [],
          display: true,
          loading: false,
          error: true,
        },
      };
    });

    showErrorMessage(
      error,
      'Sorry! Failed to fetch prospects list.',
      responseData,
      errorId
    );
  }

  const handleBucketClick = useCallback(
    (
      key,
      bucketName,
      pageOffset = '0',
      pageLimit = '10',
      sortColumn = 'contact_name',
      sortDirection = 'asc',
      source = ''
    ) => {
      const sectionBucketStateCurrent = sectionBucketStateRef.current;
      if (
        // check if not clicked for first time
        sectionBucketStateCurrent[key] !== undefined &&
        sectionBucketStateCurrent[key]['loading'] === false &&
        // if bucket is clicked second time, hide it
        sectionBucketStateCurrent[key]['bucketName'] === bucketName &&
        sectionBucketStateCurrent[key]['display'] === true &&
        // check if not filtering from pagination in prospects list
        source === 'click'
      ) {
        return setSectionBucketState((prev) => {
          return {
            ...prev,
            [key]: {
              data: [],
              key: key,
              bucketName: undefined,
              currentPageIndex: pageOffset,
              pageSize: pageLimit,
              sortColumn: sortColumn,
              sortDirection: sortDirection,
              display: false,
              loading: false,
              error: false,
            },
          };
        });
      } else if (
        sectionBucketStateCurrent[key] === undefined ||
        sectionBucketStateCurrent[key]['display'] === false ||
        (sectionBucketStateCurrent[key]['display'] === true &&
          sectionBucketStateCurrent[key]['bucketName'] !== bucketName) ||
        // if refetching data for the same buket due to pagination
        (sectionBucketStateCurrent[key]['bucketName'] === bucketName &&
          source !== 'click')
      ) {
        // saving current clicked key in state, which will be used later for updating
        // sectionBucketState for that particular key
        // (while on success (or on error) for the api call fetch prospects list)
        setBucketClicked((prev) => {
          return {
            ...prev,
            key: key,
          };
        });
        setSectionBucketState((prev) => {
          return {
            ...prev,
            [key]: {
              data: [],
              key: key,
              bucketName: bucketName,
              currentPageIndex: pageOffset,
              pageSize: pageLimit,
              sortColumn: sortColumn,
              sortDirection: sortDirection,
              display: true,
              loading: true,
              error: false,
            },
          };
        });

        const keyArray = key.split('_');
        const section = keyArray[0].toLowerCase();
        const userId = keyArray[2];
        const stepNo = section === 'touch' ? parseInt(keyArray[1]) + 1 : 0;

        //fetch prospects list from api
        const bucketClickedCurrent = bucketClickedRef.current;
        let hasError = false;
        const showByUser = bucketClickedCurrent.allUsers;
        let startDate = null;
        let endDate = null;
        if (
          isNaN(moment(bucketClickedCurrent.startDate).valueOf()) ||
          isNaN(moment(bucketClickedCurrent.endDate).valueOf()) ||
          moment(bucketClickedCurrent.startDate).diff(
            moment(bucketClickedCurrent.endDate)
          ) > 0
        ) {
          hasError = true;
        }
        if (!hasError) {
          startDate = moment(bucketClickedCurrent.startDate).format(
            'YYYY-MM-DDTHH:mm:ss[Z]'
          );
          endDate = moment(bucketClickedCurrent.endDate).format(
            'YYYY-MM-DDTHH:mm:ss[Z]'
          );
        }

        const dateRangeLogicalVariable = bucketClickedCurrent.dateRange;

        if (bucketClickedCurrent.userIds?.length === 0) {
          hasError = true;
        }
        let talkerIds;
        let cadenceIds;
        if (!hasError) {
          talkerIds = bucketClickedCurrent.userIds.join(',');
          cadenceIds = bucketClickedCurrent.cadenceIds.join(',');
        }
        if (
          cadenceIds === undefined ||
          cadenceIds === null ||
          cadenceIds === 'NaN' ||
          cadenceIds === 'ALL'
        ) {
          cadenceIds = '';
        }

        if (!hasError) {
          if (!showByUser) {
            fetchProspectsAllUsers({
              variables: {
                bucketName: bucketName,
                section: section === 'cadence' ? 'user' : section,
                showByEachUser: section === 'cadence' ? false : showByUser,
                startDate: startDate,
                endDate: endDate,
                logicalVariable: dateRangeLogicalVariable,
                selectedUserIds: talkerIds,
                cadenceIds: section === 'cadence' ? keyArray[3] : cadenceIds,
                stepNo: stepNo,
                sortColumn: sortColumn,
                sortDirection: sortDirection,
                pageLimit: pageLimit,
                pageOffset: pageOffset,
              },
            });
          } else {
            fetchProspectsUser({
              variables: {
                bucketName: bucketName,
                section: section === 'cadence' ? 'user' : section,
                showByEachUser: section === 'cadence' ? false : showByUser,
                startDate: startDate,
                endDate: endDate,
                logicalVariable: dateRangeLogicalVariable,
                selectedUserIds: talkerIds,
                cadenceIds: section === 'cadence' ? keyArray[3] : cadenceIds,
                stepNo: stepNo,
                sortColumn: sortColumn,
                sortDirection: sortDirection,
                pageLimit: pageLimit,
                pageOffset: pageOffset,
                userId: userId,
              },
            });
          }
        }
      }
    },
    [fetchProspectsAllUsers, fetchProspectsUser]
  );

  const toggleChartUser = () => {
    setChartUser(!chartUser);
  };
  const togglechartProspect = () => {
    setChartProspect(!chartProspect);
  };
  const toggleChartEmail = () => {
    setChartEmail(!chartEmail);
  };
  const toggleChartCall = () => {
    setChartCall(!chartCall);
  };
  const toggleChartText = () => {
    setChartText(!chartText);
  };
  const toggleChartCadence = () => {
    setChartCadence(!chartCadence);
  };

  const toggleUser = () => setIsOpenUser(!isOpenUser);
  const toggleProspect = () => setIsOpenProspects(!isOpenProspects);
  const toggleTouch = () => setIsOpenTouch(!isOpenTouch);
  const toggleEmail = () => setIsOpenEmail(!isOpenEmail);
  const toggleCall = () => setIsOpenCall(!isOpenCall);
  const toggleText = () => setIsOpenText(!isOpenText);
  const toggleCadence = () => setIsOpenCadence(!isOpenCadence);
  const toggleTopTemplates = () => setIsOpenTopTemplates(!isOpenTopTemplates);

  const expandAllHandler = () => {
    setExpandAllChecked(true);
    setIsOpenUser(true);
    setIsOpenProspects(true);
    setIsOpenTouch(true);
    setIsOpenEmail(true);
    setIsOpenCall(true);
    setIsOpenText(true);
    setIsOpenCadence(true);
    setIsOpenTopTemplates(true);
  };

  const handleExpandAllClick = (e) => {
    const checked = e.target.checked;
    setExpandAllChecked(checked);
    setIsOpenUser(checked);
    setIsOpenProspects(checked);
    setIsOpenTouch(checked);
    setIsOpenEmail(checked);
    setIsOpenCall(checked);
    setIsOpenText(checked);
    setIsOpenCadence(checked);
    setIsOpenTopTemplates(checked);
  };

  const handleArrowButtonClick = (e) => {
    setShowSearchForm(!showSearchForm);
  };

  const savedReportChangeHandler = (e) => {
    const id = e.target.value;
    const data = savedReportsData.savedReports.data.filter((item) => {
      return parseInt(item['id']) === parseInt(id);
    })[0];
    if (data) {
      // setting search inputs
      setDaterange(data.dateRangeLogicalVariable);
      setStart(moment(data.startDate).format('YYYY-MM-DD'));
      setEnd(moment(data.endDate).format('YYYY-MM-DD'));
      setCadenceValue(
        data.selectedCadenceIds.split(',').map((item) => parseInt(item))
      );
      setUsersValue(
        data.selectedUserIds.split(',').map((item) => parseInt(item))
      );
      setUserDisplay(data.eachUser);

      // saving details of currently selected saved report
      setSavedReportSelectedId(id);
      setSavedReportSelectedName(data.reportName);

      // fetching report
      fetchUserReport(
        data.dateRangeLogicalVariable,
        data.startDate,
        data.endDate,
        data.selectedUserIds,
        data.selectedCadenceIds,
        data.eachUser
      );
    } else {
      // saving details of currently selected saved report
      setSavedReportSelectedId('');
      setSavedReportSelectedName('');
    }
  };

  const handleSaveReportCreateOrEdit = (reportName, action) => {
    setVisible(false);
    setUserValidationError(false);
    setShowSaveReportSpinner(true);
    let hasError = false;
    const showByUser = userDisplay;
    let startDate = null;
    let endDate = null;

    if (isNaN(moment(start).valueOf()) || isNaN(moment(end).valueOf())) {
      hasError = true;
    }
    if (moment(start).diff(moment(end)) > 0) {
      hasError = true;
      setVisible(true);
    }

    if (!hasError) {
      startDate = moment(start).format('YYYY-MM-DDTHH:mm:ss[Z]');
      endDate = moment(end).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    const dateRangeLogicalVariable = daterange;
    const talkerIds = usersValue;
    let cadenceIds = cadenceValue;

    if (usersValue.length === 0) {
      hasError = true;
      setUserValidationError(true);
    }

    if (
      (cadenceIds.length === 1 &&
        (cadenceIds[0] === null || isNaN(cadenceIds[0]))) ||
      cadenceIds === 'ALL'
    ) {
      cadenceIds = [];
    }

    if (!hasError) {
      setVisible(false);
      setUserValidationError(false);

      if (action === 'create') {
        saveReport({
          variables: {
            input: {
              showByUser: showByUser,
              startDate: startDate,
              endDate: endDate,
              dateRangeLogicalVariable: dateRangeLogicalVariable,
              talkerIds: talkerIds,
              cadenceIds: cadenceIds,
              reportName: reportName,
            },
          },
        });
      } else if (action === 'edit') {
        editReport({
          variables: {
            reportId: savedReportSelectedId,
            input: {
              reportName: reportName,
            },
          },
        });
      }
    } else {
      setShowSaveReportSpinner(false);
      setShowSaveReportModal(false);
    }
  };

  const fetchUserReport = (
    _dateRange,
    _start,
    _end,
    _users,
    _cadences,
    _showByUser
  ) => {
    setVisible(false);
    setUserValidationError(false);

    let hasError = false;
    const showByUser = _showByUser;
    let startDate = null;
    let endDate = null;

    if (isNaN(moment(_start).valueOf()) || isNaN(moment(_end).valueOf())) {
      hasError = true;
    }
    if (moment(_start).diff(moment(_end)) > 0) {
      hasError = true;
      setVisible(true);
    }

    if (!hasError) {
      startDate = moment(_start).format('YYYY-MM-DDTHH:mm:ss[Z]');
      endDate = moment(_end).format('YYYY-MM-DDTHH:mm:ss[Z]');
    }

    const dateRangeLogicalVariable = _dateRange;
    let talkerIds;
    let cadenceIds;
    if (Array.isArray(_users) && Array.isArray(_cadences)) {
      talkerIds = _users.join(',');
      cadenceIds = _cadences.join(',');
    } else {
      talkerIds = _users;
      cadenceIds = _cadences;
    }
    if (
      cadenceIds === [null] ||
      cadenceIds === 'NaN' ||
      (cadenceIds !== null && cadenceIds === 'ALL')
    ) {
      cadenceIds = '';
    }

    if (_users.length === 0) {
      hasError = true;
      setUserValidationError(true);
    }

    if (!hasError) {
      setVisible(false);
      setUserValidationError(false);
      fetchReport({
        variables: {
          showByEachUser: showByUser,
          startDate: startDate,
          endDate: endDate,
          logicalVariable: dateRangeLogicalVariable,
          selectedUserIds: talkerIds,
          cadenceIds: cadenceIds ? cadenceIds : '',
        },
      });
      fetchTopTemplates({
        variables: {
          selectedUserIds: talkerIds,
          cadenceIds: cadenceIds ? cadenceIds : '',
          startDate: startDate,
          endDate: endDate,
        },
      });
      expandAllHandler();
    }
  };

  const handleDateRangeChange = (e) => {
    const dateRange = e.target.value;
    setDaterange(dateRange);

    let startDay = null;
    let endDay = null;
    if (dateRange === 'Today') {
      const today = moment();
      startDay = today.format('YYYY-MM-DD');
      endDay = today.format('YYYY-MM-DD');
    } else if (dateRange === 'Yesterday') {
      const yesterday = moment().subtract(1, 'days');
      startDay = yesterday.format('YYYY-MM-DD');
      endDay = yesterday.format('YYYY-MM-DD');
    } else if (dateRange === 'Current Week') {
      startDay = moment().startOf('week').format('YYYY-MM-DD');
      endDay = moment().endOf('week').format('YYYY-MM-DD');
    } else if (dateRange === 'Last Week') {
      startDay = moment()
        .subtract(1, 'weeks')
        .startOf('week')
        .format('YYYY-MM-DD');
      endDay = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');
    } else if (dateRange === 'Current Month') {
      startDay = moment().startOf('month').format('YYYY-MM-DD');
      endDay = moment().endOf('month').format('YYYY-MM-DD');
    } else if (dateRange === 'Last Month') {
      startDay = moment()
        .subtract(1, 'months')
        .startOf('month')
        .format('YYYY-MM-DD');
      endDay = moment()
        .subtract(1, 'months')
        .endOf('month')
        .format('YYYY-MM-DD');
    } else if (dateRange === 'Current Quarter') {
      startDay = moment().startOf('quarter').format('YYYY-MM-DD');
      endDay = moment().endOf('quarter').format('YYYY-MM-DD');
    } else if (dateRange === 'Last Quarter') {
      startDay = moment()
        .subtract(1, 'quarters')
        .startOf('quarter')
        .format('YYYY-MM-DD');
      endDay = moment()
        .subtract(1, 'quarters')
        .endOf('quarter')
        .format('YYYY-MM-DD');
    } else if (dateRange === 'Custom') {
      startDay = '';
      endDay = '';
    }

    setStart(startDay);
    setEnd(endDay);
  };

  const { handleSubmit, register, reset, errors, setValue } = useForm({});

  const searchFormSubmit = (e) => {
    // resetting saved reports dropdown
    setValue('savedReport', '');
    setSavedReportSelectedId('');
    setSavedReportSelectedName('');

    // fetching report
    fetchUserReport(
      daterange,
      start,
      end,
      usersValue,
      cadenceValue,
      userDisplay
    );
  };

  // exporting report
  const [
    fetchSignedKeyExport,
    { data: fetchSignedKeyExportData },
  ] = useLazyQuery(FETCH_SIGNED_KEY_EXPORT_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      if (response?.signedKeyExport?.data[0]?.key) {
        const signedKey = response?.signedKeyExport?.data[0]?.key;
        const link = `${apiURL}public/reports/export/${signedKey}`;
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
        'Sorry! Failed to fetch signed key.',
        fetchSignedKeyExportData,
        'fetch_signed_key'
      );
    },
  });

  function handleExport(type) {
    //fetch signed url from api
    const bucketClickedCurrent = bucketClickedRef.current;
    let hasError = false;
    const showByUser = bucketClickedCurrent.allUsers;
    let startDate = null;
    let endDate = null;

    if (
      isNaN(moment(bucketClickedCurrent.startDate).valueOf()) ||
      isNaN(moment(bucketClickedCurrent.endDate).valueOf()) ||
      moment(bucketClickedCurrent.startDate).diff(
        moment(bucketClickedCurrent.endDate)
      ) > 0
    ) {
      hasError = true;
    }

    if (!hasError) {
      startDate = moment(bucketClickedCurrent.startDate).format(
        'YYYY-MM-DDTHH:mm:ss[Z]'
      );
      endDate = moment(bucketClickedCurrent.endDate).format(
        'YYYY-MM-DDTHH:mm:ss[Z]'
      );
    }

    const dateRangeLogicalVariable = bucketClickedCurrent.dateRange;

    if (bucketClickedCurrent.userIds?.length === 0) {
      hasError = true;
    }
    let user;
    let cadenceIds;
    if (!hasError) {
      user = bucketClickedCurrent.userIds.map((item) => {
        return {
          id: item,
        };
      });

      if (
        (bucketClickedCurrent.cadenceIds.length === 1 &&
          (bucketClickedCurrent.cadenceIds[0] === null ||
            isNaN(bucketClickedCurrent.cadenceIds[0]))) ||
        (cadenceIds !== null && cadenceIds === 'ALL')
      ) {
        cadenceIds = [];
      } else {
        cadenceIds = bucketClickedCurrent.cadenceIds.map((item) => {
          return {
            id: item,
          };
        });
      }
    }

    let outType;
    if (type === 'excel') {
      outType = 'Excel';
    } else if (type === 'csv') {
      outType = 'CSV';
    }
    if (!hasError) {
      fetchSignedKeyExport({
        variables: {
          input: {
            showByEachUser: showByUser,
            startDate: startDate,
            endDate: endDate,
            logicalVariable: dateRangeLogicalVariable,
            user: user,
            cadenceIds: cadenceIds,
            outType: outType,
          },
        },
      });
    }
  }

  // will be uncommented once the api is available
  // exporting report section
  // const [
  //   fetchSignedKeyExportSection,
  //   { data: fetchSignedKeyExportSectionData },
  // ] = useLazyQuery(FETCH_SIGNED_KEY_EXPORT_SECTION_QUERY, {
  //   onCompleted: (response) => {
  //     if (response?.signedKeyExport?.data[0]?.key) {
  //       const signedKey = response?.signedKeyExport?.data[0]?.key;
  //       const link = `${apiURL}public/reports/prospectExport/${signedKey}`;
  //       const anchor = document.createElement('a');
  //       document.body.appendChild(anchor);
  //       anchor.href = link;
  //       anchor.download = '';
  //       anchor.click();
  //       anchor.remove();
  //     }
  //   },
  //   onError: (error) => {
  //     showErrorMessage(
  //       error,
  //       'Sorry! Failed to fetch signed key.',
  //       fetchSignedKeyExportSectionData,
  //       'fetch_signed_key_section'
  //     );
  //   },
  // });

  // function handleExportSection(type,sectionData) {
  //   //fetch signed url from api
  //   const bucketClickedCurrent = bucketClickedRef.current;
  //   let hasError = false;
  //   const showByUser = bucketClickedCurrent.allUsers;
  //   let startDate = null;
  //   let endDate = null;

  //   if (
  //     isNaN(moment(bucketClickedCurrent.startDate).valueOf()) ||
  //     isNaN(moment(bucketClickedCurrent.endDate).valueOf()) ||
  //     moment(bucketClickedCurrent.startDate).diff(
  //       moment(bucketClickedCurrent.endDate)
  //     ) > 0
  //   ) {
  //     hasError = true;
  //   }

  //   if (!hasError) {
  //     startDate = moment(bucketClickedCurrent.startDate).format(
  //       'YYYY-MM-DDTHH:mm:ss[Z]'
  //     );
  //     endDate = moment(bucketClickedCurrent.endDate).format(
  //       'YYYY-MM-DDTHH:mm:ss[Z]'
  //     );
  //   }

  //   const dateRangeLogicalVariable = bucketClickedCurrent.dateRange;

  //   if (bucketClickedCurrent.userIds?.length === 0) {
  //     hasError = true;
  //   }
  //   let user;
  //   let cadenceIds;
  //   if (!hasError) {
  //     user = bucketClickedCurrent.userIds.map((item) => {
  //       return {
  //         id: item,
  //       };
  //     });

  //     if (
  //       (bucketClickedCurrent.cadenceIds.length === 1 &&
  //         (bucketClickedCurrent.cadenceIds[0] === null ||
  //           isNaN(bucketClickedCurrent.cadenceIds[0]))) ||
  //       (cadenceIds !== null && cadenceIds === 'ALL')
  //     ) {
  //       cadenceIds = [];
  //     } else {
  //       cadenceIds = bucketClickedCurrent.cadenceIds.map((item) => {
  //         return {
  //           id: item,
  //         };
  //       });
  //     }
  //   }

  //   let outType;
  //   if (type === 'excel') {
  //     outType = 'export_excel';
  //   } else if (type === 'csv') {
  //     outType = 'CSV';
  //   }
  //   if (!hasError) {
  //     fetchSignedKeyExportSection({
  //       variables: {
  //         input: {
  //           showByEachUser: showByUser,
  //           startDate: startDate,
  //           endDate: endDate,
  //           logicalVariable: dateRangeLogicalVariable,
  //           selectedUserIds: user,
  //           cadenceIds: cadenceIds,
  //           outType: outType,
  //           sectionData: sectionData,
  //         },
  //       },
  //     });
  //   }
  // }

  return (
    <ContentWrapper>
      <PageHeader icon="fas fa-chart-bar" pageName="Reports">
        <div className="ml-auto">
          <ClButton
            icon="fas fa-download"
            className="mr-2"
            title="Export to CSV"
            onClick={(e) => {
              handleExport('csv');
            }}
          >
            Export to CSV
          </ClButton>
          <ClButton
            icon="fas fa-download"
            title="Export to excel"
            onClick={(e) => {
              handleExport('excel');
            }}
          >
            Export to Excel
          </ClButton>
        </div>
      </PageHeader>

      <Row className="color-regent-gray">
        {/* left side */}
        {showSearchForm && (
          <Col lg={3}>
            <Card className="card-default">
              <CardHeader
                className="bg-white border-bottom d-flex flex-column justify-content-center"
                style={{ minHeight: '56px' }}
              >
                <Row className="align-items-center">
                  <Col xs={9}>
                    <h5 className="mb-0 color-lynch text-capitalize">
                      {savedReportSelectedName
                        ? savedReportSelectedName
                        : 'New Report'}
                    </h5>
                  </Col>
                  <Col xs={3} className="text-right">
                    <i
                      onClick={() => {
                        reset({
                          dateRange: null,
                          start: null,
                          end: null,
                        });
                        setCadenceValue([]);
                        setUsersValue([]);
                        setUserDisplay(false);
                      }}
                      className="fas fa-sync-alt fa-sm pointer color-lynch"
                      title="Reset"
                    ></i>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form
                  onSubmit={handleSubmit(searchFormSubmit)}
                  innerRef={formRef}
                >
                  <FormGroup>
                    <Label for="date_range">Date Range</Label>
                    <Input
                      type="select"
                      name="dateRange"
                      value={daterange}
                      id="date_range"
                      onChange={handleDateRangeChange}
                      invalid={errors.date_range}
                      innerRef={register({
                        required: 'Please select Date range',
                      })}
                    >
                      <option></option>
                      <option value="Today">Today</option>
                      <option value="Yesterday">Yesterday</option>
                      <option value="Current Week">Current Week</option>
                      <option value="Last Week">Last Week</option>
                      <option value="Current Month">Current Month</option>
                      <option value="Last Month">Last Month</option>
                      <option value="Current Quarter">Current Quarter</option>
                      <option value="Last Quarter">Last Quarter</option>
                      <option value="Custom">Custom</option>
                    </Input>
                    <ErrorMessage
                      errors={errors}
                      name="dateRange"
                      className="invalid-feedback"
                      render={({ message }) => (
                        <p className={'text-danger'}>{message}</p>
                      )}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="start">Start</Label>
                    <Input
                      type="date"
                      name="start"
                      value={start}
                      id="start"
                      onChange={(e) => {
                        setStart(e.target.value);
                      }}
                      invalid={errors.start}
                      innerRef={register({
                        required:
                          daterange === 'Custom'
                            ? 'Please select the Start date'
                            : false,
                      })}
                      disabled={daterange === 'Custom' ? false : true}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="start"
                      className="invalid-feedback"
                      render={({ message }) => (
                        <p className={'text-danger'}>{message}</p>
                      )}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="end">End</Label>
                    <Input
                      type="date"
                      name="end"
                      value={end}
                      id="end"
                      onChange={(e) => {
                        setEnd(e.target.value);
                      }}
                      invalid={errors.end}
                      innerRef={register({
                        required:
                          daterange === 'Custom'
                            ? 'Please select the End date'
                            : false,
                      })}
                      disabled={daterange === 'Custom' ? false : true}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="end"
                      className="invalid-feedback"
                      render={({ message }) => (
                        <p className={'text-danger'}>{message}</p>
                      )}
                    />
                  </FormGroup>
                  <p
                    className={`text-danger ${visible ? 'd-block' : 'd-none'}`}
                  >
                    Please select valid dates
                  </p>
                  <FormGroup>
                    <Label for="cadences">Cadences</Label>

                    <CadenceList
                      multiselect={true}
                      value={cadenceValue}
                      onChange={(value) => {
                        setCadenceValue(value);
                      }}
                    ></CadenceList>
                  </FormGroup>

                  <FormGroup>
                    <Label for="users">Users</Label>
                    <UserList
                      multiselect={true}
                      value={usersValue}
                      onChange={(value) => {
                        setUsersValue(value);
                      }}
                    ></UserList>
                    <p
                      className={`text-danger ${
                        userValidationError ? 'd-block' : 'd-none'
                      }`}
                    >
                      Please select users
                    </p>
                  </FormGroup>

                  {(isManager === 'Y' || isAdmin === 'Y') && (
                    <FormGroup check>
                      <Input
                        type="checkbox"
                        name="userDisplay"
                        id="user_display"
                        onChange={() => {
                          setUserDisplay(!userDisplay);
                        }}
                        ref={register}
                        checked={userDisplay}
                        className="mt-1"
                      />
                      <Label for="user_display">Display by each user</Label>
                    </FormGroup>
                  )}

                  <div className="mt-2 d-flex align-items-center justify-content-center card-responsive">
                    <ClButton
                      icon="fas fa-check"
                      color="primary"
                      title="Save"
                      onClick={() => {
                        setVisible(false);
                        setUserValidationError(false);
                        let hasError = false;

                        if (
                          isNaN(moment(start).valueOf()) ||
                          isNaN(moment(end).valueOf())
                        ) {
                          hasError = true;
                        }
                        if (moment(start).diff(moment(end)) > 0) {
                          hasError = true;
                          setVisible(true);
                        }
                        if (usersValue.length === 0) {
                          hasError = true;
                          setUserValidationError(true);
                        }
                        if (!hasError) {
                          setSaveReportAction('create');
                          setSaveReportModalTitle('Save Report');
                          setShowSaveReportModal(true);
                        }
                      }}
                      className="text-white text-nowrap text-center mr-2"
                    >
                      Save
                    </ClButton>
                    <ClButton
                      color="success"
                      icon="fas fa-chart-line"
                      title="Run Report"
                      className="text-white text-nowrap text-center btn-secondary border-success"
                    >
                      Run Report
                    </ClButton>
                  </div>
                </Form>
              </CardBody>
              <SaveReportModal
                hideModal={() => {
                  setShowSaveReportModal(false);
                }}
                showModal={showSaveReportModal}
                title={saveReportModalTitle}
                showActionBtnSpinner={showSaveReportSpinner}
                handleSave={handleSaveReportCreateOrEdit}
                reportName={
                  saveReportAction === 'create' ? '' : savedReportSelectedName
                }
                action={saveReportAction}
              />
              <ConfirmModal
                confirmBtnIcon="fas fa-trash"
                confirmBtnText="Delete"
                confirmBtnColor="danger"
                header="Delete Saved Report"
                handleCancel={() => setShowSaveReportDeleteModal(false)}
                handleConfirm={() => {
                  deleteReport({
                    variables: { reportId: savedReportSelectedId },
                  });
                }}
                showConfirmBtnSpinner={deleteSavedReportLoading}
                showConfirmModal={showSaveReportDeleteModal}
              >
                <span>
                  Are you sure you want to delete{' '}
                  <span className="text-break font-italic">
                    {savedReportSelectedName}
                  </span>
                  ?
                </span>
              </ConfirmModal>
            </Card>
          </Col>
        )}

        {/* right side */}
        <Col
          lg={showSearchForm ? 9 : 12}
          className={showSearchForm ? 'pl-0' : ''}
        >
          <Card className="card-default">
            <CardHeader className="bg-white border-bottom">
              <Row>
                <Col xs="3" className="d-flex align-items-center">
                  <span
                    className="pointer"
                    onClick={handleArrowButtonClick}
                    title={showSearchForm ? 'Expand' : 'Collapse'}
                  >
                    {showSearchForm && (
                      <i className="fas fa-chevron-left align-middle mr-2"></i>
                    )}
                    {!showSearchForm && (
                      <i className="fas fa-chevron-right align-middle mr-2"></i>
                    )}
                  </span>
                </Col>

                <Col xs="9">
                  <Row className="justify-content-end">
                    <FormGroup className="mb-0 pt-2">
                      <Label check>
                        <Input
                          type="checkbox"
                          name="expandAll"
                          onChange={(e) => {
                            handleExpandAllClick(e);
                          }}
                          checked={expandAllChecked}
                          className="mt-1"
                        />
                        Expand All
                      </Label>
                    </FormGroup>

                    <FormGroup
                      className={`mb-0 ${
                        savedReportSelectedId === ''
                          ? 'col-lg-5 col-md-6 col-sm-7 col-xs-5'
                          : 'col-lg-7 col-md-7 col-sm-8 col-xs-6'
                      } `}
                    >
                      <InputGroup>
                        <Input
                          id="saved_report"
                          type="select"
                          name="savedReport"
                          onChange={savedReportChangeHandler}
                          invalid={errors.saved_report}
                          innerRef={register}
                        >
                          <option value="">Saved Reports</option>
                          {savedReportsData?.savedReports?.data?.length > 0 &&
                            savedReportsData.savedReports.data.map(
                              (savedReport) => {
                                return (
                                  <option
                                    value={savedReport['id']}
                                    key={savedReport['id']}
                                  >
                                    {savedReport['reportName']}
                                  </option>
                                );
                              }
                            )}
                        </Input>
                        <InputGroupAddon addonType="append">
                          {/* refresh icon is hidden as it is not needed as of now */}
                          {!savedReportsLoading ? (
                            <InputGroupText
                              className="pointer bg-white color-regent-gray d-none"
                              title="Reload"
                              onClick={() => refetchSavedReports()}
                            >
                              <i className="fas fa-sync-alt fa-sm"></i>
                            </InputGroupText>
                          ) : (
                            <InputGroupText className="pointer bg-white color-regent-gray">
                              <i className="fas fa-spinner fa-spin fa-sm"></i>
                            </InputGroupText>
                          )}
                          {!savedReportsLoading &&
                            savedReportSelectedId !== '' && (
                              <InputGroupText
                                className="pointer bg-white color-regent-gray"
                                title="Edit"
                                onClick={() => {
                                  setSaveReportAction('edit');
                                  setSaveReportModalTitle('Edit Report');
                                  setShowSaveReportModal(true);
                                }}
                              >
                                <i className="fas fa-pencil-alt"></i>
                              </InputGroupText>
                            )}
                          {!savedReportsLoading &&
                            savedReportSelectedId !== '' && (
                              <InputGroupText
                                className="pointer bg-white color-regent-gray"
                                title="Delete"
                                onClick={() => {
                                  setShowSaveReportDeleteModal(true);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </InputGroupText>
                            )}
                        </InputGroupAddon>
                      </InputGroup>
                    </FormGroup>
                  </Row>
                </Col>
              </Row>
            </CardHeader>

            <CardBody>
              <ReportSection
                sectionName={'Users'}
                sectionNameTitle={'Users'}
                sectionGridState={users}
                sectionLoading={fetchReportLoading}
                toggleSection={toggleUser}
                toggleChartSection={toggleChartUser}
                chartSection={chartUser}
                chartListSection={chartListUser}
                isOpenSection={isOpenUser}
                sectionBucketState={sectionBucketState}
                iconClass={'fa fa-user fa-sm text-primary'}
                handleRefresh={(
                  key,
                  bucketName,
                  pageOffset,
                  pageLimit,
                  sortColumn,
                  sortDirection
                ) => {
                  handleBucketClick(
                    key,
                    bucketName,
                    pageOffset,
                    pageLimit,
                    sortColumn,
                    sortDirection
                  );
                }}
                handleFetch={handleBucketClick}
              ></ReportSection>

              <ReportSection
                sectionName={'Prospects'}
                sectionNameTitle={'Prospects'}
                sectionGridState={prospects}
                sectionLoading={fetchReportLoading}
                toggleSection={toggleProspect}
                toggleChartSection={togglechartProspect}
                chartSection={chartProspect}
                chartListSection={chartListProspect}
                isOpenSection={isOpenProspects}
                sectionBucketState={sectionBucketState}
                iconClass={'fa fa-address-book fa-sm text-danger'}
                handleRefresh={(
                  key,
                  bucketName,
                  pageOffset,
                  pageLimit,
                  sortColumn,
                  sortDirection
                ) => {
                  handleBucketClick(
                    key,
                    bucketName,
                    pageOffset,
                    pageLimit,
                    sortColumn,
                    sortDirection
                  );
                }}
                handleFetch={handleBucketClick}
              ></ReportSection>

              <ReportSection
                sectionName={'Call'}
                sectionNameTitle={'Call'}
                sectionGridState={calls}
                sectionLoading={fetchReportLoading}
                toggleSection={toggleCall}
                toggleChartSection={toggleChartCall}
                chartSection={chartCall}
                chartListSection={chartListCall}
                isOpenSection={isOpenCall}
                sectionBucketState={sectionBucketState}
                iconClass={'fas fa-phone-alt fa-sm text-call'}
                handleRefresh={(
                  key,
                  bucketName,
                  pageOffset,
                  pageLimit,
                  sortColumn,
                  sortDirection
                ) => {
                  handleBucketClick(
                    key,
                    bucketName,
                    pageOffset,
                    pageLimit,
                    sortColumn,
                    sortDirection
                  );
                }}
                handleFetch={handleBucketClick}
              ></ReportSection>

              <ReportSection
                sectionName={'Email'}
                sectionNameTitle={'Email'}
                sectionGridState={emails}
                sectionLoading={fetchReportLoading}
                toggleSection={toggleEmail}
                toggleChartSection={toggleChartEmail}
                chartSection={chartEmail}
                chartListSection={chartListEmail}
                isOpenSection={isOpenEmail}
                sectionBucketState={sectionBucketState}
                iconClass={'fa fa-envelope fa-sm text-email'}
                handleRefresh={(
                  key,
                  bucketName,
                  pageOffset,
                  pageLimit,
                  sortColumn,
                  sortDirection
                ) => {
                  handleBucketClick(
                    key,
                    bucketName,
                    pageOffset,
                    pageLimit,
                    sortColumn,
                    sortDirection
                  );
                }}
                handleFetch={handleBucketClick}
              ></ReportSection>

              {(fetchReportLoading || touches[0]?.data?.length > 0) && (
                <ReportSection
                  sectionName={'Touch'}
                  sectionNameTitle={'Touch'}
                  sectionGridState={touches}
                  sectionLoading={fetchReportLoading}
                  toggleSection={toggleTouch}
                  toggleChartSection={null}
                  chartSection={false}
                  isOpenSection={isOpenTouch}
                  sectionBucketState={sectionBucketState}
                  iconClass={'fas fa-hand-point-up fa-sm text-icon'}
                  handleRefresh={(
                    key,
                    bucketName,
                    pageOffset,
                    pageLimit,
                    sortColumn,
                    sortDirection
                  ) => {
                    handleBucketClick(
                      key,
                      bucketName,
                      pageOffset,
                      pageLimit,
                      sortColumn,
                      sortDirection
                    );
                  }}
                  handleFetch={handleBucketClick}
                ></ReportSection>
              )}

              {hasZipWhip && (
                <ReportSection
                  sectionName={'Text'}
                  sectionNameTitle={'Text'}
                  sectionGridState={texts}
                  sectionLoading={fetchReportLoading}
                  toggleSection={toggleText}
                  toggleChartSection={toggleChartText}
                  chartSection={chartText}
                  chartListSection={chartListText}
                  isOpenSection={isOpenText}
                  sectionBucketState={sectionBucketState}
                  iconClass={'fas fa-comment-alt fa-sm text-warning'}
                  handleRefresh={(
                    key,
                    bucketName,
                    pageOffset,
                    pageLimit,
                    sortColumn,
                    sortDirection
                  ) => {
                    handleBucketClick(
                      key,
                      bucketName,
                      pageOffset,
                      pageLimit,
                      sortColumn,
                      sortDirection
                    );
                  }}
                  handleFetch={handleBucketClick}
                ></ReportSection>
              )}

              <ReportSection
                sectionName={'Cadences'}
                sectionNameTitle={'Top 10 Cadences'}
                sectionGridState={cadences}
                sectionLoading={fetchReportLoading}
                toggleSection={toggleCadence}
                toggleChartSection={toggleChartCadence}
                chartSection={chartCadence}
                chartListSection={chartListCadence}
                isOpenSection={isOpenCadence}
                sectionBucketState={sectionBucketState}
                iconClass={
                  'svgicon koncert-cadence-icon fa-sm text-color-midnight-express'
                }
                handleRefresh={(
                  key,
                  bucketName,
                  pageOffset,
                  pageLimit,
                  sortColumn,
                  sortDirection
                ) => {
                  handleBucketClick(
                    key,
                    bucketName,
                    pageOffset,
                    pageLimit,
                    sortColumn,
                    sortDirection
                  );
                }}
                handleFetch={handleBucketClick}
              ></ReportSection>

              <ReportSectionTopTemplates
                sectionName={'Templates'}
                sectionNameTitle={'Top 25 Templates'}
                sectionGridData={
                  fetchTopTemplatesData?.fetchTopTemplates?.data || []
                }
                sectionLoading={fetchTopTemplatesLoading}
                sectionError={fetchTopTemplatesError}
                toggleSection={toggleTopTemplates}
                isOpenSection={isOpenTopTemplates}
                iconClass={'fas fa-envelope-open-text fa-sm text-warning'}
              ></ReportSectionTopTemplates>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </ContentWrapper>
  );
};

export default Reports;
