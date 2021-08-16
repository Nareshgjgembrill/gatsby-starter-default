import React from 'react';
import PropTypes from 'prop-types';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';

//Kindly refer example.js for chart data format and props

const Chart = ({ data, type, ...props }) => {
  let barkeys, indexBy;
  const colors = [
    '#419BF6',
    '#A0EA76',
    '#D059EC',
    '#FD9927',
    '#eb2617',
    '#ede964',
    '#b5b504',
    '#77b8ae',
    '#ba8a7f',
    '#a38637',
  ];

  if (type === 'Bar' && data && data.length > 0) {
    barkeys = props.keys ? props.keys : Object.keys(data[0]);
    indexBy = props.indexBy ? props.indexBy : barkeys.shift();
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        marginLeft: `${type === 'Pie' && props.marginLeft ? '-22%' : '0%'}`,
      }}
    >
      {(() => {
        switch (type) {
          case 'Bar':
            return (
              <ResponsiveBar
                data={data}
                keys={barkeys}
                indexBy={indexBy}
                margin={
                  props.margin
                    ? props.margin
                    : { top: 50, right: 130, bottom: 50, left: 60 }
                }
                tooltip={props.tooltip && props.tooltip}
                enableLabel={props.enableLabel && props.enabelLabel}
                labelFormat={props.labelFormat && props.labelFormat}
                // skip lable if width is less than specified value
                labelSkipWidth={
                  props.labelSkipWidth ? props.labelSkipWidth : 12
                }
                labelSkipHeight={
                  props.labelSkipHeight ? props.labelSkipHeight : 2
                }
                groupMode={props.groupMode ? props.groupMode : 'stacked'}
                layout={props.layout ? props.layout : 'vertical'}
                padding={props.padding ? props.padding : 0.3}
                innerPadding={props.innerPadding ? props.innerPadding : 0}
                enableGridY={props.enableGridY && props.enableGridY}
                // 'linear' or 'symlog'
                valueScale={
                  props.valueScale ? props.valueScale : { type: 'linear' }
                }
                theme={props.theme && props.theme}
                colors={
                  props.colors
                    ? props.colors.map((c) => c)
                    : colors.map((c) => c)
                }
                defs={props.defs && props.defs}
                fill={props.fill && props.fill}
                borderColor={
                  props.borderColor
                    ? props.borderColor
                    : { from: 'color', modifiers: [['darker', 1.6]] }
                }
                axisTop={
                  props.axisTopLegend
                    ? {
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: props.axisTopLegend,
                        legendPosition: 'middle',
                        legendOffset: 36,
                      }
                    : null
                }
                axisRight={
                  props.axisRightLegend
                    ? {
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: props.axisRightLegend,
                        legendPosition: 'middle',
                        legendOffset: 0,
                      }
                    : null
                }
                axisBottom={
                  props.axisBottomLegend
                    ? props.axisBottomLegend
                    : {
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: indexBy,
                        legendPosition: 'middle',
                        legendOffset: 32,
                      }
                }
                axisLeft={
                  props.axisLeftLegend
                    ? {
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: props.axisLeftLegend,
                        legendPosition: 'middle',
                        legendOffset: -40,
                      }
                    : {
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        tickValues: props.tickValues && props.tickValues,
                        legendPosition: 'middle',
                        legendOffset: -40,
                      }
                }
                labelTextColor={
                  props.labelTextColor
                    ? props.labelTextColor
                    : { from: 'color', modifiers: [['darker', 1.6]] }
                }
                legends={
                  props.legends
                    ? props.legends
                    : [
                        {
                          dataFrom: 'keys',
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 120,
                          translateY: 0,
                          itemsSpacing: 2,
                          itemWidth: 100,
                          itemHeight: 20,
                          itemDirection: 'left-to-right',
                          itemOpacity: 0.85,
                          symbolSize: 20,
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemOpacity: 1,
                              },
                            },
                          ],
                        },
                      ]
                }
                layers={props.layers}
              />
            );
          case 'Line':
            return (
              <ResponsiveLine
                data={data}
                margin={
                  props.margin
                    ? props.margin
                    : { top: 50, right: 110, bottom: 50, left: 60 }
                }
                xScale={props.xScale ? props.xScale : { type: 'point' }}
                enableGridY={props.enableGridY && props.enableGridY}
                yScale={
                  props.yScale
                    ? props.yScale
                    : {
                        type: 'linear',
                        min: 'auto',
                        max: 'auto',
                        stacked: true,
                        reverse: false,
                      }
                }
                yFormat={props.yFormat ? props.yFormat : ' >-.2f'}
                curve={props.curve ? props.curve : 'linear'}
                colors={
                  props.colors
                    ? props.colors.map((c) => c)
                    : colors.map((c) => c)
                }
                lineWidth={props.lineWidth ? props.lineWidth : 2}
                enableArea={props.enableArea ? props.enableArea : false}
                axisTop={
                  props.axisTopLegend
                    ? {
                        orient: 'top',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: props.axisTopLegend,
                        legendOffset: 36,
                      }
                    : null
                }
                axisRight={
                  props.axisRightLegend
                    ? {
                        orient: 'right',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: props.axisRightLegend,
                        legendOffset: 0,
                      }
                    : null
                }
                axisBottom={
                  props.axisBottomLegend
                    ? {
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: props.axisBottomLegend,
                        legendOffset: 36,
                        legendPosition: 'middle',
                      }
                    : {
                        orient: 'bottom',
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        legendOffset: 36,
                        legendPosition: 'middle',
                      }
                }
                axisLeft={
                  props.axisLeftLegend
                    ? {
                        orient: 'left',
                        tickSize: 5,
                        tickValues: props.tickValues && props.tickValues,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: props.axisLeftLegend,
                        legendOffset: -40,
                        legendPosition: 'middle',
                      }
                    : {
                        orient: 'left',
                        tickSize: 5,
                        tickValues: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: '',
                        legendOffset: -40,
                        legendPosition: 'middle',
                      }
                }
                tooltip={props.tooltip && props.tooltip}
                pointSize={props.pointSize ? props.pointSize : 10}
                pointColor={
                  props.pointColor ? props.pointColor : { theme: 'background' }
                }
                pointBorderWidth={
                  props.pointBorderWidth ? props.pointBorderWidth : 2
                }
                pointBorderColor={
                  props.pointBorderColor
                    ? props.pointBorderColor
                    : { from: 'serieColor' }
                }
                pointLabelYOffset={
                  props.pointLabelYOffset ? props.pointLabelYOffset : -12
                }
                useMesh={props.useMesh ? props.useMesh : true}
                legends={
                  props.legends
                    ? props.legends
                    : [
                        {
                          anchor: 'bottom-right',
                          direction: 'column',
                          justify: false,
                          translateX: 100,
                          translateY: 0,
                          itemsSpacing: 0,
                          itemDirection: 'left-to-right',
                          itemWidth: 80,
                          itemHeight: 20,
                          itemOpacity: 0.75,
                          symbolSize: 12,
                          symbolShape: 'circle',
                          symbolBorderColor: 'rgba(0, 0, 0, .5)',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemBackground: 'rgba(0, 0, 0, .03)',
                                itemOpacity: 1,
                              },
                            },
                          ],
                        },
                      ]
                }
              />
            );
          case 'Pie':
            return (
              <ResponsivePie
                data={data}
                margin={
                  props.margin
                    ? props.margin
                    : { top: 40, right: 80, bottom: 80, left: 80 }
                }
                innerRadius={props.innerRadius ? props.innerRadius : 0.5}
                padAngle={props.padAngle ? props.padAngle : 0.7}
                cornerRadius={props.cornerRadius ? props.cornerRadius : 3}
                sortByValue={props.sortByValue ? props.sortByValue : true}
                colors={
                  props.colors
                    ? props.colors.map((c) => c)
                    : colors.map((c) => c)
                }
                borderWidth={props.borderWidth ? props.borderWidth : 1}
                borderColor={
                  props.borderColor
                    ? props.borderColor
                    : { from: 'color', modifiers: [['darker', 0.2]] }
                }
                radialLabelsSkipAngle={
                  props.radialLabelsSkipAngle ? props.radialLabelsSkipAngle : 10
                }
                startAngle={-60}
                radialLabelsTextColor={
                  props.radialLabelsTextColor
                    ? props.radialLabelsTextColor
                    : '#333333'
                }
                radialLabelsLinkColor={
                  props.radialLabelsLinkColor
                    ? props.radialLabelsLinkColor
                    : { from: 'color' }
                }
                sliceLabelsSkipAngle={
                  props.sliceLabelsSkipAngle ? props.sliceLabelsSkipAngle : 10
                }
                sliceLabelsTextColor={
                  props.sliceLabelsTextColor
                    ? props.sliceLabelsTextColor
                    : '#333333'
                }
                defs={props.defs && props.defs}
                fill={props.fill && props.fill}
                tooltip={props.tooltip && props.tooltip}
                legends={
                  props.removeLegends
                    ? []
                    : props.legends
                    ? props.legends
                    : [
                        {
                          anchor: 'top-right',
                          direction: 'column',
                          justify: false,
                          translateX: props.alignLeft ? 20 : 75,
                          translateY: -34,
                          itemsSpacing: 6,
                          itemWidth: 150,
                          itemHeight: 19,
                          itemTextColor: '#999',
                          itemDirection: 'left-to-right',
                          itemOpacity: 1,
                          symbolSize: 18,
                          symbolShape: 'circle',
                          effects: [
                            {
                              on: 'hover',
                              style: {
                                itemTextColor: '#000',
                              },
                            },
                          ],
                        },
                      ]
                }
              />
            );
          default:
            return null;
        }
      })()}
    </div>
  );
};

Chart.prototypes = {
  data: PropTypes.array.isRequired, // Required to visualize the chart data
  type: PropTypes.string.isRequired, // Required to identify the type of chart want to use

  margin: PropTypes.object, // optional prop to customize the four side's margin
  colors: PropTypes.array, // optional prop to customize the colors used in the chart which we need to pass array of #color codes
  defs: PropTypes.array, // optional prop to define patterns and gradients
  fill: PropTypes.array, // optional prop to define rules to apply patterns and gradients
  legends: PropTypes.array, // optional prop to customize the legends of the chart
  groupMode: PropTypes.string, // optional prop to change the groupMode in the Bar chart type
  layout: PropTypes.string, // optional prop to change the layout of the bar chart
  padding: PropTypes.number, // optional prop for bar chart type to change the padding
  valueScale: PropTypes.object, // optional prop for bar chart type to change the valuescale
  borderColor: PropTypes.object, //optional prop for bar chart type to change the border color
  axisTopLegend: PropTypes.string, //optional prop for bar and line chart to give the top legend
  axisRightLegend: PropTypes.string, //optional prop for bar and line chart to give the right legend
  axisBottomLegend: PropTypes.string, //optional prop for bar and line chart to give the bottom legend
  axisLeftLegend: PropTypes.string, //optional prop for bar and line chart to give the left legend
  labelSkipWidth: PropTypes.number, // optional prop for bar chart to change the labelSKipWidth
  labelSkipHeight: PropTypes.number, // optional prop for bar chart to change the labelSkipHeight
  labelTextColor: PropTypes.object, // optional prop for bar chart to change the labelTextColor

  innerRadius: PropTypes.number, // Optional prop for Pie chart which we can customize the inner radius
  padAngle: PropTypes.number, // Optional prop for Pie chart which we can customize the pad angle
  cornerRadius: PropTypes.number, // Optional prop for Pie chart to change the cornerRadius
  sortByValue: PropTypes.bool, // Optional prop for Pie chart which we can display the sorted values
  borderWidth: PropTypes.number, //// Optional prop for Pie chart to change the borderWidth
  radialLabelsSkipAngle: PropTypes.number, // Optional prop for Pie chart to change the radialLabelsSkipAngle
  radialLabelsTextColor: PropTypes.string, // Optional prop for Pie chart to change the radialLabelsTextColor
  radialLabelsLinkColor: PropTypes.string, // Optional prop for Pie chart to change the radialLabelsLinkColor
  sliceLabelsSkipAngle: PropTypes.number, // Optional prop for Pie chart to change the sliceLabelsSkipAngle
  sliceLabelsTextColor: PropTypes.string, // Optional prop for Pie chart to change the sliceLabelsTextColor
  removeLegends: PropTypes.bool, // optional prop to remove the legends
  startAngle: PropTypes.number, // Optional prop to control deviation of the chart

  xScale: PropTypes.object, // Optional prop for line chart to change the xscale
  yScale: PropTypes.object, //Optional prop for line chart to change the yscale
  yFormat: PropTypes.string, //Optional prop for line chart to change the yFormat
  curve: PropTypes.string, //Optional prop for line chart to customize the curve type
  lineWidth: PropTypes.number, //Optional prop for line chart to change the lineWidth
  enableArea: PropTypes.bool, //Optional prop for line chart whether we can decide enableArea is required or not
  pointSize: PropTypes.number, //Optional prop for line chart to change the pointSize
  pointColor: PropTypes.object, //Optional prop for line chart to change the pointColor
  pointBorderWidth: PropTypes.number, //Optional prop for line chart to change the pointBorderWidth
  pointBorderColor: PropTypes.object, //Optional prop for line chart to change the pointBorderColor
  pointLabelYOffset: PropTypes.number, //Optional prop for line chart to change the pointLabelYOffset
  useMesh: PropTypes.bool, //Optional prop for line chart to change the useMesh
};

export default Chart;
