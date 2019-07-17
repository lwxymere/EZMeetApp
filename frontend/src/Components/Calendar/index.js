import React, { Component } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

/**
 * Potential update/upgrade could be 
 * 1. Making a popup/Modal when a current event is clicked to display its information.
 * 2. Obtaining event from Google Calendar.
 */

class EventsCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loading: false,
      isEditModalOpen: false,
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

  toggleEditModal = event => {    
    if (!this.state.isAddModalOpen) {
      this.setState({
        currentEvent: event,
        isEditModalOpen: !this.state.isEditModalOpen,
      });
    }
  };

  render() {
    const { events, loading } = this.state;
    
    if (loading) { // loading from database
      return (
        <div>
          {loading && <p className="nothingorLoading">Loading...</p>}
        </div>
      );
    } else {
      return (
        <Calendar
          className="calendar"
          startAccessor="startTime"
          endAccessor="endTime"
          titleAccessor='eventName'
          tooltipAccessor='details'
    
          popup
          //onShowMore={(events, date) => this.setState({showModal: true, events})}
          views={['month', 'day', 'agenda']}
          localizer={localizer}
          events={events}
          //onSelectEvent={event => console.log(event)}
          onSelectEvent={event => alert(`Details: ${event.details} Location: ${event.location}`)}
          />
      );
    }
  }
} 


export default EventsCalendar;