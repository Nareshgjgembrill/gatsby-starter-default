/**
 * @author ranbarasan82
 * @version V11.0
 */
import React, { useState } from 'react';
import { useTable } from 'react-table';
import {
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  InputGroupButtonDropdown,
  Row,
  Table,
} from 'reactstrap';

const CommonOperators = () => {
  return (
    <>
      <option value="Contains">Contains</option>
      <option value="=">Equals</option>
      <option value="!=">Not Equals To</option>
      <option value="Starts With">Starts With</option>
      <option value="Is Empty">Is Empty</option>
      <option value="Is Not Empty">Is Not Empty</option>
    </>
  );
};

const BooleanOperators = () => {
  return (
    <>
      <option value="=">Equals</option>
      <option value="!=">Not Equals To</option>
    </>
  );
};

const DateOperators = () => {
  return (
    <>
      <option value="=">Equals</option>
      <option value=">">Greater Than</option>
      <option value=">=">Greater or Equals</option>
      <option value="<">Less Than</option>
      <option value="<=">Less Or Equals</option>
      <option value="!=">Not Equals To</option>
      <option value="Is Empty">Is Empty</option>
      <option value="Is Not Empty">Is Not Empty</option>
    </>
  );
};

const DateAndTimeOperators = () => {
  return (
    <>
      <option value="=">Equals</option>
      <option value=">">Greater Than</option>
      <option value=">=">Greater or Equals</option>
      <option value="<">Less Than</option>
      <option value="<=">Less Or Equals</option>
      <option value="Is Empty">Is Empty</option>
      <option value="Is Not Empty">Is Not Empty</option>
    </>
  );
};

const SelectOperators = () => {
  return (
    <>
      <option value="=">Equals</option>
      <option value="!=">Not Equals To</option>
      <option value="Is Empty">Is Empty</option>
      <option value="Is Not Empty">Is Not Empty</option>
    </>
  );
};

const dateOptions = [
  { value: 'today', option: 'Today' },
  { value: 'yesterday', option: 'Yesterday' },
  { value: 'current_week', option: 'Current week' },
  { value: 'last_week', option: 'Last week' },
  { value: 'current_month', option: 'Current month' },
  { value: 'last_month', option: 'Last month' },
  { value: 'last_7_days', option: 'Last 7 days' },
  { value: 'last_30_days', option: 'Last 30 days' },
  { value: 'last_60_days', option: 'Last 60 days' },
  { value: 'last_90_days', option: 'Last 90 days' },
];

function LogicGridRow({
  row,
  rowKey,
  fieldsList,
  hasError,
  handleCriteriaFieldsChange,
  handleActionDeleteRow,
}) {
  const filterJson = row.original;
  let criteriaValue = filterJson.criteriaValue
    ? filterJson.criteriaValue.join(',')
    : '';
  if (!filterJson.field) {
    const fieldId = filterJson.associations.field[0].id;
    const field = fieldsList.fields.data.filter(
      (field) => field.id === fieldId
    )[0];
    filterJson['field'] = {
      name: field.name,
      controlType: field.controlType,
      id: field.id,
    };
  }
  let fieldControlType = filterJson.field.controlType.toLowerCase();
  const fieldDataType =
    filterJson.field.name === 'tag'
      ? 'text'
      : filterJson.field.controlType.toLowerCase();
  fieldControlType =
    fieldControlType === 'numeric' || fieldControlType === 'integer'
      ? 'number'
      : fieldControlType === 'boolean'
      ? 'checkbox'
      : filterJson.field.name !== undefined && filterJson.field.name === 'tag'
      ? 'text'
      : fieldControlType;

  const dropdownValue = [];
  if (fieldControlType === 'timestamp') {
    filterJson['date'] = criteriaValue.split(' ')[0];
    filterJson['time'] =
      criteriaValue.split(' ').length > 1 ? criteriaValue.split(' ')[1] : '';
  }
  if (fieldControlType === 'checkbox') {
    criteriaValue =
      criteriaValue === 'true' || criteriaValue === true ? true : false;
  }
  if (fieldControlType === 'select') {
    const fieldJson = fieldsList.fields.data.filter(
      (field) => field.id === parseInt(filterJson.field.id)
    );

    // eslint-disable-next-line array-callback-return
    fieldJson[0].associations.fieldDropdownValues &&
      fieldJson[0].associations.fieldDropdownValues.forEach((item) => {
        fieldsList.fields.includedAssociations &&
          fieldsList.fields.includedAssociations.fieldDropdownValues.forEach(
            (dropItem) => {
              if (dropItem.id === item.id) {
                dropdownValue.push(dropItem);
              }
            }
          );
      });
  }

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropDown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleActionFieldsChange = (event, rowKey) => {
    const targetElement = event.target;
    let name = targetElement.name.startsWith('field')
      ? 'id'
      : targetElement.name.startsWith('operator')
      ? 'operator'
      : targetElement.name.startsWith('criteriaValue')
      ? 'criteriaValue'
      : targetElement.name;
    let value =
      targetElement.type === 'checkbox'
        ? targetElement.checked
        : targetElement.value;

    if (name === 'criteriaValue' && targetElement.type === 'checkbox') {
      value = [value];
      name = 'criteriaValue';
    } else if (name === 'criteriaValue') {
      value = [value];
      name = 'criteriaValue';
    }

    handleCriteriaFieldsChange(name, value, rowKey);
  };

  const handleActionDateTimeChange = (event, rowKey) => {
    const value = [event.currentTarget.value];
    handleCriteriaFieldsChange('criteriaValue', value, rowKey);
  };

  return (
    <tr {...row.getRowProps()} key={rowKey}>
      {row.cells.map((cell, colIndex) => {
        if (cell.column.id === 'fieldName') {
          return (
            <td
              key={colIndex}
              style={{
                width: cell.column.width,
                paddingRight: cell.column.paddingRight,
              }}
            >
              <Input
                type="select"
                className="react-select-box-label pl-2 pr-1"
                value={filterJson.field.id}
                name={'field' + rowKey}
                id={'field_' + rowKey}
                invalid={hasError('field' + rowKey, 'required')}
                data-validate='["required"]'
                onChange={(event) => handleActionFieldsChange(event, rowKey)}
              >
                <option></option>
                {fieldsList &&
                  fieldsList.fields &&
                  fieldsList.fields.data &&
                  fieldsList.fields.data.map((data, index) => {
                    return (
                      <option key={index} value={data.id}>
                        {data.label}
                      </option>
                    );
                  })}
              </Input>
              {hasError('field' + rowKey, 'required') && (
                <span className="invalid-feedback position-absolute mt-n2 pt-2">
                  Field is required
                </span>
              )}
            </td>
          );
        } else if (cell.column.id === 'operator') {
          return (
            <td
              key={colIndex}
              style={{
                width: cell.column.width,
                paddingRight: cell.column.paddingRight,
              }}
              className="py-3"
            >
              <Input
                type="select"
                value={filterJson.operator}
                name={'operator' + rowKey}
                id={`operator_${rowKey}`}
                invalid={hasError('operator' + rowKey, 'required')}
                data-validate='["required"]'
                onChange={(event) => handleActionFieldsChange(event, rowKey)}
              >
                <option></option>
                {fieldDataType === 'boolean' ? (
                  <BooleanOperators />
                ) : fieldDataType === 'integer' || fieldDataType === 'date' ? (
                  <DateOperators />
                ) : fieldDataType === 'timestamp' ? (
                  <DateAndTimeOperators />
                ) : fieldDataType === 'select' ? (
                  <SelectOperators />
                ) : (
                  <CommonOperators />
                )}
              </Input>
              {hasError('operator' + rowKey, 'required') && (
                <span className="invalid-feedback position-absolute mt-n2 pt-2">
                  Operator is required
                </span>
              )}
            </td>
          );
        } else {
          if (fieldControlType === 'select') {
            return (
              <td
                key={colIndex}
                style={{
                  width: cell.column.width,
                  paddingRight: cell.column.paddingRight,
                }}
                className="py-3"
              >
                <Row className="align-items-center">
                  <Col sm={10}>
                    <Input
                      type={fieldControlType}
                      disabled={
                        filterJson.operator === 'Is Empty' ||
                        filterJson.operator === 'Is Not Empty'
                      }
                      value={criteriaValue}
                      name="criteriaValue"
                      id={`criteriaValue_${rowKey}`}
                      autoComplete="off"
                      invalid={hasError('criteriaValue' + rowKey, 'required')}
                      data-validate='["required"]'
                      onChange={(event) =>
                        handleActionFieldsChange(event, rowKey)
                      }
                    >
                      <option></option>
                      {dropdownValue &&
                        dropdownValue.map((keyValue, j) => {
                          return (
                            <option value={keyValue.id} key={j}>
                              {keyValue.value}
                            </option>
                          );
                        })}
                    </Input>
                    {hasError('criteriaValue' + rowKey, 'required') && (
                      <span className="invalid-feedback position-absolute mt-n2 pt-2">
                        Value is required
                      </span>
                    )}
                  </Col>
                  <Col onClick={() => handleActionDeleteRow(rowKey)} sm={2}>
                    <i
                      className="fas fa-trash text-danger pointer"
                      title="Delete this filter criteria"
                    ></i>
                  </Col>
                </Row>
              </td>
            );
          } else {
            return (
              <td
                key={colIndex}
                style={{
                  width: cell.column.width,
                  paddingRight: cell.column.paddingRight,
                }}
                className="py-3"
              >
                <Row className="align-items-center">
                  <Col sm={10}>
                    {fieldControlType === 'textarea' ? (
                      <Input
                        rows="1"
                        type={fieldControlType}
                        disabled={
                          filterJson.operator === 'Is Empty' ||
                          filterJson.operator === 'Is Not Empty'
                        }
                        name={'criteriaValue' + rowKey}
                        id={`criteriaValue_${rowKey}`}
                        autoComplete="off"
                        value={criteriaValue}
                        invalid={hasError('criteriaValue' + rowKey, 'required')}
                        data-validate='["required"]'
                        onChange={(event) =>
                          handleActionFieldsChange(event, rowKey)
                        }
                      />
                    ) : fieldControlType === 'timestamp' ||
                      fieldControlType === 'date' ? (
                      <InputGroup>
                        <Input
                          type={
                            !isNaN(Date.parse(criteriaValue)) ||
                            criteriaValue === 'Custom' ||
                            criteriaValue === ''
                              ? 'date'
                              : 'text'
                          }
                          disabled={
                            filterJson.operator === 'Is Empty' ||
                            dateOptions
                              .map((date) => date.value)
                              .includes(criteriaValue) ||
                            filterJson.operator === 'Is Not Empty'
                          }
                          className="px-0 text-center"
                          value={
                            dateOptions
                              .map((date) => date.value)
                              .includes(criteriaValue)
                              ? dateOptions.find(
                                  (date) => date.value === criteriaValue
                                ).option
                              : criteriaValue
                          }
                          name={'criteriaValueDate' + rowKey}
                          id={'criteriaValueDate_' + rowKey}
                          autoComplete="off"
                          invalid={hasError(
                            'criteriaValueDate' + rowKey,
                            'required'
                          )}
                          data-validate='["required"]'
                          onChange={(event) =>
                            handleActionDateTimeChange(event, rowKey)
                          }
                        />
                        <InputGroupButtonDropdown
                          addonType="append"
                          isOpen={dropdownOpen}
                          toggle={toggleDropDown}
                          disabled={
                            filterJson.operator === 'Is Empty' ||
                            filterJson.operator === 'Is Not Empty'
                          }
                        >
                          <DropdownToggle>
                            <i className="fas fa-sort-down"></i>
                          </DropdownToggle>
                          <DropdownMenu>
                            {dateOptions.map((date, i) => (
                              <DropdownItem
                                key={`${date.value}-${i}`}
                                value={date.value}
                                onClick={(event) =>
                                  handleActionDateTimeChange(event, rowKey)
                                }
                              >
                                {date.option}
                              </DropdownItem>
                            ))}
                            <DropdownItem
                              value="Custom"
                              onClick={(event) =>
                                handleActionDateTimeChange(event, rowKey)
                              }
                            >
                              Custom
                            </DropdownItem>
                          </DropdownMenu>
                        </InputGroupButtonDropdown>
                        {hasError('criteriaValueDate' + rowKey, 'required') && (
                          <span className="invalid-feedback position-absolute invalid-date">
                            Date is required
                          </span>
                        )}
                      </InputGroup>
                    ) : fieldControlType === 'checkbox' ? (
                      <Input
                        type={fieldControlType}
                        name={'criteriaValue' + rowKey}
                        id={`criteriaValue_${rowKey}`}
                        autoComplete="off"
                        className="ml-2 mt-n2"
                        value={criteriaValue}
                        onChange={(event) =>
                          handleActionFieldsChange(event, rowKey)
                        }
                        checked={criteriaValue}
                      />
                    ) : (
                      <Input
                        type={fieldControlType}
                        name={'criteriaValue' + rowKey}
                        id={`criteriaValue_${rowKey}`}
                        disabled={
                          filterJson.operator === 'Is Empty' ||
                          filterJson.operator === 'Is Not Empty'
                        }
                        autoComplete="off"
                        value={criteriaValue}
                        invalid={hasError('criteriaValue' + rowKey, 'required')}
                        data-validate='["required"]'
                        onChange={(event) =>
                          handleActionFieldsChange(event, rowKey)
                        }
                      />
                    )}
                    {hasError('criteriaValue' + rowKey, 'required') && (
                      <span className="invalid-feedback position-absolute mt-n2 pt-2">
                        Value is required
                      </span>
                    )}
                  </Col>
                  <Col onClick={() => handleActionDeleteRow(rowKey)} sm={2}>
                    <i
                      className="fas fa-trash text-danger pointer"
                      title="Delete this filter criteria"
                    ></i>
                  </Col>
                </Row>
              </td>
            );
          }
        }
      })}
    </tr>
  );
}

function AddFilterLogicGrid({
  columns,
  data,
  fieldsList,
  hasError,
  handleCriteriaFieldsChange,
  handleActionDeleteRow,
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
    },
    (hooks) => {
      hooks.visibleColumns.push((columns) => [...columns]);
    }
  );

  const tableId = 'filter_logic_table';
  return (
    <Table {...getTableProps()} id={tableId} className="mb-0" hover>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <td {...column.getHeaderProps()} style={{ width: column.width }}>
                {column.render('Header')}
              </td>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.slice(0, 200).map((row, i) => {
          prepareRow(row);
          return (
            <LogicGridRow
              key={`row_${i}`}
              row={row}
              rowKey={i}
              fieldsList={fieldsList}
              hasError={hasError}
              handleCriteriaFieldsChange={handleCriteriaFieldsChange}
              handleActionDeleteRow={handleActionDeleteRow}
            />
          );
        })}
      </tbody>
    </Table>
  );
}

export default AddFilterLogicGrid;
