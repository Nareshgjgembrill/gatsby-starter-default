import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '@hookform/error-message';
import { ContentWrapper } from '@nextaction/components';
import classnames from 'classnames';
import { Base64 } from 'js-base64';
import { parseUrl } from 'query-string';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { connect } from 'react-redux';
import { Prompt, useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Nav,
  NavItem,
  NavLink,
  Popover,
  PopoverBody,
  PopoverHeader,
  Progress,
  Row,
  TabContent,
  TabPane,
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
import {
  CREATE_EMAIL_TEMPLATE_QUERY,
  FETCH_CATEGORIES_LIST_QUERY,
  FETCH_EMAIL_TEMPLATE_QUERY,
  FETCH_MAIL_MERGE_VARIABLES,
  GET_ALL_SNIPPETS,
  SEND_TEST_EMAIL_QUERY,
  UPDATE_EMAIL_TEMPLATE_QUERY,
} from '../../queries/EmailTemplatesQuery';
import { FETCH_EMAIL_ACCOUNT_QUERY } from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
import CloneModal from './CloneModal';

toast.configure();

function AddOrEditEmailTemplate({ match, location, getAllTags, tags }) {
  const pathName = location.state && location.state.pathName;
  const filterParms = location.state && location.state.search;
  const [specificGroupOfUsers, setSpecificGroupOfUsers] = useState(false);
  const [shareWithUsers, setShareWithUsers] = useState(false);
  const [none, setNone] = useState(true);
  const [allUsers, setAllUsers] = useState(false);
  const [sharedTypeState, setSharedTypeState] = useState('none');
  const [editSharedTypeState, setEditSharedTypeState] = useState();
  const [validationState, setValidationState] = useState(false);
  const [subjectValidationState, setSubjectValidationState] = useState(false);
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [ckeditorInstance, setCkeditorInstance] = useState();
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('snippets');
  const [templateOwnerId, setTemplateOwnerId] = useState();
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const { user, loading: userLoading } = useContext(UserContext);
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';
  const currentUserId = userLoading ? 0 : user.id;
  const userFilter = `filter[user][id]=${currentUserId}`;
  const formRef = React.useRef();
  const subjectRef = React.useRef();
  let sfTemplateData = {};
  const attachmentData = [];
  const attachmentsRef = useRef();
  const history = useHistory();
  const type = match.params.type;
  if (type === 'SF_clone') {
    sfTemplateData = location.state && location.state.sfTemplateData;
  }
  const [userListValidationState, setUserListValidationState] = useState(false);
  const [teamListValidationState, setTeamListValidationState] = useState(false);
  const [description, setDescription] = useState('<p></p>');
  const [initialDescription, setInitialDescription] = useState('<p></p>');
  const [initialSubject, setInitialSubject] = useState('');
  const [subjectValue, setSubjectvalue] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sharedGroups, setSharedGroups] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [formChange, setformChange] = useState(false);
  const [alternativeEmailId, setAlternativeEmailId] = useState();
  const [attachmentAssociation, setAttachmentAssociation] = useState([]);
  const teamListData = [];

  useEffect(() => {
    attachmentsRef.current = attachments;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
  }, [attachments]);

  const id = match.params.id && parseInt(match.params.id);

  const { query: searchParams } = parseUrl(window.location.search);

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    errors,
    trigger,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [limit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [offset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [templateName, settemplateName] = useState('');
  const refreshAttachments = (response) => {
    setAttachments(attachmentsRef.current.concat(response));
  };

  useEffect(() => {
    if (!tags.fetchedAll) {
      getAllTags(currentUserId, apiURL, token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: emailAccountData,
    loading: accountLoading,
    error: accountError,
  } = useQuery(FETCH_EMAIL_ACCOUNT_QUERY, {
    variables: { emailFilter: userFilter },
  });
  const emailId =
    emailAccountData?.Email?.data[0]?.email &&
    emailAccountData.Email.data[0].email;

  const isEmailIDVerified =
    emailAccountData?.Email?.data[0]?.verified &&
    emailAccountData.Email.data[0].verified;

  const {
    data: template,
    loading: templateLoading,
    error: templateError,
    refetch: refetchTemplateData,
  } = useQuery(FETCH_EMAIL_TEMPLATE_QUERY, {
    variables: { id },
    notifyOnNetworkStatusChange: true,
    skip: id === undefined || type === 'SF_clone',
  });

  useEffect(() => {
    if (type === 'SF_clone') {
      setValue('name', sfTemplateData && sfTemplateData.Name);
      settemplateName(sfTemplateData && sfTemplateData.Name);
      subjectRef.current.value = sfTemplateData && sfTemplateData.Subject;
      setDescription(sfTemplateData && sfTemplateData.Body);
    }
    if (
      template &&
      template?.template?.data &&
      Object.keys(template).length > 0
    ) {
      let tagData = [];
      if (id !== 0) {
        tagData =
          template &&
          template?.template?.data[0]?.associations?.tag &&
          template.template.data[0].associations.tag.map((tag) => tag.id);
      }
      setValue('name', template.template.data[0].name);
      settemplateName(template.template.data[0].name);
      setTemplateOwnerId(
        template &&
          template?.template?.data[0]?.associations?.user[0]?.id &&
          template.template.data[0].associations.user[0].id
      );
      subjectRef.current.value = template.template.data[0].subject;
      setSubjectvalue(template.template.data[0].subject);
      setInitialSubject(template.template.data[0].subject);
      if (type === 'edit') {
        const templateOwnerId =
          template?.template?.includedAssociations?.user[0]?.id;
        if (
          templateOwnerId !== currentUserId &&
          template.template.data[0].sharedType !== 'none'
        ) {
          notify(
            'This is a shared Template and cannot be updated.',
            'error',
            'shared_template'
          );
        }
        setEditSharedTypeState(template.template.data[0].sharedType);
        if (template.template.data[0].sharedType === 'none') {
          setNone(true);
          setSharedTypeState(template.template.data[0].sharedType);
        } else if (template.template.data[0].sharedType === 'allUsers') {
          setAllUsers(true);
          setSharedTypeState(template.template.data[0].sharedType);
        } else if (template.template.data[0].sharedType === 'shareWithUsers') {
          setShareWithUsers(true);
          setSharedTypeState(template.template.data[0].sharedType);
          setSharedUsers(template.template.data[0].sharedUsers);
        } else {
          setSpecificGroupOfUsers(true);
          setSharedTypeState(template.template.data[0].sharedType);
          setSharedGroups(
            template.template.data[0].sharedGroups
              ? template.template.data[0].sharedGroups
              : []
          );
        }
      }
      if (template?.template?.data[0]?.category?.id) {
        setValue('category', template.template.data[0].category.id);
      }
      setDescription(template.template.data[0].description);
      setInitialDescription(template.template.data[0].description);
      const currentUserTags =
        tags && tags.data && tags.data.map((tag) => tag.id);
      setSelectedTags(
        currentUserTags
          ? tagData.filter((id) => currentUserTags.includes(id))
          : []
      );

      setInitialLoading(true);
      if (template?.template?.includedAssociations?.attachment) {
        setAttachments(
          template.template.includedAssociations.attachment.length > 0
            ? template.template.includedAssociations.attachment
            : []
        );
      }

      if (id !== undefined && type === 'edit') {
        setEditSharedTypeState(template.template.data[0].sharedType);
      }

      if (
        template?.template?.data[0]?.associations?.attachment &&
        template.template.data[0].associations.attachment.length > 0
      ) {
        setAttachmentAssociation(
          template.template.data[0].associations.attachment.map(
            (attachment) => attachment.id
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  if (attachments && attachments.length > 0) {
    attachments.forEach((attachment) => {
      const temp = {
        // eslint-disable-next-line @typescript-eslint/camelcase
        file_name_with_timestamp: attachment.fileNameWithTimestamp,
      };
      attachmentData.push(temp);
    });
  }

  const getUserName = (userId) => {
    if (userId) {
      const selectedUser = template?.template?.includedAssociations?.user
        .filter((item) => parseInt(userId) === item.id)
        .map((item) => item.name);

      return selectedUser.toString();
    }
  };

  const handleSubjectFocus = () => {
    subjectRef.current.attributes.class.value = 'form-control focusing';
  };
  const popoverToggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  // Fetch Categories data from api-server
  const { data: categoriesData } = useQuery(FETCH_CATEGORIES_LIST_QUERY, {
    variables: { limit, offset },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

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
  const [
    sendTestEmail,
    { data: sendTestEmailData, loading: sendTestEmailLoading },
  ] = useLazyQuery(SEND_TEST_EMAIL_QUERY, {
    onCompleted: (response) => sendTestEmailCallBack(response, true),
    onError: (response) =>
      sendTestEmailCallBack(response, false, sendTestEmailData),
  });

  const [
    addEmailTemplate,
    { data: addEmailTemplateData, loading: addLoading },
  ] = useLazyQuery(CREATE_EMAIL_TEMPLATE_QUERY, {
    onCompleted: (response) => addEmailTemplateCallBack(response, true),
    onError: (response) =>
      addEmailTemplateCallBack(response, false, addEmailTemplateData),
  });

  const [
    cloneEmailTemplate,
    { data: cloneEmailTemplateData, loading: cloneLoading },
  ] = useLazyQuery(CREATE_EMAIL_TEMPLATE_QUERY, {
    onCompleted: (response) => cloneEmailTemplateCallBack(response, true),
    onError: (response) =>
      cloneEmailTemplateCallBack(response, false, cloneEmailTemplateData),
  });

  const [
    editEmailTemplate,
    { data: editEmailTemplateData, loading: editLoading },
  ] = useLazyQuery(UPDATE_EMAIL_TEMPLATE_QUERY, {
    variables: { id: id },
    onCompleted: (response) => editEmailTemplateCallBack(response, true),
    onError: (response) =>
      editEmailTemplateCallBack(response, false, editEmailTemplateData),
  });

  const [
    getSnipptes,
    { data: snippetsData, loading: snippetLoading },
  ] = useLazyQuery(GET_ALL_SNIPPETS, {
    variables: { snippetsFilter: `filter[user][id]=${currentUserId}` },
  });

  const snippetsArray = useMemo(
    () =>
      snippetsData && snippetsData.snippets ? snippetsData.snippets.data : [],
    [snippetsData]
  );

  useEffect(() => {
    if (snippetsArray.length > 0) {
      setSnippets(snippetsArray);
    }
  }, [snippetsArray]);

  const insertTemplateStyle = {
    height: '450px',
    overflow: 'auto',
  };

  const handleInsert = (category, value) => {
    if (category === 'snippet') {
      ckeditorInstance.insertContent(value);
    } else {
      setDescription(value);
      setInitialLoading(true);
    }
  };

  const handleFilterSnippets = (props) => {
    const value = props.target.value.trim();
    let tempArr = snippetsArray;
    if (value) {
      tempArr = tempArr.filter(function (option) {
        return option.name.toLowerCase().includes(value.toLowerCase());
      });
      setSnippets(tempArr);
    } else {
      setSnippets(tempArr);
    }
  };

  const sendTestEmailCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify(
        'Success! Test Email has been sent. Please check your Email inbox.',
        'success',
        'send_test_email'
      );
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to send test Email.',
        errorData,
        'send_test_email'
      );
    }
  };

  const addEmailTemplateCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Success! Template has been saved', 'success', 'add_template');
      setformChange(false);
      pathName && filterParms
        ? history.push({
            pathname: pathName,
            search: filterParms,
            state: {
              handleRefetch: true,
            },
          })
        : history.push('/templates');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create this Template',
        errorData,
        'add_template'
      );
    }
  };

  const cloneEmailTemplateCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      const templateId = response?.addEmailTemplate?.data[0]?.id;
      notify('Success! Template has been saved', 'success', 'clone_template');
      setformChange(false);
      history.push({
        pathname: `/templates/emails/${templateId}/edit`,
        search: location.search,
      });
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to clone this Template',
        errorData,
        'clone_template'
      );
    }
  };

  const editEmailTemplateCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Success! Template has been updated', 'success', 'edit_template');
      setformChange(false);
      pathName && filterParms
        ? history.push({
            pathname: pathName,
            search: filterParms,
            state: {
              handleRefetch: true,
            },
          })
        : history.push('/templates');
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to update this Template',
        errorData,
        'edit_template'
      );
    }
  };

  const handleAddTemplateAction = (input) => {
    addEmailTemplate({
      variables: {
        input,
      },
    });
  };

  const handleEditTemplateAction = (id, input) => {
    editEmailTemplate({
      variables: {
        id,
        input,
      },
    });
  };

  const handleCloneTemplateAction = (input) => {
    cloneEmailTemplate({
      variables: {
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

  const emailTemplateSubmit = () => {
    let templateData = getValues();
    const category = Number(templateData.category);
    templateData = {
      name: templateData.name.trim(),
      tagId: selectedTags.length > 0 ? selectedTags : [],
      sharedType: sharedTypeState,
      sharedGroups: sharedGroups.length > 0 ? sharedGroups : [0],
      sharedUsers: sharedUsers.length > 0 ? sharedUsers : [0],
      subject: subjectRef.current.value.trim(),
      category: category ? { id: category } : undefined,
      description: Base64.encode(description),
      attachments:
        attachmentsRef &&
        attachmentsRef.current &&
        attachmentsRef.current.length > 0
          ? attachmentsRef.current.map((item) => item.id)
          : [],
      crmEmailTemplateId:
        type === 'SF_clone' && sfTemplateData ? sfTemplateData.Id : undefined,
    };
    if (type === 'clone') {
      templateData['clone'] = true;
    }

    if (
      emailBodyValidate(description) === '<p></p>' ||
      emailBodyValidate(description).trim() === '' ||
      description.trim().length > 32000
    ) {
      setValidationState(true);
      return false;
    } else if (!subjectRef.current.value.trim()) {
      setSubjectValidationState(true);
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
        const actualData = template?.template?.data[0] || {};
        if (
          Base64.encode(actualData.description) !== templateData.description
        ) {
          editedFields.push('description');
        }
        if (actualData.name !== templateData.name) {
          editedFields.push('name');
        }
        if (actualData.subject !== templateData.subject) {
          editedFields.push('subject');
        }
        if (actualData.sharedType !== templateData.sharedType) {
          editedFields.push('sharedType');
        }
        if (actualData?.category?.id !== templateData?.category?.id) {
          editedFields.push('category');
        }
        // eslint-disable-next-line eqeqeq
        if (actualData.crmEmailTemplateId != templateData.crmEmailTemplateId) {
          editedFields.push('crmEmailTemplateId');
        }
        if (
          actualData?.associations?.tag?.map((tag) => tag.id).join(',') !==
          templateData?.tagId?.join(',')
        ) {
          editedFields.push('tags');
        }
        if (
          actualData?.associations?.attachment
            ?.map((tag) => tag.id)
            .join(',') !== templateData?.attachments?.join(',')
        ) {
          editedFields.push('attachments');
        }
        if (editedFields.length === 0) {
          notify('No changes made!', 'error');
          return;
        }
        handleEditTemplateAction(id, templateData);
      } else if (id !== undefined && type === 'clone') {
        handleCloneTemplateAction(templateData);
      } else if (id !== undefined && type === 'SF_clone') {
        handleCloneTemplateAction(templateData);
      } else {
        handleAddTemplateAction(templateData);
      }
      setformChange(false);
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
          type === 'clone' || type === 'SF_clone'
            ? templateName
              ? `Clone Template / ${templateName}`
              : 'Clone Template'
            : type === 'edit'
            ? templateName
              ? `Edit Template / ${templateName} `
              : 'Edit Template'
            : 'Add Template'
        }
      >
        <InputGroup>
          <ClButton
            color="primary"
            type="submit"
            className="mx-2"
            onClick={() => {
              trigger();
              emailTemplateSubmit();
            }}
            title={
              templateOwnerId !== currentUserId && type === 'edit'
                ? 'You cannot make changes as you are not the owner of this Template.'
                : 'Save'
            }
            icon={
              editLoading || addLoading || cloneLoading
                ? 'fas fa-spinner fa-spin'
                : 'fa fa-check'
            }
            disabled={type === 'edit' && templateOwnerId !== currentUserId}
          >
            {editLoading || addLoading || cloneLoading ? 'Wait...' : 'Save'}
          </ClButton>
          <ClButton
            color="info"
            icon={
              sendTestEmailLoading
                ? 'fas fa-spinner fa-spin'
                : 'fa fa-paper-plane'
            }
            title="Send test Email to a specific Email id"
            className="text-white mr-2 bg-color-perry"
            onClick={() => {
              trigger();
              if (
                emailBodyValidate(description) === '<p></p>' ||
                emailBodyValidate(description).trim() === '' ||
                !subjectRef.current.value?.trim()
              ) {
                notify(
                  'Please fill the required fields!',
                  'error',
                  'send_test_email'
                );
              } else {
                if (isEmailIDVerified) {
                  const element = document.createElement('div');
                  element.innerHTML = description;
                  const input = {
                    alternateSendTestEmailId: alternativeEmailId,
                    subject: subjectRef.current.value.trim(),
                    attachments: attachmentData,
                  };
                  if (
                    (element.firstChild != null &&
                      element.firstChild.nodeName.includes('text')) ||
                    (element.childElementCount > 0 &&
                      !element.firstChild.nodeName.includes('text') &&
                      element.firstChild.style.fontFamily === '')
                  ) {
                    input[
                      'content'
                    ] = `<span style="font-family:Arial;">${description}</span>`;
                  } else {
                    input['content'] = description;
                  }
                  sendTestEmail({
                    variables: {
                      input: input,
                    },
                  });
                } else {
                  notify(
                    'Your Email account is invalid. Please go to the Settings and revalidate your Email account!',
                    'error',
                    'send_test_email'
                  );
                }
              }
            }}
          >
            {sendTestEmailLoading ? 'Wait...' : 'Send Test Email'}
          </ClButton>
          <Button
            title="Send test Email using different Email id"
            color="info"
            onClick={() => {
              setConfirmModal(true);
            }}
          >
            <i className="fas fa-envelope text-white"></i>
          </Button>
        </InputGroup>
      </PageHeader>
      <Row>
        <Col>
          <Card className="card-default">
            {(templateLoading || !sfTemplateData) && (
              <CardBody>
                <Progress animated striped value="100">
                  Loading Template data
                </Progress>
              </CardBody>
            )}
            {templateError && (
              <CardBody className="text-center">
                <h6 className="text-danger mb-0">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch data
                </h6>
                {template?.requestId && (
                  <>
                    <br />
                    <span className="text-danger text-sm">{`RequestId: ${template?.requestId}`}</span>{' '}
                  </>
                )}
              </CardBody>
            )}
            <CardBody>
              <Form
                className="px-3"
                onSubmit={handleSubmit(emailTemplateSubmit)}
                innerRef={formRef}
              >
                <Row form>
                  <Col sm={5} xl={2}>
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
                  <Col sm={5} xl={2}>
                    <FormGroup className="pr-2">
                      <Input
                        id="add_email_template_category"
                        type="select"
                        name="category"
                        invalid={errors.category}
                        innerRef={register}
                      >
                        <option>Select Category</option>
                        {categoriesData &&
                          categoriesData.categories &&
                          categoriesData.categories.data.map((category, i) => {
                            return (
                              <option key={category.id} value={category.id}>
                                {category.lookupValue}
                              </option>
                            );
                          })}
                      </Input>
                      <ErrorMessage
                        errors={errors}
                        name="category"
                        className="invalid-feedback"
                        as="p"
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
                      templateOwnerId &&
                      currentUserId !== templateOwnerId && (
                        <span>
                          Shared by <b>{getUserName(templateOwnerId)}</b>
                        </span>
                      )}
                    <FormGroup
                      check
                      inline
                      className="text-nowrap"
                      hidden={
                        !isManagerUser &&
                        type === 'edit' &&
                        templateOwnerId &&
                        currentUserId !== templateOwnerId
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
                        templateOwnerId &&
                        currentUserId !== templateOwnerId
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
                      <FormGroup className="mb-0">
                        <UserList
                          value={isManagerUser && sharedUsers}
                          disableOptions={
                            id && editSharedTypeState === 'shareWithUsers'
                          }
                          placeHolder="Select Users"
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
                        <p
                          className="text-danger text-sm position-absolute"
                          hidden={
                            !(
                              sharedTypeState === 'shareWithUsers' &&
                              userListValidationState
                            )
                          }
                        >
                          Please select the users
                        </p>
                      </FormGroup>
                    )}
                    {specificGroupOfUsers && isManagerUser && (
                      <FormGroup className="mb-0">
                        <DropDown
                          name="teams"
                          data={teamListData}
                          value={isManagerUser && sharedGroups}
                          disableOptions={
                            id && editSharedTypeState === 'specificGroupOfUsers'
                          }
                          placeHolder="Select Teams"
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
                        <p
                          className="text-danger text-sm position-absolute"
                          hidden={
                            !(
                              sharedTypeState === 'specificGroupOfUsers' &&
                              teamListValidationState
                            )
                          }
                        >
                          Please select the teams
                        </p>
                      </FormGroup>
                    )}
                  </Col>
                </Row>

                <Row className="mb-2 border-top pt-2">
                  <Col md={6}>
                    <InputGroup>
                      <Label
                        for="add_email_template_name"
                        className="wd-sm text-bold pt-2"
                      >
                        Name<span className="text-danger">*</span>
                      </Label>
                      <Input
                        id="add_email_template_name"
                        type="text"
                        name="name"
                        autoComplete="off"
                        maxLength="44"
                        invalid={errors.name}
                        onChange={(e) => {
                          if (templateName !== e.target.value) {
                            setformChange(true);
                          }
                        }}
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
                <Row className="mb-2 border-top pt-2">
                  <Col md={6}>
                    <InputGroup>
                      <Label
                        for="add_email_template_subject"
                        className="wd-sm text-bold pt-2"
                      >
                        Subject<span className="text-danger">*</span>
                      </Label>
                      <Input
                        id="add_email_template_subject"
                        type="text"
                        name="subject"
                        maxLength="255"
                        autoComplete="off"
                        innerRef={subjectRef}
                        onFocus={handleSubjectFocus}
                        onChange={(e) => {
                          setSubjectvalue(e.target.value);
                          if (initialSubject !== e.target.value) {
                            setformChange(true);
                          }
                        }}
                      />
                    </InputGroup>
                    <p
                      className="text-danger text-sm"
                      hidden={
                        !(
                          (errors.name && subjectValue.trim() === '') ||
                          (subjectValue.trim() === '' &&
                            description === '<p></p>' &&
                            validationState) ||
                          (subjectValue.trim() === '' && subjectValidationState)
                        )
                      }
                    >
                      Subject is required
                    </p>
                  </Col>
                </Row>
                <Row className="mb-3 pt-3 border-top">
                  <Col md={12} className="px-0">
                    {((id !== undefined &&
                      !templateLoading &&
                      template &&
                      Object.keys(template).length > 0) ||
                      description) && (
                      <Editor
                        data={description}
                        onChange={(value) => {
                          setDescription(value ? value : '<p></p>');
                          if (description !== initialDescription) {
                            setformChange(true);
                          }
                        }}
                        userId={currentUserId}
                        templateId={parseInt(id)}
                        templatePreview={true}
                        type="templates"
                        ref={subjectRef}
                        onInit={(editorInstance) =>
                          setCkeditorInstance(editorInstance)
                        }
                        initialLoading={initialLoading}
                        resetLoading={(value) => setInitialLoading(value)}
                        attachments={attachments}
                        attachmentAssociation={attachmentAssociation}
                        refetch={() => refetchTemplateData()}
                        mailMergeVariables={mailMergeVariables}
                        notify={notify}
                        showUploadAttachment={true}
                        toolbarLocation="bottom"
                        showSignatureOnPreview={true}
                        hideDeleteIcon={
                          type === 'edit'
                            ? !(templateOwnerId !== currentUserId)
                            : true
                        }
                        refreshAttachments={(res) => refreshAttachments(res)}
                        deleteAttachments={(attachment) => {
                          const fileNameWithTimeStamp =
                            attachment.fileNameWithTimeStamp ||
                            attachment.fileNameWithTimestamp;
                          setAttachments(
                            attachmentsRef.current.filter((data) => {
                              if (data.fileNameWithTimeStamp) {
                                return (
                                  data.fileNameWithTimeStamp !==
                                  fileNameWithTimeStamp
                                );
                              } else {
                                return (
                                  data.fileNameWithTimestamp !==
                                  fileNameWithTimeStamp
                                );
                              }
                            })
                          );
                        }}
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
                        : 'Please enter template description'}
                    </p>
                  </Col>
                </Row>
                <CardFooter className="row">
                  <div className="ml-auto">
                    <InputGroup>
                      <ClButton
                        className="mr-2 text-white"
                        color="warning"
                        icon="far fa-envelope-open"
                        id="insert_popover"
                        onClick={() => {
                          getSnipptes();
                        }}
                      >
                        Insert Snippet
                      </ClButton>

                      <ClButton
                        color="primary"
                        className="mx-2"
                        title={
                          templateOwnerId !== currentUserId && type === 'edit'
                            ? 'You cannot make changes as you are not the owner of this Template.'
                            : 'Save'
                        }
                        icon={
                          editLoading || addLoading || cloneLoading
                            ? 'fas fa-spinner fa-spin'
                            : 'fa fa-check'
                        }
                        disabled={
                          type === 'edit' && templateOwnerId !== currentUserId
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
            <Popover
              style={insertTemplateStyle}
              placement="bottom"
              isOpen={showTemplatePopover}
              target="insert_popover"
              toggle={() => {
                setShowTemplatePopover(!showTemplatePopover);
              }}
            >
              <PopoverHeader className="pb-0">
                <Nav tabs className="border-bottom-0">
                  <NavItem title="Snippets">
                    <NavLink
                      className={classnames({
                        active: activeTab === 'snippets',
                      })}
                      onClick={() => {
                        popoverToggle('snippets');
                      }}
                    >
                      Snippets
                    </NavLink>
                  </NavItem>
                  <span
                    className="pointer d-block ml-auto"
                    onClick={() => {
                      setShowTemplatePopover(false);
                    }}
                  >
                    <i className="fa fa-times"></i>
                  </span>
                </Nav>
              </PopoverHeader>
              <PopoverBody className="p-0">
                <TabContent activeTab={activeTab} className="p-0 border-0">
                  <TabPane tabId="snippets">
                    <div className="bb p-2">
                      <Input
                        placeholder="Filter Snippets"
                        onChange={handleFilterSnippets}
                      />
                    </div>
                    <div className="mt-2">
                      {snippetLoading && (
                        <Progress animated striped value="100">
                          Loading Snippets
                        </Progress>
                      )}
                      {!snippetLoading &&
                        snippets.length > 0 &&
                        snippets.map((snippet, i) => {
                          return (
                            <div
                              className="px-2 bb mt-2 pointer"
                              key={i}
                              onClick={() => {
                                handleInsert(
                                  'snippet',
                                  snippet.convertedLinksContent ||
                                    snippet.description
                                );
                              }}
                            >
                              <h6>{snippet.name}</h6>
                              <div className="text-overflow">
                                <p
                                  className="text-truncate-2line"
                                  dangerouslySetInnerHTML={{
                                    __html: snippet.description,
                                  }}
                                ></p>
                              </div>
                            </div>
                          );
                        })}
                      {!snippetLoading && snippets.length === 0 && (
                        <Alert color="warning" className="p-2 text-center m-2">
                          No Snippets Available
                        </Alert>
                      )}
                    </div>
                  </TabPane>
                </TabContent>
              </PopoverBody>
            </Popover>
          </Card>
        </Col>
      </Row>
      <CloneModal
        showModal={confirmModal}
        accountLoading={accountLoading}
        accountError={accountError}
        alternativeEmailId={
          alternativeEmailId || (isEmailIDVerified && emailId)
        }
        handleAction={(data) => {
          setAlternativeEmailId(data.emailId);
          setConfirmModal(false);
          notify(
            'Email id has been changed successfully',
            'success',
            'change_email_id'
          );
        }}
        hideModal={() => {
          setConfirmModal(false);
        }}
      />

      <Prompt
        when={formChange}
        message="Your changes will not be saved. Do you wish to continue?"
      />
    </ContentWrapper>
  );
}
const mapStateToProps = (state) => ({
  tags: state.tags,
});
export default connect(mapStateToProps, { getAllTags })(AddOrEditEmailTemplate);
