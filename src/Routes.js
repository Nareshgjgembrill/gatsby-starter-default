import React, { Suspense, lazy } from 'react';
import { withRouter, Switch, Route, Redirect } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import ProtectedRoute from './components/ProtectedRoute';
/* loader component for Suspense*/

import { PageLoader, BasePage } from '@nextaction/components';

import Base from './components/Layout/Base';

import { UserProvider } from './components/UserContext';

import { PUBLIC_PAGES as listofPages } from './util';

/* Used to render a lazy component with react-router */
const waitFor = (Tag) => (props) => <Tag {...props} />;

const Accounts = lazy(() => import('./components/Pages/Accounts/Accounts'));
const AccountView = lazy(() =>
  import('./components/Pages/Accounts/AccountView')
);
const ExamplePage = lazy(() => import('./components/Pages/ExamplePage'));
const Dashboard = lazy(() => import('./components/Pages/Dashboard/Dashboard'));
const PendingCalls = lazy(() =>
  import('./components/Pages/PendingCalls/PendingCalls')
);
const ToDo = lazy(() => import('./components/Pages/ToDo/ToDo'));
//TODO Meetings module codes commented - Should be available when all functionality completed
// const Meetings = lazy(() => import('./components/Pages/Meetings/Meetings'));
const Prospects = lazy(() => import('./components/Pages/Prospects/Prospects'));
const ProspectView = lazy(() =>
  import('./components/Pages/Prospects/ProspectView')
);
const Cadences = lazy(() => import('./components/Pages/Cadences/Cadences'));
const CadenceView = lazy(() =>
  import('./components/Pages/Cadences/CadenceView')
);
const NewCadence = lazy(() => import('./components/Pages/Cadences/NewCadence'));
const SettingsPage = lazy(() => import('./components/Pages/Settings/Settings'));
const EmailSchedule = lazy(() =>
  import('./components/Pages/Settings/AddEmailExecutionSchedule')
);
const Reports = lazy(() => import('./components/Pages/Reports/Reports'));

//Email Template Components Imports
const Templates = lazy(() =>
  import('./components/Pages/EmailTemplates/Templates')
);
const AddOrEditEmailTemplate = lazy(() =>
  import('./components/Pages/EmailTemplates/AddOrEditEmailTemplate')
);

const Snippets = lazy(() =>
  import('./components/Pages/EmailTemplates/Snippets')
);

const AddOrEditSnippet = lazy(() =>
  import('./components/Pages/EmailTemplates/AddOrEditSnippet')
);

const Schedules = lazy(() =>
  import('./components/Pages/EmailTemplates/Schedules')
);
const GmailOAuth = lazy(() => import('./components/Pages/GmailAuth'));
const EaSuccess = lazy(() => import('./components/Pages/Settings/EaSuccess'));

const Logout = lazy(() => import('./components/Pages/Logout'));

const Routes = ({ location }) => {
  const currentKey = location.pathname.split('/')[1] || '/';
  const timeout = { enter: 500, exit: 500 };

  const animationName = 'rag-fadeIn';

  if (listofPages.indexOf(location.pathname) > -1) {
    return (
      <BasePage>
        <Suspense fallback={<PageLoader />}>
          <Switch location={location}>
            <Route path="/logout" component={waitFor(Logout)} />
            <Route path="/easuccess.action" component={waitFor(EaSuccess)} />
          </Switch>
        </Suspense>
      </BasePage>
    );
  } else {
    return (
      <UserProvider>
        <Base productName="Koncert">
          <TransitionGroup>
            <CSSTransition
              key={currentKey}
              timeout={timeout}
              classNames={animationName}
              exit={false}
            >
              <div>
                <Suspense fallback={<PageLoader />}>
                  <Switch location={location}>
                    <ProtectedRoute
                      path="/"
                      render={() => <Redirect to="/dashboard" />}
                      exact
                    />

                    <ProtectedRoute
                      path="/dashboard"
                      component={waitFor(Dashboard)}
                      exact
                    />
                    <ProtectedRoute
                      path="/pendingCalls"
                      component={waitFor(PendingCalls)}
                      exact
                    />
                    <ProtectedRoute
                      path="/toDo"
                      component={waitFor(ToDo)}
                      exact
                    />
                    <ProtectedRoute
                      path="/prospects/list"
                      component={waitFor(Prospects)}
                      exact
                    />
                    <ProtectedRoute
                      path="/prospects/list/:id"
                      component={waitFor(ProspectView)}
                      exact
                    />
                    <ProtectedRoute
                      path="/accounts"
                      component={waitFor(Accounts)}
                      exact
                    />
                    <ProtectedRoute
                      path="/accounts/:id"
                      component={waitFor(AccountView)}
                      exact
                    />
                    {/* TODO Meetings module codes commented - Should be available when all functionality completed */}
                    {/* <ProtectedRoute
                      path="/meetings"
                      component={waitFor(Meetings)}
                      exact
                    /> */}
                    <ProtectedRoute
                      path="/cadences"
                      component={waitFor(Cadences)}
                      exact
                    />
                    <ProtectedRoute
                      path="/cadences/:id/:section"
                      component={waitFor(CadenceView)}
                    />
                    <ProtectedRoute
                      path="/cadences/new"
                      component={waitFor(NewCadence)}
                      exact
                    />
                    <ProtectedRoute
                      path="/cadences/:id"
                      component={waitFor(NewCadence)}
                      exact
                    />
                    <ProtectedRoute
                      exact
                      path="/templates"
                      component={waitFor(Templates)}
                    />
                    <ProtectedRoute
                      exact
                      path="/templates/emails/add"
                      component={waitFor(AddOrEditEmailTemplate)}
                    />

                    <ProtectedRoute
                      exact
                      path="/templates/emails/:id/:type"
                      component={waitFor(AddOrEditEmailTemplate)}
                    />

                    <ProtectedRoute
                      exact
                      path="/templates/snippets"
                      component={waitFor(Snippets)}
                    />

                    <ProtectedRoute
                      exact
                      path="/templates/snippets/add"
                      component={waitFor(AddOrEditSnippet)}
                    />

                    <ProtectedRoute
                      exact
                      path="/templates/snippets/:id/:type"
                      component={waitFor(AddOrEditSnippet)}
                    />

                    <ProtectedRoute
                      exact
                      path="/templates/schedules"
                      component={waitFor(Schedules)}
                    />
                    <ProtectedRoute
                      path="/reports"
                      component={waitFor(Reports)}
                      exact
                    />
                    <ProtectedRoute
                      path="/prospects/list/:id"
                      component={waitFor(ProspectView)}
                    />
                    <ProtectedRoute
                      path="/settings"
                      component={waitFor(SettingsPage)}
                      exact
                    />
                    <ProtectedRoute
                      path="/settings/emailExecutionSchedule/:id/:action"
                      component={waitFor(EmailSchedule)}
                      exact
                    />
                    <ProtectedRoute
                      path="/settings/email/callback/:callback"
                      component={waitFor(GmailOAuth)}
                      exact
                    />
                    <ProtectedRoute
                      path="/settings/emailExecutionSchedule/:action"
                      component={waitFor(EmailSchedule)}
                      exact
                    />

                    <ProtectedRoute
                      path="/settings/:tab"
                      component={waitFor(SettingsPage)}
                    />

                    {process.env.NODE_ENV === 'development' && (
                      <ProtectedRoute
                        path="/ExamplePage"
                        component={waitFor(ExamplePage)}
                        exact
                      />
                    )}
                  </Switch>
                </Suspense>
              </div>
            </CSSTransition>
          </TransitionGroup>
        </Base>
      </UserProvider>
    );
  }
};

export default withRouter(Routes);
