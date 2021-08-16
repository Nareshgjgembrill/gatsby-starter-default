import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Card,
  CardBody,
  Col,
  CustomInput,
  FormGroup,
  Input,
  InputGroup,
  Row,
  Tooltip,
} from 'reactstrap';
import { parseUrl } from 'query-string';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { formateDateTime, notify, showErrorMessage } from '../../../util/index';
import { ContentWrapper } from '@nextaction/components';
import ClButton from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import PageHeader from '../../Common/PageHeader';
import SearchBar from '../../Common/SearchBar';
import UserList from '../../Common/UserList';
import UserContext from '../../UserContext';
import FETCH_EMAIL_TEMPLATES_QUERY, {
  DELETE_EMAIL_TEMPLATE_QUERY,
  ACTIVATE_OR_DEACTIVATE_EMAIL_TEMPLATE_QUERY,
  FETCH_PERFORMANCE_ANALYSIS_QUERY,
  FETCH_TEMPLATE_PERFORMANCE_ANALYSIS_QUERY,
  FETCH_TEMPLATES_SNIPPETS_COUNT_QUERY,
  TAG_TEMPLATE_QUERY,
} from '../../queries/EmailTemplatesQuery';
import EmailTemplatesGrid from './EmailTemplatesGrid';
import ImportSalesForceTemplatesModal from './ImportSalesForceTemplatesModal';
import PerformanceModal from './PerformanceModal';
import CadenceModal from './CadencesModal';
import FilterTabs from './FilterTabs';
import TagTemplateModal from './TagTemplateModal';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
toast.configure();

const Templates = ({ history, location }) => {
  const [activeTab] = useState('Templates');
  const [handleRefetch, setHandleRefetch] = useState(
    location.state ? location.state.handleRefetch : false
  );

  const { query: searchParams } = parseUrl(location.search);

  const templateActions = {
    DELETE_TEMPLATE: 'DELETE_TEMPLATE',
    STATUS_CHANGE: 'STATUS_CHANGE',
    TEMPLATE_PERFORMANCE: 'TEMPLATE_PERFORMANCE',
    TEMPLATE_CADENCES: 'TEMPLATE_CADENCES',
    TAG: 'TAG',
  };

  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';
  const canCreateTemplate = !userLoading && user.hasCreateEmailTemplate;

  const sortingParams = {
    name: 'sort[name]',
    subject: 'sort[subject]',
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

  const [currentTemplate, setCurrentTemplate] = useState({});
  const [status, setStatus] = useState(
    searchParams['filter[status]'] ? searchParams['filter[status]'] : true
  );

  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [
    showTemplatePerformanceModal,
    setShowTemplatePerformanceModal,
  ] = useState(false);
  const [showTemplateCadenceModal, setShowTemplateCadenceModal] = useState(
    false
  );
  const [
    showSalesForceTemplatesModal,
    setShowSalesForceTemplatesModal,
  ] = useState(false);
  const [showTagTemplateModal, setShowTagTemplateModal] = useState(false);
  const [showTagConfirmModal, setShowTagConfirmModal] = useState(false);
  const [tagIds, setTagIds] = useState();
  const [tagLabel, setTagLabel] = useState();
  const [isRefreshTagList, setIsRefreshTagList] = useState(false);

  const [searchInput, setSearchInput] = useState(
    searchParams['filter[q]'] ? searchParams['filter[q]'] : ''
  );

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
  const [shared, setShared] = useState(sharedTypeCheck);

  const [toggle, settoggle] = useState(
    searchParams['filter[shared]']
      ? searchParams['filter[shared]'] === 'true'
        ? true
        : false
      : false
  );

  const templateFilterQuery = `&filter[user][id]=${
    currentUser ? currentUser : currentUserId
  }&sort[${sortBy}]=${orderBy}`;

  const [templateFilter, setTemplateFilter] = useState(
    searchInput
      ? `&filter[q]=${searchInput}` + templateFilterQuery
      : templateFilterQuery
  );

  const [searchKey, setSearchKey] = useState('');

  const [currentTemplateStatus, setCurrentTemplateStatus] = useState('');
  const [deleteTemplateItem, setDeleteTemplateItem] = useState(false);
  const [showDeactivateConfirmModal, setShowDeactivateConfirmModal] = useState(
    false
  );
  const [showActivateConfirmModal, setShowActivateConfirmModal] = useState(
    false
  );
  const [listResponse, setListResponse] = useState();
  const [countData, setCountData] = useState(null);

  // Fetch Email Templates data from api-server
  const {
    data: templatesData,
    loading,
    error,
    refetch: refetchTemplatesGrid,
  } = useQuery(FETCH_EMAIL_TEMPLATES_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=user&includeAssociations[]=tag',
      templateFilter,
      limit,
      offset,
      status,
    },
    onError: (response) => {
      setListResponse(response?.graphQLErrors[0]?.message);
    },
    notifyOnNetworkStatusChange: true,
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
      statusFilter: `${status ? `&filter[status]=${status}` : ''}`,
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

  const [
    performanceAnalysis,
    {
      data: performanceAnalysisData,
      loading: performanceAnalysisLoading,
      error: performanceAnalysisError,
    },
  ] = useLazyQuery(FETCH_PERFORMANCE_ANALYSIS_QUERY, {
    variables: { userFilter: `:[${selectedUser}]` },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const [
    templatePerformance,
    {
      data: templatePerformanceData,
      loading: templatePerformanceLoading,
      error: templatePerformanceError,
    },
  ] = useLazyQuery(FETCH_TEMPLATE_PERFORMANCE_ANALYSIS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  if (handleRefetch) {
    refetchTemplatesGrid();
    setHandleRefetch(false);
  }
  const templatePerformanceResponse = useMemo(
    () =>
      templatePerformanceData &&
      templatePerformanceData.TemplatePerformance &&
      templatePerformanceData.TemplatePerformance.data,
    [templatePerformanceData]
  );

  const performanceResponse = useMemo(
    () =>
      performanceAnalysisData &&
      performanceAnalysisData.PerformanceAnalysis &&
      performanceAnalysisData.PerformanceAnalysis.data,
    [performanceAnalysisData]
  );

  // Delete Template request
  const [
    deleteTemplate,
    { data: deleteTemplateData, loading: deleteTemplateLoading },
  ] = useLazyQuery(DELETE_EMAIL_TEMPLATE_QUERY, {
    onCompleted: (response) =>
      handleTemplateDeleteteRequestCallback(response, true),

    onError: (response) =>
      handleTemplateDeleteteRequestCallback(
        response,
        false,
        deleteTemplateData
      ),
  });

  const [
    activateTemplate,
    { data: activateTemplateData, loading: activateTemplateLoading },
  ] = useLazyQuery(ACTIVATE_OR_DEACTIVATE_EMAIL_TEMPLATE_QUERY, {
    onCompleted: (response) =>
      handleTemplateActivateRequestCallback(response, true),

    onError: (response) =>
      handleTemplateActivateRequestCallback(
        response,
        false,
        activateTemplateData
      ),
  });

  // Tag prospect request
  const [
    tagTemplate,
    { data: tagData, loading: tagTemplateLoading },
  ] = useLazyQuery(TAG_TEMPLATE_QUERY, {
    onCompleted: (response) => handleTagTemplateRequestCallback(response, true),
    onError: (response) => handleTagTemplateRequestCallback(response),
  });

  const handleTagTemplateRequestCallback = (response, requestSuccess) => {
    setShowTagTemplateModal(false);
    if (requestSuccess) {
      notify('Tags added successfully!', 'success');
      refetchTemplatesGrid();
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

  const [
    deactivateTemplate,
    { data: deactivateTemplateData, loading: deactivateTemplateLoading },
  ] = useLazyQuery(ACTIVATE_OR_DEACTIVATE_EMAIL_TEMPLATE_QUERY, {
    onCompleted: (response) =>
      handleTemplateDeactivateRequestCallback(response, true),

    onError: (response) =>
      handleTemplateDeactivateRequestCallback(
        response,
        false,
        deactivateTemplateData
      ),
  });

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
      setShared(true);
    } else {
      delete query['filter[shared]'];
      setShared(false);
    }

    if (searchInput) {
      query['filter[q]'] = searchInput;
    } else {
      delete query['filter[q]'];
    }

    const filterQry = Object.entries({
      ...query,
      'filter[user][id]':
        currentUser !== selectedUser ? selectedUser : currentUser,
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setTemplateFilter(filterQry === '' ? '' : '&' + filterQry);

    const searchString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', '?' + searchString);
  };

  const handleTemplatesSearch = (search, triggerType) => {
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
    query['filter[status]'] = status;

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
    setTemplateFilter(filterQry === '' ? '' : '&' + filterQry);

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

  /* ---- Grid Columns configuration -begin ----- */
  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        width: '21%',
        Cell: function (props) {
          return (
            <>
              <Link
                title={props.value}
                to={{
                  pathname:
                    '/templates/emails/' + props.row.original.id + '/edit',
                  search: window.location.search,
                  state: {
                    pathName: location.pathname,
                    search: location.search,
                  },
                }}
              >
                {props.value}
              </Link>
              <i
                className="fas fa-ban fa-sm text-danger ml-2"
                hidden={props.row.original.status !== false}
                title="Inactive Template"
              ></i>
            </>
          );
        },
      },
      {
        Header: '',
        accessor: 'shareType',
        width: '4%',
        Cell: function (props) {
          return (
            <i
              className="fas fa-user-friends text-muted"
              title="This template is a shared template"
              hidden={props.row.original.sharedType === 'none' ? true : false}
            ></i>
          );
        },
      },
      {
        Header: 'Subject',
        accessor: 'subject',
        width: '20%',
        Cell: function (props) {
          return (
            <span
              title={props.value}
              className="text-break text-truncate-2line"
            >
              {props.value}
            </span>
          );
        },
      },

      {
        Header: 'Stats',
        accessor: 'stats',
        width: '20%',
        textAlign: 'center',
        Cell: function ({ row }) {
          const [tooltipOpen, setTooltipOpen] = useState();

          const toggleToottip = (id) => {
            tooltipOpen === id ? setTooltipOpen(-id) : setTooltipOpen(id);
          };

          const metricFormat = (metric) => {
            const formattedMetric =
              parseInt(metric) > 999
                ? `${(parseInt(metric) / 1000).toFixed(1)}k`
                : metric;

            return formattedMetric;
          };
          return (
            <Row
              className="align-items-center mx-auto"
              style={{ width: '100%' }}
            >
              <Col
                className="px-0"
                id={`tooltip_${row.original.id}_sent`}
                onMouseEnter={() => {
                  toggleToottip(`${row.original.id}_sent`);
                }}
                onMouseLeave={() => toggleToottip(`${row.original.id}_sent`)}
              >
                <span
                  className={`d-block ${row.original.sent ? '' : 'text-muted'}`}
                >
                  {metricFormat(row.original.sent)}
                </span>
                <i
                  className={`fa fa-share fa-xs ${
                    row.original.sent ? 'text-warning' : 'text-muted'
                  }`}
                ></i>
                <p
                  className={`mb-0 mt-1 fa-xs d-none ${
                    row.original.sent ? '' : 'text-muted'
                  }`}
                >
                  Sent
                </p>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${row.original.id}_sent`}
                  target={`tooltip_${row.original.id}_sent`}
                  trigger="legacy"
                >
                  {`Sent: ${row.original.sent}`}
                </Tooltip>
              </Col>

              <Col
                className="px-0"
                id={`tooltip_${row.original.id}_opened`}
                onMouseEnter={() => {
                  toggleToottip(`${row.original.id}_opened`);
                }}
                onMouseLeave={() => toggleToottip(`${row.original.id}_opened`)}
              >
                <span
                  className={`d-block ${
                    row.original.opened ? '' : 'text-muted'
                  }`}
                >
                  {metricFormat(row.original.opened)}
                </span>
                <i
                  className={`far fa-envelope-open fa-xs ${
                    row.original.opened ? 'text-email' : 'text-muted'
                  }`}
                ></i>
                <p
                  className={`mb-0 mt-1 fa-xs d-none ${
                    row.original.opened ? '' : 'text-muted'
                  }`}
                >
                  Opened
                </p>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${row.original.id}_opened`}
                  target={`tooltip_${row.original.id}_opened`}
                  trigger="legacy"
                >
                  {`Opened: ${row.original.opened}`}
                </Tooltip>
              </Col>

              <Col
                className="px-0"
                id={`tooltip_${row.original.id}_bounced`}
                onMouseEnter={() => {
                  toggleToottip(`${row.original.id}_bounced`);
                }}
                onMouseLeave={() => toggleToottip(`${row.original.id}_bounced`)}
              >
                <span
                  className={`d-block ${
                    row.original.noOfBounced ? '' : 'text-muted'
                  }`}
                >
                  {metricFormat(row.original.noOfBounced)}
                </span>
                <i
                  className={`fas fa-times fa-xs ${
                    row.original.noOfBounced ? 'text-danger' : 'text-muted'
                  }`}
                ></i>
                <p
                  className={`mb-0 mt-1 fa-xs d-none ${
                    row.original.noOfBounced ? '' : 'text-muted'
                  }`}
                >
                  Bounced
                </p>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${row.original.id}_bounced`}
                  target={`tooltip_${row.original.id}_bounced`}
                  trigger="legacy"
                >
                  {`Bounced: ${row.original.noOfBounced}`}
                </Tooltip>
              </Col>

              <Col
                className="px-0"
                id={`tooltip_${row.original.id}_replied`}
                onMouseEnter={() => {
                  toggleToottip(`${row.original.id}_replied`);
                }}
                onMouseLeave={() => toggleToottip(`${row.original.id}_replied`)}
              >
                <span
                  className={`d-block ${
                    row.original.replied ? '' : 'text-muted'
                  }`}
                >
                  {metricFormat(row.original.replied)}
                </span>
                <i
                  className={`fa fa-reply fa-xs ${
                    row.original.replied ? 'text-green' : 'text-muted'
                  }`}
                ></i>
                <p
                  className={`mb-0 mt-1 fa-xs d-none ${
                    row.original.replied ? '' : 'text-muted'
                  }`}
                >
                  Replied
                </p>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${row.original.id}_replied`}
                  target={`tooltip_${row.original.id}_replied`}
                  trigger="legacy"
                >
                  {`Replied: ${row.original.replied}`}
                </Tooltip>
              </Col>
              <Col
                className="px-0"
                id={`tooltip_${row.original.id}_linksClicked`}
                onMouseEnter={() => {
                  toggleToottip(`${row.original.id}_linksClicked`);
                }}
                onMouseLeave={() =>
                  toggleToottip(`${row.original.id}_linksClicked`)
                }
              >
                <span
                  className={`d-block ${
                    row.original.linksClicked ? '' : 'text-muted'
                  }`}
                >
                  {metricFormat(row.original.linksClicked)}
                </span>
                <i
                  className={`fas fa-xs fa-link ${
                    row.original.linksClicked ? '' : 'text-muted'
                  }`}
                ></i>
                <p
                  className={`mb-0 mt-1 fa-xs d-none ${
                    row.original.linksClicked ? '' : 'text-muted'
                  }`}
                >
                  Clicked
                </p>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${row.original.id}_linksClicked`}
                  target={`tooltip_${row.original.id}_linksClicked`}
                  trigger="legacy"
                >
                  {`Links Clicked: ${row.original.linksClicked}`}
                </Tooltip>
              </Col>
            </Row>
          );
        },
      },
      {
        Header: 'Owner',
        accessor: 'owner',
        width: '4%',
        Cell: function (props) {
          const rowData = props.row.original;
          const userId = rowData?.associations?.user[0]?.id;
          let owner;
          if (
            rowData.associations &&
            rowData.associations.user &&
            props.templatesData &&
            props.templatesData.emailTemplates.includedAssociations &&
            props.templatesData.emailTemplates.includedAssociations.user
          ) {
            owner = props.templatesData.emailTemplates.includedAssociations.user.find(
              (item) => item.id === rowData.associations.user[0].id
            );
          }
          const ownerName =
            userId === -1
              ? ['Sample', 'Templates']
              : owner && owner.name.split(' ');

          return (
            <span className="fa-stack fa-1x text-circle">
              <i className="fas fa-circle fa-stack-2x text-white thin-circle"></i>
              <span
                className="fa-stack-1x text-sm"
                title={userId === -1 ? 'Sample Templates' : owner?.name}
              >
                {ownerName[0]?.charAt(0)?.toUpperCase()}
                {ownerName[1]?.charAt(0)?.toUpperCase()}
              </span>
            </span>
          );
        },
      },

      {
        Header: 'Tags',
        accessor: 'tagName',
        width: '9%',
        Cell: function (props) {
          let taglist = [];
          let remainingTags;
          const rowData = props.row.original;
          const tagAssociations =
            rowData.associations &&
            rowData.associations.tag.map((item) => item.id);
          const tagnames = [];
          if (
            props.templatesData.emailTemplates.includedAssociations &&
            props.templatesData.emailTemplates.includedAssociations.tag
          ) {
            props.templatesData.emailTemplates.includedAssociations.tag.forEach(
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
        width: '18%',
        Cell: function (props) {
          return props.value && formateDateTime(props.value);
        },
      },
    ],
    [location.pathname, location.search]
  );
  /* ---- Grid Columns configuration -end ----- */
  // To handle clicking toolbar buttons on grid row mouseover
  const handleRowToolbarButton = (action, template) => {
    setCurrentTemplate(template);

    switch (action) {
      case templateActions.DELETE_TEMPLATE:
        setDeleteTemplateItem(true);
        break;
      case templateActions.STATUS_CHANGE:
        if (template.status === true) {
          setShowDeactivateConfirmModal(true);
          setCurrentTemplateStatus(false);
        } else {
          setShowActivateConfirmModal(true);
          setCurrentTemplateStatus(true);
        }
        break;
      case templateActions.TEMPLATE_PERFORMANCE:
        templatePerformance({
          variables: { userFilter: `:[${selectedUser}]`, id: template.id },
        });
        setShowTemplatePerformanceModal(true);
        break;
      case templateActions.TEMPLATE_CADENCES:
        setShowTemplateCadenceModal(true);
        break;
      case templateActions.TAG:
        setShowTagTemplateModal(true);
        break;
      default:
        break;
    }
  };

  const handleTemplateDeleteteRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Template has been deleted', 'success', 'delete_template');
      setDeleteTemplateItem(false);
      refetchTemplatesGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to delete this Template',
        errorData,
        'delete_template'
      );
    }
  };

  const handleTemplateActivateRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify(
        'Success! Template has been marked as active',
        'success',
        'activate_template'
      );
      setShowActivateConfirmModal(false);
      refetchTemplatesGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to mark this Template as active',
        errorData,
        'activate_template'
      );
    }
  };

  const handleTemplateDeactivateRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify(
        'Success! Template has been marked as inactive',
        'success',
        'deactivate_template'
      );
      setShowDeactivateConfirmModal(false);
      refetchTemplatesGrid();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to make this Template as inactive',
        errorData,
        'deactivate_template'
      );
    }
  };

  const gridData = useMemo(
    () =>
      templatesData && templatesData.emailTemplates
        ? templatesData.emailTemplates.data
        : [],
    [templatesData]
  );

  useEffect(
    () => {
      setPageCount(
        !loading && templatesData?.emailTemplates?.paging
          ? Math.ceil(templatesData.emailTemplates.paging.totalCount / limit)
          : 0
      );
      setTotalCount(
        !loading && templatesData?.emailTemplates?.paging
          ? templatesData.emailTemplates.paging.totalCount
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

  useEffect(() => {
    handleTemplatesSearch(null, 'Effect');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, orderBy, status, selectedUser]);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  return (
    <ContentWrapper>
      <PageHeader icon="fas fa-envelope fa-sm" pageName="Templates">
        <div className="d-xl-flex align-items-center justify-content-end d-sm-block h-100">
          <InputGroup hidden={!isManagerUser} className="text-nowrap mw-100">
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

          <InputGroup className="text-nowrap my-sm-1 my-xl-0 ml-xl-1">
            <SearchBar
              clname="mr-2"
              searchInput={searchKey}
              onSearch={handleTemplatesSearch}
              onChange={setSearchKey}
            />
          </InputGroup>
          <div className="d-flex h-100 text-nowrap">
            <ClButton
              className="py-2 mx-1"
              icon="fas fa-chart-bar"
              onClick={() => {
                performanceAnalysis();
                setShowPerformanceModal(true);
              }}
            >
              Performance Analysis
            </ClButton>

            <Link
              hidden={!canCreateTemplate}
              className="btn btn-secondary align-items-center py-2 ml-2"
              to={{
                pathname:
                  activeTab === 'Templates'
                    ? '/templates/emails/add'
                    : '/templates/snippets/add',
                search: window.location.search,
                state: {
                  pathName: location.pathname,
                  search: location.search,
                },
              }}
              title="Create new Template"
            >
              <i className="fa fa-plus mr-2"></i>
              Add a Template
            </Link>
          </div>
        </div>
      </PageHeader>

      <Row>
        <Col>
          <Card className="card-default">
            <CardBody>
              <div className="d-flex flex-column flex-md-row justify-content-between pb-3">
                <div style={{ width: '300px' }}>
                  <FilterTabs
                    countData={countData}
                    loading={templateAndSnippetsCountLoading}
                    error={templateAndSnippetsCountError}
                    activeTabValue="Templates"
                    history={history}
                    shared={shared ? true : false}
                    refreshCount={
                      location.state ? location.state.handleRefetch : false
                    }
                  />
                </div>

                <div className="d-flex flex-column flex-md-row">
                  <FormGroup check inline style={{ width: '300px' }}>
                    <span className="mr-2">My Templates</span>
                    <CustomInput
                      type="switch"
                      id="example_custom_switch"
                      name="custom_switch"
                      checked={toggle}
                      onChange={handleOnChange}
                    ></CustomInput>
                    <span>All Templates</span>
                  </FormGroup>
                  <Input
                    style={{ maxWidth: '105px' }}
                    type="select"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                    }}
                    title="Filter by Template status"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Input>
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
                templateActions={templateActions}
                handleRowToolbarButton={handleRowToolbarButton}
                handleRefresh={refetchTemplatesGrid}
                tabName="Templates"
                listResponse={listResponse}
                pathName={location.pathname}
                handleSortBy={(column, order) => {
                  setSortBy(column);
                  setOrderBy(order);
                }}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      {showTemplateCadenceModal && (
        <CadenceModal
          hideModal={() => {
            setShowTemplateCadenceModal(false);
          }}
          showModal={showTemplateCadenceModal}
          selectedUser={selectedUser}
          templateID={currentTemplate.id}
        ></CadenceModal>
      )}

      <ConfirmModal
        confirmBtnIcon="fas fa-trash"
        confirmBtnText="Delete"
        handleCancel={() => setDeleteTemplateItem(false)}
        handleConfirm={() =>
          deleteTemplate({
            variables: { emailTemplateId: currentTemplate.id },
          })
        }
        showConfirmBtnSpinner={deleteTemplateLoading}
        showConfirmModal={deleteTemplateItem}
      >
        <span>
          Are you sure you want to delete Template{' '}
          <span className="text-break font-italic">{currentTemplate.name}</span>{' '}
          ?
        </span>
      </ConfirmModal>
      {currentTemplate && (
        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          confirmBtnText="OK"
          header="Make the Template Active"
          handleCancel={() => setShowActivateConfirmModal(false)}
          handleConfirm={() =>
            activateTemplate({
              variables: {
                emailTemplateId: currentTemplate.id,
                status: currentTemplateStatus,
              },
            })
          }
          showConfirmBtnSpinner={activateTemplateLoading}
          showConfirmModal={showActivateConfirmModal}
        >
          <span>
            Are you sure you want to make{' '}
            <span className="text-break font-italic">
              {currentTemplate.name}
            </span>{' '}
            active?
          </span>
        </ConfirmModal>
      )}

      {currentTemplate && (
        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          confirmBtnText="OK"
          header="Make the Template Inactive"
          handleCancel={() => setShowDeactivateConfirmModal(false)}
          handleConfirm={() =>
            deactivateTemplate({
              variables: {
                emailTemplateId: currentTemplate.id,
                status: currentTemplateStatus,
              },
            })
          }
          showConfirmBtnSpinner={deactivateTemplateLoading}
          showConfirmModal={showDeactivateConfirmModal}
        >
          <span>
            Are you sure you want to make{' '}
            <span className="text-break font-italic">
              {currentTemplate.name}
            </span>{' '}
            inactive?
          </span>
        </ConfirmModal>
      )}

      <TagTemplateModal
        handleAction={handleTagAction}
        hideModal={() => {
          setShowTagTemplateModal(false);
          setIsRefreshTagList(false);
        }}
        showActionBtnSpinner={tagTemplateLoading}
        showModal={showTagTemplateModal}
        template={currentTemplate}
        selectedUserId={selectedUser}
        isRefreshTagList={isRefreshTagList}
      ></TagTemplateModal>

      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => setShowTagConfirmModal(false)}
        handleConfirm={() => {
          setShowTagConfirmModal(false);
          tagTemplate({
            variables: {
              templateId: currentTemplate.id,
              input: { tagId: tagIds },
            },
          });
        }}
        showConfirmModal={showTagConfirmModal}
        showConfirmBtnSpinner={tagTemplateLoading}
        header="Tag template"
      >
        <p>
          Are you sure you want to assign this tag{' '}
          <b>
            {tagLabel
              ? tagLabel
              : currentTemplate.tagNames
              ? currentTemplate.tagNames.join(',')
              : ''}
          </b>{' '}
          to this template?
        </p>
      </ConfirmModal>

      <ImportSalesForceTemplatesModal
        hideModal={() => {
          setShowSalesForceTemplatesModal(false);
        }}
        showModal={showSalesForceTemplatesModal}
      />
      <PerformanceModal
        hideModal={() => {
          setShowTemplatePerformanceModal(false);
        }}
        header={`Template Performance - ${currentTemplate.name}`}
        showModal={showTemplatePerformanceModal}
        loading={templatePerformanceLoading}
        error={templatePerformanceError}
        data={templatePerformanceResponse && templatePerformanceResponse}
        PerformanceType={currentTemplate.name}
      />
      <PerformanceModal
        hideModal={() => {
          setShowPerformanceModal(false);
        }}
        header={'Performance Analysis of Top 10 Templates'}
        showModal={showPerformanceModal}
        loading={performanceAnalysisLoading}
        error={performanceAnalysisError}
        data={performanceResponse && performanceResponse}
      />
    </ContentWrapper>
  );
};
export default Templates;
