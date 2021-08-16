/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import {
  Button,
  ButtonDropdown,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverBody,
  Row,
} from 'reactstrap';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import { parseUrl } from 'query-string';
import UserContext from '../../UserContext';
import { getPendingCallsCount } from '../../../store/actions/actions';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import {
  notify,
  PLEASE_CONTACT_CONNECTLEADER_SUPPORT,
  showErrorMessage,
} from '../../../util/index';
import { ContentWrapper } from '@nextaction/components';
import ConfirmModal from '../../Common/ConfirmModal';
import ZipWhipModal from '../../Common/ZipwhipTouchModal';
import EditFollowUpModal from './EditFollowUpModal';
import UserList from '../../Common/UserList';
import ProspectsSortByFieldsDropdown from '../../Common/ProspectsSortByFieldsDropdown';
import CloseButton from '../../Common/CloseButton';
import DropDown from '../../Common/DropDown';
import OpenCrmWindow from '../../Common/OpenCrmWindow';
import ClButton from '../../Common/Button';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import PageHeader from '../../Common/PageHeader';
import SearchBar from '../../Common/SearchBar';
import {
  SAVE_SNOOZE_QUERY,
  START_POWER_DIALING_QUERY,
  GET_LOOKUP_VALUE_QUERY,
  FETCH_PENDINGCALL_CADENCES_AND_TOUCHES_QUERY,
  FETCH_PENDING_CALLS_QUERY,
  EDIT_FOLLOWUP_TASK,
} from '../../queries/PendingCallsQuery';
import PendingCallsGrid from '../PendingCalls/PendingCallsGrid';
import { timeLeft, getDueDate } from '../../../util/index';
toast.configure();

const PendingCalls = ({ location, history }) => {
  const dispatch = useDispatch();
  const { parentUserId } = location.state ? location.state : {};
  const { query: searchParams } = parseUrl(window.location.search);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const { apiURL: RESOURCE_SERVER_URL, token } = useContext(
    ApiUrlAndTokenContext
  );
  const {
    data: configurationsData,
    error: configurationsError,
  } = useConfigurations();
  const org = configurationsData?.configurations?.data[0];
  const hasZipWhip =
    (!configurationsError &&
      configurationsData?.configurations?.data[0]?.zipwhip) ||
    false;
  const [currentUrlStatePushed, setCurrentUrlStatePushed] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [followUp, setFollowUp] = useState(
    searchParams['filter[prospectTask][dueDate]'] || 'CURRENTDUE'
  );
  const [fetchByTouchId, setFetchByTouchId] = useState(
    searchParams['filter[touch][id]'] ? true : false
  );
  const [searchKey, setSearchKey] = useState(
    searchParams['filter[q]'] ? searchParams['filter[q]'] : ''
  );
  const sortingParams = {
    contactName: 'sort[contactName]',
    campaignName: 'sort[cadence][name]',
    currentTouchId: 'sort[currentTouchId]',
    dueAt: 'sort[dueAt]',
    product: 'sort[callTouch][product]',
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
      sortByUrlParam = 'contactName';
    }

    if (['asc', 'desc'].indexOf(orderByUrlParam.toLowerCase()) === -1) {
      orderByUrlParam = 'asc';
    }
  }

  const getCallingModeFilter = () => {
    if (
      isClickDialerChecked &&
      isPersonalDialerChecked &&
      isTeamDialerChecked
    ) {
      return encodeURIComponent(':[CD,PD,TD]');
    } else if (isClickDialerChecked && isPersonalDialerChecked) {
      return encodeURIComponent(':[CD,PD]');
    } else if (isPersonalDialerChecked && isTeamDialerChecked) {
      return encodeURIComponent(':[PD,TD]');
    } else if (isTeamDialerChecked && isClickDialerChecked) {
      return encodeURIComponent(':[CD,TD]');
    } else if (isClickDialerChecked) {
      return 'CD';
    } else if (isPersonalDialerChecked) {
      return 'PD';
    } else if (isTeamDialerChecked) {
      return 'TD';
    }
  };

  const getEncodedUriValue = (value) => {
    return value && Array.isArray(value) && value.length > 1
      ? encodeURIComponent(':[' + value + ']')
      : value;
  };

  const dismissAllToasts = () => {
    toast.dismiss();
  };

  history.listen(dismissAllToasts);

  const [sortBy, setSortBy] = useState(sortByUrlParam || 'contactName');
  const [orderBy, setOrderBy] = useState(orderByUrlParam || 'asc');
  const [cadenceValue, setCadenceValue] = useState(
    searchParams['filter[cadence][id]']
      ? searchParams['filter[cadence][id]'].includes(':[')
        ? searchParams['filter[cadence][id]']
            .replace(':[', '')
            .replace(']', '')
            .split(',')
            .map(Number)
        : [parseInt(searchParams['filter[cadence][id]'])]
      : ''
  );
  const [isCadenceDropDownOpen, setIsCadenceDropDownOpen] = useState(false);
  const [touchValue, setTouchValue] = useState(
    searchParams['filter[currentTouchId]']
      ? parseInt(searchParams['filter[currentTouchId]'])
      : null
  );
  const [isClickDialerChecked, setIsClickDialerChecked] = useState(
    searchParams['filter[callTouch][product]'] &&
      searchParams['filter[callTouch][product]'].includes('CD')
      ? true
      : false
  );
  const [isPersonalDialerChecked, setIsPersonalDialerChecked] = useState(
    searchParams['filter[callTouch][product]'] &&
      searchParams['filter[callTouch][product]'].includes('PD')
      ? true
      : false
  );
  const [isTeamDialerChecked, setIsTeamDialerChecked] = useState(
    searchParams['filter[callTouch][product]'] &&
      searchParams['filter[callTouch][product]'].includes('TD')
      ? true
      : false
  );
  const [userId, setUserId] = useState(
    parentUserId || parseInt(searchParams['filter[user][id]']) || currentUserId
  );
  const [dropdownUserId, setDropdownUserId] = useState(
    parentUserId || parseInt(searchParams['filter[user][id]']) || currentUserId
  );

  const getPendingCallsFilterQry = (isSearchEvt = false, searchValue) => {
    if (fetchByTouchId) {
      let filterQry = ``;

      if (cadenceValue && cadenceValue.length > 0 && followUp !== 'FUTURE') {
        filterQry = `filter[cadence][id]=${getEncodedUriValue(cadenceValue)}`;
      }
      if (getCallingModeFilter()) {
        filterQry += `&filter[callTouch][product]=${getCallingModeFilter()}`;
      }
      if (!isNaN(touchValue) && touchValue && followUp !== 'FUTURE') {
        filterQry += `&filter[currentTouchId]=${touchValue}`;
      }
      if (userId) {
        filterQry += `&filter[user][id]=${
          userId !== dropdownUserId ? dropdownUserId : userId
        }`;
      }
      filterQry += `&${
        sortingParams[sortBy] ? sortingParams[sortBy] : `sort[${sortBy}]`
      }=${orderBy}`;

      filterQry += `&filter[callTouch][type]=CALL&filter[currentTouchStatus]=SCHEDULED`;

      if (searchParams['filter[touch][id]']) {
        filterQry += `&filter[touch][id]=${searchParams['filter[touch][id]']}`;
      }

      if (isSearchEvt && searchValue.trim() !== '') {
        filterQry += `&filter[q]=${encodeURIComponent(searchValue)}`;
      } else if (!isSearchEvt && searchParams['filter[q]']) {
        filterQry += `&filter[q]=${encodeURIComponent(
          searchParams['filter[q]']
        )}`;
      }

      return filterQry.startsWith('&') ? filterQry : `&${filterQry}`;
    } else {
      let filterQry = ``;

      if (cadenceValue && cadenceValue.length > 0 && followUp !== 'FUTURE') {
        filterQry = `filter[cadence][id]=${getEncodedUriValue(cadenceValue)}`;
      }
      if (getCallingModeFilter()) {
        filterQry += `&filter[callTouch][product]=${getCallingModeFilter()}`;
      }
      if (!isNaN(touchValue) && touchValue && followUp !== 'FUTURE') {
        filterQry += `&filter[currentTouchId]=${touchValue}`;
      }
      if (
        followUp &&
        (!cadenceValue || cadenceValue.length === 0 || followUp === 'FUTURE') &&
        (!touchValue || followUp === 'FUTURE')
      ) {
        filterQry += `&filter[prospectTask][dueDate]=${followUp}`;
      }
      if (userId) {
        filterQry += `&filter[user][id]=${
          userId !== dropdownUserId ? dropdownUserId : userId
        }`;
      }
      filterQry += `&${
        sortingParams[sortBy] ? sortingParams[sortBy] : `sort[${sortBy}]`
      }=${orderBy}`;

      if (isSearchEvt && searchValue.trim() !== '') {
        filterQry += `&filter[q]=${encodeURIComponent(searchValue)}`;
      } else if (!isSearchEvt && searchParams['filter[q]']) {
        filterQry += `&filter[q]=${encodeURIComponent(
          searchParams['filter[q]']
        )}`;
      }

      filterQry += `&filter[callTouch][type]=CALL&filter[currentTouchStatus]=SCHEDULED`;

      return filterQry.startsWith('&') ? filterQry : `&${filterQry}`;
    }
  };

  const [pendingCallsFilter, setPendingCallsFilter] = useState(
    getPendingCallsFilterQry()
  );

  useEffect(() => {
    if (searchParams['fetchByTouchId'] === true) {
      setFetchByTouchId(true);
      setPendingCallsFilter(getPendingCallsFilterQry());
    } else {
      setPendingCallsFilter(getPendingCallsFilterQry());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [pageCount, setPageCount] = useState(0);
  const [limit, setLimit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [offset, setOffset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [touches, setTouches] = useState([]);
  const [cadences, setCadences] = useState([]);
  const [
    showStartPowerDialingConfirmModal,
    setShowStartPowerDialingConfirmModal,
  ] = useState(false);
  const [showZipwhipTouchWindow, setShowZipwhipTouchWindow] = useState(false);
  const [textPhoneNumber, setTextPhoneNumber] = useState(0);
  const [prospectId, setProspectId] = useState();
  const [contactName, setContactName] = useState();
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showViewInfo, setShowViewInfo] = useState(false);
  const [viewInfoData, setViewInfoData] = useState({
    prospect: {},
    state: {},
    followUpData: {},
  });
  const [snoozeData, setSnoozeData] = useState({
    prospect: {},
    followUpData: {},
  });
  const [totalProspectCount, setTotalProspectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    prospect: {},
    state: {},
    followUpData: {},
  });
  const [editFollowupType, setEditFollowupType] = useState(null);

  const [
    editFollowup,
    { data: editFollowupData, loading: editFollowupLoading },
  ] = useLazyQuery(EDIT_FOLLOWUP_TASK, {
    onCompleted: () => {
      notify('Task has been updated successfully', 'success', 'task_update');
      setShowEdit(false);
      refetchPendingCalls();
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to update the task information.',
        editFollowupData,
        'edit_task'
      );
    },
  });

  const handleEditSubmit = (data) => {
    let fieldsUpdated = ['subject', 'notes', 'followupDate', 'reminder'];
    if (Object.keys(data).length > 1) {
      const task = editData?.followUpData;
      if (task && task.subject === data.subject) {
        const index = fieldsUpdated.indexOf('subject');
        if (index > -1) {
          fieldsUpdated.splice(index, 1);
        }
      }
      if (task && task.comments === data.notes) {
        const index = fieldsUpdated.indexOf('notes');
        if (index > -1) {
          fieldsUpdated.splice(index, 1);
        }
      }
      if (task && task.dueDate === data.followupDate) {
        const index = fieldsUpdated.indexOf('followupDate');
        if (index > -1) {
          fieldsUpdated.splice(index, 1);
        }
      }
      if (
        task &&
        task.reminder === moment(data?.reminder, ['HH:mm']).format('hh:mm A')
      ) {
        const index = fieldsUpdated.indexOf('reminder');
        if (index > -1) {
          fieldsUpdated.splice(index, 1);
        }
      }
    } else {
      fieldsUpdated = ['followupDate'];
    }

    if (fieldsUpdated.length === 0) {
      notify('No changes made!', 'error');
      return;
    }
    editFollowup({
      variables: {
        taskId: editData?.followUpData?.id,
        subject: data?.subject
          ? data.subject
          : editData?.followUpData
          ? editData.followUpData.subject
          : null,
        notes: data?.notes
          ? data.notes
          : editData?.followUpData
          ? editData.followUpData.comments
          : null,
        followupDate: data?.followupDate,
        reminder: data?.reminder
          ? moment(data?.reminder, ['HH:mm']).format('hh:mm A')
          : editData?.followUpData
          ? editData.followUpData.reminder
          : null,
        id: editData?.prospect?.id,
        fieldsUpdated: fieldsUpdated.join(', '),
      },
    });
  };

  const {
    data: pendingCallsData,
    loading,
    error,
    refetch: refetchPendingCalls,
    called,
  } = useQuery(FETCH_PENDING_CALLS_QUERY, {
    variables: {
      includeAssociationsQry:
        'includeAssociations[]=cadence&includeAssociations[]=touch&includeAssociations[]=prospectTask',
      prospectFilter: pendingCallsFilter,
      limit,
      offset,
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    loading: cadenceAndTouchLoading,
    error: cadenceAndTouchError,
    called: cadenceAndTouchCalled,
    refetch: refetchCadenceAndTouches,
  } = useQuery(FETCH_PENDINGCALL_CADENCES_AND_TOUCHES_QUERY, {
    variables: {
      prospectFilter: `filter[user][id]=${userId}`,
    },
    onCompleted: (response) => {
      if (response?.cadencesAndTouches?.data?.length > 0) {
        setCadences(
          response.cadencesAndTouches.data.map((cadence) => {
            return { text: cadence.name, value: cadence.id, active: false };
          })
        );
        const touches = [];
        if (!cadenceValue || cadenceValue.length === 0) {
          response.cadencesAndTouches.data.forEach((cadence) => {
            cadence.touches.forEach((touch) => {
              touches.push({
                text: touch.touchDetails,
                value: parseInt(touch.stepNo),
                active: false,
              });
            });
          });
        } else {
          response.cadencesAndTouches.data
            .filter((item) => cadenceValue.includes(item.id))
            .forEach((cadence) => {
              cadence.touches.forEach((touch) => {
                touches.push({
                  text: touch.touchDetails,
                  value: parseInt(touch.stepNo),
                  active: false,
                });
              });
            });
        }
        setTouches(
          Array.from(new Set(touches.map(JSON.stringify)))
            .map(JSON.parse)
            .sort((a, b) => a.text.localeCompare(b.text))
        );
      } else {
        setCadences([]);
        setTouches([]);
      }
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    refetchCadenceAndTouches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCallsFilter]);

  const [fetchLookupData, { data: lookupData }] = useLazyQuery(
    GET_LOOKUP_VALUE_QUERY,
    {
      variables: {
        lookupsFilter: `filter[lookupName]=import_ajax_timeout`,
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    }
  );

  const [
    startPowerDialing,
    { data: startPOwerDialingData, loading: startPowerDialingReqLoading },
  ] = useLazyQuery(START_POWER_DIALING_QUERY, {
    onCompleted: () => {
      setShowStartPowerDialingConfirmModal(false);
      const newWin = window.open(
        !configurationsError &&
          configurationsData?.configurations?.data[0]?.powerDialerUrl,
        'dialers'
      );

      if (!newWin || newWin.closed || typeof newWin.closed == 'undefined') {
        //POPUP BLOCKED NOTIFICATION
        notify(
          'Pop-ups and redirects are blocked by browser for this site. Please enable Pop-ups and redirects in settings',
          'error'
        );
      } else {
        newWin.focus();
      }
    },
    onError: (response) => {
      showErrorMessage(
        response,
        'Sorry! Failed to start dialing.',
        startPOwerDialingData,
        'power_dialing'
      );
    },
  });

  const renderZhipwhipTouch = (phoneNumber, prospectId, contactName) => {
    setTextPhoneNumber(phoneNumber);
    setProspectId(prospectId);
    setShowZipwhipTouchWindow(true);
    setContactName(contactName);
  };

  const PopoverItem = (props) => {
    const {
      id,
      data,
      allProspectsData,
      cadence,
      touch,
      origin,
      followUpData,
    } = props;
    const [popoverOpen, setPopoverOpen] = useState(false);
    const toggle = () => setPopoverOpen(!popoverOpen);
    return (
      <span>
        <Popover
          placement={'left'}
          isOpen={popoverOpen}
          target={'Popover-' + id}
          toggle={toggle}
          trigger="legacy"
        >
          <PopoverBody>
            <Col>
              <Row className="p-1">
                <span
                  className="pointer"
                  onClick={() => {
                    setSnoozeData({
                      prospect: data,
                      followUpData: followUpData,
                    });
                    setShowSnoozeModal(true);
                  }}
                >
                  <i className="fas fa-user-clock mr-2 text-warning"></i>Snooze
                </span>
              </Row>
              <Row className="p-1">
                <span
                  className="pointer"
                  onClick={() => {
                    setViewInfoData({
                      prospect: data,
                      state: {
                        allProspectsData,
                        cadence,
                        origin,
                        prospect: data,
                        touch,
                        showLogTaskModal: true,
                        memberTaskId: followUpData.id,
                        rowIndex: id,
                      },
                      followUpData: followUpData,
                    });
                    setSnoozeData({
                      prospect: data,
                      followUpData: followUpData,
                    });
                    setShowViewInfo(true);
                  }}
                >
                  <i className="fas fa-street-view mr-2 text-danger"></i>View
                  Info
                </span>
              </Row>
              {dropdownUserId === currentUserId && (
                <Row className="p-1">
                  <Link
                    to={{
                      pathname: `prospects/list/${data?.id}`,
                      search: window.location.search,
                      state: {
                        allProspectsData,
                        cadence,
                        origin,
                        hideNewTask: true,
                        prospect: data,
                        touch,
                        showLogTaskModal: true,
                        memberTaskId: followUpData?.id,
                        rowIndex: id,
                      },
                    }}
                  >
                    <i className="fas fa-phone phone-contact mr-2 fa-rotate-90 text-call"></i>
                    Complete Call
                  </Link>
                </Row>
              )}
              <Row className="p-1">
                <span
                  onClick={() => {
                    setEditData({
                      prospect: data,
                      state: {
                        allProspectsData,
                        cadence,
                        origin,
                        prospect: data,
                        touch,
                      },
                      followUpData: followUpData && followUpData,
                    });
                    setEditFollowupType('all');
                    setShowEdit(true);
                  }}
                  className="pointer"
                >
                  <i className="fas fa-pencil-alt mr-2 text-success pt-1"></i>
                  Edit
                </span>
              </Row>
            </Col>
          </PopoverBody>
        </Popover>
      </span>
    );
  };

  const SnoozeModal = ({ snoozeData, showSnoozeModal, handleCancel }) => {
    const [
      snooze,
      { data: snoozeResponseData, loading: snoozeLoading },
    ] = useLazyQuery(SAVE_SNOOZE_QUERY, {
      onCompleted: (response) => handleSnoozeResponse(response, true),
      onError: (response) => handleSnoozeResponse(response),
    });
    const handleSnoozeResponse = (response, success) => {
      if (success) {
        refetchPendingCalls();
        refetchCadenceAndTouches();
        dispatch(
          getPendingCallsCount(currentUserId, RESOURCE_SERVER_URL, token)
        );
        setShowSnoozeModal(false);
        setSnoozeData({
          prospect: {},
          followUpData: {},
        });
      } else {
        showErrorMessage(
          response,
          'Sorry! Failed to save the snooze information',
          snoozeResponseData,
          'snooze_data'
        );
      }
    };

    const snoozeRef = useRef();
    return (
      <Modal size="md" isOpen={showSnoozeModal} centered={true}>
        <ModalHeader>
          <i className="fas fa-user-clock mr-2 text-warning" />
          Snooze - {snoozeData.prospect.contactName} ({' '}
          {snoozeData.prospect.accountName} )
        </ModalHeader>
        <ModalBody>
          <div>
            <FormGroup row className="mb-0">
              <Label for="snooze_value" sm={6}>
                Click Snooze to be reminded in
              </Label>
              <Col sm={6}>
                <Input
                  type="select"
                  name="email"
                  id="snooze_value"
                  innerRef={snoozeRef}
                >
                  <option value="1 hour">1 hour</option>
                  <option value="2 hours">2 hours</option>
                  <option value="6 hours">6 hours</option>
                  <option value="12 hours">12 hours</option>
                  <option value="1 day">1 day</option>
                  <option value="2 days">2 days</option>
                  <option value="4 days">4 days</option>
                  <option value="1 week">1 week</option>
                </Input>
              </Col>
            </FormGroup>
          </div>
        </ModalBody>
        <ModalFooter className="card-footer">
          <CloseButton onClick={handleCancel} btnTxt="Cancel" />
          <ClButton
            color="primary"
            className="mr-2"
            icon={snoozeLoading ? 'fa fa-spinner fa-spin' : 'fas fa-user-clock'}
            disabled={snoozeLoading}
            onClick={() => {
              if (snoozeData?.followUpData && showSnoozeModal) {
                snooze({
                  variables: {
                    input: {
                      snooze: snoozeRef.current.value,
                      user: dropdownUserId,
                    },
                    taskId: snoozeData.followUpData.id,
                  },
                });
              }
            }}
          >
            Snooze
          </ClButton>
        </ModalFooter>
      </Modal>
    );
  };

  const ViewInfoModal = ({ showViewInfo, handleClose, viewInfoData }) => {
    return (
      <Modal size="md" isOpen={showViewInfo} centered={true}>
        <ModalHeader
          toggle={() => {
            handleClose();
            setSnoozeData({ followUpData: {}, prospect: {} });
          }}
        >
          <i className="fas fa-street-view mr-2 text-danger" />
          Follow Up View Info - {viewInfoData.prospect.contactName}
        </ModalHeader>
        <ModalBody>
          <Row className="p-1">
            <Col sm={4} className="text-bold">
              Subject
            </Col>
            <Col>{viewInfoData.followUpData.subject}</Col>
          </Row>
          <Row className="p-1">
            <Col sm={4} className="text-bold">
              Comments
            </Col>
            <Col>{viewInfoData.followUpData.comments}</Col>
          </Row>
          <Row className="p-1">
            <Col sm={4} className="text-bold">
              Due Date
            </Col>
            <Col>
              {moment(viewInfoData.prospect.dueAt).format('MM/DD/YYYY')}
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="card-footer">
          <ClButton
            icon="fas fa-user-clock"
            onClick={() => {
              handleClose();
              setShowSnoozeModal(true);
            }}
            color="primary"
          >
            Snooze
          </ClButton>
          {dropdownUserId === currentUserId && (
            <ClButton
              color="primary"
              icon="fas fa-phone phone-contact fa-rotate-90"
              onClick={() => {
                handleClose();
                history.push({
                  pathname: `prospects/list/${viewInfoData.prospect.id}`,
                  search: window.location.search,
                  state: viewInfoData.state,
                  rowIndex: viewInfoData.rowIndex,
                  memberTaskId: viewInfoData.memberTaskId,
                });
              }}
            >
              Complete Call
            </ClButton>
          )}
        </ModalFooter>
      </Modal>
    );
  };

  // eslint-disable-next-line
  const columns = useMemo(() => [
    {
      id: 'action_icon',
      disableSortBy: true,
      width: '2%',
      Cell: (props) => {
        const rowData = props.row.original;
        let followUpData;
        if (
          rowData?.associations?.prospectTask?.[0] &&
          props?.pendingCallsData?.prospects?.includedAssociations?.prospectTask
        ) {
          followUpData = props.pendingCallsData.prospects.includedAssociations.prospectTask.find(
            (prospect) =>
              prospect.id === rowData.associations.prospectTask[0].id
          );
        }
        if (followUpData) {
          return (
            <i
              className="fas fa-flag text-danger"
              title="Follow up task prospect"
            ></i>
          );
        } else {
          return (
            <i
              className="svgicon koncert-cadence-icon"
              title="Cadence task prospect"
            ></i>
          );
        }
      },
    },
    {
      Header: 'Name',
      accessor: 'contactName',
      width: '15%',
      Cell: function (props) {
        const rowData = props.row.original;
        let cadence;
        let touch;
        let account;
        let followUpData;
        const currentTimeZone = moment.tz.guess();
        const pausedDatetime = moment
          .tz(rowData.pausedDatetime, currentTimeZone)
          .format('M/D/YYYY h:mm A');
        if (
          rowData?.associations?.prospectTask?.[0] &&
          props?.pendingCallsData?.prospects?.includedAssociations?.prospectTask
        ) {
          followUpData = props.pendingCallsData.prospects.includedAssociations.prospectTask.find(
            (prospect) =>
              prospect.id === rowData.associations.prospectTask[0].id
          );
        }
        if (
          rowData?.associations?.cadence &&
          props?.pendingCallsData?.prospects?.includedAssociations?.cadence
        ) {
          cadence = props.pendingCallsData.prospects.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
        }

        if (
          rowData?.associations?.touch &&
          props?.pendingCallsData?.prospects?.includedAssociations?.touch
        ) {
          touch = props.pendingCallsData.prospects.includedAssociations.touch.find(
            (touch) => touch.id === rowData.associations.touch[0].id
          );
        }

        if (
          rowData?.associations?.account &&
          rowData?.associations?.account?.[0]
        ) {
          account = rowData.associations.account[0].id;
        }

        return (
          <>
            {rowData?.crmId &&
              !rowData.crmId.startsWith('crmgenkey_') &&
              configurationsData?.configurations?.data[0]?.crmType !==
                'standalone' && (
                <span
                  className="pointer"
                  onClick={() => {
                    handleOpenCrmWindow(
                      followUpData && followUpData.crmActivityId
                        ? followUpData.crmActivityId
                        : rowData.crmId,
                      rowData.recordType
                    );
                  }}
                >
                  <i
                    className="fas fa-arrow-up mr-2 text-success"
                    style={{ transform: 'rotate(45deg)' }}
                    title="Click to view Prospect details in CRM (or) Salesforce window"
                  ></i>
                </span>
              )}

            <Link
              to={{
                pathname: 'prospects/list/' + props.row.original.id,
                search: window.location.search,
                state: {
                  allProspectsData: props.pendingCallsData,
                  cadence,
                  cadenceId: cadence && cadence.id ? cadence.id : 0,
                  origin: location.pathname,
                  prospect: props.row.original,
                  touch,
                  rowIndex: props.row.index,
                },
              }}
              className="text-break"
            >
              {props?.value && props.value.length > 30
                ? props.value.slice(0, 29) + '..'
                : props.value}
            </Link>
            {(rowData?.optoutFlag === true || rowData?.optoutFlag === 't') && (
              <i
                title="Opted out"
                className="fas fa-ban fa-1x ml-2 text-danger"
              ></i>
            )}
            {rowData.memberStatus === 'SUSPEND' && (
              <i
                title={`Prospect was paused on ${pausedDatetime}`}
                className="fas fa-pause text-danger ml-2"
              ></i>
            )}
            <br></br>
            {account && (
              <Link
                to={{
                  pathname: '/accounts/' + account,
                  search: window.location.search,
                  state: {
                    origin: location.pathname,
                  },
                }}
              >
                <small>
                  {rowData?.accountName && rowData.accountName.length > 30
                    ? rowData.accountName.slice(0, 29) + '..'
                    : rowData.accountName}
                </small>
              </Link>
            )}
          </>
        );
      },
    },
    {
      Header: 'Action',
      accessor: 'action',
      width: '13%',
      textAlign: 'center',
      disableSortBy: true,
      Cell: function (props) {
        const rowData = props.row.original;
        let cadence;
        let touch;
        if (
          rowData?.associations?.cadence &&
          props?.pendingCallsData?.prospects?.includedAssociations?.cadence
        ) {
          cadence = props.pendingCallsData.prospects.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
        }

        if (
          rowData?.associations?.touch &&
          props?.pendingCallsData?.prospects?.includedAssociations?.touch
        ) {
          touch = props.pendingCallsData.prospects.includedAssociations.touch.find(
            (touch) => touch.id === rowData.associations.touch[0].id
          );
        }

        let dialingPhone = rowData?.phone;

        if (!dialingPhone) {
          const dialingKey = Object.keys(rowData).filter((key) => {
            return key.startsWith('customPhone') && rowData[key];
          });

          dialingPhone =
            dialingKey && dialingKey.length > 0 ? rowData[dialingKey[0]] : '';
        }
        if (rowData) {
          return (
            <>
              {userId === currentUserId && dialingPhone && (
                <Link
                  to={{
                    pathname: 'prospects/list/' + props.row.original.id,
                    search: window.location.search,
                    state: {
                      allProspectsData: props.pendingCallsData,
                      cadence,
                      origin: location.pathname,
                      prospect: props.row.original,
                      touch,
                      dialingNumber: rowData.phone,
                      rowIndex: props.row.index,
                    },
                  }}
                  title={`Call-${dialingPhone}`}
                >
                  <span className="fa-stack">
                    <i className="fas fa-circle fa-stack-2x thin-circle"></i>
                    <i className="fas fa-phone-alt fa-stack-1x fa-sm text-call"></i>
                  </span>
                </Link>
              )}
              {userId === currentUserId &&
                hasZipWhip &&
                user.zipwhipSessionKey && (
                  <span
                    onClick={() =>
                      renderZhipwhipTouch(
                        dialingPhone,
                        rowData.id,
                        rowData.contactName
                      )
                    }
                    className="pointer"
                  >
                    <span className="fa-stack" title={`Text-${dialingPhone}`}>
                      <i className="fas fa-circle fa-stack-2x thin-circle"></i>
                      <i className="fas fa-comments fa-stack-1x fa-sm text-danger"></i>
                    </span>
                  </span>
                )}
            </>
          );
        } else {
          return null;
        }
      },
    },
    {
      Header: 'Cadence',
      accessor: 'campaignName',
      width: '18%',
      Cell: function (props) {
        const rowData = props.row.original;
        let cadence;
        let followUpData;
        if (
          rowData?.associations?.cadence &&
          props?.pendingCallsData?.prospects?.includedAssociations?.cadence
        ) {
          cadence = props.pendingCallsData.prospects.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
        }

        if (
          rowData?.associations?.prospectTask?.[0] &&
          props?.pendingCallsData?.prospects?.includedAssociations?.prospectTask
        ) {
          followUpData = props.pendingCallsData.prospects.includedAssociations.prospectTask.find(
            (followUp) =>
              followUp.id === rowData.associations.prospectTask[0].id
          );
        }

        if (!followUpData && cadence) {
          return (
            <>
              <Link
                to={{
                  pathname: '/cadences/' + cadence.id + '/touches/view',
                  search: `${location.search}&cadence[name]=${cadence.name}&not=1`,
                  state: {
                    allCadencesData:
                      props.pendingCallsData.prospects.includedAssociations
                        .cadence,
                    origin: location.pathname,
                    cadence: cadence,
                    cadenceName: cadence.name,
                    parentUserId: dropdownUserId,
                  },
                }}
                className="text-break"
              >
                {cadence.name}
              </Link>
              {cadence?.sharedType !== 'none' && (
                <span title="This cadence is a shared cadence">
                  <i className="fas fa-user-friends fa-sm text-muted ml-2"></i>
                </span>
              )}
            </>
          );
        } else {
          return null;
        }
      },
    },
    {
      Header: 'Current Touch',
      accessor: 'currentTouchId',
      width: '12%',
      Cell: function (props) {
        const rowData = props.row.original;
        let followUpData;
        if (
          rowData?.associations?.prospectTask &&
          props?.pendingCallsData?.prospects?.includedAssociations?.prospectTask
        ) {
          followUpData = props.pendingCallsData.prospects.includedAssociations.prospectTask.find(
            (touch) => touch.id === rowData.associations.prospectTask[0].id
          );
        }
        if (!followUpData && rowData) {
          return (
            <span>
              <i className="fas fa-phone-alt text-muted mr-2"></i>
              Touch {rowData.currentTouchId}
            </span>
          );
        } else {
          return null;
        }
      },
    },
    {
      Header: 'Due',
      accessor: 'dueAt',
      width: '13%',
      Cell: function (props) {
        const rowData = props.row.original;
        const allProspectsData = props.pendingCallsData;
        const origin = location.pathname;
        let touch;
        let cadence;
        if (
          rowData?.associations?.cadence &&
          props?.pendingCallsData?.prospects?.includedAssociations?.cadence
        ) {
          cadence = props.pendingCallsData.prospects.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
        }

        if (
          rowData?.associations?.touch &&
          props?.pendingCallsData?.prospects?.includedAssociations?.touch
        ) {
          touch = props.pendingCallsData.prospects.includedAssociations.touch.find(
            (touch) => touch.id === rowData.associations.touch[0].id
          );
        }

        let followUpData;
        if (
          rowData?.associations?.prospectTask?.[0] &&
          props?.pendingCallsData?.prospects?.includedAssociations?.prospectTask
        ) {
          followUpData = props.pendingCallsData.prospects.includedAssociations.prospectTask.find(
            (followUp) =>
              followUp.id === rowData.associations.prospectTask[0].id
          );
        }
        if (followUpData) {
          return (
            <div className={moment().isAfter(rowData.dueAt) && 'text-danger'}>
              {moment(rowData.dueAt).format('M/D/YYYY')}
              {followUpData && (
                <i
                  onClick={() => {
                    setEditData({
                      prospect: rowData,
                      state: {
                        allProspectsData,
                        cadence,
                        origin,
                        prospect: rowData,
                        touch,
                      },
                      followUpData: followUpData,
                    });
                    setEditFollowupType('date');
                    setShowEdit(true);
                  }}
                  className="far fa-calendar-alt ml-2 text-info pointer"
                  title="Edit due date"
                ></i>
              )}
            </div>
          );
        } else {
          return getDueDate(timeLeft(moment, rowData.dueAt));
        }
      },
    },
    {
      Header: 'Calling Mode',
      accessor: 'product',
      width: '14%',
      Cell: function (props) {
        const rowData = props.row.original;
        const callType = { TD: 'AAD', PD: 'FD' };
        let product = rowData.product || '';
        product = product
          .split(',')
          .join(', ')
          .replace(/TD|PD/g, (matched) => callType[matched]);
        if (product) {
          return <span className="text-brand-primary">{product}</span>;
        } else {
          return null;
        }
      },
    },
    {
      id: 'followup_action',
      disableSortBy: true,
      width: '5%',
      Cell: (props) => {
        const rowData = props.row.original;
        let cadence;
        let touch;
        let followUpData;
        if (
          rowData?.associations?.cadence &&
          props?.pendingCallsData?.prospects?.includedAssociations?.cadence
        ) {
          cadence = props.pendingCallsData.prospects.includedAssociations.cadence.find(
            (cadence) => cadence.id === rowData.associations.cadence[0].id
          );
        }

        if (
          rowData?.associations?.touch &&
          props?.pendingCallsData?.prospects?.includedAssociations?.touch
        ) {
          touch = props.pendingCallsData.prospects.includedAssociations.touch.find(
            (touch) => touch.id === rowData.associations.touch[0].id
          );
        }

        if (
          rowData?.associations?.prospectTask &&
          props?.pendingCallsData?.prospects?.includedAssociations?.prospectTask
        ) {
          followUpData = props.pendingCallsData.prospects.includedAssociations.prospectTask.find(
            (followUp) =>
              followUp.id === rowData.associations.prospectTask[0].id
          );
        }

        if (followUpData) {
          return (
            <>
              <span
                className="pointer"
                id={'Popover-' + props.row.index}
                title="Followup actions"
              >
                <i className="fas fa-ellipsis-v text-danger"></i>
              </span>
              <PopoverItem
                id={props.row.index}
                data={rowData}
                allProspectsData={props.pendingCallsData}
                cadence={cadence}
                origin={location.pathname}
                touch={touch}
                followUpData={followUpData}
              />
            </>
          );
        } else {
          return <span />;
        }
      },
    },
  ]);

  const pendingCallsGridData = useMemo(
    () =>
      pendingCallsData && pendingCallsData.prospects
        ? pendingCallsData.prospects.data
        : [],
    [pendingCallsData]
  );
  /*----------------Handle blocks start------------------------*/

  const pendingCallsSearch = (searchValue, isSearchEvt) => {
    setUserId(dropdownUserId);

    if (userId !== dropdownUserId) {
      setCadences([]);
      setTouches([]);
    }
    const filter = getPendingCallsFilterQry(isSearchEvt, searchValue);
    setPendingCallsFilter(filter);
    window.history.replaceState(
      {},
      '',
      `?${filter.slice(1)}&page[limit]=${limit}&page[offset]=${offset}`
    );
  };

  const handlePendingCallsSearch = () => {
    setUserId(dropdownUserId);
    if (userId !== dropdownUserId) {
      setCadences([]);
      setTouches([]);
    }
    const filter = getPendingCallsFilterQry();
    setPendingCallsFilter(filter);
    window.history.replaceState(
      {},
      '',
      `?${filter.slice(1)}&page[limit]=${limit}&page[offset]=${offset}`
    );
  };
  /* Pending Calls and To do screen- Remove search & clear icons

  const handlePendingCallsReset = () => {
    setCadenceValue([]);
    setIsClickDialerChecked(false);
    setIsPersonalDialerChecked(false);
    setIsTeamDialerChecked(false);
    setFollowUp('CURRENTDUE');
    setTouchValue('');
    setOffset(0);
    setCurrentPageIndex(0);
    setDropdownUserId(currentUserId);
    setUserId(currentUserId);
    const query = {
      'page[limit]': limit,
      'page[offset]': 0,
      'filter[due]': 'CURRENTDUE',
      'filter[user][id]': currentUserId,
      'sort[contactName]': 'asc',
    };
    const filterQry = Object.entries({
      ...query,
      'filter[currentTouchType]': 'CALL',
      'filter[currentTouchStatus]': 'SCHEDULED',
    })
      .filter(([key]) => key.startsWith('filter') || key.startsWith('sort'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    setPendingCallsFilter(filterQry === '' ? '' : '&' + filterQry);

    const urlParamsToBePushed = Object.entries({
      ...query,
    })
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', '?' + urlParamsToBePushed);
  };
  */

  const handleFollowupChange = (value) => {
    setFollowUp(value);
    handleResetOffset();
  };

  const followUpDropdownFields = {
    ALL: ' Followup Calls - All',
    CURRENTDUE: ' Followup Calls - Due',
    FUTURE: ' Followup Calls - Future',
  };

  const [followupDropdownOpen, setFollowupDropdownOpen] = useState(false);
  const toggleAction = () => setFollowupDropdownOpen(!followupDropdownOpen);

  const handleUserChange = (value) => {
    setCadenceValue('');
    setFetchByTouchId(false);
    setDropdownUserId(value);
    handleResetOffset();
  };

  const handleCadenceChange = (value) => {
    setFetchByTouchId(false);
    setCadenceValue(value);
    handleResetOffset();
    setTouchValue(null);
  };

  const handleResetOffset = () => {
    setOffset(0);
    setCurrentPageIndex(0);
  };

  const handleConfirmStartPowerDialing = () => {
    if (userId !== currentUserId) {
      notify(
        'Sorry! The selected user does not have permission to start dialing.',
        'error',
        'confirm_power_dialing'
      );
    } else {
      if (lookupData && lookupData.lookup && lookupData.lookup.data) {
        startPowerDialing({
          variables: {
            includeAssociationsQry:
              'includeAssociations[]=cadence&includeAssociations[]=touch&includeAssociations[]=prospectTask',
            prospectFilter: `${getPendingCallsFilterQry()}`,
            limit,
            offset,
          },
          context: { timeout: parseInt(lookupData.lookup.data[0].lookupValue) },
        });
      }
    }
  };

  /*----------------Handle blocks end------------------------*/

  const handleStartPowerDialing = () => {
    if (
      user &&
      !user.userLicense.includes('PD') &&
      !user.userLicense.includes('TD')
    ) {
      notify(
        `Invalid license. ${PLEASE_CONTACT_CONNECTLEADER_SUPPORT}`,
        'error',
        'invalid_license'
      );
    } else if (totalProspectCount === 0) {
      notify(
        'There are no Prospect(s) available to dial!',
        'error',
        'no_prospects_available'
      );
    } else {
      setShowStartPowerDialingConfirmModal(true);
    }
  };

  useEffect(() => {
    if (!loading && called) {
      fetchLookupData();
    }
    // eslint-disable-next-line
  }, [pendingCallsData]);

  useEffect(() => {
    setPageCount(
      !loading && pendingCallsData?.prospects?.paging
        ? Math.ceil(pendingCallsData.prospects.paging.totalCount / limit)
        : 0
    );
    setTotalProspectCount(
      !loading && pendingCallsData?.prospects?.paging
        ? pendingCallsData.prospects.paging.totalCount
        : 0
    );
    setTotalCount(
      !loading && pendingCallsData?.prospects?.paging
        ? pendingCallsData.prospects.paging.totalCount
        : 0
    );
    // eslint-disable-next-line
  }, [pendingCallsGridData]);

  useEffect(() => {
    handlePendingCallsSearch();
    // eslint-disable-next-line
  }, [
    sortBy,
    orderBy,
    followUp,
    isClickDialerChecked,
    isPersonalDialerChecked,
    isTeamDialerChecked,
    isCadenceDropDownOpen,
    dropdownUserId,
  ]);

  useEffect(() => {
    if (touchValue) {
      handlePendingCallsSearch();
    }
    // eslint-disable-next-line
  }, [touchValue]);

  const handleOpenCrmWindow = (crmId, recordType) => {
    OpenCrmWindow(org, crmId, recordType);
  };

  const tableSortingValues = [
    'contactName',
    'campaignName',
    'currentTouchId',
    'dueAt',
    'updatedDate',
  ];

  return (
    <ContentWrapper>
      <PageHeader
        icon="fas fa-phone-alt"
        pageName="Pending Calls"
        pageStyle={'text-nowrap'}
      >
        <Row className="align-items-center d-flex justify-content-end">
          <Col sm={9} className="pl-0">
            <Row>
              <Col className="pl-0 pr-1">
                <SearchBar
                  clname="mr-2"
                  searchInput={searchKey}
                  onSearch={(searchValue) => {
                    setSearchKey(searchValue ? searchValue : '');
                    pendingCallsSearch(searchValue, true);
                  }}
                  onChange={setSearchKey}
                />
              </Col>
              {!userLoading && user?.isManagerUser === 'Y' && (
                <Col className="pl-0 pr-1">
                  <UserList
                    value={dropdownUserId ? dropdownUserId : ''}
                    onChange={handleUserChange}
                    placeHolder={'Select Users'}
                  />
                </Col>
              )}
              <Col className="pl-0 pr-1">
                <DropDown
                  multiselect={true}
                  data={cadences}
                  value={cadenceValue ? cadenceValue : ''}
                  placeHolder={
                    cadenceAndTouchError ? 'Failed to fetch' : 'Select Cadences'
                  }
                  onChange={handleCadenceChange}
                  loading={cadenceAndTouchLoading}
                  error={cadenceAndTouchError}
                  disabled={!cadenceAndTouchCalled}
                  handleGetDropDownState={(value) => {
                    setIsCadenceDropDownOpen(value);
                  }}
                />
              </Col>
              <Col className="pl-0 pr-1">
                <DropDown
                  data={touches}
                  value={touchValue ? touchValue : ''}
                  placeHolder={
                    cadenceAndTouchError ? 'Failed to fetch' : 'Select Touch'
                  }
                  onChange={(value) => setTouchValue(value)}
                  loading={cadenceAndTouchLoading}
                  error={cadenceAndTouchError}
                  disabled={!cadenceAndTouchCalled}
                />
              </Col>
            </Row>
          </Col>
          {/* 
              Pending Calls and To do screen- Remove search & clear icons #552
              <Col className="mr-4">
                <Button color="secondary" onClick={handlePendingCallsSearch}>
                  <i className="fa fa-search"></i>
                </Button>
                <Button type="button" onClick={handlePendingCallsReset}>
                  <i className="fa fa-times"></i>
                </Button>
              </Col> */}
          <Col sm={2} className="px-0 text-center mr-5">
            <Button
              size="lg"
              className="bg-color-grass"
              onClick={handleStartPowerDialing}
              disabled={
                dropdownUserId !== currentUserId ||
                (user &&
                  !user.userLicense.includes('PD') &&
                  !user.userLicense.includes('TD'))
              }
            >
              <span className="mr-2">
                <span className="svgicon calling"></span>
              </span>
              <span className="text-bold h5 text-nowrap">
                Start Power Dialing
              </span>
            </Button>
          </Col>
        </Row>
      </PageHeader>
      <Row>
        <Col>
          <Card className="card-default">
            <CardBody>
              <Row className="mb-3">
                <Col lg={7} className="d-flex">
                  <div className="card m-0 rounded-0 bg-white br">
                    <div className="card-body pl-4 pt-0 pb-0 d-flex align-items-center">
                      <div className="block pl-2 pt-1">
                        <div className="row">
                          <span className="fa-2x svgicon speed-30">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                          </span>
                        </div>
                        <div className="row">
                          <small className="mx-auto">30%</small>
                        </div>
                      </div>
                      <div className="ml-4 text-nowrap">
                        Click Dialer
                        <Label className="pl-3 ml-3">
                          <Input
                            className="mt-n1"
                            id="pending_calls_cd"
                            type="checkbox"
                            checked={isClickDialerChecked}
                            onChange={(e) => {
                              setIsClickDialerChecked(e.target.checked);
                              handleResetOffset();
                            }}
                          />
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="card m-0 rounded-0 bg-white br">
                    <div className="card-body pl-4 pt-0 pb-0 d-flex align-items-center">
                      <div className="block pl-2 pt-1">
                        <div className="row">
                          <span className="fa-2x svgicon speed-100">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                          </span>
                        </div>
                        <div className="row">
                          <small className="mx-auto">100%</small>
                        </div>
                      </div>
                      <div className="ml-4 text-nowrap">
                        Flow Dialer
                        <Label className="pl-3 ml-3">
                          <Input
                            className="mt-n1"
                            id="pending_calls_pd"
                            type="checkbox"
                            checked={isPersonalDialerChecked}
                            onChange={(e) => {
                              setIsPersonalDialerChecked(e.target.checked);
                              handleResetOffset();
                            }}
                          />
                        </Label>
                      </div>
                    </div>
                  </div>
                  <div className="card m-0 rounded-0 bg-white br">
                    <div className="card-body pl-4 pt-0 pb-0 d-flex align-items-center">
                      <div className="block pl-2 pt-1">
                        <div className="row">
                          <span className="fa-2x svgicon speed-800">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                            <span className="path5"></span>
                          </span>
                        </div>
                        <div className="row">
                          <small className="mx-auto">800%</small>
                        </div>
                      </div>
                      <div className="ml-4 text-nowrap">
                        Agent Assisted Dialer
                        <Label className="pl-3 ml-3">
                          <Input
                            className="mt-n1"
                            id="pending_calls_td"
                            type="checkbox"
                            checked={isTeamDialerChecked}
                            onChange={(e) => {
                              setIsTeamDialerChecked(e.target.checked);
                              handleResetOffset();
                            }}
                          />
                        </Label>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col
                  lg={5}
                  className="d-flex justify-content-lg-end justify-content-sm-start my-auto pl-5 align-items-center"
                >
                  <ButtonDropdown
                    className="ml-2 mr-4"
                    isOpen={followupDropdownOpen}
                    toggle={toggleAction}
                  >
                    <DropdownToggle caret>
                      {followUpDropdownFields[followUp]}{' '}
                    </DropdownToggle>
                    <DropdownMenu
                      right
                      modifiers={{
                        setMinWidth: {
                          enabled: true,
                          order: 890,
                          fn: (data) => {
                            return {
                              ...data,
                              styles: {
                                ...data.styles,
                                overflow: 'auto',
                                minWidth: '100px',
                              },
                            };
                          },
                        },
                      }}
                    >
                      <DropdownItem
                        active={followUp === 'ALL'}
                        onClick={() => handleFollowupChange('ALL')}
                      >
                        Followup Calls - All
                      </DropdownItem>
                      <DropdownItem
                        active={followUp === 'CURRENTDUE'}
                        onClick={() => handleFollowupChange('CURRENTDUE')}
                      >
                        Followup Calls - Due
                      </DropdownItem>
                      <DropdownItem
                        active={followUp === 'FUTURE'}
                        onClick={() => handleFollowupChange('FUTURE')}
                      >
                        Followup Calls - Future
                      </DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                  <ProspectsSortByFieldsDropdown
                    sortBy={tableSortingValues.includes(sortBy) ? null : sortBy}
                    orderBy={
                      tableSortingValues.includes(sortBy) ? null : orderBy
                    }
                    onSort={(field) => {
                      setSortBy(field.sortBy);
                      setOrderBy(field.orderBy);
                    }}
                    filterData={(field) => {
                      return !tableSortingValues.includes(field.name);
                    }}
                  ></ProspectsSortByFieldsDropdown>
                </Col>
              </Row>
              <PendingCallsGrid
                columns={columns}
                data={pendingCallsGridData}
                pendingCallsData={pendingCallsData}
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
                handleRefresh={() => {
                  refetchPendingCalls();
                  refetchCadenceAndTouches();
                  dispatch(
                    getPendingCallsCount(
                      currentUserId,
                      RESOURCE_SERVER_URL,
                      token
                    )
                  );
                }}
                handleSort={(gridSortBy, gridOrderBy) => {
                  if (sortBy !== gridSortBy) {
                    setSortBy(gridSortBy);
                  }
                  if (orderBy !== gridOrderBy) {
                    setOrderBy(gridOrderBy ? 'desc' : 'asc');
                  }
                }}
                totalCount={totalCount}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
      <ConfirmModal
        showConfirmBtnSpinner={startPowerDialingReqLoading}
        confirmBtnIcon={'fas fa-check'}
        confirmBtnText="Proceed"
        handleCancel={() => {
          setShowStartPowerDialingConfirmModal(false);
        }}
        handleConfirm={handleConfirmStartPowerDialing}
        header="Start Power Dialing"
        showConfirmModal={showStartPowerDialingConfirmModal}
      >
        <span className="text-center">
          You have selected <strong>{totalProspectCount || 0}</strong>{' '}
          Prospect(s) to dial.
          <br />
          Any exisiting records in the Dialing Session will be replaced.
          <br />
          Would you like to proceed?
        </span>
      </ConfirmModal>
      <ZipWhipModal
        showZipwhipTouchWindow={showZipwhipTouchWindow}
        phoneNumber={textPhoneNumber}
        zipwhipSessionKey={user.zipwhipSessionKey}
        handleClose={() => setShowZipwhipTouchWindow(false)}
        prospectId={prospectId}
        contactName={contactName}
      />
      <SnoozeModal
        snoozeData={snoozeData}
        showSnoozeModal={showSnoozeModal}
        handleCancel={() => setShowSnoozeModal(false)}
      />
      <ViewInfoModal
        showViewInfo={showViewInfo}
        handleClose={() => setShowViewInfo(false)}
        viewInfoData={viewInfoData}
      />
      <EditFollowUpModal
        showEdit={showEdit}
        editData={editData}
        handleEditSubmit={handleEditSubmit}
        editFollowupType={editFollowupType}
        editFollowupLoading={editFollowupLoading}
        handleHideModal={() => setShowEdit(false)}
      />
    </ContentWrapper>
  );
};

export default PendingCalls;
