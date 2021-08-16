/*
 * @author @rManimegalai
 * @version V11.0
 */
import React from 'react';
import { useRowSelect, useTable } from 'react-table';
import { Table } from 'reactstrap';

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

function CallListGrid({
  columns,
  data,
  loading,
  error,
  changeCallListCheckboxState,
  callListCheckedAll,
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
      manualPagination: false,
      autoResetSelectedRows: false,
    },
    useRowSelect,

    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <div>
              <IndeterminateCheckbox
                {...getToggleAllRowsSelectedProps()}
                checked={callListCheckedAll}
                onChange={() => {
                  changeCallListCheckboxState(!callListCheckedAll);
                }}
              />
            </div>
          ),
          Cell: ({ row }) => (
            <div>
              <IndeterminateCheckbox
                {...row.getToggleRowSelectedProps()}
                onChange={() => {
                  changeCallListCheckboxState(row);
                }}
              />
            </div>
          ),
        },
        ...columns,
      ]);
    }
  );

  const tableId = 'call_outcome_table';

  return (
    <Table striped hover {...getTableProps()} id={`${tableId}`}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <td
                className="border-bottom"
                {...column.getHeaderProps()}
                style={{ width: column.width }}
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
          rows.slice(0, 100).map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="outcome-row" key={i}>
                {row.cells.map((cell, i) => (
                  <td key={i}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
      </tbody>
    </Table>
  );
}
export default CallListGrid;
