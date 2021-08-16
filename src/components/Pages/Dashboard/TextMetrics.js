/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { ButtonGroup, Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { default as Button } from '../../Common/Button';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const TextMetrics = ({
  isManagerUser,
  user,
  hasZipWhip,
  fetchOverallStatsDataCurrent,
  fetchOverallStatsLoadingCurrent,
  fetchOverallStatsErrorCurrent,
  activityInfo,
  activityInfoLoading,
  activityInfoError,
  textDataType,
  setTextDataType,
  textUserFiltered,
  textUserBeforeFilter,
  textDayData,
  textDayFiltered,
  textDayLoading,
  textWeekData,
  textWeekFiltered,
  textWeekLoading,
  sendDashboardParams,
  dateRange,
  dateValidation,
  selectedUsersCountValidation,
  fetchTextDayData,
  fetchTextWeekData,
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
    isManagerUser &&
    hasZipWhip &&
    user &&
    user.zipwhipSessionKey && (
      <Row>
        <Col xl={2}>
          {/* START card */}
          <Card className="card-default h-100 mb-0">
            {isManagerUser && hasZipWhip && user && user.zipwhipSessionKey && (
              <p className="pt-1 pl-0 mb-1 mt-1 align-items-center align-self-center text-bold">
                <i
                  className={`mr-2 text-danger ${
                    fetchOverallStatsLoadingCurrent ||
                    activityInfoLoading ||
                    textWeekLoading ||
                    textDayLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'fas fa-comments'
                  }`}
                ></i>
                TEXTS
              </p>
            )}
            <div className="bb p-2 h-100 d-flex">
              <div className="d-flex w-100 justify-content-between align-items-center align-self-center">
                <i className="fas fa-share fa-2x text-green ml-4"></i>
                <CardBody className="text-right pr-2">
                  <h4 className="mt-0">
                    {(!fetchOverallStatsErrorCurrent &&
                      !fetchOverallStatsLoadingCurrent &&
                      fetchOverallStatsDataCurrent &&
                      fetchOverallStatsDataCurrent.stats.data[2].sent) ||
                      0}
                  </h4>
                  <p className="mb-0 text-muted">Sent</p>
                </CardBody>
              </div>
            </div>
            <div className="p-2 h-100 d-flex">
              <div className="d-flex w-100 justify-content-between align-items-center align-self-center">
                <i className="fas fa-reply fa-2x ml-4 text-info"></i>
                <CardBody className="text-right pr-2">
                  <h4 className="mt-0">
                    {(!fetchOverallStatsErrorCurrent &&
                      !fetchOverallStatsLoadingCurrent &&
                      fetchOverallStatsDataCurrent &&
                      fetchOverallStatsDataCurrent.stats.data[1].received) ||
                      0}
                  </h4>
                  <p className="mb-0 text-muted">Received</p>
                </CardBody>
              </div>
            </div>
          </Card>
        </Col>
        <Col xl={10}>
          <Card className="card-default text-center h-100">
            <CardHeader className="pb-0 bg-white d-flex justify-content-between">
              <p style={customWidth}></p>
              {isManagerUser && hasZipWhip && user && user.zipwhipSessionKey && (
                <p className="pt-1 pl-0 mb-1 mt-1 align-items-center align-self-center text-bold">
                  <i
                    className={`mr-2 text-danger ${
                      fetchOverallStatsLoadingCurrent ||
                      activityInfoLoading ||
                      textWeekLoading ||
                      textDayLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'fas fa-comments'
                    }`}
                  ></i>
                  TEXTS
                </p>
              )}
              {
                <ButtonGroup>
                  {['Current Quarter', 'Last Quarter', 'custom'].indexOf(
                    dateRange
                  ) === -1 && (
                    <Button
                      className={`${
                        textDataType === 'user'
                          ? 'bg-color-primary-shade text-white text-bold'
                          : 'text-dark text-bold'
                      }`}
                      onClick={(e) => {
                        setTextDataType('user');
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
                          textDataType === 'day'
                            ? 'bg-color-primary-shade text-white text-bold'
                            : 'text-dark text-bold'
                        }`}
                        onClick={(e) => {
                          fetchTextDayData();
                          setTextDataType('day');
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
                          textDataType === 'week'
                            ? 'bg-color-primary-shade text-white text-bold'
                            : 'text-dark text-bold'
                        }`}
                        onClick={(e) => {
                          fetchTextWeekData();
                          setTextDataType('week');
                          sendDashboardParams();
                        }}
                      >
                        Week
                      </Button>
                    )}
                </ButtonGroup>
              }
            </CardHeader>
            <CardBody className="d-flex pb-0" style={{ height: '200px' }}>
              {(activityInfoError && (
                <div className="m-auto">
                  <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                  <p>{FAILED_TO_FETCH_DATA}</p>
                </div>
              )) ||
                (textDataType === 'user' &&
                  activityInfo &&
                  textUserFiltered &&
                  textUserFiltered.length > 0 &&
                  activityInfo.textUser.data &&
                  activityInfo.textUser.data.length > 0 && (
                    <Chart
                      type="Bar"
                      data={textUserBeforeFilter}
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#f12828',
                          '#F15B28',
                          '#f18928',
                          '#f5bf49',
                        ]
                      }
                      tickValues={5}
                      enableGridY={false}
                      theme={theme}
                      padding={
                        (textUserBeforeFilter.length === 1 && 0.84) ||
                        (textUserBeforeFilter.length === 2 && 0.77) ||
                        (textUserBeforeFilter.length === 3 && 0.7) ||
                        (textUserBeforeFilter.length === 4 && 0.62) ||
                        (textUserBeforeFilter.length === 5 && 0.54) ||
                        (textUserBeforeFilter.length === 6 && 0.44) ||
                        (textUserBeforeFilter.length === 7 && 0.4) ||
                        (textUserBeforeFilter.length > 7 &&
                          textUserBeforeFilter.length <= 10 &&
                          0.3) ||
                        (textUserBeforeFilter.length > 10 && 0.1)
                      }
                      axisBottomLegend={{
                        format: (label) =>
                          (label.split(' ').length > 1 &&
                            label.split(' ')[0].substring(0, 1).toUpperCase() +
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
                          itemWidth: 60,
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
                (textDataType === 'week' &&
                  textWeekData &&
                  textWeekFiltered &&
                  textWeekFiltered.length > 0 && (
                    <Chart
                      type="Bar"
                      data={textWeekFiltered}
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#f12828',
                          '#F15B28',
                          '#f18928',
                          '#f5bf49',
                        ]
                      }
                      padding={
                        (textWeekFiltered.length === 1 && 0.85) ||
                        (textWeekFiltered.length === 2 && 0.78) ||
                        (textWeekFiltered.length === 3 && 0.71) ||
                        (textWeekFiltered.length === 4 && 0.63) ||
                        (textWeekFiltered.length === 5 && 0.55) ||
                        (textWeekFiltered.length === 6 && 0.45) ||
                        (textWeekFiltered.length === 7 && 0.4) ||
                        (textWeekFiltered.length > 7 &&
                          textWeekFiltered.length <= 10 &&
                          0.3) ||
                        (textWeekFiltered.length > 10 && 0.1)
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
                          itemWidth: 60,
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
                (textDataType === 'day' &&
                  textDayData &&
                  textDayFiltered &&
                  textDayFiltered.length > 0 && (
                    <Chart
                      type="Bar"
                      data={textDayFiltered}
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#f12828',
                          '#F15B28',
                          '#f18928',
                          '#f5bf49',
                        ]
                      }
                      padding={
                        (textDayFiltered.length === 1 && 0.85) ||
                        (textDayFiltered.length === 2 && 0.78) ||
                        (textDayFiltered.length === 3 && 0.71) ||
                        (textDayFiltered.length === 4 && 0.63) ||
                        (textDayFiltered.length === 5 && 0.55) ||
                        (textDayFiltered.length === 6 && 0.45) ||
                        (textDayFiltered.length === 7 && 0.4) ||
                        (textDayFiltered.length > 7 &&
                          textDayFiltered.length <= 10 &&
                          0.3) ||
                        (textDayFiltered.length > 10 && 0.1)
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
                          itemWidth: 60,
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
                (textDataType === 'user' &&
                  !activityInfoLoading &&
                  (!textUserFiltered || textUserFiltered?.length === 0) && (
                    <div className="m-auto">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (textDataType === 'day' &&
                  !textDayLoading &&
                  (!textDayFiltered || textDayFiltered?.length === 0) && (
                    <div className="m-auto">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (textDataType === 'week' &&
                  !textWeekLoading &&
                  (!textWeekFiltered || textWeekFiltered?.length === 0) && (
                    <div className="m-auto">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (textDataType === 'user' && activityInfoLoading && (
                  <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </div>
                  </div>
                )) ||
                (textDataType === 'day' && textDayLoading && (
                  <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </div>
                  </div>
                )) ||
                (textDataType === 'week' && textWeekLoading && (
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
              ((textUserFiltered &&
                textUserFiltered.length > 0 &&
                textDataType === 'user') ||
                (textWeekFiltered &&
                  textWeekFiltered.length > 0 &&
                  textDataType === 'week') ||
                (textDayFiltered &&
                  textDayFiltered.length > 0 &&
                  textDataType === 'day')) && (
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
    )
  );
};

export default TextMetrics;
