import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { ContentWrapper } from '@nextaction/components';
import moment from 'moment';
import { parseUrl } from 'query-string';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link, Route, withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Button,
  ButtonDropdown,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
  Row,
} from 'reactstrap';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { getAllCadences } from '../../../store/actions/actions';
import { notify, showErrorMessage } from '../../../util/index';
import { default as ClButton } from '../../Common/Button';
import FilterButton from '../../Common/FilterButton';
import useConfigurations from '../../Common/hooks/UseConfigurations';
import PageHeader from '../../Common/PageHeader';
import SearchBar from '../../Common/SearchBar';
import UserList from '../../Common/UserList';
import {
  ASSIGN_PROSPECTS_TO_CADENCE,
  FETCH_ASSIGNED_TEAMS_QUERY,
  FETCH_CADENCE_QUERY,
  FETCH_METRICS_QUERY,
  FETCH_PROSPECTS_LIST,
} from '../../queries/CadenceQuery';
import CREATE_TOUCH, {
  CREATE_OTHER_TOUCH,
  FETCH_OUTCOMES_QUERY,
  FETCH_TOUCHES_QUERY,
} from '../../queries/TouchQuery';
import UserContext from '../../UserContext';
import AssignProspectsModal from './AssignProspectsModel';
import CallTouchModal from './CallTouchModal';
import EmailTouchModal from './EmailTouchModal';
import LinkedInTouchModel from './LinkedInTouchModal';
import OtherTouchModal from './OtherTouchModal';
import TextTouchModel from './TextTouchModal';
import TouchInfo from './TouchInfo';
import CadenceOverView from './CadenceOverView';
import Prospects from './Prospects';
import Emails from './Emails';
import Calls from './Calls';

toast.configure();

const components = {
  touches: TouchInfo,
  overview: CadenceOverView,
  prospect: Prospects,
  emails: Emails,
  calls: Calls,
};

const sections = [
  { key: 'touches', name: 'Touches' },
  { key: 'overview', name: 'Overview' },
  { key: 'prospect', name: 'Prospects' },
  { key: 'emails', name: 'Emails' },
  { key: 'calls', name: 'Calls' },
];

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// render filter buttons
const FilterButtons = ({
  filterButtons,
  count,
  loading,
  error,
  setProspectTab,
  setEmailTab,
  setCallTab,
  tabName,
  location,
}) => {
  const [dropdownOpen, setOpen] = useState(false);
  const toggle = () => setOpen(!dropdownOpen);
  const showFilter = filterButtons.slice(0, 4);
  const dropdownFilter = filterButtons.slice(4);

  const { query } = parseUrl(window.location.search);

  const [activeTab, setActiveTab] = useState(
    location?.state?.outcomeBucket
      ? location.state.outcomeBucket
      : query['filter[outCome]']
      ? query['filter[outCome]']
      : 'active'
  );
  const handleProspectTabChange = (e) => {
    e.preventDefault();

    const tabValue = e.currentTarget.getAttribute('data-tab-value');

    setActiveTab(tabValue);
    tabName === 'prospects'
      ? setProspectTab(tabValue)
      : tabName === 'email'
      ? setEmailTab(tabValue)
      : setCallTab(tabValue);
    query['filter[outCome]'] = tabValue;
    const searchString = Object.entries(query)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', `?${searchString}`);
  };

  const metricNames = count && Object.keys(count);
  metricNames &&
    metricNames.length > 0 &&
    metricNames.forEach((outcome) => {
      if (!filterButtons.includes(outcome)) {
        dropdownFilter.push(outcome);
      }
    });

  const isCount = count && Object.keys(count).length > 0;

  const dropDownModifier = {
    setMaxHeight: {
      enabled: true,
      fn: ({ styles, ...props }) => {
        return {
          ...props,
          styles: {
            ...styles,
            overflow: 'auto',
            maxHeight: '250px',
          },
        };
      },
    },
    setMinWidth: {
      enabled: true,
      fn: ({ styles, ...props }) => {
        return {
          ...props,
          styles: {
            ...styles,
            minWidth: '100%',
          },
        };
      },
    },
  };

  return (
    <div>
      <ButtonGroup>
        {showFilter.map((filter, index) => {
          let countValue;
          if (isCount) {
            countValue = count[filter];
          } else {
            countValue = 0;
          }
          return (
            <FilterButton
              key={index}
              active={activeTab === filter}
              count={countValue}
              countError={error}
              countLoading={loading}
              data-tab-value={filter}
              handleClick={handleProspectTabChange}
              title={`${capitalize(filter)} Prospects`}
              className={
                activeTab === filter && 'bg-color-primary-shade text-white'
              }
            >
              {capitalize(filter)}
            </FilterButton>
          );
        })}

        <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle title="More filters">
            <i className="fas fa-angle-double-right"></i>
          </DropdownToggle>
          <DropdownMenu modifiers={dropDownModifier}>
            {dropdownFilter
              .sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
              })
              .map((filter, index) => {
                let countValue;
                if (isCount) {
                  countValue = count[filter];
                } else {
                  countValue = 0;
                }
                return (
                  <DropdownItem tag="span" className="text-left" key={index}>
                    <FilterButton
                      style={{ border: 'none' }}
                      key={index}
                      active={activeTab === filter}
                      count={countValue}
                      countError={error}
                      countLoading={loading}
                      data-tab-value={filter}
                      handleClick={handleProspectTabChange}
                      title={`${capitalize(filter)} Prospects`}
                      className={
                        activeTab === filter &&
                        'bg-color-primary-shade text-white'
                      }
                    >
                      {capitalize(filter)}
                    </FilterButton>
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </ButtonDropdown>
      </ButtonGroup>
    </div>
  );
};

const CadenceView = ({ match, location, history, getAllCadences }) => {
  const { data: configurationsData } = useConfigurations();
  const org = configurationsData?.configurations?.data[0];
  const { query: searchParams } = parseUrl(window.location.search);
  const prospectsListData = [];

  const [limit] = useState(
    searchParams['page[limit]'] ? parseInt(searchParams['page[limit]']) : 10
  );
  const [offset] = useState(
    searchParams['page[offset]'] ? parseInt(searchParams['page[offset]']) : 0
  );
  const [status] = useState(
    searchParams['filter[status]'] ? searchParams['filter[status]'] : ''
  );
  const [sharedType] = useState(searchParams['filter[sharedType]']);

  const prospectsFilterButtons = [
    'total',
    'active',
    'paused',
    'fall Through',
    'exited',
    'Attempted',
    'Interested',
    'Not Interested',
    'Bad Data',
    'Opt-out',
  ];
  const emailsFilterButtons = [
    'total',
    'active',
    'paused',
    'Sent',
    'Replied',
    'Bounced',
    'Opened',
    'Links Clicked',
    'Failed',
    'Opt-out',
  ];
  const callsFilterButtons = [
    'total',
    'active',
    'paused',
    'Left VM',
    'Meeting Scheduled',
    'Got Referral',
    'Not Interested',
    'Follow up',
    'Not a Decision Maker',
    'Call Issue',
    'Other',
  ];

  const {
    allCadencesData,
    cadence,
    origin,
    parentUserId,
    isPassedEmailTouch,
    cadenceName,
  } = location.state ? location.state : {};
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const { user, loading: userLoading } = useContext(UserContext);
  const userLicense = !userLoading && user.userLicense;
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';
  const zipwhipLicense =
    org && org.zipwhip
      ? isManagerUser || userLicense.includes('ZIPWHIP')
        ? user.zipwhipSessionKey
        : false
      : false;
  const currentUserId = userLoading ? 0 : user.id;

  const [selectedUser, setSelectedUser] = useState(
    searchParams['filter[user][id]']
      ? parseInt(searchParams['filter[user][id]'])
      : currentUserId
  );
  let teamUser = [];
  const [userIds, setUserIds] = useState(
    searchParams['filter[user][id]']
      ? parseInt(searchParams['filter[user][id]'])
      : currentUserId
  );

  const [userFilter, setUserFilter] = useState(
    'filter[user][id]=' + currentUserId
  );

  const cadenceId = match.params['id'];
  const [searchInput, setSearchInput] = useState('');
  const [touchCount, setTouchCount] = useState(
    location?.state?.touchcount
      ? parseInt(location.state.touchcount)
      : searchParams['not'] && parseInt(searchParams['not'])
  );

  const [prospectTab, setProspectTab] = useState(
    location?.state?.outcomeBucket
      ? location.state.outcomeBucket
      : searchParams['filter[outCome]']
      ? searchParams['filter[outCome]']
      : 'active'
  );

  const [emailTab, setEmailTab] = useState(
    location?.state?.outcomeBucket
      ? location.state.outcomeBucket
      : searchParams['filter[outCome]']
      ? searchParams['filter[outCome]']
      : 'active'
  );
  const [callTab, setCallTab] = useState(
    location?.state?.outcomeBucket
      ? location.state.outcomeBucket
      : searchParams['filter[outCome]']
      ? searchParams['filter[outCome]']
      : 'active'
  );
  const [restrictAssignProspectSave, setRestrictAssignProspectSave] = useState(
    false
  );
  const checkInactive =
    cadence && (cadence.status === 'INACTIVE' || cadence.status === 'PAUSED')
      ? true
      : false;

  const [emailFilter, setEmailFilter] = useState(
    `filter[user][id]=${userIds}&filter[cadence][id]=${cadenceId}&filter[type]=EMAIL`
  );
  const [callFilter, setCallFilter] = useState(
    `filter[user][id]=${userIds}&filter[cadence][id]=${cadenceId}&filter[type]=CALL`
  );
  const [touchFilter] = useState(
    `filter[user][id]=${userIds}&filter[cadence][id]=${cadenceId}`
  );
  const [isEmailTouches, setIsEmailTouches] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [allProspectsLimit] = useState(200);
  const [allProspectsOffset, setAllProspectsOffset] = useState(0);
  const [allProspects, setAllProspects] = useState([]);

  const [showEmailTouchModal, setShowEmailTouchModal] = useState(false);
  const [showCallTouchModal, setShowCallTouchModal] = useState(false);
  const [showLinkedinTouchModal, setShowLinkedinTouchModal] = useState(false);
  const [showOtherTouchModal, setShowOtherTouchModal] = useState(false);
  const [showTextTouchModal, setShowTextTouchModal] = useState(false);
  const [showAssignProspectsModal, setShowAssignProspectsModal] = useState(
    false
  );
  const [view, setView] = useState(false);
  const [expandAll, setExpandAll] = useState(false);
  const [isProspectsAssigned, setIsProspectsAssigned] = useState(false);
  const [searchKey, setSearchKey] = useState('');

  const sectionParams = match.params['section'];
  const [selectedSection] = useState(match.params['section'] || 'touches');
  // selecting imported components based on selectedSection (which is based on match.params)
  const SectionComponent = components[selectedSection];

  const handleSelectedUser = (data) => {
    setUserFilter('filter[user][id]=' + data);
  };

  const [
    getProspectsList,
    {
      loading: prospectLoading,
      error: prospectError,
      refetch: refetchProspects,
    },
  ] = useLazyQuery(FETCH_PROSPECTS_LIST, {
    variables: {
      prospectFilter: userFilter,
      limit: allProspectsLimit,
      offset: allProspectsOffset,
    },
    onCompleted: (data) => {
      setAllProspects([...allProspects, data.prospects.data]);

      if (
        (allProspectsOffset + 1) * allProspectsLimit <
        data.prospects.paging.totalCount
      ) {
        setAllProspectsOffset(allProspectsOffset + 1);
      }
    },
    notifyOnNetworkStatusChange: true,
  });

  const prospectsList = allProspects && allProspects;

  if (prospectsList) {
    for (let l = 0; l < prospectsList.length; l++) {
      for (let k = 0; k < prospectsList[l].length; k++) {
        if (prospectsList[l][k]['contactName']) {
          const temp = {
            text: prospectsList[l][k]['contactName'],
            value: prospectsList[l][k]['id'],
            active: false,
            emailId: prospectsList[l][k]['email'],
          };
          prospectsListData.push(temp);
        }
      }
    }
  }

  const { data: cadenceData } = useQuery(FETCH_CADENCE_QUERY, {
    variables: { id: cadenceId },
    notifyOnNetworkStatusChange: true,
    skip: selectedSection === 'touches',
  });

  const cadencesharedType = useMemo(
    () => cadenceData && cadenceData?.cadence?.data[0]?.sharedType,
    [cadenceData]
  );

  const cadencesharedUsers = useMemo(
    () => cadenceData && cadenceData?.cadence?.data[0]?.sharedUsers,
    [cadenceData]
  );

  const cadenceSharedTeams = useMemo(
    () => cadenceData && cadenceData?.cadence?.data[0]?.sharedGroups,
    [cadenceData]
  );

  const { data: assignedTeamsData } = useQuery(FETCH_ASSIGNED_TEAMS_QUERY, {
    variables: { limit: 200, offset: 0 },
    skip: !cadenceSharedTeams,
    fetchPolicy: 'cache-first',
  });
  const teamData = useMemo(
    () =>
      assignedTeamsData && assignedTeamsData.teams
        ? assignedTeamsData.teams.data
        : [],
    [assignedTeamsData]
  );

  if (cadenceSharedTeams) {
    const sharedTeam = teamData.filter((team) =>
      cadenceSharedTeams.includes(team.groupName)
    );
    teamUser = sharedTeam.map((team) => team.associations.user[0].id);
  }

  const {
    data: prospectsCount,
    loading: prospectsCountLoading,
    error: prospectsCountError,
    refetch: refetchProspectOutcomes,
  } = useQuery(FETCH_METRICS_QUERY, {
    variables: {
      id: cadenceId,
      userIDs: selectedUser.length > 0 ? `:[${selectedUser}]` : userIds,
      includeAssociationsQry: 'includeAssociations[]=outcome',
    },
    notifyOnNetworkStatusChange: true,
    skip: selectedSection !== 'prospect',
  });

  const prospectsFilterMetrics = useMemo(
    () =>
      prospectsCount &&
      prospectsCount.cadence &&
      prospectsCount.cadence.includedAssociations &&
      prospectsCount.cadence.includedAssociations.outcome &&
      prospectsCount.cadence.includedAssociations.outcome[0]
        ? prospectsCount.cadence.includedAssociations.outcome[0]
        : [],
    [prospectsCount]
  );

  if (prospectsFilterMetrics) {
    delete prospectsFilterMetrics['cadence'];
  }

  const {
    data: emailTouchesData,
    loading: emailTouchesLoading,
    error: emailTouchesError,
    refetch: refetchEmailOutcomes,
  } = useQuery(FETCH_OUTCOMES_QUERY, {
    variables: {
      touchFilter: emailFilter,
      fetchPolicy: 'cache-first',
      includeAssociationsQry: 'includeAssociations[]=emailTemplate',
    },
    notifyOnNetworkStatusChange: true,
    skip: selectedSection !== 'emails',
  });

  const {
    data: callTouchesData,
    loading: callTouchesLoading,
    error: callTouchesError,
    refetch: refetchCallOutcomes,
  } = useQuery(FETCH_OUTCOMES_QUERY, {
    variables: {
      touchFilter: callFilter,
      includeAssociationsQry: 'includeAssociations[]=emailTemplate',
    },
    notifyOnNetworkStatusChange: true,
    skip: selectedSection !== 'calls',
  });

  const emailData = useMemo(
    () =>
      emailTouchesData && emailTouchesData.Touches
        ? emailTouchesData.Touches.data[0]
          ? emailTouchesData.Touches.data[0].outComes
          : []
        : [],
    [emailTouchesData]
  );

  const callData = useMemo(
    () =>
      callTouchesData && callTouchesData.Touches
        ? callTouchesData.Touches.data[0]
          ? callTouchesData.Touches.data[0].outComes
          : []
        : [],
    [callTouchesData]
  );

  const {
    data: TouchesData,
    loading: touchesLoading,
    error: touchesError,
    refetch: refetchTouchCount,
  } = useQuery(FETCH_TOUCHES_QUERY, {
    variables: {
      touchFilter: touchFilter,
      includeAssociationsQry: 'includeAssociations[]=emailTemplate',
    },
    onCompleted: (data) => {
      if (data) {
        setEmailTemplates(data?.Touches?.includedAssociations?.emailtemplate);
        const totalTouches = data && data?.Touches?.paging?.totalCount;
        setTouchCount(totalTouches);
        if (totalTouches === 1) {
          getAllCadences(currentUserId, apiURL, token);
        }
        if (data && data?.Touches?.data) {
          const emailData = data.Touches.data.filter(
            (touch) =>
              touch.touchType === 'EMAIL' && touch.emailTouchType === 'New'
          );
          setIsEmailTouches(emailData);
        }
      }
    },
    notifyOnNetworkStatusChange: true,
    skip: selectedSection !== 'touches',
  });

  const TouchData = useMemo(
    () => (TouchesData && TouchesData.Touches ? TouchesData.Touches.data : []),
    [TouchesData]
  );
  const touchesCount = TouchData.length;

  const restrictAssignProspects = () => {
    let count = 0;
    TouchData &&
      TouchData.forEach((touch) => {
        if (
          touch.touchType === 'EMAIL' &&
          touch.associations.emailTemplate.length === 0
        ) {
          count = count + 1;
        }
      });
    if (count > 0) {
      setRestrictAssignProspectSave(true);
    } else {
      getProspectsList();
    }
  };

  const currentCadenceName = cadenceName
    ? cadenceName
    : searchParams['cadence[name]']
    ? searchParams['cadence[name]']
    : 'Cadence';

  const [
    addEmailTouch,
    { data: addEmailTouchData, loading: addEmailTouchLoading },
  ] = useLazyQuery(CREATE_TOUCH, {
    onCompleted: (response) => handleAddEmailTouchCallback(response, true),
    onError: (response) =>
      handleAddEmailTouchCallback(response, false, addEmailTouchData),
  });
  const [
    addCallTouch,
    { data: addCallTouchData, loading: addCallTouchLoading },
  ] = useLazyQuery(CREATE_OTHER_TOUCH, {
    onCompleted: (response) => handleAddCallTouchCallback(response, true),
    onError: (response) =>
      handleAddCallTouchCallback(response, false, addCallTouchData),
  });
  const [
    addOtherTouch,
    { data: addOtherTouchData, loading: addOtherTouchLoading },
  ] = useLazyQuery(CREATE_OTHER_TOUCH, {
    onCompleted: (response) =>
      handleAddOtherTouchRequestCallback(response, true),
    onError: (response) =>
      handleAddOtherTouchRequestCallback(response, false, addOtherTouchData),
  });
  const [
    addLinkedInTouch,
    { data: addLinkedInTouchData, loading: addLinkedInTouchLoading },
  ] = useLazyQuery(CREATE_OTHER_TOUCH, {
    onCompleted: (response) =>
      handleAddLinkedInTouchRequestCallback(response, true),
    onError: (response) =>
      handleAddLinkedInTouchRequestCallback(
        response,
        false,
        addLinkedInTouchData
      ),
  });
  const [
    addTextTouch,
    { data: addTextTouchData, loading: addTextTouchLoading },
  ] = useLazyQuery(CREATE_OTHER_TOUCH, {
    onCompleted: (response) =>
      handleAddTextTouchRequestCallback(response, true),
    onError: (response) =>
      handleAddTextTouchRequestCallback(response, false, addTextTouchData),
  });

  const [
    assignProspects,
    { data: assignProspectsData, loading: assignProspectsLoading },
  ] = useLazyQuery(ASSIGN_PROSPECTS_TO_CADENCE, {
    onCompleted: (response) =>
      handleAssignProspectsRequestCallback(response, true),
    onError: (response) =>
      handleAssignProspectsRequestCallback(
        response,
        false,
        assignProspectsData
      ),
  });

  const handleAddOtherTouchRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify(
        'Success! Social Touch has been created.',
        'success',
        'create_social_touch'
      );
      refetchTouchCount();
      setShowOtherTouchModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create this social Touch',
        errorData,
        'create_social_touch'
      );
    }
  };
  const handleAddLinkedInTouchRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify(
        'Success! LinkedIn Touch has been created.',
        'success',
        'create_linkedin_touch'
      );
      refetchTouchCount();
      setShowLinkedinTouchModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create this linkedin Touch',
        errorData,
        'create_linkedin_touch'
      );
    }
  };
  const handleAddTextTouchRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify(
        'Success! Text Touch has been created.',
        'success',
        'create_text_touch'
      );
      refetchTouchCount();
      setShowTextTouchModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create this text Touch',
        errorData,
        'create_text_touch'
      );
    }
  };
  const handleAddEmailTouchCallback = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify(
        'Success! Email Touch has been created.',
        'success',
        'create_email_touch'
      );
      refetchTouchCount();
      setShowEmailTouchModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create this email Touch',
        errorData,
        'create_email_touch'
      );
    }
  };
  const handleAddCallTouchCallback = (response, requestSuccess, errorData) => {
    if (requestSuccess) {
      notify(
        'Success! Call Touch has been created',
        'success',
        'create_call_touch'
      );
      refetchTouchCount();
      setShowCallTouchModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to create this call Touch',
        errorData,
        'create_call_touch'
      );
    }
  };

  const handleAssignProspectsRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      setShowAssignProspectsModal(false);
      const assignedCountList =
        response.AssignProspectsToCadence &&
        response.AssignProspectsToCadence.data &&
        response.AssignProspectsToCadence.data.filter(
          (item) => item.assigned === true
        );
      if (
        assignedCountList?.length ===
        response?.AssignProspectsToCadence?.data?.length
      ) {
        notify(
          'Success! Prospects have been assigned successfully.',
          'success',
          'assign_prospects_to_cadence'
        );
      } else {
        notify(
          `${assignedCountList?.length} out of ${response?.AssignProspectsToCadence?.data?.length} Prospects have been assigned`,
          'success',
          'assign_prospects_to_cadence'
        );
      }
      refetchTouchCount();
      setIsProspectsAssigned(!isProspectsAssigned);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to assign Prospects to this Cadence',
        errorData,
        'assign_prospects_to_cadence'
      );
    }
  };

  const handleCadenceSearch = (search) => {
    setSearchKey(search ? search : '');
    const searchValue = search?.trim();
    if (searchValue) {
      setSearchInput(searchValue);
    } else {
      setSearchInput('');
    }
  };

  const handleUserSearch = () => {
    setUserIds(selectedUser ? selectedUser : currentUserId);

    const searchString = Object.entries({
      ...query,
      'filter[user][id]': selectedUser ? selectedUser : currentUserId,
    })
      .map(([key, val]) => `${key}=${val}`)
      .join('&');

    window.history.replaceState({}, '', '?' + searchString);
    if (selectedSection === 'prospect') {
      refetchProspectOutcomes();
    } else if (selectedSection === 'emails') {
      setEmailFilter(
        `filter[user][id]=${
          selectedUser ? selectedUser : userIds
        }&filter[cadence][id]=${cadenceId}&filter[type]=EMAIL`
      );
    } else {
      setCallFilter(
        `filter[user][id]=${
          selectedUser ? selectedUser : userIds
        }&filter[cadence][id]=${cadenceId}&filter[type]=CALL`
      );
    }
  };
  const { query } = parseUrl(window.location.search);

  if (status) query['filter[status]'] = status;

  query['page[limit]'] = limit;
  query['page[offset]'] = offset;
  if (sharedType) query['filter[sharedType]'] = encodeURIComponent(sharedType);

  const searchString = Object.entries(query)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  useEffect(() => {
    handleUserSearch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const ModifiedcadenceName =
    currentCadenceName.length > 40
      ? `${currentCadenceName.slice(0, 40)}...`
      : currentCadenceName;

  const bucketName = capitalize(
    selectedSection === 'prospect'
      ? prospectTab
      : selectedSection === 'emails'
      ? emailTab
      : selectedSection === 'calls'
      ? callTab
      : ''
  );
  const modifiedBucketName = bucketName
    ? bucketName.length > 15
      ? `/ ${bucketName.slice(0, 15)}...`
      : `/ ${bucketName}`
    : '';

  const pageName = `${ModifiedcadenceName} / ${capitalize(
    sectionParams
  )} ${modifiedBucketName}`;

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);
  return (
    <ContentWrapper>
      <PageHeader
        icon="svgicon koncert-cadence-icon"
        title={currentCadenceName}
        pageName={pageName}
      >
        <div className="d-flex justify-content-end">
          {(selectedSection === 'prospect' ||
            selectedSection === 'emails' ||
            selectedSection === 'calls') && (
            <SearchBar
              clname="mr-2"
              searchInput={searchKey}
              onSearch={handleCadenceSearch}
              onChange={setSearchKey}
            />
          )}
          {selectedSection !== 'touches' && (
            <InputGroup hidden={!isManagerUser}>
              <div className="px-0 wd-md">
                <UserList
                  value={selectedUser}
                  placeHolder={'select User'}
                  disabled={isManagerUser ? false : true}
                  onChange={(value) => {
                    const errorMsg =
                      'User does not have permission to access this Cadence';
                    if (cadencesharedType === 'none') {
                      if (parseInt(value) === currentUserId) {
                        setSelectedUser(value);
                      } else {
                        notify(errorMsg, 'error', 'user_access');
                        return false;
                      }
                    } else if (cadencesharedType === 'shareWithUsers') {
                      if (
                        cadencesharedUsers.includes(value) ||
                        parseInt(value) === currentUserId
                      ) {
                        setSelectedUser(value);
                      } else {
                        notify(errorMsg, 'error', 'user_access');
                        return false;
                      }
                    } else if (cadencesharedType === 'specificGroupOfUsers') {
                      if (
                        teamUser.includes(value) ||
                        parseInt(value) === currentUserId
                      ) {
                        setSelectedUser(value);
                      } else {
                        notify(errorMsg, 'error', 'user_access');
                        return false;
                      }
                    } else {
                      setSelectedUser(value);
                    }
                  }}
                />
              </div>
            </InputGroup>
          )}

          <Link
            className="btn btn-secondary mx-2"
            to={{
              pathname: '/cadences/' + cadenceId,
              state: {
                pathName: location.pathname,
                search: searchString,
                editFlag: true,
                origin: origin,
                cadenceName: cadenceName,
                parentUserId: parentUserId,
              },
            }}
            title="Edit cadences"
          >
            <i className="fas fa-pencil-alt mr-2"></i>
            Edit
          </Link>
          <div className="d-flex">
            <ClButton
              icon="fa fas fa-user-plus"
              className="mr-2"
              title="Assign Prospects to cadence"
              disabled={checkInactive ? true : false}
              hidden={!(touchCount || touchesCount)}
              onClick={() => {
                if (!isPassedEmailTouch) {
                  restrictAssignProspects();
                }
                setShowAssignProspectsModal(true);
              }}
            >
              Assign Prospects
            </ClButton>
          </div>
        </div>
      </PageHeader>

      <Card className="card card-default">
        <CardBody>
          <Row>
            {/* main buttons start */}
            <Col lg={5} md={12}>
              <ButtonGroup>
                {sections.map((section, i) => {
                  const { query: searchParams } = parseUrl(
                    window.location.search
                  );
                  if (['Prospects', 'Emails', 'Calls'].includes(section.name)) {
                    searchParams['filter[outCome]'] = 'active';
                  } else {
                    delete searchParams['filter[outCome]'];
                  }
                  searchParams['not'] = parseInt(touchCount);
                  const searchString = Object.entries(searchParams)
                    .map(([key, val]) => `${key}=${val}`)
                    .join('&');

                  return (
                    // Route renders the appropriate component based on section.key
                    <Link
                      key={`tab_${i}`}
                      id={section.key}
                      className={
                        ' text-bold btn btn-secondary' +
                        (section.key === sectionParams
                          ? ' bg-color-primary-shade text-white active'
                          : '')
                      }
                      to={{
                        pathname:
                          '/cadences' +
                          '/' +
                          cadenceId +
                          '/' +
                          section.key +
                          '/view',
                        search: searchString,
                        state: {
                          allCadencesData: allCadencesData,
                          cadence: cadence,
                          touchcount:
                            location?.state?.touchcount || touchesCount,
                          cadenceName: location.state
                            ? location.state.cadenceName
                            : '',
                          cadenceId: cadenceId,
                          origin: origin,
                          cadenceListUserFilter:
                            location.state &&
                            location.state.cadenceListUserFilter,
                          parentUserId: parentUserId,
                        },
                      }}
                    >
                      <span className="">{section.name}</span>
                    </Link>
                  );
                })}
              </ButtonGroup>
            </Col>
            {/* main buttons end */}

            {/* filter buttons start */}
            <Col lg={7} md={12} className="pl-1">
              {selectedSection === 'touches' && (
                <div className="d-flex justify-content-end">
                  <p className="text-bold mr-4 pt-2">{`${touchesCount} Touches`}</p>
                  <Button
                    className="border rounded-0 px-4 bg-info-dark mr-2"
                    title="Add an email touch"
                    onClick={() => setShowEmailTouchModal(true)}
                  >
                    <i className="fa-2 fas fa-envelope"></i>
                  </Button>

                  <Button
                    className="border rounded-0 px-4 bg-success mr-2"
                    title="Add a call touch"
                    onClick={() => {
                      setShowCallTouchModal(true);
                    }}
                  >
                    <i className="fas fa-phone-alt"></i>
                  </Button>

                  <Button
                    className="rounded-0 px-4 border bg-social text-white mr-2"
                    title="Add a social touch"
                    onClick={() => setShowOtherTouchModal(true)}
                  >
                    <i className="fa fa-share-alt"></i>
                  </Button>

                  <Button
                    className="rounded-0 px-4 border bg-linkedin text-white"
                    title="Add a linkedin touch"
                    onClick={() => setShowLinkedinTouchModal(true)}
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </Button>
                  {zipwhipLicense && (
                    <Button
                      className="rounded-0 px-4 border bg-danger ml-2"
                      title="Add a text touch"
                      onClick={() => setShowTextTouchModal(true)}
                    >
                      <i className="far fa-comments"></i>
                    </Button>
                  )}
                </div>
              )}

              {selectedSection === 'overview' && (
                <div className="d-flex justify-content-end">
                  <Button
                    color="outline"
                    className="border rounded-0 px-4 mr-2"
                    title={expandAll ? 'Collapse All' : 'Expand All'}
                    onClick={() => setExpandAll(!expandAll)}
                  >
                    <i
                      className={
                        expandAll
                          ? 'fas fa-angle-double-up'
                          : 'fas fa-angle-double-down'
                      }
                    ></i>
                  </Button>
                  <Button
                    color="outline"
                    className="border rounded-0 px-4 mr-2"
                    title="Detailed View"
                    active={!view}
                    onClick={() => setView(false)}
                  >
                    <i className="fas fa-list"></i>
                  </Button>

                  <Button
                    color="outline"
                    className="border rounded-0 px-4"
                    title="Graphical view"
                    active={view}
                    onClick={() => setView(true)}
                  >
                    <i className="fas fa-chart-bar"></i>
                  </Button>
                </div>
              )}

              {selectedSection === 'prospect' && (
                <div className="float-right">
                  <FilterButtons
                    filterButtons={prospectsFilterButtons}
                    count={prospectsFilterMetrics && prospectsFilterMetrics}
                    loading={prospectsCountLoading}
                    error={prospectsCountError}
                    setProspectTab={setProspectTab}
                    tabName="prospects"
                    location={location}
                  />
                </div>
              )}
              {selectedSection === 'emails' && (
                <div className="float-right">
                  <FilterButtons
                    filterButtons={emailsFilterButtons}
                    count={emailData}
                    loading={emailTouchesLoading}
                    error={emailTouchesError}
                    setEmailTab={setEmailTab}
                    tabName="email"
                    location={location}
                  />
                </div>
              )}
              {selectedSection === 'calls' && (
                <div className="float-right">
                  <FilterButtons
                    filterButtons={callsFilterButtons}
                    count={callData}
                    loading={callTouchesLoading}
                    error={callTouchesError}
                    setCallTab={setCallTab}
                    tabName="call"
                    location={location}
                  />
                </div>
              )}
            </Col>
          </Row>
          {/* filter buttons end */}

          {/* route  start */}
          <Route
            id={selectedSection}
            key={selectedSection}
            path="/cadences/:id/:section/:view"
            render={(props) => (
              // SectionComponent is the respective imported component based on selectedSection (which is based on match.params)
              <SectionComponent
                key={`tab_${selectedSection}`}
                id={selectedSection}
                {...props}
                filters={
                  selectedSection === 'overview'
                    ? view
                    : selectedSection === 'prospect'
                    ? prospectTab
                    : selectedSection === 'emails'
                    ? emailTab
                    : callTab
                }
                expandAll={expandAll}
                searchInput={searchInput}
                userIds={userIds}
                refetchCount={
                  selectedSection === 'touches'
                    ? refetchTouchCount
                    : selectedSection === 'prospect'
                    ? refetchProspectOutcomes
                    : selectedSection === 'emails'
                    ? refetchEmailOutcomes
                    : refetchCallOutcomes
                }
                touchesData={TouchesData}
                isEmailTouches={isEmailTouches}
                emailTemplates={emailTemplates}
                refetchTouchesData={refetchTouchCount}
                touchesLoading={touchesLoading}
                touchesError={touchesError}
                tabName={selectedSection}
                isProspectsAssigned={isProspectsAssigned}
              />
            )}
          />
          {/* route end */}
        </CardBody>
      </Card>

      {/* modals */}
      {showEmailTouchModal && (
        <EmailTouchModal
          touchNumber={touchesCount + 1}
          showModal={showEmailTouchModal}
          currentUserId={currentUserId}
          userIds={userIds}
          cadenceId={cadenceId}
          currentCadence={cadence}
          loading={addEmailTouchLoading}
          isEmailTouches={isEmailTouches}
          emailTemplates={emailTemplates}
          handleAction={(data, ids, outcomes) => {
            const {
              timeToWaitAndExecute,
              timeToWaitUnit,
              emailTouchType,
              includeProspectResponseFlag,
              timeToComplete,
              timeToCompleteUnit,
              includeOptout,
              previewEmailFlag,
              scheduleType,
              scheduledDate,
              scheduleTime,
              moveProspectsWhenTimeExceeds,
              touchExecutionScheduleId,
              scheduledTimezone,
            } = data;
            let modifiedScheduledTime;

            if (scheduleTime) {
              modifiedScheduledTime = moment(
                `${scheduleTime}`,
                'HH:mm A'
              ).format('hh:mm A');
            }
            const templateIds =
              ids &&
              ids.map((id) => {
                return { id };
              });
            const input = {
              timeToWaitAndExecute: timeToWaitAndExecute
                ? timeToWaitAndExecute
                : 0,
              timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
              emailTemplate: templateIds,
              emailTouchType: emailTouchType,
              includeProspectResponseFlag: includeProspectResponseFlag
                ? includeProspectResponseFlag
                : false,
              previewEmailFlag: previewEmailFlag,
              includeOptout: includeOptout,
              touchType: 'Email',
              cadence: { id: cadenceId },
              scheduleType: scheduleType,
              schedule: { id: touchExecutionScheduleId },
              scheduledDateTime: scheduledDate + ' ' + modifiedScheduledTime,
              moveProspectsWhenTimeExceeds: moveProspectsWhenTimeExceeds
                ? moveProspectsWhenTimeExceeds
                : false,
              timeToComplete:
                previewEmailFlag === true ? timeToComplete : undefined,
              timeToCompleteUnit:
                previewEmailFlag === true ? timeToCompleteUnit : undefined,
              scheduledTimezone,
              stepNo: touchesCount + 1,
              workflow: outcomes,
            };
            addEmailTouch({
              variables: {
                input,
              },
            });
          }}
          hideModal={() => {
            setShowEmailTouchModal(false);
          }}
        />
      )}
      {showCallTouchModal && (
        <CallTouchModal
          userIds={userIds}
          cadenceId={cadenceId}
          touchNumber={touchesCount + 1}
          showModal={showCallTouchModal}
          currentUserId={currentUserId}
          currentCadence={cadence}
          loading={addCallTouchLoading}
          handleAction={(data, dialerValues, outcomes) => {
            const {
              timeToWaitAndExecute,
              timeToWaitUnit,
              timeToComplete,
              timeToCompleteUnit,
            } = data;

            const input = {
              productType: dialerValues.toString(),
              timeToWaitAndExecute: timeToWaitAndExecute
                ? timeToWaitAndExecute
                : 0,
              timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
              touchType: 'CALL',
              cadence: { id: cadenceId },
              timeToComplete: timeToComplete,
              timeToCompleteUnit: timeToCompleteUnit,
              stepNo: touchesCount + 1,
              workflow: outcomes,
            };
            addCallTouch({
              variables: {
                input,
              },
            });
          }}
          hideModal={() => {
            setShowCallTouchModal(false);
          }}
        />
      )}
      <OtherTouchModal
        showModal={showOtherTouchModal}
        touchNumber={touchesCount + 1}
        currentUserId={currentUserId}
        currentCadence={cadence}
        loading={addOtherTouchLoading}
        handleAction={(data) => {
          const {
            timeToWaitAndExecute,
            timeToWaitUnit,
            timeToComplete,
            timeToCompleteUnit,
            socialMediaType,
            description,
          } = data;

          const input = {
            timeToWaitAndExecute: timeToWaitAndExecute
              ? timeToWaitAndExecute
              : 0,
            timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
            touchType: 'others',
            cadence: { id: cadenceId },
            timeToComplete: timeToComplete,
            timeToCompleteUnit: timeToCompleteUnit,
            socialMediaType: socialMediaType,
            instructions: description,
            stepNo: touchesCount + 1,
          };
          addOtherTouch({
            variables: {
              input,
            },
          });
        }}
        hideModal={() => {
          setShowOtherTouchModal(false);
        }}
      />
      <LinkedInTouchModel
        showModal={showLinkedinTouchModal}
        currentUserId={currentUserId}
        touchNumber={touchesCount + 1}
        currentCadence={cadence}
        loading={addLinkedInTouchLoading}
        handleAction={(data) => {
          const {
            timeToWaitAndExecute,
            timeToWaitUnit,
            timeToComplete,
            timeToCompleteUnit,
            description,
            linkedInType,
          } = data;

          const input = {
            timeToWaitAndExecute: timeToWaitAndExecute
              ? timeToWaitAndExecute
              : 0,
            timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
            touchType: 'linkedin',
            cadence: { id: cadenceId },
            timeToComplete: timeToComplete,
            timeToCompleteUnit: timeToCompleteUnit,
            instructions: description,
            linkedInType: linkedInType,
            stepNo: touchesCount + 1,
          };
          addLinkedInTouch({
            variables: {
              input,
            },
          });
        }}
        hideModal={() => {
          setShowLinkedinTouchModal(false);
        }}
      />

      <TextTouchModel
        userIds={userIds}
        cadenceId={cadenceId}
        touchNumber={touchesCount + 1}
        showModal={showTextTouchModal}
        currentUserId={currentUserId}
        currentCadence={cadence}
        loading={addTextTouchLoading}
        handleAction={(data, outcomes) => {
          const {
            timeToWaitAndExecute,
            timeToWaitUnit,
            timeToComplete,
            timeToCompleteUnit,
          } = data;

          const input = {
            timeToWaitAndExecute: timeToWaitAndExecute
              ? timeToWaitAndExecute
              : 0,
            timeToWaitUnit: timeToWaitUnit ? timeToWaitUnit : 'Mi',
            touchType: 'TEXT',
            cadence: { id: cadenceId },
            timeToComplete: timeToComplete,
            timeToCompleteUnit: timeToCompleteUnit,
            stepNo: touchesCount + 1,
            workflow: outcomes,
          };
          addTextTouch({
            variables: {
              input,
            },
          });
        }}
        hideModal={() => {
          setShowTextTouchModal(false);
        }}
      />
      {showAssignProspectsModal && (
        <AssignProspectsModal
          showModal={showAssignProspectsModal}
          currentUserId={currentUserId}
          cadenceId={cadenceId}
          currentCadence={cadence}
          prospectLoading={prospectLoading}
          loading={assignProspectsLoading}
          error={prospectError}
          refetch={refetchProspects}
          cadenceName={ModifiedcadenceName}
          prospectData={prospectsListData}
          handleSelectedUser={handleSelectedUser}
          setAllProspects={setAllProspects}
          setAllProspectsOffset={setAllProspectsOffset}
          restrictAssignProspectSave={
            restrictAssignProspectSave || isPassedEmailTouch
          }
          handleAction={(selectedProspects, selectedUser) => {
            let input = {};
            if (isManagerUser && selectedUser !== currentUserId) {
              input = {
                user: {
                  id: selectedUser !== undefined ? selectedUser : undefined,
                },
              };
            }
            assignProspects({
              variables: {
                prospectsList: selectedProspects,
                cadenceId: cadenceId,
                input,
              },
            });
          }}
          hideModal={() => {
            setShowAssignProspectsModal(false);
          }}
        />
      )}
    </ContentWrapper>
  );
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, { getAllCadences })(
  withRouter(CadenceView)
);
