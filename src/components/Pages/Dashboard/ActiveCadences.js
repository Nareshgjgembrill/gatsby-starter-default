/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Row,
} from 'reactstrap';
import ScrollArea from 'react-scrollbar';

import { NO_DATA_AVAILABLE } from '../../../util/index';

const ActiveCadences = ({
  hasZipWhip,
  activeCadencesTouchType,
  setActiveCadencesTouchType,
  activeCadencesData,
  fetchActiveCadencesLoading,
  fetchActiveCadencesError,
  activeCadencesCount,
  totalActiveCadencesToChangeLayout,
}) => {
  const history = useHistory();
  const [expandAll, setExpandAll] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownToggleClass, setDropdownToggleClass] = useState('');
  const [dropdownToggleText, setDropdownToggleText] = useState('All Touches');
  const [accordionState, setAccordionState] = useState({});
  const [touchCheckboxState, setTouchCheckboxState] = useState({});
  // touch ids of selected checkboxes
  const [todoTouchIds, setTodoTouchIds] = useState([]);

  useEffect(() => {
    if (activeCadencesTouchType === 'all') {
      setDropdownToggleClass('');
      setDropdownToggleText('All');
    } else if (activeCadencesTouchType === 'call') {
      setDropdownToggleClass('fas fa-phone-alt fa-sm text-call mr-2');
      setDropdownToggleText('Calls');
    } else if (activeCadencesTouchType === 'email') {
      setDropdownToggleClass('fas fa-envelope fa-sm text-email mr-2');
      setDropdownToggleText('Emails');
    } else if (activeCadencesTouchType === 'text') {
      setDropdownToggleClass('fas fa-comments fa-sm text-social mr-2');
      setDropdownToggleText('Text');
    } else if (activeCadencesTouchType === 'social') {
      setDropdownToggleClass('fas fa-share-alt fa-sm text-social mr-2');
      setDropdownToggleText('Social');
    } else if (activeCadencesTouchType === 'linkedin') {
      setDropdownToggleClass('fab fa-linkedin-in fa-sm text-linkedin mr-2');
      setDropdownToggleText('LinkedIn');
    }

    setTodoTouchIds([]);
  }, [activeCadencesTouchType]);

  // setting initial checkbox state for the touches under each cadence
  useEffect(() => {
    if (activeCadencesData) {
      const checkboxState = {};
      // setting state for each cadence
      activeCadencesData.forEach((item) => {
        if (item?.touch) {
          const temp = {};
          // setting state for each touch under the cadence
          item.touch.forEach((subItem) => {
            temp[subItem.id] = false;
          });
          checkboxState[item?.id] = { allChecked: false, touches: {} };
          checkboxState[item?.id]['touches'] = temp;
        }
      });
      setTouchCheckboxState(checkboxState);
    }
  }, [activeCadencesData]);

  const touchIconClass = {
    call: 'fas fa-phone-alt fa-sm text-call mx-1',
    email: 'svgicon emailEdit fa-sm text-email mx-1',
    text: 'fas fa-comments fa-sm text-social mx-1',
    others: 'fas fa-share-alt fa-sm text-social mx-1',
    linkedin: 'fab fa-linkedin-in fa-sm text-linkedin mx-1',
  };
  // pathname to redirect to toDo page
  const todoPathName = {
    call: 'pendingCalls',
    email: 'toDo',
    text: 'toDo',
    others: 'toDo',
    linkedin: 'toDo',
  };
  // touch type to pass to toDo page. it can only be a specific type.
  const todoTouchType = {
    call: 'CALL',
    email: 'EMAIL',
    text: 'TEXT',
    others: 'OTHERS',
    linkedin: 'LINKEDIN',
  };

  const handleExpandAllClick = () => {
    setExpandAll(!expandAll);
    const temp = {};
    activeCadencesData.forEach((item) => {
      temp[item.id] = expandAll ? false : true;
    });
    setAccordionState(temp);
  };
  const toggle = () => setDropdownOpen((prevState) => !prevState);
  const handleDropdownItemClick = (touchValue) => {
    // set the touch type in parent component
    setActiveCadencesTouchType(touchValue);
  };
  const toggleAccordion = (id) => {
    setAccordionState((prevState) => {
      return {
        ...prevState,
        [id]: prevState[id] ? !prevState[id] : true,
      };
    });
  };

  // store the touch ids of selected checkboxes
  const handleTouchCheckboxClick = (e, cadenceId, touchId, source) => {
    const checked = e.target.checked;
    setTodoTouchIds((prevState) => {
      const todoIds = prevState;
      if (checked) {
        if (todoIds.indexOf(touchId) === -1) {
          todoIds.push(touchId);
        }
        return [...todoIds];
      } else {
        if (todoIds.indexOf(touchId) > -1) {
          todoIds.splice(todoIds.indexOf(touchId), 1);
        }
        return [...todoIds];
      }
    });

    // if 'source' = touchCheckboxClick' then update the touchCheckboxState for the selected touch
    // for the 'source' = totalProspectsClick, touchCheckboxState is updated in the handleTotalProspectsClick function itslef.
    if (source === 'touchCheckboxClick') {
      setTouchCheckboxState((prevState) => {
        return {
          ...prevState,
          [cadenceId]: {
            allChecked: prevState[cadenceId]['allChecked'],
            touches: {
              ...prevState[cadenceId]['touches'],
              [touchId]: !prevState[cadenceId]['touches'][touchId],
            },
          },
        };
      });
    }
  };

  // set checkbox state for all touches for the selected cadence
  const handleTotalProspectsClick = (id) => {
    let allChecked;
    const temp = {};
    if (
      touchCheckboxState &&
      touchCheckboxState[id] &&
      touchCheckboxState[id]['allChecked'] !== undefined &&
      touchCheckboxState[id]['touches'] !== undefined
    ) {
      if (touchCheckboxState[id]['allChecked'] === true) {
        allChecked = false;
        Object.keys(touchCheckboxState[id]['touches']).forEach((item) => {
          temp[item] = false;
          // adding the touch ids in todoTouchIds, to display 'go' button
          handleTouchCheckboxClick(
            { target: { checked: false } },
            parseInt(id),
            parseInt(item),
            'totalProspectsClick'
          );
        });
      } else {
        allChecked = true;
        Object.keys(touchCheckboxState[id]['touches']).forEach((item) => {
          temp[item] = true;
          // adding the touch ids in todoTouchIds, to display 'go' button
          handleTouchCheckboxClick(
            { target: { checked: true } },
            parseInt(id),
            parseInt(item),
            'totalProspectsClick'
          );
        });
      }

      setTouchCheckboxState((prevState) => {
        return {
          ...prevState,
          [id]: {
            allChecked: allChecked,
            touches: temp,
          },
        };
      });
    }
  };

  // redirect to todo page
  const redirectToTodoPage = () => {
    const uniqueTouchIds = todoTouchIds.filter(
      (item, index) => todoTouchIds.indexOf(item) === index
    );
    let touchType = activeCadencesTouchType;
    if (activeCadencesTouchType.toLowerCase() === 'social') {
      touchType = 'others';
    }
    history.push({
      pathname: '/' + todoPathName[touchType],
      search: `filter[touch][id]=:[${uniqueTouchIds}]&filter[touch][type]=${todoTouchType[touchType]}&fetchByTouchId=true`,
      state: {},
    });
  };

  return (
    <Col
      xl={activeCadencesCount > totalActiveCadencesToChangeLayout ? 4 : 3}
      className="pr-0 pl-2"
    >
      <Card className="card-default">
        <CardHeader className="d-flex align-items-center justify-content-between border-bottom bg-white py-2 px-2 text-sm text-info text-bold">
          <div className="text-nowrap">
            <i
              className={`${
                fetchActiveCadencesLoading
                  ? 'fa fa-spinner fa-spin mr-1 text-dark'
                  : 'svgicon koncert-cadence-icon mr-1 text-muted'
              }`}
            ></i>
            ACTIVE CADENCES
          </div>

          {todoTouchIds.length > 0 && (
            <Button
              color="success"
              className="text-bold text-white btn-xs mr-1"
              title="View prospects for selected touches"
              onClick={(e) => {
                redirectToTodoPage();
              }}
            >
              Go
            </Button>
          )}
          <div className="d-flex align-items-center">
            <span
              className="mr-2"
              title={!expandAll ? 'Expand all' : 'Collapse all'}
              onClick={(e) => handleExpandAllClick()}
            >
              <i
                className={`text-gray-dark pointer ${
                  expandAll
                    ? 'fa fa-angle-double-up'
                    : 'fa fa-angle-double-down'
                }`}
              ></i>
            </span>
            <Dropdown isOpen={dropdownOpen} toggle={toggle}>
              <DropdownToggle caret className="px-2 py-1">
                <i className={dropdownToggleClass}></i>
                {dropdownToggleText + ' '}
              </DropdownToggle>
              <DropdownMenu className="dropdown-width">
                {activeCadencesTouchType !== 'all' && (
                  <DropdownItem
                    onClick={(e) => {
                      handleDropdownItemClick(e.target.value);
                    }}
                    value={'all'}
                  >
                    All Touches
                  </DropdownItem>
                )}
                <DropdownItem
                  onClick={(e) => {
                    handleDropdownItemClick(e.target.value);
                  }}
                  value={'call'}
                >
                  <i className="fas fa-phone-alt fa-sm text-call mr-2"></i>
                  Calls
                </DropdownItem>
                <DropdownItem
                  onClick={(e) => {
                    handleDropdownItemClick(e.target.value);
                  }}
                  value={'email'}
                >
                  <i className="fas fa-envelope fa-sm text-email mr-2"></i>
                  Emails
                </DropdownItem>
                {hasZipWhip && (
                  <DropdownItem
                    onClick={(e) => {
                      handleDropdownItemClick(e.target.value);
                    }}
                    value={'text'}
                  >
                    <i className="fas fa-comments fa-sm text-social mr-2"></i>
                    Text
                  </DropdownItem>
                )}
                <DropdownItem
                  onClick={(e) => {
                    handleDropdownItemClick(e.target.value);
                  }}
                  value={'social'}
                >
                  <i className="fas fa-share-alt fa-sm text-social mr-2"></i>
                  Social
                </DropdownItem>
                <DropdownItem
                  onClick={(e) => {
                    handleDropdownItemClick(e.target.value);
                  }}
                  value={'linkedin'}
                >
                  <i className="fab fa-linkedin-in text-linkedin mr-2"></i>
                  LinkedIn
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <ScrollArea
            speed={0.8}
            className={`area ${
              // to center the spinner while loading
              fetchActiveCadencesLoading ||
              fetchActiveCadencesError ||
              activeCadencesData?.length === 0
                ? 'd-flex align-items-center justify-content-center'
                : ''
            }`}
            contentClassName="content"
            horizontal={false}
            style={{
              height:
                activeCadencesCount > totalActiveCadencesToChangeLayout
                  ? '572px'
                  : '252px',
            }}
          >
            {!fetchActiveCadencesLoading &&
              !fetchActiveCadencesError &&
              activeCadencesData &&
              activeCadencesData.length > 0 && (
                <Row>
                  <Col>
                    <ListGroup>
                      {/* listing cadences */}
                      {activeCadencesData.map((item, index) => {
                        const totalProspects = item?.touch?.reduce(
                          (sum, subItem) => {
                            return subItem.prospects
                              ? parseInt(subItem.prospects) + sum
                              : sum;
                          },
                          0
                        );
                        if (!isNaN(totalProspects)) {
                          return (
                            <ListGroupItem
                              className="align-items-center"
                              key={item.id + '_' + index}
                            >
                              <Row className="align-items-center">
                                <Col
                                  className="pr-0 pl-2 pointer"
                                  onClick={(e) =>
                                    // passing cadence id
                                    toggleAccordion(item.id)
                                  }
                                >
                                  <i
                                    className={`text-purple mx-1 ${
                                      accordionState[item.id]
                                        ? 'fa fa-angle-double-up'
                                        : 'fa fa-angle-double-down'
                                    }`}
                                    title={
                                      !accordionState[item.id]
                                        ? 'Expand'
                                        : 'Collapse'
                                    }
                                  ></i>
                                  <span title={item?.name}>
                                    {' '}
                                    {item?.name?.length > 20
                                      ? item?.name.slice(0, 20) + '...'
                                      : item?.name}
                                  </span>
                                  <span>
                                    <i
                                      className="fas fa-user-friends fa-sm text-muted mx-1"
                                      title="Shared Cadence"
                                      hidden={item?.shared !== 'true'}
                                    ></i>
                                  </span>
                                </Col>
                                <Col sm={4} className="text-center">
                                  <Badge
                                    title={
                                      activeCadencesTouchType !== 'all'
                                        ? 'Select all touches'
                                        : 'Total Prospects'
                                    }
                                    color="light"
                                    className={
                                      activeCadencesTouchType !== 'all'
                                        ? 'pointer border bg-secondary text-muted'
                                        : 'border bg-secondary text-muted'
                                    }
                                    onClick={(e) => {
                                      if (activeCadencesTouchType !== 'all') {
                                        handleTotalProspectsClick(item?.id);
                                      }
                                    }}
                                  >
                                    {totalProspects}
                                  </Badge>
                                </Col>
                              </Row>
                              <Collapse isOpen={accordionState[item.id]}>
                                <Row className="pl-3 pt-2">
                                  <Col>
                                    <ListGroup>
                                      {/* listing touches for the current cadence */}
                                      {item?.touch?.map((subItem, subIndex) => {
                                        if (
                                          subItem?.type?.toLowerCase() !==
                                            'text' ||
                                          hasZipWhip
                                        ) {
                                          return (
                                            <ListGroupItem
                                              className="border-0 py-1"
                                              key={subItem?.id + '_' + subIndex}
                                            >
                                              <Row>
                                                <Col>
                                                  <Label check className="mr-1">
                                                    {activeCadencesTouchType !==
                                                      'all' && (
                                                      <Input
                                                        type="checkbox"
                                                        title="Select"
                                                        className="ml-n3"
                                                        onChange={(e) => {
                                                          handleTouchCheckboxClick(
                                                            e,
                                                            parseInt(item?.id),
                                                            parseInt(
                                                              subItem?.id
                                                            ),
                                                            'touchCheckboxClick'
                                                          );
                                                        }}
                                                        checked={
                                                          (touchCheckboxState &&
                                                            touchCheckboxState[
                                                              item?.id
                                                            ] &&
                                                            touchCheckboxState[
                                                              item?.id
                                                            ]['touches'] &&
                                                            touchCheckboxState[
                                                              item?.id
                                                            ]['touches'][
                                                              subItem?.id
                                                            ]) ||
                                                          false
                                                        }
                                                      />
                                                    )}{' '}
                                                    <i
                                                      className={
                                                        touchIconClass[
                                                          subItem?.type?.toLowerCase()
                                                        ]
                                                      }
                                                    ></i>
                                                    Touch {subItem?.stepNo}
                                                  </Label>
                                                  <span>
                                                    {subItem?.type?.toLowerCase() ===
                                                    'others'
                                                      ? '(Social)'
                                                      : '(' +
                                                        subItem?.type +
                                                        ')'}
                                                  </span>
                                                </Col>
                                                <Col
                                                  sm={4}
                                                  className="text-center"
                                                >
                                                  <Link
                                                    className="text-decoration-none text-white"
                                                    to={{
                                                      pathname:
                                                        todoPathName[
                                                          subItem?.type?.toLowerCase()
                                                        ],
                                                      search: `filter[touch][id]=:[${
                                                        subItem.id
                                                      }]&filter[touch][type]=${
                                                        todoTouchType[
                                                          subItem?.type?.toLowerCase()
                                                        ]
                                                      }&fetchByTouchId=true`,
                                                    }}
                                                  >
                                                    <Badge
                                                      color="success"
                                                      className="ml-2 pointer text-white font-italic rounded-0"
                                                      title="View prospects"
                                                    >
                                                      {subItem?.prospects}
                                                    </Badge>
                                                  </Link>
                                                </Col>
                                              </Row>
                                            </ListGroupItem>
                                          );
                                        } else {
                                          return '';
                                        }
                                      })}
                                    </ListGroup>
                                  </Col>
                                </Row>
                              </Collapse>
                            </ListGroupItem>
                          );
                        }
                        return '';
                      })}
                    </ListGroup>
                  </Col>
                </Row>
              )}
            {!fetchActiveCadencesLoading &&
              (fetchActiveCadencesError ||
                !activeCadencesData ||
                activeCadencesData?.length === 0) && (
                <div className="m-auto align-self-center text-center">
                  <i className="fas fa-exclamation-triangle fa-10x m-auto"></i>
                  <p>{NO_DATA_AVAILABLE}</p>
                </div>
              )}
            {fetchActiveCadencesLoading && !fetchActiveCadencesError && (
              <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                <div className="text-center">
                  <i className="fa fa-spinner fa-spin fa-4x m-3 text-muted"></i>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ActiveCadences;
