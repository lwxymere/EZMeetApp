import React, { Component, Fragment } from 'react';

import ContactList from '../Contacts/contactList';

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
import MoneyAttachIcon from "@material-ui/icons/AttachMoney"
import EditIcon from '@material-ui/icons/Edit';
import InviteIcon from '@material-ui/icons/PersonAdd';
import ClearIcon from '@material-ui/icons/Clear'

import DateFnsUtils from '@date-io/date-fns';
import {  MuiPickersUtilsProvider } from '@material-ui/pickers';
import { DateTimePicker } from "@material-ui/pickers";


const INITIAL_STATE = {
  eventName: "",
  startTime: new Date(),
  endTime: new Date(),
  location: "",
  details: "",
  open: false,
  timeError: null,
  error: null,
};

/* This is the pop up form to create event */
class CreateEventForm extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }

  handleSubmit = authUser => event => {
    // ensure that endTime is after startTime
    if (this.state.startTime >= this.state.endTime) {
      this.setState({ timeError: "Pls review your Start and End Time." });
      return;
    }
    // generate unique event id
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
                    className="indiTimePicker"
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
                    className="indiTimePicker"
                    inputVariant="outlined"
                    disablePast
                    margin="dense"
                    value={this.state.endTime}
                    onChange={this.handleEndTime}
                    label="End Time"
                    minDateMessage=""

                  />
                </Grid>

                { this.state.timeError && 
                  <div className="DateErrorDiv"> 
                    {this.state.timeError} 
                  </div>
                }  

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
                multiline rows="2" 
              />
            </form>
          </DialogContent>
          
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
    if (this.state.startTime >= this.state.endTime) {
      this.setState({ timeError: "Pls review your start and End Time." });
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
                { this.state.timeError && 
                  <div className="DateErrorDiv"> 
                    {this.state.timeError} 
                  </div>
                }  
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
                multiline rows="2" 
              />
            </form>
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

class CreateDebtForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      author: this.props.authUser,
      eventID: this.props.eventData.id,
      payeeIDs: this.props.eventData.attendees,
      owner: this.props.eventData.owner,
      payees: this.props.eventData.IOU,
      eventName: this.props.eventData.eventName,
      open: false,
      error: null,
    }
    if (this.state.payees === undefined || this.state.payees[this.state.author.uid] === undefined) {
      var temp = []
      for (let id in this.state.payeeIDs) {
        console.log(id);
        if (id !== this.props.authUser.uid) { // dont allow user to send a debt to self
          temp[this.state.payeeIDs[id]] = '$'; 
        }
      }
      // want eventName, startTime, and location
      temp['eventDetail'] = { 
        name: this.state.author.displayName,
        eventName: this.state.eventName,
        eventID: this.state.eventID,
      }
      this.state.payees = temp;
    } else {
      this.state.payees = this.state.payees[this.state.author.uid];
    }
  }
  
  handleSubmit = () => {
    console.log(this.state.payees);
    
    var updates = {};
    updates[`/events/${this.state.eventID}/IOU/${this.state.author.uid}`] = this.state.payees;

    this.props.firebase.db.ref().update(updates)
      .then(() => {
        //window.location.reload();
        this.handleClose();
      })
      .catch(error => {
        this.setState({ error });
      });
    }
  
  handleChange = event => {
    var insidePayees = { 
      ...this.state.payees,
      [event.target.name] : event.target.value
    };
    this.setState({ payees: insidePayees });
  }

  handleClose = () => {
    this.setState({ open: false });
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  render() {
    let createForm = [];
    for (let ppl in this.state.payeeIDs) {
      createForm.push( <div> { this.state.payeeIDs[ppl] } </div> )
      createForm.push(
        <form>
          <TextField
            name= {this.state.payeeIDs[ppl]}
            type="text"
            label="Debt Amount"
            placeholder="Amount Owed"
            required={true}
            value={ this.state.payees[this.state.payeeIDs[ppl]] }
            onChange={this.handleChange}
          />
        </form>
      );
    }
 
    return (
      <Fragment>
        <Tooltip title="Create Debt" placement="top">
          <IconButton onClick={this.handleOpen}>
            <MoneyAttachIcon />
          </IconButton>
        </Tooltip>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          fullWidth
          maxWidth="sm">
          <DialogTitle>Create Debts</DialogTitle>
          
          <DialogContent>
            <div> {createForm} </div>
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

