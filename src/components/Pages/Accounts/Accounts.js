import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, Col, Row, Tooltip } from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import { parseUrl } from 'query-string';
import { toast } from 'react-toastify';
import { ContentWrapper } from '@nextaction/components';
import UserContext from '../../UserContext';
import PageHeader from '../../Common/PageHeader';
import SearchBar from '../../Common/SearchBar';
import UserList from '../../Common/UserList';
import { formateDateTime, showErrorMessage } from '../../../util/index';
import FETCH_ACCOUNTS_QUERY from '../../queries/AccountsQuery';
import AccountsGrid from './AccountsGrid';

toast.configure();

const Accounts = () => {
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;

  const [userId, setUserId] = useState(currentUserId);
  const isManagerUser = !userLoading && user?.isManagerUser === 'Y';
  const { query: searchParams } = parseUrl(window.location.search);
  const [pageCount, setPageCount] = useState(0);
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['accountOffset'] ? parseInt(searchParams['accountOffset']) : 0
  );
  const [limit, setLimit] = useState(
    searchParams['accountLimit'] ? parseInt(searchParams['accountLimit']) : 10
  );
  const [offset, setOffset] = useState(
    searchParams['accountOffset'] ? parseInt(searchParams['accountOffset']) : 0
  );
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [orderBy, setOrderBy] = useState('asc');
  const [accountsFilter, setAccountsFilter] = useState(
    `&sort[${sortBy}]=${orderBy}&filter[user][id]=${userId}`
  );
  const [searchKey, setSearchKey] = useState('');
  const sortByRef = useRef({});

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const sortingParams = {
    name: 'sort[name]',
    createdDate: 'sort[createdDate]',
    user: 'sort[user][name]',
  };

  const {
    data: accountsData,
    loading,
    error,
    refetch: refreshAccountsGrid,
  } = useQuery(FETCH_ACCOUNTS_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=user&includeAssociations[]=tag',
      limit,
      offset,
      accountFilter: accountsFilter,
    },
    onError: (error) =>
      showErrorMessage(
        error,
        'Sorry! Failed to load Accounts list.',
        accountsData,
        'accounts_list_failed'
      ),
  });
  const accountsGridData = useMemo(
    () => (accountsData?.accounts ? accountsData.accounts.data : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountsData]
  );

  useEffect(() => {
    setPageCount(
      !loading && accountsData?.accounts?.paging
        ? Math.ceil(accountsData.accounts.paging.totalCount / limit)
        : 0
    );
    setTotalCount(
      !loading && accountsData?.accounts?.paging
        ? accountsData.accounts.paging.totalCount
        : 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsGridData]);

  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
      width: '20%',
      Cell: function (props) {
        const rowData = props?.row?.original;
        const prospects = rowData?.associations?.prospect;
        return (
          <span>
            <Link
              to={{
                pathname: '/accounts/' + rowData?.id,
                search: window.location.search,
                state: {
                  allAccountsData: props?.accountsData,
                  account: rowData,
                  prospects,
                },
              }}
              className="text-header"
            >
              <p className="mb-0">{props?.value}</p>
            </Link>
            <small>{props?.row?.original?.domainName}</small>
          </span>
        );
      },
    },
    {
      Header: 'Tags',
      accessor: 'tag',
      width: '15%',
      disableSortBy: true,
      Cell: function (props) {
        const rowData = props?.row?.original;

        const tagIds =
          rowData?.associations?.tag?.length > 0 &&
          rowData.associations.tag.map((tag) => tag.id);
        const tagNames = [];
        const tagTitleNames = [];

        tagIds &&
          tagIds.length > 0 &&
          props?.accountsData?.accounts?.includedAssociations?.tag &&
          props.accountsData.accounts.includedAssociations.tag.forEach(
            (tag) => {
              if (tagIds?.includes(tag.id)) {
                tagNames.push(tag);
                tagTitleNames.push(tag.tagValue);
              }
            }
          );
        rowData['tagNames'] = tagNames;
        return (
          // eslint-disable-next-line react/jsx-no-useless-fragment
          <>
            {tagNames?.length > 0 &&
              tagNames.slice(0, tagNames.length > 3 ? 3 : tagNames.length).map(
                // eslint-disable-next-line array-callback-return
                (tag, index) => {
                  return (
                    <Badge
                      key={index}
                      color="light"
                      title={
                        index === 2 && tagTitleNames.length > 3
                          ? tagTitleNames.slice(2, tagNames.length).join(', ')
                          : tag?.tagValue
                      }
                      className="border border-dark mr-2 mb-2 text-normal text-break"
                      pill
                    >
                      {tag?.tagValue && index === 2 && tagNames.length > 3 ? (
                        <span>
                          {tag?.tagValue?.length > 22
                            ? tag.tagValue.slice(0, 21)
                            : tag?.tagValue}
                          <b>...</b>
                        </span>
                      ) : (
                        <span title={tag?.tagValue}>
                          {tag?.tagValue?.length > 22
                            ? tag.tagValue.slice(0, 21) + '..'
                            : tag?.tagValue}
                        </span>
                      )}
                    </Badge>
                  );
                }
              )}
          </>
        );
      },
    },
    {
      Header: 'Prospects #',
      accessor: 'prospect',
      width: '10%',
      disableSortBy: true,
      Cell: function (props) {
        const rowData = props?.row?.original;
        return (
          <div className="text-bold text-center">
            {rowData?.associations?.prospect?.length}
          </div>
        );
      },
    },
    {
      Header: 'Stats',
      accessor: 'stats',
      width: '30%',
      disableSortBy: true,
      Cell: function (props) {
        const rowData = props?.row?.original;
        const [tooltipOpen, setTooltipOpen] = useState();
        const toggleToottip = (id) => {
          tooltipOpen === id ? setTooltipOpen(-id) : setTooltipOpen(id);
        };
        return (
          <Row className="align-items-center">
            <Col className="text-center px-0">
              <div
                id={`tooltip_${rowData?.id}_cadenceCount`}
                onMouseEnter={() => {
                  toggleToottip(`${rowData?.id}_cadenceCount`);
                }}
                onMouseLeave={() =>
                  toggleToottip(`${rowData?.id}_cadenceCount`)
                }
              >
                <span className="text-bold">
                  {rowData?.cadenceCount ? rowData.cadenceCount : 0}
                </span>
                <br />
                <i className="svgicon koncert-cadence-icon"></i>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${rowData?.id}_cadenceCount`}
                  target={`tooltip_${rowData?.id}_cadenceCount`}
                  trigger="legacy"
                >
                  {`Cadences: ${
                    rowData?.cadenceCount ? rowData.cadenceCount : 0
                  }`}
                </Tooltip>
              </div>
            </Col>
            <Col className="text-center px-0">
              <div
                id={`tooltip_${rowData?.id}_callCount`}
                onMouseEnter={() => {
                  toggleToottip(`${rowData?.id}_callCount`);
                }}
                onMouseLeave={() => toggleToottip(`${rowData?.id}_callCount`)}
              >
                <span className="text-bold">{rowData?.callCount}</span>
                <br />
                <i className="fas fa-phone-alt fa-sm text-call"></i>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${rowData?.id}_callCount`}
                  target={`tooltip_${rowData?.id}_callCount`}
                  trigger="legacy"
                >
                  {`Calls: ${rowData?.callCount}`}
                </Tooltip>
              </div>
            </Col>
            <Col className="text-center px-0">
              <div
                id={`tooltip_${rowData?.id}_emailSentCount`}
                onMouseEnter={() => {
                  toggleToottip(`${rowData?.id}_emailSentCount`);
                }}
                onMouseLeave={() =>
                  toggleToottip(`${rowData?.id}_emailSentCount`)
                }
              >
                <span className="text-bold">{rowData?.sentCount}</span>
                <br></br>
                <i className="fas fa-share text-email"></i>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${rowData?.id}_emailSentCount`}
                  target={`tooltip_${rowData?.id}_emailSentCount`}
                  trigger="legacy"
                >
                  {`Email Sent: ${rowData?.sentCount}`}
                </Tooltip>
              </div>
            </Col>
            <Col className="text-center px-0">
              <div
                id={`tooltip_${rowData?.id}_emailOpenedCount`}
                onMouseEnter={() => {
                  toggleToottip(`${rowData?.id}_emailOpenedCount`);
                }}
                onMouseLeave={() =>
                  toggleToottip(`${rowData?.id}_emailOpenedCount`)
                }
              >
                <span className="text-bold">{rowData?.openedCount}</span>
                <br></br>
                <i className="fas fa-envelope-open text-primary"></i>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${rowData?.id}_emailOpenedCount`}
                  target={`tooltip_${rowData?.id}_emailOpenedCount`}
                  trigger="legacy"
                >
                  {`Email Opened: ${rowData?.openedCount}`}
                </Tooltip>
              </div>
            </Col>
            <Col className="text-center px-0">
              <div
                id={`tooltip_${rowData?.id}_repliedCount`}
                onMouseEnter={() => {
                  toggleToottip(`${rowData?.id}_repliedCount`);
                }}
                onMouseLeave={() =>
                  toggleToottip(`${rowData?.id}_repliedCount`)
                }
              >
                <span className="text-bold">{rowData?.repliedCount}</span>
                <br></br>
                <i className="fas fa-reply-all text-green"></i>
                <Tooltip
                  placement="top"
                  isOpen={tooltipOpen === `${rowData?.id}_repliedCount`}
                  target={`tooltip_${rowData?.id}_repliedCount`}
                  trigger="legacy"
                >
                  {`Email Replied: ${rowData?.repliedCount}`}
                </Tooltip>
              </div>
            </Col>
          </Row>
        );
      },
    },
    {
      Header: 'Owner',
      accessor: 'owner',
      width: '10%',
      Cell: (props) => {
        const rowData = props?.row?.original;
        const user = accountsData?.accounts?.includedAssociations?.user?.find(
          (user) => user?.id === rowData?.associations?.user?.[0]?.id
        );
        let ownerName = user?.name?.split(' ');
        ownerName =
          ownerName?.[0].charAt(0) +
          (ownerName?.[1] ? ownerName[1].charAt(0) : '');
        return (
          <div className="text-center">
            <span className="fa-stack">
              <i className="fas fa-circle fa-stack-2x thin-circle"></i>
              <span className="fa-stack-1x" title={user?.name}>
                <small>{ownerName?.toUpperCase()}</small>
              </span>
            </span>
          </div>
        );
      },
    },
    {
      Header: 'Created Date',
      accessor: 'createdDate',
      width: '15%',
      Cell: function (props) {
        return formateDateTime(props?.value);
      },
    },
  ];

  const handleAccountsSearch = (search) => {
    setSearchKey(search ? search : '');
    const { query } = parseUrl(window.location.search);
    const name = search;
    setOffset(0);
    if (name) {
      query['filter[q]'] = name;
    } else delete query['filter[q]'];

    query[sortingParams[sortBy]] = orderBy;

    query['filter[user][id]'] = userId;

    const filterQry = Object.entries({ ...query })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    setAccountsFilter(filterQry === '' ? '' : '&' + filterQry);
  };

  // eslint-disable-next-line
  useEffect(() => handleAccountsSearch(), [sortBy, orderBy, userId]);

  if (!sortByRef.current) {
    sortByRef.current.value = {};
  }

  return (
    <ContentWrapper>
      <PageHeader icon="far fa-building" pageName="Accounts">
        <div className="d-flex">
          <div>
            <SearchBar
              searchInput={searchKey}
              onSearch={handleAccountsSearch}
              onChange={setSearchKey}
            />
          </div>
          <div className="ml-2">
            {isManagerUser && (
              <UserList
                value={userId}
                placeholder="Select user"
                disabled={isManagerUser ? false : true}
                onChange={(value) => {
                  if (value) {
                    setUserId(value);
                  } else {
                    setUserId(currentUserId);
                  }
                }}
              ></UserList>
            )}
          </div>
        </div>
      </PageHeader>
      <Row>
        <Col>
          <Card className="card-default">
            <Row>
              <Col>
                <AccountsGrid
                  columns={columns}
                  data={accountsGridData}
                  accountsData={accountsData}
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
                    query['accountLimit'] = pageSize;
                    query['accountOffset'] = pageIndex;

                    const searchString = Object.entries(query)
                      .map(([key, val]) => `${key}=${val}`)
                      .join('&');

                    window.history.replaceState({}, '', '?' + searchString);
                  }}
                  loading={loading}
                  pageSize={limit}
                  pageCount={pageCount}
                  error={error}
                  currentPageIndex={currentPageIndex}
                  handleSort={(sortBy, orderBy) => {
                    setSortBy(sortBy);
                    setOrderBy(orderBy ? 'desc' : 'asc');
                  }}
                  handleRefresh={refreshAccountsGrid}
                  totalCount={totalCount}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </ContentWrapper>
  );
};

export default Accounts;
