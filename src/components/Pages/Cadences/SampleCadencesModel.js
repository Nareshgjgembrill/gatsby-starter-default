import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
  ListGroup,
  ListGroupItem,
} from 'reactstrap';
import ScrollArea from 'react-scrollbar';
import { useLazyQuery } from '@apollo/react-hooks';
import { notify, showErrorMessage } from '../../../util/index';

import UserContext from '../../UserContext';
import ClButton from '../../Common/Button';
import CloneCadenceModel from './CloneCadenceModel';
import {
  FETCH_SAMPLE_CADENCES_QUERY,
  CLONE_SAMPLE_CADENCE_QUERY,
} from '../../queries/CadenceQuery';
import { toast } from 'react-toastify';
toast.configure();

const SampleCadencesModel = ({
  showModal,
  hideModal,
  handleClose,
  handleRefresh,
}) => {
  const sampleCadencesList = [
    'Awareness Maker',
    'Call Blaster',
    'Focused',
    'Make It Happen',
    'Opportunity Maker',
    'Persistence',
    'Prospect Maker',
    'Target Maker',
  ];

  const { user, loading: userLoading } = useContext(UserContext);
  const currentUserId = userLoading ? 0 : user.id;
  const [sampleCadence, setsampleCadence] = useState('Awareness Maker');
  const [
    showCloneCadenceConfirmModal,
    setShowCloneCadenceConfirmModal,
  ] = useState(false);

  const [
    getsampleCadences,
    { data: sampleCadencesData, loading: samplecadenceLoading },
  ] = useLazyQuery(FETCH_SAMPLE_CADENCES_QUERY, {});

  useEffect(() => {
    getsampleCadences({
      variables: {
        name: 'Awareness Maker',
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [
    cloneCadence,
    { data: cloneCadenceData, loading: cloneCadenceLoading },
  ] = useLazyQuery(CLONE_SAMPLE_CADENCE_QUERY, {
    onCompleted: (response) =>
      handleCloneCadenceRequestCallback(response, true),
    onError: (response) =>
      handleCloneCadenceRequestCallback(response, false, cloneCadenceData),
  });

  const handleCloneCadenceRequestCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Cadence saved successfully!', 'success', 'clone_sample_cadence');
      setShowCloneCadenceConfirmModal(false);
      handleClose(false);
      handleRefresh();
    } else {
      showErrorMessage(
        response,
        'Failed to create Cadence',
        errorData,
        'clone_sample_cadence'
      );
    }
  };

  const sampleData = useMemo(
    () =>
      sampleCadencesData && sampleCadencesData.cadences
        ? sampleCadencesData.cadences.data
        : [],
    [sampleCadencesData]
  );

  let emailCount = 0;
  let callCount = 0;
  let socialCount = 0;
  let Days = 0;
  const cadenceData = [];
  for (let i = 0; i < sampleData.length; i++) {
    if (sampleData[i]['name'] === sampleCadence) {
      cadenceData.push(sampleData[i]);
      if (sampleData[i]['touchType'] === 'EMAIL') {
        emailCount = emailCount + 1;
      } else if (sampleData[i]['touchType'] === 'CALL') {
        callCount = callCount + 1;
      } else if (sampleData[i]['touchType'] === 'OTHER') {
        socialCount = socialCount + 1;
      }
      Days = sampleData[i]['daySequenceWaitperiod'];
    }
  }

  const getTouchIcons = (touch, extraClass, removeColor) => {
    let className;
    if (touch === 'EMAIL')
      className = removeColor
        ? `fas fa-envelope ${extraClass}`
        : `fas fa-envelope ${extraClass} text-email`;
    else if (touch === 'OTHER')
      className = removeColor
        ? `fas fa-share-alt ${extraClass}`
        : `fas fa-share-alt ${extraClass} text-social pr-2`;
    else if (touch === 'CALL')
      className = removeColor
        ? `fas fa-phone-alt  ${extraClass}`
        : `fas fa-phone-alt ${extraClass} text-call pr-2`;
    else if (touch === 'LINKEDIN')
      className = removeColor
        ? `fab fa-linkedin-in ${extraClass}`
        : `fab fa-linkedin-in ${extraClass} text-linkedin`;
    else if (touch === 'TEXT')
      className = removeColor
        ? `fas fa-comments ${extraClass}`
        : `fas fa-comments ${extraClass} text-danger`;
    else className = ``;

    return <em className={className}></em>;
  };

  return (
    <Modal size="lg" isOpen={showModal} centered>
      <ModalHeader toggle={hideModal}>
        <i className="fas fa-list mr-2 text-danger"></i>Sample cadences
      </ModalHeader>

      <ModalBody className="px-5">
        <Row form>
          <Col md={5} className="pr-0">
            <p className="small">
              Here are some of the suggested Cadences to choose from
            </p>
            <ListGroup>
              {sampleCadencesList.map((cadence, index) => {
                return (
                  <ListGroupItem
                    key={index}
                    className="pointer"
                    onClick={() => {
                      setsampleCadence(cadence);
                      getsampleCadences({
                        variables: {
                          name: cadence,
                        },
                      });
                    }}
                    active={sampleCadence === cadence}
                  >
                    {cadence}
                  </ListGroupItem>
                );
              })}
            </ListGroup>
          </Col>
          <Col md={7} className="pl-4">
            <ListGroup>
              <h4>{sampleCadence.toUpperCase()}</h4>
              <Row className="py-2">
                <Col className="d-flex flex-row">
                  <h6>
                    <span className="mr-4">
                      <i className="far fa-hand-pointer mr-2 text-danger"></i>
                      <strong>{cadenceData.length}</strong>
                    </span>
                  </h6>
                  <h6>
                    <span className="mr-1">
                      <i className="far fa-calendar-alt mr-2 text-info"></i>
                      <strong>{Days}</strong>
                    </span>
                  </h6>
                  <span className="mr-4">Days</span>

                  <h6>
                    <span className="mr-4">
                      <i className="fas fa-envelope mr-2 text-email"></i>
                      <strong>{emailCount}</strong>
                    </span>
                  </h6>
                  <h6>
                    <span className="mr-4">
                      <i className="fas fa-phone-alt mr-2 text-call"></i>
                      <strong>{callCount}</strong>
                    </span>
                  </h6>
                  <h6>
                    <span className="mr-4">
                      <i className="fas fa-share-alt mr-2 text-social"></i>
                      <strong>{socialCount}</strong>
                    </span>
                  </h6>
                </Col>
              </Row>
              {samplecadenceLoading && (
                <Progress animated striped value="100">
                  Loading sample cadence
                </Progress>
              )}
              <ScrollArea
                speed={0.8}
                className="area"
                contentClassName="content"
                horizontal={true}
                style={{
                  minHeight: '315px',
                  maxHeight: '411px',
                }}
              >
                <ListGroup>
                  {cadenceData.map((cad, index) => {
                    return (
                      <ListGroupItem tag="button" key={index}>
                        <Row>
                          <Col sm={1} className="pl-3">
                            {getTouchIcons(cad.touchType)}
                          </Col>
                          <Col sm={2} className="pl-0 pr-1 text-right">
                            <span>{`Day ${cad.daySequenceWaitperiod} :`}</span>
                          </Col>
                          <Col sm={7} className="px-0 text-left">
                            <span className="text-wrap">
                              {`Touch ${cad.stepNo}`} -{' '}
                              {cad.touchType === 'OTHER'
                                ? 'SOCIAL'
                                : cad.touchType}
                            </span>
                          </Col>
                        </Row>
                      </ListGroupItem>
                    );
                  })}
                </ListGroup>
              </ScrollArea>
            </ListGroup>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter className="card-footer">
        <ClButton
          type="submit"
          color="primary"
          icon="fas fa-clone mr-2"
          onClick={() => {
            setShowCloneCadenceConfirmModal(true);
          }}
        >
          Clone
        </ClButton>
      </ModalFooter>

      <CloneCadenceModel
        showModal={showCloneCadenceConfirmModal}
        currentUserId={currentUserId}
        Loading={cloneCadenceLoading}
        sampleCadenceClone={true}
        cadenceName={sampleCadence}
        handleAction={(data) => {
          const { cloneCadenceName } = data;
          cloneCadence({
            variables: {
              cloneCadenceName: cloneCadenceName.trim(),
              sampleCadenceName: sampleCadence,
            },
          });
        }}
        hideModal={() => {
          setShowCloneCadenceConfirmModal(false);
        }}
      />
    </Modal>
  );
};
export default SampleCadencesModel;
