/*
 * @author @Manimegalai
 * @version V11.0
 */
import React from 'react';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';

const IndeterminateCheckbox = React.forwardRef(
  ({ selected, indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;
    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return <input type="checkbox" ref={resolvedRef} {...rest} />;
  }
);

function SyncActivityGrid({
  columns,
  data,
  error,
  loading,
  handleRefresh,
  fetchData,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  currentPageIndex,
  changeCheckBoxState,
  syncActivityCheckedAll,
  totalCount,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: currentPageIndex,
        pageSize: controlledPageSize,
      },
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'selection',
          disableSortBy: true,
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox
                {...getToggleAllRowsSelectedProps()}
                checked={syncActivityCheckedAll}
                onChange={() => {
                  changeCheckBoxState(!syncActivityCheckedAll);
                }}
              />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox
                {...row.getToggleRowSelectedProps()}
                onChange={() => {
                  changeCheckBoxState(row, pageCount);
                }}
              />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => fetchData({ pageIndex, pageSize }), [
    pageIndex,
    pageSize,
  ]);

  const tableId = 'sync_outcome_table';
  return (
    <>
      <div
        {...getTableProps()}
        id={`${tableId}_wrapper`}
        className="table-responsive"
      >
        <Table
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: '800px' }}
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
                    style={{ width: column.width, whiteSpace: 'nowrap' }}
                    title={
                      !column.disableSortBy ? 'Sort by ' + column.Header : null
                    }
                  >
                    {column.render('Header')}
                    {column.isSorted && (
                      <i
                        className={`text-info ml-2 fas fa-arrow-${
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
              page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="outcome-row" key={i}>
                    {row.cells.map((cell, i) => (
                      <td key={i} style={{ width: cell.column.width }}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
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

export default SyncActivityGrid;
