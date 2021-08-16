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

const OtherTouchModal = ({
  showModal,
  hideModal,
  handleAction,
  loading,
  getTouchLoading,
  getTouchError,
  editFlag,
  editData,
  editRestrict,
  touchNumber,
  touchData,
}) => {
  const formRef = React.useRef();
  const { handleSubmit, register, errors, reset } = useForm();
  const editState = editFlag ? true : false;
  let otherTouchDataEdit;

  const onSubmit = (data) => {
    handleAction(data);
  };

  const getSocialMediaType = (socialMediaType) => {
    let typeNo;
    if (socialMediaType === 'Others-Google') typeNo = 1;
    else if (socialMediaType === 'Others-Twitter') typeNo = 3;
    else if (socialMediaType === 'Others-Zoominfo') typeNo = 6;
    else if (socialMediaType === 'Others-Custom') typeNo = 7;

    return typeNo;
  };

  useEffect(() => {
    if (editFlag) {
      // eslint-disable-next-line array-callback-return
      editData.map((edit) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        otherTouchDataEdit = {
          socialMediaType: getSocialMediaType(edit.subTouch),
          description: edit.instructions,
          timeToWaitAndExecute: edit.waitPeriodBeforeStart,
          timeToWaitUnit: edit.waitPeriodUnit,
          timeToComplete: edit.timeToComplete,
          timeToCompleteUnit: edit.timeToCompleteUnit,
        };
      });
      reset(otherTouchDataEdit);
    }
  }, [editData]);

  return (
    <Modal size="lg" isOpen={showModal} centered>
      <Form
        name="addOtherTouch"
        onSubmit={handleSubmit(onSubmit)}
        innerRef={formRef}
      >
        <ModalHeader toggle={hideModal}>
          <i className="fa fa-share-alt mr-2 text-social"></i>
          {`${editState ? 'Edit' : 'Add'} Social Touch - #${touchNumber}`}
          {getTouchLoading && (
            <i className="fas fa-spinner fa-spin ml-2" title="Loading" />
          )}
        </ModalHeader>
        <ModalBody className="px-5">
          {getTouchError && (
            <Row className="py-2 bg-gray-lighter">
              <Col className="text-center">
                <h6 className="text-danger mb-0">
                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                  Failed to fetch data
                </h6>
                {touchData?.requestId && (
                  <>
                    <br />
                    <span className="text-danger text-sm">{`RequestId: ${touchData?.requestId}`}</span>
                  </>
                )}
              </Col>
            </Row>
          )}
          {!getTouchLoading && !getTouchError && (
            <div className="px-4">
              <Label for="social_media_type" className="text-bold mb-1">
                Choose Network{' '}
              </Label>

              <FormGroup>
                <Input
                  type="select"
                  name="socialMediaType"
                  id="social_media_type"
                  invalid={errors.socialMediaType}
                  innerRef={register({
                    required: 'Please Select Network Type',
                  })}
                >
                  <option></option>
                  <option value="1">Google</option>
                  <option value="3">Twitter</option>
                  <option value="6">Zoominfo</option>
                  <option value="7">Custom</option>
                </Input>
                <ErrorMessage
                  errors={errors}
                  name="socialMediaType"
                  className="invalid-feedback"
                  as="p"
                ></ErrorMessage>
              </FormGroup>

              <Label for="description" className="text-bold mb-1">
                Description
              </Label>

              <FormGroup>
                <Input
                  type="textarea"
                  name="description"
                  id="description"
                  maxLength="2999"
                  invalid={errors.description}
                  placeholder="Please Enter Description"
                  innerRef={register}
                ></Input>
              </FormGroup>

              <Label for="time_to_wait_and_execute" className="text-bold mb-1">
                Time to wait and Execute
              </Label>
              <Row>
                <Col md={7}>
                  <FormGroup>
                    <Input
                      type="number"
                      min="0"
                      maxLength="6"
                      onInput={(e) => {
                        if (e.target.value.length > e.target.maxLength) {
                          e.target.value = e.target.value.slice(
                            0,
                            e.target.maxLength
                          );
                        }
                      }}
                      name="timeToWaitAndExecute"
                      id="time_to_wait_and_execute"
                      invalid={errors.timeToWaitAndExecute}
                      step="1"
                      innerRef={register({
                        required: editFlag
                          ? 'Required Time to wait and execute'
                          : false,
                      })}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="timeToWaitAndExecute"
                      className="invalid-feedback"
                      as="p"
                    ></ErrorMessage>
                  </FormGroup>
                </Col>
                <Col md={5}>
                  <FormGroup>
                    <Input
                      type="select"
                      name="timeToWaitUnit"
                      invalid={errors.timeToWaitUnit}
                      innerRef={register({
                        required: editFlag ? 'Time unit is required' : false,
                      })}
                    >
                      <option></option>
                      <option value="Mi">Minute(s)</option>
                      <option value="Ho">Hour(s)</option>
                      <option value="Da">Day(s)</option>
                    </Input>
                    <ErrorMessage
                      errors={errors}
                      name="timeToWaitUnit"
                      className="invalid-feedback"
                      as="p"
                    ></ErrorMessage>
                  </FormGroup>
                </Col>
              </Row>

              <Label for="time_to_complete" className="text-bold mb-1">
                Maximum Time to complete the Touch
              </Label>
              <Row>
                <Col md={7}>
                  <FormGroup>
                    <Input
                      type="number"
                      min="1"
                      maxLength="6"
                      onInput={(e) => {
                        if (e.target.value.length > e.target.maxLength) {
                          e.target.value = e.target.value.slice(
                            0,
                            e.target.maxLength
                          );
                        }
                      }}
                      name="timeToComplete"
                      id="time_to_complete"
                      step="1"
                      invalid={errors.timeToComplete}
                      innerRef={register({
                        required: 'Required Maximum Time to complete the Touch',
                      })}
                    />
                    <ErrorMessage
                      errors={errors}
                      name="timeToComplete"
                      className="invalid-feedback"
                      as="p"
                    ></ErrorMessage>
                  </FormGroup>
                </Col>
                <Col md={5}>
                  <FormGroup>
                    <Input
                      type="select"
                      name="timeToCompleteUnit"
                      invalid={errors.timeToCompleteUnit}
                      innerRef={register({
                        required: 'Time unit is required',
                      })}
                    >
                      <option></option>
                      <option value="Mi">Minute(s)</option>
                      <option value="Ho">Hour(s)</option>
                      <option value="Da">Day(s)</option>
                    </Input>
                    <ErrorMessage
                      errors={errors}
                      name="timeToCompleteUnit"
                      className="invalid-feedback"
                      as="p"
                    ></ErrorMessage>
                  </FormGroup>
                </Col>
              </Row>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="card-footer">
          <ClButton
            type="submit"
            color="primary"
            title={
              editRestrict
                ? 'This touch exists in a shared cadence'
                : getTouchError
                ? 'Unable to save'
                : 'Save Social Touch'
            }
            disabled={editRestrict || getTouchError}
            icon={loading ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
          >
            {loading ? 'Wait...' : 'Save'}
          </ClButton>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
export default OtherTouchModal;
