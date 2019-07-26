import React, { Component, Fragment } from 'react';

import ContactList from '../Contacts/contactList';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';

import ClearIcon from '@material-ui/icons/Clear'
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from '@material-ui/icons/Edit';
import InviteIcon from '@material-ui/icons/PersonAdd';
import MoneyAttachIcon from "@material-ui/icons/AttachMoney"

import {  MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DateTimePicker } from "@material-ui/pickers";

import DateFnsUtils from '@date-io/date-fns';
import Moment from 'moment';


const INITIAL_STATE = {
  eventName: "",
  startTime: new Date(),
  endTime: new Date(),
  location: "",
  details: "",
  open: false,
  inputError: null,
  error: null,
};

/* This is the pop up form to create event */
class CreateEventForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  handleSubmit = authUser => event => {
    // max char limit of 25 chars for eventName/location
    if (this.state.eventName.length > 25 || this.state.location.length > 25) {
        this.setState({ inputError: "Max character limit of 25 for Event Name and Location"})
        return;
    }
    // max char limit of 50 chars for event details
    if (this.state.details.length > 50) {
        this.setState({ inputError: "Max character limit of 50 for Event Details"})
        return;
    }
    // ensure that endTime is after startTime
    if (this.state.startTime >= this.state.endTime) {
      this.setState({ inputError: "Please review your Start and End Times." });
      return;
    }

    // generate unique event id
    var newEventKey = this.props.firebase.db.ref().child("events").push().key;

    var eventData = {
      owner: authUser.uid,
      id: newEventKey,
      eventName: this.state.eventName,
      startTime: Moment(new Date(this.state.startTime)).format("llll"),
      endTime: Moment(new Date(this.state.endTime)).format("llll"),
      location: this.state.location,
      details: this.state.details,
      attendees: { [authUser.uid]: authUser.displayName },
    };

    // Write new event data to user and event nodes in database
    var updates = {};
    updates[`/events/${newEventKey}`] = eventData;
    updates[`/users/${authUser.uid}/events/${newEventKey}`] = true;

    this.props.firebase.db.ref().update(updates)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        window.location.reload();
      })
      .catch(error => {
        this.setState({ error });
      });
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
          <DialogTitle>New Event Details</DialogTitle>
          <DialogContent>
            <form>
              <TextField
                name="eventName"
                type="text"
                label="Event Title"
                placeholder="Name of Event"
                required
                value={this.state.eventName}
                onChange={this.handleChange}
                fullWidth 
              />
    
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid container className="TimePicker">
                  <DateTimePicker
                    id="startTime"
                    inputVariant="outlined"
                    disablePast
                    margin="dense"
                    value={this.state.startTime}
                    onChange={this.handleStartTime}
                    label="Start Time"
                    minDateMessage=""
                    required
                  />
                  <DateTimePicker
                    required
                    id="endTime"
                    inputVariant="outlined"
                    disablePast
                    margin="dense"
                    value={this.state.endTime}
                    onChange={this.handleEndTime}
                    label="End Time"
                    minDateMessage=""
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              
              <TextField
                name="location"
                type="text"
                label="Location"
                placeholder="Event Location"
                required
                value={this.state.location}
                onChange={this.handleChange}
                fullWidth 
              />
              <TextField
                name="details"
                type="text"
                label="Details"
                placeholder="Any additional details"
                required
                value={this.state.details}
                onChange={this.handleChange}
                fullWidth
              />
            </form>
          </DialogContent>
          
          { this.state.inputError && 
            <div className="ErrorDiv"> 
              {this.state.inputError} 
            </div>
          }  

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

// Consider using a Dialog or sth to give the delete confirmation message
// DeleteEventButton is only rendered for the event owner, to delete the event
const DeleteEventButton = ({ eventData, firebase }) => (
  <Tooltip title="Delete Event" placement="top">
    <Button
      className="deleteButton"
      onClick={() => {
        const msg = "Are you sure you wish to delete this event?\nThis will delete the event for all attendees and all debts";
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
              .then(() => window.location.reload()) // refresh page on delete
              .catch(error => console.log(error));
            })
        }
      }}> <DeleteIcon /> </Button>
  </Tooltip>
);

// DeclineEventButton is rendered for all event attendees who are not the event owner,
// in place of the DeleteEventButton
const DeclineEventButton = ({ eventData, firebase, authUser }) => (
  <Tooltip title="Decline Event" placement="top">
    <Button
      className="deleteButton"
      onClick={() => {
        const msg = "Are you sure you wish to decline this event?"
        if (window.confirm(msg)) {
          var updates = {};
          // delete event from user's event list
          updates[`users/${authUser.uid}/events/${eventData.id}`] = null;
          // remove user from event attendees
          updates[`events/${eventData.id}/attendees/${authUser.uid}`] = null;

          firebase.db.ref().update(updates)
            .then(() => window.location.reload())
            .catch(error => console.log(error));
        }
      }}
    > <ClearIcon /> </Button>
  </Tooltip>
);

class EditEventButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      eventName: this.props.eventData.eventName,
      startTime: new Date(this.props.eventData.startTime),
      endTime: new Date(this.props.eventData.endTime),
      location: this.props.eventData.location,
      details: this.props.eventData.details,
      inputError: null,
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
    // max char limit of 25 chars for eventName/location
    if (this.state.eventName.length > 25 || this.state.location.length > 25) {
        this.setState({ inputError: "Max character limit of 25 for Event Name and Location"})
        return;
    }
    // max char limit of 50 chars for event details
    if (this.state.details.length > 50) {
        this.setState({ inputError: "Max character limit of 50 for Event Details"})
        return;
    }
    // ensure that endTime is after startTime
    if (this.state.startTime >= this.state.endTime) {
      this.setState({ inputError: "Please review your Start and End Times." });
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
              <MuiPickersUtilsProvider utils={DateFnsUtils}>

                <Grid container className="TimePicker">
                  <DateTimePicker
                    id="startTime"
                    inputVariant="outlined"
                    className="indiTimePicker"
                    disablePast
                    value={this.state.startTime}
                    onChange={this.handleStartTime}
                    label="Start Time"
                    margin="dense"
                    minDateMessage=""
                    required
                  />
                  <DateTimePicker
                    id="endTime"
                    inputVariant="outlined"
                    className="indiTimePicker"
                    disablePast
                    value={this.state.endTime}
                    onChange={this.handleEndTime}
                    label="End Time"
                    margin="dense"
                    minDateMessage=""
                    required
                  />
                </Grid>

              </MuiPickersUtilsProvider>
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
              />
            </form>
          </DialogContent>

          { this.state.inputError && 
            <div className="ErrorDiv"> 
              {this.state.inputError} 
            </div>
          }  

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

class CreateDebtForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      debtList: {},
      open: false,
      error: null,
    }
  }
  
  handleSubmit = () => {
    const debtList = this.state.debtList;

    for (var key in debtList) {
      // dont allow submit if any field fails the money format regex
      if (!(/^[0-9]+(\.[0-9]{2})?$/.test(debtList[key]))) {
        this.setState({ error: "Please input numeric values only"});
        return;
      }
    }

    var eventData = this.props.eventData;
    var updates = {};

    for (let id in this.props.eventData.attendees) { // id is the contact's id
      let name = this.props.eventData.attendees[id];
      let date = Moment(new Date(eventData.startTime)).format("llll");

      // skip updates if debt field is left blank for a certain friend
      // skip the user himself
      if (!(name in this.state.debtList) || id === this.props.authUser.uid) continue;

      // store theirDebt info in the creator's profile
      updates[`users/${this.props.authUser.uid}/IOU/theirDebt/${id}/${eventData.id}`] = {
        debtID: eventData.id,
        uid: id,
        name: name,
        amount: this.state.debtList[name],
        details: `${eventData.eventName} at ${eventData.location} on ${date}`,
      };

      // store myDebt info in the receiver's profile
      updates[`users/${id}/IOU/myDebt/${this.props.authUser.uid}/${eventData.id}`] = {
        debtID: eventData.id,
        uid: this.props.authUser.uid,
        name: this.props.authUser.displayName,
        amount: this.state.debtList[name],
        details: `${eventData.eventName} at ${eventData.location} on ${date}`,
      };
    }

    this.props.firebase.db.ref().update(updates)
      .then(() => {
        this.handleClose();
      })
      .catch(error => {
        this.setState({ error });
      });
  }
  
  handleChange = event => {
    var updatedDebtList = { 
      ...this.state.debtList,
      [event.target.name] : event.target.value,
    };
    this.setState({ debtList: updatedDebtList });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  render() {
    let createForm = [];
    let attendees = this.props.eventData.attendees;
    for (let id in attendees) {
      // skip the user himself
      if (id === this.props.authUser.uid) continue;

      createForm.push(
        <Fragment key={id}>
          <div> {attendees[id]} </div>
          <form>
            <TextField
              name={attendees[id]}
              id={id}
              type="text"
              label="Debt Amount"
              placeholder="Amount Owed"
              required={true}
              value={this.state.debtList[attendees[id]]}
              onChange={this.handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
            />
          </form>
        </Fragment>
      );
    }
 
    return (
      <Fragment>
        <Tooltip title="Create / Update Debt" placement="top">
          <IconButton onClick={this.handleOpen}>
            <MoneyAttachIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="xs">
            <DialogTitle>Create Debts</DialogTitle>
            
            <DialogContent  className='debtAttendees'>
              <div> {createForm} </div>
              
              { this.state.error && 
                <div className="ErrorDiv"> 
                  {this.state.error} 
                </div>
              }  
            </DialogContent>
            
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

class InviteDialogButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
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

  render() {
    return (
      <Fragment>
        <Tooltip title="Invite Contacts" placement="top">
          <IconButton onClick={this.handleOpen}>
            <InviteIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm">

          <DialogTitle>Invite a Friend</DialogTitle>
          <DialogContent>
            <ContactList authUser={this.props.authUser} eventData={this.props.eventData} />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleClose}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
    );
  }
}

export { 
  DeleteEventButton, 
  DeclineEventButton, 
  EditEventButton, 
  CreateEventForm, 
  CreateDebtForm, 
  InviteDialogButton 
};