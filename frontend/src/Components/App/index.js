import React from "react";
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import Navigation from '../Navigation';
import LandingPage from '../Landing';
import LoginPage from '../Login';
import HomePage from '../Home';
import EventPage from '../Events';
import AccountPage from '../Account';

import * as ROUTES from '../../Constants/routes';
import { withAuthentication } from '../Session';

import "./App.css";

/** Yet-to-Implement:
 * appropriate background picture for LandingPage
 * appropriate background (picture / colour) for AboutPage
 * make HowtoPage nicer but idk how that thing works
 * Everything about RegisterPage
 */

const App = () => (
  <Router>
    <Navigation /> { /* To change render based on user status */}

    <Route exact path={ROUTES.LANDING} component={LandingPage} />
    <Route exact path={ROUTES.LOGIN} component={LoginPage} />
    <Route exact path={ROUTES.HOME} component={HomePage} />
    <Route path={ROUTES.EVENTS} component={EventPage} />
    <Route exact path={ROUTES.ACCOUNT} component={AccountPage} />

  </Router>
);

export default withAuthentication(App);
