/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React from 'react';
import { usePagination, useSortBy, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';
import { FAILED_TO_FETCH_DATA } from '../../../util/index';

function TagGrid({
  columns,
  currentPageIndex,
  data,
  tagData,
  error,
  fetchData,
  loading,
  orderBy,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  sortBy: sortByCol,
  totalCount,
  handleRefresh,
  handleSort,
  handleUpdateTag,
  handleDeleteTag,
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
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      tagData,
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

    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        ...columns,
        {
          id: 'action',
          disableSortBy: true,
          width: '20%',
          Header: 'Action',
          Cell: ({ row }) => (
            <span className="text-center">
              <i
                className="fas fa-pencil-alt fa-sm mr-2 pointer"
                title="Edit Tag"
                onClick={() => {
                  handleUpdateTag(row);
                }}
              ></i>
              <i
                className="far fa-trash-alt fa-sm pointer"
                title="Delete Tag"
                onClick={() => {
                  handleDeleteTag(row);
                }}
              ></i>
            </span>
          ),
        },
      ]);
    }
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => fetchData({ pageIndex, pageSize }), [
    pageIndex,
    pageSize,
  ]);

  // eslint-disable-next-line
  React.useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  // eslint-disable-next-line
  React.useEffect(() => handleSort(sortBy[0].id, sortBy[0].desc), [sortBy]);

  const tableId = 'tag_table';
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
                        ? column.Header === 'Action'
                          ? { width: column.width, textAlign: 'center' }
                          : { width: column.width }
                        : { width: column.width, whiteSpace: 'nowrap' }
                    }
                    title={
                      !column.disableSortBy ? 'Sort by ' + column.Header : null
                    }
                  >
                    {column.render('Header')}
                    <span className="ml-2">
                      {column.isSorted && (
                        <i
                          className={`text-primary ml-2 fas fa-arrow-${
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
                      <td
                        key={i}
                        style={
                          cell.column.Header === 'Action'
                            ? {
                                width: cell.column.width,
                                textAlign: 'center',
                              }
                            : { width: cell.column.width }
                        }
                      >
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            {!loading && !error && rows && rows.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No tags available
                  </span>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="3" className="text-center mb-0 bg-gray-lighter">
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
export default TagGrid;
