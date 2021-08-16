/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, { useEffect } from 'react';
import ScrollArea from 'react-scrollbar';
import { usePagination, useTable } from 'react-table';
import { CardFooter, Table, Progress } from 'reactstrap';
import { useSortBy } from '@nextaction/components';
import TablePagination from '../../Common/Pagination';
import {
  FAILED_TO_FETCH_DATA,
  SORRY_NO_DATA_AVAILABLE,
} from '../../../util/index';

function GridRow({ row, rowKey }) {
  return (
    <tr {...row.getRowProps()} key={rowKey}>
      {row.cells.map((cell, i) => {
        return (
          <td
            key={i}
            style={{
              paddingLeft: cell.column.paddingLeft,
              width: cell.column.width,
              minWidth: cell.column.width,
              maxWidth: cell.column.width,
            }}
            className="py-1"
          >
            {cell.render('Cell')}
          </td>
        );
      })}
    </tr>
  );
}

const ProspectGrid = ({
  columns,
  data,
  additionalData,
  handleFetch,
  loading,
  error,
  pageCount: controlledPageCount,
  totalCount,
  pageSize: controlledPageSize,
  currentPageIndex,
  sortBy: sortByColumn,
  orderBy,
  handleRefresh,
  bucketKey,
  bucketName,
  display,
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
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
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
    usePagination
  );

  // refetching prospects list when sort, index or page size is changed
  useEffect(() => {
    if (
      bucketKey !== undefined &&
      bucketName !== undefined &&
      pageIndex !== undefined &&
      pageSize !== undefined &&
      sortBy[0].id !== undefined &&
      sortBy[0].desc !== undefined
    ) {
      let sortColumn = sortBy[0].id;
      if (sortColumn === 'contactName') {
        sortColumn = 'contact_name';
      } else if (sortColumn === 'accountName') {
        sortColumn = 'account_name';
      } else if (sortColumn === 'title') {
        sortColumn = 'title';
      } else if (sortColumn === 'cadenceName') {
        sortColumn = 'campaign_name';
      } else if (sortColumn === 'email') {
        sortColumn = 'email_id';
      } else if (sortColumn === 'activityDate') {
        sortColumn = 'activityDate';
      }

      handleFetch(
        bucketKey,
        bucketName,
        pageIndex,
        pageSize,
        sortColumn,
        sortBy[0].desc ? 'desc' : 'asc'
      );
    }
  }, [pageIndex, pageSize, bucketKey, bucketName, sortBy, handleFetch]);

  useEffect(() => gotoPage(pageIndex), [pageIndex, gotoPage]);

  const tableId = 'prospects_table';
  return (
    <div className="mx-2">
      <div className={display ? 'd-flex flex-column' : 'd-none'}>
        {!loading &&
          !error &&
          bucketName?.toLowerCase() === 'calls made' &&
          additionalData?.callsMade !== undefined &&
          totalCount - additionalData?.callsMade >= 0 && (
            <div className="d-flex justify-content-end pr-2 text-color-sunset text-bold">
              DA Calls: {totalCount - additionalData?.callsMade}
            </div>
          )}
        <div
          {...getTableProps()}
          id={`${tableId}_wrapper`}
          className="table-responsive text-sm"
        >
          <Table
            striped
            {...getTableProps()}
            id={`${tableId}`}
            style={{ minWidth: '1500px', tableLayout: 'fixed' }}
          >
            <thead>
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column, index) => {
                    return (
                      <td
                        {...column.getHeaderProps(
                          [
                            'Contact Name',
                            'Account Name',
                            'Title',
                            'Email',
                            'Cadence',
                            'Date/Time',
                          ].includes(column.render('Header')) &&
                            column.getSortByToggleProps()
                        )}
                        onMouseEnter={(e) => {
                          [
                            'Contact Name',
                            'Account Name',
                            'Title',
                            'Email',
                            'Cadence',
                            'Date/Time',
                          ].includes(column.render('Header')) &&
                            (e.currentTarget.className =
                              'text-primary pointer');
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.className = '';
                        }}
                        style={{
                          paddingLeft: column.paddingLeft,
                          paddingRight: column.paddingRight,
                          width: column.width,
                          minWidth: column.width,
                          maxWidth: column.width,
                        }}
                        className="text-nowrap text-bold"
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
          </Table>
          <ScrollArea
            speed={0.8}
            className="area"
            contentClassName="content"
            horizontal={true}
            style={{
              minHeight: '300px',
              maxHeight: '300px',
              minWidth: '1500px',
            }}
          >
            <Table striped hover>
              <tbody {...getTableBodyProps()} className="ml-0">
                {!loading &&
                  !error &&
                  rows.slice(0, 100).map((row, i) => {
                    prepareRow(row);

                    return <GridRow row={row} key={bucketKey + '_' + i} />;
                  })}
                {loading && !error && (
                  <tr>
                    <td colSpan="10">
                      <Progress animated striped value="100">
                        Loading Prospects...
                      </Progress>
                    </td>
                  </tr>
                )}
                {!loading && !error && rows.length === 0 && (
                  <tr>
                    <td colSpan="10">
                      <p className="text-warning text-center py-2">
                        {SORRY_NO_DATA_AVAILABLE}
                      </p>
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan="10">
                      <p className="text-warning text-center py-2">
                        {FAILED_TO_FETCH_DATA}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ScrollArea>
        </div>
        <CardFooter>
          {(loading || rows?.length !== 0) && (
            <TablePagination
              loading={loading}
              handleFirstPage={() => gotoPage(0)}
              handleLastPage={() => gotoPage(pageCount - 1)}
              totalPages={pageOptions.length}
              pageIndex={parseInt(pageIndex) + 1}
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
          )}
        </CardFooter>
      </div>
    </div>
  );
};

export default ProspectGrid;
