/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
} from 'reactstrap';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const ProspectsAttempted = ({
  isManagerUser,
  prospDataType,
  setProspDataType,
  prospUserFiltered,
  prospUserBeforeFilter,
  fetchProspDayData,
  prospDayLoading,
  prospDayData,
  prospDayFiltered,
  fetchProspWeekData,
  prospWeekLoading,
  prospWeekData,
  prospWeekFiltered,
  activityInfo,
  activityInfoLoading,
  activityInfoError,
  sendDashboardParams,
  dateValidation,
  selectedUsersCountValidation,
  dateRange,
  graphColorFormat,
  graphColor,
  theme,
  tooltipFormat1,
  tooltipFormat2,
  tooltipFormat3,
  isSelectedAll,
  totalLabelsClosure,
  customWidth,
}) => {
  return (
    <>
      {/* if a manager user */}
      {isManagerUser && (
        <Col lg={6} md={12}>
          <Card className="card-default">
            <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-between">
              <p style={customWidth}></p>
              <p className="pt-1 mb-0 align-items-center align-self-center text-bold text-nowrap">
                <i
                  className={`mr-2 text-info ${
                    activityInfoLoading || prospWeekLoading || prospDayLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'fas fa-user'
                  }`}
                ></i>
                PROSPECTS ATTEMPTED
              </p>
              <ButtonGroup>
                {['Current Quarter', 'Last Quarter', 'custom'].indexOf(
                  dateRange
                ) === -1 && (
                  <Button
                    className={`${
                      prospDataType === 'user'
                        ? 'bg-color-primary-shade text-white text-bold'
                        : 'text-dark text-bold'
                    }`}
                    onClick={(e) => {
                      setProspDataType('user');
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
                        prospDataType === 'day'
                          ? 'bg-color-primary-shade text-white text-bold'
                          : 'text-dark text-bold'
                      }`}
                      onClick={(e) => {
                        fetchProspDayData();
                        setProspDataType('day');
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
                        prospDataType === 'week'
                          ? 'bg-color-primary-shade text-white text-bold'
                          : 'text-dark text-bold'
                      }`}
                      onClick={(e) => {
                        fetchProspWeekData();
                        setProspDataType('week');
                        sendDashboardParams();
                      }}
                    >
                      Week
                    </Button>
                  )}
              </ButtonGroup>
            </CardHeader>
            <CardBody className="d-flex pb-0" style={{ height: '300px' }}>
              {(activityInfoError && (
                <div className="m-auto text-center">
                  <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                  <p>{FAILED_TO_FETCH_DATA}</p>
                </div>
              )) ||
                (prospDataType === 'user' &&
                  activityInfo &&
                  prospUserFiltered &&
                  prospUserFiltered.length > 0 &&
                  activityInfo.prospUser.data &&
                  activityInfo.prospUser.data.length > 0 && (
                    <Chart
                      type="Bar"
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#83ddfc',
                          '#9fed64',
                          '#FBAB44',
                          '#f5bf49',
                        ]
                      }
                      padding={
                        (prospUserBeforeFilter.length === 1 && 0.87) ||
                        (prospUserBeforeFilter.length === 2 && 0.81) ||
                        (prospUserBeforeFilter.length === 3 && 0.73) ||
                        (prospUserBeforeFilter.length === 4 && 0.66) ||
                        (prospUserBeforeFilter.length === 5 && 0.58) ||
                        (prospUserBeforeFilter.length === 6 && 0.5) ||
                        (prospUserBeforeFilter.length === 7 && 0.43) ||
                        (prospUserBeforeFilter.length === 8 && 0.35) ||
                        (prospUserBeforeFilter.length === 9 && 0.28) ||
                        (prospUserBeforeFilter.length === 10 && 0.2)
                      }
                      tickValues={5}
                      valueScale={{ type: 'linear' }}
                      enableGridY={false}
                      theme={theme}
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
                      groupMode="stacked"
                      data={prospUserBeforeFilter}
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
                      enableLabel={false}
                      layers={[
                        'grid',
                        'axes',
                        'bars',
                        totalLabelsClosure('Name'),
                        'markers',
                        'legends',
                      ]}
                    />
                  )) ||
                (prospDataType === 'week' &&
                  prospWeekData &&
                  prospWeekFiltered &&
                  prospWeekFiltered.length > 0 && (
                    <Chart
                      type="Bar"
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#83ddfc',
                          '#9fed64',
                          '#FBAB44',
                          '#f5bf49',
                        ]
                      }
                      padding={
                        (prospWeekFiltered.length === 1 && 0.87) ||
                        (prospWeekFiltered.length === 2 && 0.81) ||
                        (prospWeekFiltered.length === 3 && 0.73) ||
                        (prospWeekFiltered.length === 4 && 0.66) ||
                        (prospWeekFiltered.length === 5 && 0.58) ||
                        (prospWeekFiltered.length === 6 && 0.5) ||
                        (prospWeekFiltered.length === 7 && 0.43) ||
                        (prospWeekFiltered.length === 8 && 0.35) ||
                        (prospWeekFiltered.length === 9 && 0.28) ||
                        (prospWeekFiltered.length === 10 && 0.2)
                      }
                      tickValues={5}
                      enableGridY={false}
                      theme={theme}
                      tooltip={tooltipFormat3}
                      groupMode="stacked"
                      enableLabel={false}
                      data={prospWeekFiltered}
                      margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                      axisBottomLegend={{
                        tickSize: 5,
                        tickPadding: 5,
                        legend: '',
                        tickRotation: 0,
                        legendPosition: 'middle',
                        legendOffset: 32,
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
                      layers={[
                        'grid',
                        'axes',
                        'bars',
                        totalLabelsClosure('Week'),
                        'markers',
                        'legends',
                      ]}
                    />
                  )) ||
                (prospDataType === 'day' &&
                  prospDayData &&
                  prospDayFiltered &&
                  prospDayFiltered.length > 0 && (
                    <Chart
                      type="Bar"
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#83ddfc',
                          '#9fed64',
                          '#FBAB44',
                          '#f5bf49',
                        ]
                      }
                      padding={
                        (prospDayFiltered.length === 1 && 0.87) ||
                        (prospDayFiltered.length === 2 && 0.81) ||
                        (prospDayFiltered.length === 3 && 0.73) ||
                        (prospDayFiltered.length === 4 && 0.66) ||
                        (prospDayFiltered.length === 5 && 0.58) ||
                        (prospDayFiltered.length === 6 && 0.5) ||
                        (prospDayFiltered.length === 7 && 0.43) ||
                        (prospDayFiltered.length === 8 && 0.35) ||
                        (prospDayFiltered.length === 9 && 0.28) ||
                        (prospDayFiltered.length === 10 && 0.2)
                      }
                      tickValues={5}
                      enableGridY={false}
                      theme={theme}
                      tooltip={tooltipFormat1}
                      enableLabel={false}
                      layers={[
                        'grid',
                        'axes',
                        'bars',
                        totalLabelsClosure('Day'),
                        'markers',
                        'legends',
                      ]}
                      data={prospDayFiltered}
                      margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                      axisBottomLegend={{
                        tickSize: 5,
                        tickPadding: 5,
                        legend: '',
                        tickRotation: 0,
                        legendPosition: 'middle',
                        legendOffset: 32,
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
                (prospDataType === 'user' &&
                  !activityInfoLoading &&
                  (!prospUserFiltered || prospUserFiltered?.length === 0) && (
                    <div className="ml-auto mr-auto text-center align-self-center">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (prospDataType === 'day' &&
                  !prospDayLoading &&
                  (!prospWeekFiltered || prospWeekFiltered?.length === 0) && (
                    <div className="ml-auto mr-auto text-center align-self-center">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (prospDataType === 'week' &&
                  !prospWeekLoading &&
                  (!prospWeekFiltered || prospWeekFiltered?.length === 0) && (
                    <div className="ml-auto mr-auto text-center align-self-center">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (prospDataType === 'user' && activityInfoLoading && (
                  <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </div>
                  </div>
                )) ||
                (prospDataType === 'day' && prospDayLoading && (
                  <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </div>
                  </div>
                )) ||
                (prospDataType === 'week' && prospWeekLoading && (
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
              ((prospUserFiltered &&
                prospUserFiltered.length > 0 &&
                prospDataType === 'user') ||
                (prospWeekFiltered &&
                  prospWeekFiltered.length > 0 &&
                  prospDataType === 'week') ||
                (prospDayFiltered &&
                  prospDayFiltered.length > 0 &&
                  prospDataType === 'day')) && (
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
      )}
    </>
  );
};

export default ProspectsAttempted;
