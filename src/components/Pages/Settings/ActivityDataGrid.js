/*
 * @author @Manimegalai
 * @version V11.0
 */
import React from 'react';
import { useTable } from 'react-table';
import { Input, InputGroup, InputGroupAddon, Table } from 'reactstrap';
import Button from '../../Common/Button';

function ActivityDataGrid({
  ActivityData,
  addActivityMappingRow,
  columns,
  data,
  handleDeleteActivityData,
  error,
  handleTrucadenceActivityField,
  loading,
  openMergeModal,
  resetFieldRows,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
      ActivityData,
      manualPagination: false,
    },
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        ...columns,
        {
          id: 'action',
          Header: 'Action',
          accessor: 'id',
          width: '10%',
          Cell: ({ row }) => (
            <Button outline color="light">
              {' '}
              <i
                className="far fa-trash-alt text-danger"
                title="Delete"
                onClick={() => {
                  handleDeleteActivityData(row);
                }}
              ></i>
            </Button>
          ),
        },
      ]);
    }
  );
  const tableId = 'activity_data_table';
  return (
    <>
      <div>
        <div
          className="card-tool float-right px-2"
          style={{ marginTop: '-26px' }}
        >
          <i
            className="fas fa-plus text-primary mr-2 pointer"
            title="Add Row"
            onClick={() => {
              addActivityMappingRow();
            }}
          ></i>
          <i
            className="fas fa-sync-alt text-danger pointer"
            title="Reset"
            onClick={() => {
              resetFieldRows();
            }}
          ></i>
        </div>
      </div>
      <Table {...getTableProps()} id={`${tableId}`} className="mb-2">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <td
                  {...column.getHeaderProps()}
                  style={
                    column.Header === 'Action'
                      ? { width: column.width, textAlign: 'center' }
                      : { width: column.width }
                  }
                >
                  {column.render('Header')}
                </td>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {!loading &&
            !error &&
            rows.slice(0, 500).map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="activity-row" key={i}>
                  {row.cells.map((cell, i) => {
                    const id = cell.row.original.id;
                    const value =
                      cell.value &&
                      cell.value.replaceAll('ConnectLeader', 'Koncert');

                    if (cell.column.Header === 'Cadence Field') {
                      return (
                        <td key={i} className="border-0 py-0 px-2">
                          <InputGroup>
                            <Input
                              type="text"
                              defaultValue={value}
                              style={{ height: '26px' }}
                              className="p-1 text-sm mb-0"
                              onMouseLeave={(event) => {
                                handleTrucadenceActivityField(
                                  event,
                                  id,
                                  'expression'
                                );
                              }}
                            ></Input>
                            <InputGroupAddon addonType="append">
                              <Button
                                onClick={() => {
                                  openMergeModal(id);
                                }}
                                style={{ height: '26px' }}
                                className="p-1"
                              >
                                <i className="fa fa-search pointer"></i>
                              </Button>
                            </InputGroupAddon>
                          </InputGroup>
                        </td>
                      );
                    } else {
                      return (
                        <td
                          key={i}
                          style={
                            cell.column.Header === 'Action'
                              ? {
                                  width: cell.column.width,
                                  textAlign: 'center',
                                }
                              : { width: cell.column.width }
                          }
                          className="border-0 py-0 px-2"
                        >
                          {cell.render('Cell')}
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
}
export default ActivityDataGrid;
