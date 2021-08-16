/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React from 'react';
import { usePagination, useSortBy, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

function TouchOutcomeGrid({
  columns,
  data,
  error,
  loading,
  handleRefresh,
  outcomesData,
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
      outcomesData,
      initialState: {
        pageIndex: 0,
        sortBy: [
          {
            id: 'touchType',
          },
        ],
      },
    },

    useSortBy,
    usePagination,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        ...columns,
        /* TODO Now Edit outcome is not needed. So i have commentted below line.i will uncomment the below lines when the edit option is need  */
        {
          /*  {
            id: 'action',
            Header: 'Action',
            disableSortBy: true,
            Cell: ({ row }) => (
              <span className="text-center">
                <i
                  className="fas fa-pencil-alt mr-2 pointer"
                  title="Edit Tag"
                  onClick={() => {
                    handleUpdateOutcome(row);
                  }}
                ></i>
              </span>
            ),
          },*/
        },
      ]);
    }
  );

  const tableId = 'touch_outcome_table';
  return (
    <>
      <div
        className="table-responsive"
        {...getTableProps()}
        id={`${tableId}_wrapper`}
      >
        <Table
          className="table-hover"
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: '800px' }}
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
                    className="text-center"
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
              page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} className="outcome-row" key={i}>
                    {row.cells.map((cell, i) => (
                      <td
                        key={i}
                        style={{
                          width: cell.column.width,
                        }}
                        className="text-center"
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

export default TouchOutcomeGrid;
