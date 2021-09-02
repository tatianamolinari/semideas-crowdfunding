import React from "react";
import { Col, Row } from "react-bootstrap";
import {Dimmer, Loader }  from 'semantic-ui-react';

import { fromIntToStatusCampaign } from "../../helpers/utils.js"
import { ipfsService } from "../../services/ipfsService.js"
import { campaignService } from "../../services/campaignService.js"

import DisplayContent from "./DisplayContent"
import DisplayProposals from "../proposals/DisplayProposals"
import DisplayProgressUpdates from "../progressUpdates/DisplayProgressUpdates"
import DisplayCloseProposals from "../closeProposals/DisplayCloseProposals"

import ErrorMessage from "../errors/ErrorMessage"
import MenuButton from "../buttons/MenuButton"

import deployedCampaignsInfo from "../../contracts/campaignAddressesTestNet.json"
//import deployedCampaignsInfo from "../../contracts/campaignAddresses.json"


class ContainerInfo extends React.Component {

  state = {
    active: this.props.active,
    loaded: false,
    error: false,
    error_msj: ""
  };

  change_active(new_active) {
 
    const old_active = this.state.active;

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

  loadCampaignData = async() => {

    try {
      
      const campaign = deployedCampaignsInfo["campaigns"][this.props.indexCampaign]
      const ipfsPath = campaign["ipfsPath"]
      const address = campaign["address"]
      const blockNumber = campaign["blockNumber"];

      const ipfsData = await ipfsService.getJsonFromIPFSHash(ipfsPath);

      const correctNetwork = await campaignService.isCorrectNetwork();
      if (!correctNetwork){
        this.setState({
          loaded: true,
          error: true,
          error_msj: "Por favor, verifica en Metamask haber seleccionado la red correcta."
        });
      }
      else {
        const instance = await campaignService.setInstanceFromAddress(address, blockNumber);
        console.log(instance);
        console.log("1")
        const campaignInfo = await campaignService.getCampaignInfo();
        console.log("2")
        const isMember = await campaignService.getMembership();
        console.log("3")
        const balance = await campaignService.getBalance();
        console.log("4")
        const actualAccount = await campaignService.getFirstAccount();
        console.log("5")
        const isOwner = actualAccount===campaignInfo.owner;

        const actualizeStatusInfo = async() => {this.actualizeStatusInfo()};
        await campaignService.subscribeToChangeStatus(actualizeStatusInfo);
        console.log("6")

        this.setState({
          loaded: true,
          instance: instance,
          balance: balance,
          isMember: isMember,
          status: fromIntToStatusCampaign(campaignInfo.status),
          owner: campaignInfo.owner,
          goal: campaignInfo.goal,
          minimunContribution: campaignInfo.minimunContribution,
          membersCount: campaignInfo.membersCount,
          finalContributions: campaignInfo.finalContributions,
          remainingContributions: campaignInfo.remainingContributions,
          isOwner: isOwner,
          out_grace_period: ((campaignInfo.out_grace_period && campaignInfo.status==='0') || campaignInfo.status==='1'),
          ipfsData: ipfsData,
          c_index: this.props.indexCampaign
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  actualizeStatusInfo = async() => {  
    const enum_status = await campaignService.getStatus();
    const status = fromIntToStatusCampaign(enum_status);
    this.setState({ status: status});
  }

  refreshSite = async () => {

    this.setState({ loaded: false });
    await this.loadCampaignData();
    if (this.state.active !== "general_data") {
      this.change_active("general_data");
    }
  }

  componentDidMount = async() => {
    await this.loadCampaignData();
    window.ethereum.on('accountsChanged', async(accounts) => { this.refreshSite() });
  }

  componentDidUpdate(prevProps) {
    if(this.props.indexCampaign !== prevProps.indexCampaign) {
      this.refreshSite();
    }
  } 

  render() {
              return (<Row className="container-info"> 
                         <Col lg={3} className="user_side_menu">
                          <ul className="vertical-center">

                            <MenuButton 
                              disabledValue={this.state.error}
                              changeActive={() => {
                                this.change_active("general_data");
                              }}
                              idName="general_data"
                              classLi="menu_user_li_active"
                              textButton="Datos Generales"
                            />

                            <MenuButton 
                              disabledValue={this.state.error}
                              changeActive={() => {
                                this.change_active("proposals");
                              }}
                              idName="proposals"
                              classLi="menu_user_li"
                              textButton="Pedidos de presupuesto"
                            />

                            <MenuButton 
                              disabledValue={this.state.error}
                              changeActive={() => {
                                this.change_active("progress");
                              }}
                              idName="progress"
                              classLi="menu_user_li"
                              textButton="Avances"
                            />

                            <MenuButton 
                              disabledValue={this.state.error}
                              changeActive={() => {
                                this.change_active("close_proposals");
                              }}
                              idName="close_proposals"
                              classLi="menu_user_li"
                              textButton="Pedidos de cierre"
                            />

                          </ul>
                        </Col>

                        {                        
                        this.state.loaded  && !this.state.error && 
                         <Col className="display-content" lg={9}>
                          <DisplayContent
                          ipfsData={this.state.ipfsData}
                          data={{ 
                            status: this.state.status,
                            owner: this.state.owner,
                            goal: this.state.goal,
                            minimunContribution: this.state.minimunContribution,
                            membersCount: this.state.membersCount,
                            isMember: this.state.isMember,
                            balance: this.state.balance,
                            remainingContributions: this.state.remainingContributions,
                            finalContributions: this.state.finalContributions,
                            isOwner: this.state.isOwner,
                            c_index: this.state.c_index
                          }}/>

                          <DisplayProgressUpdates
                          instance={this.state.instance}
                          active="progress_updates_list"/> 

                          <DisplayProposals
                          campaignStatus={this.state.status}
                          instance={this.state.instance}
                          isMember={this.state.isMember}
                          isOwner={this.state.isOwner}
                          active="proposals_list"/>


                          <DisplayCloseProposals
                          campaignStatus={this.state.status}
                          instance={this.state.instance}
                          isMember={this.state.isMember}
                          isOwner={this.state.isOwner}
                          owner={this.state.owner}
                          out_grace_period={this.state.out_grace_period}
                          active="cproposals_list"/>
                          
                        </Col>
                                           
                        }

                        {!this.state.loaded && 
                        <Dimmer active>
                        <h1 data-testid="info-loading"> Obteniendo la información de la campaña... </h1>
  
                          <Loader size='large' inline>Cargando...</Loader>
                        </Dimmer>
                        }

                      { this.state.error && 
                       
                          <Col data-testid="info-error" className="display-content" lg={9}>
                            <ErrorMessage error_msj={this.state.error_msj}/>
                          </Col>
                      }
    
                      </Row>);
  }
}

export default ContainerInfo;