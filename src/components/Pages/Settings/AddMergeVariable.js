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
import CloseButton from '../../Common/CloseButton';
import Button from '../../Common/Button';

const AddMergeVariable = ({
  handleAction,
  hideModal,
  showModal,
  id,
  showActionBtnSpinner,
}) => {
  const mergeVariables = [
    {
      value: '{{Cadence Name}}',
      name: 'Cadence Name',
    },
    {
      value: '{{Touch #}}',
      name: 'Touch #',
    },
    {
      value: '{{Touch Type}}',
      name: 'Touch Type',
    },
    {
      value: '{{Outcome}}',
      name: 'Outcome',
    },
    {
      value: '{{Comments}}',
      name: 'Comments',
    },
    {
      value: '{{Call Duration}}',
      name: 'Call Duration',
    },
    {
      value: '{{Wrap Time}}',
      name: 'Wrap Time',
    },
    {
      value: '{{Caller ID}}',
      name: 'Caller ID',
    },
    {
      value: '{{CL Dialed Phone}}',
      name: 'CL Dialed Phone',
    },
    {
      value: '{{Call Recording Url}}',
      name: 'Call Recording Url',
    },
    {
      value: '{{Product Type}}',
      name: 'Product Type',
    },
    {
      value: '{{User Type}}',
      name: 'User Type',
    },
    {
      value: '{{VM Name}}',
      name: 'VM Name',
    },
    {
      value: '{{List Name}}',
      name: 'List Name',
    },
    {
      value: '{{Email Template Name}}',
      name: 'Email Template Name',
    },
    {
      value: '{{Email Template Subject}}',
      name: 'Email Template Subject',
    },
  ];

  const mergeVariablesDropdown = mergeVariables.map((mv) => {
    return (
      <option value={mv.value} key={mv.value}>
        {mv.name}
      </option>
    );
  });
  const formRef = useRef();
  const variableNameRef = useRef();
  const [formVariable, setFormVariable] = useState();

  const hasError = (inputName, method) => {
    return (
      formVariable &&
      formVariable.errors &&
      formVariable.errors[inputName] &&
      formVariable.errors[inputName][method]
    );
  };

  const handleModalClose = () => {
    setFormVariable();
  };

  const handleAddVariable = (e) => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['SELECT'].includes(i.nodeName)
    );

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormVariable({ ...formVariable, formName, errors });
    if (!hasError) {
      handleAction(variableNameRef.current.value, id);
    }
  };

  return (
    <Modal
      size="md"
      isOpen={showModal}
      centered={true}
      onClosed={handleModalClose}
    >
      <ModalHeader>Merge Variable</ModalHeader>
      <ModalBody>
        <Form name="addMergerVariable" innerRef={formRef}>
          <FormGroup row>
            <Label for="add_variable_name" sm={12} md={4}>
              Variable Name<span className="text-danger">*</span>
            </Label>
            <Col sm={12} md={8}>
              <Input
                type="select"
                name="variableName"
                id="add_variable_name"
                data-validate='["select"]'
                invalid={hasError('variableName', 'select')}
                innerRef={variableNameRef}
              >
                <option></option>
                {mergeVariablesDropdown}
              </Input>
              <div className="invalid-feedback">
                Please select merge variable
              </div>
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color="primary"
          onClick={handleAddVariable}
          disabled={showActionBtnSpinner}
          icon={showActionBtnSpinner ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
        >
          {showActionBtnSpinner ? 'Wait...' : 'Save'}
        </Button>
        <CloseButton onClick={hideModal} />
      </ModalFooter>
    </Modal>
  );
};
AddMergeVariable.propTypes = {
  handleAction: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
};

export default AddMergeVariable;
