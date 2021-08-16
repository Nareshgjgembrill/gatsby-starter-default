import React, { useEffect } from 'react';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { Alert, CardFooter, Table } from 'reactstrap';
import moment from 'moment';
import { default as TablePagination } from '../../Common/Pagination';

const columns = [
  {
    Header: 'Name',
    accessor: 'contactName',
    width: '20%',
    Cell: function (props) {
      return (
        <span>
          {props.value && props.value.length > 30
            ? props.value.slice(0, 29) + '...'
            : props.value}
          <br></br>
          {props?.row?.original?.title && (
            <>
              <small>{props.row.original.title}</small>
              <br />
            </>
          )}
          <em>{props.row.original.accountName}</em>
        </span>
      );
    },
  },
  {
    Header: 'Cadence',
    accessor: 'cadence',
    width: '15%',
    Cell: function (props) {
      const rowData = props?.row?.original;
      let cadence;
      if (
        rowData.associations &&
        rowData.associations.cadence &&
        props.prospectsData.prospects.includedAssociations.cadence &&
        rowData.associations.cadence[0].id !== null
      ) {
        cadence = props.prospectsData.prospects.includedAssociations.cadence.find(
          (cadence) => cadence.id === rowData.associations.cadence[0].id
        );
        return <span>{cadence && cadence.name}</span>;
      } else return null;
    },
  },
  {
    Header: 'Touch',
    accessor: 'cadenceStatus',
    width: '13%',
    Cell: function (props) {
      return <span>{props?.row?.original?.cadenceStatus}</span>;
    },
  },
  {
    Header: 'Phone #',
    accessor: 'phone',
    width: '11%',
    disableSortBy: true,
  },
  {
    Header: 'Email',
    accessor: 'email',
    width: '13%',
  },
  {
    Header: 'Date/Time',
    accessor: 'activityDate',
    width: '15%',
    Cell: function (props) {
      return moment
        .utc(props?.row?.original?.activityDate, 'MM/DD/YYYY[ ]hh:mm A')
        .local()
        .format('M/D/YYYY h:mm A');
    },
  },
  {
    Header: 'Outcome',
    accessor: 'outcome',
    disableSortBy: true,
    width: '10%',
  },
];

function AccountOutcomeGrid({
  currentPageIndex,
  data,
  fetchData,
  handleRefresh,
  prospectsData,
  loading,
  error,
  handleSort,
  orderBy,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  sortBy: sortByCol,
  totalCount,
  type,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    pageOptions,
    pageCount,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      type,
      data,
      prospectsData,
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
    sortByCol !== undefined && handleSort(sortBy[0].id, sortBy[0].desc, type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  return (
    <>
      <Table
        {...getTableProps()}
        id="account_outcome_table"
        hover
        style={{ whiteSpace: 'nowrap' }}
        className="table-hover"
        responsive
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
                >
                  {column.render('Header')}
                  <span className="ml-2">
                    {column.isSorted && (
                      <i
                        className={`text-muted ml-2 fas fa-arrow-${
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
          {!loading && !error && rows.length === 0 && (
            <tr>
              <td colSpan="7">
                <Alert color="warning" className="mb-0 text-center">
                  <h4 className="mb-0">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Prospects Available
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
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>{' '}
                    Failed to fetch data
                  </h4>
                </Alert>
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
          handleRefresh={handleRefresh}
          totalCount={totalCount}
        ></TablePagination>
      </CardFooter>
    </>
  );
}

export default AccountOutcomeGrid;
