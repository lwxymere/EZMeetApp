import React, { Component } from "react";
import moment from "moment";

import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import Paper from "@material-ui/core/Paper";

const localizer = momentLocalizer(moment);

class EventsCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      events: [],
      eventIDs: [],
      currentEvent: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getEvents();
  }

  getEvents() {
    var promises = [];
    this.getEventIDs().then(data => {
      this.state.eventIDs.forEach(id => {
        const promise = this.props.firebase.db
          .ref(`events/${id}`)
          .once('value');
        promises.push(promise);
      });
      // ensure all API calls are completed before proceeding
      return Promise.all(promises);
    }).then(snapshots => {
      var events = [];
      snapshots.forEach(snapshot => {
        if (!snapshot.val()) return; // band-aid fix for missing/removed events
        events.push(snapshot.val());
      });
      this.setState({ events: events, loading: false });
    });
  }
  
  // gets event IDs from user node in database, and stores IDs in state
  // returns a Promise
  getEventIDs() {
    return this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/events`)
      .once('value', snapshot => {
        if (!snapshot.val()) return; // band-aid fix for no events
        const eventIDs = Object.keys(snapshot.val()).map(key => key);
        this.setState({ eventIDs: eventIDs });
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  render() {
    const { events, loading } = this.state;

    events.forEach((event, index, eventsRef) => { 
      // eventsRef is like a pointer to the original events array
      // change date format to one thats accepted by react-big-calendar
      eventsRef[index].startTime = new Date(event.startTime);
      eventsRef[index].endTime = new Date(event.endTime);
    });
    
    if (loading) { // loading from database
      return (
        <div>
          {loading && <p className="nothingorLoading">Loading...</p>}
        </div>
      );
    } else {
      return (
        <Paper className='contentcss'> 
        <Calendar
          className="calendar"
          startAccessor="startTime"
          endAccessor="endTime"
          titleAccessor='eventName'
          tooltipAccessor='details'
    
          popup
          views={['month', 'day', 'agenda']}
          localizer={localizer}
          events={events}
          onSelectEvent={event => alert(`Details: ${event.details}\nLocation: ${event.location}`)}
          //onShowMore={(events, date) => this.setState({showModal: true, events})}
          //onSelectEvent={event => console.log(event)}
          />
        </Paper>
      );
    }
  }
} 

export default EventsCalendar;