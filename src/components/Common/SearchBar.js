/**
 * @author @rkrishna-gembrill
 * @since Mar 26 2021
 * @version V11.0
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, InputGroup, InputGroupAddon, Input } from 'reactstrap';

const AddonButton = ({
  className,
  icon,
  onClick: handleClick,
  show,
  title,
}) => {
  const [mouseOut, setMouseOut] = useState(true);

  return (
    <Button
      className={`${className} ${mouseOut && 'text-muted'} ${
        show ? 'visible' : 'invisible'
      }`}
      onClick={handleClick}
      onMouseOver={() => {
        setMouseOut(false);
      }}
      onMouseOut={() => {
        setMouseOut(true);
      }}
      title={title}
    >
      <i className={icon}></i>
    </Button>
  );
};

const SearchBar = ({
  onSearch: handleSearch,
  onChange: handleChange,
  searchInput,
  clname,
}) => {
  return (
    <InputGroup
      className={`border rounded-sm align-items-center search-bar ${
        clname && clname
      }`}
    >
      <Input
        className="border-0 h-auto"
        placeholder="Search"
        value={searchInput}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch(e.target.value);
          }
        }}
      />
      <InputGroupAddon addonType="append">
        <AddonButton
          className="py-0 pr-2 pl-2 border-0 pointer"
          icon="fas fa-search"
          onClick={() => {
            handleSearch(searchInput);
          }}
          show={searchInput}
          title="Start search"
        />
        <AddonButton
          className="py-0 pl-2 pr-2 border-right searchbar-remove-text pointer"
          icon="fas fa-times"
          onClick={() => {
            handleSearch('');
          }}
          show={searchInput}
          title="Clear search"
        />
      </InputGroupAddon>
    </InputGroup>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired, // this prop is a function that will be invoked when user press enter key from searh input or when clicks on search icon
  onChange: PropTypes.func.isRequired, // this prop is a function that will be invoked when user change the input value
  searchInput: PropTypes.string.isRequired, // this prop has input value and it will be updated when  we have changed the input value.
  clname: PropTypes.string, // this prop is optional and it has class name, we can add any class name if needed.
};

export default SearchBar;
