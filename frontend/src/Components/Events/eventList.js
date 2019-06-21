import React from 'react';

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
      <div>
        <h1>Upcoming Events</h1>

        <EventList events={events} loading={loading} />
      </div>
    );
  }
}

const EventList = ({ events, loading }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p>Loading Events...</p>}
      </div>
    );
  } else if (events.length === 0) { // no upcoming events
    return (
      <div>You have no upcoming events</div>
    );
  } else { // render user events
    return (
      <div>
        { /* Can shift this into another seperate component */}
        {events.map(event => (
          <div key={event.id}>
            <h3>{event.eventName}</h3>
            <EditEventButton eventData={event} />
            <DeleteEventButton eventData={event} />
            <p>{event.startTime}</p>
            <p>{event.endTime}</p>
            <p>{event.location}</p>
            <p>{event.details}</p>
          </div>
        ))}
      </div>
    );
  }
};

export default withFirebase(UserEventsList);