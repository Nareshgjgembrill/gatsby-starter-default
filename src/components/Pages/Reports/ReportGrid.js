/*
 * @author vikrant-gembrill
 * @version V11.0
 */
import React from 'react';
import { useTable } from 'react-table';
import { Col } from 'reactstrap';
import {
  FAILED_TO_FETCH_DATA,
  SORRY_NO_DATA_AVAILABLE,
} from '../../../util/index';
import CarouselSlider from '../../Common/CarouselSlider';

function GridRow({ row, rowKey, bucketName }) {
  let slideBuckets, sliderSettings;
  if (row.cells.length > 1) {
    // Carousel Slider Options
    sliderSettings = {
      dots: true,
      arrows: true,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 4,
    };

    // create slide list
    slideBuckets = row.cells
      .filter((cell, i) => {
        return i > 0;
      })
      .map((cell, i) => {
        return (
          <div
            key={i}
            className="text-center d-block"
            onMouseEnter={(e) => {
              if (cell.column.Header.toLowerCase() !== 'leftbucket') {
                e.currentTarget.classList.add('text-primary');
              }
            }}
            onMouseLeave={(e) => {
              if (cell.column.Header !== bucketName) {
                e.currentTarget.classList.remove('text-primary');
              }
            }}
          >
            {cell.render('Cell')}
          </div>
        );
      });
  }

  return (
    <div className="px-3 pt-3 pb-2">
      <div {...row.getRowProps()} key={rowKey} className={'row'}>
        {row.cells
          .filter((cell, i) => {
            return i === 0;
          })
          .map((cell, i) => {
            return (
              <div
                key={i}
                className={`col-md-4 d-flex align-items-center ${
                  cell.column.Header.toLowerCase() === 'leftbucket' &&
                  i === 0 &&
                  'mr-auto'
                }`}
                onMouseEnter={(e) => {
                  if (cell.column.Header.toLowerCase() !== 'leftbucket') {
                    e.currentTarget.classList.add('bg-primary');
                  }
                }}
                onMouseLeave={(e) => {
                  if (cell.column.Header !== bucketName) {
                    e.currentTarget.classList.remove('bg-primary');
                  }
                }}
              >
                {cell.render('Cell')}
              </div>
            );
          })}

        {row.cells.length > 1 && (
          <Col md={7}>
            <CarouselSlider
              settings={sliderSettings}
              slideList={slideBuckets}
              clName="right-align-slider align-middle"
            />
          </Col>
        )}
      </div>
    </div>
  );
}

const ReportGrid = ({ columns, data, loading, error, bucketName }) => {
  const empty = columns.length === 0 || data.length === 0;

  const { getTableProps, getTableBodyProps, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <div {...getTableProps()}>
      <div {...getTableBodyProps()}>
        {!loading &&
          !error &&
          !empty &&
          rows.map((row, i) => {
            prepareRow(row);

            return <GridRow row={row} key={i} bucketName={bucketName} />;
          })}
        {!loading && !error && rows.length === 0 && (
          <div>
            <div>
              <p className="text-warning text-center py-3 mb-0 d-flex align-items-center justify-content-center">
                {SORRY_NO_DATA_AVAILABLE}
              </p>
            </div>
          </div>
        )}
        {error && (
          <div>
            <div>
              <p className="text-warning text-center py-2">
                {FAILED_TO_FETCH_DATA}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportGrid;
