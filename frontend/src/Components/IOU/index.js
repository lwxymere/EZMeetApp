import React from 'react';

import YourDebt from './yourDebtList';
import TheirDebt from './theirDebtList';

import Paper from '@material-ui/core/Paper';

function isMobileDevice() {
  if(window.innerWidth <= 800 && window.innerHeight <= 600) {
    return true;
  } else {
    return false;
  }
}

const Payment = ({ authUser, firebase, theirDebt, yourDebt, loading }) => {
  return (
    <Paper className="paymentRootDiv">
      <div className="debt">
        <YourDebt 
          authUser={authUser}
          firebase={firebase}
          yourDebt={yourDebt}
          loading={loading}
        />
      </div>

      { !isMobileDevice() ? 
        <div className="debt leftBorder">
          <TheirDebt 
            authUser={authUser}
            firebase={firebase}
            theirDebt={theirDebt}
            loading={loading}
          />
        </div>
        : 
        <div className="debt topBorder">
          <TheirDebt 
            authUser={authUser}
            firebase={firebase}
            theirDebt={theirDebt}
            loading={loading}
            />
          </div>
      }
    </Paper>
  );
}

export default Payment;