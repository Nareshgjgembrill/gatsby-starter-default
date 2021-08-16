import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Badge, Button } from 'reactstrap';
import classnames from 'classnames';

const Pin = ({ pinned, showPin }) => {
  const [mutePin, setMutePin] = useState(true);

  const iconClass = classnames('fas', 'fa-thumbtack', 'mr-1', {
    'text-muted': pinned ? false : mutePin,
  });

  return (
    <i
      className={iconClass}
      onMouseOut={() => setMutePin(true)}
      onMouseOver={() => setMutePin(false)}
      title={pinned ? 'Unpin' : 'Pin'}
      style={{ visibility: pinned || showPin ? 'visible' : 'hidden' }}
    ></i>
  );
};

const FilterButton = ({
  active,
  count,
  countError,
  countLoading,
  handleClick,
  handlePin,
  history,
  pinned,
  to,
  ...props
}) => {
  const [showPin, setShowPin] = useState(false);

  const badgeClass = classnames('ml-1', 'border', {
    'border-dark': !active,
    'border-warning': active,
  });

  return (
    <Button
      active={active}
      className="font-weight-bold"
      onMouseLeave={(e) => setShowPin(false)}
      onMouseEnter={() => setShowPin(true)}
      onClick={(e) => {
        if (e.target.nodeName === 'I' && handlePin) {
          handlePin(!pinned);

          return;
        } else if (to) {
          history.push(to);

          return;
        }

        if (handleClick) {
          handleClick(e);
        }
      }}
      {...props}
    >
      {pinned !== undefined && <Pin pinned={pinned} showPin={showPin} />}
      {props.children}
      {(() => {
        if (count !== undefined) {
          if (!countError && !countLoading) {
            return (
              <Badge
                color={active ? 'warning' : 'light'}
                className={badgeClass}
                pill
              >
                {count}
              </Badge>
            );
          } else if (countError && !countLoading) {
            return (
              <i
                className="fas fa-exclamation-circle text-danger ml-2 fa-lg"
                title="Failed to fetch count"
              ></i>
            );
          } else if (countLoading) {
            return (
              <i className="fa fa-spinner fa-spin ml-2" title="Loading"></i>
            );
          }
        }
      })()}
      {
        // Below icon used only to display equal right space as like in left space of button text
        pinned !== undefined && (
          <i
            className="fas fa-thumbtack  ml-1"
            style={{ visibility: 'hidden' }}
          ></i>
        )
      }
    </Button>
  );
};

FilterButton.propTypes = {
  active: PropTypes.bool.isRequired, // 'true' to make button as active else false
  count: PropTypes.number, // Integer value to display next to button text in a badge
  countError: PropTypes.bool, // If 'true' exclamation icon will be shown instead count badge. Applicable only if 'count' is not undefined.
  countLoading: PropTypes.bool, // If 'true' fontawesome spinner animation icon will be displayed instead count badge. Applicable only if 'count' is not undefined.
  handleClick: PropTypes.func, // Function to be called when user clicks on button.
  handlePin: PropTypes.func, // Function to be called when user click on pin icon to pin or unpin the filter. Applicable only if 'pinned' is not undefined.
  history: PropTypes.object, // React router history object required to route to another page. It's mandatory if prop 'to' is present
  pinned: PropTypes.bool, // If 'true' pin icon will be displayed before the button text
  to: PropTypes.string, // Prop to route user to another page onClicking of the button
};

export default FilterButton;
