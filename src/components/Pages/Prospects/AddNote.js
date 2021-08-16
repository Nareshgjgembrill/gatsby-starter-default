/**
 * @author albert
 * @version V11.2
 */

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Alert,
  Form,
  FormGroup,
  FormText,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { useLazyQuery } from '@apollo/react-hooks';
import axios from 'axios';
import PropTypes from 'prop-types';
import { FormValidator } from '@nextaction/components';
import { REMOVE_ATTACHMENT_QUERY } from '../../queries/ProspectsQuery';
import { default as Button } from '../../Common/Button';
import CloseButton from '../../Common/CloseButton';
import ConfirmModal from '../../Common/ConfirmModal';
import { showErrorMessage } from '../../../util/index';

toast.configure();

const AddNote = (props) => {
  const {
    showModal,
    setShowModal,
    handleSave,
    handleUpdate,
    handleCancel,
    attachmentUrl,
    notes,
    attachment,
    setAttachment,
    notesLoading,
  } = props;
  const addNoteFormRef = useRef(null);

  const hasError = (inputName, method) => {
    return (
      form &&
      form.errors &&
      form.errors[inputName] &&
      form.errors[inputName][method]
    );
  };

  const notify = (message, ToasterType = 'error') => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
      autoClose: 4000,
    });
  };

  const [attachmentId, setAttachmentId] = useState(null);
  const [form, setForm] = useState({});
  const [notesData, setNotesData] = useState({
    notes: '',
  });
  const [notesId, setNotesId] = useState(null);
  const [showUnSavedConfirmModal, setShowUnSavedConfirmModal] = useState(false);
  const fileTypes = ['.docx', '.gif', '.jpg', '.pdf', '.xls'];
  const MaxFileUploadSize = 3145728;

  const [
    removeAttachment,
    { loading: removeAttachmentLoading, data: removeAttachmentData },
  ] = useLazyQuery(REMOVE_ATTACHMENT_QUERY, {
    onCompleted: (response) =>
      handleRemoveAttachmentRequestCallback(response, true),
    onError: (response) => handleRemoveAttachmentRequestCallback(response),
  });

  const handleRemoveAttachmentRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Attachment removed successfully!', 'success');
      setAttachmentId(null);
      setAttachment({});
    } else {
      showErrorMessage(
        response,
        'Failed to remove attachment',
        removeAttachmentData,
        'remove_attachment'
      );
    }
  };

  const handleRemoveAttachment = () => {
    removeAttachment({
      variables: {
        attachmentId: attachmentId,
      },
    });
  };

  const uploadedFileChange = (e) => {
    const file = e.target.files[0];
    if (fileTypes.indexOf(`.${file.name.split('.').pop()}`) === -1) {
      notify('Please upload valid file.', 'error', 'invalid_file');
    } else if (file.size > MaxFileUploadSize) {
      notify(
        'Sorry you cannot upload attachments larger than 3MB.',
        'error',
        'file_size'
      );
    } else {
      const formData = new FormData();
      formData.append('file', file);
      axios({
        method: 'post',
        url: attachmentUrl,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: formData,
      })
        .then((response) => {
          if (response?.data?.data[0]?.id) {
            setAttachmentId(response.data.data[0].id);
            notify('File uploaded successfully!', 'success');
          }
        })
        .catch((response) => {
          if (response?.response?.data) {
            notify(response.response.data.errors[0].message);
          } else {
            notify('Some error occurred');
          }
        });
    }
  };

  const handleSaveNotes = (e) => {
    const form = addNoteFormRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['TEXTAREA', 'INPUT'].includes(i.nodeName)
    );
    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    const isValid = hasError;

    setForm({ ...form, formName, errors });

    const notesData = [...form.elements].reduce((acc, item) => {
      if (item.value.trim() !== '' && item.name !== '') {
        acc[item.name] = item.value;
      }
      return acc;
    }, {});
    notesData['attachment'] = attachmentId ? [attachmentId] : [];

    if (!isValid && !notesId) {
      handleSave(notesData);
    } else if (!isValid && notesId) {
      if (
        notes.note === notesData.notes &&
        notes?.associations?.attachment[0]?.id === attachmentId
      ) {
        notify('No changes made!');
        return;
      }
      handleUpdate(notesData, notesId);
    }
  };

  //   when cancel is clicked we're checking if there's any data in form to avoid losing data accidently.
  const handleCancelNotes = () => {
    const form = addNoteFormRef.current;
    if (
      notes &&
      Object.keys(notes).length > 0 &&
      notes.note !== form.notes.value
    ) {
      setShowUnSavedConfirmModal(true);
      return;
    }
    setForm({});
    handleCancel();
  };
  const handleAddNotesChange = (props) => {
    const { name, value } = props.target;
    setNotesData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (notes && Object.keys(notes).length > 0) {
      setNotesId(notes.id);
      setAttachmentId(
        notes?.associations?.attachment &&
          notes?.associations?.attachment[0]?.id
      );
      setNotesData({ notes: notes.note });
    } else {
      setNotesId(null);
      setAttachmentId(null);
      setNotesData({ notes: '' });
    }
  }, [notes]);

  return (
    <>
      <Modal isOpen={showModal} centered={true}>
        <ModalHeader toggle={() => handleCancelNotes()}>
          <i className="fas fa-clipboard mr-2"></i>
          Add a note
        </ModalHeader>
        <ModalBody>
          <Form innerRef={addNoteFormRef}>
            <FormGroup>
              <Label for="notes" className="text-bold">
                Notes
              </Label>
              <Input
                type="textarea"
                name="notes"
                placeholder="Enter notes here"
                value={notesData.notes}
                onChange={handleAddNotesChange}
                rows={6}
                maxLength="32000"
                data-validate='["required"]'
                invalid={hasError('notes', 'required')}
              />
              <div className="invalid-feedback">Notes is required</div>
            </FormGroup>
            {notesData.notes.length === 32000 && (
              <Alert color="danger">Maximum charecter limit reached</Alert>
            )}
            {Object.keys(attachment).length === 0 ? (
              <FormGroup className="mb-0">
                <Label for="attachment" className="text-bold">
                  File
                </Label>
                <Input
                  type="file"
                  name="file"
                  id="attachment"
                  accept={fileTypes.join(',')}
                  onChange={(e) => uploadedFileChange(e)}
                />
                <FormText color="muted">
                  {fileTypes.join(', ')} formats are allowed. File size should
                  be maximum of 3MB.
                </FormText>
              </FormGroup>
            ) : (
              <div className="text-break mb-2">
                <span className="d-block text-sm text-bold">Attachment </span>{' '}
                <span>
                  {attachment?.fileName ? (
                    <span>
                      <i className={`${attachment.actionIcon}`}></i>{' '}
                      {attachment.fileName}
                    </span>
                  ) : (
                    'N/A'
                  )}
                </span>
                {attachment?.fileName && (
                  <i
                    title={`Remove ${attachment?.fileName} (${attachment?.attachmentFileSize})`}
                    className="fas fa-times ml-2"
                    onClick={() => handleRemoveAttachment()}
                  ></i>
                )}
              </div>
            )}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            icon={`fas ${notesLoading ? 'fa-spinner fa-spin' : 'fa fa-check'}`}
            color="primary"
            title="Save notes"
            onClick={handleSaveNotes}
            disabled={notesLoading || removeAttachmentLoading}
          >
            Save
          </Button>
          <CloseButton btnTxt="Cancel" onClick={() => handleCancelNotes()} />
        </ModalFooter>
      </Modal>
      {/* unsaved changes confirm modal */}
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText="OK"
        handleCancel={() => {
          setShowUnSavedConfirmModal(false);
        }}
        handleConfirm={() => {
          setShowUnSavedConfirmModal(false);
          setShowModal(false);
          addNoteFormRef.current.reset();
        }}
        showConfirmModal={showUnSavedConfirmModal}
      >
        <span>Changes you made may not be saved.</span>
      </ConfirmModal>
    </>
  );
};

AddNote.defaultProps = {
  attachmentUrl: 'attachments',
};

AddNote.propTypes = {
  showModal: PropTypes.bool,
  setShowModal: PropTypes.func,
  handleSave: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default AddNote;
