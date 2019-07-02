import React from 'react';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add"

import { withFirebase } from '../Firebase';

class ContactList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getContacts();
  }

  getContacts() {
    return this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/contacts`)
      .on('value', snapshot => {
        if (snapshot.val()) {
          const contactIds = Object.keys(snapshot.val()).map(key => key);
          var contacts = [];
          for (let id of contactIds) {
            contacts.push(snapshot.child(`${id}`).val());
          }
          this.setState({ contacts: contacts });
        }
        this.setState({ loading: false });
      });
  }
  
  componentWillUnmount() {
    this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/contacts`)
      .off();
  }

  render() {
    const { contacts, loading } = this.state;

    return (
      <div className="eventRootDiv">
        <Paper className="contentcss">
        <Typography component="div">
          <Box className="eventTitle" fontSize="h4.fontSize">
            My Contacts
          </Box>
            <Contacts 
              firebase={this.props.firebase} 
              contacts={contacts} 
              loading={loading}
              authUser={this.props.authUser}
              eventData={this.props.eventData}
            />
        </Typography>
        </Paper>
      </div>
    );
  }
}

const Contacts = ({ firebase, contacts, loading, authUser, eventData }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="noEventorLoading">Loading Contacts...</p>}
      </div>
    );
  } else if (contacts.length === 0) {
    return null;
  } else { // render user events
    return (
      <ol className="eventListed">
        {contacts.map(contact => (
          <li key={contact.uid}>
            <div>
              <strong>Name:  {contact.name}</strong>
              {eventData ?
              <InviteContactButton 
                contact={contact}
                eventData={eventData}
                sender={authUser.displayName}
                firebase={firebase}
              /> :
              <DeleteContactButton 
                userID={authUser.uid}
                contactID={contact.uid}
                firebase={firebase}
              />
              }
              <br />
              <strong>Email: {contact.email}</strong>
              <br />
            </div>
          </li>
        ))}
      </ol>
    );
  }
};

const DeleteContactButton = ({ userID, contactID, firebase }) => (
  <Tooltip title="Delete Contact" placement="top">
    <Button
      className="deleteButton"
      onClick={() => {
        const msg = "Delete Contact?";
        if (window.confirm(msg)) {
          var updates = {};
          updates[`users/${userID}/contacts/${contactID}`] = null;
          firebase.db.ref().update(updates)
            .catch(error => console.log(error));
        }
      }
      }> <DeleteIcon /> </Button>
  </Tooltip>
);

const InviteContactButton = ({ contact, eventData, sender, firebase }) => (
  <Tooltip title="Send Invite" placement="top">
    <Button
      onClick={() => {
        const extendedEventData = { sender: sender, ...eventData };
        var updates = {};
        updates[`users/${contact.uid}/invites/${eventData.id}`] = extendedEventData;
        firebase.db.ref().update(updates)
          .then(() => alert('Invite Sent!'))
          .catch(error => console.log(error));
      }
      }> <AddIcon /> </Button>
  </Tooltip>
)

export default withFirebase(ContactList);