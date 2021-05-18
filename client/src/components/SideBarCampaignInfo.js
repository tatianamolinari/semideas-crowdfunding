import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import { Button } from "semantic-ui-react";


class SideBarCampaignInfo extends Component {
  state = {
    active: this.props.active
  };

  componentDidMount() {
    //this.change_active(this.props.active);
  }

  change_active(new_active) {
    this.state.active = new_active;
  }


  render() {
    const isLoggedIn = false;
    return (
      <Col lg={3} className="user_side_menu">
         
        <ul>
          <Button className="invisible_button">
            <li id="general_data" className="menu_user_li">
              <a href="#"> Datos Generales </a>
            </li>
          </Button>
          <Button className="invisible_button">
            <li id="requests" className="menu_user_li">
              <a href="#"> Pedidos de presupuesto </a>
            </li>
          </Button>
          <Button className="invisible_button">
            <li id="progress" className="menu_user_li">
              <a href="#"> Avances </a>
            </li>
          </Button>
          <Button className="invisible_button">
            <li id="progress" className="menu_user_li">
              <a href="#"> Pedidos de baja </a>
            </li>
          </Button>
        </ul>
      </Col>
    );
  }
}

export default SideBarCampaignInfo;
