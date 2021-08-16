import gql from 'graphql-tag';

export const FETCH_CALLDISPOSITIONS_QUERY = gql`
  query($limit: String!, $offset: String!, $filter: String) {
    callDispositions(limit: $limit, offset: $offset, filter: $filter)
      @rest(
        type: "CallDispositions"
        path: "callDispositions?page[limit]={args.limit}&page[offset]={args.offset}{args.filter}"
      ) {
      data
    }
  }
`;

export default FETCH_CALLDISPOSITIONS_QUERY;
