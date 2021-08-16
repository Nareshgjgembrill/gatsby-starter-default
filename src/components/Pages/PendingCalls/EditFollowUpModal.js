import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';
import moment from 'moment-timezone';
import ClButton from '../../Common/Button';
import CloseButton from '../../Common/CloseButton';

const EditFollowUpMOdal = (props) => {
  const {
    showEdit,
    editData,
    handleEditSubmit,
    editFollowupType,
    editFollowupLoading,
    handleHideModal,
  } = props;

  const formRef = React.useRef();
  const { handleSubmit, register, errors, reset } = useForm();

  useEffect(() => {
    const otherTouchDataEdit = {
      subject: editData?.followUpData?.subject,
      notes: editData?.followUpData?.comments,
      followupDate: moment(editData?.followUpData?.dueDate).format(
        'YYYY-MM-DD'
      ),
      reminder: moment(editData?.followUpData?.reminder, ['hh:mm A']).format(
        'HH:mm'
      ),
    };
    reset(otherTouchDataEdit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData]);

  const onSubmit = (data) => {
    handleEditSubmit(data);
  };

  return (
    <div>
      <Modal isOpen={showEdit} centered>
        <Form
          name="editFollowUp"
          onSubmit={handleSubmit(onSubmit)}
          innerRef={formRef}
        >
          <ModalHeader>
            <i className={'fas fa-edit text-warning mr-2'}></i>
            {(editFollowupType === 'all'
              ? 'Edit Follow up - '
              : 'Edit due date - ') + editData?.prospect?.contactName}
          </ModalHeader>
          <ModalBody>
            {editFollowupType === 'all' && (
              <>
                <FormGroup>
                  <Label for="subject">Subject</Label>
                  <Input
                    type="text"
                    name="subject"
                    id="subject"
                    invalid={errors.subject}
                    maxLength={255}
                    autoComplete="off"
                    innerRef={register({
                      required: 'Please enter the Subject',
                    })}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="subject"
                    className="invalid-feedback"
                    as="p"
                  ></ErrorMessage>
                </FormGroup>
                <FormGroup>
                  <Label for="notes">Notes</Label>
                  <Input
                    type="textarea"
                    name="notes"
                    id="notes"
                    maxLength={1000}
                    invalid={errors.notes}
                    innerRef={register({
                      required: 'Please enter the notes',
                    })}
                  />
                  <ErrorMessage
                    errors={errors}
                    name="notes"
                    className="invalid-feedback"
                    as="p"
                  ></ErrorMessage>
                </FormGroup>
              </>
            )}
            <FormGroup>
              <Label for="follow_up_date">Follow Up date</Label>
              <Input
                type="date"
                name="followupDate"
                id="follow_up_date"
                min={new Date().toISOString().substr(0, 10)}
                invalid={errors.followupDate}
                innerRef={register({
                  required: 'Please select the valid due date',
                })}
              />
              <ErrorMessage
                errors={errors}
                name="followupDate"
                className="invalid-feedback"
                as="p"
              ></ErrorMessage>
            </FormGroup>
            {editFollowupType === 'all' && (
              <FormGroup>
                <Label for="reminder">Time</Label>
                <Input
                  type="time"
                  id="reminder"
                  name="reminder"
                  invalid={errors.reminder}
                  innerRef={register({
                    required: 'Please set the reminder time',
                  })}
                ></Input>
                <ErrorMessage
                  errors={errors}
                  name="reminder"
                  className="invalid-feedback"
                  as="p"
                ></ErrorMessage>
              </FormGroup>
            )}
          </ModalBody>
          <ModalFooter className="card-footer">
            <CloseButton
              btnTxt="Cancel"
              onClick={handleHideModal}
              disabled={editFollowupLoading}
            />
            <ClButton
              type="submit"
              color="primary"
              icon={
                editFollowupLoading ? 'fa fa-spinner fa-spin' : 'fa fa-check'
              }
              title="Save"
              disabled={editFollowupLoading}
            >
              {editFollowupLoading ? 'Wait...' : 'Save'}
            </ClButton>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default EditFollowUpMOdal;
