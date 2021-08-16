/**
 * @author ranbarasan82
 * @version V11.0
 */
import React, { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/react-hooks';
import ScrollArea from 'react-scrollbar';
import { Card, CardBody, Col, Collapse, Row } from 'reactstrap';
import moment from 'moment';
import { GET_MAIL_MERGE_RESPONSE } from '../../queries/EmailTemplatesQuery';
import { notify, showErrorMessage } from '../../../util/index';

function PendingEmailGrid({
  data,
  loading,
  handleShowEmailModal,
  dropdownUserId,
  prospectId,
}) {
  const [togglePendingEmails, setTogglePendingEmails] = useState(false);
  const pendingEmailsToggle = () =>
    setTogglePendingEmails(!togglePendingEmails);

  const getDueAt = (dueAt) => {
    const dueDate = dueAt;
    return dueDate && dueDate.startsWith('Due')
      ? dueDate.replace('Due', 'In')
      : dueDate;
  };

  const currentTouch =
    data.currentTouchId && data.currentTouchType
      ? `Touch ${data.currentTouchId} (${data.currentTouchType})`
      : 'N/A';

  const formateDateTime = (inputDate, inputTimeZone) => {
    let timeZone = '';
    switch (inputTimeZone) {
      case 'America/New_York':
        timeZone = 'EST';
        break;
      case 'America/Chicago':
        timeZone = 'CST';
        break;
      case 'America/Denver':
        timeZone = 'MST';
        break;
      case 'America/Los_Angeles':
        timeZone = 'PST';
        break;
      default:
        break;
    }
    return `${moment.tz(inputDate, 'UTC').format('M/D/YYYY h:mm A')} ${timeZone}`;
  };

  useEffect(() => {
    if (data?.pendingEmails?.length > 0) {
      setTogglePendingEmails(true);
    }
  }, [data]);
  /* Pending Emails */

  const [
    fetchMailMerge,
    { data: mailMergeVariablesResponseData },
  ] = useLazyQuery(GET_MAIL_MERGE_RESPONSE, {
    variables: {
      input: {
        user: {
          id: dropdownUserId,
        },
        prospect: {
          id: prospectId || 0,
        },
      },
    },
    onError: (error) => {
      showErrorMessage(
        error,
        'Sorry! Failed to load Mail Merge data.',
        mailMergeVariablesResponseData,
        'failed_mail_merge'
      );
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (dropdownUserId && prospectId) {
      fetchMailMerge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownUserId, prospectId]);

  const mailMergeValues =
    mailMergeVariablesResponseData?.mailmergeResponse?.data?.mailMergeJsonData?.mailMergeData.map(
      (data) => {
        const name = data.name === 'OTHERS' ? 'SOCIAL' : data.name;
        return { id: data.id, name };
      }
    ) || [];

  const replaceMailMergeVariables = (emailSubjectWithMailMergeValue) => {
    for (let i = 0; i < mailMergeValues.length; i++) {
      const obj = mailMergeValues[i];

      const regexMailMergeSub = new RegExp(`{{${obj.id}}}`, 'g');
      emailSubjectWithMailMergeValue = emailSubjectWithMailMergeValue.replace(
        regexMailMergeSub,
        obj.name || ''
      );
    }
    return emailSubjectWithMailMergeValue;
  };

  const handleClick = (item) => {
    if (item?.scheduledDateTime) {
      notify(
        `This email has already been scheduled to go out on ${formateDateTime(
          item.scheduledDateTime,
          item.scheduledTimezone
        )}`
      );
    } else {
      handleShowEmailModal();
    }
  };

  return (
    <Card className="card-default mx-0 border-0">
      <div className="card-header bg-white border-bottom">
        <h5 className="my-1 color-bluewood">
          Pending Emails
          <span className="ml-2">
            (
            {data?.pendingEmails && data.pendingEmails.length > 0
              ? data.pendingEmails.length
              : 0}
            )
          </span>
          <i
            onClick={pendingEmailsToggle}
            className={`fa fa-chevron-${
              togglePendingEmails ? 'up' : 'down'
            } color-lynch ml-2 mt-1 pointer float-right`}
          ></i>
        </h5>
      </div>
      <Collapse isOpen={togglePendingEmails}>
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
              {data &&
                data.pendingEmails &&
                data.pendingEmails.map((item, index) => {
                  return (
                    <Row
                      className={`align-items-center border-bottom ${
                        index === 0 ? 'py-2' : 'py-3'
                      }`}
                      key={index}
                    >
                      <Col>
                        <div className="text-break pt-1 mb-2">
                          <span className="d-block text-sm">Subject: </span>{' '}
                          {replaceMailMergeVariables(item.subject)}
                        </div>
                        {item?.scheduledDateTime ? (
                          <div className="text-break mb-2">
                            <span className="d-block text-sm">
                              Scheduled Date Time:{' '}
                            </span>{' '}
                            {formateDateTime(
                              item?.scheduledDateTime,
                              item?.scheduledTimezone
                            )}
                          </div>
                        ) : (
                          <div className="text-break mb-2">
                            <span className="d-block text-sm">Due: </span>{' '}
                            {getDueAt(data.dueAt)}
                          </div>
                        )}
                        <div className="text-break mb-2">
                          <span className="d-block text-sm">
                            Current Touch:{' '}
                          </span>{' '}
                          {currentTouch}
                        </div>
                      </Col>
                      <Col lg={2} className="px-1 text-center">
                        <i
                          className="fas fa-envelope text-email mr-2 pointer"
                          onClick={() => handleClick(item)}
                        ></i>
                      </Col>
                    </Row>
                  );
                })}
              {!loading &&
                (!data ||
                  !data.pendingEmails ||
                  data.pendingEmails.length === 0) && (
                  <Row className="mt-3 py-2">
                    <span className="text-center mb-0 w-100 text-warning">
                      <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                      No Pending Emails Available
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
export default PendingEmailGrid;
