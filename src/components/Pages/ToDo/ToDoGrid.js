/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useEffect } from 'react';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';

function ToDoGrid({
  columns,
  data,
  todoData,
  fetchData,
  loading,
  error,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  currentPageIndex,
  handleRefresh,
  handleSort,
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
      todoData,
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
    useRowSelect
  );

  useEffect(() => {
    setSortBy([{ id: sortByCol, desc: orderBy === 'desc' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByCol, orderBy]);

  useEffect(() => {
    fetchData({ pageIndex, pageSize });
    // eslint-disable-next-line
  }, [pageIndex, pageSize]);

  useEffect(() => {
    gotoPage(currentPageIndex);
    // eslint-disable-next-line
  }, [currentPageIndex]);

  useEffect(() => {
    handleSort(sortBy[0].id, sortBy[0].desc);
    // eslint-disable-next-line
  }, [sortBy]);

  const tableId = 'todo_table';

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
          style={{ minWidth: '1000px' }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  return (
                    <td
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      style={{ width: column.width, whiteSpace: 'nowrap' }}
                      onMouseEnter={(e) => {
                        !column.disableSortBy &&
                          (e.currentTarget.className = 'text-primary pointer');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = '';
                      }}
                      title={
                        [
                          'Name',
                          'Cadence',
                          'Current Touch',
                          'Due',
                          'Last Modified',
                        ].includes(column.render('Header'))
                          ? `Sort by ${column.Header}`
                          : null
                      }
                    >
                      {column.render('Header')}
                      {
                        // To show sort icon
                        column.isSorted && (
                          <i
                            className={`text-primary ml-2 fas fa-arrow-${
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
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No To Do Available
                  </span>
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.slice(0, pageSize).map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell, j) => {
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{
                            width: cell.column.width,
                            whiteSpace:
                              ['Current Touch', 'Due', 'Last Contact'].indexOf(
                                cell.column.Header
                              ) !== -1
                                ? 'nowrap'
                                : '',
                          }}
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            {error && (
              <tr>
                <td colSpan="7" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-danger">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    Failed to fetch data
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
        ></TablePagination>
      </CardFooter>
    </>
  );
}

export default ToDoGrid;
