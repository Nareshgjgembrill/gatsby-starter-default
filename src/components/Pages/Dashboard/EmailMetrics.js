/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { ButtonGroup, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { default as Button } from '../../Common/Button';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const EmailMetrics = ({
  isManagerUser,
  fetchOverallStatsDataCurrent,
  fetchOverallStatsLoadingCurrent,
  fetchOverallStatsErrorCurrent,
  activityInfo,
  activityInfoLoading,
  activityInfoError,
  emailDataType,
  setEmailDataType,
  emailUserFiltered,
  emailUserBeforeFilter,
  emailDayData,
  emailDayFiltered,
  emailDayLoading,
  emailWeekData,
  emailWeekFiltered,
  emailWeekLoading,
  sendDashboardParams,
  dateRange,
  dateValidation,
  selectedUsersCountValidation,
  fetchEmailDayData,
  fetchEmailWeekData,
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
      {isManagerUser && (
        <Row>
          <Col xl={3} className="h-100">
            {/* START card */}
            <Card className="card-default mb-0 h-100">
              <p className="pt-1 mb-1 mt-1 align-items-center align-self-center text-bold text-nowrap">
                <i
                  className={`mr-2 text-primary ${
                    fetchOverallStatsLoadingCurrent ||
                    activityInfoLoading ||
                    emailWeekLoading ||
                    emailDayLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'fa fa-envelope'
                  }`}
                ></i>
                EMAIL METRICS
              </p>

              <div className="d-flex">
                <div className="w-50 bb br p-2">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-share fa-2x text-green ml-1"></i>
                    <div className="ml-2">
                      <div className="card-body px-0">
                        <h6 className="mt-0 text-bold">
                          {(!fetchOverallStatsErrorCurrent &&
                            !fetchOverallStatsLoadingCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            fetchOverallStatsDataCurrent.stats.data[0].sent) ||
                            0}
                        </h6>
                        <p className="mb-0 text-muted">Sent</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-50 bb p-2">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-envelope-open fa-2x text-primary ml-1"></i>
                    <div className="ml-2">
                      <div className="card-body px-0">
                        {/* displaying stat */}
                        <h6 className="mt-0 text-bold">
                          {(!fetchOverallStatsErrorCurrent &&
                            !fetchOverallStatsLoadingCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            fetchOverallStatsDataCurrent.stats.data[0]
                              .opened) ||
                            0}{' '}
                          {/* displaying percentage */}
                          {!fetchOverallStatsLoadingCurrent &&
                            !fetchOverallStatsErrorCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            parseInt(
                              fetchOverallStatsDataCurrent?.stats?.data[0]
                                ?.opened
                            ) /
                              parseInt(
                                fetchOverallStatsDataCurrent?.stats?.data[0]
                                  ?.sent
                              ) >
                              0 && (
                              <sup className="text-warning">
                                {(
                                  (parseInt(
                                    fetchOverallStatsDataCurrent?.stats?.data[0]
                                      ?.opened
                                  ) /
                                    parseInt(
                                      fetchOverallStatsDataCurrent?.stats
                                        ?.data[0]?.sent
                                    )) *
                                  100
                                ).toFixed(0)}
                                %
                              </sup>
                            )}
                        </h6>
                        <p className="mb-0 text-muted">Opened</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex">
                <div className="w-50 ba bl0 bt0 p-2">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-thumbs-up fa-2x text-info ml-1"></i>
                    <div className="ml-2">
                      <div className="card-body px-0">
                        {/* displaying stat */}
                        <h6 className="mt-0 text-bold">
                          {(!fetchOverallStatsErrorCurrent &&
                            !fetchOverallStatsLoadingCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            fetchOverallStatsDataCurrent.stats.data[0]
                              .clicked) ||
                            0}{' '}
                          {/* displaying percentage */}
                          {!fetchOverallStatsLoadingCurrent &&
                            !fetchOverallStatsErrorCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            parseInt(
                              fetchOverallStatsDataCurrent?.stats?.data[0]
                                ?.clicked
                            ) /
                              parseInt(
                                fetchOverallStatsDataCurrent?.stats?.data[0]
                                  ?.sent
                              ) >
                              0 && (
                              <sup className="text-warning">
                                {(
                                  (parseInt(
                                    fetchOverallStatsDataCurrent?.stats?.data[0]
                                      ?.clicked
                                  ) /
                                    parseInt(
                                      fetchOverallStatsDataCurrent?.stats
                                        ?.data[0]?.sent
                                    )) *
                                  100
                                ).toFixed(0)}
                                %
                              </sup>
                            )}
                        </h6>
                        <p className="mb-0 text-muted">Clicked</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-50 bb p-2">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-reply-all fa-2x text-green ml-1"></i>
                    <div className="ml-2">
                      <div className="card-body px-0">
                        {/* displaying stat */}
                        <h6 className="mt-0 text-bold">
                          {(!fetchOverallStatsErrorCurrent &&
                            !fetchOverallStatsLoadingCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            fetchOverallStatsDataCurrent.stats.data[0]
                              .replied) ||
                            0}{' '}
                          {/* displaying percentage */}
                          {!fetchOverallStatsLoadingCurrent &&
                            !fetchOverallStatsErrorCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            parseInt(
                              fetchOverallStatsDataCurrent?.stats?.data[0]
                                ?.replied
                            ) /
                              parseInt(
                                fetchOverallStatsDataCurrent?.stats?.data[0]
                                  ?.sent
                              ) >
                              0 && (
                              <sup className="text-warning">
                                {(
                                  (parseInt(
                                    fetchOverallStatsDataCurrent?.stats?.data[0]
                                      ?.replied
                                  ) /
                                    parseInt(
                                      fetchOverallStatsDataCurrent?.stats
                                        ?.data[0]?.sent
                                    )) *
                                  100
                                ).toFixed(0)}
                                %
                              </sup>
                            )}
                        </h6>
                        <p className="mb-0 text-muted">Replied</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex">
                <div className="w-50 br p-2">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-info-circle fa-2x ml-1 text-warning"></i>
                    <div className="ml-2">
                      <div className="card-body px-0">
                        {/* displaying stat */}
                        <h6 className="mt-0 text-bold">
                          {(!fetchOverallStatsErrorCurrent &&
                            !fetchOverallStatsLoadingCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            fetchOverallStatsDataCurrent.stats.data[0]
                              .bounced) ||
                            0}{' '}
                          {/* displaying percentage */}
                          {!fetchOverallStatsLoadingCurrent &&
                            !fetchOverallStatsErrorCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            parseInt(
                              fetchOverallStatsDataCurrent?.stats?.data[0]
                                ?.bounced
                            ) /
                              parseInt(
                                fetchOverallStatsDataCurrent?.stats?.data[0]
                                  ?.sent
                              ) >
                              0 && (
                              <sup className="text-warning">
                                {(
                                  (parseInt(
                                    fetchOverallStatsDataCurrent?.stats?.data[0]
                                      ?.bounced
                                  ) /
                                    parseInt(
                                      fetchOverallStatsDataCurrent?.stats
                                        ?.data[0]?.sent
                                    )) *
                                  100
                                ).toFixed(0)}
                                %
                              </sup>
                            )}
                        </h6>
                        <p className="mb-0 text-muted">Bounced</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-50  p-2">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-exclamation-triangle fa-2x text-danger ml-1"></i>
                    <div className="ml-2">
                      <div className="card-body px-0">
                        {/* displaying stat */}
                        <h6 className="mt-0 text-bold">
                          {(!fetchOverallStatsErrorCurrent &&
                            !fetchOverallStatsLoadingCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            fetchOverallStatsDataCurrent.stats.data[0]
                              .failed) ||
                            0}{' '}
                          {/* displaying percentage */}
                          {!fetchOverallStatsLoadingCurrent &&
                            !fetchOverallStatsErrorCurrent &&
                            fetchOverallStatsDataCurrent?.stats?.data &&
                            parseInt(
                              fetchOverallStatsDataCurrent?.stats?.data[0]
                                ?.failed
                            ) /
                              parseInt(
                                fetchOverallStatsDataCurrent?.stats?.data[0]
                                  ?.sent
                              ) >
                              0 && (
                              <sup className="text-warning">
                                {(
                                  (parseInt(
                                    fetchOverallStatsDataCurrent?.stats?.data[0]
                                      ?.failed
                                  ) /
                                    parseInt(
                                      fetchOverallStatsDataCurrent?.stats
                                        ?.data[0]?.sent
                                    )) *
                                  100
                                ).toFixed(0)}
                                %
                              </sup>
                            )}
                        </h6>
                        <p className="mb-0 text-muted">Failed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xl={9}>
            <Card className="card-default text-center h-100 text-center mb-0">
              <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-between">
                <p style={customWidth}></p>
                <p className="pt-1 mb-0 align-items-center align-self-center text-bold text-nowrap">
                  <i
                    className={`mr-2 text-primary ${
                      fetchOverallStatsLoadingCurrent ||
                      activityInfoLoading ||
                      emailWeekLoading ||
                      emailDayLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'fa fa-envelope'
                    }`}
                  ></i>
                  EMAIL METRICS
                </p>

                <ButtonGroup>
                  {['Current Quarter', 'Last Quarter', 'custom'].indexOf(
                    dateRange
                  ) === -1 && (
                    <Button
                      className={`${
                        emailDataType === 'user'
                          ? 'bg-color-primary-shade text-white text-bold'
                          : 'text-dark text-bold'
                      }`}
                      onClick={(e) => {
                        setEmailDataType('user');
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
                          emailDataType === 'day'
                            ? 'bg-color-primary-shade text-white text-bold'
                            : 'text-dark text-bold'
                        }`}
                        active={emailDataType === 'day'}
                        onClick={(e) => {
                          fetchEmailDayData();
                          setEmailDataType('day');
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
                          emailDataType === 'week'
                            ? 'bg-color-primary-shade text-white text-bold'
                            : 'text-dark text-bold'
                        }`}
                        onClick={(e) => {
                          fetchEmailWeekData();
                          setEmailDataType('week');
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
                  (emailDataType === 'user' &&
                    emailUserFiltered &&
                    emailUserBeforeFilter &&
                    emailUserFiltered.length > 0 &&
                    activityInfo.emailUser.data !== null &&
                    emailUserBeforeFilter.length > 0 && (
                      <Chart
                        type="Bar"
                        data={emailUserBeforeFilter}
                        colors={
                          (graphColorFormat === 'multicolor' && graphColor) || [
                            '#0c98c9',
                            '#2FBDEF',
                            '#6dd7fc',
                            '#c0edfc',
                          ]
                        }
                        tickValues={5}
                        enableGridY={false}
                        theme={theme}
                        innerPadding={2}
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
                        padding={
                          (emailUserBeforeFilter.length === 1 && 0.71) ||
                          (emailUserBeforeFilter.length === 2 && 0.54) ||
                          (emailUserBeforeFilter.length === 3 && 0.37) ||
                          (emailUserBeforeFilter.length === 4 && 0.26) ||
                          (emailUserBeforeFilter.length === 5 && 0.18) ||
                          (emailUserBeforeFilter.length === 6 && 0.13) ||
                          (emailUserBeforeFilter.length > 7 && 0.1)
                        }
                        tooltip={tooltipFormat2}
                        enableLabel={true}
                        labelFormat={labelFormat}
                        groupMode="grouped"
                        margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                        legends={[
                          {
                            dataFrom: 'keys',
                            anchor: 'bottom-left',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 48,
                            itemsSpacing: 0,
                            itemWidth: 65,
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
                  (emailDataType === 'week' &&
                    emailWeekData &&
                    emailWeekFiltered &&
                    emailWeekFiltered.length > 0 && (
                      <Chart
                        type="Bar"
                        data={emailWeekFiltered}
                        colors={
                          (graphColorFormat === 'multicolor' && graphColor) || [
                            '#0c98c9',
                            '#2FBDEF',
                            '#6dd7fc',
                            '#c0edfc',
                          ]
                        }
                        tickValues={5}
                        enableGridY={false}
                        theme={theme}
                        padding={
                          (emailWeekFiltered.length === 1 && 0.71) ||
                          (emailWeekFiltered.length === 2 && 0.54) ||
                          (emailWeekFiltered.length === 3 && 0.37) ||
                          (emailWeekFiltered.length === 4 && 0.26) ||
                          (emailWeekFiltered.length === 5 && 0.18) ||
                          (emailWeekFiltered.length === 6 && 0.13) ||
                          (emailWeekFiltered.length > 7 && 0.1)
                        }
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
                        groupMode="grouped"
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
                            itemWidth: 65,
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
                  (emailDataType === 'day' &&
                    emailDayData &&
                    emailDayFiltered &&
                    emailDayFiltered.length > 0 && (
                      <Chart
                        type="Bar"
                        data={emailDayFiltered}
                        colors={
                          (graphColorFormat === 'multicolor' && graphColor) || [
                            '#0c98c9',
                            '#2FBDEF',
                            '#6dd7fc',
                            '#c0edfc',
                          ]
                        }
                        tickValues={5}
                        enableGridY={false}
                        theme={theme}
                        padding={
                          (emailDayFiltered.length === 1 && 0.71) ||
                          (emailDayFiltered.length === 2 && 0.54) ||
                          (emailDayFiltered.length === 3 && 0.37) ||
                          (emailDayFiltered.length === 4 && 0.26) ||
                          (emailDayFiltered.length === 5 && 0.18) ||
                          (emailDayFiltered.length === 6 && 0.13) ||
                          (emailDayFiltered.length > 7 && 0.1)
                        }
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
                        groupMode="grouped"
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
                            itemWidth: 65,
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
                  (emailDataType === 'user' &&
                    !activityInfoLoading &&
                    (!emailUserFiltered || emailUserFiltered?.length === 0) && (
                      <div className="m-auto">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (emailDataType === 'week' &&
                    !emailWeekLoading &&
                    (!emailWeekFiltered || emailWeekFiltered?.length === 0) && (
                      <div className="m-auto">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (emailDataType === 'day' &&
                    !emailDayLoading &&
                    (!emailDayFiltered || emailDayFiltered?.length === 0) && (
                      <div className="m-auto">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (emailDataType === 'user' && activityInfoLoading && (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                      </div>
                    </div>
                  )) ||
                  (emailDataType === 'week' && emailWeekLoading && (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                      </div>
                    </div>
                  )) ||
                  (emailDataType === 'day' && emailDayLoading && (
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
                ((emailUserFiltered &&
                  emailUserFiltered.length > 0 &&
                  emailDataType === 'user') ||
                  (emailWeekFiltered &&
                    emailWeekFiltered.length > 0 &&
                    emailDataType === 'week') ||
                  (emailDayFiltered &&
                    emailDayFiltered.length > 0 &&
                    emailDataType === 'day')) && (
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
        </Row>
      )}
      {!isManagerUser && (
        <Col xl={7}>
          <p className="text-muted text-bold text-nowrap">
            <i
              className={`mr-2 text-primary ${
                fetchOverallStatsLoadingCurrent ||
                activityInfoLoading ||
                emailWeekLoading ||
                emailDayLoading
                  ? 'fa fa-spinner fa-spin'
                  : 'fa fa-envelope'
              }`}
            ></i>
            EMAIL METRICS
          </p>
          <Card className="card-default mb-0">
            <div className="d-flex ">
              <div className="w-50 br p-2">
                <div className="d-flex align-items-center">
                  <i className="fas fa-share fa-lg text-green ml-2"></i>
                  <div className="ml-2">
                    <div className="card-body text-right">
                      <h4 className="mt-0">
                        {(!fetchOverallStatsErrorCurrent &&
                          !fetchOverallStatsLoadingCurrent &&
                          fetchOverallStatsDataCurrent?.stats?.data &&
                          fetchOverallStatsDataCurrent.stats.data[0].sent) ||
                          0}
                      </h4>
                      <p className="mb-0 text-muted">Sent</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-50 br p-2">
                <div className="d-flex align-items-center">
                  <i className="fas fa-envelope-open fa-lg text-primary ml-2"></i>
                  <div className="ml-2">
                    <div className="card-body text-right">
                      <h4 className="mt-0">
                        {(!fetchOverallStatsErrorCurrent &&
                          !fetchOverallStatsLoadingCurrent &&
                          fetchOverallStatsDataCurrent?.stats?.data &&
                          fetchOverallStatsDataCurrent.stats.data[0].opened) ||
                          0}
                      </h4>
                      <p className="mb-0 text-muted">Opened</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-50 br p-2">
                <div className="d-flex align-items-center">
                  <i className="fas fa-thumbs-up fa-lg text-info ml-2"></i>
                  <div className="ml-2">
                    <div className="card-body text-right">
                      <h4 className="mt-0">
                        {(!fetchOverallStatsErrorCurrent &&
                          !fetchOverallStatsLoadingCurrent &&
                          fetchOverallStatsDataCurrent?.stats?.data &&
                          fetchOverallStatsDataCurrent.stats.data[0].clicked) ||
                          0}
                      </h4>
                      <p className="mb-0 text-muted">Clicked</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-50 br p-2">
                <div className="d-flex align-items-center">
                  <i className="fas fa-reply-all fa-lg text-green ml-2"></i>
                  <div className="ml-2">
                    <div className="card-body text-right">
                      <h4 className="mt-0">
                        {(!fetchOverallStatsErrorCurrent &&
                          !fetchOverallStatsLoadingCurrent &&
                          fetchOverallStatsDataCurrent?.stats?.data &&
                          fetchOverallStatsDataCurrent.stats.data[0].replied) ||
                          0}
                      </h4>
                      <p className="mb-0 text-muted">Replied</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-50 p-2">
                <div className="d-flex align-items-center">
                  <i className="fas fa-info-circle fa-lg ml-2 text-warning"></i>
                  <div className="ml-2">
                    <div className="card-body text-right">
                      <h4 className="mt-0">
                        {(!fetchOverallStatsErrorCurrent &&
                          !fetchOverallStatsLoadingCurrent &&
                          fetchOverallStatsDataCurrent?.stats?.data &&
                          fetchOverallStatsDataCurrent.stats.data[0].bounced) ||
                          0}
                      </h4>
                      <p className="mb-0 text-muted">Bounced</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      )}
    </>
  );
};

export default EmailMetrics;
