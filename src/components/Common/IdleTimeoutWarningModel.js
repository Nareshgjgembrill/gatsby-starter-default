import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

const IdleTimeoutWarningModel = ({ resetIdleTimeOutTimer, timeOut }) => {
  const [modal, setModal] = useState(true);

  const toggle = () => {
    resetIdleTimeOutTimer();
    setModal(false);
  };

  return (
    <Modal isOpen={modal} toggle={toggle} centered={true}>
      <ModalHeader toggle={toggle}>Session Time Out</ModalHeader>
      <ModalBody>
        <h1>Sorry!</h1>
        <p>
          Your Koncert login is about to expire in
          <strong> {timeOut / 1000} seconds</strong>
        </p>
        <p>Please press any key or move your mouse to continue your login</p>
      </ModalBody>
    </Modal>
  );
};

export default IdleTimeoutWarningModel;