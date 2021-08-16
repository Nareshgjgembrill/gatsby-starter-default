/**
 * @author @anbarasanr
 * @version V11.0
 */
import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getAllAccounts } from '../../store/actions/actions';
import PropTypes from 'prop-types';
import UserContext from '../UserContext';
import { ApiUrlAndTokenContext } from '../../auth/ApiUrlAndTokenProvider';
import DropDown from './DropDown';
import { CREATE_ACCOUNT_QUERY } from '../queries/AccountsQuery';
import { useLazyQuery } from '@apollo/react-hooks';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
toast.configure();

const AccountList = ({
  getAllAccounts,
  accounts,
  value,
  onChange,
  placeHolder,
  handleAddAccount,
  handleFilter,
}) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const currentUserId = userLoading ? 0 : user.id;
  const dropDownRef = React.useRef();
  const [newAccountId, setNewAccountId] = useState();
  useEffect(() => {
    if (!accounts.fetchedAll) {
      getAllAccounts(currentUserId, apiURL, token);
    }
    // eslint-disable-next-line
  }, []);

  const data =
    (accounts &&
      accounts.data &&
      accounts.data
        .filter(
          (account) => account.name !== null && account.name.trim() !== ''
        )
        .map((account) => {
          return {
            text: account.name ? account.name : '',
            value: account.id,
            active: value === account.id ? true : false,
          };
        })) ||
    [];
  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
    });
  };

  const handleRefresh = () => {
    getAllAccounts(currentUserId, apiURL, token);
  };

  const [addAccount] = useLazyQuery(CREATE_ACCOUNT_QUERY, {
    onCompleted: (response) => addAccountCallBack(response, true),
    onError: (response) => addAccountCallBack(response),
  });

  const addAccountCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Account Added Successfully', 'success');
      handleRefresh();
      setNewAccountId(response.accounts.data[0].id);
      handleOnChange(response.accounts.data[0].id);
    } else {
      notify(
        response.graphQLErrors[0]
          ? response.graphQLErrors[0].message
          : 'Failed to add a account',
        'error'
      );
    }
  };

  if (handleFilter && data && data.length > 0) {
    data.filter((account) => handleFilter(account));
  }

  const handleRefreshAfterAccountAdd = (value) => {
    if (handleAddAccount) {
      addAccount({
        variables: {
          input: [{ name: value }],
        },
      });
    }
  };

  const handleOnChange = (value) => {
    onChange(value);
    setNewAccountId('');
  };

  return (
    <DropDown
      data={data}
      ref={dropDownRef}
      value={newAccountId ? newAccountId : value}
      onChange={handleOnChange}
      placeHolder={accounts.error ? 'Failed to fetch' : placeHolder}
      handleAdd={handleRefreshAfterAccountAdd}
      loading={data.length === 0 && accounts.loading}
      error={accounts.error}
      name="accountName"
    />
  );
};

const mapStateToProps = (state) => ({
  accounts: state.accounts,
});

AccountList.defaultProps = {
  placeHolder: 'Select Account', // this prop is used act as a default placeholder if we are not passing from parent component
};
AccountList.propTypes = {
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
export default connect(mapStateToProps, { getAllAccounts })(AccountList);
