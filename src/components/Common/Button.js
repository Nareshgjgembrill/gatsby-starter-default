/**
 * @author @rkrishna-gembrill
 * @since Jun 22 2020
 * @version V11.0
 */
import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'reactstrap';

const ClButton = (props) => {

    const newProps = { ...props };
    delete newProps.icon;

    return(
        <Button {...newProps}>
            {
               props.icon && <i className={`${props.icon} mr-2`}></i>
            }
            {props.children}
        </Button>
    );
}

ClButton.propTypes = {
    icon : PropTypes.string
}

export default ClButton;