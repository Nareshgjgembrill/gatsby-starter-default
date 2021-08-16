import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { Alert, CardFooter, Table } from 'reactstrap';
import moment from 'moment';
import { default as TablePagination } from '../../Common/Pagination';

const columns = [
  {
    Header: 'Cadences',
    accessor: 'name',
    width: '20%',
    Cell: function (props) {
      return (
        <span>
          <Link
            to={{
              pathname: '/cadences/' + props.row.original.id + '/touches/view',
              search: `${window.location.search}&cadence[name]=${props.value}&not=1`,
              state: {
                allCadencesData: props.cadencesData.accounts.data,
                origin: window.location.pathname,
                cadenceName: props.value,
                cadence: props.row.original,
              },
            }}
          >
            {props.value}
          </Link>
          {props?.row?.original?.status === 'INACTIVE' ? (
            <i
              className="fas fa-ban fa-sm text-danger ml-2"
              title="Inactive Cadence"
            ></i>
          ) : props?.row?.original?.status === 'PAUSED' ? (
            <i
              className="fas fa-pause fa-sm text-danger ml-2"
              title="Paused Cadence"
            ></i>
          ) : null}
        </span>
      );
    },
  },
  {
    Header: 'Status',
    accessor: 'status',
    width: '20%',
    Cell: function (props) {
      return <span>{props?.value ? props.value.toLowerCase() : ''}</span>;
    },
  },
  {
    Header: 'Owner',
    accessor: 'owner',
    width: '15%',
    Cell: function (props) {
      const rowData = props.row.original;
      const user = props.cadencesData.accounts.includedAssociations.user.find(
        (user) => user.id === rowData.associations.user[0].id
      );

      return (
        <span className="rounded-circle d-inline-block text-center p-1">
          {user.name}
        </span>
      );
    },
  },
  {
    Header: 'Created Date',
    accessor: 'createdDate',
    width: '15%',
    Cell: function (props) {
      return moment(props.value).utc().format('M/D/YYYY h:mm A');
    },
  },
];

function AccountCadencesGrid({
  currentPageIndex,
  cadencesData,
  data,
  fetchData,
  handleRefresh,
  loading,
  error,
  handleSort,
  orderBy,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  sortBy: sortByCol,
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
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      cadencesData,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  const tableId = 'account_cadence_table';
  return (
    <>
      <div className="table-responsive">
        <Table
          {...getTableProps()}
          id={`${tableId}`}
          style={{ whiteSpace: 'nowrap', minWidth: '800px' }}
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
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="7">
                  <Alert color="warning" className="mb-0 text-center">
                    <h4 className="mb-0">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      No Cadences Available
                    </h4>
                  </Alert>
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

export default AccountCadencesGrid;
