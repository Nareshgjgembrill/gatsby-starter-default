import React, { useEffect, useState } from 'react';
import {
  Alert,
  CustomInput,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import ReactApexChart from 'react-apexcharts';

const PerformanceModal = ({
  showModal,
  hideModal,
  loading,
  data,
  header,
  error,
}) => {
  const [
    templatePerformancechartData,
    setTemplatePerformancechartData,
  ] = useState([]);

  const [showSentMetrics, setShowSentMetrics] = useState(false);

  const [state, setState] = useState({});

  useEffect(() => {
    if (data?.length > 0) {
      setTemplatePerformancechartData(data.filter((data) => data.sent > 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    setState({
      series: [
        {
          name: 'Opened',
          data: templatePerformancechartData.map((data) => data.opened),
        },
        {
          name: 'Replied',
          data: templatePerformancechartData.map((data) => data.replied),
        },
        {
          name: 'Linkes Clicked',
          data: templatePerformancechartData.map((data) => data.linksClicked),
        },
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: templatePerformancechartData.map(
            (data) => data.emailTemplateName
          ),
          labels: {
            trim: true,
            maxHeight: 50,
          },
        },
        yaxis: {
          title: {
            text: 'Count',
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val;
            },
          },
        },
      },
    });
  }, [templatePerformancechartData]);

  useEffect(() => {
    if (showSentMetrics === true) {
      setState((prevState) => {
        return {
          ...prevState,
          series: [
            {
              name: 'Sent',
              data: templatePerformancechartData.map((data) => data.sent),
            },
            {
              name: 'Opened',
              data: templatePerformancechartData.map((data) => data.opened),
            },
            {
              name: 'Replied',
              data: templatePerformancechartData.map((data) => data.replied),
            },
            {
              name: 'Linkes Clicked',
              data: templatePerformancechartData.map(
                (data) => data.linksClicked
              ),
            },
          ],
        };
      });
    } else {
      setState((prevState) => {
        return {
          ...prevState,
          series: [
            {
              name: 'Opened',
              data: templatePerformancechartData.map((data) => data.opened),
            },
            {
              name: 'Replied',
              data: templatePerformancechartData.map((data) => data.replied),
            },
            {
              name: 'Linkes Clicked',
              data: templatePerformancechartData.map(
                (data) => data.linksClicked
              ),
            },
          ],
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSentMetrics]);

  return (
    <Modal isOpen={showModal} centered={true} size="lg">
      <ModalHeader toggle={hideModal}>
        <div className="d-flex flex-column flex-md-row">
          <i className="fas fa-chart-bar fa-lg mr-2 text-purple mt-1"></i>
          <span className="mr-2">{header}</span>
          <span
            check
            inline
            title={`${showSentMetrics ? 'Hide' : 'Show'} sent metrics`}
          >
            <CustomInput
              type="switch"
              id="sent_custom_switch"
              name="custom_switch"
              checked={showSentMetrics}
              onChange={() => setShowSentMetrics(!showSentMetrics)}
            ></CustomInput>
          </span>
          {loading && (
            <i className="fas fa-spinner fa-spin ml-2" title="Loading" />
          )}
        </div>
      </ModalHeader>
      <ModalBody className="wd-auto h-100">
        {error && (
          <Alert color="danger" className="text-center mb-0">
            <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
            Failed to fetch data
          </Alert>
        )}
        {!loading &&
          !error &&
          templatePerformancechartData &&
          templatePerformancechartData.length === 0 && (
            <Alert color="warning" className="text-center mb-0">
              <i className="fas fa-exclamation-circle fa-lg mr-2"></i>
              No data available
            </Alert>
          )}

        {!loading &&
          !error &&
          templatePerformancechartData &&
          templatePerformancechartData.length > 0 && (
            <div id="chart" className="engagementscore-chart">
              <ReactApexChart
                options={state.options}
                series={state.series}
                type="bar"
                height={350}
              />
            </div>
          )}
      </ModalBody>
      <ModalFooter className="card-footer"></ModalFooter>
    </Modal>
  );
};
export default PerformanceModal;
