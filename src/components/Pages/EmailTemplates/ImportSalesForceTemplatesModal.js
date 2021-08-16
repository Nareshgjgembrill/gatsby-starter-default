import React, { useState, useEffect } from 'react';
import {
  Card,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  CLONE_SF_TEMPLATE_QUERY,
  FETCH_SALESFORCE_TEMPLATES_QUERY,
} from '../../queries/EmailTemplatesQuery';
import SalesForceEmailTemplateGrid from './ImportSalesForceTemplatesGrid';
import CloneModal from './CloneModal';

const ImportSalesForceTemplatesModal = ({
  currentUserId,
  hideModal,
  showModal,
}) => {
  const [classicLimit, setClassicLimit] = useState(5);
  const [classicOffset, setClassicOffset] = useState(0);
  const [mailmergeLimit, setMailmergeLimit] = useState(5);
  const [mailmergeOffset, setMailmergeOffset] = useState(0);
  const [currentTemplate, setCurrentTemplate] = useState({});
  const [templateTypeForClone, setTemplateTypeForClone] = useState('');
  const [showCloneConfirmModal, setShowCloneConfirmModal] = useState(false);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [currentPageIndexMailmerge, setCurrentPageIndexMailMerge] = useState(0);
  const [pageCountMailmerge, setPageCountMailmerge] = useState(0);
  const [totalCountMailmerge, setTotalCountMailmerge] = useState(0);

  const templateActions = {
    CLONE_TEMPLATE: 'CLONE_TEMPLATE',
    VIEW_TEMPLATE: 'VIEW_TEMPLATE',
  };

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
    });
  };

  const {
    data: salesForceTemplatesData,
    loading: salesForceTemplatesLoading,
    error: salesForceTemplatesError,
    refetch: refetchClassic,
  } = useQuery(FETCH_SALESFORCE_TEMPLATES_QUERY, {
    variables: { type: 'classic', limit: classicLimit, offset: classicOffset },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: !showModal,
  });

  const {
    data: salesForceMailMergeTemplatesData,
    loading: salesForceMailMergeTemplatesLoading,
    error: salesForceMailMergeTemplatesError,
    refetch: refetchMailmerge,
  } = useQuery(FETCH_SALESFORCE_TEMPLATES_QUERY, {
    variables: {
      type: 'mailmerge',
      limit: mailmergeLimit,
      offset: mailmergeOffset,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-first',
    skip: !showModal,
  });

  const [cloneEmailTemplate, { loading: cloneTemplateLoading }] = useLazyQuery(
    CLONE_SF_TEMPLATE_QUERY,
    {
      onCompleted: (response) => cloneEmailTemplateCallBack(response, true),
      onError: (response) => cloneEmailTemplateCallBack(response),
    }
  );

  const salesForceTemplatesDatas =
    salesForceTemplatesData &&
    salesForceTemplatesData.salesForceTemplates &&
    salesForceTemplatesData.salesForceTemplates.data
      ? salesForceTemplatesData.salesForceTemplates.data
      : [];

  const salesForceTemplatesMailMergeDatas =
    salesForceMailMergeTemplatesData &&
    salesForceMailMergeTemplatesData.salesForceTemplates &&
    salesForceMailMergeTemplatesData.salesForceTemplates.data
      ? salesForceMailMergeTemplatesData.salesForceTemplates.data
      : [];

  useEffect(() => {
    setPageCount(
      !salesForceTemplatesLoading &&
        salesForceTemplatesData &&
        salesForceTemplatesData.salesForceTemplates &&
        salesForceTemplatesData.salesForceTemplates.paging
        ? Math.ceil(
            salesForceTemplatesData.salesForceTemplates.paging.totalCount /
              classicLimit
          )
        : 0
    );
    setTotalCount(
      !salesForceTemplatesLoading &&
        salesForceTemplatesData &&
        salesForceTemplatesData.salesForceTemplates &&
        salesForceTemplatesData.salesForceTemplates.paging
        ? salesForceTemplatesData.salesForceTemplates.paging.totalCount
        : 0
    );
    setPageCountMailmerge(
      !salesForceMailMergeTemplatesLoading &&
        salesForceMailMergeTemplatesData &&
        salesForceMailMergeTemplatesData.salesForceTemplates &&
        salesForceMailMergeTemplatesData.salesForceTemplates.paging
        ? Math.ceil(
            salesForceMailMergeTemplatesData.salesForceTemplates.paging
              .totalCount / mailmergeLimit
          )
        : 0
    );
    setTotalCountMailmerge(
      !salesForceMailMergeTemplatesLoading &&
        salesForceMailMergeTemplatesData &&
        salesForceMailMergeTemplatesData.salesForceTemplates &&
        salesForceMailMergeTemplatesData.salesForceTemplates.paging
        ? salesForceMailMergeTemplatesData.salesForceTemplates.paging.totalCount
        : 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesForceTemplatesDatas, salesForceTemplatesMailMergeDatas]);

  const columns = React.useMemo(
    () => [
      {
        Header: 'Template Name',
        accessor: 'Name',
        width: '50%',
        Cell: function (props) {
          return (
            <Row className="float-left">
              <Col className="text-center">{props.value}</Col>
            </Row>
          );
        },
      },
      {
        Header: 'Subject',
        accessor: 'Subject',
        width: '50%',
        Cell: function (props) {
          return (
            <Row className="float-left">
              <Col className="text-center">{props.value}</Col>
            </Row>
          );
        },
      },
    ],
    []
  );

  const handleRowToolbarButton = (action, template, templateType) => {
    setCurrentTemplate(template);
    setTemplateTypeForClone(templateType);

    if (action === templateActions.CLONE_TEMPLATE) {
      setShowCloneConfirmModal(true);
    }
  };

  const cloneEmailTemplateCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Email Template Cloned Successfully', 'success');
      setShowCloneConfirmModal(false);
    } else {
      notify(response.graphQLErrors[0].message, 'error');
    }
  };

  return (
    <Modal size="lg" isOpen={showModal} centered>
      <ModalHeader toggle={hideModal}>
        <i className="fas fa-envelope-open-text fa-lg text-purple"></i>
        SalesForce Email Templates
      </ModalHeader>
      <ModalBody>
        <h5>Classic Templates</h5>
        <Row form>
          <Col md={12}>
            <Card>
              <SalesForceEmailTemplateGrid
                columns={columns}
                data={salesForceTemplatesDatas}
                templateData={salesForceTemplatesData}
                fetchData={({ pageIndex, pageSize }) => {
                  setClassicLimit(pageSize);
                  setCurrentPageIndex(pageIndex);
                  setClassicOffset(pageIndex);
                }}
                loading={salesForceTemplatesLoading}
                pageSize={classicLimit}
                pageCount={pageCount}
                totalCount={totalCount}
                error={salesForceTemplatesError}
                currentPageIndex={currentPageIndex}
                templateActions={templateActions}
                handleRefresh={refetchClassic}
                handleRowToolbarButton={handleRowToolbarButton}
                templateType="classic"
              />
            </Card>
          </Col>
        </Row>
      </ModalBody>
      <ModalBody>
        <h5>Mail Merge Templates</h5>
        <Row form>
          <Col md={12}>
            <Card>
              <SalesForceEmailTemplateGrid
                columns={columns}
                data={salesForceTemplatesMailMergeDatas}
                templateData={salesForceMailMergeTemplatesData}
                fetchData={({ pageIndex, pageSize }) => {
                  setMailmergeOffset(pageIndex);
                  setCurrentPageIndexMailMerge(pageIndex);
                  setMailmergeLimit(pageSize);
                }}
                loading={salesForceMailMergeTemplatesLoading}
                pageSize={mailmergeLimit}
                pageCount={pageCountMailmerge}
                totalCount={totalCountMailmerge}
                error={salesForceMailMergeTemplatesError}
                currentPageIndex={currentPageIndexMailmerge}
                templateActions={templateActions}
                handleRefresh={refetchMailmerge}
                handleRowToolbarButton={handleRowToolbarButton}
                templateType="mailmerge"
              />
            </Card>
          </Col>
        </Row>
      </ModalBody>
      <CloneModal
        showModal={showCloneConfirmModal}
        currentUserId={currentUserId}
        loading={cloneTemplateLoading}
        name={currentTemplate.Name}
        labelName="Template"
        handleAction={(data) => {
          cloneEmailTemplate({
            variables: {
              id: currentTemplate.Id,
              cloneTemplateName: data.cloneName,
              type: templateTypeForClone,
            },
          });
        }}
        hideModal={() => {
          setShowCloneConfirmModal(false);
        }}
      />
      <ModalFooter className="card-footer"></ModalFooter>
    </Modal>
  );
};
export default ImportSalesForceTemplatesModal;
