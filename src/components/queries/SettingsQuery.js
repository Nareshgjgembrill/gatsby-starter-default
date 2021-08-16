/**
 * @author  @ManimegalaiV
 * */
import gql from 'graphql-tag';

const FETCH_TAG_QUERY = gql`
  query($tagFilter: String!, $limit: String!, $offset: String!) {
    allTags(tagFilter: $tagFilter, limit: $limit, offset: $offset)
      @rest(
        type: "Tag"
        path: "tags?page[limit]={args.limit}&page[offset]={args.offset}{args.tagFilter}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const CREATE_TAG_QUERY = gql`
  query {
    Tag(input: $input) @rest(type: "Tag", path: "tags", method: "POST") {
      response
    }
  }
`;

export const UPDATE_TAG_QUERY = gql`
  query($id: ID!, $name: String!) {
    Tag(id: $id, input: { name: $name })
      @rest(type: "Tag", path: "tags/{args.id}", method: "PUT") {
      response
    }
  }
`;

export const DELETE_TAG_QUERY = gql`
  query($tagId: ID!) {
    deleteTag(tagId: $tagId)
      @rest(type: "Tag", path: "tags/{args.tagId}", method: "DELETE") {
      response
    }
  }
`;

export const FETCH_CALL_OUTCOMES_QUERY = gql`
  query($limit: String!, $offset: String!) {
    call(limit: $limit, offset: $offset)
      @rest(
        type: "call"
        path: "callDispositions?page[limit]=500&page[offset]=0&filter[active]=true&filter[notVisibleToUser]=false&sort[name]=asc"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_ALL_OUTCOMES_QUERY = gql`
  query($limit: String!, $offset: String!) {
    allOutcomes(limit: $limit, offset: $offset)
      @rest(
        type: "all"
        path: "outcomes?page[limit]=500&page[offset]=0&sort[name]=asc"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FECTH_ALL_MEMBER_STAGE_QUERY = gql`
  query {
    member @rest(type: "member", path: "memberStages", method: "GET") {
      data
    }
  }
`;

export const UPDATE_TOUCH_OUTCOME_QUERY = gql`
  query($id: ID!) {
    outcome(id: $id, input: $input)
      @rest(
        type: "outcome"
        path: "settings/outcomes/{args.id}"
        method: "PUT"
      ) {
      response
    }
  }
`;

export const FETCH_EMAIL_ACCOUNT_QUERY = gql`
  query($emailFilter: String!) {
    Email(emailFilter: $emailFilter)
      @rest(
        type: "Email"
        path: "emailAccounts?{args.emailFilter}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const CREATE_EMAIL_ACCOUNT_QUERY = gql`
  query($referrer: String!) {
    Email(referrer: $referrer, input: $input)
      @rest(
        type: "Email"
        path: "emailAccounts?referrer={args.referrer}"
        method: "POST"
      ) {
      response
      data
    }
  }
`;

export const UPDATE_EMAIL_ACCOUNT_QUERY = gql`
  query($id: ID!, $referrer: String!) {
    Email(id: $id, referrer: $referrer, input: $input)
      @rest(
        type: "Email"
        path: "emailAccounts/{args.id}?referrer={args.referrer}"
        method: "PUT"
      ) {
      response
      data
    }
  }
`;

export const FETCH_EMAIL_SIGNATURE_QUERY = gql`
  query($signatureFilter: String!) {
    Email(signatureFilter: $signatureFilter)
      @rest(
        type: "Signature"
        path: "emailSignatures?{args.signatureFilter}"
        method: "GET"
      ) {
      data
    }
  }
`;
export const CREATE_EMAIL_SIGNATURE_QUERY = gql`
  query($content: String!) {
    Email(input: { content: $content })
      @rest(type: "Signature", path: "emailSignatures", method: "POST") {
      response
    }
  }
`;

export const UPDATE_EMAIL_SIGNATURE_QUERY = gql`
  query($id: ID!, $content: String!) {
    Email(id: $id, input: { content: $content })
      @rest(
        type: "Signature"
        path: "emailSignatures/{args.id}"
        method: "PUT"
      ) {
      response
    }
  }
`;

export const FETCH_SCHEDULE_QUERY = gql`
  query($includeAssociationsQry: String!, $id: ID!) {
    schedule(includeAssociationsQry: $includeAssociationsQry, id: $id)
      @rest(
        type: "Schedule"
        path: "schedules/{args.id}?{args.includeAssociationsQry}"
        method: "GET"
      ) {
      data
      includedAssociations
    }
  }
`;

export const FETCH_SCHEDULES_QUERY = gql`
  query($limit: String!, $offset: String!, $emailFilter: String!) {
    schedule(limit: $limit, offset: $offset, emailFilter: $emailFilter)
      @rest(
        type: "Schedule"
        path: "schedules?page[limit]={args.limit}&page[offset]={args.offset}{args.emailFilter}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const CREATE_SCHEDULE_QUERY = gql`
  query {
    schedule(input: $input)
      @rest(type: "Schedule", path: "schedules", method: "POST") {
      data
    }
  }
`;
export const UPDATE_SCHEDULE_QUERY = gql`
  query($id: ID!) {
    schedule(id: $id, input: $input)
      @rest(type: "Schedule", path: "schedules/{args.id}", method: "PUT") {
      response
    }
  }
`;

export const DELETE_SCHEDULE_QUERY = gql`
  query($id: ID!) {
    schedule(id: $id)
      @rest(type: "Schedule", path: "schedules/{args.id}", method: "DELETE") {
      response
    }
  }
`;

export const CREATE_TIMESLOT_QUERY = gql`
  query {
    Timeslot(input: $input)
      @rest(type: "Timeslot", path: "scheduleTimeSlots", method: "POST") {
      response
    }
  }
`;

export const FETCH_MANAGER_USER_QUERY = gql`
  query($isManagerUser: String!) {
    manager(isManagerUser: $isManagerUser)
      @rest(
        type: "Schedule"
        path: "users?{args.isManagerUser}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ALL_USER_QUERY = gql`
  query($filter: String!, $limit: String!, $offset: String!) {
    user(filter: $filter, limit: $limit, offset: $offset)
      @rest(
        type: "user"
        path: "users/assignedUsers?page[limit]={args.limit}&page[offset]={args.offset}&{args.filter}&sort[name]=asc"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_ALL_SYNCLOG_QUERY = gql`
  query($syncLogFilter: String!, $limit: String!, $offset: String!) {
    synclogs(syncLogFilter: $syncLogFilter, limit: $limit, offset: $offset)
      @rest(
        type: "SyncLogs"
        path: "settings/synclogs?page[limit]={args.limit}&page[offset]={args.offset}{args.syncLogFilter}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_JOBS_QUEUE = gql`
  query($jobQueueFilter: String!, $limit: String!, $offset: String!) {
    jobQueue(jobQueueFilter: $jobQueueFilter, limit: $limit, offset: $offset)
      @rest(
        type: "jobQueue"
        path: "jobsQueue?page[limit]={args.limit}&page[offset]={args.offset}&{args.jobQueueFilter}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_ALL_SETTINGS_QUERY = gql`
  query {
    settings @rest(type: "Settings", path: "org", method: "GET") {
      data
    }
  }
`;
export const FETCH_USER_SETTING_QUERY = gql`
  query {
    usersettings
      @rest(type: "Usersettings", path: "settings/user", method: "GET") {
      data
    }
  }
`;

export const UPDATE_EMAIL_FONT_SETTING_QUERY = gql`
  query($input: Object!) {
    usersettings(input: $input)
      @rest(type: "Usersettings", path: "users", method: "POST") {
      data
    }
  }
`;

export const UPDATE_USER_SETTING_QUERY = gql`
  query($input: Object!) {
    usersettings(input: $input)
      @rest(type: "UserSettings", path: "users", method: "POST") {
      response
      data
    }
  }
`;

export const CREATE_TRANSFER_OWNERSHIP_QUERY = gql`
  query {
    transfer(input: $input)
      @rest(type: "transfer", path: "transferOwnerships", method: "POST") {
      response
    }
  }
`;

export const GMAIL_OAUTH_QUERY = gql`
  query($code: String!, $error: String, $state: String!) {
    gmail(code: $code, error: $error, state: $state)
      @rest(type: "gmail", path: "settings/email/oauth?{args}", method: "GET") {
      response
    }
  }
`;

export const FETCH_SYNC_SETTINGS_QUERY = gql`
  query {
    syncsettings
      @rest(
        type: "syncsettings"
        path: "settings/syncSettings"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_ASSIGNED_USER_QUERY = gql`
  query($userFilter: String!) {
    users(userFilter: $userFilter)
      @rest(
        type: "Users"
        path: "users/assignedUsers{args.userFilter}"
        method: "GET"
      ) {
      data
    }
  }
`;

export const UPDATE_SYNC_SETTINGS_QUERY = gql`
  query {
    syncsettings(input: $input)
      @rest(
        type: "syncsettings"
        path: "settings/syncSettings"
        method: "POST"
      ) {
      response
    }
  }
`;

export const FETCH_CRM_WORKFLOW_CRITERIA_SETTINGS_QUERY = gql`
  query {
    crmworkflowcriteria
      @rest(
        type: "crmworkflowcriteria"
        path: "settings/syncFromCrmWorkflowCriteras?page[limit]=500"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_WORKFLOW_SETTINGS_QUERY = gql`
  query {
    crmworkflow
      @rest(
        type: "crmworkflow"
        path: "settings/syncFromCrmWorkflows?page[limit]=500"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const UPDATE_SYNC_FROM_TRUCADENCE_TO_CRM_SETTINGS_QUERY = gql`
  query {
    syncsettings(input: $input)
      @rest(type: "syncsettings", path: "settings/outcomes", method: "POST") {
      response
    }
  }
`;

export const DELETE_WORKFLOW_SETTINGS_QUERY = gql`
  query($id: ID!) {
    deleteworkflow(id: $id)
      @rest(
        type: "syncsettings"
        path: "settings/syncFromCrmWorkflows/{args.id}"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const DELETE_WORKFLOW_CRITERIA_SETTINGS_QUERY = gql`
  query($id: ID!) {
    deleteworkflow(id: $id)
      @rest(
        type: "syncsettings"
        path: "settings/syncFromCrmWorkflowCriteras/{args.id}"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const FETCH_DROPDOWN_QUERY = gql`
  query {
    dropdownField
      @rest(
        type: "Dropdownfield"
        path: "fields?includeAssociations[]=fieldMappings&includeAssociations[]=fieldDropdownValues&sort[label]=asc&page[limit]=500&filter[trucadence]=true"
        method: "GET"
      ) {
      data
      includedAssociations
    }
  }
`;
export const UPDATE_SYNC_FROM_CRM_TO_TRUCADENCE_QUERY = gql`
  query {
    syncsettings(input: $input)
      @rest(
        type: "syncsettings"
        path: "settings/syncFromCrmWorkflowCriteras"
        method: "POST"
      ) {
      response
    }
  }
`;

export const FETCH_CADENCE_QUERY = gql`
  query($cadenceFilter: String!) {
    cadences(cadenceFilter: $cadenceFilter)
      @rest(
        type: "cadences"
        path: "cadences?{args.cadenceFilter}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_ALL_FIELDS_QUERY = gql`
  query {
    allFields
      @rest(
        type: "allFields"
        path: "fields?includeAssociations[]=fieldMappings&page[limit]=500&sort[label]=asc&filter[trucadence]=true&filter[hidden]=false"
        method: "GET"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_CRM_CONTACT_FIELDS_QUERY = gql`
  query {
    contactFields
      @rest(
        type: "contact"
        path: "fields/crm?recordType=Contact"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_CRM_LEAD_FIELDS_QUERY = gql`
  query {
    leadFields
      @rest(type: "lead", path: "fields/crm?recordType=Lead", method: "GET") {
      data
      paging
    }
  }
`;

export const FETCH_CRM_ACCOUNT_FIELDS_QUERY = gql`
  query {
    accountFields
      @rest(
        type: "lead"
        path: "fields/crm?recordType=Account"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_CRM_ACTIVITIES_FIELDS_QUERY = gql`
  query {
    activityFields
      @rest(
        type: "activity"
        path: "fields/crm?recordType=Task"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_FILTERED_CADENCES = gql`
  query($useId: String!) {
    cadenceList(userId: $userId)
      @rest(
        type: "cadenceList"
        path: "cadences?filter[user][id]={args.userId}&filter[sharedType]=allUsers&filter[shared]=true&page[limit]=500&page[offset]=0&sort[name]=asc"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_ALL_ACTIVITIES_FIELD_MAPPING_QUERY = gql`
  query {
    allActivityMapping
      @rest(type: "allActivity", path: "activityDataFields", method: "GET") {
      data
      paging
    }
  }
`;

export const DELETE_ACTIVITY_DATA_QUERY = gql`
  query($id: ID!) {
    activity(id: $id)
      @rest(
        type: "activity"
        path: "settings/activityDataFields/{args.id}"
        method: "DELETE"
      ) {
      response
    }
  }
`;
export const UPDATE_FIELD_MAPPING_QUERY = gql`
  query {
    allFields(input: $input)
      @rest(type: "allFields", path: "settings/fieldMappings", method: "POST") {
      response
    }
  }
`;
export const ADD_FIELD_MAPPING_QUERY = gql`
  query {
    addField(input: $input)
      @rest(
        type: "addField"
        path: "settings/fieldMappings/add"
        method: "POST"
      ) {
      response
    }
  }
`;

export const DISABLE_EMAIL_ACCOUNT_QUERY = gql`
  query($id: ID!) {
    Email(id: $id, input: $input)
      @rest(type: "Email", path: "emailAccounts/{args.id}", method: "PUT") {
      response
      data
    }
  }
`;

export const SHOW_FEDERAL_HOLIDAY = gql`
  query($limit: String!, $offset: String!) {
    holiday(limit: $limit, offset: $offset)
      @rest(
        type: "total"
        path: "settings/holidays?filter[isActive]=true&page[limit]={args.limit}&page[offset]={args.offset}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;
export const EMAIL_LIMIT_PER_HOUR = gql`
  query($lookupName: String!) {
    emailLimitPerHour(lookupName: $lookupName)
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

export default FETCH_TAG_QUERY;
