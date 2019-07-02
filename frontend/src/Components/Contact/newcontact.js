import React, { Component, Fragment } from 'react';

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
import Grid from '@material-ui/core/Grid';

import DeleteIcon from "@material-ui/icons/Delete";

import DateFnsUtils from '@date-io/date-fns';
import {  MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DateTimePicker } from "@material-ui/pickers";

import EditIcon from '@material-ui/icons/Edit';

class CreateContactForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      loading: false,
      eventIDs: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getEvents(); // sets loading to false when done
  }

  // get all event details and store details in state after getting event IDs
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
  }
  handleSubmit = authUser => event => {
    // ensure that contact is valid
    if (this.state.startTime > this.state.endTime) {
      this.setState({ timeError: "Invalid Contact" });
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
    //event.preventDefault(); 
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
          New Event
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm">
          <DialogTitle>Add new contacts</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                name="email"
                type="text"
                label="Email"
                placeholder="Any additional details"
                required
                value={this.state.details}
                onChange={this.handleChange}
                fullWidth
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