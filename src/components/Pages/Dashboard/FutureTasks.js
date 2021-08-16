/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const FutureTasks = ({
  isManagerUser,
  user,
  hasZipWhip,
  futureTaskData,
  futureDataFiltered,
  isFutureDataAllZero,
  futureTaskLoading,
  futureTaskError,
  futureWeekDates,
  totalEmailsFuture,
  totalCallFuture,
  totalSocialFuture,
  graphColorFormat,
  graphColor,
  theme,
  tooltipFormat1,
  tooltipFormat2,
  labelFormat,
}) => {
  return (
    <Row>
      <Col xl={10}>
        <Card className="card-default mb-0">
          <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-center">
            <p className="pt-1 mb-0 align-items-center align-self-center text-bold text-nowrap">
              <i
                className={`mr-2 text-success ${
                  futureTaskLoading
                    ? 'fa fa-spinner fa-spin'
                    : 'fa fa-file-alt text-muted'
                }`}
              ></i>
              FUTURE TASKS
            </p>
          </CardHeader>
          <CardBody className="d-flex pb-0" style={{ height: '300px' }}>
            {(futureTaskError && (
              <div className="m-auto text-center">
                <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                <p>{FAILED_TO_FETCH_DATA}</p>
              </div>
            )) ||
              (futureTaskData &&
                futureDataFiltered &&
                isFutureDataAllZero &&
                isFutureDataAllZero.length > 0 &&
                futureTaskData.activity.data &&
                futureTaskData.activity.data.length > 0 &&
                futureDataFiltered.length > 0 && (
                  <Chart
                    type="Bar"
                    colors={
                      (graphColorFormat === 'multicolor' && graphColor) || [
                        '#83ddfc',
                        '#9fed64',
                        '#FBAB44',
                        '#f5bf49',
                        '#fcdb92',
                      ]
                    }
                    padding={
                      (hasZipWhip &&
                        user &&
                        user.zipwhipSessionKey &&
                        futureDataFiltered &&
                        ((futureDataFiltered.length === 1 && 0.63) ||
                          (futureDataFiltered.length === 2 && 0.51) ||
                          (futureDataFiltered.length === 3 && 0.39) ||
                          (futureDataFiltered.length === 4 && 0.27) ||
                          (futureDataFiltered.length === 5 && 0.16) ||
                          (futureDataFiltered.length === 6 && 0.05) ||
                          (futureDataFiltered.length > 6 && 0.1))) ||
                      ((!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
                        futureDataFiltered &&
                        ((futureDataFiltered.length === 1 && 0.69) ||
                          (futureDataFiltered.length === 2 && 0.57) ||
                          (futureDataFiltered.length === 3 && 0.45) ||
                          (futureDataFiltered.length === 4 && 0.33) ||
                          (futureDataFiltered.length === 5 && 0.22) ||
                          (futureDataFiltered.length === 6 && 0.11) ||
                          (futureDataFiltered.length > 6 && 0.1)))
                    }
                    tickValues={5}
                    enableGridY={false}
                    theme={theme}
                    tooltip={
                      (isManagerUser && tooltipFormat2) || tooltipFormat1
                    }
                    enableLabel={true}
                    labelFormat={labelFormat}
                    innerPadding={5}
                    data={futureDataFiltered}
                    groupMode="grouped"
                    margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                    axisBottomLegend={{
                      format: isManagerUser
                        ? (label) =>
                            (label.split(' ').length > 1 &&
                              label
                                .split(' ')[0]
                                .substring(0, 1)
                                .toUpperCase() +
                                label
                                  .split(' ')
                                  [label.split(' ').length - 1].substring(0, 1)
                                  .toUpperCase()) ||
                            label.split(' ')[0].substring(0, 1).toUpperCase()
                        : (label) => label,
                      tickSize: 5,
                      legend: '',
                      tickPadding: 5,
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
              (!futureTaskLoading &&
                (!futureTaskData ||
                  futureTaskData?.activity?.data?.length === 0) && (
                  <div className="m-auto align-self-center text-center">
                    <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                    <p>{NO_DATA_AVAILABLE}</p>
                  </div>
                )) ||
              (futureTaskLoading && (
                <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                  <div className="text-center">
                    <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                  </div>
                </div>
              ))}
          </CardBody>
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
            {isManagerUser ? 'All Users' : 'Me'} - {futureWeekDates[0]}-
            {futureWeekDates[4]}
          </p>
        </Card>
      </Col>
      <Col xl={2}>
        {/* START card */}
        <Card className="card-default mb-0 h-100">
          <p className="pt-1 mb-0 align-items-center align-self-center text-bold text-nowrap">
            <i
              className={`mr-2 text-success ${
                futureTaskLoading
                  ? 'fa fa-spinner fa-spin'
                  : 'fa fa-file-alt text-muted'
              }`}
            ></i>
            FUTURE TASKS
          </p>
          <div className="bb p-2 h-100">
            <div className="d-flex align-items-center">
              <i className="fa fa-envelope text-primary fa-2x text-info ml-4"></i>
              <div className="ml-auto">
                <div className="card-body text-right mr-2">
                  <h4 className="mt-0">{totalEmailsFuture}</h4>
                  <p className="mb-0 text-muted">Emails</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bb bl0 bt0 p-2 h-100">
            <div className="d-flex align-items-center">
              <i className="fas fa-phone-alt fa-2x text-success ml-4"></i>
              <div className="ml-auto">
                <div className="card-body text-right mr-2">
                  <h4 className="mt-0">{totalCallFuture}</h4>
                  <p className="mb-0 text-muted">Calls</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2 h-100">
            <div className="d-flex align-items-center">
              <i className="fas fa-users fa-2x ml-4 text-info"></i>
              <div className="ml-auto">
                <div className="card-body text-right mr-2">
                  <h4 className="mt-0">{totalSocialFuture}</h4>
                  <p className="mb-0 text-muted">Social</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default FutureTasks;
