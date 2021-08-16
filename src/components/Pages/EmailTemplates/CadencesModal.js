import React, { useEffect, useMemo, useState } from 'react';
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import { useQuery } from '@apollo/react-hooks';
import { FETCH_TEMPLATE_CADENCES_QUERY } from '../../queries/EmailTemplatesQuery';
import CadencesGrid from './CadencesGrid';

const CadenceModal = ({ selectedUser, templateID, hideModal, showModal }) => {
  const [limit, setLimit] = useState(10);

  const [offset, setOffset] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const [sortBy, setSortBy] = useState('cadence][name');
  const [orderBy, setOrderBy] = useState('asc');
  const [totalCount, setTotalCount] = useState(0);
  const cadenceFilter = `filter[user][id]=:[${selectedUser}]`;

  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const {
    data: templateCadencesData,
    loading: templateCadencesLoading,
    error: templateCadencesError,
    refetch: refetchTemplateCadenceData,
  } = useQuery(FETCH_TEMPLATE_CADENCES_QUERY, {
    variables: {
      id: templateID,
      limit,
      offset,
      cadenceFilter,
      sortBy,
      orderBy,
    },
    notifyOnNetworkStatusChange: true,
    skip: !showModal,
  });

  const columns = React.useMemo(
    () => [
      {
        Header: 'Cadence Name',
        accessor: 'cadence][name',
        width: '40%',
        Cell: function (props) {
          return (
            <Row className="float-left">
              <Col className="text-break text-truncate-2line">
                {props.row.original.cadenceName}
              </Col>
            </Row>
          );
        },
      },
      {
        Header: 'Touch Type',
        accessor: 'showEmailsForReview',
        width: '30%',
        Cell: function (props) {
          return (
            <Row className="float-left">
              <Col>
                {props.value === 'Preview Email'
                  ? 'Personalized Email'
                  : props.value}
              </Col>
            </Row>
          );
        },
      },
      {
        Header: 'Touch Number',
        accessor: 'stepNo',
        width: '30%',
        Cell: function (props) {
          return (
            <Row>
              <Col className="d-flex justify-content-center">{props.value}</Col>
            </Row>
          );
        },
      },
    ],
    []
  );

  const gridData = useMemo(
    () =>
      templateCadencesData && templateCadencesData.TemplateCadences
        ? templateCadencesData.TemplateCadences.data
        : [],
    [templateCadencesData]
  );

  useEffect(
    () => {
      setPageCount(
        !templateCadencesLoading &&
          templateCadencesData?.TemplateCadences?.paging
          ? Math.ceil(
              templateCadencesData.TemplateCadences.paging.totalCount / limit
            )
          : 0
      );
      setTotalCount(
        !templateCadencesLoading &&
          templateCadencesData?.TemplateCadences?.paging
          ? templateCadencesData.TemplateCadences.paging.totalCount
          : 0
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gridData, limit, templateCadencesLoading]
  );

  return (
    <Modal size="lg" isOpen={showModal} centered>
      <ModalHeader toggle={hideModal}>
        <span className="d-flex align-items-center">
          <i className="svgicon koncert-cadence-icon fa-lg text-primary text-purple mr-2"></i>
          List of cadences using this template
        </span>
      </ModalHeader>
      <ModalBody>
        <CadencesGrid
          columns={columns}
          data={gridData}
          cadenceData={templateCadencesData}
          sortBy={sortBy}
          orderBy={orderBy}
          fetchData={({ pageIndex, pageSize }) => {
            setOffset(pageIndex);
            setCurrentPageIndex(pageIndex);
            setLimit(pageSize);
          }}
          loading={templateCadencesLoading}
          pageSize={limit}
          pageCount={pageCount}
          totalCount={totalCount}
          error={templateCadencesError}
          currentPageIndex={currentPageIndex}
          handleRefresh={refetchTemplateCadenceData}
          handleSortBy={(column, order) => {
            setSortBy(column);
            setOrderBy(order);
          }}
        />
      </ModalBody>
    </Modal>
  );
};
export default CadenceModal;
