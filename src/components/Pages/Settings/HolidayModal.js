/*
 * @author @rManimegalai
 * @version V11.0
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import moment from 'moment';
import Button from '../../Common/Button';
import { useLazyQuery } from '@apollo/react-hooks';
import { SHOW_FEDERAL_HOLIDAY } from '../../queries/SettingsQuery';
import HolidayGrid from './HolidayGrid';

const HolidayModal = ({ hideModal, showModal }) => {
  const [holidaysData, setHolidaysData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const holidaysCompleteData = (response) => {
    if (response && response.holiday && response.holiday.data) {
      setHolidaysData(response.holiday.data);
      setPageCount(
        response.holiday.paging
          ? Math.ceil(response.holiday.paging.totalCount / limit)
          : 0
      );
      setTotalCount(
        response.holiday.paging ? response.holiday.paging.totalCount : 0
      );
    }
  };
  const [
    getHolidays,
    { loading: holidayLoading, error: holidayError },
  ] = useLazyQuery(SHOW_FEDERAL_HOLIDAY, {
    onCompleted: (response) => holidaysCompleteData(response),
  });

  useEffect(() => {
    getHolidays({
      variables: {
        limit: limit,
        offset: offset,
      },
    });
    // eslint-disable-next-line
  }, [showModal]);

  const columns = [
    {
      Header: 'Date',
      accessor: 'holidayDate',
      width: '50%',
      Cell: function (props) {
        if (props.value) {
          return moment(props.value).format('M/D/YYYY');
        } else {
          return null;
        }
      },
    },
    {
      Header: 'Holiday',
      accessor: 'holidayName',
      width: '50%',
    },
  ];

  return (
    <Modal size="lg" isOpen={showModal} centered={true}>
      <ModalHeader toggle={hideModal}>Federal Holidays</ModalHeader>
      <ModalBody className="py-0">
        <div className="overflow-auto" style={{ height: '350px' }}>
          <HolidayGrid
            columns={columns}
            data={holidaysData}
            loading={holidayLoading}
            error={holidayError}
            totalCount={totalCount}
            currentPageIndex={offset}
            pageSize={limit}
            pageCount={pageCount}
            fetchData={({ pageIndex, pageSize }) => {
              setOffset(pageIndex);
              setLimit(pageSize);
              getHolidays({
                variables: {
                  limit: pageSize,
                  offset: pageIndex,
                },
              });
            }}
          />
        </div>
      </ModalBody>
      <ModalFooter className="card-footer">
        <Button color="danger" icon="fa fa-times" onClick={hideModal}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

HolidayModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
};

export default HolidayModal;
