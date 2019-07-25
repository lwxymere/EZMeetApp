import React, { Component } from 'react';

import { withFirebase } from '../Firebase';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/PersonAdd';

// need pass props firebase and authUser
class AddContactsBarBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      submitMsg: null,
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
      submitMsg: null, // reset submit message
    });
  }

  addToContacts = (friendUid, friendName, friendEmail) => {
    return this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/contacts/${friendUid}`)
      .update({
        uid: friendUid,
        name: friendName,
        email: friendEmail,
      });
  }

  handleSubmit = event => {
    // regex for valid email address
    if (!(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.state.query))) {
      this.setState({ submitMsg: "Please enter a valid email address" });
      return;
    }

    // dont allow user to add self as contact
    if (this.state.query === this.props.authUser.email) {
      this.setState({
        submitMsg: "Error: Unable to add self as a Contact",
      });
      return;
    }

    // assert this.state.query is the email of a new contact
    this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/contacts/`)
      .orderByChild('email')
      .equalTo(this.state.query)
      .once('value', snapshot => {
        if (snapshot.val()) {
          // query email has already been added as a contact
          this.setState({
            submitMsg: `${this.state.query} has already been added as a Contact`,
          });
          return;
        }
        
        this.props.firebase.db
          .ref('users')
          .orderByChild('email')
          .equalTo(this.state.query)
          .once('value', snapshot => {
            if (snapshot.val()) {
              const friendUid = Object.keys(snapshot.val())[0];
              const friendName = snapshot.child(`${friendUid}/username`).val();
              const friendEmail = this.state.query;

              this.addToContacts(friendUid, friendName, friendEmail)
                .then(() => {
                  this.setState({
                    query: "",
                    submitMsg: "Contact Successfully Added!",
                  })
                })
            } else {
              this.setState({
                submitMsg: "Email Address entered is not a registered user"
              });
            }
          })

      })
      .catch(error => {
        console.log('error', error.message);
      })
    
     event.preventDefault();
  }

  render() {
    const submitMsg = this.state.submitMsg;

    return (
      <div className="contactRootDiv">
        <div className="addContact">
          <TextField
            id="outlined-email-input"
            label="Email"
            className="addContactform"
            type="email"
            name="query"
            autoComplete="email"
            margin="dense"
            variant="outlined"
            onChange={this.handleChange}
          />
          <Button onClick={this.handleSubmit}> <AddIcon/> </Button>
        </div> 
          { submitMsg && 
          <div className="contactError"> {submitMsg} </div> } 
        </div>

      /*
      <form>
        <input
          name="query"
          type="text"
          onChange={this.handleChange}
          placeholder="Enter a Friend's Email Address"
        />
        <button onClick={this.handleSubmit}>
          Add Contact
        </button>
        { submitMsg && <span>{ submitMsg }</span>}
      </form>*/
    );
  }
}

const AddContactsBar = withFirebase(AddContactsBarBase);

export { AddContactsBar };