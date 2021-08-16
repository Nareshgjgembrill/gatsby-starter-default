/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Col,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import ClButton from '../../Common/Button';
import { trimValue } from '../../../util/index';

const CompleteOtherTouchModal = ({
  showCompleteOtherTouch,
  touchInfoDetails,
  handleCompleTouch,
  handleClose,
  isRequestLoading,
  activeTab,
  handleNextTouch,
  totalCount,
  nextTouchLoading,
  currentCount,
}) => {
  const commentsRef = useRef();

  useEffect(() => {
    if (commentsRef?.current?.value) {
      commentsRef.current.value = '';
    }
    // eslint-disable-next-line
  }, [touchInfoDetails]);

  return (
    <Modal size="md" isOpen={showCompleteOtherTouch} centered={true}>
      <ModalHeader
        toggle={() => {
          handleNextTouch();
          handleClose();
        }}
      >
        {nextTouchLoading ? (
          <i className="fa fa-spinner fa-spin mr-2"></i>
        ) : (
          <i className="fas fa-share-alt text-social mr-2"></i>
        )}
        Complete Touch - Social
        {activeTab === 'OTHERS' && totalCount && (
          <small>
            <i>
              {' '}
              - {currentCount} of {totalCount} Prospect(s)
            </i>
          </small>
        )}
      </ModalHeader>
      <ModalBody className="px-4">
        <Row className="px-3">
          <Col sm={5} className="text-dark text-bold pt-1">
            Account Name
          </Col>
          <Col sm={6} className="float-right pt-1 text-break">
            <Link
              title={touchInfoDetails.accountName}
              style={{ color: '#000' }}
              to={{
                pathname: '/accounts/' + touchInfoDetails.accountId,
              }}
            >
              {touchInfoDetails.accountName}
            </Link>
          </Col>
          <Col sm={5} className="text-dark text-bold pt-1">
            Contact Name
          </Col>
          <Col sm={6} className="float-right pt-1 text-break">
            <Link
              title={touchInfoDetails.contactName}
              style={{ color: '#000' }}
              to={{
                pathname: '/prospects/list/' + touchInfoDetails.prospectId,
                search: window.location.search,
              }}
            >
              {touchInfoDetails.contactName}
            </Link>
          </Col>
          <Col sm={5} className="text-dark text-bold pt-1">
            Cadence
          </Col>
          <Col sm={6} className="float-right pt-1 text-break">
            <Link
              title={touchInfoDetails.cadenceName}
              style={{ color: '#000' }}
              to={{
                pathname:
                  '/cadences/' + touchInfoDetails.cadenceId + '/touches/view',
                search: window.location.search,
                state: {
                  cadenceName: touchInfoDetails.cadenceName,
                },
              }}
            >
              {touchInfoDetails.cadenceName}
            </Link>
          </Col>
          <Col sm={5} className="text-dark text-bold pt-1">
            Touch
          </Col>
          <Col sm={6} className="float-right pt-1 text-break">
            {touchInfoDetails.touchType}
          </Col>
          <Col sm={12} className="text-dark text-bold pt-1">
            Comments
          </Col>
          <Col sm={12} className="float-right pt-1 text-break">
            <Input
              type="textarea"
              name="comments"
              placeholder="Type Comments Here"
              rows={6}
              innerRef={commentsRef}
            />
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className="card-footer">
        <ClButton
          className="mr-2"
          color="warning"
          icon={isRequestLoading ? 'fa fa-spinner fa-spin' : 'fas fa-check'}
          disabled={isRequestLoading || nextTouchLoading}
          onClick={() => {
            const requestData = {
              touchType: 'others',
              touchInput: trimValue(commentsRef?.current?.value)
                ? trimValue(commentsRef.current.value)
                : '',
              prospectId: touchInfoDetails.prospectId,
            };
            handleCompleTouch(requestData, false);
          }}
        >
          Complete Touch
        </ClButton>
        {activeTab === 'OTHERS' && totalCount && totalCount > 1 && (
          <ClButton
            className="pr-2"
            color="warning"
            title="Complete and Next"
            icon={
              isRequestLoading ? 'fa fa-spinner fa-spin' : 'fas fa-arrow-right'
            }
            disabled={isRequestLoading || nextTouchLoading}
            onClick={() => {
              const requestData = {
                touchType: 'others',
                touchInput: trimValue(commentsRef?.current?.value)
                  ? trimValue(commentsRef.current.value)
                  : '',
                prospectId: touchInfoDetails.prospectId,
              };
              handleCompleTouch(requestData, true);
            }}
          ></ClButton>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default CompleteOtherTouchModal;
