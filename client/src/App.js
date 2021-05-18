import React, { Component } from "react";
import CrowdFundingCampaing from "./contracts/CrowdFundingCampaing.json";
import getWeb3 from "./getWeb3";
import { fromIntToStatus } from "./utils/utils.js"

import NavBar from "./components/NavBar.js";
import ContainerInfo from "./components/ContainerInfo.js"

import "./App.css";

class App extends Component {
    state = { loaded: false };

    componentDidMount = async() => {
        try {
            // Get network provider and web3 instance.
            this.web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            this.accounts = await this.web3.eth.getAccounts();

            // Get the contract instance in the actual network (the same as metamask).
            this.networkId = await this.web3.eth.net.getId();
            this.instance = await new this.web3.eth.Contract(
                CrowdFundingCampaing.abi,
                CrowdFundingCampaing.networks[this.networkId] && CrowdFundingCampaing.networks[this.networkId].address,
            );

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            const status = await this.instance.methods.getStatus().call();
            const minimunContribution = await this.instance.methods.minimunContribution().call();
            const owner = await this.instance.methods.owner().call();
            const goal = await this.instance.methods.goal().call();
            const membersCount = await this.instance.methods.membersCount().call();
            //console.log(responsed);
            this.setState({
                loaded: true,
                status: fromIntToStatus(status),
                owner: owner,
                goal: goal,
                minimunContribution: minimunContribution,
                membersCount: membersCount,
            });
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    render() {
        if (!this.state.loaded) {
            return <div > Loading Web3, accounts, and Crowdfounding contract... </div>;
        }

        return ( 
            <div className = "App root" >
                <NavBar name="Tatita" />
                <ContainerInfo/>
            </div>
        );
    }
}

export default App;