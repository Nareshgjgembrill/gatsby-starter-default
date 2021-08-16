/*
 * @author @rManimegalai
 * @version V11.0
 */
import React, { useEffect } from 'react';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return <input type="checkbox" ref={resolvedRef} {...rest} />;
  }
);
function EmailScheduleGrid({
  columns,
  currentPageIndex,
  data,
  orderBy,
  sortBy: sortByCol,
  handleSort,
  emailScheduleData,
  error,
  fetchData,
  handleSelectedRows,
  loading,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  rowSelectedValue,
  handleRefresh,
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
    state: { selectedRowIds, pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      emailScheduleData,
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
      manualSortBy: true,
      pageCount: controlledPageCount,
      disableSortRemove: true,
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'schedule_select',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),

          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox
                {...row.getToggleRowSelectedProps()}
                onClick={() => rowSelectedValue(row)}
              />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );
  // eslint-disable-next-line
  useEffect(() => fetchData({ pageIndex, pageSize }), [pageIndex, pageSize]);

  // eslint-disable-next-line
  useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  useEffect(() => {
    handleSelectedRows(selectedRowIds);
    // eslint-disable-next-line
  }, [selectedRowIds]);

  // eslint-disable-next-line
  useEffect(() => handleSort(sortBy[0].id, sortBy[0].desc), [sortBy]);

  const tableId = 'email_schedule_table';

  return (
    <>
      <div className="table-responsive">
        <Table
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: '800px' }}
          className="table-hover"
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
                    title={
                      !column.disableSortBy ? 'Sort by ' + column.Header : null
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
                  <tr {...row.getRowProps()} className="email-row" key={i}>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        style={{ width: cell.column.width }}
                        className="py-2"
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
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
export default EmailScheduleGrid;
