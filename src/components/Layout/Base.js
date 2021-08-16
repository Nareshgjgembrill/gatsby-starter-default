import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@apollo/react-hooks';
import { Footer } from '@koncert/shared-components';
import { bindActionCreators } from 'redux';
import * as actions from '../../store/actions/actions';
import EmailVerificationAlert from '../Common/EmailVerificationAlert';
import BannerNotifications from '../Common/BannerNotifications';
import SystemSettingsBanner from '../Common/SystemSettingsBanner';
import IdleTimeoutWarningModel from '../../components/Common/IdleTimeoutWarningModel';
import { GET_LOOKUP_VALUE_QUERY } from '../queries/PendingCallsQuery';
import Header from './Header';
import Sidebar from './Sidebar';
import { handleLogout } from '../../util/index';

const Base = ({ actions, ...props }) => {
  const { logout } = useAuth0();

  const { data: lookupData } = useQuery(GET_LOOKUP_VALUE_QUERY, {
    variables: {
      lookupsFilter: `filter[lookupName]=browser_session_time_out`,
    },
    fetchPolicy: 'cache-first',
  });

  const sessionEndTime =
    lookupData?.lookup?.data[0]?.lookupName === 'browser_session_time_out'
      ? lookupData.lookup.data[0].lookupValue
      : 600000;

  const [intervalId, setIntervalId] = useState(null);
  const [timeOut, setTimeOut] = useState(sessionEndTime);

  useEffect(() => {
    if (lookupData?.lookup?.data[0]?.lookupValue) {
      setTimeOut(lookupData.lookup.data[0].lookupValue);
    }
  }, [lookupData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeOut((prevState) => prevState - 1000);
    }, 1000);
    setIntervalId(intervalId);
  }, []);

  const resetIdleTimeOutTimer = () => {
    setTimeOut(sessionEndTime);
  };

  if (timeOut === 0) {
    clearInterval(intervalId);
    handleLogout(actions, logout);
  }

  return (
    <div
      className="wrapper"
      onClick={resetIdleTimeOutTimer}
      onScroll={resetIdleTimeOutTimer}
      onMouseMove={resetIdleTimeOutTimer}
      onKeyPress={resetIdleTimeOutTimer}
    >
      {timeOut <= 60000 && (
        <IdleTimeoutWarningModel
          timeOut={timeOut}
          resetIdleTimeOutTimer={resetIdleTimeOutTimer}
        />
      )}
      {window.location.pathname.indexOf('settings/email/callback') === -1 && (
        <Header />
      )}
      <Sidebar sidebarAnyclickClose={false} />
      <section className="section-container">
        <SystemSettingsBanner />
        {window.location.pathname.indexOf('settings/email/callback') === -1 && (
          <EmailVerificationAlert />
        )}
        <BannerNotifications />
        {props.children}
      </section>
      <Footer productName={props.productName} />
    </div>
  );
};

const mapDispatchToProps = function (dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(Base);
