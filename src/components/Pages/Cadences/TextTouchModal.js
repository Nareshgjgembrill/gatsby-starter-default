import React, { useEffect, useState } from 'react';
import {
  Col,
  Card,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
} from 'reactstrap';
import { useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import ClButton from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import WorkflowActions from './WorkflowActions';

let outcomes, textTouchDataEdit;
const TextTouchModal = ({
  showModal,
  hideModal,
  handleAction,
  loading,
  getTouchLoading,
  getTouchError,
  editFlag,
  editData,
  editOutcome,
  currentCadence,
  cadenceId,
  editRestrict,
  userIds,
  touchNumber,
  touchData,
}) => {
  const { handleSubmit, register, errors, reset } = useForm();

  const editState = editFlag ? true : false;
  const [workflowViewed, setWorkflowViewed] = useState(0);
  const [workFlowConfirm, setWorkFlowConfirm] = useState(false);
  const [formData, setFormData] = useState();
  const [workflowActionsOpen, setWorkflowActionsOpen] = useState(false);
  const [isOutcomeIssue, setIsOutcomeIssue] = useState(false);

  useEffect(() => {
    if (editFlag) {
      // eslint-disable-next-line array-callback-return
      editData.map((edit) => {
        textTouchDataEdit = {
          timeToWaitAndExecute: edit.waitPeriodBeforeStart,
          timeToWaitUnit: edit.waitPeriodUnit,
          timeToComplete: edit.timeToComplete,
          timeToCompleteUnit: edit.timeToCompleteUnit,
        };
      });
      reset(textTouchDataEdit);
    }
  }, [editData, editFlag, reset]);

  const handleWorkFlow = (data) => {
    outcomes = data;
  };

  const onSubmit = (data) => {
    const isSelectedCadence =
      outcomes &&
      outcomes.filter(
        (item) =>
          item.action === 'Move To Another Cadence' &&
          parseInt(item.cadence.id) === 0
      );
    if (isSelectedCadence.length > 0) {
      return false;
    } else if (workflowViewed === 0 && !workflowActionsOpen) {
      setFormData(data);
      setWorkFlowConfirm(true);
    } else {
      handleAction(data, outcomes);
      setWorkflowActionsOpen(false);
      setWorkflowViewed(0);
    }
  };

  return (
    <Modal size="lg" isOpen={showModal} centered className="container-md">
      <Form name="addTextTouch" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader
          toggle={() => {
            setWorkflowActionsOpen(false);
            hideModal();
          }}
        >
          <i className="far fa-comments text-danger text-bold mr-2"></i>
          {`${editState ? 'Edit' : 'Add'} Text Touch - #${touchNumber} ${
            workflowActionsOpen === true
              ? `/ ${editState ? 'Edit' : 'Define'} workflow`
              : ''
          }`}
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
            <>
              <div
                className={
                  workflowActionsOpen === false ? 'd-block px-4' : 'd-none'
                }
              >
                <Label
                  for="time_to_wait_and_execute"
                  className="text-bold mb-1"
                >
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
                        invalid={errors.timeToComplete}
                        innerRef={register({
                          required:
                            'Required Maximum Time to complete the Touch',
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
              <Row
                className={workflowActionsOpen === true ? 'd-block' : 'd-none'}
              >
                <Col md={12}>
                  <Card>
                    <WorkflowActions
                      cadenceId={cadenceId}
                      userIds={userIds}
                      filterType="Text"
                      isoutcome={true}
                      handleWorkFlow={handleWorkFlow}
                      editFlag={editFlag}
                      editOutcome={editOutcome}
                      currentCadence={currentCadence}
                      setIsOutcomeIssue={setIsOutcomeIssue}
                    ></WorkflowActions>
                  </Card>
                  <p
                    className="text-danger text-sm"
                    hidden={errors.timeToComplete ? false : true}
                  >
                    Please fill the mandatory fields !
                  </p>
                </Col>
              </Row>
            </>
          )}
        </ModalBody>
        <ModalFooter className="card-footer">
          <div className="mr-auto">
            {isOutcomeIssue && (
              <span className="text-danger">
                <i className="fas fa-exclamation-circle fa-lg text-danger mr-2"></i>
                Sorry! Failed to fetch outcomes. Unable to create this Touch
              </span>
            )}
            {!isOutcomeIssue && (
              <ClButton
                hidden={getTouchError}
                className="text-email"
                icon={
                  workflowActionsOpen
                    ? 'fas fa-chevron-left text-primary'
                    : 'fa-2  fas fa-pencil-alt text-primary'
                }
                color="link"
                title={
                  workflowActionsOpen
                    ? 'Back'
                    : ` ${editState ? 'Edit' : 'Define'} workflow`
                }
                onClick={() => {
                  setWorkflowViewed(workflowViewed + 1);
                  setWorkflowActionsOpen(!workflowActionsOpen);
                }}
              >
                {workflowActionsOpen
                  ? 'Back'
                  : ` ${editState ? 'Edit' : 'Define'} Text workflow`}
              </ClButton>
            )}
          </div>
          <ClButton
            type="submit"
            color="primary"
            title={
              editRestrict
                ? 'This touch exists in a shared cadence'
                : isOutcomeIssue || getTouchError
                ? 'Unable to save'
                : 'Save Text Touch'
            }
            disabled={editRestrict || isOutcomeIssue || getTouchError}
            icon={loading ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
          >
            {loading ? 'Wait...' : 'Save'}
          </ClButton>
        </ModalFooter>
      </Form>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => {
          setWorkflowActionsOpen(true);
          setWorkFlowConfirm(false);
        }}
        handleConfirm={() => {
          handleAction(formData, outcomes);
          setWorkflowActionsOpen(false);
          setWorkFlowConfirm(false);
          setWorkflowViewed(0);
        }}
        showConfirmBtnSpinner={loading}
        showConfirmModal={workFlowConfirm}
      >
        <span>
          If you would like to make changes to text Workflows, please click 'X'
          to proceed. If you are all set, please click OK.?
        </span>
      </ConfirmModal>
    </Modal>
  );
};
export default TextTouchModal;
