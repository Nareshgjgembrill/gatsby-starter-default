/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React from 'react';
import { usePagination, useSortBy, useTable } from 'react-table';
import { Alert, CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

function HolidayGrid({
  columns,
  currentPageIndex,
  data,
  error,
  fetchData,
  loading,
  totalCount,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    pageOptions,
    pageCount,
    previousPage,
    rows,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      disableSortRemove: true,
      initialState: {
        pageIndex: currentPageIndex,
        pageSize: controlledPageSize,
      },
      manualPagination: true,
      pageCount: controlledPageCount,
    },
    useSortBy,
    usePagination,

    (hooks) => {
      hooks.visibleColumns.push((columns) => [...columns]);
    }
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => fetchData({ pageIndex, pageSize }), [
    pageIndex,
    pageSize,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  const tableId = 'tag_table';
  return (
    <>
      <div
        className="table-responsive"
        {...getTableProps()}
        id={`${tableId}_wrapper`}
      >
        <Table
          hover
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: '700px' }}
          className="border-bottom"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
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
                    className="text-bold"
                  >
                    {column.render('Header')}
                    <span className="ml-2">
                      {column.isSorted && (
                        <i
                          className={`text-info ml-2 fas fa-arrow-${
                            column.isSortedDesc ? 'down' : 'up'
                          }`}
                        ></i>
                      )}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {!loading &&
              !error &&
              rows.slice(0, pageSize).map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="tag-row" key={i}>
                    {row.cells.map((cell, i) => (
                      <td key={i} style={{ width: cell.column.width }}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            {!loading && !error && rows && rows.length === 0 && (
              <tr>
                <td colSpan="7">
                  <Alert color="warning" className="text-center mb-0">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No holidays found.
                  </Alert>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="7">
                  <Alert color="danger" className="text-center" role="alert">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    {FAILED_TO_FETCH_DATA}
                  </Alert>
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
          totalCount={totalCount}
        />
      </CardFooter>
    </>
  );
}
export default HolidayGrid;
