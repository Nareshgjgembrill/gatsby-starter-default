/**
 * @author ranbarasan
 * @version v11.0
 */
import { useLazyQuery } from '@apollo/react-hooks';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Collapse,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';
import { ApiUrlAndTokenContext } from '../../../auth/ApiUrlAndTokenProvider';
import { getAllCadences, getAllTags } from '../../../store/actions/actions';
import { showErrorMessage } from '../../../util/index';
import { default as ClButton } from '../../Common/Button';
import CloseButton from '../../Common/CloseButton';
import ConfirmModal from '../../Common/ConfirmModal';
import DropDown from '../../Common/DropDown';
import TagList from '../../Common/TagList';
import UserList from '../../Common/UserList';
import { CREATE_TAG_QUERY } from '../../queries/EmailTemplatesQuery';
import {
  GET_CRM_REPORTS,
  IMPORTS_CRM_RECORDS,
} from '../../queries/ProspectsQuery';
import ImportSuccessGrid from './ImportSuccessGrid';

toast.configure();

function ImportCrmModal({
  hideCrmModal,
  showImportCrmModal,
  lookupData,
  currentUserId,
  selectedUserId,
  cadences,
  isRefreshTagList,
  handleRefreshTag,
}) {
  const { apiURL, token } = useContext(ApiUrlAndTokenContext);
  const dispatch = useDispatch();

  const [folderList, setFolderList] = useState([]);
  const [folderReportList, setFolderReportList] = useState({});
  const [reportList, setReportList] = useState({});
  const [choose, setChoose] = useState('specific');

  const [successHeader, setSuccessHeader] = useState(
    'Zero records were imported.'
  );
  const [tagIds, setTagIds] = useState();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUserConfirmModal, setShowUserConfirmModal] = useState(false);
  const [steps, setSteps] = useState(1);
  const [importReportIds, setImportReportIds] = useState();
  const [importResponseData, setImportResponseData] = useState();
  const [uploadListForUser, setUploadListForUser] = useState(currentUserId);
  const [isRefreshTag, setIsRefreshTag] = useState(false);
  const [fileId, setFileId] = useState();

  const columns = React.useMemo(
    () => [
      {
        Header: 'List / Report',
        accessor: 'reportName',
        width: '50%',
      },
      {
        Header: 'Records Imported / Processed',
        accessor: 'recordsImported',
        width: '50%',
        Cell: function (props) {
          return <span>{props.value.replaceAll('/', ' / ')}</span>;
        },
      },
    ],
    []
  );

  const foldersRef = useRef();
  const reportViewFormRef = useRef();

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
    });
  };

  // add to cadence fields
  const [cadenceId, setCadenceId] = useState(null);
  const [cadenceList, setCadenceList] = useState([]);
  const [isUserChanged, setIsUserChanged] = useState(false);

  const handleFetchCadences = () => {
    dispatch(getAllCadences(uploadListForUser, apiURL, token));
  };

  useEffect(() => {
    if (!cadences?.fetchedAll || isUserChanged) {
      handleFetchCadences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserChanged]);

  useEffect(() => {
    if (cadences && !cadences.loading) {
      const myCadences = cadences?.data
        .filter(
          (cad) =>
            (cad.status === 'ACTIVE' || cad.status === 'NEW') &&
            cad?.associations?.touch.length > 0 &&
            cad.associations.user[0].id === uploadListForUser
        )
        .map((item, index) => {
          return {
            text: item.name,
            value: item.id,
            active: false,
            header: index === 0 ? 'My Cadences' : '',
          };
        });

      const sharedCadences = cadences?.data
        .filter(
          (cad) =>
            (cad.status === 'ACTIVE' || cad.status === 'NEW') &&
            cad?.associations?.touch?.length > 0 &&
            cad.associations.user &&
            cad.associations.user[0].id !== uploadListForUser
        )
        .map((item, index) => {
          return {
            text: item.name,
            value: item.id,
            active: false,
            header: index === 0 ? 'Shared Cadences' : '',
          };
        });

      setCadenceList(myCadences.concat(sharedCadences));
      setIsUserChanged(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cadences]);

  const [
    fetchCrmReports,
    { data: crmReportsData, loading: loadingCrmReports },
  ] = useLazyQuery(GET_CRM_REPORTS, {
    onCompleted: (response) => handleReportsRequestCallBack(response, true),
    onError: (response) => {
      if (
        response.graphQLErrors !== null &&
        response.graphQLErrors.length > 0
      ) {
        let message = response.graphQLErrors[0].message;
        if (message.indexOf('invalid_grant') !== -1) {
          message =
            'Failed to fetch data from CRM. Please log out and log back in and try again.';
        }

        const errorFormat = (
          <>
            <h6>{message}</h6>
            {crmReportsData?.requestId && (
              <>
                <br />
                <span>RequestId: {crmReportsData.requestId}</span>
              </>
            )}
          </>
        );

        notify(errorFormat, 'error');
      } else {
        showErrorMessage(
          response,
          'Failed to Import CRM Reports List(s).',
          crmReportsData,
          'import_reports_list'
        );
      }
    },
  });

  const handleReportsRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      setFolderReportList(response.imports.data);

      const folderNames = [];
      const folderReportData = {};
      // eslint-disable-next-line array-callback-return
      response.imports.data.map((item) => {
        if (folderNames !== null && !folderNames.includes(item.FolderName)) {
          folderNames.push(item.FolderName);

          const report = response.imports.data.filter(
            (report) => report.FolderName === item.FolderName
          );

          folderReportData[item.FolderName] = report;
        }
      });
      setFolderList(folderNames.sort());
      setFolderReportList(folderReportData);
    }
  };

  const refetchCrmReport = () => {
    fetchCrmReports({
      variables: { offset: 0, limit: 500 },
    });
  };

  useEffect(() => {
    if (showImportCrmModal) {
      refetchCrmReport();
    }
    setCadenceId(null);
    setUploadListForUser(selectedUserId);
    setIsRefreshTag(isRefreshTagList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showImportCrmModal]);

  useEffect(() => {
    setIsUserChanged(true);
  }, [uploadListForUser]);

  const [
    importsCrmRecords,
    {
      data: importsCrmData,
      loading: processingCrmImport,
      error: errorCrmImport,
    },
  ] = useLazyQuery(IMPORTS_CRM_RECORDS, {
    onCompleted: (response) => handleImportsRequestCallback(response, true),
    onError: (response) => handleImportsRequestCallback(response),
  });

  const formatSuccessData = (responseData) => {
    const responseJSon = {
      recordsAvailable: 0,
      recordsImported: 0,
      duplicateCount: 0,
      emailIdCount: 0,
      phoneCount: 0,
      contactNameCount: 0,
      prospectsAssignedCount: 0,
    };

    const reports = [];
    // eslint-disable-next-line array-callback-return
    responseData.map((item) => {
      responseJSon['recordsAvailable'] =
        item.recordsAvailable + responseJSon['recordsAvailable'];
      responseJSon['recordsImported'] =
        item.recordsImported + responseJSon['recordsImported'];
      responseJSon['duplicateCount'] =
        item.duplicateCount + responseJSon['duplicateCount'];
      responseJSon['emailIdCount'] = item.missingColumnDetails.emailIdCount
        ? item.missingColumnDetails.emailIdCount + responseJSon['emailIdCount']
        : responseJSon['emailIdCount'];
      responseJSon['phoneCount'] = item.missingColumnDetails.phoneCount
        ? item.missingColumnDetails.phoneCount + responseJSon['phoneCount']
        : responseJSon['phoneCount'];
      responseJSon['contactNameCount'] = item.missingColumnDetails
        .contactNameCount
        ? item.missingColumnDetails.contactNameCount +
          responseJSon['contactNameCount']
        : responseJSon['contactNameCount'];
      responseJSon['prospectsAssignedCount'] =
        item.prospectsAssigned + responseJSon['prospectsAssignedCount'];

      reports.push({
        reportName: item.reportName,
        recordsImported: item.recordsImported + '/' + item.recordsAvailable,
        reportError: item.reportError,
      });
    });
    responseJSon['reports'] = reports;
    return responseJSon;
  };

  const handleImportsRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      const responseJSon = formatSuccessData(response.imports.data);
      setImportResponseData(responseJSon);
      setSuccessHeader(
        responseJSon.recordsImported + ' records were uploaded successfully!'
      );
      setSteps(3);
    } else {
      showErrorMessage(
        response,
        'Failed to imports CRM records.',
        importsCrmData,
        'import_crm_records'
      );
    }
  };

  const handleActionNext = () => {
    const form = foldersRef.current;
    if (
      form.reportFolder.value === 'specific' &&
      form.reportFolderName.value === ''
    ) {
      notify('Please select a folder', 'error');
      return;
    } else {
      setSteps(2);

      if (form.reportFolder.value === 'specific') {
        const reportJson = {};
        reportJson[form.reportFolderName.value] =
          folderReportList[form.reportFolderName.value];
        setReportList(reportJson);
      } else {
        setReportList(folderReportList);
      }
    }
  };

  const handleActionPrev = () => {
    setSteps(steps > 1 ? steps - 1 : steps);
  };

  const handleActionBeginImport = () => {
    const form = reportViewFormRef.current;
    const crmReportIds = [...form.elements].reduce((reports, item) => {
      if (item.checked && item.value.trim() !== '')
        reports[item.value] = item.parentElement.innerText;
      return reports;
    }, {});

    if (Object.keys(crmReportIds).length === 0) {
      notify('Please select the report', 'error');
      return;
    } else if (Object.keys(crmReportIds).length > 4) {
      notify(
        'You can only upload a maximum of 4 reports at one time.',
        'error'
      );
      return;
    }

    setImportReportIds(crmReportIds);
    const tagNames = document.getElementsByName('tagName')[0].value;
    if (!tagIds && tagNames) {
      const input = {
        names: [tagNames],
      };
      if (uploadListForUser) {
        input['user'] = { id: uploadListForUser };
      }
      addTag({ variables: { input } });
    } else if (tagIds === '' || tagIds === undefined) {
      setShowConfirmModal(true);
    } else if (tagIds) {
      beginImport(crmReportIds);
    }
  };

  const beginImport = (crmReportIds, dynamicTagId) => {
    const requestData = Object.entries(crmReportIds).map(([key, value], i) => {
      return { id: key, name: value };
    });

    const requestJson = {};
    requestJson['importCRMfiles'] = requestData;
    setFileId(requestData.map((file) => file.id));
    //upload list for User
    if (uploadListForUser) {
      requestJson['user'] = {
        id: uploadListForUser,
      };
    }

    if (cadenceId) {
      requestJson.cadence = {
        id: parseInt(cadenceId),
      };
    }
    //Attaching the tag for import CRM prospects
    if (tagIds || dynamicTagId) {
      requestJson['tag'] = {
        id: dynamicTagId ? dynamicTagId : tagIds,
      };
    }

    importsCrmRecords({
      variables: {
        input: requestJson,
      },
      context: {
        timeout:
          lookupData && lookupData['import_ajax_timeout']
            ? parseInt(lookupData['import_ajax_timeout'])
            : 20000,
      },
    });
  };

  const handleActionClose = () => {
    hideCrmModal(steps === 3);
    setSteps(1);
    setTagIds('');
    setChoose('specific');
  };

  const handleActionCheckChange = (event) => {
    switch (event.target.id) {
      case 'specific_folder':
        setChoose('specific');
        break;
      case 'all_folder':
        setChoose('all');
        break;
      default:
        setChoose('all');
        break;
    }
  };

  const handleUserChange = (value) => {
    setUploadListForUser(value);
    setIsRefreshTag(true);
    if (
      value &&
      uploadListForUser !== value &&
      currentUserId !== parseInt(value)
    ) {
      setShowUserConfirmModal(true);
    }

    handleRefreshTag(true);
  };

  const [addTag, { data: tagData }] = useLazyQuery(CREATE_TAG_QUERY, {
    onCompleted: (response) => addTagCallBack(response, true),
    onError: (response) => {
      showErrorMessage(
        response,
        'Sorry! Failed to add a tag.',
        tagData,
        'import_crm_tag'
      );
    },
  });

  const addTagCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      notify('Tag has been added successfully!', 'success');
      setTagIds(response.Tag.data[0].id);
      dispatch(getAllTags(currentUserId, apiURL, token));
      beginImport(importReportIds, response.Tag.data[0].id);
    }
  };

  return (
    <div>
      <Modal isOpen={showImportCrmModal} centered={true} size="xl">
        <ModalHeader toggle={handleActionClose}>
          <span className="fa-stack fa-xs mr-2">
            <i className="far fa-circle fa-stack-2x"></i>
            <i className="fas fa-user-alt fa-stack-1x"></i>
          </span>
          Upload List(s)
        </ModalHeader>
        <ModalBody
          className="overflow-auto py-2"
          style={{ minHeight: '450px', maxHeight: '450px' }}
        >
          <Form
            name="uploadFolderForm"
            innerRef={foldersRef}
            style={{ display: steps === 1 ? 'block' : 'none' }}
          >
            <Row>
              <Col sm="6" className="text-center">
                <h1 className="mb-5 text-normal">All Reports</h1>
                <span className="fa-stack fa-8x">
                  <i className="far fa-file fa-stack-2x"></i>
                  <i className="fas fa-chart-bar fa-stack-1x mt-2"></i>
                </span>
                <FormGroup check className="mt-4">
                  <Label check for="all_folder">
                    <Input
                      type="radio"
                      name="reportFolder"
                      id="all_folder"
                      checked={choose === 'all' ? true : false}
                      value="all"
                      onChange={handleActionCheckChange}
                      className="mt-1"
                    />
                    Show Reports from all folder(s)
                  </Label>
                </FormGroup>
              </Col>
              <Col sm="6" className="text-center">
                <h1 className="mb-5 text-normal">Select A Folder</h1>
                <span className="fa-stack fa-8x mt-4 ml-4">
                  <i className="fas fa-folder-open fa-stack-2x"></i>
                  <i className="far fa-file-alt text-xl fa-1x mt-n4 ml-5 pl-5 d-flex"></i>
                </span>
                <FormGroup check>
                  <Label check for="specific_folder" className="pl-2">
                    <Input
                      type="radio"
                      name="reportFolder"
                      id="specific_folder"
                      value="specific"
                      checked={choose === 'specific' ? true : false}
                      onChange={handleActionCheckChange}
                      className="mt-1"
                    />
                    Choose folder from dropdown below
                  </Label>
                  <InputGroup className="mt-2  d-flex justify-content-center">
                    <InputGroupAddon addonType="append">
                      <Input
                        type="select"
                        name="reportFolderName"
                        className="wd-md"
                      >
                        <option></option>
                        {folderList &&
                          folderList.length > 0 &&
                          folderList.map((folderName, index) => {
                            return (
                              <option key={index} value={folderName}>
                                {folderName}
                              </option>
                            );
                          })}
                      </Input>

                      <ClButton
                        icon={
                          loadingCrmReports
                            ? 'fas fa-spinner fa-spin'
                            : 'fas fa-sync-alt'
                        }
                        onClick={refetchCrmReport}
                      ></ClButton>
                    </InputGroupAddon>
                  </InputGroup>
                </FormGroup>
              </Col>
            </Row>
          </Form>
          <Form
            name="reportViewForm"
            style={{ display: steps === 2 ? 'block' : 'none' }}
            innerRef={reportViewFormRef}
          >
            <h4 className="text-normal">
              <small>Select up to 4 Reports to upload.</small>
            </h4>
            <Card
              className="overflow-auto shadow-none border-grey rounded-0"
              style={{
                minHeight: '336px',
                maxHeight: '336px',
              }}
            >
              {reportList &&
                Object.entries(reportList).map(([directory, report], index) => {
                  return (
                    <CollapseItem
                      folder={directory}
                      report={report}
                      id={index}
                      key={'item_' + index}
                    ></CollapseItem>
                  );
                })}
            </Card>
            <FormGroup row className="mb-0">
              <Col sm={6} className="pr-0">
                <Row>
                  <Label sm={3} className="text-bold text-nowrap mr-4">
                    Select the User
                  </Label>
                  <div className="wd-sd">
                    <UserList
                      name="user"
                      value={uploadListForUser}
                      disabled={false}
                      onChange={handleUserChange}
                    />
                  </div>
                </Row>
              </Col>
              <Col sm={3} className="pl-0 ml-n5">
                <div className="wd-sd">
                  <TagList
                    placeHolder="Tag your list(s)"
                    value={tagIds}
                    disabled={processingCrmImport}
                    onChange={(value) => {
                      setTagIds(value);
                    }}
                    handleAddTag={true}
                    selectedUserId={uploadListForUser}
                    isRefreshTagList={isRefreshTag}
                  />
                </div>
              </Col>
              <Col sm={3}>
                <FormGroup row className="mb-0">
                  <Col className="px-0 mx-2">
                    <DropDown
                      value={cadenceId}
                      data={cadenceList}
                      name="cadence"
                      placeHolder="Add to Cadence"
                      onChange={(value) => {
                        setCadenceId(value);
                      }}
                      loading={cadences?.loading}
                      handleRefresh={handleFetchCadences}
                    />
                  </Col>
                </FormGroup>
              </Col>
            </FormGroup>
          </Form>
          <Card
            className="shadow-none border-0 mb-0"
            style={{ display: steps === 3 ? 'block' : 'none' }}
          >
            <CardBody className="px-0 pt-2 pb-0 mb-3">
              <ImportSuccessGrid
                columns={columns}
                data={importResponseData}
                loading={processingCrmImport}
                error={errorCrmImport}
                successHeader={successHeader}
                uploadListForUser={uploadListForUser}
                fileId={fileId}
              ></ImportSuccessGrid>
            </CardBody>
          </Card>
        </ModalBody>
        <ModalFooter className="card-footer">
          <CloseButton
            className="mr-auto"
            onClick={handleActionClose}
            btnTxt={steps === 3 ? 'Close' : 'Cancel'}
          />
          <ClButton
            color="primary"
            icon="fa fa-chevron-left"
            title="Back to upload"
            onClick={handleActionPrev}
            style={{ display: steps === 2 ? 'block' : 'none' }}
          >
            Prev
          </ClButton>
          <ClButton
            color="primary"
            disabled={loadingCrmReports}
            icon={
              loadingCrmReports
                ? 'fas fa-spinner fa-spin'
                : 'fa fa-chevron-right'
            }
            title="Upload"
            onClick={handleActionNext}
            style={{ display: steps === 1 ? 'block' : 'none' }}
          >
            {loadingCrmReports ? 'Wait...' : 'Next'}
          </ClButton>

          <ClButton
            color="primary"
            disabled={processingCrmImport}
            icon={
              processingCrmImport
                ? 'fas fa-spinner fa-spin'
                : 'fa fa-chevron-right'
            }
            title="Begin Import"
            style={{ display: steps === 2 ? 'block' : 'none' }}
            onClick={handleActionBeginImport}
          >
            {processingCrmImport ? 'Wait...' : 'Next'}
          </ClButton>
        </ModalFooter>
      </Modal>
      <ConfirmModal
        confirmBtnText="Continue"
        confirmBtnIcon="fa fa-caret-right"
        header="Tag Info"
        showConfirmModal={showConfirmModal}
        handleCancel={() => setShowConfirmModal(false)}
        handleConfirm={() => {
          setShowConfirmModal(false);
          beginImport(importReportIds);
        }}
        otherBtnRequired={true}
        otherBtnText="Add Tag"
        otherBtnIcon="fa fa-tag"
        otherBtnColor="primary"
      >
        <span>
          You have not tagged your list. Would you like to do so? Tagging your
          list can help you search your prospects faster.
        </span>
      </ConfirmModal>
      <ConfirmModal
        confirmBtnText="OK"
        confirmBtnIcon="fa fa-check"
        header="Info"
        showConfirmModal={showUserConfirmModal}
        handleCancel={() => setShowUserConfirmModal(false)}
        handleConfirm={() => {
          setShowUserConfirmModal(false);
        }}
      >
        <span>
          Please make sure the selected user has permissions to access the
          records within the report(s) selected.
        </span>
      </ConfirmModal>
    </div>
  );
}

// This is required for redux
const mapStateToProps = (state) => ({
  cadences: state.cadences,
});

export default connect(mapStateToProps, null)(ImportCrmModal);

const CollapseItem = ({ id, folder, report }) => {
  const [collapseOpen, setCollapseOpen] = useState(true);
  const toggle = () => setCollapseOpen(!collapseOpen);
  return (
    <>
      <CardHeader
        key={'header_' + id}
        className="pointer"
        id={'collapse-' + id}
        onClick={toggle}
      >
        <CardTitle key={'title_' + id}>
          <i
            className={collapseOpen ? 'fas fa-minus mr-2' : 'fas fa-plus mr-2'}
          ></i>
          <b>{folder}</b>
        </CardTitle>
      </CardHeader>
      <Collapse
        isOpen={collapseOpen}
        key={'coll-' + id}
        target={'collapse-' + id}
      >
        <CardBody>
          {report &&
            report.map((item, i) => {
              return (
                <FormGroup className="mb-0" check key={item.Id}>
                  <Label for={`crm_report_name${item.Id}`} check>
                    <Input
                      type="checkbox"
                      name="crmReportName"
                      id={`crm_report_name${item.Id}`}
                      value={item.Id}
                    />
                    {item.Name}
                  </Label>
                </FormGroup>
              );
            })}
        </CardBody>
      </Collapse>
    </>
  );
};
