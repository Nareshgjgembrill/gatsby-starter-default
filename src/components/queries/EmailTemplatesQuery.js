import gql from 'graphql-tag';

const FETCH_EMAIL_TEMPLATES_QUERY = gql`
  query(
    $includeAssociationsQry: String
    $templateFilter: String!
    $limit: String!
    $offset: String!
    $status: String!
  ) {
    emailTemplates(
      includeAssociationsQry: $includeAssociationsQry
      templateFilter: $templateFilter
      limit: $limit
      offset: $offset
      status: $status
    )
      @rest(
        type: "EmailTemplates"
        path: "emailTemplates?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.templateFilter}&filter[status]={args.status}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const FETCH_EMAIL_TEMPLATES_COUNT_QUERY = gql`
  query($userFilter: String!, $limit: String!, $offset: String!) {
    templatesCount(userFilter: $userFilter, limit: $limit, offset: $offset)
      @rest(
        type: "TemplatesCount"
        path: "emailTemplates?page[limit]={args.limit}&page[offset]={args.offset}{args.userFilter}"
      ) {
      paging
    }
  }
`;

export const FETCH_TEMPLATES_SNIPPETS_COUNT_QUERY = gql`
  query($userFilter: String!, $statusFilter: String!) {
    templates(userFilter: $userFilter, statusFilter: $statusFilter)
      @rest(
        type: "TemplatesCount"
        path: "emailTemplates?page[limit]=1&page[offset]=0&{args.userFilter}{args.statusFilter}"
      ) {
      paging {
        totalCount
      }
    }
    snippets(userFilter: $userFilter)
      @rest(
        type: "SnippetsCount"
        path: "snippets?page[limit]=1&page[offset]=0&{args.userFilter}"
      ) {
      paging {
        totalCount
      }
    }
  }
`;

export const CREATE_EMAIL_TEMPLATE_QUERY = gql`
  query {
    addEmailTemplate(input: $input)
      @rest(type: "AddEmailTemplate", path: "emailTemplates", method: "POST") {
      response
      data
    }
  }
`;

export const UPDATE_EMAIL_TEMPLATE_QUERY = gql`
  query($id: ID!) {
    editEmailTemplate(id: $id, input: $input)
      @rest(
        type: "EditEmailTemplate"
        path: "emailTemplates/{args.id}"
        method: "PUT"
      ) {
      response
      data
    }
  }
`;

export const CLONE_EMAIL_TEMPLATE_QUERY = gql`
  query($id: ID!, $cloneTemplateName: String!) {
    cloneEmailTemplate(
      id: $id
      cloneTemplateName: $cloneTemplateName
      input: {}
    )
      @rest(
        type: "CloneEmailTemplate"
        path: "emailTemplates/{args.id}/cloneTemplate/{args.cloneTemplateName}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const CLONE_SF_TEMPLATE_QUERY = gql`
  query($id: ID!, $cloneTemplateName: String!, $type: String!) {
    cloneEmailTemplate(
      id: $id
      cloneTemplateName: $cloneTemplateName
      input: { type: $type }
    )
      @rest(
        type: "CloneEmailTemplate"
        path: "emailTemplates/{args.id}/cloneTemplateSF/{args.cloneTemplateName}"
        method: "POST"
      ) {
      response
      data
    }
  }
`;

export const CREATE_TAG_QUERY = gql`
  query($input: Object!) {
    Tag(input: $input) @rest(type: "Tag", path: "tags", method: "POST") {
      response
      data
    }
  }
`;

export const FETCH_EMAIL_TEMPLATE_QUERY = gql`
  query($id: ID!) {
    template(id: $id)
      @rest(
        type: "Template"
        path: "emailTemplates/{args.id}?includeAssociations[]=attachment&includeAssociations[]=user"
      ) {
      data
      includedAssociations
    }
  }
`;

export const FETCH_GROUP_USERS_LIST_QUERY = gql`
  query($limit: String!, $offset: String!) {
    users(limit: $limit, offset: $offset)
      @rest(
        type: "Users"
        path: "users?page[limit]={args.limit}&page[offset]={args.offset}"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_TEMPLATE_TAGS_LIST_QUERY = gql`
  query($userFilter: Int!) {
    tags(userFilter: $userFilter)
      @rest(type: "Tags", path: "tags?{args.userFilter}", method: "GET") {
      data
      paging
    }
  }
`;

export const FETCH_ORG_CRMTYPE = gql`
  query {
    tags(input: $input) @rest(type: "Settings", path: "org", method: "GET") {
      data
      paging
    }
  }
`;

export const FETCH_CATEGORIES_LIST_QUERY = gql`
  query($limit: String!, $offset: String!) {
    categories(limit: $limit, offset: $offset)
      @rest(
        type: "Categories"
        path: "emailTemplates/category?filter[activeFlag]=Y&page[limit]={args.limit}&page[offset]={args.offset}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_SALESFORCE_TEMPLATES_QUERY = gql`
  query($limit: String!, $offset: String!, $type: String!) {
    salesForceTemplates(limit: $limit, offset: $offset, input: { type: $type })
      @rest(
        type: "CRMTemplates"
        path: "emailTemplates/crm?page[limit]={args.limit}&page[offset]={args.offset}"
        method: "POST"
      ) {
      data
      paging
    }
  }
`;

export const DELETE_EMAIL_TEMPLATE_QUERY = gql`
  query($emailTemplateId: ID!) {
    deleteTemplate(emailTemplateId: $emailTemplateId)
      @rest(
        type: "Template"
        path: "emailTemplates/{args.emailTemplateId}"
        method: "DELETE"
      ) {
      data
      response
    }
  }
`;
export const ACTIVATE_OR_DEACTIVATE_EMAIL_TEMPLATE_QUERY = gql`
  query($emailTemplateId: ID!, $status: String!) {
    ActivateOrDeactivate(
      emailTemplateId: $emailTemplateId
      input: { status: $status }
    )
      @rest(
        type: "Template"
        path: "emailTemplates/{args.emailTemplateId}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export const FETCH_EMAIL_TEMPLATE_ATTACHMENTS = gql`
  query($templateId: Id!, $includeAssociationsQry: String!) {
    templates(
      templateId: $templateId
      includeAssociationsQry: $includeAssociationsQry
    )
      @rest(
        type: "Attachments"
        path: "emailTemplates/{args.templateId}?{args.includeAssociationsQry}"
      ) {
      data
      includedAssociations
    }
  }
`;
export const FETCH_MAIL_MERGE_VARIABLES = gql`
  query {
    mailmergeVariables
      @rest(type: "MailMerge", path: "emailTemplates/loadmailMergeNames") {
      data
    }
  }
`;
export const GET_MAIL_MERGE_RESPONSE = gql`
  query($input: Object!) {
    mailmergeResponse(input: $input)
      @rest(
        type: "MailMerge"
        path: "emailTemplates/getMailMergeData"
        method: "POST"
      ) {
      data
    }
  }
`;
export const GET_ALL_SNIPPETS = gql`
  query($snippetsFilter: String!) {
    snippets(snippetsFilter: $snippetsFilter)
      @rest(type: "Snippets", path: "snippets/?{args.snippetsFilter}") {
      data
    }
  }
`;
export const GET_ALL_TEMPLATES = gql`
  query($templatesFilter: String!, $includeAssociationsQry: String!) {
    templates(
      templatesFilter: $templatesFilter
      includeAssociationsQry: $includeAssociationsQry
    )
      @rest(
        type: "Templates"
        path: "emailTemplates?{args.templatesFilter}&{args.includeAssociationsQry}"
      ) {
      data
      includedAssociations
      paging
    }
  }
`;

export const GET_ALL_TEMPLATES_QUERY = gql`
  query($templatesFilter: String!) {
    templates(templatesFilter: $templatesFilter)
      @rest(type: "Templates", path: "emailTemplates?{args.templatesFilter}") {
      data
    }
  }
`;

export const FETCH_PERFORMANCE_ANALYSIS_QUERY = gql`
  query($userFilter: String!) {
    PerformanceAnalysis(userFilter: $userFilter)
      @rest(
        type: "Templates"
        path: "emailTemplates/templatePerformances?filter[user][id]={args.userFilter}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_TEMPLATE_PERFORMANCE_ANALYSIS_QUERY = gql`
  query($id: ID!, $userFilter: String!) {
    TemplatePerformance(id: $id, userFilter: $userFilter)
      @rest(
        type: "Templates"
        path: "emailTemplates/{args.id}/templatePerformances?filter[user][id]={args.userFilter}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const FETCH_TEMPLATE_CADENCES_QUERY = gql`
  query(
    $id: ID!
    $cadenceFilter: String!
    $limit: String!
    $offset: String!
    $sortBy: String!
    $orderBy: String!
  ) {
    TemplateCadences(
      id: $id
      cadenceFilter: $cadenceFilter
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      orderBy: $orderBy
    )
      @rest(
        type: "Templates"
        path: "emailTemplates/{args.id}/cadenceData?page[limit]={args.limit}&page[offset]={args.offset}&{args.cadenceFilter}&sort[{args.sortBy}]={args.orderBy}"
        method: "GET"
      ) {
      data
      paging
    }
  }
`;

export const DELETE_TEMPLATE_ATTACHMENT_QUERY = gql`
  query($attachmentId: ID!) {
    deleteAttachment(attachmentId: $attachmentId)
      @rest(
        type: "Attachment"
        path: "attachments/{args.attachmentId}"
        method: "DELETE"
      ) {
      response
    }
  }
`;

export const DOWNLOAD_TEMPLATE_ATTACHMENT_QUERY = gql`
  query($attachmentId: ID!) {
    downloadAttachment(attachmentId: $attachmentId)
      @rest(type: "Attachment", path: "attachments/{args.attachmentId}") {
      data
    }
  }
`;

export const SEND_TEST_EMAIL_QUERY = gql`
  query($input: Object!) {
    SendTestMail(input: $input)
      @rest(
        type: "Templates"
        path: "emailTemplates/sendTestEmail "
        method: "POST"
      ) {
      response
      data
    }
  }
`;

export const TAG_TEMPLATE_QUERY = gql`
  query($templateId: ID!, $input: Object!) {
    tagTemplate(templateId: $templateId, input: $input)
      @rest(
        type: "Templates"
        path: "emailTemplates/{args.templateId}"
        method: "PUT"
      ) {
      data
      response
    }
  }
`;

export default FETCH_EMAIL_TEMPLATES_QUERY;
