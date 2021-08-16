/**
 * @author @rkrishna-gembrill
 * @since May 06 2021
 * @version V11.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';

const CarouselSlider = ({ settings, slideList, clName }) => {
  return (
    <div className={clName} style={{ padding: '0px 25px 25px' }}>
      <Slider {...settings}>{slideList}</Slider>
    </div>
  );
};

CarouselSlider.propTypes = {
  settings: PropTypes.object.isRequired, // this prop has the slider options
  slideList: PropTypes.array.isRequired, // this prop has the list slides of the slider
  clName: PropTypes.string, // this prop has the className
};

export default CarouselSlider;
