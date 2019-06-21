import React from 'react';

import UserEvents from './eventList';
import CreateEvent from './createEvent';

import { AuthUserContext, withAuthorization } from '../Session';

const EventPage = () => (
  <div className="main">
    <AuthUserContext.Consumer>
      {authUser => (
        <div>
          <UserEvents authUser={authUser} />
          <hr />
          <CreateEvent authUser={authUser} />
        </div>
      )}
    </AuthUserContext.Consumer>
  </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(EventPage);