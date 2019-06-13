import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../Constants/routes';

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

  /*
  onSubmit = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        // create a user in firebase realtime database
        this.props.firebase
          .user(socialAuthUser.user.uid)
          .set({
            username: socialAuthUser.user.displayName,
            email: socialAuthUser.user.email,
            friends: {},
            events: {},
          })
          .then((result) => {
            this.setState({ error: null });
            this.props.history.push(ROUTES.HOME);
            console.log('result', result);
          })
          .catch(error => {
            this.setState({ error });
            console.log('error', error);
          });
      })
      .catch(error => {
        this.setState({ error });
        console.log('error', error);
      });

    event.preventDefault();
  };
  */

  onSubmit = event => {
    this.props.firebase
      .doSignInWithGoogle()
      .then(socialAuthUser => {
        this.setState({ error: null });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  }

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <button type="submit">Sign In with Google</button>
        { error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignInGoogle = withRouter(withFirebase(SignInGoogleBase));

export default withRouter(withFirebase(LoginPageWithRedirect));

export { SignInGoogle };