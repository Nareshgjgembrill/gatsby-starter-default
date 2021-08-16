/**
 * @author ranbarasan
 * @version v11.0
 */
import React, { useEffect, useRef, useState } from 'react';
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
} from 'reactstrap';
import ClctiClient from '../../../apollo/ClctiClient';
import { default as ClButton } from '../../Common/Button';
toast.configure();

const CallMeToJoinModal = ({
  dialingPhoneNumber,
  requerstApiUrl,
  showModal,
  hideModal,
  handleActionCallMe,
  clkSessionId,
  metaData,
}) => {
  const countryCodePrefixMsg =
    'You have entered a phone number which appears to an international number. Please choose the below checkbox and try again.';
  const [requestProcessing, setRequestProcessing] = useState(false);
  const [callmeNumber, setCallmeNumber] = useState();

  const callMeToJoinFormRef = useRef();
  const notify = (message, ToasterType = 'error') => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
    });
  };

  const formatPhoneNbr = (phoneNumber) => {
    if (phoneNumber === null || phoneNumber === undefined) {
      return '';
    }
    return phoneNumber.length > 10
      ? phoneNumber
      : phoneNumber.replace(/^(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  useEffect(() => {
    setCallmeNumber(formatPhoneNbr(metaData.call_me_phone_numbers));
  }, [metaData]);

  const saveCallmeNumber = (callmeNo) => {
    const callmeFormData = new URLSearchParams();
    callmeFormData.append('session_id', clkSessionId);
    callmeFormData.append('call_me_phone_numbers', callmeNo);
    callmeFormData.append('phone_number', callmeNo);

    const apiUrl = requerstApiUrl + '/savecallmetojoin';

    ClctiClient(callmeFormData, apiUrl)
      .then((res) => {
        if (res.status === 1) {
          notify(res.error_reason, 'error');
        }
      })
      .catch((error) => {
        notify(error.message, 'error');
      });
  };

  const handleSaveCallMeToJoin = () => {
    const form = callMeToJoinFormRef.current;
    const callmeToJoinNumber = form.callMeToJoinNumber.value.replace(
      /[^\d]/g,
      ''
    );
    const countryCodePrefixed = form.countryCodePrefixed.checked;
    if (callmeToJoinNumber === '') {
      notify('Please enter a valid phone number.', 'error');
      return;
    }

    if (callmeToJoinNumber.length > 10 && countryCodePrefixed === false) {
      notify('ERROR (CD027): ' + countryCodePrefixMsg, 'error');
      return null;
    }
    saveCallmeNumber(callmeToJoinNumber);

    setRequestProcessing(true);
    callMeToJoin(countryCodePrefixed, callmeToJoinNumber);
  };

  const callMeToJoin = (countryCodePrefixed, callmeToJoinNumber) => {
    const callmeFormData = new URLSearchParams();
    callmeFormData.append('session_id', clkSessionId);
    callmeFormData.append('callme_phone_number', callmeToJoinNumber);
    callmeFormData.append('country_code_prefixed', countryCodePrefixed);

    const apiUrl = requerstApiUrl + '/callmejoin';
    ClctiClient(callmeFormData, apiUrl)
      .then((res) => {
        setRequestProcessing(false);

        if (res.data.status === 1) {
          const message =
            res.data?.error_reason.indexOf(
              'org.asteriskjava.live.NoSuchChannelException'
            ) !== -1
              ? 'Sorry! We could not reach you at the moment. Please try again later.'
              : res.data.error_reason;

          notify(message, 'error');
          return;
        }
        handleActionCallMe();
      })
      .catch((error) => {
        setRequestProcessing(false);
        notify(error.message, 'error');
      });
  };

  return (
    <div>
      <Modal isOpen={showModal} centered={true} className="color-regent-gray">
        <ModalHeader toggle={hideModal} className="color-bluewood">
          <i className="fa fa-phone-alt text-call mr-2"></i>We Can Call You
        </ModalHeader>
        <ModalBody>
          <Form name="callMeToJoin" innerRef={callMeToJoinFormRef}>
            <FormGroup className="mb-1">
              <Label for="call_me_to_join_number" className="mb-1">
                Have our system call you... Enter the phone number for us to
                call.
              </Label>
              <Input
                type="text"
                name="callMeToJoinNumber"
                id="call_me_to_join_number"
                autoComplete="nope"
                value={callmeNumber}
                onChange={(event) => {
                  setCallmeNumber(event.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveCallMeToJoin();
                  }
                }}
              />
            </FormGroup>
            <div className="col-sm-12 pl-0 text-sm text-muted">
              <i>
                For US please enter 10 digit phone number, for international
                please enter country code followed by phone number
              </i>
            </div>
            <FormGroup check className="pt-3">
              <Label check for="country_code_prefixed" className="text-sm">
                <Input
                  type="checkbox"
                  name="countryCodePrefixed"
                  id="country_code_prefixed"
                />
                Country code is prefixed in the above phone number
              </Label>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter className="card-footer">
          <ClButton
            color="primary"
            disabled={requestProcessing}
            icon={requestProcessing ? 'fas fa-spinner fa-spin' : 'fa fa-check'}
            title="Call me"
            onClick={() => {
              handleSaveCallMeToJoin();
            }}
          >
            {requestProcessing ? 'Wait...' : 'Call me'}
          </ClButton>
        </ModalFooter>
      </Modal>
    </div>
  );
};
export default CallMeToJoinModal;
