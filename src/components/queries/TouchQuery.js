import gql from 'graphql-tag';

export const FETCH_TOUCHES_QUERY = gql`
  query($includeAssociationsQry: String!, $touchFilter: String) {
    Touches(
      includeAssociationsQry: $includeAssociationsQry
      touchFilter: $touchFilter
    )
      @rest(
        type: "Touch"
        path: "touches?{args.includeAssociationsQry}&page[limit]=500&{args.touchFilter}&sort[stepNo]=asc"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_OUTCOMES_QUERY = gql`
  query($includeAssociationsQry: String!, $touchFilter: String) {
    Touches(
      includeAssociationsQry: $includeAssociationsQry
      touchFilter: $touchFilter
    )
      @rest(
        type: "Touch"
        path: "touches?{args.includeAssociationsQry}&page[limit]=1&{args.touchFilter}&sort[stepNo]=asc"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_TOUCH_QUERY = gql`
  query($touchID: ID!, $includeAssociationsQry: String!) {
    touch(touchID: $touchID, includeAssociationsQry: $includeAssociationsQry)
      @rest(
        type: "touch"
        path: "touches/{args.touchID}?{args.includeAssociationsQry}"
      ) {
      data
      includedAssociations
      workflow
    }
  }
`;

export const DELETE_TOUCH_QUERY = gql`
  query($touchID: ID!) {
    deletetouch(touchID: $touchID)
      @rest(type: "touch", path: "touches/{args.touchID}", method: "DELETE") {
      data
      response
    }
  }
`;

export const CREATE_TOUCH = gql`
  query($input: Object!) {
    touches(input: $input)
      @rest(method: "POST", type: "Touch", path: "touches") {
      data
    }
  }
`;

export const EDIT_TOUCH = gql`
  query($input: Object!) {
    touches(touchID: $touchID, input: $input)
      @rest(method: "PUT", type: "Touch", path: "touches/{args.touchID}") {
      data
    }
  }
`;

export const CLONE_TOUCH = gql`
  query($touchID: ID!) {
    cloneTouch(touchID: $touchID)
      @rest(
        type: "touch"
        path: "touches/{args.touchID}/clone"
        method: "GET"
      ) {
      data
      response
    }
  }
`;

export const FETCH_SCHEDULE_QUERY = gql`
  query($limit: String!, $offset: String!, $userFilter: String!) {
    schedules(limit: $limit, offset: $offset, userFilter: $userFilter)
      @rest(
        type: "Schedule"
        path: "schedules?page[limit]={args.limit}&page[offset]={args.offset}{args.userFilter}&sort[name]=asc"
        input: {}
      ) {
      data
      paging
    }
  }
`;

export const CREATE_OTHER_TOUCH = gql`
  query($input: Object!) {
    touches(input: $input)
      @rest(method: "POST", type: "Touch", path: "touches") {
      data
    }
  }
`;

export const EDIT_OTHER_TOUCH = gql`
  query($input: Object!) {
    touches(touchID: $touchID, input: $input)
      @rest(method: "PUT", type: "Touch", path: "touches/{args.touchID}") {
      data
      response
    }
  }
`;

export const TOUCH_REORDER = gql`
  query($touchID: ID!, $fromStepNo: Int!, $toStepNo: Int!) {
    touches(
      touchID: $touchID
      input: { fromStepNo: $fromStepNo, toStepNo: $toStepNo }
    ) @rest(method: "PUT", type: "Touch", path: "touches/{args.touchID}") {
      data
      response
    }
  }
`;

export const ENABLE_NO_ACTION_CALL_TOUCH = gql`
  query($lookupName: String!) {
    callTouchWorkflow(lookupName: $lookupName)
      @rest(
        method: "GET"
        type: "Touch"
        path: "lookUps?filter[lookupName]={args.lookupName}"
      ) {
      response
      data
    }
  }
`;
export const FETCH_TOUCH_QUERY_BY_FILTER = gql`
  query($touchFilter: String!) {
    touch(touchFilter: $touchFilter)
      @rest(type: "touch", path: "touches?{args.touchFilter}") {
      data
    }
  }
`;
export const FETCH_OUTCOME_ACTIONS = gql`
  query($lookupName: String!) {
    outcomeAction(lookupName: $lookupName)
      @rest(
        method: "GET"
        type: "Touch"
        path: "lookUps?filter[lookupName]={args.lookupName}&filter[activeFlag]=Y"
      ) {
      response
      data
    }
  }
`;

export const FETCH_INCLUDE_OPT_OUT = gql`
  query($lookupName: String!) {
    IncludeOptout(lookupName: $lookupName)
      @rest(
        method: "GET"
        type: "Touch"
        path: "lookUps?filter[lookupName]={args.lookupName}"
      ) {
      response
      data
    }
  }
`;

export default CREATE_TOUCH;
