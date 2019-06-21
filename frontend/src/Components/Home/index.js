import React, { Fragment } from "react";

import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import PeopleIcon from "@material-ui/icons/People";
import PropTypes from 'prop-types';

import { AuthUserContext, withAuthorization } from '../Session';
import LogoutButton from '../Logout';
import { UserEventsList, CreateEventForm } from '../Events';

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
const Profile = ({ authUser }) => {
  return (
    <div className="homeRootDiv">
      <AppBar className="contentBar" position="static">
        <Toolbar>
        <Typography className="contentDetails">
          <Avatar  className="contentAvatar">
            {authUser.displayName[0]}
          </Avatar>
          <div className="ContentText">
           <div> Welcome, </div>
           <div> {authUser.displayName} </div>
          </div>
        </Typography>
        <Button className="contentNewEvent">
          <CreateEventForm authUser={authUser}/>
        </Button>        
        </Toolbar>
      </AppBar>
    </div>
  );
};

/* For the Blue Tabs */
function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
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

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

const HomeNavBar = ({ authUser }) => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (
     <div className={classes.root}>
      <AppBar position="static">
        <Tabs variant="fullWidth" value={value} onChange={handleChange}>
          <LinkTab label="Events" href="/events" />
          <LinkTab label="Calendar" href="/calendar" />
          <LinkTab label="Suggest an Event" href="/noidea" />
          <LinkTab label="IOU" href="/iou" />
        </Tabs>
      </AppBar>
      {value === 0 && <TabContainer> <UserEventsList authUser={authUser}/> </TabContainer>}
      {value === 1 && <TabContainer> Google Calendar </TabContainer>}
      {value === 2 && <TabContainer> EventBrite API Soontm </TabContainer>}
      {value === 3 && <TabContainer> O$P$ </TabContainer>}
    </div>
  );
}

const HomePage = () => {
  return (
    <Container className="mainbody"> 
      <AuthUserContext.Consumer>
        {authUser => (
          <Fragment>
            <TitleBar />
            <Profile authUser={authUser} />
            <HomeNavBar authUser={authUser} />
          </Fragment>
        )}
      </AuthUserContext.Consumer>
    </Container>
  )
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);