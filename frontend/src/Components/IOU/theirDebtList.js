import React from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DeleteIcon from "@material-ui/icons/Delete";

import { withFirebase } from '../Firebase';

class TheirDebt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Tdebts: [],
      loading: false,
      info: [],
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
      console.log(this.state.eventIDs);
      //this.state.eventIDs.forEach(id => {
      for (let id in this.state.eventIDs) { 
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
        var infos = snapshot.child(`${this.props.authUser.uid}`).val();
        console.log(snapshot.val());
        if (snapshot.val()) {
          console.log(infos);
          if (infos['info'] !== undefined) {
            var temp=this.state.info;
            temp.push(infos['info']);
            this.setState ({ info: temp });
            delete infos.info;
          }
          Tdebts.push(infos);
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
        console.log(this.state.eventIDs);
      })
      .catch(error => {
        this.setState({ error });
      });
    }
  /*
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
  }*/
  
  /*
  componentWillUnmount() {
    this.props.firebase.db
      .ref(`users/${this.props.authUser.uid}/contacts`)
      .off();
  }*/

  render() {
    const { Tdebts, loading, eventIDs, info } = this.state;

    return (
      <div className="contentRootDiv">
        <Paper className="contentcss">
        <Typography component="div">
          <Box className="contentTitle" fontSize="h4.fontSize">
            Their Debt
          </Box>
            <TDebts 
              firebase={this.props.firebase} 
              authUser={this.props.authUser}
              Tdebts={Tdebts} 
              loading={loading}
              eventIDs={eventIDs}
              info={info}
            />
        </Typography>
        </Paper>
      </div>
    );
  }
}

const TDebts = ({ firebase, Tdebts, loading, eventIDs, info, authUser }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="noEventorLoading">Loading Debts...</p>}
      </div>
    );
  } else if (Tdebts.length === 0) {
    return ( 
      <div className="nothingorLoading"> There is no debts others owe you. </div>
    )
  } else { // render user events

    var allPayments = [];

    for (let num in Tdebts) {
      var eachPayment = [];
      //if (num !== '0') { 
        //alert(num);
        //list.push( <Divider /> )};

      // console.log(num);
      eachPayment.push(
        <div className="paymentTitle"> Event: {info[num].event} </div> 
      )
      for (let name in Tdebts[num]) {
        // console.log(Tdebts[num][name]);
        eachPayment.push(
          <div className="paymentContent"> 
          <div className="paymentContent"> { info[num].name }: {Tdebts[num][name]} </div> 
          <DeleteDebtButton 
          eventID = {eventIDs[num]}
          authUser={authUser}
          firebase={firebase}
          info={info[num].name}/>
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


const DeleteDebtButton = ({ eventID, authUser, firebase, info }) => (
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
              updates[`events/${eventID}/IOU/${authUser.uid}/${info}`] = null;
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