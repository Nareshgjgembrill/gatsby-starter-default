/**
 * @author @rkrishna-gembrill
 * @since Jun 22 2020
 * @version V11.0
 */
import PropTypes from 'prop-types';
import React from 'react';
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';

const ConfirmModal = ({
  children,
  confirmBtnColor,
  confirmBtnText,
  confirmBtnIcon,
  handleConfirm,
  handleCancel,
  header,
  modalSize,
  showConfirmBtnSpinner,
  showConfirmModal,
  zIndex,
  otherBtnRequired,
  otherBtnColor,
  otherBtnText,
  otherBtnIcon,
  otherBtnAlign,
  otherBtnHandler,
}) => {
  return (
    <Modal
      size={modalSize}
      isOpen={showConfirmModal}
      centered={true}
      zIndex={zIndex}
    >
      <ModalHeader toggle={handleCancel}>
        <i className="fas fa-exclamation-circle mr-2 text-warning"></i>
        {header}
      </ModalHeader>
      <ModalBody className="px-4 text-center">
        <Row>
          <Col>{children}</Col>
        </Row>
      </ModalBody>
      <ModalFooter className="card-footer">
        {otherBtnRequired === true && otherBtnAlign === 'left' && (
          <Button
            color={otherBtnColor}
            onClick={otherBtnHandler}
            className="mr-2"
          >
            {otherBtnIcon && otherBtnIcon.trim() !== '' && (
              <i className={otherBtnIcon + ' mr-2'}></i>
            )}
            {otherBtnText}
          </Button>
        )}

        <Button
          color={confirmBtnColor}
          onClick={handleConfirm}
          disabled={showConfirmBtnSpinner}
        >
          {confirmBtnIcon &&
            confirmBtnIcon.trim() !== '' &&
            !showConfirmBtnSpinner && (
              <i className={confirmBtnIcon + ' mr-2'}></i>
            )}
          {showConfirmBtnSpinner && (
            <i className="fas fa-spinner fa-spin mr-2"></i>
          )}
          {showConfirmBtnSpinner ? 'Wait...' : confirmBtnText}
        </Button>
        {otherBtnRequired === true && otherBtnAlign === 'right' && (
          <Button color={otherBtnColor} onClick={handleCancel}>
            {otherBtnIcon && otherBtnIcon.trim() !== '' && (
              <i className={otherBtnIcon + ' mr-2'}></i>
            )}
            {otherBtnText}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

ConfirmModal.defaultProps = {
  confirmBtnColor: 'primary',
  confirmBtnText: 'Confirm',
  header: 'Please Confirm!',
  modalSize: 'md',
  showConfirmBtnSpinner: false,
  zIndex: 1050,
  otherBtnRequired: false,
  otherBtnAlign: 'right',
};

ConfirmModal.propTypes = {
  children: PropTypes.element.isRequired,
  confirmBtnColor: PropTypes.oneOf(['primary', 'danger']),
  confirmBtnText: PropTypes.string,
  confirmBtnIcon: PropTypes.string,
  handleCancel: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  header: PropTypes.string,
  modalSize: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showConfirmBtnSpinner: PropTypes.bool.isRequired,
  showConfirmModal: PropTypes.bool.isRequired,
  zIndex: PropTypes.number,
  otherBtnRequired: PropTypes.oneOf([true, false]),
  otherBtnColor: PropTypes.string,
  otherBtnText: PropTypes.string,
  otherBtnIcon: PropTypes.string,
  otherBtnAlign: PropTypes.string,
};

export default ConfirmModal;
