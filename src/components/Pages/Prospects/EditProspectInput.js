import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Form, FormGroup, Input, InputGroup, Label } from 'reactstrap';
import moment from 'moment';
import { FormValidator } from '@nextaction/components';
import TagList from '../../Common/TagList';
import {
  convertDateFormat,
  formatWebLink,
  isValidURL,
  useClickOutside,
} from '../../../util';

toast.configure();

const EditProspectInput = ({
  field,
  prospectToRender,
  tagNames,
  tagIds,
  setTagIds,
  fieldMappingData,
  fieldMappingLoading,
  prospectId,
  currentUserId,
  selectUserId,
  updateProspect,
  getEditedFields,
  error,
  fieldDropDown,
  validateDate,
}) => {
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const editFormRef = useRef(null);

  const notify = (message, ToasterType = 'error') => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: 'edit_error_toast',
      autoClose: 4000,
    });
  };

  const handleUpdateProspect = () => {
    const form = editFormRef?.current;
    const inputs = [...form?.elements].filter((i) => {
      return (
        !i.disabled &&
        i.name !== 'tagName' &&
        ['TEXTAREA', 'INPUT', 'SELECT'].includes(i.nodeName)
      );
    });

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    let isValid = hasError;

    if (form?.phone?.value !== '' || form?.email?.value !== '') {
      errors['phone'] = {
        required: false,
      };
      errors['email'] = {
        required: false,
      };
      isValid =
        Object.keys(errors).filter(
          (key) =>
            errors[key].required || errors[key].select || errors[key].email
        ).length > 0;
    }

    if (!isValid) {
      const prospectData = getEditedFields(inputs);

      if (Object.keys(prospectData).length === 0) {
        setShowEditIcon(false);
        setShowInput(false);
        return;
      }
      //Calling update prospects method
      updateProspect({
        variables: {
          prospectId: prospectId,
          input: prospectData,
        },
      });
    } else if (isValid) {
      notify('Please fill the mandatory fields and save again.', 'error');
    }
  };

  const fieldControlType = field.controlType.toLowerCase();
  let fieldValue =
    field.name === 'emailId'
      ? prospectToRender['email']
      : prospectToRender[field.name];

  if (fieldControlType === 'timestamp' && fieldValue) {
    fieldValue = moment(fieldValue).format('M/D/YYYY h:mm A');
  } else if (fieldControlType === 'date' && fieldValue) {
    fieldValue = convertDateFormat(fieldValue);
  } else if (fieldControlType === 'select' && fieldValue) {
    fieldValue =
      !error &&
      !fieldMappingLoading &&
      fieldMappingData?.fields?.includedAssociations?.fieldDropdownValues
        .filter((data) => data.id === parseInt(fieldValue))
        .map((data) => data.value);
  } else if (fieldControlType === 'boolean') {
    fieldValue = fieldValue ? (
      <i className="far fa-check-square"></i>
    ) : (
      <i className="far fa-square"></i>
    );
  }

  useEffect(() => {
    if (showInput && prospectToRender) {
      [...editFormRef?.current?.elements]
        .filter((ele) => ['TEXTAREA', 'INPUT', 'SELECT'].includes(ele.nodeName))
        .forEach((ele) => {
          if (ele.type === 'checkbox') {
            ele.checked =
              prospectToRender[ele.name] === 'true' ||
              prospectToRender[ele.name] === true;
          } else if (prospectToRender[ele.name] && ele.type === 'date') {
            ele.value = prospectToRender[ele.name].slice(0, 10);
          } else if (prospectToRender[ele.name] && ele.type === 'time') {
            ele.value = moment(prospectToRender[ele.name]).format('HH:mm');
          } else if (ele.name === 'emailId') {
            ele.name = 'email';
            ele.value = prospectToRender['email'] && prospectToRender['email'];
          } else if (prospectToRender[ele.name]) {
            ele.value = prospectToRender[ele.name];
          }
        });
    }
  }, [prospectToRender, editFormRef, showInput]);

  const domNode = useClickOutside(() => {
    handleUpdateProspect();
    setShowEditIcon(false);
    setShowInput(false);
  }, showInput);

  const editFieldControlType =
    field.controlType === 'boolean'
      ? 'checkbox'
      : field.controlType === 'numeric'
      ? 'number'
      : field.controlType.toLowerCase();

  return (
    <div ref={domNode}>
      {currentUserId === selectUserId ? (
        !showInput ? (
          <div
            className="mb-2 pointer"
            onDoubleClick={() => setShowInput(true)}
            onMouseOver={() => setShowEditIcon(true)}
            onMouseOut={() => setShowEditIcon(false)}
          >
            <span className="d-block text-sm pr-4 position-relative">
              {field.label}
              <i
                hidden={!showEditIcon}
                className="fas fa-pencil-alt fa-sm position-absolute my-auto"
                style={{
                  right: '0.6rem',
                  top: '0',
                  bottom: '0',
                  height: '12px',
                }}
              ></i>
            </span>
            <div className="form-field">
              {isValidURL(fieldValue) ? (
                <Link
                  to={{
                    pathname: formatWebLink(fieldValue),
                  }}
                  target="_blank"
                >
                  {fieldValue}
                </Link>
              ) : field.name === 'tag' ? (
                <span title={tagNames.join(',')}>{tagNames.join(',')}</span>
              ) : (
                fieldValue
              )}
            </div>
          </div>
        ) : (
          <Form innerRef={editFormRef}>
            <FormGroup
              className="mb-2"
              inline={editFieldControlType === 'checkbox'}
            >
              {editFieldControlType === 'checkbox' ? (
                <>
                  <Label
                    for={field.clFieldName}
                    className="mb-0 d-block text-sm pr-4 position-relative"
                    check
                  >
                    {field.label}
                    <i
                      className="fas fa-undo fa-sm position-absolute my-auto pointer"
                      style={{
                        right: '0',
                        top: '0',
                        bottom: '0',
                        height: '12px',
                      }}
                      title="Undo"
                      onClick={() => {
                        setShowEditIcon(false);
                        setShowInput(false);
                      }}
                    ></i>
                  </Label>
                  <div className="form-field">
                    <Input
                      type={editFieldControlType}
                      name={field.name}
                      disabled={field.readonly}
                      className="ml-0 position-static"
                    />
                  </div>
                </>
              ) : (
                <Label
                  for={field.clFieldName}
                  className="mb-0 d-block text-sm position-relative"
                >
                  {field.label}
                  <i
                    className="fas fa-undo fa-sm position-absolute my-auto pointer"
                    style={{
                      right: '0',
                      top: '0',
                      bottom: '0',
                      height: '12px',
                    }}
                    title="Undo"
                    onClick={() => {
                      setShowEditIcon(false);
                      setShowInput(false);
                    }}
                  ></i>
                </Label>
              )}
              {editFieldControlType === 'select' && field.name === 'tag' ? (
                <div className="form-field">
                  <TagList
                    name="tagName"
                    value={tagIds}
                    disabled={false}
                    onChange={(value) => {
                      setTagIds(value);
                    }}
                    handleAddTag={true}
                    multiselect={true}
                  />
                </div>
              ) : editFieldControlType === 'select' ? (
                <div className="form-field">
                  <Input
                    type={editFieldControlType}
                    name={field.name}
                    disabled={field.readonly}
                    defaultValue={prospectToRender[field.name] || ''}
                  >
                    <option></option>
                    {fieldDropDown(fieldMappingData, field.id)}
                  </Input>
                </div>
              ) : editFieldControlType === 'timestamp' ? (
                <div className="form-field">
                  <InputGroup>
                    <Input
                      type="date"
                      name={field.name}
                      className="timestamp px-1 w-50"
                      disabled={field.readonly}
                      onChange={(e) => {
                        validateDate(e.target.value);
                        e.target.nextSibling.value = new Date()
                          .toTimeString()
                          .slice(0, 5);
                      }}
                    />
                    <Input
                      type="time"
                      name={field.name}
                      className="timestamp px-1 w-auto"
                      disabled={field.readonly}
                      onChange={(e) => {
                        if (!e.target.previousSibling.value) {
                          e.target.previousSibling.value = new Date()
                            .toISOString()
                            .slice(0, 10);
                        }
                      }}
                    />
                  </InputGroup>
                </div>
              ) : editFieldControlType === 'integer' ||
                editFieldControlType === 'number' ? (
                <div className="form-field">
                  <Input
                    type="number"
                    name={field.name}
                    disabled={field.readonly}
                    data-validate={'["' + editFieldControlType + '"]'}
                  />
                </div>
              ) : (
                editFieldControlType !== 'checkbox' && (
                  <div className="form-field">
                    <Input
                      type={editFieldControlType}
                      name={field.name}
                      disabled={field.readonly}
                      autoComplete="nope"
                    />
                  </div>
                )
              )}
            </FormGroup>
          </Form>
        )
      ) : (
        <div className="mb-2 pointer">
          <span className="d-block text-sm pr-4">{field.label}</span>
          <div className="form-field">
            {isValidURL(fieldValue) ? (
              <Link
                to={{
                  pathname: formatWebLink(fieldValue),
                }}
                target="_blank"
              >
                {fieldValue}
              </Link>
            ) : field.name === 'tag' ? (
              <span title={tagNames.join(',')}>{tagNames.join(',')}</span>
            ) : (
              fieldValue
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProspectInput;
