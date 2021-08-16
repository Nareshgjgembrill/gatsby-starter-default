/* eslint-disable jsx-a11y/iframe-has-title */
/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import { Col, Modal, ModalHeader, Row } from 'reactstrap';
import { toast } from 'react-toastify';
import { FETCH_LAST_OUTCOME } from '../queries/ProspectsQuery';
import AlertModal from '../Common/AlertModal';
import { showErrorMessage } from '../../util/index';
import { trimValue } from '../../util';

toast.configure();
const ZipwhipTocuhModal = ({
  showZipwhipTouchWindow,
  phoneNumber,
  zipwhipSessionKey,
  handleClose,
  prospectId,
  cadenceToRender,
  contactName,
}) => {
  const [lastActivityData, setLastActivityData] = useState({});
  const [getLastActivity, { data: lastActivityResponse }] = useLazyQuery(
    FETCH_LAST_OUTCOME,
    {
      variables: { prospectId: prospectId },
      notifyOnNetworkStatusChange: true,
      onCompleted: (response) => {
        if (response?.lastOutcome?.data?.length > 0) {
          setLastActivityData(response.lastOutcome.data[0]);
        }
      },
      onError: (error) => {
        showErrorMessage(
          error,
          'Sorry! Failed to fetch activity data',
          lastActivityResponse,
          'failed_activity_data'
        );
      },
    }
  );

  useEffect(() => {
    if (showZipwhipTouchWindow && trimValue(phoneNumber) && zipwhipSessionKey) {
      getLastActivity();
    }
    // eslint-disable-next-line
  }, [showZipwhipTouchWindow]);

  const iframeStyle = {
    width: '100%',
    height: '400px',
    backgroundColor: '#fff',
    border: '0px',
  };

  const zipwhipWidgetURL = 'https://embed.zipwhip.com/messaging/';
  const phoneNo = trimValue(phoneNumber + '')
    .toString()
    .replace(/[^0-9|+]/g, '');
  const zhipWhipRequestUrl = zipwhipWidgetURL + phoneNo;
  let lastTouchedTime = '';
  if (lastActivityData.lastActivityDateTime) {
    lastTouchedTime = new Date(lastActivityData.lastActivityDateTime)
      .toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .replace(',', '');
  }
  return (
    <div>
      {showZipwhipTouchWindow && !trimValue(phoneNumber) ? (
        <AlertModal
          alertType={'error'}
          handleClose={handleClose}
          showModal={showZipwhipTouchWindow}
        >
          <span>No phone numbers available to text</span>
        </AlertModal>
      ) : showZipwhipTouchWindow && !zipwhipSessionKey ? (
        <AlertModal
          alertType={'error'}
          handleClose={handleClose}
          showModal={showZipwhipTouchWindow}
        >
          <span>Please connect Zipwhip and then try again.</span>
        </AlertModal>
      ) : (
        <Modal size="md" isOpen={showZipwhipTouchWindow} centered={true}>
      <div>
        <ModalHeader toggle={handleClose}>
          <i className="fa fa-comments text-danger mr-2"></i>Complete Touch -
          Text
        </ModalHeader>
        <div className="px-2">
          <Row className="p-2 bb">
            <Col className="text-dark text-bold">Prospect</Col>
            <Col className="float-right">{contactName}</Col>
          </Row>
          <Row className="p-2 bb">
            <Col className="text-dark text-bold">Cadence</Col>
            <Col className="float-right">
              {lastActivityData.lastCadenceName
                ? lastActivityData.lastCadenceName
                : cadenceToRender
                ? cadenceToRender.name
                : ''}
            </Col>
          </Row>
          <Row className="p-2 bb">
            <Col className="text-dark text-bold">Last Touch</Col>
            <Col className="float-right">
              {lastActivityData?.lastTouchType === 'OTHERS'
                ? 'SOCIAL'
                : lastActivityData.lastTouchType}
            </Col>
          </Row>
          <Row className="p-2 bb">
            <Col className="text-dark text-bold">Last Touched On</Col>
            <Col className="float-right">{lastTouchedTime}</Col>
          </Row>
          <Row className="p-2 bb">
            <Col className="text-dark text-bold">Last Outcome</Col>
            <Col className="float-right">{lastActivityData?.lastOutcome?.replaceAll('Other', 'Social')}</Col>
          </Row>
        </div>
        <div>
          <iframe
            src={zhipWhipRequestUrl}
            style={iframeStyle}
            id="chat"
          ></iframe>
        </div>
      </div>
    </Modal>
      )}
    </div>
  );
};

export default ZipwhipTocuhModal;
