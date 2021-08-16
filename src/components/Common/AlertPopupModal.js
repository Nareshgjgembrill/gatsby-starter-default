import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';

const AlertPopupModal = ({
  headerIcon,
  alertBtnText,
  alertBtnIcon,
  alertBtnColor,
  handleClose,
  header,
  modalSize,
  showAlertPopupModal,
  children,
}) => {
  return (
    <Modal size={modalSize} isOpen={showAlertPopupModal} centered={true}>
      <ModalHeader>
        {headerIcon && <i className={headerIcon}></i>}
        {header}
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col>{children}</Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color={alertBtnColor} onClick={handleClose}>
          <i className={alertBtnIcon + ' mr-2'}></i>
          {alertBtnText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

AlertPopupModal.defaultProps = {
  alertBtnColor: 'primary',
  alertBtnText: 'OK',
  header: 'Alert',
  modalSize: 'md',
};

AlertPopupModal.propTypes = {
  headerIcon: PropTypes.string,
  children: PropTypes.element.isRequired,
  alertBtnColor: PropTypes.oneOf(['primary', 'danger']),
  alertBtnText: PropTypes.string,
  alertBtnIcon: PropTypes.string,
  handleClose: PropTypes.func.isRequired,
  header: PropTypes.string,
  modalSize: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showAlertPopupModal: PropTypes.bool.isRequired,
};
export default AlertPopupModal;
