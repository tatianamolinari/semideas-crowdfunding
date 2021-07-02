import React, { Component } from "react";

import NavBar from "./components/NavBar.js";
import ContainerInfo from "./components/campaign/ContainerInfo.js"

import "./App.css";

class App extends Component {

    state = {
        indexCampaign: 0
      };

      previusCampaign = () =>
    { 
        const new_index = this.state.indexCampaign -1 ;
        this.setState({ indexCampaign: new_index })
    }

    nextCampaign = () =>
    { 
        const new_index = this.state.indexCampaign +1 ;
        this.setState({ indexCampaign: new_index })
    }


    render() {

        return ( 
            <div className = "App root" >
                <NavBar
                    indexCampaign={this.state.indexCampaign}
                    previusCampaign={this.previusCampaign}
                    nextCampaign={this.nextCampaign}
                />
                <ContainerInfo 
                    active="general_data"
                    indexCampaign={this.state.indexCampaign}
                />
            </div>
        );
    }
}

export default App;