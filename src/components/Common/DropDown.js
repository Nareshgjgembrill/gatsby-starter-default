/**
 * @author @rajesh-thiyagarajan
 * @createdOn 14.08.2020
 * @description By using this component we can achive the All, None, Single Select, MultiSelect ,Search, Fiter, Add Option,loading icon, refresh icon to the dropdown
 * @version V11.0
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';
import PropTypes from 'prop-types';

const DropwDown = React.forwardRef((props, ref) => {
  const {
    disabled,
    multiselect,
    data,
    handleRefresh,
    handleSearch,
    name,
    value,
    onChange,
    loading,
    error,
    onKeyDown,
    handleGetDropDownState,
    maxLength,
    disableOptions,
    handleClose,
  } = props;
  const [selected, setSelected] = useState(
    value ? value : multiselect ? [] : ''
  );
  const [hidden, setHidden] = useState('none');
  const [options, setOptions] = useState(data);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchFocusing, setIsSearchFocusing] = useState(false);

  const searchRef = useRef();

  let dataType = 'string';
  const hideDropDownItem = { display: hidden };
  const ignorePlaceHolderValues = ['Select Touch'];
  // called when dropdown is opened or closed
  const toggle = () => {
    if (isSearchFocusing) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen(!dropdownOpen);
      setIsSearchFocusing(false);
    }

    // updating active property of each option
    data &&
      data.forEach((option) => {
        if (!multiselect && selected !== option.value) {
          option.active = false;
        }
        if (multiselect && selected.indexOf(option.value) === -1) {
          option.active = false;
        }
      });
    setOptions(data);
    setHidden('none');
  };

  const dropDownModifier = {
    setMaxHeight: {
      enabled: true,
      fn: ({ styles, ...props }) => {
        return {
          ...props,
          styles: {
            ...styles,
            overflow: 'auto',
            maxHeight: '250px',
          },
        };
      },
    },
    setMinWidth: {
      enabled: true,
      fn: ({ styles, ...props }) => {
        return {
          ...props,
          styles: {
            ...styles,
            minWidth: '100%',
          },
        };
      },
    },
  };

  useEffect(() => {
    // set selected when value changes
    if (value?.toString()) {
      setSelected(value);
    } else {
      setSelected(value ? value : multiselect ? [] : '');
    }

    // set text of search input when value changes
    if (searchRef.current) {
      searchRef.current.value = getSelectedText(value);
    }
    // eslint-disable-next-line
  }, [value]);

  // set text of search input when data changes
  useEffect(() => {
    if (
      ['userFilters', 'tagName', 'filterName'].indexOf(name) > -1 &&
      data !== undefined &&
      data.length > 0 &&
      searchRef.current
    ) {
      searchRef.current.value = getSelectedText(value);
    }
    // eslint-disable-next-line
  }, [data]);

  useEffect(() => {
    if (handleGetDropDownState) {
      handleGetDropDownState(dropdownOpen);
    }
    // eslint-disable-next-line
  }, [dropdownOpen]);

  useEffect(() => {
    if (!isSearchFocusing && !multiselect) {
      setDropdownOpen(false);
    }
    // eslint-disable-next-line
  }, [isSearchFocusing]);

  // get comma separated string of text of all selected options in dropdown
  const getSelectedText = (value) => {
    if (
      (multiselect && value?.length > 0) ||
      (value?.toString() &&
        ignorePlaceHolderValues.indexOf(value) === -1 &&
        data &&
        data.length > 0 &&
        !error)
    ) {
      return (
        data &&
        data
          .filter(function (option) {
            return (
              (multiselect && value?.indexOf(option.value) !== -1) ||
              value === option.value
            );
          })
          .map((option) => option.text)
          .join(', ')
      );
    } else {
      return '';
    }
  };

  //-----Handle Block Start-----//

  const handleSelected = (e) => {
    const target = e.target;
    // storing data in temp array
    const tempOptionsArr = data;
    // get text of selected option
    const optionText = target.textContent;
    // get the value of the selected option
    const optionValue =
      dataType === 'number' &&
      ignorePlaceHolderValues.indexOf(target.value) === -1
        ? parseInt(target.value)
        : target.value;
    let selectedOption;

    // setting active property of selected option (toggle in case of multiselect)
    tempOptionsArr.forEach((option) => {
      if (!multiselect) {
        option.active = false;
      }
      // if multiselect then toggle active state of clicked option
      // if not multiselect then clicked option will be true, as it was set to false above
      if (option.value === optionValue) {
        option.active = !option.active;
      }
    });
    setOptions(tempOptionsArr);

    // setting 'selected' based on clicked option
    if (multiselect) {
      let label = placeHolder;
      // storing 'selected' in temporary variable
      selectedOption = selected;
      const index = selectedOption.indexOf(optionValue);
      // if clicked option is found in 'selected' then remove it
      // else insert it in 'selected'. do same with label.
      if (index !== -1) {
        selectedOption.splice(index, 1);
        label = label.split(',').map((s) => s.trim());
        label = label
          .filter((data) => {
            return data !== optionText;
          })
          .join(', ');
      } else {
        selectedOption.push(optionValue);
        label =
          label !== props.placeHolder ? label + ', ' + optionText : optionText;
      }
      setPlaceHolder(label !== '' ? label : props.placeHolder);
    } else {
      // if not multiselect then set placeHolder and 'selected' based on clicked option
      setPlaceHolder(optionText);
      selectedOption = optionValue;
    }
    setSelected(selectedOption);

    // setting class of selected option
    // if option is alredy 'active' then it will be deselected
    const isOptionDeSelected = target.classList.value.includes('active');
    target.classList = isOptionDeSelected
      ? target.classList.value.replace('active', '')
      : target.classList.value + ' active';

    // Call the Parent onChange function to get the selected options value in parent
    if (onChange) {
      const selectedOptionsText =
        getSelectedText(selectedOption) === props.placeHolder
          ? ''
          : getSelectedText(selectedOption);
      onChange(selectedOption, selectedOptionsText);
    }

    // update search input text
    if (searchRef.current) {
      searchRef.current.value = getSelectedText(selectedOption);
    }
    setIsSearchFocusing(false);
  };

  // handle on change search input
  const handleFilterSearch = () => {
    const searchValue = searchRef.current.value.trim();
    let tempOptionsArr = data;

    if (searchValue) {
      tempOptionsArr = tempOptionsArr.filter(function (option) {
        return (
          option?.text?.toLowerCase().includes(searchValue.toLowerCase()) ||
          (option.emailId &&
            option?.emailId?.toLowerCase().includes(searchValue.toLowerCase()))
        );
      });
      handleUpdateOptions();
      setOptions(tempOptionsArr);
      if (tempOptionsArr.length > 0) {
        setFilterText('');
        setHidden('none');
      } else {
        setFilterText(searchValue);
        setHidden('block');
      }
    } else {
      handleUpdateOptions();
      setOptions(data);
      setFilterText('');
      setHidden('none');
    }
  };

  const handleUpdateOptions = () => {
    if (multiselect) {
      data.forEach(function (option) {
        if (selected.indexOf(option.value) !== -1) {
          option.active = true;
        }
      });
    } else {
      data.forEach(function (option) {
        if (selected === option.value) {
          option.active = true;
        }
      });
    }
  };

  const handleRefreshDropDown = () => {
    if (dropdownOpen) {
      setDropdownOpen(!dropdownOpen);
    }
    setSelected(value ? value : multiselect ? [] : '');
    setPlaceHolder(getSelectedText(value));
    handleRefresh();
  };

  const handleAllAndNone = (value) => {
    let selectedValue = [];
    if (value === 'All') {
      const selectedOption = [];
      options.forEach(function (option) {
        option.active = true;
        selectedOption.push(option.value);
      });
      setSelected(selectedOption);
      selectedValue = selectedOption;
      searchRef.current.value = getSelectedText(selectedOption);
    } else {
      data.forEach(function (option) {
        option.active = false;
      });
      setOptions(data);
      setSelected([]);
      setPlaceHolder(props.placeHolder);
    }
    // Call the Parent onChange function to get the selected options value in parent
    if (onChange) {
      const selectedOptionsText =
        getSelectedText(selectedValue) === props.placeHolder
          ? ''
          : getSelectedText(selectedValue);
      onChange(selectedValue, selectedOptionsText);
    }
  };
  //-----Handle Block End-----//

  const [filterText, setFilterText] = useState('');
  const [placeHolder, setPlaceHolder] = useState(getSelectedText(value)); // can be removed

  useEffect(() => {
    if (ref && ref.current) {
      ref.current.value = selected;
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    searchRef.current.value = getSelectedText(value);
    // eslint-disable-next-line
  }, [getSelectedText(value)]);

  return (
    <Dropdown
      isOpen={!loading && !error && !disabled && dropdownOpen}
      toggle={toggle}
      ref={ref}
      disabled={loading || error || disabled}
      className={props.className}
      direction={props.direction}
    >
      <ButtonGroup>
        <DropdownToggle
          tag="div"
          className={error ? 'border border-danger' : ''}
        >
          <InputGroup>
            <Input
              name={name}
              className="h-auto"
              onChange={handleSearch ? handleSearch : handleFilterSearch}
              innerRef={searchRef}
              maxLength={maxLength && maxLength}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onKeyDown) {
                  e.preventDefault();
                  onKeyDown(e.target.value);
                }
              }}
              onFocus={() => setIsSearchFocusing(true)}
              title={getSelectedText(value)}
              placeholder={props.placeHolder && props.placeHolder}
              autoComplete="off"
              disabled={error || disabled}
              onMouseLeave={() => {
                if (multiselect) {
                  setIsSearchFocusing(false);
                }
              }}
            />
            <InputGroupAddon addonType="append">
              <Button
                onClick={() => {
                  setIsSearchFocusing(false);
                  toggle();
                }}
              >
                <i className="fas fa-sort-down"></i>
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </DropdownToggle>
        {loading && (
          <Button disabled>
            <i className="fa fa-spinner fa-spin"></i>
          </Button>
        )}
        {!loading && handleRefresh && (
          <Button onClick={handleRefreshDropDown}>
            <i className="fas fa-sync-alt"></i>
          </Button>
        )}
      </ButtonGroup>
      {data && (
        <DropdownMenu modifiers={dropDownModifier}>
          {data.length === 0 && <DropdownItem>No Data Available</DropdownItem>}
          {data.length > 0 && (
            <>
              {multiselect && (
                <>
                  <DropdownItem
                    onClick={(e) => {
                      handleAllAndNone(e.target.value);
                    }}
                    value={'All'}
                    toggle={false}
                    disabled={disableOptions}
                  >
                    All
                  </DropdownItem>
                  <DropdownItem
                    onClick={(e) => {
                      handleAllAndNone(e.target.value);
                    }}
                    value={'None'}
                    toggle={false}
                    disabled={disableOptions}
                  >
                    None
                  </DropdownItem>
                </>
              )}
              {handleClose && (
                <i
                  onClick={() => {
                    setDropdownOpen(false);
                  }}
                  title="Close"
                  className="fas fa-times float-right pointer mx-2 mb-1 sticky-top"
                ></i>
              )}

              {options &&
                options.map(function (option, i) {
                  dataType = typeof option.value;
                  return (
                    <React.Fragment key={i}>
                      {option.header && (
                        <DropdownItem className="text-dark bg-gray-lighter pl-2">
                          <h5 className="mb-0 text-bold">{option.header}</h5>
                        </DropdownItem>
                      )}
                      <DropdownItem
                        value={option.value}
                        disabled={disableOptions}
                        key={option.value + '_' + i}
                        onClick={(e) => {
                          handleSelected(e);
                        }}
                        toggle={!multiselect}
                        // set active or not based on 'selected'
                        className={`${
                          option.value &&
                          multiselect &&
                          selected &&
                          selected.indexOf(option.value) !== -1
                            ? 'active'
                            : option.value &&
                              ignorePlaceHolderValues.indexOf(selected) ===
                                -1 &&
                              selected === option.value
                            ? 'active'
                            : option.active
                            ? 'active'
                            : ''
                        }
                         text-wrap text-break`}
                      >
                        {Object.keys(option).indexOf('emailId') !== -1 ? (
                          <>
                            {option.text}

                            {option.text && <br />}
                            {option.emailId}
                            <br />
                          </>
                        ) : (
                          // eslint-disable-next-line react/jsx-no-useless-fragment
                          <>{option.text}</>
                        )}
                      </DropdownItem>
                    </React.Fragment>
                  );
                })}
              {handleSearch ? (
                <DropdownItem toggle={false}>{`Searching...`}</DropdownItem>
              ) : (
                <DropdownItem
                  style={hideDropDownItem}
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  toggle={false}
                >{`No Results Matched "${filterText}"`}</DropdownItem>
              )}
            </>
          )}
          {props.handleAdd && (
            <>
              <DropdownItem
                style={hideDropDownItem}
                toggle={false}
                divider
              ></DropdownItem>
              <DropdownItem
                style={hideDropDownItem}
                toggle={false}
                value={filterText}
                onClick={() => {
                  setIsSearchFocusing(false);
                  props.handleAdd(filterText);
                  setDropdownOpen(false);
                }}
              >
                <i className="fas fa-plus-circle mr-2"></i>
                {`Add ${filterText}`}
              </DropdownItem>
            </>
          )}
        </DropdownMenu>
      )}
    </Dropdown>
  );
});
DropwDown.defaultProps = {
  multiselect: false,
  disabled: false,
  value: '',
  placeHolder: '',
};

DropwDown.propTypes = {
  disabled: PropTypes.bool, //If false dropdown is enabled else true dropwdown is disabled
  multiselect: PropTypes.bool, //Prop used to dropdown with multiselection , default single select (default false else true)
  onChange: PropTypes.func, // onchange function is used to get the selected dropdown value
  data: PropTypes.array, // data prop is used to load the options in the dropdown component
  handleSearch: PropTypes.func, //handle search function is used to search the dropdown value in server side
  handleAdd: PropTypes.func, // handle add function is used to add a new option from the frontend
  loading: PropTypes.bool, // If true request loading else false
  handleRefresh: PropTypes.func, // handle refresh function is used to refetch the dropdown value
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
  ]), //value prop is used to default selection for the doropwdown
  error: PropTypes.bool, // if true request failed to fetch
  onKeyDown: PropTypes.func, // to get the filter value on Enter key press
  handleGetDropDownState: PropTypes.func, // to get the Dropdown opened state
};

export default DropwDown;
