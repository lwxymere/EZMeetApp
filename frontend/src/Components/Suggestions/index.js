import React, { Component } from 'react';

import eventbrite from 'eventbrite';
import moment from 'moment';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import { withStyles } from '@material-ui/core/styles';

import {CircleArrow as ScrollUpButton} from "react-scroll-up-button";

const API_KEY = process.env.REACT_APP_EVENTBRITE_API_KEY;

const days = [
  {
    value: "",
    label: "None"
  },
  {
    value: "today",
    label: "Today"
  },
  {
    value: "tomorrow",
    label: "Tomorrow"
  },
  {
    value: "this_week",
    label: "This Week"
  },
  {
    value: "this_weekend",
    label: "This Weekend"
  },
  {
    value: "next_week",
    label: "Next Week"
  },
  {
    value: "this_month",
    label: "This Month"
  },
  {
    value: "next_month",
    label: "Next Month"
  }
];

const ExpansionPanel = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    width: '100%',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(228, 233, 237, 1)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    display: 'block',
    padding: theme.spacing(2),
  },
}))(MuiExpansionPanelDetails);

class EventSuggestions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      events: [],
      currentPage: 1,
      hasMorePages: false,
      filters: { 
        q: '',
        place: 'Singapore', 
        start: '',
        end: '',
        dateKeyword: '',
      },
    };

    // Create configured Eventbrite SDK
    // When all request endpoints will be full URLs
    this.sdk = eventbrite({
      token: API_KEY,
      baseUrl: "",
    });
  }

  splitting(string) {
    var words = string.split(" ");
    var ans = "";
    for (var i = 0; i < words.length; i+= 1) {
      if (i) {
        ans += '+' + words[i]
      } else {
        ans += words[i]
      }
    }
    return ans;
  }

  getEventbriteEvents(pageNumber, filters) {
    var url = "https://www.eventbriteapi.com/v3/events/search/?expand=venue&sort_by=date";
    if (filters.q !== '') url += ('&q=' + this.splitting(filters.q));
    if (filters.start !== '') url += ('&start_date.range_start=' + this.splitting(filters.start));
    if (filters.end !== '') url += ('&end_date.range_start=' + filters.end); 
    if (filters.place !== '') url += ('&location.address=' + filters.place);
    if (filters.dateKeyword !== '') url += ('&start_date.keyword=' + filters.dateKeyword);
    url += ('&page=' + pageNumber);
    
    this.sdk.request(url)
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
    this.getEventbriteEvents(1, this.state.filters);
  }

  handleChange = event => {
    var updatedFilters = {
      ...this.state.filters,
      [event.target.name]: event.target.value
    };
    this.setState({ filters: updatedFilters });
  }
  
  render() {
    const { loading, events, currentPage, hasMorePages } = this.state;

    if (loading) {
      return (
        <div className='nothingorLoading'> Loading... </div>
      );
    } else if (events === []) {
      // I doubt this will ever happen, but just in case
      return (
        <div className='nothingorLoading'> Sorry! We do not have any event suggestions for you at the moment </div>
      );
    } else {
      return (
        <Paper /*className='contentcss'*/>
          
          <Box className='contentTitle' fontSize='h4.fontSize'> 
            Event Suggestions 
          </Box>
          
          <div className='filterBoxesnButton'>
            <div className='filterBoxes'>
              <TextField
                name='q'
                label="Queries"
                placeholder="Query"
                className='filterBox'
                variant="outlined"
                margin="dense"
                value={this.state.filters.q}
                onChange={this.handleChange}
              />
              <TextField
                name='start'
                label="Start-Date"
                placeholder="Start-Date"
                className='filterBox'
                variant="outlined"
                margin="dense"
                helperText="eg: YYYY-MM-DDThh:mm:ssZ"
                value={this.state.filters.start}
                onChange={this.handleChange}
              />
              <TextField
                name='end'
                label="End-Date"
                placeholder="End-Date"
                className='filterBox'
                variant="outlined"
                margin="dense"
                helperText="eg: 2019-05-23T14:52:00Z"
                value={this.state.filters.end}
                onChange={this.handleChange}
              />
              <TextField
                select
                name='dateKeyword'
                label='Date-Keyword'
                placeholder='Date-Keyword'
                className='filterBox'
                variant='outlined'
                margin='dense'
                helperText="For easy date selection"
                value={this.state.filters.dateKeyword}
                onChange={this.handleChange}
              >
                {days.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                name='place'
                label="Place"
                placeholder="Place"
                className='filterBox'
                variant="outlined"
                margin="dense"
                value={this.state.filters.place}
                onChange={this.handleChange}
              />

            </div>

            <div className='filterDivButton'>
              <Button className='filterButton'
                onClick={() => {
                this.getEventbriteEvents(currentPage, this.state.filters)}}  >
                Set filters
              </Button>
            </div>
          </div>

          <Divider />

          <div className='suggestRootDiv'>
          {events.map(event => (
            <Card key={event.id} className='suggestCards'>
              {event.logo && <img src={event.logo.url} alt="event logo" className='eventlogo'/>}
              <CardContent>
                <div>
                  <Typography className='eventContentTitle' variant='h6' component='div'> 
                    {event.name.text}
                  </Typography>
                </div>

                <div className='eventDetails'> 
                  {(event.start || event.end) &&  
                    <div>
                      <div> 
                        <span> Start: </span>
                        { moment(new Date(event.start.local).toLocaleString(), 'MMDDYYYY hhmmss a').format('llll') }
                      </div> 
                      <div>
                        <span> End: </span> 
                        { moment(new Date(event.end.local).toLocaleString(), 'MMDDYYYY hhmmss a').format('llll') } {/*Do MMM YYYY (ddd) HH:mm*/}
                      </div>
                    </div>
                  }
      
                  { ( event.venue.address.address_1 !== null ) ?  
                    <div> 
                      Venue: {event.venue.address.address_1} {event.venue.address.address_2}
                      { (event.venue.address.postal_code !== null) ? <span> S{event.venue.address.postal_code} </span> : null }  
                    </div>
                    :
                    <div> {event.venue.name} </div>
                  }
                </div>
              </CardContent>

              <ExpansionPanel className='details'>
                <ExpansionPanelSummary>
                  Details
                </ExpansionPanelSummary>
                <ExpansionPanelDetails> 
                  <div>
                    <Typography className='eventContentText' variant='body2' component='div'>
                      {/*event.description.text */}
                      { <div dangerouslySetInnerHTML={{
                        __html: event.description.html,
                      }} />  }
                    </Typography>
                  </div>

                  {event.url && <div> <a href={event.url}>Even more Info</a> </div>}
                </ExpansionPanelDetails>
              </ExpansionPanel>
                
              </Card>
          ))}
          </div>

        <div className='moreButtons'>
          {currentPage > 1 ?
            <Button 
            className='moreButton'
            onClick={() => {
              this.getEventbriteEvents(currentPage - 1, this.state.filters);
              window.scrollTo(0, 550);
            }}>
              Prev 
            </Button> 
            :
            null
          }
          {hasMorePages ?
            <Button
            className='moreButton'
            onClick={() => {
              this.getEventbriteEvents(currentPage + 1, this.state.filters);
              window.scrollTo(0, 550);
            }}>
              Next 
            </Button> 
            :
            null
          } 
        </div>
        
        <div> 
          <ScrollUpButton />
        </div>
      </Paper>
    )}
  }
}

export default EventSuggestions;