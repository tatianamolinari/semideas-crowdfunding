
import React from "react";
import { Item, Icon } from 'semantic-ui-react'


class ItemProgressUpdates extends React.Component {

    render() {
    
      return ( 
       
                <Item>
                  <Item.Image size='small' src={this.props.image} />
                  <Item.Content onClick={this.props.onClick} className="div-clickleable">
                    <Item.Header data-testid="title">{this.props.title}</Item.Header>
                    <Item.Meta>Description</Item.Meta>
                    <Item.Description data-testid="description">
                      {this.props.description.substring(0,200)+"..."}
                    </Item.Description>
                    <Item.Extra>
                      <div className="aling-right">
                        <Icon name='calendar alternate outline' />
                          <span data-testid="progress_date">{this.props.progress_update_date}</span>
                      </div>
                    </Item.Extra>
                    <hr/>
                  </Item.Content>
                  
                </Item>);
    }
  }
  
  export default ItemProgressUpdates;

