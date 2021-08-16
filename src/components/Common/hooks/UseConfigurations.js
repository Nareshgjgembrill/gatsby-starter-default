/**
 * @author @rkrishna-gembrill
 * @since Feb 25 2021
 * @version V11.0
 */
import { useQuery } from '@apollo/react-hooks';

import GET_CONFIGURATIONS_QUERY from '../../queries/ConfigurationsQuery';

const useConfigurations = () => {
  const { data = {}, error, loading, refetch } = useQuery(GET_CONFIGURATIONS_QUERY, {
    fetchPolicy: 'cache-first',
  });
  return { data, error, loading, refetch };
};

export default useConfigurations;
