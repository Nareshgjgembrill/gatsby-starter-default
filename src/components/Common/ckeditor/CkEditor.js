/**
 * @author @rajesh-thiyagarajan
 * @version V11.0
 */
//****CKEditor usage has been deprecated in project and using TINYMCE instead. This files has to be removed once TINYMCE is editor usage is stabilized.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import PropTypes from 'prop-types';
import {
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from 'reactstrap';
import axios from 'axios';
// commented as it's having errors
//import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import {
  addListToDropdown,
  createDropdown,
} from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import CKEditor from '@ckeditor/ckeditor5-react';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import GoogleDocsNormalizer from '@ckeditor/ckeditor5-paste-from-office/src/normalizers/googledocsnormalizer';
import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import ListUi from '@ckeditor/ckeditor5-list/src/listui';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import MSWordNormalizer from '@ckeditor/ckeditor5-paste-from-office/src/normalizers/mswordnormalizer';
import NumberList from '@ckeditor/ckeditor5-list/src/listediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import RemoveFormate from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import {
  toWidget,
  viewToModelPositionOutsideModelElement,
} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import TemplatePreviewIcon from './icon/templatepreview.svg';
import UploadAttachmentIcon from './icon/uploadattachment.svg';
// Need to implement
// import VidyardIcon from "./icon/vidyard.svg";
import { RESOURCE_SERVER_URL } from '../../../config';
import {
  FETCH_MAIL_MERGE_VARIABLES,
  GET_MAIL_MERGE_RESPONSE,
} from '../../queries/EmailTemplatesQuery';
import ClButton from '../Button';
import { getToken } from '../../../util';

const CkEditor = React.forwardRef((props, ref) => {
  const {
    data,
    templateId,
    onChange,
    attachments,
    refetch,
    onInit,
    enableVidyard,
    imageUploadUrl,
    attachmentUrl,
    initialLoading,
    resetLoading,
    prospectId,
    type,
    templatePreview,
    userId,
  } = props;

  const [showVidyardWindow, setShowVidyardWindow] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(
    templatePreview || false
  );
  const [showAttachments, setShowAttachments] = useState(false);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [templatePreviewData, setTemplatePreviewData] = useState('');
  const [attachmentSize, setAttachmentSize] = useState(0);
  const [initialCkEditorData, setInitialCkEditorData] = useState();
  const dataRef = useRef();

  useEffect(() => {
    if (data && initialLoading) {
      customizeTheInitialData(data);
    }
  }, [data]);

  useEffect(() => {
    setShowTemplatePreview(templatePreview);
  }, [templatePreview]);

  useEffect(() => {
    if (attachments && attachments.length > 0) {
      setAttachmentSize(
        attachments
          .map((data) => data.attachmentActualFileSize)
          .reduce((a, b) => a + b, 0)
      );
      setShowAttachments(true);
    } else {
      setShowAttachments(false);
      setAttachmentSize(0);
    }
  }, [attachments]);

  const [
    getMailMerge,
    { data: mailMergeVariablesData, loading: mailMergeVariablesDataLoading },
  ] = useLazyQuery(FETCH_MAIL_MERGE_VARIABLES, {
    notifyOnNetworkStatusChange: true,
  });

  const [
    getMailMergeVariableResponse,
    {
      data: mailMergeVariablesResponseData,
      loading: mailMergeVariablesResponseDataLoading,
    },
  ] = useLazyQuery(GET_MAIL_MERGE_RESPONSE, {
    variables: {
      input: {
        talkerId: userId,
        prospectId: prospectId || 0,
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    getMailMerge();
    getMailMergeVariableResponse();
  }, []);

  const mailMergeVariables = useMemo(
    () =>
      mailMergeVariablesData &&
      mailMergeVariablesData.mailmergeVariables &&
      mailMergeVariablesData.mailmergeVariables.data
        ? mailMergeVariablesData.mailmergeVariables.data.mail_merge
        : [],
    [mailMergeVariablesData]
  );

  const mailMergeVariableResponse = useMemo(
    () =>
      mailMergeVariablesResponseData &&
      mailMergeVariablesResponseData.mailmergeResponse &&
      mailMergeVariablesResponseData.mailmergeResponse.data
        ? mailMergeVariablesResponseData.mailmergeResponse.data
        : [],
    [mailMergeVariablesResponseData]
  );

  //Below function used to get the file size in  'Bytes', 'KB', 'MB', 'GB', 'TB'

  function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 Byte';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  //Below function used to modify initial data

  const customizeTheInitialData = (desc) => {
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

        const mailMergeSpanTag =
          '<span className="placeholder mr-2 ck-widget" contenteditable="false">{{{' +
          mailMergeVal +
          '}}}' +
          '</span>';

        const regex = new RegExp('{{' + mailMergeVal + '}}', 'g');
        desc = desc.replace(regex, mailMergeSpanTag);
      }
    }
    setInitialCkEditorData(desc);
  };

  // Below block is used to show the editor data with some modification like adding the target="_blank"
  useEffect(() => {
    let data = dataRef.current;

    if (onChange && !initialLoading) {
      onChange(data);
    }

    if (
      data &&
      isDataChanged &&
      !mailMergeVariablesResponseDataLoading &&
      !mailMergeVariablesDataLoading &&
      mailMergeVariableResponse.mailMergeJsonData.mailMergeData.length > 0 &&
      mailMergeVariables.length > 0
    ) {
      // Added target=new when click preview email anchor tag it will load new tab -begin
      const regExp = /<a/gi;
      const replaceAnchorTagString = '<a target="_blank" ';
      data = data.replace(regExp, replaceAnchorTagString);

      for (
        let i = 0;
        i < mailMergeVariableResponse.mailMergeJsonData.mailMergeData.length;
        i++
      ) {
        const obj =
          mailMergeVariableResponse.mailMergeJsonData.mailMergeData[i];
        let regex = '';

        if (obj.name) {
          regex = new RegExp('{+' + obj.id + '}+', 'g');
        } else {
          regex = new RegExp(
            '<span className="placeholder mr-2 ck-widget" contenteditable="false">' +
              obj.id +
              '</span>',
            'g'
          );
        }

        data = data.replace(regex, obj.name || '');
      }
      setTemplatePreviewData(data);

      if (initialLoading) {
        resetLoading(false);
      }
    } else if (data === '') {
      setTemplatePreviewData('');
    }
    setIsDataChanged(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDataChanged]);

  class Placeholder extends Plugin {
    static get requires() {
      return [PlaceholderEditing, PlaceholderUI];
    }
  }

  class PlaceholderCommand extends Command {
    execute({ value }) {
      const editor = this.editor;

      if (ref.current.attributes.class.value.includes('focusing')) {
        ref.current.value += value;
        ref.current.focus();
      } else {
        editor.model.change((writer) => {
          // Create a <placeholder> elment with the "name" attribute...
          const placeholder = writer.createElement('placeholder', {
            name: value,
          });
          // ... and insert it into the document.
          editor.model.insertContent(placeholder);
          //after inserting the mail merge value to focus the ckeditor body
          editor.editing.view.focus();
        });
      }
    }
    refresh() {
      const model = this.editor.model;
      const selection = model.document.selection;

      const isAllowed = model.schema.checkChild(
        selection.focus.parent,
        'placeholder'
      );

      this.isEnabled = isAllowed;
    }
  }

  class PlaceholderUI extends Plugin {
    init() {
      const editor = this.editor;
      const t = editor.t;
      const placeholderNames = editor.config.get('placeholderConfig.types');

      // The "placeholder" dropdown must be registered among the UI components of the editor
      // to be displayed in the toolbar.
      editor.ui.componentFactory.add('placeholder', (locale) => {
        const dropdownView = createDropdown(locale);

        // Populate the list in the dropdown with items.
        addListToDropdown(
          dropdownView,
          getDropdownItemsDefinitions(placeholderNames)
        );

        dropdownView.buttonView.set({
          // The t() function helps localize the editor. All strings enclosed in t() can be
          // translated and change when the language of the editor changes.
          label: t('Mail Merge'),
          tooltip: true,
          withText: true,
        });

        // Disable the placeholder button when the command is disabled.
        const command = editor.commands.get('placeholder');
        dropdownView.bind('isEnabled').to(command);

        // Execute the command when the dropdown item is clicked (executed).
        this.listenTo(dropdownView, 'execute', (evt) => {
          editor.execute('placeholder', { value: evt.source.value });
        });

        return dropdownView;
      });
    }
  }

  function getDropdownItemsDefinitions(placeholderNames) {
    const itemDefinitions = new Collection();

    for (const json of placeholderNames) {
      const definition = {
        type: 'button',
        model: new Model({
          value: json.mail_merge_name,
          label: json.display_column_name,
          withText: true,
        }),
      };
      // Add the item definition to the collection.
      itemDefinitions.add(definition);
    }

    return itemDefinitions;
  }

  class PlaceholderEditing extends Plugin {
    static get requires() {
      return [Widget];
    }

    init() {
      this._defineSchema();
      this._defineConverters();

      this.editor.commands.add(
        'placeholder',
        new PlaceholderCommand(this.editor)
      );

      this.editor.editing.mapper.on(
        'viewToModelPosition',
        viewToModelPositionOutsideModelElement(
          this.editor.model,
          (viewElement) => viewElement.hasClass('placeholder')
        )
      );

      this.editor.config.define('placeholderConfig', {
        types: mailMergeVariables,
      });
    }

    _defineSchema() {
      const schema = this.editor.model.schema;

      schema.register('placeholder', {
        // Allow wherever text is allowed:
        allowWhere: '$text',
        // The placeholder will act as an inline node:
        isInline: true,
        // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
        isObject: true,
        // The placeholder can have many types, like date, name, surname, etc:
        allowAttributes: ['name'],
      });
    }

    _defineConverters() {
      const conversion = this.editor.conversion;

      conversion.for('upcast').elementToElement({
        view: {
          name: 'span',
          classes: ['placeholder'],
        },
        model: (viewElement, { writer: modelWriter }) => {
          // Extract the "name" from "{name}".
          const name = viewElement.getChild(0).data.slice(1, -1);

          return modelWriter.createElement('placeholder', { name });
        },
      });

      conversion.for('editingDowncast').elementToElement({
        model: 'placeholder',
        view: (modelItem, { writer: viewWriter }) => {
          const widgetElement = createPlaceholderView(modelItem, viewWriter);

          // Enable widget handling on a placeholder element inside the editing view.
          return toWidget(widgetElement, viewWriter);
        },
      });

      conversion.for('dataDowncast').elementToElement({
        model: 'placeholder',
        view: (modelItem, { writer: viewWriter }) =>
          createPlaceholderView(modelItem, viewWriter),
      });

      // Helper method for both downcast converters.
      function createPlaceholderView(modelItem, viewWriter) {
        const name = modelItem.getAttribute('name');

        const placeholderView = viewWriter.createContainerElement('span', {
          class: 'placeholder mr-2',
        });
        // Insert the placeholder name (as a text).
        const innerText = viewWriter.createText(name);
        viewWriter.insert(
          viewWriter.createPositionAt(placeholderView, 0),
          innerText
        );
        return placeholderView;
      }
    }
  }

  class TemplatePreview extends Plugin {
    init() {
      const editor = this.editor;

      editor.ui.componentFactory.add('templatePreview', (locale) => {
        const view = new ButtonView(locale);

        view.set({
          label: 'Template Preview',
          icon: TemplatePreviewIcon,
          tooltip: true,
          isOn: templatePreview,
        });

        // Callback executed once the image is clicked.
        view.on('execute', () => {
          if (view.isOn) {
            view.isOn = false;
            setShowTemplatePreview(false);
          } else {
            view.isOn = true;
            setShowTemplatePreview(true);
          }
        });
        return view;
      });
    }
  }

  //  Vidyard Need to implement later
  // class VidyardPlugin extends Plugin {
  //   // vidyardJsUrl = 'https://app.vidyard.com/v1/embed.js'

  //   init() {
  //     const editor = this.editor;

  //     editor.ui.componentFactory.add("vidyard", (locale) => {
  //       const view = new ButtonView(locale);

  //       view.set({
  //         label: "Insert Vidyard Video",
  //         icon: VidyardIcon,
  //         tooltip: true,
  //       });

  //       // Callback executed once the image is clicked.
  //       view.on("execute", () => {
  //         setShowVidyardWindow(true);
  //         const library = window.Vidyard.goVideo.createLibrary(
  //           document.getElementById("vidyard_video"),
  //           {
  //             // Set the client id
  //             clientId: "prod.connectleader.com",
  //           }
  //         );
  //         // This function will be executed when users click insert button in Vidyard interface
  //         library.on("player:created", function (response) {
  //           /* ----- Create anchor tag -begin ----- */
  //           var anchor = editor.createElement("<a>");

  //           anchor.setAttributes({
  //             href: response.embed_codes.sharing_page,
  //           });
  //           /* ----- Create anchor tag -end ----- */

  //           /* ----- Create image tag -begin ----- */
  //           var img = editor.createElement("<img>");

  //           img.setAttributes({
  //             src: "https:" + response.embed_codes.thumbnail,
  //             width: 200,
  //           });
  //           /* ----- Create image tag -end ----- */

  //           // Append image tag to anchor tag
  //           anchor.append(img);

  //           // Insert anchor tag having video thumb-nail into editor
  //           editor.insertElement(anchor);

  //           // Insert new line after video thumb-nail into editor
  //           // editor.insertElement(new CKEDITOR.dom.element('br'));

  //           // Insert video link into editor
  //           var videoLink = anchor.clone();
  //           videoLink.setText(response.embed_codes.sharing_page);

  //           editor.insertText("Check out this video: ");
  //           editor.insertElement(videoLink);

  //           // Insert blank space after video link
  //           setTimeout(function () {
  //             editor.insertText(" ");
  //           }, 1000); // The delay is to make CKEDITOR to adjust the height, after thumb-nail image is loaded

  //           // Hide dialog box
  //           //event.sender.hide();
  //         });
  //       });
  //       return view;
  //     });
  //   }
  // }

  class MyUploadAdapter {
    constructor(loader) {
      // The file loader instance to use during the upload.
      this.loader = loader;
    }

    // Starts the upload process.
    upload() {
      return this.loader.file.then(
        (file) =>
          new Promise((resolve, reject) => {
            this._initRequest();
            this._initListeners(resolve, reject, file);
            this._sendRequest(file);
          })
      );
    }

    // Aborts the upload process.
    abort() {
      if (this.xhr) {
        this.xhr.abort();
      }
    }

    // Initializes the XMLHttpRequest object using the URL passed to the constructor.
    _initRequest() {
      const xhr = (this.xhr = new XMLHttpRequest());

      // Note that your request may look different. It is up to you and your editor
      // integration to choose the right communication channel. This example uses
      // a POST request with JSON as a data structure but your configuration
      // could be different.
      xhr.open('POST', RESOURCE_SERVER_URL + imageUploadUrl, true);
      xhr.setRequestHeader(
        'Authorization',
        'Bearer ' + sessionStorage.getItem('token')
      );
      xhr.responseType = 'json';
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners(resolve, reject, file) {
      const xhr = this.xhr;
      const loader = this.loader;
      const genericErrorText = `Couldn't upload file: ${file.name}.`;

      xhr.addEventListener('error', () => reject(genericErrorText));
      xhr.addEventListener('abort', () => reject());
      xhr.addEventListener('load', () => {
        const response = xhr.response;

        // This example assumes the XHR server's "response" object will come with
        // an "error" which has its own "message" that can be passed to reject()
        // in the upload promise.
        //
        // Your integration may handle upload errors in a different way so make sure
        // it is done properly. The reject() function must be called when the upload fails.
        if (!response || response.error) {
          return reject(
            response && response.error
              ? response.error.message
              : genericErrorText
          );
        }

        // If the upload is successful, resolve the upload promise with an object containing
        // at least the "default" URL, pointing to the image on the server.
        // This URL will be used to display the image in the content. Learn more in the
        // UploadAdapter#upload documentation.
        resolve({
          default: response.url,
        });
      });

      // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
      // properties which are used e.g. to display the upload progress bar in the editor
      // user interface.
      if (xhr.upload) {
        xhr.upload.addEventListener('progress', (evt) => {
          if (evt.lengthComputable) {
            loader.uploadTotal = evt.total;
            loader.uploaded = evt.loaded;
          }
        });
      }
    }

    // Prepares the data and sends the request.
    _sendRequest(file) {
      // Prepare the form data.
      const data = new FormData();
      data.append('file', file);

      // Important note: This is the right place to implement security mechanisms
      // like authentication and CSRF protection. For instance, you can use
      // XMLHttpRequest.setRequestHeader() to set the request headers containing
      // the CSRF token generated earlier by your application.

      // Send the request.
      this.xhr.send(data);
    }
  }

  // ...

  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  class UploadAttachment extends Plugin {
    init() {
      const editor = this.editor;
      editor.ui.componentFactory.add('uploadAttachment', (locale) => {
        const view = new FileDialogButtonView(locale);
        const buttonView = view.buttonView;

        view.set({
          acceptedType: '*',
        });

        buttonView.set({
          label: 'Upload Attachment',
          icon: UploadAttachmentIcon,
          tooltip: true,
        });

        buttonView.on(
          'execute',
          (evt) => {
            const size = bytesToSize(
              parseInt(document.getElementById('attachment_size').value)
            );

            if (
              size.includes('MB') ||
              size.includes('GB') ||
              size.includes('TB')
            ) {
              evt.stop();
              alert('You have exceeded the attchment uploads');
            } else if (
              document.getElementsByClassName('attachments').length >= 3
            ) {
              evt.stop();
              alert('Only 3 attachments are allowed!');
            }
          },
          { priority: 'high' }
        );

        view.on('done', (evt, file) => {
          const size = bytesToSize(
            parseInt(document.getElementById('attachment_size').value) +
              file[0].size
          );

          if (
            size.includes('MB') ||
            size.includes('GB') ||
            size.includes('TB')
          ) {
            alert('You have exceeded the attchment uploads');
          } else if (
            document.getElementsByClassName('attachments').length >= 3
          ) {
            alert('Only 3 attachments are allowed!');
          } else {
            const formData = new FormData();
            formData.append('file', file[0]);
            formData.append('id', templateId);

            const headers = {
              'Content-Type': 'multipart/form-data',
            };
            axios({
              method: 'post',
              url: attachmentUrl,
              headers: headers,
              data: formData,
            }).then((response) => {
              refetch();
            });
          }
        });

        return view;
      });
    }
  }

  const colors = [
    {
      color: 'hsl(168, 76%, 42%)',
      label: 'Strong Cyan',
    },
    {
      color: 'hsl(145, 63%, 49%)',
      label: 'Emerald',
    },
    {
      color: 'hsl(204, 70%, 53%)',
      label: 'Bright Blue',
    },
    {
      color: 'hsl(283, 39%, 53%)',
      label: 'Amethyst',
    },
    {
      color: 'hsl(210, 18%, 37%)',
      label: 'Grayish Blue',
    },
    {
      color: 'hsl(48, 89%, 50%)',
      label: 'Vivid Yellow',
    },
    {
      color: 'hsl(168, 76%, 36%)',
      label: 'Dark Cyan',
    },
    {
      color: 'hsl(145, 63%, 42%)',
      label: 'Dark Emerald',
    },
    {
      color: 'hsl(204, 64%, 44%)',
      label: 'Strong Blue',
    },
    {
      color: 'hsl(282, 44%, 47%)',
      label: 'Dark Violet',
    },
    {
      color: 'hsl(210, 29%, 24%)',
      label: 'Desaturated Blue',
    },
    {
      color: 'hsl(37, 90%, 51%)',
      label: 'Orange',
    },
    {
      color: 'hsl(28, 80%, 52%)',
      label: 'Carrot',
    },
    {
      color: 'hsl(6, 78%, 57%)',
      label: 'Pale Red',
    },
    {
      color: 'hsl(192, 15%, 94%)',
      label: 'Bright Silver',
    },
    {
      color: 'hsl(184, 9%, 62%)',
      label: 'Light Grayish Cyan',
    },
    {
      color: 'hsl(0, 0%, 87%)',
      label: 'Light Gray',
    },
    {
      color: 'hsl(0, 0%, 100%)',
      label: 'White',
    },
    {
      color: 'hsl(24, 100%, 41%)',
      label: 'Pumpkin',
    },
    {
      color: 'hsl(6, 63%, 46%)',
      label: 'Strong Red',
    },
    {
      color: 'hsl(204, 8%, 76%)',
      label: 'Silver',
    },
    {
      color: 'hsl(184, 6%, 53%)',
      label: 'Grayish Cyan',
    },
    {
      color: 'hsl(0, 0%, 60%)',
      label: 'Dark Gray',
    },
    {
      color: 'hsl(0, 0%, 0%)',
      label: 'Black',
    },
  ];
  const editorConfiguration = {
    plugins: [
      PasteFromOffice,
      MSWordNormalizer,
      GoogleDocsNormalizer,
      Essentials,
      Bold,
      Italic,
      Underline,
      Paragraph,
      HorizontalLine,
      Heading,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      RemoveFormate,
      Image,
      ImageCaption,
      ImageResize,
      ImageStyle,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      List,
      ListUi,
      NumberList,
      Link,
      // Commented as it's having errors
      //Alignment,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
    ],
    extraPlugins: [
      TemplatePreview,
      UploadAttachment,
      Placeholder,
      MyCustomUploadAdapterPlugin,
    ],
    toolbar: {
      items: [
        'bold',
        'italic',
        'underline',
        '|',
        'fontfamily',
        'fontsize',
        'heading',
        '|',
        'fontcolor',
        'fontbackgroundcolor',
        '|',
        'numberedList',
        'bulletedList',
        'outdent',
        'indent',
        '|',
        'removeformat',
        'link',
        // Commented as it's having errors
        // 'alignment',
        'imageupload',
        'templatePreview',
        'uploadAttachment',
        enableVidyard && 'vidyard',
        'placeholder',
      ],
    },
    heading: {
      options: [
        {
          model: 'paragraph',
          view: 'p',
          title: 'Normal',
          class: 'ck-heading_paragraph',
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1',
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2',
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3',
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4',
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5',
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6',
        },
        {
          model: 'format',
          view: 'pre',
          title: 'Formatted',
          class: 'ck-format',
        },
        {
          model: 'address',
          view: 'address',
          title: 'Address',
          class: 'ck-address',
        },
        { model: 'div', view: 'div', title: 'Normal (DIV)', class: 'ck-div' },
      ],
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Comic Sans MS, cursive',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif',
      ],
    },
    fontSize: {
      options: [
        'default',
        { title: '8', model: '8px' },
        { title: '9', model: '9px' },
        { title: '10', model: '10px' },
        { title: '11', model: '11px' },
        { title: '12', model: '12px' },
        { title: '14', model: '14px' },
        { title: '16', model: '16px' },
        { title: '18', model: '18px' },
        { title: '20', model: '20px' },
        { title: '22', model: '22px' },
        { title: '24', model: '24px' },
        { title: '26', model: '26px' },
        { title: '28', model: '28px' },
        { title: '36', model: '36px' },
        { title: '48', model: '48px' },
        { title: '72', model: '72px' },
      ],
    },
    fontColor: {
      colors: colors,
      columns: 6,
    },
    fontBackgroundColor: {
      colors: colors,
      columns: 6,
    },
    link: {
      defaultProtocol: 'http://',
    },
  };

  // Handle Block Start

  const handleDownloadAttachment = (props) => {
    const { currentTarget } = props;
    axios
      .get('attachments/' + currentTarget.value + '/download', {
        responseType: 'blob',
      })
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
  const handleRemoveAttachment = (props) => {
    const { currentTarget } = props;
    axios.delete('attachments/' + currentTarget.value).then((response) => {
      refetch();
    });
  };

  // Handle Block End

  return (
    <>
      <div className="w-100 p-3">
        {!mailMergeVariablesDataLoading &&
        !mailMergeVariablesResponseDataLoading &&
        mailMergeVariablesData ? (
          <>
            <Row className={showAttachments ? 'p-2 d-flex' : 'd-none'}>
              <Col sm={2}>Attachment(s)</Col>
              <Col sm={10}>
                <Row>
                  {attachments &&
                    attachments.map((attachment, i) => {
                      return (
                        <Col sm={4} key={i} className="pb-1">
                          <ButtonGroup className="w-100 attachments">
                            <ClButton
                              block
                              icon={attachment.actionIcon}
                              title={attachment.fileName}
                              className="text-overflow"
                              onClick={handleDownloadAttachment}
                              value={attachment.id}
                            >
                              {attachment.fileName}
                            </ClButton>
                            {type === 'templates' && (
                              <ClButton
                                onClick={handleRemoveAttachment}
                                value={attachment.id}
                                icon="fa fa-times"
                              ></ClButton>
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
              <Col sm={showTemplatePreview ? 6 : 12}>
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfiguration}
                  data={initialCkEditorData}
                  onInit={(editor) => {
                    if (onInit) {
                      onInit(editor);
                    }

                    // You can store the 'editor' and use when it is needed.
                    editor.editing.view.change((writer) => {
                      writer.setStyle(
                        'min-height',
                        '250px',
                        editor.editing.view.document.getRoot()
                      );
                      writer.setStyle(
                        'font-family',
                        'Arial,sans-serif',
                        editor.editing.view.document.getRoot()
                      );
                      writer.setStyle(
                        'font-size',
                        '14px',
                        editor.editing.view.document.getRoot()
                      );
                    });
                    editor.plugins.get('FileRepository').createUploadAdapter = (
                      loader
                    ) => {
                      return new MyUploadAdapter(loader);
                    };
                    editor.editing.view.document.on(
                      'enter',
                      (evt, data) => {
                        if (data.isSoft) {
                          editor.execute('shiftEnter');
                        } else {
                          editor.execute('shiftEnter');
                        }

                        data.preventDefault();
                        evt.stop();
                        editor.editing.view.scrollToTheSelection();
                      },
                      { priority: 'high' }
                    );

                    //To show the onload data in preview section
                    if (initialCkEditorData) {
                      dataRef.current = initialCkEditorData;
                      setIsDataChanged(true);
                    }
                  }}
                  onChange={(event, editor) => {
                    dataRef.current = editor.getData().replace(/&nbsp;$/, '');
                    setIsDataChanged(true);
                  }}
                />
              </Col>
              {showTemplatePreview && (
                <Col sm={6}>
                  <Card className="mb-0 border">
                    <CardHeader className="p-4">
                      <i className="far fa-eye mr-2"></i>Preview
                    </CardHeader>
                    <CardBody
                      className="bt overflow-auto"
                      style={{ minHeight: '250px' }}
                    >
                      <span
                        style={{
                          fontFamily: 'Arial,sans-serif',
                          fontSize: '14px',
                        }}
                        dangerouslySetInnerHTML={{
                          __html: templatePreviewData,
                        }}
                      />
                    </CardBody>
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

      <Modal
        isOpen={showVidyardWindow}
        toggle={() => setShowVidyardWindow(!showVidyardWindow)}
        centered={true}
      >
        <ModalHeader toggle={() => setShowVidyardWindow(!showVidyardWindow)}>
          Vidyard Videos
        </ModalHeader>
        <ModalBody>
          <div
            id="vidyard_video"
            style={{ minHeight: 200, minWidth: 400 }}
          ></div>
        </ModalBody>
      </Modal>
    </>
  );
});

CkEditor.defaultProps = {
  enableVidyard: false,
  imageUploadUrl: 'attachments',
  attachmentUrl: 'attachments',
};
CkEditor.propTypes = {
  imageUploadUrl: PropTypes.string, // this prop used for uploading image
  attachmentUrl: PropTypes.string, // this prop used for upload attachment
  enableVidyard: PropTypes.bool, // this prop used to enable vidyard plugin
};
export default CkEditor;
