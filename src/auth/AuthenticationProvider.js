import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import axios from 'axios';

import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { RestLink } from 'apollo-link-rest';
import { setContext } from 'apollo-link-context';
import { onError } from 'apollo-link-error';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { parseUrl } from 'query-string';

import { useAuth0 } from '@auth0/auth0-react';

import { PageLoader } from '@koncert/shared-components';
import * as actions from '../store/actions/actions';
import ApiUrlAndTokenProvider from './ApiUrlAndTokenProvider';
import { PUBLIC_PAGES } from '../util';
import { clearBrowserCache, handleLogout } from '../util/index';

const AuthenticationProvider = ({ actions, ...props }) => {
  const history = useHistory();

  // Validate whether current page can be accessed publicly
  const PRIVATE_PAGE = !PUBLIC_PAGES.some((page) =>
    window.location.href.includes(page)
  );

  // Initialize Auth0 hook
  const {
    error,
    isAuthenticated,
    isLoading: loading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [accessToken, setAccessToken] = useState();

  /* ----- To handle logout links in 500 and InvalidLicense error pages -begin ----- */
  const pathname = window.location.pathname;
  const { query: searchParams } = parseUrl(window.location.search);
  if (!PRIVATE_PAGE && pathname === '/logout' && isAuthenticated) {
    let returnToLogin = false;
    if (searchParams.returnTo === 'login') {
      returnToLogin = true;
    }
    handleLogout(actions, logout, returnToLogin);
  }
  /* ----- To handle logout links in 500 and InvalidLicense error pages -end ----- */

  // Peforem below validations if the page is private
  if (PRIVATE_PAGE) {
    if (error) {
      console.error(error);

      throw new Error('Failed to login');
    }

    if (loading) {
      return <PageLoader />;
    }

    // If user not autenticated redirect to Auth0 login page
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: history.location.pathname + history.location.search,
        },
      });

      return null;
    }

    // If user autenticated and accessToken not obtained then get access token
    if (isAuthenticated && !accessToken) {
      clearBrowserCache(actions);
      getAccessTokenSilently().then((token) => {
        setAccessToken(token);
      });
    }
  }

  // setup `timeoutLink`
  const timeoutLink = new ApolloLinkTimeout(20000); // 20 second timeout

  // Create error link to report Apollo client errors
  const errorLink = onError(({ response }) => {
    //When error occurred, if response includes requestId, return requestId as response data.
    //EX: const{data} = useQuery({{query}}), here data will have requestId, if error response is recevied and response contains requestId
    if (response?.requestId) {
      response.data = { requestId: response.requestId };
    }
  });

  let RESOURCE_SERVER_URL;

  // Get resource server URL from user object which obtained after successful authentication with Auth0
  if (
    user &&
    Object.entries(user).find((key) => key[0].includes('resourceServerURL'))
  ) {
    RESOURCE_SERVER_URL = Object.entries(user).find((key) =>
      key[0].includes('resourceServerURL')
    )[1];
  }

  // Log error if user athenticated but resource url not available
  isAuthenticated &&
    !RESOURCE_SERVER_URL &&
    console.error('Resource url not found');

  // setup your `RestLink` with your endpoint
  const restLink = new RestLink({
    uri: RESOURCE_SERVER_URL ? RESOURCE_SERVER_URL : '',
  });

  // axios global defaults are available here
  axios.defaults.baseURL = RESOURCE_SERVER_URL;
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  const authLink = setContext((_, { headers }) => {
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${accessToken}`,
      },
    };
  });

  // Initialize Apollo Client
  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, timeoutLink, restLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all', // Required to parse requestId from response data when status code other than 200
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all', // Required to parse requestId from response data when status code other than 200
      },
    },
  });
  if (PRIVATE_PAGE && isAuthenticated && !accessToken) {
    return <PageLoader />;
  } else {
    return (
      <ApiUrlAndTokenProvider apiURL={RESOURCE_SERVER_URL} token={accessToken}>
        <ApolloProvider client={client}>{props.children}</ApolloProvider>
      </ApiUrlAndTokenProvider>
    );
  }
};

const mapDispatchToProps = function (dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(AuthenticationProvider);
