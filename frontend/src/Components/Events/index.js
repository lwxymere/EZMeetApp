import React from 'react';

import { withAuthorization } from '../Session';

const EventPage = () => (
  <div className="main">
    <h1>Manage Events Here</h1>
    <p>Only accessible if logged in</p>
  </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(EventPage);