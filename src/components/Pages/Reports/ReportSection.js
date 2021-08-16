/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, { useMemo, useState } from 'react';
import { Card, CardHeader, Col, Collapse, Row } from 'reactstrap';
import { ResponsiveBar } from '@nivo/bar';
import { BoxLegendSvg } from '@nivo/legends';
import ReportGrid from './ReportGrid';
import ProspectGrid from './ProspectGrid';
import Button from '../../Common/Button';

const ReportSection = ({
  sectionName,
  sectionNameTitle,
  sectionGridState,
  sectionLoading,
  toggleSection,
  toggleChartSection,
  chartSection,
  chartListSection,
  isOpenSection,
  sectionBucketState,
  iconClass,
  handleRefresh,
  handleFetch,
}) => {
  const [chartDisplayStacked, setChartDisplayStacked] = useState(true);
  const [chartContainerWidth, setChartContainerWidth] = useState(1);
  const chartLegendItemsPerRow = Math.floor(chartContainerWidth / 100) || 7;
  const totalProspectWidth = '1500px';
  const totalProspectColumns = '10';
  const prospectColumns = useMemo(
    () => [
      {
        Header: 'Contact Name',
        accessor: 'contactName',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Account Name',
        accessor: 'accountName',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Cadence',
        accessor: 'cadenceName',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Touch',
        accessor: 'prospectStatus',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Outcome',
        accessor: 'outcomes',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value ? props.value.replaceAll('Other', 'Social') : 'N/A'}
            </div>
          );
        },
      },
      {
        Header: 'Date/Time',
        accessor: 'activityDate',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Phone #',
        accessor: 'phoneNumber',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Email',
        accessor: 'email',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Title',
        accessor: 'title',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Owner',
        accessor: 'owner',
        width: `calc(${totalProspectWidth}/${totalProspectColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
    ],
    []
  );

  const BarLegend = ({ height, legends, width }) => {
    // setTimeout used as we can't update a component while rendering a different component
    setTimeout(() => setChartContainerWidth(width), 0);
    const [legend] = legends;
    const totalLength = legend.data.length;
    const itemsPerRow = chartLegendItemsPerRow;
    const rows = Math.ceil(totalLength / itemsPerRow);
    const rowData = [];
    let startIndex = 0;
    let endIndex = startIndex + itemsPerRow;

    // calculating start and end index for dividing legends into rows
    for (let row = 0; row < rows; row++) {
      rowData[row] = {
        startIndex,
        endIndex,
      };
      startIndex = startIndex + itemsPerRow;
      endIndex = endIndex + itemsPerRow;
    }
    // creating legend rows based on rowData
    const legendData = rowData.map((item, index) => {
      return (
        <BoxLegendSvg
          key={'legend-' + index}
          {...legend}
          data={legend.data.slice(item.startIndex, item.endIndex)}
          containerHeight={height}
          containerWidth={width}
          translateY={70 + 20 * index}
        />
      );
    });

    return legendData;
  };

  const theme = {
    axis: {
      domain: {
        line: {
          stroke: '#202020',
          strokeWidth: 0.3,
        },
      },
    },
  };

  return (
    <Card className="card-default border-top-0">
      <CardHeader className="bg-white">
        <Row>
          <Col>
            <h4 className="m-0 font-weight-normal" title={sectionNameTitle}>
              <i
                className={`mr-2 ${
                  sectionLoading ? 'fas fa-spinner fa-spin fa-sm' : iconClass
                }`}
              ></i>
              {sectionName}
            </h4>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <ul className="nav">
              {toggleChartSection !== null && (
                <>
                  <li
                    title="Detailed View"
                    className={`${chartSection ? 'text-muted' : ''}`}
                  >
                    <span onClick={toggleChartSection}>
                      <i className="fas fa-list pointer"></i>
                    </span>
                  </li>
                  <li
                    title="Graphical View"
                    className={`${!chartSection ? 'text-muted' : ''}`}
                  >
                    <span onClick={toggleChartSection}>
                      <i className="fas fa-chart-bar pointer mx-3"></i>
                    </span>
                  </li>
                </>
              )}
              <li>
                <span
                  className="pointer"
                  title={isOpenSection ? 'Collapse' : 'Expand'}
                  onClick={toggleSection}
                >
                  <i
                    className={
                      isOpenSection ? 'fa fa-chevron-up' : 'fas fa-chevron-down'
                    }
                  ></i>
                </span>
              </li>
            </ul>
          </Col>
        </Row>
      </CardHeader>
      <Collapse isOpen={isOpenSection}>
        <div className="m-0 bt">
          {!chartSection &&
            sectionGridState?.map((item, index) => (
              <React.Fragment key={item.key + '_' + index}>
                <div className="d-flex flex-column border-bottom">
                  <ReportGrid
                    columns={item.columns}
                    data={item.data}
                    loading={sectionLoading}
                    bucketName={sectionBucketState[item.key]?.bucketName}
                  />

                  <ProspectGrid
                    columns={prospectColumns}
                    data={sectionBucketState[item.key]?.data || []}
                    additionalData={item.additionalData}
                    handleFetch={handleFetch}
                    loading={sectionBucketState[item.key]?.loading || false}
                    error={false}
                    pageCount={Math.ceil(
                      sectionBucketState[item.key]?.totalCount /
                        sectionBucketState[item.key]?.pageSize || 1
                    )}
                    totalCount={sectionBucketState[item.key]?.totalCount || 10}
                    pageSize={sectionBucketState[item.key]?.pageSize || 10}
                    currentPageIndex={
                      sectionBucketState[item.key]?.currentPageIndex || 0
                    }
                    sortBy={
                      sectionBucketState[item.key]?.sortBy || 'contact_name'
                    }
                    orderBy={sectionBucketState[item.key]?.orderBy || 'asc'}
                    handleRefresh={() => {
                      handleRefresh(
                        sectionBucketState[item.key]?.key,
                        sectionBucketState[item.key]?.bucketName,
                        sectionBucketState[item.key]?.currentPageIndex,
                        sectionBucketState[item.key]?.pageSize,
                        sectionBucketState[item.key]?.sortColumn,
                        sectionBucketState[item.key]?.sortDirection
                      );
                    }}
                    bucketKey={item.key}
                    bucketName={sectionBucketState[item.key]?.bucketName}
                    display={sectionBucketState[item.key]?.display}
                  />
                </div>
              </React.Fragment>
            ))}
          {chartSection &&
            chartListSection &&
            chartListSection?.data?.length > 0 && (
              <>
                <div>
                  {chartListSection?.keys?.length > 1 && (
                    <Button
                      title="Toggle Grouped/Stacked"
                      onClick={(e) => {
                        setChartDisplayStacked((prev) => !prev);
                      }}
                      className="btn-secondary mt-2 mr-2 float-right"
                    >
                      {chartDisplayStacked ? 'Stacked' : 'Grouped'}
                    </Button>
                  )}
                </div>
                <div className="w-100 h-100 pl-2 overflow-auto">
                  <div
                    className="d-flex"
                    style={{
                      height: '400px',
                      width: 120 * chartListSection?.data.length + 'px',
                      minWidth: '100%',
                    }}
                  >
                    <ResponsiveBar
                      data={chartListSection.data}
                      keys={chartListSection.keys}
                      indexBy="bucket"
                      groupMode={chartDisplayStacked ? 'stacked' : 'grouped'}
                      margin={{
                        top: 35,
                        right: 40,
                        bottom:
                          110 +
                          Math.ceil(
                            chartListSection.keys.length /
                              chartLegendItemsPerRow
                          ) *
                            10,
                        left: 60,
                      }}
                      padding={0.3}
                      valueScale={{ type: 'linear' }}
                      indexScale={{ type: 'band', round: true }}
                      colors={chartListSection.colors.map((c) => c)}
                      defs={[
                        {
                          id: 'dots',
                          type: 'patternDots',
                          background: 'inherit',
                          color: '#38bcb2',
                          size: 4,
                          padding: 1,
                          stagger: true,
                        },
                        {
                          id: 'lines',
                          type: 'patternLines',
                          background: 'inherit',
                          color: '#eed312',
                          rotation: -45,
                          lineWidth: 6,
                          spacing: 10,
                        },
                      ]}
                      borderColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]],
                      }}
                      theme={theme}
                      enableGridY={false}
                      axisTop={null}
                      axisRight={null}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Prospects',
                        legendPosition: 'middle',
                        legendOffset: -53,
                      }}
                      axisBottom={{
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
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]],
                      }}
                      layers={['grid', 'axes', 'bars', 'markers', BarLegend]}
                      legends={[
                        {
                          dataFrom: 'keys',
                          data: chartListSection.keys.map((id, index) => ({
                            color: chartListSection.colors[index],
                            id,
                            label:
                              id?.length > 13 ? id.slice(0, 12) + '...' : id,
                          })),
                          anchor: 'bottom-left',
                          direction: 'row',
                          justify: false,
                          translateX: 0,
                          translateY: 90,
                          itemsSpacing: 2,
                          itemWidth: 100,
                          itemHeight: 20,
                          itemDirection: 'left-to-right',
                          itemOpacity: 0.85,
                          symbolSize: 10,
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
                      animate={true}
                      motionStiffness={90}
                      motionDamping={15}
                    />
                  </div>
                </div>
              </>
            )}
        </div>
      </Collapse>
    </Card>
  );
};

export default ReportSection;
