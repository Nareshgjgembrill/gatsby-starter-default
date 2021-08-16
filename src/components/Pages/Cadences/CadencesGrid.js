import React, { useState } from 'react';
import { withRouter, Link } from 'react-router-dom';
import { usePagination, useRowSelect, useTable } from 'react-table';
import { Button, CardFooter, Table } from 'reactstrap';

import TablePagination from '../../Common/Pagination';
import { useSortBy } from '@nextaction/components';

function GridRow({
  row,
  handleRowToolbarButton,
  rowKey,
  cadenceActions,
  pathName,
  canCreateCadence,
}) {
  const [showCell, setShowCell] = useState(true);
  const cadence = row.original;
  return (
    <tr
      {...row.getRowProps()}
      className="cadence-grid-row"
      onMouseOver={() => setShowCell(!showCell)}
      onMouseOut={() => setShowCell(!showCell)}
      key={rowKey}
    >
      {row.cells.map((cell, i) => {
        let classNameText = '';
        if (cell.column.Header === 'Favorite') {
          if (showCell) {
            classNameText = '';
          } else {
            classNameText = 'favorite-cadence';
          }
        } else if (
          ['Prospects Due', 'Stats'].indexOf(cell.column.Header) !== -1
        ) {
          if (showCell) {
            classNameText = '';
          } else {
            classNameText = 'overstats';
          }
        }
        return (
          <td
            key={i}
            // for class 'overstats' refer: libs\styles\src\lib\app\trucadence\trucadence.scss
            className={classNameText}
            style={{
              width: cell.column.width,
              textAlign: cell.column.textAlign,
              display:
                ['Status', 'Last Modified'].indexOf(cell.column.Header) !== -1
                  ? showCell
                    ? ''
                    : 'none'
                  : '',
              whiteSpace:
                ['Last Modified'].indexOf(cell.column.Header) !== -1
                  ? 'nowrap'
                  : '',
            }}
          >
            {cell.render('Cell')}
          </td>
        );
      })}
      <td
        {...row.getRowProps()}
        className="text-center pb-0 pt-0"
        style={{
          display: showCell ? 'none' : '',
          verticalAlign: 'middle',
          width: '1000%',
        }}
        colSpan="2"
      >
        <Link
          className="mr-2"
          to={{
            pathname: '/cadences/' + cadence.id,
            state: {
              pathName: pathName,
              search: window.location.search,
              editFlag: true,
            },
          }}
          title="Edit"
        >
          <i className="fas fa-pencil-alt"></i>
        </Link>
        <Button
          color="outline"
          className="mr-2 btn-xs"
          title="Clone"
          hidden={!canCreateCadence}
          onClick={() => handleRowToolbarButton(cadenceActions.CLONE, cadence)}
        >
          <i className="fas fa-clone"></i>
        </Button>
        <Button
          color="outline"
          className="mr-2 btn-xs"
          title={`Make the Cadence  ${
            cadence.status === 'INACTIVE' ? 'Active' : 'Inactive'
          }`}
          hidden={cadence.status === 'NEW' || cadence.status === 'PAUSED'}
          onClick={() =>
            handleRowToolbarButton(cadenceActions.DISABLE, cadence)
          }
        >
          <i
            className={
              cadence.status === 'INACTIVE' ? 'fas fa-check' : 'fas fa-ban'
            }
          ></i>
        </Button>
        <Button
          color="outline"
          className="mr-2 btn-xs"
          title="Resume"
          hidden={
            cadence.status !== 'PAUSED' ||
            cadence.status === 'INACTIVE' ||
            cadence.status === 'NEW'
          }
          onClick={() => handleRowToolbarButton(cadenceActions.RESUME, cadence)}
        >
          <i className="fas fa-play"></i>
        </Button>
        <Button
          color="outline"
          className="mr-2 btn-xs"
          title="Pause"
          hidden={
            cadence.status === 'PAUSED' ||
            cadence.status === 'INACTIVE' ||
            cadence.status === 'NEW'
          }
          onClick={() => handleRowToolbarButton(cadenceActions.PAUSE, cadence)}
        >
          <i className="fas fa-pause"></i>
        </Button>
        <Button
          color="outline"
          className="mr-2 btn-xs"
          title="Delete"
          hidden={['PAUSED', 'ACTIVE'].includes(cadence.status)}
          onClick={() => handleRowToolbarButton(cadenceActions.DELETE, cadence)}
        >
          <i className="fas fa-trash"></i>
        </Button>
      </td>
    </tr>
  );
}

function CadencesGrid({
  columns,
  data,
  cadenceData,
  fetchData,
  cadencesResponse,
  cadenceName,
  loading,
  error,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  currentPageIndex,
  handleRowToolbarButton,
  cadenceActions,
  pathName,
  canCreateCadence,
  totalCount,
  handleRefresh,
  sortBy: sortByColumn,
  orderBy,
  handleSortBy,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // Get the state from the instance
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      cadenceData,
      initialState: {
        pageIndex: currentPageIndex,
        pageSize: controlledPageSize,
        sortBy: [
          {
            id: sortByColumn,
            desc: orderBy === 'desc',
          },
        ],
      },
      manualPagination: true,
      manualSortBy: true,
      pageCount: controlledPageCount,
      disableSortRemove: true,
    },
    useSortBy,
    usePagination,
    useRowSelect
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => fetchData({ pageIndex, pageSize }), [
    pageIndex,
    pageSize,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  React.useEffect(
    () => handleSortBy(sortBy[0].id, sortBy[0].desc ? 'desc' : 'asc'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy]
  );
  const tableId = 'cadences_table';
  return (
    <>
      <div
        {...getTableProps()}
        id={`${tableId}_wrapper`}
        className="table-responsive"
      >
        <Table
          hover
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: '1100px' }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => {
                  return (
                    <td
                      onMouseEnter={(e) => {
                        [
                          'Cadences',
                          'Status',
                          'Last Modified',
                          'Owner',
                        ].includes(column.render('Header')) &&
                          (e.currentTarget.className = 'text-email pointer');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = '';
                      }}
                      {...column.getHeaderProps(
                        [
                          'Cadences',
                          'Status',
                          'Last Modified',
                          'Owner',
                        ].includes(column.render('Header')) &&
                          column.getSortByToggleProps()
                      )}
                      style={{
                        width: column.width,
                        whiteSpace: 'nowrap',
                        textAlign: column.textAlign,
                      }}
                      title={
                        [
                          'Cadences',
                          'Status',
                          'Last Modified',
                          'Owner',
                        ].includes(column.render('Header'))
                          ? `Sort by ${column.Header}`
                          : null
                      }
                    >
                      {!['Favorite'].includes(column.render('Header')) &&
                        column.render('Header')}
                      {
                        // To show sort icon
                        column.isSorted && (
                          <i
                            className={`text-email ml-2 fas fa-arrow-${
                              column.isSortedDesc ? 'down' : 'up'
                            }`}
                          ></i>
                        )
                      }
                    </td>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {!loading &&
              !error &&
              rows.slice(0, 100).map((row, i) => {
                prepareRow(row);

                return (
                  <GridRow
                    row={row}
                    handleRowToolbarButton={handleRowToolbarButton}
                    key={i}
                    cadenceActions={cadenceActions}
                    cadenceName={cadenceName}
                    pathName={pathName}
                    canCreateCadence={canCreateCadence}
                  />
                );
              })}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Cadences Available.
                  </span>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                  <h6 className="text-danger mb-0">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    {cadencesResponse
                      ? cadencesResponse
                      : 'Failed to fetch data'}
                  </h6>
                  {cadenceData?.requestId && (
                    <>
                      <br />
                      <span className="text-danger text-sm">{`RequestId: ${cadenceData?.requestId}`}</span>{' '}
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <CardFooter>
        <TablePagination
          loading={loading}
          handleFirstPage={() => gotoPage(0)}
          handleLastPage={() => gotoPage(pageCount - 1)}
          totalPages={pageOptions.length}
          pageIndex={pageIndex + 1}
          handleGoToPage={(pageNumber) => gotoPage(pageNumber)}
          pageSize={pageSize}
          handleSetPageSize={(pageSize) => setPageSize(pageSize)}
          canPreviousPage={!canPreviousPage}
          canNextPage={!canNextPage}
          previousPage={() => previousPage()}
          nextPage={() => nextPage()}
          handleRefresh={handleRefresh}
          totalCount={totalCount}
        ></TablePagination>
      </CardFooter>
    </>
  );
}
export default withRouter(CadencesGrid);
