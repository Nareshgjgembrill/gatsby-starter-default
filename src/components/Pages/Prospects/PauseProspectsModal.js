/**
 * @author @Anbarasan.r
 * @version V11.0
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import moment from 'moment';
import { default as ClButton } from '../../Common/Button';

const PauseProspectsModal = ({
  hidePauseModal,
  showPauseModal,
  handlePauseProspect,
  showConfirmBtnSpinner,
  selectedUserName,
}) => {
  const pauseDateRef = useRef();
  const [error, setError] = useState();
  useEffect(() => {
    setError('');
  }, [showPauseModal]);

  const today = moment().format('YYYY-MM-DD');
  const handleSavePauseProspect = () => {
    if (pauseDateRef.current.value && pauseDateRef.current.value < today) {
      setError('Sorry! Invalid date selection');
    } else {
      handlePauseProspect(pauseDateRef.current.value);
    }
  };

  return (
    <Modal size="md" isOpen={showPauseModal} centered={true}>
      <ModalHeader toggle={hidePauseModal}>
        <i className="fas fa-pause text-primary mr-2"></i>Pause Prospect
      </ModalHeader>
      <ModalBody className="px-4 text-center">
        <Row>
          <Col className="mb-2">
            Are you sure you want to pause the activity of the selected
            prospect(s) in the cadence?
          </Col>
        </Row>
        {selectedUserName && (
          <Row>
            <Col>
              <span className="bg-color-yellow">
                Pause Prospect(s) on behalf of <b>{selectedUserName}</b>
              </span>
            </Col>
          </Row>
        )}
        <FormGroup row className="justify-content-center">
          <Label for="pasue_date" sm={4} className="pl-2 pr-0">
            Choose Resume Date
          </Label>
          <Col sm={6} className="pl-0">
            <Input
              type="date"
              name="pauseDate"
              id="pasue_date"
              min={today}
              innerRef={pauseDateRef}
              invalid={error ? true : false}
              max="9999-12-31"
            ></Input>
            <div className="invalid-feedback">{error}</div>
          </Col>
        </FormGroup>
      </ModalBody>
      <ModalFooter className="card-footer">
        <ClButton
          color="green"
          className="text-white"
          disabled={showConfirmBtnSpinner}
          icon={
            showConfirmBtnSpinner ? 'fas fa-spinner fa-spin' : 'fas fa-check'
          }
          title="Save Changes"
          onClick={handleSavePauseProspect}
        >
          {showConfirmBtnSpinner ? 'Wait' : 'Save'}
        </ClButton>
      </ModalFooter>
    </Modal>
  );
};

export default PauseProspectsModal;
