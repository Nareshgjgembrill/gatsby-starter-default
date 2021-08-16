import React, { useEffect, useState } from 'react';
import { usePagination, useRowSelect, useTable } from 'react-table';

import { Link } from 'react-router-dom';

import {
  Alert,
  Button,
  CardFooter,
  Popover,
  PopoverBody,
  PopoverHeader,
  Table,
} from 'reactstrap';
import ScrollArea from 'react-scrollbar';
import TablePagination from '../../Common/Pagination';

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

function GridRow({
  row,
  handleRowToolbarButton,
  rowKey,
  templateActions,
  templateType,
}) {
  const template = row.original;

  const [showCell, setShowCell] = useState(true);
  const [popoverOpen, setPopoverOpen] = useState(false);

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
                ['Subject'].indexOf(cell.column.Header) !== -1
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
        className="text-center pb-0 pt-0"
        style={{ display: showCell ? 'none' : '', verticalAlign: 'middle' }}
        colSpan="3"
      >
        <Button
          color="btn-primary"
          title="Clone template"
          onClick={() =>
            handleRowToolbarButton(
              templateActions.CLONE_TEMPLATE,
              template,
              templateType
            )
          }
        ></Button>
        <Link
          className="btn-secondary mr-2"
          to={{
            pathname: `templates/emails/${template.Id}/SF_clone`,
            state: {
              sfTemplateData: template,
            },
          }}
          title="Clone Template"
        >
          <i className="fas fa-clone fa-lg text-primary mr-2"></i>
        </Link>
        <Button
          id={'temp_' + template.Id}
          color="btn-primary"
          onMouseEnter={() => {
            setPopoverOpen(!popoverOpen);
          }}
          onMouseLeave={() => setPopoverOpen(!popoverOpen)}
        >
          <i className="fas fa-eye fa-lg text-primary"></i>
        </Button>
        <Popover
          placement={'left'}
          isOpen={popoverOpen}
          target={'temp_' + template.Id}
          trigger="legacy"
        >
          <PopoverHeader>View Template</PopoverHeader>
          <PopoverBody>
            <p>
              <b>Subject:</b>
              <span>{template.Subject}</span>
            </p>
          </PopoverBody>
          <PopoverBody>
            <p>
              <b>Description:</b>
              <br />

              <span
                dangerouslySetInnerHTML={{
                  __html: template.Body,
                }}
              ></span>
            </p>
          </PopoverBody>
        </Popover>
      </td>
    </tr>
  );
}

function SalesForceEmailTemplateGrid({
  columns,
  currentPageIndex,
  data,
  error,
  fetchData,
  totalCount,
  handleRefresh,
  handleRowToolbarButton,
  loading,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  templateActions,
  templatesData,
  templateType,
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
    // Get the state from the instance
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      templatesData,
      initialState: {
        pageIndex: currentPageIndex,
        pageSize: controlledPageSize,
      }, // Pass our hoisted table state
      manualPagination: true,
      pageCount: controlledPageCount,
    },
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
            </div>
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  // Listen for changes in pagination and use the state to fetch our new data
  useEffect(() => fetchData({ pageIndex, pageSize }), [
    fetchData,
    pageIndex,
    pageSize,
  ]);

  useEffect(() => gotoPage(currentPageIndex), [currentPageIndex, gotoPage]);

  const tableId = 'templates_table';

  // Render the UI for your table

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
                {headerGroup.headers.map((column) => (
                  <td
                    onMouseEnter={(e) => {
                      e.currentTarget.className = 'text-primary pointer';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.className = '';
                    }}
                    {...column.getHeaderProps()}
                    style={{ width: column.width, whiteSpace: 'nowrap' }}
                  >
                    {column.render('Header')}
                  </td>
                ))}
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
            minHeight: '335px',
            maxHeight: '603px',
            minWidth: '800px',
          }}
        >
          <Table striped hover>
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
                      templateActions={templateActions}
                      templateType={templateType}
                    />
                  );
                })}
              {error && (
                <tr>
                  <td colSpan="7">
                    <Alert color="danger" className="text-center mb-0">
                      <h4 className="mb-0">
                        <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                        Failed to fetch data
                      </h4>
                    </Alert>
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan="10">
                    <Alert color="warning" className="text-center mb-0">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      No Template Available.
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ScrollArea>
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

export default SalesForceEmailTemplateGrid;
