import React from 'react';
import { withFirebase } from '../Firebase';

import YourDebt from './yourDebtList';
import TheirDebt from './theirDebtList';

function isMobileDevice() {
    if(window.innerWidth <= 800 && window.innerHeight <= 600) {
      return true;
    } else {
      return false;
    }
 }

const Payment = ({ authUser }) => {
    return (
        <div className="paymentRootDiv">
            <div className="debt">
                <YourDebt authUser={authUser}/>
            </div>

            { !isMobileDevice() ? 
            <div className="debt leftBorder">
                <TheirDebt authUser={authUser}/>
            </div>
            : 
            <div className="debt topBorder">
                <TheirDebt authUser={authUser}/>
            </div>
            }
        </div>
    )
}
export default withFirebase(Payment);