import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Row,
  Col,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Progress,
} from 'reactstrap';

const TablePagination = ({
  canNextPage,
  canPreviousPage,
  handleFirstPage,
  handleGoToPage,
  handleLastPage,
  handleRefresh,
  handleSetPageSize,
  loading,
  nextPage,
  pageIndex,
  previousPage,
  pageSize,
  tableId,
  totalPages,
  totalCount,
}) => {
  const totalToDisplayCount = pageIndex * pageSize;
  const totalFromDisplayCount =
    pageIndex > 0 ? (pageIndex - 1) * pageSize + 1 : 0;
  const displayFrom =
    pageIndex === 1
      ? totalCount > 0
        ? pageIndex
        : 0
      : totalFromDisplayCount > totalCount
      ? totalCount
      : totalFromDisplayCount;
  const displayTo =
    pageIndex === 1
      ? pageSize > totalCount
        ? totalCount
        : pageSize
      : totalToDisplayCount > totalCount
      ? totalCount
      : totalToDisplayCount;

  function isNaturalNumber(str) {
    return !isNaN(str) && /^(0|([1-9]\d*))$/.test(str);
  }
  return (
    <Row>
      <Col sm={12} xl={7} className="pl-xl-2 pr-xl-0">
        {loading ? (
          <Col className="ml-n2 mt-2 mw-90">
            <Progress animated value="100" />
          </Col>
        ) : (
          <div className="form-inline">
            {/* Show number of pages */}
            <span className="mr-sm-2 mr-xl-1">
              Page{' '}
              <strong>
                {totalPages === 0 ? 0 : pageIndex} of {totalPages}
              </strong>
            </span>
            {/* Goto page */}|
            <div className="ml-sm-2 ml-xs-1 d-flex flex-row align-items-center">
              <div className="text-nowrap">Go to page</div>
              <Input
                type="text"
                defaultValue={pageIndex}
                onKeyDown={(e) => {
                  if (
                    e.key !== 'Control' &&
                    e.key !== 'Backspace' &&
                    e.key !== 'Enter' &&
                    !(e.ctrlKey && e.key === 'a') &&
                    !isNaturalNumber(e.key)
                  ) {
                    e.preventDefault();
                  } else if (e.key === 'Enter') {
                    const page = e.target.value
                      ? Number(e.target.value) - 1
                      : 0;
                    handleGoToPage(page);
                  } else if (parseInt(e.target.value + e.key) > totalPages) {
                    e.preventDefault();
                  } else if ('0' === e.target.value + e.key) {
                    e.preventDefault();
                  }
                }}
                className="mx-sm-2 mx-xl-1 pl-xl-1 pr-xl-0"
                style={{ width: '75px' }}
              />
              {/* Display number of rows dropdown */}
              <Input
                type="select"
                name={`${tableId}_length`}
                aria-controls={tableId}
                value={pageSize}
                onChange={(e) => handleSetPageSize(Number(e.target.value))}
                className="mx-sm-2 mx-xl-0 pl-xl-1 pr-xl-0"
              >
                <option value={5}>Show 5</option>
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
                <option value={50}>Show 50</option>
                <option value={100}>Show 100</option>
              </Input>
            </div>
            {/* Refresh */}
            {handleRefresh && (
              <>
                <Button
                  outline
                  className="ml-sm-2 ml-xl-1 h-100" //ml-2 mt-2 mt-lg-0 mt-md-0 mt-sm-1 btn btn-outline-secondary
                  type="button"
                  onClick={() => handleRefresh()}
                >
                  <i className="fas fa-sync-alt text-primary"></i>
                </Button>
              </>
            )}
          </div>
        )}
      </Col>
      <Col sm={12} xl={5} className="pl-xl-0 pr-xl-2">
        {/* Pagination */}
        <div className="d-flex ml-auto mt-sm-2 mt-xl-0 align-items-center justify-content-sm-start justify-content-xl-end">
          {/* show number records displaying based on the limit and offset.i will remove this inline style once the totalCount prop implement in all modules */}
          <div
            className="mr-sm-2 mr-xl-1 text-nowrap"
            style={{ display: totalCount !== undefined ? '' : 'none' }}
          >
            {'Displaying ' +
              displayFrom +
              ' - ' +
              displayTo +
              ' of ' +
              totalCount}
          </div>
          <div>
            <Pagination aria-label="Page navigation">
              <PaginationItem
                onClick={() => handleFirstPage()}
                disabled={canPreviousPage}
              >
                <PaginationLink>
                  <i className="fas fa-angle-double-left"></i>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem
                onClick={() => previousPage()}
                disabled={canPreviousPage}
              >
                <PaginationLink>
                  <i className="fas fa-angle-left"></i>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem
                onClick={() => {
                  if (!canNextPage) {
                    nextPage();
                  }
                }}
                disabled={canNextPage}
              >
                <PaginationLink>
                  <i className="fas fa-angle-right"></i>
                </PaginationLink>
              </PaginationItem>
              <PaginationItem
                onClick={() => handleLastPage()}
                disabled={canNextPage}
              >
                <PaginationLink>
                  <i className="fas fa-angle-double-right"></i>
                </PaginationLink>
              </PaginationItem>
            </Pagination>
          </div>
        </div>
      </Col>
    </Row>
  );
};

TablePagination.propTypes = {
  canNextPage: PropTypes.bool, // 'true' to enable next page button
  canPreviousPage: PropTypes.bool, // 'true' to enable previous page button
  handleFirstPage: PropTypes.func, // Function to go to first page of the table
  handleGoToPage: PropTypes.func, // Function to go to exact page needed in table
  handleLastPage: PropTypes.func, // Function to go to last page of the table
  handleRefresh: PropTypes.func, // Function to refresh the table data
  handleSetPageSize: PropTypes.func, // Function to display number of rows per page
  loading: PropTypes.bool, // If 'true' Progress bar shown untill table content gets loaded
  nextPage: PropTypes.func, // Function to move forward to next page of the table
  pageIndex: PropTypes.number, // Integer value to show current page from total number of pages
  previousPage: PropTypes.func, // Function to move backward to previous page of the table
  pageSize: PropTypes.number, // Integer value to show number of rows per page to be displayed in the dropdown
  tableId: PropTypes.string, // Prop to get corresponding TableID
  totalPages: PropTypes.number, // Integer value to show total number of pages
  totalCount: PropTypes.number, // Integer value to show total number of rows
};

export default TablePagination;
