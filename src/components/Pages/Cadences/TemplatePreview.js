import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  ButtonGroup,
  CardBody,
  Col,
  Form,
  Input,
  InputGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Popover,
  PopoverBody,
  PopoverHeader,
  TabContent,
  TabPane,
  Progress,
  Row,
} from 'reactstrap';
import axios from 'axios';
import classnames from 'classnames';
import { Base64 } from 'js-base64';
import { useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import { toast } from 'react-toastify';

import { notify, showErrorMessage } from '../../../util/index';
import { getAllUsers } from '../../../store/actions/actions';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';

import ClButton from '../../Common/Button';
import Editor from '../../Common/Editor';
import UserContext from '../../UserContext';

import {
  FETCH_EMAIL_TEMPLATE_QUERY,
  CREATE_EMAIL_TEMPLATE_QUERY,
  UPDATE_EMAIL_TEMPLATE_QUERY,
  FETCH_MAIL_MERGE_VARIABLES,
  GET_ALL_SNIPPETS,
  SEND_TEST_EMAIL_QUERY,
} from '../../queries/EmailTemplatesQuery';

import {
  FETCH_EMAIL_ACCOUNT_QUERY,
  FETCH_EMAIL_SIGNATURE_QUERY,
} from '../../queries/SettingsQuery';
toast.configure();

const TemplatePreview = ({
  getAllUsers,
  users,
  templateId,
  hideModal,
  showModal,
  type,
  handleAction,
  previewData,
  previewLoading,
  previewError,
  header,
  nestedTemplateData,
  sharedType,
  sharedUsers,
  sharedTeams,
  parentTemplateSubject,
}) => {
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);
  const [snippets, setSnippets] = useState([]);
  const [ckeditorInstance, setCkeditorInstance] = useState();
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('snippets');
  const formRef = React.useRef();
  const subjectRef = React.useRef();
  const attachmentsRef = useRef();
  const { apiURL: RESOURCE_SERVER_URL, token } = useContext(
    ApiUrlAndTokenContext
  );
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const signatureFilter = `filter[user][id]=${currentUserId}`;
  const [subjectValidationState, setSubjectValidationState] = useState(false);
  const [validationState, setValidationState] = useState(false);
  const [sharedTypeState, setSharedTypeState] = useState();
  const [sharedGroup, setSharedGroup] = useState([]);
  const [sharedUser, setSharedUser] = useState([]);

  const [name, setName] = useState();
  const [description, setDescription] = useState('<p></p>');
  const [previewBody, setPreviewBody] = useState();
  const [subjectValue, setSubjectvalue] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [attachmentsView, setAttachmentsView] = useState([]);
  const [editSharedTypeState, setEditSharedTypeState] = useState();
  const [ownerId, setOwnerId] = useState();
  const [attachmentAssociation, setAttachmentAssociation] = useState([]);
  const attachmentData = [];
  const refreshAttachments = (response) => {
    setAttachments(attachmentsRef.current.concat(response));
  };

  useEffect(() => {
    if (!users.fetchedAll) {
      getAllUsers(currentUserId, RESOURCE_SERVER_URL, token);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    attachmentsRef.current = attachments;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
  }, [attachments]);

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

  const {
    data: emailAccountData,
    loading: accountLoading,
    error: accountError,
  } = useQuery(FETCH_EMAIL_ACCOUNT_QUERY, {
    variables: { emailFilter: signatureFilter },
  });
  const isEmailIDVerified =
    !accountLoading &&
    !accountError &&
    emailAccountData?.Email?.data[0]?.verified;

  const {
    data: template,
    loading: templateLoading,
    error: templateError,
    refetch: refetchTemplateData,
  } = useQuery(FETCH_EMAIL_TEMPLATE_QUERY, {
    variables: { id: templateId },
    notifyOnNetworkStatusChange: true,
    skip: templateId === undefined,
  });

  const {
    data: emailSignatureData,
    loading: signatureLoading,
    error: signatureError,
  } = useQuery(FETCH_EMAIL_SIGNATURE_QUERY, {
    variables: { signatureFilter: signatureFilter },
    skip: type !== 'view',
  });

  const signature =
    !signatureLoading &&
    !signatureError &&
    emailSignatureData?.Email?.data[0]?.content &&
    emailSignatureData.Email.data[0].content;

  useEffect(() => {
    if (showModal && parentTemplateSubject?.trim() && subjectRef.current) {
      subjectRef.current.value = parentTemplateSubject?.trim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentTemplateSubject, subjectRef.current, showModal]);

  useEffect(() => {
    if (
      template &&
      template?.template?.data[0] &&
      Object.keys(template).length > 0
    ) {
      setValue('templateName', template.template.data[0].name);
      if (subjectRef?.current) {
        subjectRef.current.value = template.template.data[0].subject;
      }
      setSubjectvalue(template.template.data[0].subject);
      setName(template.template.data[0].name);
      setDescription(template.template.data[0].description);
      setPreviewBody(template.template.data[0].description);
      setOwnerId(
        template &&
          template?.template?.data[0]?.associations?.user[0]?.id &&
          template.template.data[0].associations.user[0].id
      );

      setInitialLoading(true);
      if (template?.template?.includedAssociations?.attachment) {
        setAttachments(
          template.template.includedAssociations.attachment.length > 0
            ? template.template.includedAssociations.attachment
            : []
        );
        setAttachmentsView(
          template.template.includedAssociations.attachment.length > 0
            ? template.template.includedAssociations.attachment
            : []
        );
      }

      if (templateId !== undefined && type === 'edit') {
        setEditSharedTypeState(template.template.data[0].sharedType);
        setSharedTypeState(template.template.data[0].sharedType);
        if (template.template.data[0].sharedType === 'shareWithUsers') {
          setSharedUser(template.template.data[0].sharedUsers);
        } else if (
          template.template.data[0].sharedType === 'specificGroupOfUsers'
        ) {
          setSharedGroup(
            template.template.data[0].sharedGroups
              ? template.template.data[0].sharedGroups
              : []
          );
        }
        if (template.template.data[0].sharedType !== 'none') {
          notify(
            'This is a shared Template and cannot be updated.',
            'error',
            'shared_template'
          );
        }
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

  const popoverToggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const removeDuplicates = (arr) => {
    const filteredArray = arr?.filter(function (item, pos) {
      return arr.indexOf(item) === pos;
    });
    return filteredArray;
  };

  const getUserNames = (userIds) => {
    if (userIds) {
      const selectedUser = users?.data
        .filter((item) => userIds.includes(item.id))
        .map((item) => item.name);

      return selectedUser;
    }
  };

  const showTemplateSharedDetails = (sharedType) => {
    let shareWith;
    if (sharedType === 'none') {
      shareWith = 'Private';
    } else if (sharedType === 'allUsers') {
      shareWith = 'Public';
    } else if (sharedType === 'shareWithUsers') {
      shareWith = `Share with Users ${
        (sharedUsers || sharedUser) &&
        `(${getUserNames(
          type === 'edit' ? sharedUser : sharedUsers
        )?.toString()})`
      }`;
    } else {
      shareWith = `Share with Teams ${
        (sharedTeams || sharedGroup) &&
        `(${
          type === 'edit'
            ? removeDuplicates(sharedGroup)?.toString()
            : removeDuplicates(sharedTeams)?.toString()
        })`
      }`;
    }
    return shareWith;
  };

  const handleSubjectFocus = () => {
    subjectRef.current.attributes.class.value = 'form-control focusing';
  };

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
    editEmailTemplate,
    { data: editEmailTemplateData, loading: editLoading },
  ] = useLazyQuery(UPDATE_EMAIL_TEMPLATE_QUERY, {
    variables: { id: templateId },
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
      setDescription('<p></p>');
      handleAction(response.addEmailTemplate.data);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create this Template',
        errorData,
        'add_template'
      );
    }
  };

  const editEmailTemplateCallBack = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify('Success! Template has been updated', 'success', 'edit_template');
      hideModal();
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

  const handleDownloadAttachment = (props) => {
    const { currentTarget } = props;
    axios
      .get(`attachments/${currentTarget.value}/download`, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: response.headers['content-type'] })
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', currentTarget.textContent);
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
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

    templateData = {
      name: templateData.templateName.trim(),
      subject: subjectRef.current.value.trim(),
      description: Base64.encode(description),
      sharedType: sharedType,
      sharedGroups: sharedTeams?.length > 0 ? sharedTeams : [0],
      sharedUsers: sharedUsers?.length > 0 ? sharedUsers : [0],
      attachments:
        attachmentsRef.current && attachmentsRef.current.length > 0
          ? attachmentsRef.current.map((item) => item.id)
          : [],
    };
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
    } else {
      if (templateId > 0 && type === 'edit') {
        handleEditTemplateAction(templateId, templateData);
      } else if (type === 'add') {
        handleAddTemplateAction(templateData);
      }
    }
  };
  const getFormattedTemplateBody = (templateDescription) => {
    const templateBody = document.createElement('div');
    templateBody.innerHTML = `${templateDescription}${
      !header && signature ? signature : ''
    }`;
    templateBody.querySelectorAll('a').forEach((a) => {
      // eslint-disable-next-line no-script-url
      a.setAttribute('href', 'javascript:void(0);');
      a.setAttribute(
        'onCLick',
        `(function(){alert('This action is not allowed in this section');
    return false;
})();return false;`
      );
    });
    const linksDisabledTemplate = templateBody && templateBody.innerHTML;
    return linksDisabledTemplate;
  };

  const templateName = !templateLoading && !templateError && name ? name : '';
  return (
    <Modal
      size={type === 'edit' || type === 'add' ? 'xl' : 'lg'}
      isOpen={showModal}
      centered
    >
      <ModalHeader toggle={hideModal}>
        <i className="fas fa-envelope text-email mr-2"></i>
        {header
          ? header
          : type === 'add'
          ? 'Create Email Template'
          : `Email Template ${
              type === 'view' ? 'Preview' : ''
            } - ${templateName}`}
      </ModalHeader>

      <div className={type === 'view' ? 'd-block' : 'd-none'}>
        {(templateLoading || previewLoading) && (
          <CardBody>
            <Progress animated striped value="100">
              Loading template data
            </Progress>
          </CardBody>
        )}
        {(templateError || previewError) && (
          <CardBody>
            <Alert color="danger" className="text-center mb-0">
              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
              Failed to fetch data
            </Alert>
          </CardBody>
        )}
        {!(templateLoading || previewLoading) &&
          !(templateError || previewError) && (
            <ModalBody className="ml-3">
              <Row className="mb-2" hidden={previewData}>
                <b className="mr-2">From</b>
                <span>{'<Logged-user-email-id>@domain_name.com'}</span>
              </Row>
              <Row className="mb-2">
                <b className="mr-2">To</b>
                <span>
                  {previewData && previewData.toAddress
                    ? previewData.toAddress
                    : '<Prospects-email-id>@domain_name.com'}
                </span>
              </Row>
              <Row className="mb-2" hidden={!previewData}>
                <b className="mr-2">Cc</b>
                <span>
                  {previewData &&
                    previewData.ccAddress &&
                    previewData.ccAddress}
                </span>
              </Row>
              <Row className="mb-2">
                <b className="mr-2">Subject</b>
                <span>
                  {nestedTemplateData?.length > 0 && 'Re: '}
                  {previewData && previewData.emailSubject
                    ? previewData.emailSubject
                    : subjectValue}
                </span>
              </Row>
              <Row className="d-flex mb-2">
                <b className="mr-2">Attached</b>
                <Col sm={10}>
                  <Row>
                    {attachmentsView &&
                      attachmentsView.map((attachment, i) => {
                        return (
                          <Col sm={4} key={i} className="pb-1">
                            <ButtonGroup className="w-100 attachments">
                              <ClButton
                                block
                                icon={attachment.actionIcon}
                                title={attachment.fileName}
                                className="text-overflow"
                                onClick={handleDownloadAttachment}
                                value={attachment.id}
                              >
                                {attachment.fileName}
                              </ClButton>
                            </ButtonGroup>
                          </Col>
                        );
                      })}
                  </Row>
                </Col>
              </Row>
              <Row className="mb-2 border-top pt-2 mh-50 pre-scrollable">
                <div
                  dangerouslySetInnerHTML={{
                    __html: getFormattedTemplateBody(
                      previewData && previewData.emailBody
                        ? previewData.emailBody
                        : previewBody
                    ),
                  }}
                ></div>
              </Row>
              {nestedTemplateData?.length > 0 && (
                <div>
                  <Row className="mb-2">
                    <b className="mr-2">From</b>
                    <span>{'<Logged-user-email-id>@domain_name.com'}</span>
                  </Row>
                  <Row className="mb-2">
                    <b className="mr-2">To</b>
                    <span>{'<Prospects-email-id>@domain_name.com'}</span>
                  </Row>
                  <Row className="mb-2">
                    <b className="mr-2">Subject</b>
                    <span>{nestedTemplateData[0].subject}</span>
                  </Row>
                  <Row className="mb-2 border-top pt-2 mh-50 pre-scrollable">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getFormattedTemplateBody(
                          nestedTemplateData[0].description
                        ),
                      }}
                    ></div>
                  </Row>
                </div>
              )}
            </ModalBody>
          )}
      </div>
      <div className={type === 'edit' || type === 'add' ? 'd-block' : 'd-none'}>
        {templateLoading && (
          <CardBody>
            <Progress animated striped value="100">
              Loading template data
            </Progress>
          </CardBody>
        )}
        {templateError && (
          <CardBody>
            <Alert color="danger" className="text-center mb-0">
              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
              Failed to fetch data
            </Alert>
          </CardBody>
        )}

        <Form onSubmit={handleSubmit(emailTemplateSubmit)} innerRef={formRef}>
          {!templateLoading && !templateError && (
            <ModalBody>
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
                      name="templateName"
                      autoComplete="off"
                      maxLength="44"
                      invalid={errors.templateName}
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
                        errors.templateName?.type === 'spaceValidation' &&
                        'Please enter the valid name'
                      }
                      errors={errors}
                      name="templateName"
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
                      }}
                    />
                  </InputGroup>
                  <p
                    className="text-danger text-sm"
                    hidden={
                      !(
                        (errors.templateName && subjectValue.trim() === '') ||
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
              <Row className="mb-2 border-top pt-2">
                <Col>
                  <InputGroup>
                    <Label
                      for="add_email_template_subject"
                      className="wd-sm text-bold pt-2"
                    >
                      Shared type
                    </Label>
                    <span className="pt-2">
                      {showTemplateSharedDetails(
                        type === 'edit' ? sharedTypeState : sharedType
                      )}
                    </span>
                  </InputGroup>
                </Col>
              </Row>
              <Row className="mb-2 pt-3 border-top">
                <Col md={12}>
                  {((templateId !== undefined &&
                    !templateLoading &&
                    template &&
                    Object.keys(template).length > 0) ||
                    description) && (
                    <Editor
                      data={description}
                      onChange={(value) =>
                        setDescription(value ? value : '<p></p>')
                      }
                      userId={currentUserId}
                      templateId={templateId}
                      ref={subjectRef}
                      templatePreview={true}
                      type="templates"
                      onInit={(editorInstance) =>
                        setCkeditorInstance(editorInstance)
                      }
                      initialLoading={initialLoading}
                      resetLoading={(value) => setInitialLoading(value)}
                      attachments={attachments}
                      attachmentAssociation={attachmentAssociation}
                      refetch={() => refetchTemplateData()}
                      mailMergeVariables={mailMergeVariables}
                      showMailMergeToolbar={type === 'edit' || type === 'add'}
                      notify={notify}
                      showUploadAttachment={true}
                      toolbarLocation="bottom"
                      showSignatureOnPreview={true}
                      hideDeleteIcon={
                        type === 'edit' ? !(ownerId !== currentUserId) : true
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
                        (errors.templateName && description === '<p></p>') ||
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
            </ModalBody>
          )}
          <ModalFooter>
            <div className="float-right pr-1">
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
              <ClButton
                color="warning"
                className="mr-2"
                icon="far fa-envelope-open"
                id="insert_popover"
                onClick={() => {
                  getSnipptes();
                }}
              >
                Insert snippets
              </ClButton>

              <ClButton
                title={
                  type === 'edit' && editSharedTypeState !== 'none'
                    ? 'This Template is a shared Template'
                    : ownerId !== currentUserId && type === 'edit'
                    ? 'You are not the owner of this Template'
                    : 'Save'
                }
                disabled={
                  type === 'edit' &&
                  (editSharedTypeState !== 'none' || ownerId !== currentUserId)
                }
                color="primary"
                icon={
                  editLoading || addLoading
                    ? 'fas fa-spinner fa-spin'
                    : 'fa fa-check'
                }
              >
                {editLoading || addLoading ? 'Wait...' : 'Save'}
              </ClButton>
            </div>
          </ModalFooter>
        </Form>

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
              <NavItem>
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
      </div>
    </Modal>
  );
};
const mapStateToProps = (state) => ({
  users: state.users,
});
export default connect(mapStateToProps, { getAllUsers })(TemplatePreview);
