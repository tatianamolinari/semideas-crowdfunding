import React from "react";
import { Badge } from "react-bootstrap";
import { fromStatusToBadgeClass, fromIntToStatus } from "../../helpers/utils.js"

class ProposalDetail extends React.Component {

  state = {
    proposal_data: {},
    loaded: false,
  };

  getProposalData(index) {

    const recipient = "0xDF0fd73D8e1539290a73073d466c3a933Ca895D5" ;
    const value = 5;
    const approvalsCount = 0 ;
    const status = "3" ;

    const proposal_data = {
      recipient: recipient,
      value: value,
      approvalsCount: approvalsCount,
      status: fromIntToStatus(status)
    }

    this.setState({
      proposal_data: proposal_data  });

  }

  componentDidMount = async() => {
    try {

      this.getProposalData(this.props.index_proposal);

      this.setState({
          loaded: true,
      });

    } catch (error) {
        alert(
            `Failed to load web3, accounts, or data contract. Check console for details.`,
        );
        console.error(error);
    }
};

  render() {

    const badge_status = fromStatusToBadgeClass(this.state.proposal_data.status);

    return (  <div className="proposal-detail">            
                <h3 className="title" data-testid="titulo"> {this.props.title} </h3>
                <p className="aling-right"> Fecha de creación <span data-testid="fecha_creacion">{this.props.proposal_date}</span></p>
                <h5 data-testid="estado"> Estado: <Badge variant={badge_status}> { this.state.proposal_data.status } </Badge> </h5>
                <p className="description" data-testid="descripcion"> {this.props.description} </p>
                <hr/>
                <div> Fondos a retirar: <span data-testid="valor">{ this.state.proposal_data.value }</span> wei. </div>
                <div> Destinatario: <span data-testid="destinatario">{ this.state.proposal_data.recipient }</span>. </div> 
              </div>);
  }
}

export default ProposalDetail;