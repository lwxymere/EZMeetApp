import React from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DeleteIcon from "@material-ui/icons/Done";

import { withFirebase } from '../Firebase';

class YourDebt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Ydebts: [],
      userIDs: [],
      loading: false,
      eventsDetails: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getYdebt();
  }

  getYdebt() {
    var promises = [];
    this.getEventIDs().then(data => {
      //console.log(this.state.eventIDs);
      //this.state.eventIDs.forEach(id => {
      if (!this.state.eventIDs) return; // no event IDs found

      for (let id of this.state.eventIDs) { 
        const promise = this.props.firebase.db
          .ref(`events/${id}/IOU`)
          .once('value');
        promises.push(promise);
      };
      // ensure all API calls are completed before proceeding
      return Promise.all(promises);
    }).then(snapshots => {
      if (!snapshots) { // no snapshots found
        this.setState({ loading: false });
        return;
      }

      var Ydebts = [];
      var userIDs = [];
      snapshots.forEach(snapshot => {
        //console.log(snapshot.val());
        if (snapshot.val()) {
          snapshot.forEach(childSnapshot => {
            var eventDetails = childSnapshot.val();
            //console.log(infos);
            //console.log(childSnapshot.key);
            userIDs.push( childSnapshot.key );

            if(childSnapshot.key !== (`${this.props.authUser.uid}`)) {
              childSnapshot.forEach(childInfo => {
                if (childInfo.key !== (`${this.props.authUser.displayName}`) || 
                    childInfo.key === ('eventDetail')) return;
                //console.log(childInfo.key);
                console.log(this.state.eventsDetails);
                Ydebts.push( {[eventDetails.eventDetail.name]: childInfo.val()} );
              });
            }
            
            if (eventDetails.eventDetail !== undefined) { 
              var temp=this.state.eventsDetails;
              temp.push(eventDetails.eventDetail);
              this.setState ({ eventsDetails: temp });
              delete eventDetails.eventDetail;
            }
          });
        }
      });
      this.setState({ Ydebts: Ydebts, userIDs: userIDs, loading: false });
    });
  }

  // gets event IDs from user node in database, and stores IDs in state
  // returns a Promise
  getEventIDs() {
    return this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/events`)
      .once('value', snapshot => {
        if (!snapshot.val()) return; // band-aid fix for no events
        const eventIDs = Object.keys(snapshot.val()).map(key => key);
        this.setState({ eventIDs: eventIDs });
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
    const { Ydebts, loading, userIDs, eventsDetails } = this.state;

    return (
      <div className="contentRootDiv">
        <Paper className="contentcss">
        <Typography component="div" className="paymentPaper">
          <Box className="contentTitle" fontSize="h4.fontSize">
            Your Debt
          </Box>
          <YDebts 
            className="Debts"
            firebase={this.props.firebase}
            authUser={this.props.authUser}
            Ydebts={Ydebts} 
            userIDs={userIDs}
            eventsDetails={eventsDetails}
            loading={loading}
          />
        </Typography>
        </Paper>
      </div>
    );
  }
}

const YDebts = ({ firebase, Ydebts, loading, userIDs, authUser, eventsDetails }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="nothingorLoading">Loading Debts...</p>}
      </div>
    );
  } else if (Ydebts.length === 0) {
    return (
      <div className="nothingorLoading"> You cleared all outstanding debts. </div>
    );
  } else { // render user events

    var allPayment = [];

    //So apparently theres no way to put in parents - this is supp to be illegal as well but who cares
    for (let num in Ydebts) {
      var eachPayment = [];
      //if (num !== '0') { 
        //alert(num);
        //eachPayment.push( <Divider /> )};

        console.log(Ydebts);
        console.log(Ydebts[num]);
        console.log(eventsDetails);
      eachPayment.push(
        <div className="paymentTitle"> Event: {eventsDetails[num].eventName} </div> 
      )
      for (let name in Ydebts[num]) {
        eachPayment.push( 
            <div className="paymentContent"> 
            <div className="paymentContent"> { name }: {Ydebts[num][name]} </div> 
        
            <DeleteDebtButton
            eventID = {eventsDetails[num].eventID}
            authUser={authUser}
            firebase={firebase}
            eventsDetails={name}
            userID={userIDs[num]}
            />
            </div>
        )
      }
      allPayment.push(
        <div className="yourPayment"> { eachPayment } </div>
      )
    }

    return (
      <div className="allPayment">
        { allPayment }
      </div>
    );
  }
};

const DeleteDebtButton = ({ eventID, authUser, userID, firebase, eventsDetails, num }) => (
  <Tooltip title="Settled" placement="top">
    <Button
      className="deleteButton"
      onClick={() => {
        const msg = "Repaid?";

        console.log(userID);
        console.log(eventID);
        console.log(eventsDetails);

        if (window.confirm(msg)) {
          var size = 5;
          firebase.db.ref(`events/${eventID}/IOU/${userID}`).once('value')
          .then(snapshot => {
            //console.log(snapshot.val());
            size = Object.keys(snapshot.val()).length;
            //console.log(size);

            var updates = {};
            if (size === 2) {
              updates[`events/${eventID}/IOU/${userID}`] = null;
            } else {
              updates[`events/${eventID}/IOU/${userID}/${eventsDetails}`] = null;
            }
            firebase.db.ref().update(updates)
            .catch(error => console.log(error));
          });

        }
      }
      }> <DeleteIcon /> </Button>
  </Tooltip>
);

export default withFirebase(YourDebt);