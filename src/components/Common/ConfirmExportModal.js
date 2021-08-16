/**
 * @author @rkrishna-gembrill
 * @since Jun 22 2020
 * @version V11.0
 */
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';

const ConfirmExportModal = ({
  children,
  handleCancel,
  handleConfirm,
  header,
  data,
  modalSize,
  showConfirmModal,
  fieldMappingData,
  zIndex,
}) => {
  const [csv, setCsv] = useState();
  const standardFields = [
    'first_name',
    'last_name',
    'title',
    'email_id',
    'phone',
    'account_name',
    'contact_name',
  ];

  const convertDateFormat = (data) => {
    const date = data.split('-');
    return date[1] + '/' + date[2] + '/' + date[0];
  };

  useEffect(() => {
    if (data?.data?.length > 0) {
      const fieldArray = fieldMappingData?.fields?.data
        .filter(
          (item) =>
            standardFields.indexOf(item.clFieldName) === -1 &&
            item.hidden !== true
        )
        .sort(function (a, b) {
          if (a.label < b.label) {
            return -1;
          }
          if (a.label > b.label) {
            return 1;
          }
          return 0;
        })
        .map((field) => {
          return field;
        });
      const csvString = [
        [
          'First Name',
          'Last Name',
          'Title',
          'Email',
          'Phone',
          'Account Name',
          'Contact Name',
          fieldArray?.map((field) => {
            return field.label;
          }),
        ],
        ...data?.data?.map((prospect) => [
          `"${prospect.firstName ? prospect.firstName : ''}"`,
          `"${prospect.lastName ? prospect.lastName : ''}"`,
          `"${prospect.title ? prospect.title : ''}"`,
          `"${prospect.email ? prospect.email : ''}"`,
          `"${prospect.phone ? prospect.phone : ''}"`,
          `"${prospect.accountName ? prospect.accountName : ''}"`,
          `"${prospect.contactName ? prospect.contactName : ''}"`,
          fieldArray?.map((field) => {
            const fieldControlType = field.controlType.toLowerCase();
            const tagIds = prospect?.associations?.tag.map((tag) => tag.id);
            const tagNames = data.tags
              ? data.tags
                  .filter((tag) => tagIds.includes(tag.id))
                  .map((tag) => tag.name)
              : [];
            let timeStampValue =
              prospect[field.name] === 'OTHERS'
                ? 'SOCIAL'
                : prospect[field.name];
            if (fieldControlType === 'timestamp' && timeStampValue) {
              timeStampValue = moment(timeStampValue).format('M/D/YYYY h:mm A');
            } else if (fieldControlType === 'date' && timeStampValue) {
              timeStampValue = convertDateFormat(timeStampValue);
            } else if (fieldControlType === 'select' && timeStampValue) {
              timeStampValue = fieldMappingData?.fields?.includedAssociations?.fieldDropdownValues
                .filter((data) => data.id === parseInt(timeStampValue))
                .map((data) => data.value);
            }
            return field.name === 'tag'
              ? `"${tagNames.join(',')}"`
              : `"${timeStampValue ? timeStampValue : ''}"`;
          }),
        ]),
      ]
        .map((e) => e.join(','))
        .join('\n');

      const CSV = encodeURIComponent(csvString);
      setCsv(CSV);
    }
  }, [data, fieldMappingData, standardFields]);

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
        <Button
          color="success"
          id="download-csv"
          href={'data:text/plain;charset=utf-8,' + csv}
          download="prospects.csv"
          onClick={handleConfirm}
        >
          <i className="fas fa-file-export mr-2"></i>
          Export
        </Button>
      </ModalFooter>
    </Modal>
  );
};

ConfirmExportModal.defaultProps = {
  header: 'Please Confirm!',
  modalSize: 'md',
  zIndex: 1050,
};

ConfirmExportModal.propTypes = {
  children: PropTypes.element.isRequired,
  handleCancel: PropTypes.func.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  header: PropTypes.string,
  modalSize: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showConfirmModal: PropTypes.bool.isRequired,
  zIndex: PropTypes.number,
};

export default ConfirmExportModal;
