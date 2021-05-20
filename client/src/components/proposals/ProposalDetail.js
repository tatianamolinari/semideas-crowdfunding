import React from "react";
import { Badge } from "react-bootstrap";
import { fromStatusToBadgeClass } from "../../utils/utils.js"

class ProposalDetail extends React.Component {

  render() {

    const badge_status = fromStatusToBadgeClass(this.props.status);

    return (  <div className="proposal-detail" id="proposals_detail_container">            
                <h3 className="title"> {this.props.title} </h3>
                <h5> Estado: <Badge variant={badge_status}> { this.props.status } </Badge> </h5>
                <p className="description"> {this.props.description} </p>
                <hr/>
                <div> Fondos a retirar: { this.props.value } wei. </div>
                <div> Destinatario: { this.props.recipient }. </div>   

              </div>);
  }
}

export default ProposalDetail;