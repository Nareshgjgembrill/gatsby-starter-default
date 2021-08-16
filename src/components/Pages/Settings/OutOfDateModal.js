/*
 * @author @rManimegalai
 * @version V11.0
 */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { FormValidator } from '@nextaction/components';
import Button from '../../Common/Button';

const OutOfDateModal = ({
  handleAction,
  hideModal,
  showModal,
  showActionBtnSpinner,
}) => {
  const formRef = useRef();
  const outDateRef = useRef();
  const [startDateError, setStartDateError] = useState(false);
  const [formDate, setFormDate] = useState();
  const minDate = new Date().toISOString().split('T')[0];
  const hasError = (inputName, method) => {
    return (
      formDate &&
      formDate.errors &&
      formDate.errors[inputName] &&
      formDate.errors[inputName][method]
    );
  };

  const handleModalClose = () => {
    setStartDateError(false);
    setFormDate();
  };

  const handleAddDate = (e) => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT'].includes(i.nodeName)
    );

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormDate({ ...formDate, formName, errors });

    if (!hasError) {
      const datesData = [...form.elements].reduce((date, item) => {
        if (item.value.trim() !== '') {
          if (item.name === 'startDate') {
            date['startDate'] = item.value;
          } else if (item.name === 'endDate') {
            date['endDate'] = item.value;
          }
          date[item.name] = item.value;
        }
        return date;
      }, {});

      if (datesData.startDate > datesData.endDate) {
        setStartDateError(true);
        return false;
      }
      handleAction(datesData);
    }
  };

  return (
    <Modal
      size="md"
      isOpen={showModal}
      centered={true}
      onClosed={handleModalClose}
    >
      <ModalHeader toggle={hideModal}>Confirm Out Of Office Dates</ModalHeader>
      <ModalBody>
        <Form name="addDate" innerRef={formRef}>
          <FormGroup row>
            <Label for="start_date" sm={12} lg={3}>
              Start Date<span className="text-danger">*</span>
            </Label>
            <Col sm={12} lg={9}>
              <Input
                type="date"
                name="startDate"
                id="start_date"
                data-validate='["required"]'
                invalid={hasError('startDate', 'required') || startDateError}
                innerRef={outDateRef}
                min={minDate}
                className="pr-2"
              ></Input>
              <div className="invalid-feedback">
                {startDateError
                  ? 'Start date cannot be greater than end date'
                  : 'Please select the start date'}
              </div>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="end_date" sm={12} lg={3}>
              End Date<span className="text-danger">*</span>
            </Label>
            <Col sm={12} lg={9}>
              <Input
                type="date"
                name="endDate"
                id="end_date"
                data-validate='["required"]'
                invalid={hasError('endDate', 'required') || startDateError}
                innerRef={outDateRef}
                min={minDate}
                className="pr-2"
              ></Input>
              <div className="invalid-feedback">
                {startDateError
                  ? 'End date cannot be less than start date'
                  : 'Please select the end date'}
              </div>
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color="primary"
          disabled={showActionBtnSpinner}
          onClick={(e) => {
            handleAddDate(e);
          }}
          icon={showActionBtnSpinner ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
        >
          {showActionBtnSpinner ? 'Wait...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

OutOfDateModal.propTypes = {
  handleAction: PropTypes.func.isRequired,
  showActionBtnSpinner: PropTypes.bool.isRequired,
  showModal: PropTypes.bool.isRequired,
};

export default OutOfDateModal;
