import React from 'react';

import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider'

import { withFirebase } from '../Firebase';
import { DeleteEventButton, EditEventButton } from './createEvent';

class UserEventsList extends React.Component {
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

  render() {
    const { events, loading } = this.state;

    return (
      <div className="eventRootDiv">
        <Paper className="contentcss">
        <Typography component="div">
          <Box className="eventTitle" fontSize="h4.fontSize">
            Upcoming Events
          </Box>
            <EventList events={events} loading={loading} />
        </Typography>
        </Paper>
      </div>
    );
  }
}

const EventList = ({ events, loading }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="noEventorLoading">Loading Events...</p>}
      </div>
    );
  } else if (events.length === 0) { // no upcoming events
    return (
      <div className="noEventorLoading">You have no upcoming events. <br/> Why not create one?</div>
    );
  } else { // render user events
    return (
      <div className="eventListed">
        { /* Can shift this into another seperate component */}
        {events.map(event => (
          <Card key={event.id} className="eventCards">
            <CardContent className="eventCardContent">
              <div className="eventContentHeader">
              <Typography className="eventContentTitle" variant="h5" component="div">
                {event.eventName}
              </Typography>
              <div className="eventContentButtons">
              <EditEventButton eventData={event} />
              <DeleteEventButton eventData={event} />
              </div>
              </div> 
              <Divider />

              <Typography className="eventContentText" variant="body2" component="p">
                Start Time: {event.startTime}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                End Time: {event.endTime}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                Where? : {event.location}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                What? : {event.details}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default withFirebase(UserEventsList);