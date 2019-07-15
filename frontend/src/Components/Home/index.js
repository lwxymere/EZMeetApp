import React, { Fragment } from "react";

import Payment from "../IOU";
//import { YourDebt, TheirDebt } from '../IOU';
import CalendarRoot from '../Calendar';

import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { Badge } from "@material-ui/core";

import PeopleIcon from "@material-ui/icons/People";
import EventIcon from "@material-ui/icons/Event";
import CalendarIcon from "@material-ui/icons/CalendarToday";
import ContactIcon from "@material-ui/icons/Contacts";
import InspirationIcon from "@material-ui/icons/Whatshot";
import MoneyIcon from "@material-ui/icons/Money";

import PropTypes from 'prop-types';

import { AuthUserContext, withAuthorization } from '../Session';
import LogoutButton from '../Logout';
import { UserEventsList, CreateEventForm } from '../Events';
import { withFirebase } from '../Firebase';
import ContactList from "../Contacts/contactList";

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

/* 1st AppBar */
const TitleBar = () => {
  return (
    <div className="titleRootDiv">
      <AppBar className="bar" position="static">
        <Toolbar>
          <PeopleIcon />
          <Typography variant="h6" className="titlebarText">
            EZMeet
          </Typography>
          <LogoutButton /> 
        </Toolbar>
      </AppBar>
    </div>
  );
};

/* 2nd AppBar below */
/* This is the menu part that appears when click on Avatar 
This is inline styling to some extent, will move to css when theres time */
const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles(theme => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.primary.main,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.white,
      },
    },
  },
}))(MenuItem);

const Profile = ({ authUser, firebase }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div className="profileRootDiv">
      <AppBar className="profileBar" position="static">
        <Toolbar>
        <Typography className="profileDetails">

          <Badge color="primary" badgeContent={4} className="profileBadge">
            <IconButton  onClick={handleClick} className="profileHiddenButton">
              <Avatar  className="profileAvatar">
                {authUser.displayName[0]}
              </Avatar>
            </IconButton>
          </Badge>
          <StyledMenu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <Notifications authUser={authUser} firebase={firebase} />
          </StyledMenu>

          <div className="profileText">
            <div> Welcome, </div>
            <div> {authUser.displayName} </div>
          </div>
        </Typography>
        
        <Button className="profileNewEvent">
          <CreateEventForm authUser={authUser} firebase={firebase} />
        </Button>        
        </Toolbar>
      </AppBar>
    </div>
  );
};

// show all received event invites under the profile pic
class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      invites: null,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.props.firebase.db.ref(`users/${this.props.authUser.uid}/invites`)
      .once('value', snapshot => {
        if (snapshot.val()) {
          const invites = Object.values(snapshot.val());
          this.setState({ invites: invites });
        }
        this.setState({ loading: false });
      });
  }

  handleDecision = (eventData, accept) => {
    const authUser = this.props.authUser;
    var updates = {};

    this.props.firebase.db.ref(`events/${eventData.id}`)
      .once('value', snapshot => {
        if (accept && snapshot.exists()) {
          // if event still exists when notification is accepted,
          // add the event to user events & add user to event attendees
          updates[`users/${authUser.uid}/events/${eventData.id}`] = true;
          updates[`events/${eventData.id}/attendees/${authUser.uid}`] = authUser.displayName;
        }
        // remove the event invitation
        updates[`users/${authUser.uid}/invites/${eventData.id}`] = null;
        this.props.firebase.db.ref().update(updates)
          .then(() => window.location.reload() )
          .catch(error => { console.log(error) });
      });
  }

  render() {
    const events = this.state.invites;
    const loading = this.state.loading;
    
    if (loading) { // loading from database
      return null;
    } else if (events === null) {
      return (
        <StyledMenuItem>
          <ListItemText primary="You have no new notifications" />
        </StyledMenuItem>
      );
    } else { 
      return (
        <Fragment>
        {events.map(event => (
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1c-content"
              id="panel1c-header"
            >
              <div>
                <Typography>{"Event invite from " + event.sender}</Typography>
              </div>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography className="eventContentTitle" variant="h5" component="div">
                {event.eventName}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                Start Time: {event.startTime}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                End Time: {event.endTime}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                Location : {event.location}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                Details : {event.details}
              </Typography>
              <Typography className="eventContentText" variant="body2" component="p">
                Attendees : 
                <ol>
                  {Object.values(event.attendees).map((attendee, index) => (
                      <li key={index}>
                        {attendee}
                      </li>
                    )
                  )}
                </ol>
              </Typography>
            </ExpansionPanelDetails>
            <hr />
            <ExpansionPanelActions>
              <Button 
                size="small" 
                onClick={() => {this.handleDecision(event, false)}} 
                color="primary"
              > Decline </Button>
              <Button 
                size="small" 
                onClick={() => {this.handleDecision(event, true)}} 
                color="primary"
              > Accept </Button>
            </ExpansionPanelActions>
          </ExpansionPanel>
        ))}
        </Fragment>
      );
    }
  }
}

/* For the Blue Tabs */
/* I'll clean up this inline styling too when there's more time */
function TabContainer(props) {
  return (
    <Typography component="div" className="tabcontentDiv">
      {props.children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

function LinkTab(props) {
  return (
    <Tab
      component="a"
      onClick={event => {
        event.preventDefault();
      }}
      {...props}
    />
  );
}

const HomeNavBar = ({ authUser, firebase }) => {
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
     <div className="tabRootDiv">
      <AppBar position="static">
        <Tabs variant="fullWidth" value={value} onChange={handleChange}>
          <Tooltip title="Event" placement="bottom">
            <LinkTab 
              label={        
                <Badge color="secondary" 
                badgeContent={5} 
                className="homenavbarBadge"
                href="/events" 
                >
                <EventIcon />
                </Badge>
              }
            />
          </Tooltip>
          <Tooltip title="Calendar" placement="bottom">
            <LinkTab icon={<CalendarIcon />} href="/calendar" />
          </Tooltip>
          <Tooltip title="Contact" placement="bottom">
            <LinkTab icon={<ContactIcon />} href="/contact" />
          </Tooltip>
          <Tooltip title="Inspirations" placement="bottom">
            <LinkTab icon={<InspirationIcon />} href="/noidea" />
          </Tooltip>
          <Tooltip title="IOU" placement="bottom">
            <LinkTab icon={<MoneyIcon />} href="/iou" />
          </Tooltip>
        </Tabs>
      </AppBar>
      {value === 0 && <TabContainer> <UserEventsList authUser={authUser} firebase={firebase}/> </TabContainer>}
      {value === 1 && <TabContainer> <CalendarRoot /> </TabContainer>}
      {value === 2 && <TabContainer> <ContactList authUser={authUser} /> </TabContainer> }
      {value === 3 && <TabContainer> EventBrite API Soontm </TabContainer>}
      { value === 4 && <TabContainer> <Payment authUser={authUser}/> </TabContainer> }
      { /* value === 4 && <TabContainer> <YourDebt authUser={authUser}/> <TheirDebt authUser={authUser}/> </TabContainer> */ }
    </div>
  );
}

const HomePage = ({ firebase }) => {
  return (
    <Container className="mainbody"> 
      <AuthUserContext.Consumer>
        {authUser => (
          <Fragment>
            <TitleBar />
            <Profile authUser={authUser} firebase={firebase} />
            <HomeNavBar authUser={authUser} firebase={firebase} />
          </Fragment>
        )}
      </AuthUserContext.Consumer>
    </Container>
  )
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(HomePage));