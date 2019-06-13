import React from 'react';
import { withRouter } from 'react-router-dom';

import AuthUserContext from './context';
import { withFirebase } from '../Firebase';
import * as ROUTES from '../../Constants/routes';

const withAuthorization = condition => Component => {
  class withAuthorization extends React.Component {
    // redirect users to sign in if they try to access a protected route while not signed in
    componentDidMount() {
      this.listener = this.props.firebase.auth.onAuthStateChanged(
        authUser => {
          if (!condition(authUser)) {
            this.props.history.push(ROUTES.LANDING); 
          }
        }
      );
    }

    componentWillUnmount() {
      this.listener();
    }

    render() {
      // wrap to ensure that protected page wont accidentally 
      // render first if authentication checking is slow
      return (
        <AuthUserContext.Consumer>
          {authUser =>
            condition(authUser) ? <Component {...this.props} /> : null
          }
        </AuthUserContext.Consumer>
      );
    }
  }

  return withRouter(withFirebase(withAuthorization));
};

export default withAuthorization;