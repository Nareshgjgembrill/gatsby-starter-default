/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React, { useContext } from 'react';
import { NavLink, Route } from 'react-router-dom';
import { Col, ListGroup, ListGroupItem, Row } from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import { ContentWrapper } from '@nextaction/components';
import { FETCH_ALL_SETTINGS_QUERY } from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
//TODO Meetings module codes commented - Should be available when all functionality completed
// import CalendarSetting from './CalendarSetting'
import EmailSetting from './EmailSettings';
import EmailExecutionSchedule from './EmailExecutionSchedule';
import Notifications from './Notifications';
import Tags from './Tags';
import TouchOutcomes from './TouchOutcomes';
import TransferOwnership from './TransferOwnership';
import UserSettings from './UserSettings';
import SyncFieldMapping from './SyncFieldMapping';
import JobsQueue from './JobsQueue';
import SyncLog from './SyncLog';
import CrmSyncSettings from './CrmSyncSettings';
import { showErrorMessage } from '../../../util/index';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

const Settings = ({ match }) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const isManager = userLoading ? '' : user.isManagerUser;
  const isAdmin = userLoading ? '' : user.isAdminUser;
  const tabsList = [
    'emailSettings',
    'touchOutcomes',
    'notifications',
    'syncFieldMapping',
    'crmSync',
    'transferOwnerShip',
    'emailExecutionSchedule',
    'syncLog',
    'jobsQueue',
    'userSettings',
    'calendar',
    'tag',
  ];
  const activeTab =
    tabsList.indexOf(match.params.tab) > -1 ? match.params.tab : tabsList[0];
  const { data: fetchSettingsData, loading: fetchSettingsLoading } = useQuery(
    FETCH_ALL_SETTINGS_QUERY,
    {
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
      onError: (error) => {
        showErrorMessage(
          error,
          FAILED_TO_FETCH_DATA,
          fetchSettingsData,
          'fetch_all_settings'
        );
      },
    }
  );

  let crmType;
  if (fetchSettingsData?.settings?.data) {
    crmType = fetchSettingsData.settings.data[0].crmType;
  }
  const isAuthorized =
    (isManager === 'Y' || isAdmin === 'Y') && crmType !== 'standalone';
  const isAdminOrManagerAccess = isManager === 'Y' || isAdmin === 'Y';
  const UnAuthorizedPage = () => {
    return (
      <h4 className="text-center">
        <i className="fas fa-exclamation-circle fa-lg mr-2 text-danger"></i>
        You are not authorized to access this page
      </h4>
    );
  };

  return (
    <ContentWrapper>
      <Row>
        <Col xl="3" lg="3" className="mw-100">
          <div className="b">
            <ListGroup className="borderless">
              <ListGroupItem className="text-bold borderless">
                <i className="fa fa-cog mr-2"></i>
                Settings
              </ListGroupItem>
              <NavLink
                to="/settings/emailSettings"
                activeClassName="active"
                className="list-group-item-action list-group-item pl-3 borderless"
                isActive={() => activeTab === tabsList[0]}
                activeStyle={{ pointerEvents: 'none' }}
                replace
              >
                Email Settings
              </NavLink>
              {(isManager === 'Y' || isAdmin === 'Y') && (
                <NavLink
                  to="/settings/touchOutcomes"
                  activeClassName="active"
                  className="list-group-item-action list-group-item pl-3 borderless"
                  isActive={() => activeTab === tabsList[1]}
                  activeStyle={{ pointerEvents: 'none' }}
                  replace
                >
                  Touch Outcomes
                </NavLink>
              )}

              <NavLink
                to={fetchSettingsLoading ? '#' : '/settings/notifications'}
                activeClassName="active"
                className="list-group-item-action list-group-item pl-3 borderless"
                isActive={() => activeTab === tabsList[2]}
                activeStyle={{ pointerEvents: 'none' }}
                replace
              >
                Notifications
              </NavLink>

              {(isManager === 'Y' || isAdmin === 'Y') &&
                crmType !== 'standalone' && (
                  <NavLink
                    to={
                      fetchSettingsLoading ? '#' : '/settings/syncFieldMapping'
                    }
                    activeClassName="active"
                    className="list-group-item-action list-group-item pl-3 borderless"
                    isActive={() => activeTab === tabsList[3]}
                    activeStyle={{ pointerEvents: 'none' }}
                    replace
                  >
                    Sync Field Mapping
                  </NavLink>
                )}
              {(isManager === 'Y' || isAdmin === 'Y') &&
                crmType !== 'standalone' && (
                  <NavLink
                    to={fetchSettingsLoading ? '#' : '/settings/crmSync'}
                    activeClassName="active"
                    className="list-group-item-action list-group-item pl-3 borderless"
                    isActive={() => activeTab === tabsList[4]}
                    activeStyle={{ pointerEvents: 'none' }}
                    replace
                  >
                    CRM Sync Settings
                  </NavLink>
                )}
              {(isManager === 'Y' || isAdmin === 'Y') && (
                <NavLink
                  to="/settings/transferOwnerShip"
                  activeClassName="active"
                  className="list-group-item-action list-group-item pl-3 borderless"
                  isActive={() => activeTab === tabsList[5]}
                  activeStyle={{ pointerEvents: 'none' }}
                  replace
                >
                  Transfer Ownership
                </NavLink>
              )}
              <NavLink
                to="/settings/emailExecutionSchedule"
                activeClassName="active"
                className="list-group-item-action list-group-item pl-3 borderless"
                isActive={() => activeTab === tabsList[6]}
                activeStyle={{ pointerEvents: 'none' }}
                replace
              >
                Email Execution Schedule
              </NavLink>
              {(isManager === 'Y' || isAdmin === 'Y') &&
                crmType !== 'standalone' && (
                  <NavLink
                    to="/settings/syncLog"
                    activeClassName="active"
                    className="list-group-item-action list-group-item pl-3 borderless"
                    isActive={() => activeTab === tabsList[7]}
                    activeStyle={{ pointerEvents: 'none' }}
                    replace
                  >
                    Sync Logs
                  </NavLink>
                )}
              <NavLink
                to="/settings/jobsQueue"
                activeClassName="active"
                className="list-group-item-action list-group-item pl-3 borderless"
                isActive={() => activeTab === tabsList[8]}
                activeStyle={{ pointerEvents: 'none' }}
                replace
              >
                Jobs Queue
              </NavLink>
              <NavLink
                to="/settings/userSettings"
                activeClassName="active"
                className="list-group-item-action list-group-item pl-3 borderless"
                isActive={() => activeTab === tabsList[9]}
                activeStyle={{ pointerEvents: 'none' }}
                replace
              >
                User Settings
              </NavLink>
              {/* TODO Meetings module codes commented - Should be available when all functionality completed
              <NavLink
                to="/settings/calendar"
                activeClassName="active"
                className="list-group-item-action list-group-item pl-3 borderless"
                isActive={() => activeTab === tabsList[10]}
                activeStyle={{ pointerEvents: "none" }}
                replace
              >
                Calendar Settings
                </NavLink> */}
              <NavLink
                to="/settings/tag"
                activeClassName="active"
                className="list-group-item-action list-group-item pl-3 borderless"
                isActive={() => activeTab === tabsList[11]}
                activeStyle={{ pointerEvents: 'none' }}
                replace
              >
                Tags
              </NavLink>
            </ListGroup>
          </div>
        </Col>
        <Col xl="9" lg="9" className="pl-0 w-100">
          <Route path="/settings/emailSettings" component={EmailSetting} />
          <Route path="/settings" component={EmailSetting} exact />
          <Route
            path="/settings/touchOutcomes"
            component={
              isAdminOrManagerAccess ? TouchOutcomes : UnAuthorizedPage
            }
          />
          <Route path="/settings/notifications" component={Notifications} />
          <Route
            path="/settings/transferOwnerShip"
            component={
              isAdminOrManagerAccess ? TransferOwnership : UnAuthorizedPage
            }
          />
          <Route
            path="/settings/syncFieldMapping"
            component={isAuthorized ? SyncFieldMapping : UnAuthorizedPage}
          />
          <Route
            path="/settings/crmSync"
            component={isAuthorized ? CrmSyncSettings : UnAuthorizedPage}
          />
          <Route
            path="/settings/syncLog"
            component={isAuthorized ? SyncLog : UnAuthorizedPage}
          />
          <Route
            path="/settings/emailExecutionSchedule"
            component={EmailExecutionSchedule}
          />
          {/* TODO Meetings module codes commented - Should be available when all functionality completed */}
          {/* <Route path="/settings/calendar" component={CalendarSetting} /> */}
          <Route path="/settings/userSettings" component={UserSettings} />
          <Route path="/settings/jobsQueue" component={JobsQueue} />
          <Route path="/settings/tag" component={Tags} />
        </Col>
      </Row>
    </ContentWrapper>
  );
};
export default Settings;
