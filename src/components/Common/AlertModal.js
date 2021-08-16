import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

const AlertModal = (props) => {
  const {
    alertBtnText,
    alertType,
    children,
    handleClose,
    header,
    modalSize,
    showModal,
  } = props;

  return (
    <div>
      <Modal size={modalSize} isOpen={showModal} centered={true}>
        <ModalHeader>
          <i
            className={`${
              alertType === 'success'
                ? 'far fa-check-circle'
                : 'fas fa-exclamation-circle'
            } mr-1`}
          ></i>
          {header}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            color={alertType === 'success' ? 'success' : 'danger'}
            onClick={handleClose}
          >
            {alertBtnText}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

AlertModal.defaultProps = {
  alertBtnText: 'OK',
  header: 'Alert',
  modalSize: 'md',
};

AlertModal.propTypes = {
  alertType: PropTypes.oneOf(['error', 'success']).isRequired,
  alertBtnText: PropTypes.string,
  children: PropTypes.element.isRequired,
  handleClose: PropTypes.func.isRequired,
  header: PropTypes.string,
  modalSize: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showModal: PropTypes.bool.isRequired,
};

export default AlertModal;
