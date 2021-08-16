import React, { useEffect } from 'react';
import { usePagination, useRowSelect, useTable } from 'react-table';
import { Alert, CardFooter, Table } from 'reactstrap';
import { useSortBy } from '@nextaction/components';
import { default as TablePagination } from '../../Common/Pagination';

function AccountsGrid({
  columns,
  data,
  accountsData,
  fetchData,
  loading,
  error,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  currentPageIndex,
  handleSort,
  handleRefresh,
  sortBy: sortByCol,
  orderBy,
  totalCount,
}) {
  const {
    canNextPage,
    canPreviousPage,
    getTableBodyProps,
    getTableProps,
    gotoPage,
    headerGroups,
    nextPage,
    pageOptions,
    pageCount,
    prepareRow,
    previousPage,
    rows,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      accountsData,
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

  function GridRow({ row, rowKey }) {
    return (
      <tr {...row.getRowProps()} key={rowKey}>
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

  // eslint-disable-next-line
  useEffect(() => fetchData({ pageIndex, pageSize }), [pageIndex, pageSize]);

  // eslint-disable-next-line
  useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  useEffect(() => {
    if (sortBy.length > 0) {
      handleSort(sortBy[0].id, sortBy[0].desc);
    }
    // eslint-disable-next-line
  }, [sortBy]);

  const tableId = 'accounts_table';
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
          style={{ minWidth: '800px' }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  const headerAlign = [
                    'Stats',
                    'Prospects #',
                    'Owner',
                  ].includes(column.render('Header'))
                    ? 'text-center'
                    : 'text-left';
                  return (
                    <td
                      onMouseEnter={(e) => {
                        !column.disableSortBy &&
                          (e.currentTarget.className = `text-primary pointer border-top-0 ${headerAlign}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = `border-top-0 ${headerAlign}`;
                      }}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={`border-top-0 ${headerAlign}`}
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
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="7">
                  <Alert color="warning" className="mb-0 text-center">
                    <h4 className="mb-0">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      No acccounts available
                    </h4>
                  </Alert>
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.slice(0, pageSize).map((row, i) => {
                prepareRow(row);
                return <GridRow row={row} key={i} />;
              })}
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

export default AccountsGrid;
