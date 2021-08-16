/**
 * @author ranbarasan
 * @version V11.0
 */
import { useLazyQuery } from '@apollo/react-hooks';
import { FormValidator } from '@nextaction/components';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { showErrorMessage } from '../../../util/index';
import { default as ClButton } from '../../Common/Button';
import DropwDown from '../../Common/DropDown';
import { CREATE_FILTERS, UPDATE_FILTERS } from '../../queries/ProspectsQuery';
import { FETCH_ASSIGNED_TEAMS_QUERY } from '../../queries/TeamsQuery';
import AddFilterLogicGrid from './AddFilterLogicGrid';

toast.configure();

function CreateFilterModal({
  showModal,
  hideModal,
  fieldsList,
  assignedUsersData,
  currentFilter,
  handleCriteriaFieldsChange,
  handleActionAddCriteria,
  handleActionDeleteRow,
  handleActionRefetchFilter,
  user,
}) {
  const [teamUsers, setTeamUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamsValues, setTeamsValues] = useState([]);
  const [teamsList, setTeamsList] = useState([]);

  const filterFormRef = useRef();
  const [filterForm, setFilterForm] = useState();
  const [criteriaCheck, setCriteriaCheck] = useState('');
  const [shareWithWhoom, setShareWithWhoom] = useState('');
  const [showTeams, setShowTeams] = useState('none');
  const showTeamsSelect = { display: showTeams };
  const [showUsers, setShowUsers] = useState('none');
  const showUsersSelect = { display: showUsers };

  const fieldData = {};

  if (fieldsList) {
    const fieldArray = [];
    fieldsList &&
      fieldsList.fields &&
      fieldsList.fields.data &&
      fieldsList.fields.data.forEach((field) => {
        if (field.associations?.fieldMapping[0]?.id) {
          const data = fieldsList.fields.includedAssociations.fieldMappings.find(
            (mappingData) =>
              mappingData.id === field.associations.fieldMapping[0].id &&
              (mappingData.recordType === 'Contact' ||
                mappingData.recordType === 'Lead')
          );

          if (
            data &&
            (data.recordType === 'Contact' || data.recordType === 'Lead')
          ) {
            fieldArray.push(field);
          }
        }
      });
    fieldData['fields'] = {
      data: fieldArray,
      includedAssociations: fieldsList.fields.includedAssociations,
    };
  }

  const filterLogicColumns = React.useMemo(
    () => [
      {
        Header: 'Prospect Field',
        accessor: 'fieldName',
        width: '30%',
        paddingRight: '0px',
      },
      {
        Header: 'Operator',
        accessor: 'operator',
        width: '25%',
        paddingRight: '0px',
      },
      {
        Header: 'Value',
        accessor: 'criteriaValue',
        width: '45%',
        paddingRight: '0px',
      },
    ],
    []
  );

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
    });
  };

  const handleSetDefaultvalue = () => {
    if (
      showModal &&
      currentFilter.name !== undefined &&
      shareWithWhoom === ''
    ) {
      switch (currentFilter.sharedType) {
        case 'specificGroupOfTeams':
          setTeams(currentFilter.sharedGroups);
          setTeamsValues(currentFilter.sharedGroups);
          setShowTeams('block');
          break;
        case 'specificGroupOfUsers':
          setTeamUsers(currentFilter.sharedUserIds);
          setShowUsers('block');
          break;
        case 'allUsers':
          break;
        default:
      }
    }

    if (showModal) {
      setShareWithWhoom(
        shareWithWhoom === '' ? currentFilter.sharedType : shareWithWhoom
      );
      setCriteriaCheck(
        criteriaCheck === '' ? currentFilter.logicalOperator : criteriaCheck
      );
      if (shareWithWhoom === '' && currentFilter.name === undefined) {
        setTeamUsers([]);
        setShowUsers('none');
        setTeamsValues([]);
        setShowTeams('none');
      }
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => handleSetDefaultvalue(), [currentFilter]);
  //Fetch users assigned users
  const [fetchTeamList] = useLazyQuery(FETCH_ASSIGNED_TEAMS_QUERY, {
    variables: { limit: 200, offset: 0 },
    onCompleted: (response) => handleFetchTeamsRequestCallback(response, true),
    onError: (response) => handleFetchTeamsRequestCallback(response),
  });

  const addCriteria = () => {
    // eslint-disable-next-line array-callback-return
    currentFilter.filterCriteria.some((cf, idx) => {
      if (cf.field.id === '') {
        notify('Field value is mandatory', 'error');
        return true;
      } else if (cf.operator === '') {
        notify('Operator value is mandatory', 'error');
        return true;
      } else if (
        cf.operator !== 'Is Empty' &&
        cf.operator !== 'Is Not Empty' &&
        cf.criteriaValue === ''
      ) {
        notify('Value field is mandatory', 'error');
        return true;
      } else if (idx === currentFilter.filterCriteria.length - 1) {
        handleActionAddCriteria();
      }
    });
  };

  const removeDuplicates = (arr) => {
    const filteredArray = arr.filter(function (item, pos) {
      return arr.indexOf(item) === pos;
    });
    return filteredArray;
  };

  const handleFetchTeamsRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      const teamsDropdownList =
        response.teams && response.teams.data.map((team) => team.groupName);

      const teamListData = [];
      teamsDropdownList &&
        removeDuplicates(teamsDropdownList).forEach((team) => {
          const temp = {
            text: team,
            value: team,
            active: false,
          };
          teamListData.push(temp);
        });

      setTeamsList(teamListData);
    } else {
      notify(response.graphQLErrors[0].message, 'error');
    }
  };

  useEffect(() => {
    if (showModal && user && user.isManagerUser === 'Y') {
      fetchTeamList();
    }
  }, [showModal, user, fetchTeamList]);

  const [
    saveFilters,
    { data: saveFilterData, loading: loadingSaveFilter },
  ] = useLazyQuery(CREATE_FILTERS, {
    onCompleted: (response) => handleSaveFilterRequestCallback(response, true),
    onError: (response) => handleSaveFilterRequestCallback(response),
  });

  const handleSaveFilterRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      hideModal();
      notify('Filter saved successfully', 'success');
      handleActionRefetchFilter();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to save this filter. Please try again.',
        saveFilterData,
        'save_filter'
      );
    }
  };

  const [
    updateFilters,
    { data: updateFilterData, loading: loadingUpdateFilter },
  ] = useLazyQuery(UPDATE_FILTERS, {
    onCompleted: (response) =>
      handleUpdateFilterRequestCallback(response, true),
    onError: (response) => handleUpdateFilterRequestCallback(response),
  });

  const handleUpdateFilterRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Filter saved successfully', 'success');
      hideModal();
      handleActionRefetchFilter();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to save this filter. Please try again.',
        updateFilterData,
        'update_filter'
      );
    }
  };

  const handleActionCriteriaMatch = (event) => {
    switch (event.target.id) {
      case 'all_criteria_match':
        setCriteriaCheck('AND');
        break;
      case 'any_criteria_match':
        setCriteriaCheck('OR');
        break;
      default:
    }
  };

  const handleActionShareWith = (event) => {
    setShowTeams('none');
    setShowUsers('none');
    setTeams([]);
    setTeamUsers([]);
    switch (event.target.id) {
      case 'share_with_none':
        setShareWithWhoom('none');
        break;
      case 'share_with_all_users':
        setShareWithWhoom('allUsers');
        break;
      case 'share_with_teams':
        setShareWithWhoom('specificGroupOfTeams');
        setShowTeams('block');
        break;
      case 'share_with_users':
        setShareWithWhoom('specificGroupOfUsers');
        setShowUsers('block');
        break;
      default:
    }
  };

  const hasError = (inputName, method) => {
    return (
      filterForm &&
      filterForm.errors &&
      filterForm.errors[inputName] &&
      filterForm.errors[inputName][method]
    );
  };

  const getFilterFormData = () => {
    const filterCriteria = [];
    // eslint-disable-next-line array-callback-return
    currentFilter.filterCriteria.forEach((item) => {
      if (item.field.id) {
        const criteria = {
          operator: item.operator,
          fields: { id: item.field.id === '' ? 0 : parseInt(item.field.id) },
          criteriaValue: item.criteriaValue ? item.criteriaValue : [],
        };
        //Id used updating records
        if (item.id !== '' || parseInt(item.id) > 0) {
          criteria['id'] = item.id;
        }
        filterCriteria.push(criteria);
      }
    });
    return filterCriteria;
  };

  const handleActionSaveFilter = () => {
    const form = filterFormRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT', 'SELECT', 'CHECKBOX'].includes(i.nodeName)
    );

    const anyContainsField = inputs.filter(
      (i) => i.id.startsWith('field_') && i.value.trim() !== ''
    );
    const inputsElement = [];
    inputs.forEach((i) => {
      const elementId = i.id;
      const index =
        elementId.startsWith('field_') ||
        elementId.startsWith('operator_') ||
        elementId.startsWith('criteriaValue')
          ? elementId.split('_')[1]
          : '-1';
      const field = form[`field${index}`]
        ? form[`field${index}`].value.trim()
        : '';
      const operator = form[`operator${index}`]
        ? form[`operator${index}`].value
        : '';
      const criteriaValue = form[`criteriaValue${index}`]
        ? form[`criteriaValue${index}`].value.trim()
        : '';
      const criteriaValueDate = form[`criteriaValueDate${index}`]
        ? form[`criteriaValueDate${index}`].value.trim()
        : '';
      let ignoreValidation = true;
      if (
        (index &&
          parseInt(index) > 0 &&
          field === '' &&
          operator === '' &&
          criteriaValue === '' &&
          criteriaValueDate === '') ||
        (index &&
          parseInt(index) >= 0 &&
          anyContainsField.length > 0 &&
          (form[`operator${index}`]?.value === 'Is Empty' ||
            form[`operator${index}`]?.value === 'Is Not Empty'))
      ) {
        ignoreValidation = false;
      }
      if (
        ignoreValidation &&
        ['TEXTAREA', 'INPUT', 'SELECT'].includes(i.nodeName)
      ) {
        inputsElement.push(i);
      }
    });

    const { errors, hasError } = FormValidator.bulkValidate(inputsElement);
    setFilterForm({ ...filterForm, formName, errors });

    const filterData = [...form.elements].reduce((filterJson, item) => {
      if (item.checked) {
        filterJson[item.name] = item.checked;
      } else {
        filterJson[item.name] = item.value;
      }
      return filterJson;
    }, {});

    const filterSaveData = {
      name: filterData.filterName,
      filterCriteria: getFilterFormData(),
      sharedType: shareWithWhoom,
      sharedGroups: teams,
      sharedUserIds: teamUsers,
      moduleName: 'prospects',
      logicalOperator: criteriaCheck,
    };

    const filterId = currentFilter.id;
    if (!hasError && (filterId === '' || filterId === undefined)) {
      saveFilters({
        variables: {
          input: filterSaveData,
        },
      });
    } else if (!hasError && filterId) {
      updateFilters({
        variables: {
          filterId,
          input: filterSaveData,
        },
      });
    }
  };

  const handleActionTeamsChange = (value) => {
    setTeamsValues(value);
    if (value.length > 0) {
      setTeams([]);
      // eslint-disable-next-line array-callback-return
      value.map((key) => {
        const selected = teamsList.filter((data) => key === data.value);
        if (selected.length > 0) {
          setTeams([...teams, selected[0].text]);
        }
      });
    }
  };

  const handleActionCancelFilter = () => {
    hideModal();
    filterFormRef.current.reset();
    setFilterForm({});
    setShareWithWhoom('');
  };

  return (
    <div>
      <Modal
        isOpen={showModal}
        centered={true}
        size="lg"
        className="container-md"
      >
        <ModalHeader toggle={handleActionCancelFilter}>
          <i className="fas fa-filter mr-2 text-warning"></i>
          {currentFilter.name
            ? `Edit Filter Criteria - ${currentFilter.name}`
            : 'Add Filter Criteria'}
          {currentFilter.name && (
            <span className="position-absolute right-3 font-weight-normal">
              {`Owner: ${user.name}`}
            </span>
          )}
        </ModalHeader>
        <ModalBody className="px-4 py-2">
          <Form name="filterForm" innerRef={filterFormRef}>
            <Row>
              <Col className="bg-gray-lighter py-1 mb-2">
                <strong>Step 1. Enter Filter Name</strong>
              </Col>
            </Row>
            <FormGroup row className="mb-2">
              <Label for="filter_name" md={2} className="pr-0">
                Filter Name
              </Label>
              <Col md={4} className="pl-0">
                <Input
                  type="text"
                  name="filterName"
                  id="filter_name"
                  maxLength={100}
                  invalid={hasError('filterName', 'required')}
                  data-validate='["required"]'
                  defaultValue={currentFilter.name}
                  autoComplete="off"
                />
                {hasError('filterName', 'required') && (
                  <span className="invalid-feedback">
                    Filter name is required
                  </span>
                )}
              </Col>
            </FormGroup>
            <Row>
              <Col className="bg-gray-lighter py-1 mb-2">
                <strong>Step 2. Specify Filter Criteria</strong>
              </Col>
            </Row>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="criteriaMatch"
                  checked={criteriaCheck === 'AND'}
                  id="all_criteria_match"
                  value="AND"
                  onChange={handleActionCriteriaMatch}
                />
                All Criteria's must match (AND)
              </Label>
            </FormGroup>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="criteriaMatch"
                  checked={criteriaCheck === 'OR'}
                  id="any_criteria_match"
                  value="OR"
                  onChange={handleActionCriteriaMatch}
                />
                Any one Criteria match (OR)
              </Label>
            </FormGroup>
            <div className="mt-2">
              <AddFilterLogicGrid
                columns={filterLogicColumns}
                data={
                  currentFilter && currentFilter.filterCriteria
                    ? currentFilter.filterCriteria
                    : []
                }
                fieldsList={fieldData}
                hasError={hasError}
                handleCriteriaFieldsChange={handleCriteriaFieldsChange}
                handleActionDeleteRow={handleActionDeleteRow}
              />
            </div>
            <Row>
              <Col className="mb-2">
                <ClButton
                  className="float-right"
                  icon="fas fa-plus"
                  title="Add Filter Logic"
                  onClick={addCriteria}
                >
                  Add Filter Logic
                </ClButton>
              </Col>
            </Row>
            <Row>
              <Col className="bg-gray-lighter py-1 mb-2">
                <strong>Step 3. Share with</strong>
              </Col>
            </Row>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="shareWith"
                  id="share_with_none"
                  checked={shareWithWhoom === 'none'}
                  onChange={handleActionShareWith}
                  value="none"
                />
                None (Private)
              </Label>
            </FormGroup>
            <FormGroup check inline>
              <Label check>
                <Input
                  type="radio"
                  name="shareWith"
                  id="share_with_all_users"
                  checked={shareWithWhoom === 'allUsers'}
                  onChange={handleActionShareWith}
                  value="allUsers"
                />
                All Users (Public)
              </Label>
            </FormGroup>
            <FormGroup
              check
              inline
              hidden={user && user.isManagerUser === 'Y' ? false : true}
            >
              <Label check>
                <Input
                  type="radio"
                  name="shareWith"
                  id="share_with_teams"
                  checked={shareWithWhoom === 'specificGroupOfTeams'}
                  onChange={handleActionShareWith}
                  value=""
                  disabled={user && user.isManagerUser === 'Y' ? false : true}
                />
                Share with teams
              </Label>
            </FormGroup>
            <FormGroup
              check
              inline
              hidden={user && user.isManagerUser === 'Y' ? false : true}
            >
              <Label check>
                <Input
                  type="radio"
                  name="shareWith"
                  id="share_with_users"
                  checked={shareWithWhoom === 'specificGroupOfUsers'}
                  onChange={handleActionShareWith}
                  disabled={user && user.isManagerUser === 'Y' ? false : true}
                />
                Share with users
              </Label>
            </FormGroup>
            <FormGroup className="mt-2" style={showTeamsSelect}>
              <Row>
                <Label md={3} className="text-center pr-0">
                  Share with teams
                </Label>
                <Col md={6} className="pl-0">
                  <DropwDown
                    value={teamsValues}
                    data={teamsList ? teamsList : []}
                    placeHolder={'Select Teams(s)'}
                    multiselect={true}
                    name="teams"
                    onChange={handleActionTeamsChange}
                  />
                </Col>
              </Row>
            </FormGroup>
            <FormGroup className="mt-2" style={showUsersSelect}>
              <Row>
                <Label md={3} className="text-center pr-0">
                  Share with users
                </Label>
                <Col md={6} className="pl-0">
                  <DropwDown
                    value={teamUsers}
                    data={assignedUsersData ? assignedUsersData : []}
                    placeHolder={'Select User(s)'}
                    multiselect={true}
                    name="users"
                    onChange={(value) => {
                      setTeamUsers(value);
                    }}
                  />
                </Col>
              </Row>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="card-footer">
          <ClButton
            color="green"
            className="text-white"
            disabled={loadingSaveFilter || loadingUpdateFilter}
            icon={
              loadingSaveFilter || loadingUpdateFilter
                ? 'fas fa-spinner fa-spin'
                : 'fa fa-check'
            }
            title="Save Changes"
            onClick={handleActionSaveFilter}
          >
            {loadingSaveFilter ? 'Wait...' : 'Save'}
          </ClButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default CreateFilterModal;
