import React, { Component } from "react";

import NavBar from "./components/NavBar.js";
import ContainerInfo from "./components/campaign/ContainerInfo.js"

import "./App.css";

class App extends Component {

    render() {

        return ( 
            <div className = "App root" >
                <NavBar name="Tatita" />
                <ContainerInfo active="general_data"/>
            </div>
        );
    }
}

export default App;