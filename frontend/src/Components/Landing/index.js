import React from "react";

import { SignInGoogle } from "../Login";

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import PeopleIcon from "@material-ui/icons/People";
import LinkIcon from "@material-ui/icons/Link";
import CalendarIcon from "@material-ui/icons/CalendarToday";
import MoneyIcon from "@material-ui/icons/AttachMoney";
import EventIcon from "@material-ui/icons/EventAvailable";

import ReactPlayer from "react-player";

const LandingPage = () => (
  <Container className="mainbody">
    <TitleBar />
    <About />
    <HowTo />
  </Container>
)

const TitleBar = () => {
  return (
    <div className="titleRootDiv">
      <AppBar className="bar" position="static">
        <Toolbar>
          <PeopleIcon />
          <Typography variant="h6" className="titlebarText">
            EZMeet
          </Typography>

          <SignInGoogle />

        </Toolbar>
        <Banner />
      </AppBar>
    </div>
  );
};

const Banner = () => {
  return (
  <div className="bannerRootDiv">
    <Typography component="div">
      <Box className="bannerTitle" fontSize="h3.fontSize">
        EZMeet
      </Box>
      <Box className="bannerText" fontSize="h5.fontSize">
        For all your social gathering needs and more.
      </Box>
    </Typography>
  </div>
)};

const About = () => {
  return (
    <Container className="aboutRootDiv" maxWidth="sm">
      <Card className="aboutCard">
        <CardHeader className="aboutTitle" title="Connect" />
        <Divider />
        <div className="icon">
          {" "}
          <LinkIcon className="iconIcon" />{" "}
        </div>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p" className='aboutText'>
            Connect easily with your friends by planning events to go out with
            them. Organising events have never been easier.
          </Typography>
        </CardContent>
      </Card>
      <Card className="aboutCard">
        <CardHeader className="aboutTitle" title="Calendar" />
        <Divider />
        <div className="icon">
          <CalendarIcon className="iconIcon" />
        </div>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p" className='aboutText'>
            Keep track of when you are available for events and update them
            automatically on your account.
          </Typography>
        </CardContent>
      </Card>
      <Card className="aboutCard">
        <CardHeader className="aboutTitle" title="IOU" />
        <Divider />
        <div className="icon">
          {" "}
          <MoneyIcon className="iconIcon" />
        </div>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p" className='aboutText'>
            Record loans after events and resolve them later at your own
            convenience
          </Typography>
        </CardContent>
      </Card>
      <Card className="aboutCard">
        <CardHeader className="aboutTitle" title="Events" />
        <Divider />
        <div className="icon">
          <EventIcon className="iconIcon" />{" "}
        </div>
        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p" className='aboutText'>
            Get suggestions for upcoming and exciting activities/promotions to
            do something new once in a while.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

const HowTo = () => {
  return (
    <Container className="howtoRootDiv" maxWidth="sm">
      <Typography component="div">
        <Box className="howtoTitle" fontSize="h5.fontSize"> 
          How to use
        </Box>
      </Typography>

      <div className="howtoVideo">
        <ReactPlayer
          className="react-player"
          url="https://youtu.be/HYJlleaKkVI"
          controls="true"
        />
      </div>
    </Container>
  );
};

export default LandingPage;