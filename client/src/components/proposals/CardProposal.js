
import React from "react";
import { Card, Icon } from 'semantic-ui-react'

class CardProposal extends React.Component {

  render() {
      return (  <div className="proposal-item-list">
                    <Card>
                        <Card.Content header={this.props.title} data-testid="title"/>
                        <Card.Content description={this.props.description.substring(0,250)+"..."} data-testid="description"/>
                        <Card.Content extra>
                          <Icon name='calendar alternate outline' />
                          <span data-testid="proposal_date">{this.props.proposal_date}></span>
                        </Card.Content>
                    </Card>
                </div>);
    }
  }
  
  export default CardProposal;

