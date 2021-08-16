/**
 * @author ranbarasan
 * @version V11.0
 */
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import moment from 'moment-timezone';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { showErrorMessage } from '../../../util/index';
import { default as ClButton } from '../../Common/Button';
import CloseButton from '../../Common/CloseButton';
import {
  EXPORT_DUPLICATE_RECORDS,
  FETCH_ALL_DUPLICATE_PROSPECTS,
} from '../../queries/ProspectsQuery';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import DuplicateRecordsGrid from './DuplicateRecordsGrid';
toast.configure();

const ExportDuplicateRecords = ({
  showExportModal,
  hideExportModal,
  userList,
  selectedUserId,
  data,
  fileId,
}) => {
  const { apiURL } = useContext(ApiUrlAndTokenContext);

  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [prospectList, setProspectList] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [fileIds, setFileIds] = useState();

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
    });
  };

  useEffect(() => {
    if (fileId && Array.isArray(fileId)) {
      setFileIds(fileId.join(','));
    } else {
      setFileIds(fileId);
    }
  }, [fileId]);

  useEffect(() => {
    fetchDuplicateProspects({
      variables: { offset, limit },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showExportModal]);

  const [
    fetchDuplicateProspects,
    { data: duplicateProspectList, loading: prospectsLoading, error },
  ] = useLazyQuery(FETCH_ALL_DUPLICATE_PROSPECTS, {
    variables: {
      duplicateFilter: `filter[user][id]=${selectedUserId}${
        fileIds && fileIds !== undefined ? `&filter[fileId]=:[${fileIds}]` : ''
      }`,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => handleProspectsRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to fetch the duplicate prospect(s)',
        duplicateProspectList,
        'duplicate_prospects'
      );
    },
  });

  const handleProspectsRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      setProspectList(response.duplicate.data);
    }
  };

  useEffect(() => {
    if (
      !prospectsLoading &&
      duplicateProspectList &&
      duplicateProspectList.duplicate &&
      duplicateProspectList.duplicate.paging
    ) {
      setPageCount(
        Math.ceil(duplicateProspectList.duplicate.paging.totalCount / limit)
      );
      setTotalCount(duplicateProspectList.duplicate.paging.totalCount);
    }
    // eslint-disable-next-line
  }, [prospectList]);

  const [
    exportCsv,
    { data: exportCsvData, loading: processingExportCsv },
  ] = useLazyQuery(EXPORT_DUPLICATE_RECORDS, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (response) => handleExportCsvRequestCallback(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to export the duplicate prospect(s)',
        exportCsvData,
        'export_duplicates'
      );
    },
  });

  const handleExportCsvRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (response?.exportcsv?.data[0]?.key) {
        const signedKey = response?.exportcsv?.data[0]?.key;
        const link = `${apiURL}public/prospects/exportDuplicate/${signedKey}`;
        const anchor = document.createElement('a');
        document.body.appendChild(anchor);
        anchor.href = link;
        anchor.download = '';
        anchor.click();
        anchor.remove();
      }
      notify('Prospect(s) successfully exported.', 'success');
    }
  };

  const handleActionExportCsv = () => {
    exportCsv({
      variables: {
        input: {
          user: {
            id: selectedUserId,
          },
          listName: data.reports.map((report) => report.reportName),
        },
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Contact Name',
        accessor: 'contactName',
        width: '25%',
      },
      {
        Header: 'Account Name',
        accessor: 'accountName',
        width: '25%',
      },
      {
        Header: 'CRM ID',
        accessor: 'crmId',
        width: '20%',
      },
      {
        Header: 'Last Imported Date',
        accessor: 'lastImportedDate',
        width: '15%',
        Cell: function (props) {
          const lastImportedDate = props?.value;
          const currentTimeZone = moment.tz.guess();
          const updatedDateTime = moment
            .tz(lastImportedDate, currentTimeZone)
            .format('M/D/YYYY h:mm A');
          return <span>{lastImportedDate ? updatedDateTime : ''}</span>;
        },
      },
      {
        Header: 'Owned By',
        accessor: 'ownedBy',
        width: '15%',
        Cell: function (props) {
          const ownedBy = props?.value;
          let owner = {};
          if (userList) {
            owner = userList.find((user) => user.id === parseInt(ownedBy));
          }

          return <span>{owner?.name}</span>;
        },
      },
    ],
    [userList]
  );

  return (
    <div>
      <Modal isOpen={showExportModal} centered={true} size="xl">
        <ModalHeader toggle={hideExportModal}>
          <span className="fa-stack fa-xs mr-2">
            <i className="far fa-circle fa-stack-2x"></i>
            <i className="fas fa-user-alt fa-stack-1x"></i>
          </span>
          Duplicate Record(s)
        </ModalHeader>
        <ModalBody
          className="overflow-auto py-2"
          style={{ minHeight: '450px', maxHeight: '450px' }}
        >
          <Card className="mb-0 shadow-none border-0">
            <CardBody>
              <Row>
                <span className="text-primary mr-1">
                  {data?.recordsImported ? data.recordsImported : 0}/
                  {data?.recordsAvailable ? data.recordsAvailable : 0}
                </span>{' '}
                contacts were imported.{' '}
                <span className="text-primary ml-1 mr-1">
                  {data?.duplicateCount ? data.duplicateCount : 0}
                </span>{' '}
                were duplicates.
              </Row>
              <Row>
                Please see the below list of the contacts that were not
                imported.
              </Row>
              <Row>
                <b>List Name(s):</b>
                {data?.reports?.map((report, index) => {
                  return (
                    <span className="ml-2" key={index}>
                      {index === data.reports.length - 1
                        ? report.reportName
                        : report.reportName + ','}
                    </span>
                  );
                })}
              </Row>
            </CardBody>
          </Card>
          <DuplicateRecordsGrid
            columns={columns}
            data={prospectList}
            loading={prospectsLoading}
            pageCount={pageCount}
            totalCount={totalCount}
            fetchData={({ pageIndex, pageSize }) => {
              setOffset(pageIndex);
              setCurrentPageIndex(pageIndex);
              setLimit(pageSize);
              fetchDuplicateProspects({
                variables: { offset: pageIndex, limit: pageSize },
              });
            }}
            pageSize={limit}
            error={error}
            currentPageIndex={currentPageIndex}
          ></DuplicateRecordsGrid>
        </ModalBody>

        <ModalFooter className="card-footer">
          <CloseButton
            className="mr-auto"
            onClick={hideExportModal}
            btnTxt="Close"
          ></CloseButton>

          <ClButton
            color="primary"
            disabled={processingExportCsv}
            icon={
              processingExportCsv ? 'fas fa-spinner fa-spin' : 'fas fa-download'
            }
            title="Export to CSV"
            onClick={() => {
              handleActionExportCsv();
            }}
          >
            {processingExportCsv ? 'Wait...' : 'Export to CSV'}
          </ClButton>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ExportDuplicateRecords;
