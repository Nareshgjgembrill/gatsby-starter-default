/**
 * @author @Anbarasan
 * @version V11.0
 */
import gql from "graphql-tag";
export const FETCH_ASSIGNED_USERS_QUERY = gql`
  query($limit: String!, $offset: String!, $currentUserId: String!) {
    teams(limit:$limit, offset:$offset, currentUserId:$currentUserId )
    @rest(type: "Teams", path:"users/assignedUsers?page[limit]={args.limit}&page[offset]={args.offset}&sort[displayName]=asc") {
      data
    }
  }
`;

export const FETCH_ASSIGNED_TEAMS_QUERY = gql`
  query($limit: String!, $offset: String!) {
    teams(limit:$limit, offset:$offset )
    @rest(type: "Teams", path:"reportHierarchies/assignedTeams?page[limit]={args.limit}&page[offset]={args.offset}&sort[groupName]=asc") {
      data
    }
  }
`;
export default FETCH_ASSIGNED_USERS_QUERY;
