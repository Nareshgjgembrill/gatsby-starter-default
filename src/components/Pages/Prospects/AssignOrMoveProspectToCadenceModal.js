/**
 * @author @anbarasan.r
 * @version V11.0
 */
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  Button,
  Col,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { getAllCadences } from '../../../store/actions/actions';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import DropDown from '../../Common/DropDown';
const initialHasError = {
  cadenceId: '',
  cadenceError: '',
};
const AssignOrMoveProspectToCadenceModal = ({
  actionBtnIcon,
  actionBtnText,
  cadences,
  currentUserId,
  getAllCadences,
  handleAction,
  handleShowHideModal,
  modalHeader,
  showActionBtnSpinner,
  showModal,
  selectedRowCount,
  selectedUserName,
  isUserChanged,
  handleActionResetUserChange,
  currentCadenceId,
  showCurrentCadence,
}) => {
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const [alertShow, setAlertShow] = useState(false);
  const [alertMessage] = useState();
  const [cadenceId, setCadenceId] = useState();
  const [cadenceName, setCadenceName] = useState('');
  const [cadenceList, setCadenceList] = useState([]);
  const [hasError, setHasError] = useState(initialHasError);
  const invalidStyle = {
    width: '100%',
    marginTop: '0.25rem',
    fontSize: '80%',
    color: '#f05050',
  };

  const handleFetchCadences = () => {
    getAllCadences(currentUserId, apiURL, token);
  };

  useEffect(() => {
    if (!cadences.fetchedAll || isUserChanged) {
      handleFetchCadences();
    }
    if (isUserChanged) {
      handleActionResetUserChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cadences && !cadences.loading) {
      const cadenceData = showCurrentCadence
        ? cadences?.data
            .filter(
              (cad) =>
                (cad.status === 'ACTIVE' || cad.status === 'NEW') &&
                cad?.associations?.touch?.length > 0 &&
                cad.id === currentCadenceId &&
                cad.associations.user[0].id === currentUserId
            )
            .map((item, index) => {
              return {
                text: item.name,
                value: item.id,
                active: false,
                header: index === 0 ? 'Current Cadence' : '',
              };
            })
        : [];

      cadences &&
        cadences.data &&
        cadences.data
          .filter(
            (cad) =>
              (cad.status === 'ACTIVE' || cad.status === 'NEW') &&
              cad.associations &&
              cad.associations.touch &&
              cad.associations.touch.length > 0 &&
              cad.id !== currentCadenceId &&
              cad.associations.user[0].id === currentUserId
          )
          .forEach((item, index) => {
            cadenceData.push({
              text: item.name,
              value: item.id,
              active: false,
              header: index === 0 ? 'My Cadences' : '',
            });
          });

      cadences &&
        cadences.data &&
        cadences.data
          .filter(
            (cad) =>
              (cad.status === 'ACTIVE' || cad.status === 'NEW') &&
              cad.associations &&
              cad.associations.touch &&
              cad.associations.touch.length > 0 &&
              cad.id !== currentCadenceId &&
              cad.associations.user &&
              cad.associations.user[0].id !== currentUserId
          )
          .forEach((item, index) => {
            cadenceData.push({
              text: item.name,
              value: item.id,
              active: false,
              header: index === 0 ? 'Shared Cadences' : '',
            });
          });

      setCadenceList(cadenceData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadences, currentCadenceId]);

  useEffect(
    () => {
      setCadenceId('');
      setCadenceName('');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showModal]
  );

  // Reset Modal
  const handleModalClose = () => {
    setAlertShow(false);
  };

  const handleProspectToCadenceAction = () => {
    /* ----- Validate from fields -begin ----- */
    const hasErrorJson = JSON.parse(JSON.stringify(initialHasError));
    if (cadenceId === null || cadenceId === undefined || cadenceId === '') {
      hasErrorJson['cadenceError'] =
        actionBtnText === 'Move'
          ? 'Please select cadence to move.'
          : 'Please select cadence to assign.';
      setHasError(hasErrorJson);
      return false;
    }

    handleAction(cadenceId, cadenceName);
  };

  return (
    <Modal
      size="md"
      className="container-sm"
      isOpen={showModal}
      centered={true}
      onClosed={handleModalClose}
    >
      <ModalHeader toggle={handleShowHideModal}>
        <i className={`${actionBtnIcon} mr-2`} /> {modalHeader}
      </ModalHeader>
      <ModalBody className="text-center">
        <Form name="assignProspectToCadence">
          <div className="text-center">
            {actionBtnText === 'Start Cadence' && (
              <p>
                You have selected{' '}
                <b>
                  {selectedRowCount === 0
                    ? selectedRowCount + 1
                    : selectedRowCount}
                </b>{' '}
                Prospect(s) to assign to a Cadence.
              </p>
            )}
            <p className="mb-2 text-nowrap">
              Choose the Cadence to which the selected prospect(s) need to be
              {actionBtnText === 'Move' ? ' Moved.' : ' Assigned.'}
            </p>
            {selectedUserName && (
              <p className="mb-2">
                <span className="bg-color-yellow">
                  {actionBtnText === 'Move' ? ' Move ' : ' Assign '}
                  Prospect(s) on behalf of <b>{selectedUserName}</b>
                </span>
              </p>
            )}
          </div>

          <FormGroup row className="mt-1 mb-0">
            <Label
              for="assign_prospect_to_cadence"
              sm={3}
              className="text-right pr-0"
            >
              Cadence<span className="text-danger">*</span>
            </Label>
            <Col sm={8}>
              <div className="wd-lg">
                <DropDown
                  value={cadenceId}
                  data={cadenceList}
                  name="cadence"
                  placeHolder=""
                  onChange={(value, label) => {
                    setCadenceId(value);
                    setCadenceName(label);
                  }}
                  loading={cadences.loading}
                  handleRefresh={handleFetchCadences}
                  onKeyDown={handleProspectToCadenceAction}
                />
              </div>
            </Col>
          </FormGroup>
          <div>
            <p className="pr-5 mr-4">
              <span style={invalidStyle}>
                {hasError.cadenceError ? hasError.cadenceError : null}
              </span>
            </p>
          </div>
        </Form>
        <Row>
          {alertShow && (
            <Col>
              <Alert color="success" className="text-center mb-0">
                {alertMessage}
              </Alert>
            </Col>
          )}
        </Row>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color="green"
          className="text-white"
          onClick={handleProspectToCadenceAction}
          disabled={showActionBtnSpinner}
        >
          <i
            className={
              (showActionBtnSpinner
                ? 'fas fa-spinner fa-spin'
                : actionBtnIcon) + ' text-white mr-2'
            }
          />
          {showActionBtnSpinner ? 'Wait...' : actionBtnText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// This is required for redux
const mapStateToProps = (state) => ({
  cadences: state.cadences,
});

AssignOrMoveProspectToCadenceModal.propTypes = {
  actionBtnIcon: PropTypes.string.isRequired,
  actionBtnText: PropTypes.oneOf(['Assign', 'Move', 'Start Cadence']),
  currentUserId: PropTypes.number.isRequired,
  handleShowHideModal: PropTypes.func.isRequired,
  handleAction: PropTypes.func.isRequired,
  modalHeader: PropTypes.oneOf([
    'Assign Prospect to Cadence',
    'Move Prospect to Cadence',
    'Move to Another Cadence',
    'Assign to a Cadence',
  ]),
  prospect: PropTypes.object.isRequired,
  showActionBtnSpinner: PropTypes.bool.isRequired,
  showModal: PropTypes.bool.isRequired,
};

// To prevent re-render of this component if parent state which are not related to this component chagnes

// This is required for redux
export default connect(mapStateToProps, { getAllCadences })(
  AssignOrMoveProspectToCadenceModal
);
