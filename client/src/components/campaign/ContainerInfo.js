import React from "react";
import { Col, Row } from "react-bootstrap";
import {Dimmer, Loader }  from 'semantic-ui-react';

import { fromIntToStatus, hexBytesToAddress, addressToHexBytes } from "../../helpers/utils.js"
import { ipfsService } from "../../services/ipfsService.js"
import { campaignService } from "../../services/campaignService.js"

import DisplayContent from "./DisplayContent"
import DisplayProposals from "../proposals/DisplayProposals"
import DisplayProgressUpdates from "../progressUpdates/DisplayProgressUpdates"
import ErrorMessage from "../errors/ErrorMessage"
import MenuButton from "../buttons/MenuButton"


class ContainerInfo extends React.Component {

  state = {
    active: this.props.active,
    loaded: false,
    error: false,
    error_msj: ""
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

          
            const input = [
              {
                'id': '0x10',
                'date': '14.07.2018'
              },
              {
                'id': '0x20',
                'date': '14.07.2018'
              },
              {
                'id': '0x30',
                'date': '14.17.2019'
              }
            ]

            
            const result = await ipfsService.addJson(input);
            console.log(result);

            console.log(ipfsService.getIPFSUrlFromPath(result.path));
            console.log(ipfsService.getCIDv1FromCID(result.cid));
            console.log(ipfsService.getIPFSUrlFromCID(ipfsService.getCIDv1FromCID(result.cid)));

            const original = await ipfsService.getJsonFromIPFSHash(result.path);
            console.log(original);

            console.log(addressToHexBytes(result.path));
            console.log(addressToHexBytes("QmWmyoMoctfbAaiEs2G46gpeUmhqFRDW6KWo64y5r581Vz"));
            console.log(hexBytesToAddress("12207D5A99F603F231D53A4F39D1521F98D2E8BB279CF29BEBFD0687DC98458E7F89"));

            let correctNetwork = await campaignService.isCorrectNetwork();
            if (!correctNetwork){
              this.setState({
                loaded: true,
                error: true,
                error_msj: "Por favor, verifica en Metamask haber seleccionado la red correcta."
              });
            }
            else {
              const instance = await campaignService.setInstance();
              const campaingInfo = await campaignService.getCampaingInfo();
              const isMember = await campaignService.getMembership();
              const balance = await campaignService.getBalance();
              const actualAccount = await campaignService.getFirstAccount();
              const isOwner = actualAccount===campaingInfo.owner;

              this.setState({
                  loaded: true,
                  instance: instance,
                  balance: balance,
                  isMember: isMember,
                  status: fromIntToStatus(campaingInfo.status),
                  owner: campaingInfo.owner,
                  goal: campaingInfo.goal,
                  minimunContribution: campaingInfo.minimunContribution,
                  membersCount: campaingInfo.membersCount,
                  isOwner: isOwner
              });
            }
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
                                this.change_active("destruct_proposals");
                              }}
                              idName="destruct_proposals"
                              classLi="menu_user_li"
                              textButton="Pedidos de baja"
                            />

                          </ul>
                        </Col>

                        {                        
                        this.state.loaded  && !this.state.error && 
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

                          <DisplayProgressUpdates
                          instance={this.state.instance}
                          active="progress_updates_list"/> 

                          <DisplayProposals
                          instance={this.state.instance}
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