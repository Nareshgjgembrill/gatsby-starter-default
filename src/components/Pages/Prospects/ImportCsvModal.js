/* eslint-disable no-prototype-builtins */
/**
 * @author ranbarasan
 * @version v11.0
 */
import { useLazyQuery } from '@apollo/react-hooks';
import { ErrorMessage } from '@hookform/error-message';
import { FormValidator } from '@nextaction/components';
import axios from 'axios';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  CardBody,
  Col,
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
  CREATE_LIST_MAPPING,
  CSV_IMPORT,
  DELETE_LIST_MAPPING,
  // eslint-disable-next-line @typescript-eslint/camelcase
  GET_All_USE_LIST_MAPPING,
  GET_USE_LIST_MAPPING,
} from '../../queries/ProspectsQuery';
import CsvHeaderClHeaderMapping from './CsvHeaderClHeaderMapping';
import ImportSuccessGrid from './ImportSuccessGrid';

toast.configure();

function ImportCsvModal({
  showModal,
  hideModal,
  currentUserId,
  selectedUserId,
  fieldsList,
  handleAction,
  cadences,
  lookupData,
  isRefreshTagList,
  handleRefreshTag,
}) {
  const dispatch = useDispatch();

  const supportMessage =
    'Some error occurred. Please try again and if error continues, please contact Support.';

  const [uploadCsv, setUploadCsv] = useState('block');
  const uploadCsvPrev = { display: uploadCsv };

  const [saveCsv, setSaveCsv] = useState('none');
  const uploadCsvNext = { display: saveCsv };
  const [importSuccess, setImportSuccess] = useState('none');
  const successHide = { display: importSuccess };

  const [csvModifiedRecords, setCsvModifiedRecords] = useState([]);
  const [importSuccessData, setImportSuccessData] = useState([]);
  const [successHeader, setSuccessHeader] = useState(
    'Zero records were imported.'
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancel, setCancel] = useState('Cancel');
  const [tagIds, setTagIds] = useState();
  const [uploadListForUser, setUploadListForUser] = useState(currentUserId);
  const [isRefreshTag, setIsRefreshTag] = useState(false);
  const { apiURL: RESOURCE_SERVER_URL, token } = useContext(
    ApiUrlAndTokenContext
  );

  // add to cadence fields
  const [cadenceId, setCadenceId] = useState(null);
  const [cadenceList, setCadenceList] = useState([]);
  const [isUserChanged, setIsUserChanged] = useState(false);

  const handleFetchCadences = () => {
    dispatch(getAllCadences(uploadListForUser, RESOURCE_SERVER_URL, token));
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
            cad?.associations?.touch?.length > 0 &&
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

  const fieldArray =
    fieldsList &&
    fieldsList.filter((field) => field.associations?.fieldMapping[0]?.id);

  const importSuccessColumns = useMemo(
    () => [
      {
        Header: 'Lists',
        accessor: 'reportName',
        width: '50%',
      },
      {
        Header: 'Imported',
        accessor: 'recordsImported',
        width: '50%',
      },
    ],
    []
  );

  const columns = useMemo(
    () => [
      {
        Header: 'Is Mapped?',
        accessor: 'ismapped',
        width: '15%',
      },
      {
        Header: 'Koncert Fields',
        accessor: 'clfield',
        width: '25%',
      },
      {
        Header: 'CSV Fields',
        accessor: 'csvheader',
        width: '15%',
      },
      {
        Header: 'Row 1',
        accessor: 'row1',
        width: '15%',
      },
      {
        Header: 'Row 2',
        accessor: 'row2',
        width: '15%',
      },
      {
        Header: 'Row 3',
        accessor: 'row3',
        width: '15%',
      },
    ],
    []
  );

  const uploadFormRef = useRef();
  const [uploadForm, setUploadForm] = useState();
  const [selectedFile, setSelectedFile] = useState('');

  const fieldMappingFormRef = useRef();
  const [fieldMappingForm, setFieldMappingForm] = useState(null);
  const [isFileUploadProcessing, setIsFileUploadProcessing] = useState(false);
  const { handleSubmit, register, errors } = useForm();
  const [uploadedFileId, setUploadedFileId] = useState();
  const [listMappings, setListMappings] = useState([]);

  const hasError = (inputName, method) => {
    return (
      uploadForm &&
      uploadForm.errors &&
      uploadForm.errors[inputName] &&
      uploadForm.errors[inputName][method]
    );
  };

  const hasErrorMapping = (inputName, method) => {
    return (
      fieldMappingForm &&
      fieldMappingForm.errors &&
      fieldMappingForm.errors[inputName] &&
      fieldMappingForm.errors[inputName][method]
    );
  };

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
    });
  };

  const [
    fetchAllListMapping,
    { loading: loadingAllMappingList },
  ] = useLazyQuery(GET_All_USE_LIST_MAPPING, {
    variables: { limit: 200, offset: 0, currentUserId: currentUserId },
    onCompleted: (response) =>
      handleAllListMappingRequestCallBack(response, true),
    onError: (response) => handleAllListMappingRequestCallBack(response),
  });

  const handleAllListMappingRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      setListMappings(response.listMappings.data);
    } else if (response.graphQLErrors !== null) {
      notify(response.graphQLErrors[0].message, 'error');
    } else if (response.networkError !== null) {
      notify(response.networkError.message, 'error');
    } else {
      notify(supportMessage, 'error');
    }
  };

  useEffect(() => {
    if (showModal && loadingAllMappingList === false) {
      fetchAllListMapping();
    }
    setCadenceId(null);
    setTagIds(undefined);
    setSelectedFile(null);
    setUploadListForUser(selectedUserId);
    setIsRefreshTag(isRefreshTagList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  useEffect(() => {
    setIsUserChanged(true);
  }, [uploadListForUser]);

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
      fileUpload();
      setTagIds(response.Tag.data[0].id);
      dispatch(getAllTags(currentUserId, RESOURCE_SERVER_URL, token));
    }
  };

  const [fetchListMapping] = useLazyQuery(GET_USE_LIST_MAPPING, {
    onCompleted: (response) => handleListMappingRequestCallBack(response, true),
    onError: (response) => handleListMappingRequestCallBack(response),
  });

  const handleListMappingRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      const userListFieldMappings =
        response.listMappings.includeAssociation.userListFieldMappings[0];
      const useMappedArr = [];
      // eslint-disable-next-line array-callback-return
      csvModifiedRecords.map((originalJson) => {
        originalJson.ismapped = '?';
        originalJson.id = '';
        const listMappingJson = userListFieldMappings.filter(
          (mapping) => mapping.csvFieldName === originalJson.csvheader
        );

        if (listMappingJson.length > 0) {
          originalJson.id = listMappingJson[0].associations.fields[0].id;
          const fields = fieldArray.filter(
            (field) => field.id === originalJson.id
          );
          if (fields.length > 0) {
            originalJson.ismapped = fields[0].label;
          }
        }
        useMappedArr.push(originalJson);
      });
      setCsvModifiedRecords(useMappedArr);
    } else {
      notify(response.graphQLErrors[0].message, 'error');
    }
  };

  const handleActionFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleActionUploadFile = () => {
    const form = uploadFormRef.current;
    const formName = form.name;
    let isValidFileType = true;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT', 'SELECT'].includes(i.nodeName)
    );
    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setUploadForm({ ...uploadForm, formName, errors });
    if (
      selectedFile !== undefined &&
      selectedFile !== '' &&
      selectedFile !== null &&
      !selectedFile.name.endsWith('.csv')
    ) {
      notify('Please upload a CSV file.', 'error');
      isValidFileType = false;
    }

    const isValid = (!hasError && isValidFileType) || false;
    const tagNames = document.getElementsByName('tagName')[0].value;

    if (isValid && tagIds === undefined && tagNames) {
      const input = { names: [tagNames] };

      if (uploadListForUser) {
        input['user'] = { id: uploadListForUser };
      }
      addTag({ variables: { input } });
    } else if (isValid && (tagIds === '' || tagIds === undefined)) {
      setShowConfirmModal(true);
    } else if (!hasError && isValidFileType && tagIds !== '') {
      fileUpload();
    }
  };

  const fileUpload = () => {
    const MaxFileUploadSize = 3145728;
    const file = selectedFile;
    if (file.size > MaxFileUploadSize) {
      notify(
        'Sorry you cannot upload files larger than 3MB.',
        'error',
        'file_size'
      );
      return;
    }
    setIsFileUploadProcessing(true);
    const data = new FormData();
    data.append('file', selectedFile);

    axios({
      method: 'post',
      url: 'imports/uploadFiles',
      data: data,
    })
      .then((response) => handleUploadRequestCallback(response, true))
      .catch((response) => handleUploadRequestCallback(response, false));
  };

  const handleUploadRequestCallback = (response, requestSuccess) => {
    setIsFileUploadProcessing(false);
    if (requestSuccess) {
      const csvRecord = response.data.data[0].csvRecords;
      const headerContents = response.data.data[0].headerContents;
      setUploadedFileId(response.data.data[0].id);
      setIsFileUploadProcessing(false);
      setUploadCsv('none');
      setSaveCsv('block');
      setMappingRecords(csvRecord, headerContents);
    } else if (
      response.response.data !== undefined &&
      response.response.data.response === 'error'
    ) {
      notify(response.response.data.errors[0].message, 'error');
    } else {
      notify('Please upload a CSV file', 'error');
    }
  };

  const setMappingRecords = (csvRecord, headerContents) => {
    const headerRowData = [];
    // eslint-disable-next-line array-callback-return
    headerContents.map((header) => {
      const headerName = header.toLowerCase().trim();
      const csvClMappedRecords = {};
      csvClMappedRecords['csvheader'] = header;
      csvClMappedRecords['ismapped'] = '?';
      csvClMappedRecords['id'] = 0;
      fieldArray
        .filter((field) => headerName.startsWith(field.label.toLowerCase()))
        .forEach((fieldJson) => {
          const alreadyMappedFields = headerRowData.filter(
            (mf) => mf.ismapped === fieldJson.label
          );
          if (alreadyMappedFields.length === 0) {
            csvClMappedRecords['ismapped'] = fieldJson.label;
            csvClMappedRecords['id'] = fieldJson.id;
          }
        });
      if (csvRecord.length > 0) {
        csvClMappedRecords['row1'] = csvRecord[0][header];
      }
      if (csvRecord.length > 1) {
        csvClMappedRecords['row2'] = csvRecord[1][header];
      }
      if (csvRecord.length > 2) {
        csvClMappedRecords['row3'] = csvRecord[2][header];
      }
      headerRowData.push(csvClMappedRecords);
    });

    setCsvModifiedRecords(headerRowData);
  };

  const [saveUseMapping, { loading: loadingSaveMapping }] = useLazyQuery(
    CREATE_LIST_MAPPING,
    {
      onCompleted: (response) =>
        handleSaveMappingRequestCallback(response, true),
      onError: (response) => handleSaveMappingRequestCallback(response),
    }
  );
  const handleSaveMappingRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      fetchAllListMapping();
      notify('Column mapping has been saved successfully.', 'success');
    } else if (
      response.graphQLErrors != null &&
      response.graphQLErrors.length > 0
    ) {
      notify(response.graphQLErrors[0].message, 'error');
    } else if (response.networkError !== null) {
      notify(response.networkError.message, 'error');
    } else {
      notify(supportMessage, 'error');
    }
  };

  const [deleteMapping, { loading: loadingDeleteMapping }] = useLazyQuery(
    DELETE_LIST_MAPPING,
    {
      onCompleted: (response) =>
        handleDeleteMappingRequestCallBack(response, true),
      onError: (response) => handleDeleteMappingRequestCallBack(response),
    }
  );

  const handleDeleteMappingRequestCallBack = (response, requestSuccess) => {
    if (requestSuccess) {
      fetchAllListMapping();
      notify('Column mapping has been deleted successfully.', 'success');
    } else if (
      response.graphQLErrors != null &&
      response.graphQLErrors.length > 0
    ) {
      notify(response.graphQLErrors[0].message, 'error');
    } else if (response.networkError !== null) {
      notify(response.networkError.message, 'error');
    } else {
      notify(supportMessage, 'error');
    }
  };
  const onSubmit = (data) => {
    deleteMapping({
      variables: {
        mappingId: data.useMapping,
      },
    });
  };

  const getFormData = (form) => {
    const userListFieldMappings = [];
    const kevyValuePair = {};
    const mappingData = [...form.elements].reduce((fieldMapping, item) => {
      if (item.name !== 'uploadListForUser') {
        if (item.value.trim() !== '' && item.type === 'select-one') {
          const options = item.selectedOptions[0];
          kevyValuePair[options.label] = options.label;
          const record = csvModifiedRecords.filter(
            (record) => parseInt(record.id) === parseInt(item.value.trim())
          );
          userListFieldMappings.push({
            csvFieldName: record.length > 0 ? record[0].csvheader : '',
            fields: {
              id: parseInt(item.value),
            },
          });
        } else if (item.value.trim() !== '')
          fieldMapping[item.name] = item.value;
      }

      return fieldMapping;
    }, {});

    mappingData.fileId = uploadedFileId;
    mappingData.userListFieldMappings = userListFieldMappings;
    mappingData.mappedClFields = kevyValuePair;

    return mappingData;
  };

  const handleActionSaveMapping = () => {
    const form = fieldMappingFormRef.current;
    const formName = form.name;
    const inputs = [...form.elements].filter((i) =>
      ['INPUT', 'SELECT'].includes(i.nodeName)
    );
    const { errors, hasError } = FormValidator.bulkValidate(inputs);
    setFieldMappingForm({ ...form, formName, errors });

    if (!hasError) {
      const mappingData = getFormData(form);
      delete mappingData['mappedClFields'];
      delete mappingData['user'];
      delete mappingData[''];
      mappingData.fileId = uploadedFileId;

      saveUseMapping({
        variables: {
          input: mappingData,
        },
      });
    }
  };

  const handleActionOnChangeMapping = (e) => {
    if (e.target.value === '') return;

    fetchListMapping({
      variables: {
        mappingId: parseInt(e.target.value),
      },
    });
  };

  const [
    imports,
    { loading: processingCsvImport, error: importsError },
  ] = useLazyQuery(CSV_IMPORT, {
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
    responseData.forEach((item) => {
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
        recordsImported: item.recordsImported + ' / ' + item.recordsAvailable,
        reportError: item.reportError,
      });
    });
    responseJSon['reports'] = reports;
    return responseJSon;
  };

  const handleImportsRequestCallback = (response, requestSuccess) => {
    if (requestSuccess) {
      if (response != null && response.imports.data !== undefined) {
        setImportSuccessData(response.imports.data);

        const responseJSon = formatSuccessData(response.imports.data);
        setImportSuccessData(responseJSon);
        setSuccessHeader(
          responseJSon.recordsImported + ' records were uploaded successfully!'
        );
        setImportSuccess('block');
        setCancel('Close');
        setSaveCsv('none');
      }
    } else if (
      response.graphQLErrors != null &&
      response.graphQLErrors.length > 0
    ) {
      notify(response.graphQLErrors[0].message, 'error');
    } else if (response.networkError !== null) {
      notify(response.networkError.message, 'error');
    } else {
      notify(supportMessage, 'error');
    }
  };

  const validateFieldMapping = (mappedFields) => {
    const msg = 'Some mandatory fields mapping is missing.';
    if (Object.keys(mappedFields).length === 0) {
      return msg;
    }

    let missingFields = '';

    if (
      !mappedFields.hasOwnProperty('Contact Name') &&
      !mappedFields.hasOwnProperty('Last Name')
    ) {
      missingFields += '"Contact Name"\n';
    }

    if (
      !mappedFields.hasOwnProperty('Email') &&
      !mappedFields.hasOwnProperty('Phone')
    ) {
      missingFields += '"Phone or Email"\n';
    }

    if (missingFields === '') return '';
    else return msg + '\n' + missingFields;
  };

  const handleActionBeginImport = () => {
    const importsData = {
      fileId: uploadedFileId,
    };
    const form = fieldMappingFormRef.current;
    const mappingData = getFormData(form);
    importsData.userListFieldMappings = mappingData.userListFieldMappings;
    const hasErrorText = validateFieldMapping(mappingData.mappedClFields);

    if (hasErrorText !== '') {
      alert(hasErrorText);
      return;
    }
    delete mappingData['mappedClFields'];

    if (tagIds) {
      importsData.tag = {
        id: parseInt(tagIds),
      };
    }

    if (uploadListForUser) {
      importsData.user = {
        id: parseInt(uploadListForUser),
      };
    }

    if (cadenceId) {
      importsData.cadence = {
        id: parseInt(cadenceId),
      };
    }

    imports({
      variables: {
        input: importsData,
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
    setUploadForm();
    if (uploadFormRef.current) {
      uploadFormRef.current.reset();
    }
    setFieldMappingForm(null);
    hideModal();
    setUploadedFileId('none');
    setUploadCsv('block');
    setSaveCsv('none');
    setImportSuccess('none');

    if (cancel === 'Close') {
      handleAction();
    }
    setCancel('Cancel');
  };

  return (
    <div>
      <Modal isOpen={showModal} centered={true} size="xl">
        <ModalHeader toggle={handleActionClose}>
          <i className="fas fa-upload mr-2 text-warning"></i>Upload List From
          File
        </ModalHeader>
        <ModalBody className="py-2">
          <Card className="mb-0 shadow-none border-0">
            <CardBody className="px-4" style={uploadCsvPrev}>
              <Form innerRef={uploadFormRef} name="uploadForm">
                <FormGroup row className="pl-2 mb-4">
                  <Col sm={6} className="custom-file">
                    <Input
                      className="custom-file-input"
                      type="file"
                      name="file"
                      accept=".csv"
                      id="csv_file_name"
                      onChange={(event) => {
                        handleActionFileChange(event);
                      }}
                      data-validate='["required"]'
                      invalid={hasError('file', 'required')}
                    ></Input>
                    <span className="invalid-feedback">
                      Please select the file to upload.
                    </span>
                    <Label
                      className="custom-file-label text-bold"
                      for="csv_file_name"
                    >
                      {selectedFile ? selectedFile.name : 'Choose file'}
                    </Label>
                    <i className="small">CSV Format is accepted</i>
                  </Col>
                </FormGroup>
                <Row className="pt-3 mb-0">
                  <Col sm={5}>
                    <FormGroup row>
                      <Label for="upload_list_for_user" sm={6}>
                        Upload List for
                      </Label>
                      <Col sm={6} className="px-0 ml-md-n3">
                        <UserList
                          name="user"
                          value={uploadListForUser}
                          disabled={false}
                          onChange={(value) => {
                            setUploadListForUser(value);
                            setIsRefreshTag(true);
                            handleRefreshTag(true);
                          }}
                        />
                      </Col>
                    </FormGroup>
                  </Col>
                  <Col sm={3}>
                    <FormGroup>
                      <Col className="px-0 ml-2">
                        <TagList
                          placeHolder="Tag your list(s)"
                          value={tagIds}
                          disabled={false}
                          onChange={(value) => {
                            setTagIds(value);
                          }}
                          handleAddTag={true}
                          selectedUserId={uploadListForUser}
                          isRefreshTagList={isRefreshTag}
                        />
                      </Col>
                    </FormGroup>
                  </Col>
                  <Col sm={4}>
                    <FormGroup>
                      <Col className="px-0 ml-2">
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
                </Row>
              </Form>
            </CardBody>
            <CardBody className="px-2 py-0" style={uploadCsvNext}>
              <div id="map_configuration" className="p-2 mb-1 bg-gray-lighter">
                <h6 className="mb-0  text-bold">Mapping Configuration</h6>
              </div>
              <Form onSubmit={handleSubmit(onSubmit)} name="deleteMapping">
                <span className="text-bold pl-3">
                  Map Columns with Koncert Fields
                </span>
                <p className="mt-1 pl-3">
                  Column headers in the CSV file do not match with fields in
                  Koncert. You can map the columns manually and save the mapping
                  for future use.
                </p>
                <FormGroup row className="pl-5 mb-2">
                  <Label for="use_mapping" sm={3}>
                    Use Mapping
                  </Label>
                  <Col sm={4} className="p-0 ml-md-n3">
                    <InputGroup>
                      <Input
                        placeholder="Filter"
                        type="select"
                        id="use_mapping"
                        name="useMapping"
                        onChange={(event) => handleActionOnChangeMapping(event)}
                        innerRef={register({
                          required: 'Please select the Mapping.',
                        })}
                        invalid={errors.useMapping}
                      >
                        <option></option>
                        {listMappings &&
                          listMappings.map((data, index) => {
                            return (
                              <option key={index} value={data.id}>
                                {data.name}
                              </option>
                            );
                          })}
                      </Input>
                      <InputGroupAddon addonType="append">
                        <Button
                          className="wd-append-btn"
                          type="submit"
                          title="Delete Mapping"
                          disabled={loadingDeleteMapping}
                        >
                          <i
                            className={
                              loadingDeleteMapping
                                ? 'fas fa-spinner fa-spin'
                                : 'fas fa-trash text-danger'
                            }
                          ></i>
                        </Button>
                      </InputGroupAddon>
                      <ErrorMessage
                        errors={errors}
                        name="useMapping"
                        className="invalid-feedback"
                        as="p"
                      ></ErrorMessage>
                    </InputGroup>
                  </Col>
                </FormGroup>
              </Form>
              <Form
                innerRef={fieldMappingFormRef}
                name="fieldMappingForm"
                autoComplete="off"
              >
                <FormGroup row className="pl-5 mb-2">
                  <Label for="mapping_name" sm={3}>
                    Save New Mapping
                  </Label>
                  <Col sm={4} className="p-0 ml-md-n3">
                    <InputGroup>
                      <Input
                        type="text"
                        name="name"
                        id="mapping_name"
                        data-validate='["required"]'
                        invalid={hasErrorMapping('name', 'required')}
                      />
                      <InputGroupAddon addonType="append">
                        <Button
                          className="wd-append-btn"
                          color="primary"
                          outline
                          disabled={loadingSaveMapping}
                          title="Save Changes"
                          onClick={() => handleActionSaveMapping()}
                        >
                          <i
                            className={
                              loadingSaveMapping
                                ? 'fas fa-spinner fa-spin'
                                : 'fas fa-check'
                            }
                          ></i>
                        </Button>
                      </InputGroupAddon>
                      {hasErrorMapping('name', 'required') && (
                        <span className="invalid-feedback">
                          Please enter mapping name.
                        </span>
                      )}
                    </InputGroup>
                  </Col>
                </FormGroup>
                {/* <span className="text-bold pl-3"></span> */}

                <div className="p-2 mb-2 bg-gray-lighter">
                  <h6 className="mb-0 text-bold">Set Column Mappings</h6>
                </div>
                <div className="overflow-auto" style={{ height: '225px' }}>
                  <CsvHeaderClHeaderMapping
                    columns={columns}
                    data={csvModifiedRecords}
                    fields={fieldArray}
                    handleAction={(clFieldLabel, fieldId, rowNo) => {
                      if (
                        csvModifiedRecords !== undefined &&
                        csvModifiedRecords.length > rowNo &&
                        csvModifiedRecords[rowNo]['ismapped'] !== clFieldLabel
                      ) {
                        const modifiedRecords = [];
                        // eslint-disable-next-line array-callback-return
                        csvModifiedRecords.map((records) => {
                          modifiedRecords.push(records);
                        });

                        modifiedRecords[rowNo]['ismapped'] =
                          clFieldLabel === '' ? '?' : clFieldLabel;
                        modifiedRecords[rowNo]['id'] =
                          fieldId === '' ? 0 : parseInt(fieldId);
                        setCsvModifiedRecords(modifiedRecords);
                      }
                    }}
                  />
                </div>
              </Form>
            </CardBody>
            <CardBody className="px-0 pt-2 pb-0 mb-3" style={successHide}>
              <ImportSuccessGrid
                columns={importSuccessColumns}
                data={importSuccessData}
                loading={processingCsvImport}
                error={importsError}
                successHeader={successHeader}
                uploadListForUser={uploadListForUser}
                fileId={uploadedFileId}
              ></ImportSuccessGrid>
            </CardBody>
          </Card>
        </ModalBody>
        <ModalFooter className="card-footer">
          <CloseButton
            className="mr-auto"
            onClick={handleActionClose}
            style={successHide}
            btnTxt="Close"
          ></CloseButton>
          <ClButton
            color="warning"
            disabled={isFileUploadProcessing}
            icon={
              isFileUploadProcessing
                ? 'fas fa-spinner fa-spin'
                : 'fas fa-upload'
            }
            title="Upload"
            style={uploadCsvPrev}
            onClick={() => {
              handleActionUploadFile();
            }}
          >
            {isFileUploadProcessing ? 'Wait...' : 'Upload'}
          </ClButton>

          <ClButton
            color="primary"
            disabled={processingCsvImport}
            icon={
              processingCsvImport ? 'fas fa-spinner fa-spin' : 'fa fa-check'
            }
            title="Save Changes"
            style={uploadCsvNext}
            onClick={() => {
              handleActionBeginImport();
              setFieldMappingForm(null);
            }}
          >
            {processingCsvImport ? 'Wait...' : 'Save'}
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
          fileUpload();
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
    </div>
  );
}

// This is required for redux
const mapStateToProps = (state) => ({
  cadences: state.cadences,
});

export default connect(mapStateToProps, null)(ImportCsvModal);
