/**
 * @author ranbarasan82
 * @version V11.0
 */
import moment from 'moment-timezone';
import React, { useContext, useEffect, useState } from 'react';
import ScrollArea from 'react-scrollbar';
import { Card, CardBody, Col, Collapse, Row } from 'reactstrap';
import { parseUrl } from 'query-string';
import UserContext from '../../UserContext';

function PendingActivityGrid({ data, loading, handleActionEditTask }) {
  const [togglePendingTasks, setTogglePendingTasks] = useState(false);
  const pendingTasksToggle = () => setTogglePendingTasks(!togglePendingTasks);
  /* Pending Tasks */

  const formateDateTime = (inputData) => {
    const dueDate = inputData.snoozed
      ? inputData.snoozed
      : inputData.followUpDueDate;
    if (dueDate) {
      const dateTime = moment(dueDate).format('M/D/YYYY');
      return dateTime.split(',');
    }
    return '';
  };

  const { user, loading: userLoading } = useContext(UserContext);
  const { query: searchParams } = parseUrl(window.location.search);
  const currentUserId = userLoading ? 0 : user.id;
  const selectedUserId = searchParams['filter[user][id]']
    ? parseInt(searchParams['filter[user][id]'])
    : currentUserId;

  useEffect(() => {
    if (data?.length > 0) {
      setTogglePendingTasks(true);
    }
  }, [data]);

  return (
    <Card className="card-default mx-0 border-0">
      <div className="card-header bg-white border-bottom">
        <h5 className="my-1 color-bluewood">
          Pending Tasks
          <span className="ml-2">
            ({data && data.length > 0 ? data.length : 0})
          </span>
          <i
            onClick={pendingTasksToggle}
            className={`fa fa-chevron-${
              togglePendingTasks ? 'up' : 'down'
            } color-lynch ml-3 mt-1 pointer float-right`}
          ></i>
        </h5>
      </div>
      <Collapse isOpen={togglePendingTasks}>
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
              {data?.map((item, index) => {
                return (
                  <Row
                    className={`align-items-center border-bottom ${
                      index === 0 ? 'py-2' : 'py-3'
                    }`}
                    key={index}
                  >
                    <Col>
                      <div className="pt-1 mb-2">
                        <i className="fas fa-calendar-alt mr-2"></i>
                        {formateDateTime(item)}
                      </div>
                      <div className="text-break mb-2">
                        <span className="d-block text-sm">Subject: </span>{' '}
                        {item.subject}
                      </div>{' '}
                      <div className="text-break mb-2">
                        <span className="d-block text-sm">Notes: </span>{' '}
                        {item.comments}
                      </div>
                    </Col>
                    <Col lg={2} className="px-1 text-center">
                      {selectedUserId === currentUserId && (
                        <i
                          className="fas fa-pencil-alt mr-2 pointer"
                          onClick={() => handleActionEditTask(item)}
                        ></i>
                      )}
                    </Col>
                  </Row>
                );
              })}
              {!loading && (!data || data.length === 0) && (
                <Row className="py-2 mt-3">
                  <span className="text-center mb-0 w-100 text-warning">
                    <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                    No Pending Tasks Available
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
export default PendingActivityGrid;
