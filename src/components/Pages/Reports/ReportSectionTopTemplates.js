/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, { useMemo } from 'react';
import { Card, CardHeader, Collapse } from 'reactstrap';
import TopTemplatesGrid from './TopTemplatesGrid';

const ReportSectionTopTemplates = ({
  sectionName,
  sectionNameTitle,
  sectionGridData,
  sectionLoading,
  sectionError,
  toggleSection,
  isOpenSection,
  iconClass,
}) => {
  const totalTopTemplatesWidth = '970px';
  const totalTopTemplatesBodyWidth = '1030px';
  const totalTopTemplatesColumns = '13';
  const topTemplateColumns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'emailTemplateName',
        width: `calc(${totalTopTemplatesWidth}/${
          totalTopTemplatesColumns - 4
        })`,
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
        width: `calc(${totalTopTemplatesWidth}/${
          totalTopTemplatesColumns - 4
        })`,
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
        Header: 'Opened %',
        accessor: 'openedPercentage',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Replied %',
        accessor: 'repliedPercentage',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Clicked %',
        accessor: 'clickedPercentage',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Bounced %',
        accessor: 'bouncedPercentage',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Optout %',
        accessor: 'optoutPercentage',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Sent',
        accessor: 'sent',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Opened',
        accessor: 'opened',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Replied',
        accessor: 'replied',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Clicked',
        accessor: 'clicked',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Bounced',
        accessor: 'bounced',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
      {
        Header: 'Opt Out',
        accessor: 'optout',
        width: `calc(${totalTopTemplatesWidth}/${totalTopTemplatesColumns})`,
        paddingLeft: '1px',
        Cell: function (props) {
          return (
            <div className="text-truncate text-center pr-2" title={props.value}>
              {props.value}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <Card className="card-default border-top-0">
      <CardHeader className="bg-white">
        <h4 className="text-normal">
          <div className="float-left" title={sectionNameTitle}>
            <i
              className={`mr-2 ${
                sectionLoading ? 'fas fa-spinner fa-spin' : iconClass
              }`}
            ></i>
            {sectionName}
          </div>
          <div className="float-right">
            <ul className="nav">
              <li>
                <span
                  className="pointer"
                  title={isOpenSection ? 'Collapse' : 'Expand'}
                  onClick={toggleSection}
                >
                  <i
                    className={
                      isOpenSection
                        ? 'fa fa-chevron-up fa-xs'
                        : 'fas fa-chevron-down fa-xs'
                    }
                  ></i>
                </span>
              </li>
            </ul>
          </div>
        </h4>
      </CardHeader>
      <Collapse isOpen={isOpenSection}>
        <div className="m-0 bt">
          <div className="d-flex p-0 flex-column">
            {sectionGridData && (
              <TopTemplatesGrid
                columns={topTemplateColumns}
                data={sectionGridData}
                loading={sectionLoading}
                error={sectionError}
                sortBy={'openedPercentage'}
                orderBy={'desc'}
                tableWidth={totalTopTemplatesWidth}
                tableBodyWidth={totalTopTemplatesBodyWidth}
              />
            )}
          </div>
        </div>
      </Collapse>
    </Card>
  );
};

export default ReportSectionTopTemplates;
