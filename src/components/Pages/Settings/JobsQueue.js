/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/react-hooks';
import moment from 'moment-timezone';
import { parseUrl } from 'query-string';
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
  FETCH_JOBS_QUEUE,
  FETCH_ALL_USER_QUERY,
} from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
import JobsQueueGrid from './JobsQueueGrid';

const JobsQueue = ({ match }) => {
  const formRef = useRef();
  const [pageCount, setPageCount] = useState(0);
  const { user, loading: userLoading } = useContext(UserContext);
  const isManagerOrAdminUser =
    !userLoading &&
    user &&
    (user.isManagerUser === 'Y' || user.isAdminUser === 'Y');
  const currentUserId = userLoading ? 0 : user.id;
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
  const [selectedUser, setSelectedUser] = useState(currentUserId);
  const [userLimit] = useState(200);
  const [userOffset, setUserOffset] = useState(0);
  const [users, setUsers] = useState([]);
  const userFilter = `filter[id]=${currentUserId}`;

  const [sortBy, setSortBy] = useState('startDateTime');
  const [orderBy, setOrderBy] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);
  const sortByRef = useRef({});

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

  const [
    fetchJobsQueue,
    { data: jobQueueData, loading, error, refetch: refreshJobQueueData },
  ] = useLazyQuery(FETCH_JOBS_QUEUE, {
    notifyOnNetworkStatusChange: true,
  });

  // fetching jobs queue on page load. initially current loggedin user id will be sent.
  useEffect(() => {
    onSubmit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jobQueueGridData = useMemo(
    () =>
      jobQueueData && jobQueueData.jobQueue ? jobQueueData.jobQueue.data : [],
    [jobQueueData]
  );

  useEffect(() => {
    setPageCount(
      !loading && jobQueueData?.jobQueue?.paging
        ? Math.ceil(jobQueueData.jobQueue.paging.totalCount / limit)
        : 0
    );
    setTotalCount(
      !loading && jobQueueData?.jobQueue?.paging
        ? jobQueueData.jobQueue.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [jobQueueGridData]);

  const { register, handleSubmit, reset, getValues } = useForm();
  const onSubmit = (_limit = 10, _offset = 0) => {
    setOffset(_offset);
    setCurrentPageIndex(_offset);
    setLimit(_limit);
    const formValues = getValues();
    const { query } = parseUrl(window.location.search);
    query[`sort[${sortBy}]`] = orderBy;

    if (formValues.dateRange) {
      query['filter[dateRange]'] = formValues.dateRange;
    } else {
      delete query['filter[dateRange]'];
    }

    if (formValues.status) {
      query['filter[status]'] = formValues.status;
    } else {
      delete query['filter[status]'];
    }

    if (formValues.jobType) {
      query['filter[type]'] = formValues.jobType;
    } else {
      delete query['filter[type]'];
    }

    if (formValues.requestId) {
      query['filter[requestId]'] = formValues.requestId;
    } else {
      delete query['filter[requestId]'];
    }

    if (formValues.user) {
      if (parseInt(formValues.user) !== 0) {
        query['filter[user][id]'] = formValues.user;
      }
    } else {
      query['filter[user][id]'] = currentUserId;
    }

    const filterQry = Object.entries({ ...query })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    fetchJobsQueue({
      variables: {
        jobQueueFilter: filterQry,
        limit: _limit,
        offset: _offset,
      },
    });
  };
  // eslint-disable-next-line
  useEffect(() => onSubmit(), [sortBy, orderBy]);

  const columns = [
    {
      Header: 'Job Type',
      accessor: 'type',
      width: '20%',
      Cell: function (props) {
        let jobType = props?.value.split('_').join(' ');
        jobType = jobType.charAt(0).toUpperCase() + jobType.slice(1);
        return <span>{jobType}</span>;
      },
    },
    {
      Header: 'Description',
      accessor: 'description',
      width: '20%',
      Cell: function (props) {
        return <span>{props?.value}</span>;
      },
    },
    {
      Header: 'Start Time',
      accessor: 'startDateTime',
      width: '20%',
      Cell: function (props) {
        const modifiedDateTime = props?.value;
        const currentTimeZone = moment.tz.guess();
        const updatedDateTime = moment
          .tz(modifiedDateTime, currentTimeZone)
          .format('M/D/YYYY h:mm A');
        return modifiedDateTime ? <span>{updatedDateTime}</span> : null;
      },
    },
    {
      Header: 'End Time',
      accessor: 'endDateTime',
      width: '15%',
      Cell: function (props) {
        const modifiedDateTime = props?.value;
        const currentTimeZone = moment.tz.guess();
        const updatedDateTime = moment
          .tz(modifiedDateTime, currentTimeZone)
          .format('M/D/YYYY h:mm A');
        return modifiedDateTime ? <span>{updatedDateTime}</span> : null;
      },
    },
    {
      Header: 'Processed',
      accessor: 'processed',
      width: '20%',
      Cell: function (props) {
        return <span>{props?.value}</span>;
      },
    },
    {
      Header: 'Submitted',
      accessor: 'submitted',
      width: '20%',
      Cell: function (props) {
        return <span>{props?.value}</span>;
      },
    },
    {
      Header: 'Status',
      accessor: 'status',
      width: '10%',
      Cell: function (props) {
        let status = props?.value.replace(/_/g, ' ');
        status = status.charAt(0).toUpperCase() + status.slice(1);
        return <span>{status}</span>;
      },
    },
    {
      Header: 'Request Id',
      accessor: 'requestId',
      width: '15%',
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
        <strong>Jobs Queue</strong>
      </CardHeader>
      <CardBody>
        <Form
          name="searchForm"
          onSubmit={handleSubmit(() => {
            onSubmit();
          })}
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
              <Label for="status">Status</Label>
              <Input
                type="select"
                name="status"
                id="status"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
              >
                <option></option>
                <option value="in_progress">In Progress</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </Input>
            </Col>
            <Col sm={3}>
              <Label for="job_type">Job Type</Label>
              <Input
                type="select"
                name="jobType"
                id="job_type"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
              >
                <option></option>
                <option value="inactive_cadence_status">
                  Inactive Cadence Status
                </option>
                {/* this will be uncommented once the assign prospect action job queue completed */}
                {/* <option value="assign_prospects_status">
                  Assign Prospects status
                </option> */}
                <option value="move_to_another_cadence_status">
                  Move to Another Cadence Status
                </option>
                <option value="exit_prospects_status">
                  Exit Prospects Status
                </option>
                {/* this will be uncommented once the delete prospect action job queue completed */}
                {/* <option value="delete_prospects_status">
                  Delete Prospects Status
                </option> */}
              </Input>
            </Col>
            <Col sm={3}>
              <Label for="request_id">Request Id</Label>
              <Input
                type="text"
                id="request_id"
                name="requestId"
                innerRef={register}
                className="py-0 text-sm"
                style={{ height: '25px' }}
                autoComplete="off"
              ></Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            {isManagerOrAdminUser && (
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
                  <option></option>
                  {userList}
                </Input>
              </Col>
            )}
          </FormGroup>
          <FormGroup row className="d-flex justify-content-center">
            <Button
              type="submit"
              color="primary"
              icon="fas fa-search"
              className="mr-2"
            >
              Search
            </Button>
            <Button
              icon="fas fa-sync-alt"
              type="reset"
              onClick={() => {
                reset(resetValues);
                setOffset(0);
                setCurrentPageIndex(0);
              }}
            >
              Reset
            </Button>
          </FormGroup>
        </Form>

        <JobsQueueGrid
          columns={columns}
          data={jobQueueGridData}
          sortBy={sortBy}
          orderBy={orderBy}
          fetchData={({ pageIndex, pageSize }) => {
            setOffset(pageIndex);
            setCurrentPageIndex(pageIndex);
            setLimit(pageSize);
            onSubmit(pageSize, pageIndex);
          }}
          loading={loading}
          pageSize={limit}
          pageCount={pageCount}
          error={error}
          pageOffset={offset}
          currentPageIndex={currentPageIndex}
          handleRefresh={refreshJobQueueData}
          // when sortBy and orderBy is changed, onSubmit is called by useEffect
          handleSort={(sortBy, orderByDesc) => {
            setSortBy(sortBy);
            setOrderBy(orderByDesc ? 'desc' : 'asc');
          }}
          totalCount={totalCount}
        />
      </CardBody>
    </Card>
  );
};
export default JobsQueue;
