/**
 * @author @rkrishna-gembrill
 * @version V11.0
 */
import React, { useState } from 'react';
import { useTable, useRowSelect, usePagination } from 'react-table';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import ScrollArea from 'react-scrollbar';
import {
  Button,
  CardFooter,
  Col,
  Popover,
  PopoverHeader,
  PopoverBody,
  Row,
  Table,
} from 'reactstrap';
import useFieldsData from '../../Common/hooks/useFieldsData';
import { useSortBy } from '@nextaction/components';
import AlertModal from '../../Common/AlertModal';
import { default as TablePagination } from '../../Common/Pagination';
import { trimValue, isValidURL, formatWebLink } from '../../../util';

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

const FieldDropDownKeyValue = ({ fieldId, fieldDropdownValues }) => {
  let dropDownFieldValue = {};
  if (fieldDropdownValues) {
    dropDownFieldValue = fieldDropdownValues.find(
      (item) => item.id === parseInt(fieldId)
    );
  }

  return <span>{dropDownFieldValue?.value}</span>;
};

const PopoverItem = (props) => {
  const {
    id,
    prospect,
    popoverOpen,
    toggle,
    loading,
    fieldMappingData,
    resetShowCell,
    rowIndex,
    currentUserId,
    selectedUserId,
  } = props;
  const standardFields = [
    'first_name',
    'last_name',
    'title',
    'account_name',
    'contact_name',
    'city',
    'tag',
    'campaign_name',
    'current_touch_type',
    'current_touch_id',
    'phone',
    'email_id',
  ];
  let fields = [];
  let customFields = [];
  let fieldDropdownValues = [];

  if (fieldMappingData) {
    fieldDropdownValues = fieldMappingData.fields?.includedAssociations
      ?.fieldDropdownValues
      ? fieldMappingData.fields.includedAssociations.fieldDropdownValues
      : [];
    fields =
      fieldMappingData?.fields?.data &&
      fieldMappingData.fields.data.filter(
        (item) => standardFields.indexOf(item.clFieldName) === -1
      );

    customFields = fields.filter(
      (item) =>
        !item.implicit &&
        !item.clFieldName.includes('custom_phone') &&
        'textarea' !== item.controlType.toLowerCase()
    );
  }
  return (
    <span>
      <Popover
        placement="bottom"
        isOpen={popoverOpen}
        target={'Popover-' + id}
        toggle={toggle}
        trigger="legacy"
        style={{
          width: '450px',
          maxWidth: '1000px',
          marginInlineStart: '-325px',
          overflowX: 'hidden',
        }}
        innerClassName="shadow-sm rounded border"
      >
        <PopoverHeader className="bg-view-info-header text-white">
          View Info
          <span
            className="float-right"
            onClick={() => {
              toggle();
              resetShowCell();
            }}
          >
            <i className="fas fa-times pointer" />
          </span>
        </PopoverHeader>
        <PopoverBody className="bg-secondary pr-1 pl-2">
          {loading ? (
            <div className="text-center">
              <i className="fa fa-spinner fa-spin fa-lg"></i>
            </div>
          ) : (
            <ScrollArea
              speed={0.8}
              className="area"
              contentClassName="content"
              horizontal={true}
              style={{
                minHeight: '200px',
                maxHeight: '250px',
                minWidth: '441px',
              }}
            >
              <Row className="d-flex align-items-center pl-1">
                <Col sm={5} className="pr-0 pb-1">
                  <strong>Email: </strong>
                </Col>
                <Col sm={6} className="pl-1 pr-0 pb-1 text-wrap text-break">
                  {prospect['email'] && (
                    <>
                      <span>{prospect['email']}</span>
                      <i className="fas fa-envelope text-email ml-2"></i>
                    </>
                  )}
                </Col>
              </Row>
              <Row className="d-flex align-items-center pl-1">
                <Col sm={5} className="pr-0 pb-1">
                  <strong>Phone: </strong>
                </Col>
                <Col sm={6} className="pl-1 pr-0 pb-1 text-wrap text-break">
                  {prospect['phone'] && (
                    <>
                      <span>{prospect['phone']}</span>
                      {selectedUserId === currentUserId ? (
                        <Link
                          title={`Dial ${prospect['phone']}`}
                          to={{
                            pathname: '/prospects/list/' + prospect.id,
                            search: window.location.search,
                            state: {
                              origin: window.location.pathname,
                              prospect: prospect,
                              dialingNumber: prospect.phone,
                              rowIndex,
                            },
                          }}
                        >
                          <i className="fas fa-phone-alt text-call ml-2"></i>
                        </Link>
                      ) : (
                        <i className="fas fa-phone-alt text-call ml-2"></i>
                      )}
                    </>
                  )}
                </Col>
              </Row>

              {fields
                .filter(
                  (item) =>
                    !item.implicit &&
                    item.controlType === 'phone' &&
                    prospect[item.name]
                )
                .map((field, i) => {
                  return (
                    <Row
                      className="d-flex align-items-center pb-1 pl-1"
                      key={`${field.name + '_' + i}`}
                    >
                      <Col sm={5} className="text-wrap text-break pr-0">
                        <strong title={field.name}>{field.label}</strong>
                      </Col>
                      <Col sm={6} className="pl-1 pr-0 text-wrap text-break">
                        <>
                          <span>{prospect[field.name]}</span>
                          {selectedUserId === currentUserId ? (
                            <Link
                              title={`Dial ${prospect[field.name]}`}
                              to={{
                                pathname: '/prospects/list/' + prospect.id,
                                search: window.location.search,
                                state: {
                                  origin: window.location.pathname,
                                  prospect: prospect,
                                  dialingNumber: prospect[field.name],
                                  rowIndex,
                                },
                              }}
                            >
                              <i className="fas fa-phone-alt text-call ml-2"></i>
                            </Link>
                          ) : (
                            <i className="fas fa-phone-alt text-call ml-2"></i>
                          )}
                        </>
                      </Col>
                    </Row>
                  );
                })}
              {customFields && customFields.length > 0 && (
                <div className="border-bottom pb-1 row"></div>
              )}

              {customFields
                .filter((item) => prospect[item.name])
                .map((field, i) => {
                  const fieldControlType = field.controlType.toLowerCase();

                  return (
                    <Row
                      className="p-1 border-view-info"
                      key={`${field.clFieldName + '_' + i}`}
                    >
                      <Col className="pr-0">
                        <Row>
                          <Col sm={5} className="text-wrap text-break pr-0">
                            <strong id={field.clFieldName} title={field.label}>
                              {field.label}
                            </strong>
                          </Col>
                          <Col
                            title={
                              trimValue(prospect[field.name]) !== '' &&
                              ('timestamp' === fieldControlType
                                ? moment(prospect[field.name]).format(
                                    'M/D/YYYY h:mm A'
                                  )
                                : 'date' === fieldControlType
                                ? moment(prospect[field.name]).format(
                                    'M/D/YYYY'
                                  )
                                : 'boolean' === fieldControlType
                                ? prospect[field.name] === true
                                  ? 'True'
                                  : 'False'
                                : trimValue(prospect[field.name]))
                            }
                            sm={6}
                            className="text-wrap text-break pl-1 pr-0"
                          >
                            {trimValue(prospect[field.name]) !== '' ? (
                              'timestamp' === fieldControlType ? (
                                moment(prospect[field.name]).format(
                                  'M/D/YYYY h:mm A'
                                )
                              ) : 'date' === fieldControlType ? (
                                moment(prospect[field.name]).format('M/D/YYYY')
                              ) : isValidURL(
                                  trimValue(prospect[field.name])
                                ) ? (
                                <Link
                                  to={{
                                    pathname: formatWebLink(
                                      trimValue(prospect[field.name])
                                    ),
                                  }}
                                  target="_blank"
                                >
                                  {trimValue(prospect[field.name])}
                                </Link>
                              ) : fieldControlType === 'select' &&
                                trimValue(prospect[field.name]) ? (
                                <FieldDropDownKeyValue
                                  fieldId={trimValue(prospect[field.name])}
                                  fieldDropdownValues={fieldDropdownValues}
                                ></FieldDropDownKeyValue>
                              ) : fieldControlType === 'boolean' ? (
                                prospect[field.name] === true ? (
                                  'True'
                                ) : (
                                  'False'
                                )
                              ) : field.name === 'lastTouch' ? (
                                trimValue(prospect[field.name]) === 'OTHERS' ? (
                                  'SOCIAL'
                                ) : (
                                  trimValue(prospect[field.name])
                                )
                              ) : (
                                trimValue(prospect[field.name])
                              )
                            ) : (
                              ''
                            )}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  );
                })}

              {fields
                .filter(
                  (item) =>
                    'textarea' === item.controlType.toLowerCase() &&
                    prospect[item.name]
                )
                .map((field, i) => {
                  return (
                    <Row
                      className="p-1 border-view-info"
                      key={`${field.clFieldName + '_' + i}`}
                    >
                      <Col className="pr-0 pt-1">
                        <Row>
                          <Col sm={5} className="pr-0 text-wrap text-break">
                            <strong id={field.clFieldName} title={field.label}>
                              {field.label}
                            </strong>
                          </Col>
                          <Col
                            sm={6}
                            title={prospect[field.name]}
                            className="text-wrap text-break pl-1 pr-0"
                          >
                            {prospect[field.name]}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  );
                })}
            </ScrollArea>
          )}
        </PopoverBody>
      </Popover>
    </span>
  );
};

function GridRow({
  row,
  handleRowToolbarButton,
  rowKey,
  prospectActions,
  fieldMappingData,
  fieldMappingLoading,
  currentUserId,
  selectedUserId,
}) {
  const [showCell, setShowCell] = useState(true); // To hide Call Outcome, Email Outcome, Last Touched On on row mouse over and to show the same on mouse out
  const prospect = row.original;
  let dialingPhone = prospect.phone;

  if (!dialingPhone) {
    const dialingKey = Object.keys(prospect).filter((key) => {
      return key.startsWith('customPhone') && prospect[key];
    });

    dialingPhone = dialingKey[0] ? prospect[dialingKey[0]] : '';
  }

  const [showAlertModal, setShowAlertModal] = useState(false);
  const toggleAlertModal = () => {
    setShowAlertModal(!showAlertModal);
  };

  const [popoverOpen, setPopoverOpen] = useState(false);
  const toggle = () => setPopoverOpen(!popoverOpen);

  const displayColumns =
    prospect.associations.cadence && prospect.associations.cadence[0].id
      ? ['Call Outcome', 'Email Outcome', 'Last Touched On']
      : ['Email Outcome', 'Last Touched On'];
  return (
    <tr
      {...row.getRowProps()}
      onMouseEnter={() => setShowCell(false)}
      onMouseLeave={() =>
        popoverOpen ? setShowCell(false) : setShowCell(true)
      }
      key={rowKey}
    >
      {row.cells.map((cell, i) => {
        return (
          <td
            key={i}
            style={{
              width: cell.column.width,
              display:
                displayColumns.indexOf(cell.column.Header) !== -1
                  ? showCell
                    ? ''
                    : 'none'
                  : '',
              whiteSpace:
                displayColumns.indexOf(cell.column.Header) !== -1
                  ? 'nowrap'
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
        style={{
          display: showCell ? 'none' : '',
          verticalAlign: 'middle',
          width: '1000%',
        }}
        colSpan="3"
      >
        <Link
          title={`Dial ${dialingPhone}`}
          hidden={
            dialingPhone && selectedUserId === currentUserId ? false : true
          }
          to={{
            pathname: '/prospects/list/' + prospect.id,
            search: window.location.search,
            state: {
              origin: window.location.pathname,
              prospect: prospect,
              dialingNumber: dialingPhone,
              rowIndex: row.index,
            },
          }}
          className="mr-2"
        >
          <i className="fas fa-phone-alt text-call"></i>
        </Link>
        <Button
          color="outline"
          title="Email"
          hidden={prospect.email ? false : true}
          onClick={() => {
            if (prospect.optoutFlag === true) {
              setShowAlertModal(true);
            } else {
              handleRowToolbarButton(prospectActions.EMAIL, prospect);
            }
          }}
          className="mr-2 btn-xs"
        >
          <i className="fas fa-envelope text-email"></i>
        </Button>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <Button
          color="outline"
          title="Assign to Cadence"
          hidden={prospect.associations.cadence ? true : false}
          onClick={() =>
            handleRowToolbarButton(prospectActions.ASSIGN_TO_CADENCE, prospect)
          }
          className="mr-2 btn-xs"
        >
          <i className="fas fa-plus"></i>
        </Button>
        <Button
          hidden={selectedUserId !== currentUserId ? true : false}
          color="outline"
          title="Tag"
          onClick={() => handleRowToolbarButton(prospectActions.TAG, prospect)}
          className="mr-2 btn-xs"
        >
          <i className="fa fa-tag"></i>
        </Button>
        <Button
          color="outline"
          title="Resume"
          hidden={
            prospect.associations.cadence && prospect.memberStatus === 'SUSPEND'
              ? false
              : true
          }
          onClick={() =>
            handleRowToolbarButton(prospectActions.RESUME, prospect)
          }
          className="mr-2 btn-xs"
        >
          <i className="fas fa-play"></i>
        </Button>
        <Button
          color="outline"
          title="Pause"
          hidden={prospect.associations.cadence ? false : true}
          onClick={() =>
            handleRowToolbarButton(prospectActions.PAUSE, prospect)
          }
          disabled={prospect.memberStatus === 'SUSPEND'}
          className="mr-2 btn-xs"
        >
          <i className="fas fa-pause"></i>
        </Button>
        {prospect.associations.cadence && (
          <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        )}
        <Button
          color="outline"
          title="Skip Touch"
          hidden={prospect.associations.cadence ? false : true}
          onClick={() =>
            handleRowToolbarButton(prospectActions.SKIP_TOUCH, prospect)
          }
          className="mr-2 btn-xs"
        >
          <i className="fas fa-forward"></i>
        </Button>
        <Button
          color="outline"
          title="Move to Another Cadence"
          hidden={prospect.associations.cadence ? false : true}
          onClick={() =>
            handleRowToolbarButton(
              prospectActions.MOVE_TO_ANOTHER_CADENCE,
              prospect
            )
          }
          className="mr-2 btn-xs"
        >
          <i className="fas fa-arrows-alt"></i>
        </Button>
        <Button
          color="outline"
          title="Exit Cadence"
          hidden={prospect.associations.cadence ? false : true}
          onClick={() =>
            handleRowToolbarButton(prospectActions.EXIT_CADENCE, prospect)
          }
          className="mr-2 btn-xs"
        >
          <i className="fas fa-sign-out-alt"></i>
        </Button>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <Button
          color="outline"
          title="Delete"
          onClick={() =>
            handleRowToolbarButton(prospectActions.DELETE, prospect)
          }
          className="mr-2 btn-xs"
        >
          <i className="fas fa-trash"></i>
        </Button>
        <Button
          color="outline"
          title="Info"
          id={'Popover-' + prospect.id}
          className="mr-2 btn-xs"
        >
          <i className="fas fa-info-circle"></i>
        </Button>
        <PopoverItem
          popoverOpen={popoverOpen}
          toggle={toggle}
          prospect={prospect}
          id={prospect.id}
          fieldMappingData={fieldMappingData}
          loading={fieldMappingLoading}
          resetShowCell={() => setShowCell(false)}
          rowIndex={row.index}
          currentUserId={currentUserId}
          selectedUserId={selectedUserId}
        />
        {/* Alert modal */}
        <AlertModal
          alertType="error"
          showModal={showAlertModal}
          handleClose={toggleAlertModal}
        >
          <div>Prospect is opted out</div>
        </AlertModal>
      </td>
    </tr>
  );
}

function ProspectsGrid({
  columns,
  data,
  prospectData,
  fetchData,
  loading,
  error,
  pageCount: controlledPageCount,
  pageSize: controlledPageSize,
  currentPageIndex,
  handleRowToolbarButton,
  prospectActions,
  handleRefresh,
  handleSort,
  sortBy: sortByCol,
  orderBy,
  handleIntermediateCheck,
  totalCount,
  currentUserId,
  selectedUserId,
}) {
  const { data: fieldsData, loading: fieldMappingLoading } = useFieldsData();

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
            id: sortByCol,
            desc: orderBy === 'desc',
          },
        ],
      }, // Pass our hoisted table state
      manualPagination: true, // Tell the usePagination
      manualSortBy: true,
      disableSortRemove: true,
      // hook that we'll handle our own data fetching
      // This means we'll also have to provide our own pageCount.
      pageCount: controlledPageCount,
    },
    useSortBy,
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
  React.useEffect(
    () => {
      handleSort(sortBy[0].id, sortBy[0].desc);
    },
    // eslint-disable-next-line
    [sortBy]
  );

  React.useEffect(
    () => {
      handleIntermediateCheck(selectedFlatRows);
    },
    // eslint-disable-next-line
    [selectedFlatRows]
  );
  const tableId = 'prospects-table';
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
          style={{ minWidth: '1070px' }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <td
                    onMouseEnter={(e) => {
                      !column.disableSortBy &&
                        (e.currentTarget.className = 'text-primary pointer');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.className = '';
                    }}
                    {...column.getHeaderProps(
                      column.getSortByToggleProps({ title: '' })
                    )}
                    style={{ width: column.width, whiteSpace: 'nowrap' }}
                  >
                    {column.render('Header')}
                    {
                      // To show sort icon
                      column.isSorted && column.id === sortByCol && (
                        <i
                          className={`text-primary ml-2 fas fa-arrow-${
                            column.isSortedDesc ? 'down' : 'up'
                          }`}
                        ></i>
                      )
                    }
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
                  <GridRow
                    row={row}
                    handleRowToolbarButton={handleRowToolbarButton}
                    key={i}
                    prospectActions={prospectActions}
                    fieldMappingLoading={fieldMappingLoading}
                    fieldMappingData={fieldsData}
                    currentUserId={currentUserId}
                    selectedUserId={selectedUserId}
                  />
                );
              })}
            {!loading && !error && data.length === 0 && (
              <tr>
                <td colSpan="9" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Prospects Available
                  </span>
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan="9" className="text-center mb-0 bg-gray-lighter">
                  <span className="text-danger">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    Failed to fetch data
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
          pageSize={parseInt(pageSize)}
          handleSetPageSize={(pageSize) => setPageSize(pageSize)}
          canPreviousPage={!canPreviousPage}
          canNextPage={!canNextPage}
          previousPage={() => previousPage()}
          nextPage={() => nextPage()}
          handleRefresh={handleRefresh}
          tableId="prospects_list"
          totalCount={totalCount}
        ></TablePagination>
      </CardFooter>
    </>
  );
}

export default ProspectsGrid;
