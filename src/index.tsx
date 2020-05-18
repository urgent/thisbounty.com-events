import * as React from "react";
import * as ReactDOM from "react-dom";
// need to just publish /build directory
import { DesignLanguage, Diez } from '@urgent/thisbounty-styles'

import { UserLevel } from "./components/UserLevel";

const diezDs = new Diez(DesignLanguage);

diezDs.attach((ds) => {

    const DSContext = React.createContext(ds);

    ReactDOM.render(
        <DSContext.Provider value={ds}>
            <UserLevel degree={4} ds={ds} />,
        </DSContext.Provider>,
        document.getElementById("example")
    );

})
