import { useQuery } from '@apollo/react-hooks';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Col, FormGroup, Input, Label, Progress, Row } from 'reactstrap';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { getAllCadences } from '../../../store/actions/actions';
import DropDown from '../../Common/DropDown';
import {
  FETCH_CADENCE_QUERY,
  FETCH_OUTCOMES_QUERY,
} from '../../queries/CadenceQuery';
import FETCH_CALLDISPOSITIONS_QUERY from '../../queries/CallDispositionsQuery';
import {
  ENABLE_NO_ACTION_CALL_TOUCH,
  FETCH_OUTCOME_ACTIONS,
} from '../../queries/TouchQuery';

const WorkflowActions = ({
  cadences,
  isoutcome,
  defaultFilter,
  filterType,
  handleWorkFlow,
  editFlag,
  editOutcome,
  getAllCadences,
  userIds,
  cadenceId,
  setIsOutcomeIssue,
  tdDialer,
}) => {
  const [limit] = useState('100');
  const [offset] = useState(0);
  const [moveCadences, setMoveCadences] = useState({});
  const [selectCadences, setSelectCadences] = useState({});
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const [cadenceList, setCadenceList] = useState([]);

  useEffect(() => {
    !cadences.fetchedAll && getAllCadences(userIds, apiURL, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIds]);

  const { data: cadenceData } = useQuery(FETCH_CADENCE_QUERY, {
    variables: { id: cadenceId },
    notifyOnNetworkStatusChange: true,
  });

  const cadencesharedType = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].sharedType,
    [cadenceData]
  );

  // setting cadence list for 'move to another cadence'
  useEffect(() => {
    if (!cadences.loading && cadences?.data) {
      // first inserting current cadence in the list (cadenceData)
      const cadenceData = cadences.data
        .filter((cad) => {
          return (
            ['ACTIVE', 'NEW'].includes(cad.status) &&
            cad?.associations?.touch?.length > 0 &&
            cad.id === parseInt(cadenceId) &&
            cad?.associations?.user[0]?.id === userIds
          );
        })
        .map((cad, index) => {
          return {
            text: cad.name,
            value: cad.id,
            active: false,
            header: index === 0 ? 'Current Cadence' : '',
          };
        });

      let cadenceFilter;
      // if the current cadence is shared then prospects can only move to a shared cadence
      if (cadencesharedType !== 'none') {
        cadenceFilter = (cad, shared) => {
          if (shared) {
            return (
              ['ACTIVE', 'NEW'].includes(cad.status) &&
              cad?.associations?.touch?.length > 0 &&
              cad.id !== parseInt(cadenceId) &&
              cad.sharedType !== 'none' &&
              cad.emailTouchScheduled === false &&
              cad?.associations?.user[0]?.id !== userIds
            );
          } else {
            return (
              ['ACTIVE', 'NEW'].includes(cad.status) &&
              cad?.associations?.touch?.length > 0 &&
              cad.id !== parseInt(cadenceId) &&
              cad.sharedType !== 'none' &&
              cad.emailTouchScheduled === false &&
              cad?.associations?.user[0]?.id === userIds
            );
          }
        };
      } else {
        // if the current cadence is not shared then prospets can move to shared or non shared cadence
        cadenceFilter = (cad, shared) => {
          if (shared) {
            return (
              ['ACTIVE', 'NEW'].includes(cad.status) &&
              cad?.associations?.touch?.length > 0 &&
              cad.id !== parseInt(cadenceId) &&
              cad.emailTouchScheduled === false &&
              cad?.associations?.user[0]?.id !== userIds
            );
          } else {
            return (
              ['ACTIVE', 'NEW'].includes(cad.status) &&
              cad?.associations?.touch?.length > 0 &&
              cad.id !== parseInt(cadenceId) &&
              cad.emailTouchScheduled === false &&
              cad?.associations?.user[0]?.id === userIds
            );
          }
        };
      }

      cadences.data
        .filter((cad) => cadenceFilter(cad, false))
        .forEach((cad, index) => {
          cadenceData.push({
            text: cad.name,
            value: cad.id,
            active: false,
            header: index === 0 ? 'My Cadences' : '',
          });
        });

      cadences.data
        .filter((cad) => cadenceFilter(cad, true))
        .forEach((cad, index) => {
          cadenceData.push({
            text: cad.name,
            value: cad.id,
            active: false,
            header: index === 0 ? 'Shared Cadences' : '',
          });
        });

      setCadenceList(cadenceData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadences, cadenceId, cadencesharedType]);

  const workflowConfig = (filterType) => {
    switch (filterType) {
      case 'Email':
        return {
          filter: `&filter[touchType]=*EMAIL`,
          query: FETCH_OUTCOMES_QUERY,
        };
      case 'Call':
        return {
          filter: defaultFilter,
          query: FETCH_CALLDISPOSITIONS_QUERY,
        };
      case 'Text':
        return {
          filter: `&filter[touchType]=*TEXT`,
          query: FETCH_OUTCOMES_QUERY,
        };
      default:
        return {
          filter: `&filter[touchType]=EMAIL`,
          query: FETCH_OUTCOMES_QUERY,
        };
    }
  };

  // fetching default workflow outcomes corresponding to the touch
  const { data: workflowdata, loading, error } = useQuery(
    workflowConfig(filterType).query,
    {
      variables: {
        limit,
        offset,
        filter: workflowConfig(filterType).filter,
      },
      onCompleted: (data) => {
        if (data) {
          if (filterType === 'Email' || filterType === 'Text') {
            if (data?.outcomes?.data.length === 0) {
              setIsOutcomeIssue(true);
            }
          } else if (filterType === 'Call') {
            if (data?.callDispositions?.data.length === 0) {
              setIsOutcomeIssue(true);
            }
          }
        }
      },
      onError: () => {
        setIsOutcomeIssue(true);
      },
    }
  );

  const { data: lookUpData } = useQuery(ENABLE_NO_ACTION_CALL_TOUCH, {
    variables: {
      lookupName: 'enable_no_action_in_call_touch',
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: filterType !== 'Call',
  });

  const {
    data: lookUpActionsData,
    loading: lookUpActionsLoading,
    error: lookUpActionsError,
  } = useQuery(FETCH_OUTCOME_ACTIONS, {
    variables: {
      lookupName: 'cadence_prospect_workflow_actions',
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const lookUpValue = useMemo(
    () =>
      lookUpData && lookUpData?.callTouchWorkflow?.data[0]?.lookupValue
        ? lookUpData.callTouchWorkflow.data[0].lookupValue
        : 'N',
    [lookUpData]
  );

  const lookUpActions = useMemo(
    () =>
      lookUpActionsData && lookUpActionsData?.outcomeAction?.data
        ? lookUpActionsData.outcomeAction.data
        : [],
    [lookUpActionsData]
  );

  const handleSortAscending = (arr) => {
    const sortedValue =
      arr && arr.sort((a, b) => a.lookupOrder - b.lookupOrder);
    return sortedValue;
  };

  const workFlowsID = [];
  const editFlowsID = [];
  const actions = [];
  const selectedCadences = [];

  if (editFlag && editOutcome) {
    for (let l = 0; l < editOutcome.length; l++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let tempArr = {};
      tempArr = { [editOutcome[l]['outcome']]: editOutcome[l]['id'] };
      workFlowsID.push(tempArr);
      tempArr = {
        [editOutcome[l]['outcome']]:
          editOutcome[l]['associations']['outcome'][0]['id'],
      };
      editFlowsID.push(tempArr);
      tempArr = { [editOutcome[l]['outcome']]: editOutcome[l]['action'] };
      actions.push(tempArr);
      tempArr = {
        [editOutcome[l]['outcome']]: editOutcome[l]['associations']['cadence']
          ? editOutcome[l]['associations']['cadence'][0]['id']
          : 0,
      };
      selectedCadences.push(tempArr);
    }
  }

  useEffect(() => handleWorkFlow(workFlowCreateData, loading));

  if (loading)
    return (
      <Row>
        <Col>
          <Progress animated color="primary" value="100">
            Loading outcomes
          </Progress>
        </Col>
      </Row>
    );

  const orderCallOutcomes = (data) => {
    const talkerOutcome = [];
    const daOutcome = [];
    data &&
      data.forEach((outcome) => {
        if (outcome.dialingAgent) {
          daOutcome.push(outcome);
        } else {
          talkerOutcome.push(outcome);
        }
      });
    return [...talkerOutcome, ...daOutcome];
  };

  const workflowdatas =
    // get data from appropriate endpoint based on isoutcome
    !error && isoutcome && workflowdata
      ? workflowdata.outcomes && workflowdata.outcomes.data
      : workflowdata && workflowdata.callDispositions
      ? orderCallOutcomes(workflowdata.callDispositions.data)
      : [];

  const workflow = [];
  // eslint-disable-next-line no-var
  var workFlowCreateData = [];
  let workFLowEditID, outcomeEditID, cadenceEditID, actionName;

  if (editFlag) {
    for (let i = 0; i < workflowdatas.length; i++) {
      let temp = {};
      // eslint-disable-next-line array-callback-return
      const wID = workFlowsID.find((data) => {
        if (Object.keys(data)[0] === workflowdatas[i]['name']) {
          return data;
        }
      });

      if (wID) workFLowEditID = wID[workflowdatas[i]['name']];

      // eslint-disable-next-line array-callback-return
      const oID = editFlowsID.find((data) => {
        if (Object.keys(data)[0] === workflowdatas[i]['name']) {
          return data;
        }
      });

      if (oID) outcomeEditID = oID[workflowdatas[i]['name']];

      // eslint-disable-next-line array-callback-return
      const cID = selectedCadences.find((data) => {
        if (Object.keys(data)[0] === workflowdatas[i]['name']) {
          return data;
        }
      });

      if (cID) cadenceEditID = cID[workflowdatas[i]['name']];

      // eslint-disable-next-line array-callback-return
      const aID = actions.find((data) => {
        if (Object.keys(data)[0] === workflowdatas[i]['name']) {
          return data;
        }
      });

      if (aID) actionName = aID[workflowdatas[i]['name']];
      if (wID) {
        temp = {
          id: workFLowEditID,
          outcomeID: outcomeEditID ? outcomeEditID : workflowdatas[i]['id'],
          outcome: workflowdatas[i]['name'],
          action: moveCadences[workflowdatas[i]['name']]
            ? moveCadences[workflowdatas[i]['name']]
            : actionName,
          movedToMultiTouchId: selectCadences[workflowdatas[i]['name']]
            ? selectCadences[workflowdatas[i]['name']]
            : cadenceEditID,
        };
        workflow.push(temp);
      } else if (tdDialer) {
        temp = {
          outcomeID: editFlowsID[workflowdatas[i]['name']]
            ? editFlowsID[workflowdatas[i]['name']]
            : workflowdatas[i]['id'],
          outcome: workflowdatas[i]['name'],
          action: moveCadences[workflowdatas[i]['name']]
            ? moveCadences[workflowdatas[i]['name']]
            : workflowdatas[i]['defaultAction'],
          movedToMultiTouchId: selectCadences[workflowdatas[i]['name']]
            ? selectCadences[workflowdatas[i]['name']]
            : 0,
        };
        workflow.push(temp);
      }
    }
  } else {
    for (let i = 0; i < workflowdatas.length; i++) {
      let temp = {};

      temp = {
        outcomeID: editFlowsID[workflowdatas[i]['name']]
          ? editFlowsID[workflowdatas[i]['name']]
          : workflowdatas[i]['id'],
        outcome: workflowdatas[i]['name'],
        action: moveCadences[workflowdatas[i]['name']]
          ? moveCadences[workflowdatas[i]['name']]
          : workflowdatas[i]['defaultAction'],
        movedToMultiTouchId: selectCadences[workflowdatas[i]['name']]
          ? selectCadences[workflowdatas[i]['name']]
          : 0,
      };
      workflow.push(temp);
    }
  }

  if (editFlag) {
    for (let j = 0; j < workflow.length; j++) {
      let temp = {};
      if (workflow[j]['id']) {
        temp = {
          id: workflow[j]['id'],
          outcome: { id: workflow[j]['outcomeID'] },
          action: workflow[j]['action'],
          cadence: { id: workflow[j]['movedToMultiTouchId'] },
        };
      } else {
        temp = {
          outcome: { id: workflow[j]['outcomeID'] },
          action: workflow[j]['action'],
          cadence: { id: workflow[j]['movedToMultiTouchId'] },
        };
      }
      workFlowCreateData.push(temp);
    }
  } else {
    for (let j = 0; j < workflow.length; j++) {
      let temp = {};
      temp = {
        outcome: { id: workflow[j]['outcomeID'] },
        action: workflow[j]['action'],
        cadence: { id: workflow[j]['movedToMultiTouchId'] },
      };
      workFlowCreateData.push(temp);
    }
  }

  return (
    <>
      {error && (
        <Row>
          <span className="text-center mb-0 w-100 text-danger">
            <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
            Failed to fetch data
          </span>
        </Row>
      )}
      {!error &&
        workflow.length > 0 &&
        workflow.map((column, index) => {
          return (
            <div key={index} className="px-4">
              <Label for="time_to_wait_and_execute" className="text-bold mb-1">
                {column.outcome}
              </Label>
              <Row>
                <Col md={6} className="pr-0">
                  <FormGroup>
                    <Input
                      type="select"
                      name="action"
                      value={column.action}
                      onChange={(e) => {
                        if (e.target.value !== 'Move To Another Cadence') {
                          setSelectCadences({
                            ...selectCadences,
                            [column.outcome]: '0',
                          });
                        }
                        setMoveCadences({
                          ...moveCadences,
                          [column.outcome]: e.currentTarget.value,
                        });
                      }}
                    >
                      {!lookUpActionsLoading &&
                        !lookUpActionsError &&
                        lookUpActions &&
                        handleSortAscending(lookUpActions)
                          .filter((action, i) => {
                            return !(
                              lookUpValue === 'N' &&
                              action.lookupValue === 'No Action'
                            );
                          })
                          .map((action, i) => {
                            return (
                              <option
                                value={action.lookupValue}
                                key={i}
                                className="text-break"
                              >
                                {action.lookupValue}
                              </option>
                            );
                          })}
                      {lookUpActionsError && (
                        <React.Fragment key={column.outcome}>
                          <option value="Exit Cadence">Exit Cadence</option>
                          <option value="Move To Next Touch">
                            Move To Next Touch
                          </option>
                          <option value="Move To Another Cadence">
                            Move To Another Cadence
                          </option>
                          <option
                            hidden={lookUpValue === 'N'}
                            value="No Action"
                          >
                            No Action
                          </option>
                        </React.Fragment>
                      )}
                    </Input>
                  </FormGroup>
                </Col>

                <Col md={6} className="pr-3">
                  <FormGroup>
                    <DropDown
                      value={column.movedToMultiTouchId}
                      data={cadenceList}
                      name="movedToMultiTouchId"
                      placeHolder="Select Cadence"
                      disabled={column.action !== 'Move To Another Cadence'}
                      onChange={(value) => {
                        setSelectCadences({
                          ...selectCadences,
                          [column.outcome]: value,
                        });
                      }}
                      loading={cadences.loading}
                      handleClose={true}
                      direction="left"
                    />
                    <p
                      className="text-danger text-sm"
                      hidden={
                        !(
                          column.action === 'Move To Another Cadence' &&
                          (column.movedToMultiTouchId === 0 ||
                            parseInt(selectCadences[column.outcome]) === 0)
                        )
                      }
                    >
                      Please select the cadence
                    </p>
                  </FormGroup>
                </Col>
              </Row>
            </div>
          );
        })}

      {workflowdatas.length === 0 && !error && !loading && (
        <Row>
          <span className="text-center mb-0 w-100 text-warning">
            <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
            Failed to fetch data
          </span>
        </Row>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  cadences: state.cadences,
});

export default connect(mapStateToProps, { getAllCadences })(WorkflowActions);
