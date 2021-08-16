/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import gql from 'graphql-tag';

const FETCH_TODO_COUNTS_QUERY = gql`
  query($userFilter: String!, $currentTouchStatus: String!) {
    email(userFilter: $userFilter, currentTouchStatus: $currentTouchStatus)
      @rest(
        type: "Prospect"
        path: "prospects/list?page[limit]=1{args.userFilter}&{args.currentTouchStatus}&filter[currentTouchType]=EMAIL&filter[optoutFlag]=false"
        method: "GET"
      ) {
      paging {
        totalCount
      }
    }
    others(userFilter: $userFilter, currentTouchStatus: $currentTouchStatus)
      @rest(
        type: "Prospect"
        path: "prospects/list?page[limit]=1{args.userFilter}&{args.currentTouchStatus}&filter[currentTouchType]=OTHERS"
        method: "GET"
      ) {
      paging {
        totalCount
      }
    }
    text(userFilter: $userFilter, currentTouchStatus: $currentTouchStatus)
      @rest(
        type: "Prospect"
        path: "prospects/list?page[limit]=1{args.userFilter}&{args.currentTouchStatus}&filter[currentTouchType]=TEXT"
        method: "GET"
      ) {
      paging {
        totalCount
      }
    }
    unassigned(userFilter: $userFilter)
      @rest(
        type: "Prospect"
        path: "prospects/list?page[limit]=1{args.userFilter}&filter[status]=unassigned"
        method: "GET"
      ) {
      paging {
        totalCount
      }
    }
    linkedin(userFilter: $userFilter, currentTouchStatus: $currentTouchStatus)
      @rest(
        type: "Prospect"
        path: "prospects/list?page[limit]=1{args.userFilter}&{args.currentTouchStatus}&filter[currentTouchType]=LINKEDIN"
        method: "GET"
      ) {
      paging {
        totalCount
      }
    }
  }
`;

export const FETCH_OVERALL_STATS = gql`
  query($userFilter: String!, $logicalVariable: String!) {
    stats(userFilter: $userFilter, logicalVariable: $logicalVariable)
      @rest(
        type: "OverallStatsToday"
        path: "dashboards/overallstats?selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_OVERALL_STATS_CUSTOM = gql`
  query($userFilter: String!, $startDate: String!, $endDate: String!) {
    stats(userFilter: $userFilter, startDate: $startDate, endDate: $endDate)
      @rest(
        type: "OverallStatsCustom"
        path: "dashboards/overallstats?selectedUserIds={args.userFilter}&startDate={args.startDate}&endDate={args.endDate}&logicalVariable=custom"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    emailUser(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "EmailUser"
        path: "dashboards/activityInfo?reportType=emailUser&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
    callByUser(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "CallByUser"
        path: "dashboards/activityInfo?reportType=callByUser&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
    prospUser(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "ProspUser"
        path: "dashboards/activityInfo?reportType=prospUser&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
    cadence(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "Cadence"
        path: "dashboards/activityInfo?reportType=cadenceAnalytics&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
    textUser(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "TextUser"
        path: "dashboards/activityInfo?reportType=textUser&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_EMAIL_WEEK_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    emailWeek(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "EmailWeek"
        path: "dashboards/activityInfo?reportType=emailWeek&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_EMAIL_DAY_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    emailDay(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "EmailDay"
        path: "dashboards/activityInfo?reportType=emailDay&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_CALL_WEEK_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    callByWeek(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "CallByWeek"
        path: "dashboards/activityInfo?reportType=callByWeek&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_CALL_DAY_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    callByDay(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "CallByDay"
        path: "dashboards/activityInfo?reportType=callByDay&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_TEXT_WEEK_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    textWeek(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "TextWeek"
        path: "dashboards/activityInfo?reportType=textWeek&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_TEXT_DAY_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    textDay(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "TextDay"
        path: "dashboards/activityInfo?reportType=textDay&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_PROSP_WEEK_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    prospWeek(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "ProspWeek"
        path: "dashboards/activityInfo?reportType=prospWeek&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_INFO_PROSP_DAY_DATA = gql`
  query(
    $userFilter: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    prospDay(
      userFilter: $userFilter
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "ProspDay"
        path: "dashboards/activityInfo?reportType=prospDay&selectedUserIds={args.userFilter}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVE_CADENCES = gql`
  query($userId: String!, $currentTouchType: String!) {
    activeCadences(
      userId: $userId
      currentTouchStatus: ":[SCHEDULED,SCHEDULED_WAIT_INETRACTIVE_EMAIL]"
    )
      @rest(
        type: "ActiveCadences"
        path: "dashboards/activeCadence?filter[user][id]={args.userId}&filter[currentTouchStatus]={args.currentTouchStatus}&filter[optoutFlag]=false"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_DIALS_METRICS = gql`
  query($selectedUserIds: String!, $logicalVariable: String!) {
    dials(selectedUserIds: $selectedUserIds, logicalVariable: $logicalVariable)
      @rest(
        type: "Dials"
        path: "dashboards/dialsMetrics?reportType=dials&logicalVariable={args.logicalVariable}&selectedUserIds={args.selectedUserIds}"
        method: "GET"
      ) {
      data
    }
    validConnects(
      selectedUserIds: $selectedUserIds
      logicalVariable: $logicalVariable
    )
      @rest(
        type: "ValidConnects"
        path: "dashboards/dialsMetrics?reportType=validconnects&logicalVariable={args.logicalVariable}&selectedUserIds={args.selectedUserIds}"
        method: "GET"
      ) {
      data
    }
    talkTime(
      selectedUserIds: $selectedUserIds
      logicalVariable: $logicalVariable
    )
      @rest(
        type: "TalkTime"
        path: "dashboards/dialsMetrics?reportType=talktime&logicalVariable={args.logicalVariable}&selectedUserIds={args.selectedUserIds}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_DIALS_METRICS_CUSTOM = gql`
  query(
    $selectedUserIds: String!
    $logicalVariable: String!
    $startDate: String!
    $endDate: String!
  ) {
    dials(
      selectedUserIds: $selectedUserIds
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "Dials"
        path: "dashboards/dialsMetrics?reportType=dials&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}&selectedUserIds={args.selectedUserIds}"
        method: "GET"
      ) {
      data
    }
    validConnects(
      selectedUserIds: $selectedUserIds
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "ValidConnects"
        path: "dashboards/dialsMetrics?reportType=validconnects&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}&selectedUserIds={args.selectedUserIds}"
        method: "GET"
      ) {
      data
    }
    talkTime(
      selectedUserIds: $selectedUserIds
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "TalkTime"
        path: "dashboards/dialsMetrics?reportType=talktime&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}&selectedUserIds={args.selectedUserIds}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ACTIVITY_METRICS = gql`
  query {
    activity
      @rest(
        type: "ActivityMetrics"
        path: "dashboards/activityMetrics"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_FUTURE_TASKS = gql`
  query($selectedUserIds: String!) {
    activity(selectedUserIds: $selectedUserIds)
      @rest(
        type: "FutureTasks"
        path: "dashboards/futureTasks?selectedUserIds={args.selectedUserIds}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_BEST_TIME_OF_DAY_QUERY = gql`
  query($userFilter: String!) {
    bestTime(userFilter: $userFilter)
      @rest(
        type: "BestTime"
        path: "dashboards/bestTimeOfTheDay?{args.userFilter}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const CREATE_DASHBOARD_PARAMS = gql`
  query($input: Object!) {
    dashboardParams(input: $input)
      @rest(
        type: "DashboardParams"
        path: "dashboards/"
        method: "POST"
        input: input
      ) {
      data
    }
  }
`;

export const FETCH_DASHBOARD_PARAMS = gql`
  query {
    dashboardParamsFetch
      @rest(
        type: "DashboardParamsFetch"
        path: "dashboards/dashboradParams"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_TOP_TEMPLATES = gql`
  query($selectedUserIds: String!) {
    fetchTopTemplates(
      selectedUserIds: $selectedUserIds
      logicalVariable: $logicalVariable
    )
      @rest(
        type: "fetchTopTemplates"
        path: "dashboards/top5/template/performance?selectedUserIds={args.selectedUserIds}&logicalVariable={args.logicalVariable}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_TOP_TEMPLATES_CUSTOM = gql`
  query($selectedUserIds: String!) {
    fetchTopTemplates(
      selectedUserIds: $selectedUserIds
      logicalVariable: $logicalVariable
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "fetchTopTemplates"
        path: "dashboards/top5/template/performance?selectedUserIds={args.selectedUserIds}&logicalVariable={args.logicalVariable}&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_TOP_CADENCES = gql`
  query($selectedUserIds: String!) {
    fetchTopCadences(selectedUserIds: $selectedUserIds)
      @rest(
        type: "fetchTopCadences"
        path: "dashboards/top/cadence/engagementScore?selectedUserIds={args.selectedUserIds}&page[limit]=5&page[offset]=0"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_TOP_PROSPECTS = gql`
  query($selectedUserIds: String!) {
    fetchTopProspects(selectedUserIds: $selectedUserIds)
      @rest(
        type: "fetchTopProspects"
        path: "dashboards/top/prospect/engagementScore?selectedUserIds={args.selectedUserIds}&page[limit]=5&page[offset]=0"
        method: "GET"
      ) {
      data
    }
  }
`;

export default FETCH_TODO_COUNTS_QUERY;
