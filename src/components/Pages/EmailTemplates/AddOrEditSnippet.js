import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '@hookform/error-message';
import { ContentWrapper } from '@nextaction/components';
import { Base64 } from 'js-base64';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardBody,
  CardFooter,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Progress,
  Row,
} from 'reactstrap';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { getAllTags } from '../../../store/actions/actions';
import { notify, showErrorMessage } from '../../../util/index';
import { default as ClButton } from '../../Common/Button';
import DropDown from '../../Common/DropDown';
import UserList from '../../Common/UserList';
import Editor from '../../Common/Editor';
import PageHeader from '../../Common/PageHeader';
import TagList from '../../Common/TagList';
import { FETCH_ASSIGNED_TEAMS_QUERY } from '../../queries/CadenceQuery';
import { FETCH_MAIL_MERGE_VARIABLES } from '../../queries/EmailTemplatesQuery';
import {
  CREATE_SNIPPET_QUERY,
  FETCH_SNIPPET_QUERY,
  UPDATE_SNIPPET_QUERY,
} from '../../queries/SnippetsQuery';
import UserContext from '../../UserContext';

toast.configure();

function AddOrEditSnippet({ match, location, getAllTags, tags }) {
  const pathName = location.state && location.state.pathName;
  const filterParms = location.state && location.state.search;
  const [specificGroupOfUsers, setSpecificGroupOfUsers] = useState(false);
  const [shareWithUsers, setShareWithUsers] = useState(false);
  const [none, setNone] = useState(true);
  const [allUsers, setAllUsers] = useState(false);
  const [sharedTypeState, setSharedTypeState] = useState('none');
  const [editSharedTypeState, setEditSharedTypeState] = useState();
  const [validationState, setValidationState] = useState(false);
  const [snippetName, setSnippetName] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [snippetOwnerId, setSnippetOwnerId] = useState();
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const { user, loading: userLoading } = useContext(UserContext);
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';
  const currentUserId = userLoading ? 0 : user.id;
  const teamListData = [];

  const formRef = React.useRef();

  const history = useHistory();

  const [description, setDescription] = useState('<p></p>');
  const [userListValidationState, setUserListValidationState] = useState(false);
  const [teamListValidationState, setTeamListValidationState] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sharedGroups, setSharedGroups] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);

  const id = match.params.id;
  const type = match.params.type;

  const { handleSubmit, register, setValue, getValues, errors } = useForm({});

  const [sharedTypeValue, setSharedTypeValue] = useState(useForm.sharedType);

  useEffect(() => {
    if (!tags.fetchedAll) {
      getAllTags(currentUserId, apiURL, token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: snippet,
    loading: snippetLoading,
    error: snippetError,
  } = useQuery(FETCH_SNIPPET_QUERY, {
    variables: { id },
    notifyOnNetworkStatusChange: true,
    skip: id === undefined,
  });

  useEffect(() => {
    if (snippet && snippet?.snippet?.data) {
      let tagData = [];
      if (id !== 0) {
        tagData =
          snippet &&
          snippet?.snippet?.data[0]?.associations?.tag &&
          snippet.snippet.data[0].associations.tag.map((tag) => tag.id);
      }

      setValue('name', snippet.snippet.data[0].name);
      setSnippetName(snippet.snippet.data[0].name);
      setSnippetOwnerId(
        snippet &&
          snippet?.snippet?.data[0]?.associations?.user[0]?.id &&
          snippet.snippet.data[0].associations.user[0].id
      );
      if (type === 'edit') {
        setEditSharedTypeState(snippet.snippet.data[0].sharedType);
        if (snippet.snippet.data[0].sharedType === 'none') {
          setNone(true);
          setSharedTypeState(snippet.snippet.data[0].sharedType);
        } else if (snippet.snippet.data[0].sharedType === 'allUsers') {
          setAllUsers(true);
          setSharedTypeState(snippet.snippet.data[0].sharedType);
        } else if (snippet.snippet.data[0].sharedType === 'shareWithUsers') {
          setShareWithUsers(true);
          setSharedTypeState(snippet.snippet.data[0].sharedType);
          setSharedUsers(snippet.snippet.data[0].sharedUsers);
        } else {
          setSpecificGroupOfUsers(true);
          setSharedTypeState(snippet.snippet.data[0].sharedType);
          setSharedGroups(
            snippet.snippet.data[0].sharedGroups
              ? snippet.snippet.data[0].sharedGroups
              : []
          );
        }
      }
      setDescription(snippet.snippet.data[0].description);
      const currentUserTags =
        tags && tags.data && tags.data.map((tag) => tag.id);
      setSelectedTags(
        currentUserTags
          ? tagData.filter((id) => currentUserTags.includes(id))
          : []
      );
      setSharedTypeValue(snippet.snippet.data[0].sharedType);

      setInitialLoading(true);

      if (
        sharedTypeValue === 'specificGroupOfUsers' &&
        sharedGroups.length === 0
      ) {
        setValidationState(true);
        return false;
      } else {
        if (id !== undefined && type === 'edit') {
          setEditSharedTypeState(snippet.snippet.data[0].sharedType);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snippet]);

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

  const getUserName = (userId) => {
    if (userId) {
      const selectedUser = snippet?.snippet?.includedAssociations?.user
        .filter((item) => parseInt(userId) === item.id)
        .map((item) => item.name);

      return selectedUser.toString();
    }
  };

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
    addSnippet,
    { data: addSnippetData, loading: addLoading },
  ] = useLazyQuery(CREATE_SNIPPET_QUERY, {
    onCompleted: (response) => snippetAddCallBack(response, true),
    onError: (response) => snippetAddCallBack(response, false, addSnippetData),
  });

  const [
    cloneSnippet,
    { data: cloneSnippetData, loading: cloneLoading },
  ] = useLazyQuery(CREATE_SNIPPET_QUERY, {
    onCompleted: (response) => snippetCloneCallBack(response, true),
    onError: (response) =>
      snippetCloneCallBack(response, false, cloneSnippetData),
  });

  const [
    editSnippet,
    { data: editSnippetData, loading: editLoading },
  ] = useLazyQuery(UPDATE_SNIPPET_QUERY, {
    variables: { id: id },
    onCompleted: (response) => snippetEditCallBack(response, true),
    onError: (response) =>
      snippetEditCallBack(response, false, editSnippetData),
  });

  const { data: mailMergeVariablesData } = useQuery(
    FETCH_MAIL_MERGE_VARIABLES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    }
  );

  const mailMergeVariables = useMemo(
    () =>
      mailMergeVariablesData &&
      mailMergeVariablesData.mailmergeVariables &&
      mailMergeVariablesData.mailmergeVariables.data
        ? mailMergeVariablesData.mailmergeVariables.data.mail_merge
        : [],
    [mailMergeVariablesData]
  );

  const snippetAddCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Success! Snippet has been saved', 'success', 'add_snippet');
      pathName && filterParms
        ? history.push({
            pathname: pathName,
            search: filterParms,
            state: {
              handleRefetch: true,
            },
          })
        : history.push('/templates/snippets');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete this Snippet',
        errorData,
        'add_snippet'
      );
    }
  };

  const snippetCloneCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Success! Snippet has been saved', 'success', 'clone_snippet');
      pathName && filterParms
        ? history.push({
            pathname: pathName,
            search: filterParms,
            state: {
              handleRefetch: true,
            },
          })
        : history.push('/templates/snippets');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to clone this Snippet',
        errorData,
        'clone_snippet'
      );
    }
  };

  const snippetEditCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Success! Snippet has been updated', 'success', 'edit_snippet');
      pathName && filterParms
        ? history.push({
            pathname: pathName,
            search: filterParms,
            state: {
              handleRefetch: true,
            },
          })
        : history.push('/templates/snippets');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this Snippet',
        errorData,
        'edit_snippet'
      );
    }
  };

  const handleAddSnippetAction = (input) => {
    addSnippet({
      variables: {
        input,
      },
    });
  };

  const handleCloneSnippetAction = (input) => {
    cloneSnippet({
      variables: {
        input,
      },
    });
  };

  const handleEditSnippetAction = (id, input) => {
    editSnippet({
      variables: {
        id,
        input,
      },
    });
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

  const emailBodyValidate = (data) => {
    const emailBody = data
      .replaceAll('<br />', '')
      .replaceAll('&nbsp;', '')
      .split(/\s/)
      .join('');
    return emailBody;
  };

  const emailSnippetSubmit = () => {
    let snippetData = getValues();
    snippetData = {
      name: snippetData.name.trim(),
      tagId: selectedTags.length > 0 ? selectedTags : [],
      sharedType: sharedTypeState,
      sharedGroups: sharedGroups.length > 0 ? sharedGroups : [0],
      sharedUsers: sharedUsers.length > 0 ? sharedUsers : [0],
      description: Base64.encode(description),
    };
    if (
      emailBodyValidate(description) === '<p></p>' ||
      emailBodyValidate(description).trim() === '' ||
      description.trim().length > 32000
    ) {
      setValidationState(true);
      return false;
    } else if (
      sharedTypeState === 'shareWithUsers' &&
      sharedUsers.length === 0
    ) {
      setUserListValidationState(true);
      return false;
    } else if (
      sharedTypeState === 'specificGroupOfUsers' &&
      sharedGroups.length === 0
    ) {
      setTeamListValidationState(true);
      return false;
    } else {
      if (id > 0 && type === 'edit') {
        const editedFields = [];
        const actualData = snippet?.snippet?.data[0] || {};
        if (Base64.encode(actualData.description) !== snippetData.description) {
          editedFields.push('description');
        }
        if (actualData.name !== snippetData.name) {
          editedFields.push('name');
        }
        if (actualData.sharedType !== snippetData.sharedType) {
          editedFields.push('sharedType');
        }
        if (
          actualData?.associations?.tag?.map((tag) => tag.id).join(',') !==
          snippetData?.tagId?.join(',')
        ) {
          editedFields.push('tags');
        }
        if (editedFields.length === 0) {
          notify('No changes made!', 'error');
          return;
        }
        handleEditSnippetAction(id, snippetData);
      } else if (id > 0 && type === 'clone') {
        handleCloneSnippetAction(snippetData);
      } else {
        handleAddSnippetAction(snippetData);
      }
    }
  };

  useEffect(() => {
    return () => {
      setTimeout(() => toast.dismiss(), 5000);
    };
  }, []);

  return (
    <ContentWrapper>
      <PageHeader
        icon="fas fa-envelope fa-sm"
        pageName={
          type === 'clone'
            ? snippetName
              ? `Clone Snippet / ${snippetName}`
              : 'Clone Snippet'
            : type === 'edit'
            ? snippetName
              ? `Edit Snippet / ${snippetName}`
              : 'Edit Snippet'
            : 'Add Snippet'
        }
      ></PageHeader>
      <Row>
        <Col>
          <Card className="card-default">
            {snippetLoading && (
              <CardBody>
                <Progress animated striped value="100">
                  Loading snippet data
                </Progress>
              </CardBody>
            )}
            {snippetError && (
              <CardBody className="text-center">
                <h6 className="text-danger mb-0">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch data
                </h6>
                {snippet?.requestId && (
                  <>
                    <br />
                    <span className="text-danger text-sm">{`RequestId: ${snippet?.requestId}`}</span>{' '}
                  </>
                )}
              </CardBody>
            )}
            <CardBody>
              <Form
                className="px-3"
                onSubmit={handleSubmit(emailSnippetSubmit)}
                innerRef={formRef}
              >
                <Row form>
                  <Col sm={6} xl={2}>
                    <FormGroup>
                      <TagList
                        handleAddTag={true}
                        value={selectedTags}
                        multiselect={true}
                        maxLength="20"
                        onChange={(value) => {
                          setSelectedTags(value);
                        }}
                      />
                    </FormGroup>
                  </Col>
                  <Col
                    sm={14}
                    xl={7}
                    className="offset-xl-1 d-xl-flex align-items-center mt-xl-n2 mb-sm-2 pl-xl-3"
                  >
                    {!isManagerUser &&
                      type === 'edit' &&
                      snippetOwnerId &&
                      currentUserId !== snippetOwnerId && (
                        <span>
                          Shared by <b>{getUserName(snippetOwnerId)}</b>
                        </span>
                      )}
                    <FormGroup
                      check
                      inline
                      className="text-nowrap"
                      hidden={
                        !isManagerUser &&
                        type === 'edit' &&
                        snippetOwnerId &&
                        currentUserId !== snippetOwnerId
                      }
                    >
                      <Label check>
                        <Input
                          type="radio"
                          name="sharedType"
                          id="none"
                          invalid={errors.sharedType}
                          data-tab-value="none"
                          disabled={
                            id !== undefined &&
                            type === 'edit' &&
                            editSharedTypeState !== 'none'
                          }
                          checked={none}
                          onChange={(e) => {
                            handleSharedTypeChange(e);
                          }}
                        />
                        <span className="text-dark">Private</span>
                      </Label>
                    </FormGroup>

                    <FormGroup
                      check
                      inline
                      className="text-nowrap"
                      hidden={
                        !isManagerUser &&
                        type === 'edit' &&
                        snippetOwnerId &&
                        currentUserId !== snippetOwnerId
                      }
                    >
                      <Label check>
                        <Input
                          type="radio"
                          name="sharedType"
                          id="all_users"
                          invalid={errors.sharedType}
                          data-tab-value="allUsers"
                          disabled={
                            id !== undefined &&
                            type === 'edit' &&
                            editSharedTypeState !== 'none'
                          }
                          checked={allUsers}
                          onChange={(e) => {
                            handleSharedTypeChange(e);
                          }}
                        />
                        <span className="text-dark">Public</span>
                      </Label>
                    </FormGroup>

                    {isManagerUser && (
                      <>
                        <FormGroup check inline>
                          <Label check className="text-nowrap">
                            <Input
                              type="radio"
                              name="sharedType"
                              id="share_with_users"
                              invalid={errors.sharedType}
                              data-tab-value="shareWithUsers"
                              disabled={
                                (type === 'edit' &&
                                  editSharedTypeState !== 'none') ||
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
                          <Label check className="text-nowrap">
                            <Input
                              type="radio"
                              name="sharedType"
                              id="specific_group_of_users"
                              invalid={errors.sharedType}
                              data-tab-value="specificGroupOfUsers"
                              disabled={
                                (type === 'edit' &&
                                  editSharedTypeState !== 'none') ||
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

                    {shareWithUsers && isManagerUser && (
                      <Col className="pl-0">
                        <Row>
                          <Col md={10}>
                            <FormGroup className="mb-0">
                              <UserList
                                value={isManagerUser && sharedUsers}
                                disableOptions={
                                  id && editSharedTypeState === 'shareWithUsers'
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

                              <ErrorMessage
                                errors={errors}
                                name="sharedGroups"
                                className="invalid-feedback"
                                as="p"
                              ></ErrorMessage>
                            </FormGroup>
                          </Col>
                          <Col md={8} className="mb-1">
                            <p
                              className="text-danger text-sm position-absolute"
                              hidden={
                                sharedTypeState === 'shareWithUsers' &&
                                userListValidationState
                                  ? false
                                  : true
                              }
                            >
                              Please select the users
                            </p>
                          </Col>
                        </Row>
                      </Col>
                    )}
                    {specificGroupOfUsers && isManagerUser && (
                      <Col className="pl-0">
                        <Row>
                          <Col md={10}>
                            <FormGroup className="mb-0">
                              <DropDown
                                name="teams"
                                data={teamListData}
                                value={isManagerUser && sharedGroups}
                                disableOptions={
                                  id &&
                                  editSharedTypeState === 'specificGroupOfUsers'
                                }
                                placeHolder={'Select Teams'}
                                multiselect
                                onChange={(value) => {
                                  setSharedGroups(value);
                                }}
                              />

                              <ErrorMessage
                                errors={errors}
                                name="sharedGroups"
                                className="invalid-feedback"
                                as="p"
                              ></ErrorMessage>
                            </FormGroup>
                          </Col>
                          <Col md={8} className="mb-1">
                            <p
                              className="text-danger text-sm position-absolute"
                              hidden={
                                sharedTypeState === 'specificGroupOfUsers' &&
                                teamListValidationState
                                  ? false
                                  : true
                              }
                            >
                              Please select the teams
                            </p>
                          </Col>
                        </Row>
                      </Col>
                    )}
                  </Col>
                </Row>

                <Row className="mb-2 border-top pt-2">
                  <Col md={6}>
                    <InputGroup>
                      <Label
                        for="add_email_template_name"
                        className="text-bold wd-xs pt-2"
                      >
                        Name
                        <span className="text-danger">*</span>
                      </Label>
                      <Input
                        id="add_email_template_name"
                        type="text"
                        name="name"
                        autoComplete="off"
                        maxLength="44"
                        invalid={errors.name}
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
                      />
                    </InputGroup>
                  </Col>
                </Row>

                <Row className="border-top mb-2 pt-3">
                  <Col md={12} className="px-0">
                    {((id !== undefined &&
                      !snippetLoading &&
                      snippet &&
                      Object.keys(snippet).length > 0) ||
                      description) && (
                      <Editor
                        data={description}
                        onChange={(value) =>
                          setDescription(value ? value : '<p></p>')
                        }
                        userId={currentUserId}
                        templateId={parseInt(id)}
                        initialLoading={initialLoading}
                        resetLoading={(value) => setInitialLoading(value)}
                        mailMergeVariables={mailMergeVariables}
                        notify={notify}
                        showUploadAttachment={false}
                        toolbarLocation="bottom"
                      />
                    )}
                    <p
                      className="text-danger text-sm pl-3"
                      hidden={
                        !(
                          (errors.name && description === '<p></p>') ||
                          (emailBodyValidate(description) === '<p></p>' &&
                            validationState) ||
                          (emailBodyValidate(description).trim() === '' &&
                            validationState) ||
                          (description.trim().length > 32000 && validationState)
                        )
                      }
                    >
                      {description.trim().length > 32000
                        ? 'Limit exceeded more than 32000 characters. Please reduce it and try again.'
                        : 'Please enter snippet description'}
                    </p>
                  </Col>
                </Row>
                <CardFooter className="row">
                  <div className="ml-auto">
                    <InputGroup>
                      <ClButton
                        color="primary"
                        title={
                          type === 'edit' && snippetOwnerId !== currentUserId
                            ? 'You are not the owner of this Snippet'
                            : 'Save'
                        }
                        icon={
                          editLoading || addLoading || cloneLoading
                            ? 'fas fa-spinner fa-spin'
                            : 'fa fa-check'
                        }
                        disabled={
                          type === 'edit' && snippetOwnerId !== currentUserId
                        }
                      >
                        {editLoading || addLoading || cloneLoading
                          ? 'Wait...'
                          : 'Save'}
                      </ClButton>
                    </InputGroup>
                  </div>
                </CardFooter>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </ContentWrapper>
  );
}

const mapStateToProps = (state) => ({
  tags: state.tags,
});
export default connect(mapStateToProps, { getAllTags })(AddOrEditSnippet);
