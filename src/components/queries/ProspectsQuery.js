/**
 * @author Anbarasanr
 * @version V11.0
 */
import gql from 'graphql-tag';

export const FETCH_PROSPECTS_COUNT_QUERY = gql`
  query($userId: ID!) {
    prospects(userId: $userId)
      @rest(
        type: "Prospect"
        path: "prospects/count?filter[user][id]={args.userId}"
      ) {
      response
      data
    }
  }
`;

const FETCH_PROSPECTS_QUERY = gql`
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

export const FETCH_PROSPECT_QUERY = gql`
  query($id: ID!, $includeAssociationsQry: String!, $currentUserId: String!) {
    prospect(
      id: $id
      includeAssociationsQry: $includeAssociationsQry
      currentUserId: $currentUserId
    )
      @rest(
        type: "Prospect"
        path: "prospects/list/{args.id}?{args.includeAssociationsQry}&filter[user][id]={args.currentUserId}"
      ) {
      data
      includedAssociations
    }
  }
`;
export const DELETE_PROSPECTS_QUERY = gql`
  query($prospectId: ID!, $currentUserId: currentUserId) {
    deleteProspect(prospectId: $prospectId, currentUserId: $currentUserId)
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}?filter[user][id]={args.currentUserId}"
        method: "DELETE"
      ) {
      response
      data
    }
  }
`;
export const EXIT_PAUSE_RESUME_PROSPECT_QUERY = gql`
  query($prospectId: ID!, $action: String!, $input: Object!) {
    prospect(prospectId: $prospectId, action: $action, input: $input)
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}/{args.action}"
        method: "PUT"
      ) {
      response
      data
      requestId
    }
  }
`;

export const ASSIGN_OR_MOVE_PROSPECT_TO_CADENCE_QUERY = gql`
  query(
    $prospectId: ID!
    $action: String!
    $cadenceId: String!
    $input: Object
  ) {
    assignOrMoveProspect(
      prospectId: $prospectId
      action: $action
      cadenceId: $cadenceId
      input: $input
    )
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}/{args.action}/{args.cadenceId}"
        method: "PUT"
      ) {
      data
      response
      requestId
    }
  }
`;

export const TAG_PROSPECT_QUERY = gql`
  query($prospectId: ID!, $tagName: String!, $input: Object!) {
    tagProspect(prospectId: $prospectId, tagName: $tagName, input: $input)
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}/tags"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const CREATE_PROSPECT_QUERY = gql`
  query {
    prospect(input: $input)
      @rest(type: "Prospect", path: "prospects", method: "POST") {
      response
    }
  }
`;
export const FETCH_TODO_COUNT_QUERY = gql`
  query($userFilter: Int!, $currentTouchType: String!) {
    all(userFilter: $userFilter, currentTouchType: $currentTouchType)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]=1{args.userFilter}&filter[currentTouchStatus]=SCHEDULED&filter[currentTouchType]={args.currentTouchType}"
      ) {
      paging
    }
    email(userFilter: $userFilter)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]=1{args.userFilter}&filter[currentTouchStatus]=SCHEDULED&filter[currentTouchType]=EMAIL"
      ) {
      paging
    }
    others(userFilter: $userFilter)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]=1{args.userFilter}&filter[currentTouchStatus]=SCHEDULED&filter[currentTouchType]=OTHERS"
      ) {
      paging
    }
    linkedin(userFilter: $userFilter)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]=1{args.userFilter}&filter[currentTouchStatus]=SCHEDULED&filter[currentTouchType]=LINKEDIN"
      ) {
      paging
    }
    text(userFilter: $userFilter)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]=1{args.userFilter}&filter[currentTouchStatus]=SCHEDULED&filter[currentTouchType]=TEXT"
      ) {
      paging
    }
  }
`;
export const UPDATE_PROSPECT_QUERY = gql`
  query($prospectId: ID!, $input: Object!) {
    prospect(prospectId: $prospectId, input: $input)
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}"
        method: "PUT"
      ) {
      response
    }
  }
`;

export const FETCH_SIGNED_KEY_EXPORT_QUERY = gql`
  query($input: Object!) {
    signedKeyExport(input: $input)
      @rest(type: "SignedKeyReport", path: "sign/prospect", method: "POST") {
      data
    }
  }
`;

export const FETCH_PROSPECT_QUERY_IDS = gql`
  query(
    $includeAssociationsQry: String!
    $limit: String!
    $offset: String!
    $ids: ID!
  ) {
    prospect(
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
      ids: $ids
    )
      @rest(
        type: "Prospect"
        path: "prospects?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}&filter[id]={args.ids}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const COMPLETE_TOUCH_QUERY = gql`
  query($prospectId: ID!, $input: Object!) {
    completeTouch(prospectId: $prospectId, input: $input)
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}/completeTouch"
        method: "POST"
      ) {
      response
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/camelcase
export const GET_All_USE_LIST_MAPPING = gql`
  query($limit: String!, $offset: String!, $currentUserId: String!) {
    listMappings(limit: $limit, offset: $offset, currentUserId: $currentUserId)
      @rest(
        type: "ListMapping"
        path: "userListMappings?page[limit]={args.limit}&page[offset]={args.offset}&filter[user][id]={args.currentUserId}&sort[name]=asc"
      ) {
      data
      includeAssociations
    }
  }
`;
export const GET_USE_LIST_MAPPING = gql`
  query($mappingId: ID!) {
    listMappings(mappingId: $mappingId)
      @rest(
        type: "ListMapping"
        path: "userListMappings/{args.mappingId}?includeAssociations[]=userListFieldMappings"
      ) {
      data
      includeAssociation
    }
  }
`;
export const CREATE_LIST_MAPPING = gql`
  query($input: Object!) {
    listMappings(input: $input)
      @rest(type: "ListMapping", path: "userListMappings", method: "POST") {
      response
    }
  }
`;

export const DELETE_LIST_MAPPING = gql`
  query($mappingId: ID!) {
    listMappings(mappingId: $mappingId)
      @rest(
        type: "ListMapping"
        path: "userListMappings/:mappingId"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const CSV_IMPORT = gql`
  query($input: Object!) {
    imports(input: $input)
      @rest(type: "Imports", path: "imports", method: "POST") {
      response
      data
    }
  }
`;

export const FETCH_PENDING_CALLS_COUNT = gql`
  query($limit: String!, $offset: String!, $prospectFilter: String) {
    prospects(limit: $limit, offset: $offset, prospectFilter: $prospectFilter)
      @rest(
        type: "Prospect"
        path: "prospects?page[limit]={args.limit}&page[offset]={args.offset}{args.prospectFilter}"
      ) {
      paging
    }
  }
`;

export const GET_ALL_FILTER_CRITERIAS = gql`
  query($limit: String!, $offset: String!, $currentUserId: String!) {
    filters(limit: $limit, offset: $offset, currentUserId: $currentUserId)
      @rest(
        type: "Filters"
        path: "filterCriterias?page[limit]={args.limit}&page[offset]={args.offset}&sort[name]=asc&filter[user][id]={args.currentUserId}"
      ) {
      data
      includedAssociations
    }
  }
`;

export const GET_FILTER_CRITERIAS = gql`
  query($filterId: ID!, $currentUserId: String!) {
    filters(filterId: $filterId, currentUserId: $currentUserId)
      @rest(
        type: "Filters"
        path: "filterCriterias/{args.filterId}?filter[user][id]={args.currentUserId}&includeAssociations[]=filterCriteria"
      ) {
      data
      includedAssociations
    }
  }
`;

export const CREATE_FILTERS = gql`
  query($input: Object!) {
    filter(input: $input)
      @rest(type: "Filter", path: "filterCriterias", method: "POST") {
      data
      response
    }
  }
`;

export const UPDATE_FILTERS = gql`
  query($filterId: ID!, $input: Object!) {
    filter(filterId: $filterId, input: $input)
      @rest(
        type: "Filter"
        path: "filterCriterias/{args.filterId}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const DELETE_FILTTERS = gql`
  query($filterId: ID!) {
    filter(filterId: $filterId)
      @rest(
        type: "Filter"
        path: "filterCriterias/{args.filterId}"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const FETCH_PROSPECTS_FILTER_QUERY = gql`
  query(
    $filterId: ID!
    $includeAssociationsQry: String!
    $limit: String!
    $offset: String!
    $prospectFilter: String
  ) {
    prospects(
      filterId: $filterId
      includeAssociationsQry: $includeAssociationsQry
      limit: $limit
      offset: $offset
      prospectFilter: $prospectFilter
    )
      @rest(
        type: "Prospect"
        path: "prospects/filterCriteria/{args.filterId}?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.prospectFilter}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const LOG_A_CALL_FLOW = gql`
  query($input: Object!) {
    task(input: $input)
      @rest(type: "Task", path: "calls/logACall", method: "POST") {
      response
    }
  }
`;

export const LOG_A_CALL_WORK_FLOW_QUERY = gql`
  query($input: Object!) {
    task(input: $input)
      @rest(type: "Task", path: "calls/logACallWorkflow", method: "POST") {
      response
    }
  }
`;

export const LOG_A_TASK_QUERY = gql`
  query($input: Object!) {
    task(input: $input)
      @rest(type: "Task", path: "tasks/logATask", method: "POST") {
      response
    }
  }
`;

export const GET_CRM_REPORTS = gql`
  query($limit: String!, $offset: String!) {
    imports(limit: $limit, offset: $offset)
      @rest(
        type: "Prospect"
        path: "imports/crm/reports?page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
    }
  }
`;

export const IMPORTS_CRM_RECORDS = gql`
  query($input: Object!) {
    imports(input: $input)
      @rest(type: "Prospect", path: "imports/crm", method: "POST") {
      response
      data
    }
  }
`;

export const SKIP_TOUCH_TO_CADENCE_QUERY = gql`
  query($input: Object!) {
    skipTouch(input: $input)
      @rest(type: "SkipTouch", path: "prospects/skipTouch", method: "PUT") {
      data
      response
    }
  }
`;

export const FETCH_REMAINING_WAIT_TIME_QUERY = gql`
  query($id: ID!, $userId: String!) {
    prospect(id: $id, currentUserId: $userId)
      @rest(
        type: "Prospect"
        path: "prospects/{args.id}/remainingWaitPeriod?filter[user][id]={args.currentUserId}"
      ) {
      data
    }
  }
`;

export const FETCH_LAST_OUTCOME = gql`
  query($prospectId: ID!) {
    lastOutcome(prospectId: $prospectId)
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}/lastTouchOutcome"
      ) {
      response
      data
    }
  }
`;

export const SYNC_TO_CRM_PROSPECT_QUERY = gql`
  query($prospectId: ID!) {
    prospect(prospectId: $prospectId, input: {})
      @rest(
        type: "Prospect"
        path: "prospects/{args.prospectId}/syncCRM"
        method: "POST"
      ) {
      response
    }
  }
`;

export const DELETE_ALL_PROSPECTS_QUERY = gql`
  query($prospectFilter: String!) {
    deleteAllProspect(prospectFilter: $prospectFilter)
      @rest(
        type: "Prospect"
        path: "prospects/all/delete?{args.prospectFilter}"
        method: "DELETE"
      ) {
      response
      data
    }
  }
`;

export const ASSIGN_ALL_PROSPECTS_QUERY = gql`
  query($cadenceId: Id!, $prospectFilter: String!, $input: Object) {
    assignAll(
      cadenceId: $cadenceId
      prospectFilter: $prospectFilter
      input: $input
    )
      @rest(
        type: "Prospect"
        path: "prospects/all/assign/{args.cadenceId}{args.prospectFilter}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const FETCH_NEXT_TOUCH = gql`
  query($cadenceId: Id!, $stepNo: String!, $currentUserId: String!) {
    nextTouch(
      cadenceId: $cadenceId
      stepNo: $stepNo
      currentUserId: $currentUserId
    )
      @rest(
        type: "Prospect"
        path: "touches?filter[cadence][id]={args.cadenceId}&filter[stepNo]={args.stepNo}&filter[user][id]={args.currentUserId}"
      ) {
      data
      response
    }
  }
`;

export const FETCH_ACTIVITY_HISTORY = gql`
  query($pro: Id!) {
    history(id: $id)
      @rest(type: "history", path: "prospects/{args.id}/crmActivities") {
      data
      response
    }
  }
`;

export const UPDATE_LOG_A_TASK_QUERY = gql`
  query($taskId: ID!, $input: Object!) {
    task(taskId: $taskId, input: $input)
      @rest(type: "Task", path: "tasks/{args.taskId}", method: "PUT") {
      response
    }
  }
`;

export const PROSPECTS_TRANSFER_OWNERSHIP = gql`
  query($quickSearch: String!, $input: Object!) {
    transfer(quickSearch: $quickSearch, input: $input)
      @rest(
        type: "transfer"
        path: "prospects/transferProspectOwnership?{args.quickSearch}"
        method: "POST"
      ) {
      data
      response
    }
  }
`;

export const FETCH_ALL_DUPLICATE_PROSPECTS = gql`
  query($offset: String!, $limit: String!, $duplicateFilter: String!) {
    duplicate(
      offset: $offset
      limit: $limit
      duplicateFilter: $duplicateFilter
    )
      @rest(
        type: "duplicate"
        path: "imports/importDuplicates?page[offset]={args.offset}&page[limit]={args.limit}&{args.duplicateFilter}"
        method: "GET"
      ) {
      response
      data
      paging
    }
  }
`;

export const UPLOAD_PROSPECT_QUERY = gql`
  query($action: String!, $quickSearch: String!, $input: Object!) {
    prospect(action: $action, quickSearch: $quickSearch, input: $input)
      @rest(
        type: "Prospect"
        path: "prospects/{args.action}?{args.quickSearch}"
        method: "POST"
      ) {
      response
    }
  }
`;

export const FETCH_ALL_TEAM_USER_QUERY = gql`
  query($currentUserId: ID!, $limit: String!) {
    users(currentUserId: $currentUserId, limit: $limit)
      @rest(
        type: "users"
        path: "users/teamUsers/{args.currentUserId}?page[limit]={args.limit}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const EXPORT_DUPLICATE_RECORDS = gql`
  query($input: Object!) {
    exportcsv(input: $input)
      @rest(
        type: "exportcsv"
        path: "sign/prospect/duplicate"
        method: "POST"
      ) {
      response
      data
    }
  }
`;

export const CREATE_NOTES_QUERY = gql`
  query($input: Object) {
    addNotes(input: $input)
      @rest(type: "addNotes", path: "notes", method: "POST") {
      response
    }
  }
`;

export const UPDATE_NOTES_QUERY = gql`
  query($notesId: ID!, $input: Object!) {
    updateNotes(notesId: $notesId, input: $input)
      @rest(type: "updateNotes", path: "notes/{args.notesId}", method: "PUT") {
      response
    }
  }
`;

export const DELETE_NOTES_QUERY = gql`
  query($notesId: ID!) {
    deleteNotes(notesId: $notesId)
      @rest(
        type: "deleteNotes"
        path: "notes/{args.notesId}"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const FETCH_ATTACHMENTS_QUERY = gql`
  query($attachmentId: String) {
    attachments(attachmentId: $attachmentId)
      @rest(
        type: "Attachments"
        path: "attachments?filter[id]={args.attachmentId}"
      ) {
      data
    }
  }
`;

export const REMOVE_ATTACHMENT_QUERY = gql`
  query($attachmentId: String) {
    attachments(attachmentId: $attachmentId)
      @rest(
        type: "Attachments"
        path: "attachments/{args.attachmentId}"
        method: "DELETE"
      ) {
      data
    }
  }
`;

export const FETCH_ALL_USER_QUERY = gql`
  query($limit: String!) {
    user(limit: $limit)
      @rest(
        type: "user"
        path: "users?sort[name]=asc&page[limit]={args.limit}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export default FETCH_PROSPECTS_QUERY;
