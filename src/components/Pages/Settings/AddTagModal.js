/*
 * @author @rManimegalai
 * @version V11.0
 */
import React, { useEffect, useRef, useState } from 'react';
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
import Button from '../../Common/Button';

const AddTagModal = ({
  addOrEditError,
  data,
  handleAction,
  hideModal,
  onChange,
  showModal,
  showActionBtnSpinner,
  title,
}) => {
  const [tagId, setTagId] = useState(0);
  const [text, setText] = useState();
  const [noChanges, setNoChanges] = useState();

  let id = 0;
  let value = '';
  if (data !== undefined) {
    id = data.original.id;
    value = data.values.name;
  }
  useEffect(() => {
    data && setTagId(id);
    setText(value);
    setNoChanges('');
    // eslint-disable-next-line
  }, [data]);

  const update = (event) => {
    setText(event.target.value);
    if (typeof onChange === 'function') {
      onChange(event.target.value);
    }
  };
  const formRef = useRef();
  const tagNameRef = useRef();
  const [formTag, setFormTag] = useState();
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

  const handleAddTag = (e) => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT'].includes(i.nodeName)
    );

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormTag({ ...formTag, formName, errors });

    if (!hasError) {
      if (tagNameRef.current.value.trim() === '') {
        handleAction(tagNameRef.current.value.trim(), 0);
      } else if (value === tagNameRef.current.value.trim()) {
        setNoChanges('No changes detected');
        return false;
      }
      if (title === 'Add Tag') {
        handleAction(tagNameRef.current.value.trim(), 0);
      } else {
        handleAction(tagNameRef.current.value.trim(), tagId);
      }
    }
  };

  return (
    <Modal
      size="md"
      isOpen={showModal}
      centered={true}
      onClosed={handleModalClose}
    >
      <ModalHeader toggle={hideModal}>
        <i
          className={
            title === 'Add Tag'
              ? 'fas fa-tags text-warning mr-2'
              : 'fas fa-tags text-green mr-2'
          }
        ></i>
        {title}
      </ModalHeader>
      <ModalBody>
        <Form name="addTag" innerRef={formRef} autoComplete="off">
          <FormGroup row>
            <Label for="add_tag_name" sm={12} lg={3}>
              Tag Name<span className="text-danger">*</span>
            </Label>
            <Col sm={12} lg={9}>
              {title === 'Add Tag' && (
                <Input
                  type="text"
                  name="tagName"
                  id="add_tag_name"
                  maxLength={100}
                  data-validate='["required"]'
                  invalid={hasError('tagName', 'required') || addOrEditError}
                  innerRef={tagNameRef}
                  autoComplete={false}
                ></Input>
              )}
              {title === 'Update Tag' && (
                <Input
                  type="text"
                  name="tagName"
                  id="add_tag_name"
                  maxLength={100}
                  data-validate='["required"]'
                  invalid={
                    hasError('tagName', 'required') ||
                    addOrEditError ||
                    noChanges
                  }
                  innerRef={tagNameRef}
                  value={text}
                  onChange={update}
                ></Input>
              )}
              <div className="invalid-feedback">
                {addOrEditError
                  ? addOrEditError
                  : noChanges
                  ? noChanges
                  : 'Please enter the tag name'}
              </div>
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color="primary"
          onClick={handleAddTag}
          disabled={showActionBtnSpinner}
          icon={showActionBtnSpinner ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
        >
          {showActionBtnSpinner
            ? 'Wait...'
            : title === 'Update Tag'
            ? 'Update'
            : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

AddTagModal.propTypes = {
  handleAction: PropTypes.func.isRequired,
  showActionBtnSpinner: PropTypes.bool.isRequired,
  showModal: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

export default AddTagModal;
