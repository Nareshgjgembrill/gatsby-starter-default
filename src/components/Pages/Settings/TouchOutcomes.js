/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React, { useEffect, useState } from 'react';
import { parseUrl } from 'query-string';
import { toast } from 'react-toastify';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import {
  FETCH_ALL_OUTCOMES_QUERY,
  FETCH_CALL_OUTCOMES_QUERY,
  UPDATE_TOUCH_OUTCOME_QUERY,
} from '../../queries/SettingsQuery';
import TouchOutcomeGrid from './TouchOutcomeGrid';
import { default as OutcomeModal } from './EditOutcomeModal';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const TouchOutcomes = () => {
  const outcomesData = [];
  let count = 0;
  const { query: searchParams } = parseUrl(window.location.search);
  const [pageCount, setPageCount] = useState(0);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [outcomeValue, setOutcomeValue] = useState();

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const offset = searchParams['page[offset]']
    ? parseInt(searchParams['page[offset]'])
    : 0;
  const currentPageIndex = searchParams['page[offset]']
    ? parseInt(searchParams['page[offset]'])
    : 0;
  const limit = searchParams['page[limit]']
    ? parseInt(searchParams['page[limit]'])
    : 10;
  const {
    data: fetchAllOutcomesData,
    loading: fetchAllOutcomesLoading,
    error: fetchAllOutcomesError,
    refetch: refetchAllOutcomes,
  } = useQuery(FETCH_ALL_OUTCOMES_QUERY, {
    variables: { limit, offset },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch all outcomes.',
        fetchAllOutcomesData,
        'fetch_all_outcomes'
      );
    },
  });
  const {
    data: fetchCallOutcomesData,
    loading: fetchCallOutcomesLoading,
    error: fetchCallOutcomesError,
    refetch: refetchCallOutcomes,
  } = useQuery(FETCH_CALL_OUTCOMES_QUERY, {
    variables: { limit, offset },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch call outcomes.',
        fetchCallOutcomesData,
        'fetch_call_outcomes'
      );
    },
  });

  if (
    fetchCallOutcomesData !== undefined &&
    fetchAllOutcomesData !== undefined
  ) {
    count =
      fetchCallOutcomesData.call.paging.totalCount +
      fetchAllOutcomesData.allOutcomes.paging.totalCount;
    const callOutcomesData = fetchCallOutcomesData.call.data.map((data) => {
      let products = '';
      if (data.clickDialer && data.personalDialer & data.teamDialer) {
        products = 'CD,PD,TD';
      } else if (data.clickDialer && data.personalDialer) {
        products = 'CD,PD';
      } else if (data.clickDialer && data.teamDialer) {
        products = 'CD,TD';
      } else if (data.personalDialer && data.teamDialer) {
        products = 'PD,TD';
      } else if (data.personalDialer) {
        products = 'PD';
      } else if (data.teamDialer || data.dialingAgent) {
        products = 'TD';
      } else if (data.clickDialer) {
        products = 'CD';
      }

      return {
        id: data.id,
        defaultAction: data.defaultAction,
        outcomeGroup: data.memberStage,
        outComes: data.name,
        productType: products,
        touchType: 'Call',
        displayMetrics: data.enableForReport,
        outcomeWeight: data.cadenceOutcomeWeight,
      };
    });
    const otherOutcomesData = fetchAllOutcomesData.allOutcomes.data.map(
      (data) => {
        const touchType = ['others', 'other'].includes(
          data?.touchType?.toLowerCase()
        )
          ? 'Social'
          : data.touchType.charAt(0).toUpperCase() +
            data.touchType.slice(1).toLowerCase();
        return {
          id: data.id,
          defaultAction: data.defaultAction,
          outcomeGroup: data.memberStage,
          outComes: data.name,
          productType: data.productType,
          touchType: touchType,
          displayMetrics: data.showOnMetrics,
          outcomeWeight: data.outcomeWeight,
        };
      }
    );
    otherOutcomesData.forEach((other) => {
      outcomesData.push(other);
    });
    callOutcomesData.forEach((call) => {
      outcomesData.push(call);
    });
  }

  const columns = [
    {
      Header: 'Touch Type',
      accessor: 'touchType',
      width: '11%',
    },
    {
      Header: 'Outcome',
      accessor: 'outComes',
      width: '23%',
    },
    {
      Header: 'Outcome Group',
      accessor: 'outcomeGroup',
      width: '23%',
    },
    {
      Header: 'Default Action',
      accessor: 'defaultAction',
      width: '23%',
    },
    {
      Header: 'Product Type',
      accessor: 'productType',
      width: '10%',
      Cell: function (props) {
        const productType = props?.value
          ?.replace('PD', 'FD')
          .replace('TD', 'AAD');
        return <span>{productType}</span>;
      },
    },
    {
      Header: 'Engagement Score',
      accessor: 'outcomeWeight',
      width: '10%',
    },
  ];
  useEffect(() => setPageCount(outcomesData ? Math.ceil(count / limit) : 0), [
    outcomesData,
    count,
    limit,
  ]);

  const handleUpdateOutcome = (outcomes) => {
    setOutcomeValue(outcomes);
    setShowOutcomeModal(true);
  };

  const [
    updateOutcome,
    { data: updateOutcomeData, loading: updateOutcomeLoading },
  ] = useLazyQuery(UPDATE_TOUCH_OUTCOME_QUERY, {
    onCompleted: (response) => updateOutcomeCallback(response, true),
    onError: (response) => updateOutcomeCallback(response),
  });

  const editTouchOutcome = (outComeId, input) => {
    updateOutcome({
      variables: {
        id: outComeId,
        input: input,
      },
    });
  };

  const updateOutcomeCallback = (response, status) => {
    if (status) {
      notify(
        'Outcome has been pdated successfully',
        'success',
        'update_outcome'
      );
      setShowOutcomeModal(false);
      refetchAllOutcomes();
      refetchCallOutcomes();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update outcome.',
        updateOutcomeData,
        'update_outcome'
      );
    }
  };

  return (
    <Card className="card-default">
      <CardHeader>
        <i className="fas fa-user mr-2"></i>Touch Outcomes
      </CardHeader>
      <CardBody>
        <TouchOutcomeGrid
          columns={columns}
          data={outcomesData}
          loading={fetchCallOutcomesLoading || fetchAllOutcomesLoading}
          error={fetchAllOutcomesError || fetchCallOutcomesError}
          pageSize={limit}
          pageCount={pageCount}
          currentPageIndex={currentPageIndex}
          handleRefresh={() => {
            refetchAllOutcomes();
            refetchCallOutcomes();
          }}
          handleUpdateOutcome={handleUpdateOutcome}
          totalCount={count}
        />
        <OutcomeModal
          hideModal={() => {
            setShowOutcomeModal(false);
          }}
          showModal={showOutcomeModal}
          data={outcomeValue}
          updateOutcomeLoading={updateOutcomeLoading}
          editTouchOutcome={editTouchOutcome}
        />
      </CardBody>
    </Card>
  );
};
export default TouchOutcomes;
