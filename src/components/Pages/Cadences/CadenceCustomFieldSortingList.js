import React from 'react';
import ProspectsSortByFieldsDropdown from '../../Common/ProspectsSortByFieldsDropdown';

const CadenceCustomFieldSortingList = ({
  sortBy,
  orderBy,
  setSortBy,
  setOrderBy,
}) => {
  const tableSortingValues = [
    'contactName',
    'email',
    'currentTouchId',
    'outCome',
    'lastTouchDateTime',
    'lastActivityDatetime',
    'duedate',
    'firstDialedDate',
    'firstEmailedDate',
    'lastDaCallOutcome',
    'lastDialedDate',
    'lastEmailOutcome',
    'lastEmailedDate',
    'lastTalkerCallOutcome',
    'firstName',
    'lastName',
    'emailId',
  ];

  return (
    <ProspectsSortByFieldsDropdown
      sortBy={tableSortingValues.includes(sortBy) ? null : sortBy}
      orderBy={tableSortingValues.includes(sortBy) ? null : orderBy}
      onSort={(field) => {
        setSortBy(field.sortBy);
        setOrderBy(field.orderBy);
      }}
      filterData={(field) => {
        return !tableSortingValues.includes(field.name);
      }}
    ></ProspectsSortByFieldsDropdown>
  );
};
export default CadenceCustomFieldSortingList;
