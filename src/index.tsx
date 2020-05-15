import * as React from "react";
import * as ReactDOM from "react-dom";



import { Hello } from "./components/Hello";
import { UserLevel } from "./components/UserLevel";


// Listen to changes in the design language

// The ds has been updated!
ReactDOM.render(
    <UserLevel degree={4} />,

    document.getElementById("example")
);
