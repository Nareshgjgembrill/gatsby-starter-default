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
  Row,
} from 'reactstrap';
import Chart from '../../Common/Chart';
import { FAILED_TO_FETCH_DATA, NO_DATA_AVAILABLE } from '../../../util/index';

const TopTemplates = ({
  isManagerUser,
  topTemplatesDataType,
  setTopTemplatesDataType,
  topTemplatesLoading,
  topTemplatesError,
  topTemplatesMetrics,
  topTemplatesPercentage,
  sendDashboardParams,
  graphColorFormat,
  graphColor,
  theme,
  tooltip,
  labelFormat,
  labelFormatPercentage,
  BarLegend,
}) => {
  return (
    <>
      {/* if a manager user */}
      {isManagerUser && (
        <Row className="mb-3">
          <Col>
            <Card className="card-default text-center h-100 text-center">
              <CardHeader className="d-flex pb-1 pt-1 bg-white justify-content-between">
                <p style={{ width: '185px' }}></p>
                <p
                  className="pt-2 pl-2 align-items-center align-self-center text-bold"
                  title="Top 5 templates"
                >
                  <i
                    className={`mr-2 text-success ${
                      topTemplatesLoading
                        ? 'fa fa-spinner fa-spin'
                        : 'fas fa-envelope-open-text'
                    }`}
                  ></i>
                  TOP PERFORMING TEMPLATES
                </p>

                <ButtonGroup>
                  <Button
                    className={`text-bold ${
                      topTemplatesDataType === 'metrics'
                        ? 'bg-color-primary-shade text-white '
                        : 'text-dark'
                    }`}
                    onClick={(e) => {
                      setTopTemplatesDataType('metrics');
                      sendDashboardParams();
                    }}
                  >
                    Metrics
                  </Button>
                  <Button
                    className={`text-bold ${
                      topTemplatesDataType === 'percentage'
                        ? 'bg-color-primary-shade text-white '
                        : 'text-dark'
                    }`}
                    onClick={(e) => {
                      setTopTemplatesDataType('percentage');
                      sendDashboardParams();
                    }}
                  >
                    Percentage
                  </Button>
                </ButtonGroup>
              </CardHeader>
              <CardBody className="d-flex pb-0" style={{ height: '200px' }}>
                {(topTemplatesError && (
                  <div className="m-auto">
                    <i className="fas fa-exclamation-triangle fa-10x m-auto text-danger"></i>
                    <p>{FAILED_TO_FETCH_DATA}</p>
                  </div>
                )) ||
                  (((topTemplatesDataType === 'metrics' &&
                    topTemplatesMetrics?.length > 0) ||
                    (topTemplatesDataType === 'percentage' &&
                      topTemplatesPercentage?.length > 0)) && (
                    <Chart
                      type="Bar"
                      tickValues={5}
                      enableGridY={false}
                      theme={theme}
                      tooltip={tooltip}
                      enableLabel={true}
                      labelFormat={
                        topTemplatesDataType === 'metrics'
                          ? labelFormat
                          : labelFormatPercentage
                      }
                      innerPadding={2}
                      groupMode="grouped"
                      data={
                        topTemplatesDataType === 'metrics'
                          ? topTemplatesMetrics
                          : topTemplatesPercentage
                      }
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
                          (label?.length > 13 &&
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
                          data: Object.keys(
                            topTemplatesDataType === 'metrics'
                              ? topTemplatesMetrics[0]
                              : topTemplatesPercentage[0]
                          )
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
                                        id
                                          .toLowerCase()
                                          .charAt(0)
                                          .toUpperCase() + id.slice(1)
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
                  (!topTemplatesLoading &&
                    topTemplatesDataType === 'metrics' &&
                    (!topTemplatesMetrics ||
                      topTemplatesMetrics?.length === 0) && (
                      <div className="m-auto align-self-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (!topTemplatesLoading &&
                    topTemplatesDataType === 'percentage' &&
                    (!topTemplatesPercentage ||
                      topTemplatesPercentage?.length === 0) && (
                      <div className="m-auto align-self-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </div>
                    )) ||
                  (topTemplatesLoading && (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <div className="text-center">
                        <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                      </div>
                    </div>
                  ))}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default TopTemplates;
