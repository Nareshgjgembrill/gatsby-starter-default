import gql from "graphql-tag";

const currentUserQuery = gql`
  query {
    me @rest(type: "User", path: "users/me") {
      data
    }
  }
`;

export default currentUserQuery;