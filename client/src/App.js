import React, { Component } from "react";
import CrowdFundingCampaing from "./contracts/CrowdFundingCampaing.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
    state = { loaded: false };

    componentDidMount = async() => {
        try {
            // Get network provider and web3 instance.
            this.web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            this.accounts = await this.web3.eth.getAccounts();

            // Get the contract instance.
            this.networkId = await this.web3.eth.net.getId();
            this.instance = await new this.web3.eth.Contract(
                CrowdFundingCampaing.abi,
                CrowdFundingCampaing.networks[this.networkId] && CrowdFundingCampaing.networks[this.networkId].address,
            );
            console.log(CrowdFundingCampaing.networks[this.networkId].address);
            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            const minimunContribution = await this.instance.methods.minimunContribution().call();
            this.setState({ loaded: true, minimunContribution: minimunContribution });
        } catch (error) {
            // Catch any errors for any of the above operations.
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    /*getData = async() => {
        let minimunContribution = this.instance.methods().minimunContribution();
        let goal = this.instance.goal().call();
        let status = this.instance.status().call();
        let membersCount = this.instance.membersCount().call();

        this.setState({
            minimunContribution: minimunContribution,
            goal: goal,
            status: status,
            membersCount: membersCount
        });
    };*/

    render() {
        if (!this.state.loaded) {
            return <div > Loading Web3, accounts, and contract... < /div>;
        }
        return ( < div className = "App" >
            <
            h1 > Hi! < /h1> <
            div > The minimunContribution value is: { this.state.minimunContribution } < /div>  < /
            div >
        );
    }
}

export default App;