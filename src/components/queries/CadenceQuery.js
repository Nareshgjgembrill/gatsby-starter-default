import gql from 'graphql-tag';

export const FETCH_CADENCES_COUNT_QUERY = gql`
  query($userFilter: String!) {
    all(userFilter: $userFilter)
      @rest(type: "Cadence", path: "cadences?page[limit]=1&{args.userFilter}") {
      paging {
        totalCount
      }
    }
    active(userFilter: $userFilter)
      @rest(
        type: "Cadence"
        path: "cadences?page[limit]=1&{args.userFilter}&filter[status]=ACTIVE"
      ) {
      paging {
        totalCount
      }
    }
    unassigned(userFilter: $userFilter)
      @rest(
        type: "Cadence"
        path: "cadences?page[limit]=1&{args.userFilter}&filter[status]=NEW"
      ) {
      paging {
        totalCount
      }
    }
    inactive(userFilter: $userFilter)
      @rest(
        type: "Cadence"
        path: "cadences?page[limit]=1&{args.userFilter}&filter[status]=INACTIVE"
      ) {
      paging {
        totalCount
      }
    }
    paused(userFilter: $userFilter)
      @rest(
        type: "Cadence"
        path: "cadences?page[limit]=1&{args.userFilter}&filter[status]=PAUSED"
      ) {
      paging {
        totalCount
      }
    }
  }
`;

export const FETCH_SAMPLE_CADENCES_QUERY = gql`
  query($includeAssociationsQry: String!, $name: String!) {
    cadences(includeAssociationsQry: $includeAssociationsQry, name: $name)
      @rest(type: "Cadence", path: "cadences/sample?filter[name]={args.name}") {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_CADENCES_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $limit: String!
    $offset: String!
    $cadenceFilter: String
  ) {
    cadences(
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
      cadenceFilter: $cadenceFilter
    )
      @rest(
        type: "Cadence"
        path: "cadences?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.cadenceFilter}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_CADENCES_LIST_QUERY = gql`
  query($userFilter: String) {
    cadences(userFilter: $userFilter)
      @rest(
        type: "Cadence"
        path: "cadences?{args.userFilter}&sort[name]=asc"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_CADENCE_QUERY = gql`
  query($id: ID!) {
    cadence(id: $id)
      @rest(
        type: "Cadence"
        path: "cadences/{args.id}?includeAssociations[]=user"
      ) {
      data
      includedAssociations
    }
  }
`;

export const FETCH_METRICS_QUERY = gql`
  query($id: ID!, $userIDs: String, $includeAssociationsQry: String!) {
    cadence(
      id: $id
      userIDs: $userIDs
      includeAssociationsQry: $includeAssociationsQry
    )
      @rest(
        type: "Cadence"
        path: "cadences?{args.includeAssociationsQry}&filter[id]={args.id}&filter[user][id]={args.userIDs}&filter[shared]=true"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_OUTCOMES_QUERY = gql`
  query($limit: String!, $offset: String!, $filter: String) {
    outcomes(limit: $limit, offset: $offset, filter: $filter)
      @rest(
        type: "Outcomes"
        path: "outcomes?page[limit]={args.limit}&page[offset]={args.offset}{args.filter}"
      ) {
      data
    }
  }
`;

export const CREATE_CADENCE = gql`
  query(
    $name: String!
    $description: String!
    $sharedType: String!
    $sharedGroups: [Episode!]
    $sharedUsers: [Episode!]
  ) {
    cadences(
      input: {
        name: $name
        description: $description
        sharedType: $sharedType
        sharedGroups: $sharedGroups
        sharedUsers: $sharedUsers
      }
    ) @rest(method: "POST", type: "Cadence", path: "cadences") {
      data
      response
    }
  }
`;

export const UPDATE_CADENCE = gql`
  query(
    $id: ID!
    $name: String!
    $description: String!
    $sharedType: String!
    $sharedGroups: [Episode!]
    $sharedUsers: [Episode!]
  ) {
    cadences(
      id: $id
      name: $name
      input: {
        name: $name
        description: $description
        sharedType: $sharedType
        sharedGroups: $sharedGroups
        sharedUsers: $sharedUsers
      }
    ) @rest(type: "Cadence", path: "cadences/{args.id}", method: "PUT") {
      response
      data
    }
  }
`;

export const DISABLE_CADENCE_QUERY = gql`
  query($id: ID!, $status: String!) {
    disablecadence(id: $id, input: { status: $status })
      @rest(type: "cadence", path: "cadences/{args.id}", method: "PUT") {
      data
      response
      requestId
    }
  }
`;

export const DELETE_CADENCE_QUERY = gql`
  query($cadenceId: ID!) {
    deletecadence(cadenceId: $cadenceId)
      @rest(
        type: "cadence"
        path: "cadences/{args.cadenceId}"
        method: "DELETE"
      ) {
      data
      response
    }
  }
`;

export const CLONE_CADENCE_QUERY = gql`
  query($cadenceId: ID!, $cloneCadenceName: String!) {
    clonecadence(cadenceId: $cadenceId, input: { name: $cloneCadenceName })
      @rest(
        type: "cadence"
        path: "cadences/{args.cadenceId}/cloneCadence"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const CLONE_SAMPLE_CADENCE_QUERY = gql`
  query($sampleCadenceName: String!, $cloneCadenceName: String!) {
    clonecadence(
      input: {
        sampleCadenceName: $sampleCadenceName
        cloneCadenceName: $cloneCadenceName
      }
    ) @rest(type: "cadence", path: "cadences/sample/clone", method: "PUT") {
      data
      response
    }
  }
`;

export const SET_FAVORITE_CADENCE_QUERY = gql`
  query($cadenceId: ID!, $input: Object!) {
    favoriteCadence(cadenceId: $cadenceId, input: $input)
      @rest(
        type: "cadence"
        path: "cadences/favorite/{args.cadenceId}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const FETCH_USERS_QUERY = gql`
  query($userFilter: String) {
    users(userFilter: $userFilter)
      @rest(type: "Users", path: "users?{args.userFilter}") {
      data
    }
  }
`;
export const FETCH_PROSPECTS_QUERY = gql`
  query(
    $includeAssociationsQry: String!
    $id: ID!
    $limit: String!
    $offset: String!
    $prospectFilter: String
    $tabFilter: String
    $sortBy: String!
    $orderBy: String!
  ) {
    prospects(
      includeAssociationsQry: $includeAssociationsQry
      id: $id
      limit: $limit
      offset: $offset
      prospectFilter: $prospectFilter
      tabFilter: $tabFilter
      sortBy: $sortBy
      orderBy: $orderBy
    )
      @rest(
        type: "Prospect"
        path: "cadences/{args.id}/prospects?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.tabFilter}&sort[{args.sortBy}]={args.orderBy}{args.prospectFilter}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_PROSPECTS_LIST = gql`
  query($prospectFilter: String, $limit: String!, $offset: String!) {
    prospects(prospectFilter: $prospectFilter, limit: $limit, offset: $offset)
      @rest(
        type: "Prospect"
        path: "prospects/list?{args.prospectFilter}&page[limit]={args.limit}&page[offset]={args.offset}&filter[status]=unassigned&sort[contactName]=asc"
      ) {
      data
      paging
    }
  }
`;

export const ASSIGN_PROSPECTS_TO_CADENCE = gql`
  query($cadenceId: ID!, $prospectsList: [Episode!]!, $input: Object) {
    AssignProspectsToCadence(
      cadenceId: $cadenceId
      prospectsList: $prospectsList
      input: $input
    )
      @rest(
        type: "cadence"
        path: "cadences/{args.cadenceId}/assignProspect/{args.prospectsList}"
        method: "PUT"
      ) {
      data
    }
  }
`;

export const FETCH_ASSIGNED_TEAMS_QUERY = gql`
  query($limit: String!, $offset: String!) {
    teams(limit: $limit, offset: $offset)
      @rest(
        type: "Teams"
        path: "reportHierarchies/assignedTeams?page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
    }
  }
`;

export const EMAIL_PREVIEW_PROSPECT = gql`
  query($previewFilter: String!) {
    preview(previewFilter: $previewFilter)
      @rest(type: "Mailings", path: "mailings?{args.previewFilter}") {
      data
    }
  }
`;

export const FETCH_SIGNED_KEY_EXPORT_QUERY = gql`
  query($input: Object!) {
    signedKeyExport(input: $input)
      @rest(type: "SignedKeyReport", path: "sign/cadence", method: "POST") {
      data
    }
  }
`;

export default FETCH_CADENCES_QUERY;
