/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React, { useEffect } from 'react';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

function SyncLogGrid({
  columns,
  currentPageIndex,
  data,
  error,
  fetchData,
  loading,
  syncLogData,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  handleSort,
  handleRefresh,
  sortBy: sortByCol,
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
    setSortBy,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      syncLogData,
      initialState: {
        pageIndex: currentPageIndex,
        pageSize: controlledPageSize,
        sortBy: [
          {
            id: sortByCol,
            desc: orderBy === 'desc',
          },
        ],
      },
      manualPagination: true,
      pageCount: controlledPageCount,
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
    setSortBy([{ id: sortByCol, desc: orderBy === 'desc' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByCol, orderBy]);

  useEffect(() => {
    if (sortBy.length > 0) {
      handleSort(sortBy[0].id, sortBy[0].desc);
    }
    // eslint-disable-next-line
  }, [sortBy]);

  const tableId = 'sync_log_table';
  return (
    <>
      <div
        className="table-responsive"
        {...getTableProps()}
        id={`${tableId}_wrapper`}
      >
        <Table
          {...getTableProps()}
          id={`${tableId}`}
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
                          (e.currentTarget.className = 'text-primary pointer');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = '';
                      }}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
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
                  <tr {...row.getRowProps()} className="sync-log-row" key={i}>
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
                    No sync logs available.
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
export default SyncLogGrid;
