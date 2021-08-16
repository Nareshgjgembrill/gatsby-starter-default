/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  getAllCadencesAllUsers,
  getAllUsers,
} from '../../store/actions/actions';
import UserContext from '../UserContext';
import { ApiUrlAndTokenContext } from '../../auth/ApiUrlAndTokenProvider';
import DropDown from '../Common/DropDown';

const CadenceList = ({
  ref,
  value,
  multiselect,
  onChange,
  placeHolder,
  handleAdd,
}) => {
  const dispatch = useDispatch();
  const { user, loading: userLoading } = useContext(UserContext);
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const currentUserId = userLoading ? 0 : user.id;
  const dropDownRef = React.useRef();

  const cadences = useSelector((state) => state.cadences);
  const users = useSelector((state) => state.users.data);
  const userIds = users.map((item) => item.id).join(',');

  useEffect(() => {
    if (!users.fetchedAll) {
      dispatch(getAllUsers(currentUserId, apiURL, token));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!cadences.fetchedAllUsers && userIds.length > 0) {
      dispatch(getAllCadencesAllUsers(':[' + userIds + ']', apiURL, token));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);
  const handleRefresh = () => {
    dispatch(getAllCadencesAllUsers(':[' + userIds + ']', apiURL, token));
  };

  const cadenceFilter = (cad, filter) => {
    if (filter === 'my') {
      return (
        ['ACTIVE', 'NEW'].includes(cad.status) &&
        cad?.associations?.touch?.length > 0 &&
        cad?.associations?.user[0]?.id === currentUserId
      );
    } else if (filter === 'shared') {
      return (
        ['ACTIVE', 'NEW'].includes(cad.status) &&
        cad?.associations?.touch?.length > 0 &&
        cad.sharedType !== 'none' &&
        cad?.associations?.user[0]?.id !== currentUserId
      );
    } else if (filter === 'private') {
      return (
        ['ACTIVE', 'NEW'].includes(cad.status) &&
        cad?.associations?.touch?.length > 0 &&
        cad.sharedType === 'none' &&
        cad?.associations?.user[0]?.id !== currentUserId
      );
    }
  };

  const cadenceData = [];
  if (cadences && cadences.dataAllUsers) {
    cadences.dataAllUsers
      .filter((cad) => cadenceFilter(cad, 'my'))
      .forEach((cad, index) => {
        cadenceData.push({
          text: cad.name,
          value: cad.id,
          active: false,
          header: index === 0 ? 'My Cadences' : '',
        });
      });

    cadences.dataAllUsers
      .filter((cad) => cadenceFilter(cad, 'shared'))
      .forEach((cad, index) => {
        cadenceData.push({
          text: cad.name,
          value: cad.id,
          active: false,
          header: index === 0 ? 'Shared Cadences' : '',
        });
      });

    cadences.dataAllUsers
      .filter((cad) => cadenceFilter(cad, 'private'))
      .forEach((cad, index) => {
        cadenceData.push({
          text: cad.name,
          value: cad.id,
          active: false,
          header: index === 0 ? 'Private Cadences' : '',
        });
      });
  }

  return (
    <DropDown
      data={cadenceData}
      ref={dropDownRef}
      value={value}
      onChange={onChange}
      placeHolder={cadences.errorUsers ? 'Failed to fetch' : placeHolder}
      multiselect={multiselect}
      handleAdd={handleAdd}
      handleRefresh={handleRefresh}
      loading={cadences.loadingUsers}
      error={cadences.errorUsers}
    />
  );
};

CadenceList.defaultProps = {
  placeHolder: 'Select Cadence', // this prop is used act as a default placeholder if we are not passing from parent component
};

CadenceList.propTypes = {
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
};
export default CadenceList;
