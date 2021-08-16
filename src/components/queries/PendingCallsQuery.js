/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import gql from 'graphql-tag';

const FETCH_TOUCHES_QUERY = gql`
  query($touchesFilter: String!) {
    touches(touchesFilter: $touchesFilter)
      @rest(type: "MultiTouchesSteps", path: "touches?{args.touchesFilter}") {
      data
    }
  }
`;

export const SAVE_SNOOZE_QUERY = gql`
  query($taskId: ID!, $input: Object!) {
    snooze(taskId: $taskId, input: $input)
      @rest(
        type: "Snooze"
        path: "prospects/{args.taskId}/snooze"
        method: "PUT"
      ) {
      data
    }
  }
`;

export const EDIT_FOLLOWUP_TASK = gql`
  query(
    $taskId: ID!
    $subject: String!
    $notes: String!
    $followupDate: String!
    $reminder: String!
    $id: ID!
    $fieldsUpdated: String!
  ) {
    editTask(
      taskId: $taskId
      input: {
        subject: $subject
        notes: $notes
        followupDate: $followupDate
        reminder: $reminder
        prospect: { id: $id }
        taskType: "call"
        fieldsUpdated: $fieldsUpdated
      }
    ) @rest(type: "Edit", path: "tasks/{args.taskId}", method: "PUT") {
      data
    }
  }
`;

export const START_POWER_DIALING_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $limit: String!
    $offset: String!
    $prospectFilter: String
  ) {
    prospects(
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
      prospectFilter: $prospectFilter
      input: {}
    )
      @rest(
        type: "Prospect"
        path: "prospects/startPowerDialing?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.prospectFilter}"
        method: "POST"
      ) {
      data
    }
  }
`;

export const GET_LOOKUP_VALUE_QUERY = gql`
  query($lookupsFilter: String!) {
    lookup(lookupsFilter: $lookupsFilter)
      @rest(
        type: "Lookup"
        path: "lookUps?{args.lookupsFilter}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_PENDING_CALL_TOTAL_COUNT_QUERY = gql`
  query($userFilter: Int!) {
    total(userFilter: $userFilter)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]=1{args.userFilter}&filter[currentTouchStatus]=SCHEDULED&filter[currentTouchType]=CALL"
      ) {
      paging
    }
  }
`;

export const FETCH_PENDINGCALL_CADENCES_AND_TOUCHES_QUERY = gql`
  query($prospectFilter: String) {
    cadencesAndTouches(prospectFilter: $prospectFilter)
      @rest(
        type: "Prospect"
        path: "calls/prospects/cadences?{args.prospectFilter}"
      ) {
      data
    }
  }
`;

export const FETCH_PENDING_CALLS_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $limit: String!
    $offset: String!
    $prospectFilter: String
  ) {
    prospects(
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
      prospectFilter: $prospectFilter
    )
      @rest(
        type: "Prospect"
        path: "calls/prospects?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.prospectFilter}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export default FETCH_TOUCHES_QUERY;
