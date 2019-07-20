import React, { Children } from 'react';

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
import { Divider } from '@material-ui/core';

const TheirDebt = ({ authUser, firebase, theirDebt, loading }) => {
  
  var debts = [];
  // each loop iteration gives all the debts for a single friendID
  for (let friendID in theirDebt) {
    var debtList = Object.values(theirDebt[friendID]); // array of debt objects
    var totalDebt = 0;
    var currentFriendsDebts = [];

    for (let debt of debtList) {
      totalDebt += +debt.amount; // + is a unary operator to convert string to int
      currentFriendsDebts.push(debt);
    }

    debts.push({
      total: totalDebt,
      name: debtList[0].name,
      breakdown: currentFriendsDebts,
    })
  }

  return (
    <div className="contentRootDiv">
      <Paper className="contentcss">
        <Typography component="div" className="paymentPaper">
          <Box className="contentTitle" fontSize="h4.fontSize">
            Their Debt
          </Box>
          <TDebts
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
    backgroundColor: 'rgba(0, 0, 255, .25)',
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

const TDebts = ({ firebase, allDebts, loading, authUser }) => {
  if (loading) { // loading from database
    return (
      <div>
        {loading && <p className="nothingorLoading">Loading Debts...</p>}
      </div>
    );
  } else if (allDebts.length === 0) {
    return ( 
      <div className="nothingorLoading"> All debts are cleared by others. </div>
    )
  } else { // render friend's debts

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
                    •  {debt.details} - ${debt.amount}
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
    )
  }
};

const DeleteDebtButton = ({ authUser, firebase, debtDetails }) => (
  <Tooltip title="Settled" placement="top">
    <Button
      className="resolvedButton"
      onClick={() => {
        const msg = "Repaid?";

        if (window.confirm(msg)) {
          var updates = {};
          // delete debt for self
          updates[`users/${authUser.uid}/IOU/theirDebt/${debtDetails.uid}/${debtDetails.debtID}`] = null;
          // delete debt for friend
          updates[`users/${debtDetails.uid}/IOU/myDebt/${authUser.uid}/${debtDetails.debtID}`] = null;

          firebase.db.ref().update(updates)
            .catch(error => console.log(error));
        }
      }
      }> <DeleteIcon /> </Button>
  </Tooltip>
);

export default TheirDebt;