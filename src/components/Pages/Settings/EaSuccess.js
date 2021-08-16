import React from 'react';
import { parseUrl } from 'query-string';

const EaSuccess = ({ location }) => {
  const { query: searchParams } = parseUrl(location.search);

  window.location = `${window.location.origin}/settings/email/callback/${btoa(
    JSON.stringify(searchParams)
  )}`;

  return <>Redirecting...</>;
};

export default EaSuccess;
