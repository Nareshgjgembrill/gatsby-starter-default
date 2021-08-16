/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import ScrollArea from 'react-scrollbar';
import { useTable } from 'react-table';
import { Table, Progress } from 'reactstrap';
import { useSortBy } from '@nextaction/components';
import {
  FAILED_TO_FETCH_DATA,
  SORRY_NO_DATA_AVAILABLE,
} from '../../../util/index';

function GridRow({ row, rowKey }) {
  return (
    <tr {...row.getRowProps()} key={rowKey}>
      {row.cells.map((cell, i) => {
        return (
          <td
            key={i}
            style={{
              paddingLeft: cell.column.paddingLeft,
              width: cell.column.width,
              minWidth: cell.column.width,
              maxWidth: cell.column.width,
            }}
            className="py-1 text-sm"
          >
            {cell.render('Cell')}
          </td>
        );
      })}
    </tr>
  );
}

const TopTemplatesGrid = ({
  columns,
  data,
  loading,
  error,
  sortBy: sortByColumn,
  orderBy,
  tableWidth,
  tableBodyWidth,
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // Get the state from the instance
  } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            id: sortByColumn,
            desc: orderBy === 'desc',
          },
        ],
      },
      manualSortBy: false,
      disableSortRemove: true,
    },
    useSortBy
  );

  const tableId = 'top_templates_table';
  return (
    <div className="mx-2">
      <div {...getTableProps()} className="table-responsive">
        <Table
          striped
          {...getTableProps()}
          id={`${tableId}`}
          style={{ minWidth: tableWidth, tableLayout: 'fixed' }}
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => {
                  return (
                    <td
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      onMouseEnter={(e) => {
                        e.currentTarget.classList.add('text-primary');
                        e.currentTarget.classList.add('pointer');
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.classList.remove('text-primary');
                        e.currentTarget.classList.remove('pointer');
                      }}
                      style={{
                        paddingLeft: column.paddingLeft,
                        paddingRight: column.paddingRight,
                        width: column.width,
                        minWidth: column.width,
                        maxWidth: column.width,
                      }}
                      className={`text-nowrap text-bold text-sm ${
                        !['Name', 'Cadence'].includes(
                          column.render('Header')
                        ) && 'text-center'
                      }`}
                    >
                      {column.render('Header')}
                      {
                        // To show sort icon
                        column.isSorted && (
                          <i
                            className={`text-email text-sm ml-0 fas fa-arrow-${
                              column.isSortedDesc ? 'down' : 'up'
                            }`}
                          ></i>
                        )
                      }
                    </td>
                  );
                })}
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
            minHeight: '300px',
            maxHeight: '300px',
            minWidth: tableBodyWidth,
          }}
        >
          <Table striped hover>
            <tbody {...getTableBodyProps()} className="ml-0">
              {!loading &&
                !error &&
                rows.length > 0 &&
                rows.slice(0, 100).map((row, i) => {
                  prepareRow(row);

                  return <GridRow row={row} key={'_' + i} />;
                })}
              {loading && !error && (
                <tr>
                  <td colSpan="10">
                    <Progress animated striped value="100">
                      Loading Top Templates...
                    </Progress>
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan="10">
                    <p className="text-warning text-center py-2">
                      {SORRY_NO_DATA_AVAILABLE}
                    </p>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="10">
                    <p className="text-warning text-center py-2">
                      {FAILED_TO_FETCH_DATA}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TopTemplatesGrid;
