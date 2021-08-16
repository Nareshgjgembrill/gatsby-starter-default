/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const CadenceAnalytics = ({
  isManagerUser,
  cadenceFiltered,
  activityInfo,
  activityInfoLoading,
  activityInfoError,
  dateRange,
  graphColorFormat,
  graphColor,
  theme,
  tooltip,
  isSelectedAll,
  totalLabelsClosure,
}) => {
  return (
    <>
      {/* if a manager user */}
      {isManagerUser && (
        <Col lg={6} md={12}>
          <Card className="card-default">
            <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-center">
              <p className="pt-1 mb-1 mt-1 align-items-center align-self-center text-bold text-nowrap">
                <i
                  className={`mr-2 text-danger ${
                    activityInfoLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'svgicon koncert-cadence-icon'
                  }`}
                ></i>
                CADENCE ANALYTICS
              </p>
            </CardHeader>
            <CardBody className="d-flex pb-0" style={{ height: '300px' }}>
              {(activityInfoError && (
                <div className="m-auto text-center">
                  <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                  <p>{FAILED_TO_FETCH_DATA}</p>
                </div>
              )) ||
                (activityInfo &&
                  cadenceFiltered?.length > 0 &&
                  activityInfo?.cadence?.data?.length > 0 && (
                    <Chart
                      type="Bar"
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#9fed64',
                          '#83ddfc',
                          '#FBAB44',
                          '#f5bf49',
                        ]
                      }
                      padding={
                        (activityInfo.cadence.data.length === 1 && 0.88) ||
                        (activityInfo.cadence.data.length === 2 && 0.82) ||
                        (activityInfo.cadence.data.length === 3 && 0.74) ||
                        (activityInfo.cadence.data.length === 4 && 0.67) ||
                        (activityInfo.cadence.data.length === 5 && 0.59) ||
                        (activityInfo.cadence.data.length === 6 && 0.51) ||
                        (activityInfo.cadence.data.length === 7 && 0.44) ||
                        (activityInfo.cadence.data.length === 8 && 0.32) ||
                        (activityInfo.cadence.data.length === 9 && 0.29) ||
                        (activityInfo.cadence.data.length === 10 && 0.2)
                      }
                      tickValues={5}
                      enableGridY={false}
                      theme={theme}
                      tooltip={tooltip}
                      enableLabel={false}
                      layers={[
                        'grid',
                        'axes',
                        'bars',
                        totalLabelsClosure('Name'),
                        'markers',
                        'legends',
                      ]}
                      data={cadenceFiltered}
                      groupMode="stacked"
                      margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                      axisBottomLegend={{
                        format: (label) =>
                          (label.length > 13 &&
                            `${label}`.substring(0, 11) + '...') ||
                          label,
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
                (!activityInfoLoading &&
                  (!cadenceFiltered || cadenceFiltered?.length === 0) && (
                    <div className="m-auto align-self-center text-center">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (activityInfoLoading && (
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
              cadenceFiltered?.length > 0 && (
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

      {/* if not a manager user */}
      {!isManagerUser && (
        <Row>
          <Col lg={12} md={12}>
            <Card className="card-default">
              <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-center">
                <p className="pt-1 mb-1 mt-1 align-items-center align-self-center text-bold text-nowrap">
                  <i
                    className={`mr-2 text-danger ${
                      activityInfoLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'svgicon koncert-cadence-icon'
                    }`}
                  ></i>
                  CADENCE ANALYTICS
                </p>
              </CardHeader>
              <CardBody className="d-flex pb-0" style={{ height: '300px' }}>
                {(activityInfoError && (
                  <div className="m-auto text-center">
                    <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                    <p>{FAILED_TO_FETCH_DATA}</p>
                  </div>
                )) ||
                  (cadenceFiltered?.length > 0 &&
                    activityInfo?.cadence?.data?.length > 0 && (
                      <Chart
                        type="Bar"
                        colors={
                          (graphColorFormat === 'multicolor' && graphColor) || [
                            '#9fed64',
                            '#83ddfc',
                            '#FBAB44',
                            '#f5bf49',
                          ]
                        }
                        padding={
                          (activityInfo.cadence.data.length === 1 && 0.93) ||
                          (activityInfo.cadence.data.length === 2 && 0.89) ||
                          (activityInfo.cadence.data.length === 3 && 0.865) ||
                          (activityInfo.cadence.data.length === 4 && 0.815) ||
                          (activityInfo.cadence.data.length === 5 && 0.78) ||
                          (activityInfo.cadence.data.length === 6 && 0.73) ||
                          (activityInfo.cadence.data.length === 7 && 0.7) ||
                          (activityInfo.cadence.data.length === 8 && 0.66) ||
                          (activityInfo.cadence.data.length === 9 && 0.63) ||
                          (activityInfo.cadence.data.length === 10 && 0.59)
                        }
                        tickValues={5}
                        enableGridY={false}
                        theme={theme}
                        tooltip={tooltip}
                        enableLabel={false}
                        layers={[
                          'grid',
                          'axes',
                          'bars',
                          totalLabelsClosure('Name'),
                          'markers',
                          'legends',
                        ]}
                        data={cadenceFiltered}
                        groupMode="stacked"
                        margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                        axisBottomLegend={{
                          format: (label) =>
                            (label.length > 13 &&
                              `${label}`.substring(0, 11) + '...') ||
                            label,
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
                  (!activityInfoLoading &&
                    (!activityInfo ||
                      activityInfo?.cadence?.data?.length === 0) && (
                      <div className="m-auto align-self-center text-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (activityInfoLoading && (
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
                cadenceFiltered?.length > 0 && (
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
                    {dateRange}
                  </p>
                )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default CadenceAnalytics;
