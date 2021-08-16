/**
 * @author ranbarasan
 * @version v11.0
 */
import { useLazyQuery } from '@apollo/react-hooks';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import { showErrorMessage } from '../../../util/index';
import { default as ClButton } from '../../Common/Button';
import CloseButton from '../../Common/CloseButton';
// Common component import Start
//TODO This will be uncommented once the custom task is fully developed from front end and back end.
// import DropDown from '../../Common/DropDown';
import ConfirmModal from '../../Common/ConfirmModal';
import FETCH_CALLDISPOSITIONS_QUERY from '../../queries/CallDispositionsQuery';
import {
  LOG_A_CALL_FLOW,
  LOG_A_CALL_WORK_FLOW_QUERY,
  LOG_A_TASK_QUERY,
  UPDATE_LOG_A_TASK_QUERY,
} from '../../queries/ProspectsQuery';
// Common component import End
toast.configure();
const initialLogATaskValues = {
  outcome: '',
  comments: '',
  followupDate: '',
  subject: '',
  reminder: '08:00',
  notes: '',
};

const initialHasError = {
  followupDateErr: '',
  subjectErr: '',
  outcomeErr: '',
  notesErr: '',
};

const LogACallAndLogATask = ({
  showModal,
  hideModal,
  hideNewTask,
  prospectId,
  memberTaskId,
  prospect,
  cadence,
  handleRefreshActivity,
  task,
  taskName,
}) => {
  const [activeTab, setActiveTab] = useState('logCall');
  const [heading, setHeading] = useState('Log a Call');
  const [disposition, setDisposition] = useState([]);
  const [logATask, setLogATask] = useState(initialLogATaskValues);
  const [hasError, setHasError] = useState(initialHasError);
  const [includeLogaCall, setIncludeLogaCall] = useState(false);
  const [createFollowupTask, setCreateFollowupTask] = useState(false);
  const [showCallTouchConfirm, setShowCallTouchConfirm] = useState(false);
  const [checkCancelClicked, setCheckCancelClicked] = useState(false);
  const [taskId, setTaskId] = useState();
  //TODO This will be uncommented once the custom task is fully developed from front end and back end.
  // const [taskType, setTaskType] = useState('call');
  const invalidStyle = {
    width: '100%',
    marginTop: '0.25rem',
    fontSize: '80%',
    color: '#f05050',
  };
  // Functions Block Start
  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
    });
  };

  const [fetchDisposition, { data: dispositionData }] = useLazyQuery(
    FETCH_CALLDISPOSITIONS_QUERY,
    {
      onCompleted: (response) =>
        handleFetchDispositionRequestCallBack(response, true),
      onError: (response) => handleFetchDispositionRequestCallBack(response),
    }
  );

  const handleFetchDispositionRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      setDisposition(response.callDispositions.data);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to get the disposition details.',
        dispositionData,
        'call_disposition'
      );
    }
  };

  const handleLogATaskOnChange = (props) => {
    const { name, value } = props.target;
    setLogATask((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      tab === 'logCall' ? setHeading('Log a Call') : setHeading('New Task');
      if (memberTaskId) {
        setIncludeLogaCall(true);
      }
    }

    switch (tab) {
      case 'logCall':
        if (logATask.subject || logATask.notes || logATask.followupDate) {
          setCreateFollowupTask(false);
        } else if (includeLogaCall) {
          setIncludeLogaCall(false);
        }
        break;
      default:
        if (logATask.outcome || logATask.comments) {
          setIncludeLogaCall(true);
        }
        break;
    }
  };
  // useLazyQuery Block start
  const [
    saveLogCallWorkflow,
    { loading: saveLogCallWorkflowLoading },
  ] = useLazyQuery(LOG_A_CALL_WORK_FLOW_QUERY, {
    onCompleted: (response) =>
      handleSaveLogACallRequestCallBack(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Sorry! Failed to save the call details - workflow related',
        logaCallData,
        'save_workflow'
      );
    },
  });
  const [
    saveLogACall,
    { data: logaCallData, loading: saveLogACallLoading },
  ] = useLazyQuery(LOG_A_CALL_FLOW, {
    onCompleted: (response) => {
      handleSaveLogACallRequestCallBack(response, true);
      setCheckCancelClicked(true);
    },
    onError: (response) => handleSaveLogACallRequestCallBack(response),
  });
  const [
    saveLogATask,
    { data: logaTaskData, loading: saveLogATaskLoading },
  ] = useLazyQuery(LOG_A_TASK_QUERY, {
    onCompleted: (response) =>
      handleSaveLogATaskRequestCallBack(response, true),
    onError: (response) =>
      handleSaveLogATaskRequestCallBack(response, false, logaTaskData),
  });

  const handleSaveLogACallRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Call has been logged successfully!', 'success');
      resetValues();
      handleRefreshActivity();
    } else {
      showErrorMessage(
        response,
        'Failed to save the log a call details',
        logaCallData,
        'save_logacall'
      );
    }
  };

  const handleSaveLogATaskRequestCallBack = (
    response,
    requestSuccess,
    taskData
  ) => {
    if (requestSuccess) {
      notify('Task has been saved successfully!', 'success');
      resetValues();
      handleRefreshActivity();
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to save the task details.',
        taskData,
        'save_task'
      );
    }
  };

  const [
    updateLogATask,
    { data: updateLogATaskData, loading: updateLogATaskLoading },
  ] = useLazyQuery(UPDATE_LOG_A_TASK_QUERY, {
    onCompleted: (response) =>
      handleSaveLogATaskRequestCallBack(response, true),
    onError: (response) =>
      handleSaveLogATaskRequestCallBack(response, false, updateLogATaskData),
  });

  //useEffect Block Start
  useEffect(() => {
    if (showModal) {
      fetchDisposition({
        variables: {
          limit: 100,
          offset: 0,
          filter:
            '&filter[active]=true&filter[notVisibleToUser]=false&filter[clickDialer]=true',
        },
      });

      setHasError(initialHasError);
      if (task && Object.keys(task).length > 0) {
        setTaskId(task.id);
        const reminder24hTime = getTimeString(
          task.followUpDueDate + ' ' + task.reminder,
          true
        );
        const logATaskValues = {
          outcome: '',
          comments: '',
          followupDate: task.followUpDueDate,
          subject: task.subject,
          reminder: reminder24hTime,
          notes: task.comments,
        };
        setLogATask(logATaskValues);
        setActiveTab('logTask');
      } else {
        setLogATask(initialLogATaskValues);
        setTaskId();
      }
      setIncludeLogaCall(false);
      setCreateFollowupTask(false);
      setHasError(initialHasError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      if (taskName === 'Task') {
        setActiveTab('logTask');
      } else if (taskName === 'Call') {
        setActiveTab('logCall');
      } else if (taskName === 'Complete call') {
        setActiveTab('logCall');
      }
    }
  }, [showModal, taskName]);

  const validateLogATask = () => {
    let isValidTask = true;
    let isValidCall = true;
    const hasErrorJson = JSON.parse(JSON.stringify(initialHasError));

    if (activeTab === 'logTask' || createFollowupTask || includeLogaCall) {
      if (!logATask.subject.trim()) {
        hasErrorJson['subjectErr'] = 'Subject is mandatory';
        isValidTask = false;
      }
      if (!logATask.followupDate) {
        hasErrorJson['followupDateErr'] = 'Follow up date is mandatory';
        isValidTask = false;
      }
      if (!logATask.notes.trim()) {
        hasErrorJson['notesErr'] = 'Notes are mandatory';
        isValidTask = false;
      }
    }

    if (
      (activeTab === 'logCall' || includeLogaCall || createFollowupTask) &&
      !logATask.outcome
    ) {
      hasErrorJson['outcomeErr'] = 'Call Outcome is mandatory';
      isValidCall = false;
    }

    if (!isValidTask) {
      setActiveTab('logTask');
    } else if (!isValidCall) {
      setActiveTab('logCall');
    }

    setHasError(hasErrorJson);
    return isValidTask && isValidCall;
  };

  const getTimeString = (dateString, is24HourCycle) => {
    const date = new Date(dateString);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: is24HourCycle ? false : true,
    };
    return date.toLocaleString('en-US', options);
  };
  // Handle Blocks Start
  const submitLogTask = (event) => {
    event.preventDefault();
    const isValid = validateLogATask();

    if (
      isValid &&
      prospect &&
      prospect.currentTouchType === 'CALL' &&
      cadence.status !== 'PAUSED' &&
      prospect.memberStatus !== 'SUSPEND' &&
      activeTab === 'logCall' &&
      taskName !== 'Complete call'
    ) {
      setShowCallTouchConfirm(true);
      hideModal();
    } else if (isValid) {
      saveTaskDetails();
    }
  };

  const saveTaskDetails = (isCallTouch) => {
    setShowCallTouchConfirm(false);
    if (createFollowupTask || includeLogaCall || activeTab === 'logTask') {
      const reminder12hTime = getTimeString(
        logATask.followupDate + ' ' + logATask.reminder
      );
      let input = {};
      if (taskId) {
        const fieldsUpdated = ['subject', 'notes', 'followupDate', 'reminder'];
        input = {
          subject: logATask.subject,
          notes: logATask.notes,
          followupDate: logATask.followupDate,
          reminder: reminder12hTime,
          prospect: { id: parseInt(prospectId) },
          taskType: 'call',
        };
        if (task && task.subject === input.subject) {
          const index = fieldsUpdated.indexOf('subject');
          if (index > -1) {
            fieldsUpdated.splice(index, 1);
          }
        }
        if (task && task.comments === input.notes) {
          const index = fieldsUpdated.indexOf('notes');
          if (index > -1) {
            fieldsUpdated.splice(index, 1);
          }
        }
        if (task && task.followUpDueDate === input.followupDate) {
          const index = fieldsUpdated.indexOf('followupDate');
          if (index > -1) {
            fieldsUpdated.splice(index, 1);
          }
        }
        if (task && task.reminder === input.reminder) {
          const index = fieldsUpdated.indexOf('reminder');
          if (index > -1) {
            fieldsUpdated.splice(index, 1);
          }
        }
        if (fieldsUpdated.length === 0) {
          notify('No changes made!', 'error');
          return;
        }
        input['fieldsUpdated'] = fieldsUpdated.join(', ');
      } else {
        input = {
          subject: logATask.subject,
          notes: logATask.notes,
          followupDate: logATask.followupDate,
          reminder: reminder12hTime,
          prospect: { id: parseInt(prospectId) },
          taskType: 'call',
        };
      }

      if (taskId) {
        updateLogATask({ variables: { taskId, input } });
      } else {
        saveLogATask({
          variables: { input },
        });
      }
    }
    //Completing call touch
    if (isCallTouch || taskName === 'Complete call') {
      const input = {
        outcome: { id: parseInt(logATask.outcome) },
        prospect: { id: parseInt(prospectId) },
      };

      if (logATask.comments) {
        input['comments'] = logATask.comments;
      }

      saveLogCallWorkflow({
        variables: {
          input: input,
        },
      });
    } else if (
      includeLogaCall ||
      createFollowupTask ||
      activeTab === 'logCall'
    ) {
      const input = {
        outcome: { id: parseInt(logATask.outcome) },
        prospect: { id: parseInt(prospectId) },
      };

      if (logATask.comments !== '') input['comments'] = logATask.comments;

      if (memberTaskId) {
        input['task'] = { id: parseInt(memberTaskId) };
      }

      saveLogACall({
        variables: {
          input: input,
        },
      });
    }
  };

  const resetValues = () => {
    hideModal();
    setHasError(initialHasError);
    setLogATask(initialLogATaskValues);
  };

  const handleIncludeTaskOrCallChange = (event) => {
    if (event.target.name === 'includeLogaCall') {
      setIncludeLogaCall(event.target.checked);
      setActiveTab(event.target.checked ? 'logCall' : activeTab);
    } else if (event.target.name === 'createFollowupTask') {
      setCreateFollowupTask(event.target.checked);
      setActiveTab(event.target.checked ? 'logTask' : activeTab);
      setIncludeLogaCall(memberTaskId ? true : false);
    }
  };

  return (
    <div>
      <Modal isOpen={showModal}>
        <Form name="logACallForm" onSubmit={submitLogTask}>
          <ModalHeader>
            <i
              className={
                activeTab === 'logCall'
                  ? 'fas fa-phone-alt text-call mr-2'
                  : 'fas fa-tasks text-warning mr-2'
              }
            ></i>
            {heading}
          </ModalHeader>
          <ModalBody>
            <Nav tabs>
              <NavItem style={{ cursor: 'pointer' }}>
                <NavLink
                  className={classnames({ active: activeTab === 'logCall' })}
                  onClick={() => {
                    handleTabChange('logCall');
                  }}
                >
                  Log a Call
                </NavLink>
              </NavItem>
              {!hideNewTask && (
                <NavItem
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <NavLink
                    disabled={hideNewTask && !checkCancelClicked}
                    className={classnames({ active: activeTab === 'logTask' })}
                    onClick={() => {
                      handleTabChange('logTask');
                    }}
                  >
                    New Task
                  </NavLink>
                </NavItem>
              )}
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="logCall">
                <FormGroup>
                  <Label for="log_a_call_result">Call Result</Label>
                  <Input
                    type="select"
                    name="outcome"
                    id="outcome"
                    onChange={handleLogATaskOnChange}
                  >
                    <option></option>
                    {disposition &&
                      disposition.map((outcome, index) => {
                        return (
                          <option key={index} value={outcome.id}>
                            {outcome.name}
                          </option>
                        );
                      })}
                  </Input>
                  <span style={invalidStyle}>
                    {hasError.outcomeErr ? hasError.outcomeErr : null}
                  </span>
                </FormGroup>
                <FormGroup>
                  <Label for="log_a_call_notes">Notes</Label>
                  <Input
                    type="textarea"
                    name="comments"
                    id="comments"
                    rows={6}
                    onChange={handleLogATaskOnChange}
                    maxLength={1000}
                  />
                  <span style={invalidStyle}>
                    {hasError.commentsErr ? hasError.commentsErr : null}
                  </span>
                </FormGroup>
                {!hideNewTask && (
                  <FormGroup check inline>
                    <Label check>
                      <Input
                        disabled={hideNewTask && !checkCancelClicked}
                        style={{
                          cursor: 'pointer',
                        }}
                        type="checkbox"
                        name="createFollowupTask"
                        id="create_followup_task"
                        checked={createFollowupTask}
                        onChange={handleIncludeTaskOrCallChange}
                      />
                      Create a Followup Task
                    </Label>
                  </FormGroup>
                )}
              </TabPane>
              <TabPane tabId="logTask">
                <FormGroup>
                  <Label for="subject">Subject:</Label>
                  <Input
                    type="text"
                    name="subject"
                    id="subject"
                    maxLength={255}
                    onChange={handleLogATaskOnChange}
                    value={logATask.subject}
                    autoComplete="off"
                  />
                  <span style={invalidStyle}>
                    {hasError.subjectErr ? hasError.subjectErr : null}
                  </span>
                </FormGroup>
                <FormGroup>
                  <Label for="notes">Notes:</Label>
                  <Input
                    type="textarea"
                    name="notes"
                    id="notes"
                    onChange={handleLogATaskOnChange}
                    value={logATask.notes}
                    maxLength={1000}
                  />
                  <span style={invalidStyle}>
                    {hasError.notesErr ? hasError.notesErr : null}
                  </span>
                </FormGroup>
                <FormGroup>
                  <Label for="follow_up_date">Follow Up Date:</Label>
                  <Input
                    type="date"
                    name="followupDate"
                    id="follow_up_date"
                    onChange={handleLogATaskOnChange}
                    value={logATask.followupDate}
                    min={new Date().toISOString().substr(0, 10)}
                  />
                  <span style={invalidStyle}>
                    {hasError.followupDateErr ? hasError.followupDateErr : null}
                  </span>
                </FormGroup>
                <FormGroup>
                  <Label for="reminder">Time:</Label>
                  <Input
                    type="time"
                    name="reminder"
                    value={logATask.reminder}
                    onChange={handleLogATaskOnChange}
                  ></Input>
                </FormGroup>
                {/*TODO This will be uncommented once the custom task is fully developed from front end and back end.
                <FormGroup>
                  <Label for="task_type">Task type:</Label>
                  <div className="h-auto">
                    <DropDown
                      data={[
                        { text: 'Call', value: 'call' },
                        { text: 'Custom', value: 'custom' },
                      ]}
                      name="task_type"
                      value={taskType}
                      onChange={(value) => setTaskType(value)}
                    /> 
                  </div>
                </FormGroup> */}
                <FormGroup check inline>
                  <Label check>
                    <Input
                      type="checkbox"
                      name="includeLogaCall"
                      onChange={handleIncludeTaskOrCallChange}
                      checked={includeLogaCall}
                    />
                    Include Log a Call
                  </Label>
                </FormGroup>
              </TabPane>
            </TabContent>
          </ModalBody>
          <ModalFooter className="card-footer">
            <CloseButton
              btnTxt="Cancel"
              onClick={() => {
                hideModal();
                setCheckCancelClicked(true);
              }}
            />
            <ClButton
              color="primary"
              icon={
                saveLogATaskLoading ||
                saveLogACallLoading ||
                updateLogATaskLoading ||
                saveLogCallWorkflowLoading
                  ? 'fa fa-spinner fa-spin'
                  : 'fa fa-check'
              }
              title="Save"
              disabled={
                saveLogATaskLoading ||
                saveLogACallLoading ||
                updateLogATaskLoading ||
                saveLogCallWorkflowLoading
              }
            >
              Save
            </ClButton>
          </ModalFooter>
        </Form>
      </Modal>
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="Yes"
        handleConfirm={() => {
          saveTaskDetails(true);
        }}
        handleCancel={() => {
          setShowCallTouchConfirm(false);
        }}
        showConfirmModal={showCallTouchConfirm}
        otherBtnRequired={true}
        otherBtnText="No"
        otherBtnIcon="fas fa-times"
        otherBtnColor="primary"
        otherBtnAlign="left"
        otherBtnHandler={() => {
          setShowCallTouchConfirm(false);
          saveTaskDetails(false);
        }}
      >
        <p>
          This prospect is currently in a call touch in the Cadence:{' '}
          <strong>{cadence ? cadence.name : null}</strong>.Would you like this
          call to be counted towards the Call touch and move this prospect to
          the next touch in the Cadence?
        </p>
      </ConfirmModal>
    </div>
  );
};
export default LogACallAndLogATask;
