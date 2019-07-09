import React from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import { withFirebase } from '../Firebase';

class YourDebt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Ydebts: [],
      loading: false,
      info: [],
    };
  }

  componentDidMount() {
    this.setState({ loading: true });
    this.getYdebt();
  }

  getYdebt() {
    var promises = [];
    this.getEventIDs().then(data => {
      for (let id in this.state.eventIDs) { 
        const promise = this.props.firebase.db
          .ref(`events/${id}/IOU`)
          .once('value');
        promises.push(promise);
      };
      // ensure all API calls are completed before proceeding
      return Promise.all(promises);
    }).then(snapshots => {
      var Ydebts = [];
      snapshots.forEach(snapshot => {
        if (snapshot.val()) {
          snapshot.forEach(childSnapshot => {
            var infos = childSnapshot.val();
            if (childSnapshot.val()['info'] !== undefined) { 
              var temp=this.state.info;
              temp.push(infos['info']);
              this.setState ({ info: temp });
              delete infos.info;
            }
            if(childSnapshot.key === (`${this.props.authUser.uid}`)) return;
            else { 
              childSnapshot.forEach(childInfo => {
                if (childInfo.key === (`${this.props.authUser.displayName}`) || 
                    childInfo.key === ('info')) return;
                console.log(childInfo.key);
                console.log(childInfo.val());
                console.log(childSnapshot.key);
                Ydebts.push( {[this.state.info.name]: childInfo.val()} );
              });
            }});
          }
        });
        this.setState({ Ydebts: Ydebts, loading: false });
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
    const { Ydebts, loading, eventIDs, info } = this.state;

    return (
      <div className="contentRootDiv">
        <Paper className="contentcss">
        <Typography component="div">
          <Box className="contentTitle" fontSize="h4.fontSize">
            Your Debt
          </Box>
            <YDebts 
              className="Debts"
              firebase={this.props.firebase} 
              Ydebts={Ydebts} 
              loading={loading}
              eventIDs={eventIDs}
              authUser={this.props.authUser}
              info={info}
            />
        </Typography>
        </Paper>
      </div>
    );
  }
}

const YDebts = ({ firebase, Ydebts, loading, eventIDs, authUser, info }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="noEventorLoading">Loading Debts...</p>}
      </div>
    );
  } else if (Ydebts.length === 0) {
    return (
      <div className="nothingorLoading"> Great job! You don't owe anyone any debt. </div>
    );
  } else { // render user events

    var allPayment = [];
    //console.log(Tdebts[0]["Ez Meet"]);

    //So apparently theres no way to put in parents - this is supp to be illegal as well but who cares
    for (let num in Ydebts) {
      var eachPayment = [];
      if (num !== '0') { 
        //alert(num);
        eachPayment.push( <Divider /> )
      };
      eachPayment.push(
        <div className="paymentTitle"> Event: {info[num].event} </div> 
      )
      for (let name in Ydebts[num]) {
        eachPayment.push( 
            <div className="paymentContent"> { info[num].name }: {Ydebts[num][name]} </div> 
        )
      }
      allPayment.push(
        <div className="yourPayment"> {eachPayment} </div>
      )
    }

    return (
      <div className="allPayment">
        { allPayment }
      </div>
    );
  }
};


export default withFirebase(YourDebt);