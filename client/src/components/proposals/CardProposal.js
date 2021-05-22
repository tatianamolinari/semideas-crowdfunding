
import React from "react";
import { Card, Icon } from 'semantic-ui-react'
//import { fromStatusToBadgeClass } from "../utils/utils.js"


class CardProposal extends React.Component {

    render() {
  
      //const badge_status = fromStatusToBadgeClass(this.props.status);
  
      return (  <div className="proposal-item-list">
                    <Card>
                        <Card.Content header={this.props.title} />
                        <Card.Content description={this.props.description.substring(0,250)+"..."} />
                        <Card.Content extra>
                        <Icon name='calendar alternate outline' />{this.props.proposal_date}
                        </Card.Content>
                    </Card>
                </div>);
    }
  }
  
  export default CardProposal;

