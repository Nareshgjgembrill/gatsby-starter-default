/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React from 'react';
import { useTable, usePagination } from 'react-table';
import { Table } from 'reactstrap';

function SyncFieldMappingGrid({ columns, data, fieldData, loading, error }) {
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
      fieldData,
    },
    usePagination,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [...columns]);
    }
  );

  const tableId = 'sync_table';
  const tabWidth = {
    width: '100%',
    minWidth: '720px',
  };
  return (
    <div className="tbgwidth">
      <Table responsive {...getTableProps()} id={`${tableId}`} style={tabWidth}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <td
                  {...column.getHeaderProps()}
                  style={{ width: column.width }}
                  className={
                    !['Cadence Field'].includes(column.render('Header'))
                      ? 'text-center'
                      : 'text-left'
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
                <tr
                  {...row.getRowProps()}
                  key={i}
                  className={`sync_row ${
                    row.original.implicit
                      ? 'bg-color-silver text-color-dark-midnight-express'
                      : ''
                  }`}
                >
                  {row.cells.map((cell, i) => {
                    return (
                      <td key={i} className="border-0 py-1 pl-2 pr-0">
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </Table>
    </div>
  );
}
export default SyncFieldMappingGrid;
