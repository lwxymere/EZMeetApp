import React, { Component, Fragment } from 'react';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { withFirebase } from '../Firebase';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton'

import EditIcon from '@material-ui/icons/Edit';

const INITIAL_STATE = {
  eventName: "",
  startTime: "",
  endTime: "",
  location: "",
  details: "",
  open: false,
  error: null,
};

class CreateEventFormBase extends Component {
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
      })
      .catch(error => {
        this.setState({ error });
      });

    // uncomment if moving createEvent to seperate route
    event.preventDefault(); 
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleStartTime = date => {
    this.setState({ startTime: date });
  }

  handleEndTime = date => {
    this.setState({ endTime: date });
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  render() {
    return (
      <Fragment>
        <Button onClick={this.handleOpen}>
          Create New Event
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm">
          <DialogTitle>New Event Details</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                name="eventName"
                type="text"
                label="Event Title"
                placeholder="Name of Event"
                required={true}
                value={this.state.eventName}
                onChange={this.handleChange}
                fullWidth 
              />
              <label htmlFor="startTime">Start Time:</label>
              <DatePicker 
                id="startTime"
                selected={this.state.startTime}
                onChange={this.handleStartTime}
                required={true}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
              />
              <label htmlFor="endTime">End Time:</label>
              <DatePicker
                id="endTime"
                selected={this.state.endTime}
                onChange={this.handleEndTime}
                required={true}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={this.state.startTime}
              />
              <TextField
                name="location"
                type="text"
                label="Location"
                placeholder="Event Location"
                required={true}
                value={this.state.location}
                onChange={this.handleChange}
                fullWidth 
              />
              <TextField
                name="details"
                type="text"
                label="Details"
                placeholder="Any additional details"
                required={true}
                value={this.state.details}
                onChange={this.handleChange}
                fullWidth
                multiline rows="3" 
              />
            </form>
          </DialogContent>
          
          { this.state.timeError && <span>{ this.state.timeError }</span>}

          <DialogActions>
            <Button onClick={this.handleClose}>
              Cancel
          </Button>
            <Button onClick={this.handleSubmit(this.props.authUser)}>
              Save
          </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
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

class EditEventButtonBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      eventName: this.props.eventData.eventName,
      startTime: new Date(this.props.eventData.startTime),
      endTime: new Date(this.props.eventData.endTime),
      location: this.props.eventData.location,
      details: this.props.eventData.details,
      timeError: null,
      error: null,
    };
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleStartTime = date => {
    this.setState({ startTime: date });
  }

  handleEndTime = date => {
    this.setState({ endTime: date });
  }

  handleSubmit = () => {
    // ensure that endTime is after startTime
    if (this.state.startTime > this.state.endTime) {
      this.setState({ timeError: "Invalid End Time" });
      return;
    }

    const eventID = this.props.eventData.id;

    var updates = {};
    updates[`/events/${eventID}/eventName`] = this.state.eventName;
    updates[`/events/${eventID}/startTime`] = this.state.startTime.toLocaleString();
    updates[`/events/${eventID}/endTime`] = this.state.endTime.toLocaleString();
    updates[`/events/${eventID}/location`] = this.state.location;
    updates[`/events/${eventID}/details`] = this.state.details;

    this.props.firebase.db.ref().update(updates)
      .then(() => {
        this.handleClose();
        window.location.reload();
      })
      .catch(error => {
        console.log('error', error.message);
        this.setState({ error });
      });
  }

  render() {
    return (
      <Fragment>
        <Tooltip title="Edit Event" placement="top">
          <IconButton onClick={this.handleOpen}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm">
          <DialogTitle>Edit Event Details</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                name="eventName"
                type="text"
                label="Event Title"
                placeholder="Name of Event"
                required={true}
                value={this.state.eventName}
                onChange={this.handleChange}
                fullWidth 
              />
              <label htmlFor="startTime">Start Time:</label>
              <DatePicker 
                id="startTime"
                selected={this.state.startTime}
                onChange={this.handleStartTime}
                required={true}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
              />
              <label htmlFor="endTime">End Time:</label>
              <DatePicker
                id="endTime"
                selected={this.state.endTime}
                onChange={this.handleEndTime}
                required={true}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={this.state.startTime}
              />
              <TextField
                name="location"
                type="text"
                label="Location"
                placeholder="Event Location"
                required={true}
                value={this.state.location}
                onChange={this.handleChange}
                fullWidth 
              />
              <TextField
                name="details"
                type="text"
                label="Details"
                placeholder="Any additional details"
                required={true}
                value={this.state.details}
                onChange={this.handleChange}
                fullWidth
                multiline rows="3" 
              />
            </form>
          </DialogContent>
          
          { this.state.timeError && <span>{ this.state.timeError }</span>}

          <DialogActions>
            <Button onClick={this.handleClose}>
              Cancel
          </Button>
            <Button onClick={this.handleSubmit}>
              Save
          </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

const DeleteEventButton = withFirebase(DeleteEventButtonBase);
const EditEventButton = withFirebase(EditEventButtonBase);
const CreateEventForm = withFirebase(CreateEventFormBase);

export { DeleteEventButton, EditEventButton, CreateEventForm };