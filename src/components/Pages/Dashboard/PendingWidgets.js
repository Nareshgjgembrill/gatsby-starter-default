/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'reactstrap';

const PendingWidgets = ({
  user,
  hasZipWhip,
  defaultDashboardWidgets,
  toDoCountsData,
  toDoCountsLoading,
  toDoCountsError,
  pendingCallsCount,
  fetchActiveCadencesData,
  fetchActiveCadencesLoading,
  setActiveCadencesTouchType,
}) => {
  const activeCadences = fetchActiveCadencesData?.activeCadences?.data
    ? fetchActiveCadencesData?.activeCadences?.data[1]?.activeCadenceCount
    : undefined;
  return (
    <Row>
      {/* Pending Calls */}
      {defaultDashboardWidgets?.indexOf('call') !== -1 && (
        <Col sm={6} md={4} lg={3} className="cadence-xl-auto px-2">
          <div
            className="flex-row align-items-center align-items-stretch border-0 card text-decoration-none"
            style={{ height: '77px' }}
          >
            <Col
              sm={3}
              className="d-flex align-items-center bg-green justify-content-center rounded-left"
            >
              <i className="fas fa-phone-alt fa-2x"></i>
            </Col>
            <Col sm={9} className="py-3 pr-0 bg-green-light rounded-right">
              <Link
                className="text-decoration-none text-white"
                to={{
                  pathname: `pendingCalls`,
                }}
              >
                <div className="h6 mb-2">{pendingCallsCount || 0} Calls</div>
              </Link>
              <div className="row text-capitalize h5 my-1">
                <i
                  className={`col-1 p-0 ml-3 text-center ${
                    fetchActiveCadencesLoading
                      ? 'fa fa-spinner fa-spin'
                      : 'svgicon koncert-cadence-icon fa-sm'
                  }`}
                  style={{ marginTop: '1px' }}
                ></i>
                <div className="col-9 pl-1 pr-0 text-wrap">
                  {activeCadences?.call} Cadences + Tasks
                </div>
              </div>
            </Col>
          </div>
        </Col>
      )}

      {/* Pending Emails */}
      {defaultDashboardWidgets?.indexOf('email') !== -1 && (
        <Col sm={6} md={4} lg={3} className="cadence-xl-auto px-2">
          <div
            className="flex-row align-items-center align-items-stretch border-0 card "
            style={{ height: '77px' }}
          >
            <Col
              sm={3}
              className="d-flex align-items-center bg-info-dark justify-content-center rounded-left"
            >
              <i className="fas fa-envelope fa-2x"></i>
            </Col>
            <Col sm={9} className="py-3 bg-info rounded-right">
              <Link
                className="text-decoration-none text-white"
                to={{
                  pathname: `toDo`,
                  search: `filter[touch][type]=EMAIL`,
                }}
              >
                <div className="h6 mb-2">
                  {(!toDoCountsLoading &&
                    !toDoCountsError &&
                    toDoCountsData?.email?.paging?.totalCount) ||
                    0}{' '}
                  Emails
                </div>
              </Link>
              <div className="text-capitalize h5 my-1 text-nowrap ">
                <i
                  className={`${
                    fetchActiveCadencesLoading
                      ? 'fa fa-spinner fa-spin mr-2'
                      : 'svgicon koncert-cadence-icon mr-2 fa-sm'
                  }`}
                ></i>
                {activeCadences?.email} Cadences
              </div>
            </Col>
          </div>
        </Col>
      )}

      {/* Pending Texts */}

      {hasZipWhip &&
        user &&
        user.zipwhipSessionKey &&
        defaultDashboardWidgets?.indexOf('text') !== -1 && (
          <Col sm={6} md={4} lg={3} className="cadence-xl-auto px-2">
            <div
              className="flex-row align-items-center align-items-stretch border-0 card text-decoration-none"
              style={{ height: '77px' }}
            >
              <Col
                sm={3}
                className="d-flex align-items-center bg-purple-dark justify-content-center rounded-left"
              >
                <i className="fas fa-comments fa-2x"></i>
              </Col>
              <Col sm={9} className="py-3 bg-purple rounded-right">
                <Link
                  className="text-decoration-none text-white"
                  to={{
                    pathname: `toDo`,
                    search: `filter[touch][type]=TEXT`,
                  }}
                >
                  <div className="h6 mb-2">
                    {(!toDoCountsLoading &&
                      !toDoCountsError &&
                      toDoCountsData?.text?.paging?.totalCount) ||
                      0}{' '}
                    Texts
                  </div>
                </Link>
                <div className="text-capitalize h5 my-1 text-nowrap ">
                  <i
                    className={`${
                      fetchActiveCadencesLoading
                        ? 'fa fa-spinner fa-spin mr-2'
                        : 'svgicon koncert-cadence-icon mr-2 fa-sm'
                    }`}
                  ></i>
                  {activeCadences?.text} Cadences
                </div>
              </Col>
            </div>
          </Col>
        )}
      {/* Pending Others */}
      {defaultDashboardWidgets?.indexOf('social') !== -1 && (
        <Col sm={6} md={4} lg={3} className="cadence-xl-auto px-2">
          <div
            className="flex-row align-items-center align-items-stretch border-0 card text-decoration-none"
            style={{ height: '77px' }}
          >
            <Col
              sm={3}
              className="d-flex align-items-center bg-warning-dark justify-content-center rounded-left"
            >
              <i className="fas fa-share-alt fa-2x"></i>
            </Col>
            <Col sm={9} className="py-3 bg-warning rounded-right">
              <Link
                className="text-decoration-none text-white"
                to={{
                  pathname: `toDo`,
                  search: `filter[touch][type]=OTHERS`,
                }}
              >
                <div className="h6 mb-2">
                  {(!toDoCountsLoading &&
                    !toDoCountsError &&
                    toDoCountsData?.others?.paging?.totalCount) ||
                    0}{' '}
                  Social
                </div>
              </Link>
              <div className="text-capitalize h5 my-1 text-nowrap ">
                <i
                  className={`${
                    fetchActiveCadencesLoading
                      ? 'fa fa-spinner fa-spin mr-2'
                      : 'svgicon koncert-cadence-icon mr-2 fa-sm'
                  }`}
                ></i>
                {activeCadences?.other} Cadences
              </div>
            </Col>
          </div>
        </Col>
      )}
      {/* Pending Linkedin */}
      {defaultDashboardWidgets?.indexOf('linkedin') !== -1 && (
        <Col sm={6} md={4} lg={3} className="cadence-xl-auto px-2">
          <div
            className="flex-row align-items-center align-items-stretch border-0 card text-decoration-none"
            style={{ height: '77px' }}
          >
            <Col
              sm={3}
              className="d-flex align-items-center bg-color-poppy justify-content-center rounded-left"
            >
              <i className="fab fa-linkedin fa-2x"></i>
            </Col>
            <Col sm={9} className="py-3 bg-color-poppy-light rounded-right">
              <Link
                className="text-decoration-none text-white"
                to={{
                  pathname: `toDo`,
                  search: `filter[touch][type]=LINKEDIN`,
                }}
              >
                <div className="h6 mb-2">
                  {(!toDoCountsLoading &&
                    !toDoCountsError &&
                    toDoCountsData?.linkedin?.paging?.totalCount) ||
                    0}{' '}
                  LinkedIn
                </div>
              </Link>
              <div className="text-capitalize h5 my-1 text-nowrap ">
                <i
                  className={`${
                    fetchActiveCadencesLoading
                      ? 'fa fa-spinner fa-spin mr-2'
                      : 'svgicon koncert-cadence-icon mr-2 fa-sm'
                  }`}
                ></i>
                {activeCadences?.linkedin} Cadences
              </div>
            </Col>
          </div>
        </Col>
      )}
      {/* Unassigned */}
      {defaultDashboardWidgets?.indexOf('unassigned') !== -1 && (
        <Col sm={6} md={4} lg={3} className="cadence-xl-auto px-2">
          <Link
            className="flex-row align-items-center align-items-stretch border-0 card text-decoration-none"
            style={{ height: '77px' }}
            to={{
              pathname: `prospects/list`,
              search: `filter[status]=unassigned`,
            }}
          >
            <Col
              sm={3}
              className="d-flex align-items-center bg-danger-dark justify-content-center rounded-left"
            >
              <i className="fas fa-user fa-2x"></i>
            </Col>
            <Col sm={9} className="py-3 bg-danger rounded-right">
              <div className="h6 mb-2">
                {(!toDoCountsLoading &&
                  !toDoCountsError &&
                  toDoCountsData?.unassigned?.paging?.totalCount) ||
                  0}
              </div>
              <div className="text-capitalize h5 my-1 text-nowrap">
                Unassigned
              </div>
            </Col>
          </Link>
        </Col>
      )}
    </Row>
  );
};

export default PendingWidgets;
