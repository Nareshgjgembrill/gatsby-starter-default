import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import {
  Badge,
  Card,
  CardBody,
  CustomInput,
  FormGroup,
  InputGroup,
} from 'reactstrap';

import { useLazyQuery, useQuery } from '@apollo/react-hooks';

import { parseUrl } from 'query-string';
import { notify, showErrorMessage } from '../../../util/index';
import { ContentWrapper } from '@nextaction/components';
import ConfirmModal from '../../Common/ConfirmModal';
import PageHeader from '../../Common/PageHeader';
import SearchBar from '../../Common/SearchBar';
import UserList from '../../Common/UserList';
import UserContext from '../../UserContext';
import FETCH_ALL_SNIPPETS_QUERY, {
  DELETE_SNIPPET_QUERY,
  TAG_SNIPPET_QUERY,
} from '../../queries/SnippetsQuery';
import { FETCH_TEMPLATES_SNIPPETS_COUNT_QUERY } from '../../queries/EmailTemplatesQuery';
import FilterTabs from './FilterTabs';
import TagTemplateModal from './TagTemplateModal';

import 'react-toastify/dist/ReactToastify.css';
import EmailTemplatesGrid from './EmailTemplatesGrid';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
toast.configure();

const Snippets = ({ history, location }) => {
  const { query: searchParams } = parseUrl(location.search);
  const [handleRefetch, setHandleRefetch] = useState(
    location.state ? location.state.handleRefetch : false
  );

  const [activeTab] = useState('Snippets');

  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;

  const sortingParams = {
    name: 'sort[name]',
    owner: 'sort[user][name]',
    updatedDate: 'sort[updatedDate]',
  };
  const urlReqParmater = Object.entries({
    ...searchParams,
  })
    .filter(([key]) => key.startsWith('sort'))
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  let sortByUrlParam;
  let orderByUrlParam;
  if (urlReqParmater && urlReqParmater.includes('sort[')) {
    sortByUrlParam =
      'sort' +
      urlReqParmater
        .match(/\[.*?\]/g)
        .map((x) => x)
        .join('');
    orderByUrlParam = urlReqParmater.split('=')[1] || '';
    sortByUrlParam = Object.entries({
      ...sortingParams,
    })
      .filter((data) => data[1] === sortByUrlParam)
      .map((data) => data[0])
      .join();

    if (!sortByUrlParam) {
      sortByUrlParam = 'updatedDate';
    }

    if (['asc', 'desc'].indexOf(orderByUrlParam.toLowerCase()) === -1) {
      orderByUrlParam = 'desc';
    }
  }
  const [previousSortParam, setPreviousSortParam] = useState(
    sortByUrlParam || 'updatedDate'
  );
  const [sortBy, setSortBy] = useState(sortByUrlParam || 'updatedDate');
  const [orderBy, setOrderBy] = useState(orderByUrlParam || 'desc');

  const [currentUser, setCurrentUser] = useState(
    searchParams['filter[user][id]']
      ? parseInt(searchParams['filter[user][id]'])
      : currentUserId
  );
  const [selectedUser, setSelectedUser] = useState(
    searchParams['filter[user][id]']
      ? parseInt(searchParams['filter[user][id]'])
      : currentUserId
  );
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';

  const [searchKey, setSearchKey] = useState('');

  const [searchInput, setSearchInput] = useState(
    searchParams['filter[q]'] ? searchParams['filter[q]'] : ''
  );

  const snippetActions = {
    DELETE_SNIPPET: 'DELETE_SNIPPET',
    TAG: 'TAG',
  };

  const [currentSnippet, setCurrentSnippet] = useState({});
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [deleteSnippetItem, setDeleteSnippetItem] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );

  const sharedTypeCheck = searchParams['filter[shared]'] && true;

  const [shared, setSharedType] = useState(sharedTypeCheck);

  const [toggle, settoggle] = useState(
    searchParams['filter[shared]']
      ? searchParams['filter[shared]'] === 'true'
        ? true
        : false
      : false
  );

  const snippetFilterQuery = `&filter[user][id]=${
    currentUser ? currentUser : currentUserId
  }&sort[${sortBy}]=${orderBy}`;

  const [snippetFilter, setSnippetFilter] = useState(
    searchInput
      ? `&filter[q]=${searchInput}` + snippetFilterQuery
      : snippetFilterQuery
  );
  const [listResponse, setListResponse] = useState();
  const [countData, setCountData] = useState(null);

  const [showTagSnippetModal, setShowTagSnippetModal] = useState(false);
  const [showTagConfirmModal, setShowTagConfirmModal] = useState(false);
  const [tagIds, setTagIds] = useState();
  const [tagLabel, setTagLabel] = useState();
  const [isRefreshTagList, setIsRefreshTagList] = useState(false);

  // Fetch Snippets data from api-server

  const {
    data: templatesData,
    loading,
    error,
    refetch: refetchSnippetsGrid,
  } = useQuery(FETCH_ALL_SNIPPETS_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=user&includeAssociations[]=tag',
      snippetFilter,
      limit,
      offset,
    },
    onError: (response) => {
      setListResponse(response?.graphQLErrors[0]?.message);
    },
    notifyOnNetworkStatusChange: true,
  });

  const [
    deleteSnippet,
    { data: deleteSnippetData, loading: deleteSnippetLoading },
  ] = useLazyQuery(DELETE_SNIPPET_QUERY, {
    onCompleted: (response) =>
      handleSnippetDeleteteRequestCallback(response, true),
    onError: (response) =>
      handleSnippetDeleteteRequestCallback(response, false, deleteSnippetData),
  });

  // fetch templates and snippets from API
  const [
    fetchTemplateAndSnippetsCount,
    {
      data: templateAndSnippetsCountData,
      loading: templateAndSnippetsCountLoading,
      error: templateAndSnippetsCountError,
    },
  ] = useLazyQuery(FETCH_TEMPLATES_SNIPPETS_COUNT_QUERY, {
    variables: {
      userFilter: `filter[user][id]=${selectedUser}${
        shared ? `&filter[shared]=true` : ''
      }`,
      statusFilter: `&filter[status]=true`,
    },
    onCompleted: (response) =>
      fetchTemplateAndSnippetsRequestCallback(response, true),
    onError: (response) => fetchTemplateAndSnippetsRequestCallback(response),
  });

  const fetchTemplateAndSnippetsRequestCallback = (
    response,
    requestSuccess
  ) => {
    if (response && requestSuccess) {
      setCountData(templateAndSnippetsCountData);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to fetch templates and snippets count',
        templateAndSnippetsCountData,
        'fetch_template_and_snippets_count'
      );
    }
  };

  // Tag prospect request
  const [
    tagSnippet,
    { data: tagData, loading: tagSnippetLoading },
  ] = useLazyQuery(TAG_SNIPPET_QUERY, {
    onCompleted: (response) => handleTagSnippetRequestCallback(response, true),
    onError: (response) => handleTagSnippetRequestCallback(response),
  });

  const handleTagSnippetRequestCallback = (response, requestSuccess) => {
    setShowTagSnippetModal(false);
    if (requestSuccess) {
      notify('Tags added successfully!', 'success');
      refetchSnippetsGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to add a tag.',
        tagData,
        'import_crm_tag'
      );
    }
  };

  const handleTagAction = (tagIds, tagLabel) => {
    setTagIds(tagIds);
    setTagLabel(tagLabel);
    setShowTagConfirmModal(true);
  };

  if (handleRefetch) {
    refetchSnippetsGrid();
    setHandleRefetch(false);
  }

  const handleOnChange = (e) => {
    settoggle(!toggle);
    setOffset(0);
    setCurrentPageIndex(0);
    if (!currentUrlStatePushed) {
      window.history.pushState({}, '', window.location.href);
      setCurrentUrlStatePushed(true);
    }
    const { query } = parseUrl(window.location.search);

    if (e.target.checked) {
      query['filter[shared]'] = true;
      setSharedType(true);
    } else {
      delete query['filter[shared]'];
      setSharedType(false);
    }

    if (searchInput) {
      query['filter[name]'] = searchInput;
    } else {
      delete query['filter[name]'];
    }

    const filterQry = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? selectedUser : currentUser,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setSnippetFilter(filterQry === '' ? '' : '&' + filterQry);

    const searchString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', '?' + searchString);
  };

  const gridData = useMemo(
    () =>
      templatesData && templatesData.snippets
        ? templatesData.snippets.data
        : [],
    [templatesData]
  );

  useEffect(
    () => {
      setPageCount(
        !loading && templatesData?.snippets?.paging
          ? Math.ceil(templatesData.snippets.paging.totalCount / limit)
          : 0
      );
      setTotalCount(
        !loading && templatesData?.snippets?.paging
          ? templatesData.snippets.paging.totalCount
          : 0
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridData]
  );

  useEffect(() => {
    fetchTemplateAndSnippetsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridData]);

  const handleSnippetsSearch = (search, triggerType) => {
    if (!triggerType) {
      setOffset(0);
      setCurrentPageIndex(0);
    }
    const { query } = parseUrl(window.location.search);
    let name;
    if (triggerType && query['filter[q]']) {
      name = decodeURIComponent(query['filter[q]']);
      setSearchKey(name);
    } else {
      name = search;
      setSearchKey(search ? search : '');
    }
    if (shared) {
      query['filter[shared]'] = shared;
    } else {
      delete query['filter[shared]'];
    }
    if (name?.trim()) {
      query['filter[q]'] = `${encodeURIComponent(name)}`;
      query['filter[shared]'] = true;
      setSearchInput(decodeURIComponent(query['filter[q]']));
    } else {
      delete query['filter[q]'];
      if (shared) {
        query['filter[shared]'] = shared;
      } else {
        delete query['filter[shared]'];
      }
      setSearchInput('');
    }

    if (previousSortParam && previousSortParam !== sortBy) {
      delete query[sortingParams[previousSortParam]];
      setPreviousSortParam(sortBy);
    }

    query[sortingParams[sortBy]] = orderBy;

    if (currentUser !== selectedUser) {
      setCurrentUser(selectedUser);
    }

    const filterQry = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? selectedUser : currentUser,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setSnippetFilter(filterQry === '' ? '' : '&' + filterQry);

    if (name?.trim() && !shared) {
      delete query['filter[shared]'];
    } else {
      if (shared) {
        query['filter[shared]'] = shared;
      } else {
        delete query['filter[shared]'];
      }
    }
    const searchString = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? selectedUser : currentUser,
    })
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', '?' + searchString);
  };

  const handleRowToolbarButton = (action, snippet) => {
    setCurrentSnippet(snippet);

    if (action === snippetActions.DELETE_SNIPPET) {
      setDeleteSnippetItem(true);
    } else if (action === snippetActions.TAG) {
      setShowTagSnippetModal(true);
    }
  };

  const handleSnippetDeleteteRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Success! Snippet has been deleted', 'success', 'delete_snippet');
      setDeleteSnippetItem(false);
      refetchSnippetsGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete this Snippet',
        errorData,
        'delete_snippet'
      );
    }
  };

  /* ---- Grid Columns configuration -begin ----- */
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',

        width: '40%',

        Cell: function (props) {
          return (
            <Link
              to={{
                pathname:
                  '/templates/snippets/' + props.row.original.id + '/edit',
                search: window.location.search,
                state: {
                  pathName: location.pathname,
                  search: location.search,
                },
              }}
              className="text-break"
            >
              <span className="mr-2">{props.value}</span>
            </Link>
          );
        },
      },
      {
        Header: '',
        accessor: 'shareType',
        width: '10%',
        Cell: function (props) {
          return (
            <i
              className="fas fa-user-friends text-muted"
              title={'This is a shared snippet'}
              hidden={props.row.original.sharedType === 'none' ? true : false}
            ></i>
          );
        },
      },
      {
        Header: 'Owner',
        accessor: 'owner',
        width: '15%',
        Cell: function (props) {
          const rowData = props.row.original;
          let owner;
          if (
            rowData.associations &&
            rowData.associations.user &&
            props.templatesData &&
            props.templatesData.snippets.includedAssociations &&
            props.templatesData.snippets.includedAssociations.user
          ) {
            owner = props.templatesData.snippets.includedAssociations.user.find(
              (item) => item.id === rowData.associations.user[0].id
            );
          }
          const ownerName = owner && owner.name.split(' ');

          return (
            <span className="fa-stack fa-1x text-circle">
              <i className="fas fa-circle fa-stack-2x text-white thin-circle"></i>
              <span className="fa-stack-1x text-sm" title={owner && owner.name}>
                {ownerName &&
                  ownerName[0] &&
                  ownerName[0].charAt(0).toUpperCase()}
                {ownerName &&
                  ownerName[1] &&
                  ownerName[1].charAt(0).toUpperCase()}
              </span>
            </span>
          );
        },
      },
      {
        Header: 'Tags',
        accessor: 'tagName',
        width: '10%',
        Cell: function (props) {
          let taglist = [];
          let remainingTags;
          const rowData = props.row.original;
          const tagAssociations =
            rowData.associations &&
            rowData.associations.tag.map((item) => item.id);
          const tagnames = [];
          if (
            props.templatesData.snippets.includedAssociations &&
            props.templatesData.snippets.includedAssociations.tag
          ) {
            props.templatesData.snippets.includedAssociations.tag.forEach(
              (item) => {
                if (tagAssociations.includes(item.id)) {
                  tagnames.push(item);
                }
              }
            );
          }
          if (tagnames && tagnames.length > 2) {
            remainingTags = tagnames.length - 2;
            taglist = tagnames.splice(0, 2);
          } else {
            taglist = tagnames && tagnames;
          }
          return (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {taglist &&
                taglist.length > 0 &&
                taglist.map((tag, index) => {
                  if (index === 0) {
                    return (
                      <Badge
                        key={index}
                        className="border border-dark text-normal mb-2"
                        color="light"
                      >
                        <span title={tag.tagValue}>
                          {tag.tagValue.length > 15
                            ? tag.tagValue.slice(0, 14) + '...'
                            : tag.tagValue}
                        </span>
                      </Badge>
                    );
                  } else {
                    return (
                      <div className="position-relative" key={index}>
                        <Badge
                          className="border border-dark text-normal"
                          color="light"
                        >
                          <span title={tag.tagValue}>
                            {tag.tagValue.length > 15
                              ? tag.tagValue.slice(0, 14) + '...'
                              : tag.tagValue}
                          </span>
                        </Badge>
                        {remainingTags && (
                          <span className="position-absolute ml-1 text-dark">{`+${remainingTags}`}</span>
                        )}
                      </div>
                    );
                  }
                })}
            </>
          );
        },
      },
      {
        Header: 'Last Modified',
        accessor: 'updatedDate',
        width: '25%',
        Cell: function (props) {
          const modifiedDateTime = props.value && props.value;
          const currentTimeZone = moment.tz.guess();
          const updatedDateTime = moment
            .tz(modifiedDateTime, currentTimeZone)
            .format('M/D/YYYY h:mm A');
          return <span>{modifiedDateTime ? updatedDateTime : ''}</span>;
        },
      },
    ],
    [location.pathname, location.search]
  );
  /* ---- Grid Columns configuration -end ----- */

  useEffect(() => {
    handleSnippetsSearch(null, 'Effect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, orderBy, selectedUser]);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  return (
    <ContentWrapper>
      <PageHeader icon="fas fa-cut fa-sm" pageName="Snippets">
        <div className="d-lg-flex align-items-center d-sm-block h-100">
          <InputGroup hidden={!isManagerUser} className="w-auto">
            <div className="px-0 wd-md">
              <UserList
                value={selectedUser}
                placeHolder={'Select Users'}
                onChange={(value) => {
                  setSelectedUser(value);
                }}
              />
            </div>
          </InputGroup>
          <InputGroup className="mx-lg-1 my-sm-1 my-lg-0 w-auto ml-xl-1">
            <SearchBar
              clname="mr-2"
              searchInput={searchKey}
              onSearch={handleSnippetsSearch}
              onChange={setSearchKey}
            />
          </InputGroup>
          <Link
            className="btn btn-secondary py-2"
            to={{
              pathname:
                activeTab === 'Templates'
                  ? '/templates/emails/add'
                  : '/templates/snippets/add',
              search: location.search,
              state: {
                pathName: location.pathname,
                search: window.location.search,
              },
            }}
            title="Create new Snippet"
          >
            <i className="fa fa-plus mr-2"></i>
            Add a Snippet
          </Link>
        </div>
      </PageHeader>

      <Card className="card-default">
        <CardBody>
          <div className="mb-3">
            <FilterTabs
              countData={countData}
              loading={templateAndSnippetsCountLoading}
              error={templateAndSnippetsCountError}
              activeTabValue="Snippets"
              history={history}
              shared={shared ? true : false}
              refreshCount={
                location.state ? location.state.handleRefetch : false
              }
            />

            <div className="float-md-right pt-sm-2">
              <FormGroup check inline>
                <span className="mr-2">My Snippets</span>
                <CustomInput
                  type="switch"
                  id="example_custom_switch"
                  name="custom_switch"
                  checked={toggle}
                  onChange={handleOnChange}
                ></CustomInput>
                <span>All Snippets</span>
              </FormGroup>
            </div>
          </div>

          <EmailTemplatesGrid
            selectedUserId={selectedUser}
            currentUserId={currentUserId}
            columns={columns}
            data={gridData}
            templatesData={templatesData}
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

              const { query } = parseUrl(window.location.search);
              query['page[limit]'] = pageSize;
              query['page[offset]'] = pageIndex;
              if (shared === true) {
                query['filter[shared]'] = shared;
              } else {
                delete query['filter[shared]'];
              }

              if (query['filter[q]']) {
                setSearchKey(decodeURIComponent(query['filter[q]']));
              }

              const searchString = Object.entries(query)
                .map(([key, val]) => `${key}=${val}`)
                .join('&');
              window.history.replaceState({}, '', '?' + searchString);
            }}
            loading={loading}
            pageSize={limit}
            pageCount={pageCount}
            totalCount={totalCount}
            error={error}
            currentPageIndex={currentPageIndex}
            snippetActions={snippetActions}
            handleRowToolbarButton={handleRowToolbarButton}
            handleRefresh={refetchSnippetsGrid}
            tabName="Snippets"
            pathName={location.pathname}
            listResponse={listResponse}
            handleSortBy={(column, order) => {
              setSortBy(column);
              setOrderBy(order);
            }}
          />
        </CardBody>
      </Card>

      {/* below modals are used to add a tags to snippets ---> start */}
      <TagTemplateModal
        handleAction={handleTagAction}
        hideModal={() => {
          setShowTagSnippetModal(false);
          setIsRefreshTagList(false);
        }}
        showActionBtnSpinner={tagSnippetLoading}
        showModal={showTagSnippetModal}
        template={currentSnippet}
        selectedUserId={selectedUser}
        isRefreshTagList={isRefreshTagList}
      ></TagTemplateModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => setShowTagConfirmModal(false)}
        handleConfirm={() => {
          setShowTagConfirmModal(false);
          tagSnippet({
            variables: {
              snippetId: currentSnippet.id,
              input: { name: currentSnippet.name, tagId: tagIds },
            },
          });
        }}
        showConfirmModal={showTagConfirmModal}
        showConfirmBtnSpinner={tagSnippetLoading}
        header="Tag snippet"
      >
        <p>
          Are you sure you want to assign this tag{' '}
          <b>
            {tagLabel
              ? tagLabel
              : currentSnippet.tagNames
              ? currentSnippet.tagNames.join(',')
              : ''}
          </b>{' '}
          to this snippet?
        </p>
      </ConfirmModal>
      {/* Above modals are used to add a tags to snippets ---> end */}

      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        handleCancel={() => setDeleteSnippetItem(false)}
        handleConfirm={() =>
          deleteSnippet({
            variables: { id: currentSnippet.id },
          })
        }
        showConfirmBtnSpinner={deleteSnippetLoading}
        showConfirmModal={deleteSnippetItem}
      >
        <span>
          Are you sure you want to delete Snippet{' '}
          <span className="text-break font-italic">{currentSnippet.name}</span>{' '}
        </span>
      </ConfirmModal>
    </ContentWrapper>
  );
};

export default Snippets;
