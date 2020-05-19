import * as React from "react";
import * as ReactDOM from "react-dom";
import { DesignLanguage, Diez } from '@urgent/thisbounty-styles'

import { UserLevel } from "./components/UserLevel";

const diezDs = new Diez(DesignLanguage);

diezDs.attach((ds) => {

    const DSContext = React.createContext(ds);

    ReactDOM.render(
        <DSContext.Provider value={ds}>
            <UserLevel degree={4} />,
        </DSContext.Provider>,
        document.getElementById("example")
    );

})
