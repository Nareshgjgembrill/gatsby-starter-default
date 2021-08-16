/*
 * @author @rManimegalai
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { parseUrl } from 'query-string';
import {
  FETCH_SCHEDULES_QUERY,
  DELETE_SCHEDULE_QUERY,
  FETCH_MANAGER_USER_QUERY,
} from '../../queries/SettingsQuery';
import UserContext from '../../UserContext';
import ConfirmModal from '../../Common/ConfirmModal';
import EmailScheduleGrid from './EmailScheduleGrid';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const EmailExecutionSchedule = ({ match, history, location }) => {
  const [scheduleRefetch, setScheduleRefetch] = useState(
    location.state ? location.state.handleRefetch : false
  );
  const [scheduleId, setScheduleId] = useState(0);
  const [scheduleName, setScheduleName] = useState();
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const { query: searchParams } = parseUrl(window.location.search);
  const [pageCount, setPageCount] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [orderBy, setOrderBy] = useState('asc');
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [emailFilter, setEmailFilter] = useState(
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
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const isManagerUser = `filter[isManagerUser]=Y`;
  const [createdUserId, setCreatedUserId] = useState();
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const sortingParams = {
    name: 'sort[name]',
    timezone: 'sort[timezone]',
    createdDate: 'sort[createdDate]',
    createdUser: 'sort[user][name]',
  };
  const {
    data: fetchSchedulesData,
    loading: fetchSchedulesLoading,
    error: fetchSchedulesError,
    refetch: refetchScheduleData,
  } = useQuery(FETCH_SCHEDULES_QUERY, {
    variables: { limit, offset, emailFilter },
    notifyOnNetworkStatusChange: true,
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch schedules.',
        fetchSchedulesData,
        'fetch_schedules'
      );
    },
  });

  const { data: fetchManagerUserData } = useQuery(FETCH_MANAGER_USER_QUERY, {
    variables: { isManagerUser: isManagerUser },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch manager user.',
        fetchManagerUserData,
        'fetch_manager_user'
      );
    },
  });

  const [
    deleteSchedule,
    { data: deleteScheduleData, loading: deleteScheduleLoading },
  ] = useLazyQuery(DELETE_SCHEDULE_QUERY, {
    onCompleted: (response) => deleteScheduleCallback(response, true),
    onError: (response) => deleteScheduleCallback(response),
  });

  if (scheduleRefetch) {
    refetchScheduleData();
    setScheduleRefetch(false);
  }

  const rowSelectedValue = (row) => {
    setScheduleId(row.original.id);
    setScheduleName(row.original.name);
    setCreatedUserId(row.original.createdUser);
  };
  const handleSelectedRows = (selectedIds) => {
    const keys = Object.keys(selectedIds);
    setSelectedRowCount(keys.length);
  };

  const deleteMsg = () => {
    return (
      <>
        <strong>{scheduleName}</strong> Deleted successfully!
      </>
    );
  };

  const deleteEmailSchedule = () => {
    if (selectedRowCount > 1) {
      notify(
        'Sorry! Only 1 schedule can be deleted at a time.',
        'error',
        'delete_schedule'
      );
      return false;
    } else if (selectedRowCount === 0) {
      notify('Please select a schedule to delete', 'error', 'delete_schedule');
      return false;
    } else if (currentUserId !== createdUserId) {
      notify(
        'Sorry! Shared Schedules can not be deleted',
        'error',
        'delete_schedule'
      );
    } else {
      setShowDeleteConfirmModal(true);
    }
  };
  const cloneEmailSchedule = () => {
    if (selectedRowCount > 1) {
      notify(
        'Only one schedule can be cloned at a time',
        'error',
        'clone_schedule'
      );
      return false;
    } else if (selectedRowCount === 0) {
      notify('Please select a schedule to clone', 'error', 'clone_schedule');
      return false;
    }
    history.push({
      pathname: '/settings/emailExecutionSchedule/' + scheduleId + '/clone',
      state: {
        pathName: window.location.pathname,
        search: window.location.search,
      },
    });
  };

  const deleteScheduleCallback = (response, status) => {
    if (status) {
      notify(deleteMsg, 'success', 'delete_schedule');
      refetchScheduleData();
      setShowDeleteConfirmModal(false);
    } else {
      setShowDeleteConfirmModal(false);
      showErrorMessage(
        response,
        'Sorry! Failed to delete schedule.',
        deleteScheduleData,
        'delete_schedule'
      );
    }
  };
  const columns = [
    {
      Header: 'Name',
      accessor: 'name',
      width: '25%',
      Cell: function (props) {
        const id = props.row.original.id;
        const sharedType = props.row.original.sharedType;
        const name = props.row.original.name;
        return (
          <div title={name && name}>
            <Link
              to={{
                pathname: '/settings/emailExecutionSchedule/' + id + '/edit',
                state: {
                  pathName: window.location.pathname,
                  search: window.location.search,
                },
              }}
              className="text-header"
            >
              {props.value}
            </Link>
            {sharedType !== null &&
              sharedType !== 'none' &&
              sharedType.trim() !== '' && (
                <i
                  className="fas fa-user-friends fa-sm text-primary ml-2"
                  title="This schedule is a shared schedule"
                ></i>
              )}
          </div>
        );
      },
    },
    {
      Header: 'Time Zone',
      accessor: 'timezone',
      width: '17%',
      Cell: function (props) {
        return props.value.replace(/_/g, ' ');
      },
    },
    {
      Header: 'Shared Type',
      accessor: 'sharedType',
      width: '18%',
      disableSortBy: true,
      Cell: function (props) {
        if (props.value === 'allUsers') {
          return 'All users';
        } else if (props.value === 'specificGroupOfUsers') {
          return 'Specific group of users';
        } else {
          return 'None';
        }
      },
    },
    {
      Header: 'Created Date and Time',
      accessor: 'createdDate',
      width: '20%',
      Cell: function (props) {
        const createdDate = new Date(props.value)
          .toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
          .replace(',', '')
          .split(' ')
          .map((item) => {
            return item.replace(/^0+/, '');
          })
          .join(' ');
        return <div className="text-nowrap">{createdDate}</div>;
      },
    },
    {
      Header: 'Created By',
      accessor: 'createdUser',
      width: '20%',
      Cell: function (props) {
        if (props.value === currentUserId) {
          return user.displayName;
        } else {
          let createdUser = '';
          if (fetchManagerUserData !== undefined) {
            createdUser = fetchManagerUserData.manager.data
              .filter((user) => {
                return user.id === props.value;
              })
              .map((us) => {
                return us.displayName;
              });
          }
          return createdUser;
        }
      },
    },
  ];
  const scheduleGridData = useMemo(
    () =>
      fetchSchedulesData && fetchSchedulesData.schedule
        ? fetchSchedulesData.schedule.data
        : [],
    [fetchSchedulesData]
  );
  useEffect(() => {
    setPageCount(
      !fetchSchedulesLoading && fetchSchedulesData.schedule.paging
        ? Math.ceil(fetchSchedulesData.schedule.paging.totalCount / limit)
        : 0
    );
    setTotalCount(
      !fetchSchedulesLoading && fetchSchedulesData.schedule.paging
        ? fetchSchedulesData.schedule.paging.totalCount
        : 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSchedulesData]);
  const handleEmailSearch = () => {
    const { query } = parseUrl(window.location.search);
    query['filter[user][id]'] = currentUserId;
    query[sortingParams[sortBy]] = orderBy;
    const filterQry = Object.entries({ ...query })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setEmailFilter(filterQry === '' ? '' : '&' + filterQry);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => handleEmailSearch(), [sortBy, orderBy]);

  return (
    <Card className="card-default">
      <CardHeader className="border-bottom">
        <i className="fa fa-user mr-2"></i>
        <strong>Email Execution Schedule</strong>
        <div className="card-tool float-right">
          <Link
            to={{
              pathname: '/settings/emailExecutionSchedule/add',
              state: {
                pathName: window.location.pathname,
                search: window.location.search,
              },
            }}
          >
            <i
              className="fa fa-plus text-primary mr-2"
              title="Add Schedule"
            ></i>
          </Link>
          <i
            className="fa fa-clone text-primary mr-2"
            title="Clone Schedule"
            onClick={() => cloneEmailSchedule()}
          ></i>
          <i
            className="far fa-trash-alt text-danger"
            title="Delete Schedule"
            onClick={() => deleteEmailSchedule()}
          ></i>
        </div>
      </CardHeader>
      <CardBody>
        <EmailScheduleGrid
          columns={columns}
          data={scheduleGridData}
          emailScheduleData={fetchSchedulesData}
          fetchData={({ pageIndex, pageSize }) => {
            setOffset(pageIndex);
            setCurrentPageIndex(pageIndex);
            setLimit(pageSize);
            if (!currentUrlStatePushed) {
              window.history.replaceState({}, '', window.location.href);
              setCurrentUrlStatePushed(true);
            }
            if (match.path === '/settings/emailExecutionSchedule') {
              const { query } = parseUrl(window.location.search);
              query['page[limit]'] = pageSize;
              query['page[offset]'] = pageIndex;
              const searchString = Object.entries(query)
                .map(([key, val]) => `${key}=${val}`)
                .join('&');
              window.history.replaceState({}, '', '?' + searchString);
            }
          }}
          loading={fetchSchedulesLoading}
          error={fetchSchedulesError}
          pageSize={limit}
          pageCount={pageCount}
          sortBy={sortBy}
          orderBy={orderBy}
          currentPageIndex={currentPageIndex}
          rowSelectedValue={rowSelectedValue}
          handleRefresh={refetchScheduleData}
          handleSelectedRows={handleSelectedRows}
          handleSort={(sortBy, orderBy) => {
            setSortBy(sortBy);
            setOrderBy(orderBy ? 'desc' : 'asc');
          }}
          totalCount={totalCount}
        />
        <ConfirmModal
          confirmBtnIcon="fas fa-trash"
          confirmBtnText="Delete"
          handleCancel={() => setShowDeleteConfirmModal(false)}
          showConfirmModal={showDeleteConfirmModal}
          handleConfirm={() =>
            deleteSchedule({ variables: { id: scheduleId } })
          }
          showConfirmBtnSpinner={deleteScheduleLoading}
        >
          <span>
            Are you sure you want to delete <strong>{scheduleName}</strong>?
          </span>
        </ConfirmModal>
      </CardBody>
    </Card>
  );
};
export default EmailExecutionSchedule;
