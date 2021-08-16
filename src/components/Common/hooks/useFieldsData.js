/**
 * @author Albert
 * @version V11.2
 */
import { useQuery } from '@apollo/react-hooks';
import { FETCH_FIELDS_QUERY } from '../../queries/FieldMappingQuery';
import { showErrorMessage } from '../../../util/index';

const useFieldsData = () => {
  const { data, error, loading, refetch } = useQuery(FETCH_FIELDS_QUERY, {
    fetchPolicy: 'cache-first',
    variables: {
      limit: 200,
      offset: 0,
      filterMapping: `&filter[trucadence]=true&sort[label]=asc&includeAssociations[]=fieldMappings`,
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load sorting fields',
        data,
        'sorting_field_failed'
      );
    },
  });
  return { data, error, loading, refetch };
};

export default useFieldsData;
