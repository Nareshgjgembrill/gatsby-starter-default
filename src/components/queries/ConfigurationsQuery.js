/**
 * @author @rkrishna-gembrill
 * @since Feb 25 2021
 * @version V11.0
 */
import gql from 'graphql-tag';

export const GET_CONFIGURATIONS_QUERY = gql`
  query {
    configurations @rest(type: "Configurations", path: "configurations") {
      data
    }
  }
`;

export default GET_CONFIGURATIONS_QUERY;
