
import React from "react";
import { Item, Icon, Image } from 'semantic-ui-react'


class ItemProgressUpdates extends React.Component {

    render() {
    
      return ( 
       
                <Item>
                  <Item.Image size='small' src='/images/prueba/prueba1.jpg' />
                  <Item.Content onClick={this.props.onClick} className="div-clickleable">
                    <Item.Header>{this.props.title}</Item.Header>
                    <Item.Meta>Description</Item.Meta>
                    <Item.Description>
                      {this.props.description.substring(0,200)+"..."}
                    </Item.Description>
                    <Item.Extra>
                      <div className="aling-right">
                        <Icon name='calendar alternate outline' />{this.props.progress_update_date}
                      </div>
                    </Item.Extra>
                    <hr/>
                  </Item.Content>
                  
                </Item>);
    }
  }
  
  export default ItemProgressUpdates;

