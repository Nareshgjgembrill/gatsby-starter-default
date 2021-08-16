/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import gql from 'graphql-tag';

export const FETCH_TODO_COUNTS_QUERY = gql`
  query($userId: ID!) {
    prospects(userId: $userId)
      @rest(
        type: "Prospect"
        path: "prospects/count?filter[page]=todo&filter[user][id]={args.userId}"
      ) {
      response
      data
    }
  }
`;

const COMPLETE_TOUCH_QUERY = gql`
  query($prospectId: ID!, $input: Object!) {
    completeTouch(prospectId: $prospectId, input: $input)
      @rest(
        type: "Prospect"
        path: "prospects/:prospectId/completeTouch"
        method: "POST"
      ) {
      response
    }
  }
`;

export const GET_INTERACTIVE_EMAIL = gql`
  query($input: Object!) {
    getEmail(input: $input)
      @rest(type: "Prospect", path: "email/getEmail", method: "POST") {
      data
    }
  }
`;

export const SAVE_OR_SEND_EMAIL_QUERY = gql`
  query($input: Object!) {
    sendorsaveemail(input: $input)
      @rest(type: "Email", path: "email/send", method: "POST") {
      data
    }
  }
`;

export const FETCH_TODO_TOTAL_COUNT_QUERY = gql`
  query($userFilter: Int!, $currentTouchType: String!) {
    total(userFilter: $userFilter, currentTouchType: $currentTouchType)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]=1{args.userFilter}&filter[currentTouchStatus]=SCHEDULED&filter[currentTouchType]={args.currentTouchType}"
      ) {
      paging
    }
  }
`;

export const GET_SEND_ONE_OFF_EMAIL = gql`
  query($prospectId: Int!, $userFilter: String!) {
    getSendOneOffEmail(prospectId: $prospectId, userFilter: $userFilter)
      @rest(
        type: "Prospect"
        path: "email/{args.prospectId}?{args.userFilter}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_TODO_LIST_QUERY = gql`
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
        path: "prospects/list?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.prospectFilter}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export default COMPLETE_TOUCH_QUERY;
