import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';

import { connect } from 'react-redux';
import { Avatar } from '@nextaction/components';

const SidebarUserBlock = () =>{
    const [showUserBlock, setShowUserBlock] = useState(false);

    useEffect(() => {
      setShowUserBlock(showUserBlock)
    },[showUserBlock])

    return (
        <Collapse id="user-block" isOpen={showUserBlock}>
          <div>
            <div className="item user-block">
              {/* User picture */}
              <div className="user-block-picture">
                <div className="user-block-status">
                  <img className="img-thumbnail rounded-circle" src={Avatar} alt="Avatar" width="60" height="60" />
                  <div className="circle bg-success circle-lg"></div>
                </div>
              </div>
              {/* Name and Job */}
              <div className="user-block-info">
                <span className="user-block-name">Hello, Mike</span>
                <span className="user-block-role">Designer</span>
              </div>
            </div>
          </div>
        </Collapse>
      )
}
SidebarUserBlock.propTypes = {
    showUserBlock: PropTypes.bool
  };
  
  const mapStateToProps = function(state) {
    return {
      showUserBlock: state.settings.showUserBlock
    }
  }
  
  export default connect(
    mapStateToProps
  )(SidebarUserBlock);