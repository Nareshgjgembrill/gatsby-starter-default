/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { useSelector } from 'react-redux';

import {
  ButtonGroup,
  Col,
  Input,
  InputGroup,
  Label,
  Progress,
  Row,
} from 'reactstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import UserContext from '../../UserContext';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import { ContentWrapper } from '@nextaction/components';
import FETCH_TODO_COUNTS_QUERY, {
  CREATE_DASHBOARD_PARAMS,
  FETCH_ACTIVITY_INFO,
  FETCH_ACTIVITY_INFO_CALL_DAY_DATA,
  FETCH_ACTIVITY_INFO_CALL_WEEK_DATA,
  FETCH_ACTIVITY_INFO_EMAIL_DAY_DATA,
  FETCH_ACTIVITY_INFO_EMAIL_WEEK_DATA,
  FETCH_ACTIVITY_INFO_PROSP_DAY_DATA,
  FETCH_ACTIVITY_INFO_PROSP_WEEK_DATA,
  FETCH_ACTIVITY_INFO_TEXT_DAY_DATA,
  FETCH_ACTIVITY_INFO_TEXT_WEEK_DATA,
  FETCH_ACTIVITY_METRICS,
  FETCH_DASHBOARD_PARAMS,
  FETCH_ACTIVE_CADENCES,
  FETCH_DIALS_METRICS,
  FETCH_DIALS_METRICS_CUSTOM,
  FETCH_FUTURE_TASKS,
  FETCH_OVERALL_STATS,
  FETCH_OVERALL_STATS_CUSTOM,
  FETCH_TOP_TEMPLATES,
  FETCH_TOP_TEMPLATES_CUSTOM,
  FETCH_TOP_CADENCES,
  FETCH_TOP_PROSPECTS,
} from '../../queries/DashBoardQuery';
import { default as Button } from '../../Common/Button';
import { BoxLegendSvg } from '@nivo/legends';
import PageHeader from '../../Common/PageHeader';
import UserList from '../../Common/UserList';
import { notify, showErrorMessage } from '../../../util/index';
import PendingWidgets from './PendingWidgets';
import ActiveCadences from './ActiveCadences';
import DialsMetrics from './DialsMetrics';
import EmailMetrics from './EmailMetrics';
import CallMetrics from './CallMetrics';
import CadenceAnalytics from './CadenceAnalytics';
import TopTemplates from './TopTemplates';
import TopCadences from './TopCadences';
import TopProspects from './TopProspects';
import ProspectsAttempted from './ProspectsAttempted';
import ActivityMetrics from './ActivityMetrics';
import TextMetrics from './TextMetrics';
import FutureTasks from './FutureTasks';
// import BestTimeOfDay from './BestTimeOfDay';

toast.configure();

const Dashboard = React.memo(() => {
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const defaultDashboardWidgets = userLoading ? [] : user.defaultCadenceWidgets;
  // this state is used to 'skip' the api query, on settimeout the skip will become false hence triggering the query
  // for now the delay is disabled for all queries.
  const [apiQueryDelayState, setApiQueryDelayState] = useState({
    set1: {
      skip: false,
      timeout: 0,
    },
    set2: {
      skip: false,
      timeout: 0,
    },
    set3: {
      skip: false,
      timeout: 0,
    },
    set4: {
      skip: false,
      timeout: 0,
    },
    set5: {
      skip: false,
      timeout: 0,
    },
  });
  const [userId, setUserId] = useState([currentUserId]);
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';

  const [dateRange, setDateRange] = useState('Today');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  // activeCadencesTouchType could be: all, call, email, text, social, linkedin
  const [activeCadencesTouchType, setActiveCadencesTouchType] = useState('all');
  // this will hold active cadences data for each touch type
  const [activeCadencesTouchData, setActiveCadencesTouchData] = useState({});
  // this will hold the total no of active cadences, which is used to determine the layout of activecadences and dials metrics
  const [activeCadencesCount, setActiveCadencesCount] = useState(0);
  // if active cadences count is grater than value, different layout is used
  const totalActiveCadencesToChangeLayout = 11;
  const [dialsView, setDialsView] = useState('list');
  const [validConnectsView, setValidConnectsView] = useState('list');
  const [talkTimeView, setTalkTimeView] = useState('list');
  const [paramsStatus, setParamsStatus] = useState(false);
  const [isSelectedAll, setIsSelectedAll] = useState(false);
  const [graphColorFormat, setGraphColorFormat] = useState('multicolor');
  const [callDataType, setCallDataType] = useState('user');
  const [emailDataType, setEmailDataType] = useState('user');
  const [prospDataType, setProspDataType] = useState('user');
  const [textDataType, setTextDataType] = useState('user');
  const [topTemplatesDataType, setTopTemplatesDataType] = useState('metrics');

  const pendingCallsCount = useSelector(
    (state) => state.pendingCallsCount.data
  );

  const { data: configurationsData } = useConfigurations();

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // api queries delay based on apiQueryDelayState
  useEffect(() => {
    Object.keys(apiQueryDelayState).forEach((key) => {
      setTimeout(() => {
        setApiQueryDelayState((prevState) => {
          return {
            ...prevState,
            [key]: {
              ...prevState[key],
              skip: false,
            },
          };
        });
      }, apiQueryDelayState[key]['timeout']);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const graphColor = ['#9452A0', '#79C143', '#2FBDEF', '#293856', '#FBAB44'];
  const graphColorActivity1 = ['#293856', '#2FBDEF', '#79C143', '#9452A0'];
  const graphColorActivity2 = ['#2FBDEF', '#79C143', '#9452A0'];
  const tooltipFormat1 = (input) => (
    <div>
      # {input.id}: {input.value}
    </div>
  );
  const tooltipFormat2 = (input) => (
    <div>
      {input.data.Name} - # {input.id}: {input.value}
    </div>
  );
  const tooltipFormat3 = (input) => (
    <div>
      # {input.id}: {input.data.Week} - {input.value}
    </div>
  );
  const tooltipDialsMetrics = (input) => (
    <div>
      {input.data.UserName} - # {input.id}: {input.value}
    </div>
  );
  const tooltipActivityMetrics = (input) => (
    <div className="ba rounded p2-4 p-1 bg-white">
      <p className="mb-0">
        {input.point.serieId} - {input.point.data.x}:{' '}
        {input.point.data.yStacked}
      </p>
    </div>
  );
  const tooltipTopTemplates = (input) => {
    return (
      <div>
        {input.data.emailTemplateName} - # {input.id}: {input.value}
      </div>
    );
  };
  const tooltipTopCadences = (input) => {
    return (
      <div>
        {input.data.cadenceName} - # {input.id}: {input.value}
      </div>
    );
  };
  const tooltipTopProspects = (input) => {
    return (
      <div>
        {input.data.prospectName} - # {input.id}: {input.value}
      </div>
    );
  };

  // negative y value is needed to put the label on top of the bar
  const labelFormat = (d) => (
    <tspan className="text-bold" style={{ fontSize: '14px' }} y={-9}>
      {d}
    </tspan>
  );
  const labelFormatPercentage = (d) => (
    <tspan className="text-bold" style={{ fontSize: '14px' }} y={-9}>
      {d}%
    </tspan>
  );
  const labelFormatTopCadences = (d) => (
    <tspan className="text-bold" style={{ fontSize: '10px' }} y={-7}>
      {d}
    </tspan>
  );

  const customWidth = {
    width:
      [
        'Today',
        'Yesterday',
        'Current Week',
        'Last Week',
        'Last 7 Days',
      ].indexOf(dateRange) > -1
        ? '186px'
        : [
            'Today',
            'Yesterday',
            'Current Week',
            'Last Week',
            'Last 7 Days',
            'Current Month',
            'Last Month',
            'Last 30 Days',
          ].indexOf(dateRange) > -1
        ? '130px'
        : '63px',
  };

  const theme = {
    axis: {
      domain: {
        line: {
          stroke: '#202020',
          strokeWidth: 0.5,
        },
      },
    },
  };
  const date = new Date();
  const date1 = new Date();
  const date2 = new Date();
  const date3 = new Date();
  const date4 = new Date();
  const date5 = new Date();
  const date6 = new Date();
  const date7 = new Date();
  const futureDate1 = new Date();
  const futureDate2 = new Date();
  const futureDate3 = new Date();
  const futureDate4 = new Date();
  const futureDate5 = new Date();

  const currentDay = date.getDay();
  const dateValidation =
    dateRange === 'custom' && startDate > endDate ? false : true;
  const selectedUsersCountValidation =
    userId && userId.length > 7 ? false : true;

  // Activity metrics date
  switch (currentDay) {
    case 0:
      date1.setDate(date1.getDate() - 6);
      date2.setDate(date2.getDate() - 5);
      date3.setDate(date3.getDate() - 4);
      date4.setDate(date4.getDate() - 3);
      date5.setDate(date5.getDate() - 2);
      date6.setDate(date6.getDate() - 1);
      break;
    case 1:
      date1.setDate(date1.getDate() - 7);
      date2.setDate(date2.getDate() - 6);
      date3.setDate(date3.getDate() - 5);
      date4.setDate(date4.getDate() - 4);
      date5.setDate(date5.getDate() - 3);
      date6.setDate(date6.getDate() - 2);
      date7.setDate(date7.getDate() - 1);
      break;
    case 2:
      date1.setDate(date1.getDate() - 8);
      date2.setDate(date2.getDate() - 7);
      date3.setDate(date3.getDate() - 6);
      date4.setDate(date4.getDate() - 5);
      date5.setDate(date5.getDate() - 4);
      date6.setDate(date6.getDate() - 3);
      date7.setDate(date7.getDate() - 2);
      break;
    case 3:
      date1.setDate(date1.getDate() - 9);
      date2.setDate(date2.getDate() - 8);
      date3.setDate(date3.getDate() - 7);
      date4.setDate(date4.getDate() - 6);
      date5.setDate(date5.getDate() - 5);
      date6.setDate(date6.getDate() - 4);
      date7.setDate(date7.getDate() - 3);
      break;
    case 4:
      date1.setDate(date1.getDate() - 10);
      date2.setDate(date2.getDate() - 9);
      date3.setDate(date3.getDate() - 8);
      date4.setDate(date4.getDate() - 7);
      date5.setDate(date5.getDate() - 6);
      date6.setDate(date6.getDate() - 5);
      date7.setDate(date7.getDate() - 4);
      break;
    case 5:
      date1.setDate(date1.getDate() - 11);
      date2.setDate(date2.getDate() - 10);
      date3.setDate(date3.getDate() - 9);
      date4.setDate(date4.getDate() - 8);
      date5.setDate(date5.getDate() - 7);
      date6.setDate(date6.getDate() - 6);
      date7.setDate(date7.getDate() - 5);
      break;
    case 6:
      date1.setDate(date1.getDate() - 12);
      date2.setDate(date2.getDate() - 11);
      date3.setDate(date3.getDate() - 10);
      date4.setDate(date4.getDate() - 9);
      date5.setDate(date5.getDate() - 8);
      date6.setDate(date6.getDate() - 7);
      date7.setDate(date7.getDate() - 6);
      break;
    default:
      break;
  }

  const weekdates = [
    monthNames[date1.getMonth()] + ' ' + date1.getDate(),
    monthNames[date2.getMonth()] + ' ' + date2.getDate(),
    monthNames[date3.getMonth()] + ' ' + date3.getDate(),
    monthNames[date4.getMonth()] + ' ' + date4.getDate(),
    monthNames[date5.getMonth()] + ' ' + date5.getDate(),
    monthNames[date6.getMonth()] + ' ' + date6.getDate(),
    monthNames[date7.getMonth()] + ' ' + date7.getDate(),
  ];

  // user login Future tasks. setting next 1 week dates excluding weekends based on current day
  switch (currentDay) {
    case 0:
      futureDate1.setDate(futureDate1.getDate() + 1);
      futureDate2.setDate(futureDate2.getDate() + 2);
      futureDate3.setDate(futureDate3.getDate() + 3);
      futureDate4.setDate(futureDate4.getDate() + 4);
      futureDate5.setDate(futureDate5.getDate() + 5);
      break;
    case 1:
      futureDate1.setDate(futureDate1.getDate() + 0);
      futureDate2.setDate(futureDate2.getDate() + 1);
      futureDate3.setDate(futureDate3.getDate() + 2);
      futureDate4.setDate(futureDate4.getDate() + 3);
      futureDate5.setDate(futureDate5.getDate() + 4);
      break;
    case 2:
      futureDate1.setDate(futureDate1.getDate() + 0);
      futureDate2.setDate(futureDate2.getDate() + 1);
      futureDate3.setDate(futureDate3.getDate() + 2);
      futureDate4.setDate(futureDate4.getDate() + 3);
      futureDate5.setDate(futureDate5.getDate() + 6);
      break;
    case 3:
      futureDate1.setDate(futureDate1.getDate() + 0);
      futureDate2.setDate(futureDate2.getDate() + 1);
      futureDate3.setDate(futureDate3.getDate() + 2);
      futureDate4.setDate(futureDate4.getDate() + 5);
      futureDate5.setDate(futureDate5.getDate() + 6);
      break;
    case 4:
      futureDate1.setDate(futureDate1.getDate() + 0);
      futureDate2.setDate(futureDate2.getDate() + 1);
      futureDate3.setDate(futureDate3.getDate() + 4);
      futureDate4.setDate(futureDate4.getDate() + 5);
      futureDate5.setDate(futureDate5.getDate() + 6);
      break;
    case 5:
      futureDate1.setDate(futureDate1.getDate() + 0);
      futureDate2.setDate(futureDate2.getDate() + 3);
      futureDate3.setDate(futureDate3.getDate() + 4);
      futureDate4.setDate(futureDate4.getDate() + 5);
      futureDate5.setDate(futureDate5.getDate() + 6);
      break;
    case 6:
      futureDate1.setDate(futureDate1.getDate() + 2);
      futureDate2.setDate(futureDate2.getDate() + 3);
      futureDate3.setDate(futureDate3.getDate() + 4);
      futureDate4.setDate(futureDate4.getDate() + 5);
      futureDate5.setDate(futureDate5.getDate() + 6);
      break;
    default:
      break;
  }
  // final future week dates
  const futureWeekDates = [
    monthNames[futureDate1.getMonth()] + ' ' + futureDate1.getDate(),
    monthNames[futureDate2.getMonth()] + ' ' + futureDate2.getDate(),
    monthNames[futureDate3.getMonth()] + ' ' + futureDate3.getDate(),
    monthNames[futureDate4.getMonth()] + ' ' + futureDate4.getDate(),
    monthNames[futureDate5.getMonth()] + ' ' + futureDate5.getDate(),
  ];

  const hasZipWhip = configurationsData?.configurations?.data
    ? configurationsData?.configurations?.data[0]?.zipwhip
    : false;

  //To Fetch dashboard params
  const { data: fetchDashboardParamsData } = useQuery(FETCH_DASHBOARD_PARAMS, {
    onCompleted: (data) => handleDashboardParams(data),
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Dashboard preferences.',
        fetchDashboardParamsData,
        'fetch_dashboard_params'
      );
    },
    skip: apiQueryDelayState['set1']['skip'],
  });

  //To fetch ToDo counts
  const {
    data: toDoCountsData,
    loading: toDoCountsLoading,
    error: toDoCountsError,
  } = useQuery(FETCH_TODO_COUNTS_QUERY, {
    variables: {
      userFilter: `&filter[user][id]=${currentUserId}`,
      currentTouchStatus:
        'filter[currentTouchStatus]=:[SCHEDULED,SCHEDULED_WAIT_INETRACTIVE_EMAIL]',
    },
    notifyOnNetworkStatusChange: true,
    skip: paramsStatus === false || apiQueryDelayState['set1']['skip'],
  });

  //To fetch Active Cadences
  const {
    data: fetchActiveCadencesData,
    loading: fetchActiveCadencesLoading,
    error: fetchActiveCadencesError,
  } = useQuery(FETCH_ACTIVE_CADENCES, {
    variables: {
      userId: currentUserId,
    },
    onCompleted: (response) => {
      if (response?.activeCadences?.data) {
        setActiveCadencesCount(
          response?.activeCadences?.data[0]?.cadence?.length
        );
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch active cadences',
        fetchActiveCadencesData,
        'fetch_active_cadences'
      );
    },
    skip: apiQueryDelayState['set1']['skip'],
  });

  // setting active cadences data for each touch on page load
  useEffect(() => {
    const touchTypes = ['all', 'call', 'email', 'text', 'social', 'linkedin'];
    const apiData = fetchActiveCadencesData?.activeCadences?.data
      ? fetchActiveCadencesData?.activeCadences?.data[0]?.cadence
      : undefined;
    if (apiData) {
      // setting data for each touch type
      touchTypes.forEach((_touchType) => {
        const cadences = [];
        // looping over cadences
        apiData.forEach((_cadence, index) => {
          const touches = [];
          let apiTouchType = _touchType.toLowerCase();
          if (_touchType.toLowerCase() === 'social') {
            apiTouchType = 'others';
          }
          _cadence.touch.forEach((_touch) => {
            if (_touch?.type?.toLowerCase() === apiTouchType) {
              touches.push(_touch);
            }
          });
          if (touches.length > 0) {
            cadences.push({
              ..._cadence,
              touch: touches,
            });
          }
        });
        // setting active cadences for the touch type
        setActiveCadencesTouchData((prevState) => {
          return {
            ...prevState,
            [_touchType]: cadences,
          };
        });
      });
      // setting active cadences for the all touch types
      setActiveCadencesTouchData((prevState) => {
        return {
          ...prevState,
          all: apiData,
        };
      });
    }
  }, [fetchActiveCadencesData]);

  //To fetch Dials Metrics
  const {
    data: fetchDialsMetricsData,
    loading: fetchDialsMetricsLoading,
  } = useQuery(FETCH_DIALS_METRICS, {
    variables: {
      selectedUserIds:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
    },
    skip: dateRange === 'custom' || apiQueryDelayState['set5']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Dials Metrics.',
        fetchDialsMetricsData,
        'fetch_dials_metrics'
      );
    },
  });

  //To fetch Dials Metrics for custom date
  const {
    data: fetchDialsMetricsCustomData,
    loading: fetchDialsMetricsCustomLoading,
  } = useQuery(FETCH_DIALS_METRICS_CUSTOM, {
    variables: {
      selectedUserIds:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    skip: dateRange !== 'custom' || apiQueryDelayState['set5']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Dials Metrics.',
        fetchDialsMetricsCustomData,
        'fetch_dials_metrics'
      );
    },
  });

  const dialsMetrics =
    dateRange === 'custom'
      ? fetchDialsMetricsCustomData
      : fetchDialsMetricsData;

  const dialsMetricsLoading =
    dateRange === 'custom'
      ? fetchDialsMetricsCustomLoading
      : fetchDialsMetricsLoading;

  //To fetch Activity Info
  const {
    data: activityInfo,
    loading: activityInfoLoading,
    error: activityInfoError,
  } = useQuery(FETCH_ACTIVITY_INFO, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    skip:
      paramsStatus === false ||
      dateValidation === false ||
      selectedUsersCountValidation === false ||
      apiQueryDelayState['set2']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Activity Info',
        activityInfo,
        'activity_info'
      );
    },
  });

  //To fetch overall stats (excluding custom dates)
  const {
    data: fetchOverallStatsData,
    loading: fetchOverallStatsLoading,
    error: fetchOverallStatsError,
  } = useQuery(FETCH_OVERALL_STATS, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
    },
    skip:
      paramsStatus === false ||
      dateValidation === false ||
      selectedUsersCountValidation === false ||
      dateRange === 'custom' ||
      apiQueryDelayState['set2']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch overall stats',
        fetchOverallStatsData,
        'fetch_overall_stats'
      );
    },
  });

  //To fetch Overall stats for custom date
  const {
    data: fetchOverallStatsCustomData,
    loading: fetchOverallStatsCustomLoading,
    error: fetchOverallStatsCustomError,
  } = useQuery(FETCH_OVERALL_STATS_CUSTOM, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    skip:
      paramsStatus === false ||
      dateValidation === false ||
      selectedUsersCountValidation === false ||
      dateRange !== 'custom' ||
      apiQueryDelayState['set2']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch overall stats for custom date',
        fetchOverallStatsCustomData,
        'fetch_overall_stats_custom'
      );
    },
  });

  // selecting overall stats api data based on date range
  const fetchOverallStatsDataCurrent =
    dateRange === 'custom'
      ? fetchOverallStatsCustomData
      : fetchOverallStatsData;
  const fetchOverallStatsLoadingCurrent =
    dateRange === 'custom'
      ? fetchOverallStatsCustomLoading
      : fetchOverallStatsLoading;
  const fetchOverallStatsErrorCurrent =
    dateRange === 'custom'
      ? fetchOverallStatsCustomError
      : fetchOverallStatsError;

  //To fetch Activity metrics
  const {
    data: activityMetrics,
    loading: activityMetricsLoading,
    error: activityMetricsError,
  } = useQuery(FETCH_ACTIVITY_METRICS, {
    skip:
      (paramsStatus === false && isManagerUser) ||
      apiQueryDelayState['set2']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Activity Metrics',
        activityMetrics,
        'fetch_activity_metrics'
      );
    },
  });

  //To fetch Future Data
  const {
    data: futureTaskData,
    loading: futureTaskLoading,
    error: futureTaskError,
  } = useQuery(FETCH_FUTURE_TASKS, {
    variables: {
      selectedUserIds:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
    },
    skip:
      paramsStatus === false ||
      selectedUsersCountValidation === false ||
      apiQueryDelayState['set4']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Future Tasks',
        futureTaskData,
        'fetch_future_tasks'
      );
    },
  });

  //TO fetch Best time of the day commented to introduce new functionality later.
  // const {
  //   data: bestTimeData,
  //   loading: bestTimeLoading,
  //   error: bestTimeError,
  // } = useQuery(FETCH_BEST_TIME_OF_DAY_QUERY, {
  //   variables: {
  //     userFilter: `filter[user][id]=:[${
  //       userId.length > 0 ? userId : currentUserId
  //     }]`,
  //   },
  //   skip: paramsStatus === false  || apiQueryDelayState['set4']['skip'],
  // });

  // To POST dashboard params
  const [sendDashboardParams, { data: sendDashboardParamsData }] = useLazyQuery(
    CREATE_DASHBOARD_PARAMS,
    {
      variables: {
        input: {
          selectedUserIds: userId.length > 0 ? userId : [currentUserId],
          logicalVariable: dateRange,
          startDate: `${startDate}T05:00:00Z`,
          endDate: `${endDate}T05:00:00Z`,
          chartsColorTheme: graphColorFormat,
          callMetricsChartsGroupBy: callDataType,
          emailMetricsChartsGroupBy: emailDataType,
          prospectMetricsChartsGroupBy: prospDataType,
          textMetricsChartsGroupBy: textDataType,
        },
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to save Dashboard Params',
          sendDashboardParamsData,
          'send_dashboard_params'
        );
      },
    }
  );

  //To fetch email week data
  const [
    fetchEmailWeekData,
    { loading: emailWeekLoading, data: emailWeekData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_EMAIL_WEEK_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Email Week data',
        emailWeekData,
        'fetch_email_week_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch email day data
  const [
    fetchEmailDayData,
    { loading: emailDayLoading, data: emailDayData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_EMAIL_DAY_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Email Day data',
        emailDayData,
        'fetch_email_day_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch call week data
  const [
    fetchCallWeekData,
    { loading: callWeekLoading, data: callWeekData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_CALL_WEEK_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Call Week data',
        callWeekData,
        'fetch_call_week_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch call day data
  const [
    fetchCallDayData,
    { loading: callDayLoading, data: callDayData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_CALL_DAY_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Call Day data',
        callDayData,
        'fetch_call_day_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch text week data
  const [
    fetchTextWeekData,
    { loading: textWeekLoading, data: textWeekData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_TEXT_WEEK_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Text Week data',
        textWeekData,
        'fetch_text_week_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch text day data
  const [
    fetchTextDayData,
    { loading: textDayLoading, data: textDayData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_TEXT_DAY_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Text Day data',
        textDayData,
        'fetch_text_day_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch prosp week data
  const [
    fetchProspWeekData,
    { loading: prospWeekLoading, data: prospWeekData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_PROSP_WEEK_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Prospect Week data',
        prospWeekData,
        'fetch_prospect_week_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch prospect day data
  const [
    fetchProspDayData,
    { loading: prospDayLoading, data: prospDayData },
  ] = useLazyQuery(FETCH_ACTIVITY_INFO_PROSP_DAY_DATA, {
    variables: {
      userFilter:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch Prospect Day data',
        prospDayData,
        'fetch_prospect_day_data'
      );
    },
    skip: apiQueryDelayState['set2']['skip'],
  });

  //To fetch top templates
  const {
    data: fetchTopTemplatesData,
    loading: fetchTopTemplatesLoading,
    error: fetchTopTemplatesError,
  } = useQuery(FETCH_TOP_TEMPLATES, {
    variables: {
      selectedUserIds:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
    },
    skip: dateRange === 'custom' || apiQueryDelayState['set3']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch top templates.',
        fetchTopTemplatesData,
        'fetch_top_templates'
      );
    },
  });

  const {
    data: fetchTopTemplatesDataCustom,
    loading: fetchTopTemplatesLoadingCustom,
    error: fetchTopTemplatesErrorCustom,
  } = useQuery(FETCH_TOP_TEMPLATES_CUSTOM, {
    variables: {
      selectedUserIds:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
      logicalVariable: dateRange,
      startDate: `${startDate}T00:00:00Z`,
      endDate: `${endDate}T05:00:00Z`,
    },
    skip: dateRange !== 'custom' || apiQueryDelayState['set3']['skip'],
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch top templates for custom date.',
        fetchTopTemplatesDataCustom,
        'fetch_top_templates_custom'
      );
    },
  });

  const topTemplatesData =
    dateRange === 'custom'
      ? fetchTopTemplatesDataCustom
      : fetchTopTemplatesData;
  const topTemplatesLoading =
    dateRange === 'custom'
      ? fetchTopTemplatesLoadingCustom
      : fetchTopTemplatesLoading;
  const topTemplatesError =
    dateRange === 'custom'
      ? fetchTopTemplatesErrorCustom
      : fetchTopTemplatesError;

  const topTemplatesMetrics = topTemplatesData?.fetchTopTemplates?.data
    .filter((item) => {
      return (
        item['metrics'].bounced > 0 ||
        item['metrics'].clicked > 0 ||
        item['metrics'].opened > 0 ||
        item['metrics'].Texts > 0
      );
    })
    .map((item) => {
      return {
        emailTemplateName: item['name'],
        ...item['metrics'],
      };
    });

  const topTemplatesPercentage = topTemplatesData?.fetchTopTemplates?.data
    .filter((item) => {
      return (
        item['percentage'].bounced > 0 ||
        item['percentage'].clicked > 0 ||
        item['percentage'].opened > 0 ||
        item['percentage'].Texts > 0
      );
    })
    .map((item) => {
      return {
        emailTemplateName: item['name'],
        ...item['percentage'],
      };
    });

  // To fetch top cadences
  const {
    data: fetchTopCadencesData,
    loading: fetchTopCadencesLoading,
    error: fetchTopCadencesError,
  } = useQuery(FETCH_TOP_CADENCES, {
    variables: {
      selectedUserIds:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch top cadences.',
        fetchTopCadencesData,
        'fetch_top_cadences'
      );
    },
    skip: apiQueryDelayState['set3']['skip'],
  });

  const topCadencesData = fetchTopCadencesData?.fetchTopCadences?.data
    .filter((item) => {
      return (
        item.callEngagementScore > 0 ||
        item.emailEngagementScore > 0 ||
        item.textEngagementScore > 0 ||
        item.linkedinEngagementScore > 0 ||
        item.otherEngagementScore > 0
      );
    })
    .map((item) => {
      return {
        cadenceName: item['cadenceName'],
        Call: item['callEngagementScore'],
        Email: item['emailEngagementScore'],
        Text: item['textEngagementScore'],
        Linkedin: item['linkedinEngagementScore'],
        Social: item['otherEngagementScore'],
      };
    });

  // To fetch top prospects
  const {
    data: fetchTopProspectsData,
    loading: fetchTopProspectsLoading,
    error: fetchTopProspectsError,
  } = useQuery(FETCH_TOP_PROSPECTS, {
    variables: {
      selectedUserIds:
        userId.length > 0 ? userId.toString() : currentUserId.toString(),
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch top prospects.',
        fetchTopProspectsData,
        'fetch_top_prospects'
      );
    },
    skip: apiQueryDelayState['set3']['skip'],
  });

  const topProspectsUniqueProperties = {};
  const topProspectsData = fetchTopProspectsData?.fetchTopProspects?.data
    .filter((item) => {
      // filtering out properties with duplicate prospect names, as it is cousing issues in graph
      let isUnique = false;
      if (!topProspectsUniqueProperties[item.contactName]) {
        topProspectsUniqueProperties[item.contactName] = true;
        isUnique = true;
      }
      return (
        (item.callEngagementScore > 0 ||
          item.emailEngagementScore > 0 ||
          item.textEngagementScore > 0 ||
          item.linkedinEngagementScore > 0 ||
          item.otherEngagementScore > 0) &&
        isUnique
      );
    })
    .map((item) => {
      return {
        prospectName: item['contactName'],
        Call: item['callEngagementScore'],
        Email: item['emailEngagementScore'],
        Text: item['textEngagementScore'],
        Linkedin: item['linkedinEngagementScore'],
        Social: item['otherEngagementScore'],
      };
    });

  const callPositive =
    (fetchOverallStatsDataCurrent?.stats?.data[1]?.positiveConversation &&
      fetchOverallStatsDataCurrent.stats.data[1].positiveConversation) ||
    0;
  const callBadData =
    (fetchOverallStatsDataCurrent?.stats?.data[1]?.badData &&
      fetchOverallStatsDataCurrent.stats.data[1].badData) ||
    0;
  const callOthers =
    (fetchOverallStatsDataCurrent?.stats?.data[1].others &&
      fetchOverallStatsDataCurrent.stats.data[1].others) ||
    0;
  const callPositivePercent =
    (fetchOverallStatsDataCurrent &&
      (callPositive * 100) / (callPositive + callBadData + callOthers)) ||
    0;
  const callBadDataPercent =
    (fetchOverallStatsDataCurrent &&
      (callBadData * 100) / (callPositive + callBadData + callOthers)) ||
    0;
  const callOthersPercent =
    (fetchOverallStatsDataCurrent &&
      (callOthers * 100) / (callPositive + callBadData + callOthers)) ||
    0;

  const totalConnects =
    (fetchOverallStatsDataCurrent && callPositive + callBadData + callOthers) ||
    0;

  const handleDashboardParams = (data) => {
    const res = data?.dashboardParamsFetch?.data
      ? data?.dashboardParamsFetch?.data[0]
      : undefined;
    setDateRange(
      res?.dataRangeLogicalVariable ? res?.dataRangeLogicalVariable : 'Today'
    );
    setStartDate(
      res?.startingDate
        ? moment(res?.startingDate, 'MM/DD/YYYY').format('YYYY-MM-DD')
        : new Date().toISOString().split('T')[0]
    );
    setEndDate(
      res?.endingDate
        ? moment(res?.endingDate, 'MM/DD/YYYY').format('YYYY-MM-DD')
        : new Date().toISOString().split('T')[0]
    );
    setUserId(
      res?.selectedUserIds && !isNaN(parseInt(res?.selectedUserIds))
        ? res?.selectedUserIds.split(',').map((num) => parseInt(num))
        : [currentUserId]
    );
    setGraphColorFormat(
      res?.chartsColorTheme ? res?.chartsColorTheme : 'multicolor'
    );
    setCallDataType(
      res?.callMetricsChartsGroupBy ? res?.callMetricsChartsGroupBy : 'user'
    );
    setEmailDataType(
      res?.emailMetricsChartsGroupBy ? res?.emailMetricsChartsGroupBy : 'user'
    );
    setProspDataType(
      res?.prospectMetricsChartsGroupBy
        ? res?.prospectMetricsChartsGroupBy
        : 'user'
    );
    setTextDataType(
      res?.textMetricsChartsGroupBy ? res?.textMetricsChartsGroupBy : 'user'
    );

    if (res?.callMetricsChartsGroupBy === 'day') {
      fetchCallDayData();
    }
    if (res?.callMetricsChartsGroupBy === 'week') {
      fetchCallWeekData();
    }
    if (res?.emailMetricsChartsGroupBy === 'day') {
      fetchEmailDayData();
    }
    if (res?.emailMetricsChartsGroupBy === 'week') {
      fetchEmailWeekData();
    }
    if (res?.prospectMetricsChartsGroupBy === 'day') {
      fetchProspDayData();
    }
    if (res?.prospectMetricsChartsGroupBy === 'week') {
      fetchProspWeekData();
    }
    if (res?.textMetricsChartsGroupBy === 'day') {
      fetchTextDayData();
    }
    if (res?.textMetricsChartsGroupBy === 'week') {
      fetchTextWeekData();
    }
    setParamsStatus(true);
  };

  const handleSelectedAll = (status) => {
    setTimeout(() => {
      setIsSelectedAll(status);
    }, 1000);
  };

  //To move Future weekend task to next weekday for user login.
  const futureDataNoWeekend =
    (isManagerUser && futureTaskData?.activity?.data) ||
    (!isManagerUser &&
      futureTaskData?.activity?.data.map((item) => {
        if (new Date(item.date).getDay() === 0) {
          const sunToMon = new Date(item.date);
          sunToMon.setDate(sunToMon.getDate() + 1);
          return {
            ...item,
            date: sunToMon,
          };
        } else if (new Date(item.date).getDay() === 6) {
          const satToMon = new Date(item.date);
          satToMon.setDate(satToMon.getDate() + 2);
          return {
            ...item,
            date: satToMon,
          };
        } else {
          return {
            ...item,
          };
        }
      }));

  // To change the Label name for both login and To trim the Name Key for User login
  const futureDataBeforeFilter =
    futureTaskData &&
    futureDataNoWeekend?.map((item) => {
      const month = monthNames[new Date(item.date).getMonth()];
      const date = new Date(item.date).getDate();
      return {
        Name: (isManagerUser && item.name) || month + ' ' + date,
        Email: (item.email && item.email) || 0,
        Call: (item.call && item.call) || 0,
        Social: (item.others && item.others) || 0,
        Texts: (item.text && item.text) || 0,
        LinkedIn: (item.linkedin && item.linkedin) || 0,
      };
    });

  //Sum the same dates object value for User login
  const futureDataSumDuplicate = [];
  !isManagerUser &&
    futureDataBeforeFilter &&
    futureDataBeforeFilter.forEach((item) => {
      const status = futureDataSumDuplicate.find(
        (element) => item.Name === element.Name
      );
      if (status) {
        status.Email = status.Email + item.Email;
        status.Call = status.Call + item.Call;
        status.Social = status.Social + item.Social;
        status.Texts = status.Texts + item.Texts;
        status.LinkedIn = status.LinkedIn + item.LinkedIn;
      } else {
        futureDataSumDuplicate.push(item);
      }
    });

  //To create a User login structure for graphs
  const futureDataFiltered =
    (isManagerUser && futureTaskData && futureDataBeforeFilter) ||
    (futureTaskData && [
      {
        Date: futureWeekDates[0],
        Email: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[0] ? item.Email : defaultValue,
          0
        ),
        Call: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[0] ? item.Call : defaultValue,
          0
        ),
        Social: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[0] ? item.Social : defaultValue,
          0
        ),
        Texts: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[0] ? item.Texts : defaultValue,
          0
        ),
        LinkedIn: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[0] ? item.LinkedIn : defaultValue,
          0
        ),
      },
      {
        Date: futureWeekDates[1],
        Email: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[1] ? item.Email : defaultValue,
          0
        ),
        Call: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[1] ? item.Call : defaultValue,
          0
        ),
        Social: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[1] ? item.Social : defaultValue,
          0
        ),
        Texts: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[1] ? item.Texts : defaultValue,
          0
        ),
        LinkedIn: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[1] ? item.LinkedIn : defaultValue,
          0
        ),
      },
      {
        Date: futureWeekDates[2],
        Email: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[2] ? item.Email : defaultValue,
          0
        ),
        Call: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[2] ? item.Call : defaultValue,
          0
        ),
        Social: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[2] ? item.Social : defaultValue,
          0
        ),
        Texts: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[2] ? item.Texts : defaultValue,
          0
        ),
        LinkedIn: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[2] ? item.LinkedIn : defaultValue,
          0
        ),
      },
      {
        Date: futureWeekDates[3],
        Email: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[3] ? item.Email : defaultValue,
          0
        ),
        Call: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[3] ? item.Call : defaultValue,
          0
        ),
        Social: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[3] ? item.Social : defaultValue,
          0
        ),
        Texts: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[3] ? item.Texts : defaultValue,
          0
        ),
        LinkedIn: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[3] ? item.LinkedIn : defaultValue,
          0
        ),
      },
      {
        Date: futureWeekDates[4],
        Email: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[4] ? item.Email : defaultValue,
          0
        ),
        Call: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[4] ? item.Call : defaultValue,
          0
        ),
        Social: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[4] ? item.Social : defaultValue,
          0
        ),
        Texts: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[4] ? item.Texts : defaultValue,
          0
        ),
        LinkedIn: futureDataSumDuplicate.reduce(
          (defaultValue, item) =>
            item.Name === futureWeekDates[4] ? item.LinkedIn : defaultValue,
          0
        ),
      },
    ]);

  const isFutureDataAllZero =
    futureTaskData &&
    futureDataFiltered?.filter(
      (item) =>
        item.Email !== 0 ||
        item.Call !== 0 ||
        item.Social !== 0 ||
        item.Texts !== 0 ||
        item.LinkedIn !== 0
    );

  //To remove Text value when org or User doesnt have Text license
  (!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
    futureTaskData &&
    futureDataFiltered &&
    futureDataFiltered.map((item) => delete item.Texts);

  const totalEmailsFuture =
    (futureTaskData &&
      futureDataFiltered?.reduce((total, item) => total + item.Email, 0)) ||
    0;
  const totalCallFuture =
    (futureTaskData &&
      futureDataFiltered?.reduce((total, item) => total + item.Call, 0)) ||
    0;
  const totalSocialFuture =
    (futureTaskData &&
      futureDataFiltered?.reduce((total, item) => total + item.Social, 0)) ||
    0;

  //Best time of the day commented to introduce new functionality later
  // const bestTime =
  //   bestTimeData &&
  //   bestTimeData.bestTime.data.map((item) => {
  //     return {
  //       Name: item.name,
  //       Calls: item.Calls,
  //       Connect: item.CallConnect,
  //       Conversations: item.Conversations,
  //     };
  //   });

  // const bestTimeBeforeFilter = bestTime && bestTime;
  // const bestTimeFiltered =
  //   bestTimeBeforeFilter &&
  //   bestTimeBeforeFilter.filter((item) => {
  //     return item.Calls !== 0 || item.Connect !== 0 || item.Conversations !== 0;
  //   });

  const prospWeekBeforeFilter = prospWeekData?.prospWeek?.data.map((item) => {
    return {
      Week:
        item.week && item.week.substring(0, 2) + 'o' + item.week.substring(3),
      Emails: item.emails,
      Calls: item.calls,
      Social: item.other,
      Texts: item.texts,
    };
  });

  const prospWeekFiltered =
    prospWeekBeforeFilter &&
    prospWeekBeforeFilter.filter((item) => {
      return (
        item.Emails !== 0 ||
        item.Calls !== 0 ||
        (item.Texts !== 0 && item.Texts !== undefined) ||
        item.Social !== 0
      );
    });
  (!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
    prospWeekBeforeFilter &&
    prospWeekBeforeFilter.map((item) => delete item.Texts);

  const prospDayBeforeFilter = prospDayData?.prospDay?.data;
  const prospDayFiltered =
    prospDayBeforeFilter &&
    prospDayBeforeFilter
      .filter((item) => {
        return (
          item.emails !== 0 ||
          item.calls !== 0 ||
          item.texts !== 0 ||
          item.other !== 0
        );
      })
      .map((item) => {
        return {
          Day: item.day,
          Emails: item.emails,
          Calls: item.calls,
          Social: item.other,
          Texts: item.texts,
        };
      });
  (!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
    prospDayFiltered &&
    prospDayFiltered.map((item) => delete item.Texts);

  const prospUserBeforeFilter = activityInfo?.prospUser?.data.map((item) => {
    return {
      Name: item.name,
      Emails: item.emails,
      Calls: item.calls,
      Social: item.other,
      Texts: item.texts,
    };
  });
  const prospUserFiltered =
    prospUserBeforeFilter &&
    prospUserBeforeFilter.filter((item) => {
      return (
        item.Emails !== 0 ||
        item.Calls !== 0 ||
        (item.Texts !== 0 && item.Texts !== undefined) ||
        item.Social !== 0
      );
    });
  (!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
    prospUserFiltered &&
    prospUserFiltered.map((item) => delete item.Texts);

  const cadenceBeforeFilter = activityInfo?.cadence?.data;
  const cadenceFiltered =
    cadenceBeforeFilter &&
    cadenceBeforeFilter
      .map((item) => {
        return {
          Name: item.name,
          Emails: item.emails,
          Calls: item.calls,
          Social: item.other,
          Texts: item.texts,
        };
      })
      .filter(
        (item) =>
          item.Emails !== 0 ||
          item.Calls !== 0 ||
          item.Others !== 0 ||
          (item.Texts !== 0 && item.Texts !== undefined)
      );
  (!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
    cadenceFiltered &&
    cadenceFiltered.map((item) => delete item.Texts);

  const callUserBeforeFilter = activityInfo?.callByUser?.data;
  const callUserFiltered =
    callUserBeforeFilter &&
    callUserBeforeFilter
      .filter((item) => {
        return item.calls !== 0 || item.positiveConversation !== 0;
      })
      .map((item) => {
        return {
          Name: item.name,
          Connects: item.calls,
          'Positive Connects': item.positiveConversation,
        };
      });

  const callWeekBeforeFilter = callWeekData?.callByWeek?.data;
  const callWeekFiltered =
    callWeekBeforeFilter &&
    callWeekBeforeFilter
      .filter((item) => {
        return item.calls !== 0 || item.conversations !== 0;
      })
      .map((item) => {
        return {
          Week:
            item.week &&
            item.week.substring(0, 2) + 'o' + item.week.substring(3),
          Connects: item.calls,
          'Positive Connects': item.positiveConversation,
        };
      });

  const callDayBeforeFilter = callDayData?.callByDay?.data;
  const callDayFiltered =
    callDayBeforeFilter &&
    callDayBeforeFilter
      .filter((item) => {
        return item.calls !== 0 || item.conversations !== 0;
      })
      .map((item) => {
        return {
          Day: item.day,
          Connects: item.calls,
          'Positive Connects': item.positiveConversation,
        };
      });

  const emailUserBeforeFilter = activityInfo?.emailUser?.data.map((item) => {
    return {
      Name: item.users,
      Sent: item.sent,
      Opened: item.opened,
      Clicked: item.clicked,
      Replied: item.replied,
    };
  });
  const emailUserFiltered =
    emailUserBeforeFilter &&
    emailUserBeforeFilter.filter((item) => {
      return (
        item.Sent !== 0 ||
        item.Opened !== 0 ||
        item.Clicked !== 0 ||
        item.Replied !== 0
      );
    });

  const emailWeekBeforeFilter = emailWeekData?.emailWeek?.data;
  const emailWeekFiltered =
    emailWeekBeforeFilter &&
    emailWeekBeforeFilter
      .filter((item) => {
        return (
          item.sent !== 0 ||
          item.opened !== 0 ||
          item.clicked !== 0 ||
          item.replied !== 0
        );
      })
      .map((item) => {
        return {
          Week:
            item.week &&
            item.week.substring(0, 2) + 'o' + item.week.substring(3),
          Sent: item.sent,
          Opened: item.opened,
          Clicked: item.clicked,
          Replied: item.replied,
        };
      });

  const emailDayBeforeFilter = emailDayData?.emailDay?.data;
  const emailDayFiltered =
    emailDayBeforeFilter &&
    emailDayBeforeFilter
      .filter((item) => {
        return (
          item.sent !== 0 ||
          item.opened !== 0 ||
          item.clicked !== 0 ||
          item.replied !== 0
        );
      })
      .map((item) => {
        return {
          Week: item.day,
          Sent: item.sent,
          Opened: item.opened,
          Clicked: item.clicked,
          Replied: item.replied,
        };
      });

  const textUserBeforeFilter = activityInfo?.textUser?.data.map((item) => {
    return {
      Name: item.users,
      Sent: item.sent,
      Received: item.received,
    };
  });
  const textUserFiltered =
    textUserBeforeFilter &&
    textUserBeforeFilter.filter((item) => {
      return item.Sent !== 0 || item.Received !== 0;
    });

  const textWeekBeforeFilter = textWeekData?.textWeek?.data;
  const textWeekFiltered =
    textWeekBeforeFilter &&
    textWeekBeforeFilter
      .filter((item) => {
        return item.sent !== 0 || item.replied !== 0;
      })
      .map((item) => {
        return {
          Week:
            item.week &&
            item.week.substring(0, 2) + 'o' + item.week.substring(3),
          Sent: item.sent,
          Received: item.replied,
        };
      });

  const textDayBeforeFilter = textDayData?.textDay?.data;
  const textDayFiltered =
    textDayBeforeFilter &&
    textDayBeforeFilter
      .filter((item) => {
        return item.sent !== 0 || item.received !== 0;
      })
      .map((item) => {
        return {
          Day: item.day,
          Sent: item.sent,
          Received: item.received,
        };
      });

  const activityGraph = activityMetrics?.activity?.data;
  // calculating values for each touch for previous week
  // using reduce as there can be multiple keys with same week day, so we need to get the latest value for the corresponding weekday
  const activityGraphData =
    activityGraph &&
    activityGraph.map((item) => {
      return [
        {
          id: 'LinkedIn',
          data: [
            {
              x: '',
              y: 0,
            },
            {
              x: weekdates[0],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 1
                    ? parseInt(subItem.linkedin)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[1],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 2
                    ? parseInt(subItem.linkedin)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[2],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 3
                    ? parseInt(subItem.linkedin)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[3],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 4
                    ? parseInt(subItem.linkedin)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[4],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 1
                    ? parseInt(subItem.linkedin)
                    : defaultValue;
                }, 0),
            },
          ],
        },
        {
          id: 'Texts',
          data: [
            {
              x: '',
              y: 0,
            },
            {
              x: weekdates[0],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 1
                    ? parseInt(subItem.text)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[1],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 2
                    ? parseInt(subItem.text)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[2],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 3
                    ? parseInt(subItem.text)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[3],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 4
                    ? parseInt(subItem.text)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[4],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 5
                    ? parseInt(subItem.text)
                    : defaultValue;
                }, 0),
            },
          ],
        },
        {
          id: 'Social',
          data: [
            {
              x: '',
              y: 0,
            },
            {
              x: weekdates[0],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 1
                    ? parseInt(subItem.others)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[1],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 2
                    ? parseInt(subItem.others)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[2],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 3
                    ? parseInt(subItem.others)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[3],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 4
                    ? parseInt(subItem.others)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[4],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 5
                    ? parseInt(subItem.others)
                    : defaultValue;
                }, 0),
            },
          ],
        },
        {
          id: 'Calls',
          data: [
            {
              x: '',
              y: 0,
            },
            {
              x: weekdates[0],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 1
                    ? parseInt(subItem.call)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[1],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 2
                    ? parseInt(subItem.call)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[2],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 3
                    ? parseInt(subItem.call)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[3],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 4
                    ? parseInt(subItem.call)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[4],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 5
                    ? parseInt(subItem.call)
                    : defaultValue;
                }, 0),
            },
          ],
        },
        {
          id: 'Email',
          data: [
            {
              x: '',
              y: 0,
            },
            {
              x: weekdates[0],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 1
                    ? parseInt(subItem.email)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[1],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 2
                    ? parseInt(subItem.email)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[2],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 3
                    ? parseInt(subItem.email)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[3],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 4
                    ? parseInt(subItem.email)
                    : defaultValue;
                }, 0),
            },
            {
              x: weekdates[4],
              y:
                item.activityMetrics &&
                item.activityMetrics.reduce((defaultValue, subItem) => {
                  return new Date(subItem.date).getDay() === 5
                    ? parseInt(subItem.email)
                    : defaultValue;
                }, 0),
            },
          ],
        },
      ];
    });

  const activityGraphDataFiltered = activityGraphData && activityGraphData[0];
  const activityGraphDataEmail =
    activityGraphDataFiltered &&
    activityGraphDataFiltered[4].data.filter((item) => parseInt(item.y) !== 0);
  const activityGraphDataCall =
    activityGraphDataFiltered &&
    activityGraphDataFiltered[3].data.filter((item) => parseInt(item.y) !== 0);
  const activityGraphDataOther =
    activityGraphDataFiltered &&
    activityGraphDataFiltered[2].data.filter((item) => parseInt(item.y) !== 0);
  const activityGraphDataText =
    activityGraphDataFiltered &&
    activityGraphDataFiltered[1].data.filter((item) => parseInt(item.y) !== 0);
  const activityGraphDataLinkedin =
    activityGraphDataFiltered &&
    activityGraphDataFiltered[0].data.filter((item) => parseInt(item.y) !== 0);

  // removing text if user doesn't have zipwhip license
  (!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
    activityMetrics &&
    activityGraphDataFiltered.forEach((item, index) => {
      if (item.id === 'Texts') {
        activityGraphDataFiltered.splice(index, 1);
      }
    });

  const dialsManager = dialsMetrics && dialsMetrics;

  !isManagerUser &&
    dialsManager?.dials?.data &&
    dialsManager.dials.data.forEach((item, i) => {
      if (item.userId === currentUserId) {
        dialsManager.dials.data.splice(i, 1);
        dialsManager.dials.data.unshift(item);
      }
    });

  !isManagerUser &&
    dialsManager?.validConnects?.data &&
    dialsManager.validConnects.data.forEach((item, i) => {
      if (item.userId === currentUserId) {
        dialsManager.validConnects.data.splice(i, 1);
        dialsManager.validConnects.data.unshift(item);
      }
    });
  !isManagerUser &&
    dialsManager?.talkTime?.data &&
    dialsManager.talkTime.data.forEach((item, i) => {
      if (item.userId === currentUserId) {
        dialsManager.talkTime.data.splice(i, 1);
        dialsManager.talkTime.data.unshift(item);
      }
    });

  const dialsData = dialsManager?.dials?.data.map((item) => {
    delete item.userId;
    return { UserName: item.userName, Dials: item.dials };
  });
  const validConnectsData = dialsManager?.validConnects?.data.map((item) => {
    delete item.userId;
    return { UserName: item.userName, 'Valid Connects': item.validconnects };
  });
  const talkTimeData = dialsManager?.talkTime?.data.map((item) => {
    delete item.userId;
    return {
      UserName: item.userName,
      'Talk Time': Math.round(item.talktime / 60),
    };
  });

  // to modify the bar chart legends
  const BarLegend = ({ height, legends, width }) =>
    legends.map((legend) => (
      <BoxLegendSvg
        key={JSON.stringify(
          legend.data.map(({ id, index }) => {
            return id + '_' + index;
          })
        )}
        {...legend}
        containerHeight={height}
        containerWidth={width}
      />
    ));

  // returns a list of total value labels for stacked bars
  const totalLabelsClosure = (indexBy, percentage = false) => {
    return ({ bars, yScale }) => {
      // space between top of stacked bars and total label
      const labelMargin = 20;

      return bars.map(({ data: { data, indexValue }, x, width }, i) => {
        // sum of all the bar values in a stacked bar
        const total = Object.keys(data)
          // filter out whatever your indexBy value is
          .filter((key) => key !== indexBy)
          .reduce((a, key) => a + data[key], 0);

        return (
          <g
            transform={`translate(${x}, ${yScale(total) - labelMargin})`}
            key={`${indexValue}-${i}`}
          >
            <text
              className="bar-total-label"
              x={width / 2}
              y={labelMargin / 2}
              textAnchor="middle"
              alignmentBaseline="central"
              style={{
                fill: 'rgb(51, 51, 51)',
              }}
            >
              {total}
              {percentage === true ? '%' : ''}
            </text>
          </g>
        );
      });
    };
  };

  return (
    <ContentWrapper>
      <PageHeader icon="fas fa-home" pageName="Dashboard"></PageHeader>

      {/* Pending Widgets */}
      <PendingWidgets
        user={user}
        hasZipWhip={hasZipWhip}
        defaultDashboardWidgets={defaultDashboardWidgets}
        toDoCountsData={toDoCountsData}
        toDoCountsLoading={toDoCountsLoading}
        toDoCountsError={toDoCountsError}
        pendingCallsCount={pendingCallsCount}
        fetchActiveCadencesData={fetchActiveCadencesData}
        fetchActiveCadencesLoading={
          fetchActiveCadencesLoading || apiQueryDelayState['set1']['skip']
        }
        setActiveCadencesTouchType={setActiveCadencesTouchType}
      />

      {/* Start search filters */}
      <Row className="d-flex align-items-center mb-3 ml-0">
        <InputGroup className="d-flex justify-content-end align-items-center">
          <div className={`d-flex mr-3 ${!dateValidation && 'mb-3'}`}>
            <div>
              {isManagerUser && (
                <UserList
                  value={userId}
                  handleSelectedAll={handleSelectedAll}
                  placeholder="Select user"
                  multiselect={true}
                  disabled={isManagerUser ? false : true}
                  onChange={(value) => {
                    if (value.length <= 7) {
                      setUserId(value);
                      sendDashboardParams();
                    }
                    if (value.length === 0) {
                      setUserId([currentUserId]);
                    }
                    if (value.length > 7) {
                      setUserId([currentUserId]);
                      notify(
                        'Please select upto 7 Users',
                        'error',
                        'select_upto_7_users'
                      );
                    }
                  }}
                ></UserList>
              )}
            </div>
          </div>
          <div className="align-items-center d-flex flex-row justify-content-between">
            <Input
              type="select"
              style={{ minWidth: '160px' }}
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setEmailDataType('user');
                setCallDataType('user');
                setTextDataType('user');
                setProspDataType('user');
                sendDashboardParams();
              }}
              className={`mr-2 text-center ${!dateValidation && 'mb-3'}`}
              title={dateRange}
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Current Week">Current Week</option>
              <option value="Last Week">Last Week</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Current Month">Current Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Current Quarter">Current Quarter</option>
              <option value="Last Quarter">Last Quarter</option>
              <option value="custom">Custom Date</option>
            </Input>
            {dateRange === 'custom' && (
              <>
                <div className="d-flex">
                  <Label
                    for="start_date"
                    className="mb-0 mt-2 ml-2 m0-1"
                    style={{ minWidth: '73px' }}
                  >
                    <span className="h5 small">Start Date</span>
                  </Label>
                  <div className="d-flex flex-column">
                    <Input
                      style={{ height: '38px', width: '160px' }}
                      type="date"
                      name="startDate"
                      id="start_date"
                      value={startDate}
                      title={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        sendDashboardParams();
                      }}
                    />
                    {!dateValidation && (
                      <p className="text-nowrap text-danger ml-n4 mb-0 text-sm">
                        Please enter valid Start & End date
                      </p>
                    )}
                  </div>
                </div>

                <div className="d-flex">
                  <Label
                    for="end_date"
                    className="mb-0 mr-0 mt-2 ml-2"
                    style={{ minWidth: '67px' }}
                  >
                    <span className="h5 small">End Date</span>
                  </Label>
                  <div className="d-flex flex-column">
                    <Input
                      style={{ height: '38px', width: '160px' }}
                      type="date"
                      name="endDate"
                      id="end_date"
                      value={endDate}
                      title={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        sendDashboardParams();
                      }}
                    />
                    {!dateValidation && (
                      <p className="text-nowrap text-danger ml-n4 mb-0 text-sm">
                        Please enter valid Start & End date
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Removed search and clear button in V11.0. In future can be added
              <InputGroupAddon addonType="append">
                <Button
                  color="secondary"
                  onClick={() => {
                    refreshDashboardContent();
                  }}
                >
                  <i className="fa fa-search"></i>
                </Button>
              </InputGroupAddon>
              <InputGroupAddon addonType="append">
                <Button
                  color="secondary"
                  onClick={() => {
                    setUserId([currentUserId]);
                    setDateRange('Today');
                  }}
                >
                  <i className="fa fa-times"></i>
                </Button>
              </InputGroupAddon> */}
          </div>
        </InputGroup>
      </Row>
      {/* End search filters */}

      <Row>
        {/* ACTIVE CADENCES */}
        <ActiveCadences
          hasZipWhip={hasZipWhip}
          activeCadencesTouchType={activeCadencesTouchType}
          setActiveCadencesTouchType={setActiveCadencesTouchType}
          activeCadencesData={
            activeCadencesTouchData[activeCadencesTouchType] || []
          }
          fetchActiveCadencesLoading={
            fetchActiveCadencesLoading || apiQueryDelayState['set1']['skip']
          }
          fetchActiveCadencesError={fetchActiveCadencesError}
          activeCadencesCount={activeCadencesCount}
          totalActiveCadencesToChangeLayout={totalActiveCadencesToChangeLayout}
        />

        <Col>
          {/* Dials Metrics - Dials, Valid Connects, Talk Time */}
          <DialsMetrics
            isManagerUser={isManagerUser}
            dateRange={dateRange}
            dialsView={dialsView}
            setDialsView={setDialsView}
            dialsMetrics={dialsMetrics}
            dialsMetricsLoading={
              dialsMetricsLoading || apiQueryDelayState['set5']['skip']
            }
            dialsData={dialsData}
            validConnectsView={validConnectsView}
            setValidConnectsView={setValidConnectsView}
            validConnectsData={validConnectsData}
            talkTimeView={talkTimeView}
            setTalkTimeView={setTalkTimeView}
            talkTimeData={talkTimeData}
            graphColor={graphColor}
            tooltip={tooltipDialsMetrics}
            theme={theme}
            activeCadencesCount={activeCadencesCount}
            totalActiveCadencesToChangeLayout={
              totalActiveCadencesToChangeLayout
            }
          />
        </Col>
      </Row>

      {/* Start - Overall Stats - email & call - metrics  */}
      <Row>
        <Col className="text-muted mt-1 d-flex justify-content-between">
          <h4 className="align-self-center" style={{ minWidth: '160px' }}>
            <i className="fas fa-chart-bar mr-2"></i>Overall Stats
          </h4>

          <h4>
            <ButtonGroup>
              <Button
                outline
                className={`${
                  graphColorFormat === 'multicolor'
                    ? 'bg-color-primary-shade text-white text-bold'
                    : 'text-dark text-bold'
                }`}
                onClick={() => {
                  setGraphColorFormat('multicolor');
                  sendDashboardParams();
                }}
              >
                Multicolor
              </Button>
              <Button
                outline
                className={`${
                  graphColorFormat === 'standard'
                    ? 'bg-color-primary-shade text-white text-bold'
                    : 'text-dark text-bold'
                }`}
                onClick={() => {
                  setGraphColorFormat('standard');
                  sendDashboardParams();
                }}
              >
                Standard
              </Button>
            </ButtonGroup>
          </h4>
        </Col>
      </Row>
      <hr className="mt-0" />

      {/* EMAIL METRICS */}
      {isManagerUser && (
        <EmailMetrics
          isManagerUser={isManagerUser}
          fetchOverallStatsDataCurrent={fetchOverallStatsDataCurrent}
          fetchOverallStatsLoadingCurrent={
            fetchOverallStatsLoadingCurrent ||
            apiQueryDelayState['set2']['skip']
          }
          fetchOverallStatsErrorCurrent={fetchOverallStatsErrorCurrent}
          activityInfo={activityInfo}
          activityInfoLoading={
            activityInfoLoading || apiQueryDelayState['set2']['skip']
          }
          activityInfoError={activityInfoError}
          emailDataType={emailDataType}
          setEmailDataType={setEmailDataType}
          emailUserFiltered={emailUserFiltered}
          emailUserBeforeFilter={emailUserBeforeFilter}
          emailDayData={emailDayData}
          emailDayFiltered={emailDayFiltered}
          emailDayLoading={
            emailDayLoading || apiQueryDelayState['set2']['skip']
          }
          emailWeekData={emailWeekData}
          emailWeekFiltered={emailWeekFiltered}
          emailWeekLoading={
            emailWeekLoading || apiQueryDelayState['set2']['skip']
          }
          sendDashboardParams={sendDashboardParams}
          dateRange={dateRange}
          dateValidation={dateValidation}
          selectedUsersCountValidation={selectedUsersCountValidation}
          fetchEmailDayData={fetchEmailDayData}
          fetchEmailWeekData={fetchEmailWeekData}
          graphColorFormat={graphColorFormat}
          graphColor={graphColor}
          theme={theme}
          tooltipFormat1={tooltipFormat1}
          tooltipFormat2={tooltipFormat2}
          tooltipFormat3={tooltipFormat3}
          labelFormat={labelFormat}
          isSelectedAll={isSelectedAll}
          customWidth={customWidth}
        />
      )}
      <Row>
        {/* EMAIL METRICS */}
        {!isManagerUser && (
          <EmailMetrics
            isManagerUser={isManagerUser}
            fetchOverallStatsDataCurrent={fetchOverallStatsDataCurrent}
            fetchOverallStatsLoadingCurrent={
              fetchOverallStatsLoadingCurrent ||
              apiQueryDelayState['set2']['skip']
            }
            fetchOverallStatsErrorCurrent={fetchOverallStatsErrorCurrent}
            activityInfo={activityInfo}
            activityInfoLoading={
              activityInfoLoading || apiQueryDelayState['set2']['skip']
            }
            activityInfoError={activityInfoError}
            emailDataType={emailDataType}
            setEmailDataType={setEmailDataType}
            emailUserFiltered={emailUserFiltered}
            emailUserBeforeFilter={emailUserBeforeFilter}
            emailDayData={emailDayData}
            emailDayFiltered={emailDayFiltered}
            emailDayLoading={
              emailDayLoading || apiQueryDelayState['set2']['skip']
            }
            emailWeekData={emailWeekData}
            emailWeekFiltered={emailWeekFiltered}
            emailWeekLoading={
              emailWeekLoading || apiQueryDelayState['set2']['skip']
            }
            sendDashboardParams={sendDashboardParams}
            dateRange={dateRange}
            dateValidation={dateValidation}
            selectedUsersCountValidation={selectedUsersCountValidation}
            fetchEmailDayData={fetchEmailDayData}
            fetchEmailWeekData={fetchEmailWeekData}
            graphColorFormat={graphColorFormat}
            graphColor={graphColor}
            theme={theme}
            tooltipFormat1={tooltipFormat1}
            tooltipFormat2={tooltipFormat2}
            tooltipFormat3={tooltipFormat3}
            labelFormat={labelFormat}
            isSelectedAll={isSelectedAll}
            customWidth={customWidth}
          />
        )}

        {/* CALL METRICS */}
        {!isManagerUser && (
          <CallMetrics
            isManagerUser={isManagerUser}
            fetchOverallStatsDataCurrent={fetchOverallStatsDataCurrent}
            fetchOverallStatsLoadingCurrent={
              fetchOverallStatsLoadingCurrent ||
              apiQueryDelayState['set2']['skip']
            }
            fetchOverallStatsErrorCurrent={fetchOverallStatsErrorCurrent}
            activityInfo={activityInfo}
            activityInfoLoading={
              activityInfoLoading || apiQueryDelayState['set2']['skip']
            }
            activityInfoError={activityInfoError}
            callDataType={callDataType}
            setCallDataType={setCallDataType}
            callUserFiltered={callUserFiltered}
            fetchCallDayData={fetchCallDayData}
            callDayFiltered={callDayFiltered}
            callDayLoading={
              callDayLoading || apiQueryDelayState['set2']['skip']
            }
            fetchCallWeekData={fetchCallWeekData}
            callWeekFiltered={callWeekFiltered}
            callWeekLoading={
              callWeekLoading || apiQueryDelayState['set2']['skip']
            }
            totalConnects={totalConnects}
            callPositive={callPositive}
            callBadData={callBadData}
            callPositivePercent={callPositivePercent}
            callBadDataPercent={callBadDataPercent}
            callOthersPercent={callOthersPercent}
            Progress={Progress}
            sendDashboardParams={sendDashboardParams}
            dateRange={dateRange}
            dateValidation={dateValidation}
            selectedUsersCountValidation={selectedUsersCountValidation}
            graphColorFormat={graphColorFormat}
            graphColor={graphColor}
            theme={theme}
            tooltipFormat1={tooltipFormat1}
            tooltipFormat2={tooltipFormat2}
            tooltipFormat3={tooltipFormat3}
            labelFormat={labelFormat}
            isSelectedAll={isSelectedAll}
            customWidth={customWidth}
          />
        )}
      </Row>
      <br></br>

      {/* CADENCE ANALYTICS */}
      {!isManagerUser && (
        <CadenceAnalytics
          isManagerUser={isManagerUser}
          cadenceFiltered={cadenceFiltered}
          activityInfo={activityInfo}
          activityInfoLoading={
            activityInfoLoading || apiQueryDelayState['set2']['skip']
          }
          activityInfoError={activityInfoError}
          dateRange={dateRange}
          graphColorFormat={graphColorFormat}
          graphColor={graphColor}
          theme={theme}
          tooltip={tooltipFormat2}
          isSelectedAll={isSelectedAll}
          totalLabelsClosure={totalLabelsClosure}
        />
      )}

      {/* ACTIVITY METRICS */}
      {!isManagerUser && (
        <ActivityMetrics
          isManagerUser={isManagerUser}
          user={user}
          hasZipWhip={hasZipWhip}
          activityMetricsLoading={
            activityMetricsLoading || apiQueryDelayState['set2']['skip']
          }
          activityMetricsError={activityMetricsError}
          activityGraph={activityGraph}
          activityGraphData={activityGraphData}
          activityGraphDataEmail={activityGraphDataEmail}
          activityGraphDataCall={activityGraphDataCall}
          activityGraphDataText={activityGraphDataText}
          activityGraphDataOther={activityGraphDataOther}
          activityGraphDataLinkedin={activityGraphDataLinkedin}
          graphColorFormat={graphColorFormat}
          graphColorActivity1={graphColorActivity1}
          graphColorActivity2={graphColorActivity2}
          tooltip={tooltipActivityMetrics}
          labelFormat={labelFormat}
          theme={theme}
        />
      )}

      {/* CALL METRICS */}
      {isManagerUser && (
        <CallMetrics
          isManagerUser={isManagerUser}
          fetchOverallStatsDataCurrent={fetchOverallStatsDataCurrent}
          fetchOverallStatsLoadingCurrent={
            fetchOverallStatsLoadingCurrent ||
            apiQueryDelayState['set2']['skip']
          }
          fetchOverallStatsErrorCurrent={fetchOverallStatsErrorCurrent}
          activityInfo={activityInfo}
          activityInfoLoading={
            activityInfoLoading || apiQueryDelayState['set2']['skip']
          }
          activityInfoError={activityInfoError}
          callDataType={callDataType}
          setCallDataType={setCallDataType}
          callUserFiltered={callUserFiltered}
          fetchCallDayData={fetchCallDayData}
          callDayFiltered={callDayFiltered}
          callDayLoading={callDayLoading || apiQueryDelayState['set2']['skip']}
          fetchCallWeekData={fetchCallWeekData}
          callWeekFiltered={callWeekFiltered}
          callWeekLoading={
            callWeekLoading || apiQueryDelayState['set2']['skip']
          }
          totalConnects={totalConnects}
          callPositive={callPositive}
          callBadData={callBadData}
          callPositivePercent={callPositivePercent}
          callBadDataPercent={callBadDataPercent}
          callOthersPercent={callOthersPercent}
          Progress={Progress}
          sendDashboardParams={sendDashboardParams}
          dateRange={dateRange}
          dateValidation={dateValidation}
          selectedUsersCountValidation={selectedUsersCountValidation}
          graphColorFormat={graphColorFormat}
          graphColor={graphColor}
          theme={theme}
          tooltipFormat1={tooltipFormat1}
          tooltipFormat2={tooltipFormat2}
          tooltipFormat3={tooltipFormat3}
          labelFormat={labelFormat}
          isSelectedAll={isSelectedAll}
          customWidth={customWidth}
        />
      )}
      <br></br>

      {/* TEXT METRICS */}
      {isManagerUser && hasZipWhip && user && user.zipwhipSessionKey && (
        <TextMetrics
          isManagerUser={isManagerUser}
          user={user}
          hasZipWhip={hasZipWhip}
          fetchOverallStatsDataCurrent={fetchOverallStatsDataCurrent}
          fetchOverallStatsLoadingCurrent={
            fetchOverallStatsLoadingCurrent ||
            apiQueryDelayState['set2']['skip']
          }
          fetchOverallStatsErrorCurrent={fetchOverallStatsErrorCurrent}
          activityInfo={activityInfo}
          activityInfoLoading={
            activityInfoLoading || apiQueryDelayState['set2']['skip']
          }
          activityInfoError={activityInfoError}
          textDataType={textDataType}
          setTextDataType={setTextDataType}
          textUserFiltered={textUserFiltered}
          textUserBeforeFilter={textUserBeforeFilter}
          textDayData={textDayData}
          textDayFiltered={textDayFiltered}
          textDayLoading={textDayLoading || apiQueryDelayState['set2']['skip']}
          textWeekData={textWeekData}
          textWeekFiltered={textWeekFiltered}
          textWeekLoading={
            textWeekLoading || apiQueryDelayState['set2']['skip']
          }
          sendDashboardParams={sendDashboardParams}
          dateRange={dateRange}
          dateValidation={dateValidation}
          selectedUsersCountValidation={selectedUsersCountValidation}
          fetchTextDayData={fetchTextDayData}
          fetchTextWeekData={fetchTextWeekData}
          graphColorFormat={graphColorFormat}
          graphColor={graphColor}
          theme={theme}
          tooltipFormat1={tooltipFormat1}
          tooltipFormat2={tooltipFormat2}
          tooltipFormat3={tooltipFormat3}
          labelFormat={labelFormat}
          isSelectedAll={isSelectedAll}
          customWidth={customWidth}
        />
      )}

      <br></br>
      {/* Start Activity Info */}
      {isManagerUser && (
        <>
          <Row>
            <Col sm={4} className="text-muted mt-1">
              <h4>
                <i className="fas fa-info-circle mr-2"></i>Activity Info
              </h4>
            </Col>
          </Row>
          <hr className="mt-0" />
        </>
      )}
      {/* End Activity Info */}

      <Row>
        {/* PROSPECTS ATTEMPTED */}
        {isManagerUser && (
          <ProspectsAttempted
            isManagerUser={isManagerUser}
            prospDataType={prospDataType}
            setProspDataType={setProspDataType}
            prospUserFiltered={prospUserFiltered}
            prospUserBeforeFilter={prospUserBeforeFilter}
            fetchProspDayData={fetchProspDayData}
            prospDayLoading={
              prospDayLoading || apiQueryDelayState['set2']['skip']
            }
            prospDayData={prospDayData}
            prospDayFiltered={prospDayFiltered}
            fetchProspWeekData={fetchProspWeekData}
            prospWeekLoading={
              prospWeekLoading || apiQueryDelayState['set2']['skip']
            }
            prospWeekData={prospWeekData}
            prospWeekFiltered={prospWeekFiltered}
            activityInfo={activityInfo}
            activityInfoLoading={
              activityInfoLoading || apiQueryDelayState['set2']['skip']
            }
            activityInfoError={activityInfoError}
            sendDashboardParams={sendDashboardParams}
            dateValidation={dateValidation}
            selectedUsersCountValidation={selectedUsersCountValidation}
            dateRange={dateRange}
            graphColorFormat={graphColorFormat}
            graphColor={graphColor}
            theme={theme}
            tooltipFormat1={tooltipFormat1}
            tooltipFormat2={tooltipFormat2}
            tooltipFormat3={tooltipFormat3}
            isSelectedAll={isSelectedAll}
            totalLabelsClosure={totalLabelsClosure}
            customWidth={customWidth}
          />
        )}

        {/* CADENCE ANALYTICS */}
        {isManagerUser && (
          <CadenceAnalytics
            isManagerUser={isManagerUser}
            cadenceFiltered={cadenceFiltered}
            activityInfo={activityInfo}
            activityInfoLoading={
              activityInfoLoading || apiQueryDelayState['set2']['skip']
            }
            activityInfoError={activityInfoError}
            dateRange={dateRange}
            graphColorFormat={graphColorFormat}
            graphColor={graphColor}
            theme={theme}
            tooltipFormat2={tooltipFormat2}
            isSelectedAll={isSelectedAll}
            totalLabelsClosure={totalLabelsClosure}
          />
        )}
      </Row>

      {/* TOP TEMPLATES */}
      {isManagerUser && (
        <TopTemplates
          isManagerUser={isManagerUser}
          topTemplatesDataType={topTemplatesDataType}
          setTopTemplatesDataType={setTopTemplatesDataType}
          topTemplatesLoading={
            topTemplatesLoading || apiQueryDelayState['set3']['skip']
          }
          topTemplatesError={topTemplatesError}
          topTemplatesMetrics={topTemplatesMetrics}
          topTemplatesPercentage={topTemplatesPercentage}
          sendDashboardParams={sendDashboardParams}
          graphColorFormat={graphColorFormat}
          graphColor={graphColor}
          theme={theme}
          tooltip={tooltipTopTemplates}
          labelFormat={labelFormat}
          labelFormatPercentage={labelFormatPercentage}
          BarLegend={BarLegend}
        />
      )}

      <Row className="mb-3">
        {/* TOP CADENCES */}
        {isManagerUser && (
          <TopCadences
            isManagerUser={isManagerUser}
            topCadencesLoading={
              fetchTopCadencesLoading || apiQueryDelayState['set3']['skip']
            }
            topCadencesError={fetchTopCadencesError}
            topCadencesData={topCadencesData}
            graphColorFormat={graphColorFormat}
            graphColor={graphColor}
            theme={theme}
            tooltip={tooltipTopCadences}
            labelFormat={labelFormatTopCadences}
            BarLegend={BarLegend}
          />
        )}

        {/* TOP PROSPECTS */}
        {isManagerUser && (
          <TopProspects
            isManagerUser={isManagerUser}
            topProspectsLoading={
              fetchTopProspectsLoading || apiQueryDelayState['set3']['skip']
            }
            topProspectsError={fetchTopProspectsError}
            topProspectsData={topProspectsData}
            graphColorFormat={graphColorFormat}
            graphColor={graphColor}
            theme={theme}
            tooltip={tooltipTopProspects}
            labelFormat={labelFormat}
            BarLegend={BarLegend}
          />
        )}
      </Row>

      {/* FUTURE TASKS */}
      <FutureTasks
        isManagerUser={isManagerUser}
        user={user}
        hasZipWhip={hasZipWhip}
        futureTaskData={futureTaskData}
        futureDataFiltered={futureDataFiltered}
        isFutureDataAllZero={isFutureDataAllZero}
        futureTaskLoading={
          futureTaskLoading || apiQueryDelayState['set4']['skip']
        }
        futureTaskError={futureTaskError}
        futureWeekDates={futureWeekDates}
        totalEmailsFuture={totalEmailsFuture}
        totalCallFuture={totalCallFuture}
        totalSocialFuture={totalSocialFuture}
        graphColorFormat={graphColorFormat}
        graphColor={graphColor}
        theme={theme}
        tooltipFormat1={tooltipFormat1}
        tooltipFormat2={tooltipFormat2}
        labelFormat={labelFormat}
      />

      <br></br>
      {/* Best time of the day */}
      {/* commented as this needs functionality change. This block will be enabled once modified API available */}
      {/* <BestTimeOfDay 

      /> */}
    </ContentWrapper>
  );
});

export default Dashboard;
