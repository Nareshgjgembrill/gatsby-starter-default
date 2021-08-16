/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getAllTags } from '../../store/actions/actions';
import PropTypes from 'prop-types';
import UserContext from '../UserContext';
import { ApiUrlAndTokenContext } from '../../auth/ApiUrlAndTokenProvider';
import DropDown from './DropDown';
import { CREATE_TAG_QUERY } from '../queries/EmailTemplatesQuery';
import { useLazyQuery } from '@apollo/react-hooks';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
toast.configure();

const TagList = ({
  getAllTags,
  tags,
  value,
  multiselect,
  onChange,
  placeHolder,
  handleAddTag,
  disabled,
  handleFilter,
  maxLength,
  selectedUserId,
  isRefreshTagList,
}) => {
  const { user, loading: userLoading } = useContext(UserContext);
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const currentUserId = selectedUserId
    ? selectedUserId
    : userLoading
    ? 0
    : user.id;
  const dropDownRef = React.useRef();
  const [newTagName, setNewTagName] = useState();
  useEffect(() => {
    if (!tags.fetchedAll || currentUserId !== user.id || isRefreshTagList) {
      getAllTags(currentUserId, apiURL, token);
    }
    // eslint-disable-next-line
  }, [currentUserId]);

  const arr = tags?.data;
  const seen = new Set();
  const filteredArr = arr.filter((tag) => {
    const duplicate = seen.has(tag.name);
    seen.add(tag.name);
    return !duplicate;
  });

  let data =
    tags?.data &&
    filteredArr.map((tag) => {
      return {
        text: tag.name,
        value: tag.id,
        active:
          value && multiselect && value.indexOf(tag.id) !== -1
            ? true
            : value === tag.id
            ? true
            : false,
      };
    });

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
    });
  };

  const handleRefresh = () => {
    getAllTags(currentUserId, apiURL, token);
  };

  const [addTag] = useLazyQuery(CREATE_TAG_QUERY, {
    onCompleted: (response) => addTagCallBack(response, true),
    onError: (response) => addTagCallBack(response),
  });

  const addTagCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      handleRefresh();
      notify('Tag Added Successfully', 'success');
      if (multiselect) {
        setNewTagName([response.Tag.data[0].id]);
        onChange([response.Tag.data[0].id], [response.Tag.data[0].name]);
      } else {
        setNewTagName(response.Tag.data[0].id);
        onChange(response.Tag.data[0].id, response.Tag.data[0].name);
      }
    } else if (
      response.graphQLErrors !== null &&
      response.graphQLErrors.length > 0
    ) {
      notify(
        response.graphQLErrors[0]
          ? response.graphQLErrors[0].message
          : 'Sorry! Failed to add a tag.',
        'error'
      );
    }
  };

  if (handleFilter && data.length > 0) {
    data = data.filter((cadence) => handleFilter(cadence));
  }

  const handleRefreshAfterTagAdd = (value) => {
    if (handleAddTag) {
      const input = { names: [value] };
      if (currentUserId) {
        input['user'] = { id: currentUserId };
      }
      addTag({ variables: { input } });
    }
  };

  const handleOnChange = (value, label) => {
    onChange(value, label);
    setNewTagName('');
  };

  return (
    <DropDown
      data={data}
      ref={dropDownRef}
      value={newTagName ? newTagName : value}
      onChange={handleOnChange}
      placeHolder={tags.error ? 'Failed to fetch' : placeHolder}
      multiselect={multiselect}
      handleAdd={handleRefreshAfterTagAdd}
      disabled={disabled}
      //handleRefresh={handleRefresh}  //As per Anu's update hidding temporarily
      loading={tags.loading}
      error={tags.error}
      maxLength={maxLength}
      name="tagName"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      }}
    />
  );
};
const mapStateToProps = (state) => ({
  tags: state.tags,
});

TagList.defaultProps = {
  placeHolder: 'Select Tag', // this prop is used act as a default placeholder if we are not passing from parent component
  isRefreshTagList: false,
};
TagList.propTypes = {
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
  selectedUserId: PropTypes.number,
  isRefreshTagList: PropTypes.bool,
};
export default connect(mapStateToProps, { getAllTags })(TagList);
