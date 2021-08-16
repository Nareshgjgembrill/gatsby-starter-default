/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { Card, CardBody, CardHeader, Col } from 'reactstrap';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const TopProspects = ({
  isManagerUser,
  topProspectsLoading,
  topProspectsError,
  topProspectsData,
  graphColorFormat,
  graphColor,
  theme,
  tooltip,
  labelFormat,
  BarLegend,
}) => {
  return (
    <>
      {/* if a manager user */}
      {isManagerUser && (
        <Col lg={6} md={12}>
          <Card className="card-default text-center h-100 text-center">
            <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-center">
              <p
                className="pt-2 pl-2 align-items-center align-self-center text-bold"
                title="Top 10 prospects"
              >
                <i
                  className={`mr-2 text-success ${
                    topProspectsLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'fas fa-envelope-open-text'
                  }`}
                ></i>
                TOP ENGAGED PROSPECTS
              </p>
            </CardHeader>

            <CardBody className="d-flex pb-0" style={{ height: '200px' }}>
              {(topProspectsError && (
                <div className="m-auto">
                  <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                  <p>{FAILED_TO_FETCH_DATA}</p>
                </div>
              )) ||
                (topProspectsData?.length > 0 && (
                  <Chart
                    type="Bar"
                    tickValues={5}
                    enableGridY={false}
                    theme={theme}
                    tooltip={tooltip}
                    enableLabel={true}
                    labelFormat={labelFormat}
                    innerPadding={2}
                    groupMode="grouped"
                    data={topProspectsData}
                    margin={{ top: 20, right: 20, bottom: 55, left: 60 }}
                    padding={0.6}
                    colors={
                      (graphColorFormat === 'multicolor' && graphColor) || [
                        '#79C143',
                        '#9fed64',
                        '#b8f788',
                        '#8fe64e',
                      ]
                    }
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
                    layers={['grid', 'axes', 'bars', 'markers', BarLegend]}
                    legends={[
                      {
                        dataFrom: 'keys',
                        data: Object.keys(topProspectsData[0])
                          .slice(1)
                          .map((id, index) => {
                            return {
                              color:
                                graphColorFormat === 'multicolor'
                                  ? graphColor[index]
                                  : [
                                      '#79C143',
                                      '#9fed64',
                                      '#b8f788',
                                      '#8fe64e',
                                    ][index],
                              id,
                              label:
                                id?.length > 13
                                  ? (
                                      id.toLowerCase().charAt(0).toUpperCase() +
                                      id.slice(1)
                                    ).slice(0, 13) + '...'
                                  : id.toLowerCase().charAt(0).toUpperCase() +
                                    id.slice(1),
                            };
                          }),
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
                (!topProspectsLoading &&
                  (!topProspectsData || topProspectsData?.length === 0) && (
                    <div className="m-auto align-self-center">
                      <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                      <p>{NO_DATA_AVAILABLE}</p>
                    </div>
                  )) ||
                (topProspectsLoading && (
                  <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                    <div className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </div>
                  </div>
                ))}
            </CardBody>
          </Card>
        </Col>
      )}
    </>
  );
};

export default TopProspects;
