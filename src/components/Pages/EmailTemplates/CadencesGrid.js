import React from 'react';
import { withRouter } from 'react-router-dom';
import ScrollArea from 'react-scrollbar';
import { usePagination, useRowSelect, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';

import TablePagination from '../../Common/Pagination';
import { useSortBy } from '@nextaction/components';

function GridRow({ row, rowKey }) {
  return (
    <tr {...row.getRowProps()} className="cadence-grid-row" key={rowKey}>
      {row.cells.map((cell, i) => {
        return (
          <td
            key={i}
            style={{
              width: cell.column.width,
            }}
          >
            {cell.render('Cell')}
          </td>
        );
      })}
    </tr>
  );
}

function CadencesGrid({
  columns,
  data,
  cadenceData,
  fetchData,
  loading,
  error,
  totalCount,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  currentPageIndex,
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
        <Table striped {...getTableProps()} id={`${tableId}`} className="mb-0">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => {
                  const textCenter =
                    column.render('Header').includes('Touch Number') &&
                    'text-center';
                  return (
                    <td
                      onMouseEnter={(e) => {
                        e.currentTarget.className = `text-primary pointer ${textCenter}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = `${textCenter}`;
                      }}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{ width: column.width, whiteSpace: 'nowrap' }}
                      className={textCenter}
                      title={`Sort by ${column.Header}`}
                    >
                      {column.render('Header')}
                      {
                        // To show sort icon
                        column.isSorted && (
                          <i
                            className={`text-info ml-2 fas fa-arrow-${
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
        </Table>
        <ScrollArea
          speed={0.8}
          className="area"
          contentClassName="content"
          horizontal={true}
          style={{ minHeight: '335px', maxHeight: '603px' }}
        >
          <Table striped hover>
            <tbody {...getTableBodyProps()}>
              {!loading &&
                !error &&
                rows.slice(0, 100).map((row, i) => {
                  prepareRow(row);

                  return <GridRow row={row} key={i} />;
                })}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center">
                    <span className="text-warning">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      No cadences Available.
                    </span>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                    <h6 className="text-danger mb-0">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      Failed to fetch data
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
        </ScrollArea>
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
