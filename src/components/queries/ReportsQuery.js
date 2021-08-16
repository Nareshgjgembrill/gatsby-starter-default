/**
 * @author @vikrant-singh
 * @version V11.0
 */
import gql from 'graphql-tag';

export const FETCH_SAVED_REPORTS_QUERY = gql`
  query {
    savedReports
      @rest(
        type: "SavedReports"
        path: "reports/savedReports?sort[reportName]=asc"
        method: "GET"
      ) {
      data
    }
  }
`;

export const SAVE_REPORT_QUERY = gql`
  query($input: Object!) {
    saveReport(input: $input)
      @rest(type: "SaveReport", path: "reports/", method: "POST") {
      data
    }
  }
`;

export const EDIT_SAVED_REPORTS_QUERY = gql`
  query($reportId: String!, $input: Object!) {
    editSavedReports(reportId: $reportId, input: $input)
      @rest(
        type: "SaveReport"
        path: "reports/savedReports/edit/{args.reportId}"
        method: "PUT"
      ) {
      data
    }
  }
`;

export const DELETE_SAVED_REPORTS_QUERY = gql`
  query($reportId: String!) {
    deleteSavedReports(reportId: $reportId)
      @rest(
        type: "SaveReport"
        path: "reports/savedReports/delete/{args.reportId}"
        method: "DELETE"
      ) {
      data
    }
  }
`;

export const FETCH_CADENCE_PARAMS_QUERY = gql`
  query {
    cadenceParams
      @rest(
        type: "CadenceParams"
        path: "reports/getCadenceParams"
        method: "GET"
      ) {
      data
    }
  }
`;

export const FETCH_REPORT_QUERY = gql`
  query(
    $showByEachUser: String!
    $startDate: String!
    $endDate: String!
    $logicalVariable: String!
    $selectedUserIds: String!
    $cadenceIds: String
  ) {
    fetchReport(
      showByEachUser: $showByEachUser
      startDate: $startDate
      endDate: $endDate
      logicalVariable: $logicalVariable
      selectedUserIds: $selectedUserIds
      cadenceIds: $cadenceIds
    ) @rest(type: "FetchReport", path: "reports?{args}", method: "GET") {
      data
    }
  }
`;

export const FETCH_SIGNED_KEY_EXPORT_QUERY = gql`
  query($input: Object!) {
    signedKeyExport(input: $input)
      @rest(type: "SignedKeyReport", path: "sign", method: "POST") {
      data
    }
  }
`;

export const FETCH_SIGNED_KEY_EXPORT_SECTION_QUERY = gql`
  query($input: Object!) {
    signedKeyExportSection(input: $input)
      @rest(
        type: "SignedKeyReport"
        path: "sign/reports/prospectExport"
        method: "POST"
      ) {
      data
    }
  }
`;

export const FETCH_PROSPECTS_ALL_USERS_QUERY = gql`
  query(
    $bucketName: String!
    $section: String!
    $showByEachUser: String!
    $startDate: String!
    $endDate: String!
    $logicalVariable: String!
    $selectedUserIds: String!
    $cadenceIds: String!
    $stepNo: String!
    $sortColumn: String!
    $sortDirection: String!
    $pageLimit: String!
    $pageOffset: String!
  ) {
    fetchProspects(
      bucketName: $bucketName
      section: $section
      showByEachUser: $showByEachUser
      startDate: $startDate
      endDate: $endDate
      logicalVariable: $logicalVariable
      selectedUserIds: $selectedUserIds
      cadenceIds: $cadenceIds
      stepNo: $stepNo
      sortColumn: $sortColumn
      sortDirection: $sortDirection
      pageLimit: $pageLimit
      pageOffset: $pageOffset
    )
      @rest(
        type: "FetchProspects"
        path: "reports/get/{args.bucketName}/prospects/{args.section}?showByEachUser={args.showByEachUser}&startDate={args.startDate}&endDate={args.endDate}&logicalVariable={args.logicalVariable}&selectedUserIds={args.selectedUserIds}&cadenceIds={args.cadenceIds}&stepNo={args.stepNo}&sortColumn={args.sortColumn}&sortOrder={args.sortDirection}&page[limit]={args.pageLimit}&page[offset]={args.pageOffset}"
        method: "GET"
      ) {
      data
      total
    }
  }
`;

export const FETCH_PROSPECTS_USER_QUERY = gql`
  query(
    $bucketName: String!
    $section: String!
    $showByEachUser: String!
    $startDate: String!
    $endDate: String!
    $logicalVariable: String!
    $selectedUserIds: String!
    $cadenceIds: String!
    $stepNo: String!
    $sortColumn: String!
    $sortDirection: String!
    $pageLimit: String!
    $pageOffset: String!
    $userId: String!
  ) {
    fetchProspects(
      bucketName: $bucketName
      section: $section
      showByEachUser: $showByEachUser
      startDate: $startDate
      endDate: $endDate
      logicalVariable: $logicalVariable
      selectedUserIds: $selectedUserIds
      cadenceIds: $cadenceIds
      stepNo: $stepNo
      sortColumn: $sortColumn
      sortDirection: $sortDirection
      pageLimit: $pageLimit
      pageOffset: $pageOffset
      userId: $userId
    )
      @rest(
        type: "FetchProspects"
        path: "reports/get/{args.bucketName}/prospects/{args.section}?showByEachUser={args.showByEachUser}&startDate={args.startDate}&endDate={args.endDate}&logicalVariable={args.logicalVariable}&selectedUserIds={args.selectedUserIds}&cadenceIds={args.cadenceIds}&stepNo={args.stepNo}&sortColumn={args.sortColumn}&sortOrder={args.sortDirection}&page[limit]={args.pageLimit}&page[offset]={args.pageOffset}&userId={args.userId}"
        method: "GET"
      ) {
      data
      total
    }
  }
`;

export const FETCH_TOP_TEMPLATES_QUERY = gql`
  query(
    $selectedUserIds: String!
    $cadenceIds: String!
    $startDate: String!
    $endDate: String!
  ) {
    fetchTopTemplates(
      selectedUserIds: $selectedUserIds
      cadenceIds: $cadenceIds
      startDate: $startDate
      endDate: $endDate
    )
      @rest(
        type: "FetchTopTemplates"
        path: "reports/top/template?selectedUserIds={args.selectedUserIds}&cadenceIds={args.cadenceIds}&page[limit]=25&page[offset]=0&startDate={args.startDate}&endDate={args.endDate}"
        method: "GET"
      ) {
      data
    }
  }
`;
