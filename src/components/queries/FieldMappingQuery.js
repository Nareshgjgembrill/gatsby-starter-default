/**
 * @author @Anbarasan
 * @version V11.0
 */
import gql from 'graphql-tag';
export const FETCH_FIELDS_QUERY = gql`
  query($limit: String!, $offset: String!, $filterMapping: String!) {
    fields(limit: $limit, offset: $offset, filterMapping: $filterMapping)
      @rest(
        type: "Fields"
        path: "fields?page[limit]={args.limit}&page[offset]={args.offset}{args.filterMapping}&includeAssociations[]=fieldDropdownValues"
      ) {
      data
      includedAssociations
    }
  }
`;

const FETCH_CL_CRM_FIELD_MAPPING_QUERY = gql`
  query(
    $limit: String!
    $offset: String!
    $filterMapping: String!
    $includeAssociationsQry: String!
  ) {
    fields(
      limit: $limit
      offset: $offset
      filterMapping: $filterMapping
      includeAssociationsQry: $includeAssociationsQry
    )
      @rest(
        type: "Fields"
        path: "fieldMappings?{args.includeAssociationsQry}&page[limit]={args.limit}&page[offset]={args.offset}{args.filterMapping}"
      ) {
      includedAssociations
      data
    }
  }
`;
export default FETCH_CL_CRM_FIELD_MAPPING_QUERY;
