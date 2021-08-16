import React from 'react';
import { useHistory } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const Auth0ProviderWithHistory = ({ children }) => {
  const history = useHistory();

  const onRedirectCallback = (appState) => {
    //To load the same page when use refreshed, using open in new window or using a specific page URL by copy pasting
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      redirectUri={
        process.env.REACT_APP_AUTH0_REDIRECT_URI
          ? process.env.REACT_APP_AUTH0_REDIRECT_URI
          : window.location.origin
      } // TODO this line can be changed to process.env.REACT_APP_AUTH0_REDIRECT_URI once the app is running on it's own server
      audience={process.env.REACT_APP_AUTH0_AUDIENCE}
      scope={process.env.REACT_APP_AUTH0_SCOPE}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
