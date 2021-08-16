/**
 * @author @rkrishna-gembrill
 * @since Jun 22 2020
 * @version V11.0
 */
import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'reactstrap';

const CloseButton = (props) => {

    const newProps = { ...props };
    delete newProps.btnTxt;

    return <Button {...newProps} color="secondary" title={props.btnTxt}><i className="fa fa-times mr-2"></i>{props.btnTxt}</Button>;
}

CloseButton.defaultProps = {
    btnTxt: "Close"
};

CloseButton.propTypes = {
    btnTxt: PropTypes.oneOf(["Cancel", "Close"])
};

export default CloseButton;