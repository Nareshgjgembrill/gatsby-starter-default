import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Progress,
} from 'reactstrap';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { toast } from 'react-toastify';
import { notify, showErrorMessage } from '../../../util/index';
import {
  CREATE_CADENCE,
  UPDATE_CADENCE,
  FETCH_ASSIGNED_TEAMS_QUERY,
} from '../../queries/CadenceQuery';
import UserList from '../../Common/UserList';
import DropDown from '../../Common/DropDown';
import UserContext from '../../UserContext';
import CloseButton from '../../Common/CloseButton';
import ClButton from '../../Common/Button';

toast.configure();

const NewCadenceEditor = ({
  cadenceData,
  cadenceId,
  history,
  state,
  loading,
  error,
}) => {
  const [specificGroupOfUsers, setSpecificGroupOfUsers] = useState(false);
  const [shareWithUsers, setShareWithUsers] = useState(false);
  const [none, setNone] = useState(true);
  const [allUsers, setAllUsers] = useState(false);
  const [sharedTypeState, setSharedTypeState] = useState('none');
  const [editSharedTypeState, setEditSharedTypeState] = useState();
  const [cadenceOwnerId, setCadenceOwnerId] = useState();
  const [validationState, setValidationState] = useState(false);
  const [userListValidationState, setUserListValidationState] = useState(false);
  const [teamListValidationState, setTeamListValidationState] = useState(false);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';

  const [sharedGroups, setSharedGroups] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const teamListData = [];

  const { handleSubmit, register, reset, errors } = useForm();

  useEffect(() => {
    if (cadenceData && cadenceData.cadence.data[0].sharedType) {
      setEditSharedTypeState(cadenceData.cadence.data[0].sharedType);
      setCadenceOwnerId(cadenceData.cadence.data[0].associations.user[0].id);
      if (cadenceData && cadenceData.cadence.data[0].sharedType === 'none') {
        setNone(true);
        setSharedTypeState(cadenceData.cadence.data[0].sharedType);
      } else if (
        cadenceData &&
        cadenceData.cadence.data[0].sharedType === 'allUsers'
      ) {
        setAllUsers(true);
        setSharedTypeState(cadenceData.cadence.data[0].sharedType);
      } else if (
        cadenceData &&
        cadenceData.cadence.data[0].sharedType === 'shareWithUsers'
      ) {
        setShareWithUsers(true);
        setSharedTypeState(cadenceData.cadence.data[0].sharedType);
        setSharedUsers(cadenceData.cadence.data[0].sharedUsers);
      } else {
        setSpecificGroupOfUsers(true);
        setSharedTypeState(cadenceData.cadence.data[0].sharedType);
        setSharedGroups(cadenceData.cadence.data[0].sharedGroups);
      }
    }
    cadenceData =
      // eslint-disable-next-line react-hooks/exhaustive-deps
      cadenceData === undefined
        ? {}
        : {
            name: cadenceData.cadence.data[0].name,
            description: cadenceData.cadence.data[0].description,
            sharedType: cadenceData.cadence.data[0].sharedType,
          };
    reset(cadenceData);
  }, [cadenceData]);

  const { data: assignedTeamsData } = useQuery(FETCH_ASSIGNED_TEAMS_QUERY, {
    variables: { limit: 200, offset: 0 },
  });
  const teamData = useMemo(
    () =>
      assignedTeamsData && assignedTeamsData.teams
        ? assignedTeamsData.teams.data
        : [],
    [assignedTeamsData]
  );

  const removeDuplicates = (arr) => {
    const filteredArray = arr.filter(function (item, pos) {
      return arr.indexOf(item) === pos;
    });
    return filteredArray;
  };

  if (teamData) {
    const teamsDropdownList = teamData.map((team) => team.groupName);
    teamsDropdownList &&
      removeDuplicates(teamsDropdownList).forEach((team) => {
        let temp = {};
        temp = {
          text: team,
          value: team,
          active: false,
        };
        teamListData.push(temp);
      });
  }

  const [
    createCadence,
    { data: createdCadenceData, loading: createLoading },
  ] = useLazyQuery(CREATE_CADENCE, {
    onCompleted: (response) => handleAddCadenceRequestCallback(response, true),
    onError: (response) => {
      handleAddCadenceRequestCallback(response, false, createdCadenceData);
    },
  });
  const [
    updateCadence,
    { data: updatedCadenceData, loading: updateLoading },
  ] = useLazyQuery(UPDATE_CADENCE, {
    onCompleted: (response) =>
      handleUpdateCadenceRequestCallback(response, true),
    onError: (response) =>
      handleUpdateCadenceRequestCallback(response, false, updatedCadenceData),
  });

  const handleAddCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      const { id, name } =
        response &&
        response.cadences &&
        response.cadences.data &&
        response.cadences.data[0];
      const touchCount =
        response.cadences.data &&
        response.cadences.data[0].associations.touch.length;
      id
        ? history.push({
            pathname: '/cadences/' + id + '/touches/view',
            search:
              (state.search &&
                `${state.search}&cadence[name]=${name}&not=${touchCount}`) ||
              `?cadence[name]=${name}&not=${touchCount}`,
            state: {
              origin: state.origin,
              cadenceName:
                response.cadences.data && response.cadences.data[0].name,
              cadence: response.cadences.data && response.cadences.data[0],
              handleRefetch: true,
              parentUserId: state && state.parentUserId,
            },
          })
        : history.push('/cadences');
      notify('Success! Cadence has been saved', 'success', 'create_cadence');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create Cadence',
        errorData,
        'create_cadence'
      );
    }
  };

  const handleUpdateCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      const name =
        response &&
        response.cadences &&
        response.cadences.data &&
        response.cadences.data[0].name;
      state && state.pathName && state.search
        ? history.push({
            pathname: state.pathName,
            search: state.search,
            state: {
              origin: state.origin,
              cadenceName: name || state.cadenceName,
              handleRefetch: true,
            },
          })
        : history.push('/cadences');
      notify('Cadence has been updated!', 'success', 'edit_cadence');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update Cadence',
        errorData,
        'edit_cadence'
      );
    }
  };

  const handleSharedTypeChange = (e) => {
    const sharedTypeValue = e.currentTarget.getAttribute('data-tab-value');

    const ischecked = e.currentTarget.checked;

    if (sharedTypeValue === 'none') {
      setNone(!none);
      if (ischecked) {
        setSharedTypeState(sharedTypeValue);
        setAllUsers(false);
        setSpecificGroupOfUsers(false);
        setShareWithUsers(false);
      }
    }

    if (sharedTypeValue === 'allUsers') {
      setAllUsers(!allUsers);
      if (ischecked) {
        setSharedTypeState(sharedTypeValue);
        setNone(false);
        setSpecificGroupOfUsers(false);
        setShareWithUsers(false);
      }
    }

    if (sharedTypeValue === 'specificGroupOfUsers') {
      setSpecificGroupOfUsers(!specificGroupOfUsers);
      if (ischecked) {
        setSharedTypeState(sharedTypeValue);
        setAllUsers(false);
        setNone(false);
        setShareWithUsers(false);
      }
    }

    if (sharedTypeValue === 'shareWithUsers') {
      setShareWithUsers(!shareWithUsers);
      if (ischecked) {
        setSharedTypeState(sharedTypeValue);
        setAllUsers(false);
        setNone(false);
        setSpecificGroupOfUsers(false);
      }
    }
  };

  const getUserName = (userId) => {
    if (userId) {
      const selectedUser = cadenceData?.cadence?.includedAssociations?.user
        .filter((item) => parseInt(userId) === item.id)
        .map((item) => item.name);

      return selectedUser.toString();
    }
  };

  const onSubmit = (data, e) => {
    const { name, description } = data;
    if (cadenceId !== undefined) {
      if (sharedTypeState === undefined) {
        setValidationState(true);
      } else {
        setValidationState(false);
        if (sharedTypeState === 'shareWithUsers' && sharedUsers.length === 0) {
          setUserListValidationState(true);
          return false;
        } else if (
          sharedTypeState === 'specificGroupOfUsers' &&
          sharedGroups.length === 0
        ) {
          setTeamListValidationState(true);
          return false;
        }
        updateCadence({
          variables: {
            id: cadenceId,
            name: name.trim(),
            description: description,
            sharedType: sharedTypeState,
            sharedGroups: sharedGroups.length > 0 ? sharedGroups : [0],
            sharedUsers: sharedUsers.length > 0 ? sharedUsers : [0],
          },
        });
      }
    } else {
      if (sharedTypeState === undefined) {
        setValidationState(true);
      } else {
        setValidationState(false);
        if (sharedTypeState === 'shareWithUsers' && sharedUsers.length === 0) {
          setUserListValidationState(true);
          return false;
        } else if (
          sharedTypeState === 'specificGroupOfUsers' &&
          sharedGroups.length === 0
        ) {
          setTeamListValidationState(true);
          return false;
        }
        createCadence({
          variables: {
            name: name.trim(),
            description: description,
            sharedType: sharedTypeState,
            sharedGroups: sharedGroups.length > 0 ? sharedGroups : [0],
            sharedUsers: sharedUsers.length > 0 ? sharedUsers : [0],
          },
        });
      }
    }
  };

  return (
    <Card className="card-default">
      <Form name="formCadence" onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="border-bottom">
          <CardTitle>General Info</CardTitle>
        </CardHeader>
        {loading && (
          <CardBody>
            <Progress animated striped value="100">
              Loading Cadence Data
            </Progress>
          </CardBody>
        )}
        {error && (
          <CardBody>
            <h6 className="text-danger mb-0">
              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
              Failed to fetch data
            </h6>
            {cadenceData?.requestId && (
              <>
                <br />
                <span className="text-danger text-sm">{`RequestId: ${cadenceData?.requestId}`}</span>{' '}
              </>
            )}
          </CardBody>
        )}
        {!loading && (
          <CardBody>
            <Container className="container-md">
              <FormGroup>
                <Label for="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  id="name"
                  maxLength="299"
                  autocomplete="off"
                  invalid={errors.name}
                  placeholder="Enter Cadence Name"
                  innerRef={register({
                    validate: {
                      spaceValidation: (value) => {
                        return !!value.trim();
                      },
                    },
                    required: 'Name is required',
                  })}
                />
                <ErrorMessage
                  message={
                    errors.name?.type === 'spaceValidation' &&
                    'Please enter the valid name'
                  }
                  errors={errors}
                  name="name"
                  className="invalid-feedback"
                  as="p"
                ></ErrorMessage>
              </FormGroup>
              <FormGroup>
                <Label for="description">Description</Label>
                <Input
                  type="textarea"
                  name="description"
                  id="description"
                  maxLength="2999"
                  invalid={errors.description}
                  placeholder="Enter Cadence Description"
                  innerRef={register}
                />
                <ErrorMessage
                  errors={errors}
                  name="description"
                  className="invalid-feedback"
                  as="p"
                ></ErrorMessage>
              </FormGroup>
              {!isManagerUser &&
                cadenceOwnerId &&
                currentUserId !== cadenceOwnerId && (
                  <span>
                    Shared by <b>{getUserName(cadenceOwnerId)}</b>
                  </span>
                )}
              <FormGroup
                hidden={
                  !isManagerUser &&
                  cadenceOwnerId &&
                  currentUserId !== cadenceOwnerId
                }
              >
                <Label for="sharedType">Share with</Label>
                <div className="col-md-10 pl-0">
                  <FormGroup check inline>
                    <Label check>
                      <Input
                        type="radio"
                        name="sharedType"
                        id="none"
                        invalid={errors.sharedType}
                        data-tab-value="none"
                        disabled={
                          cadenceId && editSharedTypeState !== 'none'
                            ? true
                            : false
                        }
                        checked={none}
                        onChange={handleSharedTypeChange}
                      />
                      Private
                    </Label>
                  </FormGroup>
                  <FormGroup check inline>
                    <Label check>
                      <Input
                        type="radio"
                        name="sharedType"
                        id="all_users"
                        invalid={errors.sharedType}
                        data-tab-value="allUsers"
                        disabled={
                          cadenceId && editSharedTypeState !== 'none'
                            ? true
                            : false
                        }
                        checked={allUsers}
                        onChange={handleSharedTypeChange}
                      />
                      Public
                    </Label>
                  </FormGroup>
                  {isManagerUser && (
                    <>
                      <FormGroup check inline>
                        <Label check>
                          <Input
                            type="radio"
                            name="sharedType"
                            id="share_with_users"
                            invalid={errors.sharedType}
                            data-tab-value="shareWithUsers"
                            disabled={
                              (cadenceId && editSharedTypeState !== 'none') ||
                              !isManagerUser
                                ? true
                                : false
                            }
                            checked={shareWithUsers}
                            onChange={handleSharedTypeChange}
                          />
                          Assign to Users
                        </Label>
                      </FormGroup>
                      <FormGroup check inline>
                        <Label check>
                          <Input
                            type="radio"
                            name="sharedType"
                            id="specific_group_of_users"
                            invalid={errors.sharedType}
                            data-tab-value="specificGroupOfUsers"
                            disabled={
                              (cadenceId && editSharedTypeState !== 'none') ||
                              !isManagerUser
                                ? true
                                : false
                            }
                            checked={specificGroupOfUsers}
                            onChange={handleSharedTypeChange}
                          />
                          Assign to Teams
                        </Label>
                      </FormGroup>
                    </>
                  )}
                </div>
                <p
                  className="text-danger text-sm"
                  hidden={
                    (errors.name && sharedTypeState === undefined) ||
                    validationState
                      ? false
                      : true
                  }
                >
                  Shared type is required
                </p>
              </FormGroup>

              {shareWithUsers && isManagerUser && (
                <FormGroup>
                  <Label for="sharedWithUsers">Select Users</Label>
                  <Col md={4} className="pl-0">
                    <UserList
                      value={isManagerUser && sharedUsers}
                      disableOptions={
                        cadenceId && editSharedTypeState === 'shareWithUsers'
                      }
                      placeHolder={'Select Users'}
                      multiselect={true}
                      handleFilter={(value) => {
                        return value.value !== currentUserId;
                      }}
                      onChange={(value) => {
                        setSharedUsers(value);
                      }}
                    />
                  </Col>
                  <ErrorMessage
                    errors={errors}
                    name="sharedGroups"
                    className="invalid-feedback"
                    as="p"
                  ></ErrorMessage>
                </FormGroup>
              )}
              {specificGroupOfUsers && isManagerUser && (
                <FormGroup>
                  <Label for="sharedGroups">Select Teams</Label>
                  <Col md={4} className="pl-0">
                    <DropDown
                      name="teams"
                      data={teamListData}
                      value={isManagerUser && sharedGroups}
                      disableOptions={
                        cadenceId &&
                        editSharedTypeState === 'specificGroupOfUsers'
                      }
                      placeHolder={'Select Teams'}
                      multiselect
                      onChange={(value) => {
                        setSharedGroups(value);
                      }}
                    />
                  </Col>
                  <ErrorMessage
                    errors={errors}
                    name="sharedGroups"
                    className="invalid-feedback"
                    as="p"
                  ></ErrorMessage>
                </FormGroup>
              )}
              <p
                className="text-danger text-sm"
                hidden={
                  sharedTypeState === 'shareWithUsers' &&
                  userListValidationState
                    ? false
                    : true
                }
              >
                Please select the users
              </p>
              <p
                className="text-danger text-sm"
                hidden={
                  sharedTypeState === 'specificGroupOfUsers' &&
                  teamListValidationState
                    ? false
                    : true
                }
              >
                Please select the teams
              </p>
            </Container>
          </CardBody>
        )}
        <CardFooter>
          <div className="d-flex align-items-center">
            <div className="ml-auto ">
              <CloseButton
                btnTxt="Cancel"
                className="mr-2"
                title="Cancel"
                onClick={() =>
                  state && state.pathName && state.search
                    ? history.push({
                        pathname: state.pathName,
                        search: state.search,
                        state: {
                          origin: state.origin,
                          cadenceName: state.cadenceName,
                          parentUserId: state && state.parentUserId,
                        },
                      })
                    : history.push('/cadences')
                }
              />
              <ClButton
                type="submit"
                color="primary"
                icon={
                  createLoading || updateLoading
                    ? 'fas fa-spinner fa-spin'
                    : 'fa fa-check'
                }
                disabled={cadenceId && cadenceOwnerId !== currentUserId}
                title={
                  cadenceId && cadenceOwnerId !== currentUserId
                    ? 'You are not the Owner of this cadence'
                    : 'Save'
                }
              >
                <span>
                  {createLoading || updateLoading ? 'Wait...' : 'Save'}
                </span>
              </ClButton>
            </div>
          </div>
        </CardFooter>
      </Form>
    </Card>
  );
};

export default NewCadenceEditor;
