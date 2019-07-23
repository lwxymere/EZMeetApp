import React, { Component, Fragment } from 'react';
import eventbrite from 'eventbrite';

const API_KEY = process.env.REACT_APP_EVENTBRITE_API_KEY;

class EventSuggestions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      events: [],
      currentPage: 1,
      hasMorePages: false,
    };

    // Create configured Eventbrite SDK
    // When all request endpoints will be full URLs
    this.sdk = eventbrite({
      token: API_KEY,
      baseUrl: "",
    });
  }

  getEventbriteEvents(pageNumber) {
    this.sdk.request("https://www.eventbriteapi.com/v3/events/search/?expand=venue&q=Singapore&page=" + pageNumber)
      .then(res => {
        this.setState({
          loading: false,
          events: res.events,
          currentPage: res.pagination.page_number,
          hasMorePages: res.pagination.has_more_items,
        });
      })
      .catch(error => console.log(error));
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getEventbriteEvents(1);
  }

  render() {
    const { loading, events, currentPage, hasMorePages } = this.state;

    if (loading) {
      return (
        <div>Loading...</div>
      );
    } else if (events === []) {
      // I doubt this will ever happen, but just in case
      return (
        <div>Sorry! We do not have any event suggestions for you at the moment</div>
      );
    } else {
      return (
        <div>
          <div>Event Suggestions</div>
          <hr />
          {events.map(event => (
            <Fragment key={event.id}>
              {event.name && <p>{event.name.text}</p>}
              {event.logo && <img src={event.logo.url} alt="event logo" />}
              {event.summary && <div>{event.summary}</div>}
              {event.description && <div>{event.description.text}</div>}
              {/*event.description && 
                <div dangerouslySetInnerHTML={{
                   __html: event.description.html,
                }} />
              */}
              {event.start && <p>{(new Date(event.start.local)).toLocaleString()}</p>}
              {event.venue && <p>{event.venue.address.address_1}</p>}
              {event.url && <a href={event.url}>More Info</a>}
              <br /><br />
            </Fragment>
          ))}
          {currentPage > 1 ?
            <button onClick={() => {this.getEventbriteEvents(currentPage - 1)}}>Prev</button> :
            null
          }
          {hasMorePages ?
            <button onClick={() => {this.getEventbriteEvents(currentPage + 1)}}>Next</button> :
            null
          }
        </div>
      )
    }
  }
}

export default EventSuggestions;