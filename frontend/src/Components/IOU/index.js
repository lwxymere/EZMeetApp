import React from 'react';
import { withFirebase } from '../Firebase';

import YourDebt from './yourDebtList';
import TheirDebt from './theirDebtList';


// REMEMBER TO USE BORDER + PADDING to make vertical divider - using CSS
const Payment = ({ authUser }) => {
    return (
        <div className="contentRootDiv">
            <div className="yourDebt">
                <YourDebt authUser={authUser}/>
            </div>
            <div className="theirDebt">
                <TheirDebt authUser={authUser}/>
            </div>
        </div>
    )
}
export default withFirebase(Payment);

//export { YourDebt, TheirDebt };