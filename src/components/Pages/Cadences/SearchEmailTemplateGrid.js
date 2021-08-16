import React from 'react';
import { usePagination, useRowSelect, useTable } from 'react-table';
import { CardFooter, Table } from 'reactstrap';

import { default as TablePagination } from '../../Common/Pagination';
import { useSortBy } from '@nextaction/components';

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

function GridRow({ row, rowKey }) {
  return (
    <tr {...row.getRowProps()} className="cadence-grid-row" key={rowKey}>
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

function SearchEmailTemplateGrid({
  columns,
  data,
  templateData,
  fetchData,
  loading,
  error,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  totalCount,
  currentPageIndex,
  handleRowToolbarButton,
  cadenceActions,
  history,
  setSelectedRows,
  handleRefresh,
  sortBy: sortByColumn,
  orderBy,
  handleSortBy,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    // Get the state from the instance
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      templateData,
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
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox
                name="emailTemplateId"
                {...getToggleAllRowsSelectedProps()}
              />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox
                name="emailTemplateId"
                {...row.getToggleRowSelectedProps()}
              />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  React.useEffect(() => {
    setSelectedRows(selectedFlatRows.map((row) => row.original));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlatRows]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => fetchData({ pageIndex, pageSize }), [
    pageIndex,
    pageSize,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  React.useEffect(
    () => handleSortBy(sortBy[0].id, sortBy[0].desc ? 'desc' : 'asc'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortBy]
  );

  const tableId = 'cadences_table';
  return (
    <div
      {...getTableProps()}
      id={`${tableId}_wrapper`}
      className="table-responsive"
    >
      <Table className="table-hover" {...getTableProps()} id={`${tableId}`}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                return (
                  <td
                    onMouseEnter={(e) => {
                      ['Template Name'].includes(column.render('Header')) &&
                        (e.currentTarget.className = 'text-email pointer');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.className = '';
                    }}
                    {...column.getHeaderProps(
                      ['Template Name'].includes(column.render('Header')) &&
                        column.getSortByToggleProps()
                    )}
                    width={column.width}
                    style={{ fontWeight: 'bold' }}
                  >
                    {column.render('Header')}
                    {
                      // To show sort icon
                      column.isSorted && (
                        <i
                          className={`text-email ml-2 fas fa-arrow-${
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
          {!loading &&
            !error &&
            rows.slice(0, 100).map((row, i) => {
              prepareRow(row);

              return (
                <GridRow
                  row={row}
                  handleRowToolbarButton={handleRowToolbarButton}
                  key={i}
                  cadenceActions={cadenceActions}
                  history={history}
                />
              );
            })}
          {!loading && !error && rows.length === 0 && (
            <tr>
              <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                <span className="text-warning">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  No Template Available
                </span>
              </td>
            </tr>
          )}

          {error && (
            <tr>
              <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                <span className="text-danger">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch data
                </span>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
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
        ></TablePagination>
      </CardFooter>
    </div>
  );
}
export default SearchEmailTemplateGrid;
