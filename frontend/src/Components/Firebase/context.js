import React from 'react';

/* This creates 2 components (FirebaseContext.Provider & FirebaseContext.Consumer)
 * .Provider is used to provide a firebase instance once at the top level of the
 * React component tree (used in the main src/index.js rendering)
 * .Consumer is used to retrieve this firebase instance for any component that needs it
 */
const FirebaseContext = React.createContext(null);

// Higher order component - with in front of name is a naming convention
export const withFirebase = Component => props => (
  <FirebaseContext.Consumer>
    {firebase => <Component {...props} firebase={firebase} />}
  </FirebaseContext.Consumer>
);

export default FirebaseContext;