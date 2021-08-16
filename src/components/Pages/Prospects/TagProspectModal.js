/**
 * @author @anbarasanr
 * @version V11.0
 */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import TagList from '../../Common/TagList';

const initialHasError = {
  tagNameErr: '',
};
const TagProspectModal = ({
  handleAction,
  hideModal,
  showActionBtnSpinner,
  showModal,
  prospect,
  selectedUserId,
  isRefreshTagList,
}) => {
  const [hasError, setHasError] = useState(initialHasError);
  const [tagIds, setTagIds] = useState();
  const [tagLabel, setTagLabel] = useState();
  const invalidStyle = {
    width: '100%',
    marginTop: '0.25rem',
    fontSize: '80%',
    color: '#f05050',
  };
  const handleModalClose = () => {
    setTagIds('');
  };
  useEffect(() => {
    if (showModal) {
      setTagLabel('');
      if (prospect && prospect.associations && prospect.associations.tag) {
        const tagArray = [];
        prospect.associations.tag.forEach((item) => {
          tagArray.push(item.id);
        });
        setTagIds(tagArray);
      } else {
        setTagIds('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const handleTagProspect = (e) => {
    const hasErrorJson = JSON.parse(JSON.stringify(initialHasError));
    if (tagIds === undefined || tagIds === '' || tagIds.length === 0) {
      hasErrorJson['tagNameErr'] = 'Please select a tag to assign';
      setHasError(hasErrorJson);
      return;
    }
    handleAction(tagIds, tagLabel);
  };

  return (
    <Modal
      size="md"
      isOpen={showModal}
      centered={true}
      onClosed={handleModalClose}
    >
      <ModalHeader toggle={hideModal}>
        <i className="fas fa fa-tag mr-2"></i>Tag Prospect(s)
      </ModalHeader>
      <ModalBody className="px-5">
        <Form name="tagProspect">
          <FormGroup row className="d-flex justify-content-center">
            <Label for="tag_prospect" sm={2} className="pr-0">
              Tag<span className="text-danger">*</span>
            </Label>
            <Col sm={7} className="pl-0">
              <TagList
                value={tagIds}
                disabled={false}
                multiselect={true}
                placeHolder=""
                onChange={(value, label) => {
                  setTagIds(value);
                  setTagLabel(label);
                }}
                handleAddTag={true}
                selectedUserId={selectedUserId}
                isRefreshTagList={isRefreshTagList}
              />
              <p style={invalidStyle}>
                {hasError.tagNameErr ? hasError.tagNameErr : null}
              </p>{' '}
            </Col>
            <span className="mt-3">
              Note: This will replace the existing Tags assigned to the
              prospect.
            </span>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button
          color="primary"
          onClick={handleTagProspect}
          disabled={showActionBtnSpinner}
        >
          <i
            className={
              showActionBtnSpinner ? 'fas fa-spinner fa-spin' : 'fa fa-tag'
            }
          ></i>
          &nbsp;&nbsp;
          {showActionBtnSpinner ? 'Wait...' : 'Tag'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

TagProspectModal.propTypes = {
  handleAction: PropTypes.func.isRequired,
  showActionBtnSpinner: PropTypes.bool.isRequired,
  showModal: PropTypes.bool.isRequired,
};

// To prevent re-render of this component if parent state which are not related to this component chagnes
const MemorizedTagProspectModal = React.memo(TagProspectModal, (prev, next) => {
  return (
    prev.showModal === next.showModal &&
    prev.showActionBtnSpinner === next.showActionBtnSpinner
  );
});

// // This is required for redux
export default MemorizedTagProspectModal;
// export default connect(mapStateToProps, { getAllTags })(TagProspectModal);
