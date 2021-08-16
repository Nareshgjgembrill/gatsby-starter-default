import { useQuery } from '@apollo/react-hooks';
import moment from 'moment-timezone';
import { parseUrl } from 'query-string';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import Button from '../../Common/Button';
import {
  FETCH_ALL_SYNCLOG_QUERY,
  FETCH_ALL_USER_QUERY,
} from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
import SyncLogGrid from './SyncLogGrid';

const SyncLog = ({ match }) => {
  const formRef = useRef();
  const [pageCount, setPageCount] = useState(0);
  const [userLimit] = useState(200);
  const [userOffset, setUserOffset] = useState(0);
  const [users, setUsers] = useState([]);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [selectedUser, setSelectedUser] = useState(currentUserId);
  const { query: searchParams } = parseUrl(window.location.search);
  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [limit, setLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [syncLogFilter, setSyncLogFilter] = useState(
    `&sort[accountName]=asc&filter[user][id]=${currentUserId}`
  );

  const userFilter = `filter[id]=${currentUserId}`;
  const [sortBy, setSortBy] = useState('syncDatetime');
  const [orderBy, setOrderBy] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);
  const sortByRef = useRef({});
  const sortingParams = {
    accountName: 'sort[accountName]',
    contactName: 'sort[contactName]',
    recordType: 'sort[recordType]',
    crmId: 'sort[crmId]',
    syncType: 'sort[syncType]',
    syncStatus: 'sort[syncStatus]',
    syncDatetime: 'sort[syncDatetime]',
  };

  const { loading: usersLoading, error: usersError } = useQuery(
    FETCH_ALL_USER_QUERY,
    {
      variables: { filter: userFilter, limit: userLimit, offset: userOffset },
      onCompleted: (data) => {
        if (data) {
          setUsers(users.concat(data?.user?.data));

          if ((userOffset + 1) * userLimit < data?.user?.paging?.totalCount) {
            setUserOffset(userOffset + 1);
          }
        }
      },
    }
  );
  let userList = null;
  if (!usersLoading && !usersError && users !== undefined) {
    userList = users
      ?.filter((item) => item.isActive === 'Y')
      .map((item) => {
        return (
          <option value={item.id} key={item.id}>
            {item.displayName}
          </option>
        );
      });
  }

  const {
    data: syncLogData,
    loading,
    error,
    refetch: refreshSyncLogGrid,
  } = useQuery(FETCH_ALL_SYNCLOG_QUERY, {
    variables: { syncLogFilter: syncLogFilter, limit, offset },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
  });

  const syncLogGridData = useMemo(
    () =>
      syncLogData && syncLogData.synclogs ? syncLogData.synclogs.data : [],
    [syncLogData]
  );

  useEffect(() => {
    setPageCount(
      !loading && syncLogData.synclogs.paging
        ? Math.ceil(syncLogData.synclogs.paging.totalCount / limit)
        : 0
    );
    setTotalCount(
      !loading && syncLogData.synclogs.paging
        ? syncLogData.synclogs.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [syncLogGridData]);

  const { register, handleSubmit, reset, getValues } = useForm();
  const onSubmit = () => {
    setOffset(0);
    setCurrentPageIndex(0);
    const formValues = getValues();
    const { query } = parseUrl(window.location.search);
    query[sortingParams[sortBy]] = orderBy;
    if (formValues.syncStatus) {
      query['filter[syncStatus]'] = formValues.syncStatus;
    } else {
      delete query['filter[syncStatus]'];
    }

    if (formValues.syncType) {
      query['filter[syncType]'] = formValues.syncType;
    } else {
      delete query['filter[syncType]'];
    }

    if (formValues.recordType) {
      query['filter[recordType]'] = formValues.recordType;
    } else {
      delete query['filter[recordType]'];
    }

    if (formValues.dateRange) {
      query['filter[dateRange]'] = formValues.dateRange;
    } else {
      delete query['filter[dateRange]'];
    }

    if (formValues.accountName)
      query['filter[accountName]'] = formValues.accountName;
    else {
      delete query['filter[accountName]'];
    }

    if (formValues.crmId) {
      query['filter[crmId]'] = formValues.crmId;
    } else {
      delete query['filter[crmId]'];
    }

    if (formValues.contactName) {
      query['filter[contactName]'] = formValues.contactName;
    } else {
      delete query['filter[contactName]'];
    }

    if (formValues.user) {
      if (parseInt(formValues.user) !== 0) {
        query['filter[user][id]'] = formValues.user;
      }
    } else {
      delete query['filter[user][id]'];
    }

    const filterQry = Object.entries({ ...query })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setSyncLogFilter(filterQry === '' ? '' : '&' + filterQry);
  };
  // eslint-disable-next-line
  useEffect(() => onSubmit(), [sortBy, orderBy]);

  const columns = [
    {
      Header: 'Account Name',
      accessor: 'accountName',
      width: '20%',
    },
    {
      Header: 'Contact Name',
      accessor: 'contactName',
      width: '20%',
    },
    {
      Header: 'Activity Date Time',
      accessor: 'syncDatetime',
      width: '15%',
      Cell: function (props) {
        const modifiedDateTime = props?.value;
        const currentTimeZone = moment.tz.guess();
        const updatedDateTime = moment
          .tz(modifiedDateTime, currentTimeZone)
          .format('M/D/YYYY h:mm A');
        return <span>{modifiedDateTime ? updatedDateTime : ''}</span>;
      },
    },
    {
      Header: 'Record Type',
      accessor: 'recordType',
      width: '10%',
    },
    {
      Header: 'CRM ID',
      accessor: 'crmId',
      width: '15%',
    },
    {
      Header: 'Sync Type',
      accessor: 'syncType',
      width: '10%',
    },
    {
      Header: 'Status',
      accessor: 'syncStatus',
      width: '10%',
      Cell: function (props) {
        const row = props.row.original;
        const errorMsg =
          props.value === 'FAILURE' ? row.errorData.error_message : '';
        const state =
          props.value === 'SUCCESS'
            ? 'fas fa-check-circle text-success mr-2'
            : 'fas fa-times-circle text-danger mr-2';
        return (
          <div>
            <i className={state} title={errorMsg}></i>
            {props.value}
          </div>
        );
      },
    },
  ];

  if (!sortByRef.current) {
    sortByRef.current.value = {};
  }

  const resetValues = {
    accountName: '',
    contactName: '',
    crmId: '',
    dateRange: '',
    recordType: '',
    syncStatus: '',
    syncType: '',
    user: '',
  };

  return (
    <Card className="card-default">
      <CardHeader className="border-bottom">
        <strong>Sync Logs</strong>
      </CardHeader>
      <CardBody>
        <Form
          name="searchForm"
          onSubmit={handleSubmit(onSubmit)}
          innerRef={formRef}
        >
          <FormGroup row>
            <Col sm={3}>
              <Label for="date_range">Date Range</Label>
              <Input
                type="select"
                name="dateRange"
                id="date_range"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
              >
                <option></option>
                <option value={'Today'}>Today</option>
                <option value={'Yesterday'}>Yesterday</option>
                <option value={'Last Week'}>Last Week</option>
                <option value={'Current Week'}>Current Week</option>
                <option value={'Current Month'}>Current Month</option>
                <option value={'Last Month'}>Last Month</option>
                <option value={'Current Quarter'}>Current Quarter</option>
                <option value={'Last Quarter'}>Last Quarter</option>
              </Input>
            </Col>

            <Col sm={3}>
              <Label for="sync_status">Sync Status</Label>
              <Input
                type="select"
                name="syncStatus"
                id="sync_status"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
              >
                <option></option>
                <option value="SUCCESS">Success</option>
                <option value="FAILURE">Failure</option>
              </Input>
            </Col>
            <Col sm={3}>
              <Label for="sync_type">Sync Type</Label>
              <Input
                type="select"
                name="syncType"
                id="sync_type"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
              >
                <option></option>
                <option value="RECORD UPDATE">
                  Record Update (Sync to CRM)
                </option>
                <option value="RECORD UPDATE ( SYNC FROM CRM )">
                  Record Update (Sync from CRM)
                </option>
                <option value="ACTIVITIES">Activities (Sync to CRM)</option>
              </Input>
            </Col>
            <Col sm={3}>
              <Label for="record_type">Record Type</Label>
              <Input
                type="select"
                name="recordType"
                id="record_type"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
              >
                <option></option>
                <option value="Contact">Contact</option>
                <option value="Lead">Lead</option>
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Col sm={3}>
              <Label for="crm_id">CRM ID</Label>
              <Input
                type="text"
                id="crm_id"
                name="crmId"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
                autoComplete="off"
              ></Input>
            </Col>
            <Col sm={3}>
              <Label for="account_name">Account Name</Label>
              <Input
                type="text"
                name="accountName"
                id="account_name"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
                autoComplete="off"
              ></Input>
            </Col>
            <Col sm={3}>
              <Label for="contact_name">Contact Name</Label>
              <Input
                type="text"
                name="contactName"
                id="contact_name"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
                autoComplete="off"
              ></Input>
            </Col>
            <Col sm={3}>
              <Label for="user">Users</Label>
              <Input
                type="select"
                name="user"
                id="user"
                innerRef={register}
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                }}
                className="py-0 text-sm"
                style={{ height: '25px' }}
              >
                <option value={0}></option>
                {userList}
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row className="d-flex justify-content-center">
            <Button
              type="submit"
              color="primary"
              icon="fas fa-search"
              className="mr-2"
              onClick={onSubmit}
            >
              Search
            </Button>
            <Button
              icon="fas fa-sync-alt"
              type="reset"
              onClick={() => {
                reset(resetValues);
                setSyncLogFilter(
                  `&${sortingParams[sortBy]}=${orderBy}&filter[user][id]=${currentUserId}`
                );
                setOffset(0);
                setCurrentPageIndex(0);
              }}
            >
              Reset
            </Button>
          </FormGroup>
        </Form>

        <SyncLogGrid
          columns={columns}
          data={syncLogGridData}
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
            if (match.path.indexOf('/settings/syncLog') !== -1) {
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
          pageSize={limit}
          pageCount={pageCount}
          error={error}
          currentPageIndex={currentPageIndex}
          handleRefresh={refreshSyncLogGrid}
          handleSort={(sortBy, orderBy) => {
            setSortBy(sortBy);
            setOrderBy(orderBy ? 'desc' : 'asc');
          }}
          totalCount={totalCount}
        />
      </CardBody>
    </Card>
  );
};
export default SyncLog;
