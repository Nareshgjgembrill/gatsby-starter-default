/**
 * @author @rkrishna-gembrill
 * @version V11.0
 */
import { FormValidator } from '@nextaction/components';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
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
import AccountList from '../../Common/AccountList';
import TagList from '../../Common/TagList';
const initialHasError = {
  companyNameError: '',
  emailFormatError: '',
};

toast.configure();

const AddProspectModal = ({
  showModal,
  handleAction,
  hideModal,
  currentUserId,
  showActionBtnSpinner,
}) => {
  const formRef = React.useRef();
  const [tagIds, setTagIds] = useState();
  const [accountId, setAccountId] = useState();
  const [form, setForm] = useState({});

  const [commonError, setCommonError] = useState(initialHasError);
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
      toastId: 'add_prospect_notify',
      autoClose: 4000,
    });
  };

  useEffect(() => {
    if (showModal) {
      setTagIds('');
      setAccountId('');
      setCommonError(initialHasError);
    }
  }, [currentUserId, showModal]);

  // Reset Modal
  const handleModalClose = () => {
    setForm();
  };

  const handleSaveProspect = (e) => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT', 'SELECT'].includes(i.nodeName)
    );
    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    let isValid = hasError;
    const commonErr = JSON.parse(JSON.stringify(initialHasError));
    if (form.phone.value.trim() !== '' || form.email.value.trim() !== '') {
      errors['phone'] = { required: false };
      errors['email'] = { required: false };
      isValid =
        Object.keys(errors).filter(
          (key) => errors[key].required || errors[key].select
        ).length > 0;
    }

    setForm({ ...form, formName, errors });

    if (form.email.value.trim() !== '') {
      const pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );

      if (!pattern.test(form.email.value)) {
        isValid = true;
        commonErr['emailFormatError'] = 'Please enter valid email address';
      }
    }

    if (form.phone.value.trim() !== '' && form.phone.value.trim().length <= 6) {
      notify('Phone must be minimum of 7 digits.', 'error');
      return;
    }

    if (!isValid) {
      const prospectData = [...form.elements].reduce((acc, item) => {
        if (item.value.trim() !== '' && item.name !== '') {
          acc[item.name] = item.value;
        }
        return acc;
      }, {});

      if (tagIds !== undefined && tagIds !== '') {
        const tags = [];
        tagIds.forEach((element) => {
          tags.push({ id: element });
        });
        prospectData['tag'] = tags;
      }
      if (accountId && accountId !== '') {
        prospectData.account = { id: accountId };
      }
      handleAction(prospectData);
    } else {
      setCommonError(commonErr);
    }
  };

  return (
    <Modal
      size="lg"
      isOpen={showModal}
      centered={true}
      onClosed={handleModalClose}
      className="container-md"
    >
      <ModalHeader toggle={hideModal}>
        <Row>
          <Col>
            <i className="fa fa-user-plus text-warning mr-2"></i>Add New
            Prospect
          </Col>
        </Row>
      </ModalHeader>
      <Form name="addProspect" innerRef={formRef}>
        <ModalBody className="px-5">
          <Row form>
            <Col md={6} className="pr-2">
              <FormGroup>
                <Label for="add_prospect_first_name">
                  First Name<span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  name="firstName"
                  id="add_prospect_first_name"
                  autoComplete="nope"
                  data-validate='["required"]'
                  invalid={
                    hasError('firstName', 'required') ||
                    hasError('firstName', 'text')
                  }
                />
                <div className="invalid-feedback">First Name is required</div>
              </FormGroup>
            </Col>
            <Col md={6} className="pl-2">
              <FormGroup>
                <Label for="add_prospect_last_name">
                  Last Name<span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  name="lastName"
                  autoComplete="nope"
                  id="add_prospect_last_name"
                  data-validate='["required"]'
                  invalid={
                    hasError('lastName', 'required') ||
                    hasError('lastName', 'text')
                  }
                />
                <div className="invalid-feedback">Last Name is required</div>
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col md={6} className="pr-2">
              <FormGroup>
                <Label for="add_prospect_title">Title</Label>
                <Input
                  type="text"
                  name="title"
                  id="add_prospect_title"
                  autoComplete="nope"
                />
              </FormGroup>
            </Col>
            <Col md={6} className="pl-2">
              <FormGroup>
                <Label for="add_prospect_account_name">
                  Company
                </Label>
                <AccountList
                  value={accountId}
                  disabled={false}
                  placeHolder=""
                  onChange={(value) => {
                    setAccountId(value);
                  }}
                  handleAddAccount={true}
                />
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col md={6} className="pr-2">
              <FormGroup>
                <Label for="add_prospect_phone">
                  Phone<span className="text-warning">#</span>
                </Label>
                <Input
                  type="text"
                  name="phone"
                  id="add_prospect_phone"
                  autoComplete="nope"
                  data-validate='["required"]'
                  invalid={
                    hasError('phone', 'required') || hasError('phone', 'text')
                  }
                />
              </FormGroup>
            </Col>
            <Col md={6} className="pl-2">
              <FormGroup>
                <Label for="add_prospect_email">
                  Email<span className="text-warning">#</span>
                </Label>
                <Input
                  type="email"
                  name="email"
                  id="add_prospect_email"
                  autoComplete="nope"
                  data-validate='["required"]'
                  invalid={
                    hasError('email', 'required') || hasError('email', 'text')
                  }
                />
                <small className="text-danger">
                  {commonError.emailFormatError
                    ? commonError.emailFormatError
                    : null}
                </small>
              </FormGroup>
            </Col>
            {hasError('email', 'required') && (
              <small className="text-danger mb-2 pl-2 mt-n2">
                Phone or Email is require/mandatory.
              </small>
            )}
          </Row>
          <Row form>
            <Col md={6} className="pr-2">
              <FormGroup>
                <Label for="add_prospect_city">City</Label>
                <Input
                  type="text"
                  name="city"
                  id="add_prospect_city"
                  autoComplete="nope"
                />
              </FormGroup>
            </Col>
            <Col md={6} className="pl-2">
              <FormGroup>
                <Label for="add_prospect_state">State</Label>
                <Input
                  type="text"
                  name="state"
                  id="add_prospect_state"
                  autoComplete="nope"
                />
              </FormGroup>
            </Col>
          </Row>
          <Row form>
            <Col md={6} className="pr-2">
              <FormGroup>
                <Label for="add_prospect_tag">Tag</Label>
                <TagList
                  value={tagIds}
                  disabled={false}
                  multiselect={true}
                  placeHolder=""
                  name="tagName"
                  onChange={(value) => {
                    setTagIds(value);
                  }}
                  handleAddTag={true}
                />
              </FormGroup>
            </Col>
            <Col md={6} className="pl-2">
              <FormGroup>
                <Label for="add_prospect_record_type">
                  Record Type<span className="text-danger">*</span>
                </Label>
                <Input
                  type="select"
                  name="recordType"
                  id="add_prospect_record_type"
                  data-validate='["select"]'
                  invalid={hasError('recordType', 'select')}
                >
                  <option></option>
                  <option>Contact</option>
                  <option>Lead</option>
                </Input>
                <div className="invalid-feedback">Record Type is required</div>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col className="text-right font-italic">
              <small>
                <span className="mr-2">
                  <span className="text-danger">*</span> Denotes mandatory
                </span>
                <span className="mr-2">
                  <span className="text-warning">#</span> Either one is
                  mandatory
                </span>
              </small>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="card-footer">
          <Button
            color="green"
            className="text-white"
            onClick={handleSaveProspect}
            disabled={showActionBtnSpinner}
          >
            <i
              className={
                (showActionBtnSpinner
                  ? 'fas fa-spinner fa-spin'
                  : 'fa fa-plus') + ' mr-2'
              }
            ></i>
            {showActionBtnSpinner ? 'Wait...' : 'Save'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

// This is required for redux
export default AddProspectModal;
