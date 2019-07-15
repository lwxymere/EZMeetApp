import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../Constants/routes';

import Button from '@material-ui/core/Button';

class LoginPageWithRedirect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.authSubscription = 
      this.props.firebase.auth
        .onAuthStateChanged(authUser => {
          this.setState({
            loading: false,
            authUser,
          });
          if (authUser) { // redirect to home after login
            this.props.history.push(ROUTES.HOME);
          }
        });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  render() {
    if (this.state.loading) { // loading
      return (
        <div className="main">
          Loading...
        </div>
      );
    } else if (this.state.user) { // user is logged in
      return <Redirect to={ROUTES.HOME} />;
    } else { // user === null, aka logged out
      return <LoginPage />;
    }
  }
}

const LoginPage = () => (
  <div class="main">
    <h1>Sign In</h1>
    <SignInGoogle />
  </div>
);

class SignInGoogleBase extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  onClick = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(authUser => {
        // update user details whenever user logs in
        var updates = {};
        updates[`users/${authUser.user.uid}/username`] = authUser.user.displayName;
        updates[`users/${authUser.user.uid}/email`] = authUser.user.email;
        console.log(updates);
        console.log(this.props.firebase);

        this.props.firebase.db.ref().update(updates)
          .then((result) => {
            this.setState({ error: null });
            this.props.history.push(ROUTES.HOME);
          })
          .catch(error => {
            console.log(error);
            this.setState({ error });
          });
      });

    event.preventDefault();
  };

  render() {
    const { error } = this.state;

    return (
      <div>
        <Button 
          onClick={this.onClick} 
          color="primary" 
          className="titlebarButton"
        >
          Login
        </Button>
        {error && <p>{error && error.message}</p>}
      </div>
    );
  }
}

const SignInGoogle = withRouter(withFirebase(SignInGoogleBase));

export default withRouter(withFirebase(LoginPageWithRedirect));

export { SignInGoogle };