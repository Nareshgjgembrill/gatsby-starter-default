/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import base64 from 'react-native-base64';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import {
  CREATE_EMAIL_ACCOUNT_QUERY,
  CREATE_EMAIL_SIGNATURE_QUERY,
  FETCH_EMAIL_ACCOUNT_QUERY,
  FETCH_EMAIL_SIGNATURE_QUERY,
  UPDATE_EMAIL_ACCOUNT_QUERY,
  DISABLE_EMAIL_ACCOUNT_QUERY,
} from '../../queries/SettingsQuery';
import { SAVE_CALENDAR_SETTINGS } from '../../queries/MeetingsQuery';
import { FETCH_MAIL_MERGE_VARIABLES } from '../../queries/EmailTemplatesQuery';
import Button from '../../Common/Button';
import UserContext from '../../UserContext';
import ConfirmModal from '../../Common/ConfirmModal';
import Editor from '../../Common/Editor';
import OutOfDateModal from './OutOfDateModal';
import { notify, showErrorMessage } from '../../../util/index';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

toast.configure();

const EmailSetting = () => {
  const [passwordType, setPasswordType] = useState(false);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const userFilter = `filter[user][id]=${currentUserId}`;
  const signatureFilter = `filter[user][id]=${currentUserId}`;
  const [serverType, setServerType] = useState('');
  const failedMsg = 'Sorry! Failed to save';
  const successMsg = 'Saved successfully!';
  const [existingEmail, setExistingEmail] = useState();
  const [disableEmailAccount, setDisableEmailAccount] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [emailSignature, setEmailSignature] = useState();
  const [disabledFrom, setDisabledFrom] = useState();
  const [disabledTo, setDisabledTo] = useState();

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  let verified = false;
  let accountId = 0;
  let emailReset = {};
  const currentUrl = encodeURIComponent(window.location.origin);

  const { data: mailMergeVariablesData } = useQuery(
    FETCH_MAIL_MERGE_VARIABLES,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    }
  );
  const {
    data: emailAccountData,
    loading: accountLoading,
    error: accountError,
    refetch: refetchEmailAccountData,
  } = useQuery(FETCH_EMAIL_ACCOUNT_QUERY, {
    variables: { emailFilter: userFilter },
  });
  const {
    data: emailSignatureData,
    loading: signatureLoading,
    error: signatueError,
    refetch: refetchEmailSignatureData,
  } = useQuery(FETCH_EMAIL_SIGNATURE_QUERY, {
    variables: { signatureFilter: signatureFilter },
  });

  if (
    emailAccountData &&
    emailAccountData.Email &&
    emailAccountData.Email.data[0]
  ) {
    verified = emailAccountData.Email.data[0].verified;
    accountId = emailAccountData.Email.data[0].id;
  }
  let windowObjectReference = null;
  let previousUrl = null;

  const openSignInWindow = (url, name) => {
    window.removeEventListener('message', receiveMessage);

    const strWindowFeatures =
      'toolbar=no, menubar=no,scrollbars=yes, width=600, height=500';

    if (windowObjectReference === null || windowObjectReference.closed) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
    } else if (previousUrl !== url) {
      windowObjectReference = window.open(url, name, strWindowFeatures);
      windowObjectReference.focus();
    } else {
      windowObjectReference.focus();
    }
    window.addEventListener('message', (event) => receiveMessage(event), false);
    previousUrl = url;
  };

  const receiveMessage = (event) => {
    const { data } = event;
    if (data.source === 'lma-login-redirect') {
      const { payload } = data;
      const redirectUrl = `/auth/google/login${payload}`;
      window.location.pathname = redirectUrl;
    }
  };

  const mailMergeVariables = useMemo(
    () =>
      mailMergeVariablesData &&
      mailMergeVariablesData.mailmergeVariables &&
      mailMergeVariablesData.mailmergeVariables.data
        ? mailMergeVariablesData.mailmergeVariables.data.mail_merge
        : [],
    [mailMergeVariablesData]
  );

  const date = new Date();
  const today = date.toISOString();

  const { handleSubmit, register, getValues, errors, reset } = useForm();

  useEffect(() => {
    if (emailAccountData?.Email?.data[0]) {
      const emailAccount = {
        serverType: emailAccountData.Email.data[0].serverType,
        displayName: emailAccountData.Email.data[0].displayName,
        userName: emailAccountData.Email.data[0].userName,
        email: emailAccountData.Email.data[0].email,
        mailPassword: emailAccountData.Email.data[0].mailPassword,
        mailServerUrl: emailAccountData.Email.data[0].mailServerUrl,
        disableEmailAccount: emailAccountData.Email.data[0].outOfOfficeEndDate
          ? true
          : false,
      };
      setExistingEmail(emailAccountData.Email.data[0].email);
      setServerType(emailAccountData.Email.data[0].serverType);
      setDisabled(
        emailAccountData.Email.data[0].outOfOfficeEndDate
          ? emailAccountData.Email.data[0].outOfOfficeStartDate === today ||
              (emailAccountData.Email.data[0].outOfOfficeStartDate < today &&
                emailAccountData.Email.data[0].outOfOfficeEndDate > today) ||
              emailAccountData.Email.data[0].outOfOfficeEndDate === today
          : false
      );
      setDisableEmailAccount(
        emailAccountData.Email.data[0].outOfOfficeEndDate
          ? emailAccountData.Email.data[0].outOfOfficeStartDate === today ||
              (emailAccountData.Email.data[0].outOfOfficeStartDate < today &&
                emailAccountData.Email.data[0].outOfOfficeEndDate > today) ||
              emailAccountData.Email.data[0].outOfOfficeEndDate === today
          : false
      );
      setDisabledFrom(
        emailAccountData.Email.data[0].outOfOfficeEndDate
          ? new Date(emailAccountData.Email.data[0].outOfOfficeStartDate)
          : ''
      );
      setDisabledTo(
        emailAccountData.Email.data[0].outOfOfficeEndDate
          ? new Date(emailAccountData.Email.data[0].outOfOfficeEndDate)
          : ''
      );

      reset(emailAccount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailAccountData]);

  if (
    emailAccountData &&
    emailAccountData.Email &&
    emailAccountData.Email.data[0]
  ) {
    emailReset = {
      serverType: emailAccountData.Email.data[0].serverType,
    };
  }
  useEffect(() => {
    if (emailSignatureData !== undefined) {
      setInitialLoading(true);
      setEmailSignature(
        emailSignatureData.Email.data.length > 0 &&
          emailSignatureData.Email.data[0].content !== null
          ? emailSignatureData.Email.data[0].content
          : ' '
      );
    }
  }, [emailSignatureData]);

  const onSubmit = () => {
    const data = getValues();
    let input;
    if (serverType === 'Gmail') {
      input = {
        serverType: data.serverType,
        email: data.email,
        displayName: data.displayName,
      };
    } else if (serverType === 'Office365') {
      input = {
        serverType: data.serverType,
        email: data.email,
        userName: data.userName,
        mailPassword: data.mailPassword,
      };
    } else if (serverType === 'Office365 (Oauth)') {
      input = {
        serverType: data.serverType,
        email: data.email,
        userName: data.userName,
      };
    } else if (
      serverType === 'Exchange 2007' ||
      serverType === 'Exchange 2010' ||
      serverType === 'Exchange 2013' ||
      serverType === 'Exchange 2016'
    ) {
      input = {
        serverType: data.serverType,
        email: data.email,
        userName: data.userName,
        mailPassword: data.mailPassword,
        mailServerUrl: data.mailServerUrl,
      };
    }

    if (serverType !== '') {
      if (accountId === 0) {
        addEmailAccount({
          variables: {
            input: input,
            referrer: currentUrl,
          },
        });
      } else {
        editEmailAccount({
          variables: {
            input: input,
            referrer: currentUrl,
          },
        });
      }
    }
  };

  const [
    addEmailAccount,
    { data: addEmailAccountData, loading: addEmailAccountLoading },
  ] = useLazyQuery(CREATE_EMAIL_ACCOUNT_QUERY, {
    onCompleted: (response) => {
      addEmailCallBack(response, true);
      setCalendarSetting();
    },
    onError: (response) => addEmailCallBack(response),
  });

  const [editEmailAccount, { loading: editAccountLoading }] = useLazyQuery(
    UPDATE_EMAIL_ACCOUNT_QUERY,
    {
      variables: { id: accountId },
      onCompleted: (response) => {
        addEmailCallBack(response, true);
        setCalendarSetting();
      },
      onError: (response) => addEmailCallBack(response),
    }
  );

  const [
    addEmailSignature,
    { data: addSignatureData, loading: addSignatureLoading },
  ] = useLazyQuery(CREATE_EMAIL_SIGNATURE_QUERY, {
    onCompleted: (response) => addEmailSignatureCallBack(response, true),
    onError: (response) => addEmailSignatureCallBack(response),
  });

  const [setCalendarSetting, { data: saveCalenderSettingsData }] = useLazyQuery(
    SAVE_CALENDAR_SETTINGS,
    {
      variables: {
        isEmailIdVerified: false,
      },
      onError: (error) => {
        showErrorMessage(
          error,
          failedMsg,
          saveCalenderSettingsData,
          'save_calender_settings'
        );
      },
    }
  );

  const [
    disableOrEnableEmailAccount,
    { data: disableEmailData, loading: disableEmailAccountLoading },
  ] = useLazyQuery(DISABLE_EMAIL_ACCOUNT_QUERY, {
    variables: { id: accountId },
    onCompleted: (response) => disableEmailCallBack(response, true),
    onError: (response) => disableEmailCallBack(response),
  });

  const addEmailCallBack = (response, status) => {
    if (status) {
      if (
        response.Email.data[0].serverType === 'Gmail' ||
        response.Email.data[0].serverType === 'Office365 (Oauth)'
      ) {
        const redirectUrl = response.Email.data[0].redirectUrl;
        if (
          existingEmail !== response.Email.data[0].email ||
          !response.Email.data[0].verified
        ) {
          openSignInWindow(redirectUrl, 'gmailOauthWin');
        } else {
          notify(successMsg, 'success', 'email_account');
        }
        refetchEmailAccountData();
      } else {
        notify(successMsg, 'success', 'email_account');
        refetchEmailAccountData();
      }
    } else {
      showErrorMessage(
        response,
        failedMsg,
        addEmailAccountData,
        'email_account'
      );
    }
  };
  const addEmailSignatureCallBack = (response, status) => {
    if (status) {
      notify(successMsg, 'success', 'email_signature');
      refetchEmailSignatureData();
    } else {
      showErrorMessage(
        response,
        failedMsg,
        addSignatureData,
        'email_signature'
      );
    }
  };

  const disableEmailCallBack = (response, status) => {
    if (status) {
      notify(successMsg, 'success', 'disable_account');
      refetchEmailAccountData();
      setShowConfirmModal(false);
      setShowDateModal(false);
    } else {
      showErrorMessage(
        response,
        failedMsg,
        disableEmailData,
        'disable_account'
      );
    }
  };

  const saveEmailSignature = (signatureContent) => {
    if (signatureContent.length > 32000) {
      notify(
        'Sorry! Email signature has exceeded the character limit.',
        'error',
        'email_signature'
      );
      return false;
    }
    const content = base64.encode(signatureContent);
    addEmailSignature({
      variables: {
        content: content,
      },
    });
  };

  const handleDisableEmailAccount = (Dates) => {
    const inputData = getValues();
    const startDate =
      Dates === undefined
        ? undefined
        : new Date(Dates.startDate).toISOString().split('.')[0] + 'Z';
    const endDate =
      Dates === undefined
        ? undefined
        : new Date(Dates.endDate).toISOString().split('.')[0] + 'Z';
    const input = {
      serverType: inputData.serverType,
      email: inputData.email,
      disable: disableEmailAccount,
      outOfOfficeStartDate: startDate,
      outOfOfficeEndDate: endDate,
    };
    disableOrEnableEmailAccount({
      variables: {
        input: input,
      },
    });
  };

  const cancelConfirmModal = () => {
    setDisableEmailAccount(!disableEmailAccount);
    setShowConfirmModal(false);
    refetchEmailAccountData();
  };

  const cancelDateModal = () => {
    setDisableEmailAccount(!disableEmailAccount);
    setShowDateModal(false);
    refetchEmailAccountData();
  };

  return (
    <Card className="b">
      <CardHeader className="bg-gray-lighter text-bold">
        Email Settings
        <i
          className={
            'ml-2 ' +
            (accountLoading
              ? 'fas fa-spinner fa-spin'
              : accountError
              ? 'fas fa-exclamation-circle text-danger'
              : '')
          }
          title={accountError ? FAILED_TO_FETCH_DATA : 'Loading'}
        ></i>
      </CardHeader>
      <CardBody className="bt">
        <p>
          <strong>Email Account</strong>
        </p>
        <Form onSubmit={handleSubmit(onSubmit)} name="emailAccountForm">
          <FormGroup>
            <Label for="server_type">Server Type</Label>
            <Input
              type="select"
              name="serverType"
              id="server_type"
              invalid={errors.serverType}
              innerRef={register({ required: 'Please select server type' })}
              onChange={(e) => {
                const serverType = e.target.value;
                setServerType(serverType);
                reset(emailReset);
              }}
              value={serverType}
            >
              <option></option>
              <option value="Gmail">Gmail</option>
              <option value="Office365">Office365 (Basic)</option>
              <option value="Office365 (Oauth)">Office365 (Oauth)</option>
              <option value="Exchange 2007">Exchange 2007</option>
              <option value="Exchange 2010">Exchange 2010</option>
              <option value="Exchange 2013">Exchange 2013</option>
              <option value="Exchange 2016">Exchange 2016</option>
            </Input>
            <ErrorMessage
              errors={errors}
              name="serverType"
              className="invalid-feedback"
              as="p"
            />
          </FormGroup>
          <FormGroup style={{ display: serverType === 'Gmail' ? '' : 'none' }}>
            <Label for="display_name">Display Name</Label>
            <Input
              type="text"
              name="displayName"
              id="display_name"
              invalid={errors.DisplayName}
              innerRef={register({ required: 'Please enter display name' })}
            />
            <ErrorMessage
              errors={errors}
              name="DisplayName"
              className="invalid-feedback"
              as="p"
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              invalid={errors.email}
              innerRef={register({ required: 'Please enter email' })}
            />
            <ErrorMessage
              errors={errors}
              name="email"
              className="invalid-feedback"
              as="p"
            />
          </FormGroup>
          <FormGroup style={{ display: serverType === 'Gmail' ? 'none' : '' }}>
            <Label for="user_name">Username</Label>
            <Input
              type="text"
              name="userName"
              id="user_name"
              invalid={errors.UserName}
              innerRef={register({ required: 'Please enter user name' })}
            />
            <ErrorMessage
              errors={errors}
              name="userName"
              className="invalid-feedback"
              as="p"
            />
          </FormGroup>
          <FormGroup
            style={{
              display:
                serverType === 'Gmail' || serverType === 'Office365 (Oauth)'
                  ? 'none'
                  : '',
            }}
          >
            <Label for="mail_password">Password</Label>
            <Input
              type={passwordType ? 'text' : 'password'}
              name="mailPassword"
              id="mail_password"
              innerRef={register({ required: 'Please enter password' })}
            />
          </FormGroup>
          <FormGroup
            style={{
              display:
                serverType === 'Exchange 2007' ||
                serverType === 'Exchange 2010' ||
                serverType === 'Exchange 2013' ||
                serverType === 'Exchange 2016'
                  ? ''
                  : 'none',
            }}
          >
            <Label for="mail_server_url">Email Server URL</Label>
            <Input
              type="text"
              name="mailServerUrl"
              id="mail_server_url"
              invalid={errors.emailServerURL}
              innerRef={register({ required: 'Please enter mail server url' })}
            />
            <ErrorMessage
              errors={errors}
              name="mailServerURL"
              className="invalid-feedback"
              as="p"
            />
          </FormGroup>
          <FormGroup
            check
            style={{
              display:
                serverType === 'Gmail' || serverType === 'Office365 (Oauth)'
                  ? 'none'
                  : '',
            }}
          >
            <Input
              type="checkbox"
              id="show_email_password"
              name="showEmailPassword"
              onClick={() => {
                setPasswordType(!passwordType);
              }}
            />
            <Label for="show_email_password">Show Password</Label>
          </FormGroup>
          <FormGroup check>
            <Input
              type="checkbox"
              id="disable_email_account"
              name="disableEmailAccount"
              onChange={() => {
                setDisableEmailAccount(!disableEmailAccount);
              }}
              onClick={() => {
                setShowConfirmModal(true);
              }}
              checked={disableEmailAccount}
            />
            <Label for="disable_email_account">Disable Email Account</Label>
          </FormGroup>
          <i>
            {disabled
              ? 'Account is disabled from ' +
                (disabledFrom
                  ? disabledFrom.getMonth() +
                    1 +
                    '/' +
                    disabledFrom.getDate() +
                    '/' +
                    disabledFrom.getFullYear()
                  : '') +
                ' to ' +
                (disabledTo
                  ? disabledTo.getMonth() +
                    1 +
                    '/' +
                    disabledTo.getDate() +
                    '/' +
                    disabledTo.getFullYear()
                  : '')
              : ''}
          </i>
          <div className="mt-2 d-flex align-items-center">
            <Button
              type="submit"
              color="primary"
              title="Save Email Account"
              disabled={editAccountLoading || addEmailAccountLoading}
              icon={
                addEmailAccountLoading || editAccountLoading
                  ? 'fas fa-spinner fa-spin'
                  : 'fas fa-check'
              }
              onClick={onSubmit}
            >
              {addEmailAccountLoading || editAccountLoading
                ? 'Wait'
                : 'Save Email Account'}
            </Button>
            {!accountLoading && (
              <span className="ml-2 d-flex align-items-center">
                <i
                  className={
                    'fa-2x mr-2 ' +
                    (verified
                      ? 'fas fa-check-circle text-success'
                      : 'fa fa-exclamation-circle text-danger')
                  }
                ></i>
                {verified
                  ? 'Your Email Account is verified'
                  : 'Your Email Account is not verified'}
              </span>
            )}
          </div>
        </Form>
      </CardBody>
      <CardBody className="bt">
        <p>
          <strong>Email Signature</strong>
          <i
            className={
              'ml-2 ' +
              (signatureLoading
                ? 'fas fa-spinner fa-spin'
                : signatueError
                ? 'fas fa-exclamation-circle text-danger'
                : '')
            }
            title={signatueError ? FAILED_TO_FETCH_DATA : 'Loading'}
          ></i>
        </p>
        {!signatureLoading && (
          <Form>
            <FormGroup>
              <Editor
                userId={currentUserId}
                data={emailSignature}
                onChange={(value) => {
                  setEmailSignature(value);
                }}
                initialLoading={initialLoading}
                resetLoading={(value) => setInitialLoading(value)}
                mailMergeVariables={mailMergeVariables}
                refetch={refetchEmailSignatureData}
                templatePreview={false}
                showTemplatePreviewToolbar={false}
                showUploadAttachment={false}
                showMailMergeToolbar={false}
              />
            </FormGroup>
            <Button
              color="primary"
              disabled={addSignatureLoading}
              title="Save Email Signature"
              icon={
                addSignatureLoading ? 'fas fa-spinner fa-spin' : 'fas fa-check'
              }
              onClick={() => {
                saveEmailSignature(emailSignature);
              }}
            >
              {addSignatureLoading ? 'Wait' : 'Save Email Signature'}
            </Button>
          </Form>
        )}
      </CardBody>

      <OutOfDateModal
        hideModal={() => {
          cancelDateModal();
        }}
        showModal={showDateModal}
        handleAction={handleDisableEmailAccount}
        showActionBtnSpinner={disableEmailAccountLoading}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        showConfirmBtnSpinner={disableEmailAccountLoading}
        handleCancel={() => {
          cancelConfirmModal();
        }}
        showConfirmModal={showConfirmModal}
        handleConfirm={() => {
          if (disabled) {
            handleDisableEmailAccount();
          } else {
            setShowConfirmModal(false);
            setShowDateModal(true);
          }
        }}
        confirmBtnColor="primary"
      >
        <div>
          {disableEmailAccount
            ? 'Are you sure you want to disable your email account. This will prevent sending emails until your email account is enabled again.'
            : 'Are you sure you want to enable your email account. This will start sending emails until your email account is disabled again.'}
        </div>
      </ConfirmModal>
    </Card>
  );
};
export default EmailSetting;
