/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLazyQuery } from '@apollo/react-hooks';
import {
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import ClButton from '../../Common/Button';
import { FETCH_TOUCH_QUERY_BY_FILTER } from '../../queries/TouchQuery';
import { notify, trimValue } from '../../../util/index';

const CompleteLinkedInTouchModal = ({
  showLinkedInCompleteTouch,
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
  const [isOpen, setIsOpen] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(
    touchInfoDetails?.linkedinUrl || ''
  );
  const [showLinkedInTextField, setShowLinkedInTextField] = useState(false);
  const linkedInRef = useRef();
  const commentsRef = useRef();
  const subTouches = {
    'LinkedIn-Connection Request': 'Send Invite in LinkedIn',
    'LinkedIn-Get Introduced': 'Get Introduced in linkedIn',
    'LinkedIn-Post Interaction': 'Interaction Post in linkedIn',
    'LinkedIn-InMail': 'Send InMail in LinkedIn',
    'LinkedIn-View Profile': 'View Profile in LinkedIn',
    'LinkedIn-Follow Prospect': 'Follow Prospect in LinkedIn',
  };
  const [nextTouch, setNextTouch] = useState();
  const [viewCommentsArea, setViewCommentsArea] = useState(false);
  const [fetchNextTouch] = useLazyQuery(FETCH_TOUCH_QUERY_BY_FILTER, {
    onCompleted: (response) => {
      const data = response.touch.data || [];
      if (data.length > 0) {
        if (data[0].subTouch) {
          setNextTouch(
            response.touch.data[0].subTouch.replace('Others-', 'Social-')
          );
        } else {
          setNextTouch(response.touch.data[0].touchType);
        }
      } else {
        setNextTouch('N/A');
      }
    },
    onError: (response) => {
      notify(response, 'Failed to load Touch data');
    },
  });

  const handleLinkedInBtn = () => {
    const contactName = touchInfoDetails.contactName.split(' ');
    const firstName = contactName[0];
    const lastName = contactName[1];
    const accountName = touchInfoDetails.accountName;

    if (linkedinUrl) {
      const url =
        linkedinUrl.indexOf('http') === 0
          ? linkedinUrl
          : 'http://' + linkedinUrl;
      window.open(url);
    } else {
      window.open(
        `https://www.linkedin.com/search/results/people/?firstName='${firstName}'&keywords='${contactName}'&lastName='${lastName}'&origin='${accountName}'`
      );
    }
  };

  const completeTouch = (completeAndNext) => {
    handleCompleTouch(
      {
        touchType: 'linkedin',
        linkedInUrl: linkedinUrl.trim(),
        touchInput: trimValue(commentsRef?.current?.value)
          ? trimValue(commentsRef.current.value)
          : '',
        prospectId: touchInfoDetails.prospectId,
      },
      completeAndNext && completeAndNext === 'completeAndNext' ? true : false
    );
  };

  const handleCloseBtn = () => {
    handleNextTouch();
    setLinkedinUrl('');
    setViewCommentsArea(false);
    handleClose();
  };

  useEffect(() => {
    setLinkedinUrl(touchInfoDetails?.linkedinUrl || '');

    if (!touchInfoDetails.linkedinUrl) {
      setShowLinkedInTextField(true);
    }
  }, [touchInfoDetails]);

  useEffect(() => {
    if (showLinkedInCompleteTouch && showLinkedInTextField) {
      linkedInRef.current.focus();
    }
    // eslint-disable-next-line
  }, [showLinkedInTextField]);

  useEffect(() => {
    if (commentsRef?.current?.value) {
      commentsRef.current.value = '';
    }
    // eslint-disable-next-line
  }, [touchInfoDetails]);

  useEffect(() => {
    if (showLinkedInCompleteTouch) {
      fetchNextTouch({
        variables: {
          touchFilter: `filter[user][id]=${touchInfoDetails.userId}&filter[cadence][id]=${touchInfoDetails.cadenceId}&filter[stepNo]=${touchInfoDetails.stepNo}`,
        },
      });
    }
    // eslint-disable-next-line
  }, [showLinkedInCompleteTouch]);

  return (
    <Modal size="lg" isOpen={showLinkedInCompleteTouch} centered={true}>
      <ModalHeader toggle={handleCloseBtn}>
        {nextTouchLoading ? (
          <i className="fa fa-spinner fa-spin mr-2"></i>
        ) : (
          <i className="fab fa-linkedin-in mr-2 text-linkedin"></i>
        )}
        Complete Touch - LinkedIn
        {activeTab === 'LINKEDIN' && totalCount && (
          <small>
            <i>
              {' '}
              - {currentCount} of {totalCount} Prospect(s)
            </i>
          </small>
        )}
      </ModalHeader>
      <ModalBody className="px-4">
        <div className="p-3 ba">
          <Row>
            <Col className="text-warning">
              <strong> {touchInfoDetails.contactName}</strong>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col sm={5} className="text-dark text-bold pt-1">
              Current Cadence
            </Col>
            <Col sm={6} className="float-right pt-1">
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
              Current Touch
            </Col>
            <Col sm={6} className="float-right pt-1 text-nowrap">
              {touchInfoDetails.subTouch}
            </Col>
            <Col sm={5} className="text-dark text-bold pt-1">
              Last Touched On
            </Col>
            <Col sm={6} className="float-right pt-1">
              {touchInfoDetails.lastTouchDateTime}
            </Col>
            <Col sm={5} className="text-dark text-bold pt-1">
              Next Touch
            </Col>
            <Col sm={6} className="float-right pt-1 text-nowrap">
              {nextTouch}
            </Col>
            <Col
              sm={12}
              className="text-dark text-bold pt-1 pointer"
              onClick={() => {
                setViewCommentsArea((preValue) => !preValue);
              }}
            >
              Add a Comment
              <i className="fas fa-pencil-alt pl-2"></i>
            </Col>
            {viewCommentsArea && (
              <Col sm={12} className="float-right pt-1 text-break">
                <Input
                  type="textarea"
                  name="comments"
                  placeholder="Type Comments Here"
                  rows={3}
                  innerRef={commentsRef}
                />
              </Col>
            )}
          </Row>
        </div>
        <Col className="p-3 ba mt-3 mx-auto">
          <Row className="pb-3 bb">
            <Col>
              <h5 className="mb-0 text-bold">LinkedIn-Connection Request</h5>
            </Col>
          </Row>
          <div className="mt-2">
            <Row className="p-1">
              <Col className="text-center">
                <strong>
                  <i className="fa fa-user mr-2"></i>
                  <Link
                    title={touchInfoDetails.contactName}
                    style={{ color: '#000' }}
                    to={{
                      pathname:
                        '/prospects/list/' + touchInfoDetails.prospectId,
                      search: window.location.search,
                    }}
                  >
                    {touchInfoDetails.contactName}
                  </Link>
                </strong>
              </Col>
            </Row>
            <Row className="p-1">
              <Col className="text-center">
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
            </Row>
            <FormGroup row>
              <Label for="linked_request_url" sm={3}>
                LinkedIn URL
              </Label>
              <Col sm={9} className="d-flex align-items-center text-center">
                {showLinkedInTextField ? (
                  <Input
                    type="text"
                    name="linkedInRequestUrl"
                    id="linked_request_url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    onBlur={(e) => {
                      if (e.target.value) {
                        setShowLinkedInTextField(false);
                      }
                    }}
                    innerRef={linkedInRef}
                  />
                ) : (
                  <>
                    <div className="mr-2 text-truncate text-center">
                      {linkedinUrl}
                    </div>
                    <div
                      className="pointer"
                      onClick={() => {
                        setShowLinkedInTextField(true);
                      }}
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </div>
                  </>
                )}
              </Col>
            </FormGroup>
            <Row className="p-1">
              <Col className="text-center">
                <Button color="warning" onClick={handleLinkedInBtn}>
                  {subTouches[touchInfoDetails.subTouch]}
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
        <Col sm={8} className="mx-auto mt-2 p-0">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 border pointer"
          >
            Click <strong>{subTouches[touchInfoDetails.subTouch]}</strong>{' '}
            button above to complete this touch. For further instructions on how
            to do this, please click{' '}
            <i
              className={`fas text-danger mr-2 fa-angle-double-${
                isOpen ? 'up' : 'down'
              }`}
            ></i>
          </div>
          <Card
            className="mb-0 mt-2 border rounded-0"
            style={{ display: isOpen ? 'block' : 'none' }}
          >
            <CardBody>
              <ul>
                <li>
                  Once you have clicked the{' '}
                  <strong>{subTouches[touchInfoDetails.subTouch]}</strong>{' '}
                  button, results matching this prospect’s name will show.
                </li>
                <li>
                  If you see multiple prospects, please click on the profile for
                  the correct prospect.
                </li>
                <li>
                  After you have completed the above step within LinkedIn,
                  please go back to this Cadence window and click the{' '}
                  <strong>Complete Touch</strong> button.
                </li>
              </ul>
            </CardBody>
          </Card>
        </Col>
      </ModalBody>
      <ModalFooter className="card-footer">
        <ClButton
          className="mr-2"
          color="primary"
          icon={isRequestLoading ? 'fa fa-spinner fa-spin' : 'fas fa-check'}
          disabled={isRequestLoading || nextTouchLoading}
          onClick={(event) => {
            completeTouch('complete');
          }}
        >
          Complete Touch
        </ClButton>
        {activeTab === 'LINKEDIN' && totalCount && totalCount > 1 && (
          <ClButton
            className="pr-2"
            color="primary"
            title="Complete and Next"
            icon={
              isRequestLoading ? 'fa fa-spinner fa-spin' : 'fas fa-arrow-right'
            }
            disabled={isRequestLoading || nextTouchLoading}
            onClick={() => {
              completeTouch('completeAndNext');
            }}
          ></ClButton>
        )}
      </ModalFooter>
    </Modal>
  );
};
export default CompleteLinkedInTouchModal;
