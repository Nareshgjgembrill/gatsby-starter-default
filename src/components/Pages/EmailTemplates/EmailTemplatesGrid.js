import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { Button, CardFooter, Table } from 'reactstrap';
import { default as TablePagination } from '../../Common/Pagination';

function EmailTemplatesRow({
  handleRowToolbarButton,
  pathName,
  row,
  rowKey,
  snippetActions,
  RowToolBarHoverParms,
  tabName,
  templatesData,
  templateActions,
  selectedUserId,
  currentUserId,
}) {
  const [showCell, setShowCell] = useState(true);
  const template = row.original;

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
            className={
              ['Stats'].indexOf(cell.column.Header) !== -1
                ? showCell
                  ? ''
                  : 'overstats'
                : ''
            }
            style={{
              width: cell.column.width,
              display:
                ['Tags', 'Last Modified'].indexOf(cell.column.Header) !== -1
                  ? showCell
                    ? ''
                    : 'none'
                  : '',
              textAlign:
                ['Stats', 'Last Modified', 'Tags', 'Owner'].indexOf(
                  cell.column.Header
                ) !== -1
                  ? 'center'
                  : 'left',
            }}
          >
            {cell.render('Cell')}
          </td>
        );
      })}
      <td
        {...row.getRowProps()}
        className="text-right pb-0 pt-0 pr-5"
        style={{
          display: showCell ? 'none' : '',
          verticalAlign: 'middle',
          width: '1000%',
        }}
        colSpan="2"
      >
        {tabName === 'Templates' && (
          <>
            <Link
              className="mx-1"
              to={{
                pathname: `templates/emails/${template.id}/edit`,
                search: window.location.search,
                state: {
                  pathName: pathName,
                  search: window.location.search,
                },
              }}
              title="Edit Template"
            >
              <span className="bg-transparent rounded-circle py-2 px-1">
                <i className="fas fa-pencil-alt"></i>
              </span>
            </Link>
            <Link
              className=""
              to={{
                pathname: `templates/emails/${template.id}/clone`,
                search: window.location.search,
                state: {
                  pathName: pathName,
                  search: window.location.search,
                },
              }}
              title="Clone Template"
            >
              <span className="bg-transparent rounded-circle py-2 px-1">
                <i className="fas fa-clone fa-sm"></i>
              </span>
            </Link>
            {/* Temporarily hidden as per anu's suggestion and will be shown in future versions. */}
            {/* <Button
              color="outline"
              hidden 
              title="Template Performance"
              onClick={() =>
                handleRowToolbarButton(
                  templateActions.TEMPLATE_PERFORMANCE,
                  template
                )
              }
              className="mr-2 btn-xs"
            >
              <i className="fas fa-chart-line"></i>
            </Button> */}
            <Button
              color="outline"
              title="Tag"
              onClick={() =>
                handleRowToolbarButton(templateActions.TAG, template)
              }
              className="btn-xs"
              hidden={selectedUserId !== currentUserId}
            >
              <i className="fa fa-tag"></i>
            </Button>
            <Button
              color="outline"
              title="Cadences"
              onClick={() =>
                handleRowToolbarButton(
                  templateActions.TEMPLATE_CADENCES,
                  template
                )
              }
              className="btn-xs"
            >
              <i className="svgicon koncert-cadence-icon"></i>
            </Button>
            <Button
              color="outline"
              title={`Make the Template ${
                template.status === false ? 'Active' : 'Inactive'
              }`}
              onClick={() =>
                handleRowToolbarButton(templateActions.STATUS_CHANGE, template)
              }
              className="btn-xs"
            >
              <i
                className={
                  template.status === false ? 'fas fa-check' : 'fas fa-ban'
                }
              ></i>
            </Button>
            <Button
              color="outline"
              title="Delete template"
              className="btn-sm pl-1"
              onClick={() =>
                handleRowToolbarButton(
                  templateActions.DELETE_TEMPLATE,
                  template
                )
              }
            >
              <i className="fas fa-trash"></i>
            </Button>
          </>
        )}
        {tabName === 'Snippets' && (
          <>
            <Link
              className="mr-2"
              to={{
                pathname: `/templates/snippets/${row.original.id}/edit`,
                search: window.location.search,
                state: {
                  pathName: pathName,
                  search: window.location.search,
                },
              }}
              title="Edit Snippet"
            >
              <i className="fas fa-pencil-alt px-1"></i>
            </Link>
            <Link
              className="mr-2"
              to={{
                pathname: `/templates/snippets/${row.original.id}/clone`,
                search: window.location.search,
                state: {
                  pathName: pathName,
                  search: window.location.search,
                },
              }}
              title="Clone Snippet"
            >
              <i className="fas fa-clone pr-1"></i>
            </Link>
            <Button
              color="outline"
              title="Tag"
              onClick={() =>
                handleRowToolbarButton(snippetActions.TAG, row.original)
              }
              className="btn-xs"
              hidden={selectedUserId !== currentUserId}
            >
              <i className="fa fa-tag"></i>
            </Button>
            <Button
              color="outline"
              title="Delete snippet"
              className="mr-2 btn-sm pt-0 pl-0 pb-1"
              onClick={() =>
                handleRowToolbarButton(
                  snippetActions.DELETE_SNIPPET,
                  row.original
                )
              }
            >
              <i className="fas fa-trash"></i>
            </Button>
          </>
        )}
      </td>
    </tr>
  );
}

function EmailTemplatesGrid({
  columns,
  currentPageIndex,
  data,
  error,
  fetchData,
  listResponse,
  handleRefresh,
  handleRowToolbarButton,
  handleSortBy,
  loading,
  orderBy,
  totalCount,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  pathName,
  snippetActions,
  sortBy: sortByColumn,
  tabName,
  templatesData,
  templateActions,
  currentUserId,
  selectedUserId,
}) {
  // Use the state and functions returned from useTable to build your UI
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
      templatesData,
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
    useRowSelect
  );

  // Listen for changes in pagination and use the state to fetch our new data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchData({ pageIndex, pageSize }), [pageIndex, pageSize]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => gotoPage(currentPageIndex), [currentPageIndex]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => handleSortBy(sortBy[0].id, sortBy[0].desc ? 'desc' : 'asc'), [
    sortBy,
  ]);

  const tableId = 'templates_table';

  // Render the UI for your table
  const templateSortParams = ['Name', 'Subject', 'Last Modified'];
  const snippetsSortparms = ['Name', 'Last Modified'];
  const sortParms =
    tabName === 'Templates' ? templateSortParams : snippetsSortparms;

  return (
    <>
      <div
        className="table-responsive"
        {...getTableProps()}
        id={`${tableId}_wrapper`}
      >
        <Table
          hover
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: tabName === 'Snippets' ? '800px' : '1100px' }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  return (
                    <td
                      onMouseEnter={(e) => {
                        !column.disableSortBy &&
                          sortParms.includes(column.render('Header')) &&
                          (e.currentTarget.className = 'text-primary pointer');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.className = '';
                      }}
                      {...column.getHeaderProps(
                        sortParms.includes(column.render('Header')) &&
                          column.getSortByToggleProps()
                      )}
                      style={{
                        width: column.width,
                        whiteSpace: 'nowrap',
                        textAlign: [
                          'Stats',
                          'Last Modified',
                          'Tags',
                          'Owner',
                        ].includes(column.render('Header'))
                          ? 'center'
                          : 'left',
                      }}
                      title={
                        sortParms.includes(column.render('Header'))
                          ? `Sort by ${column.Header}`
                          : null
                      }
                    >
                      {column.render('Header')}
                      {column.isSorted && (
                        <span className="ml-2">
                          <i
                            className={`fas text-info fa-arrow-${
                              column.isSortedDesc ? 'down' : 'up'
                            }`}
                          ></i>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} style={{ tableLayout: 'fixed' }}>
            {!loading &&
              !error &&
              rows.slice(0, 100).map((row, i) => {
                prepareRow(row);

                return (
                  <EmailTemplatesRow
                    row={row}
                    handleRowToolbarButton={handleRowToolbarButton}
                    key={i}
                    templateActions={templateActions}
                    snippetActions={snippetActions}
                    RowToolBarHoverParms={sortParms}
                    tabName={tabName}
                    pathName={pathName}
                    currentUserId={currentUserId}
                    selectedUserId={selectedUserId}
                  />
                );
              })}
            {error && (
              <tr>
                <td colSpan="10" className="text-center mb-0 bg-gray-lighter">
                  <h6 className="text-danger mb-0">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    {listResponse ? listResponse : 'Failed to fetch data'}
                  </h6>
                  {templatesData?.requestId && (
                    <>
                      <br />
                      <span className="text-danger text-sm">{`RequestId: ${templatesData?.requestId}`}</span>{' '}
                    </>
                  )}
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">
                  <span className="text-warning">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    No {tabName === 'Templates' ? 'Templates' : 'Snippets'}{' '}
                    Available.
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
        ></TablePagination>
      </CardFooter>
    </>
  );
}

export default EmailTemplatesGrid;
