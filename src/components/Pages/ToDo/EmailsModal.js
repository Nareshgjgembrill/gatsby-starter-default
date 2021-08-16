/* eslint-disable @typescript-eslint/camelcase */
/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Form,
  FormGroup,
  Input,
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
  Row,
} from 'reactstrap';
import moment from 'moment-timezone';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import {
  GET_ALL_SNIPPETS,
  GET_ALL_TEMPLATES,
} from '../../queries/EmailTemplatesQuery';
import {
  GET_INTERACTIVE_EMAIL,
  GET_SEND_ONE_OFF_EMAIL,
  SAVE_OR_SEND_EMAIL_QUERY,
} from '../../queries/ToDoQuery';
import { UPDATE_USER_SETTING_QUERY } from '../../queries/SettingsQuery';
import { GET_MAIL_MERGE_RESPONSE } from '../../queries/EmailTemplatesQuery';
import UserContext from '../../UserContext';
import { FETCH_EMAIL_ACCOUNT_QUERY } from '../../queries/SettingsQuery';
import ClButton from '../../Common/Button';
import CloseButton from '../../Common/CloseButton';
import ConfirmModal from '../../Common/ConfirmModal';
import Editor from '../../Common/Editor';

import {
  getErrorMessage,
  isEmail,
  notify,
  showErrorMessage,
  trimValue,
} from '../../../util/index';

toast.configure();
const EmailsModal = (props) => {
  const {
    showModal,
    userId, // if manager pass user id as 0 otherwise pass userid
    hideModal,
    prospectId,
    currentIndex,
    loadingData,
    totalCount,
    refetch,
    handleSendAndNext,
    totalEmailCount,
    type,
    currentUserId, //logged in user
    dropdownUserId, // selected dropdown user in the relevent parent page
    mailMergeVariables,
    tabName,
    cadenceId,
  } = props;
  const [showTemplatePopover, setShowTemplatePopover] = useState(false);
  const [showSchedulePopover, setShowSchedulePopover] = useState(false);
  const [showCCInput, setShowCCInput] = useState(false);
  const [showBCCInput, setShowBCCInput] = useState(false);
  const [activeTab, setActiveTab] = useState(
    type === 'sendOneOff' ? 'templates' : 'snippets'
  );
  const [ckeditorData, setCkeditorData] = useState('');
  const [prospectInfo, setProspectInfo] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [templateId, setTemplateId] = useState();
  const [templates, setTemplates] = useState({
    data: [],
    includedAssociations: [],
  });
  const emailTabLink = `?filter[user][id]=${currentUserId}&sort[contactName]=asc&filter[touch][type]=EMAIL&filter[currentTouchStatus]=:[SCHEDULED,SCHEDULED_WAIT_INETRACTIVE_EMAIL]&filter[optoutFlag]=false&page[limit]=10&page[offset]=0`;

  const [sendType, setSendType] = useState(null);
  const [tempTemplates, setTempTemplates] = useState(templates);
  const [snippets, setSnippets] = useState([]);
  const [scheduleDate, setScheduleDate] = useState(
    new Date().toISOString().substr(0, 10)
  );
  const {
    user,
    loading: userLoading,
    refetch: refetchUserDetails,
  } = useContext(UserContext);
  const userTimezone = !userLoading && user?.timeZone;
  const [scheduleTimeZone, setScheduleTimeZone] = useState('America/New_York');
  const [convertedScheduleDate, setConvertedScheduleDate] = useState();
  const [scheduleTime, setScheduleTime] = useState();
  const subjectRef = useRef('');
  const bccRef = useRef('');
  const ccRef = useRef('');
  const [requiredField, setRequiredField] = useState({
    emailBcc: { invalid: false, error: '' },
    emailCc: { invalid: false, error: '' },
  });
  const [ckeditorInstance, setCkeditorInstance] = useState();
  const [action, setAction] = useState();
  const [initialLoading, setInitialLoading] = useState(
    type === 'sendOneOff' ? true : false
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [isScheduleReq, setIsScheduleReq] = useState(false);
  const templateIdRef = useRef();
  const attachmentsRef = useRef();
  const [templateOffset, setTemplateOffset] = useState(0);

  const americanTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
  ];

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  const [getEmail, { data: personalizeEmailData, loading }] = useLazyQuery(
    GET_INTERACTIVE_EMAIL,
    {
      onCompleted: (response) => handleGetInteractiveEmail(response, true),
      onError: (response) => handleGetInteractiveEmail(response),
    }
  );

  useEffect(() => {
    if (type === 'Personalize') {
      toggle('snippets');
    }
  });

  const userFilter = `filter[user][id]=${dropdownUserId}`;

  const { loading: emailLoading, data: emailAccountData } = useQuery(
    FETCH_EMAIL_ACCOUNT_QUERY,
    {
      variables: {
        emailFilter: userFilter,
      },
    }
  );

  const isEmailIDVerified =
    !emailLoading && emailAccountData?.Email?.data[0]?.verified;

  const [
    fetchMailMerge,
    { data: mailMergeVariablesResponseData },
  ] = useLazyQuery(GET_MAIL_MERGE_RESPONSE, {
    variables: {
      input: {
        user: {
          id: dropdownUserId,
        },
        prospect: {
          id: prospectId || 0,
        },
      },
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Mail Merge data.',
        mailMergeVariablesResponseData,
        'failed_mail_merge'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  // If the touch value is OTHERS this block will replace that as SOCIAL
  if (
    mailMergeVariablesResponseData?.mailmergeResponse?.data?.mailMergeJsonData
      ?.mailMergeData
  ) {
    mailMergeVariablesResponseData.mailmergeResponse.data.mailMergeJsonData.mailMergeData = mailMergeVariablesResponseData?.mailmergeResponse?.data?.mailMergeJsonData?.mailMergeData.map(
      (data) => {
        const name = data.name === 'OTHERS' ? 'SOCIAL' : data.name;
        return { id: data.id, name };
      }
    );
  }

  useEffect(() => {
    if (currentUserId && prospectId) {
      fetchMailMerge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, prospectId, showModal]);

  useEffect(() => {
    if (!userLoading && typeof user?.isEmailPreviewEnabled === 'boolean')
      setShowTemplatePreview(user.isEmailPreviewEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const [
    getSendOneOffEmail,
    { data: sendOneOffEmailData, loading: sendOneOffLoading },
  ] = useLazyQuery(GET_SEND_ONE_OFF_EMAIL, {
    onCompleted: (response) => handleGetSoe(response, true),
    onError: (response) => handleGetSoe(response),
    notifyOnNetworkStatusChange: true,
  });

  const handleGetSoe = (response, status) => {
    if (status && response?.getSendOneOffEmail?.data?.length > 0) {
      const data = response.getSendOneOffEmail.data[0];
      if (!isEmail(data?.email)) {
        notify('Invalid Email', 'error', 'invalid_email');
        handleConfirm();
      }
      setProspectInfo(data);
      setInitialLoading(true);
      setCkeditorData('<p></p>');
    } else if (!status) {
      const errorMsg = getErrorMessage(response);
      if (
        errorMsg &&
        'Email is already scheduled to send out on '.includes(
          errorMsg.split('=')[0]
        )
      ) {
        let dateTime = errorMsg.split('=')[1].slice(0, -1);
        const timeZoneKey = errorMsg.split('=')[2];
        dateTime = moment(dateTime).format('MM/DD/YYYY hh:mm A');
        notify(
          `Email is already scheduled to send out on ${dateTime} ${
            timeZoneKey ? timeZoneKey : 'Localtime - ' + userTimezone
          }`,
          'error',
          'email_scheduled'
        );
      } else {
        showErrorMessage(
          response,
          'Sorry! Failed to schedule Email',
          sendOneOffEmailData,
          'email_scheduled'
        );
      }
      handleConfirm();
    }
  };

  const [
    saveOrSendEmail,
    { data: saveOrSendEmailData, loading: saveOrSendEmailLoading },
  ] = useLazyQuery(SAVE_OR_SEND_EMAIL_QUERY, {
    onCompleted: (response) => handleCompleSaveOrSendCallBack(response, true),
    onError: (response) => handleCompleSaveOrSendCallBack(response),
  });

  const [saveEmailPreview, { data: saveEmailPreviewData }] = useLazyQuery(
    UPDATE_USER_SETTING_QUERY,
    {
      onCompleted: () => {
        refetchUserDetails();
      },
      onError: (error) =>
        showErrorMessage(
          error,
          'Sorry! Failed to save Email preview preference',
          saveEmailPreviewData,
          'email_preview_failed'
        ),
    }
  );

  const [
    getSnipptes,
    { data: snippetsData, loading: snippetsLoading },
  ] = useLazyQuery(GET_ALL_SNIPPETS, {
    variables: { snippetsFilter: `filter[user][id]=${dropdownUserId}` },
  });

  const [getTemplates, { loading: templateLoading }] = useLazyQuery(
    GET_ALL_TEMPLATES,
    {
      variables: {
        includeAssociationsQry: 'includeAssociations[]=attachment',
        templatesFilter: `filter[user][id]=${dropdownUserId}&sort[name]=asc&filter[shared]=true&filter[status]=true&page[limit]=15&page[offset]=${templateOffset}`,
      },
      onCompleted: (response) => {
        if ((templateOffset + 1) * 15 < response.templates.paging.totalCount) {
          setTemplateOffset(templateOffset + 1);
        }
        setTemplates((prevState) => ({
          data: prevState.data.concat(response.templates.data),
          includedAssociations: prevState.includedAssociations.concat(
            response.templates.includedAssociations.attachment
          ),
        }));
        setTempTemplates((prevState) => ({
          data: prevState.data.concat(response.templates.data),
          includedAssociations: prevState.includedAssociations.concat(
            response.templates.includedAssociations.attachment
          ),
        }));
      },
    }
  );

  const snippetsArray = useMemo(
    () =>
      snippetsData && snippetsData.snippets ? snippetsData.snippets.data : [],
    [snippetsData]
  );

  const emailData = useMemo(
    () =>
      personalizeEmailData && personalizeEmailData.getEmail
        ? personalizeEmailData.getEmail.data
        : {},
    [personalizeEmailData]
  );

  const sendOneOffData = useMemo(
    () =>
      sendOneOffEmailData &&
      sendOneOffEmailData.getSendOneOffEmail &&
      sendOneOffEmailData.getSendOneOffEmail.data
        ? sendOneOffEmailData.getSendOneOffEmail.data[0]
        : {},
    [sendOneOffEmailData]
  );

  useEffect(() => {
    templateIdRef.current = templateId;
  }, [templateId]);

  useEffect(() => {
    if (
      showModal &&
      type === 'Personalize' &&
      Object.keys(emailData).length > 0
    ) {
      setProspectInfo(emailData?.prospect?.prospectInfo || {});
      //set the subjectvalue
      subjectRef.current.value = emailData?.merged_subject_content
        .replaceAll('OTHERS', 'SOCIAL')
        .replaceAll('null', '');

      let editorContent = emailData?.merged_body_content
        .replaceAll('OTHERS', 'SOCIAL')
        .replaceAll('null', '');

      const signatureCheck =
        emailData.signature === undefined ? '' : emailData?.signature;
      editorContent += signatureCheck;

      const regEx = /fileName/gi;
      editorContent = editorContent.replace(regEx, 'csrfToken=&fileName');
      if (editorContent.endsWith('<br>')) {
        editorContent =
          editorContent.substring(0, editorContent.length - 4) +
          '&nbsp;' +
          editorContent.substring(editorContent.length - 4) +
          '&nbsp;';
      }
      if (emailData?.reply_email_content !== undefined) {
        let replyContentEach;
        const replyContent = emailData.reply_email_content;

        const trailEmails = replyContent.split('<hr>');

        for (let i = 0; i < trailEmails.length; i++) {
          if (trailEmails[i].indexOf('csrfToken=') === -1) {
            replyContentEach = trailEmails[i].replace(
              regEx,
              'csrfToken=&fileName'
            );
          } else {
            replyContentEach = trailEmails[i].replace(
              /\bcsrfToken=\w*&\b/gi,
              'csrfToken=&'
            );
          }
          editorContent += replyContentEach + '<hr>';
        }
        editorContent = editorContent.slice(0, -4);
      }
      setCkeditorData(editorContent);
      setInitialLoading(true);
      setTemplateId(parseInt(emailData?.emailTouch?.email_template_id));
      setAttachments(emailData?.attachments?.editTemplateData);
    }
    // eslint-disable-next-line
  }, [emailData]);

  useEffect(() => {
    if (snippetsArray?.length > 0) {
      setSnippets(snippetsArray);
    }
  }, [snippetsArray]);

  useEffect(() => {
    let date = scheduleDate;
    date = new Date(convertDateFormat(date)).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    date = replaceAt(date.toString(), date.toString().lastIndexOf(','), '');
    setConvertedScheduleDate(date);
  }, [scheduleDate]);

  useEffect(() => {
    if (showModal) {
      if (type === 'sendOneOff') {
        const variables = {
          prospectId: prospectId,
        };
        variables['userFilter'] =
          userId === 0 ? '' : `filter[user][id]=${dropdownUserId}`;
        getSendOneOffEmail({
          variables: variables,
        });
      } else {
        getEmail({
          variables: {
            input: {
              talkerUser: { id: userId },
              prospect: { id: prospectId },
              cadence: { id: cadenceId },
              isEmailAttachmentNeeded: true,
            },
          },
        });
      }
    }
    // eslint-disable-next-line
  }, [showModal, prospectId]);

  useEffect(() => {
    if (showSchedulePopover) {
      setScheduleTime(roundTime());
    }
    // eslint-disable-next-line
  }, [showSchedulePopover]);

  // Functions Block Start

  const convertDateFormat = (date) => {
    date = date.split('-');
    return date[1] + '/' + date[2] + '/' + date[0];
  };

  const toggle = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const replaceAt = (str, index, ch) => {
    return str.replace(/./g, (c, i) => (i === index ? ch : c));
  };

  const roundTime = () => {
    const zoneDateTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
    });

    const timeValues = zoneDateTime.split(' ');
    let period = timeValues[2];

    const allTimes = timeValues[1].split(':');
    const cHours = allTimes[0];
    let hour = allTimes[0] - (allTimes[0] >= 12 ? 12 : 0);
    let roundedMin = round30(allTimes[1]);

    if (roundedMin === 60) {
      if (cHours === '12') {
        hour = 0;
      }
      roundedMin = '00';
      hour = hour + 1;

      if (hour === 12 && period === 'AM') {
        period = 'PM';
      } else if (hour === 12 && period === 'PM') {
        period = 'AM';
      }
    } else if (roundedMin === 0) {
      roundedMin = '00';
    }

    const currentHour = hour.toString();
    if (currentHour.length === 1) {
      hour = '0' + hour;
    }

    return hour + ':' + roundedMin + ' ' + period;
  };

  const round30 = (mins) => {
    return Math.ceil(mins / 30) * 30;
  };

  const isValidCCBCCEmailId = (emailId, errorOne, errorTwo) => {
    if (emailId && emailId.indexOf(',') !== -1) {
      const emails = emailId.split(',');
      for (let i = 0; i < emails.length; i++) {
        if (!isEmail(emails[i].trim())) {
          return errorOne;
        }
      }
    } else if (emailId && !isEmail(emailId)) {
      return errorTwo;
    }
  };

  const validateScheduleDate = (date, scheduleTime, scheduleTimeZone) => {
    if (new Date(date) === 'Invalid Date') {
      notify('Please Select Date to Schedule Email', 'error', 'invalid_date');
      return true;
    } else if (!checkScheduleDate(date, scheduleTime, scheduleTimeZone)) {
      notify(
        'Sorry! You cannot choose a past date & time to send emails',
        'error',
        'date_passed'
      );
      return true;
    }
  };

  const checkScheduleDate = (ddate, time, timezone) => {
    let result = true;

    let hours = Number(time.match(/^(\d+)/)[1]);
    const minutes = Number(time.match(/:(\d+)/)[1]);
    const format = time.match(/\s(.*)$/)[1];

    if (format === 'PM' && hours < 12) {
      hours = hours + 12;
    }
    if (format === 'AM' && hours === 12) {
      hours = hours - 12;
    }

    let sHours = hours.toString();
    let sMinutes = minutes.toString();
    if (hours < 10) {
      sHours = '0' + sHours;
    }
    if (minutes < 10) {
      sMinutes = '0' + sMinutes;
    }
    ddate = ddate + ' ' + sHours + ':' + sMinutes + ':00';
    const date1 = new Date(ddate);

    let timeAccordingZone;
    if (timezone === 'America/New_York') {
      // Current EST time
      timeAccordingZone = new Date()
        .toLocaleString('en-US', {
          timeZone: 'America/New_York',
        })
        .replace(',', '');
    } else if (timezone === 'America/Los_Angeles') {
      // Current PST time
      timeAccordingZone = new Date()
        .toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles',
        })
        .replace(',', '');
    } else if (timezone === 'America/Denver') {
      // Current MST time
      timeAccordingZone = new Date()
        .toLocaleString('en-US', {
          timeZone: 'America/Denver',
        })
        .replace(',', '');
    } else if (timezone === 'America/Chicago') {
      // Current CST time
      timeAccordingZone = new Date()
        .toLocaleString('en-US', {
          timeZone: 'America/Chicago',
        })
        .replace(',', '');
    } else {
      timeAccordingZone = moment()
        .tz(userTimezone)
        .format('M/DD/YYYY h:mm:ss A');
    }

    const timeValues = timeAccordingZone.split(' ');
    const estDate = timeValues[0];
    const allTimes = timeValues[1].split(':');
    const cHours = allTimes[0];
    let hour = allTimes[0] - (allTimes[0] >= 12 ? 12 : 0);
    let roundedMin = round30(allTimes[1]);
    if (roundedMin === 60) {
      if (cHours === '12') {
        hour = 0;
      }
      roundedMin = '00';
      hour = hour + 1;
    } else if (roundedMin === 0) {
      roundedMin = '00';
    }
    const estDateTime =
      estDate + ' ' + hour + ':' + roundedMin + ':00 ' + timeValues[2];
    const date2 = new Date(estDateTime);

    // compare current zonetime with selected date time

    if (date1 < date2) {
      result = false;
    }

    return result;
  };

  // Functions Block End

  // Handle Block Start

  const handleSubjectFocus = () => {
    subjectRef.current.attributes.class.value = 'form-control focusing';
  };

  const handleCloseModal = () => {
    setShowSchedulePopover(false);
    setShowTemplatePopover(false);
    const emailBody = ckeditorData
      .replaceAll('<br />', '')
      .replaceAll('&nbsp;', '')
      .split(/\s/)
      .join('');

    if (
      type === 'Personalize' ||
      (type === 'sendOneOff' &&
        (templateId ||
          (emailBody.trim() !== '' && emailBody.trim() !== '<p></p>')))
    ) {
      setShowConfirmModal(true);
    } else {
      handleConfirm();
    }
  };

  const handleInsert = (category, value) => {
    if (category === 'snippet') {
      ckeditorInstance.insertContent(value);
    } else {
      setInitialLoading(true);
      setCkeditorData(value);
    }
    setShowTemplatePopover(false);
  };

  const handleFilterTemplates = (props) => {
    const value = props.target.value.trim();
    let tempArr = tempTemplates;
    if (value) {
      tempArr = tempArr.data.filter(function (option) {
        return option.name.toLowerCase().includes(value.toLowerCase());
      });
      setTemplates({
        data: tempArr.reduce((acc, item) => {
          acc.findIndex((element) => element.id === item.id) === -1 &&
            acc.push(item);
          return acc;
        }, []),
        includedAssociations: tempTemplates.includedAssociations,
      });
    } else {
      setTemplates(tempTemplates);
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

  const handleSaveOrSend = (action, schedule = false) => {
    let scheduleDateTime;
    let errorFlag = false;
    setSendType(action);
    setRequiredField((prevState) => ({
      ...prevState,
      emailBcc: { invalid: false, error: '' },
      emailCc: { invalid: false, error: '' },
    }));
    if (ccRef.current && trimValue(ccRef.current.value)) {
      const error = isValidCCBCCEmailId(
        ccRef.current.value.trim(),
        'One of the email id is invalid. Please enter valid CC email address',
        'Please enter valid CC email address'
      );
      if (error) {
        setRequiredField((prevState) => ({
          ...prevState,
          emailCc: { invalid: true, error: error },
        }));
        errorFlag = true;
      }
    }

    if (bccRef.current && trimValue(bccRef.current.value)) {
      const error = isValidCCBCCEmailId(
        bccRef.current.value.trim(),
        'One of the email id is invalid. Please enter valid BCC email address',
        'Please enter valid BCC email address'
      );
      if (error) {
        setRequiredField((prevState) => ({
          ...prevState,
          emailBcc: { invalid: true, error: error },
        }));
        errorFlag = true;
      }
    }
    if (errorFlag) {
      return false;
    }

    const emailBody = ckeditorData
      .replaceAll('<br />', '')
      .replaceAll('&nbsp;', '')
      .split(/\s/)
      .join('');

    if (!subjectRef.current.value.trim()) {
      notify('Subject is mandatory!', 'error', 'invalid_subject');
      return false;
    } else if (attachments.length > 3) {
      notify(
        'Sorry! You can upload only a max of 3 attachments',
        'error',
        'files_limit'
      );
      return false;
    } else if (emailBody === '<p></p>' || emailBody.trim() === '') {
      notify('Sorry! Email body is empty.', 'error', 'empty_email');
      return false;
    } else if (ckeditorData.trim().length > 32000) {
      notify(
        'Sorry! Too many characters in the Email body. Allowed limit is 32000.',
        'error',
        'message_limit'
      );
      return false;
    }

    if (schedule) {
      if (!scheduleDate) {
        notify(
          'Please choose the date to schedule this Email',
          'error',
          'invalid_date'
        );
        return false;
      } else if (!scheduleTime) {
        notify(
          'Sorry! Schedule Time is mandatory!',
          'error',
          'invalid_schedule'
        );
        return false;
      } else if (scheduleTimeZone === '0') {
        notify('Please select the timezone', 'error', 'empty_timezone');
        return false;
      } else if (
        validateScheduleDate(
          convertDateFormat(scheduleDate),
          scheduleTime,
          scheduleTimeZone
        )
      ) {
        return false;
      } else {
        scheduleDateTime = moment(scheduleDate + ' ' + scheduleTime)
          .tz(scheduleTimeZone, true)
          .utc()
          .format('YYYY-MM-DD[T]HH:mm[:00.000Z]');
      }
    }

    let emailBodyWithMailMergeValue = ckeditorData;
    let emailSubjectWithMailMergeValue = subjectRef?.current?.value?.trim();
    const mailMergeValues =
      mailMergeVariablesResponseData?.mailmergeResponse?.data?.mailMergeJsonData
        ?.mailMergeData || [];

    for (let i = 0; i < mailMergeValues.length; i++) {
      const obj = mailMergeValues[i];

      const regexMailMerge = new RegExp(
        `<span class="yellow" contenteditable="false">{{${obj.id}}}</span>`,
        'g'
      );

      const regexMailMergeSub = new RegExp(`{{${obj.id}}}`, 'g');
      const regexURL = /(((www\.|in\.)|((https:\/\/|http|ftp|smtp)(www\.|in\.)|(https:\/\/)))[a-z/.-\d#_?=&:%@()[\],]+)(?!(.(?!<a))*<\/a>)/gi;

      emailBodyWithMailMergeValue = emailBodyWithMailMergeValue.replace(
        regexMailMerge,
        obj.name || typeof obj.name === 'boolean' ? obj.name : ''
      );

      if (
        obj.name &&
        typeof obj.name === 'string' &&
        obj?.name?.length > 0 &&
        obj?.name?.match(regexURL)
      ) {
        emailBodyWithMailMergeValue = emailBodyWithMailMergeValue.replace(
          obj.name,
          `<a href="${obj.name}">${obj.name}</a>`
        );
      }

      emailSubjectWithMailMergeValue = emailSubjectWithMailMergeValue.replace(
        regexMailMergeSub,
        obj.name || ''
      );
    }

    const requestData = {
      talkerUser: {
        id: dropdownUserId,
      },
      touchStepNo: prospectInfo?.currentTouchId,
      emailTo: prospectInfo?.emailId || prospectInfo?.email,
      emailBcc: trimValue(bccRef?.current?.value),
      emailCc: trimValue(ccRef?.current?.value),
      emailSubject: emailSubjectWithMailMergeValue,
      emailBody: emailBodyWithMailMergeValue,
      interactiveActionFor: action === 'save' ? 'save' : 'send',
      saveAsDraft: false,
      stopPersonalizeEmail: false,
      scheduleDateTime: scheduleDateTime,
      timeZone: schedule ? scheduleTimeZone : '',
    };

    if (attachments && attachments.length > 0) {
      let tempAttachments = attachments;

      if (type === 'Personalize') {
        tempAttachments = tempAttachments.map((attachment) => {
          if (attachment.file_name_with_timestamp) {
            return {
              file_name_with_timestamp: attachment.file_name_with_timestamp,
              id: parseInt(attachment.id),
              emailTemplateId: parseInt(attachment.templateId),
            };
          } else {
            return {
              file_name_with_timestamp: attachment.fileNameWithTimeStamp,
              id: parseInt(attachment.id),
              emailTemplateId: parseInt(attachment.templateId),
            };
          }
        });
      } else {
        tempAttachments = tempAttachments.map((attachment) => {
          if (attachment.fileNameWithTimeStamp) {
            return {
              file_name_with_timestamp: attachment.fileNameWithTimeStamp,
            };
          } else {
            return {
              file_name_with_timestamp: attachment.fileNameWithTimestamp,
            };
          }
        });
      }

      requestData['attachments'] = tempAttachments;
    }

    if (type === 'sendOneOff') {
      requestData['prospect'] = {
        id: prospectInfo.id,
      };
      requestData['crmId'] = sendOneOffData.crmId;
      requestData['emailTouchMetadataId'] = -1;
      requestData['cadence'] = {
        id: -1,
      };
      requestData['emailTemplate'] = {
        id: templateId || -1,
      };
    } else {
      requestData['prospect'] = {
        id: parseInt(prospectInfo.prospectId),
      };
      requestData['crmId'] = emailData.emailTouch.crm_id;
      requestData['emailTouchMetadataId'] = parseInt(
        emailData.emailTouch.email_touch_metadata_id
      );
      requestData['cadence'] = {
        id: parseInt(prospectInfo.cadenceId),
      };
      requestData['emailTemplate'] = {
        id: parseInt(emailData.emailTouch.email_template_id),
      };
    }
    saveOrSendEmail({
      variables: {
        input: requestData,
      },
    });
    setAction(action);
    setIsScheduleReq(schedule);
    setShowSchedulePopover(false);
  };

  const handleCompleSaveOrSendCallBack = (response, status) => {
    if (status) {
      handleConfirm();
      if (!isScheduleReq) {
        notify('Email will be sent shortly!', 'success', 'email_sent');
      } else if (isScheduleReq) {
        notify(
          'Email has been scheduled successfully!',
          'success',
          'email_scheduled_success'
        );
      }
    } else if (!status) {
      showErrorMessage(
        response,
        'Sorry! Failed to send/schedule Email',
        saveOrSendEmailData,
        'failed_mail'
      );
    }
  };

  const handleGetInteractiveEmail = (response, status) => {
    if (
      status &&
      response.getEmail &&
      response.getEmail.data &&
      Object.keys(response.getEmail.data).length === 0
    ) {
      notify(
        <div>
          There are no emails to personalize <br />
          Reason: Prospect does not have an Email ID. Please update and try
          again.
        </div>,
        'error',
        'no_emails'
      );
      handleConfirm();
    } else if (!status && action && action.includes('sendAndNext')) {
      handleConfirm();
    } else if (!status) {
      showErrorMessage(
        response,
        'Sorry! Failed to load interactive Email',
        personalizeEmailData,
        'failed_interactive_mail'
      );
      handleConfirm();
    }
  };

  const handleConfirm = () => {
    setShowCCInput(false);
    setShowBCCInput(false);
    setProspectInfo({});
    if (action && action.includes('sendAndNext') && handleSendAndNext) {
      handleSendAndNext(currentIndex);
    } else if (type === 'Personalize' && action !== 'sendAndNext' && refetch) {
      refetch();
    }
    setAction('');
    setShowConfirmModal(false);
    setIsScheduleReq(false);
    setAttachments([]);
    setCkeditorData('<p></p>');
    setTemplateId('');
    if (sendType !== 'sendAndNext') {
      hideModal();
    }
    setTemplates({
      data: [],
      includedAssociations: [],
    });
    setTempTemplates({
      data: [],
      includedAssociations: [],
    });
  };

  const insertTemplateStyle = {
    height: '450px',
    overflow: 'auto',
  };

  const refreshAttachments = (response) => {
    setAttachments(attachmentsRef.current.concat(response));
  };

  const contactName =
    prospectInfo && prospectInfo.contactName
      ? ` - ${
          prospectInfo.contactName.length > 50
            ? prospectInfo.contactName.substring(0, 50) + '...'
            : prospectInfo.contactName
        }`
      : '';
  const prospectIndex =
    totalCount === currentIndex
      ? totalCount
      : totalCount < currentIndex
      ? 1
      : currentIndex;

  const handleSubjectMailMerge = () => {
    const mailMergeValues =
      mailMergeVariablesResponseData?.mailmergeResponse?.data?.mailMergeJsonData
        ?.mailMergeData || [];
    let subjectValue = subjectRef?.current?.value;
    if (subjectValue) {
      for (let i = 0; i < mailMergeValues.length; i++) {
        const obj = mailMergeValues[i];

        const regexMailMerge = new RegExp(`{{${obj.id}}}`, 'g');

        subjectValue = subjectValue.replace(regexMailMerge, obj.name || '');
      }
    }
    if (subjectRef?.current && subjectValue) {
      subjectRef.current.value = subjectValue;
    }
  };
  useEffect(() => {
    handleSubjectMailMerge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectRef?.current?.value]);
  return (
    <>
      <Modal size="xl" isOpen={showModal} centered={true} className="mw-75">
        <ModalHeader className="d-block">
          <Row className="align-items-center">
            <Col className="pr-0 text-truncate">
              {!loadingData ? (
                <i className="fas fa-envelope text-email mr-2"></i>
              ) : (
                <>
                  <i className="fa fa-spinner fa-spin mr-1"></i>
                  <span>Loading next Prospect -</span>
                </>
              )}
              {type === 'Personalize' ? (
                <>
                  <span>Personalize</span>
                  <span title={prospectInfo.contactName}>{contactName}</span>
                </>
              ) : (
                `Send Email`
              )}
            </Col>
            <Col className="pr-0 text-truncate">
              <small>
                <span className="mr-1 font-italic">Account Name:</span>
                <span title={prospectInfo.accountName}>
                  {prospectInfo.accountName}
                </span>
              </small>
            </Col>
            <Col className="pr-0 text-truncate">
              <small>
                <span className="mr-1 font-italic">Contact Name:</span>
                <span title={prospectInfo.contactName}>
                  {contactName.replace(' - ', '')}
                </span>
              </small>
            </Col>
            <Col md={2} className="pr-0 text-truncate">
              <small>
                <span className="mr-1 font-italic">Title:</span>
                <span title={prospectInfo.title}>{prospectInfo.title}</span>
              </small>
            </Col>
            <Col md={2} className="text-center pr-0">
              <small className="pt-2">
                {tabName === 'EMAIL' && (
                  <i>
                    {prospectIndex} of {totalCount} Email(s)
                  </i>
                )}
                {tabName === 'ALL' && type === 'Personalize' && (
                  <i>{totalEmailCount} Mails remaining</i>
                )}
              </small>
            </Col>
          </Row>
        </ModalHeader>
        <ModalBody className="py-2">
          {tabName === 'ALL' && (
            <Alert color="info" className="text-center mb-1 py-1">
              <i className="fas fa-exclamation-circle mr-2 text-info"></i>
              To send Personalize Emails, it is recommended to use{' '}
              <Link
                to={{
                  path: '/toDo',
                  search: emailTabLink,
                  state: { parentUserId: userId },
                }}
              >
                ToDo - Email
              </Link>{' '}
              tab to avoid loading time.
            </Alert>
          )}
          <Form>
            {currentUserId !== dropdownUserId && (
              <Col sm={12} className="text-center pb-1">
                <span className="bg-color-yellow">
                  You are trying to send on behalf of{' '}
                  <strong>{prospectInfo.displayName}</strong>
                </span>
              </Col>
            )}
            <Row>
              <Col md={12}>
                <FormGroup row className="mb-1 align-items-center">
                  <Col sm={1} className="text-center">
                    <Label for="from" className="mb-0">
                      From
                    </Label>
                  </Col>
                  <Col sm={9} className="px-0">
                    <Input
                      type="text"
                      name="from"
                      id="from"
                      disabled={true}
                      value={`${
                        prospectInfo.displayName ? prospectInfo.displayName : ''
                      } ${
                        prospectInfo.fromEmail
                          ? `(${prospectInfo.fromEmail})`
                          : ''
                      }`}
                    />
                  </Col>
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup row className="mb-1 align-items-center">
                  <Col sm={1} className="text-center">
                    <Label for="to" className="mb-0">
                      To
                    </Label>
                  </Col>
                  <Col sm={9} className="px-0">
                    <Input
                      className="pr-4"
                      type="text"
                      name="to"
                      id="to"
                      disabled={true}
                      value={prospectInfo.emailId || prospectInfo.email || ''}
                    />
                  </Col>
                  <Col sm={1}>
                    <Button
                      className="border px-2 h-100"
                      onClick={() => {
                        setShowCCInput(true);
                      }}
                    >
                      CC
                    </Button>
                  </Col>
                </FormGroup>
              </Col>
              {showCCInput && (
                <Col md={12}>
                  <FormGroup
                    row
                    className={
                      showCCInput
                        ? 'mb-1 align-items-center'
                        : 'd-none mb-1 align-items-center'
                    }
                  >
                    <Col sm={1} className="text-center">
                      <Label for="cc" className="mb-0">
                        CC
                      </Label>
                    </Col>
                    <Col sm={9} className="px-0">
                      <Input
                        type="text"
                        name="emailCc"
                        id="email_cc"
                        placeholder="Enter comma separated email ids..."
                        innerRef={ccRef}
                        className={
                          requiredField['emailCc']['invalid']
                            ? 'border border-danger'
                            : ''
                        }
                      />
                      {requiredField['emailCc']['invalid'] && (
                        <span className="invalid-feedback d-block">
                          {requiredField['emailCc']['error']}
                        </span>
                      )}
                    </Col>
                  </FormGroup>
                </Col>
              )}
              {showBCCInput && (
                <Col md={12}>
                  <FormGroup
                    row
                    className={
                      showBCCInput
                        ? 'mb-1 align-items-center'
                        : 'd-none mb-1  align-items-center'
                    }
                  >
                    <Col sm={1} className="text-center">
                      <Label for="bcc" className="mb-0">
                        BCC
                      </Label>
                    </Col>
                    <Col sm={9}>
                      <Input
                        type="text"
                        name="emailBcc"
                        id="email_bcc"
                        placeholder="Enter comma separated email ids..."
                        innerRef={bccRef}
                        className={
                          requiredField['emailBcc']['invalid']
                            ? 'border border-danger'
                            : ''
                        }
                      />
                      {requiredField['emailBcc']['invalid'] && (
                        <span className="invalid-feedback d-block">
                          {requiredField['emailBcc']['error']}
                        </span>
                      )}
                    </Col>
                  </FormGroup>
                </Col>
              )}
              <Col md={12}>
                <FormGroup row className="mb-2 align-items-center">
                  <Col sm={1} className="text-center">
                    <Label for="subject" className="mb-0">
                      Subject
                    </Label>
                  </Col>
                  <Col sm={9} className="px-0">
                    <Input
                      type="text"
                      name="subject"
                      id="subject"
                      innerRef={subjectRef}
                      onFocus={handleSubjectFocus}
                      onChange={handleSubjectMailMerge}
                      maxLength={100}
                    />
                  </Col>
                </FormGroup>
              </Col>
            </Row>
          </Form>
          <Row>
            <Col md={12}>
              <Row>
                {sendOneOffLoading || loading ? (
                  <div
                    className="w-100 p-3 d-flex align-items-center justify-content-center"
                    style={{ height: '427px' }}
                  >
                    <div className="text-center pt-3">
                      <i className="fa fa-spinner fa-spin fa-lg"></i>
                    </div>
                  </div>
                ) : (
                  (!sendOneOffLoading || !loading) &&
                  ckeditorData && (
                    <Editor
                      data={ckeditorData}
                      onChange={(value) =>
                        setCkeditorData(value ? value : '<p></p>')
                      }
                      userId={dropdownUserId}
                      prospectId={prospectId}
                      ref={subjectRef}
                      handleSubjectMailMerge={handleSubjectMailMerge}
                      templateId={templateId}
                      attachments={attachments}
                      onInit={(editorInstance) =>
                        setCkeditorInstance(editorInstance)
                      }
                      initialLoading={initialLoading}
                      resetLoading={(value) => setInitialLoading(value)}
                      type={type}
                      templatePreview={showTemplatePreview}
                      handlePreviewChange={(value) =>
                        saveEmailPreview({
                          variables: {
                            input: {
                              isEmailPreviewEnabled: value,
                            },
                          },
                        })
                      }
                      mailMergeVariables={mailMergeVariables}
                      notify={notify}
                      showSignatureOnPreview={type !== 'Personalize'}
                      refreshAttachments={(res) => {
                        refreshAttachments(res);
                      }}
                      toolbarLocation="bottom"
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
                  )
                )}
              </Row>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="card-footer mt-3">
          <Row className="col pl-0">
            <Col className="pl-0">
              <CloseButton btnTxt="Cancel" onClick={handleCloseModal} />
            </Col>
            <Col className="text-right">
              <Button
                color="primary"
                id="insert_popover"
                title={
                  type !== 'Personalize'
                    ? 'Insert Templates/Snippets'
                    : 'Insert Snippets'
                }
                onClick={() => {
                  setShowSchedulePopover(false);
                  if (!showTemplatePopover) {
                    if (type !== 'Personalize') {
                      getTemplates();
                      setTemplateOffset(0);
                      setTemplates({
                        data: [],
                        includedAssociations: [],
                      });
                    }
                    getSnipptes();
                  }
                }}
              >
                <i className="far fa-envelope-open" />
              </Button>
              {/* Save draft icon has been commented. Will be available once the save draft feature implemented */}
              {/* {type === 'Personalize' && (
                <ClButton
                  color="primary"
                  className="ml-2"
                  onClick={() => handleSaveOrSend('save')}
                  disabled={saveOrSendEmailLoading}
                  title="Save"
                >
                  <i
                    className={
                      !isScheduleReq &&
                      action === 'save' &&
                      saveOrSendEmailLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'fas fa-check'
                    }
                  />
                </ClButton>
              )} */}
              <ButtonGroup>
                <ClButton
                  color="primary"
                  className="border-white border-top-0 border-left-0 border-bottom-0 ml-2"
                  icon={
                    !isScheduleReq &&
                    action === 'send' &&
                    saveOrSendEmailLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'fas fa-envelope'
                  }
                  disabled={
                    showSchedulePopover || saveOrSendEmailLoading || loadingData
                  }
                  onClick={() => {
                    if (isEmailIDVerified) {
                      handleSaveOrSend('send');
                    } else {
                      notify(
                        'Your Email account is invalid. Please go to the Settings and revalidate your Email account!',
                        'error',
                        'send_test_email'
                      );
                    }
                  }}
                >
                  Send
                </ClButton>
                <Button
                  color="primary"
                  id="schedule_popover"
                  disabled={saveOrSendEmailLoading || loadingData}
                  onClick={() => {
                    setShowTemplatePopover(false);
                    setShowSchedulePopover(true);
                  }}
                  className="border-white border-top-0 border-right border-bottom-0"
                >
                  <i className="far fa-calendar-alt" />
                </Button>
                {(tabName === 'EMAIL' || tabName === 'ALL') &&
                  type === 'Personalize' &&
                  handleSendAndNext &&
                  totalCount > 1 &&
                  totalEmailCount > 1 && (
                    <Button
                      color="primary"
                      title="Send And Next"
                      className="border-white border-top-0 border-right-0 border-bottom-0"
                      disabled={
                        showSchedulePopover ||
                        saveOrSendEmailLoading ||
                        loadingData
                      }
                      onClick={() => {
                        if (isEmailIDVerified) {
                          handleSaveOrSend('sendAndNext');
                        } else {
                          notify(
                            'Your Email account is invalid. Please go to the Settings and revalidate your Email account!',
                            'error',
                            'send_test_email'
                          );
                        }
                      }}
                    >
                      <i
                        className={
                          !isScheduleReq &&
                          action === 'sendAndNext' &&
                          saveOrSendEmailLoading
                            ? 'fa fa-spinner fa-spin'
                            : 'fas fa-arrow-right'
                        }
                      ></i>
                    </Button>
                  )}
              </ButtonGroup>
            </Col>
          </Row>
        </ModalFooter>
        <Popover
          placement="bottom"
          isOpen={showTemplatePopover}
          target="insert_popover"
          toggle={() => {
            setShowTemplatePopover(!showTemplatePopover);
          }}
        >
          <PopoverHeader className="p-0" style={{ top: 0 }}>
            <Nav tabs className="border-bottom-0 px-3 pt-3">
              <NavItem className={type === 'Personalize' ? 'd-none' : ''}>
                <NavLink
                  className={classnames({ active: activeTab === 'templates' })}
                  onClick={() => {
                    toggle('templates');
                  }}
                  title="Templates"
                >
                  Templates
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === 'snippets' })}
                  onClick={() => {
                    toggle('snippets');
                  }}
                  title="Snippets"
                >
                  Snippets
                </NavLink>
              </NavItem>
              <li
                className={
                  type === 'Personalize'
                    ? 'ml-auto my-auto pb-2'
                    : 'ml-auto pl-2 m-auto'
                }
              >
                <span
                  className="pointer d-block"
                  onClick={() => {
                    setShowSchedulePopover(false);
                    setShowTemplatePopover(false);
                  }}
                >
                  <i className="fa fa-times"></i>
                </span>
              </li>
            </Nav>

            <div className="w-100 bg-white p-3">
              {activeTab === 'templates' ? (
                <Input
                  placeholder="Filter Templates"
                  onChange={handleFilterTemplates}
                />
              ) : (
                <Input
                  placeholder="Filter Snippets"
                  onChange={handleFilterSnippets}
                />
              )}
            </div>
          </PopoverHeader>
          <PopoverBody className="p-0" style={insertTemplateStyle}>
            <TabContent activeTab={activeTab} className="p-0 border-0 wd-md">
              {type !== 'Personalize' && (
                <TabPane tabId="templates">
                  <div className="mt-2">
                    {templates &&
                    templates.data &&
                    templates.data.length > 0 ? (
                      templates.data.map((template, i) => {
                        const attachments =
                          templates &&
                          templates.includedAssociations &&
                          templates.includedAssociations.filter(
                            (attachment) => {
                              return (
                                template.associations &&
                                template.associations.attachment
                                  .map((data) => data.id)
                                  .indexOf(attachment.id) !== -1
                              );
                            }
                          );

                        return (
                          <div
                            className="px-2 bb mt-2 pointer"
                            key={i}
                            onClick={() => {
                              setTemplateId(template.id);
                              setAttachments(attachments);
                              subjectRef.current.value = template.subject;
                              handleInsert('templates', template.description);
                            }}
                          >
                            <h5>{template.name}</h5>
                            <div className="text-overflow">
                              <p className="font-italic">{template.subject}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : templateLoading ? (
                      <div className="w-100 text-center">
                        <i className="fa fa-spinner fa-spin fa-lg"></i>
                      </div>
                    ) : (
                      <Alert color="warning" className="p-2 text-center m-2">
                        No Templates Available
                      </Alert>
                    )}
                  </div>
                </TabPane>
              )}
              <TabPane tabId="snippets">
                <div className="mt-2">
                  {snippets.length > 0 ? (
                    snippets.map((snippet, i) => {
                      return (
                        <div
                          className="px-2 bb mt-2 pointer"
                          key={i}
                          onClick={() => {
                            handleInsert('snippet', snippet.description);
                          }}
                        >
                          <h5>{snippet.name}</h5>
                          <div className="text-overflow">
                            <p
                              className="text-truncate-2line font-italic"
                              dangerouslySetInnerHTML={{
                                __html: snippet.description,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : snippetsLoading ? (
                    <div className="w-100 text-center">
                      <i className="fa fa-spinner fa-spin fa-lg"></i>
                    </div>
                  ) : (
                    <Alert color="warning" className="p-2 text-center m-2">
                      No Snippets Available
                    </Alert>
                  )}
                </div>
              </TabPane>
            </TabContent>
          </PopoverBody>
        </Popover>
        <Popover
          placement="bottom"
          isOpen={showSchedulePopover}
          target="schedule_popover"
          style={{
            width: '380px',
            maxWidth: '500px',
            marginInlineStart: '-100px',
          }}
        >
          <PopoverHeader>Send Later</PopoverHeader>
          <PopoverBody className="bg-white">
            <Form>
              <Row form>
                <Col sm={6}>
                  <FormGroup>
                    <Label for="schedule_date">Date</Label>
                    <Input
                      type="date"
                      name="scheduleDate"
                      id="schedule_date"
                      value={scheduleDate}
                      onChange={(e) => {
                        setScheduleDate(e.target.value);
                        validateScheduleDate(
                          convertDateFormat(e.target.value),
                          scheduleTime,
                          scheduleTimeZone
                        );
                      }}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormGroup>
                </Col>
                <Col sm={6}>
                  <FormGroup>
                    <Label for="schedule_time">Time</Label>
                    <Input
                      type="select"
                      name="scheduleTime"
                      id="schedule_time"
                      onChange={(e) => setScheduleTime(e.target.value)}
                      value={scheduleTime}
                    >
                      <option value="12:00 AM">12:00 AM</option>
                      <option value="12:30 AM">12:30 AM</option>
                      <option value="01:00 AM">1:00 AM</option>
                      <option value="01:30 AM">1:30 AM</option>
                      <option value="02:00 AM">2:00 AM</option>
                      <option value="02:30 AM">2:30 AM</option>
                      <option value="03:00 AM">3:00 AM</option>
                      <option value="03:30 AM">3:30 AM</option>
                      <option value="04:00 AM">4:00 AM</option>
                      <option value="04:30 AM">4:30 AM</option>
                      <option value="05:00 AM">5:00 AM</option>
                      <option value="05:30 AM">5:30 AM</option>
                      <option value="06:00 AM">6:00 AM</option>
                      <option value="06:30 AM">6:30 AM</option>
                      <option value="07:00 AM">7:00 AM</option>
                      <option value="07:30 AM">7:30 AM</option>
                      <option value="08:00 AM">8:00 AM</option>
                      <option value="08:30 AM">8:30 AM</option>
                      <option value="09:00 AM">9:00 AM</option>
                      <option value="09:30 AM">9:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="01:00 PM">1:00 PM</option>
                      <option value="01:30 PM">1:30 PM</option>
                      <option value="02:00 PM">2:00 PM</option>
                      <option value="02:30 PM">2:30 PM</option>
                      <option value="03:00 PM">3:00 PM</option>
                      <option value="03:30 PM">3:30 PM</option>
                      <option value="04:00 PM">4:00 PM</option>
                      <option value="04:30 PM">4:30 PM</option>
                      <option value="05:00 PM">5:00 PM</option>
                      <option value="05:30 PM">5:30 PM</option>
                      <option value="06:00 PM">6:00 PM</option>
                      <option value="06:30 PM">6:30 PM</option>
                      <option value="07:00 PM">7:00 PM</option>
                      <option value="07:30 PM">7:30 PM</option>
                      <option value="08:00 PM">8:00 PM</option>
                      <option value="08:30 PM">8:30 PM</option>
                      <option value="09:00 PM">9:00 PM</option>
                      <option value="09:30 PM">9:30 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="10:30 PM">10:30 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                      <option value="11:30 PM">11:30 PM</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup>
                    <Input
                      type="select"
                      name="password"
                      id="examplePassword"
                      onChange={(e) => {
                        setScheduleTimeZone(e.target.value);
                        if (e.target.value !== '0') {
                          validateScheduleDate(
                            convertDateFormat(scheduleDate),
                            scheduleTime,
                            e.target.value
                          );
                        }
                      }}
                      value={scheduleTimeZone}
                    >
                      <option value="0">Select Time Zone</option>
                      <option value="America/New_York">
                        EST - Eastern Time Zone
                      </option>
                      <option value="America/Chicago">
                        CST - Central Standard Time
                      </option>
                      <option value="America/Denver">
                        MST - Mountain Standard Time
                      </option>
                      <option value="America/Los_Angeles">
                        PST - Pacific Standard Time
                      </option>
                      {americanTimezones.indexOf(userTimezone) === -1 && (
                        <option value={userTimezone}>
                          Local Time ({userTimezone})
                        </option>
                      )}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <div className="bg-gray p-2">
                    Send Later:
                    <br />
                    {convertedScheduleDate} at {scheduleTime} at
                    <br />
                    {scheduleTimeZone}
                  </div>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col sm={6}>
                  <FormGroup>
                    <CloseButton
                      btnTxt={'Cancel'}
                      onClick={() => {
                        setShowSchedulePopover(false);
                        setScheduleDate(new Date().toISOString().substr(0, 10));
                        setScheduleTimeZone('America/New_York');
                      }}
                    ></CloseButton>
                  </FormGroup>
                </Col>
                <Col sm={6} className="text-right">
                  <FormGroup>
                    <ClButton
                      disabled={saveOrSendEmailLoading}
                      icon={
                        isScheduleReq && saveOrSendEmailLoading
                          ? 'fa fa-spinner fa-spin'
                          : 'fas fa-arrow-right'
                      }
                      color="primary"
                      onClick={() => handleSaveOrSend('send', true)}
                    >
                      Schedule
                    </ClButton>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </PopoverBody>
        </Popover>
      </Modal>
      {showConfirmModal && (
        <ConfirmModal
          showConfirmModal={showConfirmModal}
          handleCancel={() => setShowConfirmModal(false)}
          handleConfirm={() => {
            handleConfirm();
            hideModal();
          }}
          children={<div>Are you sure want to cancel sending this email?</div>}
        />
      )}
    </>
  );
};

export default EmailsModal;
