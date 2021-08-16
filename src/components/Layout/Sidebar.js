import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import { Collapse, Badge } from 'reactstrap';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../store/actions/actions';

import { LogoSmall as Logo } from '@koncert/shared-components';
import SidebarRun from './Sidebar.run';

import Menu from './Menu.js';
import { ApiUrlAndTokenContext } from '../../auth/ApiUrlAndTokenProvider';
import UserContext from '../../components/UserContext';
import {
  getPendingCallsCount,
  getToDoCount,
} from '../../store/actions/actions';

/** Component to display headings on sidebar */
const SidebarItemHeader = ({ item }) => (
  <li className="nav-heading">
    <span>
      <Trans i18nKey={item.translate}>{item.heading}</Trans>
      {item.heading}
    </span>
  </li>
);

/** Normal items for the sidebar */
const SidebarItem = ({ item, isActive, settings }) => (
  <li className={isActive ? 'active' : ''}>
    <Link to={item.path} title={item.title || item.name}>
      {item.label && (
        <Badge
          tag="div"
          className={
            settings.isCollapsed
              ? 'float-right mt-n2 bg-gradient-brand'
              : 'float-right bg-gradient-brand'
          }
          color={item.label.color}
        >
          {item.label.value}
        </Badge>
      )}
      {item.icon && <em className={item.icon}></em>}
      <span>
        {/* <Trans i18nKey={item.translate}>{item.name}</Trans> */}
        {item.name}
      </span>
    </Link>
  </li>
);

/** Build a sub menu with items inside and attach collapse behavior */
const SidebarSubItem = ({ item, isActive, handler, children, isOpen }) => (
  <li className={isActive ? 'active' : ''}>
    <div className="nav-item" onClick={handler}>
      {item.label && (
        <Badge
          tag="div"
          className="float-right bg-gradient-brand"
          color={item.label.color}
        >
          {item.label.value}
        </Badge>
      )}
      {item.icon && <em className={item.icon}></em>}
      <span>
        {/* <Trans i18nKey={item.translate}>{item.name}</Trans> */}
        {item.name}
      </span>
    </div>
    <Collapse isOpen={isOpen}>
      <ul id={item.path} className="sidebar-nav sidebar-subnav">
        {children}
      </ul>
    </Collapse>
  </li>
);

/** Component used to display a header on menu when using collapsed/hover mode */
const SidebarSubHeader = ({ item }) => (
  <li className="sidebar-subnav-header">{item.name}</li>
);

const Sidebar = (props) => {
  const [collapse, setCollapse] = useState({});
  const dispatch = useDispatch();
  const { user, loading: userLoading } = useContext(UserContext);
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const currentUserId = userLoading ? 0 : user && user.id;
  const pendingCallsCount = useSelector((state) => state.pendingCallsCount);
  const todoCount = useSelector((state) => state.todoCount);
  const currentMainPage =
    props.location && props.location.pathname
      ? props.location.pathname.split('/')[1]
      : '';

  useEffect(() => {
    // pass navigator to access router api
    SidebarRun(navigator, closeSidebar);
    // prepare the flags to handle menu collapsed states
    buildCollapseList();
    dispatchTheCount();
    // Listen for routes changes in order to hide the sidebar on mobile
    if (window.screen.width <= 575) {
      props.history.listen(closeSidebar);
    }
    // eslint-disable-next-line
  }, [currentMainPage]);

  const dispatchTheCount = () => {
    dispatch(getPendingCallsCount(currentUserId, apiURL, token));
    dispatch(getToDoCount(currentUserId, apiURL, token));
    const data = Menu.find(
      (value) =>
        value.path === window.location.pathname.slice(0, value.path.length)
    );

    if (data) {
      document.title = `Koncert > Cadence > ${data.name}`;
    } else {
      document.title = 'Koncert > Cadence > Dashboard';
    }
  };

  const closeSidebar = () => {
    props.actions.toggleSetting('asideToggled');
    window.resizeBy(window.screenX, window.screenY);
  };

  const buildCollapseList = () => {
    const c = {};
    Menu.filter(({ heading }) => !heading).forEach(
      ({ name, path, submenu }) => {
        c[name] = routeActive(submenu ? submenu.map(({ path }) => path) : path);
      }
    );
    setCollapse(c);
  };

  const navigator = (route) => {
    props.history.push(route);
  };

  const routeActive = (paths) => {
    paths = Array.isArray(paths) ? paths : [paths];
    return paths.some((p) => props.location.pathname.indexOf(p) > -1);
  };

  const toggleItemCollapse = (stateName) => {
    for (const c in collapse) {
      if (collapse[c] === true && c !== stateName)
        setCollapse({
          [c]: false,
        });
    }
    setCollapse({
      [stateName]: !collapse[stateName],
    });
  };

  const getSubRoutes = (item) => item.submenu.map(({ path }) => path);

  const itemType = (item) => {
    if (item.heading) return 'heading';
    if (!item.submenu) return 'menu';
    if (item.submenu) return 'submenu';
  };

  return (
    <aside className="aside-container">
      {/* START Sidebar (left) */}
      <div className="aside-inner">
        <div className="d-flex align-items-center">
          <a className="text-decoration-none navbar-brand text-left" href="/">
            <div className="d-flex align-items-center">
              <img className="mr-2" src={Logo} alt="Logo" height="44" />
              <span className="text-sans-serif text-color-koncert-white h3 mb-0">
                Cadence
              </span>
            </div>
          </a>
        </div>
        <nav className="sidebar">
          {/* START sidebar nav */}
          <ul className="sidebar-nav">
            {/* Iterates over all sidebar items */}
            {Menu.map((item, i) => {
              // heading
              if (itemType(item) === 'heading')
                return <SidebarItemHeader item={item} key={i} />;
              else {
                if (itemType(item) === 'menu') {
                  if ('To Do' === item.name) {
                    item.label = {
                      value: todoCount.data || 0,
                      color: 'success',
                    };
                  } else if ('Pending Calls' === item.name) {
                    item.label = {
                      value: pendingCallsCount.data || 0,
                      color: 'success',
                    };
                  }
                  return (
                    <SidebarItem
                      isActive={routeActive(item.path)}
                      item={item}
                      key={i}
                      settings={props.settings}
                    />
                  );
                }
                if (itemType(item) === 'submenu')
                  return [
                    <SidebarSubItem
                      item={item}
                      isOpen={collapse[item.name]}
                      handler={toggleItemCollapse(item.name)}
                      isActive={routeActive(getSubRoutes(item))}
                      key={i}
                    >
                      <SidebarSubHeader item={item} key={i} />
                      {item.submenu.map((subitem, i) => (
                        <SidebarItem
                          key={i}
                          item={subitem}
                          isActive={routeActive(subitem.path)}
                        />
                      ))}
                    </SidebarSubItem>,
                  ];
              }
              return null; // unrecognized item
            })}
          </ul>
          {/* END sidebar nav */}
        </nav>
      </div>
      {/* END Sidebar (left) */}
    </aside>
  );
};
Sidebar.propTypes = {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation('translations')(withRouter(Sidebar)));
