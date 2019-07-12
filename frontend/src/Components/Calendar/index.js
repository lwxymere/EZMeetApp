import React, { Component } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

/*--------------------
Need to propogate events from Google or simply firebase (TBD)
Google - will require backend to pull out data from their Google API. 
         will also require them to log in/authorize a second time to allow
         their calendar events to be given
Firebase - simply extract from firebase will do

Either way, once obtained the events, put into format as below and put into another
file along this directory and import here to be placed.
*/

class EventsCalendar extends Component {
  render() {
    const dummyEvents = [
      {
        allDay: false,
        end: new Date('July 12, 2019 11:13:00'),
        start: new Date('July 09, 2019 11:13:00'),
        title: 'hi',
      },
      {
        allDay: true,
        end: new Date('July 15, 2019 11:13:00'),
        start: new Date('July 11, 2019 11:13:00'),
        title: 'All Day Event',
      },
    ];
    
    return (
      <Calendar
      className="calendar"
      views={['month', 'day', 'agenda']}
      localizer={localizer}
      events={dummyEvents}
      startAccessor="start"
      endAccessor="end"
      />
    );
  }
}

export default EventsCalendar;