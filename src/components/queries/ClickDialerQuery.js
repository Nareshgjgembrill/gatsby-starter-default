/**
 * @author Anbarasan82
 * @version V11.0
 */
import gql from 'graphql-tag';

export const CLK_PAYLOAD = gql`
  query {
    clickdialer(input: {})
      @rest(type: "Clickdialer", path: "clickDialer/payLoad") {
      data
      response
    }
  }
`;

export const CD_SESSION_LOG = gql`
  query {
    sessionLog(input: $input)
      @rest(
        type: "SessionLog"
        path: "prospects/saveCDSessionLogToCRM"
        method: "POST"
      ) {
      data
      response
    }
  }
`;

export const CD_CALL_LOG = gql`
  query($prospectId: ID!, $input: Object!) {
    callLog(prospectId: $prospectId, input: $input)
      @rest(
        type: "CallLog"
        path: "prospects/{args.prospectId}/saveCDCallLogToCRM"
        method: "POST"
      ) {
      data
      response
    }
  }
`;

export default CLK_PAYLOAD;
