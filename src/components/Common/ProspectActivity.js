/**
 * @author ranbarasan
 * @version V11.0
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ButtonDropdown,
  Card,
  Collapse,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import ScrollArea from 'react-scrollbar';
import classnames from 'classnames';
import moment from 'moment';
import { default as ClButton } from '../Common/Button';

function ProspectActivity({
  activeTab,
  loading,
  error,
  data,
  paging,
  handleShowMoreActivity,
  zipwhipSessionKey,
}) {
  const [groupedActivities, setGroupedActivities] = useState({
    CALL: [],
    EMAIL: [],
    TEXT: [],
    SOCIAL: [],
    LINKEDIN: [],
  });

  const cadenceActivities = [
    'EXIT CADENCE',
    'ASSIGNED',
    'MOVE TO NEXT TOUCH',
    'MOVE TO ANOTHER CAMPAIGN',
    'EXIT CAMPAIGN',
  ];

  const [activitiesTab, setActivitiesTab] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
  //Activity Dropdown
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const toggleAction = () => setActionDropdownOpen(!actionDropdownOpen);

  useEffect(() => {
    setActivitiesTab(
      activeTab === 'linkedin'
        ? 'linkedIn'
        : activeTab !== undefined
        ? activeTab
        : 'all'
    );
    setTotalCount(paging && paging.totalCount ? paging.totalCount : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, groupedActivities]);

  // To handle activity tab chagne
  const handleActivityTabChange = (tabVal) => {
    if (tabVal !== activitiesTab) {
      setActivitiesTab(tabVal);
    }
    switch (tabVal) {
      case 'call':
        setTotalCount(groupedActivities.CALL.length);
        break;
      case 'email':
        setTotalCount(groupedActivities.EMAIL.length);
        break;
      case 'text':
        setTotalCount(groupedActivities.TEXT.length);
        break;
      case 'linkedIn':
        setTotalCount(groupedActivities.LINKEDIN.length);
        break;
      case 'social':
        setTotalCount(groupedActivities.SOCIAL.length);
        break;
      case 'cadence':
        setTotalCount(paging && paging.totalCount ? paging.totalCount : 0);
        break;
      default:
        setTotalCount(paging && paging.totalCount ? paging.totalCount : 0);
    }
  };

  useEffect(() => {
    if (data) {
      const activities = data.reduce((accumulator, activity) => {
        const touchType =
          activity.touchType === 'OTHERS' || activity.touchType === 'OTHER'
            ? 'SOCIAL'
            : activity.touchType;
        activity['name'] =
          activity.personName.length > 20
            ? activity.personName.slice(0, 17) + '...'
            : activity.personName;
        if (!accumulator[touchType]) {
          accumulator[touchType] = [];
        }
        accumulator[touchType].push(activity);

        return accumulator;
      }, {});

      setGroupedActivities({
        CALL: activities.CALL ? activities.CALL : [],
        EMAIL: activities.EMAIL ? activities.EMAIL : [],
        TEXT: activities.TEXT ? activities.TEXT : [],
        SOCIAL: activities.SOCIAL ? activities.SOCIAL : [],
        LINKEDIN: activities.LINKEDIN ? activities.LINKEDIN : [],
      });
    }
  }, [data]);

  const activityValue =
    activitiesTab === 'all'
      ? 'All'
      : activitiesTab === 'call'
      ? 'Calls'
      : activitiesTab === 'email'
      ? 'Emails'
      : activitiesTab === 'text'
      ? 'Texts'
      : activitiesTab === 'linkedIn'
      ? 'LinkedIn'
      : activitiesTab === 'social'
      ? 'Social'
      : activitiesTab === 'cadence' && 'Cadence';

  return (
    <Card className="card-default ml-2 mt-2 mb-2 mr-0">
      <CardHeader className="py-1 bg-white border-bottom">
        <CardTitle>
          <Row className="color-bluewood align-items-center">
            <Col sm={6}>
              <h5 className="mb-0">
                <i className="fas fa-tasks mr-2"></i>Activities
              </h5>
            </Col>
            <Col sm={6} className="text-right">
              <ButtonDropdown
                className="mr-1"
                isOpen={actionDropdownOpen}
                toggle={toggleAction}
              >
                <DropdownToggle caret>{activityValue}</DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem
                    className={classnames({ active: activitiesTab === 'all' })}
                    onClick={() => {
                      handleActivityTabChange('all');
                    }}
                  >
                    All
                  </DropdownItem>
                  <DropdownItem
                    className={classnames({ active: activitiesTab === 'call' })}
                    onClick={() => {
                      handleActivityTabChange('call');
                    }}
                  >
                    Calls
                  </DropdownItem>
                  <DropdownItem
                    className={classnames({
                      active: activitiesTab === 'email',
                    })}
                    onClick={() => {
                      handleActivityTabChange('email');
                    }}
                  >
                    Emails
                  </DropdownItem>
                  {zipwhipSessionKey && (
                    <DropdownItem
                      className={classnames({
                        active: activitiesTab === 'text',
                      })}
                      onClick={() => {
                        handleActivityTabChange('text');
                      }}
                    >
                      Texts
                    </DropdownItem>
                  )}
                  <DropdownItem
                    className={classnames({
                      active: activitiesTab === 'linkedIn',
                    })}
                    onClick={() => {
                      handleActivityTabChange('linkedIn');
                    }}
                  >
                    LinkedIn
                  </DropdownItem>
                  <DropdownItem
                    className={classnames({
                      active: activitiesTab === 'social',
                    })}
                    onClick={() => {
                      handleActivityTabChange('social');
                    }}
                  >
                    Social
                  </DropdownItem>
                  <DropdownItem
                    className={classnames({
                      active: activitiesTab === 'cadence',
                    })}
                    onClick={() => {
                      handleActivityTabChange('cadence');
                    }}
                  >
                    Cadence
                  </DropdownItem>
                </DropdownMenu>
              </ButtonDropdown>
            </Col>
          </Row>
        </CardTitle>
      </CardHeader>
      <ScrollArea
        speed={0.8}
        className="area"
        contentClassName="content"
        horizontal={false}
        style={{ minHeight: '402px', maxHeight: '938px' }}
      >
        <TabContent className="border-0" activeTab={activitiesTab}>
          <TabPane tabId="all">
            {loading && (
              <Row className="text-center p-4">
                <i className="fas fa-spinner fa-spin fa-2x w-100 "></i>
              </Row>
            )}
            {!loading &&
              !error &&
              data &&
              totalCount > 0 &&
              data.map((activity, i) => {
                activity.touchType =
                  activity.touchType === '' ? 'NONE' : activity.touchType;
                return {
                  NONE: (
                    <NoneActivity
                      activity={activity}
                      key={`none_${i}`}
                      tab="all"
                    />
                  ),
                  CALL: (
                    <AddActivity
                      activity={activity}
                      key={`allcall_${i}`}
                      tab="all"
                    />
                  ),
                  EMAIL: (
                    <AddActivity
                      activity={activity}
                      key={`allemail_${i}`}
                      tab="all"
                    />
                  ),
                  TEXT: (
                    <AddActivity
                      activity={activity}
                      key={`alltext_${i}`}
                      tab="all"
                    />
                  ),
                  SOCIAL: (
                    <AddActivity
                      activity={activity}
                      key={`allother_${i}`}
                      tab="all"
                    />
                  ),
                  LINKEDIN: (
                    <AddActivity
                      activity={activity}
                      key={`alllinkedin_${i}`}
                      tab="all"
                    />
                  ),
                }[activity.touchType];
              })}
            {!loading && !error && data.length === 0 && (
              <Row className="m-2 py-2">
                <span className="text-center mb-0 w-100 text-warning">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  No Activities Available
                </span>
              </Row>
            )}
            {!loading && error && (
              <Row className="m-2 py-2">
                <span className="text-center mb-0 w-100 text-danger">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch Activities
                </span>
              </Row>
            )}
          </TabPane>
          <TabPane tabId="call">
            {!loading &&
              !error &&
              groupedActivities.CALL &&
              groupedActivities.CALL.filter((activity) => activity.outcome).map(
                (activity, i) => {
                  return (
                    <AddActivity
                      activity={activity}
                      key={`call_${i}`}
                      tab="call"
                    />
                  );
                }
              )}

            {!loading &&
              !error &&
              groupedActivities.CALL.filter((item) => item.outcome).length ===
                0 && (
                <Row className="m-2 py-2">
                  <span className="text-center mb-0 w-100 text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Activities Available
                  </span>
                </Row>
              )}
            {!loading && error && (
              <Row className="m-2 py-2">
                <span className="text-center mb-0 w-100 text-danger">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch Activities
                </span>
              </Row>
            )}
          </TabPane>
          <TabPane tabId="email">
            {!loading &&
              !error &&
              groupedActivities.EMAIL &&
              groupedActivities.EMAIL.filter(
                (activity) => activity.outcome
              ).map((activity, i) => {
                return (
                  <AddActivity
                    activity={activity}
                    key={`email_${i}`}
                    tab="email"
                  />
                );
              })}
            {!loading &&
              !error &&
              (groupedActivities.EMAIL.length === 0 ||
                groupedActivities.EMAIL.filter((item) => item.outcome)
                  .length === 0) && (
                <Row className="m-2 py-2">
                  <span className="text-center mb-0 w-100 text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Activities Available
                  </span>
                </Row>
              )}
            {!loading && error && (
              <Row className="m-2 py-2">
                <span className="text-center mb-0 w-100 text-danger">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch Activities
                </span>
              </Row>
            )}
          </TabPane>
          {zipwhipSessionKey && (
            <TabPane tabId="text">
              {!loading &&
                !error &&
                groupedActivities.TEXT &&
                groupedActivities.TEXT.filter(
                  (activity) => activity.outcome
                ).map((activity, i) => {
                  return (
                    <AddActivity
                      activity={activity}
                      key={`text_${i}`}
                      tab="text"
                    />
                  );
                })}
              {!loading &&
                !error &&
                (groupedActivities.TEXT.length === 0 ||
                  groupedActivities.TEXT.filter((item) => item.outcome)
                    .length === 0) && (
                  <Row className="m-2 py-2">
                    <span className="text-center mb-0 w-100 text-warning">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      No Activities Available
                    </span>
                  </Row>
                )}
              {!loading && error && (
                <Row className="m-2 py-2">
                  <span className="text-center mb-0 w-100 text-danger">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    Failed to fetch Activities
                  </span>
                </Row>
              )}
            </TabPane>
          )}
          <TabPane tabId="linkedIn">
            {!loading &&
              !error &&
              groupedActivities.LINKEDIN &&
              groupedActivities.LINKEDIN.filter(
                (activity) => activity.outcome
              ).map((activity, i) => {
                return (
                  <AddActivity
                    activity={activity}
                    key={`linkedIn_${i}`}
                    tab="linkedIn"
                  />
                );
              })}
            {!loading &&
              !error &&
              (groupedActivities.LINKEDIN.length === 0 ||
                groupedActivities.LINKEDIN.filter((item) => item.outcome)
                  .length === 0) && (
                <Row className="m-2 py-2">
                  <span className="text-center mb-0 w-100 text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Activities Available
                  </span>
                </Row>
              )}
            {!loading && error && (
              <Row className="m-2 py-2">
                <span className="text-center mb-0 w-100 text-danger">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch Activities
                </span>
              </Row>
            )}
          </TabPane>
          <TabPane tabId="social">
            {!loading &&
              !error &&
              groupedActivities.SOCIAL &&
              groupedActivities.SOCIAL.filter(
                (activity) => activity.outcome
              ).map((activity, i) => {
                return (
                  <AddActivity
                    activity={activity}
                    key={`other_${i}`}
                    tab="social"
                  />
                );
              })}
            {!loading &&
              !error &&
              (groupedActivities.SOCIAL.length === 0 ||
                groupedActivities.SOCIAL.filter((item) => item.outcome)
                  .length === 0) && (
                <Row className="m-2 py-2">
                  <span className="text-center mb-0 w-100 text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Activities Available
                  </span>
                </Row>
              )}
            {!loading && error && (
              <Row className="m-2 py-2">
                <span className="text-center mb-0 w-100 text-danger">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch Activities
                </span>
              </Row>
            )}
          </TabPane>
          <TabPane tabId="cadence">
            {loading && (
              <Row className="text-center p-4">
                <i className="fas fa-spinner fa-spin fa-2x w-100 "></i>
              </Row>
            )}
            {!loading &&
              !error &&
              data &&
              totalCount > 0 &&
              data
                .filter(
                  (activity) =>
                    !activity.outcome &&
                    cadenceActivities.includes(activity.actionType)
                )
                .map((activity, i) => {
                  activity.touchType =
                    activity.touchType === '' ? 'NONE' : activity.touchType;
                  return {
                    NONE: (
                      <NoneActivity
                        activity={activity}
                        key={`none_${i}`}
                        tab="all"
                      />
                    ),
                    CALL: (
                      <AddActivity
                        activity={activity}
                        key={`allcall_${i}`}
                        tab="all"
                      />
                    ),
                    EMAIL: (
                      <AddActivity
                        activity={activity}
                        key={`allemail_${i}`}
                        tab="all"
                      />
                    ),
                    TEXT: (
                      <AddActivity
                        activity={activity}
                        key={`alltext_${i}`}
                        tab="all"
                      />
                    ),
                    SOCIAL: (
                      <AddActivity
                        activity={activity}
                        key={`allother_${i}`}
                        tab="all"
                      />
                    ),
                    LINKEDIN: (
                      <AddActivity
                        activity={activity}
                        key={`alllinkedin_${i}`}
                        tab="all"
                      />
                    ),
                  }[activity.touchType];
                })}
            {!loading &&
              !error &&
              data.filter(
                (activity) =>
                  !activity.outcome &&
                  cadenceActivities.includes(activity.actionType)
              ).length === 0 && (
                <Row className="m-2 py-2">
                  <span className="text-center mb-0 w-100 text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Activities Available
                  </span>
                </Row>
              )}
            {!loading && error && (
              <Row className="m-2 py-2">
                <span className="text-center mb-0 w-100 text-danger">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch Activities
                </span>
              </Row>
            )}
          </TabPane>
        </TabContent>
      </ScrollArea>
      {totalCount > 30 && (
        <CardFooter className="text-center">
          <ClButton
            icon={
              loading
                ? 'fas fa-spinner fa-spin'
                : 'fas fa-angle-double-down text-primary'
            }
            disabled={
              loading ||
              (paging &&
                data &&
                paging.totalCount &&
                paging.totalCount === data.length)
            }
            onClick={handleShowMoreActivity}
          >
            {loading ? 'Wait...' : 'Show More'}
          </ClButton>
        </CardFooter>
      )}
    </Card>
  );
}
const OutcomeInfo = ({ activity }) => {
  return (
    <p className="mb-0 mr-2">
      <b>Notes:</b> {activity.outcomeComments}
    </p>
  );
};
const CadenceInfo = ({ activity }) => {
  const activityTouchType =
    activity.touchType.charAt(0) + activity.touchType.slice(1).toLowerCase();
  return (
    <span>
      <span>Touch #{activity.touchStepNo} </span>{' '}
      <span className="text-blue">
        ({activityTouchType}){' '}
        {activity.touchType === 'LINKEDIN' && (
          <span>- {activity.linkedinTouchType}</span>
        )}{' '}
      </span>
      of Cadence: {activity.cadenceName}
    </span>
  );
};
const MovedToNextTouch = ({ activity }) => {
  const activityTouchType =
    activity.touchType.charAt(0) + activity.touchType.slice(1).toLowerCase();
  return (
    <p className="text-wrap">
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
        className="mr-1"
      >
        {activity.name}
      </span>
      {activity.actionChanges.startsWith('SYSTEM')
        ? 'Fall Through from'
        : 'Skipped'}
      <span>&nbsp;Touch #{activity.touchStepNo}</span>
      <span className="text-blue"> ({activityTouchType}) </span>
      <span>
        ({activity.actionChanges.startsWith('USER') ? 'User' : 'System'} Driven)
      </span>{' '}
      from the Cadence: {activity.cadenceName}
    </p>
  );
};

const EmailLineItem = ({ activity }) => {
  const activityTouchType =
    activity.touchType.charAt(0) + activity.touchType.slice(1).toLowerCase();
  const mailType = activity.actionChanges.startsWith('Email Sent manually')
    ? 'One-off'
    : 'Auto';

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {mailType === 'One-off' ? (
        <p>
          {activity.outcome === 'Opened' ? activity.outcome + ' ' : 'Sent '}
          <span className="text-blue">{activityTouchType} </span>
          (One-off) {activity.outcome === 'Opened' ? 'by ' : 'to '}
          <span
            title={
              activity.name !== activity.personName ? activity.personName : ''
            }
          >
            {activity.name}{' '}
          </span>
          {activity.outcome !== 'Opened' && activity.outcome !== 'Sent' && (
            <span>
              with Outcome:{' '}
              <b className="outcome-color">
                {activity.outcome
                  ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
                  : ''}{' '}
              </b>
            </span>
          )}
          {activity.outcome === 'Sent' && (
            <>
              <span className="outcome-color text-bold"> Template: </span>
              {activity.emailTemplateName ? activity.emailTemplateName : null}
            </>
          )}
        </p>
      ) : (
        <p>
          Sent&nbsp;
          <span className="text-blue">
            {activityTouchType} {activity.customizedEmailTouchInfo}{' '}
          </span>
          {'to '}
          <span
            title={
              activity.name !== activity.personName ? activity.personName : ''
            }
          >
            {activity.name}{' '}
          </span>
          {mailType.startsWith('Auto') && (
            <>
              <span>
                with Outcome:{' '}
                <b className="outcome-color">
                  {activity.outcome
                    ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
                    : ''}{' '}
                </b>
              </span>
              <br />
              <CadenceInfo activity={activity}></CadenceInfo>
            </>
          )}
          {activity.emailTemplateName && (
            <span> Template: {activity.emailTemplateName}</span>
          )}
        </p>
      )}
    </>
  );
};

const NoAction = ({ activity }) => {
  return (
    <>
      {activity.actionChanges === '' && activity.touchType === 'TEXT' && (
        <p className="text-wrap">
          Sent <span className="text-blue">Text Message</span>
          {activity.outcome && (
            <span>
              &nbsp;with Outcome:{' '}
              <b className="outcome-color">
                {activity.outcome
                  ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
                  : ''}
              </b>
            </span>
          )}
        </p>
      )}
      {activity.actionChanges !== '' && (
        <p className="text-wrap m-0">
          {activity.actionChanges === 'Call dialed by the user' &&
          activity.isCompletedActivity
            ? 'Made Phone Call (Followup Task) to'
            : activity.actionChanges === 'Call dialed manually' ||
              activity.actionChanges === 'Call dialed by the user'
            ? 'Made Phone Call (One-off) to'
            : activity.actionChanges + ' for'}{' '}
          <span
            title={
              activity.name !== activity.personName ? activity.personName : ''
            }
          >
            {activity.name}{' '}
          </span>
          {activity.outcome && (
            <span>
              with Outcome:{' '}
              <b className="outcome-color">
                {activity.outcome
                  ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
                  : ''}
              </b>
            </span>
          )}
        </p>
      )}
      {activity.actionChanges === 'Call logged manually' ||
        (activity.actionChanges.startsWith('Task created') && (
          <p className="m-0">
            Subject:{' '}
            <b className="outcome-color">
              {activity.actionChanges.startsWith('Task created') &&
              activity.memberTaskSubject
                ? activity.memberTaskSubject
                : activity.actionChanges.startsWith('Task created') &&
                  activity.subject
                ? activity.subject
                : ''}
            </b>
          </p>
        ))}

      <p className="mb-0">
        Notes:{' '}
        <span>
          {activity.actionChanges.startsWith('Task created') &&
          activity.memberTaskNotes
            ? activity.memberTaskNotes
            : activity.actionChanges.startsWith('Task created') &&
              activity.textContent
            ? activity.textContent
            : ''}
        </span>
      </p>
    </>
  );
};

const ExitCampaign = ({ activity }) => {
  return (
    <div className="text-wrap">
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
      >
        {activity.name}
      </span>{' '}
      exited from Cadence
      {activity.actionChanges.startsWith('USER') ? (
        <span>
          {': ' + activity.cadenceName} (User Driven) by user
          <span className="text-blue">{' ' + activity.userName}</span>
        </span>
      ) : (
        <span>
          : {activity.cadenceName}
          {activity.outcome && (
            <span>
              {' '}
              with Outcome:{' '}
              <b className="outcome-color">
                {activity.outcome
                  ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
                  : ''}
              </b>
            </span>
          )}
        </span>
      )}
    </div>
  );
};

const ExitAnotherCampaign = ({ activity }) => {
  return (
    <p className="text-wrap">
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
      >
        {activity.name}
      </span>{' '}
      exited from Cadence (
      {activity.actionChanges.startsWith('USER') ? 'User' : 'System'} Driven):{' '}
      {activity.cadenceName}
      {activity.outcome && (
        <span>
          {' '}
          with Outcome:{' '}
          <b className="outcome-color">
            {activity.outcome
              ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
              : ''}
          </b>
        </span>
      )}
    </p>
  );
};

const FallThrough = ({ activity }) => {
  const activityTouchType =
    activity.touchType.charAt(0) + activity.touchType.slice(1).toLowerCase();
  return (
    <p className="text-wrap">
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
        className="mr-1"
      >
        {activity.name}
      </span>
      Fall Through from Touch #{activity.touchStepNo}
      <span className="text-blue"> ({activityTouchType}) </span>
      <span>
        ({activity.actionChanges.startsWith('USER') ? 'User' : 'System'} Driven)
      </span>{' '}
      from the Cadence: {activity.cadenceName}
    </p>
  );
};

const DefaultLineItem = ({ activity }) => {
  const activityTouchType =
    activity.touchType.charAt(0) + activity.touchType.slice(1).toLowerCase();
  let outcomeInfo = '';
  let cadenceInfo = '';
  if (activity.outcome !== '') {
    outcomeInfo = <OutcomeInfo activity={activity}></OutcomeInfo>;
  }

  if (activity.cadenceName !== '') {
    cadenceInfo = <CadenceInfo activity={activity}></CadenceInfo>;
  }

  if (activity.actionType === 'WAIT COMPLETED') {
    return <p className="text-wrap">Wait completed for {cadenceInfo}</p>;
  } else if (
    activity.actionType === 'DEFAULT ACTION' &&
    activity.touchType === 'EMAIL'
  ) {
    return (
      <p>
        Sent{' '}
        <span className="text-blue">
          {activityTouchType} {activity.customizedEmailTouchInfo}{' '}
        </span>
        to{' '}
        <span
          title={
            activity.name !== activity.personName ? activity.personName : ''
          }
        >
          {activity.name}{' '}
        </span>
        {activity.outcome && (
          <>
            <span>
              with Outcome:{' '}
              <b className="outcome-color">
                {activity.outcome
                  ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
                  : ''}
              </b>
            </span>
            <br />
            {cadenceInfo}
          </>
        )}
      </p>
    );
  } else {
    return (
      <div>
        {activity.touchType === 'LINKEDIN' ||
        activity.touchType === 'SOCIAL' ? (
          <div>
            Completed {cadenceInfo}
            <p>Notes: {activity.outcomeComments}</p>
          </div>
        ) : (
          <>
            {' '}
            <p className="m-0 mr-2">
              <span>
                Made Phone Call{' '}
                {activity.productType === 'PD'
                  ? '(Flow Dialer)'
                  : activity.productType === 'TD'
                  ? '(Agent Assisted Dialer)'
                  : ''}
              </span>
              {''} to{' '}
              <span
                title={
                  activity.name !== activity.personName
                    ? activity.personName
                    : ''
                }
              >
                {activity.name}{' '}
              </span>
              <span className="m-0">
                with Outcome:{' '}
                <b className="outcome-color">
                  {activity.outcome
                    ? activity.outcome.replaceAll('Touch-Other', 'Touch-Social')
                    : ''}
                </b>
              </span>
            </p>
            <div className="mb-2">
              {outcomeInfo}
              {cadenceInfo}
            </div>
          </>
        )}
      </div>
    );
  }
};

const AssignedLineItem = ({ activity }) => {
  return (
    <p>
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
      >
        {activity.name}{' '}
      </span>
      assigned to Cadence: {activity.cadenceName}
    </p>
  );
};

const AddExtraLineIem = ({ activity }) => {
  const activityTouchType =
    activity.touchType.charAt(0) + activity.touchType.slice(1).toLowerCase();
  const activityNextTouch =
    activity.nextTouch.charAt(0) + activity.nextTouch.slice(1).toLowerCase();
  return (
    <p className="text-wrap">
      <span
        className="mr-1"
        title={activity.name !== activity.personName ? activity.personName : ''}
      >
        {activity.name}
        {''}
      </span>
      advanced to{' '}
      <span>
        Touch #
        {activity.actionType === 'MOVE TO NEXT TOUCH' ||
        activity.actionType === 'MOVE TO NEXT STEP'
          ? parseInt(activity.touchStepNo) + 1
          : activity.touchStepNo}
      </span>
      <span className="text-blue">
        {' '}
        (
        {activity.actionType === 'MOVE TO NEXT TOUCH' ||
        activity.actionType === 'MOVE TO NEXT STEP'
          ? activityNextTouch
          : activityTouchType}
        ){' '}
      </span>{' '}
      of Cadence: {activity.cadenceName}
    </p>
  );
};

const ImportLineItem = ({ activity }) => {
  return (
    <p>
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
      >
        {activity.name}{' '}
      </span>
      <span className="mr-1">is added to Cadence -</span>
      {activity.importedFileName === 'From CD Referral.crm'
        ? 'Referred'
        : activity.actionChanges}
      <span className="mr-1 ml-1">by</span>
      <span className="text-blue">{activity.userName}</span>{' '}
    </p>
  );
};
const UpdateLineItem = ({ activity }) => {
  const actionChanges =
    activity.actionType === 'TAG PROSPECT' ? 'Tag' : activity.actionChanges;
  return (
    <p>
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
      >
        {activity.name}{' '}
      </span>
      - Field(s) Updated{' '}
      {activity?.fieldsUpdatedFrom && `From ${activity.fieldsUpdatedFrom}`}:
      <span className="text-blue">
        {' ' +
          (actionChanges.indexOf('updated') !== -1
            ? actionChanges.replace('updated', '')
            : actionChanges.replace('update', ''))}
      </span>
    </p>
  );
};

const TaskUpdateLineItem = ({ activity }) => {
  return (
    <p>
      <span
        title={activity.name !== activity.personName ? activity.personName : ''}
      >
        {activity.name}{' '}
      </span>
      - Task updated manually{' '}
      {activity?.fieldsUpdatedFrom && `From ${activity.fieldsUpdatedFrom}`}
      <p>
        Fields Updated:
        <span className="text-blue">
          {activity.actionChanges.replaceAll('update', '')}
        </span>
      </p>
    </p>
  );
};

const PauseProspect = ({ activity }) => {
  const cadenceInfo = <CadenceInfo activity={activity}></CadenceInfo>;
  return (
    <p className="text-wrap">
      <span>
        {activity.userName} -{' '}
        <span className="outcome-color">
          {' '}
          {activity.actionType === 'RESUME PROSPECT'
            ? 'Resumed'
            : activity.actionChanges.includes('OOTO')
            ? 'Paused (OOTO)'
            : 'Paused (Manual)'}
        </span>{' '}
        the prospect
        <span
          className="ml-1"
          title={
            activity.name !== activity.personName ? activity.personName : ''
          }
        >
          {activity.name}{' '}
        </span>
        from {cadenceInfo}
      </span>
    </p>
  );
};

const GetActionLineItem = (activity, tab) => {
  switch (activity.touchType) {
    case 'CALL':
      activity.actionIcon = 'fas fa-phone-alt';
      break;
    case 'EMAIL':
      switch (activity.outcome) {
        case 'Opened':
          activity.actionIcon = 'fa-envelope-open';
          break;
        case 'Bounced':
          activity.actionIcon = 'fa-ban';
          break;
        case 'Links Clicked':
          activity.actionIcon = 'fa-link';
          break;
        case 'Replied':
          activity.actionIcon = 'fa-reply';
          break;
        default:
          activity.actionIcon = 'fa-envelope';
      }
      break;
    case 'SOCIAL':
      activity.touchType = 'SOCIAL';
      break;
    case 'LINKEDIN':
      activity.actionIcon = 'fab fa-linkedin-in';
      break;
    default:
      break;
  }

  const lineItem = {};
  switch (activity.actionType) {
    case 'MOVE TO NEXT STEP':
    case 'MOVE TO NEXT TOUCH':
      if (tab === 'all') {
        lineItem['fa fa-reply-all fa-flip-horizontal fa-sm'] = (
          <AddExtraLineIem activity={activity}></AddExtraLineIem>
        );
      }

      if (activity.touchType === 'EMAIL' && activity.outcome !== '') {
        lineItem[activity.actionIcon] = (
          <EmailLineItem activity={activity}></EmailLineItem>
        );
      } else if (activity.outcome !== '') {
        const actionIcon =
          (activity.actionType === 'MOVE TO NEXT STEP' ||
            activity.actionType === 'MOVE TO NEXT TOUCH') &&
          activity.touchType === 'SOCIAL'
            ? 'fa fa-share-alt'
            : '';
        lineItem[actionIcon] = (
          <DefaultLineItem activity={activity}></DefaultLineItem>
        );
      } else {
        lineItem['fa-times-circle'] = (
          <MovedToNextTouch activity={activity}></MovedToNextTouch>
        );
      }
      break;
    case 'NO ACTION':
      if (activity.touchType === 'EMAIL') {
        lineItem[activity.actionIcon] = (
          <EmailLineItem activity={activity}></EmailLineItem>
        );
      } else {
        lineItem[activity.actionIcon] = (
          <NoAction activity={activity}></NoAction>
        );
      }
      break;

    case 'EXIT CAMPAIGN':
    case 'REMOVE MEMBER FROM CADENCE':
    case 'EXIT CADENCE':
      lineItem['fa-sign-out-alt'] = (
        <ExitCampaign activity={activity}></ExitCampaign>
      );
      if (activity.touchType === 'EMAIL' && activity.outcome !== '') {
        switch (activity.outcome) {
          case 'Replied':
            lineItem['fa-reply'] = (
              <EmailLineItem activity={activity}></EmailLineItem>
            );
            break;
          case 'Bounced':
            lineItem['fa-ban'] = (
              <EmailLineItem activity={activity}></EmailLineItem>
            );
            break;
          case 'Opened':
            lineItem['fa-envelope-open'] = (
              <EmailLineItem activity={activity}></EmailLineItem>
            );
            break;
          case 'Links Clicked':
            lineItem['fa-link'] = (
              <EmailLineItem activity={activity}></EmailLineItem>
            );
            break;
          default:
            lineItem['fa-envelope'] = (
              <EmailLineItem activity={activity}></EmailLineItem>
            );
        }
      } else if (activity.touchType === 'SOCIAL' && activity.outcome !== '') {
        lineItem['fa fa-share-alt'] = (
          <DefaultLineItem activity={activity}></DefaultLineItem>
        );
      } else if (activity.touchType !== 'EMAIL' && activity.outcome !== '') {
        lineItem[activity.actionIcon] = (
          <DefaultLineItem activity={activity}></DefaultLineItem>
        );
      }

      break;
    case 'MOVE TO ANOTHER CADENCE':
    case 'MOVE TO ANOTHER CAMPAIGN':
      if (activity.touchType !== 'TEXT' && tab === 'all') {
        lineItem[activity.actionIcon] = (
          <FallThrough activity={activity}></FallThrough>
        );
      }
      lineItem['fas fa-times-circle'] = (
        <ExitAnotherCampaign activity={activity}></ExitAnotherCampaign>
      );
      break;
    case 'ASSIGNED':
      lineItem['fa-reply-all fa-flip-horizontal'] = (
        <AddExtraLineIem activity={activity}></AddExtraLineIem>
      );
      lineItem['fa-plus-circle'] = (
        <AssignedLineItem activity={activity}></AssignedLineItem>
      );
      break;
    case 'IMPORT':
      lineItem[activity.actionIcon] = (
        <ImportLineItem activity={activity}></ImportLineItem>
      );
      break;
    case 'UPDATE':
      lineItem['fa-user-edit'] = (
        <UpdateLineItem activity={activity}></UpdateLineItem>
      );
      break;
    case 'TASK UPDATE':
      lineItem['fa-user-edit'] = (
        <TaskUpdateLineItem activity={activity}></TaskUpdateLineItem>
      );
      break;
    case 'TAG PROSPECT':
      lineItem[activity.actionIcon] = (
        <UpdateLineItem activity={activity}></UpdateLineItem>
      );
      break;
    case 'PAUSE PROSPECT':
      lineItem['fa-pause'] = (
        <PauseProspect activity={activity}></PauseProspect>
      );
      break;
    case 'RESUME PROSPECT':
      lineItem['fa-play'] = <PauseProspect activity={activity}></PauseProspect>;
      break;

    default:
      activity.actionIcon =
        activity.actionType === 'WAIT COMPLETED'
          ? 'fa-hourglass-end fa-sm'
          : activity.actionIcon;

      lineItem[activity.actionIcon] = (
        <DefaultLineItem activity={activity}></DefaultLineItem>
      );
      break;
  }

  return lineItem;
};

const PopoverItem = (props, popoverOpen) => {
  const { id, item } = props;
  const regExp = /<a/gi;
  const replaceAnchorTagString =
    '<a href="javaScript:void(0);" onclick="alert(\'This action is not allowed in this section.\');"';
  item.emailContent = item.emailContent.replace(regExp, replaceAnchorTagString);
  return (
    <Row className="mb-1">
      <Col className="px-2">
        <Collapse isOpen={popoverOpen} target={'Popover-' + id}>
          <div className="p-2">
            <CardBody className="p-0">
              <div dangerouslySetInnerHTML={{ __html: item.emailContent }} />
            </CardBody>
          </div>
        </Collapse>
      </Col>
    </Row>
  );
};

const AddListGroupSection = ({ activity, lineItem, extraLineItemIcon }) => {
  const upAngle = 'fas fa-angle-up fa-lg text-primary mr-2';
  const downAngle = 'fas fa-angle-down fa-lg text-primary mr-2';
  const [popoverOpen, setPopoverOpen] = useState(false);
  const toggle = () => {
    setPopoverOpen(!popoverOpen);
  };
  const dateTime = moment(activity.activityDatetime).format('M/D/YYYY h:mm A');
  let emailContentPopover = '';
  if (
    activity.touchType === 'EMAIL' &&
    extraLineItemIcon !== 'fa fa-reply-all fa-flip-horizontal fa-sm' &&
    (activity.outcome === 'Sent' ||
      activity.outcome === 'Reply' ||
      activity.outcome === 'Replied') &&
    activity.emailContent !== ''
  ) {
    emailContentPopover = (
      <Col>
        <PopoverItem
          em
          key={`pop_${activity.id}`}
          item={activity}
          id={activity.id}
          popoverOpen={popoverOpen}
        />
      </Col>
    );
  }

  return (
    <div key={`row_${activity.id}`} className="member-list">
      <ul id="activityList" className="pl-0 mb-2">
        <div className="common-wrap pl-5 ml-3">
          <div className="number-section text-sm text-muted text-nowrap">
            {activity.duration
              ? activity.duration
                  .replace('day', 'd')
                  .replace('hour', 'h')
                  .replace('hr', 'h')
                  .replace('min', 'm')
                  .replace('sec', 's')
                  .replace('s', '')
              : 'Now'}
          </div>
          <span className="icon mr-2">
            {activity.outcome === 'Opt-out' ? (
              <span>
                <span className="h6">
                  <i className="fas fa-envelope text-blue"></i>
                </span>
                <i class="fas fa-ban text-danger position-absolute ml-n2 mt-2"></i>
              </span>
            ) : (
              <i
                className={`${
                  extraLineItemIcon
                    ? extraLineItemIcon.includes('fab')
                      ? extraLineItemIcon
                      : 'fas ' + extraLineItemIcon
                    : activity.actionIcon
                } ${
                  extraLineItemIcon === 'fa-times-circle' ? 'text-danger' : ''
                }fa-sm`}
              ></i>
            )}
          </span>
          <div className="content-section w-90 text-wrap ml-3 p-2 mb-2">
            <p className="mb-0">
              <small>{dateTime.split(',')}</small>
              {emailContentPopover && (
                <i
                  className={`${
                    popoverOpen ? upAngle : downAngle
                  } mt-1 float-right pointer`}
                  title={popoverOpen ? 'Hide' : 'Expand'}
                  onClick={toggle}
                ></i>
              )}
            </p>
            <div className="mb-0">
              <div className="change-size">{lineItem}</div>
            </div>
            <p className="mb-0">
              {emailContentPopover && popoverOpen && (
                <Row>{emailContentPopover}</Row>
              )}
            </p>
          </div>
        </div>
      </ul>
    </div>
  );
};

const NoneActivity = ({ activity }) => {
  activity.actionChanges =
    activity.actionChanges === null ? '' : activity.actionChanges;
  activity.actionIcon = activity.actionChanges.startsWith('Task created')
    ? 'fa-tasks'
    : activity.actionIcon;
  const lineItem = GetActionLineItem(activity);
  return (
    lineItem &&
    Object.keys(lineItem).length > 0 &&
    Object.entries(lineItem).map(([icon, value], index) => {
      return (
        <AddListGroupSection
          key={`none_${activity.id}_${index}`}
          extraLineItemIcon={icon}
          activity={activity}
          lineItem={value}
        ></AddListGroupSection>
      );
    })
  );
};

const AddActivity = ({ activity, tab }) => {
  const lineItem = GetActionLineItem(activity, tab);

  return (
    lineItem &&
    Object.keys(lineItem).length > 0 &&
    Object.entries(lineItem).map(([icon, value], index) => {
      return (
        <AddListGroupSection
          key={`add_${activity.id}_${index}`}
          extraLineItemIcon={icon}
          activity={activity}
          lineItem={value}
        ></AddListGroupSection>
      );
    })
  );
};

ProspectActivity.propTypes = {
  data: PropTypes.array, // Mandatory for showing the activity
  handleShowMoreActivity: PropTypes.func, //Mandatory - Fetching more activity.
  loading: PropTypes.bool, // Mandatory checking whether the data is loading or not.
  error: PropTypes.bool, // Mandatory for checking whether the activity request is success or not.
  paging: PropTypes.object, //Mandatory to enable and disable the showing "Show More" button for fetching more activity
};
export default ProspectActivity;
