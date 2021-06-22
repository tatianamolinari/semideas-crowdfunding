import React from "react";
import { Row, Col } from "react-bootstrap";
import { Icon, Pagination }  from 'semantic-ui-react'


import CardProposal from "./CardProposal.js";
import ProposalDetail from "./ProposalDetail.js";

import { campaignService } from "../../services/campaignService.js"
import { ipfsService } from "../../services/ipfsService.js"
import { hexBytesToAddress } from "../../helpers/utils.js"

class DisplayProposals extends React.Component {

  state = {
    active: this.props.active,
    proposal_data: {},
    pastProposals: [],
    proposals: [],
    loaded: false,
    activePage:1,
    totalProposals: 0,
    totalPages: 0,
    per_page: 3
    
  };

  async getProposals(activePage) {

    const allProposals = this.state.pastProposals;
    const proposals = []
    const i_proposal = this.state.totalProposals - 1 - ((activePage-1)*(this.state.per_page));
    const last_i = Math.max(-1, i_proposal - (this.state.per_page));
    
    console.log(`${i_proposal} ${last_i} ${activePage}`)

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

  showProposal(index) {

    this.setState({ proposal_data : this.state.proposals[index] });
    this.setState({ active: "proposals_detail"});
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
                  isOwner={this.props.isOwner}/>   
                  <Row className="proposal-footer">
                    <Col lg={6} className="aling-left">
                      <button className="normal-button"
                      onClick={() => { this.setState({ active: "proposals_list"})  }}>
                         <Icon name='angle left' /> Volver
                      </button>
                    </Col>
                    { this.props.isMember && (!this.props.isOwner)
                      &&
                      <Col lg={6} className="aling-right">  
                        <button className="normal-button">
                          Aprobar <Icon name='thumbs up'/>
                        </button>
                      </Col>}
                  </Row>
                </div>}
              </div>
              );
  }
}

export default DisplayProposals;