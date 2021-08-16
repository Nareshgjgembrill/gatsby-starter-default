import React, { useEffect } from 'react';
import {
  Alert,
  CardBody,
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
import { useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import ClButton from '../../Common/Button';

const CloneModal = ({
  showModal,
  hideModal,
  handleAction,
  alternativeEmailId,
  accountLoading,
  accountError,
}) => {
  const { handleSubmit, register, errors, reset } = useForm();
  useEffect(() => {
    if (alternativeEmailId) {
      reset({ emailId: alternativeEmailId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alternativeEmailId]);

  const onSubmit = (data) => {
    handleAction(data);
  };

  return (
    <Modal size="md" isOpen={showModal} centered>
      <Form name="cloneModal" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={hideModal}>
          <i className="fas fa-envelope text-email mr-2"></i>
          {'Alternate Email - Send Test Email'}{' '}
          {accountLoading && (
            <i className="fas fa-spinner fa-spin ml-2" title="Loading" />
          )}
        </ModalHeader>
        <ModalBody>
          {accountError && (
            <CardBody>
              <Alert color="danger" className="text-center mb-0">
                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                Failed to fetch data
              </Alert>
            </CardBody>
          )}
          {!accountLoading && !accountError && (
            <FormGroup row className="px-2 justify-content-center">
              <Label for="email_id" sm={3} className="pr-0">
                Email
              </Label>

              <Col sm={9}>
                <Input
                  type="email"
                  name="emailId"
                  id="email_id"
                  invalid={errors.emailId}
                  innerRef={register({
                    validate: {
                      spaceValidation: (value) => {
                        return !!value.trim();
                      },
                    },
                    required: 'Please enter the valid Email Address',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter the valid Email Address',
                    },
                  })}
                ></Input>
                <ErrorMessage
                  message={
                    errors.emailId?.type === 'spaceValidation' &&
                    'Please enter valid Email Address'
                  }
                  errors={errors}
                  name="emailId"
                  className="invalid-feedback"
                  as="p"
                />
              </Col>
            </FormGroup>
          )}
        </ModalBody>
        <ModalFooter className="card-footer">
          <ClButton
            type="submit"
            title="Change Email"
            color="primary"
            icon={'fa fa-check'}
          >
            Change Email
          </ClButton>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
export default CloneModal;
