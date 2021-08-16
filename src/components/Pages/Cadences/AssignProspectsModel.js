import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Col,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
} from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import UserList from '../../Common/UserList';
import DropDown from '../../Common/DropDown';
import ClButton from '../../Common/Button';
import UserContext from '../../UserContext';
import {
  FETCH_CADENCE_QUERY,
  FETCH_ASSIGNED_TEAMS_QUERY,
} from '../../queries/CadenceQuery';

const AssignProspectsModal = ({
  showModal,
  hideModal,
  handleSelectedUser,
  handleAction,
  prospectLoading,
  loading,
  error,
  refetch,
  cadenceName,
  prospectData,
  currentUserId,
  cadenceId,
  setAllProspects,
  setAllProspectsOffset,
  restrictAssignProspectSave,
}) => {
  const [selectedProspects, setSelectedProspects] = useState([]);

  const [validationState, setValidationState] = useState(false);
  const { user, loading: userLoading } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState(currentUserId);
  const isManagerUser = !userLoading && user && user.isManagerUser === 'Y';
  const teamUser = [];

  const { data: cadenceData } = useQuery(FETCH_CADENCE_QUERY, {
    variables: { id: cadenceId },
    notifyOnNetworkStatusChange: true,
    skip: restrictAssignProspectSave,
  });

  const cadencesharedType = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].sharedType,
    [cadenceData]
  );

  const cadencesharedUsers = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].sharedUsers,
    [cadenceData]
  );

  const cadenceSharedTeams = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].sharedGroups,
    [cadenceData]
  );

  const cadenceOwnerId = useMemo(
    () =>
      cadenceData &&
      cadenceData.cadence &&
      cadenceData.cadence.data &&
      cadenceData.cadence.data[0].associations &&
      cadenceData.cadence.data[0].associations.user &&
      cadenceData.cadence.data[0].associations.user[0] &&
      cadenceData.cadence.data[0].associations.user[0].id,

    [cadenceData]
  );

  const { data: assignedTeamsData } = useQuery(FETCH_ASSIGNED_TEAMS_QUERY, {
    variables: { limit: 200, offset: 0 },
    skip: !cadenceSharedTeams,
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
    sharedTeam.forEach((team) => {
      teamUser.push(team.associations.user[0].id);
    });
    teamUser.push(currentUserId);
  }

  if (cadencesharedUsers) {
    cadencesharedUsers.push(currentUserId);
  }

  useEffect(() => {
    handleSelectedUser(
      cadencesharedType === 'none' ? cadenceOwnerId : selectedUser
    );
    setSelectedProspects([]);
    setValidationState(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, cadenceOwnerId]);

  const onSubmit = () => {
    if (selectedProspects.length === 0) {
      setValidationState(true);
    } else {
      setValidationState(false);
      handleAction(
        selectedProspects.toString(),
        cadencesharedType === 'none' ? cadenceOwnerId : selectedUser
      );
      setSelectedProspects([]);
    }
  };

  return (
    <Modal size="md" isOpen={showModal} centered>
      {/* ModalHeader component is replaced with the below code to make the text-truncate class work properly */}
      <div className="modal-header">
        <h5 className="modal-title text-truncate">
          <i className="fa fas fa-user-plus text-warning mr-2"></i>
          Assign Prospects to Cadence (
          {<span title={cadenceName}>{cadenceName}</span>})
        </h5>
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={() => {
            hideModal();
            setAllProspects([]);
            setAllProspectsOffset(0);
          }}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      {restrictAssignProspectSave && (
        <ModalBody>
          <p className="text-danger">
            Prospect(s) cannot be assigned to this cadence as there is no email
            template selected or Email schedule has passed out in one of the
            email touches. Please update your cadence and try again.
          </p>
        </ModalBody>
      )}
      {!restrictAssignProspectSave && (
        <>
          <ModalBody className="px-4 text-center">
            <FormGroup row className="d-flex align-items-center">
              <Label for="select_user" md={3} className="pr-0">
                User
              </Label>
              <Col md={8} className="pl-0 d-flex justify-content-start">
                <UserList
                  id="select_user"
                  value={
                    cadencesharedType === 'none' ? cadenceOwnerId : selectedUser
                  }
                  placeHolder={'Select User'}
                  disabled={
                    isManagerUser && cadencesharedType !== 'none' ? false : true
                  }
                  handleFilter={(value) => {
                    if (cadencesharedType === 'shareWithUsers') {
                      return cadencesharedUsers.includes(value.value);
                    } else if (cadencesharedType === 'specificGroupOfUsers') {
                      return teamUser.includes(value.value);
                    } else {
                      return value.value;
                    }
                  }}
                  onChange={(value) => {
                    setSelectedUser(value);
                    setAllProspects([]);
                    setAllProspectsOffset(0);
                  }}
                />
              </Col>
            </FormGroup>
            <FormGroup row className="d-flex align-items-center mb-2">
              <Label for="select_prospects" md={3} className="pr-0">
                Prospects
              </Label>
              <Col md={8} className="pl-0 d-flex justify-content-start">
                <DropDown
                  id="select_prospects"
                  name="prospects"
                  data={prospectData}
                  value={selectedProspects}
                  placeHolder={'Select Prospects'}
                  loading={!prospectData.length > 0 && prospectLoading}
                  error={error}
                  handleRefresh={() => {
                    setAllProspects([]);
                    refetch();
                  }}
                  multiselect
                  onChange={(value) => {
                    setSelectedProspects(value);
                  }}
                />
              </Col>
            </FormGroup>
            <div>
              <p
                className="text-danger text-sm pr-5 mr-5"
                hidden={validationState ? false : true}
              >
                Please select the prospects
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="card-footer">
            <ClButton
              type="submit"
              color="success"
              className="text-white"
              icon={loading ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
              disabled={restrictAssignProspectSave ? true : false}
              title={
                restrictAssignProspectSave
                  ? 'One of the email touch in this cadence has no templates.'
                  : 'Save'
              }
              onClick={onSubmit}
            >
              {loading ? 'Wait...' : 'Save'}
            </ClButton>
          </ModalFooter>
        </>
      )}
    </Modal>
  );
};
export default AssignProspectsModal;
