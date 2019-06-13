import React from 'react';

import { Link } from 'react-router-dom';

import * as ROUTES from '../../Constants/routes';

const LandingPage = () => (
  <div className="main">
    <Banner />
    <About />
    <HowTo />
    <Register />
  </div>
)

const Banner = () => (
  <header id="home" class="landing-page" >
    <div class="intro-text">
      <div class="intro-heading">EZMeet</div>
      <br />
      <div class="intro-tagline">For all your social gathering needs, <br />and more.</div>

      <div>
        <Link to={ROUTES.LOGIN}>Login with Google</Link>
      </div>
    </div>
  </header>
);

const About = () => (
  <div id="about" class="about-page">
    <div class="container">
      <u class="heading"> About </u>
      <div class="content">
        <p> Ever thanked anyone for their priorities? </p>
        <p> Getting blue-ticked over and over on whatsapp? </p>
        <p> Forgetting whether people still owe you money because of small brain? </p>
        <br /><br />
        <p> <span>EZMeet</span> might be the app for you! </p>
        { /* To add mini icons with short description of app
              main features, like in the elsa template services
              */ }
      </div>
    </div>
  </div>
);

const HowTo = () => (
  <div id="howto" class="howto-page">
    <p> Simply register/log-in to enjoy the features listed below!</p>
    <br />
    { /* Use same styling as poster to explain the steps
          but make nicer (e.g. solid bolded border, nicer 
          numbering, background design/picture)
            Text to be updated later */ }

    <img className="feature" src="https://1.bp.blogspot.com/-e2X-u08kf6M/XPZytkXTIGI/AAAAAAAADeE/D3IdpRCs9_cTNPra-iG7REahCp5JjYOTgCLcBGAs/s640/Capture.JPG"
      width="500vw"
      alt="Features"
      padding="20vw" />

  </div>
);

const Register = () => (
  <div id="register" className="page2">
    Register Now!
  </div>
);

export default LandingPage;