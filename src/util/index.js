import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import moment from 'moment';

toast.configure();

export const notify = (message, ToasterType = 'error', id) => {
  const toastId = id ? id : message;
  const options = {
    type: ToasterType,
    position: 'top-right',
    toastId: toastId,
    autoClose: ToasterType !== 'error',
    pauseOnFocusLoss: false,
    pauseOnHover: true,
  };
  const activeToastId = toast(message, options);
  if (toast.isActive(activeToastId)) {
    toast.update(toastId, {
      render: message,
      type: ToasterType,
      autoClose: ToasterType !== 'error',
    });
  } else {
    toast(message, options);
  }
};

/* eslint-disable no-useless-escape */
export const isEmail = (email) => {
  return /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(
    email
  );
};
export const PUBLIC_PAGES = [
  '/logout',
  '/register',
  '/recover',
  '/lock',
  '/notfound',
  '/error500',
  '/maintenance',
  '/reset_password',
  '/confirmation',
  '/easuccess.action',
];

export const clearBrowserCache = (actions) => {
  actions.resetUsers();
  actions.resetAccounts();
  actions.resetCadences();
  actions.resetTags();
  actions.resetPendingCallsCount();
  actions.resetToDoCount();

  sessionStorage.removeItem('sessionId');
};

export const handleLogout = (actions, logout, returnToLogin) => {
  clearBrowserCache(actions);
  logout({
    returnTo: `${window.location.origin}${returnToLogin ? '' : '/logout'}`,
  });
};

export const useClickOutside = (handler, isActive) => {
  const domNode = useRef(null);

  useEffect(() => {
    const clickHandler = (e) => {
      if (isActive && !domNode.current.contains(e.target)) {
        handler();
      }
    };
    document.addEventListener('mousedown', clickHandler);
    return () => {
      document.removeEventListener('mousedown', clickHandler);
    };
  });
  return domNode;
};

export const formateDateTime = (inputDateString) => {
  if (inputDateString) {
    return moment(inputDateString).format('M/D/YYYY h:mm A');
  }
  return '';
};

export const getErrorMessage = (response, defaultMessage) => {
  return response.graphQLErrors[0]
    ? response.graphQLErrors[0].message
    : defaultMessage;
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(
    function () {
      notify('Request Id has been copied to clipboard!', 'success');
    },
    function (err) {
      notify('Could not copy Request Id');
    }
  );
};
// below function is to show success message if the prospect action is done using job queue
export const showSuccessMsg = (requestId) => {
  const successMessage = `Your request has been submitted.`;
  const successFormat = (
    <>
      <h6>{successMessage}</h6>
      {requestId && (
        <>
          <br />
          <span>RequestId: {requestId}</span>
          <i
            className="fas fa-copy ml-2 text-light"
            title="Copy Request ID"
            onClick={() => copyToClipboard(requestId)}
          ></i>
        </>
      )}
    </>
  );
  return notify(successFormat, 'success', 'prospect_action_success');
};

export const showErrorMessage = (response, defaultMessage, errorData, id) => {
  let errorMsg =
    response.graphQLErrors && response.graphQLErrors.length > 0
      ? response.graphQLErrors[0].message === 'shared user ids are  mandatory.'
        ? 'User names are mandatory'
        : response.graphQLErrors[0].message
      : response.networkError
      ? response.networkError.message
      : defaultMessage;
  if (errorMsg === 'Timeout exceeded') {
    errorMsg = 'Failed to fetch data';
  }

  const requestId = errorData?.requestId;
  const errorFormat = (
    <>
      <h6>{errorMsg}</h6>
      {requestId && (
        <>
          <br />
          <span>RequestId: {requestId}</span>
          <i
            className="fas fa-copy ml-2 text-light"
            title="Copy Request ID"
            onClick={() => copyToClipboard(requestId)}
          ></i>
        </>
      )}
    </>
  );
  return notify(errorFormat, 'error', id);
};

export const trimValue = (value) => {
  return value && value !== 'null'
    ? typeof value === 'string'
      ? value.trim()
      : value
    : '';
};

export const getDueDate = (date) => {
  let result = '';
  const array = trimValue(date).split(' ');
  for (let index = 0; index < array.length; index++) {
    const value = array[index];
    if (index % 2 === 0 && parseInt(value) > 0) {
      result += ` ${value} ${trimValue(array[index + 1]).toLowerCase()}`;
    }
  }
  result = result.trim().split(' ').slice(0, 4).join(' ');
  return result;
};

export const isValidURL = (textValue) => {
  if (textValue === undefined || textValue === null || textValue === '') {
    return false;
  }
  textValue = '' + textValue;

  const validUrl =
    textValue.indexOf('http://') === 0 ||
    textValue.indexOf('https://') === 0 ||
    textValue.indexOf('www.') === 0;
  return validUrl;
};

export const formatWebLink = (fieldValue) => {
  const isValidUrl = isValidURL(fieldValue);

  if (isValidUrl) {
    fieldValue = fieldValue.startsWith('http')
      ? fieldValue
      : 'https://' + fieldValue;
  }
  return fieldValue;
};

export const timeLeft = (moment, date) => {
  const now = moment(new Date());
  const futureDate = moment(new Date(date));
  const diffDuration = moment.duration(futureDate.diff(now));
  let result = '';
  if (futureDate.diff(now, 'years') > 0) {
    result +=
      futureDate.diff(now, 'years') +
      (futureDate.diff(now, 'years') === 1 ? ' year ' : ' years ');
  }
  if (
    futureDate.diff(
      moment().add(futureDate.diff(now, 'years'), 'years'),
      'days'
    ) > 0
  ) {
    const days = futureDate.diff(
      moment().add(futureDate.diff(now, 'years'), 'years'),
      'days'
    );

    result += days + (days === 1 ? ' day ' : ' days ');
  }
  if (diffDuration.hours() > 0) {
    result +=
      diffDuration.hours() +
      (diffDuration.hours() === 1 ? ' hour ' : ' hours ');
  }
  if (diffDuration.minutes() > 0) {
    result +=
      diffDuration.minutes() +
      (diffDuration.minutes() === 1 ? ' min ' : ' mins ');
  }
  if (diffDuration.seconds() > 0) {
    result +=
      diffDuration.seconds() +
      (diffDuration.seconds() === 1 ? ' sec ' : ' secs ');
  }

  return `${result.trim()}`;
};

export const convertDateFormat = (data) => {
  const date = data.split('-');
  return date[1] + '/' + date[2] + '/' + date[0];
};

export const FAILED_TO_FETCH_DATA =
  'Sorry! Failed to fetch data. Please try again.';
export const NO_DATA_AVAILABLE = 'No data available.';
export const PLEASE_CONTACT_CONNECTLEADER_SUPPORT =
  'Please contact Koncert Support';
export const SORRY_NO_DATA_AVAILABLE = 'Sorry! No data available.';

export default getErrorMessage;

/*
 This is just triggr production build -- Ravi
 Trigger netlify production build.
*/
