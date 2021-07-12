import React from "react";
import { Row, Col } from "react-bootstrap";
import { Icon, Pagination, Button, Label }  from 'semantic-ui-react'


import CardCloseProposal from "./CardCloseProposal.js";
import CloseProposalDetail from "./CloseProposalDetail.js";
import MessageModal from "../modals/MessageModal"

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"
import { hexBytesToAddress } from "../../helpers/utils.js"

class DisplayCloseProposals extends React.Component {

  state = {
    active: this.props.active,
    dproposal_data: {},
    dproposal_data_i: 0,
    pastCProposals: [],
    cproposals: [],
    loaded: false,
    activePage:1,
    totalCProposals: 0,
    totalPages: 0,
    per_page: 3,
    loadingClose: false,
    loadingVote: false,
    showMessage: false    
  };

  async getCProposals(activePage) {

    const allCProposals = this.state.pastCProposals;
    const cproposals = []
    const i_cproposal = this.state.totalCProposals - 1 - ((activePage-1)*(this.state.per_page));
    const last_i = Math.max(-1, i_cproposal - (this.state.per_page));
    
    //console.log(`${i_cproposal} ${last_i} ${activePage}`)

    for(let i=i_cproposal; (i >= 0 && i > last_i) ; i--){
      const pHash = allCProposals[i];
      const ipfsPath = hexBytesToAddress(pHash.substring(2));

      const ipfsData = await ipfsService.getJsonFromIPFSHash(ipfsPath);
      
      cproposals.push(
        {
          "index_cproposal": i,
          "title": ipfsData.title, 
          "description": ipfsData.description ,
          "proposal_date": ipfsData.created_date
        });
    }

    this.setState({
      loaded: true,
      cproposals: cproposals
    });

  }

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activePage: activePage, loaded: false });
    this.getCProposals(activePage);
  }

  handleMessageClose = () => this.setState({ showMessage: false});

  async setCloseProposalData(index) {

    const cproposalData = this.state.cproposals[index];
    const cproposalInfo = await campaignService.getCloseProposalInfo(cproposalData["index_cproposal"]);
    
    cproposalData["approvalsCount"] = cproposalInfo.approvalsCount;
    cproposalData["disapprovalsCount"] = cproposalInfo.disapprovalsCount;
    cproposalData["status"] = cproposalInfo.status;
    cproposalData["limitTime"] = cproposalInfo.limitTime;
    cproposalData["hasVoted"] = cproposalInfo.senderHasVote;

    console.log(cproposalInfo)

    const canVote = (!this.props.isOwner) && this.props.isMember && cproposalInfo.inTime && (!cproposalInfo.senderHasVote);
    const canClose = (this.props.isMember || this.props.isOwner) && !(cproposalInfo.inTime) && cproposalInfo.status==='0';

    this.setState({ dproposal_data_i: index, 
                    dproposal_data : cproposalData, 
                    canVote: canVote, 
                    canClose: canClose });
  }

  async showDProposal(index) {

    await this.setCloseProposalData(index);
    this.setState({ active: "cproposals_detail"});
  }
  
  async disapprove() {

    this.setState({ loadingVote: true});
    const index = this.state.dproposal_data["index_cproposal"];

    campaignService.disapproveCloseProposal(index).then((statusResponse) => {
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
    const index = this.state.dproposal_data["index_cproposal"];

    campaignService.approveCloseProposal(index).then((statusResponse) => {
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

  async closeCProposal() {

    this.setState({ loadingClose: true});
    const index = this.state.dproposal_data["index_cproposal"];

    campaignService.closeCloseProposal(index).then((statusResponse) => {
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

      const pastCProposals = await campaignService.getCloseProposals();
      this.setState({ 
                      pastCProposals : pastCProposals.map(pu =>  pu.returnValues[0]), 
                      totalCProposals: pastCProposals.length,
                      totalPages: Math.ceil(pastCProposals.length/this.state.per_page)
                    });

      await this.getCProposals(1);

      const actualizeCProposalInfo = async() => {this.setCloseProposalData(this.state.dproposal_data_i)};
      await campaignService.suscribeToVoteCloseProposal(actualizeCProposalInfo);
      await campaignService.suscribeToClosedCloseProposal(actualizeCProposalInfo);

    } catch (error) {
        alert(
            `Failed to load web3, accounts, or data contract. Check console for details.`,
        );
        console.error(error);
    }
  }

  render() {

    let dproposal_nodes = []
      for (const [index, dproposal] of this.state.cproposals.entries()) {
        dproposal_nodes.push(
          <Col lg={4} className="invisible_button"
          key={index}
          onClick={() => { this.showDProposal(index) }}>
            <CardCloseProposal  
              title={dproposal.title}
              description={dproposal.description}
              dproposal_date={dproposal.proposal_date}
            />
          </Col>
        )
    }


    return (  <div className="proposal-info" id="close_proposals_container" style={{display: "none"}}> 
              
                { this.state.showMessage &&
                  <MessageModal
                  showMessage={this.state.showMessage}
                  handleMessageClose={this.handleMessageClose}
                  message={this.state.message_m}
                  title={this.state.title_m} />
                }           
                
                { this.state.active==="cproposals_list" && dproposal_nodes.length>0 && 
                <div>
                  <Row  id="cproposals_list">
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

                { this.state.active==="cproposals_list" && dproposal_nodes.length===0 &&
                <div>  
                    <h1> Aún no hay pedidos de cierre para mostrar. </h1>
                    <p> No dejes de estar pendiente a los nuevos pedidos que puedan aparecer.</p>
                </div>
               
                }
                
                
                { this.state.active==="cproposals_detail" && 
                  <div  id="cproposals_detail">
                    <CloseProposalDetail
                      index_cproposal={this.state.dproposal_data.index_cproposal}
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
                          onClick={() => { this.setState({ active: "cproposals_list"})  }}>
                            <Icon name='angle left' /> Volver
                          </Button>
                        </Col>
                        { this.state.canClose &&
                        <Col lg={6} className="aling-right">
                          <Button
                          loading={this.state.loadingClose}
                          className="normal-button no-margin"                          
                          data-testid="closeProposalButton"
                          onClick= {() => { this.closeCProposal()  }}>
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

export default DisplayCloseProposals;