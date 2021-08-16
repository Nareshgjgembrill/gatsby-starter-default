/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Chart from '../../Common/Chart';
import { NO_DATA_AVAILABLE } from '../../../util/index';

const ActivityMetrics = ({
  isManagerUser,
  user,
  hasZipWhip,
  activityMetricsLoading,
  activityMetricsError,
  activityGraph,
  activityGraphData,
  activityGraphDataLinkedin,
  activityGraphDataEmail,
  activityGraphDataCall,
  activityGraphDataText,
  activityGraphDataOther,
  graphColorFormat,
  graphColorActivity1,
  graphColorActivity2,
  tooltip,
  labelFormat,
  theme,
}) => {
  return (
    <>
      {/* if not a manager user */}
      {!isManagerUser && (
        <Row>
          <Col>
            <Card className="card-default">
              <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-center">
                <p className="pt-1 mb-1 mt-1 align-items-center align-self-center text-bold">
                  <i
                    className={`mr-2 text-success ${
                      activityMetricsLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'far fa-chart-bar'
                    }`}
                  ></i>
                  ACTIVITY METRICS
                </p>
              </CardHeader>
              <CardBody className="d-flex pb-0" style={{ height: '300px' }}>
                {(activityGraph &&
                  activityGraphData[0] &&
                  (activityGraphDataLinkedin.length > 0 ||
                    activityGraphDataEmail.length > 0 ||
                    activityGraphDataCall.length > 0 ||
                    activityGraphDataText.length > 0 ||
                    activityGraphDataOther.length > 0) && (
                    <Chart
                      type="Line"
                      colors={
                        (graphColorFormat === 'multicolor' &&
                          hasZipWhip &&
                          user.zipwhipSessionKey &&
                          graphColorActivity1) ||
                        (graphColorFormat === 'multicolor' &&
                          (!hasZipWhip || (user && !user.zipwhipSessionKey)) &&
                          graphColorActivity2) || [
                          '#96acd6',
                          '#6f86b3',
                          '#506691',
                          '#293856',
                        ]
                      }
                      data={activityGraphData[0]}
                      tooltip={tooltip}
                      margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                      curve="natural"
                      enableGridY={false}
                      enableGridX={true}
                      theme={theme}
                      tickValues={5}
                      enableLabel={true}
                      labelFormat={labelFormat}
                      legends={[
                        {
                          anchor: 'bottom-left',
                          direction: 'row',
                          justify: false,
                          translateX: 0,
                          translateY: 48,
                          itemsSpacing: 0,
                          itemDirection: 'left-to-right',
                          itemWidth: 60,
                          itemHeight: 10,
                          itemOpacity: 0.85,
                          symbolSize: 9,
                          symbolBorderColor: 'rgba(0, 0, 0, .5)',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1,
                              },
                            },
                          ],
                        },
                      ]}
                    />
                  )) ||
                  (!activityMetricsLoading &&
                    activityGraph &&
                    activityGraphData[0] &&
                    activityGraphDataLinkedin.length === 0 &&
                    activityGraphDataEmail.length === 0 &&
                    activityGraphDataCall.length === 0 &&
                    activityGraphDataText.length === 0 &&
                    activityGraphDataOther.length === 0 && (
                      <div className="m-auto text-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (activityMetricsLoading && (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                      </div>
                    </div>
                  ))}
              </CardBody>
              {!activityMetricsError &&
                !activityMetricsLoading &&
                activityGraphDataEmail &&
                activityGraphDataEmail.length > 0 && (
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
                    Last Week
                  </p>
                )}
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default ActivityMetrics;
