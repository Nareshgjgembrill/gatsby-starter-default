import React from 'react';
import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';
import {
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import { FECTH_ALL_MEMBER_STAGE_QUERY } from '../../queries/SettingsQuery';
import Button from '../../Common/Button';

const EditOutcomeModal = ({
  data,
  showModal,
  handleModalClose,
  hideModal,
  editTouchOutcome,
  editTouchOutcomeLoading,
}) => {
  const { data: memberStages } = useQuery(FECTH_ALL_MEMBER_STAGE_QUERY, {});
  let memberStageData = '';
  if (memberStages !== undefined) {
    memberStageData = memberStages.member.data.map((mu) => {
      return (
        <option mid={mu.id} value={mu.lookupValue} key={mu.id}>
          {mu.lookupValue}
        </option>
      );
    });
  }
  let outComeId = 0;
  const formRef = React.useRef();
  const { register, getValues, reset } = useForm();

  if (data !== undefined) {
    outComeId = data.original.id;
  }
  let outcomesData;
  React.useEffect(() => {
    if (data !== undefined) {
      // eslint-disable-next-line
      outcomesData = {
        defaultAction: data.original.defaultAction,
        outcomeGroup: data.original.outcomeGroup,
        displayMetrics: data.original.displayMetrics ? true : false,
        outComes: data.original.outComes,
        touchType: data.original.touchType,
      };
      reset(outcomesData);
    }
  }, [data]);

  const updateTouchOutcome = () => {
    const reactRoot = document.getElementById('outcome_group').selectedOptions;
    const meberStageId = reactRoot[0].getAttribute('mid');
    const val = getValues();
    const input = {
      showOnMetrics: val.displayMetrics,
      memberStageId: parseInt(meberStageId),
      defaultAction: val.defaultAction,
    };
    if (outComeId !== 0) {
      editTouchOutcome(outComeId, input);
    }
  };
  return (
    <Modal
      size="lg"
      isOpen={showModal}
      centered={true}
      onClosed={handleModalClose}
    >
      <ModalHeader toggle={hideModal}>Edit Outcome</ModalHeader>
      <ModalBody>
        <Form innerRef={formRef}>
          <FormGroup row>
            <Label for="touch_type" sm={12} md={3}>
              Touch Type
            </Label>
            <Col sm={12} md={9}>
              <Input
                type="text"
                id="touch_type"
                name="touchType"
                innerRef={register({})}
                disabled
              ></Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="touch_outcome" sm={12} md={3}>
              Touch Outcome
            </Label>
            <Col sm={12} md={9}>
              <Input
                type="text"
                id="touch_outcome"
                name="outComes"
                innerRef={register({})}
                disabled
              ></Input>
            </Col>
          </FormGroup>
          <Row>
            <Col sm={12} md={3}></Col>
            <FormGroup check sm={12} md={9} className="ml-3">
              <Input
                type="checkbox"
                id="display_metrics"
                name="displayMetrics"
                innerRef={register({})}
              ></Input>
              <Label for="display_metrics">
                Display Metrics for this Outcome
              </Label>
            </FormGroup>
          </Row>
          <FormGroup row>
            <Label for="outcome_group" sm={12} md={3}>
              Outcome Group
            </Label>
            <Col sm={12} md={9}>
              <Input
                type="select"
                id="outcome_group"
                name="outcomeGroup"
                innerRef={register({})}
              >
                {memberStageData}
              </Input>
            </Col>
          </FormGroup>
          <FormGroup row>
            <Label for="default_action" sm={12} md={3}>
              Default Action
            </Label>
            <Col sm={12} md={9}>
              <Input
                type="select"
                id="default_action"
                name="defaultAction"
                innerRef={register({})}
              >
                <option value="Exit Cadence">Exit Cadence</option>
                <option value="Move To Next Touch">Move To Next Touch</option>
                <option value="Move To Another Cadence">
                  Move To Another Cadence
                </option>
                <option value="No Action">No Action</option>
              </Input>
            </Col>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color="primary"
          disabled={editTouchOutcomeLoading}
          onClick={() => {
            updateTouchOutcome();
          }}
          icon={
            editTouchOutcomeLoading ? 'fas fa-spinner fa-spin' : 'fa fa-check'
          }
        >
          {editTouchOutcomeLoading ? 'Wait...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
EditOutcomeModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
};
export default EditOutcomeModal;
