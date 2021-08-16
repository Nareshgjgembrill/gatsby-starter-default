import React, { useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  Badge,
  CardHeader,
  CardFooter,
  Col,
  DropdownItem,
  DropdownMenu,
  ListGroup,
  ListGroupItem,
  ListGroupItemText,
  Progress,
  Row,
} from 'reactstrap';
import ScrollArea from 'react-scrollbar';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import DropDown from '../Common/DropDown';
import { MARK_AS_READ_NOTIFICATIONS } from '../queries/NotificationsQuery';
import { FETCH_MAIL_MERGE_VARIABLES } from '../queries/EmailTemplatesQuery';
import EmailsModal from '../Pages/ToDo/EmailsModal';
import UserContext from '../UserContext';
import { notify, showErrorMessage } from '../../util/index';
import { FAILED_TO_FETCH_DATA } from '../../util/index';

const Notifications = ({
  data,
  error,
  loading,
  onChangeDropDown,
  showMoreNotifications,
}) => {
  const outcomes = [
    'Calls',
    'Sent',
    'Opened',
    'Replied',
    'Bounced',
    'Failed',
    'Links Clicked',
    'Opt-out',
  ];
  let notificationData = [];
  const date = new Date();

  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [moreNotification, setMoreNotification] = useState(0);
  const [timeFilterValue, setTimeFilterValue] = useState('unread');
  const [outcomeFilterValue, setOutcomeFilterValue] = useState(outcomes);
  const [showSendOneOffEmail, setShowSendOneOffEmail] = useState(false);
  const [prospectId, setProspectId] = useState();

  const [updateReadStatus, { data: updateReadStatusData }] = useLazyQuery(
    MARK_AS_READ_NOTIFICATIONS,
    {
      notifyOnNetworkStatusChange: true,
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to mark notifications as read',
          updateReadStatusData,
          'mark_notifications_read'
        );
      },
    }
  );

  useEffect(() => {
    data &&
      setMoreNotification(
        data.paging.totalCount - data.paging.limit * (data.paging.offset + 1)
      );
  }, [data]);

  if (data !== undefined) {
    notificationData = data.data.map((nf) => {
      const prospect = data.includedAssociations.prospect.find(
        (p) => p.id === nf.associations.prospect[0].id
      );
      const cadence = data.includedAssociations.cadence.find(
        (p) => p.id === nf.associations.cadence[0].id
      );
      const emailTemplate = data.includedAssociations.emailtemplate.find(
        (p) => p.id === nf.associations.emailtemplate[0].id
      );
      const nfDate = new Date(nf.createdDate);
      const days = Math.round(
        (date.getTime() - nfDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const different = Math.abs((date.getTime() - nfDate.getTime()) / 1000);
      const hours = Math.floor(different / 3600);
      const minutes = Math.floor(different / 60);
      const seconds = (different - minutes) * 60;
      const duration =
        seconds < 60
          ? seconds + ' s'
          : minutes < 60
          ? minutes + ' m'
          : hours < 24
          ? hours + ' h'
          : days + ' d';
      return {
        id: nf.id,
        duration: duration,
        touchType: nf.touchType,
        unreadStatus: nf.unreadStatus === 'N' ? true : false,
        outcome: nf.outcome,
        stepNumber: nf.stepNumber,
        accountName: prospect && prospect.accountName,
        contactName: prospect && prospect.contactName,
        cadenceName: cadence && cadence.multiTouchName,
        prospectId: prospect && prospect.id,
        phone: prospect && prospect.phone,
        templateSubject: emailTemplate && emailTemplate.subject,
        userId: nf.associations.user[0].id,
        emailId: prospect && prospect.email,
        prospect: prospect && prospect,
        optoutFlag: prospect && prospect.optoutFlag,
      };
    });
  }
  const daysFilters = [
    {
      text: 'Unread',
      value: 'unread',
    },
    {
      text: 'Last 15 mins',
      value: '15 mins',
    },
    {
      text: 'Last 1 hour',
      value: '1 hour',
    },
    {
      text: 'Last 3 hours',
      value: '3 hours',
    },
    {
      text: 'Last 6 hours',
      value: '6 hours',
    },
    {
      text: 'Today',
      value: 'Today',
    },
    {
      text: 'Yesterday',
      value: 'Yesterday',
    },
    {
      text: 'Current week',
      value: 'Current week',
    },
    {
      text: 'Last 7 days',
      value: 'Last 7 days',
    },
  ];

  const outcomeFilters = [
    {
      text: 'Calls',
      value: 'Calls',
    },
    {
      text: 'Sent',
      value: 'Sent',
    },
    {
      text: 'Opened',
      value: 'Opened',
    },
    {
      text: 'Clicked',
      value: 'Links Clicked',
    },
    {
      text: 'Replied',
      value: 'Replied',
    },
    {
      text: 'Bounced',
      value: 'Bounced',
    },
    {
      text: 'Failed',
      value: 'Failed',
    },
    {
      text: 'Optout',
      value: 'Opt-out',
    },
  ];

  const handleOnChangeTime = (value) => {
    setTimeFilterValue(value);
    onChangeDropDown(value, 'createdDate');
  };
  const handleOnChangeOutcome = (value) => {
    setOutcomeFilterValue(value);
    if (value.length > 0) {
      onChangeDropDown(value, 'outcome');
    }
  };
  const changeReadStatus = (event, id) => {
    if (event.currentTarget.classList.contains('unReadStatus')) {
      updateReadStatus({
        variables: {
          id: id,
          input: {},
        },
      });
      event.currentTarget.classList.remove('unReadStatus');
      event.currentTarget.classList.remove('text-bold');
    }
  };

  const { data: mailMergeVariablesData } = useQuery(
    FETCH_MAIL_MERGE_VARIABLES,
    {
      notifyOnNetworkStatusChange: true,
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to fetch mail merge variables',
          mailMergeVariablesData,
          'fetch_mail_merge_variables'
        );
      },
    }
  );

  const mailMergeVariables = useMemo(
    () =>
      mailMergeVariablesData &&
      mailMergeVariablesData.mailmergeVariables &&
      mailMergeVariablesData.mailmergeVariables.data
        ? mailMergeVariablesData.mailmergeVariables.data.mail_merge
        : [],
    [mailMergeVariablesData]
  );

  return (
    <>
      <DropdownMenu className="animated flipInX p-1" style={{ width: '450px' }}>
        <CardHeader className="border-bottom px-2">
          <div className="d-flex justify-content align-items-center">
            <Col sm={2} className="px-0 text-center">
              Filters
            </Col>
            <Col sm={5} className="pl-0 pr-2">
              <DropDown
                name={'dayFilter'}
                data={daysFilters}
                value={timeFilterValue}
                onChange={handleOnChangeTime}
              />
            </Col>
            <Col sm={5} className="px-0">
              <DropDown
                name={'outcome'}
                data={outcomeFilters}
                value={outcomeFilterValue}
                multiselect={true}
                onChange={handleOnChangeOutcome}
              />
            </Col>
          </div>
        </CardHeader>
        {loading ? (
          <Col sm={6} className="my-auto ml-n3">
            <Progress animated value="100" />
          </Col>
        ) : (
          <DropdownItem toggle={false} className="p-0 bg-color-white">
            {!loading && !error && notificationData.length > 0 && (
              <ScrollArea
                speed={0.8}
                className="area"
                contentClassName="content"
                horizontal={true}
                style={{
                  maxHeight: '280px',
                }}
              >
                <ListGroup>
                  {notificationData &&
                    notificationData
                      .filter((nf) => nf.accountName !== undefined)
                      .map((nd, i) => {
                        const contactNameLength = nd.contactName
                          ? nd.contactName.length
                          : 0;
                        const subjectLength = nd.templateSubject
                          ? nd.templateSubject.length
                          : 0;
                        const accountNameLength = nd.accountName
                          ? nd.accountName.length
                          : 0;
                        const contactName =
                          contactNameLength > 15
                            ? nd.contactName.substr(0, 15)
                            : nd.contactName;
                        const subject =
                          subjectLength > 15
                            ? nd.templateSubject.substr(0, 15)
                            : nd.templateSubject;
                        const accountName =
                          accountNameLength > 15
                            ? nd.accountName.substr(0, 15)
                            : nd.accountName;
                        return (
                          <ListGroupItem
                            onClick={(e) => {
                              changeReadStatus(e, nd.id);
                            }}
                            key={i}
                            id={'nf_' + i}
                            className={
                              'pb-1 ' +
                              (nd.unreadStatus && 'unReadStatus text-bold')
                            }
                          >
                            <Row key={i} className="align-items-center">
                              <Col sm={1}>
                                {' '}
                                <small className="float-left">
                                  {nd.duration}
                                </small>
                              </Col>
                              <Col sm={1} className="pl-2 pr-0 ml-1">
                                <Badge
                                  pill
                                  className="float-left bg-white rounded-circle border border-dark p-2"
                                >
                                  {nd.touchType.toUpperCase() === 'CALL' && (
                                    <i className="fa-1x fas fa-phone-alt text-blue"></i>
                                  )}
                                  {nd.touchType.toUpperCase() === 'EMAIL' &&
                                    nd.outcome === 'Sent' && (
                                      <i className="fa-1x fa fa-envelope text-blue"></i>
                                    )}
                                  {nd.touchType.toUpperCase() === 'EMAIL' &&
                                    nd.outcome === 'Opened' && (
                                      <i className="fa-1x fas fa-envelope-open text-blue"></i>
                                    )}
                                  {nd.touchType.toUpperCase() === 'EMAIL' &&
                                    nd.outcome === 'Bounced' && (
                                      <i className="fa-1x fas fa-ban text-blue"></i>
                                    )}
                                  {nd.touchType.toUpperCase() === 'EMAIL' &&
                                    nd.outcome === 'Opt-out' && (
                                      <span>
                                        <span className="h6">
                                          <i className="fas fa-envelope text-blue"></i>
                                        </span>
                                        <i className="fas fa-ban text-danger position-absolute ml-n2 mt-2"></i>
                                      </span>
                                    )}
                                  {nd.touchType.toUpperCase() === 'EMAIL' &&
                                    nd.outcome === 'Links Clicked' && (
                                      <i className="fa-1x fas fa-link text-blue"></i>
                                    )}
                                  {nd.touchType.toUpperCase() === 'EMAIL' &&
                                    nd.outcome === 'Replied' && (
                                      <i className="fa-1x fas fa-reply text-blue"></i>
                                    )}
                                  {nd.touchType.toUpperCase() === 'EMAIL' &&
                                    nd.outcome === 'Failed' && (
                                      <i className="fa-1x fas fa-envelope text-blue"></i>
                                    )}
                                </Badge>
                              </Col>
                              <Col className="pr-0">
                                <div className="text-break">
                                  <ListGroupItemText className="mb-1">
                                    <Link
                                      to={{
                                        pathname: `/prospects/list/${nd.prospectId}`,
                                        search: `filter[user][id]=${nd.userId}&page[limit]=1`,
                                        state: { pathParam: 'notification' },
                                      }}
                                      title="View Prospect details"
                                      className="link-text"
                                    >
                                      {contactName}
                                      {contactNameLength > 15 && (
                                        <span title={nd.contactName}>...</span>
                                      )}
                                    </Link>{' '}
                                    @{' '}
                                    <span title={nd.accountName}>
                                      {accountName}
                                    </span>
                                  </ListGroupItemText>
                                  <ListGroupItemText className="mb-1">
                                    {nd.outcome}{' '}
                                    <span>
                                      {subject}
                                      {subjectLength > 15 && (
                                        <span title={nd.templateSubject}>
                                          ...
                                        </span>
                                      )}
                                    </span>
                                  </ListGroupItemText>
                                  <ListGroupItemText className="mb-1">
                                    {nd.cadenceName && (
                                      <small>
                                        Touch {nd.stepNumber} ~ {nd.cadenceName}
                                      </small>
                                    )}
                                  </ListGroupItemText>
                                </div>
                              </Col>
                              <Col sm={2}>
                                <div>
                                  {nd.phone && (
                                    <Link
                                      to={{
                                        pathname:
                                          '/prospects/list/' + nd.prospectId,
                                        search: `filter[user][id]=${nd.userId}&page[limit]=1`,
                                        state: {
                                          dialingNumber: nd.phone,
                                          pathParam: 'notification',
                                        },
                                      }}
                                    >
                                      <i
                                        className="fas fa-phone-alt fa-md text-call mr-2"
                                        title="Dial"
                                      ></i>
                                    </Link>
                                  )}
                                  {nd.emailId && (
                                    <i
                                      className="fas fa-envelope fa-md text-email pointer"
                                      title="Email"
                                      onClick={() => {
                                        if (nd.optoutFlag === true) {
                                          notify(
                                            'Prospect is opted out',
                                            'error',
                                            'prospect_opted_out'
                                          );
                                        } else {
                                          // show email modal
                                          setProspectId(nd.prospectId);
                                          setShowSendOneOffEmail(true);
                                        }
                                      }}
                                    ></i>
                                  )}
                                </div>
                              </Col>
                            </Row>
                          </ListGroupItem>
                        );
                      })}
                </ListGroup>
              </ScrollArea>
            )}
          </DropdownItem>
        )}
        <CardFooter>
          {!loading && data?.paging?.totalCount > 0 && (
            <div>
              <span className="d-flex align-items-center">
                {moreNotification > 0 && (
                  <span
                    className="pointer d-flex align-items-center"
                    title="Show more notifications"
                    onClick={showMoreNotifications}
                  >
                    <span className="text-sm">Show more</span>
                    <i className="fas fa-angle-double-down text-primary ml-2"></i>
                  </span>
                )}
                <span
                  className="badge badge-danger ml-auto"
                  title="Total Count"
                >
                  {data?.paging?.totalCount}
                </span>
              </span>
            </div>
          )}

          {!loading && !error && notificationData.length === 0 && (
            <div className="mb-0 text-center text-warning">
              <small className="mb-0">
                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                No notifications found.
              </small>
            </div>
          )}
          {error && (
            <div className="mb-0 text-center text-danger">
              <small className="mb-0">
                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                {FAILED_TO_FETCH_DATA}
              </small>
            </div>
          )}
        </CardFooter>
      </DropdownMenu>
      <EmailsModal
        showModal={showSendOneOffEmail}
        hideModal={() => setShowSendOneOffEmail(false)}
        type="sendOneOff"
        prospectId={prospectId}
        currentUserId={currentUserId} //logged in user
        userId={user.isManagerUser === 'Y' ? currentUserId : 0} // if manager pass user id as 0 otherwise pass userid
        dropdownUserId={currentUserId} // selected dropdown user in the relevent parent page
        mailMergeVariables={mailMergeVariables}
      />
    </>
  );
};

Notifications.propTypes = {
  showMoreNotifications: PropTypes.func,
  onChangeDropDown: PropTypes.func,
};
export default Notifications;
