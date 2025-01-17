import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// production config will be different, rmb to update .env when deploying
const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
    this.db = app.database();

    this.googleProvider = new app.auth.GoogleAuthProvider();
  }

  /* ----- Auth API ----- */

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider);
    //this.auth.signInWithRedirect(this.googleProvider);

  doSignOut = () => 
    this.auth.signOut();

  /* ----- User API ----- */

  user = uid => this.db.ref(`users/${uid}`);

  users = () => this.db.ref('users');
}

export default Firebase;