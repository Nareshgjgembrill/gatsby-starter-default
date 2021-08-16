/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getAllUsers } from '../../store/actions/actions';
import UserContext from '../UserContext';
import { ApiUrlAndTokenContext } from '../../auth/ApiUrlAndTokenProvider';
import DropDown from '../Common/DropDown';

const UserList = ({
  getAllUsers,
  users,
  value,
  multiselect,
  onChange,
  placeHolder,
  handleSelectedAll,
  handleAdd,
  handleFilter,
  disabled,
  handleGetDropDownState,
  name,
  disableOptions,
}) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const dropDownRef = React.useRef();
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);

  useEffect(() => {
    if (!users.fetchedAll) {
      getAllUsers(currentUserId, apiURL, token);
    }
    // eslint-disable-next-line
  }, []);

  users.data &&
    users.data.sort((a, b) =>
      a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    );

  let data =
    users &&
    users.data &&
    users.data.map((user) => {
      return {
        text: user.name,
        value: user.id,
        active:
          value && multiselect && value.indexOf(user.id) !== -1
            ? true
            : value === user.id
            ? true
            : false,
      };
    });

  handleSelectedAll &&
    value &&
    data &&
    (value.length === data.length
      ? handleSelectedAll('allUsers')
      : handleSelectedAll('selectedUsers'));
  handleSelectedAll &&
    value &&
    data &&
    value.length === 0 &&
    handleSelectedAll('currentUser');

  // for now we are hiding the refresh icon
  // const handleRefresh = () => {
  //   getAllUsers(currentUserId);
  // };

  if (handleFilter && data && data.length > 0) {
    data = data.filter((cadence) => handleFilter(cadence));
  }

  return (
    <DropDown
      name={name}
      data={data}
      ref={dropDownRef}
      value={value}
      onChange={onChange}
      disabled={disabled}
      multiselect={multiselect}
      placeHolder={users.error ? 'Failed to fetch' : placeHolder}
      handleAdd={handleAdd}
      // handleRefresh={handleRefresh}
      loading={users.loading}
      error={users.error}
      handleGetDropDownState={handleGetDropDownState}
      disableOptions={disableOptions}
    />
  );
};

const mapStateToProps = (state) => ({
  users: state.users,
});

UserList.defaultProps = {
  placeHolder: 'Select User', // this prop is used act as a default placeholder if we are not passing from parent component
};

UserList.propTypes = {
  disabled: PropTypes.bool, //If false dropdown is enabled else true dropwdown is disabled
  multiselect: PropTypes.bool, //Prop used to dropdown with multiselection , default single select (default false else true)
  onChange: PropTypes.func, // onchange function is used to get the selected dropdown value
  data: PropTypes.array, // data prop is used to load the options in the dropdown component
  handleSearch: PropTypes.func, //handle search function is used to search the dropdown value in server side
  handleAdd: PropTypes.func, // handle add function is used to add a new option from the frontend
  loading: PropTypes.bool, // If true request loading else false
  handleRefresh: PropTypes.func, // handle refresh function is used to refetch the dropdown value
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]), //value prop is used to default selection for the doropwdown
  disableOptions: PropTypes.bool, // Used to disable the options if we pass as true
};

export default connect(mapStateToProps, { getAllUsers })(UserList);
