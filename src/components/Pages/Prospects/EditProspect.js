import React, { useState } from 'react';
import { Prompt } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  InputGroup,
  Label,
  Row,
} from 'reactstrap';
import CloseButton from '../../Common/CloseButton';
import { default as ClButton } from '../../Common/Button';
import TagList from '../../Common/TagList';

const EditInput = ({
  field,
  tagIds,
  setTagIds,
  prospectToRender,
  fieldDropDown,
  fieldMappingData,
  validateDate,
}) => {
  const [formChange, setFormChange] = useState(false);
  const fieldControlType =
    field.controlType === 'boolean'
      ? 'checkbox'
      : field.controlType === 'numeric'
      ? 'number'
      : field.controlType.toLowerCase();

  return (
    <>
      <FormGroup inline={fieldControlType === 'checkbox'}>
        {fieldControlType === 'checkbox' ? (
          <Label for={field.clFieldName} className="mb-1 text-sm" check>
            {field.label} :
            <Input
              type={fieldControlType}
              onChange={() => setFormChange(true)}
              name={field.name}
              disabled={field.readonly}
              className="ml-2 position-absolute mt-1"
            />
          </Label>
        ) : (
          <Label for={field.clFieldName} className="mb-1 text-sm">
            {field.label}
          </Label>
        )}
        {fieldControlType === 'select' && field.name === 'tag' ? (
          <TagList
            name="tagName"
            value={tagIds}
            disabled={false}
            onChange={(value) => {
              setTagIds(value);
              setFormChange(true);
            }}
            handleAddTag={true}
            multiselect={true}
          />
        ) : fieldControlType === 'select' ? (
          <Input
            type={fieldControlType}
            name={field.name}
            disabled={field.readonly}
            onChange={() => setFormChange(true)}
            defaultValue={prospectToRender[field.name] || ''}
          >
            <option></option>
            {fieldDropDown(fieldMappingData, field.id)}
          </Input>
        ) : fieldControlType === 'timestamp' ? (
          <InputGroup>
            <Input
              type="date"
              name={field.name}
              className="timestamp px-1 w-50"
              disabled={field.readonly}
              onChange={(e) => {
                setFormChange(true);
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
                  setFormChange(true);
                  e.target.previousSibling.value = new Date()
                    .toISOString()
                    .slice(0, 10);
                }
              }}
            />
          </InputGroup>
        ) : fieldControlType === 'integer' || fieldControlType === 'number' ? (
          <Input
            type="number"
            name={field.name}
            onChange={() => setFormChange(true)}
            disabled={field.readonly}
            data-validate={'["' + fieldControlType + '"]'}
          />
        ) : (
          fieldControlType !== 'checkbox' && (
            <Input
              type={fieldControlType}
              name={field.name}
              onChange={() => setFormChange(true)}
              disabled={field.readonly}
              autoComplete="nope"
            />
          )
        )}
      </FormGroup>
      <Prompt
        when={formChange}
        message="Your changes will not be saved. Do you wish to continue?"
      />
    </>
  );
};

const EditProspect = (props) => {
  const {
    handleUpdateProspect,
    updateProspectLoading,
    checkUnSavedChangesDetected,
    cancelEdit,
    editFormRef,
    fieldMappingData,
    fieldMappingLoading,
    fieldDropDown,
    error,
    tagIds,
    setTagIds,
    prospectToRender,
    validateDate,
  } = props;

  const order = [
    'account_name',
    'first_name',
    'last_name',
    'title',
    'email_id',
    'phone',
    'extension',
    'city',
    'state',
  ];

  return (
    <div className="mt-2">
      <Card className="card-default">
        <CardHeader className="bg-white d-flex justify-content-between align-items-center border-bottom">
          <div>
            <i className="fas fa-user mr-2"></i>
            Edit Prospect
          </div>
          <div className="text-right">
            <CloseButton
              color="secondary"
              onClick={() => {
                if (!checkUnSavedChangesDetected()) {
                  cancelEdit();
                }
              }}
              btnTxt="Cancel"
            ></CloseButton>
            <ClButton
              color="primary"
              className="ml-1"
              onClick={handleUpdateProspect}
              disabled={updateProspectLoading}
              icon={
                updateProspectLoading ? 'fa fa-spinner fa-spin' : 'fas fa-check'
              }
              title="Save Changes"
            >
              {updateProspectLoading ? 'Wait...' : 'Save'}
            </ClButton>
          </div>
        </CardHeader>
        <CardBody>
          <Form innerRef={editFormRef}>
            <Row form className="mx-n3">
              <Col md={4} className="px-3">
                {!fieldMappingLoading &&
                  !error &&
                  fieldMappingData?.fields?.includedAssociations?.fields
                    .filter(
                      (item) =>
                        item.implicit === true &&
                        item.clNativeColumn === false &&
                        item.name !== 'contactName'
                    )
                    .sort((a, b) => {
                      const index1 = order.indexOf(a.clFieldName);
                      const index2 = order.indexOf(b.clFieldName);
                      return (
                        (index1 > -1 ? index1 : Infinity) -
                        (index2 > -1 ? index2 : Infinity)
                      );
                    })
                    .map((field, i) => (
                      <EditInput
                        key={i}
                        field={field}
                        tagIds={tagIds}
                        setTagIds={setTagIds}
                        prospectToRender={prospectToRender}
                        fieldDropDown={fieldDropDown}
                        fieldMappingData={fieldMappingData}
                        validateDate={validateDate}
                      />
                    ))}
              </Col>
              <Col md={4} className="px-3">
                {!fieldMappingLoading &&
                  !error &&
                  fieldMappingData?.fields?.includedAssociations?.fields
                    .filter(
                      (item) =>
                        item.implicit === false && item.clNativeColumn === false
                    )
                    .sort(function (a, b) {
                      if (a.label < b.label) {
                        return -1;
                      }
                      if (a.label > b.label) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((field, i) => (
                      <EditInput
                        key={i}
                        field={field}
                        tagIds={tagIds}
                        setTagIds={setTagIds}
                        prospectToRender={prospectToRender}
                        fieldDropDown={fieldDropDown}
                        fieldMappingData={fieldMappingData}
                        validateDate={validateDate}
                      />
                    ))}
              </Col>
              <Col md={4} className="px-3">
                {!fieldMappingLoading &&
                  !error &&
                  fieldMappingData?.fields?.includedAssociations?.fields
                    .filter(
                      (item) =>
                        item.implicit === false && item.clNativeColumn === true
                    )
                    .sort(function (a, b) {
                      if (a.label < b.label) {
                        return -1;
                      }
                      if (a.label > b.label) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((field, i) => (
                      <EditInput
                        key={i}
                        field={field}
                        tagIds={tagIds}
                        setTagIds={setTagIds}
                        prospectToRender={prospectToRender}
                        fieldDropDown={fieldDropDown}
                        fieldMappingData={fieldMappingData}
                        validateDate={validateDate}
                      />
                    ))}
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default EditProspect;
