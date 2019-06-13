import React from 'react';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from "react-scroll";

import * as ROUTES from '../../Constants/routes';

import { AuthUserContext } from '../Session';

const Navigation = ({ authUser }) => (
  <AuthUserContext.Consumer>
    {authUser => 
      authUser
      ? <NavigationAuth />
      : <NavigationNonAuth />
     }
  </AuthUserContext.Consumer>
);

const NavigationNonAuth = () => (
  <div id="nav" class="sidenav">
    <ScrollLink
      activeClass="active"
      to="home"
      spy={true}
      smooth={true}
      offset={0}
      duration={500}
    > Home
        </ScrollLink>

    <ScrollLink
      activeClass="active"
      to="about"
      spy={true}
      smooth={true}
      offset={2}
      duration={500}
    > About
        </ScrollLink>

    <ScrollLink
      activeClass="active"
      to="howto"
      spy={true}
      smooth={true}
      offset={2}
      duration={500}
    > How to Use
        </ScrollLink>

    <ScrollLink
      activeClass="active"
      to="register"
      spy={true}
      smooth={true}
      offset={2}
      duration={500}
    > Register
        </ScrollLink>

  </div>
);

const NavigationAuth = () => (
  <div id="nav" className="sidenav">
    <Link to={ROUTES.HOME}>
      Home
    </Link>
    <Link to={ROUTES.EVENTS}>
      My Events
    </Link>
    <Link to={ROUTES.ACCOUNT}>
      My Account
    </Link>
  </div>
)

export default Navigation;

/**
class Navigation extends React.Component {
  render() {
    return (
      <div id="nav" class="sidenav">
        <Link
          activeClass="active"
          to="home"
          spy={true}
          smooth={true}
          offset={0}
          duration= {500}
        > Home
        </Link>

        <Link
          activeClass="active"
          to="about"
          spy={true}
          smooth={true}
          offset={2}
          duration= {500}
        > About
        </Link>

        <Link
          activeClass="active"
          to="howto"
          spy={true}
          smooth={true}
          offset={2}
          duration= {500}
        > How to Use
        </Link>

        <Link
          activeClass="active"
          to="register"
          spy={true}
          smooth={true}
          offset={2}
          duration= {500}
        > Register
        </Link>

      </div>
    );
  }
}

export default Navigation;
 */