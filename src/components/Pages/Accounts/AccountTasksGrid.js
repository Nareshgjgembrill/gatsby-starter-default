import React, { useEffect } from 'react';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { Alert, CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';

function AccountTasksGrid({
  columns,
  currentPageIndex,
  data,
  taskData,
  loading,
  error,
  fetchData,
  handleRefresh,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  handleSort,
  orderBy,
  sortBy: sortByCol,
  totalCount,
  activeFilter,
  searchValue,
  prospectsData,
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
      prospectsData,
      taskData,
      activeFilter,
      searchValue,
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
    pageSize !== undefined && fetchData({ pageIndex, pageSize });
    // eslint-disable-next-line
  }, [pageIndex, pageSize]);

  useEffect(() => {
    sortByCol !== undefined && handleSort(sortBy[0].id, sortBy[0].desc);
  });

  const tableId = 'account_task_table';
  return (
    <>
      <div className="table-responsive">
        <Table
          {...getTableProps()}
          id={`${tableId}`}
          style={{ whiteSpace: 'nowrap', minWidth: '1300px' }}
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
                      style={{
                        width: column.width,
                        whiteSpace: 'nowrap',
                      }}
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
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell, j) => {
                      return (
                        <td
                          {...cell.getCellProps()}
                          style={{ width: cell.column.width }}
                          className="py-2"
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="7">
                  <Alert color="warning" className="mb-0 text-center">
                    <h4 className="mb-0">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      No Tasks Available
                    </h4>
                  </Alert>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="7">
                  <Alert color="danger" className="mb-0 text-center">
                    <h4 className="mb-0">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      Failed to fetch data
                    </h4>
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
          handleRefresh={handleRefresh}
          totalCount={totalCount}
        ></TablePagination>
      </CardFooter>
    </>
  );
}

export default AccountTasksGrid;
