import React, { Component } from 'react';

import { withFirebase } from '../Firebase';

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
    this.setState({ [event.target.name]: event.target.value });
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

  // figure out how to handle adding friends one after another
  // mainly how the add friend success msg is reset
  handleSubmit = event => {
    this.props.firebase.db
      .ref('users')
      .orderByChild('email')
      .equalTo(this.state.query)
      .once('value', snapshot => {
        if (snapshot.val()) {
          const friendUid = Object.keys(snapshot.val())[0];
          this.addToContacts(friendUid, 
            snapshot.child(`${friendUid}/username`).val(), 
            this.state.query)
            .then(() => {
              this.setState({
                query: "",
                submitMsg: "Contact Successfully Added!",
              })
            })
            .catch(error => {
              console.log('error', error.message);
            });
        } else {
          this.setState({
            submitMsg: "Invalid Email Address / Email Address entered is not a registered user"
          });
        }
      })
      .catch(error => {
        console.log('error', error.message);
      })
    
     event.preventDefault();
  }

  render() {
    const submitMsg = this.state.submitMsg;

    return (
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
      </form>
    );
  }
}

const AddContactsBar = withFirebase(AddContactsBarBase);

export { AddContactsBar };