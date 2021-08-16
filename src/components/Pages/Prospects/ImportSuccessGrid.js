/**
 * @author ranbarasan82
 * @version V11.0
 */
import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { useTable } from 'react-table';
import { connect } from 'react-redux';
import { Card, CardBody, CardHeader, Col, Row, Table } from 'reactstrap';
import { FETCH_ALL_USER_QUERY } from '../../queries/ProspectsQuery';
import ExportDuplicateRecords from './ExportDuplicateRecords';
import { getAllUsers } from '../../../store/actions/actions';

const ImportGridRow = ({ row, rowKey }) => {
  return (
    <tr {...row.getRowProps()} key={rowKey}>
      {row.cells.map((cell, i) => {
        return (
          <td
            className={
              cell.render('Header') === 'Records Imported / Processed'
                ? 'text-danger text-center text-nowrap py-2'
                : 'text-center text-nowrap py-2'
            }
            key={i}
          >
            {cell.render('Cell')}
          </td>
        );
      })}
    </tr>
  );
};

const ImportSuccessGrid = ({
  columns,
  data,
  error,
  loading,
  users,
  successHeader,
  uploadListForUser,
  fileId,
}) => {
  const [
    showExportDuplicateProspectsModal,
    setShowExportDuplicateProspectsModal,
  ] = useState(false);
  const [userList, setUserList] = useState([]);

  const [fetchUserList] = useLazyQuery(FETCH_ALL_USER_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => {
      setUserList(response?.user?.data ? response.user.data : []);
    },
  });
  useEffect(() => {
    if (!loading && data) {
      fetchUserList({ variables: { limit: 200 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,

      data: data && data.reports ? data.reports : [],

      manualPagination: false,
    },
    (hooks) => {
      hooks.visibleColumns.push((columns) => [...columns]);
    }
  );

  useEffect(() => {
    if (!users.fetchedAll) {
      getAllUsers(uploadListForUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableId = 'import_success';
  return (
    <div id={`${tableId}_wrapper`} className="table-responsive">
      <Card className="shadow-none border-0 p-0 mb-0">
        <CardHeader
          className={
            '0 Records were successfully uploaded.' === successHeader
              ? 'text-danger p-0 text-center bg-white'
              : 'text-success p-0 text-center bg-white'
          }
        >
          <h3 className="mb-3">{successHeader}</h3>
        </CardHeader>
        {!loading && data && (
          <CardBody className="bg-white border border-grey py-1">
            <Row>
              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Total # of Prospects :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                <span
                  className={
                    data.recordsAvailable > 0
                      ? 'text-white p-1 bg-email'
                      : 'p-1'
                  }
                >
                  {data.recordsAvailable}
                </span>
              </Col>

              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Prospects Uploaded :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                <span
                  className={
                    data.recordsImported > 0 ? 'text-white p-1 bg-email' : 'p-1'
                  }
                >
                  {data.recordsImported}
                </span>
              </Col>
              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Prospects Uploaded to :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                <span className="text-white p-1 bg-email">
                  {
                    users.data.find((user) => user.id === uploadListForUser)
                      .name
                  }
                </span>
              </Col>
              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Prospects Assigned to cadence # :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                <span
                  className={
                    data.prospectsAssignedCount > 0
                      ? 'text-white p-1 bg-email'
                      : 'p-1'
                  }
                >
                  {data.prospectsAssignedCount}
                </span>
              </Col>
            </Row>
            <Row className="my-1">
              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Missing Contact Name(s) :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                <span
                  className={
                    data.contactNameCount > 0
                      ? 'text-white p-1 bg-email'
                      : 'p-1'
                  }
                >
                  {data.contactNameCount}
                </span>
              </Col>

              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Missing/Invalid Phone Number(s) :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                <span
                  className={
                    data.phoneCount > 0 ? 'text-white p-1 bg-email' : 'p-1'
                  }
                >
                  {data.phoneCount}
                </span>
              </Col>
            </Row>
            <Row>
              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Missing/Invalid Email(s) :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                <span
                  className={
                    data.emailIdCount > 0 ? 'text-white p-1 bg-email' : 'p-1'
                  }
                >
                  {data.emailIdCount}
                </span>
              </Col>
              <Col sm={4} className="pl-0 text-email text-right text-nowrap">
                <em>Duplicate Contact(s) :</em>
              </Col>
              <Col sm={2} className="px-0 text-bold text-email text-nowrap">
                {data.duplicateCount > 0 ? (
                  <span
                    title="Export Duplicates"
                    className="text-white p-1 bg-email pointer"
                    onClick={() => {
                      setShowExportDuplicateProspectsModal(true);
                    }}
                  >
                    {data.duplicateCount}
                  </span>
                ) : (
                  <span className="p-1">{data.duplicateCount}</span>
                )}
              </Col>
            </Row>
          </CardBody>
        )}
      </Card>

      <Card className="mb-0 shadow-none border-0">
        <div className="crm-csv-table">
          <h6 className="text-center my-3">
            Please see the status of the individual reports:
          </h6>

          <Table bordered {...getTableProps()} id={`${tableId}`}>
            <thead className="bg-color-silver">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => {
                    return (
                      <td
                        className="text-center py-2"
                        {...column.getHeaderProps()}
                        style={
                          ['Imported'].indexOf(column.render('Header')) !== -1
                            ? { width: column.width, textAlign: 'right' }
                            : { width: column.width }
                        }
                      >
                        {column.render('Header')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {!loading &&
                !error &&
                rows.slice(0, 10).map((row, i) => {
                  prepareRow(row);
                  return <ImportGridRow row={row} key={i} />;
                })}

              {!loading && !error && data && (
                <tr className="bg-color-silver border border-grey">
                  <td className="text-bold text-center text-dark py-2">
                    Total
                  </td>
                  <td className="text-center text-bold text-dark text-nowrap py-2">
                    {data.recordsImported} / {data.recordsAvailable}
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center mb-0 bg-gray-lighter border border-grey py-2"
                  >
                    <span className="text-danger">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      Failed to Imports the records
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
      <ExportDuplicateRecords
        showExportModal={showExportDuplicateProspectsModal}
        hideExportModal={() => {
          setShowExportDuplicateProspectsModal(false);
        }}
        userList={userList}
        data={data}
        selectedUserId={uploadListForUser}
        fileId={fileId}
      ></ExportDuplicateRecords>
    </div>
  );
};

const mapStateToProps = (state) => ({
  users: state.users,
});

export default connect(mapStateToProps, { getAllUsers })(ImportSuccessGrid);