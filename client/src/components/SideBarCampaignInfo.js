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

  change_active(new_active) {
    var old_active = this.state.active;

    const active_element = document.getElementById(old_active); //this.refs[old_active]
    const active_container = document.getElementById(
      old_active.concat("_container")
    );
    active_element.className = "menu_user_li";
    active_container.style = "display: none;";
    this.state.active = new_active;
    const new_active_element = document.getElementById(this.state.active);
    const new_active_container = document.getElementById(
      this.state.active.concat("_container")
    );

    new_active_element.className = "menu_user_li_active";
    new_active_container.style = "";
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
            <li id="progress" className="menu_user_li">
              <a href="#"> Avances </a>
            </li>
          </Button>
          <Button className="invisible_button">
            <li id="proposal" className="menu_user_li">
              <a href="#"> Pedidos de presupuesto </a>
            </li>
          </Button>
          <Button className="invisible_button">
            <li id="destrcut" className="menu_user_li">
              <a href="#"> Pedidos de baja </a>
            </li>
          </Button>
        </ul>
      </Col>
    );
  }
}

export default SideBarCampaignInfo;
