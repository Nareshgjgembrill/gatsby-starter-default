import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { Button, CardFooter, Table } from 'reactstrap';

import TablePagination from '../../Common/Pagination';
import UserContext from '../../UserContext';

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, row, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    return <input type="checkbox" ref={resolvedRef} {...rest} />;
  }
);

function GridRow({
  row,
  handleRowToolbarButton,
  rowKey,
  prospectActions,
  tabName,
  prospectSearchUrl,
  cadenceName,
  prospectData,
  cadenceId,
  touchcount,
}) {
  const [showCell, setShowCell] = useState(true);
  const prospect = row.original;
  const isDeletedProspect = row.original.isMemberDeleted;
  const prospectOwner = row?.original?.associations?.user[0]?.id
    ? row.original.associations.user[0].id
    : 0;
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const isActive = tabName.toLowerCase() === 'active';
  const isPaused = tabName.toLowerCase() === 'paused';

  return (
    <tr
      {...row.getRowProps()}
      onMouseOver={() => setShowCell(!showCell)}
      onMouseOut={() => setShowCell(!showCell)}
      key={rowKey}
    >
      {row.cells.map((cell, i) => {
        return (
          <td
            key={i}
            style={{
              width: cell.column.width,
              display:
                ['Last Activity'].indexOf(cell.column.Header) !== -1
                  ? showCell
                    ? ''
                    : 'none'
                  : '',
            }}
          >
            {cell.render('Cell')}
          </td>
        );
      })}
      <td
        {...row.getRowProps()}
        className="pb-0 pt-0 text-center"
        style={{
          display: showCell ? 'none' : '',
          verticalAlign: 'middle',
          width: '1000%',
        }}
        colSpan="1"
      >
        <Link
          title={`Dial ${row.original.phone}`}
          hidden={
            isDeletedProspect ||
            currentUserId !== prospectOwner ||
            !row.original.phone
          }
          to={{
            pathname: `/prospects/list/${prospect.id}?${prospectSearchUrl}`,
            state: {
              searchString: window.location.search,
              origin: window.location.pathname,
              prospect: prospect,
              dialingNumber: prospect.phone,
              cadenceName: cadenceName,
              rowIndex: row.index,
              allProspectsData: prospectData,
              cadenceId,
              touchcount,
            },
          }}
        >
          <i className="fas fa-phone-alt text-call"></i>
        </Link>
        <Button
          color="outline"
          title="Email"
          hidden={
            isDeletedProspect ||
            currentUserId !== prospectOwner ||
            !row.original.email
          }
          onClick={() =>
            handleRowToolbarButton(prospectActions.EMAIL, prospect)
          }
        >
          <i className="fas fa-envelope text-email"></i>
        </Button>
        <Button
          color="outline"
          title="Resume from Cadence"
          hidden={!isPaused || currentUserId !== prospectOwner}
          onClick={() =>
            handleRowToolbarButton(prospectActions.RESUME, prospect)
          }
        >
          <i className="fas fa-play"></i>
        </Button>
        <Button
          color="outline"
          title="Pause from Cadence"
          disabled={prospect.prospectStatus === 'PAUSED'}
          hidden={!isActive || currentUserId !== prospectOwner}
          onClick={() =>
            handleRowToolbarButton(prospectActions.PAUSE, prospect)
          }
        >
          <i className="fas fa-pause"></i>
        </Button>

        <Button
          color="outline"
          title={`Move to ${
            'fall Through' !== tabName ? 'another ' : ''
          }Cadence`}
          hidden={
            !(isActive || isPaused || 'fall Through' === tabName) ||
            currentUserId !== prospectOwner ||
            isDeletedProspect
          }
          onClick={() =>
            handleRowToolbarButton(
              prospectActions.MOVE_TO_ANOTHER_CADENCE,
              prospect
            )
          }
        >
          <i className="fas fa-arrows-alt"></i>
        </Button>
        <Button
          color="outline"
          title="Move to next touch"
          hidden={!(isActive || isPaused) || currentUserId !== prospectOwner}
          onClick={() =>
            handleRowToolbarButton(prospectActions.MOVE_TO_NEXT_TOUCH, prospect)
          }
        >
          <i className="fas fa-forward"></i>
        </Button>
        <Button
          color="outline"
          title="Exit Cadence"
          hidden={!(isActive || isPaused) || currentUserId !== prospectOwner}
          onClick={() =>
            handleRowToolbarButton(prospectActions.EXIT_CADENCE, prospect)
          }
        >
          <i className="fas fa-sign-out-alt"></i>
        </Button>
      </td>
    </tr>
  );
}

function CadenceDataGrid({
  columns,
  data,
  prospectData,
  fetchData,
  prospectsResponse,
  loading,
  error,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  currentPageIndex,
  handleRowToolbarButton,
  prospectActions,
  tabName,
  totalCount,
  sortBy: sortByColumn,
  orderBy,
  handleSortBy,
  handleRefresh,
  handleIntermediateCheck,
  prospectSearchUrl,
  cadenceName,
  cadenceId,
  touchcount,
}) {
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  // Use the state and functions returned from useTable to build your UI
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
    setSortBy,
    // Get the state from the instance
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      prospectData,
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
            <div className="py-2 mt-1 mb-n3 text-center">
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          Cell: ({ row }) => (
            <div
              className={
                row.original.isMemberDeleted ||
                currentUserId !== row.original.associations.user[0].id
                  ? 'd-none'
                  : 'd-block'
              }
            >
              <IndeterminateCheckbox
                {...row.getToggleRowSelectedProps()}
                row={row}
              />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

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

  React.useEffect(() => {
    setSortBy([{ id: sortByColumn, desc: orderBy === 'desc' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByColumn, orderBy]);

  React.useEffect(() => {
    handleIntermediateCheck(selectedFlatRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFlatRows]);

  const sortableColumns = [
    'Name',
    'Current Touch',
    'Touch',
    'Last Outcome',
    'Last Call Outcome',
    'Last Email Outcome',
    'Email Outcome',
    'Call Outcome',
    'Email',
    'Last Activity',
  ];

  const tableId = 'prospects_table';
  // Render the UI for your table
  return (
    <>
      <div
        {...getTableProps()}
        id={`${tableId}_wrapper`}
        className="table-responsive"
      >
        <Table
          className="table-hover"
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: '1100px' }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => {
                  return (
                    <td
                      onMouseEnter={(e) => {
                        sortableColumns.includes(column.render('Header')) &&
                          (e.currentTarget.className = 'text-email pointer');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = '';
                      }}
                      {...column.getHeaderProps(
                        sortableColumns.includes(column.render('Header')) &&
                          column.getSortByToggleProps()
                      )}
                      style={{
                        width: column.width,
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                        padding: '0px 10px',
                      }}
                      title={
                        sortableColumns.includes(column.render('Header'))
                          ? `Sort by ${column.Header}`
                          : null
                      }
                    >
                      {column.render('Header')}

                      <span className="ml-2">
                        {
                          // To show sort icon
                          column.isSorted && (
                            <i
                              className={`text-email fas fa-arrow-${
                                column.isSortedDesc ? 'down' : 'up'
                              }`}
                            ></i>
                          )
                        }
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Data available
                  </span>
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.slice(0, 100).map((row, i) => {
                prepareRow(row);

                return (
                  <GridRow
                    row={row}
                    handleRowToolbarButton={handleRowToolbarButton}
                    key={i}
                    prospectActions={prospectActions}
                    tabName={tabName}
                    prospectSearchUrl={prospectSearchUrl}
                    cadenceName={cadenceName}
                    prospectData={prospectData}
                    cadenceId={cadenceId}
                    touchcount={touchcount}
                  />
                );
              })}
            {error && (
              <tr>
                <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                  <h6 className="text-danger mb-0">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    {prospectsResponse
                      ? prospectsResponse
                      : 'Failed to fetch data'}
                  </h6>
                  {prospectData?.requestId && (
                    <>
                      <br />
                      <span className="text-danger text-sm">{`RequestId: ${prospectData?.requestId}`}</span>{' '}
                    </>
                  )}
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
          tableId="prospects_list"
        ></TablePagination>
      </CardFooter>
    </>
  );
}

export default CadenceDataGrid;
