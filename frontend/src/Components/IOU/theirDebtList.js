import React from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DeleteIcon from "@material-ui/icons/Done";

import { withFirebase } from '../Firebase';

class TheirDebt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Tdebts: [],
      loading: false,
      eventsDetails: [],
      eventIDs: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getTdebt();
  }


  getTdebt() {
    var promises = [];
    this.getEventIDs().then(data => {
      //console.log(this.state.eventIDs);
      //this.state.eventIDs.forEach(id => {
      for (let id of this.state.eventIDs) { 
        //console.log(id);
        const promise = this.props.firebase.db
          .ref(`events/${id}/IOU`)
          .once('value');
        promises.push(promise);
      };
      // ensure all API calls are completed before proceeding
      return Promise.all(promises);
    }).then(snapshots => {
      var Tdebts = [];
      snapshots.forEach(snapshot => {
        var eventDetails = snapshot.child(`${this.props.authUser.uid}`).val();
        //console.log(eventDetails);
        if (eventDetails) {
          if (eventDetails.eventDetail !== undefined) {
            var temp=this.state.eventsDetails;
            temp.push(eventDetails.eventDetail);
            //console.log(temp);
            this.setState ({ eventsDetails: temp });
            delete eventDetails.eventDetail;
          }
          Tdebts.push(eventDetails);
        }
      });
      this.setState({ Tdebts: Tdebts, loading: false });
    });
  }

  getEventIDs() {
    return this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/events`)
      .once('value', snapshot => {
        if (snapshot.val()) {
        const eventIDs = Object.keys(snapshot.val()).map(key => key);
        this.setState({ eventIDs: eventIDs });
        }
      })
      .catch(error => {
        this.setState({ error });
      });
    }
  
  /*
  componentWillUnmount() {
    this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/contacts`)
      .off();
  }*/

  render() {
    const { Tdebts, loading, eventsDetails } = this.state;

    return (
      <div className="contentRootDiv">
        <Paper className="contentcss">
        <Typography component="div" className="paymentPaper">
          <Box className="contentTitle" fontSize="h4.fontSize">
            Their Debt
          </Box>
          <TDebts 
            firebase={this.props.firebase} 
            authUser={this.props.authUser}
            Tdebts={Tdebts} 
            eventsDetails={eventsDetails}
            loading={loading}
          />
        </Typography>
        </Paper>
      </div>
    );
  }
}

const TDebts = ({ firebase, Tdebts, loading, eventsDetails, authUser }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="nothingorLoading">Loading Debts...</p>}
      </div>
    );
  } else if (Tdebts.length === 0) {
    return ( 
      <div className="nothingorLoading"> All debts are cleared by others. </div>
    )
  } else { // render user events

    var allPayments = [];
    for (let num in Tdebts) {
      var eachPayment = [];
      //if (num !== '0') { 
        //alert(num);
        //list.push( <Divider /> )};

      console.log(Tdebts[num]);
      console.log(eventsDetails[num]);
      eachPayment.push(
        <div className="paymentTitle"> Event: {eventsDetails[num].eventName} </div> 
      )
      for (let name in Tdebts[num]) {
        console.log(name);
        eachPayment.push(
          <div className="paymentContent"> 
          <div className="paymentContent"> { name }: {Tdebts[num][name]} </div> 
          
          <DeleteDebtButton
          eventID = {eventsDetails[num].eventID}
          authUser={authUser}
          firebase={firebase}
          eventsDetails={name}/>
          </div>
        )
      }
      allPayments.push(
        <div className="theirPayment"> { eachPayment } </div>
      )
    }

    return (
      <div className="allPayment">
        { allPayments }
      </div>
    );
  }
};

const DeleteDebtButton = ({ eventID, authUser, firebase, eventsDetails }) => (
  <Tooltip title="Settled" placement="top">
    <Button
      className="deleteButton"
      onClick={() => {
        const msg = "Repaid?";

        if (window.confirm(msg)) {
          var size = 5;
          firebase.db.ref(`events/${eventID}/IOU/${authUser.uid}`).once('value')
          .then(snapshot => {
            console.log(snapshot.val());
            size = Object.keys(snapshot.val()).length;
            console.log(size);

            var updates = {};
            if (size === 2) {
              updates[`events/${eventID}/IOU/${authUser.uid}`] = null;
            } else {
              updates[`events/${eventID}/IOU/${authUser.uid}/${eventsDetails}`] = null;
            }
            firebase.db.ref().update(updates)
            .catch(error => console.log(error));
          });

        }
      }
      }> <DeleteIcon /> </Button>
  </Tooltip>
);


export default withFirebase(TheirDebt);