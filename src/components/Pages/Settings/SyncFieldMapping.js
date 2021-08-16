import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { Card, Col, Input, Progress, UncontrolledCollapse } from 'reactstrap';
import moment from 'moment-timezone';
import Button from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import {
  FETCH_ALL_FIELDS_QUERY,
  FETCH_CRM_ACCOUNT_FIELDS_QUERY,
  FETCH_CRM_CONTACT_FIELDS_QUERY,
  FETCH_CRM_LEAD_FIELDS_QUERY,
  FETCH_CRM_ACTIVITIES_FIELDS_QUERY,
  FETCH_ALL_ACTIVITIES_FIELD_MAPPING_QUERY,
  DELETE_ACTIVITY_DATA_QUERY,
  UPDATE_FIELD_MAPPING_QUERY,
  ADD_FIELD_MAPPING_QUERY,
} from '../../queries/SettingsQuery';
import SyncFieldMappingGrid from './SyncFieldMappingGrid';
import AddMergeVariable from './AddMergeVariable';
import ActivityDataGrid from './ActivityDataGrid';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const SyncFieldMapping = () => {
  const upAngle = 'fas fa-angle-up fa-lg text-primary mr-2';
  const downAngle = 'fas fa-angle-down fa-lg text-primary mr-2';
  const [show, setShow] = useState(true);
  const [activeShow, setActiveShow] = useState(true);
  const [showMergeModal, setShowMergeModal] = useState(false);
  // current fields are used to hold the temporary changes in fields are rules when changes are made
  const [currentContactFields, setCurrentContactFields] = useState();
  const [currentLeadFields, setCurrentLeadFields] = useState();
  // 'field changes' hold the final changes to be sent to api when 'save' is clicked
  // some fields have only contact, lead or both. here we are only saving the existing fields
  const [contactFieldChanges, setContactFieldChanges] = useState([]);
  const [leadFieldChanges, setLeadFieldChanges] = useState([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [activityFieldMappingData, setActivityFieldMappingData] = useState([]);
  const [activityId, setActivityId] = useState();
  const [emptyRowId, setEmptyRowId] = useState(-1);
  const [allSyncFieldMappingData, setAllSyncFieldMappingData] = useState([]);
  const [saveButtonClickedType, setSaveButtonClickedType] = useState('');

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const allSyncFields = [];
  const syncToCrmDropdown = [
    {
      value: 'Use TruCadence data to update CRM',
      id: 'Use Cadence data to update CRM',
    },
    {
      value: 'Use TruCadence data to update CRM only if CRM field is empty',
      id: 'Use Cadence data to update CRM only if CRM field is empty',
    },
    {
      value:
        'Use most recent data from either system be used to update the other',
      id: 'Use most recent data from either system to update the other',
    },
    {
      value: 'Do NOT update CRM',
      id: 'Do NOT update CRM',
    },
  ];

  const syncToTrucadenceDropdown = [
    {
      value: 'Use CRM data to update TruCadence',
      id: 'Use CRM data to update Cadence',
    },
    {
      value:
        'Use CRM data to update TruCadence only if the TruCadence field is empty',
      id: 'Use CRM data to update Cadence only if Cadence field is empty',
    },
    {
      value:
        'Use most recent data from either system be used to update the other',
      id: 'Use most recent data from either system to update the other',
    },
    {
      value: 'Do NOT update TruCadence',
      id: 'Do NOT update Cadence',
    },
  ];

  const {
    data: fetchCrmContactFieldsData,
    loading: fetchCrmContactFieldsLoading,
    refetch: refetchCrmContactFields,
  } = useQuery(FETCH_CRM_CONTACT_FIELDS_QUERY, {
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch CRM Contact Fields.',
        fetchCrmContactFieldsData,
        'fetch_crm_contact_fields'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: fetchAllFieldsData,
    loading: fetchAllFieldsLoading,
    refetch: refetchAllFields,
  } = useQuery(FETCH_ALL_FIELDS_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      setContactFieldChanges([]);
      setLeadFieldChanges([]);
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch All Fields.',
        fetchAllFieldsData,
        'fetch_all_fields'
      );
    },
  });

  const {
    data: fetchCrmLeadFieldsData,
    loading: fetchCrmLeadFieldsLoading,
    refetch: refetchCrmLeadFields,
  } = useQuery(FETCH_CRM_LEAD_FIELDS_QUERY, {
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch CRM Lead Fields.',
        fetchCrmLeadFieldsData,
        'fetch_crm_lead_fields'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: fetchCrmAccountFieldsData,
    loading: fetchCrmAccountFieldsLoading,
    refetch: refetchCrmAccountFields,
  } = useQuery(FETCH_CRM_ACCOUNT_FIELDS_QUERY, {
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch CRM Account Fields.',
        fetchCrmAccountFieldsData,
        'fetch_crm_account_fields'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: fetchCrmActivitiesFieldsData,
    refetch: refetchCrmActivitiesFields,
  } = useQuery(FETCH_CRM_ACTIVITIES_FIELDS_QUERY, {
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch CRM Activities Fields.',
        fetchCrmActivitiesFieldsData,
        'fetch_crm_activities_fields'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: fetchAllActivitiesFieldMappingData,
    refetch: refetchAllActivitiesFieldMapping,
  } = useQuery(FETCH_ALL_ACTIVITIES_FIELD_MAPPING_QUERY, {
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch all activities field mapping.',
        fetchAllActivitiesFieldMappingData,
        'fetch_all_activities_field_mapping'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  const contactFields = useMemo(
    () =>
      fetchCrmContactFieldsData &&
      fetchCrmContactFieldsData?.contactFields?.data,
    [fetchCrmContactFieldsData]
  );

  const leadFields = useMemo(
    () => fetchCrmLeadFieldsData && fetchCrmLeadFieldsData?.leadFields?.data,
    [fetchCrmLeadFieldsData]
  );

  const removeDuplicateFields = (fields) => {
    const uniqueValues = Array.from(
      new Set(fields?.map((a) => a?.fieldAPIName))
    ).map((fieldAPIName) => {
      return fields.find((a) => a?.fieldAPIName === fieldAPIName);
    });
    return uniqueValues;
  };

  const [
    updateFieldMapping,
    { data: updateFieldData, loading: updateFieldLoading },
  ] = useLazyQuery(UPDATE_FIELD_MAPPING_QUERY, {
    onCompleted: (response) => {
      setSaveButtonClickedType('');
      handleUpdateFieldMappingRequestCallback(response, true);
    },
    onError: (response) => handleUpdateFieldMappingRequestCallback(response),
  });

  const [
    updateFieldMappingWithoutRefetch,
    {
      data: updateFieldDataWithoutRefetch,
      loading: updateFieldLoadingWithoutRefetch,
    },
  ] = useLazyQuery(UPDATE_FIELD_MAPPING_QUERY, {
    onCompleted: (response) => {
      notify('Saved successfully!', 'success', 'update_field_without_refetch');
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Sorry! Failed to save',
        updateFieldDataWithoutRefetch,
        'update_field_without_refetch'
      );
    },
  });

  const [
    addFieldMapping,
    { data: addFieldData, loading: addFieldLoading },
  ] = useLazyQuery(ADD_FIELD_MAPPING_QUERY, {
    onCompleted: (response) => {
      handleAddFieldMappingRequestCallback(response, true);
    },
    onError: (response) => handleAddFieldMappingRequestCallback(response),
  });

  const fieldLoading =
    updateFieldLoading || updateFieldLoadingWithoutRefetch || addFieldLoading;

  const [
    deleteActivityDataField,
    { data: deleteActivityData, loading: deleteActivityDataLoading },
  ] = useLazyQuery(DELETE_ACTIVITY_DATA_QUERY, {
    onCompleted: (response) =>
      handleDeleteActivityRequestCallback(response, true),
    onError: (response) => handleDeleteActivityRequestCallback(response),
  });

  useEffect(() => {
    fetchAllActivitiesFieldMappingData &&
      setActivityFieldMappingData(
        fetchAllActivitiesFieldMappingData?.allActivityMapping?.data
      );
  }, [fetchAllActivitiesFieldMappingData]);

  useEffect(() => {
    if (fetchAllFieldsData !== undefined) {
      setCurrentContactFields(
        fetchAllFieldsData?.allFields?.includedAssociations?.fieldMappings.filter(
          (item) => {
            return item.recordType.toLowerCase() === 'contact';
          }
        )
      );
      setCurrentLeadFields(
        fetchAllFieldsData?.allFields?.includedAssociations?.fieldMappings.filter(
          (item) => {
            return item.recordType.toLowerCase() === 'lead';
          }
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllFieldsData]);

  // creating sync field mapping data list
  useEffect(() => {
    if (fetchAllFieldsData !== undefined) {
      // filtering out some internal fields and those fields who doesn't have any mapping ids or record type is not contact or lead
      const fetchAllFieldsDataFiltered = fetchAllFieldsData?.allFields?.data.filter(
        (item) => {
          let isAllowed = true;
          if (
            item.associations.fieldMapping.length === 0 ||
            item.name === 'timezone' ||
            item.name === 'recordType' ||
            item.name === 'contactName' ||
            item.name === 'sfReportName'
          ) {
            isAllowed = false;
          }

          const mappingIds = [];
          item.associations.fieldMapping.forEach((subItem) =>
            mappingIds.push(subItem.id)
          );
          fetchAllFieldsData.allFields.includedAssociations.fieldMappings.forEach(
            (subItem) => {
              if (
                mappingIds.indexOf(subItem.id) !== -1 &&
                subItem.recordType !== 'Contact' &&
                subItem.recordType !== 'Lead'
              ) {
                isAllowed = false;
              }
            }
          );

          return isAllowed;
        }
      );

      // standard, custom and implicit fields
      const standardFields = fetchAllFieldsDataFiltered?.filter(
        (item) => item.implicit === true && item.clNativeColumn === false
      );
      const customFields = fetchAllFieldsDataFiltered?.filter(
        (item) => item.implicit === false && item.clNativeColumn === false
      );
      const implicitFields = fetchAllFieldsDataFiltered?.filter(
        (item) => item.implicit === false && item.clNativeColumn === true
      );
      if (standardFields && customFields && implicitFields) {
        allSyncFields.push(
          ...standardFields,
          ...customFields,
          ...implicitFields
        );
      }

      // looping through all sync fields
      const allFieldMappingList = allSyncFields?.map((item) => {
        const fieldId = item.id,
          name = item.label;
        let contactId = -1,
          leadId = -1,
          crmLeadField = null,
          crmContactField = null,
          fieldSyncRuleFromCadence,
          fieldSyncRuleToCadence,
          lastModifiedDate,
          hasContact = false,
          hasLead = false;
        let lastModifiedDateContact, lastModifiedDateLead;

        // mapping data
        const mappingIds = [];
        item.associations.fieldMapping.forEach((subItem) =>
          mappingIds.push(subItem.id)
        );
        const fieldMappingData = fetchAllFieldsData?.allFields?.includedAssociations?.fieldMappings.filter(
          (item) => {
            return mappingIds.indexOf(item.id) !== -1;
          }
        );

        // looping through mapping data (contact or lead)
        fieldMappingData.forEach((subItem) => {
          if (subItem.recordType === 'Contact') {
            contactId = subItem.id;
            crmContactField = subItem.crmFieldName;
            fieldSyncRuleFromCadence = subItem.syncRuleFromTrucadence;
            fieldSyncRuleToCadence = subItem.syncRuleToTrucadence;
            lastModifiedDateContact = subItem.modifiedDateTime;
            hasContact = true;
          } else if (subItem.recordType === 'Lead') {
            leadId = subItem.id;
            crmLeadField = subItem.crmFieldName;
            fieldSyncRuleFromCadence = subItem.syncRuleFromTrucadence;
            fieldSyncRuleToCadence = subItem.syncRuleToTrucadence;
            lastModifiedDateLead = subItem.modifiedDateTime;
            hasLead = true;
          } else {
            return false;
          }
        });

        // if there is no mapping, don't show the rules
        if (crmContactField === null && crmLeadField === null) {
          fieldSyncRuleFromCadence = '';
          fieldSyncRuleToCadence = '';
        }

        // getting the most recent last modified date of either contact or lead field
        if (hasContact && hasLead) {
          if (
            lastModifiedDateContact !== null &&
            lastModifiedDateLead !== null
          ) {
            lastModifiedDate = moment.max([
              moment(lastModifiedDateContact),
              moment(lastModifiedDateLead),
            ]);
          } else if (
            lastModifiedDateContact !== null &&
            lastModifiedDateLead === null
          ) {
            lastModifiedDate = lastModifiedDateContact;
          } else if (
            lastModifiedDateContact === null &&
            lastModifiedDateLead !== null
          ) {
            lastModifiedDate = lastModifiedDateLead;
          } else if (
            lastModifiedDateContact === null &&
            lastModifiedDateLead === null
          ) {
            lastModifiedDate = null;
          }
        } else if (hasContact && !hasLead) {
          lastModifiedDate = lastModifiedDateContact;
        } else if (hasLead && !hasContact) {
          lastModifiedDate = lastModifiedDateLead;
        }

        // returning the final data for each field. sync rules are same for both contact and lead
        return {
          fieldId: fieldId,
          name: name,
          contactId: contactId,
          leadId: leadId,
          crmLeadField: crmLeadField,
          crmContactField: crmContactField,
          fieldSyncRuleFromCadence: fieldSyncRuleFromCadence,
          fieldSyncRuleToCadence: fieldSyncRuleToCadence,
          lastModifiedDate: lastModifiedDate,
          mandatory: item.mandatory,
          implicit: item.implicit === false && item.clNativeColumn === true,
          hasContact: hasContact,
          hasLead: hasLead,
        };
      });

      // filter out those fields with no name and setting state for sync field mapping data
      setAllSyncFieldMappingData(
        allFieldMappingList.filter((afl) => {
          return afl.name !== undefined;
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllFieldsData, currentContactFields, currentLeadFields]);

  const openMergeModal = (id) => {
    setShowMergeModal(true);
    setActivityId(id);
  };

  const handleUpdateFieldOrRule = (e, record, id, fieldName, fieldId) => {
    const currentValue = e.currentTarget.value;
    // contactFieldChanges and leadFieldChanges hold only the changes
    // which are updated using the currentContactFields and currentLeadFields
    const currentChangedFields =
      record === 'Contact' ? contactFieldChanges : leadFieldChanges;
    // removing current id from currentChanges (will be added later with updated changes)
    const currentChanges = currentChangedFields.filter((fc) => {
      return fc.id !== id;
    });

    // currentContactFields and currentLeadFields hold the complete lists with all the changes
    const currentFields =
      record === 'Contact' ? currentContactFields : currentLeadFields;
    currentFields.some((item) => {
      // modifying 'item' corresponding to 'id' will change the currentFields
      // and will also change the fetchAllFieldsData.allFields.includedAssociations.fieldMappings (as objects are copied by reference)
      // when currentContactFields and currentLeadFields are changed, it will trigger useEffect, which will update the grid with updated fetchAllFieldsData.
      // when 'save' is clicked , the database will be updated for the same 'id'

      // if there are no mappings, initially the sycrules will be empty. when a mapping is added, it will also
      // update the crm sync rules automatically in the grid, as fetchAllFieldsData is updated.
      if (item.id === id) {
        switch (fieldName) {
          case 'crmFieldName':
            item.crmFieldName = currentValue;
            break;
          case 'syncRuleFromTrucadence':
            item.syncRuleFromTrucadence = currentValue;
            break;
          case 'syncRuleToTrucadence':
            item.syncRuleToTrucadence = currentValue;
            break;
          default:
            break;
        }
        // also pushing the currentFields element corresponding to current id, to currentChanges.
        // (with updated changes, as curentFields list was updated by previous change)
        currentChanges.push(item);
        return true;
      } else {
        return false;
      }
    });

    if (record === 'Contact') {
      // updating currentField list with current change
      setCurrentContactFields([...currentContactFields], currentFields);
      // saving the changes
      setContactFieldChanges(currentChanges);
    } else if (record === 'Lead') {
      setCurrentLeadFields([...currentLeadFields], currentFields);
      setLeadFieldChanges(currentChanges);
    }
  };

  const handleUpdateAndAddNewField = (
    e,
    record,
    fieldId,
    fieldSyncRuleFromCadence,
    fieldSyncRuleToCadence
  ) => {
    // update existing fields just like we do on clicking save button
    saveFieldMappings('updateAndAddNewField');

    // add new field
    const currentValue = e.currentTarget.value;
    addFieldMapping({
      variables: {
        input: {
          syncFields: [
            {
              crmFieldName: currentValue,
              field: { id: fieldId },
              recordType: record,
              syncRuleFromTrucadence: fieldSyncRuleFromCadence,
              syncRuleToTrucadence: fieldSyncRuleToCadence,
            },
          ],
        },
      },
    });
  };

  const addMergeVariable = (value, id) => {
    const currentActivityFieldMapping = activityFieldMappingData;

    currentActivityFieldMapping.forEach((item) => {
      if (item.id === id) {
        const existingValue = item.expression;
        item.expression = existingValue + ' ' + value;
      }
    });

    setActivityFieldMappingData(
      [...activityFieldMappingData],
      currentActivityFieldMapping
    );
    setShowMergeModal(false);
  };

  const handleTrucadenceActivityField = (e, id, fieldName) => {
    const currentValue = e.currentTarget.value;
    const currentActivityFields = activityFieldMappingData;
    currentActivityFields.some((af) => {
      if (af.id === id) {
        switch (fieldName) {
          case 'crmFieldName':
            af.crmFieldName = currentValue;
            break;
          case 'expression':
            af.expression = currentValue;
            break;
          default:
            break;
        }
        return true;
      } else {
        return false;
      }
    });
    setActivityFieldMappingData(
      [...activityFieldMappingData],
      currentActivityFields
    );
  };
  const handleDeleteActivityRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Deleted successfully!', 'success', 'delete_activity');
      setShowDeleteConfirmModal(false);
      refetchAllActivitiesFieldMapping();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete.',
        deleteActivityData,
        'delete_activity'
      );
    }
  };
  const handleUpdateFieldMappingRequestCallback = (
    response,
    requestSuccess
  ) => {
    if (requestSuccess) {
      notify('Saved successfully!', 'success', 'update_field');
      refetchCrmContactFields();
      refetchCrmLeadFields();
      refetchCrmAccountFields();
      refetchAllFields();
      refetchCrmActivitiesFields();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to save',
        updateFieldData,
        'update_field'
      );
    }
  };
  const handleAddFieldMappingRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Field added successfully!', 'success', 'add_field');
      refetchCrmContactFields();
      refetchCrmLeadFields();
      refetchCrmAccountFields();
      refetchAllFields();
      refetchCrmActivitiesFields();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to add field',
        addFieldData,
        'add_field'
      );
    }
  };

  const saveFieldMappings = (source) => {
    setSaveButtonClickedType('field');
    const fieldMappingData = [];
    if (contactFieldChanges.length === 0 && leadFieldChanges.length === 0) {
      if (source !== 'updateAndAddNewField') {
        notify(
          'No changes made. Pease update the changes and try again.',
          'error',
          'validation_error'
        );
      }
      return false;
    }
    [...contactFieldChanges, ...leadFieldChanges].forEach((item) => {
      fieldMappingData.push({
        id: item.id,
        crmFieldName: item.crmFieldName,
        syncRuleFromTrucadence: item.syncRuleFromTrucadence,
        syncRuleToTrucadence: item.syncRuleToTrucadence,
        recordType: item.recordType,
      });
    });

    const input = { syncFields: fieldMappingData };
    if (fieldMappingData?.length > 0) {
      if (source === 'updateAndAddNewField') {
        updateFieldMappingWithoutRefetch({
          variables: { input },
        });
      } else {
        updateFieldMapping({
          variables: { input },
        });
      }
    } else {
      if (source !== 'updateAndAddNewField') {
        notify('No changes detected.', 'error', 'validation_error');
      }
    }
  };

  const handleDeleteActivityData = (row) => {
    const id = row.original.id;
    setActivityId(id);
    setShowDeleteConfirmModal(true);
  };

  const saveActivityDataMapping = () => {
    setSaveButtonClickedType('activity');
    const activityFieldsData = activityFieldMappingData.map((item) => {
      return {
        id: item.id > 0 ? item.id : undefined,
        expression: item.expression,
        crmFieldName: item.crmFieldName,
        recordType: 'Activities',
      };
    });
    const input = { syncFields: activityFieldsData };
    updateFieldMapping({
      variables: { input },
    });
  };

  const addActivityMappingRow = () => {
    setEmptyRowId(emptyRowId - 1);
    const emptyRow = {
      id: emptyRowId,
      crmFieldName: '',
      expression: '',
    };
    const currentFields = JSON.parse(JSON.stringify(activityFieldMappingData));
    currentFields.push(emptyRow);
    setActivityFieldMappingData(currentFields);
  };

  const resetFieldRows = () => {
    setEmptyRowId(-1);
    let currentFields = JSON.parse(JSON.stringify(activityFieldMappingData));
    currentFields = currentFields.filter((data) => {
      return data.id > 0;
    });
    setActivityFieldMappingData(currentFields);
  };

  const deleteRow = () => {
    if (activityId > 0) {
      deleteActivityDataField({
        variables: { id: activityId },
      });
    } else {
      let currentFields = activityFieldMappingData;
      currentFields = currentFields.filter((data) => {
        return data.id !== activityId;
      });
      setActivityFieldMappingData(currentFields);
      notify('Deleted successfully.', 'success', 'delete_activity');
      setShowDeleteConfirmModal(false);
    }
  };

  const handleSort = (arr) => {
    const sortedValue = arr?.sort((a, b) =>
      a.fieldName.toLowerCase() > b.fieldName.toLowerCase() ? 1 : -1
    );
    return sortedValue;
  };

  const activityColumns = [
    {
      Header: 'Cadence Field',
      accessor: 'expression',
      width: '40%',
    },
    {
      Header: 'CRM Field',
      accessor: 'crmFieldName',
      width: '30%',
      Cell: function (props) {
        const id = props.row.original.id;
        return (
          <Input
            type="select"
            value={props?.value ? props.value : undefined}
            onChange={(event) => {
              handleTrucadenceActivityField(event, id, 'crmFieldName');
            }}
            style={{ height: '26px' }}
            className="p-1 text-sm mb-0"
          >
            <option></option>
            {handleSort(
              fetchCrmActivitiesFieldsData?.activityFields?.data
            )?.map((activity, i) => {
              return (
                <option
                  value={activity.fieldAPIName}
                  key={'key' + i + activity.fieldName}
                >
                  {activity.fieldName}
                </option>
              );
            })}
          </Input>
        );
      },
    },
  ];

  const syncFieldMappingColumns = [
    {
      Header: 'Cadence Field',
      accessor: 'name',
      width: '8%',
      Cell: function (props) {
        const mandatory = props.row.original.mandatory;
        return (
          <div className="text-sm mb-0 text-gray-dark">
            {props.value}
            {mandatory && <span className="text-danger">*</span>}
          </div>
        );
      },
    },
    {
      Header: 'CRM Contact',
      accessor: 'crmContactField',
      width: '10%',
      Cell: function (props) {
        const contactId = props.row.original.contactId;
        const fieldId = props.row.original.fieldId;
        const fieldName = props?.row?.original?.name?.toUpperCase();
        const fieldInfo = fetchAllFieldsData?.allFields?.includedAssociations?.fieldMappings.filter(
          (field) => field.id === contactId
        );
        const isAccountRelatedFields = fieldInfo[0]?.relationship === 'Account';
        const fieldSyncRuleFromCadence =
          props.row.original.fieldSyncRuleFromCadence;
        const fieldSyncRuleToCadence =
          props.row.original.fieldSyncRuleToCadence;
        return (
          <Input
            type="select"
            value={props?.value ? props.value : undefined}
            disabled={fieldName === 'ACCOUNT NAME' || isAccountRelatedFields}
            style={{ height: '26px' }}
            className="p-1 text-sm mb-0"
            onChange={(event) => {
              // updating existing fields/rules
              if (contactId !== -1) {
                handleUpdateFieldOrRule(
                  event,
                  'Contact',
                  contactId,
                  'crmFieldName',
                  fieldId
                );
              } else {
                // update existing fields/rules and add new field
                handleUpdateAndAddNewField(
                  event,
                  'Contact',
                  fieldId,
                  fieldSyncRuleFromCadence,
                  fieldSyncRuleToCadence
                );
              }
            }}
          >
            {fieldName === 'ACCOUNT NAME' ? (
              <option>Account Name</option>
            ) : (
              <>
                <option></option>
                {fetchCrmContactFieldsData &&
                  handleSort(removeDuplicateFields(contactFields)).map(
                    (contact) => {
                      return (
                        <option
                          value={contact.fieldAPIName}
                          key={contact.fieldAPIName}
                        >
                          {contact.fieldName}
                        </option>
                      );
                    }
                  )}
              </>
            )}
          </Input>
        );
      },
    },
    {
      Header: 'CRM Lead',
      accessor: 'crmLeadField',
      width: '10%',
      Cell: function (props) {
        const leadId = props.row.original.leadId;
        const fieldId = props.row.original.fieldId;
        const fieldName = props?.row?.original?.name?.toUpperCase();
        const fieldInfo = fetchAllFieldsData?.allFields?.includedAssociations?.fieldMappings.filter(
          (field) => field.id === leadId
        );
        const isAccountRelatedFields = fieldInfo[0]?.relationship === 'Account';
        const fieldSyncRuleFromCadence =
          props.row.original.fieldSyncRuleFromCadence;
        const fieldSyncRuleToCadence =
          props.row.original.fieldSyncRuleToCadence;
        return (
          <Input
            type="select"
            value={props?.value ? props.value : undefined}
            disabled={fieldName === 'ACCOUNT NAME' || isAccountRelatedFields}
            style={{ height: '26px' }}
            className="p-1 text-sm mb-0"
            onChange={(event) => {
              if (leadId !== -1) {
                // updating existing fields/rules
                handleUpdateFieldOrRule(
                  event,
                  'Lead',
                  leadId,
                  'crmFieldName',
                  fieldId
                );
              } else {
                // update existing fields/rules and add new field
                handleUpdateAndAddNewField(
                  event,
                  'Lead',
                  fieldId,
                  fieldSyncRuleFromCadence,
                  fieldSyncRuleToCadence
                );
              }
            }}
          >
            {fieldName === 'ACCOUNT NAME' ? (
              <option>Account Name</option>
            ) : (
              <>
                <option></option>
                {fetchCrmLeadFieldsData &&
                  handleSort(removeDuplicateFields(leadFields)).map((lead) => {
                    return (
                      <option value={lead.fieldAPIName} key={lead.fieldAPIName}>
                        {lead.fieldName}
                      </option>
                    );
                  })}
              </>
            )}
          </Input>
        );
      },
    },
    {
      Header: 'Sync to CRM',
      accessor: 'fieldSyncRuleFromCadence',
      width: '18%',
      Cell: function (props) {
        const contactId = props.row.original.contactId;
        const leadId = props.row.original.leadId;
        const fieldId = props.row.original.fieldId;
        const fieldName = props?.row?.original?.name?.toUpperCase();
        const record =
          props.row.original.hasContact && props.row.original.hasLead
            ? 'both'
            : props.row.original.hasContact
            ? 'contact'
            : 'lead';
        const fieldInfo = fetchAllFieldsData?.allFields?.includedAssociations?.fieldMappings.filter(
          (field) => field.id === contactId
        );
        const isAccountRelatedFields = fieldInfo[0]?.relationship === 'Account';
        return (
          <Input
            type="select"
            value={props?.value ? props.value : undefined}
            disabled={
              isAccountRelatedFields
                ? true
                : !(
                    fieldName !== 'ACCOUNT NAME' && !props.row.original.implicit
                  )
            }
            style={{ height: '26px' }}
            className="p-1 text-sm mb-0"
            onChange={(event) => {
              if (record === 'both') {
                handleUpdateFieldOrRule(
                  event,
                  'Contact',
                  contactId,
                  'syncRuleFromTrucadence',
                  fieldId
                );
                handleUpdateFieldOrRule(
                  event,
                  'Lead',
                  leadId,
                  'syncRuleFromTrucadence',
                  fieldId
                );
              }
              if (record === 'contact') {
                handleUpdateFieldOrRule(
                  event,
                  'Contact',
                  contactId,
                  'syncRuleFromTrucadence',
                  fieldId
                );
              }
              if (record === 'lead') {
                handleUpdateFieldOrRule(
                  event,
                  'Lead',
                  leadId,
                  'syncRuleFromTrucadence',
                  fieldId
                );
              }
            }}
          >
            {fieldName === 'ACCOUNT NAME' ? (
              <option value="Do NOT update CRM">Do NOT update CRM</option>
            ) : (
              <>
                <option></option>
                {syncToCrmDropdown.map((stc) => {
                  return (
                    <option value={stc.value} key={stc.id}>
                      {stc.id}
                    </option>
                  );
                })}
              </>
            )}
          </Input>
        );
      },
    },
    {
      Header: 'Sync to Cadence',
      accessor: 'fieldSyncRuleToCadence',
      width: '18%',
      Cell: function (props) {
        const contactId = props.row.original.contactId;
        const leadId = props.row.original.leadId;
        const fieldId = props.row.original.fieldId;
        const record =
          props.row.original.hasContact && props.row.original.hasLead
            ? 'both'
            : props.row.original.hasContact
            ? 'contact'
            : 'lead';
        const fieldInfo = fetchAllFieldsData?.allFields?.includedAssociations?.fieldMappings.filter(
          (field) => field.id === contactId
        );
        const isAccountRelatedFields = fieldInfo[0]?.relationship === 'Account';
        return (
          <Input
            type="select"
            value={props?.value ? props.value : undefined}
            disabled={
              isAccountRelatedFields ? true : !!props.row.original.implicit
            }
            style={{ height: '26px' }}
            className="p-1 text-sm mb-0"
            onChange={(event) => {
              if (record === 'both') {
                handleUpdateFieldOrRule(
                  event,
                  'Contact',
                  contactId,
                  'syncRuleToTrucadence',
                  fieldId
                );
                handleUpdateFieldOrRule(
                  event,
                  'Lead',
                  leadId,
                  'syncRuleToTrucadence',
                  fieldId
                );
              }
              if (record === 'contact') {
                handleUpdateFieldOrRule(
                  event,
                  'Contact',
                  contactId,
                  'syncRuleToTrucadence',
                  fieldId
                );
              }
              if (record === 'lead') {
                handleUpdateFieldOrRule(
                  event,
                  'Lead',
                  leadId,
                  'syncRuleToTrucadence',
                  fieldId
                );
              }
            }}
          >
            <option></option>
            {syncToTrucadenceDropdown.map((stt) => {
              return (
                <option value={stt.value} key={stt.id}>
                  {stt.id}
                </option>
              );
            })}
          </Input>
        );
      },
    },
    {
      Header: 'Last Modified',
      accessor: 'lastModifiedDate',
      width: '9%',
      Cell: function (props) {
        const modifiedDateTime = props?.value;
        const currentTimeZone = moment.tz.guess();
        const updatedDateTime = moment
          .tz(modifiedDateTime, currentTimeZone)
          .format('M/D/YYYY h:mm A');
        return (
          <div className="text-sm mb-0 text-gray-dark">
            {modifiedDateTime ? updatedDateTime : ''}
          </div>
        );
      },
    },
  ];

  const FieldMapping = () => {
    return (
      <div>
        <div
          id="lead"
          className="p-2 bg-gray-lighter text-bold pointer"
          onClick={() => setShow(!show)}
        >
          <i className={show ? upAngle : downAngle}></i>Field Mapping
        </div>
        <UncontrolledCollapse toggler="#lead" className={show ? 'show' : ''}>
          {fetchCrmContactFieldsLoading ||
          fetchCrmLeadFieldsLoading ||
          fetchCrmAccountFieldsLoading ||
          fetchAllFieldsLoading ? (
            <Col sm={6} className="my-auto">
              <Progress animated value="100" />
            </Col>
          ) : (
            <SyncFieldMappingGrid
              columns={syncFieldMappingColumns}
              data={allSyncFieldMappingData}
            />
          )}
          <Button
            color="primary"
            icon="fas fa-check"
            className="mt-2 ml-2 mb-2"
            disabled={saveButtonClickedType === 'field' && fieldLoading}
            onClick={saveFieldMappings}
          >
            {' '}
            {saveButtonClickedType === 'field' && fieldLoading
              ? 'Wait...'
              : 'Save'}
          </Button>
        </UncontrolledCollapse>
      </div>
    );
  };

  const ActivityDataMapping = () => {
    return (
      <div>
        <div
          id="activity"
          className="p-2 bg-gray-lighter text-bold pointer"
          onClick={() => setActiveShow(!activeShow)}
        >
          <i className={activeShow ? upAngle : downAngle}></i>Activity Data
          Mapping
        </div>
        <UncontrolledCollapse
          toggler="#activity"
          className={activeShow ? 'show' : ''}
        >
          <ActivityDataGrid
            columns={activityColumns}
            data={activityFieldMappingData}
            handleDeleteActivityData={handleDeleteActivityData}
            addActivityMappingRow={addActivityMappingRow}
            resetFieldRows={resetFieldRows}
            openMergeModal={openMergeModal}
            handleTrucadenceActivityField={handleTrucadenceActivityField}
          />
          <Button
            color="primary"
            icon="fas fa-check"
            className="mb-4 ml-2"
            disabled={saveButtonClickedType === 'activity' && fieldLoading}
            onClick={saveActivityDataMapping}
          >
            {saveButtonClickedType === 'activity' && fieldLoading
              ? 'Wait...'
              : 'Save'}
          </Button>
        </UncontrolledCollapse>
      </div>
    );
  };

  return (
    <Card className="b">
      <FieldMapping />
      <ActivityDataMapping />
      <AddMergeVariable
        hideModal={() => {
          setShowMergeModal(false);
        }}
        showModal={showMergeModal}
        id={activityId}
        handleAction={addMergeVariable}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        handleCancel={() => setShowDeleteConfirmModal(false)}
        showConfirmModal={showDeleteConfirmModal}
        handleConfirm={deleteRow}
        showConfirmBtnSpinner={deleteActivityDataLoading}
        confirmBtnColor="danger"
      >
        <span>Are you sure you want to delete?</span>
      </ConfirmModal>
    </Card>
  );
};
export default SyncFieldMapping;
