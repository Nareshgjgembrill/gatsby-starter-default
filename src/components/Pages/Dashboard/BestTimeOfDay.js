/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const BestTimeOfDay = ({
  isManagerUser,
  cadenceFiltered,
  activityInfo,
  activityInfoLoading,
  activityInfoError,
  dateRange,
  graphColorFormat,
  graphColor,
  theme,
  tooltipFormat2,
  isSelectedAll,
  totalLabelsClosure,
}) => {
  return {
    // will be uncommented when functionality will be available in api
    /* <Row>
        <Col lg={12}>
          <p className="text-muted text-bold">
            <i
                    className={`mr-2 text-email ${
                      bestTimeLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'far fa-clock text-muted'
                    }`}
                  ></i>
            BEST TIME OF THE DAY
          </p>
          <Card className="card-default">
            <CardHeader></CardHeader>
            <CardBody className="d-flex" style={{ height: '300px' }}>
              {(bestTimeError && (
                <div className="m-auto">
                  <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                  <p>{FAILED_TO_FETCH_DATA}</p>
                </div>
              )) ||
                (bestTimeData &&
                  bestTimeBeforeFilter &&
                  bestTimeFiltered.length > 0 && (
                    <Chart
                      type="Bar"
                      padding={
                        (bestTimeBeforeFilter.length === 1 && 0.7) ||
                        (bestTimeBeforeFilter.length === 2 && 0.6) ||
                        (bestTimeBeforeFilter.length === 3 && 0.5)
                      }
                      tickValues={5}
                      enableGridY={false}
                      theme={theme}
                      enableLabel={false}
                      data={bestTimeBeforeFilter}
                      colors={
                        (graphColorFormat === 'multicolor' && graphColor) || [
                          '#9452A0',
                          '#b269bf',
                          '#cc86d9',
                          '#e4a5f0',
                        ]
                      }
                      margin={{ top: 20, right: 20, bottom: 55, left: 20 }}
                      axisBottomLegend={{
                        tickSize: 5,
                        legend: '',
                        tickPadding: 5,
                        tickRotation: -20,
                        legendPosition: 'middle',
                        legendOffset: 32,
                      }}
                      tooltip={tooltipFormat1}
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
                  )) || (
                  <div className="m-auto mt-auto text-center">
                    <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                    <p>{NO_DATA_AVAILABLE}</p>
                  </div>
                )}
            </CardBody>
          </Card>
        </Col>
      </Row> */
  };
};

export default BestTimeOfDay;
