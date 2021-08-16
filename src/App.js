import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import Auth0ProviderWithHistory from './auth/Auth0ProviderWithHistory';
import AuthenticationProvider from './auth/AuthenticationProvider';
import configureStore from './store/store';
import { TrackingProvider, ErrorBoundary } from '@koncert/shared-components';
import './Vendor';

// import "./i18n";
// App Routes
import Routes from './Routes';

// Application Styles

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@koncert/styles';
import './styles/app.scss';
import 'react-toastify/dist/ReactToastify.css';
import 'dhtmlx-scheduler/codebase/dhtmlxscheduler_material.css';
const store = configureStore();

const App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <TrackingProvider>
          <Router basename={process.env.PUBLIC_URL}>
            <Auth0ProviderWithHistory>
              <AuthenticationProvider>
                <Routes />
              </AuthenticationProvider>
            </Auth0ProviderWithHistory>
          </Router>
        </TrackingProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
