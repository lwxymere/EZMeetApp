import React, { Component } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Modal } from "@material-ui/core";


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
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loading: false,
      showModal: false,
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
            selectable
            //onShowMore={(events, date) => this.setState({showModal: true, events})}
            views={['month', 'day', 'agenda']}
            localizer={localizer}
            events={events}
            onSelectEvent={event => console.log(event)}
          />
      );
    }
  }
} 

export default EventsCalendar;