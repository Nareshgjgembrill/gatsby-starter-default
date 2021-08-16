import React from 'react';
import { withRouter } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

import { ContentWrapper } from '@nextaction/components';
import { FETCH_CADENCE_QUERY } from '../../queries/CadenceQuery';
import NewCadenceEditor from './NewCadenceEditor';

const NewCadence = ({ match, history, location }) => {
  const state = location.state ? location.state : {};

  const cadenceId = match.params['id'];

  const { data: cadenceData, loading, error } = useQuery(FETCH_CADENCE_QUERY, {
    variables: {
      id: cadenceId,
    },
    skip: cadenceId === undefined,
  });

  return (
    <ContentWrapper>
      <div className="content-heading">
        <div>
          <i className="svgicon koncert-cadence-icon mr-2"></i>
          <span>{cadenceId ? 'Edit Cadence' : 'New Cadence'}</span>
        </div>
      </div>
      <NewCadenceEditor
        cadenceData={cadenceData}
        cadenceId={cadenceId}
        history={history}
        state={state}
        loading={loading}
        error={error}
      ></NewCadenceEditor>
    </ContentWrapper>
  );
};
export default withRouter(NewCadence);
