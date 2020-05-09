import * as React from "react";
import * as ReactDOM from "react-dom";
import { DesignLanguage, Diez } from '../diez/thisbounty-styles/design-language/build/diez-thisbounty-styles-web/index'


import { Hello } from "./components/Hello";

// Create a new Diez instance providing your DesignLanguage as a source
const diezDs = new Diez(DesignLanguage);
// Listen to changes in the design language
diezDs.attach((ds) => {
    // The ds has been updated!
    ReactDOM.render(
        <Hello compiler="TypeScript" framework="React" />,
        document.getElementById("example")
    );
});