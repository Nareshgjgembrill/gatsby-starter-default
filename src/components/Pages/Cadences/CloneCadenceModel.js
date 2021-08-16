import React, { useEffect } from 'react';
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
  Row,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import ClButton from '../../Common/Button';

const CloneCadenceModel = ({
  showModal,
  hideModal,
  handleAction,
  Loading,
  cadenceName,
  sampleCadenceClone,
}) => {
  const { handleSubmit, register, errors, reset } = useForm();

  useEffect(() => {
    if (sampleCadenceClone) {
      reset({ cloneCadenceName: cadenceName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadenceName]);

  const onSubmit = (data) => {
    handleAction(data);
  };

  return (
    <Modal size="lg" isOpen={showModal} centered className="container-md">
      <Form name="assignProspects" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader toggle={hideModal}>
          <i className="fas fa-clone fa-lg text-blue"></i>
          <span className="ml-2">{`Clone Cadence - ${cadenceName}`}</span>
        </ModalHeader>
        <ModalBody>
          <FormGroup row className="px-2 justify-content-center">
            <Label for="clone_cadence_name" sm={3} className="pr-0">
              Cadence Name
            </Label>
            <Col sm={5} className="ml-n5">
              <Input
                type="text"
                name="cloneCadenceName"
                id="clone_cadence_name"
                invalid={errors.cloneCadenceName}
                innerRef={register({
                  validate: {
                    spaceValidation: (value) => {
                      return !!value.trim();
                    },
                  },
                  required: 'Please enter the cadence name',
                })}
              ></Input>
              <ErrorMessage
                message={
                  errors.cloneCadenceName?.type === 'spaceValidation' &&
                  'Please enter the valid name'
                }
                errors={errors}
                name="cloneCadenceName"
                className="invalid-feedback"
                as="p"
              />
            </Col>
          </FormGroup>

          <Row className="px-2">
            <Col className="d-flex justify-content-center">
              <p>
                <span className="text-bold mr-2">Note:</span>
                All the touches and email templates in this cadence will be
                added to this cloned cadence
              </p>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="card-footer">
          <ClButton
            type="submit"
            title={'Clone'}
            color="primary"
            disabled={Loading}
            icon={Loading ? 'fas fa-spinner fa-spin' : 'fas fa-clone'}
          >
            {Loading ? 'Wait...' : 'Clone'}
          </ClButton>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
export default CloneCadenceModel;
