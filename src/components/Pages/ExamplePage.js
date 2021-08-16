import React, { useState, useContext } from 'react';
// import { withTranslation, Trans } from "react-i18next";
import CloseButton from '../Common/CloseButton';
import FilterButton from '../Common/FilterButton';
import ConfirmModal from '../Common/ConfirmModal';
import {
  ContentWrapper,
  PageLoader,
  CardTool,
  useTable,
  useSortBy,
} from '@nextaction/components';
import {
  Alert,
  Button,
  ButtonGroup,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardFooter,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ButtonToolbar,
  ButtonDropdown,
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
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import UserContext from '../UserContext';

const Table = ({ columns, data }) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  );

  // Render the UI for your table
  return (
    <table
      {...getTableProps()}
      className="card-body table table-striped w-100 mb-0"
    >
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span className="ml-2">
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <i className="fa fa-sort-down"></i>
                    ) : (
                      <i className="fa fa-sort-up"></i>
                    )
                  ) : (
                    <i className="fa fa-sort text-muted"></i>
                  )}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const ExamplePage = () => {
  const { user, loading: userLoading } = useContext(UserContext);

  const [buttonIsOpen, setButtonIsOpen] = useState(false);
  const [toolbarButtonIsOpen, setToolbarButtonIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('0');
  const row = {
    values: {
      emailContent: {
        key1: ['some data'],
        key2: ['some data2'],
        key3: ['some data3'],
      },
    },
  };
  const {
    values: { emailContent },
  } = row;
  const messageKeys = Object.keys(emailContent);

  const onCardRefresh = (card, done) => {
    // perform any action when a .card triggers a the refresh event
    // when the action is done, call done to remove spiiner
    setTimeout(done, 3000);
  };
  // eslint-disable-next-line
  const columns = React.useMemo(() => [
    {
      Header: 'First Name',
      accessor: 'firstName',
    },
    {
      Header: 'Last Name',
      accessor: 'lastName',
    },
    {
      Header: 'Age',
      accessor: 'age',
    },
    {
      Header: 'Visits',
      accessor: 'visits',
    },
    {
      Header: 'Status',
      accessor: 'status',
    },
    {
      Header: 'Profile Progress',
      accessor: 'progress',
    },
  ]);

  const data = [
    {
      firstName: 'Anders',
      lastName: 'Fredriksson',
      age: 40,
      visits: 123,
      status: 'Active',
      progress: 'asd',
    },
    {
      firstName: 'Anders2',
      lastName: 'Fredriksson2',
      age: 40,
      visits: 1234,
      status: 'Disabled',
      progress: 'asdasd',
    },
  ];

  const [typicalModal, setTypicalModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [allUiModal, setAllUiModal] = useState(false);

  if (userLoading) return null;
  if (!user) return <PageLoader />;

  return (
    <ContentWrapper>
      <div className="content-heading">
        <div>
          Page Name Goes Here
          <small>Subtitle of the page goes here</small>
        </div>

        <div className="ml-auto">
          <ButtonToolbar>
            <ButtonDropdown
              isOpen={buttonIsOpen}
              toggle={() => setButtonIsOpen(!buttonIsOpen)}
              id="buttonTest"
            >
              <DropdownToggle caret color="secondary">
                <i className="fa fa-user mr-2 text-muted"></i>
                Test
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Header</DropdownItem>
                <DropdownItem disabled>Action</DropdownItem>
                <DropdownItem>Another Action</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>Another Action</DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
          </ButtonToolbar>
        </div>
      </div>

      <Row>
        <Col>
          <Card className="card-default">
            <CardHeader>
              <CardTitle>
                <i className="fa fa-star text-muted mr-2"></i> This is a default
                box
              </CardTitle>
            </CardHeader>
            <CardBody>
              A box (card) can include a number of different things and exist in
              a number of different styles.
            </CardBody>
          </Card>
        </Col>
        <Col>
          <Card className="card-default">
            <CardHeader>
              <div className="float-right">
                <ButtonToolbar>
                  <ButtonDropdown
                    isOpen={toolbarButtonIsOpen}
                    toggle={() => setToolbarButtonIsOpen(!toolbarButtonIsOpen)}
                    id="toolbarButton"
                  >
                    <DropdownToggle caret color="secondary">
                      <i className="fa fa-filter mr-2 text-muted"></i>
                      Filter goes here
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem header>Header</DropdownItem>
                      <DropdownItem disabled>Action</DropdownItem>
                      <DropdownItem>Another Action</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Another Action</DropdownItem>
                    </DropdownMenu>
                  </ButtonDropdown>
                </ButtonToolbar>
              </div>
              <CardTitle>
                <i className="fa fa-user text-muted mr-2"></i> This is a default
                box with a toolbar
              </CardTitle>
            </CardHeader>
            <CardBody>
              A box (card) can include a number of different things and exist in
              a number of different styles.
            </CardBody>
            <CardFooter>And a footer</CardFooter>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Inner tabs</h4>
          <Card className="card-default">
            <CardHeader>
              Test with Tabs and dismiss and refresh buttons
              <CardTool
                refresh
                dismiss
                onRemove={() => alert('card removed')}
                onRefresh={onCardRefresh}
                spinner="traditional"
              />
            </CardHeader>
            <CardBody className="pl-0 pr-0 pb-0 bl-0 br-0 bb-0">
              <div role="tabpanel">
                {/* Nav tabs */}
                <Nav tabs className="justify-content-end">
                  {messageKeys.map((key, index) => (
                    <NavItem key={key}>
                      <NavLink
                        className={activeTab === String(index) ? 'active' : ''}
                        onClick={() => {
                          setActiveTab(String(index));
                        }}
                      >
                        {key}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>
                {/* Tab panes */}
                <TabContent activeTab={activeTab}>
                  {messageKeys.map((key, index) => (
                    <TabPane tabId={String(index)} key={key}>
                      {emailContent[key].map((sentence, index) => {
                        return <p key={index}>{sentence}</p>;
                      })}
                    </TabPane>
                  ))}
                </TabContent>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <h4>Outer tabs</h4>
          <div role="tabpanel">
            {/* Nav tabs */}
            <Nav tabs className="justify-content-end">
              {messageKeys.map((key, index) => (
                <NavItem key={key}>
                  <NavLink
                    className={activeTab === String(index) ? 'active' : ''}
                    onClick={() => {
                      setActiveTab(String(index));
                    }}
                  >
                    {key}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            {/* Tab panes */}
            <TabContent
              activeTab={activeTab}
              className="border-0 px-0 pt-0 pb-0 "
            >
              {messageKeys.map((key, index) => (
                <TabPane tabId={String(index)} key={key}>
                  <Card className="card-default px-0">
                    <CardHeader>
                      <CardTitle>{key}</CardTitle>
                    </CardHeader>
                    <CardBody>
                      {emailContent[key].map((sentence, index) => {
                        return <p key={index}>{sentence}</p>;
                      })}
                    </CardBody>
                  </Card>
                </TabPane>
              ))}
            </TabContent>
          </div>
        </Col>
      </Row>
      <Row className="pt-4">
        <Col xl={4}>
          <Card className="card-default">
            <CardHeader>
              <CardTitle>
                <i className="fa fa-star text-muted mr-2"></i> Card with a
                simple table
              </CardTitle>
            </CardHeader>
            <table className="card-body table table-striped w-100 mb-0">
              <thead>
                <tr>
                  <th width="5%">
                    <i className="fas fa-phone-volume text-muted"></i>
                  </th>
                  <th width="85%" className="text-uppercase">
                    Valid Connects
                  </th>
                  <th width="10%">
                    <small className="text-muted text-uppercase">Total</small>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <i className="fa fa-star text-yellow"></i>
                  </td>
                  <td>Patrick Morrissey</td>
                  <td>
                    <span>22</span>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>Korey Ferland</td>
                  <td>
                    <span>11</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Col>
        <Col xl={8}>
          <Card className="card-default">
            <CardHeader>
              <CardTitle>
                <i className="fa fa-star text-muted mr-2 text-yellow"></i> Card
                with a simple table
              </CardTitle>
            </CardHeader>
            <Table columns={columns} data={data} />
          </Card>
        </Col>
      </Row>
      <Row className="pt-4">
        <Col>
          <Card className="card-default">
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <div>Close Button</div>
                  <br />
                  <CloseButton />
                </Col>
                <Col>
                  <div>Disabled Close Button</div>
                  <br />
                  <CloseButton disabled />
                </Col>
                <Col>
                  <div>Cancel Button</div>
                  <br />
                  <CloseButton btnTxt="Cancel" />
                </Col>
                <Col>
                  <div>Save Button</div>
                  <br />
                  <Button color="primary">
                    <i className="fa fa-check mr-2"></i>Save
                  </Button>
                </Col>
                <Col>
                  <div>Update Button</div>
                  <br />
                  <Button color="primary">
                    <i className="fa fa-check mr-2"></i>Update
                  </Button>
                </Col>
                <Col>
                  <div>Save Button disabled</div>
                  <br />
                  <Button color="primary" disabled>
                    <i className="fa fa-check mr-2"></i>Save
                  </Button>
                </Col>
                <Col>
                  <div>Button with loading</div>
                  <br />
                  <Button color="primary" disabled>
                    <i className="fa fa-spinner fa-spin mr-2"></i>Wait...
                  </Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="pt-4">
        <Col>
          <Card className="card-default">
            <CardHeader>
              <CardTitle>ButtonGroups, Input Groups</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <div>ButtonGroup</div>
                  <br />
                  <ButtonGroup>
                    <Button active>All</Button>
                    <Button>Email</Button>
                    <Button>Call</Button>
                  </ButtonGroup>
                </Col>
                <Col>
                  <div>FilterButtonGroup with count</div>
                  <br />
                  <ButtonGroup>
                    <FilterButton active={true} count={5}>
                      All
                    </FilterButton>
                    <FilterButton count={8} active={false}>
                      Email
                    </FilterButton>
                    <FilterButton count={0} active={false}>
                      Call
                    </FilterButton>
                  </ButtonGroup>
                </Col>
                <Col>
                  <div>
                    FilterButtonGroup wiht count, pin, count loading, count
                    error
                  </div>
                  <br />
                  <ButtonGroup>
                    <FilterButton active={true} count={5} pinned={false}>
                      All
                    </FilterButton>
                    <FilterButton
                      active={false}
                      count={8}
                      pinned={true}
                      countLoading={true}
                    >
                      Email
                    </FilterButton>
                    <FilterButton
                      active={false}
                      count={0}
                      pinned={false}
                      countError={true}
                    >
                      Call
                    </FilterButton>
                  </ButtonGroup>
                </Col>
              </Row>
              <Row>
                <Col sm={4}>
                  <br />
                  <div>Input group</div>
                  <br />
                  <InputGroup>
                    <Input placeholder="Search" />
                    <InputGroupAddon addonType="append">
                      <Button>
                        <i className="fa fa-search"></i>
                      </Button>
                      <Button>
                        <i className="fa fa-times"></i>
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row className="pt-4">
        <Col>
          <Card className="card-default">
            <CardHeader>
              <CardTitle>Modal</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col>
                  <Button color="primary" onClick={() => setTypicalModal(true)}>
                    Open Typical Modal
                  </Button>
                </Col>
                <Col>
                  <Button
                    color="primary"
                    onClick={() => setShowConfirmModal(true)}
                  >
                    Confim Modal
                  </Button>
                </Col>
                <Col>
                  <Button color="primary" onClick={() => setAllUiModal(true)}>
                    Modal with all bells & whistles
                  </Button>
                </Col>
                <Modal isOpen={typicalModal} centered={true}>
                  <ModalHeader>Modal Title</ModalHeader>
                  <ModalBody>
                    <Form>
                      <FormGroup row>
                        <Label for="inpu1" sm={2}>
                          Label
                        </Label>
                        <Col sm={10}>
                          <Input type="select" name="cadence" id="input1">
                            <option>Value 1</option>
                            <option>Value 1</option>
                            <option>Value 1</option>
                          </Input>
                        </Col>
                      </FormGroup>
                    </Form>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onClick={() => setTypicalModal(false)}
                    >
                      <i className="fa fa-check mr-2"></i>Save
                    </Button>
                    <CloseButton onClick={() => setTypicalModal(false)} />
                  </ModalFooter>
                </Modal>
                <ConfirmModal
                  confirmBtnText="Delete"
                  confirmBtnIcon="fas fa-trash"
                  header="Please Confirm"
                  showConfirmModal={showConfirmModal}
                  handleCancel={() => setShowConfirmModal(false)}
                  handleConfirm={() => setShowConfirmModal(false)}
                >
                  <span>Are you sure you want to delete?</span>
                </ConfirmModal>
                <Modal size="lg" isOpen={allUiModal} centered={true}>
                  <ModalHeader>Modal Title</ModalHeader>
                  <ModalBody>
                    <Form>
                      <FormGroup row>
                        <Label for="input2" sm={2}>
                          Label2
                        </Label>
                        <Col sm={10}>
                          <Input type="text" id="input2" />
                        </Col>
                      </FormGroup>
                      <FormGroup row>
                        <Label for="input3" sm={2}>
                          Label2<span className="text-danger">*</span>
                        </Label>
                        <Col sm={10}>
                          <Input
                            type="select"
                            name="tagName"
                            id="input3"
                            invalid={true}
                          >
                            <option></option>
                            <option>Value 1</option>
                            <option>Value 2</option>
                            <option>Value 3</option>
                          </Input>
                          <div className="invalid-feedback">Value required</div>
                        </Col>
                      </FormGroup>
                    </Form>
                    <Row>
                      <Col>
                        <Alert color="success" className="text-center">
                          Success message
                        </Alert>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Alert color="danger" className="text-center">
                          Failure Message
                        </Alert>
                      </Col>
                    </Row>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      onClick={() => setAllUiModal(false)}
                    >
                      <i className="fa fa-check mr-2"></i>
                      Save
                    </Button>
                    <Button color="primary" disabled>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Wait...
                    </Button>
                    <CloseButton onClick={() => setAllUiModal(false)} />
                  </ModalFooter>
                </Modal>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </ContentWrapper>
  );
};

export default ExamplePage;
