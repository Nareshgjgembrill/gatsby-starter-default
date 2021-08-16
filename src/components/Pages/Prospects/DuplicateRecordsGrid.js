/**
 * @author ranbarasan82
 * @version V11.0
 */
import React from 'react';
import { usePagination, useTable } from 'react-table';
import { Card, CardBody, CardFooter, Table } from 'reactstrap';
import TablePagination from '../../Common/Pagination';

const DuplicateRecordsGrid = ({
  columns,
  data,
  loading,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  totalCount,
  currentPageIndex,
  fetchData,
}) => {
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
    // Get the state from the instance
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: currentPageIndex,
        pageSize: controlledPageSize,
      },
      manualPagination: true,
      manualSortBy: false,
      pageCount: controlledPageCount,
      disableSortRemove: true,
    },
    usePagination,

    (hooks) => {
      hooks.visibleColumns.push((columns) => [...columns]);
    }
  );
  // Listen for changes in pagination and use the state to fetch our new data
  React.useEffect(
    () => fetchData({ pageIndex, pageSize }),
    // eslint-disable-next-line
    [pageIndex, pageSize]
  );

  // This line is required to reset the page offset when prospect page tab(ALL, Paused, Active, Unassigned) changed
  React.useEffect(
    () => gotoPage(currentPageIndex),
    // eslint-disable-next-line
    [currentPageIndex]
  );

  const tableId = 'export_duplicate_record';
  return (
    <Card className="border-0 shadow-none mb-0">
      <CardBody className="p-0">
        <div className="table-responsive" id={`${tableId}_wrapper`}>
          <Table className="table-hover" {...getTableProps()}>
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <td
                      {...column.getHeaderProps()}
                      style={{ width: column.width, whiteSpace: 'nowrap' }}
                    >
                      {column.render('Header')}
                    </td>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} style={{ tableLayout: 'fixed' }}>
              {rows.slice(0, 200).map((row, rowKey) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={rowKey}>
                    {row.cells.map((cell, colIndex) => {
                      return (
                        <td
                          key={colIndex}
                          style={{ width: cell.column.width }}
                          title={cell.value}
                        >
                          {cell.value && cell.value.length > 20
                            ? cell.value.slice(0, 19) + '..'
                            : cell.render('Cell')}
                        </td>
                      );
                    })}
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
            pageIndex={pageIndex + 1}
            handleGoToPage={(pageNumber) => gotoPage(pageNumber)}
            pageSize={parseInt(pageSize)}
            handleSetPageSize={(pageSize) => setPageSize(pageSize)}
            canPreviousPage={!canPreviousPage}
            canNextPage={!canNextPage}
            previousPage={() => previousPage()}
            nextPage={() => nextPage()}
            tableId="duplicate_list"
            totalCount={totalCount}
            totalPages={pageOptions ? pageOptions.length : 0}
          ></TablePagination>
        </CardFooter>
      </CardBody>
    </Card>
  );
};
export default DuplicateRecordsGrid;
