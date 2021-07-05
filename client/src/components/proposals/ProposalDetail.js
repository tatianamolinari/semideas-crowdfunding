import React from "react";
import { Badge } from "react-bootstrap";
import { Label }  from 'semantic-ui-react';
import { fromStatusToBadgeClass, fromIntToStatus } from "../../helpers/utils.js";

class ProposalDetail extends React.Component {

  state = {
    proposal_data: {},
    loaded: false,
  };

  setProposalData() {


    const proposal_data = {
      recipient: this.props.recipient,
      value: this.props.value,
      approvalsCount: this.props.approvalsCount,
      disapprovalsCount: this.props.disapprovalsCount,
      status: fromIntToStatus(this.props.status),
      limitTime: new Date(this.props.limitTime * 1000).toLocaleDateString('en-GB'),
      badge_status: fromStatusToBadgeClass(fromIntToStatus(this.props.status))
    }

    this.setState({
      proposal_data: proposal_data  });

  }

  componentDidUpdate(prevProps) {
    if((this.props.status !== prevProps.status) || (this.props.hasVoted !== prevProps.hasVoted ))
    {
      this.setState({ loaded: false });
      this.setProposalData();
    }
  }

  componentDidMount = async() => {
    try {

      this.setProposalData();

      this.setState({
          loaded: true,
      });

    } catch (error) {
        alert(
            `Failed to load web3, accounts, or data contract. Check console for details.`,
        );
        console.error(error);
    }
  }

  setProposalData

  render() {

    
    return (  <div className="proposal-detail">            
                <h3 className="title" data-testid="titulo"> {this.props.title} 
                  { (this.props.hasVoted) && 
                    <Label color="teal">
                      <span data-testid="voted">
                        Votaste este pedido
                      </span>
                    </Label>
                  }
                </h3>
                <p className="aling-right"> Fecha de creación <span data-testid="fecha_creacion">{this.props.proposal_date}</span></p>
                <h5 data-testid="estado"> Estado: <Badge variant={this.state.proposal_data.badge_status}> { this.state.proposal_data.status } </Badge> </h5>
                <h5> Fecha de cierre de votación:  <span data-testid="limite">{ this.state.proposal_data.limitTime }</span></h5>
                <p className="description" data-testid="descripcion"> {this.props.description} </p>
                <hr style={{marginLeft: "6em", marginRight: "6em",  marginTop: "1.5em",  marginBottom: "1.5em"}}/>
              
                <h5> Datos de transferencia:</h5>
                <div> Los fondos a retirar para de este pedido son <Label color="green"> <span data-testid="valor">{ this.state.proposal_data.value }</span></Label> wei. </div>
                <div> 
                    Destinatario:&nbsp; 
                    <a href={`https://etherscan.io/address/${this.state.proposal_data.recipient}`}
                       target="_blank"
                       rel="noopener noreferrer" 
                       data-testid="destinatario">
                        { this.state.proposal_data.recipient }
                    </a>
                </div> 
              </div>);
  }
}

export default ProposalDetail;