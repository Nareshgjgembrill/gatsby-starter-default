/**
 * @author  @vikrant-gembrill
 * */
import gql from 'graphql-tag';

export const FETCH_NOTIFICATIONS_SETTINGS_QUERY = gql`
  query($userFilter: String!) {
    allNotifications(userFilter: $userFilter)
      @rest(
        type: "Notifications"
        path: "notificationSettings{args.userFilter}&page[limit]=500"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const CREATE_NOTIFICATIONS_SETTINGS_QUERY = gql`
  query {
    allNotifications(input: $input)
      @rest(
        type: "allNotifications"
        path: "notificationSettings"
        method: "POST"
      ) {
      response
    }
  }
`;

export const FETCH_NOTIFICATIONS_COUNT = gql`
  query {
    total
      @rest(
        type: "total"
        path: "notifications?filter[unreadStatus]=false&page[limit]=1"
        method: "GET"
      ) {
      paging
    }
  }
`;

export const FETCH_NOTIFICATIONS = gql`
  query(
    $limit: String!
    $offset: String!
    $notificationDayFilter: String!
    $notificationOutcomeFilter: String!
  ) {
    notifications(
      limit: $limit
      offset: $offset
      notificationDayFilter: $notificationDayFilter
      notificationOutcomeFilter: $notificationOutcomeFilter
    )
      @rest(
        type: "notifications"
        path: "notifications?includeAssociations[]=prospect&includeAssociations[]=cadence&includeAssociations[]=emailTemplate&sort[createdDate]=desc&page[limit]={args.limit}&page[offset]={args.offset}&{args.notificationDayFilter}&{args.notificationOutcomeFilter}"
        method: "GET"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_UNREAD_NOTIFICATIONS = gql`
  query(
    $limit: String!
    $offset: String!
    $unreadStatus: String!
    $notificationOutcomeFilter: String!
  ) {
    notifications(
      limit: $limit
      offset: $offset
      unreadStatus: $unreadStatus
      notificationOutcomeFilter: $notificationOutcomeFilter
    )
      @rest(
        type: "notifications"
        path: "notifications?includeAssociations[]=prospect&includeAssociations[]=cadence&includeAssociations[]=emailTemplate&sort[createdDate]=desc&page[limit]={args.limit}&page[offset]={args.offset}&filter[unreadStatus]={args.unreadStatus}&{args.notificationOutcomeFilter}"
        method: "GET"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const MARK_AS_READ_NOTIFICATIONS = gql`
  query($id: ID!) {
    notifications(id: $id, input: $input)
      @rest(
        type: "notifications"
        path: "notifications/{args.id}"
        method: "PUT"
      ) {
      response
      data
    }
  }
`;

export const MARK_AS_READ_ALL_NOTIFICATIONS = gql`
  query(
    $limit: String!
    $offset: String!
    $notificationDayFilter: String!
    $notificationOutcomeFilter: String!
  ) {
    notifications(
      limit: $limit
      offset: $offset
      notificationDayFilter: $notificationDayFilter
      notificationOutcomeFilter: $notificationOutcomeFilter
      input: $input
    )
      @rest(
        type: "notifications"
        path: "notifications/markAllAsRead?filter[unreadStatus]=false&page[limit]={args.limit}&page[offset]={args.offset}&{args.notificationDayFilter}&{args.notificationOutcomeFilter}"
        method: "PUT"
      ) {
      response
      data
    }
  }
`;

export const FETCH_BANNER_NOTIFICATIONS = gql`
  query($userId: String!, $module: String!) {
    notifications(userId: $userId, modules: $modules)
      @rest(
        type: "notifications"
        path: "bannerNotifications?filter[user][id]={args.userId}&filter[isActive]=true&{args.modules}"
        method: "GET"
      ) {
      response
      data
    }
  }
`;

export const CANCEL_BANNER_NOTIFICATION = gql`
  query($bannerId: String!) {
    notifications(bannerId: $bannerId, input: $input)
      @rest(
        type: "notifications"
        path: "bannerNotifications/{args.bannerId}"
        method: "PUT"
      ) {
      response
      data
    }
  }
`;
