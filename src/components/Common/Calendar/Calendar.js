/* eslint-disable @typescript-eslint/camelcase */
import React, { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/react-hooks';
import 'dhtmlx-scheduler';
import { FETCH_CALENDAR_SETTINGS } from '../../queries/MeetingsQuery';

const scheduler = window.scheduler;
const Calendar = (props) => {
  let containerRef = useRef(null);
  const initSchedulerEvents = () => {
    if (scheduler._$initialized) {
      return;
    }
    scheduler._$initialized = true;
  };
  useEffect(() => {
    scheduler.skin = 'material';
    scheduler.config.time_step = 30;
    scheduler.config.details_on_create = true;
    scheduler.config.details_on_dblclick = true;
    scheduler.config.lightbox_recurring = 'instance';
    scheduler.config.header = ['day', 'week', 'date', 'prev', 'today', 'next'];
    scheduler.config.hour_date = '%g:%i %A';
    scheduler.xy.scale_width = 70;
    scheduler.config.icons_select = ['icon_delete'];

    initSchedulerEvents();

    const { events } = props;
    scheduler.init(containerRef, new Date());
    scheduler.clearAll();
    scheduler.parse(events);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scheduler.render();
  }, []);

  useQuery(FETCH_CALENDAR_SETTINGS, {
    onCompleted: (data) => {
      scheduler.config.time_step =
        data && data.calendarSetting && data.calendarSetting.data[0]
          ? data.calendarSetting.data[0].meetingSlotDuration
          : 30;
    },
    onError: () => (scheduler.config.time_step = 30),
  });

  return (
    <div
      className="w-100 h-100"
      ref={(input) => {
        containerRef = input;
      }}
    ></div>
  );
};

export default Calendar;
