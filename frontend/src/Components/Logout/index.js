import React from 'react';
import { Button } from "@material-ui/core";

import { withFirebase } from '../Firebase';

const LogoutButton = ({ firebase }) => (
  <Button className="titlebarButton" color="inherit" onClick={firebase.doSignOut}>
    Logout
  </Button>
);

export default withFirebase(LogoutButton)