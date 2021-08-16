/*
 * @author @Manimegalai V
 * @version V11.0
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import { useLazyQuery } from '@apollo/react-hooks';
import { CREATE_TRANSFER_OWNERSHIP_QUERY } from '../../queries/SettingsQuery';
import Button from '../../Common/Button';
import ConfirmModal from '../../Common/ConfirmModal';
import TransferOwnershipModal from './TransferOwnershipModal';
import { notify, showErrorMessage } from '../../../util/index';

toast.configure();

const TransferOwnership = () => {
  const [showTransferOwnershipModal, setShowTransferOwnershipModal] = useState(
    false
  );
  const [responseError, setResponseError] = useState();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [transferData, setTransferData] = useState();
  const [fromUserName, setFromUserName] = useState();
  const [toUserName, setToUserName] = useState();

  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const [
    createTransferOwnership,
    {
      data: createTransferOwnershipData,
      loading: createTransferOwnershipLoading,
    },
  ] = useLazyQuery(CREATE_TRANSFER_OWNERSHIP_QUERY, {
    onCompleted: (response) => createTransferOwnershipCallback(response, true),
    onError: (response) => createTransferOwnershipCallback(response),
  });

  const handleSaveTransferOwnership = (trData) => {
    const trObject = {
      fromUserId: trData.fromUserId,
      toUserId: trData.toUserId,
    };
    setTransferData(trObject);
    setFromUserName(trData.fromUser);
    setToUserName(trData.toUser);
    setShowTransferOwnershipModal(false);
    setShowConfirmModal(true);
  };
  const createTransferOwnershipCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      notify(
        'Transferred successfully!',
        'success',
        'create_transfer_ownership'
      );
      setShowTransferOwnershipModal(false);
      setShowConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to transfer ownership.',
        createTransferOwnershipData,
        'create_transfer_ownership'
      );
      setShowConfirmModal(false);
    }
  };

  return (
    <Card className="b">
      <CardHeader className="bg-gray-lighter text-bold">
        Transfer Ownership Settings
      </CardHeader>
      <CardBody className="bt">
        <FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                name="transferOwnershipAccounts"
                checked
                disabled
              />
              Accounts
            </Label>
          </FormGroup>
        </FormGroup>
        <FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                name="transferOwnershipProspects"
                checked
                disabled
              />
              Prospects
            </Label>
          </FormGroup>
        </FormGroup>
        <FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                name="transferOwnershipCadence"
                checked
                disabled
              />
              Cadences
            </Label>
          </FormGroup>
        </FormGroup>
        <FormGroup>
          <FormGroup check>
            <Label check>
              <Input
                type="checkbox"
                name="transferOwnershipEmailTemplate"
                checked
                disabled
              />
              Email Templates
            </Label>
          </FormGroup>
        </FormGroup>
        <Button
          color="primary"
          onClick={() => {
            setResponseError('');
            setShowTransferOwnershipModal(true);
          }}
          icon="fas fa-cog "
        >
          Transfer Ownership
        </Button>
      </CardBody>
      <TransferOwnershipModal
        hideModal={() => {
          setShowTransferOwnershipModal(false);
        }}
        showModal={showTransferOwnershipModal}
        showActionBtnSpinner={createTransferOwnershipLoading}
        handleAction={handleSaveTransferOwnership}
        responseError={responseError}
      />
      <ConfirmModal
        confirmBtnIcon="fas fa-check"
        confirmBtnText={createTransferOwnershipLoading ? 'Wait...' : 'OK'}
        handleCancel={() => setShowConfirmModal(false)}
        showConfirmModal={showConfirmModal}
        handleConfirm={() => {
          const input = transferData;
          createTransferOwnership({
            variables: { input },
          });
        }}
        confirmBtnColor="primary"
        showConfirmBtnSpinner={createTransferOwnershipLoading}
      >
        <span>
          {`You are about to transfer ownership from <${fromUserName}> to <${toUserName}>. This will exit all Prospects from their existing Cadences. Please click OK to proceed.`}
        </span>
      </ConfirmModal>
    </Card>
  );
};
export default TransferOwnership;
