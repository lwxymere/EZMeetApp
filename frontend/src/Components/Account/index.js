import React from 'react';

import LogoutButton from '../Logout';
import { AuthUserContext, withAuthorization } from '../Session';

const AccountPage = () => (
  <div className="main">
    <AuthUserContext.Consumer>
      {authUser => (
        <div>
          <h1>Account: {authUser.email}</h1>
          <span>Welcome, {authUser.displayName}</span>
          <LogoutButton />
        </div>
      )}
    </AuthUserContext.Consumer>
  </div >
)

const condition = authUser => !!authUser; // !!authUser is equivalent to (authUser != null)

export default withAuthorization(condition)(AccountPage);