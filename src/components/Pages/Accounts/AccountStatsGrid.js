import React, { useState } from 'react';
import {
  Alert,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Row,
} from 'reactstrap';
import Chart from '../../Common/Chart';
import AccountCadencesGrid from './AccountCadencesGrid';
import AccountProspectsGrid from './AccountProspectsGrid';
import AccountOutcomeGrid from './AccountOutcomeGrid';

function AccountStatsGrid({
  emailOpen,
  callOpen,
  cadenceOpen,
  textOpen,
  prospectOpen,
  cadenceGridData,
  cadenceLoading,
  cadencesData,
  accountLoading,
  prospectGridData,
  sortByStatsProspect,
  orderByStatsProspect,
  handleSortProspect,
  outcomeEmailLoading,
  outcomeCallLoading,
  outcomeTextLoading,
  prospectsData,
  prospectLoading,
  fetchData,
  callCount,
  emailCount,
  textCount,
  prospectCount,
  cadenceCount,
  handleStatProspectsOrCadence,
  hideProspectOrCadenceDetails,
  cadenceLimit,
  cadenceOffset,
  cadencePageCount,
  cadenceSortBy,
  cadenceOrderBy,
  handleSortCadence,
  prospectLimit,
  prospectOffset,
  ProspectPageCount,
  textOutcomeGridData,
  textOutcomeData,
  callOutcomeGridData,
  callOutcomeData,
  emailOutcomeGridData,
  emailOutcomeData,
  callLimit,
  callOffset,
  callOutcomePageCount,
  emailLimit,
  emailOffset,
  emailOutcomePageCount,
  textLimit,
  textOffset,
  textOutcomePageCount,
  prospectTotalCount,
  cadenceTotalCount,
  callTotalCount,
  emailTotalCount,
  textTotalCount,
  view,
  handleRefreshMetricsCount,
  cadenceCountLoading,
  prospectCountLoading,
  outcomesCountLoading,
  sortByOutcome,
  orderByOutcome,
  handleSortOutcome,
  accountOwnerName,
}) {
  const [isCadenceOpen, setIsCadenceOpen] = useState(true);
  const [isProspectOpen, setIsProspectOpen] = useState(true);
  const [isCallOpen, setIsCallOpen] = useState(true);
  const [isEmailOpen, setIsEmailOpen] = useState(true);
  const [isTextOpen, setIsTextOpen] = useState(true);
  const toggleCadence = () => setIsCadenceOpen(!isCadenceOpen);
  const toggleProspect = () => setIsProspectOpen(!isProspectOpen);
  const toggleCall = () => setIsCallOpen(!isCallOpen);
  const toggleEmail = () => setIsEmailOpen(!isEmailOpen);
  const toggleText = () => setIsTextOpen(!isTextOpen);
  const prospectKey = Object.keys(prospectCount);
  const prospectChartData = [];
  for (let i = 0; i < prospectKey.length; i++) {
    const key = prospectKey[i];
    let prospectRow = {};
    if (prospectCount[key] > 0) {
      prospectRow = {
        id: key,
        label: key + ' (' + prospectCount[key] + ')',
        value: prospectCount[key],
      };
      prospectChartData.push(prospectRow);
    }
  }

  const cadenceKey = Object.keys(cadenceCount);
  const cadenceChartData = [];
  for (let i = 0; i < cadenceKey.length; i++) {
    const key = cadenceKey[i];
    let cadenceRow = {};
    if (cadenceCount[key] > 0) {
      cadenceRow = {
        id: key,
        label: key + ' (' + cadenceCount[key] + ')',
        value: cadenceCount[key],
      };
      cadenceChartData.push(cadenceRow);
    }
  }
  const callKey = Object.keys(callCount);
  const callChartData = [];
  for (let i = 0; i < callKey.length; i++) {
    const key = callKey[i];
    let callRow = {};
    if (callCount[key] > 0) {
      callRow = {
        id: key,
        label: key + ' (' + callCount[key] + ')',
        value: callCount[key],
      };
      callChartData.push(callRow);
    }
  }
  const emailKey = Object.keys(emailCount);
  const emailChartData = [];
  for (let i = 0; i < emailKey.length; i++) {
    const key = emailKey[i];
    let emailRow = {};
    if (emailCount[key] > 0) {
      emailRow = {
        id: key,
        label: key + ' (' + emailCount[key] + ')',
        value: emailCount[key],
      };
      emailChartData.push(emailRow);
    }
  }

  const textKey = Object.keys(textCount);
  const textChartData = [];
  for (let i = 0; i < textKey.length; i++) {
    const key = textKey[i];
    let textRow = {};
    if (textCount[key] > 0) {
      textRow = {
        id: key,
        label: key + ' (' + textCount[key] + ')',
        value: textCount[key],
      };
      textChartData.push(textRow);
    }
  }

  const showProspectOrCadenceDetails = (touchType, outcome) => {
    switch (touchType) {
      case 'cadences':
        handleStatProspectsOrCadence(touchType, outcome);
        break;
      case 'prospects':
        handleStatProspectsOrCadence(touchType, outcome);
        break;
      case 'call':
        handleStatProspectsOrCadence(touchType, outcome);
        break;
      case 'email':
        handleStatProspectsOrCadence(touchType, outcome);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {!view && (
        <div>
          <Row>
            <Col>
              <Card className="card-default">
                <CardHeader className="border-bottom">
                  <span>
                    <i
                      className={
                        'mr-2 ' +
                        (cadenceCountLoading
                          ? 'fa fa-spinner fa-spin text-danger'
                          : 'svgicon koncert-cadence-icon text-bold text-danger')
                      }
                    ></i>
                    <strong>Cadences</strong>
                  </span>
                  <span
                    className="float-right"
                    onClick={() => {
                      handleRefreshMetricsCount('cadence');
                    }}
                  >
                    <i
                      className="fas fa-sync-alt text-primary pointer"
                      title="Refresh"
                    ></i>
                  </span>
                </CardHeader>
                <CardBody className="bt">
                  <Row>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('cadences', 'Total');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Total
                        <br />
                        <span
                          className={
                            cadenceCount?.Total > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {cadenceCount?.Total}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('cadences', 'ACTIVE');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Active
                        <br />
                        <span
                          className={
                            cadenceCount?.Active > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {cadenceCount?.Active}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('cadences', 'INACTIVE');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Inactive
                        <br />
                        <span
                          className={
                            cadenceCount?.Inactive > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {cadenceCount?.Inactive}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('cadences', 'PAUSED');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Paused
                        <br />
                        <span
                          className={
                            cadenceCount?.Paused > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {cadenceCount?.Paused}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}></Col>
          </Row>
          <Row style={{ display: !cadenceOpen && 'none' }}>
            <Col>
              <Card className="card-default border-top">
                <CardHeader>
                  All cadences
                  <div className="card-tool float-right">
                    <i
                      className="fa fa-times text-danger"
                      onClick={() => {
                        hideProspectOrCadenceDetails('cadences');
                      }}
                    ></i>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <AccountCadencesGrid
                    data={cadenceGridData}
                    cadencesData={cadencesData}
                    pageSize={cadenceLimit}
                    pageCount={cadencePageCount}
                    currentPageIndex={cadenceOffset}
                    fetchData={({ pageIndex, pageSize }) => {
                      fetchData(pageIndex, pageSize, 'cadence');
                    }}
                    sortBy={cadenceSortBy}
                    orderBy={cadenceOrderBy}
                    handleSort={handleSortCadence}
                    totalCount={cadenceTotalCount}
                    loading={cadenceLoading}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="card-default">
                <CardHeader className="border-bottom">
                  <span>
                    <i
                      className={
                        'mr-2 ' +
                        (prospectCountLoading
                          ? 'fa fa-spinner fa-spin text-info'
                          : 'fas fa-user-friends text-info')
                      }
                    ></i>
                    <strong>Prospects</strong>
                  </span>
                  <span
                    className="float-right"
                    onClick={() => {
                      handleRefreshMetricsCount('prospect');
                    }}
                  >
                    <i
                      className="fas fa-sync-alt text-primary pointer"
                      title="Refresh"
                    ></i>
                  </span>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('prospects', 'Total');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Total
                        <br />
                        <span
                          className={
                            prospectCount?.Total > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {prospectCount?.Total}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('prospects', 'Assigned');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Assigned
                        <br />
                        <span
                          className={
                            prospectCount?.Assigned > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {prospectCount?.Assigned}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('prospects', 'Unassigned');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Unassigned
                        <br />
                        <span
                          className={
                            prospectCount?.Unassigned > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {prospectCount?.Unassigned}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('prospects', 'Paused');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Paused
                        <br />
                        <span
                          className={
                            prospectCount?.Paused > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {prospectCount?.Paused}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('prospects', 'Completed');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Completed
                        <br />
                        <span
                          className={
                            prospectCount?.Completed > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {prospectCount?.Completed}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        showProspectOrCadenceDetails('prospects', 'Pending');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Pending
                        <br />
                        <span
                          className={
                            prospectCount?.Pending > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {prospectCount?.Pending}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}></Col>
          </Row>
          <Row style={{ display: prospectOpen ? '' : 'none' }}>
            <Col>
              <Card className="card-default border-top">
                <CardHeader>
                  All prospects
                  <div className="card-tool float-right">
                    <i
                      className="fa fa-times text-danger"
                      onClick={() => {
                        hideProspectOrCadenceDetails('prospects');
                      }}
                    ></i>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <AccountProspectsGrid
                    data={prospectGridData}
                    prospectsData={prospectsData}
                    pageSize={prospectLimit}
                    pageCount={ProspectPageCount}
                    currentPageIndex={prospectOffset}
                    sortBy={sortByStatsProspect}
                    orderBy={orderByStatsProspect}
                    handleSort={handleSortProspect}
                    fetchData={({ pageIndex, pageSize }) => {
                      fetchData(pageIndex, pageSize, 'prospect');
                    }}
                    totalCount={prospectTotalCount}
                    handleStatProspectsOrCadence={handleStatProspectsOrCadence}
                    loading={prospectLoading}
                    accountOwnerName={accountOwnerName}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="card-default">
                <CardHeader>
                  <span>
                    <i
                      className={
                        'mr-2 ' +
                        (outcomesCountLoading
                          ? 'fa fa-spinner fa-spin text-success'
                          : 'fas fa-phone-alt text-success')
                      }
                    ></i>
                    <strong>Calls</strong>
                  </span>
                  <span
                    className="float-right"
                    onClick={() => {
                      handleRefreshMetricsCount('call');
                    }}
                  >
                    <i
                      className="fas fa-sync-alt text-primary pointer"
                      title="Refresh"
                    ></i>
                  </span>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('call', 'Total');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Total
                        <br />
                        <span
                          className={
                            callCount?.Total > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {callCount?.Total}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence(
                          'call',
                          'Positive Outcomes'
                        );
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Positive
                        <br />
                        <span
                          className={
                            callCount['Positive OutComes'] > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {callCount['Positive OutComes']}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('call', 'Bad Data');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Bad Data
                        <br />
                        <span
                          className={
                            callCount['Bad Data'] > 0
                              ? 'text-bold'
                              : 'text-muted'
                          }
                        >
                          {callCount['Bad Data']}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('call', 'Others');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Others
                        <br />
                        <span
                          className={
                            callCount?.Others > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {callCount?.Others}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('call', 'PENDING');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Pending
                        <br />
                        <span
                          className={
                            callCount?.Pending > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {callCount?.Pending}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}></Col>
          </Row>
          <Row style={{ display: callOpen ? '' : 'none' }}>
            <Col>
              <Card className="card-default border-top">
                <CardHeader>
                  All prospects
                  <div className="card-tool float-right">
                    <i
                      className="fa fa-times text-danger"
                      onClick={() => {
                        hideProspectOrCadenceDetails('call');
                      }}
                    ></i>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <AccountOutcomeGrid
                    data={callOutcomeGridData}
                    type="call"
                    prospectsData={callOutcomeData}
                    pageSize={callLimit}
                    pageCount={callOutcomePageCount}
                    currentPageIndex={callOffset}
                    fetchData={({ pageIndex, pageSize }) => {
                      fetchData(pageIndex, pageSize, 'call');
                    }}
                    totalCount={callTotalCount}
                    sortBy={sortByOutcome}
                    orderBy={orderByOutcome}
                    handleSort={handleSortOutcome}
                    loading={outcomeCallLoading}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="card-default">
                <CardHeader className="border-bottom">
                  <span>
                    <i
                      className={
                        'mr-2 ' +
                        (outcomesCountLoading
                          ? 'fa fa-spinner fa-spin text-email'
                          : 'fas fa-envelope text-email')
                      }
                    ></i>
                    <strong>Emails</strong>
                  </span>
                  <span
                    className="float-right"
                    onClick={() => {
                      handleRefreshMetricsCount();
                    }}
                  >
                    <i
                      className="fas fa-sync-alt text-primary pointer"
                      title="Refresh"
                    ></i>
                  </span>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'total');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Total
                        <br />
                        <span
                          className={
                            emailCount?.Total > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Total}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'sent');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Sent
                        <br />
                        <span
                          className={
                            emailCount?.Sent > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Sent}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'opened');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Opened
                        <br />
                        <span
                          className={
                            emailCount?.Opened > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Opened}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'clicked');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Clicked
                        <br />
                        <span
                          className={
                            emailCount?.Clicked > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Clicked}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'replied');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Replied
                        <br />
                        <span
                          className={
                            emailCount?.Replied > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Replied}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'pending');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Pending
                        <br />
                        <span
                          className={
                            emailCount?.Pending > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Pending}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
                <CardBody>
                  <Row>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'bounced');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Bounced
                        <br />
                        <span
                          className={
                            emailCount?.Bounced > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Bounced}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'failed');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Failed
                        <br />
                        <span
                          className={
                            emailCount?.Failed > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount?.Failed}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('email', 'optout');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Opt out
                        <br />
                        <span
                          className={
                            emailCount?.Optout > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {emailCount.Optout}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}></Col>
          </Row>
          <Row style={{ display: emailOpen ? '' : 'none' }}>
            <Col>
              <Card className="card-default border-top">
                <CardHeader>
                  All prospects
                  <div className="card-tool float-right">
                    <i
                      className="fa fa-times text-danger"
                      onClick={() => {
                        hideProspectOrCadenceDetails('email');
                      }}
                    ></i>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <AccountOutcomeGrid
                    data={emailOutcomeGridData}
                    type="email"
                    prospectsData={emailOutcomeData}
                    pageSize={emailLimit}
                    pageCount={emailOutcomePageCount}
                    currentPageIndex={emailOffset}
                    fetchData={({ pageIndex, pageSize }) => {
                      fetchData(pageIndex, pageSize, 'email');
                    }}
                    sortBy={sortByOutcome}
                    orderBy={orderByOutcome}
                    handleSort={handleSortOutcome}
                    totalCount={emailTotalCount}
                    loading={outcomeEmailLoading}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col>
              <Card className="card-default">
                <CardHeader className="border-bottom">
                  <span>
                    <i
                      className={
                        'mr-2 ' +
                        (outcomesCountLoading
                          ? 'fa fa-spinner fa-spin text-danger'
                          : 'fas fa-comments text-danger')
                      }
                    ></i>
                    <strong>Texts</strong>
                  </span>
                  <span
                    className="float-right"
                    onClick={() => {
                      handleRefreshMetricsCount();
                    }}
                  >
                    <i
                      className="fas fa-sync-alt text-primary pointer"
                      title="Refresh"
                    ></i>
                  </span>
                </CardHeader>
                <CardBody>
                  <Row>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('text', 'total');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Total
                        <br />
                        <span
                          className={
                            textCount?.Total > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {textCount?.Total}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('text', 'sent');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Sent
                        <br />
                        <span
                          className={
                            textCount?.Sent > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {textCount?.Sent}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('text', 'received');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Received
                        <br />
                        <span
                          className={
                            textCount?.Received > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {textCount?.Received}
                        </span>
                      </div>
                    </Col>
                    <Col
                      xs={2}
                      onClick={() => {
                        handleStatProspectsOrCadence('text', 'pending');
                      }}
                    >
                      <div className="float-left text-center pointer">
                        Pending
                        <br />
                        <span
                          className={
                            textCount?.Pending > 0 ? 'text-bold' : 'text-muted'
                          }
                        >
                          {textCount?.Pending}
                        </span>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col md={3}></Col>
          </Row>
          <Row style={{ display: !textOpen && 'none' }}>
            <Col>
              <Card className="card-default border-top">
                <CardHeader>
                  All prospects
                  <div className="card-tool float-right">
                    <i
                      className="fa fa-times text-danger"
                      onClick={() => {
                        hideProspectOrCadenceDetails('text');
                      }}
                    ></i>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <AccountOutcomeGrid
                    data={textOutcomeGridData}
                    type="text"
                    prospectsData={textOutcomeData}
                    pageSize={textLimit}
                    pageCount={textOutcomePageCount}
                    currentPageIndex={textOffset}
                    fetchData={({ pageIndex, pageSize }) => {
                      fetchData(pageIndex, pageSize, 'text');
                    }}
                    sortBy={sortByOutcome}
                    orderBy={orderByOutcome}
                    handleSort={handleSortOutcome}
                    totalCount={textTotalCount}
                    loading={outcomeTextLoading}
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
      <div>
        {view && (
          <>
            <Card className="b">
              <CardBody>
                <i
                  className={
                    isCadenceOpen
                      ? 'fa fa-chevron-up mr-2'
                      : 'fas fa-chevron-down mr-2'
                  }
                  title={isCadenceOpen ? 'Collapse' : 'Expand'}
                  onClick={toggleCadence}
                ></i>
                <i className="fas fa-chart-pie mr-2"></i>
                <strong className="mr-2">Cadences</strong>
              </CardBody>
              <Collapse isOpen={isCadenceOpen}>
                <Card>
                  <CardBody className="d-flex pt-4 pb-0">
                    {cadenceCountLoading || accountLoading ? (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center mb-0 bg-gray-lighter"
                        >
                          <i className="fa fa-spinner fa-spin mr-2"></i>
                          Loading
                        </Alert>
                      </Col>
                    ) : cadenceChartData.length > 0 ? (
                      <>
                        <h4>Cadences</h4>
                        <CardBody style={{ width: '800px', height: '400px' }}>
                          <Chart
                            data={cadenceChartData}
                            type="Pie"
                            alignLeft={true}
                            radialLabelsSkipAngle={8}
                          />
                        </CardBody>
                      </>
                    ) : (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center text-warning bg-gray-lighter mb-0"
                        >
                          <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                          No Data Available
                        </Alert>
                      </Col>
                    )}
                  </CardBody>
                </Card>
              </Collapse>
            </Card>
            <Card className="b">
              <CardBody>
                <i
                  className={
                    isProspectOpen
                      ? 'fa fa-chevron-up mr-2'
                      : 'fas fa-chevron-down mr-2'
                  }
                  title={isProspectOpen ? 'Collapse' : 'Expand'}
                  onClick={toggleProspect}
                ></i>
                <i className="fas fa-chart-pie mr-2"></i>
                <strong className="mr-2">Prospects</strong>
              </CardBody>
              <Collapse isOpen={isProspectOpen}>
                <Card>
                  <CardBody className="d-flex pt-4 pb-0">
                    {accountLoading || prospectCountLoading ? (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center mb-0 bg-gray-lighter"
                        >
                          <i className="fa fa-spinner fa-spin mr-2"></i>
                          Loading
                        </Alert>
                      </Col>
                    ) : prospectChartData.length > 0 ? (
                      <>
                        <h4>Prospects</h4>
                        <CardBody style={{ width: '800px', height: '400px' }}>
                          <Chart
                            data={prospectChartData}
                            type="Pie"
                            alignLeft={true}
                            radialLabelsSkipAngle={8}
                          />
                        </CardBody>
                      </>
                    ) : (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center text-warning bg-gray-lighter mb-0"
                        >
                          <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                          No Data Available
                        </Alert>
                      </Col>
                    )}
                  </CardBody>
                </Card>
              </Collapse>
            </Card>
            <Card className="b">
              <CardBody>
                <i
                  className={
                    isCallOpen
                      ? 'fa fa-chevron-up mr-2'
                      : 'fas fa-chevron-down mr-2'
                  }
                  title={isCallOpen ? 'Collapse' : 'Expand'}
                  onClick={toggleCall}
                ></i>
                <i className="fas fa-chart-pie mr-2"></i>
                <strong className="mr-2">Calls</strong>
              </CardBody>
              <Collapse isOpen={isCallOpen}>
                <Card>
                  <CardBody className="d-flex pt-4 pb-0">
                    {accountLoading || outcomesCountLoading ? (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center mb-0 bg-gray-lighter"
                        >
                          <i className="fa fa-spinner fa-spin mr-2"></i>
                          Loading
                        </Alert>
                      </Col>
                    ) : callChartData.length > 0 ? (
                      <>
                        <h4>Calls</h4>
                        <CardBody style={{ width: '800px', height: '400px' }}>
                          <Chart
                            data={callChartData}
                            type="Pie"
                            alignLeft={true}
                            radialLabelsSkipAngle={8}
                          />
                        </CardBody>
                      </>
                    ) : (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center text-warning bg-gray-lighter mb-0"
                        >
                          <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                          No Data Available
                        </Alert>
                      </Col>
                    )}
                  </CardBody>
                </Card>
              </Collapse>
            </Card>
            <Card className="b">
              <CardBody>
                <i
                  className={
                    isEmailOpen
                      ? 'fa fa-chevron-up mr-2'
                      : 'fas fa-chevron-down mr-2'
                  }
                  title={isEmailOpen ? 'Collapse' : 'Expand'}
                  onClick={toggleEmail}
                ></i>
                <i className="fas fa-chart-pie mr-2"></i>
                <strong className="mr-2">Emails</strong>
              </CardBody>
              <Collapse isOpen={isEmailOpen}>
                <Card>
                  <CardBody className="d-flex pt-4 pb-0">
                    {accountLoading || outcomesCountLoading ? (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center mb-0 bg-gray-lighter"
                        >
                          <i className="fa fa-spinner fa-spin mr-2"></i>
                          Loading
                        </Alert>
                      </Col>
                    ) : emailChartData.length > 0 ? (
                      <>
                        <h4>Emails</h4>
                        <CardBody style={{ width: '800px', height: '400px' }}>
                          <Chart
                            data={emailChartData}
                            type="Pie"
                            alignLeft={true}
                            radialLabelsSkipAngle={8}
                          />
                        </CardBody>
                      </>
                    ) : (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center text-warning bg-gray-lighter mb-0"
                        >
                          <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                          No Data Available
                        </Alert>
                      </Col>
                    )}
                  </CardBody>
                </Card>
              </Collapse>
            </Card>
            <Card className="b">
              <CardBody>
                <i
                  className={
                    isTextOpen
                      ? 'fa fa-chevron-up mr-2'
                      : 'fas fa-chevron-down mr-2'
                  }
                  title={isTextOpen ? 'Collapse' : 'Expand'}
                  onClick={toggleText}
                ></i>
                <i className="fas fa-chart-pie mr-2"></i>
                <strong className="mr-2">Texts</strong>
              </CardBody>
              <Collapse isOpen={isTextOpen}>
                <Card>
                  <CardBody className="d-flex pt-4 pb-0">
                    {accountLoading || outcomesCountLoading ? (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center mb-0 bg-gray-lighter"
                        >
                          <i className="fa fa-spinner fa-spin mr-2"></i>
                          Loading
                        </Alert>
                      </Col>
                    ) : textChartData.length > 0 ? (
                      <>
                        <h4>Texts</h4>
                        <CardBody style={{ width: '800px', height: '400px' }}>
                          <Chart
                            data={textChartData}
                            type="Pie"
                            alignLeft={true}
                            radialLabelsSkipAngle={8}
                          />
                        </CardBody>
                      </>
                    ) : (
                      <Col>
                        <Alert
                          color="light"
                          className="text-center text-warning mb-0 bg-gray-lighter"
                        >
                          <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                          No Data Available
                        </Alert>
                      </Col>
                    )}
                  </CardBody>
                </Card>
              </Collapse>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

export default AccountStatsGrid;
