import React, { Fragment, useEffect } from "react";
import PropTypes from 'prop-types';

import Payment from "../IOU";
import CalendarRoot from '../Calendar';
import { AuthUserContext, withAuthorization } from '../Session';
import LogoutButton from '../Logout';
import { UserEventsList, CreateEventForm } from '../Events';
import { withFirebase } from '../Firebase';
import ContactList from "../Contacts/contactList";
import EventSuggestions from '../Suggestions';

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
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';

import { Badge } from "@material-ui/core";

import PeopleIcon from "@material-ui/icons/People";
import EventIcon from "@material-ui/icons/Event";
import CalendarIcon from "@material-ui/icons/CalendarToday";
import ContactIcon from "@material-ui/icons/Contacts";
import InspirationIcon from "@material-ui/icons/Whatshot";
import MoneyIcon from "@material-ui/icons/Money";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SettledDebtIcon from "@material-ui/icons/Done";

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
/* This is the menu part that appears when click on Avatar */
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
  const [numOfNotifications, setNumOfNotifications] = React.useState(0);
  const [notifications, setNotifications] = React.useState(null);

  useEffect(() => {
    firebase.db.ref(`users/${authUser.uid}/notifications`)
      .on('value', snapshot => {
        console.log('profile listener callback');
        setNumOfNotifications(snapshot.numChildren());
        setNotifications(snapshot.val());
      });

    // Clean up subscription when component unmounts
    return () => {
      firebase.db.ref(`users/${authUser.uid}/notifications`).off()
    };
  }, [authUser, firebase, numOfNotifications]);

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

          <Badge color="primary" badgeContent={numOfNotifications} className="profileBadge">
            <IconButton  onClick={handleClick} className="profileHiddenButton">
              <Avatar  className="profileAvatar">
                {authUser.photoURL ?
                  <img src={authUser.photoURL} className="profilePicture" alt="" /> :
                  authUser.displayName[0]
                }
              </Avatar>
            </IconButton>
          </Badge>
          <StyledMenu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <Notifications authUser={authUser} firebase={firebase} notifications={notifications}/>
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

const Notifications = ({ authUser, firebase, notifications }) => {
  
  // handle accept/decline event invite from notification
  var handleDecision = (eventData, accept) => {
    var updates = {};

    firebase.db.ref(`events/${eventData.id}`)
      .once('value', snapshot => {
        if (accept && snapshot.exists()) {
          // if event still exists when notification is accepted,
          // add the event to user events & add user to event attendees
          updates[`users/${authUser.uid}/events/${eventData.id}`] = true;
          updates[`events/${eventData.id}/attendees/${authUser.uid}`] = authUser.displayName;
        }
        // remove the event invitation
        updates[`users/${authUser.uid}/notifications/${eventData.id + "event"}`] = null;
        firebase.db.ref().update(updates)
          .then(() => {
            if (accept) { // only refresh page on accept
              window.location.reload();
            }
          })
          .catch(error => console.log(error));
      });
  }

  // handle settling of debts from notifications
  var handleSettled = (debtID) => {
    var updates = {};
    // remove the debt notification
    updates[`users/${authUser.uid}/notifications/${debtID + "debt"}`] = null;

    firebase.db.ref().update(updates)
      .catch(error => console.log(error));
  }

  if (notifications === null) {
    return (
      <StyledMenuItem>
        <ListItemText primary="You have no new notifications" />
      </StyledMenuItem>
    );
  } else {
    return (
      <Fragment>
        {Object.values(notifications).map(notification => (
          <Fragment key={notification.id}>
            {notification.type === "event" ?
              <EventNotification
                eventData={notification}
                handleDecision={handleDecision}
              /> :
              // notification.type === "debt"
              <DebtNotification
                debtData={notification}
                handleSettled={handleSettled}
              />
            }
          </Fragment>
        ))}
      </Fragment>
    );
  }
}

const EventNotification = ({ eventData, handleDecision }) => (
  <ExpansionPanel>
    <ExpansionPanelSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1c-content"
      id="panel1c-header"
    >
      <div>
        <Typography>{"Event invite from " + eventData.sender}</Typography>
      </div>
    </ExpansionPanelSummary>
    <hr />
    <ExpansionPanelDetails>
      <Typography className="eventContentTitle" variant="h5" component="div">
        {eventData.eventName}
      </Typography>
      <Typography className="eventContentText" variant="body2" component="p">
        Start Time: {eventData.startTime}
      </Typography>
      <Typography className="eventContentText" variant="body2" component="p">
        End Time: {eventData.endTime}
      </Typography>
      <Typography className="eventContentText" variant="body2" component="p">
        Location : {eventData.location}
      </Typography>
      <Typography className="eventContentText" variant="body2" component="p">
        Details : {eventData.details}
      </Typography>
      <Typography className="eventContentText" variant="body2" component="p">
        Attendees :
        <ol>
          {Object.values(eventData.attendees).map((attendee, index) => (
            <li key={index}>
              {attendee}
            </li>
          ))}
        </ol>
      </Typography>
    </ExpansionPanelDetails>
    <hr />
    <ExpansionPanelActions>
      <Button
        size="small"
        onClick={() => { handleDecision(eventData, false) }}
        color="primary"
      > Decline </Button>
      <Button
        size="small"
        onClick={() => { handleDecision(eventData, true) }}
        color="primary"
      > Accept </Button>
    </ExpansionPanelActions>
  </ExpansionPanel>
)

const DebtNotification = ({ debtData, handleSettled }) => (
  <ExpansionPanel>
    <ExpansionPanelSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1c-content"
      id="panel1c-header"
    >
      <div>
        <Typography>{debtData.debtDetails}</Typography>
      </div>
    </ExpansionPanelSummary>
    <hr />
    <ExpansionPanelDetails>
      <Typography className="eventContentText" variant="body2" component="p">
        Event: {debtData.eventDetails}
      </Typography>
    </ExpansionPanelDetails>
    <ExpansionPanelActions>
      <Tooltip title="Settled" placement="top">
        <Button
          size="small"
          onClick={() => {handleSettled(debtData.id)}}
          color="primary"
        > <SettledDebtIcon /> </Button>
      </Tooltip>
    </ExpansionPanelActions>
    <hr />
  </ExpansionPanel>
)

/* For the Blue Tabs */
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

class HomeNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      theirDebt: {},
      yourDebt: {},
      IOUCount: 0,
      loading: false,
    };
  }

  handleTabClick = (event, newValue) => {
    this.setState({ value: newValue });
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.props.firebase.db.ref(`users/${this.props.authUser.uid}/IOU`)
      .on('value', snapshot => {
        if (!snapshot.val()) { // no IOUs
          this.setState({ // reset to default state
            theirDebt: {},
            yourDebt: {},
            IOUCount: 0,
            loading: false,
          });
          return;
        }

        // for notification number on the blue tab
        var IOUCount = snapshot.child('theirDebt').numChildren() + snapshot.child('myDebt').numChildren();

        this.setState({
          theirDebt: snapshot.child('theirDebt').val(),
          yourDebt: snapshot.child('myDebt').val(),
          IOUCount: IOUCount,
          loading: false,
        })
      })
  }

  componentWillUnmount() {
    this.props.firebase.db.ref(`users/${this.props.authUser.uid}/IOU`).off();
  }

  render() {
    const { value, theirDebt, yourDebt, IOUCount, loading } = this.state;
    const firebase = this.props.firebase;
    const authUser = this.props.authUser;

    return (
      <div className="tabRootDiv">
        <AppBar position="static">
          <Tabs variant="fullWidth" value={value} onChange={this.handleTabClick}>
            <Tooltip title="Event" placement="bottom">
              <LinkTab icon={<EventIcon />} href="/events" />
            </Tooltip>
            <Tooltip title="Calendar" placement="bottom">
              <LinkTab icon={<CalendarIcon />} href="/calendar" />
            </Tooltip>
            <Tooltip title="Contact" placement="bottom">
              <LinkTab icon={<ContactIcon />} href="/contact" />
            </Tooltip>
            <Tooltip title="Suggest An Event" placement="bottom">
              <LinkTab icon={<InspirationIcon />} href="/noidea" />
            </Tooltip>
            <Tooltip title="IOU" placement="bottom">
              <LinkTab 
                label={
                  <Badge color="secondary"
                    badgeContent={IOUCount}
                    className="homenavbarBadge"
                    href="/payments"
                  >
                    <MoneyIcon />
                  </Badge>
                }
              />
            </Tooltip>
          </Tabs>
        </AppBar>
        {value === 0 && <TabContainer> <UserEventsList authUser={authUser} firebase={firebase} /> </TabContainer>}
        {value === 1 && <TabContainer> <CalendarRoot authUser={authUser} firebase={firebase} /> </TabContainer>}
        {value === 2 && <TabContainer> <ContactList authUser={authUser} firebase={firebase} /> </TabContainer>}
        {value === 3 && <TabContainer> <EventSuggestions /> </TabContainer>}
        {value === 4 && 
          <TabContainer>
            <Payment 
              authUser={authUser} 
              firebase={firebase}
              theirDebt={theirDebt}
              yourDebt={yourDebt}
              loading={loading}
            /> 
          </TabContainer>
        }
      </div>
    );
  }
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