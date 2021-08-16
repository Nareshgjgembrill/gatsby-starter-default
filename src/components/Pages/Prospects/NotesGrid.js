/**
 * @author albert
 * @version V11.2
 */
import React, { useContext, useEffect, useState } from 'react';
import ScrollArea from 'react-scrollbar';
import { Card, CardBody, Col, Collapse, Row } from 'reactstrap';
import { useLazyQuery } from '@apollo/react-hooks';
import axios from 'axios';
import moment from 'moment-timezone';
import { parseUrl } from 'query-string';
import { FETCH_ATTACHMENTS_QUERY } from '../../queries/ProspectsQuery';
import UserContext from '../../UserContext';
import { formateDateTime, showErrorMessage } from '../../../util/index';

function NotesGrid({
  data,
  loading,
  handleActionEditNotes,
  handleActionDeleteNotes,
  attachmentUrl,
}) {
  const [toggleNotes, setToggleNotes] = useState(false);
  const notesToggle = () => setToggleNotes(!toggleNotes);
  /* Notes */

  const { user, loading: userLoading } = useContext(UserContext);
  const { query: searchParams } = parseUrl(window.location.search);
  const currentUserId = userLoading ? 0 : user.id;
  const selectedUserId = searchParams['filter[user][id]']
    ? parseInt(searchParams['filter[user][id]'])
    : currentUserId;

  const handleDownloadAttachment = (value, title) => {
    axios
      .get(`${attachmentUrl + '/' + value}/download`, {
        responseType: 'blob',
      })
      .then((response) => {
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: response.headers['content-type'] })
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', title);
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  const [
    getAttachments,
    { data: attachmentData, loading: attachmentLoading },
  ] = useLazyQuery(FETCH_ATTACHMENTS_QUERY, {
    notifyOnNetworkStatusChange: true,
    onError: (response) => {
      showErrorMessage(
        response,
        'Failed to next page prospect(s)',
        attachmentData,
        'prospect_list'
      );
    },
  });

  const attachmentsData = attachmentData?.attachments?.data || [];

  const handleGetAttachmentDetails = () => {
    const attachmentArray = [];
    data?.note?.length > 0 &&
      data.note.forEach((note) => {
        if (note?.associations?.attachment[0]?.id) {
          attachmentArray.push(note.associations.attachment[0].id);
        }
      });
    if (attachmentArray.length > 0) {
      getAttachments({
        variables: {
          attachmentId: `:[${attachmentArray}]`,
        },
      });
    }
  };

  useEffect(() => {
    if (data?.note?.length > 0) {
      setToggleNotes(true);
      handleGetAttachmentDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Card className="card-default mx-0 border-0">
      <div className="card-header bg-white border-bottom">
        <h5 className="my-1 color-bluewood">
          Notes
          <span className="ml-2">
            ({data?.note?.length > 0 ? data.note.length : 0})
          </span>
          <i
            onClick={notesToggle}
            className={`fa fa-chevron-${
              toggleNotes ? 'up' : 'down'
            } color-lynch ml-3 mt-1 pointer float-right`}
          ></i>
        </h5>
      </div>
      <Collapse isOpen={toggleNotes}>
        <ScrollArea
          speed={0.8}
          className="area"
          contentClassName="content"
          horizontal={true}
          style={{
            minHeight: '80px',
            maxHeight: '250px',
          }}
        >
          <Card className="mb-0 shadow-none border-0">
            <CardBody className="py-0">
              {!attachmentLoading &&
                data?.note?.map((item, index) => {
                  const attachmentDetails = item?.associations?.attachment[0]
                    ?.id
                    ? attachmentsData.find(
                        (attachment) =>
                          attachment.id === item.associations.attachment[0].id
                      )
                    : {};
                  return (
                    <Row
                      className={`align-items-center border-bottom ${
                        index === 0 ? 'py-2' : 'py-3'
                      }`}
                      key={index}
                    >
                      <Col>
                        <div className="pt-1 mb-2">
                          <span title="Created date and time">
                            <i className="fas fa-calendar-alt mr-2"></i>
                            {moment(moment().format('MM/DD/YYYY')).isSame(
                              moment(item.createdAt).format('MM/DD/YYYY')
                            )
                              ? moment(item.createdAt).format('h:mm A')
                              : formateDateTime(item.createdAt)}
                          </span>
                          <span>
                            {selectedUserId === currentUserId && (
                              <span className="float-right">
                                <i
                                  title="Edit this note"
                                  className="fas fa-pencil-alt mr-2 pointer"
                                  onClick={() =>
                                    handleActionEditNotes(
                                      item,
                                      attachmentDetails
                                    )
                                  }
                                ></i>
                                <i
                                  title="Delete this note"
                                  className="fas fa-trash-alt mx-2 pointer"
                                  onClick={() => handleActionDeleteNotes(item)}
                                ></i>
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="text-break mb-2">
                          <span className="d-block text-sm text-bold">
                            Notes{' '}
                          </span>{' '}
                          {item.note}
                        </div>
                        <div className="text-break mb-2">
                          <span className="d-block text-sm text-bold">
                            Attachment{' '}
                          </span>{' '}
                          <span>
                            {attachmentDetails?.fileName ? (
                              <span>
                                <i
                                  className={`${attachmentDetails.actionIcon}`}
                                ></i>{' '}
                                {attachmentDetails.fileName}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </span>
                          {attachmentDetails?.fileName && (
                            <i
                              title={`Download ${attachmentDetails?.fileName} (${attachmentDetails?.attachmentFileSize})`}
                              className="fas fa-download ml-2"
                              onClick={() =>
                                handleDownloadAttachment(
                                  attachmentDetails?.file_name_with_timestamp ||
                                    attachmentDetails?.fileNameWithTimeStamp ||
                                    attachmentDetails?.fileNameWithTimestamp,
                                  attachmentDetails?.fileName
                                )
                              }
                            ></i>
                          )}
                        </div>
                      </Col>
                    </Row>
                  );
                })}
              {!attachmentLoading && !loading && (!data || data?.note?.length === 0) && (
                <Row className="py-2 mt-3">
                  <span className="text-center mb-0 w-100 text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Notes Available
                  </span>
                </Row>
              )}
              {attachmentLoading && (
                <Row className="py-2 mt-3">
                  <span className="text-center mb-0 w-100 text-muted">
                    <i className="fas fa-spinner fa-spin fa-lg mr-2"></i>
                  </span>
                </Row>
              )}
            </CardBody>
          </Card>
        </ScrollArea>
      </Collapse>
    </Card>
  );
}

NotesGrid.defaultProps = {
  attachmentUrl: 'attachments',
};

export default NotesGrid;
