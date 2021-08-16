/* eslint-disable @typescript-eslint/camelcase */
/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { Editor as TinyMceEditor } from '@tinymce/tinymce-react';
import axios from 'axios';
import PropTypes from 'prop-types';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Col,
  Input,
  Row,
} from 'reactstrap';
import { ApiUrlAndTokenContext } from '../../auth/ApiUrlAndTokenProvider';
import { getErrorMessage, trimValue } from '../../util';
import { showErrorMessage } from '../../util/index';
import ConfirmModal from '../Common/ConfirmModal';
import {
  DELETE_TEMPLATE_ATTACHMENT_QUERY,
  GET_MAIL_MERGE_RESPONSE,
} from '../queries/EmailTemplatesQuery';
import { FETCH_USER_SETTING_QUERY } from '../queries/SettingsQuery';
import ClButton from './Button';

const Editor = React.forwardRef((props, ref) => {
  const {
    data,
    onChange,
    userId,
    prospectId,
    initialLoading,
    resetLoading,
    onInit,
    attachments,
    type,
    refetch,
    templatePreview,
    handlePreviewChange,
    mailMergeVariables,
    attachmentUrl,
    templateId,
    notify,
    showUploadAttachment,
    showTemplatePreviewToolbar,
    showMailMergeToolbar,
    toolbarLocation,
    showSignatureOnPreview,
    refreshAttachments,
    hideDeleteIcon,
    deleteAttachments,
    attachmentAssociation,
    handleSubjectMailMerge,
  } = props;
  const dataRef = useRef('');
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [templatePreviewData, setTemplatePreviewData] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachmentSize, setAttachmentSize] = useState(0);
  const [editorData, setEditorData] = useState(data);
  const templateIdRef = useRef();
  const { apiURL: RESOURCE_SERVER_URL, token } = useContext(
    ApiUrlAndTokenContext
  );
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [attachmentId, setAttachmentId] = useState(null);
  const [defaultFont, setDefaultFont] = useState();
  const [defaultFontSize, setDefaultFontSize] = useState();

  const { data: fetchUserSettingData } = useQuery(FETCH_USER_SETTING_QUERY, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data) {
        const { emailFontFace, emailFontSize } = data?.usersettings?.data[0];
        setDefaultFont(emailFontFace);
        setDefaultFontSize(parseInt(emailFontSize));
      }
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to fetch default font settings.',
        fetchUserSettingData,
        'fetch_font_setting'
      );
    },
  });
  const mailMergeRef = useRef();
  if (mailMergeVariables?.length > 0) {
    mailMergeRef.current = mailMergeVariables;
  }

  useEffect(() => {
    if (attachments && attachments.length > 0) {
      setAttachmentSize(
        attachments
          .map(
            (data) =>
              parseInt(data.attachmentActualFileSize) ||
              parseInt(data.actualFileSize)
          )
          .reduce((a, b) => a + b)
      );
      setShowAttachments(true);
    } else {
      setShowAttachments(false);
      setAttachmentSize(0);
    }
  }, [attachments]);

  useEffect(() => {
    if (data && initialLoading) {
      customizeTheInitialData(data);
    }
    // eslint-disable-next-line
  }, [data]);

  useEffect(() => {
    templateIdRef.current = templateId;
  }, [templateId]);

  useEffect(() => {
    if (
      editorData !== '' &&
      editorData !== '<p></p>' &&
      (templatePreviewData.includes('<p></p>') === true || templatePreviewData === '')
    ) {
      dataRef.current = editorData;
      setIsDataChanged(true);
    }
    // eslint-disable-next-line
  }, [editorData]);

  //Below function used to modify initial data

  const customizeTheInitialData = (desc) => {
    const templateBody = document.createElement('div');
    templateBody.innerHTML = desc;
    templateBody.querySelectorAll('img').forEach((tag) => {
      if (tag.getAttribute('src').includes('{{')) {
        const mailMergeVariable = tag
          .getAttribute('src')
          .match(/{{(.*)}}/)?.[1];
        tag.setAttribute('src', `<<${mailMergeVariable}>>`);
      }
    });
    desc = templateBody?.innerHTML;
    if (desc.indexOf('{{') !== -1) {
      let splitValues = desc.split('{{');
      for (let i = 1; i < splitValues.length; i++) {
        splitValues[i] = splitValues[i].substring(
          0,
          splitValues[i].lastIndexOf('}}')
        );
      }
      splitValues = Array.from(new Set(splitValues));
      for (let j = 1; j < splitValues.length; j++) {
        const mailMergeVal = splitValues[j];

        let mailMergeSpanTag = '';

        mailMergeSpanTag = `<span class="yellow" contenteditable="false">{{${mailMergeVal}}}</span>`;

        const regex = new RegExp('{{' + mailMergeVal + '}}', 'g');
        desc = desc.replace(regex, mailMergeSpanTag);
      }
    }
    setEditorData(desc);
  };

  // Below block is used to show the editor data with some modification like adding the target="_blank"
  useEffect(() => {
    let data = dataRef.current;
    if (onChange && !initialLoading) {
      onChange(data);
    }
    if (
      showTemplatePreviewToolbar &&
      isDataChanged &&
      mailMergeRef?.current?.length > 0
    ) {
      // Added target=new when click preview email anchor tag it will load new tab -begin
      const regExp = /<a/gi;
      const replaceAnchorTagString = '<a target="_blank" ';
      data = data.replace(regExp, replaceAnchorTagString);
      if (
        !mailMergeVariablesResponseDataLoading &&
        mailMergeVariableResponse?.mailMergeJsonData?.mailMergeData?.length > 0
      ) {
        for (
          let i = 0;
          i < mailMergeVariableResponse.mailMergeJsonData.mailMergeData.length;
          i++
        ) {
          const obj =
          mailMergeVariableResponse.mailMergeJsonData.mailMergeData[i];
          let regex = '';

          regex = new RegExp(
            `<span class="yellow" contenteditable="false">{{${obj.id}}}</span>`,
            'g'
          );

          data = data.replace(regex, obj.name || typeof obj.name === 'boolean' ? obj.name : '');
        }
      }
      const templateBody = document.createElement('div');
      templateBody.innerHTML = data;
      templateBody.querySelectorAll('img').forEach((tag) => {
        if (tag.getAttribute('src').includes('{{')) {
          const mailMergeVariable = tag
            .getAttribute('src')
            .match(/{{(.*)}}/)?.[1];
          tag.setAttribute(
            'src',
            handleMailmergeValueReplacement(mailMergeVariable)[0]
          );
        } else if (tag.getAttribute('src').includes('<<')) {
          const mailMergeVariable = tag
            .getAttribute('src')
            .match(/<<(.*)>>/)?.[1];
          tag.setAttribute(
            'src',
            handleMailmergeValueReplacement(mailMergeVariable)[0]
          );
        }
      });
      data = templateBody?.innerHTML;
      if (data.indexOf('{{') !== -1) {
        let splitValues = data.split('{{');

        for (let i = 1; i < splitValues.length; i++) {
          splitValues[i] = splitValues[i].substring(
            0,
            splitValues[i].lastIndexOf('}}')
          );
        }
        splitValues = Array.from(new Set(splitValues));
        for (let j = 1; j < splitValues.length; j++) {
          const mailMergeVal = splitValues[j];

          // If mail merge variable does not have matching values then make it as empty else it will high lighted mail merge variable
          if (
            mailMergeVal.indexOf('Prospects') !== -1 ||
            mailMergeVal.indexOf('User') !== -1
          ) {
            data = data.split('{{' + mailMergeVal + '}}').join('');
          } else {
            const regex = new RegExp('{{' + mailMergeVal + '}}', 'g');
            data = data.replace(
              regex,
              '<span style=background-color:yellow;>{{' +
                mailMergeVal +
                '}}</span>'
            );
          }
        }
      }
      if (
        showSignatureOnPreview &&
        mailMergeVariableResponse.emailSignatureData &&
        mailMergeVariableResponse.emailSignatureData !==
          '<span style="font-family:Arial,sans-serif;font-size:14px !important;">null</span>'
      ) {
        data += mailMergeVariableResponse.emailSignatureData;
      }
      templateBody.innerHTML = data;

      templateBody.querySelectorAll('a').forEach((a) => {
        a.setAttribute('target', '_blank');
      });
      const modifiedSignature = templateBody && templateBody.innerHTML;
      setTemplatePreviewData(modifiedSignature);

      if (initialLoading) {
        resetLoading(false);
      }
    } else if (!showSignatureOnPreview && data === '') {
      setTemplatePreviewData('');
    } else if (data && !showTemplatePreviewToolbar && initialLoading) {
      resetLoading(false);
    }

    setIsDataChanged(false);

    // eslint-disable-next-line
  }, [isDataChanged]);

  const [
    getMailMergeVariableResponse,
    {
      data: mailMergeVariablesResponseData,
      loading: mailMergeVariablesResponseDataLoading,
    },
  ] = useLazyQuery(GET_MAIL_MERGE_RESPONSE, {
    variables: {
      input: {
        user: {
          id: userId,
        },
        prospect: {
          id: prospectId || 0,
        },
      },
    },
    onCompleted: () => {
      setIsDataChanged(true);
    },
    notifyOnNetworkStatusChange: true,
  });

  // If the touch value is OTHERS this block will replace that as SOCIAL
  if( !mailMergeVariablesResponseDataLoading &&
     mailMergeVariablesResponseData?.mailmergeResponse?.data?.mailMergeJsonData?.mailMergeData
    ) {
     mailMergeVariablesResponseData.mailmergeResponse.data.mailMergeJsonData.mailMergeData =
      mailMergeVariablesResponseData?.mailmergeResponse?.data?.mailMergeJsonData?.mailMergeData.map((data)=>{
      const name= data.name === 'OTHERS' ? 'SOCIAL' : data.name ;
      return {id:data.id, name}
    })
  }

  const [deleteTemplateAttachment] = useLazyQuery(
    DELETE_TEMPLATE_ATTACHMENT_QUERY,
    {
      onCompleted: () => {
        if (refetch) {
          refetch();
        }
      },
      onError: (response) => {
        notify(getErrorMessage(response, 'Failed to delete'));
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    if (showMailMergeToolbar) {
      getMailMergeVariableResponse();
    }
    // eslint-disable-next-line
  }, []);

  const mailMergeVariableResponse = useMemo(
    () =>
      mailMergeVariablesResponseData &&
      mailMergeVariablesResponseData.mailmergeResponse &&
      mailMergeVariablesResponseData.mailmergeResponse.data
        ? mailMergeVariablesResponseData.mailmergeResponse.data
        : [],
    [mailMergeVariablesResponseData]
  );

  const mailMergeValues = useMemo(
    () =>
      mailMergeVariableResponse &&
      mailMergeVariableResponse?.mailMergeJsonData?.mailMergeData,
    [mailMergeVariableResponse]
  );

  const handleMailmergeValueReplacement = (value) => {
    const replaceValue = mailMergeValues
      .filter((item) => item.id === value)
      .map((item) => item.name);
    return replaceValue;
  };

  function editor_image_upload_handler(blobInfo, success, failure, progress) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${RESOURCE_SERVER_URL}emails/images`);
    xhr.setRequestHeader('Authorization', 'Bearer ' + token);

    xhr.upload.onprogress = function (e) {
      progress((e.loaded / e.total) * 100);
    };

    xhr.onload = function () {
      if (xhr.status === 403) {
        failure('HTTP Error: ' + xhr.status, { remove: true });
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        failure('HTTP Error: ' + xhr.status);
        return;
      }

      const json = JSON.parse(xhr.responseText);

      if (!json) {
        failure('Invalid JSON: ' + xhr.responseText);
        return;
      }

      success(`${RESOURCE_SERVER_URL + json.url.substring(1)}`);
    };

    xhr.onerror = function () {
      failure(
        'Image upload failed due to a XHR Transport error. Code: ' + xhr.status
      );
    };

    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    xhr.send(formData);
  }

  // Handle Block Start

  const handleDownloadAttachment = (props) => {
    const { currentTarget } = props;
    axios
      .get(
        `${
          attachmentUrl + '/' + currentTarget.value
        }/download`,
        { responseType: 'blob' }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: response.headers['content-type'] })
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', currentTarget.textContent);
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };
  const handleRemoveAttachment = (attachment) => {
    if (
      type === 'templates' &&
      attachmentAssociation &&
      attachmentAssociation.length > 0 &&
      !isNaN(templateId) &&
      attachmentAssociation.indexOf(attachment.id) !== -1
    ) {
      setShowDeleteConfirmModal(true);
      setAttachmentId(attachment.id);
    } else if (deleteAttachments) {
      deleteAttachments(attachment);
    }
  };

  // Handle Block End

  const fileTypes = [
    '.ade',
    '.adp',
    '.app',
    '.asp',
    '.bas',
    '.bat',
    '.cer',
    '.chm',
    '.cmd',
    '.cnt',
    '.com',
    '.cpl',
    '.crt',
    '.csh',
    '.der',
    '.diagcab',
    '.exe',
    '.dll',
    '.fxp',
    '.gadget',
    '.grp',
    '.hlp',
    '.hpj',
    '.hta',
    '.inf',
    '.ins',
    '.isp',
    '.its',
    '.jar',
    '.jnlp',
    '.js',
    '.jse',
    '.ksh',
    '.lnk',
    '.mad',
    '.maf',
    '.mag',
    '.mam',
    '.maq',
    '.mar',
    '.mas',
    '.mat',
    '.mau',
    '.mav',
    '.maw',
    '.mcf',
    '.mda',
    '.mdb',
    '.mde',
    '.mdt',
    '.mdw',
    '.mdz',
    '.msc',
    '.msh',
    '.msh1',
    '.msh2',
    '.mshxml',
    '.msh1xml',
    '.msh2xml',
    '.msi',
    '.msp',
    '.mst',
    '.msu',
    '.ops',
    '.sd',
    '.pcd',
    '.pif',
    '.pl',
    '.plg',
    '.prf',
    '.prg',
    '.printerexport',
    '.ps1',
    '.ps1xml',
    '.ps2',
    '.ps2xml',
    '.psc1',
    '.psc2',
    '.psd1',
    '.psdm1',
    '.pst',
    '.reg',
    '.scf',
    '.scr',
    '.sct',
    '.shb',
    '.shs',
    '.theme',
    '.tmp',
    '.url',
    '.vb',
    '.vbe',
    '.vbp',
    '.vbs',
    '.vsmcros',
    '.vsw',
    '.webpnp',
    '.website',
    '.ws',
    '.wsc',
    '.wsf',
    '.wsh',
    '.xbap',
    '.xll',
    '.xnk',
  ];
  //5 MB Size
  const gMaxFileUploadSize = 5245329;

  return (
    <>
      <div className="w-100 px-2">
        {editorData ? (
          <>
            <Row className={showAttachments ? 'pb-3 d-flex' : 'd-none'}>
              <Col sm={1} className="d-flex align-items-center mr-xl-5">
                Attachment(s)
              </Col>
              <Col sm={10} className="px-0">
                <Row>
                  {attachments &&
                    attachments.map((attachment, i) => {
                      let isHideDeleteIcon = false;
                      if (type === 'templates') {
                        isHideDeleteIcon = hideDeleteIcon;
                      } else if (
                        attachment.associations &&
                        attachment.associations.emailTemplate &&
                        attachment.associations.emailTemplate.length > 0 &&
                        attachment.associations.emailTemplate[0].id &&
                        trimValue(
                          attachment.associations.emailTemplate[0].id + ''
                        ) !== ''
                      ) {
                        isHideDeleteIcon = false;
                      } else if (trimValue(attachment.templateId) === '') {
                        isHideDeleteIcon = true;
                      }
                      return (
                        <Col sm={3} key={i}>
                          <ButtonGroup className="w-100 attachments">
                            <ClButton
                              block
                              icon={attachment.actionIcon}
                              title={`${attachment.fileName} (${attachment.attachmentFileSize})`}
                              className="text-truncate attachment-bg"
                              onClick={handleDownloadAttachment}
                              value={
                                attachment.file_name_with_timestamp ||
                                attachment.fileNameWithTimeStamp ||
                                attachment.fileNameWithTimestamp
                              }
                            >
                              {`${attachment.fileName} (${attachment.attachmentFileSize})`}
                            </ClButton>
                            {isHideDeleteIcon && (
                              <Button
                                onClick={() =>
                                  handleRemoveAttachment(attachment)
                                }
                              >
                                <i className="fa fa-times"></i>
                              </Button>
                            )}
                          </ButtonGroup>
                        </Col>
                      );
                    })}
                </Row>
                <Input
                  type="hidden"
                  id="attachment_size"
                  value={attachmentSize}
                />
              </Col>
            </Row>
            <Row>
              <Col
                sm={showTemplatePreviewToolbar && showTemplatePreview ? 6 : 12}
                className="pr-2"
              >
                {defaultFont && defaultFontSize && (
                  <TinyMceEditor
                    apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                    value={editorData}
                    onEditorChange={(content, editor) => {
                      dataRef.current = content.replace(/&nbsp;$/, '');
                      setIsDataChanged(true);
                      if (content === '') {
                        editor.insertContent('<p><br></p>');
                      }
                    }}
                    onFocus={() => {
                      if (ref?.current?.attributes?.class) {
                        ref.current.attributes.class.value = 'form-control';
                      }
                    }}
                    init={{
                      min_height: 344,
                      menubar: false,
                      statusbar: false,
                      images_upload_handler: editor_image_upload_handler,
                      image_dimensions: true,
                      image_caption: false,
                      object_resizing: true,
                      branding: false,
                      forced_root_block: false,
                      toolbar_mode: 'wrap',
                      toolbar_location: toolbarLocation,
                      paste_data_images: type === 'templates',
                      content_style: `.yellow { ${
                        type !== 'Personalize' && 'background: yellow'
                      }; } body { font-family: ${defaultFont}; font-size: ${defaultFontSize}pt; }`,
                      anchor_top: false,
                      anchor_bottom: false,
                      plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code',
                      ],
                      contextmenu: 'link | copy cut paste',
                      browser_spellcheck: true,
                      toolbar: `bold italic underline | formatselect | fontselect | fontsizeselect | backcolor forecolor | ${
                        showTemplatePreviewToolbar && `templatePreview |`
                      } bullist numlist | outdent indent | image ${
                        showUploadAttachment && `uploadAttachement`
                      } | alignleft aligncenter alignright alignjustify | link unlink | removeformat ${
                        showMailMergeToolbar && `| mailMerge`
                      } `,
                      fontsize_formats:
                        '8pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 36pt 48pt 70pt',
                      target_list: false,
                      setup: function (editor) {
                        if (onInit) {
                          onInit(editor);
                          setIsDataChanged(true);
                        }

                        if (showTemplatePreviewToolbar) {
                          editor.ui.registry.addToggleButton(
                            'templatePreview',
                            {
                              icon: 'preview',
                              tooltip: 'Template Preview',
                              onAction: function (api) {
                                setShowTemplatePreview(!api.isActive());
                                if (type && type !== 'templates') {
                                  handlePreviewChange(!api.isActive());
                                }
                                api.setActive(!api.isActive());
                              },
                              onSetup: function (api) {
                                api.setActive(templatePreview);
                              },
                            }
                          );
                        }

                        editor.ui.registry.addToggleButton(
                          'uploadAttachement',
                          {
                            icon: 'upload',
                            tooltip: 'Upload Attachment',
                            onAction: function () {
                              if (
                                parseInt(
                                  document.getElementById('attachment_size')
                                    .value
                                ) > gMaxFileUploadSize
                              ) {
                                notify(
                                  'Sorry you cannot upload attachments larger than 5MB.',
                                  'error',
                                  'files_size'
                                );
                                return;
                              } else if (
                                document.getElementsByClassName('attachments')
                                  .length >= 3
                              ) {
                                notify(
                                  'Sorry! You can upload only a max of 3 attachments',
                                  'error',
                                  'files_limit'
                                );
                                return;
                              }

                              const input = document.createElement('input');
                              input.setAttribute('type', 'file');
                              input.setAttribute('accept', '*');
                              input.onchange = function () {
                                const file = this.files[0];
                                if (
                                  fileTypes.indexOf(
                                    `.${file.name.split('.').pop()}`
                                  ) !== -1
                                ) {
                                  notify(
                                    'Please upload valid file.',
                                    'error',
                                    'invalid_file'
                                  );
                                } else if (
                                  parseInt(
                                    document.getElementById('attachment_size')
                                      .value
                                  ) +
                                    file.size >
                                  gMaxFileUploadSize
                                ) {
                                  notify(
                                    'Sorry you cannot upload attachments larger than 5MB.',
                                    'error',
                                    'file_size'
                                  );
                                } else if (
                                  document.getElementsByClassName('attachments')
                                    .length >= 3
                                ) {
                                  notify(
                                    'Sorry! You can upload only a max of 3 attachments',
                                    'error',
                                    'files_limit'
                                  );
                                } else {
                                  const formData = new FormData();
                                  formData.append('file', file);

                                  const headers = {
                                    'Content-Type': 'multipart/form-data',
                                  };
                                  axios({
                                    method: 'post',
                                    url: attachmentUrl,
                                    headers: headers,
                                    data: formData,
                                  })
                                    .then((response) => {
                                      if (refreshAttachments) {
                                        refreshAttachments(
                                          response.data.data[0]
                                        );
                                      }
                                    })
                                    .catch((response) => {
                                      if (response?.response?.data) {
                                        notify(
                                          response.response.data.errors[0]
                                            .message
                                        );
                                      } else {
                                        notify('Some error occurred');
                                      }
                                    });
                                }
                              };
                              input.click();
                            },
                          }
                        );

                        if (showMailMergeToolbar) {
                          editor.ui.registry.addMenuButton('mailMerge', {
                            text: 'Mail Merge',
                            tooltip: 'Mail Merge',

                            fetch: function (callback) {
                              const items = [];

                              for (const json of mailMergeRef?.current) {
                                const data = {
                                  type: 'menuitem',
                                  text: json.display_column_name,
                                  onAction: function () {
                                    if (ref?.current?.attributes?.class?.value?.includes('focusing')) {
                                      ref.current.value += json.mail_merge_name;
                                      ref.current.focus();
                                      type &&
                                        type !== 'templates' &&
                                        handleSubjectMailMerge();
                                    } else {
                                      editor.insertContent(
                                        `<span class="yellow" contenteditable="false">${json.mail_merge_name}</span> `
                                      );
                                    }
                                  },
                                };
                                items.push(data);
                              }

                              callback(items);
                            },
                          });
                        }
                        //To show the onload data in preview section
                        if (editorData && initialLoading) {
                          dataRef.current = editorData;
                          setIsDataChanged(true);
                        }
                      },
                      init_instance_callback: function () {
                        if (templatePreview) {
                          setShowTemplatePreview(true);
                        }
                        document.getElementsByClassName(
                          'tox-tinymce'
                        )[0].style.maxHeight = '344px';
                      },
                    }}
                  />
                )}
              </Col>
              {showTemplatePreviewToolbar && showTemplatePreview && (
                <Col sm={6} className="pl-2">
                  <Card className="mb-0 border">
                    <CardBody
                      className="overflow-auto"
                      style={{
                        minHeight: '300px',
                        maxHeight: '300px',
                        color: '#000000',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: defaultFont,
                          fontSize: `${defaultFontSize}pt`,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: templatePreviewData,
                        }}
                      />
                    </CardBody>
                    <CardFooter className="px-4 text-right">
                      <i className="far fa-eye mr-2"></i>Preview
                    </CardFooter>
                  </Card>
                </Col>
              )}
            </Row>
          </>
        ) : (
          <div className="text-center pt-3">
            <i className="fa fa-spinner fa-spin fa-lg"></i>
          </div>
        )}
      </div>
      {showDeleteConfirmModal && (
        <ConfirmModal
          showConfirmModal={showDeleteConfirmModal}
          children={
            'Are you sure you want to delete the attachment permanently ?'
          }
          handleConfirm={() => {
            deleteTemplateAttachment({
              variables: {
                attachmentId: attachmentId,
              },
            });
            setShowDeleteConfirmModal(false);
          }}
          handleCancel={() => {
            setShowDeleteConfirmModal(false);
            setAttachmentId('');
          }}
        />
      )}
    </>
  );
});

Editor.defaultProps = {
  enableVidyard: false,
  attachmentUrl: 'attachments',
  showUploadAttachment: true,
  showTemplatePreviewToolbar: true,
  showMailMergeToolbar: true,
  toolbarLocation: 'top',
  showSignatureOnPreview: false,
  hideDeleteIcon: true,
};

Editor.propTypes = {
  data: PropTypes.string, // this prop is used to load the data in editor body
  onChange: PropTypes.func, //this prop is used to get onChanging value of the editor
  userId: PropTypes.number, // userid used for get mailmerge variable response
  prospectId: PropTypes.number, // prospectid used for get mailmerge variable response
  initialLoading: PropTypes.bool, // if true initial data was loading default should be false
  resetLoading: PropTypes.func, // function to reset the initialLoading
  onInit: PropTypes.func, // function to get the ckeditor instance in the parent component
  attachments: PropTypes.array, // attchment of the templates or snippets
  type: PropTypes.string, // personalize or send off
  refetch: PropTypes.func, // after upload attachment to refetch the attachments of templates or snippets
  templatePreview: PropTypes.bool, // default false , if true  template preview will open onload ckeditor
  mailMergeVariables: PropTypes.array, // mailmerge variables to load the Mail Merge dropdown in the editor
  attachmentUrl: PropTypes.string, // attachmentUrl to upload the file files
  templateId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // templateId is used for upload attachments
  notify: PropTypes.func, // error function to show the error alert to the user
  showUploadAttachment: PropTypes.bool, // show / hide the upload attachment toolbar
  showTemplatePreviewToolbar: PropTypes.bool, // show / hide the template preview toolbar
  showMailMergeToolbar: PropTypes.bool, // show/hide mail merge dropdown toolbar
  toolbarLocation: PropTypes.string, // to modify the location (possible values auto, top, bottom )
  showSignatureOnPreview: PropTypes.bool, // to show the emailsignature in the preview section for( soe, emailtemplate page)
  hideDeleteIcon: PropTypes.bool, // to hide the delete icon
  deleteAttachments: PropTypes.func, // to delete the attachments function
};
export default Editor;
