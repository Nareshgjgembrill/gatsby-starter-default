import React, { useState, useEffect, useMemo } from 'react';
import {
  Badge,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
} from 'reactstrap';
import { useLazyQuery } from '@apollo/react-hooks';
import { parseUrl } from 'query-string';
import { toast } from 'react-toastify';
import ClButton from '../../Common/Button';
import DropDown from '../../Common/DropDown';

import {
  FETCH_TAG_LIST,
  FETCH_CATEGORIES_LIST,
  FETCH_EMAIL_TEMPLATES_LIST_QUERY,
  FETCH_EMAIL_TEMPLATES_LIST,
} from '../../queries/TagQuery';
import SearchEmailTemplateGrid from './SearchEmailTemplateGrid';

toast.configure();
const SearchEmailTemplateModal = ({
  showModal,
  hideModal,
  handleAction,
  currentUserId,
  Loading,
  selectedTemplateIds,
  templateSearch,
  templateFilter,
}) => {
  const { query: queryParams } = parseUrl('?page[limit]=10&page[offset]=0');

  const [emailTemplateFilter, setEmailTemplateFilter] = useState(
    templateFilter && `&${templateFilter}`
  );
  const [filterExecute, setFilterExecute] = useState(false);
  const [searchBy, setSearchBy] = useState('TemplateName');
  const [sortBy, setSortBy] = useState('name');
  const [orderBy, setOrderBy] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);
  const dropdownDataFinal = [];
  const [shouldExecute, setShouldExecute] = useState(true);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedId, setSelectedId] = useState(0);
  const [dropdownLimit] = useState(75);
  const [dropdownOffset, setDropdownOffset] = useState(0);
  const [dropdownDataApi, setDropdownDataApi] = useState([]);
  let dropdownDataFiltered;
  const [filterQuery, setFilterQuery] = useState({
    query: FETCH_EMAIL_TEMPLATES_LIST,
    filterBy: 'TemplateName',
  });

  const notify = (message, ToasterType) => {
    toast(message, {
      type: ToasterType,
      position: 'top-right',
      toastId: message,
    });
  };

  useEffect(() => {
    if (templateSearch && showModal) {
      setEmailTemplateFilter(
        `&filter[name]=*${templateSearch}&${templateFilter}`
      );
    } else {
      setEmailTemplateFilter(`&${templateFilter}`);
    }
  }, [showModal, templateFilter, templateSearch]);

  const { filterBy } = filterQuery;
  const onSubmit = () => {
    if (
      selectedRows.length === 0 &&
      selectedTemplateIds.length + selectedRows.length < 5
    ) {
      notify('Please select atleast one template', 'error');
    } else if (
      selectedTemplateIds &&
      selectedTemplateIds.length + selectedRows.length < 6
    ) {
      handleAction(selectedRows);
    } else {
      notify('You can choose only upto 5 templates', 'error');
    }
  };

  const setQuery = (filterType) => {
    switch (filterType) {
      case 'Tag':
        setFilterQuery({ query: FETCH_TAG_LIST, filterBy: 'Tag' });
        return;
      case 'Category':
        setFilterQuery({
          query: FETCH_CATEGORIES_LIST,
          filterBy: 'Category',
        });
        return;
      case 'TemplateName':
        setFilterQuery({
          query: FETCH_EMAIL_TEMPLATES_LIST,
          filterBy: 'TemplateName',
        });
        return;
      default:
        break;
    }
  };

  const removeDuplicates = (array) => {
    const result = [];
    const map = new Map();
    for (const item of array) {
      if (!map.has(item.value)) {
        map.set(item.value, true);
        result.push({
          value: item.value,
          text: item.text,
        });
      }
    }
    return result;
  };

  const [
    getTemplatedata,
    { data: templateData, loading: templateLoading, error: templateError },
  ] = useLazyQuery(FETCH_EMAIL_TEMPLATES_LIST_QUERY, {
    fetchPolicy: 'cache-first',
  });

  const [getDropdownData, { loading, error }] = useLazyQuery(
    filterQuery.query,
    {
      onCompleted: (data) => {
        if (data) {
          // if total data count is greater than the currently received data, increment offset,
          // which will cause useEffect to refetch dropdown data. dropdownDataApi will be concatenated with the api datq for all fetch operations.
          setDropdownDataApi(dropdownDataApi.concat(data.dropdownData.data));
          if (
            (dropdownOffset + 1) * dropdownLimit <
            data.dropdownData.paging.totalCount
          ) {
            setDropdownOffset(dropdownOffset + 1);
          }
        }
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-first',
    }
  );

  // if filter by = tag, filter out those templates with no tags
  if (filterBy === 'Tag') {
    dropdownDataFiltered = dropdownDataApi?.filter(
      (tag) => tag?.associations?.emailTemplate?.length > 0
    );
  } else {
    dropdownDataFiltered = dropdownDataApi && dropdownDataApi;
  }

  if (dropdownDataFiltered) {
    if (filterBy === 'Tag' || filterBy === 'TemplateName') {
      for (
        let i = 0;
        i < (dropdownDataFiltered && dropdownDataFiltered.length);
        i++
      ) {
        let temp = {};
        temp = {
          text: dropdownDataFiltered[i]['name'],
          value: dropdownDataFiltered[i]['id'],
          active: false,
        };
        dropdownDataFinal.push(temp);
      }
    } else if (filterBy === 'Category') {
      for (
        let i = 0;
        i < (dropdownDataFiltered && dropdownDataFiltered.length);
        i++
      ) {
        let temp = {};
        temp = {
          text: dropdownDataFiltered[i]['lookupValue'],
          value: dropdownDataFiltered[i]['lookupValue'],
          active: false,
        };
        dropdownDataFinal.push(temp);
      }
    }
  }

  const handlesearchByChange = (e) => {
    setDropdownOffset(0);
    setDropdownDataApi([]);
    const filterType = e.currentTarget.value;
    setQuery(filterType);
    setSearchBy(filterType);
  };

  const handleOnChange = (value, filterName) => {
    setOffset(0);
    setSelectedId(value);
    if (filterBy === 'Tag') {
      const tag =
        dropdownDataFiltered &&
        dropdownDataFiltered.filter((tag) => tag.id === value);
      const ids =
        tag &&
        tag[0] &&
        tag[0]?.associations?.emailTemplate?.map((template) => template.id);
      updateTemplateGrid(ids);
    }

    if (filterBy === 'TemplateName') {
      updateTemplateGrid(value, filterName);
    }
    if (filterBy === 'Category') {
      updateTemplateGrid(value);
    }
    setQuery(filterBy, value);
  };

  const updateTemplateGrid = (ids, filterName) => {
    if (filterBy !== 'Category' && ids && ids.length > 0) {
      queryParams['filter[id]'] = encodeURIComponent(':[' + ids + ']');
    } else if (filterBy === 'Category') {
      queryParams['filter[q]'] = encodeURIComponent(ids);
    }
    if (filterBy === 'TemplateName' && filterName) {
      queryParams['filter[name]'] = `*${filterName}`;
    }
    const filterQry = Object.entries({
      ...queryParams,
    })
      .filter(([key]) => key.startsWith('filter'))
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    setEmailTemplateFilter(
      filterQry === '' ? '' : '&' + filterQry + '&' + templateFilter
    );
    setShouldExecute(true);
  };

  useEffect(() => {
    if (showModal) {
      getTemplatedata({
        variables: {
          limit,
          offset,
          sortBy,
          orderBy,
          filter: emailTemplateFilter,
        },
      });
      getDropdownData({
        variables: {
          includeAssociationsQry:
            filterBy === 'Tag'
              ? 'includeAssociationsQry[]=emailTemplate'
              : 'includeAssociationsQry[]=user',
          filter: emailTemplateFilter,
          limit: dropdownLimit,
          offset: dropdownOffset,
        },
      });
    }
    setFilterExecute(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterBy,
    emailTemplateFilter,
    dropdownLimit,
    dropdownOffset,
    showModal,
    limit,
    offset,
    sortBy,
    orderBy,
    filterExecute,
    shouldExecute,
  ]);

  const gridData = useMemo(
    () =>
      templateData && templateData.templates ? templateData.templates.data : [],
    [templateData]
  );
  useEffect(() => {
    setPageCount(
      !loading &&
        templateData &&
        templateData.templates &&
        templateData.templates.paging
        ? Math.ceil(templateData.templates.paging.totalCount / limit)
        : 0
    );
    setTotalCount(
      !loading && templateData?.templates?.paging
        ? templateData.templates.paging.totalCount
        : 0
    );
  }, [limit, loading, templateData]);

  const handleReset = () => {
    setSearchBy('TemplateName');
    setQuery('TemplateName');
    setOffset(0);
    setCurrentPageIndex(0);
    setEmailTemplateFilter(`&${templateFilter}`);
    setSelectedId(0);
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Template Name',
        accessor: 'name',
        width: '40%',
        Cell: function (props) {
          return (
            <Row className="float-left">
              <Col className="text-break" title={props.value}>
                {props.value && props.value.length > 30
                  ? props.value.slice(0, 29) + '..'
                  : props.value}
              </Col>
            </Row>
          );
        },
      },
      {
        Header: '',
        accessor: 'shareType',
        width: '10%',
        Cell: function (props) {
          return (
            <i
              className="fas fa-user-friends text-muted"
              title={'This template is a shared template'}
              hidden={props.row.original.sharedType === 'none' ? true : false}
            ></i>
          );
        },
      },
      {
        Header: 'Tags',
        accessor: 'tag][tagValue',
        width: '30%',
        Cell: function (props) {
          const rowData = props.row.original;
          const tagAssociations =
            rowData.associations &&
            rowData.associations.tag.map((item) => item.id);
          const tagnames = [];
          if (
            props.templateData.templates.includedAssociations &&
            props.templateData.templates.includedAssociations.tag
          ) {
            props.templateData.templates.includedAssociations.tag.forEach(
              (item) => {
                if (tagAssociations.includes(item.id)) {
                  tagnames.push(item);
                }
              }
            );
          }
          const taglist = tagnames && tagnames;
          return (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>
              {taglist &&
                taglist.length > 0 &&
                taglist
                  .slice(0, taglist.length > 3 ? 3 : taglist.length)
                  .map((tag, index) => {
                    return (
                      <Badge
                        key={index}
                        color="light"
                        title={tag}
                        className="border border-dark mr-2 mb-2 text-normal text-break pointer"
                        pill
                      >
                        {tag && index === 2 && taglist.length > 3 ? (
                          <span>
                            {tag.tagValue.length > 15
                              ? tag.tagValue.slice(0, 14)
                              : tag.tagValue}
                            <b>...</b>
                          </span>
                        ) : (
                          <span title={tag.tagValue}>
                            {tag.tagValue.length > 15
                              ? tag.tagValue.slice(0, 14) + '..'
                              : tag.tagValue}
                          </span>
                        )}
                      </Badge>
                    );
                  })}
            </>
          );
        },
      },
      {
        Header: 'Category',
        accessor: 'category',
        width: '20%',
        Cell: function (props) {
          return (
            <Row className="float-left">
              <Col className="text-center">
                {props.value && props.value.lookupValue}
              </Col>
            </Row>
          );
        },
      },
    ],
    []
  );

  return (
    <Modal size="lg" isOpen={showModal} centered>
      <ModalHeader toggle={hideModal}>
        <i className="fas fa-search mr-2"></i>Search Email Templates
      </ModalHeader>
      <ModalBody className="px-4">
        <FormGroup
          row
          className="d-flex align-items-center justify-content-center mb-3"
        >
          <Col md={2} className="text-right">
            <Label className="mb-0">Search By </Label>
          </Col>
          <Col md={4}>
            <Input
              type="select"
              value={searchBy}
              name="searchby"
              id="list_searchby"
              data-tab-value="searchby"
              onChange={handlesearchByChange}
            >
              <option value="TemplateName">Template Name</option>
              <option value="Tag">Tag</option>
              <option value="Category">Category</option>
            </Input>
          </Col>
          <Col md={4}>
            <div>
              <DropDown
                name="filterdBy"
                data={removeDuplicates(dropdownDataFinal)}
                loading={loading}
                error={error}
                value={selectedId}
                placeHolder={'Select Value'}
                onChange={handleOnChange}
                // this will be called on clicking an option in dropdown or pressing enter key
                onKeyDown={(value) => handleOnChange([], value)}
              />
            </div>
          </Col>
        </FormGroup>

        <Row form>
          <Col md={12}>
            <div className="overflow-auto" style={{ height: '480px' }}>
              <SearchEmailTemplateGrid
                columns={columns}
                data={gridData}
                templateData={templateData}
                sortBy={sortBy}
                orderBy={orderBy}
                fetchData={({ pageIndex, pageSize }) => {
                  setOffset(pageIndex);
                  setCurrentPageIndex(pageIndex);
                  setLimit(pageSize);
                }}
                loading={templateLoading}
                pageSize={limit}
                pageCount={pageCount}
                totalCount={totalCount}
                error={templateError}
                currentPageIndex={currentPageIndex}
                setSelectedRows={setSelectedRows}
                handleSortBy={(column, order) => {
                  setSortBy(column);
                  setOrderBy(order);
                }}
              />
            </div>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter className="card-footer">
        <ClButton
          onClick={handleReset}
          icon="fas fa-sync-alt"
          color="secondary"
          title="Reset"
        >
          Reset
        </ClButton>
        <ClButton
          type="submit"
          color="primary"
          icon="fa fa-check mr-2"
          loading={Loading}
          onClick={onSubmit}
        >
          Select
        </ClButton>
      </ModalFooter>
    </Modal>
  );
};
export default SearchEmailTemplateModal;
