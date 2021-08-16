import gql from 'graphql-tag';

const FETCH_ACCOUNTS_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $limit: String!
    $offset: String!
    $accountFilter: String
  ) {
    accounts(
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
      accountFilter: $accountFilter
    )
      @rest(
        type: "Account"
        path: "accounts?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.accountFilter}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const DELETE_ACCOUNTS_TAG_QUERY = gql`
  query($tagids: ID!, $id: ID!) {
    accounts(tagids: $tagids, id: $id)
      @rest(
        type: "Tag"
        path: "accounts/{args.id}/{args.tagids}"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const FETCH_ACCOUNT_CADENCES_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $id: ID!
    $accountCadencesFilter: String
    $limit: String!
    $offset: String!
  ) {
    accounts(
      includeAssociationsQry: $includeAssociationsQry
      id: $id
      accountCadencesFilter: $accountCadencesFilter
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Cadence"
        path: "accounts/{args.id}/cadences?{args.includeAssociationsQry}{args.accountCadencesFilter}&page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_ACCOUNTS_CADENCES_COUNT_QUERY = gql`
  query($accountId: ID!, $userFilter: String!) {
    total(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "cadence"
        path: "accounts/{args.accountId}/cadences?page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    active(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "cadence"
        path: "accounts/{args.accountId}/cadences?page[limit]=1&page[offset]=0&filter[status]=ACTIVE&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    inactive(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "cadence"
        path: "accounts/{args.accountId}/cadences?page[limit]=1&page[offset]=0&filter[status]=INACTIVE&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    paused(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "cadence"
        path: "accounts/{args.accountId}/cadences?page[limit]=1&page[offset]=0&filter[status]=PAUSED&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
  }
`;

export const FETCH_ACCOUNT_TASKS_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $userFilter: String
    $id: ID!
    $limit: String!
    $offset: String
  ) {
    accounts(
      includeAssociationsQry: $includeAssociationsQry
      userFilter: $userFilter
      id: $id
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Task"
        path: "accounts/{args.id}/prospects?filter[touchType]=pending&{args.userFilter}&{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_ACCOUNTS_TASKS_COUNT_QUERY = gql`
  query($accountId: ID!, $userFilter: String!) {
    total(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "task"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=pending&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    pendingCall(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "task"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=pending&filter[outCome]=calls&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    pendingEmail(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "task"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=pending&filter[outCome]=email&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    pendingText(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "task"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=pending&filter[outCome]=text&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    wait(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "task"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=pending&filter[outCome]=wait&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
  }
`;

export const FETCH_ACCOUNT_ACTIVITIES_QUERY = gql`
  query(
    $accountId: String!
    $allActivitiesLimit: String!
    $allActivitiesOffset: String!
    $filter: String!
    $sort: String!
  ) {
    activities(
      accountId: $accountId
      allActivitiesLimit: $allActivitiesLimit
      allActivitiesOffset: $allActivitiesOffset
      filter: $filter
      sort: $sort
    )
      @rest(
        type: "Activity"
        path: "accounts/{args.accountId}/activities?{args.filter}&page[offset]={args.allActivitiesOffset}{args.sort}"
      ) {
      data
      paging {
        totalCount
      }
    }
  }
`;

export const FETCH_ACCOUNTS_TEMPLATES_QUERY = gql`
  query($accountId: ID!, $userFilter: String!) {
    templates(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "template"
        path: "accounts/{args.accountId}/templates?{args.userFilter}"
      ) {
      data
    }
  }
`;

export const FETCH_ACCOUNTS_PROSPECTS_QUERY = gql`
  query(
    $accountId: ID!
    $limit: String!
    $offset: String!
    $prospectFilter: String!
    $includeAssociationsQry: String!
  ) {
    prospect(
      accountId: $accountId
      limit: $limit
      offset: $offset
      prospectFilter: $prospectFilter
      includeAssociationsQry: $includeAssociationsQry
    )
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/prospects?page[limit]={args.limit}&page[offset]={args.offset}&{args.prospectFilter}&{args.includeAssociationsQry}"
      ) {
      data
      paging
      includedAssociations
    }
  }
`;

export const FETCH_ACCOUNTS_PROSPECTS_COUNT_QUERY = gql`
  query($accountId: ID!, $userFilter: String!) {
    total(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/prospects?page[limit]=5&page[offset]=0&{args.userFilter}&sort[contactName]=asc"
      ) {
      data
      paging {
        totalCount
      }
    }
    assigned(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=assigned&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    unassigned(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=unassigned&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    paused(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=paused&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
    completed(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=completed&page[limit]=5&page[offset]=0&{args.userFilter}"
      ) {
      data
      paging {
        totalCount
      }
    }
    pending(accountId: $accountId, userFilter: $userFilter)
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/prospects?filter[touchType]=pending&page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
  }
`;

export const FETCH_ACCOUNT_QUERY = gql`
  query($id: ID!, $includeAssociationsQry: String!, $currentUserId: String!) {
    account(
      id: $id
      includeAssociationsQry: $includeAssociationsQry
      currentUserId: $currentUserId
    )
      @rest(
        type: "Account"
        path: "accounts/{args.id}?{args.includeAssociationsQry}&filter[user][id]={args.currentUserId}"
      ) {
      data
      includedAssociations
    }
  }
`;

export const FETCH_OUTCOMES_COUNT_QUERY = gql`
  query($id: ID!, $userFilter: String!) {
    outcomes(id: $id, userFilter: $userFilter)
      @rest(
        type: "Outcome"
        path: "accounts/{args.id}/touchOutcomesCount?{args.userFilter}"
      ) {
      data
      paging
    }
  }
`;
export const FETCH_OUTCOME_PROSPECTS_QUERY = gql`
  query(
    $id: ID!
    $outcome: String!
    $accountOutcomeFilter: String!
    $limit: String!
    $offset: String!
    $outcomeQuerySort: String!
  ) {
    prospects(
      id: $id
      outcome: $outcome
      accountOutcomeFilter: $accountOutcomeFilter
      limit: $limit
      offset: $offset
      outcomeQuerySort: $outcomeQuerySort
    )
      @rest(
        type: "Outcome"
        path: "accounts/{args.id}/touchOutcome?includeAssociations[]=cadence&{args.accountOutcomeFilter}&{args.outcomeQuerySort}&filter[outCome]={args.outcome}&page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;
export const CREATE_ACCOUNT_QUERY = gql`
  query($input: Object!) {
    accounts(input: $input)
      @rest(type: "Accounts", path: "accounts", method: "POST") {
      response
      data
    }
  }
`;

export const FETCH_ACCOUNT_OVERVIEW_PROSPECTS_QUERY = gql`
  query($accountId: String!, $filter: String!, $sort: String!) {
    prospects(accountId: $accountId, filter: $filter, sort: $sort)
      @rest(
        type: "prospect"
        path: "accounts/{args.accountId}/activities?{args.filter}&page[offset]=0&{args.sort}"
      ) {
      data
    }
  }
`;

export const FETCH_ACCOUNT_OVERVIEW_CADENCES_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $id: ID!
    $accountCadencesFilter: String
  ) {
    accounts(
      includeAssociationsQry: $includeAssociationsQry
      id: $id
      accountCadencesFilter: $accountCadencesFilter
      limit: $limit
      offset: $offset
    )
      @rest(
        type: "Cadence"
        path: "accounts/{args.id}/cadences?{args.includeAssociationsQry}{args.accountCadencesFilter}&sort[name]=asc&filter[status]=ACTIVE&page[limit]=5&page[offset]=0"
      ) {
      data
      includedAssociations
    }
  }
`;

export const FETCH_ACCOUNT_CALL_ACTIVITIES_QUERY = gql`
  query($accountId: String!, $filter: String!, $sort: String!) {
    activities(accountId: $accountId, filter: $filter, sort: $sort)
      @rest(
        type: "Activity"
        path: "accounts/{args.accountId}/activities?{args.filter}&page[offset]=0&filter[touchType]=call{args.sort}"
      ) {
      data
      paging {
        totalCount
      }
    }
  }
`;
export const FETCH_ACCOUNT_TEXT_ACTIVITIES_QUERY = gql`
  query($accountId: String!, $filter: String!, $sort: String!) {
    activities(accountId: $accountId, filter: $filter, sort: $sort)
      @rest(
        type: "Activity"
        path: "accounts/{args.accountId}/activities?{args.filter}&page[offset]=0&filter[touchType]=text{args.sort}"
      ) {
      data
      paging {
        totalCount
      }
    }
  }
`;

export default FETCH_ACCOUNTS_QUERY;
