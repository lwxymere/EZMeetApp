import React from 'react';

import { withAuthorization } from '../Session';

const HomePage = () => (
  <div className="main">
    <h1>Land here after login</h1>
    <p>Only accessible if logged in</p>
  </div>
);

const condition = authUser => !!authUser;

export default withAuthorization(condition)(HomePage);