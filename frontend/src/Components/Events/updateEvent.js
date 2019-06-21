import React from 'react';
import { withRouter } from 'react-router-dom';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../Constants/routes';

const INITIAL_STATE = {
  eventName: "",
  startTime: "",
  endTime: "",
  location: "",
  details: "",
  error: null,
};

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  handleSubmit = authUser => event => {
    // ensure that endTime is after startTime
    if (this.state.startTime > this.state.endTime) {
      this.setState({ error: { message: "Invalid End Time"} });
      event.preventDefault();
      return;
    }
    // get unique event id
    var newEventKey = this.props.firebase.db.ref().child("events").push().key;

    var eventData = {
      owner: authUser.uid,
      id: newEventKey,
      eventName: this.state.eventName,
      startTime: this.state.startTime.toLocaleString(),
      endTime: this.state.endTime.toLocaleString(),
      location: this.state.location,
      details: this.state.details,
      attendees: { [authUser.uid]: authUser.displayName },
    };

    // Write new event data to user and event nodes in database
    var updates = {};
    updates[`/events/${newEventKey}`] = eventData;
    updates[`/users/${authUser.uid}/events/${newEventKey}`] = true;

    this.props.firebase.db.ref().update(updates)
      .then(result => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.EVENTS);
      })
      .catch(error => {
        this.setState({ error });
      });

    // uncomment if moving createEvent to seperate route
    //event.preventDefault(); 
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleStartTime = date => {
    this.setState({ startTime: date });
  }

  handleEndTime = date => {
    this.setState({ endTime: date });
  }

  render() {
    const {
      eventName,
      startTime,
      endTime,
      location,
      details,
      error,
    } = this.state;

    return (
      <div className="main">
        <form onSubmit={this.handleSubmit(this.props.authUser)}>
          <label htmlFor="eventName">Event Name:</label>
          <input
            name="eventName"
            id="eventName"
            value={eventName}
            onChange={this.onChange}
            type="text"
            placeholder="Event Name"
            required={true}
          />
          <br />
          <label htmlFor="startTime">Start Time:</label>
          <DatePicker
            id="startTime"
            selected={startTime}
            onChange={this.handleStartTime}
            required={true}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
          />
          <br />
          <label htmlFor="endTime">End Time:</label>
          <DatePicker
            id="endTime"
            selected={endTime}
            onChange={this.handleEndTime}
            required={true}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={startTime}
          />
          <br />
          <label htmlFor="location">Location:</label>
          <input
            name="location"
            id="location"
            value={location}
            onChange={this.onChange}
            type="text"
            placeholder="Location"
            required={true}
          />
          <br />
          <label htmlFor="details">Event Details:</label>
          <textarea
            name="details"
            id="details"
            value={details}
            onChange={this.onChange}
            type="text"
            placeholder="Details"
            required={true}
          />
          <br />
          <button type="submit">
            Create Event
          </button>
          <br />

          {error && <p>{error.message}</p>}
        </form>
      </div>
    )
  }
}

const DeleteEventButtonBase = ({ eventData, firebase }) => (
  <button 
    type="button" 
    onClick={() => {
      const msg = "Are you sure you wish to delete this event?\nThis will delete the event for all attendees";
      if (window.confirm(msg)) {
        var attendeeIDs = [];
        firebase.db.ref(`events/${eventData.id}/attendees`)
          .once('value', snapshot => {
            console.log(snapshot.val());
            attendeeIDs = Object.keys(snapshot.val()).map(key => key);
            
            var updates = {};
            updates[`events/${eventData.id}`] = null;
            
            for (let uid of attendeeIDs) {
              updates[`users/${uid}/events/${eventData.id}`] = null;
            }
            firebase.db.ref().update(updates)
              .then(result => window.location.reload()) // refresh page on delete
              .catch(error => console.log(error));
          })
      }
    }}>Delete</button>
);

const DeleteEventButton = withFirebase(DeleteEventButtonBase);

export default withRouter(withFirebase(CreateEvent));

export { DeleteEventButton };
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------

import React from 'react';
import { withRouter } from 'react-router-dom';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../Constants/routes';

const INITIAL_STATE = {
  eventName: "",
  startTime: "",
  endTime: "",
  location: "",
  details: "",
  error: null,
};

class updateEventPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      eventName: this.props.eventData.eventName,
      startTime: this.props.eventData.startTime,
      endTime: this.props.eventData.endTime,
      location: this.props.eventData.location,
      details: this.props.eventData.details,
      attendees: this.props.eventData.attendees,
      error: null,
    };
  }

  handleSubmit = authUser => event => {
    // ensure that endTime is after startTime
    if (this.state.startTime > this.state.endTime) {
      this.setState({ error: { message: "Invalid End Time"} });
      event.preventDefault();
      return;
    }
    // get unique event id
    var newEventKey = this.props.firebase.db.ref().child("events").push().key;

    var eventData = {
      owner: authUser.uid,
      id: newEventKey,
      eventName: this.state.eventName,
      startTime: this.state.startTime.toLocaleString(),
      endTime: this.state.endTime.toLocaleString(),
      location: this.state.location,
      details: this.state.details,
      attendees: { [authUser.uid]: authUser.displayName },
    };

    // Write new event data to user and event nodes in database
    var updates = {};
    updates[`/events/${newEventKey}`] = eventData;
    updates[`/users/${authUser.uid}/events/${newEventKey}`] = true;

    this.props.firebase.db.ref().update(updates)
      .then(result => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.EVENTS);
      })
      .catch(error => {
        this.setState({ error });
      });

    // uncomment if moving createEvent to seperate route
    //event.preventDefault(); 
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleStartTime = date => {
    this.setState({ startTime: date });
  }

  handleEndTime = date => {
    this.setState({ endTime: date });
  }

  render() {
    const {
      eventName,
      startTime,
      endTime,
      location,
      details,
      error,
    } = this.state;

    return (
      <div className="main">
        <form onSubmit={this.handleSubmit(this.props.authUser)}>
          <label htmlFor="eventName">Event Name:</label>
          <input
            name="eventName"
            id="eventName"
            value={eventName}
            onChange={this.onChange}
            type="text"
            placeholder="Event Name"
            required={true}
          />
          <br />
          <label htmlFor="startTime">Start Time:</label>
          <DatePicker
            id="startTime"
            selected={startTime}
            onChange={this.handleStartTime}
            required={true}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
          />
          <br />
          <label htmlFor="endTime">End Time:</label>
          <DatePicker
            id="endTime"
            selected={endTime}
            onChange={this.handleEndTime}
            required={true}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={startTime}
          />
          <br />
          <label htmlFor="location">Location:</label>
          <input
            name="location"
            id="location"
            value={location}
            onChange={this.onChange}
            type="text"
            placeholder="Location"
            required={true}
          />
          <br />
          <label htmlFor="details">Event Details:</label>
          <textarea
            name="details"
            id="details"
            value={details}
            onChange={this.onChange}
            type="text"
            placeholder="Details"
            required={true}
          />
          <br />
          <button type="submit">
            Create Event
          </button>
          <br />

          {error && <p>{error.message}</p>}
        </form>
      </div>
    )
  }
}

export default withRouter(withFirebase(updateEvent));