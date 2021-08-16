/**
 * @author @rkrishna-gembrill
 * @version V11.0
 */
import gql from "graphql-tag";

const FETCH_PROSPECT_ACTIVITIES_QUERY = gql`
  query ($prospectId: String!, $allActivitiesLimit: String!, $allActivitiesOffset: String!, $filter: String!, $sort: String!){
    activities( prospectId: $prospectId, allActivitiesLimit: $allActivitiesLimit, allActivitiesOffset: $allActivitiesOffset, filter: $filter, sort: $sort )
    @rest(type: "Activity", path: "prospects/:prospectId/activities?page[limit]=:allActivitiesLimit&page[offset]=:allActivitiesOffset:filter:sort") {
      data
      paging{
        totalCount
      }
    }
  }
`;

export default FETCH_PROSPECT_ACTIVITIES_QUERY;