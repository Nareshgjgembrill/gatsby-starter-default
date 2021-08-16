import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePagination, useRowSelect, useSortBy, useTable } from 'react-table';
import { Alert, CardFooter, Table } from 'reactstrap';
import moment from 'moment';
import Button from '../../Common/Button';
import { default as TablePagination } from '../../Common/Pagination';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import OpenCrmWindow from '../../Common/OpenCrmWindow';

function GridRow({
  row,
  handleRowToolbarButton,
  rowKey,
  currentUserId,
  selectedUser,
}) {
  const [showCell, setShowCell] = useState(true);
  const prospect = row.original;
  const phoneValidation =
    currentUserId === selectedUser &&
    (prospect?.phone ||
      prospect?.extensionCustomPhone1 ||
      prospect?.extensionCustomPhone2 ||
      prospect?.extensionCustomPhone3 ||
      prospect?.extensionCustomPhone4 ||
      prospect?.extensionCustomPhone5)
      ? true
      : false;
  const emailValidation = prospect?.email ? true : false;

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
                'Created Date' === cell.column.Header
                  ? showCell
                    ? ''
                    : !handleRowToolbarButton
                    ? ''
                    : 'none'
                  : '',
            }}
            className="py-2"
          >
            {cell.render('Cell')}
          </td>
        );
      })}
      <td
        {...row.getRowProps()}
        className="pb-0 pt-0"
        style={{
          display: showCell ? 'none' : !handleRowToolbarButton ? 'none' : '',
          verticalAlign: 'middle',
          width: '1000%',
        }}
        colSpan="2"
      >
        {phoneValidation && (
          <Button
            className={!emailValidation ? 'pl-5' : 'pl-4'}
            color="link"
            title="Dial Prospect"
            onClick={() => handleRowToolbarButton('Dial', prospect, rowKey)}
          >
            <i className="fas fa-phone-alt fa-lg text-success"></i>
          </Button>
        )}
        {emailValidation && (
          <Button
            className={!phoneValidation ? 'pl-5' : 'pl-0'}
            color="link"
            title="Email Prospect"
            onClick={() => handleRowToolbarButton('Email', prospect)}
          >
            <i className="fas fa-envelope fa-lg text-info"></i>
          </Button>
        )}
      </td>
    </tr>
  );
}
const columns = [
  {
    Header: 'Name',
    accessor: 'contactName',
    width: '10%',
    Cell: function (props) {
      const { data: configurationsData } = useConfigurations();
      const org = configurationsData?.configurations?.data[0];

      const handleOpenCrmWindow = (crmId, recordType) => {
        OpenCrmWindow(org, crmId, recordType);
      };
      const currentTimeZone = moment.tz.guess();
      const pausedDatetime = moment
        .tz(props.row.original.pausedDatetime, currentTimeZone)
        .format('M/D/YYYY h:mm A');
      return (
        <span>
          {props.row.original.crmId &&
            !props.row.original.crmId.startsWith('crmgenkey_') &&
            'standalone' !== org.crmType && (
              <span
                className="pointer"
                onClick={() => {
                  handleOpenCrmWindow(
                    props.row.original.crmId,
                    props.row.original.recordType
                  );
                }}
              >
                <i
                  className="fas fa-arrow-up mr-2 text-success"
                  style={{ transform: 'rotate(45deg)' }}
                ></i>
              </span>
            )}
          <Link
            to={{
              pathname: '/prospects/list/' + props.row.original.id,
              search: window.location.search,
              state: {
                accountId: props.row?.original?.associations?.account?.[0].id,
                rowIndex: props.row.index,
                touchType: props.activeFilter && props.activeFilter,
                contactName: props.searchValue && props.searchValue,
                prospect: props.row.original,
              },
            }}
            title="Click to view prospect"
          >
            {props.value && props.value.length > 30
              ? props.value.slice(0, 29) + '..'
              : props.value}
          </Link>
          {props?.row?.original?.prospectStatus === 'SUSPEND' && (
            <i
              title={`Prospect was paused on ${pausedDatetime}`}
              className="fas fa-pause text-danger ml-2"
            ></i>
          )}
          <br></br>
          {props?.row?.original?.title && (
            <>
              <small>{props.row.original.title}</small>
              <br></br>
            </>
          )}
          <em>{props?.row?.original?.accountName}</em>
        </span>
      );
    },
  },
  {
    Header: 'Cadence',
    accessor: 'cadence',
    width: '10%',
    Cell: function (props) {
      const rowData = props.row.original;
      let cadence;
      if (
        rowData.associations &&
        rowData.associations.cadence &&
        props.prospectsData.prospect.includedAssociations.cadence &&
        rowData.associations.cadence[0].id !== null
      ) {
        cadence = props.prospectsData.prospect.includedAssociations.cadence.find(
          (cadence) => cadence.id === rowData.associations.cadence[0].id
        );
        return (
          <span title="Click to view cadence">
            <Link
              to={{
                pathname: '/cadences/' + cadence.id + '/touches/view',
                search: `${window.location.search}&cadence[name]=${cadence.multiTouchName}&not=1`,
                state: {
                  allCadencesData:
                    props.prospectsData.prospect.includedAssociations.cadence,
                  origin: window.location.pathname,
                  cadence,
                  cadenceName: cadence.name,
                },
              }}
            >
              {cadence.name}
            </Link>
          </span>
        );
      } else return <span></span>;
    },
  },
  {
    Header: 'Touch',
    accessor: 'touch',
    width: '10%',
    Cell: function (props) {
      let touch;
      if (
        props.prospectsData &&
        props.prospectsData.prospect &&
        props.prospectsData.prospect.includedAssociations &&
        props.prospectsData.prospect.includedAssociations.touch
      ) {
        touch = props.prospectsData.prospect.includedAssociations.touch.find(
          (touch) =>
            touch.id === props?.row?.original?.associations?.touch?.[0]?.id
        );
        return (
          <span>
            {touch !== undefined
              ? 'Touch ' +
                touch.stepNo +
                '(' +
                `${touch.touchType === 'OTHERS' ? 'SOCIAL' : touch.touchType}` +
                ')'
              : ''}
          </span>
        );
      } else return <span></span>;
    },
  },
  {
    Header: 'Owner',
    accessor: 'owner',
    disableSortBy: true,
    width: '8%',
    Cell: (props) => {
      const user = props?.accountOwnerName ? props.accountOwnerName : '';
      let ownerName = user.split(' ');
      ownerName =
        ownerName?.[0].charAt(0) +
        (ownerName?.[1] ? ownerName[1].charAt(0) : '');
      return (
        <div>
          <span className="fa-stack fa-1x">
            <i className="fas fa-circle fa-stack-2x text-white thin-circle"></i>
            <span className="fa-stack-1x text-primary text-bold" title={user}>
              {ownerName?.toUpperCase()}
            </span>
          </span>
        </div>
      );
    },
  },
  {
    Header: 'Created Date',
    accessor: 'createdDate',
    width: '10%',
    Cell: function (props) {
      return moment(props.value).format('M/D/YYYY h:mm A');
    },
  },
];
function AccountProspectsGrid({
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
  currentUserId,
  selectedUser,
  handleRowToolbarButton,
  activeFilter,
  searchValue,
  accountOwnerName,
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
    setSortBy,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      prospectsData,
      activeFilter,
      searchValue,
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
      accountOwnerName,
    },
    useSortBy,
    usePagination,
    useRowSelect
  );
  useEffect(() => {
    fetchData({ pageIndex, pageSize });
    // eslint-disable-next-line
  }, [pageIndex, pageSize]);

  useEffect(() => {
    setSortBy([{ id: sortByCol, desc: orderBy === 'desc' }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortByCol, orderBy]);

  useEffect(() => {
    sortByCol !== undefined && handleSort(sortBy[0].id, sortBy[0].desc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);
  const tableId = 'account_prospect_table';
  return (
    <>
      <div className="table-responsive">
        <Table
          {...getTableProps()}
          id={`${tableId}`}
          style={{ whiteSpace: 'nowrap', minWidth: '1000px' }}
          className="table-hover"
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
                        ? { width: column.width }
                        : { width: column.width, whiteSpace: 'nowrap' }
                    }
                    title={
                      [
                        'Name',
                        'Cadence',
                        'Touch',
                        'Due',
                        'Created Date',
                      ].includes(column.render('Header'))
                        ? `Sort by ${column.Header}`
                        : null
                    }
                  >
                    {column.render('Header')}
                    <span className="ml-2">
                      {column.isSorted && (
                        <i
                          className={`text-info ml-2 fas fa-arrow-${
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
                  <GridRow
                    key={i}
                    row={row}
                    handleRowToolbarButton={handleRowToolbarButton}
                    rowKey={row.index}
                    currentUserId={currentUserId}
                    selectedUser={selectedUser}
                  />
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
export default AccountProspectsGrid;
