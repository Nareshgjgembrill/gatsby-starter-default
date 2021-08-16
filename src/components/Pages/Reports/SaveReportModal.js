import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
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
import CloseButton from '../../Common/CloseButton';
import { FormValidator } from '@nextaction/components';
import Button from '../../Common/Button';

const SaveReportModal = ({
  hideModal,
  showModal,
  showActionBtnSpinner,
  title,
  handleSave,
  reportName,
  action,
}) => {
  const [formTag, setFormTag] = useState();
  const [maxLengthError, setMaxLengthError] = useState(false);
  const [reportNameInput, setReportNameInput] = useState(reportName);
  const formRef = useRef();

  React.useEffect(() => {
    setReportNameInput(reportName);
  }, [reportName]);

  const hasError = (inputName, method) => {
    return (
      formTag &&
      formTag.errors &&
      formTag.errors[inputName] &&
      formTag.errors[inputName][method]
    );
  };

  const handleModalClose = () => {
    setFormTag();
  };

  const handleSaveReport = (e) => {
    setMaxLengthError(false);
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT'].includes(i.nodeName)
    );

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormTag({ ...formTag, formName, errors });
    if (!hasError) {
      const name = reportNameInput;
      if (name.length > 100) {
        setMaxLengthError(true);
      } else {
        handleSave(name, action);
      }
    }
  };

  return (
    <Modal isOpen={showModal} centered={true} onClosed={handleModalClose}>
      <ModalHeader className="text-header pb-0" toggle={hideModal}>
        {title}
      </ModalHeader>
      <ModalBody>
        <Form name="saveReport" innerRef={formRef}>
          <FormGroup row>
            <Label for="report_name" sm={3}>
              Report name<span className="text-danger">*</span>
            </Label>
            <Col sm={12}>
              <Input
                type="text"
                name="report_name"
                value={reportNameInput}
                onChange={(e) => {
                  setReportNameInput(e.currentTarget.value);
                }}
                id="report_name"
                data-validate='["required"]'
                invalid={hasError('report_name', 'required')}
              ></Input>
              <div className="invalid-feedback">Report name is mandatory</div>
              {maxLengthError && (
                <div className="text-danger">
                  Sorry! Report name cannot exceed 100 characters
                </div>
              )}
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          title="Save"
          onClick={handleSaveReport}
          disabled={showActionBtnSpinner}
          icon={showActionBtnSpinner ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
        >
          {showActionBtnSpinner ? 'Wait...' : 'Save'}
        </Button>
        <CloseButton title="Close" onClick={hideModal} />
      </ModalFooter>
    </Modal>
  );
};
SaveReportModal.propTypes = {
  handleSave: PropTypes.func.isRequired,
  showActionBtnSpinner: PropTypes.bool.isRequired,
  showModal: PropTypes.bool.isRequired,
  title: PropTypes.string,
};

export default SaveReportModal;
