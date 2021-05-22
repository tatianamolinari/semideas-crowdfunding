import React from "react";
import { Row, Col } from "react-bootstrap";
import { Icon }  from 'semantic-ui-react'


import CardProposal from "./CardProposal.js";
import ProposalDetail from "./ProposalDetail.js";

class DisplayProposals extends React.Component {

  state = {
    active: this.props.active,
    proposal_data: {},
    proposals: [],
    loaded: false,
    page:1
  };

  getProposals(totalProposals) {

    const i_proposal = totalProposals - 1 - ((this.state.page-1)*6);
    const last_i = i_proposal - 6;
    console.log(`First i proposal ${i_proposal} & Last i proposal ${last_i} with totalProposals ${totalProposals} - page ${this.state.page} `) 
    var proposals = []
    
    for(var i=i_proposal; (i >= 0 && i >= last_i) ; i--){
      proposals.push(
        {"index_proposal": i,
         "title":`Titulo proposal ${i}`, 
         "description":"Lorem ipsum dolor sit amet consectetur adipiscing elit quis, condimentum odio class etiam justo euismod orci, lobortis cras aptent mauris nullam semper senectus. Etiam ligula malesuada sapien magna tincidunt scelerisque ridiculus vel, aenean aliquam arcu eget facilisis placerat cubilia nibh purus, eleifend mi sociis ad vitae nam tempor. Imperdiet arcu parturient libero suscipit accumsan erat convallis velit metus bibendum taciti, auctor neque felis per augue in maecenas vulputate enim. Montes senectus urna eros accumsan lobortis cras ante convallis lacus, volutpat ullamcorper platea fermentum morbi class hac laoreet pretium sagittis, luctus cursus pellentesque interdum sed nullam porta est. Morbi mattis tincidunt ligula ad blandit per varius vulputate lobortis, nam curae urna netus bibendum a non aenean, consequat ut nascetur mi viverra lectus ultrices dis. A magnis molestie ultrices suscipit euismod litora fames volutpat erat vehicula venenatis mattis neque nam interdum, tincidunt orci condimentum augue natoque magna libero arcu dui taciti mus sed hendrerit class.",
         "proposal_date": `05/03/0${i+1}`});
      }

    return proposals;
  }

  showProposal(index) {

    this.setState({ proposal_data : this.state.proposals[index]});
    this.setState({ active: "proposals_detail"});
  }

  componentDidMount = async() => {
    try {

      const totalProposals = 5; await this.props.instance.methods.getProposalsCount().call();
      const proposals = this.getProposals(totalProposals);

      console.log(proposals);
 
      this.setState({
          loaded: true,
          proposals: proposals
      });

    } catch (error) {
        alert(
            `Failed to load web3, accounts, or data contract. Check console for details.`,
        );
        console.error(error);
    }
};

  render() {

    var proposal_nodes = []
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
                <Row  id="proposals_list">
                {proposal_nodes}                
                </Row> }

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