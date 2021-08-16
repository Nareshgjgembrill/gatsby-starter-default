import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap';
import useFieldsData from './hooks/useFieldsData';

const ProspectsSortByFieldsDropdown = ({
  filterData,
  onSort,
  sortBy,
  orderBy,
}) => {
  const { data: fieldsData } = useFieldsData();

  const sortableFilelds = fieldsData?.fields?.data.filter(
    (item) => !item.hidden && item.sortable
  );

  const [sortListDropdownOpen, setSortListDropdownOpen] = useState(false);
  const toggleAction = () => setSortListDropdownOpen(!sortListDropdownOpen);

  const currentSortingField = sortableFilelds?.find((field) => {
    return field.name === sortBy;
  });

  const handleSort = (item) => {
    const currentOrder =
      item.name === sortBy ? (orderBy === 'asc' ? 'desc' : 'asc') : 'asc';
    onSort && onSort({ sortBy: item.name, orderBy: currentOrder });
  };

  return (
    <ButtonDropdown
      isOpen={sortListDropdownOpen}
      toggle={toggleAction}
      title={
        sortBy && currentSortingField
          ? currentSortingField.label
          : 'Sort by other fields'
      }
    >
      <DropdownToggle caret>
        {sortBy && currentSortingField ? currentSortingField.label : 'Sort by '}
        {orderBy && currentSortingField && (
          <i
            className={`fas fa-arrow-${
              orderBy === 'asc' ? 'up' : 'down'
            } ml-2 mr-1 text-info`}
          ></i>
        )}
      </DropdownToggle>
      <DropdownMenu
        right
        modifiers={{
          setMaxHeight: {
            enabled: true,
            order: 890,
            fn: (data) => {
              return {
                ...data,
                styles: {
                  ...data.styles,
                  overflow: 'auto',
                  maxHeight: '225px',
                },
              };
            },
          },
        }}
      >
        {sortableFilelds ? (
          sortableFilelds
            ?.filter((item) => (filterData ? filterData(item) : true))
            .map((item, index) => {
              return (
                <DropdownItem onClick={() => handleSort(item)} key={index}>
                  {item.label}
                  {sortBy === item.name && (
                    <i
                      className={`fas fa-arrow-${
                        orderBy === 'asc' ? 'up' : 'down'
                      } ml-2 mr-1 text-info`}
                    ></i>
                  )}
                </DropdownItem>
              );
            })
        ) : (
          <DropdownItem>No sorting fields available</DropdownItem>
        )}
      </DropdownMenu>
    </ButtonDropdown>
  );
};

ProspectsSortByFieldsDropdown.prototypes = {
  onSort: PropTypes.func.isRequired, //Required to update the selected sorting parameters in parent component and to fetch the required data list.
  filterData: PropTypes.func, //Optional to filter the fields to show in the dropdown (e.g., to filter the implicit table fields from the total fields available
  sortBy: PropTypes.string.isDefined, //Required in String or can be "null" to update the selected sorting parameters in UI dropdown.
  orderBy: PropTypes.string.isDefined, //Required in String or can be "null" to update the selected sorting parameters in UI dropdown.
};

export default ProspectsSortByFieldsDropdown;
