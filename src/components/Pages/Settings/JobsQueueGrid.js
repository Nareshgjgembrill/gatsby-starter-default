/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, { useEffect } from 'react';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';
import { default as TablePagination } from '../../Common/Pagination';

function JobsQueueGrid({
  columns,
  currentPageIndex,
  offset,
  data,
  error,
  fetchData,
  loading,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  handleSort,
  handleRefresh,
  sortBy: sortByColumn,
  orderBy,
  totalCount,
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
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
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
      pageCount: controlledPageCount,
      manualPagination: true,
      manualSortBy: true,
      disableSortRemove: true,
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [...columns]);
    }
  );
  // eslint-disable-next-line
  useEffect(() => fetchData({ pageIndex, pageSize }), [pageIndex, pageSize]);

  // eslint-disable-next-line
  useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  useEffect(() => {
    if (sortBy.length > 0) {
      const sortColumn = sortBy[0].id;
      handleSort(sortColumn, sortBy[0].desc);
    }
    // eslint-disable-next-line
  }, [sortBy]);

  return (
    <>
      <div className="table-responsive" {...getTableProps()}>
        <Table
          {...getTableProps()}
          style={{
            width: '100%',
            minWidth: '500px',
          }}
          className="table-hover"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  return (
                    <td
                      onMouseEnter={(e) => {
                        !column.disableSortBy &&
                          [
                            'Job Type',
                            'Start Time',
                            'End Time',
                            'Status',
                            'Request Id',
                          ].includes(column.render('Header')) &&
                          (e.currentTarget.className = 'text-primary pointer');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = '';
                      }}
                      {...column.getHeaderProps(
                        [
                          'Job Type',
                          'Start Time',
                          'End Time',
                          'Status',
                          'Request Id',
                        ].includes(column.render('Header')) &&
                          column.getSortByToggleProps()
                      )}
                      style={
                        column.disableSortBy
                          ? { width: column.width }
                          : { width: column.width, whiteSpace: 'nowrap' }
                      }
                      title={
                        !column.disableSortBy
                          ? 'Sort by ' + column.Header
                          : null
                      }
                    >
                      {column.render('Header')}
                      {column.isSorted && (
                        <i
                          className={`text-primary ml-2 fas fa-arrow-${
                            column.isSortedDesc ? 'down' : 'up'
                          }`}
                        ></i>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {!loading &&
              !error &&
              rows.slice(0, pageSize).map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="job-queue-row" key={i}>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        style={{
                          width: cell.column.width,
                          whiteSpace: 'nowrap',
                        }}
                        className="border-0 py-1 text-sm text-gray-dark"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No jobs available.
                  </span>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="7" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-danger">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    {FAILED_TO_FETCH_DATA}
                  </span>
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
        />
      </CardFooter>
    </>
  );
}
export default JobsQueueGrid;
