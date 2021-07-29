import React from "react";
import { Badge } from "react-bootstrap";
import { Label }  from 'semantic-ui-react';
import { fromStatusToBadgeClass, fromIntToStatusProposal } from "../../helpers/utils.js";

class CloseProposalDetail extends React.Component {

  state = {
    dproposal_data: {},
    loaded: false,
  };

  setDProposalData() {

    const dproposal_data = {
      approvalsCount: this.props.approvalsCount,
      disapprovalsCount: this.props.disapprovalsCount,
      status: fromIntToStatusProposal(this.props.status),
      limitTime: new Date(this.props.limitTime * 1000).toLocaleDateString('en-GB'),
      badge_status: fromStatusToBadgeClass(fromIntToStatusProposal(this.props.status))
    }

    this.setState({
      dproposal_data: dproposal_data  });

  }

  componentDidUpdate(prevProps) {
    if((this.props.status !== prevProps.status) || (this.props.hasVoted !== prevProps.hasVoted ))
    {
      this.setState({ loaded: false });
      this.setDProposalData();
    }
  }

  componentDidMount = async() => {
    try {

      this.setDProposalData();

      this.setState({
          loaded: true,
      });

    } catch (error) {
        //alert(`Failed to load web3, accounts, or data contract. Check console for details.`,);
        console.error(error);
    }
  }

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
                <p className="aling-right"> Fecha de creación <span data-testid="fecha_creacion">{this.props.dproposal_date}</span></p>
                <h5 data-testid="estado"> Estado: <Badge variant={this.state.dproposal_data.badge_status}> { this.state.dproposal_data.status } </Badge> </h5>
                <h5> Fecha de cierre de votación:  <span data-testid="limite">{ this.state.dproposal_data.limitTime }</span></h5>
                <h5> 
                    Autor:&nbsp; 
                    <a href={`https://etherscan.io/address/${this.props.author}`}
                       target="_blank"
                       rel="noopener noreferrer" 
                       data-testid="destinatario">
                        { this.props.author }
                    </a>&nbsp;
                    { (this.props.authorOwner) ? 
                    <Label color="green">
                      <span data-testid="voted">
                        Owner
                      </span>
                    </Label>:
                     <Label color="red">
                     <span data-testid="voted">
                       Miembro
                     </span>
                   </Label>
                  }
                </h5> 
                <p className="description" data-testid="descripcion"> {this.props.description} </p>
                <hr style={{marginLeft: "6em", marginRight: "6em",  marginTop: "1.5em",  marginBottom: "1.5em"}}/>
              </div>);
  }
}

export default CloseProposalDetail;