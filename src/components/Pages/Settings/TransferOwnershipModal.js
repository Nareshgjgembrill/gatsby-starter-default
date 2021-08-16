/*
 * @author @Manimegalai V
 * @version V11.0
 */

import { FormValidator } from '@nextaction/components';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
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
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { getAllUsers } from '../../../store/actions/actions';
import Button from '../../Common/Button';
import UserContext from '../../UserContext';

const OptionComponent = ({ selectedUserId, users, currentUserId, toUser }) => {
  let userList = [];
  if (selectedUserId) {
    userList =
      users &&
      users.data &&
      users.data.filter((user) => user.id === selectedUserId);
  } else {
    userList =
      users &&
      users.data &&
      users.data.filter((user) => user.id !== parseInt(toUser));
  }
  return (
    <>
      <option></option>
      {userList &&
        userList.length > 0 &&
        userList.map((as) => {
          return (
            <option
              value={as.id}
              key={as.id}
              style={{
                fontWeight: as.isManagerUser === 'Y' ? 'bold' : '',
              }}
            >
              {as.displayName}
            </option>
          );
        })}
    </>
  );
};

const TransferOwnershipModal = ({
  hideModal,
  showModal,
  showActionBtnSpinner,
  handleAction,
  responseError,
  getAllUsers,
  users,
  selectedUserId,
}) => {
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = selectedUserId
    ? selectedUserId
    : userLoading
    ? 0
    : user.id;
  const [validationState, setValidationState] = useState();
  const [fromUser, setFromUser] = useState();
  const [toUser, setToUser] = useState([]);

  useEffect(() => {
    if (!users.fetchedAll) {
      getAllUsers(currentUserId, apiURL, token);
    }
    setFromUser('');
    setToUser('');
    // eslint-disable-next-line
  }, [showModal]);
  const formRef = useRef();
  const [formTransferOwner, setFormTransferOwner] = useState();

  const hasError = (inputName, method) => {
    return (
      formTransferOwner &&
      formTransferOwner.errors &&
      formTransferOwner.errors[inputName] &&
      formTransferOwner.errors[inputName][method]
    );
  };

  const handleModalClose = () => {
    setFormTransferOwner();
  };

  const handleTransferOwnership = (e) => {
    const form = formRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['SELECT'].includes(i.nodeName)
    );

    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFormTransferOwner({ ...formTransferOwner, formName, errors });
    if (!hasError) {
      const transferData = [...form.elements].reduce((trr, item) => {
        if (item.value.trim() !== '') {
          if (item.name === 'fromUserId') {
            trr['fromUser'] = item.options[item.selectedIndex].innerHTML;
          } else if (item.name === 'toUserId') {
            trr['toUser'] = item.options[item.selectedIndex].innerHTML;
          }
          trr[item.name] = item.value;
        }
        return trr;
      }, {});
      if (transferData.fromUserId === transferData.toUSerId) {
        setValidationState('From user to user cannot be same');
        return false;
      }
      handleAction(transferData);
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
        <i className="fas fa-user fa-lg text-info mr-2"></i>
        Transfer Ownership
      </ModalHeader>
      <ModalBody>
        <Form name="transferownership" innerRef={formRef}>
          <FormGroup row>
            <Label for="tc_transfer_ownership_from_user" sm={12} lg={3}>
              From<span className="text-danger">*</span>
            </Label>
            <Col sm={12} lg={9}>
              <Input
                type="select"
                name="fromUserId"
                id="tc_transfer_ownership_from_user"
                className="form-control"
                data-validate='["select"]'
                invalid={hasError('fromUserId', 'select') || validationState}
                onChange={(e) => {
                  setFromUser(e.target.value);
                }}
              >
                <OptionComponent
                  selectedUserId={selectedUserId}
                  users={users}
                  currentUserId={currentUserId}
                  toUser={toUser}
                ></OptionComponent>
              </Input>
              <div className="invalid-feedback">
                {validationState ? validationState : 'Please select a user'}
              </div>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="tc_transfer_ownership_to_user" sm={12} lg={3}>
              To<span className="text-danger">*</span>
            </Label>
            <Col sm={12} lg={9}>
              <Input
                type="select"
                name="toUserId"
                id="tc_transfer_ownership_to_user"
                className="form-control"
                data-validate='["select"]'
                invalid={
                  hasError('toUserId', 'select') ||
                  responseError ||
                  validationState
                }
                onChange={(e) => {
                  setToUser(e.target.value);
                }}
              >
                <option></option>
                {users?.data
                  .filter((user) => {
                    return (
                      user.id !== parseInt(fromUser) &&
                      user.id !== currentUserId
                    );
                  })
                  .map((as) => {
                    return (
                      <option
                        value={as.id}
                        key={as.id}
                        style={{
                          fontWeight: as.isManagerUser === 'Y' ? 'bold' : '',
                        }}
                      >
                        {as.displayName}
                      </option>
                    );
                  })}
                {users?.data.filter((user) => {
                  return (
                    user.id !== parseInt(fromUser) && user.id !== currentUserId
                  );
                }).length === 0 && <option>No users available</option>}
              </Input>
              <div className="invalid-feedback">
                {responseError
                  ? responseError
                  : validationState
                  ? validationState
                  : 'Please select a user'}
              </div>
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color="primary"
          onClick={handleTransferOwnership}
          disabled={showActionBtnSpinner}
          icon={showActionBtnSpinner ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
        >
          {showActionBtnSpinner ? 'Wait...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
TransferOwnershipModal.propTypes = {
  handleAction: PropTypes.func.isRequired,
  showActionBtnSpinner: PropTypes.bool.isRequired,
  showModal: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  users: state.users,
});
export default connect(mapStateToProps, { getAllUsers })(
  TransferOwnershipModal
);
