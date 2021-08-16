/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { Card, Col, Row, Table } from 'reactstrap';
import Chart from '../../Common/Chart';
import { NO_DATA_AVAILABLE } from '../../../util/index';

const DialsMetrics = ({
  isManagerUser,
  dateRange,
  dialsView,
  setDialsView,
  dialsMetrics,
  dialsMetricsLoading,
  dialsData,
  validConnectsView,
  setValidConnectsView,
  validConnectsData,
  talkTimeView,
  setTalkTimeView,
  talkTimeData,
  graphColor,
  tooltip,
  theme,
  activeCadencesCount,
  totalActiveCadencesToChangeLayout,
}) => {
  return (
    <Row>
      <Col
        lg={activeCadencesCount > totalActiveCadencesToChangeLayout ? 6 : 4}
        xl={activeCadencesCount > totalActiveCadencesToChangeLayout ? 6 : 4}
        className="pr-0 pl-2"
      >
        {/* Start Dials */}
        <Card
          className={
            'd-flex flex-column justify-content-between card-default ' +
            (dialsView === 'list' && 'pb-2')
          }
          style={{ height: '300px', overflow: 'auto' }}
        >
          {dialsView === 'graph' && (
            <Table striped responsive>
              <thead className="text-nowrap">
                <tr className="text-sm" style={{ borderColor: 'black' }}>
                  <th width="10%" className="border-top-0">
                    <i
                      className={`${
                        dialsMetricsLoading
                          ? 'fa fa-spinner fa-spin'
                          : 'fa fa-phone-alt'
                      }`}
                    ></i>
                  </th>
                  <th width="35%" className="border-top-0  text-info">
                    DIALS
                  </th>
                  <th width="35%" className="border-top-0">
                    <i
                      className={`fas fa-list pointer ${
                        dialsView === 'list' ? 'text-primary' : 'text-muted'
                      }`}
                      title="List view"
                      onClick={() => setDialsView('list')}
                    ></i>
                    <i
                      className={`fas fa-chart-bar mx-2 pointer ${
                        dialsView === 'graph' ? 'text-primary' : 'text-muted'
                      }`}
                      title="Graphical view"
                      onClick={() => setDialsView('graph')}
                    ></i>
                  </th>
                  <th width="20%" className="border-top-0">
                    <small className="text-muted text-bold"></small>
                  </th>
                </tr>
              </thead>
            </Table>
          )}
          {dialsView === 'list' && (
            <Table
              className="h-100"
              striped
              responsive={dialsMetrics?.dials?.data?.length > 0}
            >
              <thead className="text-nowrap bb">
                <tr className="text-sm">
                  <th width="10%" className="border-top-0">
                    <i
                      className={`${
                        dialsMetricsLoading
                          ? 'fa fa-spinner fa-spin'
                          : 'fa fa-phone-alt text-muted'
                      }`}
                    ></i>
                  </th>
                  <th width="35%" className="border-top-0 text-info">
                    DIALS
                  </th>
                  <th width="35%" className="border-top-0">
                    <i
                      className={`fas fa-list pointer ${
                        dialsView === 'list' ? 'text-primary' : 'text-muted'
                      }`}
                      title="List view"
                      onClick={() => setDialsView('list')}
                    ></i>
                    <i
                      className={`fas fa-chart-bar mx-2 pointer ${
                        dialsView === 'graph' ? 'text-primary' : 'text-muted'
                      }`}
                      title="Graphical view"
                      onClick={() => setDialsView('graph')}
                    ></i>
                  </th>
                  <th width="20%" className="border-top-0">
                    <small className="text-muted text-bold">TOTAL</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dialsMetrics?.dials?.data?.length > 0 &&
                  !dialsMetricsLoading &&
                  dialsMetrics.dials.data.map(
                    (item, index) =>
                      index < 5 && (
                        <tr className="bt" key={index}>
                          {(((isManagerUser && index === 0) ||
                            (!isManagerUser &&
                              dialsMetrics?.dials?.data?.length === 1 &&
                              index === 0) ||
                            (!isManagerUser &&
                              index === 1 &&
                              dialsMetrics?.dials?.data?.length > 1 &&
                              dialsMetrics.dials.data[0].dials <
                                dialsMetrics.dials.data[1].dials) ||
                            (!isManagerUser &&
                              index === 0 &&
                              dialsMetrics?.dials?.data?.length > 1 &&
                              dialsMetrics.dials.data[0].dials >=
                                dialsMetrics.dials.data[1].dials)) && (
                            <td>
                              <i className="fa fa-star text-warning"></i>
                            </td>
                          )) || <td></td>}
                          <td colSpan="2">{item.userName}</td>
                          <td>
                            <span className="text-primary text-bold">
                              {item.dials}
                            </span>
                          </td>
                        </tr>
                      )
                  )}
                {(!dialsMetrics || dialsMetrics?.dials?.data?.length === 0) &&
                  !dialsMetricsLoading && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p className="text-center">{NO_DATA_AVAILABLE}</p>
                      </td>
                    </tr>
                  )}
                {dialsMetricsLoading && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          {dialsView === 'graph' &&
            !dialsMetricsLoading &&
            dialsData &&
            dialsData.length > 0 &&
            dialsMetrics?.dials?.data?.length > 0 && (
              <Chart
                type="Bar"
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
                tooltip={tooltip}
                tickValues={5}
                enableGridY={false}
                theme={theme}
                enableLabel={false}
                padding={
                  (dialsData.length === 1 && 0.8) ||
                  (dialsData.length === 2 && 0.7) ||
                  (dialsData.length === 3 && 0.6) ||
                  (dialsData.length === 4 && 0.5) ||
                  (dialsData.length === 5 && 0.4)
                }
                innerPadding={5}
                colors={graphColor}
                data={dialsData}
                margin={{
                  top: 20,
                  right: 5,
                  bottom: 55,
                  left: 60,
                }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
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
            )}
          {dialsView === 'graph' &&
            dialsData?.length === 0 &&
            (!dialsMetrics || dialsMetrics?.dials?.data?.length === 0) &&
            !dialsMetricsLoading && (
              <div className="m-auto">
                <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                <p className="text-center">{NO_DATA_AVAILABLE}</p>
              </div>
            )}
          {!dialsMetricsLoading && (
            <small className="mb-0 mt-1 mr-2 pt-1 align-self-md-end text-muted font-italic">
              {dateRange}
            </small>
          )}
        </Card>
      </Col>
      {/* End Dials */}

      {/* Start Valid connects */}
      <Col
        lg={activeCadencesCount > totalActiveCadencesToChangeLayout ? 6 : 4}
        xl={activeCadencesCount > totalActiveCadencesToChangeLayout ? 6 : 4}
        className={
          activeCadencesCount > totalActiveCadencesToChangeLayout
            ? 'px-2'
            : 'pl-2 pr-0'
        }
      >
        <Card
          className={
            'd-flex flex-column justify-content-between card-default ' +
            (validConnectsView === 'list' && 'pb-2')
          }
          style={{ height: '300px', overflow: 'auto' }}
        >
          {validConnectsView === 'graph' && (
            <Table striped responsive>
              <thead className="text-nowrap">
                <tr className="text-sm">
                  <th width="10%" className="border-top-0">
                    {dialsMetricsLoading ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <span className="svgicon calling text-muted"></span>
                    )}
                  </th>
                  <th width="35%" className="border-top-0  text-info px-0">
                    VALID CONNECTS
                  </th>
                  <th width="35%" className="border-top-0">
                    <i
                      className={`fas fa-list pointer ${
                        validConnectsView === 'list'
                          ? 'text-primary'
                          : 'text-muted'
                      }`}
                      title="List view"
                      onClick={() => setValidConnectsView('list')}
                    ></i>
                    <i
                      className={`fas fa-chart-bar mx-2 pointer ${
                        validConnectsView === 'graph'
                          ? 'text-primary'
                          : 'text-muted'
                      }`}
                      title="Graphical view"
                      onClick={() => setValidConnectsView('graph')}
                    ></i>
                  </th>
                  <th width="20%" className="border-top-0">
                    <small className="text-muted text-bold"></small>
                  </th>
                </tr>
              </thead>
            </Table>
          )}
          {validConnectsView === 'list' && (
            <Table
              className="h-100"
              striped
              responsive={dialsMetrics?.validConnects?.data?.length > 0}
            >
              <thead className="text-nowrap bb">
                <tr className="text-sm">
                  <th width="10%" className="border-top-0">
                    {dialsMetricsLoading ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <span className="svgicon calling text-muted"></span>
                    )}
                  </th>
                  <th width="35%" className="border-top-0  text-info px-0">
                    VALID CONNECTS
                  </th>
                  <th width="35%" className="border-top-0">
                    <i
                      className={`fas fa-list pointer ${
                        validConnectsView === 'list'
                          ? 'text-primary'
                          : 'text-muted'
                      }`}
                      title="List view"
                      onClick={() => setValidConnectsView('list')}
                    ></i>
                    <i
                      className={`fas fa-chart-bar mx-2 pointer ${
                        validConnectsView === 'graph'
                          ? 'text-primary'
                          : 'text-muted'
                      }`}
                      title="Graphical view"
                      onClick={() => setValidConnectsView('graph')}
                    ></i>
                  </th>
                  <th width="20%" className="border-top-0">
                    <small className="text-muted text-bold">TOTAL</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dialsMetrics?.validConnects?.data?.length > 0 &&
                  !dialsMetricsLoading &&
                  dialsMetrics.validConnects.data.map(
                    (item, index) =>
                      index < 5 && (
                        <tr className="bt" key={index}>
                          {(((isManagerUser && index === 0) ||
                            (!isManagerUser &&
                              dialsMetrics?.validConnects?.data?.length === 1 &&
                              index === 0) ||
                            (!isManagerUser &&
                              index === 1 &&
                              dialsMetrics?.validConnects?.data?.length > 1 &&
                              dialsMetrics.validConnects.data[0].validconnects <
                                dialsMetrics.validConnects.data[1]
                                  .validconnects) ||
                            (!isManagerUser &&
                              index === 0 &&
                              dialsMetrics?.validConnects?.data?.length > 1 &&
                              dialsMetrics.validConnects.data[0]
                                .validconnects >=
                                dialsMetrics.validConnects.data[1]
                                  .validconnects)) && (
                            <td>
                              <i className="fa fa-star text-warning"></i>
                            </td>
                          )) || <td></td>}
                          <td colSpan="2">{item.userName}</td>
                          <td>
                            <span className="text-primary text-bold">
                              {item.validconnects}
                            </span>
                          </td>
                        </tr>
                      )
                  )}
                {!dialsMetricsLoading &&
                  (!dialsMetrics ||
                    dialsMetrics?.validConnects?.data?.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </td>
                    </tr>
                  )}
                {dialsMetricsLoading && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          {validConnectsView === 'graph' &&
            !dialsMetricsLoading &&
            dialsMetrics &&
            validConnectsData?.length > 0 && (
              <Chart
                type="Bar"
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
                  legend: '',
                  tickPadding: 5,
                  tickRotation: 0,
                  legendPosition: 'middle',
                  legendOffset: 32,
                }}
                tooltip={tooltip}
                enableGridY={false}
                tickValues={5}
                theme={theme}
                enableLabel={false}
                padding={
                  (validConnectsData.length === 1 && 0.8) ||
                  (validConnectsData.length === 2 && 0.7) ||
                  (validConnectsData.length === 3 && 0.6) ||
                  (validConnectsData.length === 4 && 0.5) ||
                  (validConnectsData.length === 5 && 0.4)
                }
                innerPadding={5}
                data={validConnectsData}
                colors={graphColor}
                margin={{
                  top: 20,
                  right: 5,
                  bottom: 55,
                  left: 60,
                }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: -10,
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
            )}
          {!dialsMetricsLoading &&
            validConnectsView === 'graph' &&
            (!validConnectsData || validConnectsData?.length === 0) && (
              <div className="m-auto">
                <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                <p className="text-center">{NO_DATA_AVAILABLE}</p>
              </div>
            )}
          {!dialsMetricsLoading && (
            <small className="mb-0 mt-1 mr-2 pt-1 align-self-md-end text-muted font-italic">
              {dateRange}
            </small>
          )}
        </Card>
      </Col>
      {/* End Valid Connects*/}
      {/* Start Talk Time */}
      <Col
        lg={activeCadencesCount > totalActiveCadencesToChangeLayout ? 6 : 4}
        xl={activeCadencesCount > totalActiveCadencesToChangeLayout ? 6 : 4}
        className={
          activeCadencesCount > totalActiveCadencesToChangeLayout
            ? 'pl-2 pr-0'
            : 'px-2'
        }
      >
        <Card
          className={
            'd-flex flex-column justify-content-between card-default ' +
            (talkTimeView === 'list' && 'pb-2')
          }
          style={{ height: '300px', overflow: 'auto' }}
        >
          {talkTimeView === 'graph' && (
            <Table striped responsive>
              <thead className="text-nowrap">
                <tr className="text-sm">
                  <th width="10%" className="border-top-0">
                    {dialsMetricsLoading ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <span className="svgicon talktime text-muted"></span>
                    )}
                  </th>
                  <th width="35%" className="border-top-0  text-info">
                    TALK TIME
                  </th>
                  <th width="35%" className="border-top-0">
                    <i
                      className={`fas fa-list pointer ${
                        talkTimeView === 'list' ? 'text-primary' : 'text-muted'
                      }`}
                      title="List view"
                      onClick={() => setTalkTimeView('list')}
                    ></i>
                    <i
                      className={`fas fa-chart-bar mx-2 pointer ${
                        talkTimeView === 'graph' ? 'text-primary' : 'text-muted'
                      }`}
                      title="Graphical view"
                      onClick={() => setTalkTimeView('graph')}
                    ></i>
                  </th>
                  <th width="20%" className="border-top-0">
                    <small className="text-muted text-bold"></small>
                  </th>
                </tr>
              </thead>
            </Table>
          )}
          {talkTimeView === 'list' && (
            <Table
              className="h-100"
              striped
              responsive={dialsMetrics?.talkTime?.data?.length > 0}
            >
              <thead className="text-nowrap bb">
                <tr className="text-sm">
                  <th width="10%" className="border-top-0">
                    {dialsMetricsLoading ? (
                      <i className="fa fa-spinner fa-spin"></i>
                    ) : (
                      <span className="svgicon talktime text-muted"></span>
                    )}
                  </th>
                  <th width="35%" className="border-top-0 text-info">
                    TALK TIME
                  </th>
                  <th width="35%" className="border-top-0">
                    <i
                      className={`fas fa-list pointer ${
                        talkTimeView === 'list' ? 'text-primary' : 'text-muted'
                      }`}
                      title="List view"
                      onClick={() => setTalkTimeView('list')}
                    ></i>
                    <i
                      className={`fas fa-chart-bar mx-2 pointer ${
                        talkTimeView === 'graph' ? 'text-primary' : 'text-muted'
                      }`}
                      title="Graphical view"
                      onClick={() => setTalkTimeView('graph')}
                    ></i>
                  </th>
                  <th width="20%" className="border-top-0">
                    <small className="text-muted text-bold">TOTAL</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                {dialsMetrics?.talkTime?.data?.length > 0 &&
                  !dialsMetricsLoading &&
                  dialsMetrics.talkTime.data.map(
                    (item, index) =>
                      index < 5 && (
                        <tr className="bt" key={index}>
                          {(((isManagerUser && index === 0) ||
                            (!isManagerUser &&
                              dialsMetrics?.talkTime?.data?.length === 1 &&
                              index === 0) ||
                            (!isManagerUser &&
                              index === 0 &&
                              dialsMetrics?.talkTime?.data?.length > 1 &&
                              dialsMetrics.talkTime.data[0].talktime >=
                                dialsMetrics.talkTime.data[1].talktime) ||
                            (!isManagerUser &&
                              index === 1 &&
                              dialsMetrics?.talkTime?.data?.length > 1 &&
                              dialsMetrics.talkTime.data[0].talktime <
                                dialsMetrics.talkTime.data[1].talktime)) && (
                            <td>
                              <i className="fa fa-star text-warning"></i>
                            </td>
                          )) || <td></td>}
                          <td colSpan="2">{item.userName}</td>
                          <td>
                            <span className="text-primary text-bold">
                              {Math.round(item.talktime / 60)}
                            </span>
                          </td>
                        </tr>
                      )
                  )}
                {!dialsMetricsLoading &&
                  (!dialsMetrics ||
                    dialsMetrics?.talkTime?.data?.length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center">
                        <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                        <p>{NO_DATA_AVAILABLE}</p>
                      </td>
                    </tr>
                  )}
                {dialsMetricsLoading && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
          {talkTimeView === 'graph' &&
            !dialsMetricsLoading &&
            dialsMetrics &&
            talkTimeData?.length > 0 && (
              <Chart
                type="Bar"
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
                enableGridY={false}
                theme={theme}
                padding={
                  (talkTimeData.length === 1 && 0.8) ||
                  (talkTimeData.length === 2 && 0.7) ||
                  (talkTimeData.length === 3 && 0.6) ||
                  (talkTimeData.length === 4 && 0.5) ||
                  (talkTimeData.length === 5 && 0.4)
                }
                tooltip={tooltip}
                tickValues={5}
                enableLabel={false}
                innerPadding={5}
                data={talkTimeData}
                colors={graphColor}
                margin={{
                  top: 20,
                  right: 5,
                  bottom: 55,
                  left: 60,
                }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
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
            )}
          {!dialsMetricsLoading &&
            talkTimeView === 'graph' &&
            (!talkTimeData || talkTimeData?.length === 0) && (
              <div className="m-auto">
                <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                <p className="text-center">{NO_DATA_AVAILABLE}</p>
              </div>
            )}
          {!dialsMetricsLoading && (
            <small className="mb-0 mt-1 mr-2 pt-1 align-self-md-end text-muted font-italic">
              {dateRange} - In Min
            </small>
          )}
        </Card>
      </Col>
      {/* End Talk Time */}

      {/* Start Positive Connects */}
      {/* will be uncommented when api is available
      <div
        className={`col-lg-6 col-xl-6 ${
          activeCadencesCount <= totalActiveCadencesToChangeLayout && 'd-none'
        }`}
      >
        <div
          className="d-flex flex-column justify-content-between card-default pb-2 card"
          style={{ height: '300px', overflow: 'auto' }}
        >
          <div className="table-responsive">
            <table className="h-100 table table-striped">
              <thead className="text-nowrap bb">
                <tr>
                  <th width="10%" className="border-top-0">
                    <span className="svgicon talktime text-muted"></span>
                  </th>
                  <th width="35%" className="border-top-0 text-info">
                    POSITIVE CONNECTS
                  </th>
                  <th width="35%" className="border-top-0">
                    <i
                      className="fas fa-list pointer text-primary"
                      title="List view"
                    ></i>
                    <i
                      className="fas fa-chart-bar mx-2 pointer text-muted"
                      title="Graphical view"
                    ></i>
                  </th>
                  <th width="20%" className="border-top-0">
                    <small className="text-muted text-bold">TOTAL</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bt">
                  <td>
                    <i className="fa fa-star text-warning"></i>
                  </td>
                  <td colspan="2">ganeshuser</td>
                  <td>
                    <span className="text-primary text-bold">0</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <small className="mb-0 mt-1 mr-2 pt-1 align-self-md-end text-muted font-italic">
            Last Quarter - In Min
          </small>
        </div>
      </div>
      */}
      {/* End Positive Connects */}
    </Row>
  );
};

export default DialsMetrics;
