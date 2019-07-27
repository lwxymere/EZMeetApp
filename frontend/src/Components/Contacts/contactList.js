import React from 'react';

import { AddContactsBar } from "./addContacts";
import { withFirebase } from '../Firebase';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete";

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
      <div className="contentRootDiv">
        <Paper className="contactcss">
        <Typography component="div">
          <Box className="contentTitle" fontSize="h4.fontSize">
            My Contacts
          </Box>
          <div className="addContacts"> 
            <AddContactsBar authUser={this.props.authUser} />
          </div>
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
        {loading && <p className="nothingorLoading">Loading Contacts...</p>}
      </div>
    );
  } else if (contacts.length === 0) {
    return null;
  } else { // render user events
    return (
      <div className="contentListed">
        {contacts.map(contact => (
          <div key={contact.uid} className='contactBorder'>
            <div className='contactDetails'>
              <div className='contactDetail'> 
                <div className='contactInfo'>
                  <span className='contactU'> Name: </span>
                  {contact.name} 
                </div>
                <div className='contactInfo'> 
                  <span className='contactU'> Email: </span>
                  {contact.email}  
                </div>
              </div>
              
              <div className='contactButton'>
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
                />}
              </div>
            </div>
          </div>
        ))}
      </div>
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
        if (eventData.attendees[contact.uid]) {
          // contact is already attending the event
          alert(`${contact.name} is already attending this event!`);
        } else {
          // send invite to contact only if contact is not already attending the event
          const extendedEventData = { sender: sender, type: "event", ...eventData };
          var updates = {};
          // append 'event' to the event id to differentiate from debt notifications for the same event id
          updates[`users/${contact.uid}/notifications/${eventData.id + "event"}`] = extendedEventData;
          firebase.db.ref().update(updates)
            .then(() => alert('Invite Sent!'))
            .catch(error => console.log(error));
        }
      }
      }> <AddIcon /> </Button>
  </Tooltip>
)

export default withFirebase(ContactList);