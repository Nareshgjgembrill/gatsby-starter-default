/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React from 'react';
import {
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';

import Button from '../Common/Button';

const TouchInfoModal = ({
  touchInfoHeading,
  touchInfoHeadingIcon,
  touchInfoFooterButton,
  showTouchInfo,
  touchInfoDetails,
  handleClose,
  handleShowCompleTouchWindow,
  confirBtnIcon,
  confirmBtnText,
}) => {
  return (
    <Modal size="md" isOpen={showTouchInfo} centered={true}>
      <ModalHeader toggle={handleClose}>
        <i className={`${touchInfoHeadingIcon} mr-2`}></i>
        {touchInfoHeading}
      </ModalHeader>
      <ModalBody>
        <Row className="px-4">
          <Col>
            <Row>
              <Col sm={4} className="text-dark text-bold pt-1 pr-0">
                Contact Name
              </Col>
              <Col className="float-right pt-1 text-break">
                {touchInfoDetails.contactName}
              </Col>
            </Row>
            <Row>
              <Col sm={4} className="text-dark text-bold pt-1 pr-0">
                Cadence
              </Col>
              <Col className="float-right pt-1 text-break">
                {touchInfoDetails.cadenceName}
              </Col>
            </Row>
            <Row>
              <Col sm={4} className="text-dark text-bold pt-1 pr-0">
                Touch
              </Col>
              <Col className="float-right pt-1 text-break">
                {touchInfoDetails.touchType}
              </Col>
            </Row>
            <Row>
              {touchInfoDetails.currentTouchType === 'OTHERS' && (
                <>
                  <Col sm={4} className="text-dark text-bold pt-1 pr-0">
                    Social Touch
                  </Col>
                  <Col className="float-right pt-1 text-break">
                    {touchInfoDetails.subTouch}
                  </Col>
                </>
              )}
            </Row>
            <Row>
              {touchInfoDetails.currentTouchType === 'EMAIL' && (
                <>
                  <Col sm={4} className="text-dark text-bold pt-1 pr-0">
                    Email Template
                  </Col>
                  <Col className="float-right pt-1 text-break">
                    {touchInfoDetails.templateName}
                  </Col>
                </>
              )}
            </Row>
            <Row>
              <Col sm={4} className="text-dark text-bold pt-1 pr-0">
                Time to complete
              </Col>
              <Col className="float-right pt-1 text-break">
                {touchInfoDetails.timeToComplete}
              </Col>
            </Row>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color={touchInfoFooterButton}
          className={
            touchInfoDetails.currentTouchType === 'EMAIL' ? 'text-white' : ''
          }
          onClick={handleShowCompleTouchWindow}
          icon={confirBtnIcon}
        >
          {confirmBtnText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TouchInfoModal;
