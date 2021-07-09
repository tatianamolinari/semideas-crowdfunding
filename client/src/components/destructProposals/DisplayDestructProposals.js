import React from "react";
import { Row, Col } from "react-bootstrap";
import { Icon, Pagination, Button, Label }  from 'semantic-ui-react'


import CardDestructProposal from "./CardDestructProposal.js";
import DestructProposalDetail from "./DestructProposalDetail.js";
import MessageModal from "../modals/MessageModal"

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"
import { hexBytesToAddress } from "../../helpers/utils.js"

class DisplayDestructProposals extends React.Component {

  state = {
    active: this.props.active,
    dproposal_data: {},
    dproposal_data_i: 0,
    pastDProposals: [],
    dproposals: [],
    loaded: false,
    activePage:1,
    totalDProposals: 0,
    totalPages: 0,
    per_page: 3,
    loadingClose: false,
    loadingVote: false,
    showMessage: false    
  };

  async getDProposals(activePage) {

    const allDProposals = this.state.pastDProposals;
    const dproposals = []
    const i_dproposal = this.state.totalDProposals - 1 - ((activePage-1)*(this.state.per_page));
    const last_i = Math.max(-1, i_dproposal - (this.state.per_page));
    
    //console.log(`${i_dproposal} ${last_i} ${activePage}`)

    for(let i=i_dproposal; (i >= 0 && i > last_i) ; i--){
      const pHash = allDProposals[i];
      const ipfsPath = hexBytesToAddress(pHash.substring(2));

      const ipfsData = await ipfsService.getJsonFromIPFSHash(ipfsPath);
      
      dproposals.push(
        {
          "index_proposal": i,
          "title": ipfsData.title, 
          "description": ipfsData.description ,
          "proposal_date": ipfsData.created_date
        });
    }

    this.setState({
      loaded: true,
      dproposals: dproposals
    });

  }

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activePage: activePage, loaded: false });
    this.getDProposals(activePage);
  }

  handleMessageClose = () => this.setState({ showMessage: false});

  async setDestructProposalData(index) {

    const dproposalData = this.state.dproposals[index];

    const dproposalInfo = await campaignService.getProposalInfo(dproposalData["index_dproposal"]);
    
    dproposalData["approvalsCount"] = dproposalInfo.approvalsCount;
    dproposalData["disapprovalsCount"] = dproposalInfo.disapprovalsCount;
    dproposalData["status"] = dproposalInfo.status;
    dproposalData["limitTime"] = dproposalInfo.limitTime;
    dproposalData["hasVoted"] = dproposalInfo.senderHasVote;

    console.log(dproposalInfo)

    const canVote = (!this.props.isOwner) && this.props.isMember && dproposalInfo.inTime && (!dproposalInfo.senderHasVote);
    const canClose = (this.props.isMember || this.props.isOwner) && !(dproposalInfo.inTime) && dproposalInfo.status==='0';

    this.setState({ dproposal_data_i: index, 
                    dproposal_data : dproposalData, 
                    canVote: canVote, 
                    canClose: canClose });
  }

  async showDProposal(index) {

    await this.setDestructProposalData(index);
    this.setState({ active: "dproposals_detail"});
  }
  
  async disapprove() {

    this.setState({ loadingVote: true});
    const index = this.state.dproposal_data["index_dproposal"];

    campaignService.disapproveDestructProposal(index).then((statusResponse) => {
      let title, message = "";

      if (statusResponse.error) {
        title = "Hubo un error al votar";
        switch (statusResponse.errorMsg) {
          case "Acción denegada":
            message = "Has denegado la acción a tráves de metamask. Para que este completa debes aceptarla.";
            break;
          case "Nonce error":
            message = "Error de nonce: El nonce de la cuenta elegida y de la transacción son diferentes.";
            break;
          case "Gas insuficiente":
            message = "La operación llevó más gas que el que pusiste como límite.";
            break;
          default: 
            message = "Error desconocido";
            break;
        }
      }
      else {
        title = "Votación exitosa";
        message = "¡Tu voto se envió de manera exitosa!\n ¡Gracias por tu compromiso!";
        this.setState({ canVote: false}); 
      }

      this.setState({ loadingVote: false, 
                      message_m: message, 
                      showMessage: true, 
                      title_m: title});
      });
  }

  async approve() {
    this.setState({ loadingVote: true});
    const index = this.state.dproposal_data["index_dproposal"];

    campaignService.approveDestructProposal(index).then((statusResponse) => {
      let title, message = "";

      if (statusResponse.error) {
        title = "Hubo un error al votar";
        switch (statusResponse.errorMsg) {
          case "Acción denegada":
            message = "Has denegado la acción a tráves de metamask. Para que este completa debes aceptarla.";
            break;
          case "Nonce error":
            message = "Error de nonce: El nonce de la cuenta elegida y de la transacción son diferentes.";
            break;
          case "Gas insuficiente":
            message = "La operación llevó más gas que el que pusiste como límite.";
            break;
          default: 
            message = "Error desconocido";
            break;
        }
      }
      else {
        title = "Votación exitosa";
        message = "¡Tu voto se envió de manera exitosa!\n ¡Gracias por tu compromiso!"; 
        this.setState({ canVote: false}); 
      }

      this.setState({ loadingVote: false, 
                      message_m: message, 
                      showMessage: true, 
                      title_m: title});
    });

  }

  async closeDProposal() {

    this.setState({ loadingClose: true});
    const index = this.state.dproposal_data["index_dproposal"];

    campaignService.closeDestructProposal(index).then((statusResponse) => {
      let title, message = "";

      if (statusResponse.error) {
        title = "Hubo un error al cerrar el pedido";
        switch (statusResponse.errorMsg) {
          case "Acción denegada":
            message = "Has denegado la acción a tráves de metamask. Para que este completa debes aceptarla.";
            break;
          case "Nonce error":
            message = "Error de nonce: El nonce de la cuenta elegida y de la transacción son diferentes.";
            break;
          case "Gas insuficiente":
            message = "La operación llevó más gas que el que pusiste como límite.";
            break;
          default: 
            message = "Error desconocido";
            break;
        }
      }
      else {
        title = "Cierre exitoso";
        message = "¡El cierre del pedido se envío de manera exitosa!"; 
        this.setState({ canClose: false}); 
      }

      this.setState({ loadingClose: false, 
                      message_m: message, 
                      showMessage: true, 
                      title_m: title});
    });

  }



  componentDidMount = async() => {
    try {

      const pastDProposals = await campaignService.getDestructProposals();
      this.setState({ 
                      pastDProposals : pastDProposals.map(pu =>  pu.returnValues[0]), 
                      totalDProposals: pastDProposals.length,
                      totalPages: Math.ceil(pastDProposals.length/this.state.per_page)
                    });

      await this.getDProposals(1);

      const actualizeDProposalInfo = async() => {this.setDestructProposalData(this.state.dproposal_data_i)};
      await campaignService.suscribeToVoteDestructProposal(actualizeDProposalInfo);
      await campaignService.suscribeToClosedDestructProposal(actualizeDProposalInfo);

    } catch (error) {
        alert(
            `Failed to load web3, accounts, or data contract. Check console for details.`,
        );
        console.error(error);
    }
  }

  render() {

    let dproposal_nodes = []
      for (const [index, dproposal] of this.state.dproposals.entries()) {
        dproposal_nodes.push(
          <Col lg={4} className="invisible_button"
          key={index}
          onClick={() => { this.showDProposal(index) }}>
            <CardDestructProposal  
              title={dproposal.title}
              description={dproposal.description}
              dproposal_date={dproposal.proposal_date}
            />
          </Col>
        )
    }


    return (  <div className="proposal-info" id="destruct_proposals_container" style={{display: "none"}}> 

                { this.state.showMessage &&
                  <MessageModal
                  showMessage={this.state.showMessage}
                  handleMessageClose={this.handleMessageClose}
                  message={this.state.message_m}
                  title={this.state.title_m} />
                }           
                
                { this.state.active==="dproposals_list" && dproposal_nodes.length>0 &&
                <div>
                  <Row  id="dproposals_list">
                  {dproposal_nodes}                
                  </Row> 
                  <Row className="justify-content-md-center">
                    <Pagination
                      activePage={this.state.activePage}
                      onPageChange={this.handlePaginationChange}
                      totalPages={this.state.totalPages}
                    />
                  </Row>
                </div>}

                { this.state.active==="dproposals_list" && dproposal_nodes.length===0 &&
                <div>  
                    <h1> Aún no hay pedidos de cierre para mostrar. </h1>
                    <p> No dejes de estar pendiente a los nuevos pedidos que puedan aparecer.</p>
                </div>
               
                }
                
                
                { this.state.active==="dproposals_detail" &&
                  <div  id="dproposals_detail">
                    <DestructProposalDetail
                      index_dproposal={this.state.dproposal_data.index_dproposal}
                      title={this.state.dproposal_data.title}
                      description={this.state.dproposal_data.description}
                      dproposal_date={this.state.dproposal_data.proposal_date}
                      isMember={this.props.isMember}
                      isOwner={this.props.isOwner}
                      approvalsCount={this.state.dproposal_data.approvalsCount}
                      disapprovalsCount={this.state.dproposal_data.disapprovalsCount}
                      status={this.state.dproposal_data.status}
                      limitTime={this.state.dproposal_data.limitTime}
                      hasVoted={this.state.dproposal_data.hasVoted} />
                  
                    <div>
                      <Row className="proposal-footer">
                        <Col lg={6} className="aling-left">
                          <Button as='div' labelPosition='right' 
                          disabled={ this.state.loadingVote ||  !this.state.canVote }
                          onClick= {() => { this.approve()  }}>
                            <Button icon>
                              <Icon name='thumbs up'/>
                              &nbsp;{ this.state.canVote ? 'Aprobar' : 'Aprobados'}
                            </Button>
                            <Label as='a' basic pointing='left'>
                              {this.state.dproposal_data.approvalsCount}
                            </Label>
                          </Button>
                        </Col>
                        <Col lg={6} className="aling-right">
                          <Button as='div' labelPosition='left' 
                          disabled={ this.state.loadingVote ||  !this.state.canVote }
                          onClick= {() => { this.disapprove()  }}>
                            <Label as='a' basic pointing='right'>
                              {this.state.dproposal_data.disapprovalsCount}
                            </Label>
                            <Button icon>
                              <Icon name='thumbs down'/>
                              &nbsp;{ this.state.canVote ? 'Desaprobar' : 'Desaprobados'}
                            </Button>
                          </Button>
                        </Col>
                      </Row>
                  </div>
                
                  <hr style={{margin: "2em"}}/>
                      <Row className="proposal-footer">
                        <Col lg={6} className="aling-left">
                          <Button className="normal-button no-margin"
                          onClick={() => { this.setState({ active: "dproposals_list"})  }}>
                            <Icon name='angle left' /> Volver
                          </Button>
                        </Col>
                        { this.state.canClose &&
                        <Col lg={6} className="aling-right">
                          <Button
                          loading={this.state.loadingClose}
                          className="normal-button no-margin"                          
                          data-testid="closeProposalButton"
                          onClick= {() => { this.closeDProposal()  }}>
                            Cerrar Pedido
                          </Button>
                        </Col>
                        }
                      </Row>
                </div>
              }
              </div>
            );
  }
}

export default DisplayDestructProposals;