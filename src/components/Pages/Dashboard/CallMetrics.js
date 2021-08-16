/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { ButtonGroup, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { default as Button } from '../../Common/Button';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const CallMetrics = ({
  isManagerUser,
  fetchOverallStatsLoadingCurrent,
  activityInfo,
  activityInfoLoading,
  activityInfoError,
  callDataType,
  setCallDataType,
  callUserFiltered,
  fetchCallDayData,
  callDayFiltered,
  callDayLoading,
  fetchCallWeekData,
  callWeekFiltered,
  totalConnects,
  callPositive,
  callPositivePercent,
  callBadDataPercent,
  callOthersPercent,
  Progress,
  callBadData,
  callWeekLoading,
  sendDashboardParams,
  dateRange,
  dateValidation,
  selectedUsersCountValidation,
  graphColorFormat,
  graphColor,
  theme,
  tooltipFormat1,
  tooltipFormat2,
  tooltipFormat3,
  labelFormat,
  isSelectedAll,
  customWidth,
}) => {
  return (
    <>
      {/* if a manager user */}
      {isManagerUser && (
        <Row>
          <Col xl={10}>
            <Card className="card-default text-center h-100 text-center">
              <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-between">
                <p style={customWidth}></p>
                <p className="pt-2 pl-2 align-items-center align-self-center text-bold text-nowrap">
                  <i
                    className={`mr-2 text-success ${
                      fetchOverallStatsLoadingCurrent ||
                      activityInfoLoading ||
                      callWeekLoading ||
                      callDayLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'fa fa-phone-alt'
                    }`}
                  ></i>
                  CALL METRICS
                </p>
                <ButtonGroup>
                  {['Current Quarter', 'Last Quarter', 'custom'].indexOf(
                    dateRange
                  ) === -1 && (
                    <Button
                      className={`${
                        callDataType === 'user'
                          ? 'bg-color-primary-shade text-white text-bold'
                          : 'text-dark text-bold'
                      }`}
                      onClick={(e) => {
                        setCallDataType('user');
                        sendDashboardParams();
                      }}
                    >
                      User
                    </Button>
                  )}
                  {[
                    'Today',
                    'Yesterday',
                    'Current Week',
                    'Last Week',
                    'Last 7 Days',
                  ].indexOf(dateRange) > -1 &&
                    dateValidation &&
                    selectedUsersCountValidation && (
                      <Button
                        className={`${
                          callDataType === 'day'
                            ? 'bg-color-primary-shade text-white text-bold'
                            : 'text-dark text-bold'
                        }`}
                        onClick={(e) => {
                          fetchCallDayData();
                          setCallDataType('day');
                          sendDashboardParams();
                        }}
                      >
                        Day
                      </Button>
                    )}
                  {[
                    'Today',
                    'Yesterday',
                    'Current Week',
                    'Last Week',
                    'Last 7 Days',
                    'Current Month',
                    'Last Month',
                    'Last 30 Days',
                  ].indexOf(dateRange) > -1 &&
                    dateValidation &&
                    selectedUsersCountValidation && (
                      <Button
                        className={`${
                          callDataType === 'week'
                            ? 'bg-color-primary-shade text-white text-bold'
                            : 'text-dark text-bold'
                        }`}
                        onClick={(e) => {
                          fetchCallWeekData();
                          setCallDataType('week');
                          sendDashboardParams();
                        }}
                      >
                        Week
                      </Button>
                    )}
                </ButtonGroup>
              </CardHeader>
              <CardBody className="d-flex pb-0" style={{ height: '200px' }}>
                {(activityInfoError && (
                  <div className="m-auto">
                    <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                    <p>{FAILED_TO_FETCH_DATA}</p>
                  </div>
                )) ||
                  (callDataType === 'user' &&
                    callUserFiltered &&
                    callUserFiltered.length > 0 &&
                    activityInfo.callByUser.data !== null && (
                      <Chart
                        type="Bar"
                        padding={
                          (callUserFiltered.length === 1 && 0.85) ||
                          (callUserFiltered.length === 2 && 0.78) ||
                          (callUserFiltered.length === 3 && 0.71) ||
                          (callUserFiltered.length === 4 && 0.63) ||
                          (callUserFiltered.length === 5 && 0.55) ||
                          (callUserFiltered.length === 6 && 0.45) ||
                          (callUserFiltered.length === 7 && 0.41) ||
                          (callUserFiltered.length > 7 &&
                            callUserFiltered.length <= 10 &&
                            0.3) ||
                          (callUserFiltered.length > 10 && 0.1)
                        }
                        tickValues={5}
                        enableGridY={false}
                        theme={theme}
                        axisBottomLegend={{
                          format: (label) =>
                            (label.split(' ').length > 1 &&
                              label
                                .split(' ')[0]
                                .substring(0, 1)
                                .toUpperCase() +
                                label
                                  .split(' ')
                                  [label.split(' ').length - 1].substring(0, 1)
                                  .toUpperCase()) ||
                            label.split(' ')[0].substring(0, 1).toUpperCase(),
                          tickSize: 5,
                          tickPadding: 5,
                          legend: '',
                          tickRotation: 0,
                          legendPosition: 'middle',
                          legendOffset: 32,
                        }}
                        tooltip={tooltipFormat2}
                        enableLabel={true}
                        labelFormat={labelFormat}
                        innerPadding={2}
                        groupMode="grouped"
                        data={callUserFiltered}
                        margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                        colors={
                          (graphColorFormat === 'multicolor' && graphColor) || [
                            '#79C143',
                            '#9fed64',
                            '#b8f788',
                          ]
                        }
                        legends={[
                          {
                            dataFrom: 'keys',
                            anchor: 'bottom-left',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 48,
                            itemsSpacing: 0,
                            itemWidth: 70,
                            itemHeight: 10,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 9,
                            effects: [
                              {
                                on: 'hover',
                                style: {
                                  itemOpacity: 1,
                                },
                              },
                            ],
                          },
                        ]}
                      />
                    )) ||
                  (callDataType === 'week' &&
                    callWeekFiltered &&
                    callWeekFiltered.length > 0 && (
                      <Chart
                        type="Bar"
                        groupMode="grouped"
                        colors={
                          (graphColorFormat === 'multicolor' && graphColor) || [
                            '#9452A0',
                            '#b269bf',
                            '#cc86d9',
                            '#e4a5f0',
                          ]
                        }
                        padding={
                          (callWeekFiltered.length === 1 && 0.85) ||
                          (callWeekFiltered.length === 2 && 0.78) ||
                          (callWeekFiltered.length === 3 && 0.71) ||
                          (callWeekFiltered.length === 4 && 0.63) ||
                          (callWeekFiltered.length === 5 && 0.53) ||
                          (callWeekFiltered.length === 6 && 0.47) ||
                          (callWeekFiltered.length === 7 && 0.41) ||
                          (callWeekFiltered.length > 7 &&
                            callWeekFiltered.length <= 10 &&
                            0.35) ||
                          (callWeekFiltered.length > 10 && 0.1)
                        }
                        tickValues={5}
                        enableGridY={false}
                        theme={theme}
                        axisBottomLegend={{
                          tickSize: 5,
                          tickPadding: 5,
                          legend: '',
                          tickRotation: 0,
                          legendPosition: 'middle',
                          legendOffset: 32,
                        }}
                        tooltip={tooltipFormat3}
                        enableLabel={true}
                        labelFormat={labelFormat}
                        innerPadding={2}
                        data={callWeekFiltered}
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 55,
                          left: 60,
                        }}
                        legends={[
                          {
                            dataFrom: 'keys',
                            anchor: 'bottom-left',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 48,
                            itemsSpacing: 0,
                            itemWidth: 70,
                            itemHeight: 10,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 9,
                            effects: [
                              {
                                on: 'hover',
                                style: {
                                  itemOpacity: 1,
                                },
                              },
                            ],
                          },
                        ]}
                      />
                    )) ||
                  (callDataType === 'day' &&
                    callDayFiltered &&
                    callDayFiltered.length > 0 && (
                      <Chart
                        type="Bar"
                        groupMode="grouped"
                        colors={
                          (graphColorFormat === 'multicolor' && graphColor) || [
                            '#9452A0',
                            '#b269bf',
                            '#cc86d9',
                            '#e4a5f0',
                          ]
                        }
                        padding={
                          (callDayFiltered.length === 1 && 0.85) ||
                          (callDayFiltered.length === 2 && 0.78) ||
                          (callDayFiltered.length === 3 && 0.71) ||
                          (callDayFiltered.length === 4 && 0.63) ||
                          (callDayFiltered.length === 5 && 0.55) ||
                          (callDayFiltered.length === 6 && 0.47) ||
                          (callDayFiltered.length === 7 && 0.41) ||
                          (callDayFiltered.length > 7 &&
                            callWeekFiltered.length <= 10 &&
                            0.3) ||
                          (callDayFiltered.length > 10 && 0.1)
                        }
                        tickValues={5}
                        enableGridY={false}
                        theme={theme}
                        axisBottomLegend={{
                          tickSize: 5,
                          tickPadding: 5,
                          legend: '',
                          tickRotation: 0,
                          legendPosition: 'middle',
                          legendOffset: 32,
                        }}
                        tooltip={tooltipFormat1}
                        enableLabel={true}
                        labelFormat={labelFormat}
                        innerPadding={2}
                        data={callDayFiltered}
                        margin={{
                          top: 20,
                          right: 20,
                          bottom: 55,
                          left: 60,
                        }}
                        legends={[
                          {
                            dataFrom: 'keys',
                            anchor: 'bottom-left',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 48,
                            itemsSpacing: 0,
                            itemWidth: 70,
                            itemHeight: 10,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 9,
                            effects: [
                              {
                                on: 'hover',
                                style: {
                                  itemOpacity: 1,
                                },
                              },
                            ],
                          },
                        ]}
                      />
                    )) ||
                  (callDataType === 'user' &&
                    !activityInfoLoading &&
                    (!callUserFiltered || callUserFiltered?.length === 0) && (
                      <div className="m-auto align-self-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (callDataType === 'day' &&
                    !callDayLoading &&
                    (!callDayFiltered || callDayFiltered?.length === 0) && (
                      <div className="m-auto align-self-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (callDataType === 'week' &&
                    !callWeekLoading &&
                    (!callWeekFiltered || callWeekFiltered?.length === 0) && (
                      <div className="m-auto align-self-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (callDataType === 'user' && activityInfoLoading && (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                      </div>
                    </div>
                  )) ||
                  (callDataType === 'day' && callDayLoading && (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                      </div>
                    </div>
                  )) ||
                  (callDataType === 'week' && callWeekLoading && (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                      </div>
                    </div>
                  ))}
              </CardBody>
              {!activityInfoError &&
                !activityInfoLoading &&
                activityInfo &&
                ((callUserFiltered &&
                  callUserFiltered.length > 0 &&
                  callDataType === 'user') ||
                  (callWeekFiltered &&
                    callWeekFiltered.length > 0 &&
                    callDataType === 'week') ||
                  (callDayFiltered &&
                    callDayFiltered.length > 0 &&
                    callDataType === 'day')) && (
                  <p
                    style={{
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: 'grey',
                      position: 'absolute',
                      bottom: 3,
                      right: 30,
                    }}
                    className="mb-0"
                  >
                    {dateRange} -{' '}
                    {isSelectedAll === 'allUsers'
                      ? 'All Users'
                      : 'Selected Users'}
                  </p>
                )}
            </Card>
          </Col>
          <Col xl={2}>
            {/* START card */}
            <Card className="card-default mb-0">
              <p className="pt-1 mb-1 mt-1 align-items-center align-self-center text-bold text-nowrap">
                <i
                  className={`mr-2 text-success ${
                    fetchOverallStatsLoadingCurrent ||
                    activityInfoLoading ||
                    callWeekLoading ||
                    callDayLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'fa fa-phone-alt'
                  }`}
                ></i>
                CALL METRICS
              </p>
              <div className="bb p-1">
                <div className="d-flex align-items-center">
                  <i className="fas fa-phone-alt fa-2x text-info ml-2"></i>
                  <div className="ml-auto">
                    <div className="card-body text-right pr-1">
                      <h4 className="mt-0">{totalConnects}</h4>
                      <p className="mb-0 text-muted">Total Connects</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bb bl0 bt0 p-1">
                <div className="d-flex align-items-center">
                  <i className="fas fa-phone-alt fa-2x text-success ml-2"></i>
                  <div className="ml-auto">
                    <div className="card-body text-right pr-1">
                      <h4 className="mt-0">{callPositive}</h4>
                      <p className="mb-0 text-muted">Positive Connects</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-1">
                <div className="d-flex align-items-center">
                  <i className="fas fas fa-dot-circle fa-2x ml-2 text-warning"></i>
                  <div className="ml-auto">
                    <div className="card-body text-right pr-1">
                      <h4 className="mt-0">{callBadData}</h4>
                      <p className="mb-0 text-muted">Bad Data</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* if not a manager user */}
      {!isManagerUser && (
        <Col xl={5}>
          <p className="text-muted text-bold">
            {fetchOverallStatsLoadingCurrent ||
            activityInfoLoading ||
            callWeekLoading ||
            callDayLoading ? (
              <i className="fa fa-spinner fa-spin mr-2 text-success"></i>
            ) : (
              <i className="fas fa-phone-alt text-success mr-2"></i>
            )}
            CALL METRICS
          </p>
          <Card
            className="card-default text-center text-center mb-0"
            style={{ height: '100px' }}
          >
            <CardBody>
              <Row>
                <Col
                  lg={3}
                  sm={3}
                  md={3}
                  className="pr-0 align-self-center text-right text-nowrap"
                >
                  Positive Connect
                </Col>
                <Col lg={7} sm={7} md={7} className="pr-0 align-self-center">
                  <Progress
                    className="bg-gray progress progress-xs"
                    color="success"
                    value={callPositivePercent}
                  />
                </Col>
                <Col lg={1} sm={1} md={1} className="px-0 align-self-center">
                  {Math.round(callPositivePercent)}%
                </Col>
              </Row>
              <Row>
                <Col
                  lg={3}
                  sm={3}
                  md={3}
                  className="pr-0 align-self-center text-right"
                >
                  Others
                </Col>
                <Col lg={7} sm={7} md={7} className="pr-0 align-self-center">
                  <Progress
                    className="bg-gray progress progress-xs"
                    color="info"
                    value={callOthersPercent}
                  />
                </Col>
                <Col lg={1} sm={1} md={1} className="px-0 align-self-center">
                  {Math.round(callOthersPercent)}%
                </Col>
              </Row>
              <Row>
                <Col
                  lg={3}
                  sm={3}
                  md={3}
                  className="pr-0 align-self-center text-right"
                >
                  Bad data
                </Col>
                <Col lg={7} sm={7} md={7} className="pr-0 align-self-center">
                  <Progress
                    className="bg-gray progress progress-xs"
                    color="warning"
                    value={callBadDataPercent}
                  />
                </Col>
                <Col lg={1} sm={1} md={1} className="px-0 align-self-center">
                  {Math.round(callBadDataPercent)}%
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      )}
    </>
  );
};

export default CallMetrics;
