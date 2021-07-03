import React from "react";
import { Row, Col } from "react-bootstrap";
import { Icon, Pagination, Button, Label }  from 'semantic-ui-react'


import CardProposal from "./CardProposal.js";
import ProposalDetail from "./ProposalDetail.js";
import MessageModal from "../modals/MessageModal"

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"
import { hexBytesToAddress } from "../../helpers/utils.js"

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
    showMessage: false    
  };

  async getProposals(activePage) {

    const allProposals = this.state.pastProposals;
    const proposals = []
    const i_proposal = this.state.totalProposals - 1 - ((activePage-1)*(this.state.per_page));
    const last_i = Math.max(-1, i_proposal - (this.state.per_page));
    
    //console.log(`${i_proposal} ${last_i} ${activePage}`)

    for(let i=i_proposal; (i >= 0 && i > last_i) ; i--){
      const pHash = allProposals[i];
      const ipfsPath = hexBytesToAddress(pHash.substring(2));

      const ipfsData = await ipfsService.getJsonFromIPFSHash(ipfsPath);
      
      proposals.push(
        {
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

  async showProposal(index) {

    const proposalData = this.state.proposals[index];

    const proposalInfo = await campaignService.getProposalInfo(proposalData["index_proposal"]);
    
    proposalData["recipient"] = proposalInfo.recipient;
    proposalData["value"] = proposalInfo.value;
    proposalData["approvalsCount"] = proposalInfo.approvalsCount;
    proposalData["disapprovalsCount"] = proposalInfo.disapprovalsCount;
    proposalData["status"] = proposalInfo.status;
    proposalData["limitTime"] = proposalInfo.limitTime;
    proposalData["hasVoted"] = proposalInfo.senderHasVote;

    console.log(proposalInfo)

    const canVote = (!this.props.isOwner) && this.props.isMember && proposalInfo.inTime && (!proposalInfo.senderHasVote);
    const canClose = this.props.isMember && !(proposalInfo.inTime) && proposalInfo.status==='3';
   
    this.setState({ proposal_data_i: index, proposal_data : proposalData, canVote: canVote, canClose: canClose });
    this.setState({ active: "proposals_detail"});
  }
  
  async disapprove() {

    this.setState({ loadingVote: true});
    const index = this.state.proposal_data["index_proposal"];

    campaignService.disapproveProposal(index).then((statusResponse) => {
      let title, message = "";

      if (statusResponse.error) {
        title = "Hubo un error al contribuir";
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
        message = "¡Tu voto se contabilizó de manera exitosa!\n ¡Gracias por tu compromiso!"; 
      }

      this.setState({ loadingVote: false, 
                      message_m: message, 
                      showMessage: true, 
                      title_m: title});
      });

      this.showProposal(this.state.proposal_data_i);
  }


  async approve() {
    this.setState({ loadingVote: true});
    const index = this.state.proposal_data["index_proposal"];

    campaignService.approveProposal(index).then((statusResponse) => {
      let title, message = "";

      if (statusResponse.error) {
        title = "Hubo un error al contribuir";
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
        message = "¡Tu voto se contabilizó de manera exitosa!\n ¡Gracias por tu compromiso!"; 
      }

      this.setState({ loadingVote: false, 
                      message_m: message, 
                      showMessage: true, 
                      title_m: title});
    });

    this.showProposal(this.state.proposal_data_i);
  }

  componentDidMount = async() => {
    try {

      const pastProposals = await campaignService.getProposals();
      this.setState({ 
                      pastProposals : pastProposals.map(pu =>  pu.returnValues[0]), 
                      totalProposals: pastProposals.length,
                      totalPages: Math.ceil(pastProposals.length/this.state.per_page)
                    });

      await this.getProposals(1);

    } catch (error) {
        alert(
            `Failed to load web3, accounts, or data contract. Check console for details.`,
        );
        console.error(error);
    }
};

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

                { this.state.showMessage &&
                  <MessageModal
                  showMessage={this.state.showMessage}
                  handleMessageClose={this.handleMessageClose}
                  message={this.state.message_m}
                  title={this.state.title_m} />
                }           
                
                { this.state.active==="proposals_list" && proposal_nodes.length>0 &&
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

                { this.state.active==="proposals_list" && proposal_nodes.length===0 &&
                <div>  
                    <h1> Aún no hay pedidos de presupuesto para mostrar. </h1>
                    <p> No dejes de estar pendiente a los nuevos pedidos que puedan aparecer.</p>
                </div>
               
                }
                
                
                { this.state.active==="proposals_detail" &&
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
                  { this.state.canVote &&
                    <div>
                      <Row className="proposal-footer">
                        <Col lg={6} className="aling-left">
                          <Button as='div' labelPosition='right' 
                          disabled={this.state.loadingVote}
                          onClick= {() => { this.approve()  }}>
                            <Button icon>
                              <Icon name='thumbs up'/>
                              Aprobar
                            </Button>
                            <Label as='a' basic pointing='left'>
                              {this.state.proposal_data.approvalsCount}
                            </Label>
                          </Button>
                        </Col>
                        <Col lg={6} className="aling-right">
                          <Button as='div' labelPosition='left' 
                          disabled={this.state.loadingVote}
                          onClick= {() => { this.disapprove()  }}
                          >
                            <Label as='a' basic pointing='right'>
                            {this.state.proposal_data.disapprovalsCount}
                            </Label>
                            <Button icon>
                              <Icon name='thumbs down'/>
                              Desaprobar
                            </Button>
                          </Button>
                        </Col>
                      </Row>
                  </div>
                }
                { this.state.canClose &&
                      <Row className="proposal-footer">
                        <Col lg={12} className="aling-right">
                          <Button
                          loading={this.state.loadingClose}
                          className="normal-button"
                          
                          data-testid="closeProposalButton">
                            Cerrar Pedido
                        </Button>
                        </Col>
                      </Row>
                }

                  <Row className="proposal-footer">
                    <Col lg={6} className="aling-left">
                      <button className="normal-button"
                      onClick={() => { this.setState({ active: "proposals_list"})  }}>
                         <Icon name='angle left' /> Volver
                      </button>
                    </Col>
                  </Row>
                </div>
              }
              </div>
            );
  }
}

export default DisplayProposals;