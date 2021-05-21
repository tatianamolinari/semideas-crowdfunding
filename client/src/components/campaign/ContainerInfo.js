import React from "react";
import { Col, Row } from "react-bootstrap";
import {Dimmer, Loader }  from 'semantic-ui-react';

import getWeb3 from "../../getWeb3";
import CrowdFundingCampaing from "../../contracts/CrowdFundingCampaing.json";

import { fromIntToStatus, getValuesFromHash } from "../../helpers/utils.js"

import DisplayContent from "./DisplayContent.js"
import DisplayProposals from "../proposals/DisplayProposals.js"

class ContainerInfo extends React.Component {

  state = {
    active: this.props.active,
    loaded: false
  };

  change_active(new_active) {
 
    var old_active = this.state.active;

    const active_element = document.getElementById(old_active);
    const active_container = document.getElementById(
      old_active.concat("_container")
    );
    active_element.className = "menu_user_li";
    active_container.style = "display: none;";
    
    const new_active_element = document.getElementById(new_active);
    const new_active_container = document.getElementById(
      new_active.concat("_container")
    );

    new_active_element.className = "menu_user_li_active";
    new_active_container.style = "";
    this.setState({ active: new_active});
  }

    componentDidMount = async() => {
        try {
            this.web3 = await getWeb3();
            this.accounts = await this.web3.eth.getAccounts();
            this.networkId = await this.web3.eth.net.getId();
            
            this.instance = await new this.web3.eth.Contract(
                CrowdFundingCampaing.abi,
                CrowdFundingCampaing.networks[this.networkId] && CrowdFundingCampaing.networks[this.networkId].address,
            );

            //(owner, status, goal, minimunContribution, membersCount)
            let campaingValues = await this.instance.methods.getCampaingInfo().call();
            let campaingInfo = getValuesFromHash(campaingValues);
            
            const owner = campaingInfo[0];
            const status = await campaingInfo[1];
            const goal = campaingInfo[2]
            const minimunContribution = campaingInfo[3];
            const membersCount = campaingInfo[4];
            
            const isMember = await this.instance.methods.isMember(this.accounts[0]).call();
            const balance = await this.web3.eth.getBalance(this.instance.options.address);
            const isOwner = this.accounts[0]===owner;

            this.setState({
                loaded: true,
                instance: this.instance,
                balance: balance,
                isMember: isMember,
                status: fromIntToStatus(status),
                owner: owner,
                goal: goal,
                minimunContribution: minimunContribution,
                membersCount: membersCount,
                isOwner: isOwner
            });
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
  };



  render() {
              return (<Row className="container-info"> 
                         <Col lg={3} className="user_side_menu">
                          <ul className="vertical-center">
                            <button className="invisible_button" 
                            onClick={() => {
                              this.change_active("general_data");
                            }}>
                              <li id="general_data" className="menu_user_li">
                                Datos Generales
                              </li>
                            </button>
                            <button className="invisible_button"
                            onClick={() => {
                              this.change_active("progress");
                            }}>
                              <li id="progress" className="menu_user_li">
                                Avances
                              </li>
                            </button>
                            <button className="invisible_button"
                            onClick={() => {
                              this.change_active("proposals");
                            }}>
                              <li id="proposals" className="menu_user_li">
                                Pedidos de presupuesto
                              </li>
                            </button>
                            <button className="invisible_button"
                             onClick={() => {
                              this.change_active("destruct_proposals");
                            }}>
                              <li id="destruct_proposals" className="menu_user_li last">
                                Pedidos de baja
                              </li>
                            </button>
                          </ul>
                        </Col>

                        {                        
                        this.state.loaded  &&
                        <Col className="display-content" lg={9}>
                          <DisplayContent
                          data={{ 
                            status: this.state.status,
                            owner: this.state.owner,
                            goal: this.state.goal,
                            minimunContribution: this.state.minimunContribution,
                            membersCount: this.state.membersCount,
                            isMember: this.state.isMember,
                            balance: this.state.balance,
                            isOwner: this.state.isOwner
                          }}/>

                          <div id="progress_container" style={{display: "none"}}>
                            PROGRESS
                          </div>

                          <DisplayProposals
                          instance={this.instance}
                          isMember={this.state.isMember}
                          isOwner={this.state.isOwner}
                          active="proposals_list"/>


                          <div id="destruct_proposals_container" style={{display: "none"}}>
                            DESTRUCT PROPOSALS
                          </div>
                        </Col>
                                           
                        }

                        {!this.state.loaded && 
                        <Dimmer active>
                        <h1> Aún no hay pedidos de presupuesto para mostrar. </h1>
  
                          <Loader size='large' inline>Cargando...</Loader>
                        </Dimmer>
                        }
    
                      </Row>);
  }
}

export default ContainerInfo;