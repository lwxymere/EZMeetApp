import React, { Fragment } from "react";

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

import PeopleIcon from "@material-ui/icons/People";
import EventIcon from "@material-ui/icons/Event";
import CalendarIcon from "@material-ui/icons/CalendarToday";
import InspirationIcon from "@material-ui/icons/Whatshot";
import MoneyIcon from "@material-ui/icons/Money";

import PropTypes from 'prop-types';

import { AuthUserContext, withAuthorization } from '../Session';
import LogoutButton from '../Logout';
import { UserEventsList, CreateEventForm } from '../Events';
import { Badge } from "@material-ui/core";

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

const Profile = ({ authUser }) => {
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
            <StyledMenuItem>
              <ListItemText primary="Help" />
            </StyledMenuItem>
            <StyledMenuItem>
              <ListItemText primary="Help again" />
            </StyledMenuItem>
            <StyledMenuItem>
              <ListItemText primary="Help more" />
            </StyledMenuItem>
          </StyledMenu>

          <div className="profileText">
           <div> Welcome, </div>
           <div> {authUser.displayName} </div>
          </div>
        </Typography>
        
        
        <Button className="profileNewEvent">
          <CreateEventForm authUser={authUser}/>
        </Button>        
        </Toolbar>
      </AppBar>
    </div>
  );
};

/* For the Blue Tabs */
/* I'll clean up this inline styling too when there's more time */
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
          <Tooltip title="Inspirations" placement="bottom">
            <LinkTab icon={<InspirationIcon />} href="/noidea" />
          </Tooltip>
          <Tooltip title="IOU" placement="bottom">
            <LinkTab icon={<MoneyIcon />} href="/iou" />
          </Tooltip>
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