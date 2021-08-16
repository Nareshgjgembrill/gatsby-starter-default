import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Avatar,
  KoncertLogoSmall as KoncertLogo,
  LogoSmall,
  PageLoader,
} from '@koncert/shared-components';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ListGroup,
  ListGroupItem,
  Tooltip,
  UncontrolledDropdown,
} from 'reactstrap';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import * as actions from '../../store/actions/actions';
import useConfigurations from '../Common/hooks/UseConfigurations';
import {
  MARK_AS_READ_ALL_NOTIFICATIONS,
  FETCH_NOTIFICATIONS,
  FETCH_NOTIFICATIONS_COUNT,
  FETCH_UNREAD_NOTIFICATIONS,
} from '../queries/NotificationsQuery';
import UserContext from '../UserContext';
import Notifications from './Notifications';
import { handleLogout } from '../../util/index';

const Header = ({ actions, history, ...props }) => {
  const [unReadNotifyCount, setUnReadNotifyCount] = useState(0);
  const [notificationDetails, setNotificationDetails] = useState();
  const [notificationDayFilter, setNotificationDayFilter] = useState();
  const outcomes = encodeURIComponent(
    ':[Calls,Sent,Opened,Replied,Bounced,Links Clicked,Opt-out,Failed]'
  );
  const [notificationOutcomeFilter, setNotificationOutcomeFilter] = useState(
    `filter[outcome]=${outcomes}`
  );
  const defaultNotificationsLimit = 25;
  const [limit, setLimit] = useState(defaultNotificationsLimit);
  const [offset, setOffset] = useState(0);
  const [lastSelectedDate, setLastSelectedDate] = useState('unread');
  const [interval, setInterval] = useState(0);

  const [tooltipOpen, setTooltipOpen] = useState(false);
  const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

  const { user, loading: userLoading, error } = useContext(UserContext);
  const { data: configurationsData } = useConfigurations();
  const org = configurationsData?.configurations?.data[0];

  const { user: currentAuth0User, logout } = useAuth0();

  useEffect(
    () => {
      if (props.settings.isCollapsed === user.isTrucadenceLeftmenuExpanded) {
        actions.toggleSetting('isCollapsed');
        actions.toggleSetting('isCollapsedText');
        resize();
      }
      if (props.settings.asideToggled === user.isTrucadenceLeftmenuExpanded) {
        actions.toggleSetting('asideToggled');
      }
    },
    // eslint-disable-next-line
    []
  );

  const { refetch: refetchNotificationsCount } = useQuery(
    FETCH_NOTIFICATIONS_COUNT,
    {
      pollInterval: interval,
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) => {
        if (response && response.total && response.total.paging) {
          setUnReadNotifyCount(response.total.paging.totalCount);
          setInterval(120000);
        }
      },
      onError: (error) => {
        setInterval(0);
        if (error.graphQLErrors.length > 0 || error.networkError !== null) {
          setUnReadNotifyCount(-1);
        } else {
          setUnReadNotifyCount(0);
        }
      },
    }
  );

  const [readAllNotifications] = useLazyQuery(MARK_AS_READ_ALL_NOTIFICATIONS, {
    onCompleted: (response) => {
      refetchNotificationsCount();
    },
  });

  const [
    fetchNotifications,
    { loading: fetchNotificationsLoading, error: fetchNotificationsError },
  ] = useLazyQuery(FETCH_NOTIFICATIONS, {
    variables: {
      limit: limit,
      offset: offset,
      notificationDayFilter: notificationDayFilter,
      notificationOutcomeFilter: notificationOutcomeFilter,
    },
    onCompleted: (response) => {
      setNotificationDetails(response.notifications);
      readAllNotifications({
        variables: {
          limit: limit,
          offset: offset,
          notificationDayFilter: notificationDayFilter,
          notificationOutcomeFilter: notificationOutcomeFilter,
          input: {},
        },
      });
    },
  });

  const [
    fetchUnreadNotifications,
    {
      loading: fetchUnreadNotificationsLoading,
      error: fetchUnreadNotificationsError,
    },
  ] = useLazyQuery(FETCH_UNREAD_NOTIFICATIONS, {
    variables: {
      limit: limit,
      offset: offset,
      unreadStatus: 'false',
      notificationOutcomeFilter: notificationOutcomeFilter,
    },
    onCompleted: (response) => {
      setNotificationDetails(response.notifications);
    },
  });

  const notificationsLoading =
    lastSelectedDate === 'unread'
      ? fetchUnreadNotificationsLoading
      : fetchNotificationsLoading;
  const notificationsError =
    lastSelectedDate === 'unread'
      ? fetchUnreadNotificationsError
      : fetchNotificationsError;

  const showMoreNotifications = () => {
    setOffset(offset + 1);
    if (lastSelectedDate === 'unread') {
      fetchUnreadNotifications({
        variables: {
          limit: limit,
          offset: offset + 1,
          unreadStatus: 'false',
          notificationOutcomeFilter: notificationOutcomeFilter,
        },
      });
    } else {
      fetchNotifications({
        variables: {
          limit: limit,
          offset: offset + 1,
          notificationDayFilter: notificationDayFilter,
          notificationOutcomeFilter: notificationOutcomeFilter,
        },
      });
    }
  };

  const onChangeDropDown = (value, filter) => {
    setOffset(0);
    setLimit(defaultNotificationsLimit);
    setLastSelectedDate(value);
    // if unread is selected in dateRange
    if (
      (filter === 'createdDate' && value === 'unread') ||
      (filter === 'outcome' && lastSelectedDate === 'unread')
    ) {
      let outcomeFilter;
      if (filter === 'outcome') {
        const outcome = encodeURIComponent(':[' + value + ']');
        outcomeFilter = `filter[outcome]=${outcome}`;
        setNotificationOutcomeFilter(outcomeFilter);
      }
      fetchUnreadNotifications({
        variables: {
          limit: limit,
          offset: 0,
          unreadStatus: 'false',
          notificationOutcomeFilter:
            outcomeFilter !== undefined
              ? outcomeFilter
              : notificationOutcomeFilter,
        },
      });
    } else {
      let dayFilter;
      let outcomeFilter;
      if (filter === 'createdDate') {
        switch (value) {
          case 'Current week': {
            setNotificationDayFilter(getCurrentWeekdays());
            dayFilter = getCurrentWeekdays();
            break;
          }
          case 'Today': {
            dayFilter = getToday();
            setNotificationDayFilter(dayFilter);
            break;
          }
          case 'Yesterday': {
            dayFilter = getYesterDay();
            setNotificationDayFilter(dayFilter);
            break;
          }
          default: {
            dayFilter = getDateRangeFilters(value);
            setNotificationDayFilter(dayFilter);
          }
        }
      } else if (filter === 'outcome') {
        const outcome = encodeURIComponent(':[' + value + ']');
        outcomeFilter = `filter[outcome]=${outcome}`;
        setNotificationOutcomeFilter(outcomeFilter);
      }
      fetchNotifications({
        variables: {
          limit: limit,
          offset: 0,
          notificationDayFilter:
            dayFilter !== undefined ? dayFilter : notificationDayFilter,
          notificationOutcomeFilter:
            outcomeFilter !== undefined
              ? outcomeFilter
              : notificationOutcomeFilter,
        },
      });
    }
  };

  const getCurrentWeekdays = () => {
    const currentDay1 = new Date();
    const currentDay2 = new Date();
    const day = currentDay1.getDay();
    let startDate = currentDay1.setDate(currentDay1.getDate() - day);
    startDate = new Date(startDate).toISOString();
    let endDate = currentDay2.setDate(currentDay2.getDate() + (6 - day));
    endDate = new Date(endDate).toISOString();
    const currentWeek = `filter[createdDate]=>=${startDate}&filter[createdDate]=<=${endDate}`;
    return currentWeek;
  };
  const getYesterDay = () => {
    const currentDay = new Date();
    const createdDate = currentDay.setDate(currentDay.getDate() - 1);
    const date = new Date(createdDate).toISOString();
    const fromDate = date.split('T')[0] + 'T00:00:00Z';
    const toDate = date.split('T')[0] + 'T23:59:59Z';
    return `filter[createdDate]=>=${fromDate}&filter[createdDate]=<=${toDate}`;
  };
  const getToday = () => {
    const today = moment().toISOString();
    const fromDate = today.split('T')[0] + 'T00:00:00Z';
    const toDate = today.split('T')[0] + 'T23:59:59Z';
    return `filter[createdDate]=>=${fromDate}&filter[createdDate]=<=${toDate}`;
  };
  const getDateRangeFilters = (value) => {
    const current = new Date();
    let createdDate;
    switch (value) {
      case '15 mins':
        createdDate = current.setMinutes(current.getMinutes() - 15);
        break;
      case '1 hour':
        createdDate = current.setHours(current.getHours() - 1);
        break;
      case '3 hours':
        createdDate = current.setHours(current.getHours() - 3);
        break;
      case '6 hours':
        createdDate = current.setHours(current.getHours() - 6);
        break;
      case 'Last 7 days':
        createdDate = current.setDate(current.getDate() - 7);
        break;
      default:
    }
    const startDate = new Date(createdDate).toISOString();
    const dateRangeFilter = `filter[createdDate]=>=${startDate}&filter[createdDate]=<=${moment().toISOString()}`;
    return dateRangeFilter;
  };

  const changeNotificationShow = () => {
    // to refetch notification on button click
    onChangeDropDown(lastSelectedDate, 'createdDate');
  };

  const toggleCollapsed = (e) => {
    e.preventDefault();
    actions.toggleSetting('isCollapsed');
    actions.toggleSetting('isCollapsedText');
    resize();
  };

  const toggleAside = (e) => {
    e.preventDefault();
    actions.toggleSetting('asideToggled');
  };

  const resize = () => {
    const evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false, window, 0);
    window.dispatchEvent(evt);
  };

  if (userLoading) return null;
  if (error) {
    // eslint-disable-next-line
    throw 'Sorry! Failed to fetch user details.';
  }
  if (!user) return <PageLoader />;

  const _avatar = currentAuth0User
    ? currentAuth0User.picture || Avatar
    : Avatar;
  return (
    <header className="topnavbar-wrapper">
      {/* START Top Navbar */}
      <nav className="navbar topnavbar">
        {/* START navbar header */}
        <div className="navbar-header">
          <div className="d-flex align-items-center pl-4">
            <a className="text-decoration-none navbar-brand text-left" href="/">
              <div className="d-flex align-items-center py-1">
                <img className="mr-2" src={LogoSmall} alt="Logo" width="30" />
                <span className="text-sans-serif text-color-koncert-white h3 mb-0">
                  Cadence
                </span>
              </div>
            </a>
          </div>
        </div>
        {/* END navbar header */}

        {/* START Left navbar */}
        <ul className="navbar-nav mr-auto flex-row">
          <li className="nav-item">
            {/* Button used to collapse the left sidebar. Only visible on tablet and desktops */}
            <span
              className="nav-link d-none d-md-block d-lg-block d-xl-block pointer"
              onClick={toggleCollapsed}
            >
              <em className="fas fa-bars"></em>
            </span>
            {/* Button to show/hide the sidebar on mobile. Visible on mobile only. */}
            <span
              className="nav-link sidebar-toggle d-md-none pointer"
              onClick={toggleAside}
            >
              <em className="fas fa-bars"></em>
            </span>
          </li>
          <UncontrolledDropdown nav inNavbar className="dropdown-list">
            <DropdownToggle
              nav
              className="dropdown-toggle-nocaret"
              onClick={() => {
                changeNotificationShow();
              }}
            >
              <i className="icon-bell pointer"></i>
              {unReadNotifyCount > 0 && (
                <span className="badge badge-primary bg-gradient-brand">
                  {unReadNotifyCount > 1000 ? '999+' : unReadNotifyCount}
                </span>
              )}
              {unReadNotifyCount === -1 && (
                <i
                  className="fas fa-info-circle text-danger"
                  title="Sorry! Failed to fetch unread notification count."
                ></i>
              )}
            </DropdownToggle>
            {/* START Dropdown menu */}
            <Notifications
              data={notificationDetails}
              showMoreNotifications={showMoreNotifications}
              onChangeDropDown={onChangeDropDown}
              loading={notificationsLoading}
              error={notificationsError}
            />
            {/* END Dropdown menu */}
          </UncontrolledDropdown>
          {/* END Alert menu */}

          {/* START lock screen */}
          {/* <li className="nav-item d-none d-md-block">
            <Link to="lock" title="Lock screen" className="nav-link">
              <em className="icon-lock"></em>
            </Link>
          </li> */}
          {/* END lock screen */}
        </ul>
        {/* END Left navbar */}
        {/* START Right Navbar */}
        <ul className="navbar-nav flex-row">
          <UncontrolledDropdown
            nav
            inNavbar
            className="dropdown-list d-flex align-items-center"
          >
            <DropdownToggle
              nav
              className="dropdown-toggle-nocaret"
              disabled={
                user?.userLicense
                  .split(',')
                  .some((item) => ['TD', 'PD'].includes(item))
                  ? false
                  : true
              }
            >
              <img
                className="mr-2 float-left"
                src={KoncertLogo}
                alt="KoncertLogo"
                height="20"
              />
              <em className="fa fa-th"></em>
            </DropdownToggle>
            <DropdownMenu right className="animated bounceIn">
              {user?.userLicense
                .split(',')
                .some((item) => ['TD', 'PD'].includes(item)) && (
                <DropdownItem>
                  <ListGroup>
                    {/* will be uncommented in later versions */}
                    {/* <ListGroupItem
                        action
                        tag="a"
                        href="https://cadence.koncert.com"
                      >
                        Coverage
                      </ListGroupItem> */}
                    <ListGroupItem
                      action
                      tag="a"
                      target="_blank"
                      onClick={() =>
                        window.open(org?.powerDialerUrl, 'dialers').focus()
                      }
                    >
                      <i className="fas fa-address-book mr-2"></i>Dialers
                    </ListGroupItem>
                  </ListGroup>
                </DropdownItem>
              )}
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown
            nav
            inNavbar
            className="dropdown-list d-flex align-items-center"
          >
            <DropdownToggle nav className="dropdown-toggle-nocaret p-2 pr-3">
              <img
                className="rounded-circle"
                src={_avatar}
                alt="Avatar"
                height="30"
                id="TooltipUser"
                onClick={toggleTooltip}
              />
              <Tooltip
                placement="bottom"
                isOpen={tooltipOpen}
                target="TooltipUser"
                toggle={toggleTooltip}
              >
                <div className="text-light">{currentAuth0User.name}</div>
                <div className="text-muted">{currentAuth0User.email}</div>
              </Tooltip>
            </DropdownToggle>
            <DropdownMenu className="animated flipInX p-1" right>
              <DropdownItem className="p-0">
                {/* START list group */}
                <ListGroup>
                  <ListGroupItem
                    className="py-0"
                    action
                    tag="a"
                    href="/user/settings"
                    onClick={(e) => e.preventDefault()}
                  >
                    <div>
                      <div className="item user-block pt-2 pb-0">
                        {/* User picture */}
                        <div className="user-block-picture">
                          <div className="user-block-status">
                            <img
                              className="img-thumbnail rounded-circle"
                              src={_avatar}
                              alt="Avatar"
                              width="60"
                              height="60"
                            />
                            <div className="circle bg-success circle-lg"></div>
                          </div>
                        </div>
                        {/* Name and Job */}
                        <div className="user-block-info pt-1 pb-2">
                          <div className="mb-1">Hello, {user.displayName}</div>
                          {org && (
                            <small className="pb-2">{org.clientName}</small>
                          )}
                        </div>
                      </div>
                    </div>
                  </ListGroupItem>
                  <ListGroupItem
                    action
                    onClick={() => handleLogout(actions, logout)}
                  >
                    <span className="d-flex align-items-center justify-content-center">
                      <span className="text-sm">
                        <i className="fas fa-sign-out-alt mr-1"></i>Logout
                      </span>
                    </span>
                  </ListGroupItem>
                </ListGroup>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          {/* END Offsidebar menu */}
        </ul>
        {/* END Right Navbar */}

        {/* START Search form */}
        <form className="navbar-form" role="search" action="search.html">
          <div className="form-group">
            <input
              className="form-control"
              type="text"
              placeholder="Type and hit enter ..."
            />
            <div
              className="fa fa-times navbar-form-close"
              data-search-dismiss=""
            ></div>
          </div>
          <button className="d-none" type="submit">
            Submit
          </button>
        </form>
        {/* END Search form */}
      </nav>
      {/* END Top Navbar */}
    </header>
  );
};

Header.propTypes = {
  actions: PropTypes.object,
  settings: PropTypes.object,
};

const mapStateToProps = function (state) {
  return {
    settings: state.settings,
  };
};

const mapDispatchToProps = function (dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));
