import React from "react";
import { Row, Col } from "react-bootstrap";
import { Dimmer, Loader, Icon, Pagination, Button, Label }  from 'semantic-ui-react'


import CardProposal from "./CardProposal.js";
import ProposalDetail from "./ProposalDetail.js";
import MessageModal from "../modals/MessageModal"

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"

class DisplayProposals extends React.Component {

  state = {
    active: this.props.active,
    proposal_data: {},
    proposal_data_i: 0,
    pastProposals: [],
    proposals: [],
    loaded: false,
    activePage:1,
    totalProposals: 0,
    totalPages: 0,
    per_page: 3,
    loadingClose: false,
    loadingVote: false,
    loadingTansfer: false,
    showMessage: false    
  };

  async getProposals(activePage) {
    const allProposals = this.state.pastProposals;
    const proposals = []
    const i_proposal = this.state.totalProposals - 1 - ((activePage-1)*(this.state.per_page));
    const last_i = Math.max(-1, i_proposal - (this.state.per_page));
    
    for(let i=i_proposal; (i >= 0 && i > last_i) ; i--){
      const pHash = allProposals[i];
      const ipfsPath = ipfsService.getIPFSHash(pHash);
      const ipfsData = await ipfsService.getJsonFromIPFSHash(ipfsPath); 
      proposals.push({
          "index_proposal": i,
          "title": ipfsData.title, 
          "description": ipfsData.description ,
          "proposal_date": ipfsData.created_date
        });
    }

    this.setState({
      loaded: true,
      proposals: proposals
    });
  }

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activePage: activePage, loaded: false });
    this.getProposals(activePage);
  }

  handleMessageClose = () => this.setState({ showMessage: false});

  async setProposalData(index) {
    if (this.state.proposals.length > index) {
      this.setState({ loaded: false });
      const proposalData = this.state.proposals[index];
      const proposalInfo = await campaignService.getProposalInfo(proposalData["index_proposal"]);
      proposalData["recipient"] = proposalInfo.recipient;
      proposalData["value"] = proposalInfo.value;
      proposalData["approvalsCount"] = proposalInfo.approvalsCount;
      proposalData["disapprovalsCount"] = proposalInfo.disapprovalsCount;
      proposalData["status"] = proposalInfo.status;
      proposalData["limitTime"] = proposalInfo.limitTime;
      proposalData["hasVoted"] = proposalInfo.senderHasVote;
      const campaignActive = (this.props.campaignStatus !== "Cerrada") && (this.props.campaignStatus !== "Exitosa")
      const canVote = campaignActive && (!this.props.isOwner) && this.props.isMember && proposalInfo.inTime && (!proposalInfo.senderHasVote);
      const canClose = campaignActive && (this.props.isMember || this.props.isOwner) && !(proposalInfo.inTime) && proposalInfo.status==='0';
      const canRelease = campaignActive && this.props.isOwner && proposalInfo.status==='1';
      this.setState({ proposal_data_i: index, 
                      proposal_data : proposalData, 
                      canVote: canVote, 
                      canClose: canClose,
                      canRelease: canRelease,
                      loaded:true });
    }
  }

  async showProposal(index) {
    await this.setProposalData(index);
    this.setState({ active: "proposals_detail"});
  }
  
  async disapprove() {
    this.setState({ loadingVote: true});
    const index = this.state.proposal_data["index_proposal"];
    campaignService.disapproveProposal(index).then((statusResponse) => {
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
    const index = this.state.proposal_data["index_proposal"];
    campaignService.approveProposal(index).then((statusResponse) => {
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

  async closeProposal() {

    this.setState({ loadingClose: true});
    const index = this.state.proposal_data["index_proposal"];

    campaignService.closeProposal(index).then((statusResponse) => {
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

  async release() {
    this.setState({ loadingTansfer: true});
    const index = this.state.proposal_data["index_proposal"];
    campaignService.release(index).then((statusResponse) => {
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
        title = "Retiro exitoso";
        message = "¡El retiro de fondos se envío de manera exitosa!\nRevisa tu wallet para ver los fondos agregados."; 
        this.setState({ canRelease: false}); 
      }
      this.setState({ loadingTansfer: false, 
                      message_m: message, 
                      showMessage: true, 
                      title_m: title});
    });
  }

  componentDidMount = async() => {
    try {
      this.setState({ loaded: false });
      const pastProposals = await campaignService.getProposals();
      this.setState({ pastProposals : pastProposals.map(pu =>  pu.returnValues[0]), 
                      totalProposals: pastProposals.length,
                      totalPages: Math.ceil(pastProposals.length/this.state.per_page) });
      await this.getProposals(1);
      const actualizeProposalInfo = async() => {this.setProposalData(this.state.proposal_data_i)};
      await campaignService.subscribeToVoteProposal(actualizeProposalInfo);
      await campaignService.subscribeToClosedProposal(actualizeProposalInfo);
      await campaignService.subscribeToProposalRelease(actualizeProposalInfo);

    } catch (error) {
        console.error(error);
    }
  }

  componentDidUpdate(prevProps) {
    if(this.props.campaignStatus !== prevProps.campaignStatus) {
      this.setProposalData(this.state.proposal_data_i);
    }
  }

  render() {
    let proposal_nodes = []
      for (const [index, proposal] of this.state.proposals.entries()) {
        proposal_nodes.push(
          <Col lg={4} className="invisible_button"
          key={index}
          onClick={() => { this.showProposal(index) }}>
            <CardProposal 
              title={proposal.title}
              description={proposal.description}
              proposal_date={proposal.proposal_date}
            />
          </Col>
        )
    }

    return (  <div className="proposal-info" id="proposals_container" style={{display: "none"}}> 

                {!this.state.loaded && 
                  <Dimmer active>
                    { this.state.active==="proposals_list" ?
                    <h1 data-testid="info-loading"> Obteniendo los pedidos de presupuesto... </h1> :
                    <h1 data-testid="info-loading"> Obteniendo detalle de pedido de presupuesto... </h1>
                    }
                    <Loader size='large' inline>Cargando...</Loader>
                  </Dimmer>
                }

                { this.state.showMessage && this.state.loaded &&
                  <MessageModal
                  showMessage={this.state.showMessage}
                  handleMessageClose={this.handleMessageClose}
                  message={this.state.message_m}
                  title={this.state.title_m} />
                }           
                
                { this.state.active==="proposals_list" && proposal_nodes.length>0 && this.state.loaded &&
                <div>
                  <Row  id="proposals_list">
                  {proposal_nodes}                
                  </Row> 
                  <Row className="justify-content-md-center">
                    <Pagination
                      activePage={this.state.activePage}
                      onPageChange={this.handlePaginationChange}
                      totalPages={this.state.totalPages}
                    />
                  </Row>
                </div>}

                { this.state.active==="proposals_list" && proposal_nodes.length===0 && this.state.loaded &&
                  <div>  
                      <h1> Aún no hay pedidos de presupuesto para mostrar. </h1>
                      <p> No dejes de estar pendiente a los nuevos pedidos que puedan aparecer.</p>
                  </div>
                }
                
                { this.state.active==="proposals_detail" && this.state.loaded &&
                  <div  id="proposals_detail">
                    <ProposalDetail
                      index_proposal={this.state.proposal_data.index_proposal}
                      title={this.state.proposal_data.title}
                      description={this.state.proposal_data.description}
                      proposal_date={this.state.proposal_data.proposal_date}
                      isMember={this.props.isMember}
                      isOwner={this.props.isOwner}
                      recipient={this.state.proposal_data.recipient}
                      value={this.state.proposal_data.value}
                      approvalsCount={this.state.proposal_data.approvalsCount}
                      disapprovalsCount={this.state.proposal_data.disapprovalsCount}
                      status={this.state.proposal_data.status}
                      limitTime={this.state.proposal_data.limitTime}
                      hasVoted={this.state.proposal_data.hasVoted} />
                  
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
                              {this.state.proposal_data.approvalsCount}
                            </Label>
                          </Button>
                        </Col>
                        <Col lg={6} className="aling-right">
                          <Button as='div' labelPosition='left' 
                          disabled={ this.state.loadingVote ||  !this.state.canVote }
                          onClick= {() => { this.disapprove()  }}>
                            <Label as='a' basic pointing='right'>
                              {this.state.proposal_data.disapprovalsCount}
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
                          onClick={() => { this.setState({ active: "proposals_list"})  }}>
                            <Icon name='angle left' /> Volver
                          </Button>
                        </Col>
                        { this.state.canClose &&
                        <Col lg={6} className="aling-right">
                          <Button
                          loading={this.state.loadingClose}
                          className="normal-button no-margin"                          
                          data-testid="closeProposalButton"
                          onClick= {() => { this.closeProposal()  }}>
                            Cerrar Pedido
                          </Button>
                        </Col>
                        }
                        { this.state.canRelease &&
                        <Col lg={6} className="aling-right">
                          <Button
                          loading={this.state.loadingTansfer}
                          className="normal-button no-margin"                          
                          data-testid="transfer"
                          onClick= {() => { this.release()  }}>
                            Transferir fondos
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

export default DisplayProposals;