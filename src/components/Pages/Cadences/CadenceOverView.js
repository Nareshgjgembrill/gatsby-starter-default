import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useLazyQuery, useQuery } from '@apollo/react-hooks';
import { toast } from 'react-toastify';
import {
  Button,
  Col,
  Collapse,
  Input,
  Label,
  Progress,
  Row,
  Tooltip,
} from 'reactstrap';
import { notify, showErrorMessage } from '../../../util/index';
import Chart from '../../Common/Chart';
import ConfirmModal from '../../Common/ConfirmModal';
import { FETCH_METRICS_QUERY } from '../../queries/CadenceQuery';
import {
  EDIT_TOUCH,
  FETCH_OUTCOMES_QUERY,
  FETCH_TOUCHES_QUERY,
} from '../../queries/TouchQuery';
import TemplatePreview from './TemplatePreview';
toast.configure();

const CadenceOverView = ({ match, filters, userIds, expandAll }) => {
  const history = useHistory();
  const [accordionState, setMyState] = useState();
  const [isOpenActivity, setIsOpenActivity] = useState(false);
  const [isOpenScore, setIsOpenScore] = useState(false);
  const [isOpenDetail] = useState(true);
  const [
    disableTemplateConfirmModal,
    setDisableTemplateConfirmModal,
  ] = useState(false);
  const [enableTemplateConfirmModal, setEnableTemplateConfirmModal] = useState(
    false
  );
  const [templatePreviewModal, setTemplatePreviewModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState();
  const [disableTouchId, setDisableTouchId] = useState();
  const [emailTemplateUpdate, setEmailTemplateUpdate] = useState();
  const [emailTemplateName, setEmailTemplateName] = useState();
  const [nestedTemplateData, setNestedTemplateData] = useState([]);

  const cadenceId = match.params['id'];
  const touchFilter = `filter[user][id]=${userIds}&filter[cadence][id]=${cadenceId}`;
  const emailFilter = `filter[user][id]=${userIds}&filter[cadence][id]=${cadenceId}&filter[type]=EMAIL`;

  const callFilter = `filter[user][id]=${userIds}&filter[cadence][id]=${cadenceId}&filter[type]=CALL`;

  const engagementScoreChartData = [];
  const emailActivityChartData = [];
  const callActivityChartData = [];
  const [tooltipOpen, setTooltipOpen] = useState();

  const toggleToottip = (id) => {
    tooltipOpen === id ? setTooltipOpen(-id) : setTooltipOpen(id);
  };

  const toggleAccordion = (id) => {
    accordionState === id ? setMyState(-id) : setMyState(id);
  };

  const toggleActivity = () => setIsOpenActivity(!isOpenActivity);
  const toggleScore = () => setIsOpenScore(!isOpenScore);

  const [
    disableTemplate,
    { data: disableTemplateData, loading: disableTemplateLoading },
  ] = useLazyQuery(EDIT_TOUCH, {
    onCompleted: (response) => handleDisableTemplateCallback(response, true),
    onError: (response) =>
      handleDisableTemplateCallback(response, false, disableTemplateData),
  });
  const [
    enableTemplate,
    { data: enableTemplateData, loading: enableTemplateLoading },
  ] = useLazyQuery(EDIT_TOUCH, {
    onCompleted: (response) => handleEnableTemplateCallback(response, true),
    onError: (response) =>
      handleEnableTemplateCallback(response, false, enableTemplateData),
  });

  const {
    data: touchesData,
    loading: touchesLoading,
    error: touchesError,
    refetch: refetchTouches,
  } = useQuery(FETCH_TOUCHES_QUERY, {
    variables: {
      touchFilter: touchFilter,
      includeAssociationsQry: 'includeAssociations[]=emailTemplate',
    },
    notifyOnNetworkStatusChange: true,
    skip: filters,
  });

  const {
    data: emailTouchesData,
    loading: emailLoading,
    error: emailError,
  } = useQuery(FETCH_OUTCOMES_QUERY, {
    variables: {
      touchFilter: emailFilter,
      includeAssociationsQry: 'includeAssociations[]=emailTemplate',
    },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: callTouchesData,
    loading: callLoading,
    error: callError,
  } = useQuery(FETCH_OUTCOMES_QUERY, {
    variables: {
      touchFilter: callFilter,
      includeAssociationsQry: 'includeAssociations[]=emailTemplate',
    },
    notifyOnNetworkStatusChange: true,
    skip: !filters,
  });

  const emailData = useMemo(
    () =>
      emailTouchesData && emailTouchesData.Touches
        ? emailTouchesData.Touches.data[0]
          ? emailTouchesData.Touches.data[0].outComes
          : []
        : [],
    [emailTouchesData]
  );

  const emailActivityLabels = emailData && Object.keys(emailData);
  const emailActivityValues = emailData && Object.values(emailData);

  const handleDisableTemplateCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Template has been disabled!', 'success', 'disable_template');
      refetchTouches();
      setDisableTemplateConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to disable this Template',
        errorData,
        'disable_template'
      );
    }
  };

  const handleEnableTemplateCallback = (
    response,
    requestSuccess,
    errorData
  ) => {
    if (requestSuccess) {
      notify('Template enabled successfully!', 'success', 'enable_template');
      refetchTouches();
      setEnableTemplateConfirmModal(false);
    } else {
      showErrorMessage(
        response,
        'Sorry! Failed to enable this Template',
        errorData,
        'enable_template'
      );
    }
  };

  if (emailActivityLabels) {
    for (let i = 0; i < emailActivityLabels.length; i++) {
      let temp = {};
      if (
        emailActivityValues[i] > 0 &&
        !['total', 'active', 'paused'].includes(emailActivityLabels[i])
      ) {
        temp = {
          id: `${
            emailActivityLabels[i].charAt(0).toUpperCase() +
            emailActivityLabels[i].slice(1)
          }`,
          label: `${
            emailActivityLabels[i].charAt(0).toUpperCase() +
            emailActivityLabels[i].slice(1)
          } (${emailActivityValues[i]})`,
          value: emailActivityValues[i],
        };
        emailActivityChartData.push(temp);
      }
    }
  }

  const callData = useMemo(
    () =>
      callTouchesData && callTouchesData.Touches
        ? callTouchesData.Touches.data[0]
          ? callTouchesData.Touches.data[0].outComes
          : []
        : [],
    [callTouchesData]
  );

  const callActivityLabels = callData && Object.keys(callData);
  const callActivityValues = callData && Object.values(callData);

  if (callActivityLabels) {
    for (let i = 0; i < callActivityLabels.length; i++) {
      let temp = {};
      if (
        callActivityValues[i] > 0 &&
        !['total', 'active', 'paused'].includes(emailActivityLabels[i])
      ) {
        temp = {
          id: `${
            callActivityLabels[i].charAt(0).toUpperCase() +
            callActivityLabels[i].slice(1)
          }`,
          label: `${
            callActivityLabels[i].charAt(0).toUpperCase() +
            callActivityLabels[i].slice(1)
          } (${callActivityValues[i]})`,
          value: callActivityValues[i],
        };
        callActivityChartData.push(temp);
      }
    }
  }

  const {
    data: engagementScore,
    loading: engagementScoreLoading,
    error: engagementScoreError,
  } = useQuery(FETCH_METRICS_QUERY, {
    variables: {
      id: cadenceId,
      userIDs: userIds,
      includeAssociationsQry: 'includeAssociations[]=engagementScore',
    },
    notifyOnNetworkStatusChange: true,
    skip: !filters,
  });

  const engagementScoreData = useMemo(
    () =>
      engagementScore &&
      engagementScore?.cadence?.includedAssociations?.engagementScore[0] &&
      engagementScore.cadence.includedAssociations.engagementScore[0]
        ? engagementScore.cadence.includedAssociations.engagementScore[0]
        : [],
    [engagementScore]
  );

  engagementScoreData && delete engagementScoreData['cadence'];

  const engagementScoreLabels =
    engagementScoreData && Object.keys(engagementScoreData);
  const engagementScoreValues =
    engagementScoreData && Object.values(engagementScoreData);

  if (engagementScoreLabels) {
    for (let i = 0; i < engagementScoreLabels.length; i++) {
      let temp = {};
      let label = engagementScoreLabels[i];
      if (engagementScoreValues[i] > 0) {
        if (engagementScoreLabels[i] === 'otherEngagementScore') {
          label = 'socialEngagementScore';
        }
        temp = {
          id: `${label.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
            return str.toUpperCase();
          })}`,
          label: `${label
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function (str) {
              return str.toUpperCase();
            })} (${engagementScoreValues[i]})`,
          value: engagementScoreValues[i],
        };
        engagementScoreChartData.push(temp);
      }
    }
  }

  const touchData = useMemo(
    () => (touchesData && touchesData.Touches ? touchesData.Touches.data : []),
    [touchesData]
  );
  const touchIncludeAssociations = useMemo(
    () =>
      touchesData &&
      touchesData.Touches &&
      touchesData.Touches.includedAssociations
        ? touchesData.Touches.includedAssociations.emailtemplate
        : [],
    [touchesData]
  );

  const getTemplateData = (touchID) => {
    const templates = [];
    let touchIds;
    if (touchData && touchIncludeAssociations) {
      touchData.length > 0 &&
        touchData.forEach((touch) => {
          if (touch.id === touchID) {
            touchIds = touch.associations.emailTemplate.map((item) => item.id);
            touchIncludeAssociations.length > 0 &&
              touchIncludeAssociations.forEach((item) => {
                if (touchIds && touchIds.includes(item.id)) {
                  templates.push(item);
                }
              });
          }
        });
    }
    return templates;
  };

  const getTemplateStatus = (touchID, templateID) => {
    let templateStatus;
    if (touchData && touchIncludeAssociations) {
      touchData.length > 0 &&
        touchData.forEach((touch) => {
          if (touch.id === touchID) {
            touch.associations.emailTemplate.forEach((item) => {
              if (item.id === templateID) {
                templateStatus = item.enable || false;
              }
            });
          }
        });
    }
    return templateStatus;
  };

  const handleToggleTemplate = (
    e,
    touchID,
    templateID,
    templateName,
    isEnabled
  ) => {
    const emailTemplateUpdate = [];
    let templateStatus;
    if (touchData && touchIncludeAssociations) {
      touchData.length > 0 &&
        touchData.forEach((touch) => {
          let temp = {};
          if (touch.id === touchID) {
            touch.associations.emailTemplate.forEach((item) => {
              if (item.id === templateID) {
                setEmailTemplateName(templateName);
                setDisableTouchId(touchID);
                templateStatus = !item.enable;
              } else {
                templateStatus = item.enable;
              }
              temp = { id: item.id, enable: templateStatus };
              emailTemplateUpdate.push(temp);
            });
          }
        });
    }
    setEmailTemplateUpdate(emailTemplateUpdate);
    const templateInActiveCount =
      emailTemplateUpdate &&
      emailTemplateUpdate.filter((item) => item.enable === false);

    if (
      emailTemplateUpdate &&
      templateInActiveCount &&
      templateInActiveCount.length === emailTemplateUpdate.length
    ) {
      e.preventDefault();
      notify(
        'Atleast 1 active Template is mandatory!',
        'error',
        'one_active_template'
      );
      return false;
    } else if (isEnabled) {
      setDisableTemplateConfirmModal(true);
    } else if (!isEnabled) {
      setEnableTemplateConfirmModal(true);
    }
  };

  const getTouchIcons = (touch) => {
    let className = 'fas fa-stack-1x text-primary text-bold ';
    switch (touch) {
      case 'EMAIL':
        className += 'fa-envelope text-email';

        break;
      case 'OTHERS':
        className =
          'fas fa-share-alt fa-stack-1x ml-1 pr-2 text-social text-bold';
        break;
      case 'CALL':
        className = 'fas fa-phone-alt fa-stack-1x text-call text-bold';
        break;
      case 'LINKEDIN':
        className = 'fab fa-linkedin-in fa-stack-1x text-linkedin';
        break;
      default:
        className = 'far fa-comments fa-stack-1x text-danger text-bold';
        break;
    }
    return className;
  };
  const getButtonClass = (touch) => {
    let buttonClassName;
    switch (touch) {
      case 'EMAIL':
        buttonClassName = 'fas fa-circle fa-stack-2x';
        break;
      case 'OTHERS':
        buttonClassName = 'fas fa-circle fa-stack-2x';
        break;
      case 'CALL':
        buttonClassName = 'fas fa-circle fa-stack-2x';
        break;
      case 'LINKEDIN':
        buttonClassName = 'fas fa-circle fa-stack-2x';
        break;
      default:
        buttonClassName = 'fas fa-circle fa-stack-2x';
        break;
    }

    return buttonClassName;
  };
  const getUnit = (value, unit) => {
    let displayUnit;
    if (unit === 'Mi') {
      if (value > 1) {
        displayUnit = 'mins';
      } else {
        displayUnit = 'min';
      }
    } else if (unit === 'Ho') {
      if (value > 1) {
        displayUnit = 'Hrs';
      } else {
        displayUnit = 'Hr';
      }
    } else if (unit === 'Da') {
      if (value > 1) {
        displayUnit = 'days';
      } else {
        displayUnit = 'day';
      }
    } else {
      displayUnit = 'day';
    }
    return displayUnit;
  };

  const getTemplateOutcomeValue = (touchID, templateID, metric) => {
    let outcome;
    if (touchIncludeAssociations) {
      touchIncludeAssociations.length > 0 &&
        touchIncludeAssociations.forEach((template) => {
          if (template.id === templateID) {
            template?.outComes[0]?.cadenece?.touch &&
              template.outComes[0].cadenece.touch.forEach((item) => {
                if (item.id === touchID) {
                  outcome = item[metric];
                }
              });
          }
        });
    }
    return outcome;
  };

  const removeDuplicateStringValues = (x) => {
    const filteredString = Array.from(new Set(x.split(','))).toString();
    return filteredString;
  };

  const getProductType = (product) => {
    const productTypes = {
      CD: ' Click Dialer',
      PD: ' Flow Dialer',
      TD: ' Agent Assisted Dialer',
    };
    const productType = removeDuplicateStringValues(product).replace(
      /CD|PD|TD/gi,
      function (item) {
        return productTypes[item];
      }
    );
    return productType;
  };

  const handlePreview = (id, touchId, emailTouchType) => {
    if (emailTouchType === 'Reply') {
      let nestedTemplateId;
      const emailTouches = touchData?.filter(
        (touch) => touch.touchType === 'EMAIL'
      );
      emailTouches &&
        emailTouches.forEach((item, index) => {
          if (item.id === touchId) {
            nestedTemplateId =
              emailTouches[index - 1]?.associations?.emailTemplate[0]?.id;
          }
        });
      setNestedTemplateData(
        touchIncludeAssociations &&
          touchIncludeAssociations.filter(
            (temp) => temp.id === nestedTemplateId
          )
      );
    }

    setPreviewTemplate(id);
    setTemplatePreviewModal(true);
  };
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  return (
    <Row className="pt-3 mx-2">
      <Col className="px-2">
        <div>
          {filters && (
            <Row className="border pt-3 mb-3">
              <Col>
                <div className="pb-3">
                  <i
                    className={
                      isOpenActivity
                        ? 'fa fa-chevron-up mr-2 pointer'
                        : 'fas fa-chevron-down mr-2 pointer'
                    }
                    title={isOpenActivity ? 'Collapse' : 'Expand'}
                    onClick={toggleActivity}
                  ></i>
                  <i className="fas fa-chart-line mr-2"></i>
                  <strong>Activity view</strong>
                  {(emailLoading || callLoading) && (
                    <i
                      className="fas fa-spinner fa-spin ml-2"
                      title="Loading"
                    />
                  )}
                </div>
                <Collapse isOpen={expandAll ? expandAll : isOpenActivity}>
                  <Row className="d-flex pb-0">
                    <Col>
                      {(!emailError || !callError) &&
                        emailActivityChartData.length === 0 &&
                        callActivityChartData.length === 0 && (
                          <Row className="m-2 py-2 bg-gray-lighter">
                            <Col className="text-center">
                              <span className="text-warning">
                                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                No Data Available
                              </span>
                            </Col>
                          </Row>
                        )}

                      <Row className="align-items-center">
                        <Col xl={6} className="text-center">
                          {emailError && (
                            <Row className="m-2 py-2 bg-gray-lighter">
                              <Col className="text-center">
                                <h6 className="text-danger mb-0">
                                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                  Failed to fetch data
                                </h6>
                                {emailTouchesData?.requestId && (
                                  <>
                                    <br />
                                    <span className="text-danger text-sm">{`RequestId: ${emailTouchesData?.requestId}`}</span>{' '}
                                  </>
                                )}
                              </Col>
                            </Row>
                          )}
                          {emailActivityChartData.length > 0 && (
                            <div>
                              <h4>Emails</h4>
                              <div style={{ height: '350px' }}>
                                <Chart
                                  data={emailActivityChartData}
                                  type="Pie"
                                  removeLegends={true}
                                />
                              </div>
                            </div>
                          )}
                        </Col>
                        <Col xl={6} className="text-center">
                          {callError && (
                            <Row className="m-2 py-2 bg-gray-lighter">
                              <Col className="text-center">
                                <h6 className="text-danger mb-0">
                                  <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                  Failed to fetch data
                                </h6>
                                {callTouchesData?.requestId && (
                                  <>
                                    <br />
                                    <span className="text-danger text-sm">{`RequestId: ${callTouchesData?.requestId}`}</span>{' '}
                                  </>
                                )}
                              </Col>
                            </Row>
                          )}
                          {callActivityChartData.length > 0 && (
                            <div>
                              <h4>Calls</h4>
                              <div style={{ height: '350px' }}>
                                <Chart
                                  data={callActivityChartData}
                                  type="Pie"
                                  removeLegends={true}
                                />
                              </div>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Collapse>
              </Col>
            </Row>
          )}
          {filters && (
            <Row className="border pt-3">
              <Col>
                <div className="pb-3">
                  <i
                    className={
                      isOpenScore
                        ? 'fa fa-chevron-up mr-2 pointer'
                        : 'fas fa-chevron-down mr-2 pointer'
                    }
                    title={isOpenScore ? 'Collapse' : 'Expand'}
                    onClick={toggleScore}
                  ></i>
                  <i className="fas fa-chart-pie mr-2"></i>
                  <strong>Cadence scores</strong>
                  {engagementScoreLoading && (
                    <i
                      className="fas fa-spinner fa-spin ml-2"
                      title="Loading"
                    />
                  )}
                </div>
                <Collapse isOpen={expandAll ? expandAll : isOpenScore}>
                  <Row className="d-flex pb-0">
                    <Col className="text-center">
                      {engagementScoreError && (
                        <Row className="m-2 py-2 bg-gray-lighter">
                          <Col className="text-center">
                            <h6 className="text-danger mb-0">
                              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                              Failed to fetch data
                            </h6>
                            {engagementScore?.requestId && (
                              <>
                                <br />
                                <span className="text-danger text-sm">{`RequestId: ${engagementScore?.requestId}`}</span>{' '}
                              </>
                            )}
                          </Col>
                        </Row>
                      )}
                      {engagementScoreChartData.length > 0 && (
                        <Row className="align-items-center">
                          <Col className="text-center">
                            <h4>Engagement Scores</h4>
                            <div style={{ height: '350px' }}>
                              <Chart
                                data={engagementScoreChartData}
                                type="Pie"
                                alignLeft={true}
                                marginLeft={false}
                                removeLegends={true}
                              />
                            </div>
                          </Col>
                        </Row>
                      )}

                      {!engagementScoreError &&
                        engagementScoreChartData.length === 0 && (
                          <Row className="m-2 py-2 bg-gray-lighter">
                            <Col className="text-center">
                              <span className="text-warning">
                                <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                                No Data Available
                              </span>
                            </Col>
                          </Row>
                        )}
                    </Col>
                  </Row>
                </Collapse>
              </Col>
            </Row>
          )}
          {!filters && (
            <>
              {touchesLoading && (
                <Row className="mb-2">
                  <Col className="px-0">
                    <Progress animated striped value="100">
                      Loading Overview
                    </Progress>
                  </Col>
                </Row>
              )}
              <Collapse isOpen={isOpenDetail}>
                {!touchesLoading && !touchesError && touchData.length === 0 && (
                  <Row className="m-2 py-2 bg-gray-lighter">
                    <Col className="text-center">
                      <span className="text-warning">
                        <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                        No touches are available
                      </span>
                    </Col>
                  </Row>
                )}
                {touchesError && (
                  <Row className="m-2 py-2 bg-gray-lighter">
                    <Col className="text-center">
                      <h6 className="text-danger mb-0">
                        <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
                        Failed to fetch data
                      </h6>
                      {touchesData?.requestId && (
                        <>
                          <br />
                          <span className="text-danger text-sm">{`RequestId: ${touchesData?.requestId}`}</span>{' '}
                        </>
                      )}
                    </Col>
                  </Row>
                )}
                {!touchesLoading &&
                  !touchesError &&
                  touchData.map((touch) => {
                    return (
                      <React.Fragment key={`touch_${touch.id}`}>
                        <Row
                          className="mb-2 py-2 border align-items-center"
                          key={touch.id}
                        >
                          <Col sm="1" className="br mt-1 pt-2 text-center">
                            <h3 className="text-muted" title="Step No">
                              {touch.stepNo}
                            </h3>
                          </Col>
                          <Col sm="3">
                            <div>
                              <span title="Day" className="mr-2">
                                Day {touch.day}
                                <span className="ml-2 pl-1">{'-'}</span>
                              </span>
                              <span
                                title={
                                  touch.touchType === 'EMAIL'
                                    ? touch.timeToComplete
                                      ? 'Personalized Email Touch'
                                      : 'Auto Email Touch'
                                    : touch.touchType === 'OTHERS'
                                    ? 'Social Touch'
                                    : touch.touchType.charAt(0).toUpperCase() +
                                      touch.touchType.slice(1).toLowerCase() +
                                      ' Touch'
                                }
                                className="fa-stack small mr-2"
                              >
                                <i
                                  className={
                                    getButtonClass(touch.touchType) +
                                    ' thin-circle'
                                  }
                                ></i>

                                {touch.touchType === 'EMAIL' &&
                                touch.timeToComplete ? (
                                  <span
                                    className="fa-1x svgicon emailEdit fa-stack-1x text-email mt-1"
                                    style={{
                                      paddingTop: '2px',
                                      paddingLeft: '2px',
                                    }}
                                  ></span>
                                ) : (
                                  <i
                                    className={getTouchIcons(touch.touchType)}
                                  ></i>
                                )}
                                {/* </Badge> */}
                              </span>
                              <span className="text-bold align-middle">
                                {touch.touchType === 'OTHERS'
                                  ? 'Social'
                                  : touch.touchType.charAt(0).toUpperCase() +
                                    touch.touchType.slice(1).toLowerCase()}
                              </span>
                              {touch.touchType === 'EMAIL' && (
                                <span className="ml-1">{`(${touch.emailTouchType})`}</span>
                              )}
                            </div>
                            <div
                              className={
                                accordionState === touch.id
                                  ? 'd-none'
                                  : 'd-block'
                              }
                            >
                              {touch.touchType === 'EMAIL' &&
                                getTemplateData(touch.id).map((temp, index) => {
                                  return (
                                    // eslint-disable-next-line react/jsx-no-useless-fragment
                                    <React.Fragment
                                      key={`temp_${index}_${touch.id}`}
                                    >
                                      {index > 0 ? (
                                        <React.Fragment
                                          key={`temp_${index}_${touch.id}`}
                                        >
                                          <span className="mx-2">-</span>
                                          <span
                                            key={`temp_${index}_${touch.id}_${temp.id}`}
                                            title={`Template Name: ${temp.name}`}
                                            className="text-email pointer"
                                            onClick={() => {
                                              handlePreview(
                                                temp.id,
                                                touch.id,
                                                touch.emailTouchType
                                              );
                                            }}
                                          >
                                            {temp.name}
                                          </span>
                                        </React.Fragment>
                                      ) : (
                                        <span
                                          key={index}
                                          title={`Template Name: ${temp.name}`}
                                          className="text-email pointer"
                                          onClick={() => {
                                            handlePreview(
                                              temp.id,
                                              touch.id,
                                              touch.emailTouchType
                                            );
                                          }}
                                        >
                                          {temp.name}
                                        </span>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              <span>
                                {touch.touchType === 'CALL'
                                  ? getProductType(touch.product)
                                  : touch.touchType === 'OTHERS'
                                  ? touch.subTouch.replace('Others', 'Social')
                                  : touch.subTouch}
                              </span>
                            </div>
                          </Col>
                          <Col sm="1" className="pr-0">
                            <Row className="d-flex flex-column">
                              <Col>
                                <span title="Wait time">
                                  <i className="fas fa-clock text-muted mr-2"></i>
                                  {touch.waitPeriodBeforeStart}{' '}
                                  {getUnit(
                                    touch.waitPeriodBeforeStart,
                                    touch.waitPeriodUnit
                                  )}
                                </span>
                              </Col>
                              <Col>
                                <span title="Time to complete">
                                  <i className="fas fa-hourglass-end text-muted mr-2 pr-1"></i>
                                  {touch.timeToComplete
                                    ? touch.timeToComplete
                                    : 0}{' '}
                                  {getUnit(
                                    touch.timeToComplete,
                                    touch.timeToCompleteUnit
                                  )}
                                </span>
                              </Col>
                            </Row>
                          </Col>
                          <Col sm="1">
                            <span>
                              Due:{' '}
                              <span
                                title={touch.due > 0 ? 'View prospects' : ''}
                                className={
                                  touch.due > 0 ? 'text-email pointer' : ''
                                }
                                onClick={(e) => {
                                  if (touch.due > 0) {
                                    const touchId = touch.id;
                                    const touchType = touch.touchType;
                                    const todoPathName = {
                                      call: 'pendingCalls',
                                      email: 'toDo',
                                      text: 'toDo',
                                      others: 'toDo',
                                      linkedin: 'toDo',
                                    };
                                    history.push({
                                      pathname:
                                        '/' +
                                        todoPathName[touchType.toLowerCase()],
                                      search: `filter[touch][id]=:[${touchId}]&filter[touch][type]=${touchType}&fetchByTouchId=true`,
                                      state: {},
                                    });
                                  }
                                }}
                              >
                                {touch.due}
                              </span>
                            </span>
                          </Col>
                          <Col className="d-flex flex-row justify-content-end text-bold align-items-center">
                            <Row>
                              <Col
                                className="br bl px-3 py-1 text-center wd-xs"
                                id={`tooltip_${touch.id}_total`}
                                onMouseEnter={() => {
                                  toggleToottip(`${touch.id}_total`);
                                }}
                                onMouseLeave={() =>
                                  toggleToottip(`${touch.id}_total`)
                                }
                              >
                                {touch.total}
                                <br></br>
                                <i className="far fa-circle fa-sm text-muted"></i>
                                <Tooltip
                                  placement="top"
                                  isOpen={tooltipOpen === `${touch.id}_total`}
                                  target={`tooltip_${touch.id}_total`}
                                  trigger="legacy"
                                >
                                  {`Total: ${touch.total}`}
                                </Tooltip>
                              </Col>
                              <Col
                                className="br text-center px-3 py-1 wd-xs"
                                id={`tooltip_${touch.id}_active`}
                                onMouseEnter={() => {
                                  toggleToottip(`${touch.id}_active`);
                                }}
                                onMouseLeave={() =>
                                  toggleToottip(`${touch.id}_active`)
                                }
                              >
                                {touch.active}
                                <br></br>
                                <span>
                                  <i className="fas fa-circle fa-sm text-success"></i>
                                </span>
                                <Tooltip
                                  placement="top"
                                  isOpen={tooltipOpen === `${touch.id}_active`}
                                  target={`tooltip_${touch.id}_active`}
                                  trigger="legacy"
                                >
                                  {`Active: ${touch.active}`}
                                </Tooltip>
                              </Col>
                              <Col
                                className="br text-center px-3 py-1 wd-xs"
                                id={`tooltip_${touch.id}_paused`}
                                onMouseEnter={() => {
                                  toggleToottip(`${touch.id}_paused`);
                                }}
                                onMouseLeave={() =>
                                  toggleToottip(`${touch.id}_paused`)
                                }
                              >
                                {touch.paused}
                                <br></br>
                                <i className="fas fa-pause fa-sm text-muted"></i>
                                <Tooltip
                                  placement="top"
                                  isOpen={tooltipOpen === `${touch.id}_paused`}
                                  target={`tooltip_${touch.id}_paused`}
                                  trigger="legacy"
                                >
                                  {`Paused: ${touch.paused}`}
                                </Tooltip>
                              </Col>
                              <Col
                                className="br text-center px-3 py-1 wd-xs"
                                id={`tooltip_${touch.id}_completed`}
                                onMouseEnter={() => {
                                  toggleToottip(`${touch.id}_completed`);
                                }}
                                onMouseLeave={() =>
                                  toggleToottip(`${touch.id}_completed`)
                                }
                              >
                                {touch.completed}
                                <br></br>
                                <i className="fas fa-check fa-sm text-muted"></i>
                                <Tooltip
                                  placement="top"
                                  isOpen={
                                    tooltipOpen === `${touch.id}_completed`
                                  }
                                  target={`tooltip_${touch.id}_completed`}
                                  trigger="legacy"
                                >
                                  {`Completed: ${touch.completed}`}
                                </Tooltip>
                              </Col>
                              <Col
                                className="br text-center px-3 py-1 wd-xs"
                                id={`tooltip_${touch.id}_fallThrough`}
                                onMouseEnter={() => {
                                  toggleToottip(`${touch.id}_fallThrough`);
                                }}
                                onMouseLeave={() =>
                                  toggleToottip(`${touch.id}_fallThrough`)
                                }
                              >
                                {touch.fallThrough}
                                <br></br>
                                <i className="fas fa-sign-out-alt fa-sm text-muted"></i>
                                <Tooltip
                                  placement="top"
                                  isOpen={
                                    tooltipOpen === `${touch.id}_fallThrough`
                                  }
                                  target={`tooltip_${touch.id}_fallThrough`}
                                  trigger="legacy"
                                >
                                  {`Fall Through: ${touch.fallThrough}`}
                                </Tooltip>
                              </Col>
                              <Col
                                className="br text-center px-3 py-1 wd-xs"
                                id={`tooltip_${touch.id}_engagementScore`}
                                onMouseEnter={() => {
                                  toggleToottip(`${touch.id}_engagementScore`);
                                }}
                                onMouseLeave={() =>
                                  toggleToottip(`${touch.id}_engagementScore`)
                                }
                              >
                                {touch.engagementScore || 0}
                                <br></br>
                                <i className="fas fa-chart-line fa-sm text-muted"></i>
                                <Tooltip
                                  placement="top"
                                  isOpen={
                                    tooltipOpen ===
                                    `${touch.id}_engagementScore`
                                  }
                                  target={`tooltip_${touch.id}_engagementScore`}
                                  trigger="legacy"
                                >
                                  {`Engagement Score: ${
                                    touch.engagementScore || 0
                                  }`}
                                </Tooltip>
                              </Col>
                              <Col
                                className="text-center py-2 pointer"
                                title={
                                  accordionState === touch.id
                                    ? 'Collapse'
                                    : 'Expand'
                                }
                              >
                                <Button
                                  disabled={
                                    expandAll
                                      ? expandAll
                                      : !(
                                          touch.touchType === 'EMAIL' ||
                                          touch.touchType === 'CALL' ||
                                          touch.touchType === 'TEXT'
                                        )
                                  }
                                  onClick={() => toggleAccordion(touch.id)}
                                  color="link"
                                >
                                  <i
                                    className={
                                      accordionState === touch.id
                                        ? 'fa fa-chevron-up'
                                        : 'fas fa-chevron-down'
                                    }
                                  ></i>
                                </Button>
                              </Col>
                            </Row>
                          </Col>
                        </Row>

                        <Collapse
                          isOpen={
                            expandAll ? expandAll : accordionState === touch.id
                          }
                        >
                          {touch.touchType === 'TEXT' && (
                            <Row className="border bt0 mb-3 py-2 mt-n2 align-items-center">
                              <Col className="d-flex flex-row justify-content-end">
                                <div
                                  className="text-center text-bold px-4 py-1"
                                  id={`tooltip_${touch.id}_sent`}
                                  onMouseEnter={() => {
                                    toggleToottip(`${touch.id}_sent`);
                                  }}
                                  onMouseLeave={() =>
                                    toggleToottip(`${touch.id}_sent`)
                                  }
                                >
                                  {touch.textSent ? touch.textSent : 0}
                                  <br></br>
                                  <i className="fa fa-share fa-sm text-muted"></i>
                                  <Tooltip
                                    placement="top"
                                    isOpen={tooltipOpen === `${touch.id}_sent`}
                                    target={`tooltip_${touch.id}_sent`}
                                    trigger="legacy"
                                  >
                                    {`Sent: ${touch.textSent}`}
                                  </Tooltip>
                                </div>
                                <div
                                  className="text-center text-bold px-4 py-1"
                                  id={`tooltip_${touch.id}_received`}
                                  onMouseEnter={() => {
                                    toggleToottip(`${touch.id}_received`);
                                  }}
                                  onMouseLeave={() =>
                                    toggleToottip(`${touch.id}_received`)
                                  }
                                >
                                  {touch.textReplied ? touch.textReplied : 0}
                                  <br></br>
                                  <i className="fa fa-reply fa-sm text-muted"></i>
                                  <Tooltip
                                    placement="top"
                                    isOpen={
                                      tooltipOpen === `${touch.id}_received`
                                    }
                                    target={`tooltip_${touch.id}_received`}
                                    trigger="legacy"
                                  >
                                    {`Received: ${touch.textReplied}`}
                                  </Tooltip>
                                </div>
                              </Col>
                            </Row>
                          )}
                          {touch.touchType === 'CALL' && (
                            <Row className="border bt0 mb-3 py-2 mt-n2 align-items-center">
                              <Col>
                                <span className="pl-5 ml-5">
                                  {`Dialing Mode: ${getProductType(
                                    touch.product
                                  )}`}
                                </span>
                              </Col>
                              <Col className="d-flex flex-row justify-content-end">
                                <div
                                  className="text-center text-bold px-4 py-1"
                                  id={`tooltip_${touch.id}_positiveConversations`}
                                  onMouseEnter={() => {
                                    toggleToottip(
                                      `${touch.id}_positiveConversations`
                                    );
                                  }}
                                  onMouseLeave={() =>
                                    toggleToottip(
                                      `${touch.id}_positiveConversations`
                                    )
                                  }
                                >
                                  {touch.positiveConversations &&
                                    touch.positiveConversations}
                                  <br></br>
                                  <i className="fas fa-phone-alt fa-sm text-call"></i>
                                  <Tooltip
                                    placement="top"
                                    isOpen={
                                      tooltipOpen ===
                                      `${touch.id}_positiveConversations`
                                    }
                                    target={`tooltip_${touch.id}_positiveConversations`}
                                    trigger="legacy"
                                  >
                                    {`Positive Conversations: ${touch.positiveConversations}`}
                                  </Tooltip>
                                </div>
                                <div
                                  className="text-center text-bold px-4 py-1"
                                  id={`tooltip_${touch.id}_badData`}
                                  onMouseEnter={() => {
                                    toggleToottip(`${touch.id}_badData`);
                                  }}
                                  onMouseLeave={() =>
                                    toggleToottip(`${touch.id}_badData`)
                                  }
                                >
                                  {touch.badData && touch.badData}
                                  <br></br>
                                  <i className="fas fa-phone-slash fa-sm text-muted"></i>
                                  <Tooltip
                                    placement="top"
                                    isOpen={
                                      tooltipOpen === `${touch.id}_badData`
                                    }
                                    target={`tooltip_${touch.id}_badData`}
                                    trigger="legacy"
                                  >
                                    {`Bad Data: ${touch.badData}`}
                                  </Tooltip>
                                </div>
                                <div
                                  className="text-center text-bold px-4 py-1"
                                  id={`tooltip_${touch.id}_otherConversations`}
                                  onMouseEnter={() => {
                                    toggleToottip(
                                      `${touch.id}_otherConversations`
                                    );
                                  }}
                                  onMouseLeave={() =>
                                    toggleToottip(
                                      `${touch.id}_otherConversations`
                                    )
                                  }
                                >
                                  {touch.otherConversations &&
                                    touch.otherConversations}
                                  <br></br>
                                  <i className="fas fa-mobile-alt fa-sm text-muted"></i>
                                  <Tooltip
                                    placement="top"
                                    isOpen={
                                      tooltipOpen ===
                                      `${touch.id}_otherConversations`
                                    }
                                    target={`tooltip_${touch.id}_otherConversations`}
                                    trigger="legacy"
                                  >
                                    {`Other Conversations: ${touch.otherConversations}`}
                                  </Tooltip>
                                </div>
                              </Col>
                            </Row>
                          )}
                          {touch.touchType === 'EMAIL' &&
                            getTemplateData(touch.id).length === 0 && (
                              <Row className="border bt0 mb-3 py-2 mt-n2 align-items-center">
                                <Col>
                                  <span className="pl-4 ml-5">
                                    No Templates are available !
                                  </span>
                                </Col>
                              </Row>
                            )}
                          {touch.touchType === 'EMAIL' &&
                            getTemplateData(touch.id).map((template, index) => {
                              const touchID = touch.id;
                              return (
                                <Row
                                  key={`template_${index}_${template.id}`}
                                  className={`border bt0 mb-3 py-2 ${
                                    index === 0 ? 'mt-n2' : 'mt-n3'
                                  } align-items-center d-flex flex-row`}
                                >
                                  <Col sm={6}>
                                    <Row>
                                      <Col sm={3} className="text-right">
                                        <Label className="toggle-switch">
                                          <Input
                                            key={`template_${index}_${template.id}_${touch.id}`}
                                            type="checkbox"
                                            id={`template_${index}_${template.id}_${touch.id}`}
                                            onChange={(e) => {
                                              handleToggleTemplate(
                                                e,
                                                touchID,
                                                template.id,
                                                template.name,
                                                getTemplateStatus(
                                                  touchID,
                                                  template.id
                                                )
                                              );
                                            }}
                                            checked={getTemplateStatus(
                                              touchID,
                                              template.id
                                            )}
                                          />
                                          <div
                                            className="slider round small"
                                            title="Enable/Disable template for selected touch"
                                          >
                                            <span className="on">
                                              <i className="fas fa-check"></i>
                                            </span>
                                            <span className="off">
                                              <i className="fas fa-times"></i>
                                            </span>
                                          </div>
                                        </Label>
                                      </Col>
                                      <Col className="pl-0">
                                        <div
                                          className="pointer"
                                          title={`Template Name: ${template.name}`}
                                          onClick={() => {
                                            handlePreview(
                                              template.id,
                                              touch.id,
                                              touch.emailTouchType
                                            );
                                          }}
                                        >
                                          {template.name}
                                        </div>
                                        <div
                                          className="font-italic"
                                          title={`Subject: ${template.subject}`}
                                        >{`${template.subject}`}</div>
                                      </Col>
                                    </Row>
                                  </Col>
                                  <Col className="d-flex flex-row justify-content-end">
                                    <div
                                      className="text-center text-bold px-4 py-1"
                                      id={`tooltip_${touch.id}_${template.id}_sent`}
                                      onMouseEnter={() => {
                                        toggleToottip(
                                          `${touch.id}_${template.id}_sent`
                                        );
                                      }}
                                      onMouseLeave={() =>
                                        toggleToottip(
                                          `${touch.id}_${template.id}_sent`
                                        )
                                      }
                                    >
                                      {getTemplateOutcomeValue(
                                        touch.id,
                                        template.id,
                                        'sent'
                                      ) || 0}
                                      <br></br>
                                      <i className="fas fa-envelope fa-sm text-email"></i>
                                      <Tooltip
                                        placement="top"
                                        isOpen={
                                          tooltipOpen ===
                                          `${touch.id}_${template.id}_sent`
                                        }
                                        target={`tooltip_${touch.id}_${template.id}_sent`}
                                        trigger="legacy"
                                      >
                                        {`Sent: ${
                                          getTemplateOutcomeValue(
                                            touch.id,
                                            template.id,
                                            'sent'
                                          ) || 0
                                        }`}
                                      </Tooltip>
                                    </div>
                                    <div
                                      className="text-center text-bold px-4 py-1"
                                      id={`tooltip_${touch.id}_${template.id}_bounced`}
                                      onMouseEnter={() => {
                                        toggleToottip(
                                          `${touch.id}_${template.id}_bounced`
                                        );
                                      }}
                                      onMouseLeave={() =>
                                        toggleToottip(
                                          `${touch.id}_${template.id}_bounced`
                                        )
                                      }
                                    >
                                      {getTemplateOutcomeValue(
                                        touch.id,
                                        template.id,
                                        'bounced'
                                      ) || 0}
                                      <br></br>
                                      <i className="fas fa-ban fa-sm text-muted"></i>
                                      <Tooltip
                                        placement="top"
                                        isOpen={
                                          tooltipOpen ===
                                          `${touch.id}_${template.id}_bounced`
                                        }
                                        target={`tooltip_${touch.id}_${template.id}_bounced`}
                                        trigger="legacy"
                                      >
                                        {`Bounced: ${
                                          getTemplateOutcomeValue(
                                            touch.id,
                                            template.id,
                                            'bounced'
                                          ) || 0
                                        }`}
                                      </Tooltip>
                                    </div>
                                    <div
                                      className="text-center text-bold px-4 py-1"
                                      id={`tooltip_${touch.id}_${template.id}_replied`}
                                      onMouseEnter={() => {
                                        toggleToottip(
                                          `${touch.id}_${template.id}_replied`
                                        );
                                      }}
                                      onMouseLeave={() =>
                                        toggleToottip(
                                          `${touch.id}_${template.id}_replied`
                                        )
                                      }
                                    >
                                      {getTemplateOutcomeValue(
                                        touch.id,
                                        template.id,
                                        'replied'
                                      ) || 0}
                                      <br></br>
                                      <i className="fas fa-reply fa-sm text-muted"></i>
                                      <Tooltip
                                        placement="top"
                                        isOpen={
                                          tooltipOpen ===
                                          `${touch.id}_${template.id}_replied`
                                        }
                                        target={`tooltip_${touch.id}_${template.id}_replied`}
                                        trigger="legacy"
                                      >
                                        {`Replied: ${
                                          getTemplateOutcomeValue(
                                            touch.id,
                                            template.id,
                                            'replied'
                                          ) || 0
                                        }`}
                                      </Tooltip>
                                    </div>
                                    <div
                                      className="text-center text-bold px-4 py-1"
                                      id={`tooltip_${touch.id}_${template.id}_opened`}
                                      onMouseEnter={() => {
                                        toggleToottip(
                                          `${touch.id}_${template.id}_opened`
                                        );
                                      }}
                                      onMouseLeave={() =>
                                        toggleToottip(
                                          `${touch.id}_${template.id}_opened`
                                        )
                                      }
                                    >
                                      {getTemplateOutcomeValue(
                                        touch.id,
                                        template.id,
                                        'opened'
                                      ) || 0}
                                      <br></br>
                                      <i className="far fa-envelope-open fa-sm text-muted"></i>
                                      <Tooltip
                                        placement="top"
                                        isOpen={
                                          tooltipOpen ===
                                          `${touch.id}_${template.id}_opened`
                                        }
                                        target={`tooltip_${touch.id}_${template.id}_opened`}
                                        trigger="legacy"
                                      >
                                        {`Opened: ${
                                          getTemplateOutcomeValue(
                                            touch.id,
                                            template.id,
                                            'opened'
                                          ) || 0
                                        }`}
                                      </Tooltip>
                                    </div>
                                    <div
                                      className="text-center text-bold px-4 py-1"
                                      id={`tooltip_${touch.id}_${template.id}_failed`}
                                      onMouseEnter={() => {
                                        toggleToottip(
                                          `${touch.id}_${template.id}_failed`
                                        );
                                      }}
                                      onMouseLeave={() =>
                                        toggleToottip(
                                          `${touch.id}_${template.id}_failed`
                                        )
                                      }
                                    >
                                      {getTemplateOutcomeValue(
                                        touch.id,
                                        template.id,
                                        'failed'
                                      ) || 0}
                                      <br></br>
                                      <i className="fas fa-times-circle fa-sm text-muted"></i>
                                      <Tooltip
                                        placement="top"
                                        isOpen={
                                          tooltipOpen ===
                                          `${touch.id}_${template.id}_failed`
                                        }
                                        target={`tooltip_${touch.id}_${template.id}_failed`}
                                        trigger="legacy"
                                      >
                                        {`Failed: ${
                                          getTemplateOutcomeValue(
                                            touch.id,
                                            template.id,
                                            'failed'
                                          ) || 0
                                        }`}
                                      </Tooltip>
                                    </div>
                                    <div
                                      className="text-center text-bold px-4 py-1"
                                      id={`tooltip_${touch.id}_${template.id}_linksClicked`}
                                      onMouseEnter={() => {
                                        toggleToottip(
                                          `${touch.id}_${template.id}_linksClicked`
                                        );
                                      }}
                                      onMouseLeave={() =>
                                        toggleToottip(
                                          `${touch.id}_${template.id}_linksClicked`
                                        )
                                      }
                                    >
                                      {getTemplateOutcomeValue(
                                        touch.id,
                                        template.id,
                                        'linksClicked'
                                      ) || 0}
                                      <br></br>
                                      <i className="fas fa-link fa-sm text-muted"></i>
                                      <Tooltip
                                        placement="top"
                                        isOpen={
                                          tooltipOpen ===
                                          `${touch.id}_${template.id}_linksClicked`
                                        }
                                        target={`tooltip_${touch.id}_${template.id}_linksClicked`}
                                        trigger="legacy"
                                      >
                                        {`Links Clicked: ${
                                          getTemplateOutcomeValue(
                                            touch.id,
                                            template.id,
                                            'linksClicked'
                                          ) || 0
                                        }`}
                                      </Tooltip>
                                    </div>
                                  </Col>
                                </Row>
                              );
                            })}
                        </Collapse>
                      </React.Fragment>
                    );
                  })}
              </Collapse>
            </>
          )}
        </div>
        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          confirmBtnText="OK"
          header="Toggle Off Email Template"
          handleCancel={() => setDisableTemplateConfirmModal(false)}
          handleConfirm={() => {
            const input = { emailTemplate: emailTemplateUpdate };
            disableTemplate({ variables: { touchID: disableTouchId, input } });
          }}
          showConfirmBtnSpinner={disableTemplateLoading}
          showConfirmModal={disableTemplateConfirmModal}
        >
          <span>
            Are you sure you want to disable this email template
            <b className="ml-2">{emailTemplateName}</b> ?
          </span>
        </ConfirmModal>
        <ConfirmModal
          confirmBtnIcon="fas fa-check"
          confirmBtnText="OK"
          header="Toggle On Email Template"
          handleCancel={() => setEnableTemplateConfirmModal(false)}
          handleConfirm={() => {
            const input = { emailTemplate: emailTemplateUpdate };
            enableTemplate({ variables: { touchID: disableTouchId, input } });
          }}
          showConfirmBtnSpinner={enableTemplateLoading}
          showConfirmModal={enableTemplateConfirmModal}
        >
          <span>
            Are you sure you want to enable this email template
            <b className="ml-2">{emailTemplateName}</b> ?
          </span>
        </ConfirmModal>
        {templatePreviewModal && (
          <TemplatePreview
            hideModal={() => {
              setTemplatePreviewModal(false);
              setNestedTemplateData([]);
            }}
            showModal={templatePreviewModal}
            templateId={previewTemplate}
            type="view"
            nestedTemplateData={nestedTemplateData}
          />
        )}
      </Col>
    </Row>
  );
};
export default CadenceOverView;
