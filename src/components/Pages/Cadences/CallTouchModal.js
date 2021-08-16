import React, { useEffect, useState } from 'react';
import {
  Card,
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
import { parseUrl } from 'query-string';
import ClButton from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import WorkflowActions from './WorkflowActions';

const CallTouchModal = ({
  showModal,
  hideModal,
  handleAction,
  loading,
  getTouchLoading,
  getTouchError,
  editFlag,
  editData,
  editOutcome,
  cadenceId,
  editRestrict,
  userIds,
  currentCadence,
  touchNumber,
  touchData,
}) => {
  const [dispositionFilter, setDispositionFilter] = useState(
    `&filter[active]=true&filter[notVisibleToUser]=false`
  );

  const editState = editFlag ? true : false;
  const [validationState, setValidationState] = useState(false);
  const [workflowViewed, setWorkflowViewed] = useState(0);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workFlowConfirm, setWorkFlowConfirm] = useState(false);
  const [formData, setFormData] = useState();
  const [workflowValidate, setWorkflowValidate] = useState(false);
  const [workflowActionsOpen, setWorkflowActionsOpen] = useState(false);
  const [isOutcomeIssue, setIsOutcomeIssue] = useState(false);
  const [dialerValues, setDialerValues] = useState([]);
  let outcomes, callTouchDataEdit;
  const [isOpen, setIsOpen] = useState(showModal);

  const { handleSubmit, register, errors, reset } = useForm();

  useEffect(() => {
    if (editFlag) {
      // eslint-disable-next-line array-callback-return
      editData.map((edit) => {
        const productTypes = edit?.product?.split(',');
        setDialerValues(productTypes);

        // eslint-disable-next-line react-hooks/exhaustive-deps
        callTouchDataEdit = {
          timeToWaitAndExecute: edit.waitPeriodBeforeStart,
          timeToWaitUnit: edit.waitPeriodUnit,
          timeToComplete: edit.timeToComplete,
          timeToCompleteUnit: edit.timeToCompleteUnit,
        };
      });
      reset(callTouchDataEdit);
    }
  }, [editData]);

  useEffect(() => {
    setIsOpen(showModal);
  }, [showModal]);

  const handleWorkFlow = (data, loading) => {
    outcomes = data;
    setWorkflowLoading(loading);
  };

  const removeDuplicatesArrayValues = (arr) => {
    const filteredArray = arr.filter(function (item, pos) {
      return arr.indexOf(item) === pos;
    });
    return filteredArray;
  };

  const onSubmit = (data) => {
    if (dialerValues.length === 0) {
      setValidationState(true);
    } else {
      setValidationState(false);
      const isSelectedCadence =
        outcomes &&
        outcomes.filter(
          (item) =>
            item.action === 'Move To Another Cadence' &&
            parseInt(item.cadence.id) === 0
        );
      if (isSelectedCadence?.length > 0) {
        setWorkflowValidate(true);
        return false;
      } else if (workflowViewed === 0 && !workflowActionsOpen) {
        setFormData(data);
        setWorkFlowConfirm(true);
      } else {
        handleAction(data, removeDuplicatesArrayValues(dialerValues), outcomes);
        setWorkflowActionsOpen(false);
        setWorkflowViewed(0);
        setValidationState(false);
      }
    }
  };

  const handleDialerChange = (e) => {
    const selectedDialerValue = e.currentTarget.getAttribute('data-tab-value');
    const ischecked = e.currentTarget.checked;
    if (ischecked) {
      dialerValues.push(selectedDialerValue);
    } else {
      const index = dialerValues.indexOf(selectedDialerValue);
      if (index > -1) {
        dialerValues.splice(index, 1);
      }
    }

    const { query } = parseUrl('?page[limit]=10&page[offset]=0');
    for (let i = 0; i < dialerValues.length; i++) {
      if (dialerValues[i] === 'CD') {
        query['filter[active]'] = 'true';
        query['filter[notVisibleToUser]'] = 'false';
        query['filter[clickDialer]'] = '(OR)true';
      } else if (dialerValues[i] === 'PD') {
        query['filter[active]'] = 'true';
        query['filter[notVisibleToUser]'] = 'false';
        query['filter[personalDialer]'] = '(OR)true';
      } else {
        query['filter[active]'] = 'true';
        query['filter[notVisibleToUser]'] = 'false';
        query['filter[teamDialer]'] = '(OR)true';
        query['filter[dialingAgent]'] = '(OR)true';
      }
    }
    const filterQry = Object.entries({
      ...query,
    })
      .filter(([key]) => key.startsWith('filter'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setDispositionFilter(filterQry === '' ? '' : '&' + filterQry);
  };

  return (
    <Modal size="lg" isOpen={isOpen} centered>
      <Form name="addCallTouch" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader
          toggle={() => {
            setWorkflowActionsOpen(false);
            hideModal();
            setValidationState(false);
          }}
        >
          <i className="fas fa-phone-alt mr-2 text-call"></i>
          {`${editState ? 'Edit' : 'Add'} Call Touch - #${touchNumber} ${
            workflowActionsOpen === true
              ? `/ ${editState ? 'Edit' : 'Define'} workflow`
              : ''
          }`}
          {(getTouchLoading || workflowLoading) && (
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
                <Label className="text-bold mb-1">Choose Calling Mode</Label>
                <Row className="mx-0">
                  <Col>
                    <FormGroup>
                      <Row>
                        <Col className="ba align-items-center d-flex justify-content-around py-2">
                          <span className="fa-2x svgicon speed-30 mx-2 pb-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                          </span>
                          <span className="mr-2">Click Dialer</span>
                          <Label className="ml-4 pt-1">
                            <Input
                              className="mt-n1"
                              type="checkbox"
                              name="cdDialer"
                              data-tab-value="CD"
                              defaultChecked={dialerValues?.includes('CD')}
                              innerRef={register(true)}
                              onClick={(e) => {
                                handleDialerChange(e);
                              }}
                            />
                          </Label>
                        </Col>
                        <Col className="ba bl0 align-items-center d-flex justify-content-around py-2">
                          <span className="fa-2x svgicon speed-100 mx-2 pb-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                          </span>
                          <span className="mr-2 text-nowrap">Flow Dialer</span>
                          <Label className="ml-4 pt-1">
                            <Input
                              className="mt-n1"
                              name="pdDialer"
                              defaultChecked={dialerValues?.includes('PD')}
                              type="checkbox"
                              data-tab-value="PD"
                              innerRef={register(true)}
                              onClick={(e) => {
                                handleDialerChange(e);
                              }}
                            />
                          </Label>
                        </Col>
                        <Col className="ba bl0 align-items-center d-flex justify-content-around py-2 pl-2 pr-0">
                          <span className="fa-2x svgicon speed-800 mr-1 pb-2">
                            <span className="path1"></span>
                            <span className="path2"></span>
                            <span className="path3"></span>
                            <span className="path4"></span>
                          </span>
                          <span className="mr-1">Agent Assisted Dialer</span>
                          <Label className="ml-3 pt-1">
                            <Input
                              className="mt-n1"
                              name="tdDialer"
                              data-tab-value="TD"
                              defaultChecked={dialerValues?.includes('TD')}
                              innerRef={register(true)}
                              onClick={(e) => {
                                handleDialerChange(e);
                              }}
                              type="checkbox"
                            />
                          </Label>
                        </Col>
                      </Row>
                    </FormGroup>
                    <p
                      className="text-danger text-sm"
                      hidden={
                        (errors.timeToComplete && dialerValues.length === 0) ||
                        validationState
                          ? false
                          : true
                      }
                    >
                      Please select the product type
                    </p>
                  </Col>
                </Row>

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
                        step="1"
                        invalid={errors.timeToWaitAndExecute}
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
                className={
                  workflowActionsOpen === true
                    ? 'd-block pre-scrollable'
                    : 'd-none pre-scrollable'
                }
              >
                <Col>
                  <Card>
                    <WorkflowActions
                      cadenceId={cadenceId}
                      userIds={userIds}
                      filterType="Call"
                      defaultFilter={dispositionFilter}
                      isoutcome={false}
                      handleWorkFlow={handleWorkFlow}
                      editOutcome={editOutcome}
                      editFlag={editFlag}
                      currentCadence={currentCadence}
                      setIsOutcomeIssue={setIsOutcomeIssue}
                      tdDialer={dialerValues?.includes('TD')}
                    ></WorkflowActions>
                  </Card>
                </Col>
              </Row>
            </>
          )}
          <p
            className="text-danger text-sm my-2"
            hidden={
              !(
                workflowActionsOpen &&
                (errors.timeToComplete ||
                  dialerValues.length === 0 ||
                  workflowValidate)
              )
            }
          >
            Please fill the mandatory fields !
          </p>
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
                className="text-email"
                hidden={getTouchError}
                icon={
                  workflowActionsOpen
                    ? 'fas fa-chevron-left text-muted'
                    : 'fas fa-pencil-alt text-muted'
                }
                color="link"
                title={
                  workflowActionsOpen
                    ? 'Back'
                    : ` ${editState ? 'Edit' : 'Define'} Workflows`
                }
                onClick={() => {
                  setWorkflowViewed(workflowViewed + 1);
                  setWorkflowActionsOpen(!workflowActionsOpen);
                }}
              >
                {workflowActionsOpen
                  ? 'Back'
                  : ` ${editState ? 'Edit' : 'Define'} Call Workflows`}
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
                : 'Save Call Touch'
            }
            disabled={
              editRestrict || isOutcomeIssue || getTouchError || workflowLoading
            }
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
          handleAction(formData, dialerValues, outcomes);
          setWorkflowActionsOpen(false);
          setWorkFlowConfirm(false);
          setWorkflowViewed(0);
        }}
        showConfirmBtnSpinner={loading}
        showConfirmModal={workFlowConfirm}
      >
        <span>
          If you would like to make changes to Call Workflows, please click 'X'
          to proceed. If you are all set, please click OK.?
        </span>
      </ConfirmModal>
    </Modal>
  );
};
export default CallTouchModal;
