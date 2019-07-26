import React from 'react';

import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DeleteIcon from "@material-ui/icons/Done";

import { withStyles } from '@material-ui/core/styles';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const YourDebt = ({ authUser, firebase, yourDebt, loading }) => {

  var debts = [];
  // each loop iteration gives all the debts for a single friendID
  for (let friendID in yourDebt) {
    var debtList = Object.values(yourDebt[friendID]); // array of debt objects
    var totalDebt = 0;
    var myCurrentDebt = [];

    for (let debt of debtList) {
      totalDebt += +debt.amount; // + is a unary operator to convert string to int
      myCurrentDebt.push(debt);
    }

    if (totalDebt % 1 !== 0) { // got cents in the debt
      totalDebt = totalDebt.toFixed(2); // force cents to 2 d.p.
    }

    debts.push({
      total: totalDebt,
      name: debtList[0].name,
      breakdown: myCurrentDebt,
    });
  }

  return (
    <div className="contentRootDiv">
      <Paper className="contentcss">
        <Typography component="div" className="paymentPaper">
          <Box className="contentTitle" fontSize="h4.fontSize">
            Paying
          </Box>
          <YDebts
            firebase={firebase}
            authUser={authUser}
            allDebts={debts}
            loading={loading}
          />
        </Typography>
      </Paper>
    </div>
  );
}

/** ------------------- YDebts ---------------------- **/
const ExpansionPanel = withStyles({
  root: {
    border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    backgroundColor: 'rgba(255, 0, 0, .25)',
    borderBottom: '1px solid rgba(0, 0, 0, .125)',
    marginBottom: -1,
    minHeight: 56,
    '&$expanded': {
      minHeight: 56,
    },
  },
  content: {
    '&$expanded': {
      margin: '12px 0',
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiExpansionPanelDetails);

const YDebts = ({ firebase, authUser, allDebts, loading }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="nothingorLoading">Loading Debts...</p>}
      </div>
    );
  } else if (allDebts.length === 0) {
    return (
      <div className="nothingorLoading"> You do not have any outstanding debts. </div>
    );
  } else { // render user events
    return (
      <div className="allPayment">
        {allDebts.map(friendDebts => (
          <div className="payment" key={friendDebts.breakdown[0].uid}>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={
                  <Tooltip title="View Breakdown" placement="top">
                    <ExpandMoreIcon />
                  </Tooltip>
                }
                aria-controls="panel1c-content"
                id="panel1c-header"
              >
                <div className="paymentContent">
                  <Typography>{friendDebts.name}: ${friendDebts.total}</Typography>
                </div>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className="debtBreakdown">
                {friendDebts.breakdown.map(debt => (
                  <div className="paymentContent" key={debt.debtID}>
                    <Typography variant="body2" component="div" className="debtDetails">
                      • {debt.details} - ${debt.amount}
                    </Typography>
                    <DeleteDebtButton
                      authUser={authUser}
                      firebase={firebase}
                      debtDetails={debt}
                    />
                  </div>
                ))}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </div>
        ))}
      </div>
    );
  }
};

// maybe send some kind of notification if this guy deletes the debt
const DeleteDebtButton = ({ authUser, firebase, debtDetails }) => (
  <Tooltip title="Settled" placement="top">
    <Button
      className="resolvedButton"
      onClick={() => {
        const msg = "Repaid?";

        if (window.confirm(msg)) {
          var updates = {};
          // delete debt for self
          updates[`users/${authUser.uid}/IOU/myDebt/${debtDetails.uid}/${debtDetails.debtID}`] = null;
          // delete debt for friend
          updates[`users/${debtDetails.uid}/IOU/theirDebt/${authUser.uid}/${debtDetails.debtID}`] = null;
          // send notification to friend to say debt cleared
          // append 'debt' to the debt id to differentiate from event invite notifications for the same event id
          updates[`users/${debtDetails.uid}/notifications/${debtDetails.debtID + "debt"}`] = {
            id: debtDetails.debtID,
            debtDetails: `${authUser.displayName} has cleared a debt of $${debtDetails.amount}`,
            eventDetails: debtDetails.details,
            type: "debt",
          };

          firebase.db.ref().update(updates)
            .catch(error => console.log(error));
        }
      }
      }> <DeleteIcon /> </Button>
  </Tooltip>
);

export default YourDebt;