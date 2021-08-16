import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ReactApexChart from 'react-apexcharts';

const EngagementScoreModal = ({
  showModal,
  toggleModal,
  engagementScore,
  total,
}) => {
  const [state, setState] = useState({
    engagementScore: engagementScore.map((val) => val.score),
    options: {
      chart: {
        width: 380,
        type: 'donut',
      },
      plotOptions: {
        pie: {
          startAngle: -90,
          endAngle: 270,
        },
      },
      dataLabels: {
        enabled: true,
      },
      labels: engagementScore.map((val) => val.name),
      fill: {
        type: 'gradient',
      },
      legend: {
        formatter: function (val, opts) {
          return val + ' - ' + opts.w.globals.series[opts.seriesIndex];
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  });

  useEffect(() => {
    setState((prevState) => {
      return {
        ...prevState,
        engagementScore: engagementScore.map((val) => val.score),
      };
    });
  }, [engagementScore]);

  return (
    <Modal isOpen={showModal} centered={true}>
      <ModalHeader toggle={toggleModal}>
        <i className="fas fa-chart-bar fa-lg mr-2 text-purple"></i>
        Engagement Score
        <span className="ml-2">{`(Total - ${total})`}</span>
      </ModalHeader>
      <ModalBody>
        <div id="chart" className="engagementscore-chart">
          <ReactApexChart
            options={state.options}
            series={state.engagementScore}
            type="donut"
            width={380}
          />
        </div>
      </ModalBody>
      <ModalFooter className="card-footer"></ModalFooter>
    </Modal>
  );
};

export default EngagementScoreModal;
