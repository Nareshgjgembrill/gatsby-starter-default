/**
 * @author ranbarasan82
 * @version V11.0
 */
import React from 'react';
import { useTable } from 'react-table';
import { Input, Table } from 'reactstrap';

function CsvHeaderClHeaderMapping({ columns, data, fields, handleAction }) {
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
    },
    (hooks) => {
      hooks.visibleColumns.push((columns) => [...columns]);
    }
  );

  const handleActionOnChangeFields = (event, rowKey) => {
    let selectValue = event.target.value;
    let selectText = event.target.selectedOptions[0].label;
    const filterFlag = data.filter((field) => field.ismapped === selectText);

    if (filterFlag.length > 0) {
      alert(
        `Duplicate mapping detected. "${selectText}" field is already mapped.`
      );
      selectText = '?';
      selectValue = '';
    }

    handleAction(selectText, selectValue, rowKey);
  };

  const tableId = 'csv_cl_header_mapping';
  return (
    <div className="table-responsive" id={`${tableId}_wrapper`}>
      <Table className="table-hover" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <td
                  {...column.getHeaderProps()}
                  style={{ width: column.width, whiteSpace: 'nowrap' }}
                >
                  {column.render('Header')}
                </td>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} style={{ tableLayout: 'fixed' }}>
          {rows.slice(0, 200).map((row, rowKey) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={rowKey}>
                {row.cells.map((cell, colIndex) => {
                  if (cell.column.id === 'clfield') {
                    const originalFieldJson = row.original;
                    return (
                      <td key={colIndex} style={{ width: cell.column.width }}>
                        <Input
                          className="w-auto"
                          type="select"
                          name="clFields"
                          value={originalFieldJson.id}
                          onChange={(event) =>
                            handleActionOnChangeFields(event, rowKey)
                          }
                        >
                          <option></option>
                          {fields &&
                            fields.map((data, i) => {
                              return (
                                <option value={data.id} key={i}>
                                  {data.label}
                                </option>
                              );
                            })}
                        </Input>
                      </td>
                    );
                  } else {
                    return (
                      <td
                        key={colIndex}
                        style={{ width: cell.column.width }}
                        title={cell.value}
                      >
                        {cell.value && cell.value.length > 20
                          ? cell.value.slice(0, 19) + '..'
                          : cell.render('Cell')}
                      </td>
                    );
                  }
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
export default CsvHeaderClHeaderMapping;
