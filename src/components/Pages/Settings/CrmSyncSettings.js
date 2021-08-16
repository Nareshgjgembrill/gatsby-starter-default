import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  Table,
} from 'reactstrap';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { parseUrl } from 'query-string';
import { getAllCadences, getAllUsers } from '../../../store/actions/actions';
import {
  DELETE_WORKFLOW_SETTINGS_QUERY,
  DELETE_WORKFLOW_CRITERIA_SETTINGS_QUERY,
  FETCH_SYNC_SETTINGS_QUERY,
  FETCH_ALL_OUTCOMES_QUERY,
  FETCH_CALL_OUTCOMES_QUERY,
  FETCH_DROPDOWN_QUERY,
  FETCH_WORKFLOW_SETTINGS_QUERY,
  FETCH_CRM_WORKFLOW_CRITERIA_SETTINGS_QUERY,
  FETCH_FILTERED_CADENCES,
  UPDATE_SYNC_SETTINGS_QUERY,
  UPDATE_SYNC_FROM_TRUCADENCE_TO_CRM_SETTINGS_QUERY,
  UPDATE_SYNC_FROM_CRM_TO_TRUCADENCE_QUERY,
} from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
import Button from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import SyncActivityGrid from './SyncActivityGrid';
import { toast } from 'react-toastify';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const CrmSyncSettings = ({ getAllCadences, cadences, getAllUsers, users }) => {
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;

  const [outcomesData, setOutcomesData] = useState([]);
  const [showApiLimit, setShowApiLimit] = useState(true);
  const [showCrmToTrucadence, setShowCrmToTrucadence] = useState(true);
  const [showTrucadenceToCrm, setShowTrucadenceToCrm] = useState(true);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [syncActivityCheckedAll, setSyncActivityCheckedAll] = useState(false);
  const [showSyncActivity, setShowSyncActivity] = useState(false);
  const [crmToTrucadence, setCrmToTrucadence] = useState();
  const [updateCrmToTrucadence, setUpdateCrmToTrucadence] = useState();
  const [trucadenceToCrm, setTrucadenceToCrm] = useState();
  const [workflowResponse, setWorkflowResponse] = useState([]);
  const [workflowCriteriaData, setWorkflowCriteriaData] = useState([]);
  const [updateTrucadenceToCrm, setUpdateTrucadenceToCrm] = useState();
  const [
    showDeleteWorkflowConfirmModal,
    setShowDeleteWorkflowConfirmModal,
  ] = useState(false);
  const [
    showDeleteWorkflowCriteriaConfirmModal,
    setShowDeleteWorkflowCriteriaConfirmModal,
  ] = useState(false);
  const [newCriteriaId, setNewCriteriaId] = useState(-5);
  const [workflowId, setWorkflowId] = useState();
  const [workflowCriteriaId, setWorkflowCriteriaId] = useState([]);
  const [workflowDetails, setWorkflowDetails] = useState([]);
  const [newWorkflowId, setNewWorkflowId] = useState(0);
  const [apiCallsUsed, setApiCallsUsed] = useState();
  const [workflowSaved, setWorkflowSaved] = useState(false);
  const [crmApiLimit, setCrmApiLimit] = useState(0);
  const [crmAdminUser, setCrmAdminUser] = useState();
  const [syncFrequencyMinutes, setSyncFrequencyMinutes] = useState();
  const [workflowSettingsLoading, setWorkflowSettingsLoading] = useState(false);
  const [syncActivitySettingLoading, setSyncActivitySettingsLoading] = useState(
    false
  );

  useEffect(() => {
    if (!cadences.fetchedAll) getAllCadences(currentUserId, apiURL, token);
    if (!users.fetchedAll) getAllUsers(currentUserId, apiURL, token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const upAngle = 'fas fa-angle-up fa-lg text-primary mr-2';
  const downAngle = 'fas fa-angle-down fa-lg text-primary mr-2';
  const subDownAngle = 'fas fa-angle-down fa-lg text-primary mx-2';
  const subUpAngle = 'fas fa-angle-up fa-lg text-primary mx-2';
  const { query: searchParams } = parseUrl(window.location.search);
  const pageCount = 0;
  const [count, setCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [limit, setLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );

  const {
    data: crmSyncSettings,
    loading: syncSettingLoading,
    error: syncSettingsError,
    refetch: refetchCrmSyncData,
  } = useQuery(FETCH_SYNC_SETTINGS_QUERY, {
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch sync settings',
        crmSyncSettings,
        'fetch_crm_sync_settings'
      );
    },
  });

  const { data: dropdownData, error: prospectFieldDropdownError } = useQuery(
    FETCH_DROPDOWN_QUERY,
    {
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to fetch dropdown.',
          dropdownData,
          'fetch_dropdown'
        );
      },
    }
  );

  const {
    data: fetchAllOutcomesData,
    loading: fetchAllOutcomesLoading,
    error: fetchAllOutcomesError,
    refetch: refetchTouchOutcome,
  } = useQuery(FETCH_ALL_OUTCOMES_QUERY, {
    variables: { limit, offset },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch all outcomes',
        fetchAllOutcomesData,
        'fetch_all_outcomes'
      );
    },
  });

  const {
    data: fetchWorkflowData,
    loading: fetchWorkflowLoading,
    error: fetchWorkflowError,
    refetch: refetchWorkFlow,
  } = useQuery(FETCH_WORKFLOW_SETTINGS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch workflow data.',
        fetchWorkflowData,
        'fetch_workflow_data'
      );
    },
  });

  const {
    data: fetchCrmWorkflowCriteriaData,
    loading: fetchCrmWorkflowCriteriaLoading,
    error: fetchCrmWorkflowCriteriaError,
    refetch: refetchWorkFlowCriteria,
  } = useQuery(FETCH_CRM_WORKFLOW_CRITERIA_SETTINGS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch workflow criteria data.',
        fetchCrmWorkflowCriteriaData,
        'fetch_workflow_criteria_data'
      );
    },
  });

  const {
    data: fetchCallOutcomesData,
    loading: fetchCallOutcomesLoading,
    error: fetchCallOutcomesError,
    refetch: refetchCallTouchOutcome,
  } = useQuery(FETCH_CALL_OUTCOMES_QUERY, {
    variables: { limit, offset },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch call outcomes',
        fetchCallOutcomesData,
        'fetch_call_outcomes'
      );
    },
  });

  const [
    updateCrmSyncSettings,
    { data: updateCrmSyncData, loading: updateCrmSyncLoading },
  ] = useLazyQuery(UPDATE_SYNC_SETTINGS_QUERY, {
    onCompleted: (response) => updateCrmSyncSettingsCallback(response, true),
    onError: (response) => updateCrmSyncSettingsCallback(response),
  });

  const [
    updateFromTrucadenceToCrm,
    {
      data: updateFromTrucadenceToCrmData,
      loading: updateFromTrucadenceToCrmLoading,
    },
  ] = useLazyQuery(UPDATE_SYNC_FROM_TRUCADENCE_TO_CRM_SETTINGS_QUERY, {
    onCompleted: (response) =>
      updateFromTrucadenceToCrmCallback(response, true),
    onError: (response) => updateFromTrucadenceToCrmCallback(response),
  });

  const [
    updateFromCrmToTrucadence,
    {
      data: updateFromCrmToTrucadenceData,
      loading: updateFromCrmToTrucadenceLoading,
    },
  ] = useLazyQuery(UPDATE_SYNC_FROM_CRM_TO_TRUCADENCE_QUERY, {
    onCompleted: (response) =>
      updateFromCrmToTrucadenceCallback(response, true),
    onError: (response) => updateFromCrmToTrucadenceCallback(response),
  });

  const [
    deleteWorkflow,
    { data: deleteWorkflowData, loading: deleteWorkflowLoading },
  ] = useLazyQuery(DELETE_WORKFLOW_SETTINGS_QUERY, {
    onCompleted: (response) => deleteWorkflowCallback(response, true),
    onError: (response) => deleteWorkflowCallback(response),
  });

  const [
    deleteWorkflowCriteria,
    {
      data: deleteWorkflowCriteriaData,
      loading: deleteWorkflowCriteriaLoading,
    },
  ] = useLazyQuery(DELETE_WORKFLOW_CRITERIA_SETTINGS_QUERY, {
    onCompleted: (response) => deleteWorkflowCriteriaCallback(response, true),
    onError: (response) => deleteWorkflowCriteriaCallback(response),
  });

  const newCriteriaRow = {
    clFieldName: '',
    id: newCriteriaId,
    operator: '',
    value: '',
  };

  const newWorkFlowBlock = {
    id: newWorkflowId,
    action: '',
    logicalOperator: '',
    movedToMultiTouchId: 0,
    recordType: '',
    criteriaData: [
      {
        clFieldName: '',
        id: -1,
        operator: '',
        value: '',
      },
      {
        clFieldName: '',
        id: -2,
        operator: '',
        value: '',
      },
      {
        clFieldName: '',
        id: -3,
        operator: '',
        value: '',
      },
    ],
  };
  const updateCrmSyncSettingsCallback = (response, status) => {
    if (status) {
      if (workflowSaved) {
        notify(
          'Workflow has been saved successfully!',
          'success',
          'update_crm_sync_settings'
        );
        setWorkflowSaved(false);
        setWorkflowSettingsLoading(false);
        setSyncActivitySettingsLoading(false);
      } else {
        setWorkflowSettingsLoading(false);
        setSyncActivitySettingsLoading(false);
        notify(
          'Sync settings has been saved successfully!',
          'success',
          'update_crm_sync_settings'
        );
      }
      refetchCrmSyncData();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update sync settings.',
        updateCrmSyncData,
        'fetch_crm_sync_settings'
      );
    }
  };
  const updateFromTrucadenceToCrmCallback = (response, status) => {
    if (status) {
      const input = {
        allowSyncFromMultitouchToCrm: trucadenceToCrm,
        updateMultitouchUponCrmUpdate: updateTrucadenceToCrm,
      };
      updateCrmSyncSettings({
        variables: {
          input,
        },
      });
      refetchTouchOutcome();
      refetchCallTouchOutcome();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update from cadence to crm.',
        updateFromTrucadenceToCrmData,
        'update_from_cadence_to_crm'
      );
    }
  };

  const updateFromCrmToTrucadenceCallback = (response, status) => {
    if (status) {
      setWorkflowSettingsLoading(true);
      const input = {
        allowSyncFromCrmToMultitouch: crmToTrucadence,
        updateCrmUponMultitouchUpdate: updateCrmToTrucadence,
      };
      updateCrmSyncSettings({
        variables: {
          input,
        },
      });
      setWorkflowSaved(true);
      refetchWorkFlow();
      refetchWorkFlowCriteria();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update from crm to cadence.',
        updateFromCrmToTrucadenceData,
        'update_from_crm_to_cadence'
      );
    }
  };

  const deleteWorkflowCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify(
        'Workflow has been deleted successfully!',
        'success',
        'delete_workflow_settings'
      );
      setShowDeleteWorkflowConfirmModal(false);
      refetchWorkFlow();
    } else {
      setShowDeleteWorkflowConfirmModal(false);
      showErrorMessage(
        response,
        'Sorry! Failed to delete workflow',
        deleteWorkflowData,
        'delete_workflow_settings'
      );
    }
  };

  const deleteWorkflowCriteriaCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify(
        'Workflow criteria has been deleted successfully!',
        'success',
        'delete_workflow_criteria'
      );
      const currentFields = workflowDetails;
      currentFields.forEach((cf, i) => {
        if (cf.id === workflowId) {
          currentFields[i].criteriaData = currentFields[i].criteriaData.filter(
            (ff) => ff.id !== workflowCriteriaId
          );
        }
      });
      setWorkflowDetails([...workflowDetails], currentFields);
      setShowDeleteWorkflowCriteriaConfirmModal(false);
      refetchWorkFlowCriteria();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete workflow criteria',
        deleteWorkflowCriteriaData,
        'delete_workflow_criteria'
      );
      setShowDeleteWorkflowCriteriaConfirmModal(false);
    }
  };

  // setting total count for data to display in sync activity
  useEffect(() => {
    setCount(
      fetchCallOutcomesData?.call?.paging?.totalCount +
        fetchAllOutcomesData?.allOutcomes?.paging?.totalCount
    );
  }, [fetchAllOutcomesData, fetchCallOutcomesData]);

  // setting outcomes data to display in sync activity table
  useEffect(() => {
    if (
      fetchCallOutcomesData !== undefined &&
      fetchAllOutcomesData !== undefined
    ) {
      const callOutcomesData = fetchCallOutcomesData?.call?.data.map((item) => {
        const productsArray = [];
        if (item.personalDialer) {
          productsArray.push('PD');
        }
        if (item.teamDialer) {
          productsArray.push('TD');
        }
        if (item.clickDialer) {
          productsArray.push('CD');
        }
        const products = productsArray.join(',');
        return {
          id: item.id,
          defaultAction: item.defaultAction,
          outcomeGroup: item.memberStage,
          outComes: item.name,
          productType: products,
          touchType: 'Call',
          displayMetrics: item.enableForReport,
          isSelected: item.createActivity,
        };
      });

      const emailOutcomesData = fetchAllOutcomesData?.allOutcomes?.data
        .filter((item) => {
          return item.touchType.toLowerCase() === 'email';
        })
        .map((item) => {
          const touchType =
            item.touchType.charAt(0).toUpperCase() +
            item.touchType.slice(1).toLowerCase();
          return {
            id: item.id,
            defaultAction: item.defaultAction,
            outcomeGroup: item.memberStage,
            outComes: item.name,
            productType: item.productType,
            touchType: touchType,
            displayMetrics: item.showOnMetrics,
            isSelected: item.createActivity,
          };
        });

      const textOutcomesData = fetchAllOutcomesData?.allOutcomes?.data
        .filter((item) => {
          return item.touchType.toLowerCase() === 'text';
        })
        .map((item) => {
          const touchType =
            item.touchType.charAt(0).toUpperCase() +
            item.touchType.slice(1).toLowerCase();
          return {
            id: item.id,
            defaultAction: item.defaultAction,
            outcomeGroup: item.memberStage,
            outComes: item.name,
            productType: item.productType,
            touchType: touchType,
            displayMetrics: item.showOnMetrics,
            isSelected: item.createActivity,
          };
        });

      const linkedinOutcomesData = fetchAllOutcomesData?.allOutcomes?.data
        .filter((item) => {
          return item.touchType.toLowerCase() === 'linkedin';
        })
        .map((item) => {
          const touchType =
            item.touchType.charAt(0).toUpperCase() +
            item.touchType.slice(1).toLowerCase();
          return {
            id: item.id,
            defaultAction: item.defaultAction,
            outcomeGroup: item.memberStage,
            outComes: item.name,
            productType: item.productType,
            touchType: touchType,
            displayMetrics: item.showOnMetrics,
            isSelected: item.createActivity,
          };
        });

      const otherOutcomesData = fetchAllOutcomesData?.allOutcomes?.data
        .filter((item) => {
          return (
            item.touchType.toLowerCase() === 'others' ||
            item.touchType.toLowerCase() === 'other'
          );
        })
        .map((item) => {
          const touchType =
            item.touchType.charAt(0).toUpperCase() +
            item.touchType.slice(1).toLowerCase();
          return {
            id: item.id,
            defaultAction: item.defaultAction,
            outcomeGroup: item.memberStage,
            outComes: item.name,
            productType: item.productType,
            touchType: touchType,
            displayMetrics: item.showOnMetrics,
            isSelected: item.createActivity,
          };
        });

      setOutcomesData([
        ...callOutcomesData,
        ...emailOutcomesData,
        ...textOutcomesData,
        ...linkedinOutcomesData,
        ...otherOutcomesData,
      ]);
    }
  }, [fetchAllOutcomesData, fetchCallOutcomesData]);

  let userList = '';
  if (users) {
    userList = users.data.map((us) => {
      return (
        <option value={us.id} key={us.id}>
          {us.displayName}
        </option>
      );
    });
  }

  let clFieldName;
  if (dropdownData?.dropdownField?.data) {
    clFieldName = dropdownData.dropdownField.data
      .filter((field) => field?.associations?.fieldMapping?.length > 0)
      .map((df) => {
        return (
          <option value={df.clFieldName} key={df.id}>
            {df.label}
          </option>
        );
      });
  }

  const { data: fetchFilteredCadencesData } = useQuery(
    FETCH_FILTERED_CADENCES,
    {
      variables: {
        userId: currentUserId,
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to fetch cadences',
          fetchFilteredCadencesData,
          'fetch_filtered_cadences'
        );
      },
    }
  );

  const cadenceDropDown = fetchFilteredCadencesData?.cadenceList?.data?.map(
    (item) => {
      return (
        <option value={item.id} key={item.id}>
          {item.name}
        </option>
      );
    }
  );

  let syncSettings = {};
  if (
    crmSyncSettings &&
    crmSyncSettings.syncsettings &&
    crmSyncSettings.syncsettings.data
  ) {
    syncSettings = crmSyncSettings.syncsettings.data[0];
  }

  useEffect(() => {
    crmSyncSettings &&
      crmSyncSettings.syncsettings &&
      crmSyncSettings.syncsettings.data.forEach((item) => {
        setCrmApiLimit(item.allowedApiLimit24hours);
        setSyncFrequencyMinutes(item.syncFrequencyMinutes);
        setCrmAdminUser(item.crmAdminUserId);
        setCrmToTrucadence(item.allowSyncFromCrmToMultitouch);
        setUpdateCrmToTrucadence(item.updateCrmUponMultitouchUpdate);
        setTrucadenceToCrm(item.allowSyncFromMultitouchToCrm);
        setUpdateTrucadenceToCrm(item.updateMultitouchUponCrmUpdate);
        setApiCallsUsed(item.totalNoOfApisUsedInLast24Hours);
      });
  }, [crmSyncSettings]);

  const crmApiSubmit = () => {
    if (
      syncSettings.allowedApiLimit24hours === crmApiLimit &&
      syncSettings.syncFrequencyMinutes === syncFrequencyMinutes &&
      syncSettings.crmAdminUserId === crmAdminUser
    ) {
      notify('No changes were found to save', 'error', 'no_changes_detected');
      return false;
    } else if (
      crmApiLimit === '' ||
      syncFrequencyMinutes === '' ||
      crmAdminUser === ''
    ) {
      notify(
        'Please fill all mandatory fields',
        'error',
        'fill_mandatory_fields'
      );
      return false;
    }
    const input = {
      allowedApiLimit24hours: parseInt(crmApiLimit),
      crmAdminUser: { id: parseInt(crmAdminUser) },
      syncFrequencyMinutes: parseInt(syncFrequencyMinutes),
    };
    updateCrmSyncSettings({
      variables: {
        input,
      },
    });
  };

  const saveTrucadenceToCrmSettings = () => {
    if (trucadenceToCrm && updateTrucadenceToCrm && showSyncActivity) {
      const inputData = outcomesData.map((cao) => {
        return {
          id: cao.id,
          touchType: cao.touchType === 'Social' ? 'Others' : cao.touchType,
          createActivity: cao.isSelected,
        };
      });
      updateFromTrucadenceToCrm({
        variables: { input: { outcomes: inputData } },
      });
    } else {
      setSyncActivitySettingsLoading(true);
      const input = {
        allowSyncFromMultitouchToCrm: trucadenceToCrm,
        updateMultitouchUponCrmUpdate: updateTrucadenceToCrm,
      };
      updateCrmSyncSettings({
        variables: {
          input,
        },
      });
    }
  };

  const columns = [
    {
      Header: 'Touch Type',
      accessor: 'touchType',
      width: '20%',
      textAlign: 'center',
      Cell: function (props) {
        if (props.value === 'Others') {
          return 'Social';
        }
        return props.value;
      },
    },
    {
      Header: 'Touch Outcomes',
      accessor: 'outComes',
      width: '65%',
      textAlign: 'center',
    },
  ];

  const showCrmAPI = () => {
    setShowApiLimit(!showApiLimit);
  };
  const showCrmSync = () => {
    setShowCrmToTrucadence(!showCrmToTrucadence);
  };
  const showTrucadenceSync = () => {
    setShowTrucadenceToCrm(!showTrucadenceToCrm);
  };

  const showWorkFlowCriteria = () => {
    setShowWorkflow(!showWorkflow);
  };
  const showActivity = () => {
    setShowSyncActivity(!showSyncActivity);
  };

  // this function is called when checkbox is clicked in the table
  const changeCheckBoxState = (row, count) => {
    const currentOutcomesFields = outcomesData;
    // all selected
    if (row === true) {
      // set checked all
      setSyncActivityCheckedAll(true);
      // update outcomes fields
      currentOutcomesFields.forEach((outcome) => {
        outcome.isSelected = true;
      });

      // all unselected
    } else if (row === false) {
      setSyncActivityCheckedAll(false);
      currentOutcomesFields.forEach((outcome) => {
        outcome.isSelected = false;
      });

      // a row checkbox is clicked
    } else {
      setSyncActivityCheckedAll(false);
      currentOutcomesFields.forEach((outcome) => {
        if (outcome.id === row.original.id) {
          outcome.isSelected = !row.original.isSelected;
        }
      });
    }

    // set outcome data
    setOutcomesData([...outcomesData], currentOutcomesFields);
  };

  const handleDeleteCriteriaRow = (e, crId, wfId) => {
    e.preventDefault();
    setWorkflowCriteriaId(crId);
    setWorkflowId(wfId);
    setShowDeleteWorkflowCriteriaConfirmModal(true);
  };
  const changeCriteriaRow = (e, wfId, criId, value, name) => {
    const currentWorkFlowFields = workflowDetails;
    currentWorkFlowFields.forEach((awfr, i) => {
      if (awfr.id === wfId) {
        // eslint-disable-next-line
        currentWorkFlowFields[i].criteriaData.find((ci) => {
          if (ci.id === criId) {
            if (name === 'clFieldName') {
              ci.operator = '';
              ci.value = '';
            }
            switch (name) {
              case 'clFieldName':
                ci.clFieldName = e.currentTarget.value;
                break;
              case 'operator':
                ci.operator = e.currentTarget.value;
                break;
              case 'value':
                ci.value = e.currentTarget.value;
                break;
              default:
                break;
            }
          }
        });
      }
    });
    setWorkflowDetails([...workflowDetails], currentWorkFlowFields);
  };

  const CommonOperators = () => {
    return (
      <>
        <option value="contains">contains</option>
        <option value="equals">equals</option>
        <option value="not equal to">not equal to</option>
        <option value="starts with">starts with</option>
      </>
    );
  };

  const BooleanAndSelectOperators = () => {
    return (
      <>
        <option value="equals">equals</option>
        <option value="not equal to">not equal to</option>
      </>
    );
  };

  const DateAndNumberOperators = () => {
    return (
      <>
        <option value="equals">equals</option>
        <option value="greater than">greater than</option>
        <option value="greater or equal">greater or equal</option>
        <option value="less than">less than</option>
        <option value="less or equal">less or equal</option>
        <option value="not equal to">not equal to</option>
      </>
    );
  };

  const WorkFlowCriteriaRow = (data) => {
    const criteriaId = data.data.id;
    const wId = data.wflowId;
    const fieldName = data.data.clFieldName;
    const operator = data.data.operator;
    let controlType = 'text';
    let dataType = 'text';
    dropdownData &&
      // eslint-disable-next-line array-callback-return
      dropdownData.dropdownField.data.filter((fd) => {
        if (fd.clFieldName === fieldName && fieldName !== 'tag') {
          controlType =
            fd.controlType === 'integer'
              ? 'number'
              : fd.controlType === 'timestamp'
              ? 'date'
              : fd.controlType === 'boolean'
              ? 'text'
              : fd.controlType;
          dataType = fd.controlType;
        }
      });
    const [rowValue, setRowValue] = useState(data.data.value);
    return (
      <tbody className="p-0">
        <tr>
          <td>
            <Input
              type="select"
              value={fieldName}
              onChange={(e) =>
                changeCriteriaRow(e, wId, criteriaId, fieldName, 'clFieldName')
              }
            >
              <option>
                {prospectFieldDropdownError
                  ? 'Failed to fetch prospect fields'
                  : ''}
              </option>
              {clFieldName}
            </Input>
          </td>
          <td>
            <Input
              type="select"
              value={operator}
              onChange={(e) =>
                changeCriteriaRow(e, wId, criteriaId, operator, 'operator')
              }
            >
              <option></option>
              {dataType === 'date' ||
              dataType === 'timestamp' ||
              dataType === 'integer' ? (
                <DateAndNumberOperators />
              ) : dataType === 'boolean' || dataType === 'select' ? (
                <BooleanAndSelectOperators />
              ) : (
                <CommonOperators />
              )}
            </Input>
          </td>
          <td>
            <Input
              type={controlType}
              value={rowValue}
              onMouseLeave={(e) => {
                if (dataType !== 'date' && dataType !== 'timestamp') {
                  changeCriteriaRow(e, wId, criteriaId, operator, 'value');
                }
              }}
              onChange={(e) => {
                if (dataType === 'date' || dataType === 'timestamp') {
                  changeCriteriaRow(e, wId, criteriaId, operator, 'value');
                }

                setRowValue(e.currentTarget.value);
              }}
            ></Input>
          </td>
          <td>
            <i
              className="far fa-trash-alt text-danger pointer"
              title="Delete Row"
              onClick={(e) => {
                handleDeleteCriteriaRow(e, criteriaId, wId);
              }}
            ></i>
          </td>
        </tr>
      </tbody>
    );
  };
  const handleChangeWorkFlowValues = (currentValue, workflowId, name) => {
    const currentFields = workflowDetails;
    currentFields.forEach((item) => {
      if (item.id === workflowId) {
        switch (name) {
          case 'recordType':
            item.recordType = currentValue;
            item.criteriaData.forEach((cd) => {
              cd.clFieldName = '';
              cd.operator = '';
              cd.value = '';
            });
            break;
          case 'operator':
            item.logicalOperator = currentValue;
            break;
          case 'action':
            item.action = currentValue;
            break;
          case 'cadence':
            item.movedToMultiTouchId = parseInt(currentValue);
            break;
          default:
            break;
        }
      }
    });
    setWorkflowDetails([...workflowDetails], currentFields);
  };

  const handleWorkFlowDelete = (e, wfId) => {
    e.preventDefault();
    setWorkflowId(wfId);
    setShowDeleteWorkflowConfirmModal(true);
  };

  const WorkFlowSection = (workFlowData) => {
    const id = workFlowData.number;
    const recordType = workFlowData.workFlowData.recordType;
    const wfID = workFlowData.workFlowData.id;
    const action = workFlowData.workFlowData.action;
    const cadence = workFlowData.workFlowData.movedToMultiTouchId;
    const operator = workFlowData.workFlowData.logicalOperator;
    const criteriaData = workFlowData.workFlowData.criteriaData;
    const criteriaChildren = [];

    if (criteriaData !== undefined) {
      criteriaData.forEach((data, i) => {
        criteriaChildren.push(
          <WorkFlowCriteriaRow data={data} wflowId={wfID} key={i} />
        );
      });
    }
    return (
      <div>
        <FormGroup row>
          <Label sm={3} className="ml-4">
            Choose Record Type
          </Label>
          <Col sm={4}>
            <Input
              type="select"
              value={recordType}
              onChange={(e) => {
                handleChangeWorkFlowValues(e.target.value, wfID, 'recordType');
              }}
            >
              <option></option>
              <option value="contact">Contact</option>
              <option value="lead">Lead</option>
            </Input>
          </Col>
          <Col sm={1}>
            <Button outline color="light">
              <i
                className="far fa-trash-alt text-danger pointer"
                title="Delete Work Flow"
                onClick={(e) => {
                  handleWorkFlowDelete(e, wfID);
                }}
              ></i>
            </Button>
          </Col>
        </FormGroup>
        <Card className="b">
          <CardHeader className="border-bottom">
            <div className="card-tool float-right">
              <i
                className="fas fa-plus text-primary mr-2"
                title="Add Row"
                onClick={() => {
                  addCriteriaRow(wfID);
                }}
              ></i>
              <i
                className="fas fa-sync-alt text-primary"
                title="Reset Row"
                onClick={() => {
                  resetCriteriaRow();
                }}
              ></i>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table striped hover id={'filter_row_' + id}>
              <thead>
                <tr>
                  <td>Prospect Field</td>
                  <td>Operator</td>
                  <td>Value</td>
                  <td>Action</td>
                </tr>
              </thead>
              {criteriaChildren}
            </Table>
            <FormGroup row className="ml-3">
              <Col sm={12} md={6}>
                <Input
                  type="radio"
                  name={'criteriaMatchs' + id + ''}
                  id={'all_criteria_must_match_' + id}
                  value="AND"
                  checked={operator === 'AND'}
                  onChange={(e) => {
                    handleChangeWorkFlowValues(
                      e.target.value,
                      wfID,
                      'operator'
                    );
                  }}
                />
                <Label for={'all_criteria_must_match_' + id}>
                  All Criteria's Must Match(AND)
                </Label>
              </Col>
              <Col sm={12} md={6}>
                <Input
                  type="radio"
                  id={'any_one_criteria_match_' + id}
                  name={'criteriaMatchs' + id + ''}
                  value="OR"
                  checked={operator === 'OR'}
                  onChange={(e) => {
                    handleChangeWorkFlowValues(
                      e.target.value,
                      wfID,
                      'operator'
                    );
                  }}
                />
                <Label for={'any_one_criteria_match_' + id}>
                  Any one Criteria Matchs(OR)
                </Label>
              </Col>
            </FormGroup>

            <Row>
              <FormGroup row className="col-md-6 pr-4 pl-5">
                <Label className="pt-2"> Choose Action</Label>
                <Col md={7}>
                  <Input
                    type="select"
                    value={action}
                    onChange={(e) => {
                      handleChangeWorkFlowValues(
                        e.target.value,
                        wfID,
                        'action'
                      );
                    }}
                  >
                    <option></option>
                    <option value="EXIT_CADENCE">Exit Cadence</option>
                    <option value="MOVE_TO_ANOTHER_CADENCE">
                      Move to Another Cadence
                    </option>
                    <option value="MOVE_TO_NEXT_TOUCH">
                      Move to next Touch
                    </option>
                  </Input>
                </Col>
              </FormGroup>
              <FormGroup
                row
                style={{
                  display: action === 'MOVE_TO_ANOTHER_CADENCE' ? '' : 'none',
                }}
                className="col-md-6"
              >
                <Label className="pt-2"> Choose Cadence</Label>
                <Col md={7}>
                  <Input
                    type="select"
                    value={cadence}
                    onChange={(e) => {
                      handleChangeWorkFlowValues(
                        e.target.value,
                        wfID,
                        'cadence'
                      );
                    }}
                  >
                    <option value={0}></option>
                    {cadenceDropDown}
                  </Input>
                </Col>
              </FormGroup>
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  };

  const wfChildren = [];
  useEffect(() => {
    fetchCrmWorkflowCriteriaData &&
      fetchCrmWorkflowCriteriaData.crmworkflowcriteria &&
      fetchCrmWorkflowCriteriaData.crmworkflowcriteria.data &&
      setWorkflowCriteriaData(
        fetchCrmWorkflowCriteriaData.crmworkflowcriteria.data.map(
          (data) => data
        )
      );
  }, [fetchCrmWorkflowCriteriaData]);

  useEffect(() => {
    fetchWorkflowData &&
      fetchWorkflowData.crmworkflow &&
      fetchWorkflowData.crmworkflow.data &&
      setWorkflowResponse(fetchWorkflowData.crmworkflow.data);
  }, [fetchWorkflowData]);

  useEffect(() => {
    const workFlowWithCriteria = [];
    if (workflowResponse.length > 0 && !fetchCrmWorkflowCriteriaLoading) {
      workflowResponse.forEach((wfc) => {
        const workFlowDataCriteriaId = wfc.associations.criteria;
        const criteriaData = [];
        let criteriaDatas = [];
        if (workflowCriteriaData) {
          workFlowDataCriteriaId.forEach((da) => {
            workflowCriteriaData.forEach((data) => {
              if (data.id === da.id) {
                criteriaData.push(data);
              }
            });
          });
        }
        if (criteriaData.length > 0) {
          criteriaDatas = criteriaData.filter((cd) => {
            return cd !== undefined;
          });
        } else {
          criteriaDatas.push(newCriteriaRow);
        }
        workFlowWithCriteria.push({
          id: wfc.id,
          action: wfc.action,
          logicalOperator: wfc.logicalOperator,
          movedToMultiTouchId: wfc.movedToMultiTouchId,
          recordType: wfc.recordType,
          criteriaData: criteriaDatas,
        });
      });
      setWorkflowDetails(workFlowWithCriteria);
    } else {
      const workFlows = [];
      workFlows.push(newWorkFlowBlock);
      setWorkflowDetails(workFlows);
    }
    // eslint-disable-next-line
  }, [workflowResponse, workflowCriteriaData]);

  if (
    fetchWorkflowData &&
    fetchWorkflowData.crmworkflow &&
    fetchWorkflowData.crmworkflow.data
  ) {
    workflowDetails.forEach((data, i) => {
      wfChildren.push(
        <WorkFlowSection
          key={i}
          number={i}
          workFlowData={data}
          id={'worf_flow_section_' + i}
          isCount
        />
      );
    });
  }

  const addCriteriaRow = (wfid) => {
    setNewCriteriaId(newCriteriaId - 1);
    const currentWorkFlowFields = workflowDetails;
    currentWorkFlowFields.forEach((awfr, i) => {
      if (awfr.id === wfid) {
        currentWorkFlowFields[i].criteriaData.push(newCriteriaRow);
      }
    });
    setWorkflowDetails([...workflowDetails], currentWorkFlowFields);
  };

  const resetCriteriaRow = () => {
    const currentWorkFlowFields = workflowDetails;
    const workFlows = currentWorkFlowFields.filter((wf) => {
      return wf.id > 0;
    });
    if (workFlows.length > 0) {
      workFlows.forEach((cwfr, i) => {
        currentWorkFlowFields[i].criteriaData = currentWorkFlowFields[
          i
        ].criteriaData.filter((wr) => {
          return wr.id > 0;
        });
      });
    } else {
      workFlows.push(newWorkFlowBlock);
    }
    setWorkflowDetails(workFlows);
  };

  const addWorkFlowBlock = () => {
    let addBlock = true;
    const currentWorkFlowFields = workflowDetails;
    if (currentWorkFlowFields.length > 0) {
      currentWorkFlowFields.forEach((cwfr, i) => {
        if (
          cwfr.recordType === '' ||
          cwfr.recordType === null ||
          cwfr.recordType === undefined
        ) {
          notify(
            'Please select the record type.',
            'error',
            'select_record_type'
          );
          addBlock = false;
          return false;
        } else if (
          currentWorkFlowFields[i].criteriaData.length > 0 &&
          currentWorkFlowFields[i].criteriaData[0].clFieldName === ''
        ) {
          notify(
            'Please select the prospect field, operator and its value.',
            'error',
            'choose_prospect_field'
          );
          addBlock = false;
          return false;
        } else if (cwfr.logicalOperator === '') {
          notify(
            'Please fill all mandatory fields.',
            'error',
            'fields_missing'
          );
          addBlock = false;
          return false;
        } else if (cwfr.action === '') {
          notify(
            'Please select the action type.',
            'error',
            'select_action_type'
          );
          addBlock = false;
          return false;
        } else if (
          cwfr.action === 'MOVE_TO_ANOTHER_CADENCE' &&
          cwfr.movedToMultiTouchId === 0
        ) {
          notify('Please select the cadence.', 'error', 'select_cadence');
          addBlock = false;
          return false;
        }
      });
    }
    if (addBlock) {
      setNewWorkflowId(newWorkflowId - 1);
      newWorkFlowBlock.id = newWorkflowId - 1;
      currentWorkFlowFields.push(newWorkFlowBlock);
      setWorkflowDetails([...workflowDetails], currentWorkFlowFields);
    }
  };

  const saveCrmToTrucadenceSettings = () => {
    let saveWorkflow = true;
    const currentInputFields = workflowDetails;
    // workflow is saved only when both checkboxes are selected and workflow rules are shown (and checkboxes are saved in onComplete), otherwise only checkboxes are saved
    if (crmToTrucadence && updateCrmToTrucadence && showWorkflow) {
      if (currentInputFields.length > 0) {
        currentInputFields.forEach((cwfr, i) => {
          if (
            cwfr.recordType === '' ||
            cwfr.recordType === null ||
            cwfr.recordType === undefined
          ) {
            notify(
              'Please select the record type.',
              'error',
              'select_record_type'
            );
            saveWorkflow = false;
            return false;
          }
          if (cwfr?.criteriaData?.length > 0) {
            for (const criteria of cwfr?.criteriaData) {
              if (criteria?.clFieldName?.trim() === '') {
                notify(
                  'Please choose the prospect field',
                  'error',
                  'choose_prospect_field'
                );
                saveWorkflow = false;
                break;
              }
              if (criteria?.operator?.trim() === '') {
                notify(
                  'Please choose the operator',
                  'error',
                  'choose_operator'
                );
                saveWorkflow = false;
                break;
              }
              if (criteria?.value?.trim() === '') {
                notify('Please choose the value', 'error', 'choose_value');
                saveWorkflow = false;
                break;
              }
            }
          }
          if (cwfr.logicalOperator === '') {
            notify(
              'Please fill all mandatory fields.',
              'error',
              'fields_missing'
            );
            saveWorkflow = false;
            return false;
          }
          if (cwfr.action === '') {
            notify(
              'Please select the action type.',
              'error',
              'select_action_type'
            );
            saveWorkflow = false;
            return false;
          }
          if (
            cwfr.action === 'MOVE_TO_ANOTHER_CADENCE' &&
            cwfr.movedToMultiTouchId === 0
          ) {
            notify('Please select the cadence.', 'error', 'select_cadence');
            saveWorkflow = false;
            return false;
          }
        });
      }

      if (saveWorkflow) {
        const workflow = currentInputFields.map((inputData) => {
          const criteria = inputData.criteriaData.map((cd) => {
            return {
              operator: cd.operator,
              id: cd.id > 0 ? cd.id : undefined,
              clFieldName: cd.clFieldName,
              value: cd.value,
            };
          });
          return {
            id: inputData.id > 0 ? inputData.id : undefined,
            logicalOperator: inputData.logicalOperator,
            action: inputData.action,
            recordType: inputData.recordType,
            movedToMultiTouchId: inputData.movedToMultiTouchId,
            criteria: criteria,
          };
        });
        updateFromCrmToTrucadence({
          variables: {
            input: { workflow: workflow },
          },
        });
      }
    } else if (!showWorkflow) {
      setWorkflowSettingsLoading(true);
      const input = {
        allowSyncFromCrmToMultitouch: crmToTrucadence,
        updateCrmUponMultitouchUpdate: updateCrmToTrucadence,
      };
      updateCrmSyncSettings({
        variables: {
          input,
        },
      });
    }
  };

  const CrmToTrucadenceSection = () => {
    return (
      <Collapse isOpen={showCrmToTrucadence}>
        <Form>
          <CardBody>
            <FormGroup check sm={9}>
              <Input
                type="checkbox"
                id="crm_to_trucadence"
                name="crmToTrucadence"
                checked={crmToTrucadence}
                onChange={() => {
                  setCrmToTrucadence(!crmToTrucadence);
                  if (!crmToTrucadence) {
                    setUpdateCrmToTrucadence(false);
                  }
                }}
              />
              <Label for="crm_to_trucadence">
                <strong>Do you want to Sync data from CRM to Cadence ?</strong>
              </Label>
            </FormGroup>
            <FormGroup
              check
              sm={9}
              style={{ display: crmToTrucadence === true ? '' : 'none' }}
            >
              <Input
                type="checkbox"
                id="sync_update_crm_to_trucadence"
                name="syncUpdateCrmToTrucadence"
                checked={updateCrmToTrucadence}
                onChange={() =>
                  setUpdateCrmToTrucadence(!updateCrmToTrucadence)
                }
              />
              <Label for="sync_update_crm_to_trucadence">
                Syncing updates taking place in CRM to Cadence
              </Label>
            </FormGroup>
            <Card className="bt bb">
              <div
                style={{
                  cursor: 'pointer',
                  display:
                    crmToTrucadence === true && updateCrmToTrucadence === true
                      ? ''
                      : 'none',
                }}
                onClick={showWorkFlowCriteria}
                className="bg-gray-lighter text-bold"
              >
                <i className={showWorkflow ? subUpAngle : subDownAngle}></i>
                Criteria for Workflow Execution and Corresponding Action
              </div>
              <Collapse
                isOpen={
                  showWorkflow && crmToTrucadence && updateCrmToTrucadence
                }
              >
                <CardBody className="pr-0 pl-0">
                  {wfChildren}
                  <Row>
                    <Col className="">
                      <span
                        className="text-primary pointer float-right mr-3"
                        onClick={() => {
                          addWorkFlowBlock();
                        }}
                      >
                        <i className="fas fa-plus mr-2"></i>Add Workflow
                      </span>
                    </Col>
                  </Row>
                </CardBody>
              </Collapse>
              <ConfirmModal
                confirmBtnIcon="fas fa-trash"
                confirmBtnText="Delete"
                handleCancel={() =>
                  setShowDeleteWorkflowCriteriaConfirmModal(false)
                }
                handleConfirm={() => {
                  if (workflowCriteriaId > 0) {
                    deleteWorkflowCriteria({
                      variables: { id: workflowCriteriaId },
                    });
                  } else {
                    const currentFields = workflowDetails;
                    currentFields.forEach((cf, i) => {
                      if (cf.id === workflowId) {
                        currentFields[i].criteriaData = currentFields[
                          i
                        ].criteriaData.filter(
                          (ff) => ff.id !== workflowCriteriaId
                        );
                      }
                    });
                    setWorkflowDetails([...workflowDetails], currentFields);
                    setShowDeleteWorkflowCriteriaConfirmModal(false);
                  }
                }}
                showConfirmBtnSpinner={deleteWorkflowCriteriaLoading}
                showConfirmModal={showDeleteWorkflowCriteriaConfirmModal}
                confirmBtnColor="danger"
              >
                <span>
                  Are you sure you want to delete this worflow criteria?
                </span>
              </ConfirmModal>
            </Card>
            <Button
              color="primary"
              icon={
                updateFromCrmToTrucadenceLoading || workflowSettingsLoading
                  ? 'fas fa-spinner fa-spin'
                  : 'fas fa-check'
              }
              disabled={
                updateFromCrmToTrucadenceLoading || workflowSettingsLoading
              }
              onClick={() => {
                saveCrmToTrucadenceSettings();
              }}
            >
              {updateFromCrmToTrucadenceLoading || workflowSettingsLoading
                ? 'Wait'
                : 'Save'}
            </Button>
          </CardBody>
        </Form>
      </Collapse>
    );
  };

  const TrucadenceToCrmSection = () => {
    return (
      <Collapse isOpen={showTrucadenceToCrm}>
        <CardBody>
          <FormGroup check sm={9}>
            <Input
              type="checkbox"
              id="trucadence_to_crm"
              name="TrucadenceToCrm"
              checked={trucadenceToCrm === true}
              onChange={() => {
                setTrucadenceToCrm(!trucadenceToCrm);
                if (!trucadenceToCrm === false) {
                  setUpdateTrucadenceToCrm(false);
                }
              }}
            />
            <Label for="trucadence_to_crm">
              <strong>Do you want to Sync data from Cadence to CRM ?</strong>
            </Label>
          </FormGroup>
          <FormGroup
            check
            sm={9}
            style={{ display: trucadenceToCrm === true ? '' : 'none' }}
          >
            <Input
              type="checkbox"
              id="sync_update_trucadence_to_crm"
              name="syncUpdateTrucadenceToCrm"
              checked={updateTrucadenceToCrm === true}
              onChange={() => setUpdateTrucadenceToCrm(!updateTrucadenceToCrm)}
            />
            <Label for="sync_update_trucadence_to_crm">
              Syncing updates taking place in Cadence to CRM
            </Label>
          </FormGroup>
          <div
            style={{
              display:
                updateTrucadenceToCrm === true && trucadenceToCrm === true
                  ? ''
                  : 'none',
            }}
            onClick={showActivity}
            className="bg-gray-lighter text-bold mb-2 pointer"
          >
            {' '}
            <i className={showSyncActivity ? subUpAngle : subDownAngle}></i>
            <strong>Sync Activitiy</strong>{' '}
          </div>
          <Collapse
            style={{ display: updateTrucadenceToCrm ? '' : 'none' }}
            isOpen={
              showSyncActivity && trucadenceToCrm && updateTrucadenceToCrm
            }
            className="card card-default border-top-0"
          >
            <p className="ml-2">
              Choose Outcomes that should create activity in CRM
            </p>
            <SyncActivityGrid
              columns={columns}
              data={outcomesData}
              loading={fetchCallOutcomesLoading}
              error={fetchCallOutcomesError}
              fetchData={({ pageIndex, pageSize }) => {
                setOffset(pageIndex);
                setCurrentPageIndex(pageIndex);
                setLimit(pageSize);
                if (!currentUrlStatePushed) {
                  window.history.replaceState({}, '', window.location.href);
                  setCurrentUrlStatePushed(true);
                }
                const { query } = parseUrl(window.location.search);
                query['page[limit]'] = pageSize;
                query['page[offset]'] = pageIndex;
                const searchString = Object.entries(query)
                  .map(([key, val]) => `${key}=${val}`)
                  .join('&');
                window.history.replaceState({}, '', '?' + searchString);
              }}
              pageSize={limit}
              pageCount={pageCount}
              currentPageIndex={currentPageIndex}
              changeCheckBoxState={changeCheckBoxState}
              syncActivityCheckedAll={syncActivityCheckedAll}
              handleRefresh={() => {
                refetchTouchOutcome();
                refetchCallTouchOutcome();
              }}
              totalCount={count}
            />
          </Collapse>
          <Button
            color="primary"
            disabled={
              updateFromTrucadenceToCrmLoading || syncActivitySettingLoading
            }
            icon={
              updateFromTrucadenceToCrmLoading || syncActivitySettingLoading
                ? 'fas fa-spinner fa-spin'
                : 'fas fa-check'
            }
            onClick={saveTrucadenceToCrmSettings}
          >
            {updateFromTrucadenceToCrmLoading || syncActivitySettingLoading
              ? 'Wait'
              : 'Save'}
          </Button>
        </CardBody>
      </Collapse>
    );
  };

  return (
    <Card className="b">
      <CardHeader className="border-bottom">
        <strong>CRM Sync Settings</strong>
      </CardHeader>
      <div
        className="p-2 bb bt bg-gray-lighter text-bold pointer"
        onClick={showCrmAPI}
      >
        <i className={showApiLimit ? upAngle : downAngle}></i>
        <span className="text-primary">CRM API Limits</span>
        <i
          className={
            syncSettingLoading &&
            !workflowSettingsLoading &&
            !syncActivitySettingLoading
              ? 'ml-2 fas fa-spinner fa-spin'
              : ''
          }
        ></i>
        <i
          className={
            syncSettingsError
              ? 'fas fa-exclamation-circle text-danger ml-2'
              : ''
          }
          title={syncSettingsError ? 'Failed to fetch Data' : ''}
        ></i>
      </div>
      <Collapse isOpen={showApiLimit}>
        <CardBody>
          <Form autoComplete="off">
            <FormGroup row>
              <Label sm={3}>Cadence is Allowed to use</Label>
              <Col sm={4}>
                <Input
                  type="number"
                  min="0"
                  name="allowedApiLimit24hours"
                  id="allowed_api_limit_24hours"
                  value={crmApiLimit}
                  max="50000"
                  onChange={(e) => {
                    if (e.currentTarget.value.length < 6) {
                      setCrmApiLimit(e.currentTarget.value);
                    }
                  }}
                ></Input>
              </Col>
              <Label sm={4}>CRM API calls in a 24 hour period.</Label>
            </FormGroup>
            <FormGroup row>
              <Label sm={12}>
                {'Cadence has used ' +
                  apiCallsUsed +
                  ' CRM API calls during the past 24 hours period.'}
              </Label>
            </FormGroup>
            <FormGroup row>
              <Label sm={3}>Please select CRM Admin</Label>
              <Col sm={4}>
                <Input
                  type="select"
                  name="crmAdminUserId"
                  id="crm_admin_user_id"
                  value={crmAdminUser}
                  onChange={(e) => {
                    setCrmAdminUser(e.currentTarget.value);
                  }}
                >
                  <option></option>
                  {userList}
                </Input>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label sm={3}>Sync Frequency</Label>
              <Col sm={4}>
                <Input
                  type="select"
                  name="syncFrequencyMinutes"
                  id="sync_frequency_minutes"
                  value={syncFrequencyMinutes}
                  onChange={(e) => {
                    setSyncFrequencyMinutes(e.currentTarget.value);
                  }}
                >
                  <option></option>
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="120">2 Hours</option>
                  <option value="240">4 Hours</option>
                </Input>
              </Col>
            </FormGroup>
            <Button
              disabled={
                updateCrmSyncLoading &&
                !workflowSettingsLoading &&
                !syncActivitySettingLoading
              }
              icon={
                updateCrmSyncLoading &&
                !workflowSettingsLoading &&
                !syncActivitySettingLoading
                  ? 'fas fa-spinner fa-spin'
                  : 'fas fa-check'
              }
              color="primary"
              onClick={() => {
                crmApiSubmit();
              }}
            >
              {updateCrmSyncLoading &&
              !workflowSettingsLoading &&
              !syncActivitySettingLoading
                ? 'Wait'
                : 'Save'}
            </Button>
          </Form>
        </CardBody>
      </Collapse>
      <div
        className="p-2 bb bt bg-gray-lighter text-bold pointer"
        onClick={showCrmSync}
      >
        <i className={showCrmToTrucadence ? upAngle : downAngle}></i>
        <span className="text-primary">Sync From CRM To Cadence</span>
        <i
          className={
            fetchWorkflowLoading || fetchCrmWorkflowCriteriaLoading
              ? 'ml-2 fas fa-spinner fa-spin'
              : ''
          }
        ></i>
        <i
          className={
            fetchWorkflowError || fetchCrmWorkflowCriteriaError
              ? 'fas fa-exclamation-circle text-danger ml-2'
              : ''
          }
          title={
            fetchWorkflowError || fetchCrmWorkflowCriteriaError
              ? 'Failed to fetch Data'
              : ''
          }
        ></i>
      </div>
      <CrmToTrucadenceSection />
      <div
        className="p-2 bb bt bg-gray-lighter text-bold pointer"
        onClick={showTrucadenceSync}
      >
        <i className={showTrucadenceToCrm ? upAngle : downAngle}></i>
        <span className="text-primary">Sync From Cadence To CRM</span>
        <i
          className={
            fetchAllOutcomesLoading || fetchCallOutcomesLoading
              ? 'ml-2 fas fa-spinner fa-spin'
              : ''
          }
        ></i>
        <i
          className={
            fetchAllOutcomesError || fetchCallOutcomesError
              ? 'fas fa-exclamation-circle text-danger ml-2'
              : ''
          }
          title={
            fetchAllOutcomesError || fetchCallOutcomesError
              ? 'Failed to fetch Data'
              : ''
          }
        ></i>
      </div>
      <TrucadenceToCrmSection />
      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        handleCancel={() => setShowDeleteWorkflowConfirmModal(false)}
        handleConfirm={() => {
          if (workflowId > 0) {
            deleteWorkflow({ variables: { id: workflowId } });
          } else {
            let currentFields = workflowDetails;
            currentFields = currentFields.filter((wf) => wf.id !== workflowId);
            setWorkflowDetails(currentFields);
            setShowDeleteWorkflowConfirmModal(false);
          }
        }}
        showConfirmBtnSpinner={deleteWorkflowLoading}
        showConfirmModal={showDeleteWorkflowConfirmModal}
        confirmBtnColor="danger"
      >
        <span>Are you sure you want to delete this workflow?</span>
      </ConfirmModal>
    </Card>
  );
};
const mapStateToProps = (state) => ({
  cadences: state.cadences,
  users: state.users,
});
export default connect(mapStateToProps, { getAllCadences, getAllUsers })(
  CrmSyncSettings
);
