/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { parseUrl } from 'query-string';
import { toast } from 'react-toastify';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { getAllTags } from '../../../store/actions/actions';
import FETCH_TAG_QUERY, {
  CREATE_TAG_QUERY,
  DELETE_TAG_QUERY,
  UPDATE_TAG_QUERY,
} from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
import ConfirmModal from '../../Common/ConfirmModal';
import AddTagModal from './AddTagModal';
import TagGrid from './TagGrid';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const Tags = ({ match }) => {
  const dispatch = useDispatch();
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);

  const { query: searchParams } = parseUrl(window.location.search);
  const [modalTitle, setModalTitle] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [orderBy, setOrderBy] = useState('asc');
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [tagValue, setTagValue] = useState('');
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [tag, setTag] = useState();
  const [addOrEditError, setAddOrEditError] = useState();
  const [totalCount, setTotalCount] = useState(0);
  const [tagFilter, setTagFilter] = useState(
    `&sort[name]=asc&filter[user][id]=${currentUserId}`
  );
  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [limit, setLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const successMsg = (action) => {
    return (
      <>
        Tag <strong>{tagValue}</strong> {action} successfully!
      </>
    );
  };

  const deleteMsg = () => {
    return (
      <>
        <strong>{tagValue}</strong> Deleted successfully!.
      </>
    );
  };

  const { data: tagData, loading, error, refetch: refetchTagData } = useQuery(
    FETCH_TAG_QUERY,
    {
      variables: { tagFilter, limit, offset },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    }
  );

  const sortingParams = {
    name: 'sort[name]',
  };

  const [
    deleteTag,
    { data: deleteTagData, loading: deleteTagLoading },
  ] = useLazyQuery(DELETE_TAG_QUERY, {
    onCompleted: (response) => deleteTagCallback(response, true),
    onError: (response) => deleteTagCallback(response),
  });

  const [
    createTag,
    { data: createTagData, loading: createTagLoading },
  ] = useLazyQuery(CREATE_TAG_QUERY, {
    onCompleted: (response) => createTagCallback(response, true, 'created'),
    onError: (response) => createTagCallback(response),
  });

  const [
    updateTag,
    { data: updateTagData, loading: updateTagLoading },
  ] = useLazyQuery(UPDATE_TAG_QUERY, {
    onCompleted: (response) => updateTagCallback(response, true, 'updated'),
    onError: (response) => updateTagCallback(response),
  });

  const handleDeleteTag = (tag) => {
    setTag(tag);
    setTagValue(tag.original.name);
    setShowDeleteConfirmModal(true);
  };
  const handleUpdateTag = (tag) => {
    setTag(tag);
    setModalTitle('Update Tag');
    setAddOrEditError('');
    setShowAddTagModal(true);
  };

  const deleteTagCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify(deleteMsg, 'success', 'delete_tag');
      setShowDeleteConfirmModal(false);
      refetchTagData();
      dispatch(getAllTags(currentUserId, apiURL, token));
    } else {
      setShowDeleteConfirmModal(false);
      showErrorMessage(
        response,
        'Sorry! Failed to delete tag.',
        deleteTagData,
        'delete_tag'
      );
    }
  };

  const createTagCallback = (response, requestSuccess, action) => {
    if (requestSuccess) {
      notify(successMsg(action), 'success', 'tag_add');
      setShowAddTagModal(false);
      refetchTagData();
      dispatch(getAllTags(currentUserId, apiURL, token));
    } else {
      setAddOrEditError('Sorry! Failed to save');
      showErrorMessage(
        response,
        'Sorry! Failed to create tag.',
        createTagData,
        'create_tag'
      );
    }
  };

  const updateTagCallback = (response, requestSuccess, action) => {
    if (requestSuccess) {
      notify(successMsg(action), 'success', 'tag_add');
      setShowAddTagModal(false);
      refetchTagData();
      dispatch(getAllTags(currentUserId, apiURL, token));
    } else {
      setAddOrEditError('Sorry! Failed to update.');
      showErrorMessage(
        response,
        'Sorry! Failed to update tag.',
        updateTagData,
        'update_tag'
      );
    }
  };

  const columns = [
    {
      Header: 'Tag',
      accessor: 'name',
      width: '60%',
    },
    {
      Header: 'Count',
      accessor: 'tagAssignCount',
      width: '20%',
      disableSortBy: true,
    },
  ];

  const tagGridData = useMemo(
    () => (tagData && tagData.allTags ? tagData.allTags.data : []),
    [tagData]
  );
  useEffect(() => {
    setPageCount(
      !loading && tagData.allTags.paging
        ? Math.ceil(tagData.allTags.paging.totalCount / limit)
        : 0
    );
    setTotalCount(
      !loading && tagData.allTags.paging ? tagData.allTags.paging.totalCount : 0
    );
    // eslint-disable-next-line
  }, [tagData]);

  const handleTagsSearch = () => {
    const { query } = parseUrl(window.location.search);
    query['filter[user][id]'] = currentUserId;
    query['page[offset]'] = 0;
    query[sortingParams[sortBy]] = orderBy;
    const filterQry = Object.entries({ ...query })
      .filter(
        ([key]) =>
          key.startsWith('filter') ||
          key.startsWith('sort') ||
          key.startsWith('page')
      )
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setTagFilter(filterQry === '' ? '' : '&' + filterQry);
  };
  // eslint-disable-next-line
  useEffect(() => handleTagsSearch(), [sortBy, orderBy]);

  return (
    <Card className="card-default">
      <CardHeader>
        <i className="fas fa-tags mr-2"></i>
        List of Tags
        <div
          className="card-tool float-right"
          onClick={() => {
            setModalTitle('Add Tag');
            setShowAddTagModal(true);
            setTag(undefined);
            setAddOrEditError('');
          }}
        >
          <i className="fas fa-plus text-primary pointer" title="Add Tag"></i>
        </div>
      </CardHeader>
      <CardBody>
        <TagGrid
          columns={columns}
          data={tagGridData}
          tagData={tagData}
          sortBy={sortBy}
          orderBy={orderBy}
          fetchData={({ pageIndex, pageSize }) => {
            setOffset(pageIndex);
            setCurrentPageIndex(pageIndex);
            setLimit(pageSize);
            if (!currentUrlStatePushed) {
              window.history.replaceState({}, '', window.location.href);
              setCurrentUrlStatePushed(true);
            }
            if (match.params.tab === 'tag') {
              const { query } = parseUrl(window.location.search);
              query['page[limit]'] = pageSize;
              query['page[offset]'] = pageIndex;
              const searchString = Object.entries(query)
                .map(([key, val]) => `${key}=${val}`)
                .join('&');
              window.history.replaceState({}, '', '?' + searchString);
            }
          }}
          loading={loading}
          error={error}
          pageSize={limit}
          pageCount={pageCount}
          totalCount={totalCount}
          currentPageIndex={currentPageIndex}
          handleRefresh={refetchTagData}
          handleSort={(sortBy, orderBy) => {
            setSortBy(sortBy);
            setOrderBy(orderBy ? 'desc' : 'asc');
            setOffset(0);
          }}
          handleUpdateTag={handleUpdateTag}
          handleDeleteTag={handleDeleteTag}
        />
        <AddTagModal
          hideModal={() => {
            setShowAddTagModal(false);
          }}
          showModal={showAddTagModal}
          title={modalTitle}
          data={tag}
          addOrEditError={addOrEditError}
          showActionBtnSpinner={createTagLoading || updateTagLoading}
          handleAction={(tagName, id) => {
            const input = { names: [tagName] };
            setTagValue(tagName);
            if (tagName === '') {
              setAddOrEditError('Please enter tag name');
            } else if (id === 0) {
              createTag({
                variables: { input },
              });
            } else {
              updateTag({
                variables: {
                  id: id,
                  name: tagName,
                },
              });
            }
          }}
        />
        <ConfirmModal
          confirmBtnIcon="fas fa-trash"
          confirmBtnText="Delete"
          handleCancel={() => setShowDeleteConfirmModal(false)}
          showConfirmModal={showDeleteConfirmModal}
          handleConfirm={() =>
            deleteTag({ variables: { tagId: tag.original.id } })
          }
          showConfirmBtnSpinner={deleteTagLoading}
        >
          <span>
            Are you sure you want to delete{' '}
            <strong>
              {(tag !== undefined ? tag.original.name : 'Tag') + '?'}
            </strong>
          </span>
        </ConfirmModal>
      </CardBody>
    </Card>
  );
};
export default Tags;
